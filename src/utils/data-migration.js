/**
 * 文件名称：data-migration.js
 * 文件描述：数据迁移工具，将旧的vue_admin_template和vue_admin前缀数据迁移到moses前缀
 * 创建日期：2025-01-29
 * 修改记录：
 *   - 2025-01-29: 创建文件，实现localStorage数据迁移功能
 */

import authStorageManager from './auth-storage'
import tableConfigStore from './table-config-store'

/**
 * 数据迁移管理器
 * 负责将旧的localStorage键名迁移到新的moses前缀
 */
class DataMigrationManager {
  constructor() {
    this.migrationLog = []
    this.oldPrefixes = [
      'vue_admin_template_',
      'vue_admin_'
    ]

    // 需要特殊处理的键名映射
    this.keyMappings = {
      // 认证相关
      'vue_admin_template_token': 'moses_token',
      'vue_admin_template_remember_me': 'moses_remember_me',
      'vue_admin_template_remembered_user': 'moses_remembered_user',
      'vue_admin_token': 'moses_token',
      'vue_admin_remember_me': 'moses_remember_me',
      'vue_admin_remembered_user': 'moses_remembered_user',

      // 表格配置相关
      'vue_admin_table_configs': 'moses_table_configs',
      'vue_admin_template_table_configs': 'moses_table_configs',

      // 其他可能的键
      'refresh_token': 'moses_refresh_token',
      'login_failed_count': 'moses_login_failed_count',
      'account_locked_until': 'moses_account_locked_until'
    }
  }

  /**
   * 执行完整的数据迁移
   * @returns {Object} 迁移结果统计
   */
  async performMigration() {
    console.log('开始执行数据迁移...')

    const stats = {
      totalKeys: 0,
      migratedKeys: 0,
      skippedKeys: 0,
      errorKeys: 0,
      details: []
    }

    try {
      // 1. 获取所有localStorage键
      const allKeys = this.getAllLocalStorageKeys()
      stats.totalKeys = allKeys.length

      console.log(`发现 ${allKeys.length} 个localStorage键`)

      // 2. 筛选需要迁移的键
      const keysToMigrate = this.filterKeysToMigrate(allKeys)
      console.log(`需要迁移 ${keysToMigrate.length} 个键`)

      // 3. 执行迁移
      for (const oldKey of keysToMigrate) {
        try {
          const result = await this.migrateKey(oldKey)
          if (result.success) {
            stats.migratedKeys++
            stats.details.push({
              oldKey,
              newKey: result.newKey,
              status: 'migrated'
            })
          } else {
            stats.skippedKeys++
            stats.details.push({
              oldKey,
              reason: result.reason,
              status: 'skipped'
            })
          }
        } catch (error) {
          stats.errorKeys++
          stats.details.push({
            oldKey,
            error: error.message,
            status: 'error'
          })
          console.error(`迁移键 ${oldKey} 时出错:`, error)
        }
      }

      // 4. 触发各模块的内部迁移逻辑
      await this.triggerModuleMigrations()

      console.log('数据迁移完成', stats)
      this.logMigrationResults(stats)

      return stats
    } catch (error) {
      console.error('数据迁移过程中发生错误:', error)
      throw error
    }
  }

  /**
   * 获取所有localStorage键
   * @returns {Array} 所有键的数组
   */
  getAllLocalStorageKeys() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        keys.push(key)
      }
    }
    return keys
  }

  /**
   * 筛选需要迁移的键
   * @param {Array} allKeys - 所有键的数组
   * @returns {Array} 需要迁移的键数组
   */
  filterKeysToMigrate(allKeys) {
    return allKeys.filter(key => {
      // 检查是否以旧前缀开头
      const hasOldPrefix = this.oldPrefixes.some(prefix => key.startsWith(prefix))

      // 检查是否在特殊映射中
      const hasSpecialMapping = Object.prototype.hasOwnProperty.call(this.keyMappings, key)

      // 检查是否已经是moses前缀（避免重复迁移）
      const isMosesKey = key.startsWith('moses_')

      return (hasOldPrefix || hasSpecialMapping) && !isMosesKey
    })
  }

  /**
   * 迁移单个键
   * @param {string} oldKey - 旧键名
   * @returns {Object} 迁移结果
   */
  async migrateKey(oldKey) {
    try {
      const oldValue = localStorage.getItem(oldKey)
      if (!oldValue) {
        return {
          success: false,
          reason: '键值为空'
        }
      }

      // 确定新键名
      let newKey
      if (this.keyMappings[oldKey]) {
        newKey = this.keyMappings[oldKey]
      } else {
        // 替换前缀
        newKey = this.replacePrefix(oldKey)
      }

      // 检查新键是否已存在
      const existingValue = localStorage.getItem(newKey)
      if (existingValue) {
        console.warn(`新键 ${newKey} 已存在，跳过迁移`)
        return {
          success: false,
          reason: '目标键已存在'
        }
      }

      // 执行迁移
      localStorage.setItem(newKey, oldValue)
      localStorage.removeItem(oldKey)

      console.log(`成功迁移: ${oldKey} -> ${newKey}`)

      return {
        success: true,
        newKey
      }
    } catch (error) {
      console.error(`迁移键 ${oldKey} 失败:`, error)
      throw error
    }
  }

  /**
   * 替换键名前缀
   * @param {string} oldKey - 旧键名
   * @returns {string} 新键名
   */
  replacePrefix(oldKey) {
    for (const oldPrefix of this.oldPrefixes) {
      if (oldKey.startsWith(oldPrefix)) {
        return oldKey.replace(oldPrefix, 'moses_')
      }
    }

    // 如果没有匹配的前缀，直接添加moses前缀
    return `moses_${oldKey}`
  }

  /**
   * 触发各模块的内部迁移逻辑
   */
  async triggerModuleMigrations() {
    console.log('触发模块内部迁移...')

    try {
      // 触发认证存储管理器的迁移
      if (authStorageManager && typeof authStorageManager.init === 'function') {
        await authStorageManager.init()
        console.log('认证存储迁移完成')
      }

      // 触发表格配置存储的迁移
      if (tableConfigStore && typeof tableConfigStore.init === 'function') {
        await tableConfigStore.init()
        console.log('表格配置迁移完成')
      }
    } catch (error) {
      console.error('模块迁移过程中出错:', error)
    }
  }

  /**
   * 记录迁移结果
   * @param {Object} stats - 迁移统计信息
   */
  logMigrationResults(stats) {
    console.group('数据迁移结果')
    console.log(`总键数: ${stats.totalKeys}`)
    console.log(`成功迁移: ${stats.migratedKeys}`)
    console.log(`跳过: ${stats.skippedKeys}`)
    console.log(`错误: ${stats.errorKeys}`)

    if (stats.details.length > 0) {
      console.group('详细信息')
      stats.details.forEach(detail => {
        if (detail.status === 'migrated') {
          console.log(`✅ ${detail.oldKey} -> ${detail.newKey}`)
        } else if (detail.status === 'skipped') {
          console.log(`⏭️ ${detail.oldKey} (${detail.reason})`)
        } else if (detail.status === 'error') {
          console.error(`❌ ${detail.oldKey} (${detail.error})`)
        }
      })
      console.groupEnd()
    }

    console.groupEnd()
  }

  /**
   * 检查是否需要迁移
   * @returns {boolean} 是否需要迁移
   */
  needsMigration() {
    const allKeys = this.getAllLocalStorageKeys()
    const keysToMigrate = this.filterKeysToMigrate(allKeys)
    return keysToMigrate.length > 0
  }

  /**
   * 获取迁移预览
   * @returns {Array} 迁移预览信息
   */
  getMigrationPreview() {
    const allKeys = this.getAllLocalStorageKeys()
    const keysToMigrate = this.filterKeysToMigrate(allKeys)

    return keysToMigrate.map(oldKey => {
      let newKey
      if (this.keyMappings[oldKey]) {
        newKey = this.keyMappings[oldKey]
      } else {
        newKey = this.replacePrefix(oldKey)
      }

      return {
        oldKey,
        newKey,
        hasValue: !!localStorage.getItem(oldKey)
      }
    })
  }
}

// 创建单例实例
const dataMigrationManager = new DataMigrationManager()

// 导出实例和类
export default dataMigrationManager
export { DataMigrationManager }

// 在开发环境下暴露到全局对象，便于调试
if (process.env.NODE_ENV === 'development') {
  window.dataMigrationManager = dataMigrationManager
  window.performDataMigration = () => dataMigrationManager.performMigration()
  window.getMigrationPreview = () => dataMigrationManager.getMigrationPreview()
}
