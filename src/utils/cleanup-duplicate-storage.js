/**
 * 清理重复的表格列配置存储
 * 功能描述：移除旧的独立localStorage键，统一使用集中式存储
 * 创建日期：2024-12-20
 */

/**
 * 清理重复的列配置存储
 * 移除独立的列配置键，统一使用集中式存储 vue_admin_table_configs
 */
export function cleanupDuplicateColumnConfigs() {
  console.log('开始清理重复的列配置存储...')

  const keysToRemove = []
  const migratedKeys = []

  // 遍历所有localStorage键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    // 查找表格列配置相关的键
    if (key && (
      key.startsWith('operation_columns_') ||
      key.startsWith('equipment_columns_') ||
      key.startsWith('warehouse_columns_') ||
      key.startsWith('table_columns_') ||
      key.includes('_columns_')
    )) {
      const value = localStorage.getItem(key)

      try {
        // 尝试解析数据
        const columns = JSON.parse(value)

        if (Array.isArray(columns)) {
          console.log(`发现列配置: ${key}`, columns)
          keysToRemove.push(key)
          migratedKeys.push({ key, columns })
        }
      } catch (error) {
        console.warn(`无法解析列配置 ${key}:`, error)
        keysToRemove.push(key) // 清理无效数据
      }
    }
  }

  // 移除重复的键
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log(`已移除重复的存储键: ${key}`)
  })

  console.log(`清理完成！移除了 ${keysToRemove.length} 个重复的存储键`)

  return {
    removedCount: keysToRemove.length,
    migratedKeys,
    message: `已清理 ${keysToRemove.length} 个重复的列配置存储键`
  }
}

/**
 * 检查当前存储状态
 */
export function checkStorageStatus() {
  const storageInfo = {
    centralStore: null,
    duplicateKeys: [],
    totalSize: 0
  }

  // 检查集中式存储
  const centralData = localStorage.getItem('vue_admin_table_configs')
  if (centralData) {
    try {
      storageInfo.centralStore = JSON.parse(centralData)
      storageInfo.totalSize += centralData.length
    } catch (error) {
      console.error('集中式存储数据损坏:', error)
    }
  }

  // 检查重复的键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    if (key && key !== 'vue_admin_table_configs' && (
      key.startsWith('operation_columns_') ||
      key.startsWith('equipment_columns_') ||
      key.startsWith('warehouse_columns_') ||
      key.startsWith('table_columns_') ||
      key.includes('_columns_')
    )) {
      const value = localStorage.getItem(key)
      storageInfo.duplicateKeys.push({
        key,
        size: value ? value.length : 0,
        value: value
      })
      storageInfo.totalSize += (value ? value.length : 0)
    }
  }

  return storageInfo
}

/**
 * 一键清理函数（可在控制台调用）
 */
export function cleanupNow() {
  const status = checkStorageStatus()

  console.log('当前存储状态:', status)

  if (status.duplicateKeys.length > 0) {
    const result = cleanupDuplicateColumnConfigs()
    console.log('清理结果:', result)
    return result
  } else {
    console.log('没有发现重复的存储键')
    return { removedCount: 0, message: '没有需要清理的数据' }
  }
}

// 开发环境下挂载到window对象，方便调试
if (process.env.NODE_ENV === 'development') {
  window.cleanupDuplicateStorage = {
    checkStatus: checkStorageStatus,
    cleanup: cleanupNow,
    cleanupDuplicates: cleanupDuplicateColumnConfigs
  }

  console.log('🧹 存储清理工具已挂载到 window.cleanupDuplicateStorage')
  console.log('使用方法:')
  console.log('- window.cleanupDuplicateStorage.checkStatus() // 检查存储状态')
  console.log('- window.cleanupDuplicateStorage.cleanup() // 一键清理')
}
