/**
 * 文件名称：auth.js
 * 文件描述：认证处理逻辑（Token刷新、认证失效处理）
 * 创建日期：2025-10-27
 * 修改记录：
 *   - 2025-10-28: 统一使用项目的auth.js，移除tokenManager依赖
 */

import store from '@/store'
import router from '@/router'
import { refreshTokens } from '@/views/login/api/index'
import { getToken, getRefreshToken, setTokens, removeToken, isRememberMe } from '@/utils/auth'
import { ApiError, redirectToLogin, showMessage } from '../errorHandler'
import { isTokenExpiredError, isRefreshTokenError } from '../errorTypes'

/**
 * ==================== Token刷新队列管理 ====================
 */

/**
 * Token刷新状态
 */
let isRefreshing = false
const refreshQueue = []

/**
 * 添加请求到刷新队列
 * @param {Function} resolve - Promise resolve
 * @param {Function} reject - Promise reject
 * @param {Object} config - 请求配置
 */
function addToRefreshQueue(resolve, reject, config) {
  refreshQueue.push({ resolve, reject, config })

  if (process.env.NODE_ENV === 'development') {
    console.log(`📝 请求已加入Token刷新队列，当前队列长度: ${refreshQueue.length}`, {
      url: config.url,
      method: config.method
    })
  }
}

/**
 * 处理刷新队列
 * @param {boolean} isSuccess - 刷新是否成功
 * @param {string} newToken - 新的Access Token（成功时）
 * @param {Error} error - 错误对象（失败时）
 * @param {Function} retryRequest - 重试请求的函数
 */
function processRefreshQueue(isSuccess, newToken, error, retryRequest) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 处理Token刷新队列，队列长度: ${refreshQueue.length}，刷新${isSuccess ? '成功' : '失败'}`)
  }

  const queue = [...refreshQueue]
  refreshQueue.length = 0 // 清空队列

  queue.forEach(({ resolve, reject, config }) => {
    if (isSuccess && newToken) {
      // 刷新成功：更新请求头并重试
      config.headers.Authorization = `Bearer ${newToken}`
      resolve(retryRequest(config))
    } else {
      // 刷新失败：拒绝所有排队的请求
      // 确保传递ApiError对象，保持错误对象一致性
      const apiError = error instanceof ApiError
        ? error
        : new ApiError('REFRESH_QUEUE_FAILED', error?.message || 'Token刷新失败', 401)
      apiError.handledByInterceptor = true
      reject(apiError)
    }
  })
}

/**
 * 认证失效处理标志（防止重复跳转）
 */
let isHandlingAuthFailure = false

/**
 * ==================== Token过期处理 ====================
 */

/**
 * 处理Token过期，尝试自动刷新
 * @param {Object} originalConfig - 原始请求配置
 * @param {Function} retryRequest - 重试请求的函数
 * @returns {Promise}
 */
export async function handleTokenExpired(originalConfig, retryRequest) {
  const refreshToken = getRefreshToken()

  // 场景1：如果没有refresh token，直接跳转登录
  if (!refreshToken) {
    console.warn('⚠️ 未找到RefreshToken，需要重新登录')
    handleAuthFailure('登录已过期，请重新登录')
    const authError = new ApiError('AUTH_001', '未授权访问，请重新登录', 401)
    authError.handledByInterceptor = true // 标记已处理
    return Promise.reject(authError)
  }

  // 场景2：如果正在刷新token，将当前请求加入队列
  if (isRefreshing) {
    console.log('🔄 Token刷新进行中，请求已加入等待队列')
    return new Promise((resolve, reject) => {
      addToRefreshQueue(resolve, reject, originalConfig)
    })
  }

  // 场景3：开始刷新token流程
  isRefreshing = true
  console.log('🔄 检测到Token过期，开始自动刷新流程...')

  try {
    // 调用刷新token接口
    const refreshResponse = await refreshTokens(refreshToken)

    // 验证响应格式
    if (!refreshResponse || !refreshResponse.success || !refreshResponse.data) {
      throw new ApiError('REFRESH_FAILED', '刷新令牌响应格式错误', 500)
    }

    const { access, refresh } = refreshResponse.data

    // 验证返回的token数据
    if (!access?.token || !refresh?.token) {
      throw new ApiError('REFRESH_FAILED', '刷新令牌数据不完整', 500)
    }

    // 刷新成功 - 更新本地token
    console.log('✅ Token刷新成功，更新本地存储')

    // 更新localStorage/sessionStorage中的token
    setTokens(
      {
        accessToken: access.token,
        refreshToken: refresh.token,
        expiresIn: access.expires
      },
      isRememberMe()
    )

    // 更新Vuex store中的token
    await store.dispatch('user/setToken', access.token)

    // 处理等待队列中的所有请求
    processRefreshQueue(true, access.token, null, retryRequest)

    // 重新发送原始请求（使用新token）
    originalConfig.headers.Authorization = `Bearer ${access.token}`
    console.log('🚀 使用新Token重试原始请求:', originalConfig.url)
    return retryRequest(originalConfig)
  } catch (error) {
    // 刷新失败 - 轻量级提示后跳转登录页
    console.error('❌ Token刷新失败:', error.message || error)

    // 轻量级提示：刷新Token失败
    showMessage(error.message || '登录已过期，请重新登录', 'warning', 3000)

    // 创建统一的错误对象
    const refreshError = new ApiError(
      error.code || 'REFRESH_FAILED',
      error.message || '登录已过期，请重新登录',
      error.status || 401,
      {
        originalError: error,
        url: originalConfig?.url,
        timestamp: new Date().toISOString()
      }
    )
    refreshError.handledByInterceptor = true // 标记已处理

    // 处理等待队列中的所有请求（全部失败）
    processRefreshQueue(false, null, refreshError, retryRequest)

    // 完全清除认证状态
    console.log('🧹 完全清理认证状态，防止路由守卫误判...')
    await store.commit('user/RESET_STATE')
    removeToken()

    // 跳转到登录页
    const currentPath = router.currentRoute.fullPath
    console.log('🔐 Token刷新失败，跳转到登录页，来源页面:', currentPath)

    redirectToLogin(router, currentPath)

    return Promise.reject(refreshError)
  } finally {
    // 重置刷新状态
    // eslint-disable-next-line require-atomic-updates
    isRefreshing = false
    console.log('🔓 Token刷新流程结束，解除锁定')
  }
}

/**
 * ==================== 认证失效处理 ====================
 */

/**
 * 处理认证失效错误
 * @param {Object} errorData - 错误数据
 * @param {Object} originalConfig - 原始请求配置
 * @param {Function} retryRequest - 重试请求的函数
 * @returns {Promise}
 */
export async function handleAuthError(errorData, originalConfig, retryRequest) {
  const errorCode = errorData?.code

  // 详细日志：帮助调试Token刷新逻辑
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 认证错误详情:', {
      errorCode,
      errorMessage: errorData?.message,
      currentToken: getToken() ? '存在' : '不存在',
      refreshToken: getRefreshToken() ? '存在' : '不存在'
    })
  }

  // 1. Token过期检测 - 尝试自动刷新
  if (isTokenExpiredError(errorCode)) {
    console.log(`✅ 检测到Token过期错误: ${errorCode}，尝试自动刷新...`)

    // 开发环境轻量级提示
    if (process.env.NODE_ENV === 'development') {
      showMessage('登录状态即将过期，正在自动续期...', 'info', 2000)
    }

    return handleTokenExpired(originalConfig, retryRequest)
  }

  // 2. RefreshToken过期或无效 - 静默跳转登录页
  if (isRefreshTokenError(errorCode)) {
    console.warn(`⚠️ RefreshToken失效: ${errorCode}, 跳转登录页`)

    // 清除认证状态并跳转（不显示消息，由handleAuthFailure统一处理）
    await handleAuthFailure(errorData?.message || '登录已过期，请重新登录')

    const authError = new ApiError(errorCode, errorData?.message || '登录已过期，请重新登录', 401)
    authError.handledByInterceptor = true // 标记已处理
    return Promise.reject(authError)
  }

  // 3. 其他认证错误 - 智能处理
  // 如果存在refreshToken，尝试刷新（AUTH_001等情况）
  if (errorCode === 'AUTH_001' && getRefreshToken()) {
    console.log('💡 AUTH_001但存在refreshToken，尝试自动刷新...')
    return handleTokenExpired(originalConfig, retryRequest)
  }

  // 其他情况：清除状态并跳转登录
  console.warn(`⚠️ 认证错误: ${errorCode}, 跳转登录页`)
  await handleAuthFailure(errorData?.message || '认证失败，请重新登录')

  const authError = new ApiError(errorCode || 'AUTH_ERROR', errorData?.message || '认证失败，请重新登录', 401)
  authError.handledByInterceptor = true // 标记已处理
  return Promise.reject(authError)
}

/**
 * 统一认证失效处理函数
 * @param {string} message - 错误消息
 */
export async function handleAuthFailure(message) {
  // 如果正在处理认证失效，直接返回（避免重复跳转）
  if (isHandlingAuthFailure) {
    return
  }

  isHandlingAuthFailure = true

  try {
    // 轻量级提示
    showMessage(message || '认证失败，请重新登录', 'warning', 3000)

    // 清除认证状态
    await store.commit('user/RESET_STATE')
    removeToken()

    // 跳转到登录页
    const currentPath = router.currentRoute.fullPath
    redirectToLogin(router, currentPath)
  } finally {
    // 跳转完成后重置标志
    setTimeout(() => {
      isHandlingAuthFailure = false
    }, 1000)
  }
}

/**
 * ==================== 导出 ====================
 */
export default {
  handleTokenExpired,
  handleAuthError,
  handleAuthFailure
}
