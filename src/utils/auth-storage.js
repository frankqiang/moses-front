/**
 * 文件名称：auth-storage.js
 * 文件描述：统一的用户认证存储管理器，提供集中式认证数据管理、版本控制和数据迁移功能
 * 创建日期：2024-12-20
 * 修改记录：
 *   - 2024-12-20: 初始创建，实现集中式认证存储管理
 */

// 默认配置
const DEFAULT_CONFIG = {
  // 存储在localStorage中的键名
  STORAGE_KEY: 'moses_auth_data',
  // 配置当前版本
  CURRENT_VERSION: 1,
  // 配置过期时间（毫秒），默认30天
  EXPIRY_TIME: 30 * 24 * 60 * 60 * 1000,
  // 清理间隔（毫秒），默认每7天
  CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000
}

/**
 * 用户认证存储管理器
 * 提供集中式的用户认证数据管理，包括token、用户信息、安全状态等
 */
class AuthStorageManager {
  constructor(options = {}) {
    // 合并配置
    this.config = { ...DEFAULT_CONFIG, ...options }
    
    // 存储所有认证数据的对象
    this.authData = null
    
    // 初始化存储
    this.initStorage()
    
    // 设置定期清理
    this.setupCleanup()
  }

  /**
   * 初始化认证数据存储
   */
  initStorage() {
    try {
      // 尝试从localStorage读取配置
      const storedData = localStorage.getItem(this.config.STORAGE_KEY)
      
      if (storedData) {
        // 解析存储的配置
        this.authData = JSON.parse(storedData)
        
        // 检查版本并进行迁移
        if (this.authData.version !== this.config.CURRENT_VERSION) {
          this.migrateData()
        }
      } else {
        // 创建新的存储对象
        this.authData = this.getDefaultAuthData()
        // 尝试从旧的存储键迁移数据
        this.migrateFromLegacyStorage()
        this.saveAuthData()
      }
    } catch (error) {
      console.error('初始化认证存储失败:', error)
      // 创建新的存储对象
      this.authData = this.getDefaultAuthData()
      this.saveAuthData()
    }
  }

  /**
   * 获取默认认证数据结构
   * @returns {Object} 默认认证数据对象
   */
  getDefaultAuthData() {
    return {
      version: this.config.CURRENT_VERSION,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastCleanup: Date.now(),
      token: {
        access: null,
        refresh: null,
        expiresAt: null,
        storage: 'sessionStorage' // 默认使用sessionStorage
      },
      user: {
        remembered: {
          username: null,
          savedAt: null
        },
        rememberMe: false
      },
      security: {
        loginFailedCount: 0,
        accountLockedUntil: null,
        lastLoginAt: null
      }
    }
  }

  /**
   * 从旧的存储键迁移数据
   */
  migrateFromLegacyStorage() {
    console.log('开始从旧存储键迁移认证数据...')
    
    // 迁移token相关数据
    const oldTokenKey = 'vue_admin_template_token'
    const oldRememberMeKey = 'vue_admin_template_remember_me'
    const oldRememberedUserKey = 'vue_admin_template_remembered_user'
    const oldRefreshTokenKey = 'refresh_token'
    const oldLoginFailedCountKey = 'login_failed_count'
    const oldAccountLockedUntilKey = 'account_locked_until'
    
    // 迁移token
    const token = localStorage.getItem(oldTokenKey) || sessionStorage.getItem(oldTokenKey)
    if (token) {
      this.authData.token.access = token
      this.authData.token.storage = localStorage.getItem(oldTokenKey) ? 'localStorage' : 'sessionStorage'
    }
    
    // 迁移refreshToken
    const refreshToken = localStorage.getItem(oldRefreshTokenKey)
    if (refreshToken) {
      this.authData.token.refresh = refreshToken
    }
    
    // 迁移rememberMe状态
    const rememberMe = localStorage.getItem(oldRememberMeKey)
    if (rememberMe === 'true') {
      this.authData.user.rememberMe = true
    }
    
    // 迁移记住的用户信息
    const rememberedUser = localStorage.getItem(oldRememberedUserKey)
    if (rememberedUser) {
      try {
        const userInfo = JSON.parse(rememberedUser)
        this.authData.user.remembered = {
          username: userInfo.username,
          savedAt: userInfo.savedAt
        }
      } catch (error) {
        console.warn('迁移记住用户信息失败:', error)
      }
    }
    
    // 迁移安全相关数据
    const loginFailedCount = localStorage.getItem(oldLoginFailedCountKey)
    if (loginFailedCount) {
      this.authData.security.loginFailedCount = parseInt(loginFailedCount, 10) || 0
    }
    
    const accountLockedUntil = localStorage.getItem(oldAccountLockedUntilKey)
    if (accountLockedUntil) {
      this.authData.security.accountLockedUntil = parseInt(accountLockedUntil, 10)
    }
    
    // 清理旧的存储键
    this.cleanupLegacyStorage()
    
    console.log('认证数据迁移完成')
  }

  /**
   * 清理旧的存储键
   */
  cleanupLegacyStorage() {
    const legacyKeys = [
      'vue_admin_template_token',
      'vue_admin_template_remember_me', 
      'vue_admin_template_remembered_user',
      'refresh_token',
      'login_failed_count',
      'account_locked_until'
    ]
    
    legacyKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  }

  /**
   * 数据版本迁移
   */
  migrateData() {
    const oldVersion = this.authData.version || 0
    const newVersion = this.config.CURRENT_VERSION
    
    console.log(`迁移认证数据：从版本 ${oldVersion} 到 ${newVersion}`)
    
    // 根据版本差异执行不同的迁移策略
    if (oldVersion < 1) {
      // 从旧版本迁移到版本1的逻辑
      this.migrateToV1()
    }
    
    // 更新版本号和时间戳
    this.authData.version = newVersion
    this.authData.updatedAt = Date.now()
    
    // 保存更新后的存储
    this.saveAuthData()
  }

  /**
   * 迁移到版本1
   */
  migrateToV1() {
    // 确保数据结构完整
    const defaultData = this.getDefaultAuthData()
    this.authData = { ...defaultData, ...this.authData }
  }

  /**
   * 保存认证数据到localStorage
   */
  saveAuthData() {
    try {
      this.authData.updatedAt = Date.now()
      localStorage.setItem(this.config.STORAGE_KEY, JSON.stringify(this.authData))
    } catch (error) {
      console.error('保存认证数据失败:', error)
    }
  }

  /**
   * 设置定期清理
   */
  setupCleanup() {
    // 检查是否需要清理
    const now = Date.now()
    const lastCleanup = this.authData.lastCleanup || 0
    
    if (now - lastCleanup > this.config.CLEANUP_INTERVAL) {
      this.cleanup()
    }
  }

  /**
   * 清理过期数据
   * @param {boolean} force - 是否强制清理
   */
  cleanup(force = false) {
    const now = Date.now()
    
    if (!force && now - this.authData.lastCleanup < this.config.CLEANUP_INTERVAL) {
      return
    }
    
    console.log('开始清理过期认证数据...')
    
    // 清理过期的记住用户信息
    if (this.authData.user.remembered.savedAt) {
      const savedAt = this.authData.user.remembered.savedAt
      if (now - savedAt > this.config.EXPIRY_TIME) {
        this.authData.user.remembered = {
          username: null,
          savedAt: null
        }
        console.log('清理过期的记住用户信息')
      }
    }
    
    // 清理过期的账户锁定状态
    if (this.authData.security.accountLockedUntil && now > this.authData.security.accountLockedUntil) {
      this.authData.security.accountLockedUntil = null
      this.authData.security.loginFailedCount = 0
      console.log('清理过期的账户锁定状态')
    }
    
    // 更新清理时间
    this.authData.lastCleanup = now
    this.saveAuthData()
    
    console.log('认证数据清理完成')
  }

  // ==================== Token 管理方法 ====================

  /**
   * 获取访问token
   * @returns {string|null} token值
   */
  getToken() {
    return this.authData.token.access
  }

  /**
   * 设置访问token
   * @param {string} token - token值
   * @param {boolean} rememberMe - 是否记住登录状态
   */
  setToken(token, rememberMe = false) {
    this.authData.token.access = token
    this.authData.token.storage = rememberMe ? 'localStorage' : 'sessionStorage'
    this.authData.user.rememberMe = rememberMe
    
    // 根据rememberMe设置实际存储位置
    if (rememberMe) {
      localStorage.setItem('moses_token', token)
      sessionStorage.removeItem('moses_token')
    } else {
      sessionStorage.setItem('moses_token', token)
      localStorage.removeItem('moses_token')
    }
    
    this.saveAuthData()
  }

  /**
   * 获取刷新token
   * @returns {string|null} refreshToken值
   */
  getRefreshToken() {
    return this.authData.token.refresh
  }

  /**
   * 设置刷新token
   * @param {string} refreshToken - refreshToken值
   */
  setRefreshToken(refreshToken) {
    this.authData.token.refresh = refreshToken
    this.saveAuthData()
  }

  /**
   * 移除所有token
   */
  removeTokens() {
    this.authData.token.access = null
    this.authData.token.refresh = null
    this.authData.token.expiresAt = null
    
    // 清理实际存储
    localStorage.removeItem('moses_token')
    sessionStorage.removeItem('moses_token')
    
    this.saveAuthData()
  }

  /**
   * 检查是否记住登录状态
   * @returns {boolean} 是否记住登录状态
   */
  isRememberMe() {
    return this.authData.user.rememberMe
  }

  // ==================== 用户信息管理方法 ====================

  /**
   * 保存记住的用户信息
   * @param {Object} userInfo - 用户信息对象
   * @param {string} userInfo.username - 用户名
   */
  saveRememberedUser(userInfo) {
    if (userInfo && userInfo.username) {
      this.authData.user.remembered = {
        username: userInfo.username,
        savedAt: Date.now()
      }
      this.saveAuthData()
    }
  }

  /**
   * 获取记住的用户信息
   * @returns {Object|null} 用户信息对象或null
   */
  getRememberedUser() {
    const remembered = this.authData.user.remembered
    if (remembered.username && remembered.savedAt) {
      // 检查保存时间，超过30天则清除
      if (Date.now() - remembered.savedAt > this.config.EXPIRY_TIME) {
        this.removeRememberedUser()
        return null
      }
      return remembered
    }
    return null
  }

  /**
   * 移除记住的用户信息
   */
  removeRememberedUser() {
    this.authData.user.remembered = {
      username: null,
      savedAt: null
    }
    this.saveAuthData()
  }

  // ==================== 安全管理方法 ====================

  /**
   * 获取登录失败次数
   * @returns {number} 失败次数
   */
  getLoginFailedCount() {
    return this.authData.security.loginFailedCount || 0
  }

  /**
   * 增加登录失败次数
   * @returns {number} 当前失败次数
   */
  incrementLoginFailedCount() {
    this.authData.security.loginFailedCount = (this.authData.security.loginFailedCount || 0) + 1
    this.saveAuthData()
    return this.authData.security.loginFailedCount
  }

  /**
   * 清除登录失败次数
   */
  clearLoginFailedCount() {
    this.authData.security.loginFailedCount = 0
    this.authData.security.accountLockedUntil = null
    this.saveAuthData()
  }

  /**
   * 设置账户锁定时间
   * @param {number} lockDuration - 锁定时长（毫秒）
   */
  setAccountLocked(lockDuration = 30 * 60 * 1000) {
    this.authData.security.accountLockedUntil = Date.now() + lockDuration
    this.saveAuthData()
  }

  /**
   * 检查账户是否被锁定
   * @returns {boolean} 是否被锁定
   */
  isAccountLocked() {
    const lockedUntil = this.authData.security.accountLockedUntil
    if (lockedUntil && Date.now() < lockedUntil) {
      return true
    }
    // 如果锁定时间已过，自动清除锁定状态
    if (lockedUntil && Date.now() >= lockedUntil) {
      this.clearLoginFailedCount()
    }
    return false
  }

  /**
   * 获取账户锁定剩余时间
   * @returns {number} 剩余时间（毫秒），0表示未锁定
   */
  getAccountLockRemainingTime() {
    const lockedUntil = this.authData.security.accountLockedUntil
    if (lockedUntil && Date.now() < lockedUntil) {
      return lockedUntil - Date.now()
    }
    return 0
  }

  /**
   * 记录登录时间
   */
  recordLoginTime() {
    this.authData.security.lastLoginAt = Date.now()
    this.saveAuthData()
  }

  // ==================== 工具方法 ====================

  /**
   * 清除所有认证状态
   */
  clearAllAuthState() {
    this.removeTokens()
    this.removeRememberedUser()
    this.clearLoginFailedCount()
    this.authData.user.rememberMe = false
    this.saveAuthData()
  }

  /**
   * 获取存储统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      version: this.authData.version,
      createdAt: this.authData.createdAt,
      updatedAt: this.authData.updatedAt,
      lastCleanup: this.authData.lastCleanup,
      hasToken: !!this.authData.token.access,
      hasRefreshToken: !!this.authData.token.refresh,
      rememberMe: this.authData.user.rememberMe,
      hasRememberedUser: !!this.authData.user.remembered.username,
      loginFailedCount: this.authData.security.loginFailedCount,
      isAccountLocked: this.isAccountLocked()
    }
  }
}

// 创建单例实例
const authStorageManager = new AuthStorageManager()

// 开发环境下暴露到window对象用于调试
if (process.env.NODE_ENV === 'development') {
  window.authStorageManager = authStorageManager
  console.log('🔐 认证存储管理器已挂载到 window.authStorageManager')
  console.log('使用方法:')
  console.log('- window.authStorageManager.getStats() // 查看存储统计')
  console.log('- window.authStorageManager.cleanup(true) // 强制清理')
}

export default authStorageManager