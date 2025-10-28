/**
 * 文件名称：errorHandler.js
 * 文件描述：错误处理核心逻辑（极简版）
 * 创建日期：2025-10-27
 *
 * 设计原则：拦截器只处理必须处理的错误，其他交给业务层
 */

import { Message } from 'element-ui';
import { isSystemError } from './errorTypes';

/**
 * 标准化API错误类
 */
export class ApiError extends Error {
  constructor(code, message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.message = message;
    this.status = status;
    this.details = details || {};
    this.handledByInterceptor = false; // 标记是否已被拦截器处理
  }
}

/**
 * 防重复消息缓存
 */
const messageCache = new Set();

/**
 * 显示错误消息（防重复）
 */
export function showMessage(message, type = 'error', duration = 5000) {
  if (messageCache.has(message)) return;

  messageCache.add(message);
  Message({ message, type, duration, showClose: true });

  setTimeout(() => messageCache.delete(message), 3000);
}

/**
 * 处理网络错误
 */
export function handleNetworkError(error) {
  let errorMessage = '网络请求失败，请稍后重试';

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    errorMessage = '请求超时，请检查网络连接';
  } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    errorMessage = '网络连接失败，请检查网络设置';
  }

  const apiError = new ApiError('NETWORK_ERROR', errorMessage, 0, {
    originalError: error.code,
    url: error.config?.url,
  });
  apiError.handledByInterceptor = true;

  return apiError;
}

/**
 * 从后端响应创建ApiError
 */
export function createApiError(responseData, status) {
  const { error, meta } = responseData;

  return new ApiError(error?.code || `HTTP_${status}`, error?.message || '未知错误', status, {
    ...error?.details,
    requestId: meta?.requestId,
    traceId: meta?.requestId,
  });
}

/**
 * 判断错误是否应该在拦截器处理
 * 只有这3类错误在拦截器处理：
 * 1. 系统错误 (SYS_*)
 * 2. 服务器异常 (5xx)
 */
export function shouldHandleInInterceptor(errorCode, status) {
  // 系统错误
  if (isSystemError(errorCode)) return true;

  // 服务器异常
  if (status >= 500) return true;

  // 其他都不处理，交给业务层
  return false;
}

/**
 * 在拦截器中处理错误（显示通用提示）
 */
export function handleInInterceptor(apiError) {
  const { message, status } = apiError;

  let displayMessage = message;

  // 服务器异常
  if (status >= 500) {
    displayMessage = message || '服务器异常，请稍后重试';
  }
  // 系统错误
  else {
    displayMessage = message || '系统异常，请稍后重试';
  }

  showMessage(displayMessage, 'error');
  apiError.handledByInterceptor = true;
}

/**
 * 跳转到登录页
 */
export function redirectToLogin(router, currentPath) {
  if (currentPath === '/login') return;

  router
    .replace({
      path: '/login',
      query: { redirect: currentPath },
    })
    .catch((err) => {
      console.warn('路由跳转警告:', err.message);
    });
}

/**
 * 错误统计（简化版）
 */
const errorStats = {
  total: 0,
};

export function getErrorStats() {
  return { ...errorStats };
}

export function clearErrorStats() {
  errorStats.total = 0;
}

export default {
  ApiError,
  showMessage,
  handleNetworkError,
  createApiError,
  shouldHandleInInterceptor,
  handleInInterceptor,
  redirectToLogin,
  getErrorStats,
  clearErrorStats,
};
