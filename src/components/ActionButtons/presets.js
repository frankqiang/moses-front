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
 * @param {Object} options 配置选项
 * @returns {Array} 按钮配置数组
 */
export function generateTableButtons(options = {}) {
  const {
    showView = true,
    showEdit = true,
    showDelete = true,
    showEnable = false,
    showDisable = false,
    showMore = false,
    moreButtons = [],
    disabled = false,
    viewDisabled = false,
    editDisabled = false,
    deleteDisabled = false,
    enableDisabled = false,
    disableDisabled = false
  } = options

  const buttons = []

  // 查看按钮
  if (showView) {
    buttons.push({
      text: '查看',
      action: 'view',
      icon: 'el-icon-view',
      type: 'text',
      disabled: disabled || viewDisabled,
      tooltip: '查看详情'
    })
  }

  // 编辑按钮
  if (showEdit) {
    buttons.push({
      text: '编辑',
      action: 'edit',
      icon: 'el-icon-edit',
      type: 'text',
      disabled: disabled || editDisabled,
      tooltip: '编辑'
    })
  }

  // 删除按钮
  if (showDelete) {
    buttons.push({
      text: '删除',
      action: 'delete',
      icon: 'el-icon-delete',
      type: 'text',
      class: 'danger',
      disabled: disabled || deleteDisabled,
      tooltip: '删除'
    })
  }

  // 启用按钮
  if (showEnable) {
    buttons.push({
      text: '启用',
      action: 'enable',
      icon: 'el-icon-check',
      type: 'text',
      class: 'success',
      disabled: disabled || enableDisabled,
      tooltip: '启用'
    })
  }

  // 禁用按钮
  if (showDisable) {
    buttons.push({
      text: '禁用',
      action: 'disable',
      icon: 'el-icon-close',
      type: 'text',
      class: 'warning',
      disabled: disabled || disableDisabled,
      tooltip: '禁用'
    })
  }

  // 更多按钮
  if (showMore && moreButtons.length > 0) {
    buttons.push(...moreButtons)
  }

  return buttons
}

/**
 * 生成表单操作按钮
 * @param {Object} options 配置选项
 * @returns {Array} 按钮配置数组
 */
export function generateFormButtons(options = {}) {
  const {
    showSubmit = true,
    showCancel = true,
    showReset = false,
    submitText = '提交',
    cancelText = '取消',
    resetText = '重置',
    disabled = false,
    submitDisabled = false,
    cancelDisabled = false,
    resetDisabled = false
  } = options

  const buttons = []

  // 提交按钮
  if (showSubmit) {
    buttons.push({
      text: submitText,
      action: 'submit',
      icon: 'el-icon-check',
      type: 'primary',
      disabled: disabled || submitDisabled,
      tooltip: '提交表单'
    })
  }

  // 取消按钮
  if (showCancel) {
    buttons.push({
      text: cancelText,
      action: 'cancel',
      icon: 'el-icon-close',
      type: 'default',
      disabled: disabled || cancelDisabled,
      tooltip: '取消操作'
    })
  }

  // 重置按钮
  if (showReset) {
    buttons.push({
      text: resetText,
      action: 'reset',
      icon: 'el-icon-refresh',
      type: 'info',
      disabled: disabled || resetDisabled,
      tooltip: '重置表单'
    })
  }

  return buttons
}

/**
 * 生成审批操作按钮
 * @param {Object} options 配置选项
 * @returns {Array} 按钮配置数组
 */
export function generateApprovalButtons(options = {}) {
  const {
    showApprove = true,
    showReject = true,
    showCancel = true,
    approveText = '批准',
    rejectText = '驳回',
    cancelText = '取消',
    disabled = false,
    approveDisabled = false,
    rejectDisabled = false,
    cancelDisabled = false
  } = options

  const buttons = []

  // 批准按钮
  if (showApprove) {
    buttons.push({
      text: approveText,
      action: 'approve',
      icon: 'el-icon-check',
      type: 'success',
      disabled: disabled || approveDisabled,
      tooltip: '批准'
    })
  }

  // 驳回按钮
  if (showReject) {
    buttons.push({
      text: rejectText,
      action: 'reject',
      icon: 'el-icon-close',
      type: 'danger',
      disabled: disabled || rejectDisabled,
      tooltip: '驳回'
    })
  }

  // 取消按钮
  if (showCancel) {
    buttons.push({
      text: cancelText,
      action: 'cancel',
      icon: 'el-icon-back',
      type: 'info',
      disabled: disabled || cancelDisabled,
      tooltip: '取消审批'
    })
  }

  return buttons
}

export default {
  generateTableButtons,
  generateFormButtons,
  generateApprovalButtons
} 