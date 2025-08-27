
/**
 * 用户认证模块Mock API
 * 功能描述：提供用户登录、获取用户信息、登出等认证相关的Mock接口
 * 创建日期：2024-07-24
 * 修改记录：
 *   - 2024-01-XX: 优化API设计，符合RESTful规范和统一响应格式
 */

// 引入统一的响应工具函数
const { success, error, errors, ERROR_CODES } = require('./utils/response')

// Mock数据：用户令牌映射
const tokens = {
  admin: {
    token: 'admin-token',
    refreshToken: 'admin-refresh-token',
    expiresIn: 7200 // 2小时
  },
  editor: {
    token: 'editor-token',
    refreshToken: 'editor-refresh-token',
    expiresIn: 7200 // 2小时
  }
}

// Mock数据：用户信息映射
const users = {
  'admin-token': {
    id: 'user-001',
    username: 'admin',
    name: '系统管理员',
    email: 'admin@example.com',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    roles: ['admin'],
    permissions: ['*:*:*'], // 超级管理员拥有所有权限
    department: '信息技术部',
    position: '系统管理员',
    status: 'active',
    introduction: '我是系统超级管理员',
    lastLoginTime: '2024-01-15T10:30:00.000Z'
  },
  'editor-token': {
    id: 'user-002',
    username: 'editor',
    name: '内容编辑',
    email: 'editor@example.com',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    roles: ['editor'],
    permissions: ['content:read', 'content:write', 'content:update'],
    department: '内容运营部',
    position: '内容编辑',
    status: 'active',
    introduction: '我是内容编辑人员',
    lastLoginTime: '2024-01-15T09:15:00.000Z'
  }
}

/**
 * API处理函数集合
 */
const handlers = {
  /**
   * 用户登录处理函数
   * @param {Object} config - 请求配置对象
   * @returns {Object} 登录响应结果
   */
  login: (config) => {
    const { username, password, rememberMe } = config.body
    
    // 参数验证
    if (!username || !password) {
      return errors.validation('用户名和密码不能为空')
    }
    
    // 验证用户名长度
    if (username.length < 3 || username.length > 50) {
      return errors.validation('用户名长度必须在3-50字符之间')
    }
    
    // 验证密码长度
    if (password.length < 6 || password.length > 20) {
      return errors.validation('密码长度必须在6-20字符之间')
    }
    
    const token = tokens[username]
    
    // 模拟用户不存在或密码错误
    if (!token) {
      return errors.unauthorized('用户名或密码错误')
    }
    
    // 模拟简单的密码验证（实际应用中应该进行加密验证）
    const validPasswords = {
      admin: '111111',
      editor: 'editor123'
    }
    
    if (password !== validPasswords[username]) {
      return errors.unauthorized('用户名或密码错误')
    }
    
    // 登录成功，返回令牌信息
    return success({
      token: token.token,
      refreshToken: token.refreshToken,
      expiresIn: token.expiresIn
    }, '登录成功')
  },
  
  /**
   * 获取用户信息处理函数
   * @param {Object} config - 请求配置对象
   * @returns {Object} 用户信息响应结果
   */
  getUserInfo: (config) => {
    const { token } = config.query


    // 参数验证
    if (!token) {
      return errors.validation('访问令牌不能为空')
    }
    
    const info = users[token]
    
    // 模拟令牌无效或过期
    if (!info) {
      return errors.unauthorized('访问令牌无效或已过期，请重新登录')
    }
    
    // 返回用户信息
    return success(info, '获取用户信息成功')
  },
  
  /**
   * 用户登出处理函数
   * @param {Object} config - 请求配置对象
   * @returns {Object} 登出响应结果
   */
  logout: (config) => {
    // 实际应用中应该清除服务端的会话和令牌
    // 这里只是模拟成功响应
    return success(null, '登出成功')
  }
}

/**
 * 用户认证模块Mock路由配置
 * 遵循RESTful API设计规范
 */
module.exports = [
  /**
   * 用户登录接口
   * 功能描述：用户身份认证，验证用户名和密码，返回访问令牌
   * url地址：/api/v1/auth/login
   * 请求方式：POST
   */
  {
    url: '/api/v1/auth/login',
    type: 'post',
    response: config => handlers.login(config)
  },

  /**
   * 获取用户信息接口
   * 功能描述：根据访问令牌获取当前登录用户的详细信息
   * url地址：/api/v1/auth/user
   * 请求方式：GET
   */
  {
    url: '/api/v1/auth/user\.*',
    type: 'get',
    response: config => handlers.getUserInfo(config)
  },

  /**
   * 用户登出接口
   * 功能描述：用户退出登录，清除服务端会话和令牌
   * url地址：/api/v1/auth/logout
   * 请求方式：POST
   */
  {
    url: '/api/v1/auth/logout',
    type: 'post',
    response: config => handlers.logout(config)
  }
]
