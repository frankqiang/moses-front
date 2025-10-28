/**
 * 文件名称：request.js
 * 文件描述：请求拦截器
 * 创建日期：2025-10-27
 */

import store from '@/store'
import { getToken } from '@/utils/auth'

/**
 * 请求去重Map
 */
const pendingRequests = new Map()

/**
 * 生成请求唯一标识
 * @param {Object} config - 请求配置
 * @returns {string}
 */
function generateRequestKey(config) {
  const { method, url, params, data } = config
  const paramsStr = params ? JSON.stringify(params) : ''
  const dataStr = data ? JSON.stringify(data) : ''
  return `${method}_${url}_${paramsStr}_${dataStr}`
}

/**
 * 配置请求拦截器
 * @param {Object} axiosInstance - axios实例
 */
export function setupRequestInterceptor(axiosInstance) {
  axiosInstance.interceptors.request.use(
    (config) => {
      // 1. 请求去重检查（可选功能，根据需要启用）
      // const requestKey = generateRequestKey(config)
      // if (pendingRequests.has(requestKey)) {
      //   return pendingRequests.get(requestKey)
      // }

      // 2. 记录请求开始时间（用于性能监控）
      config._startTime = Date.now()

      // 3. 添加认证Token
      if (store.getters.token) {
        config.headers.Authorization = `Bearer ${getToken()}`
      }

      // 4. 添加安全头
      config.headers['X-Requested-With'] = 'XMLHttpRequest'
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'

      // 5. 开发环境调试日志
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
      console.error('❌ Request Interceptor Error:', error)
      return Promise.reject(error)
    }
  )
}

/**
 * 清理请求去重缓存
 * @param {Object} config - 请求配置
 */
export function clearPendingRequest(config) {
  const requestKey = generateRequestKey(config)
  pendingRequests.delete(requestKey)
}

/**
 * 清空所有待处理请求
 */
export function clearAllPendingRequests() {
  pendingRequests.clear()
}

/**
 * 获取待处理请求数量
 * @returns {number}
 */
export function getPendingRequestCount() {
  return pendingRequests.size
}

export default {
  setupRequestInterceptor,
  clearPendingRequest,
  clearAllPendingRequests,
  getPendingRequestCount
}
