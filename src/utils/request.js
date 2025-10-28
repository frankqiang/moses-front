/**
 * 文件名称：request.js
 * 文件描述：axios实例配置和主入口（重构版）
 * 创建日期：2025-10-27
 * 修改记录：
 *   - 2025-10-27: 重构为模块化架构，保持向后兼容
 *
 * 设计原则：
 * 1. 拦截器只处理通用错误（网络、认证、系统错误）
 * 2. 业务错误交给业务层处理
 * 3. 提供清晰的错误对象结构
 *
 * 重构说明：
 * - 旧版本（1032行单文件）已重构为模块化架构
 * - 核心逻辑移至 src/utils/api/ 目录
 * - 此文件保持向后兼容，重新导出新版本的所有功能
 */

import axios from 'axios'
import { setupRequestInterceptor } from './api/interceptors/request'
import { setupResponseInterceptor } from './api/interceptors/response'
import { getToken, getRefreshToken, removeToken } from './auth'
import { getErrorStats, clearErrorStats, ApiError } from './api/errorHandler'

/**
 * 创建axios实例
 */
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // API基础路径
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 配置拦截器
 */
setupRequestInterceptor(service)
setupResponseInterceptor(service)

/**
 * ==================== 工具函数 ====================
 */

/**
 * 获取请求统计信息
 * @returns {Object}
 */
function getRequestStats() {
  return {
    hasAccessToken: !!getToken(),
    hasRefreshToken: !!getRefreshToken(),
    errorStats: getErrorStats()
  }
}

/**
 * 手动清除Token（用于登出）
 */
function clearTokens() {
  removeToken()
  console.log('🧹 已清除所有Token')
}

/**
 * ==================== 导出 ====================
 */

// 默认导出axios实例（保持向后兼容）
export default service

// 导出API错误类（业务层可用）
export { ApiError }

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
 * // 方式1：基本使用（继续使用旧的方式）
 * import service from '@/utils/request'
 *
 * async function fetchData() {
 *   try {
 *     const res = await service.get('/v1/users')
 *     console.log(res.data)
 *     return res.data
 *   } catch (error) {
 *     // 拦截器已处理网络错误、认证错误、系统错误
 *     // 这里只需要处理业务错误
 *     if (!error.handledByInterceptor) {
 *       this.$message.error(error.message)
 *     }
 *   }
 * }
 *
 * // 方式2：使用errorMixin（推荐）
 * import service from '@/utils/request'
 * import errorMixin from '@/mixins/errorMixin'
 *
 * export default {
 *   mixins: [errorMixin],
 *
 *   methods: {
 *     async handleSubmit() {
 *       try {
 *         const res = await service.post('/v1/users', this.formData)
 *         this.$message.success(res.message)
 *       } catch (error) {
 *         this.handleError(error)  // 一行代码搞定！
 *       }
 *     }
 *   }
 * }
 *
 * // 方式3：自定义特定错误码处理
 * export default {
 *   mixins: [errorMixin],
 *
 *   methods: {
 *     async handleSubmit() {
 *       try {
 *         const res = await service.post('/v1/users', this.formData)
 *         this.$message.success(res.message)
 *       } catch (error) {
 *         this.handleError(error, {
 *           'USER_EMAIL_ALREADY_EXISTS': () => {
 *             this.$message.error('邮箱已存在，请更换')
 *             this.focusField('email')
 *           }
 *         })
 *       }
 *     }
 *   }
 * }
 *
 * 📚 相关文档：
 * - 模块化架构：./api/README.md
 * - 迁移指南：./api/MIGRATION_GUIDE.md
 * - 错误处理：./api/errorHandler.js
 * - 业务层Mixin：../mixins/errorMixin.js
 */
