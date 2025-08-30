import axios from 'axios';
import { MessageBox, Message } from 'element-ui';
import store from '@/store';
import router from '@/router';
import { getToken } from '@/utils/auth';

// 防重复错误消息机制
const errorMessageCache = new Set();
const ERROR_MESSAGE_DURATION = 3000; // 3秒内相同错误消息不重复显示

/**
 * 显示错误消息（防重复）
 * @param {string} message - 错误消息
 * @param {string} type - 消息类型
 * @param {number} duration - 显示时长
 */
function showErrorMessage(message, type = 'error', duration = 5000) {
  // 检查是否已经显示过相同的错误消息
  if (errorMessageCache.has(message)) {
    return;
  }

  errorMessageCache.add(message);
  Message({
    message,
    type,
    duration,
  });

  // 清除缓存
  setTimeout(() => {
    errorMessageCache.delete(message);
  }, ERROR_MESSAGE_DURATION);
}

/**
 * 🚀 现代化API错误类
 * 提供标准化的错误对象，支持错误码、状态码和详细信息
 */
export class ApiError extends Error {
  constructor(code, message, status = 500, details = null) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }
}
/**
 * 🔧 创建axios实例
 * 配置基础URL、超时时间等全局设置
 */
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000, // request timeout
});

/**
 * 📤 请求拦截器 - 增强版
 * 功能：添加认证token、安全头、请求日志等
 */
service.interceptors.request.use(
  (config) => {
    // 🔐 添加认证token
    if (store.getters.token) {
      // 使用标准Authorization头（真实后端API）
      config.headers.Authorization = `Bearer ${getToken()}`;

      // 保持向后兼容：继续使用X-Token头（用于可能的mock接口）
      config.headers['X-Token'] = getToken();
    }

    // 🛡️ 添加现代安全头
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';

    // 🐛 开发环境调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.log('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * 📥 响应拦截器 - 现代化版本
 * 功能：统一错误处理，支持现代API响应格式
 */
service.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    const res = response.data;
    return handleModernFormat(res, response.status);
  },
  (error) => {
    console.error('❌ Response Interceptor Error:', error.response || error);

    if (error.response && error.response.data) {
      const res = error.response.data;
      if (res.success !== undefined && !res.success) {
        return handleModernFormat(res, error.response.status);
      }
    }

    // 🌐 网络错误统一包装为ApiError实例
    let errorCode = 'NETWORK_ERROR';
    let errorMessage = '网络请求失败，请稍后重试';
    let errorDetails = {
      originalError: error.code,
      url: error.config?.url,
      method: error.config?.method,
    };

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorCode = 'NETWORK_TIMEOUT';
      errorMessage = '请求超时，请检查网络连接';
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      errorCode = 'NETWORK_CONNECTION_FAILED';
      errorMessage = '网络连接失败，请检查网络设置';
    } else if (error.message.includes('ERR_INTERNET_DISCONNECTED')) {
      errorCode = 'NETWORK_DISCONNECTED';
      errorMessage = '网络连接已断开，请检查网络连接';
    }

    // 显示用户友好的错误消息
    showErrorMessage(errorMessage);

    // 统一返回 ApiError 实例
    return Promise.reject(new ApiError(
      errorCode,
      errorMessage,
      error.response?.status || 0,
      errorDetails
    ));
  }
);

/**
 * 🚀 现代格式响应处理函数
 * 提供现代化的错误处理和标准化的错误对象
 *
 * @param {Object} res - 现代格式响应数据
 * @param {number} status - HTTP状态码
 * @returns {Object|Promise.reject} 处理结果
 */
function handleModernFormat(res, status) {
  if (!res.success) {
    // 🔐 统一处理所有认证错误
    if (isAuthError(res.error?.code)) {
      handleAuthError(res.error?.message || 'Authentication Error');
    }

    // 📋 转换为标准ApiError对象，提供丰富的错误信息
    return Promise.reject(
      new ApiError(res.error?.code || 'UNKNOWN_ERROR', res.error?.message || '未知错误', status, res.error?.details)
    );
  }

  // ✅ 成功响应，返回新格式数据
  return res;
}

/**
 * 🔐 认证失效检测函数 - 精确匹配策略
 * 只有真正的认证失效（需要重新登录）才返回true
 * 登录验证失败（密码错误等）不会触发重新登录弹窗
 *
 * @param {string} errorCode - 错误码
 * @returns {boolean} 是否为认证失效错误
 */
function isAuthError(errorCode) {
  if (!errorCode) return false;

  // 1. 明确的认证失效错误码（需要重新登录）
  const authFailureCodes = [
    'AUTH_001', // TOKEN_EXPIRED - 令牌过期
    'AUTH_002', // TOKEN_INVALID - 令牌无效
    'AUTH_003', // TOKEN_MISSING - 缺少令牌
    'AUTH_004', // TOKEN_BLACKLISTED - 令牌被加入黑名单
    'AUTH_005', // TOKEN_MALFORMED - 令牌格式错误
    'AUTH_006', // INSUFFICIENT_PERMISSIONS - 权限不足
    'AUTH_012', // REFRESH_TOKEN_NOT_FOUND - 刷新令牌不存在
    'AUTH_013', // REFRESH_TOKEN_INVALID - 刷新令牌无效
    'AUTH_015', // RESET_PASSWORD_TOKEN_INVALID - 重置密码令牌无效
    'AUTH_017', // VERIFY_EMAIL_TOKEN_INVALID - 邮箱验证令牌无效
  ];

  // 2. 处理通用认证失效错误码
  const commonAuthFailureCodes = ['UNAUTHORIZED', 'TOKEN_EXPIRED', 'INVALID_TOKEN', 'FORBIDDEN'];

  return authFailureCodes.includes(errorCode) || commonAuthFailureCodes.includes(errorCode);
}

/**
 * 🔐 统一认证错误处理函数
 * 处理登录过期、token无效等认证问题
 *
 * @param {string} message - 错误消息
 */
function handleAuthError(message) {
  // 显示错误消息
  Message({
    message,
    type: 'error',
    duration: 5 * 1000,
  });

  // 弹出确认对话框，询问是否重新登录
  MessageBox.confirm('您的登录已过期，请重新登录以继续使用', '登录过期提示', {
    confirmButtonText: '立即登录',
    cancelButtonText: '稍后再说',
    type: 'warning',
  })
    .then(() => {
      // 用户确认重新登录 - 使用路由跳转而非页面刷新
      store.dispatch('user/resetToken').then(() => {
        // 记住当前页面，登录成功后可以跳转回来
        const currentPath = router.currentRoute.fullPath;
        router.push({
          path: '/login',
          query: currentPath !== '/login' ? { redirect: currentPath } : {}
        });
      });
    })
    .catch(() => {
      // 用户取消，继续停留在当前页面
      console.log('用户取消重新登录');
    });
}

/**
 * 📊 导出axios实例和工具类
 */
export default service;

/**
 * 📖 使用说明和最佳实践
 *
 * 🚀 现代化使用方式（统一错误处理）：
 * ```javascript
 * async getData() {
 *   try {
 *     const res = await api.getData()
 *     this.data = res.data
 *     if (res.message) {
 *       this.$message.success(res.message)
 *     }
 *   } catch (error) {
 *     // 所有错误都是 ApiError 实例，统一处理
 *     this.handleApiError(error)
 *   }
 * }
 *
 * handleApiError(error) {
 *   switch(error.code) {
 *     // 登录验证失败错误（不会触发重新登录弹窗）
 *     case 'AUTH_007': // 账户状态异常
 *       this.$message.warning('账户已被停用')
 *       break
 *     case 'AUTH_008': // 账户被锁定
 *       this.$message.error('账户已被锁定')
 *       break
 *     case 'AUTH_009': // 登录限制
 *       this.$message.warning('登录尝试过于频繁')
 *       break
 *     case 'AUTH_010': // 用户不存在
 *       this.$message.error('用户不存在')
 *       break
 *     case 'AUTH_011': // 密码错误
 *       this.$message.error('密码不正确')
 *       break
 *     
 *     // 认证失效错误（会自动弹出重新登录弹窗，通常无需额外处理）
 *     case 'AUTH_001': // 令牌过期
 *     case 'AUTH_002': // 令牌无效
 *     case 'AUTH_003': // 缺少令牌
 *       // 这些错误会自动触发重新登录弹窗，组件中通常不需要特殊处理
 *       break
 *     
 *     // 网络错误码（已自动显示消息）
 *     case 'NETWORK_TIMEOUT':
 *       // 可以做额外处理，如重试逻辑
 *       this.enableRetryButton()
 *       break
 *     case 'NETWORK_CONNECTION_FAILED':
 *       // 可以引导用户检查网络
 *       this.showNetworkTroubleshooting()
 *       break
 *     
 *     default:
 *       // 网络错误已显示消息，业务错误显示通用消息
 *       if (!error.code.startsWith('NETWORK_')) {
 *         this.$message.error(error.message)
 *       }
 *   }
 * }
 * ```
 *
 * 🔧 环境配置：
 * - VUE_APP_BASE_API: API基础路径
 * - NODE_ENV=development: 开启调试日志
 *
 * 🛡️ 安全特性：
 * - 自动添加X-Requested-With头
 * - 支持认证token自动附加
 * - 统一认证错误处理，支持路由跳转
 * - 基于错误码前缀的智能错误识别
 *
 * 📈 优化特性：
 * - 统一的错误对象格式（所有错误都是ApiError实例）
 * - SPA友好的认证错误处理（路由跳转而非页面刷新）
 * - 自适应后端新增错误码
 * - 网络错误自动重分类和用户友好提示
 * - 支持请求/响应中间件扩展
 */
