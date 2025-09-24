/**
 * 清理重复的表格列配置存储
 * 功能描述：移除旧的独立localStorage键，统一使用集中式存储，解决双重存储问题
 * 创建日期：2024-12-20
 * 修改记录：
 *   - 2024-12-19: 优化清理逻辑，集成table-config-store，解决columnSettingsMixin双重存储问题
 */

import tableConfigStore from './table-config-store'

/**
 * 清理重复的列配置存储
 * 移除独立的列配置键和集中存储中的重复数据，统一使用基于组件名的存储键
 */
export function cleanupDuplicateColumnConfigs() {
  console.log('开始清理重复的列配置存储...')

  const keysToRemove = []
  const migratedKeys = []
  let centralStoreCleanedCount = 0

  // 1. 清理独立的localStorage键
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)

    // 查找表格列配置相关的键（排除集中存储键）
    if (key && key !== 'vue_admin_table_configs' && (
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
          console.log(`发现独立列配置: ${key}`, columns)
          keysToRemove.push(key)
          migratedKeys.push({ key, columns })
        }
      } catch (error) {
        console.warn(`无法解析列配置 ${key}:`, error)
        keysToRemove.push(key) // 清理无效数据
      }
    }
  }

  // 2. 清理集中存储中的重复数据
  const allKeys = tableConfigStore.getAllKeys()

  // 定义已知的重复映射关系
  const duplicateMappings = {
    // 工序管理相关
    'table_columns_Operations': 'operation_columns_OperationTable',
    'table_columns_OperationManagement': 'operation_columns_OperationTable',

    // 工艺路线管理相关
    'table_columns_RoutingManagement': 'routing_columns_RoutingTable',
    'table_columns_Routing': 'routing_columns_RoutingTable',

    // 其他可能的重复项
    'table_columns_Equipment': 'equipment_columns_EquipmentTable',
    'table_columns_Material': 'material_columns_MaterialTable',
    'table_columns_Product': 'product_columns_ProductTable'
  }

  // 清理集中存储中的重复键
  Object.entries(duplicateMappings).forEach(([duplicateKey, primaryKey]) => {
    if (allKeys.includes(duplicateKey)) {
      if (allKeys.includes(primaryKey)) {
        // 主键存在，直接删除重复键
        tableConfigStore.removeColumnConfig(duplicateKey)
        centralStoreCleanedCount++
        console.log(`已删除集中存储中的重复键: ${duplicateKey} (主键 ${primaryKey} 已存在)`)
      } else {
        // 主键不存在，将重复键的数据迁移到主键
        const duplicateData = tableConfigStore.getColumnConfig(duplicateKey, [])
        if (duplicateData.length > 0) {
          tableConfigStore.saveColumnConfig(primaryKey, duplicateData)
          tableConfigStore.removeColumnConfig(duplicateKey)
          centralStoreCleanedCount++
          console.log(`已迁移集中存储键: ${duplicateKey} -> ${primaryKey}`)
        } else {
          tableConfigStore.removeColumnConfig(duplicateKey)
          centralStoreCleanedCount++
          console.log(`已删除集中存储中的空重复键: ${duplicateKey}`)
        }
      }
    }
  })

  // 3. 移除独立的localStorage键
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log(`已移除独立存储键: ${key}`)
  })

  console.log(`清理完成！移除了 ${keysToRemove.length} 个独立存储键，清理了 ${centralStoreCleanedCount} 个集中存储重复键`)

  return {
    removedCount: keysToRemove.length,
    centralStoreCleanedCount,
    migratedKeys,
    message: `已清理 ${keysToRemove.length} 个独立存储键和 ${centralStoreCleanedCount} 个集中存储重复键`
  }
}

/**
 * 检查当前存储状态
 */
export function checkStorageStatus() {
  const storageInfo = {
    centralStore: null,
    duplicateKeys: [],
    centralStoreDuplicates: [],
    totalSize: 0,
    stats: null
  }

  // 检查集中式存储
  const centralData = localStorage.getItem('vue_admin_table_configs')
  if (centralData) {
    try {
      storageInfo.centralStore = JSON.parse(centralData)
      storageInfo.totalSize += centralData.length
      storageInfo.stats = tableConfigStore.getStats()
    } catch (error) {
      console.error('集中式存储数据损坏:', error)
    }
  }

  // 检查独立存储的重复键
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

  // 检查集中存储中的重复数据
  const allKeys = tableConfigStore.getAllKeys()
  const duplicateMappings = {
    'table_columns_Operations': 'operation_columns_OperationTable',
    'table_columns_OperationManagement': 'operation_columns_OperationTable',
    'table_columns_RoutingManagement': 'routing_columns_RoutingTable',
    'table_columns_Routing': 'routing_columns_RoutingTable'
  }

  Object.entries(duplicateMappings).forEach(([duplicateKey, primaryKey]) => {
    if (allKeys.includes(duplicateKey)) {
      const duplicateData = tableConfigStore.getColumnConfig(duplicateKey, [])
      const primaryData = tableConfigStore.getColumnConfig(primaryKey, [])

      storageInfo.centralStoreDuplicates.push({
        duplicateKey,
        primaryKey,
        hasPrimary: allKeys.includes(primaryKey),
        dataEqual: JSON.stringify(duplicateData) === JSON.stringify(primaryData),
        duplicateData,
        primaryData
      })
    }
  })

  return storageInfo
}

/**
 * 一键清理函数（可在控制台调用）
 */
export function cleanupNow() {
  const status = checkStorageStatus()

  console.log('当前存储状态:', status)

  const needsCleanup = status.duplicateKeys.length > 0 || status.centralStoreDuplicates.length > 0

  if (needsCleanup) {
    const result = cleanupDuplicateColumnConfigs()
    console.log('清理结果:', result)

    // 清理后再次检查状态
    const afterStatus = checkStorageStatus()
    console.log('清理后状态:', afterStatus)

    return {
      ...result,
      beforeStatus: status,
      afterStatus
    }
  } else {
    console.log('没有发现重复的存储键')
    return { removedCount: 0, centralStoreCleanedCount: 0, message: '没有需要清理的数据' }
  }
}

/**
 * 验证存储键的唯一性
 */
export function validateStorageUniqueness() {
  const allKeys = tableConfigStore.getAllKeys()
  const duplicates = []

  // 检查是否存在重复的配置数据
  const configData = {}

  allKeys.forEach(key => {
    const data = tableConfigStore.getColumnConfig(key, [])
    const dataHash = JSON.stringify(data.sort())

    if (configData[dataHash]) {
      duplicates.push({
        keys: [configData[dataHash], key],
        data: data
      })
    } else {
      configData[dataHash] = key
    }
  })

  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    totalKeys: allKeys.length,
    uniqueConfigs: Object.keys(configData).length
  }
}

// 开发环境下挂载到window对象，方便调试
if (process.env.NODE_ENV === 'development') {
  window.cleanupDuplicateStorage = {
    checkStatus: checkStorageStatus,
    cleanup: cleanupNow,
    cleanupDuplicates: cleanupDuplicateColumnConfigs,
    validateUniqueness: validateStorageUniqueness,
    tableConfigStore // 暴露store实例用于调试
  }

  console.log('🧹 存储清理工具已挂载到 window.cleanupDuplicateStorage')
  console.log('使用方法:')
  console.log('- window.cleanupDuplicateStorage.checkStatus() // 检查存储状态')
  console.log('- window.cleanupDuplicateStorage.cleanup() // 一键清理')
  console.log('- window.cleanupDuplicateStorage.validateUniqueness() // 验证唯一性')
}

// 导出默认清理函数
export default cleanupDuplicateColumnConfigs
