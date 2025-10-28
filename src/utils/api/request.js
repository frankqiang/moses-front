/**
 * 文件名称：request.js
 * 文件描述：axios实例配置和主入口
 * 创建日期：2025-10-27
 *
 * 设计原则：
 * 1. 拦截器只处理通用错误
 * 2. 业务错误交给业务层处理
 * 3. 提供清晰的错误对象结构
 */

import axios from 'axios'
import { setupRequestInterceptor } from './interceptors/request'
import { setupResponseInterceptor } from './interceptors/response'
import { getToken, getRefreshToken, removeToken } from '@/utils/auth'
import { getErrorStats, clearErrorStats } from './errorHandler'

/**
 * 创建axios实例
 */
const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // API基础路径
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 配置拦截器
 */
setupRequestInterceptor(request)
setupResponseInterceptor(request)

/**
 * ==================== 工具函数 ====================
 */

/**
 * 获取请求统计信息
 * @returns {Object}
 */
export function getRequestStats() {
  return {
    hasAccessToken: !!getToken(),
    hasRefreshToken: !!getRefreshToken(),
    errorStats: getErrorStats()
  }
}

/**
 * 手动清除Token（用于登出）
 */
export function clearTokens() {
  removeToken()
  console.log('🧹 已清除所有Token')
}

/**
 * ==================== 导出 ====================
 */

// 默认导出axios实例
export default request

// 导出工具函数
export {
  getRequestStats,
  clearTokens,
  // 导出错误统计
  getErrorStats,
  clearErrorStats
}

/**
 * ==================== 使用示例 ====================
 *
 * // 基本使用
 * import request from '@/api/request'
 *
 * async function fetchData() {
 *   try {
 *     const res = await request.get('/v1/users')
 *     console.log(res.data)  // 访问数据
 *     return res.data
 *   } catch (error) {
 *     // 只处理业务错误
 *     if (error.code?.startsWith('BIZ_')) {
 *       this.$message.error(error.message)
 *     }
 *   }
 * }
 *
 * // POST请求
 * async function createUser(userData) {
 *   try {
 *     const res = await request.post('/v1/users', userData)
 *     this.$message.success(res.message)
 *     return res.data
 *   } catch (error) {
 *     // 验证错误 - 字段级别提示
 *     if (error.code?.startsWith('VAL_')) {
 *       this.setFieldError(error.details?.field, error.message)
 *     }
 *   }
 * }
 *
 * // 查看统计信息
 * import { getRequestStats } from '@/api/request'
 * console.log(getRequestStats())
 *
 * // 清理缓存
 * import { clearRequestCache } from '@/api/request'
 * clearRequestCache()
 */
