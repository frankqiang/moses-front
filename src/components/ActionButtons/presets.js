/**
 * 操作按钮预设配置
 * 提供常用的按钮配置，方便在不同页面复用
 */

// 常用按钮图标对象
export const ButtonIcons = {
  EDIT: 'el-icon-edit',
  DELETE: 'el-icon-delete',
  VIEW: 'el-icon-view',
  DOWNLOAD: 'el-icon-download',
  UPLOAD: 'el-icon-upload2',
  REFRESH: 'el-icon-refresh',
  ADD: 'el-icon-plus',
  CONFIG: 'el-icon-setting',
  ENABLE: 'el-icon-check',
  DISABLE: 'el-icon-close',
  PRINT: 'el-icon-printer',
  EXPORT: 'el-icon-download',
  IMPORT: 'el-icon-upload',
  SEARCH: 'el-icon-search',
  MORE: 'el-icon-more'
}

// 常用按钮类型
export const ButtonTypes = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
  TEXT: 'text'
}

// 常用操作按钮预设
export const CommonButtons = {
  // 查看详情按钮
  VIEW: {
    text: '查看',
    action: 'view',
    icon: ButtonIcons.VIEW,
    type: ButtonTypes.TEXT,
    tooltip: '查看详情'
  },
  
  // 编辑按钮
  EDIT: {
    text: '编辑',
    action: 'edit',
    icon: ButtonIcons.EDIT,
    type: ButtonTypes.TEXT,
    tooltip: '编辑'
  },
  
  // 删除按钮
  DELETE: {
    text: '删除',
    action: 'delete',
    icon: ButtonIcons.DELETE,
    type: ButtonTypes.TEXT,
    tooltip: '删除',
    class: 'danger-button'
  },
  
  // 启用按钮
  ENABLE: {
    text: '启用',
    action: 'enable',
    icon: ButtonIcons.ENABLE,
    type: ButtonTypes.TEXT,
    tooltip: '启用',
    condition: row => !row.status || row.status === 0,
    class: 'success-button'
  },
  
  // 禁用按钮
  DISABLE: {
    text: '禁用',
    action: 'disable',
    icon: ButtonIcons.DISABLE,
    type: ButtonTypes.TEXT,
    tooltip: '禁用',
    condition: row => row.status === 1,
    class: 'warning-button'
  },
  
  // 导出按钮
  EXPORT: {
    text: '导出',
    action: 'export',
    icon: ButtonIcons.EXPORT,
    type: ButtonTypes.TEXT,
    tooltip: '导出数据'
  },
  
  // 导入按钮
  IMPORT: {
    text: '导入',
    action: 'import',
    icon: ButtonIcons.IMPORT,
    type: ButtonTypes.TEXT,
    tooltip: '导入数据'
  },
  
  // 下载按钮
  DOWNLOAD: {
    text: '下载',
    action: 'download',
    icon: ButtonIcons.DOWNLOAD,
    type: ButtonTypes.TEXT,
    tooltip: '下载'
  },
  
  // 上传按钮
  UPLOAD: {
    text: '上传',
    action: 'upload',
    icon: ButtonIcons.UPLOAD,
    type: ButtonTypes.TEXT,
    tooltip: '上传'
  },
  
  // 打印按钮
  PRINT: {
    text: '打印',
    action: 'print',
    icon: ButtonIcons.PRINT,
    type: ButtonTypes.TEXT,
    tooltip: '打印'
  }
}

/**
 * 生成表格操作按钮配置
 * @param {Array} actions 需要的操作类型数组，例如 ['edit', 'delete']
 * @param {Object} customButtons 自定义按钮配置对象
 * @returns {Array} 按钮配置数组
 */
export function generateTableButtons(actions = [], customButtons = {}) {
  // 反向映射操作类型到预设按钮
  const actionMap = {
    'view': CommonButtons.VIEW,
    'edit': CommonButtons.EDIT,
    'delete': CommonButtons.DELETE,
    'enable': CommonButtons.ENABLE,
    'disable': CommonButtons.DISABLE,
    'export': CommonButtons.EXPORT,
    'import': CommonButtons.IMPORT,
    'download': CommonButtons.DOWNLOAD,
    'upload': CommonButtons.UPLOAD,
    'print': CommonButtons.PRINT
  }
  
  // 合并自定义按钮
  const mergedMap = { ...actionMap, ...customButtons }
  
  // 根据actions数组生成按钮配置
  return actions.map(action => {
    if (typeof action === 'string') {
      return mergedMap[action] || null
    } else if (typeof action === 'object') {
      // 如果是对象，假设它是一个自定义按钮配置
      return action
    }
    return null
  }).filter(button => button !== null)
}

/**
 * 创建状态切换按钮
 * @param {Function} conditionFn 按钮显示条件函数
 * @returns {Array} 包含启用和禁用按钮的数组
 */
export function createStatusButtons(conditionFn) {
  if (!conditionFn) {
    conditionFn = row => true
  }
  
  return [
    {
      ...CommonButtons.ENABLE,
      condition: row => conditionFn(row) && (!row.status || row.status === 0 || row.status === false)
    },
    {
      ...CommonButtons.DISABLE,
      condition: row => conditionFn(row) && (row.status === 1 || row.status === true)
    }
  ]
} 