import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
import { getToken } from '@/utils/auth'

// 防重复错误消息机制
const errorMessageCache = new Set()
const ERROR_MESSAGE_DURATION = 3000 // 3秒内相同错误消息不重复显示

// 请求去重机制
const pendingRequests = new Map()
const REQUEST_DEDUP_KEY_PREFIX = 'req_'

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableErrors: ['NETWORK_TIMEOUT', 'NETWORK_CONNECTION_FAILED', 'NETWORK_DISCONNECTED'],
  exponentialBackoff: true
}

// 认证失效时的请求队列
const authFailureRequestQueue = []
let isHandlingAuthFailure = false

/**
 * 显示错误消息（防重复）
 * @param {string} message - 错误消息
 * @param {string} type - 消息类型
 * @param {number} duration - 显示时长
 */
function showErrorMessage(message, type = 'error', duration = 5000) {
  // 检查是否已经显示过相同的错误消息
  if (errorMessageCache.has(message)) {
    return
  }

  errorMessageCache.add(message)
  Message({
    message,
    type,
    duration
  })

  // 清除缓存
  setTimeout(() => {
    errorMessageCache.delete(message)
  }, ERROR_MESSAGE_DURATION)
}

/**
 * 🚀 现代化API错误类
 * 提供标准化的错误对象，支持错误码、状态码和详细信息
 */
export class ApiError extends Error {
  constructor(code, message, status = 500, details = null) {
    super(message)
    this.code = code
    this.status = status
    this.details = details
    this.name = 'ApiError'
  }
}
/**
 * 🔧 创建axios实例
 * 配置基础URL、超时时间等全局设置
 */
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

/**
 * 📤 请求拦截器 - 增强版
 * 功能：添加认证token、安全头、请求日志等
 */
service.interceptors.request.use(
  (config) => {
    // 📋 请求去重检查
    const requestKey = generateRequestKey(config)
    if (pendingRequests.has(requestKey)) {
      // 返回已存在的请求Promise
      return pendingRequests.get(requestKey)
    }

    // 记录请求开始时间用于性能监控
    config._startTime = Date.now()

    // 🔐 添加认证token（移除冗余的X-Token）
    if (store.getters.token) {
      config.headers.Authorization = `Bearer ${getToken()}`
    }

    // 🛡️ 添加现代安全头
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'

    // 🐛 开发环境调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data
      })
    }

    return config
  },
  (error) => {
    console.log('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 📥 响应拦截器 - 现代化版本
 * 功能：统一错误处理，支持现代API响应格式、重试机制、认证队列等
 */
const responseInterceptor = service.interceptors.response.use(
  (response) => {
    // 📋 清理请求去重缓存
    const requestKey = generateRequestKey(response.config)
    pendingRequests.delete(requestKey)

    // 📈 性能监控
    if (response.config._startTime) {
      trackPerformance(response.config, response.config._startTime, response)
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
        requestId: response.data?.meta?.requestId
      })
    }

    const res = response.data
    return handleModernFormat(res, response.status, response)
  },
  async(error) => {
    const { config } = error

    // 📋 清理请求去重缓存
    if (config) {
      const requestKey = generateRequestKey(config)
      pendingRequests.delete(requestKey)
    }

    console.error('❌ Response Interceptor Error:', error.response || error)

    // 处理后端返回的业务错误
    if (error.response && error.response.data) {
      const res = error.response.data
      if (res.success !== undefined && !res.success) {
        return handleModernFormat(res, error.response.status, error.response)
      }
    }

    // 🔄 重试机制 - 对网络错误进行重试
    if (config && !config._isRetry) {
      try {
        return await retryWithBackoff(service, config)
      } catch (retryError) {
        // 重试失败，继续原有错误处理逻辑
        error = retryError
      }
    }

    // 🌐 网络错误统一包装为ApiError实例
    let errorCode = 'NETWORK_ERROR'
    let errorMessage = '网络请求失败，请稍后重试'
    const errorDetails = {
      originalError: error.code,
      url: error.config?.url,
      method: error.config?.method,
      timestamp: new Date().toISOString()
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorCode = 'NETWORK_TIMEOUT'
      errorMessage = '请求超时，请检查网络连接'
    } else if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      errorCode = 'NETWORK_CONNECTION_FAILED'
      errorMessage = '网络连接失败，请检查网络设置'
    } else if (error.message.includes('ERR_INTERNET_DISCONNECTED')) {
      errorCode = 'NETWORK_DISCONNECTED'
      errorMessage = '网络连接已断开，请检查网络连接'
    }

    // 显示用户友好的错误消息
    showErrorMessage(errorMessage)

    // 统一返回 ApiError 实例
    return Promise.reject(new ApiError(errorCode, errorMessage, error.response?.status || 0, errorDetails))
  }
)

/**
 * 🚀 现代格式响应处理函数
 * 提供现代化的错误处理和标准化的错误对象，充分利用后端meta信息
 *
 * @param {Object} res - 现代格式响应数据
 * @param {number} status - HTTP状态码
 * @param {Object} response - 完整的响应对象
 * @returns {Object|Promise.reject} 处理结果
 */
function handleModernFormat(res, status, response = null) {
  if (!res.success) {
    // 🔐 认证错误处理（支持请求队列）
    if (isAuthError(res.error?.code)) {
      // 如果已经在处理认证失效，将请求加入队列
      if (isHandlingAuthFailure && response?.config) {
        return new Promise((resolve, reject) => {
          addToAuthFailureQueue(resolve, reject, response.config)
        })
      }

      handleAuthError(res.error?.message || 'Authentication Error')
    }

    // 📋 统一处理常见错误
    const isHandled = handleCommonErrors(res.error, status, response)

    // 📋 转换为标准ApiError对象，提供丰富的错误信息
    const errorDetails = {
      ...res.error?.details,
      // 充分利用后端返回的meta信息
      requestId: res.meta?.requestId,
      timestamp: res.meta?.timestamp,
      version: res.meta?.version,
      // 添加错误追踪信息
      traceId: res.meta?.requestId,
      url: response?.config?.url,
      method: response?.config?.method,
      // 标记是否已在request层处理
      handledByRequestLayer: isHandled
    }

    return Promise.reject(
      new ApiError(res.error?.code || 'UNKNOWN_ERROR', res.error?.message || '未知错误', status, errorDetails)
    )
  }

  // ✅ 成功响应，返回新格式数据（包含meta信息）
  return res
}

/**
 * 🔐 认证失效检测函数 - 精确匹配策略（与后端同步）
 * 只有真正的认证失效（需要重新登录）才返回true
 * 登录验证失败（密码错误等）不会触发重新登录弹窗
 *
 * @param {string} errorCode - 错误码
 * @returns {boolean} 是否为认证失效错误
 */
function isAuthError(errorCode) {
  if (!errorCode) return false

  // 1. 后端认证失效错误码（基于errorCodes.js）
  const authFailureCodes = [
    'AUTH_001', // UNAUTHORIZED - 未授权访问
    'AUTH_002', // TOKEN_EXPIRED - 令牌过期
    'AUTH_003', // INVALID_TOKEN - 令牌无效
    'AUTH_004', // TOKEN_MALFORMED - 令牌格式错误
    'AUTH_005', // TOKEN_BLACKLISTED - 令牌被加入黑名单
    'AUTH_006', // INSUFFICIENT_PERMISSIONS - 权限不足
    'AUTH_030', // SESSION_EXPIRED - 会话过期
    'AUTH_031', // SESSION_INVALID - 会话无效
    'AUTH_032', // REFRESH_TOKEN_EXPIRED - 刷新令牌过期
    'AUTH_033' // REFRESH_TOKEN_INVALID - 刷新令牌无效
  ]

  // 2. 处理通用认证失效错误码（向下兼容）
  const commonAuthFailureCodes = ['UNAUTHORIZED', 'TOKEN_EXPIRED', 'INVALID_TOKEN', 'FORBIDDEN']

  return authFailureCodes.includes(errorCode) || commonAuthFailureCodes.includes(errorCode)
}

/**
 * 🔍 检测验证相关错误
 * @param {string} errorCode - 错误码
 * @returns {boolean} 是否为验证错误
 */
function isValidationError(errorCode) {
  if (!errorCode) return false
  return errorCode.startsWith('VAL_')
}

/**
 * ⚙️ 检测系统相关错误
 * @param {string} errorCode - 错误码
 * @returns {boolean} 是否为系统错误
 */
function isSystemError(errorCode) {
  if (!errorCode) return false
  return errorCode.startsWith('SYS_')
}

/**
 * 🚫 检测速率限制错误
 * @param {string} errorCode - 错误码
 * @param {number} status - HTTP状态码
 * @returns {boolean} 是否为速率限制错误
 */
function isRateLimitError(errorCode, status) {
  return status === 429 || ['AUTH_020', 'AUTH_021', 'AUTH_022'].includes(errorCode)
}

/**
 * 🔒 检测账户锁定错误
 * @param {string} errorCode - 错误码
 * @param {number} status - HTTP状态码
 * @returns {boolean} 是否为账户锁定错误
 */
function isAccountLockedError(errorCode, status) {
  return status === 423 || ['AUTH_014', 'AUTH_015'].includes(errorCode)
}

/**
 * 📋 统一处理常见错误 - 在request层自动处理
 * @param {Object} errorData - 错误数据
 * @param {number} status - HTTP状态码
 * @param {Object} response - 响应对象
 * @returns {boolean} 是否已处理（true表示已处理，false表示需要传递给业务层）
 */
function handleCommonErrors(errorData, status, response) {
  const errorCode = errorData?.code
  const errorMessage = errorData?.message || '未知错误' // 👈 直接使用后端返回的message

  // 1. 验证错误 - 统一显示验证失败消息
  if (isValidationError(errorCode)) {
    showErrorMessage(errorMessage, 'warning', 4000) // 👈 使用后端消息
    return false // 传递给业务层进行具体字段处理
  }

  // 2. 系统错误 - 统一显示系统错误消息
  if (isSystemError(errorCode)) {
    // 对于系统错误，可以选择显示更用户友好的通用消息，或直接使用后端消息
    const userFriendlyMessage = getUserFriendlySystemMessage(errorCode, errorMessage)
    showErrorMessage(userFriendlyMessage, 'error', 5000)
    return true // 已处理，不传递给业务层
  }

  // 3. 速率限制错误 - 统一处理
  if (isRateLimitError(errorCode, status)) {
    const retryAfter = errorData?.details?.retryAfter
    const rateLimitMessage = retryAfter
      ? `${errorMessage}，请在 ${retryAfter} 秒后重试` // 👈 基于后端消息增强
      : errorMessage // 👈 直接使用后端消息

    showErrorMessage(rateLimitMessage, 'warning', 6000)
    return true // 已处理
  }

  // 4. 账户锁定错误 - 统一处理
  if (isAccountLockedError(errorCode, status)) {
    showErrorMessage(errorMessage, 'error', 8000) // 👈 直接使用后端消息
    return true // 已处理
  }

  // 5. HTTP状态码错误 - 统一处理
  if (status >= 500) {
    const serverErrorMessage = errorMessage || '服务器异常，请稍后重试'
    showErrorMessage(serverErrorMessage, 'error', 5000)
    return true // 已处理
  }

  if (status === 502 || status === 503) {
    const serviceErrorMessage = errorMessage || '服务暂时不可用，请稍后重试'
    showErrorMessage(serviceErrorMessage, 'error', 5000)
    return true // 已处理
  }

  return false // 未处理，传递给业务层
}

/**
 * 🎨 获取用户友好的系统错误消息
 * 对于系统错误，可以选择显示更通用的用户友好消息
 * @param {string} errorCode - 错误码
 * @param {string} backendMessage - 后端返回的消息
 * @returns {string} 用户友好的错误消息
 */
function getUserFriendlySystemMessage(errorCode, backendMessage) {
  // 可以根据需要选择使用后端消息或自定义用户友好消息
  const friendlyMessages = {
    SYS_001: '服务器繁忙，请稍后重试',
    SYS_002: '数据处理异常，请稍后重试',
    SYS_003: '外部服务异常，请稍后重试',
    SYS_004: '网络连接异常，请检查网络',
    SYS_005: '服务暂时不可用，请稍后重试',
    SYS_006: '请求处理超时，请稍后重试',
    SYS_007: '系统配置异常，请联系管理员'
  }

  // 优先使用后端消息，如果需要更友好的消息可以使用映射
  return backendMessage || friendlyMessages[errorCode] || '系统异常，请稍后重试'
}

/**
 * 📎 生成请求去重键
 * @param {Object} config - axios配置对象
 * @returns {string} 去重键
 */
function generateRequestKey(config) {
  const { method, url, params, data } = config
  const paramsStr = params ? JSON.stringify(params) : ''
  const dataStr = data ? JSON.stringify(data) : ''
  return `${REQUEST_DEDUP_KEY_PREFIX}${method}_${url}_${paramsStr}_${dataStr}`
}

/**
 * 🔄 指数退避重试函数
 * @param {Function} fn - 要重试的函数
 * @param {Object} config - axios配置
 * @param {number} retryCount - 当前重试次数
 * @returns {Promise} 重试结果
 */
async function retryWithBackoff(fn, config, retryCount = 0) {
  try {
    return await fn(config)
  } catch (error) {
    // 检查是否为可重试错误
    const isRetryableError = RETRY_CONFIG.retryableErrors.some(
      (errType) => error.code?.includes(errType) || error.message?.includes(errType)
    )

    if (!isRetryableError || retryCount >= RETRY_CONFIG.maxRetries) {
      throw error
    }

    // 计算重试延迟
    const delay = RETRY_CONFIG.exponentialBackoff
      ? RETRY_CONFIG.retryDelay * Math.pow(2, retryCount)
      : RETRY_CONFIG.retryDelay

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 请求重试 (${retryCount + 1}/${RETRY_CONFIG.maxRetries}), ${delay}ms后重试:`, {
        url: config.url,
        error: error.message
      })
    }

    await new Promise((resolve) => setTimeout(resolve, delay))
    return retryWithBackoff(fn, config, retryCount + 1)
  }
}

/**
 * 📋 添加到认证失效请求队列
 * @param {Function} resolve - Promise resolve函数
 * @param {Function} reject - Promise reject函数
 * @param {Object} config - axios配置
 */
function addToAuthFailureQueue(resolve, reject, config) {
  authFailureRequestQueue.push({ resolve, reject, config })
}

/**
 * 🚀 处理认证失效队列
 * @param {boolean} isAuthRecovered - 认证是否恢复
 */
function processAuthFailureQueue(isAuthRecovered) {
  const queue = [...authFailureRequestQueue]
  authFailureRequestQueue.length = 0 // 清空队列

  queue.forEach(({ resolve, reject, config }) => {
    if (isAuthRecovered) {
      // 重新发起请求
      resolve(service(config))
    } else {
      // 拒绝所有排队的请求
      reject(new ApiError('AUTH_001', '认证失效，请重新登录', 401))
    }
  })

  isHandlingAuthFailure = false
}

/**
 * 📈 性能监控函数
 * @param {Object} config - 请求配置
 * @param {number} startTime - 请求开始时间
 * @param {Object} response - 响应对象
 */
function trackPerformance(config, startTime, response) {
  const duration = Date.now() - startTime
  const requestId = response?.data?.meta?.requestId

  if (process.env.NODE_ENV === 'development') {
    console.log('📈 性能监控:', {
      url: config.url,
      method: config.method,
      duration: `${duration}ms`,
      requestId,
      status: response.status
    })
  }

  // 可以在这里添加向监控系统发送数据的逻辑
  if (duration > 3000) {
    console.warn('⚠️ 慢请求警告:', {
      url: config.url,
      duration: `${duration}ms`,
      requestId
    })
  }
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
    duration: 5 * 1000
  })

  // 如果正在处理认证失效，直接返回
  if (isHandlingAuthFailure) {
    return
  }

  isHandlingAuthFailure = true

  // 弹出确认对话框，询问是否重新登录
  MessageBox.confirm('您的登录已过期，请重新登录以继续使用', '登录过期提示', {
    confirmButtonText: '立即登录',
    cancelButtonText: '稍后再说',
    type: 'warning'
  })
    .then(() => {
      // 用户确认重新登录 - 使用路由跳转而非页面刷新
      store.dispatch('user/resetToken').then(() => {
        // 记住当前页面，登录成功后可以跳转回来
        const currentPath = router.currentRoute.fullPath
        router.push({
          path: '/login',
          query: currentPath !== '/login' ? { redirect: currentPath } : {}
        })

        // 认证恢复失败，处理队列
        processAuthFailureQueue(false)
      })
    })
    .catch(() => {
      // 用户取消，继续停留在当前页面
      console.log('用户取消重新登录')
      processAuthFailureQueue(false)
    })
}

/**
 * 📊 导出axios实例和工具类
 */
/**
 * 📋 导出axios实例和工具类
 * 支持重试、去重、认证队列等现代化特性
 */
export default service

/**
 * 🔄 带重试功能的axios实例
 * @param {Object} config - 请求配置
 * @param {Object} retryOptions - 重试配置
 * @returns {Promise} 请求结果
 */
export const serviceWithRetry = (config, retryOptions = {}) => {
  const mergedRetryConfig = { ...RETRY_CONFIG, ...retryOptions }
  const originalRetryConfig = { ...RETRY_CONFIG }

  // 临时更新重试配置
  Object.assign(RETRY_CONFIG, mergedRetryConfig)

  return service(config).finally(() => {
    // 还原原有配置
    Object.assign(RETRY_CONFIG, originalRetryConfig)
  })
}

/**
 * 🗼️ 清理工具函数
 */
export const clearRequestCache = () => {
  pendingRequests.clear()
  errorMessageCache.clear()
  authFailureRequestQueue.length = 0
  isHandlingAuthFailure = false
}

/**
 * 📈 获取请求统计信息
 */
export const getRequestStats = () => {
  return {
    pendingRequestsCount: pendingRequests.size,
    queuedAuthRequestsCount: authFailureRequestQueue.length,
    isHandlingAuthFailure,
    cachedErrorMessages: errorMessageCache.size
  }
}

/**
 * 🔧 配置更新工具
 */
export const updateRetryConfig = (newConfig) => {
  Object.assign(RETRY_CONFIG, newConfig)
}

export const getRetryConfig = () => ({ ...RETRY_CONFIG })

/**
 * 🔧 错误检测辅助方法 - 导出给业务层使用
 */
export const errorUtils = {
  isAuthError,
  isValidationError,
  isSystemError,
  isRateLimitError,
  isAccountLockedError,

  // 业务层可用的错误检测方法
  isAccountLocked: (error) => isAccountLockedError(error.code, error.status),
  isRateLimited: (error) => isRateLimitError(error.code, error.status),
  isValidation: (error) => isValidationError(error.code),
  isSystem: (error) => isSystemError(error.code),
  isAuth: (error) => isAuthError(error.code),

  // 检查错误是否已被request层处理
  isHandledByRequestLayer: (error) => error.details?.handledByRequestLayer === true
}

/**
 * 📖 使用说明和最佳实践
 *
 * 🚀 现代化使用方式（统一错误处理 + 架构优化）：
 * ```javascript
 * // 1. 基本使用
 * async getData() {
 *   try {
 *     const res = await api.getData()
 *     this.data = res.data
 *
 *     // 利用后端返回的meta信息
 *     if (res.meta?.requestId) {
 *       console.log('Request ID:', res.meta.requestId)
 *     }
 *
 *     if (res.message) {
 *       this.$message.success(res.message)
 *     }
 *   } catch (error) {
 *     // 所有错误都是 ApiError 实例，统一处理
 *     this.handleApiError(error)
 *   }
 * }
 *
 * // 2. 使用带重试功能的请求
 * import { serviceWithRetry } from './request'
 *
 * async fetchImportantData() {
 *   try {
 *     const response = await serviceWithRetry({
 *       url: '/api/critical-data',
 *       method: 'get'
 *     }, {
 *       maxRetries: 5,
 *       retryDelay: 2000,
 *       exponentialBackoff: true
 *     })
 *   } catch (error) {
 *     // 重试失败后的处理
 *   }
 * }
 *
 * // 3. 获取请求统计信息
 * import { getRequestStats, clearRequestCache } from './request'
 *
 * // 查看当前请求状态
 * console.log('请求统计:', getRequestStats())
 *
 * // 清理缓存（在页面切换时使用）
 * clearRequestCache()
 *
 * // 2. 使用错误检测工具（现在直接使用后端消息）
 * import { errorUtils } from './request'
 *
 * handleApiError(error) {
 *   // 利用增强的错误信息
 *   if (error.details?.requestId) {
 *     console.log('错误追踪 ID:', error.details.requestId)
 *   }
 *
 *   // 检查是否已被request层处理
 *   if (errorUtils.isHandledByRequestLayer(error)) {
 *     console.log('错误已在request层处理，无需业务层处理')
 *     return
 *   }
 *
 *   // 使用错误检测工具进行分类处理
 *   if (errorUtils.isAuth(error)) {
 *     // 登录验证失败错误（与后端同步） - 这些不会触发重新登录
 *     // 👉 直接使用后端返回的消息，无需硬编码！
 *     this.$message.error(error.message) // 所有认证错误直接显示后端消息
 *   } else if (errorUtils.isValidation(error)) {
 *     // 验证错误 - 可以进行字段级别的处理
 *     this.handleValidationError(error)
 *   } else if (error.code?.startsWith('BIZ_')) {
 *     // 业务错误 - 直接使用后端返回的消息
 *     this.$message.error(error.message) // 👈 直接使用后端消息
 *   } else if (error.code?.startsWith('NETWORK_')) {
 *     // 网络错误 - 可以显示重试按钮等
 *     this.showRetryButton = true
 *   } else {
 *     // 其他未知错误 - 使用后端消息或默认消息
 *     this.$message.error(error.message || '操作失败') // 👈 优先使用后端消息
 *   }
 * }
 *
 * // 3. 验证错误的详细处理（现在更简洁）
 * handleValidationError(error) {
 *   const details = error.details
 *   if (details?.field) {
 *     // 针对特定字段的验证错误
 *     this.setFieldError(details.field, error.message) // 👈 直接使用后端消息
 *   } else {
 *     // 通用验证错误消息已在request层显示（使用后端消息）
 *     console.log('验证错误已显示:', error.message)
 *   }
 * }
 *
 * // 4. 💡 最佳实践总结：
 * // ✅ 优先使用后端返回的error.message
 * // ✅ 前端只负责UI交互逻辑，不重复定义错误文案
 * // ✅ 保持前后端错误消息的一致性
 * // ✅ 减少维护成本，避免前后端消息不同步
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
