/**
 * 登录模块API
 * 功能描述：提供用户认证相关的API调用，包括登录、获取用户信息和登出功能
 * 创建日期：2024-01-XX
 * 修改记录：
 *   - 2024-01-XX: 将用户认证API模块化到登录模块中
 */
import request from '@/utils/request'

/**
 * 用户登录
 * 功能描述：用户身份认证，验证用户名和密码，返回访问令牌
 * 入参说明：
 *   @param {Object} data - 登录信息对象
 *   @param {string} data.username - 用户名，必填，长度3-50字符
 *   @param {string} data.password - 密码，必填，长度6-20字符
 *   @param {boolean} [data.rememberMe] - 是否记住登录状态，可选，默认false
 * 返回参数说明：
 *   @returns {Promise<ApiResponse>} 登录响应结果
 *   @returns {boolean} success - 请求是否成功
 *   @returns {Object} data - 登录成功返回的数据
 *     @returns {string} data.token - 访问令牌，用于后续API调用认证
 *     @returns {string} data.refreshToken - 刷新令牌，用于令牌续期
 *     @returns {number} data.expiresIn - 令牌过期时间（秒）
 *   @returns {string} message - 响应消息
 *   @returns {string} timestamp - 响应时间戳
 * url地址：/api/v1/auth/login
 * 请求方式：POST
 */
export function login(data) {
  return request({
    url: '/api/v1/auth/login',
    method: 'post',
    data
  })
}

/**
 * 获取用户信息
 * 功能描述：根据访问令牌获取当前登录用户的详细信息
 * 入参说明：
 *   @param {string} token - 访问令牌，必填，从登录接口获取
 * 返回参数说明：
 *   @returns {Promise<ApiResponse>} 用户信息响应结果
 *   @returns {boolean} success - 请求是否成功
 *   @returns {Object} data - 用户信息数据
 *     @returns {string} data.id - 用户ID
 *     @returns {string} data.username - 用户名
 *     @returns {string} data.name - 用户真实姓名
 *     @returns {string} data.email - 用户邮箱
 *     @returns {string} data.avatar - 用户头像URL
 *     @returns {Array<string>} data.roles - 用户角色列表
 *     @returns {Array<string>} data.permissions - 用户权限列表
 *   @returns {string} message - 响应消息
 *   @returns {string} timestamp - 响应时间戳
 * url地址：/api/v1/auth/user
 * 请求方式：GET
 */
export function getInfo(token) {
  return request({
    url: '/api/v1/auth/user',
    method: 'get',
    params: { token }
  })
}

/**
 * 用户登出
 * 功能描述：用户登出，清除服务端会话信息
 * 返回参数说明：
 *   @returns {Promise<ApiResponse>} 登出响应结果
 *   @returns {boolean} success - 请求是否成功
 *   @returns {string} message - 响应消息
 *   @returns {string} timestamp - 响应时间戳
 * url地址：/api/v1/auth/logout
 * 请求方式：POST
 */
export function logout() {
  return request({
    url: '/api/v1/auth/logout',
    method: 'post'
  })
}