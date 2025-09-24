/**
 * 表格配置存储服务
 * 功能描述：提供集中式表格配置管理、版本控制和定期清理机制
 * 创建日期：2024-12-16
 */

// 默认配置
const DEFAULT_CONFIG = {
  // 存储在localStorage中的键名
  STORAGE_KEY: 'moses_table_configs',
  // 配置当前版本
  CURRENT_VERSION: 1,
  // 最大存储数量
  MAX_CONFIGS: 50,
  // 配置过期时间（毫秒），默认30天
  EXPIRY_TIME: 30 * 24 * 60 * 60 * 1000,
  // 清理间隔（毫秒），默认每7天
  CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000
}

class TableConfigStore {
  constructor(options = {}) {
    // 合并配置
    this.config = { ...DEFAULT_CONFIG, ...options }

    // 存储所有表格配置的对象
    this.store = null

    // 初始化存储
    this.initStore()

    // 设置定期清理
    this.setupCleanup()
  }

  /**
   * 初始化配置存储
   */
  initStore() {
    try {
      // 尝试从localStorage读取配置
      const storedData = localStorage.getItem(this.config.STORAGE_KEY)

      if (storedData) {
        // 解析存储的配置
        this.store = JSON.parse(storedData)

        // 检查版本并进行迁移
        if (this.store.version !== this.config.CURRENT_VERSION) {
          this.migrateStore()
        }
      } else {
        // 创建新的存储对象
        this.store = {
          version: this.config.CURRENT_VERSION,
          lastCleanup: Date.now(),
          configs: {}
        }
        this.saveStore()
      }
    } catch (error) {
      console.error('初始化表格配置存储失败:', error)
      // 创建新的存储对象
      this.store = {
        version: this.config.CURRENT_VERSION,
        lastCleanup: Date.now(),
        configs: {}
      }
      this.saveStore()
    }
  }

  /**
   * 配置版本迁移
   */
  migrateStore() {
    const oldVersion = this.store.version || 0
    const newVersion = this.config.CURRENT_VERSION

    console.log(`迁移表格配置：从版本 ${oldVersion} 到 ${newVersion}`)

    // 根据版本差异执行不同的迁移策略
    if (oldVersion < 1) {
      // 从旧版本迁移到版本1的逻辑
      this.migrateToV1()
    }

    // 更新版本号
    this.store.version = newVersion

    // 保存更新后的存储
    this.saveStore()
  }

  /**
   * 迁移到版本1
   * 自动从localStorage中的独立键迁移数据到集中存储
   */
  migrateToV1() {
    // 从旧的独立键迁移数据
    const oldKeys = [
      'vue_admin_template_table_columns_',
      'vue_admin_table_columns_',
      'table_columns_'
    ]

    // 同时检查旧的集中存储键
    const oldStorageKeys = [
      'vue_admin_table_configs',
      'vue_admin_template_table_configs'
    ]

    let migrated = false

    // 迁移旧的集中存储
    oldStorageKeys.forEach(oldKey => {
      try {
        const oldData = localStorage.getItem(oldKey)
        if (oldData) {
          const parsedData = JSON.parse(oldData)
          // 合并到新的存储键
          Object.assign(this.store.configs, parsedData.configs || {})
          localStorage.removeItem(oldKey)
          migrated = true
        }
      } catch (e) {
        console.warn(`迁移旧集中存储失败: ${oldKey}`, e)
        localStorage.removeItem(oldKey)
      }
    })

    // 迁移旧的独立键
    oldKeys.forEach(prefix => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(prefix)) {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              const tableId = key.replace(prefix, '')
              const config = JSON.parse(value)

              // 将旧配置迁移到新存储中
              this.store.configs[tableId] = {
                columns: config,
                updatedAt: Date.now(),
                accessedAt: Date.now()
              }

              // 删除旧键
              localStorage.removeItem(key)
              migrated = true
            }
          } catch (e) {
            console.warn(`迁移表格配置失败: ${key}`, e)
            // 删除损坏的数据
            localStorage.removeItem(key)
          }
        }
      }
    })

    if (migrated) {
      console.log('表格配置迁移完成')
    }
  }

  /**
   * 保存存储到localStorage
   */
  saveStore() {
    try {
      localStorage.setItem(this.config.STORAGE_KEY, JSON.stringify(this.store))
    } catch (error) {
      console.error('保存表格配置失败:', error)
      // 如果存储空间不足，尝试清理后再保存
      if (error.name === 'QuotaExceededError') {
        this.cleanup(true)
        try {
          localStorage.setItem(this.config.STORAGE_KEY, JSON.stringify(this.store))
        } catch (e) {
          console.error('存储空间不足，无法保存表格配置')
        }
      }
    }
  }

  /**
   * 设置定期清理
   */
  setupCleanup() {
    // 如果上次清理时间超过清理间隔，执行清理
    if (
      !this.store.lastCleanup ||
      Date.now() - this.store.lastCleanup > this.config.CLEANUP_INTERVAL
    ) {
      this.cleanup()
    }
  }

  /**
   * 清理过期和不常用的配置
   * @param {boolean} force - 是否强制清理（即使未过期）
   */
  cleanup(force = false) {
    console.log('开始清理表格配置')

    const now = Date.now()
    const configs = this.store.configs
    const configKeys = Object.keys(configs)

    // 如果配置数量超过最大限制或强制清理
    if (force || configKeys.length > this.config.MAX_CONFIGS) {
      // 按最后访问时间排序
      const sortedKeys = configKeys.sort((a, b) => {
        return configs[b].accessedAt - configs[a].accessedAt
      })

      // 保留最常用的配置，删除其余配置
      const keysToKeep = sortedKeys.slice(0, Math.floor(this.config.MAX_CONFIGS * 0.7))
      const keysToRemove = sortedKeys.slice(Math.floor(this.config.MAX_CONFIGS * 0.7))

      // 删除不常用的配置
      keysToRemove.forEach(key => {
        delete configs[key]
      })

      console.log(`强制清理：保留了 ${keysToKeep.length} 个配置，删除了 ${keysToRemove.length} 个配置`)
    } else {
      // 清理过期配置
      let removedCount = 0

      configKeys.forEach(key => {
        const config = configs[key]
        // 如果配置超过过期时间且最近未被访问
        if (now - config.updatedAt > this.config.EXPIRY_TIME) {
          delete configs[key]
          removedCount++
        }
      })

      if (removedCount > 0) {
        console.log(`定期清理：删除了 ${removedCount} 个过期配置`)
      }
    }

    // 更新最后清理时间
    this.store.lastCleanup = now

    // 保存更新后的存储
    this.saveStore()
  }

  /**
   * 获取表格列配置
   * @param {string} key - 配置键
   * @param {Array} defaultColumns - 默认列配置
   * @returns {Array} 可见列属性名数组
   */
  getColumnConfig(key, defaultColumns = []) {
    // 更新访问时间
    if (this.store.configs[key]) {
      this.store.configs[key].accessedAt = Date.now()
      this.saveStore()
      return this.store.configs[key].columns
    }

    return defaultColumns
  }

  /**
   * 保存表格列配置
   * @param {string} key - 配置键
   * @param {Array} columns - 可见列属性名数组
   */
  saveColumnConfig(key, columns) {
    this.store.configs[key] = {
      columns,
      updatedAt: Date.now(),
      accessedAt: Date.now()
    }

    this.saveStore()
  }

  /**
   * 删除表格列配置
   * @param {string} key - 配置键
   */
  removeColumnConfig(key) {
    if (this.store.configs[key]) {
      delete this.store.configs[key]
      this.saveStore()
    }
  }

  /**
   * 获取所有配置键
   * @returns {Array} 配置键数组
   */
  getAllKeys() {
    return Object.keys(this.store.configs)
  }

  /**
   * 获取配置统计信息
   * @returns {Object} 配置统计信息
   */
  getStats() {
    const configs = this.store.configs
    const keys = Object.keys(configs)

    return {
      total: keys.length,
      version: this.store.version,
      lastCleanup: new Date(this.store.lastCleanup).toISOString(),
      oldestConfig: keys.length > 0
        ? new Date(Math.min(...keys.map(k => configs[k].updatedAt))).toISOString() : null,
      newestConfig: keys.length > 0
        ? new Date(Math.max(...keys.map(k => configs[k].updatedAt))).toISOString() : null
    }
  }
}

// 创建单例
const tableConfigStore = new TableConfigStore()

export default tableConfigStore
