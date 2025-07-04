import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

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
  config => {
    // 🔐 添加认证token
    if (store.getters.token) {
      // 保持向后兼容：继续使用X-Token头
      config.headers['X-Token'] = getToken()

      // 🆕 可选：同时支持标准Authorization头（用于新API）
      // config.headers['Authorization'] = `Bearer ${getToken()}`
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
  error => {
    console.log('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

/**
 * 📥 响应拦截器 - 双格式兼容版
 * 功能：自动识别新旧响应格式，统一错误处理，保持兼容性
 */
service.interceptors.response.use(
  response => {
    // 🐛 开发环境调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })
    }

    const res = response.data

    // 🔄 核心：双格式响应处理
    return handleResponse(res, response.status)
  },
  error => {
    console.log('❌ Response Error:', error)

    // 🌐 只处理网络级别错误（连接失败、超时等）
    Message({
      message: '网络请求失败，请稍后重试',
      type: 'error',
      duration: 5 * 1000
    })

    return Promise.reject(error)
  }
)

/**
 * 🎯 双格式响应处理核心函数
 * 自动识别API响应格式并采用相应的处理策略
 *
 * @param {Object} res - 服务器响应数据
 * @param {number} status - HTTP状态码
 * @returns {Object|Promise.reject} 处理后的响应或错误
 */
function handleResponse(res, status) {
  // 🔍 格式检测：通过特征字段自动识别响应格式
  const isLegacyFormat = res.code !== undefined // 旧格式特征：有code字段
  const isModernFormat = res.success !== undefined // 新格式特征：有success字段

  if (isLegacyFormat) {
    // 📱 处理旧格式：{code: 20000, data: {}, message: ""}
    return handleLegacyFormat(res)
  } else if (isModernFormat) {
    // 🚀 处理新格式：{success: true, data: {}, message: "", timestamp: ""}
    return handleModernFormat(res, status)
  } else {
    // ⚠️ 未知格式兜底：按旧格式处理，确保兼容性
    console.warn('⚠️ Unknown response format, treating as legacy:', res)
    return handleLegacyFormat(res)
  }
}

/**
 * 📱 旧格式响应处理函数
 * 保持与现有代码的完全兼容性
 *
 * @param {Object} res - 旧格式响应数据
 * @returns {Object|Promise.reject} 处理结果
 */
function handleLegacyFormat(res) {
  // if the custom code is not 20000, it is judged as an error.
  if (res.code !== 20000) {
    // 🔐 只处理认证相关的全局错误，业务错误交给业务组件处理
    // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
    if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
      handleAuthError(res.message || 'Authentication Error')
    }

    // 📋 业务错误直接返回给业务组件处理（保持原有逻辑）
    return Promise.reject(res)
  } else {
    // ✅ 成功响应，保持原格式不变
    return res
  }
}

/**
 * 🚀 新格式响应处理函数
 * 提供现代化的错误处理和标准化的错误对象
 *
 * @param {Object} res - 新格式响应数据
 * @param {number} status - HTTP状态码
 * @returns {Object|Promise.reject} 处理结果
 */
function handleModernFormat(res, status) {
  if (!res.success) {
    // 🔐 检查是否是认证相关错误
    if (isAuthError(res.error?.code)) {
      handleAuthError(res.error?.message || 'Authentication Error')
    }

    // 📋 转换为标准ApiError对象，提供丰富的错误信息
    return Promise.reject(new ApiError(
      res.error?.code || 'UNKNOWN_ERROR',
      res.error?.message || '未知错误',
      status,
      res.error?.details
    ))
  }

  // ✅ 成功响应，返回新格式数据
  return res
}

/**
 * 🔐 认证错误检测函数
 * 识别各种认证相关的错误码
 *
 * @param {string} errorCode - 错误码
 * @returns {boolean} 是否为认证错误
 */
function isAuthError(errorCode) {
  const authErrorCodes = [
    // 新错误码系统
    'UNAUTHORIZED', 'TOKEN_EXPIRED', 'INVALID_TOKEN', 'FORBIDDEN',
    'E1002', 'E1003', // 统一错误码中的认证错误

    // 兼容旧错误码
    'AUTH_FAILED', 'LOGIN_REQUIRED'
  ]

  return authErrorCodes.includes(errorCode)
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
    message: message,
    type: 'error',
    duration: 5 * 1000
  })

  // 弹出确认对话框，询问是否重新登录
  MessageBox.confirm(
    'You have been logged out, you can cancel to stay on this page, or log in again',
    'Confirm logout',
    {
      confirmButtonText: 'Re-Login',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(() => {
    // 用户确认重新登录
    store.dispatch('user/resetToken').then(() => {
      location.reload()
    })
  }).catch(() => {
    // 用户取消，继续停留在当前页面
    console.log('User cancelled re-login')
  })
}

/**
 * 📊 导出axios实例和工具类
 *
 * 使用方式：
 * 1. 旧代码：import request from '@/utils/request'
 * 2. 新代码：import request, { ApiError } from '@/utils/request'
 */
export default service

/**
 * 📖 使用说明和最佳实践
 *
 * 🔄 双格式兼容性：
 * - 自动识别新旧响应格式
 * - 旧代码无需任何修改
 * - 新代码享受现代化错误处理
 *
 * 📱 旧格式使用方式（保持不变）：
 * ```javascript
 * async getData() {
 *   try {
 *     const res = await api.getData()
 *     if (res.code === 20000) {
 *       this.data = res.data
 *     } else {
 *       this.$message.error(res.message)
 *     }
 *   } catch (error) {
 *     this.$message.error('网络错误')
 *   }
 * }
 * ```
 *
 * 🚀 新格式使用方式（推荐）：
 * ```javascript
 * async getData() {
 *   try {
 *     const res = await api.getData()
 *     this.data = res.data
 *     this.$message.success(res.message)
 *   } catch (error) {
 *     if (error instanceof ApiError) {
 *       this.handleApiError(error)
 *     } else {
 *       this.$message.error('网络错误')
 *     }
 *   }
 * }
 *
 * handleApiError(error) {
 *   switch(error.code) {
 *     case 'USER_NOT_FOUND':
 *       this.$message.warning('用户不存在')
 *       break
 *     case 'PERMISSION_DENIED':
 *       this.$message.error('权限不足')
 *       break
 *     default:
 *       this.$message.error(error.message)
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
 * - 统一认证错误处理
 *
 * 📈 扩展性：
 * - 可轻松添加新的错误码识别
 * - 支持请求/响应中间件扩展
 * - 兼容第三方库集成
 */
