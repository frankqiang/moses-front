/**
 * BatchDeleteConfirm 组件类型定义和常量
 * 创建日期：2024-01-10
 */

// 组件事件类型常量
export const EVENTS = {
  DELETE_SUCCESS: 'delete-success',
  DELETE_ERROR: 'delete-error',
  DELETE_CANCEL: 'delete-cancel',
  CONFLICT_DETECTED: 'conflict-detected'
}

// 对话框状态常量
export const DIALOG_STATES = {
  HIDDEN: 'hidden',
  CONFIRM: 'confirm',
  CONFLICT: 'conflict'
}

// 操作状态常量
export const OPERATION_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
}

// 默认配置
export const DEFAULT_CONFIG = {
  // 默认显示字段配置
  displayFields: {
    id: 'id',
    code: 'code',
    name: 'name'
  },

  // 默认对话框配置
  dialog: {
    confirmWidth: '600px',
    conflictWidth: '800px',
    closeOnClickModal: false,
    closeOnPressEscape: true,
    appendToBody: true
  },

  // 默认文本配置
  text: {
    title: '批量删除确认',
    actionName: '删除',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    conflictTitle: '删除冲突',
    conflictConfirmText: '仅删除可删除的项目',
    conflictCancelText: '我知道了'
  },

  // 预览配置
  preview: {
    maxItems: 5, // 最多显示的项目数量
    showRemaining: true // 是否显示"等N项"
  }
}

// 错误类型定义
export const ERROR_TYPES = {
  // API调用错误
  API_ERROR: 'ApiError',

  // 网络错误
  NETWORK_ERROR: 'NetworkError',

  // 验证错误
  VALIDATION_ERROR: 'ValidationError',

  // 冲突检测错误
  CONFLICT_DETECTION_ERROR: 'ConflictDetectionError',

  // 组件状态错误
  COMPONENT_STATE_ERROR: 'ComponentStateError'
}

// 创建错误对象的工厂函数
export function createError(type, message, details = null) {
  const error = new Error(message)
  error.type = type
  error.details = details
  error.timestamp = new Date().toISOString()
  return error
}

// 验证函数
export const validators = {
  // 验证删除API函数
  validateDeleteApi(deleteApi) {
    if (typeof deleteApi !== 'function') {
      throw createError(
        ERROR_TYPES.VALIDATION_ERROR,
        'deleteApi must be a function'
      )
    }
  },

  // 验证冲突检测函数
  validateConflictDetector(conflictDetector) {
    if (conflictDetector !== null && typeof conflictDetector !== 'function') {
      throw createError(
        ERROR_TYPES.VALIDATION_ERROR,
        'conflictDetector must be a function or null'
      )
    }
  },

  // 验证显示字段配置
  validateDisplayFields(displayFields) {
    const requiredFields = ['id', 'code', 'name']
    const missingFields = requiredFields.filter(field => !displayFields[field])

    if (missingFields.length > 0) {
      throw createError(
        ERROR_TYPES.VALIDATION_ERROR,
        `Missing required displayFields: ${missingFields.join(', ')}`
      )
    }
  },

  // 验证待删除项目数组
  validateItems(items) {
    if (!Array.isArray(items)) {
      throw createError(
        ERROR_TYPES.VALIDATION_ERROR,
        'items must be an array'
      )
    }

    if (items.length === 0) {
      throw createError(
        ERROR_TYPES.VALIDATION_ERROR,
        'items array cannot be empty'
      )
    }
  },

  // 验证删除API返回结果
  validateDeleteApiResult(result) {
    if (!result || typeof result !== 'object') {
      throw createError(
        ERROR_TYPES.API_ERROR,
        'deleteApi must return an object'
      )
    }

    if (typeof result.success !== 'boolean') {
      throw createError(
        ERROR_TYPES.API_ERROR,
        'deleteApi result must include success boolean field'
      )
    }
  },

  // 验证冲突检测结果
  validateConflictResult(result) {
    if (!result || typeof result !== 'object') {
      throw createError(
        ERROR_TYPES.CONFLICT_DETECTION_ERROR,
        'conflictDetector must return an object'
      )
    }

    if (typeof result.hasConflicts !== 'boolean') {
      throw createError(
        ERROR_TYPES.CONFLICT_DETECTION_ERROR,
        'conflictDetector result must include hasConflicts boolean field'
      )
    }

    if (result.hasConflicts) {
      if (!Array.isArray(result.conflicts)) {
        throw createError(
          ERROR_TYPES.CONFLICT_DETECTION_ERROR,
          'conflictDetector result must include conflicts array when hasConflicts is true'
        )
      }

      if (!Array.isArray(result.canDelete)) {
        throw createError(
          ERROR_TYPES.CONFLICT_DETECTION_ERROR,
          'conflictDetector result must include canDelete array when hasConflicts is true'
        )
      }
    }
  }
}

// 工具函数
export const utils = {
  // 格式化项目显示文本
  formatItemDisplay(item, displayFields) {
    const code = item[displayFields.code] || 'N/A'
    const name = item[displayFields.name] || 'N/A'
    return `${code} - ${name}`
  },

  // 格式化多个项目的显示文本
  formatItemsDisplay(items, displayFields, maxItems = 3) {
    if (!items || items.length === 0) return ''

    const displayItems = items.slice(0, maxItems)
      .map(item => this.formatItemDisplay(item, displayFields))
      .join('、')

    const remaining = items.length - maxItems
    return remaining > 0 ? `${displayItems} 等${items.length}项` : displayItems
  },

  // 提取项目ID列表
  extractIds(items, displayFields) {
    return items.map(item => item[displayFields.id])
  },

  // 深度克隆对象
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item))

    const cloned = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }
    return cloned
  },

  // 防抖函数
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
}

// 导出所有常量和工具函数
export default {
  EVENTS,
  DIALOG_STATES,
  OPERATION_STATES,
  DEFAULT_CONFIG,
  ERROR_TYPES,
  createError,
  validators,
  utils
}
