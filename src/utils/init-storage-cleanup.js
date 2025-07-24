/**
 * 存储清理初始化脚本
 * 功能描述：在应用启动时自动检查并清理重复的表格列配置存储
 * 创建日期：2024-12-19
 */

import { cleanupDuplicateColumnConfigs, checkStorageStatus } from './cleanup-duplicate-storage'

/**
 * 初始化存储清理
 * 在应用启动时自动执行，确保存储数据的一致性
 */
export function initStorageCleanup() {
  try {
    console.log('🔍 检查表格列配置存储状态...')
    
    // 检查当前存储状态
    const status = checkStorageStatus()
    
    // 判断是否需要清理
    const needsCleanup = status.duplicateKeys.length > 0 || status.centralStoreDuplicates.length > 0
    
    if (needsCleanup) {
      console.log('⚠️ 发现重复的存储数据，开始自动清理...')
      console.log(`- 独立存储重复键: ${status.duplicateKeys.length} 个`)
      console.log(`- 集中存储重复键: ${status.centralStoreDuplicates.length} 个`)
      
      // 执行清理
      const result = cleanupDuplicateColumnConfigs()
      
      console.log('✅ 存储清理完成！')
      console.log(`- 清理独立存储键: ${result.removedCount} 个`)
      console.log(`- 清理集中存储重复键: ${result.centralStoreCleanedCount} 个`)
      
      return {
        cleaned: true,
        ...result
      }
    } else {
      console.log('✅ 存储状态正常，无需清理')
      return {
        cleaned: false,
        message: '存储状态正常'
      }
    }
  } catch (error) {
    console.error('❌ 存储清理初始化失败:', error)
    return {
      cleaned: false,
      error: error.message
    }
  }
}

/**
 * 延迟初始化存储清理
 * 在DOM加载完成后执行，避免阻塞应用启动
 */
export function initStorageCleanupAsync() {
  // 使用setTimeout确保在应用完全加载后执行
  setTimeout(() => {
    initStorageCleanup()
  }, 1000)
}

// 默认导出异步初始化函数
export default initStorageCleanupAsync