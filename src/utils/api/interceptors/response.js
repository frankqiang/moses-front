/**
 * 文件名称：response.js
 * 文件描述：响应拦截器（最小化职责版本）
 * 创建日期：2025-10-27
 *
 * 设计原则：
 * 1. 只处理通用错误（网络、认证、服务器异常）
 * 2. 业务错误完全交给业务层处理
 * 3. 避免重复错误提示
 */

import {
  handleNetworkError,
  createApiError,
  shouldHandleInInterceptor,
  handleInInterceptor,
  showMessage,
} from '../errorHandler';
import { handleAuthError } from './auth';
import { isAuthFailure } from '../errorTypes';
import { clearPendingRequest } from './request';

/**
 * 性能监控
 * @param {Object} config - 请求配置
 * @param {Object} response - 响应对象
 */
function trackPerformance(config, response) {
  if (!config._startTime) return;

  const duration = Date.now() - config._startTime;
  const requestId = response?.data?.meta?.requestId;

  if (process.env.NODE_ENV === 'development') {
    console.log('📈 性能监控:', {
      url: config.url,
      method: config.method,
      duration: `${duration}ms`,
      requestId,
      status: response.status,
    });
  }

  // 慢请求警告
  if (duration > 3000) {
    console.warn('⚠️ 慢请求警告:', {
      url: config.url,
      duration: `${duration}ms`,
      requestId,
    });
  }
}

/**
 * 配置响应拦截器
 * @param {Object} axiosInstance - axios实例
 */
export function setupResponseInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    // ==================== 成功响应处理 ====================
    (response) => {
      // 清理请求去重缓存
      clearPendingRequest(response.config);

      // 性能监控
      if (response.config._startTime) {
        trackPerformance(response.config, response);
      }

      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 API Response:', {
          url: response.config.url,
          status: response.status,
          success: response.data?.success,
          errorCode: response.data?.error?.code,
          data: response.data,
          requestId: response.data?.meta?.requestId,
        });
      }

      // 返回数据（保持后端格式）
      return response.data;
    },

    // ==================== 错误响应处理 ====================
    async (error) => {
      const { config, response } = error;

      // 清理请求去重缓存
      if (config) {
        clearPendingRequest(config);
      }

      // 1. 网络错误处理
      if (!response) {
        const networkError = handleNetworkError(error);

        // 显示网络错误提示
        showMessage(networkError.message, 'error');

        return Promise.reject(networkError);
      }

      // 2. 处理后端返回的业务错误
      const { data, status } = response;

      // 后端返回了标准错误格式
      if (data && data.success === false) {
        const apiError = createApiError(data, status);

        // 开发环境日志
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ API Error:', {
            url: config?.url,
            status,
            errorCode: apiError.code,
            errorMessage: apiError.message,
            details: apiError.details,
          });
        }

        // 2.1 认证错误处理（自动刷新Token或跳转登录）
        if (isAuthFailure(apiError.code)) {
          return handleAuthError(data.error, config, axiosInstance.request.bind(axiosInstance));
        }

        // 2.2 系统错误和服务器异常（拦截器处理）
        if (shouldHandleInInterceptor(apiError.code, status)) {
          handleInInterceptor(apiError);
          return Promise.reject(apiError);
        }

        // 2.3 业务错误（交给业务层处理，不显示提示）
        return Promise.reject(apiError);
      }

      // 3. 非标准格式的错误响应
      const genericError = createApiError(
        {
          error: {
            code: `HTTP_${status}`,
            message: data?.message || '请求失败',
          },
          meta: {},
        },
        status
      );

      // 服务器异常统一处理
      if (status >= 500) {
        handleInInterceptor(genericError);
      }

      return Promise.reject(genericError);
    }
  );
}

export default {
  setupResponseInterceptor,
};
