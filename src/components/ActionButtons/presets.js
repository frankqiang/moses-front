/**
 * 操作按钮预设配置 - 现代化升级版
 * 提供常用的按钮配置，方便在不同页面复用
 * 支持现代化UI设计、无障碍访问和性能优化
 */

// 常用按钮图标对象 - 使用语义化命名
export const ButtonIcons = {
  // 基础操作
  EDIT: 'el-icon-edit',
  DELETE: 'el-icon-delete',
  VIEW: 'el-icon-view',
  ADD: 'el-icon-plus',
  SAVE: 'el-icon-check',
  CANCEL: 'el-icon-close',

  // 文件操作
  DOWNLOAD: 'el-icon-download',
  UPLOAD: 'el-icon-upload2',
  EXPORT: 'el-icon-download',
  IMPORT: 'el-icon-upload',

  // 系统操作
  REFRESH: 'el-icon-refresh',
  CONFIG: 'el-icon-setting',
  SEARCH: 'el-icon-search',
  PRINT: 'el-icon-printer',
  COPY: 'el-icon-copy-document',

  // 状态操作
  ENABLE: 'el-icon-check',
  DISABLE: 'el-icon-close',
  START: 'el-icon-video-play',
  STOP: 'el-icon-video-pause',

  // 审批操作
  APPROVE: 'el-icon-success',
  REJECT: 'el-icon-error',
  REVIEW: 'el-icon-view',

  // 导航操作
  BACK: 'el-icon-back',
  FORWARD: 'el-icon-right',
  MORE: 'el-icon-more',

  // 通信操作
  SEND: 'el-icon-s-promotion',
  NOTIFY: 'el-icon-bell',
  MESSAGE: 'el-icon-message'
}

// 现代化按钮类型定义
export const ButtonTypes = {
  PRIMARY: 'primary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info',
  TEXT: 'text',
  DEFAULT: 'default'
}

// 现代化主题色彩
export const ButtonThemes = {
  PRIMARY: { type: 'primary', class: 'theme-primary' },
  SUCCESS: { type: 'success', class: 'theme-success' },
  WARNING: { type: 'warning', class: 'theme-warning' },
  DANGER: { type: 'danger', class: 'theme-danger' },
  INFO: { type: 'info', class: 'theme-info' }
}

// 通用操作按钮预设 - 现代化升级
export const CommonButtons = {
  // 查看详情按钮
  VIEW: {
    text: '查看',
    action: 'view',
    icon: ButtonIcons.VIEW,
    type: ButtonTypes.TEXT,
    tooltip: '查看详情',
    ariaLabel: '查看详情',
    showLoading: false,
    debounce: true
  },

  // 编辑按钮 - 支持权限和条件
  EDIT: {
    text: '编辑',
    action: 'edit',
    icon: ButtonIcons.EDIT,
    type: ButtonTypes.TEXT,
    tooltip: '编辑数据',
    ariaLabel: '编辑数据',
    showLoading: true,
    debounce: true,
    condition: row => row && !row.readonly
  },

  // 删除按钮 - 危险操作
  DELETE: {
    text: '删除',
    action: 'delete',
    icon: ButtonIcons.DELETE,
    type: ButtonTypes.TEXT,
    tooltip: '删除数据（不可恢复）',
    ariaLabel: '删除数据',
    class: 'danger-button',
    showLoading: true,
    debounce: true,
    condition: row => row && !row.permanent
  },

  // 启用按钮 - 智能状态显示
  ENABLE: {
    text: '启用',
    action: 'enable',
    icon: ButtonIcons.ENABLE,
    type: ButtonTypes.TEXT,
    tooltip: '启用功能',
    ariaLabel: '启用功能',
    class: 'success-button',
    showLoading: true,
    debounce: true,
    condition: row => row && (!row.status || row.status === 0 || row.status === 'disabled')
  },

  // 禁用按钮 - 智能状态显示
  DISABLE: {
    text: '禁用',
    action: 'disable',
    icon: ButtonIcons.DISABLE,
    type: ButtonTypes.TEXT,
    tooltip: '禁用功能',
    ariaLabel: '禁用功能',
    class: 'warning-button',
    showLoading: true,
    debounce: true,
    condition: row => row && (row.status === 1 || row.status === 'enabled')
  },

  // 导出按钮 - 文件操作
  EXPORT: {
    text: '导出',
    action: 'export',
    icon: ButtonIcons.EXPORT,
    type: ButtonTypes.TEXT,
    tooltip: '导出数据到文件',
    ariaLabel: '导出数据',
    showLoading: true,
    debounce: true
  },

  // 导入按钮
  IMPORT: {
    text: '导入',
    action: 'import',
    icon: ButtonIcons.IMPORT,
    type: ButtonTypes.TEXT,
    tooltip: '从文件导入数据',
    ariaLabel: '导入数据',
    showLoading: true,
    debounce: true
  },

  // 下载按钮
  DOWNLOAD: {
    text: '下载',
    action: 'download',
    icon: ButtonIcons.DOWNLOAD,
    type: ButtonTypes.TEXT,
    tooltip: '下载文件',
    ariaLabel: '下载文件',
    showLoading: true,
    debounce: true
  },

  // 上传按钮
  UPLOAD: {
    text: '上传',
    action: 'upload',
    icon: ButtonIcons.UPLOAD,
    type: ButtonTypes.TEXT,
    tooltip: '上传文件',
    ariaLabel: '上传文件',
    showLoading: true,
    debounce: true
  },

  // 打印按钮
  PRINT: {
    text: '打印',
    action: 'print',
    icon: ButtonIcons.PRINT,
    type: ButtonTypes.TEXT,
    tooltip: '打印当前页面',
    ariaLabel: '打印页面',
    showLoading: false,
    debounce: true
  },

  // 复制按钮
  COPY: {
    text: '复制',
    action: 'copy',
    icon: ButtonIcons.COPY,
    type: ButtonTypes.TEXT,
    tooltip: '复制数据',
    ariaLabel: '复制数据',
    showLoading: false,
    debounce: true
  },

  // 刷新按钮
  REFRESH: {
    text: '刷新',
    action: 'refresh',
    icon: ButtonIcons.REFRESH,
    type: ButtonTypes.TEXT,
    tooltip: '刷新数据',
    ariaLabel: '刷新数据',
    showLoading: true,
    debounce: true
  }
}

// 复合按钮配置 - 包含子菜单
export const CompoundButtons = {
  // 更多操作按钮
  MORE_ACTIONS: {
    text: '更多操作',
    action: 'more',
    icon: ButtonIcons.MORE,
    type: ButtonTypes.TEXT,
    tooltip: '更多操作选项',
    ariaLabel: '更多操作菜单',
    children: [
      {
        text: '复制',
        action: 'copy',
        icon: ButtonIcons.COPY,
        ariaLabel: '复制数据'
      },
      {
        text: '导出',
        action: 'export',
        icon: ButtonIcons.EXPORT,
        ariaLabel: '导出数据'
      },
      {
        text: '打印',
        action: 'print',
        icon: ButtonIcons.PRINT,
        ariaLabel: '打印数据',
        divided: true
      }
    ]
  },

  // 审批操作按钮
  APPROVAL_ACTIONS: {
    text: '审批操作',
    action: 'approval',
    icon: ButtonIcons.REVIEW,
    type: ButtonTypes.TEXT,
    tooltip: '审批相关操作',
    ariaLabel: '审批操作菜单',
    children: [
      {
        text: '批准',
        action: 'approve',
        icon: ButtonIcons.APPROVE,
        ariaLabel: '批准申请'
      },
      {
        text: '驳回',
        action: 'reject',
        icon: ButtonIcons.REJECT,
        ariaLabel: '驳回申请'
      },
      {
        text: '转审',
        action: 'transfer',
        icon: ButtonIcons.SEND,
        ariaLabel: '转审申请',
        divided: true
      }
    ]
  }
}

/**
 * 生成现代化表格操作按钮配置
 * @param {Object} options 配置选项
 * @returns {Array} 按钮配置数组
 */
export function generateTableButtons(options = {}) {
  const {
    // 基础按钮控制
    showView = true,
    showEdit = true,
    showDelete = true,
    showEnable = false,
    showDisable = false,
    showMore = false,

    // 扩展按钮
    showCopy = false,
    showDownload = false,
    showPrint = false,

    // 自定义按钮
    customButtons = [],
    moreButtons = [],

    // 全局禁用控制
    disabled = false,

    // 单独禁用控制
    viewDisabled = false,
    editDisabled = false,
    deleteDisabled = false,
    enableDisabled = false,
    disableDisabled = false,

    // 现代化配置
    theme = 'default',
    size = 'mini',
    showTooltip = true,
    debounceDelay = 300,

    // 权限配置
    permissions = {},

    // 条件配置
    conditions = {}
  } = options

  const buttons = []

  // 查看按钮
  if (showView) {
    buttons.push({
      ...CommonButtons.VIEW,
      disabled: disabled || viewDisabled,
      size,
      permission: permissions.view,
      condition: conditions.view,
      showTooltip
    })
  }

  // 编辑按钮
  if (showEdit) {
    buttons.push({
      ...CommonButtons.EDIT,
      disabled: disabled || editDisabled,
      size,
      permission: permissions.edit,
      condition: conditions.edit || CommonButtons.EDIT.condition,
      showTooltip
    })
  }

  // 删除按钮
  if (showDelete) {
    buttons.push({
      ...CommonButtons.DELETE,
      disabled: disabled || deleteDisabled,
      size,
      permission: permissions.delete,
      condition: conditions.delete || CommonButtons.DELETE.condition,
      showTooltip
    })
  }

  // 启用按钮
  if (showEnable) {
    buttons.push({
      ...CommonButtons.ENABLE,
      disabled: disabled || enableDisabled,
      size,
      permission: permissions.enable,
      condition: conditions.enable || CommonButtons.ENABLE.condition,
      showTooltip
    })
  }

  // 禁用按钮
  if (showDisable) {
    buttons.push({
      ...CommonButtons.DISABLE,
      disabled: disabled || disableDisabled,
      size,
      permission: permissions.disable,
      condition: conditions.disable || CommonButtons.DISABLE.condition,
      showTooltip
    })
  }

  // 复制按钮
  if (showCopy) {
    buttons.push({
      ...CommonButtons.COPY,
      disabled,
      size,
      showTooltip
    })
  }

  // 下载按钮
  if (showDownload) {
    buttons.push({
      ...CommonButtons.DOWNLOAD,
      disabled,
      size,
      showTooltip
    })
  }

  // 打印按钮
  if (showPrint) {
    buttons.push({
      ...CommonButtons.PRINT,
      disabled,
      size,
      showTooltip
    })
  }

  // 自定义按钮
  if (customButtons.length > 0) {
    buttons.push(...customButtons.map(btn => ({
      ...btn,
      size: btn.size || size,
      disabled: btn.disabled || disabled,
      showTooltip: btn.showTooltip !== undefined ? btn.showTooltip : showTooltip
    })))
  }

  // 更多按钮
  if (showMore && moreButtons.length > 0) {
    buttons.push(...moreButtons.map(btn => ({
      ...btn,
      size: btn.size || size,
      disabled: btn.disabled || disabled,
      showTooltip: btn.showTooltip !== undefined ? btn.showTooltip : showTooltip
    })))
  }

  return buttons
}

/**
 * 生成现代化表单操作按钮
 * @param {Object} options 配置选项
 * @returns {Array} 按钮配置数组
 */
export function generateFormButtons(options = {}) {
  const {
    // 基础按钮控制
    showSubmit = true,
    showCancel = true,
    showReset = false,
    showSave = false,

    // 按钮文本自定义
    submitText = '提交',
    cancelText = '取消',
    resetText = '重置',
    saveText = '保存',

    // 禁用控制
    disabled = false,
    submitDisabled = false,
    cancelDisabled = false,
    resetDisabled = false,
    saveDisabled = false,

    // 现代化配置
    theme = 'primary',
    size = 'medium',
    showTooltip = true,

    // 表单验证状态
    isValid = true,
    isLoading = false,
    isDirty = false
  } = options

  const buttons = []

  // 提交按钮 - 主要操作
  if (showSubmit) {
    buttons.push({
      text: submitText,
      action: 'submit',
      icon: ButtonIcons.SAVE,
      type: theme === 'primary' ? ButtonTypes.PRIMARY : theme,
      disabled: disabled || submitDisabled || !isValid,
      loading: isLoading,
      size,
      tooltip: showTooltip ? `${submitText}表单数据` : '',
      ariaLabel: `${submitText}表单`,
      showLoading: true,
      debounce: true
    })
  }

  // 保存按钮 - 草稿保存
  if (showSave) {
    buttons.push({
      text: saveText,
      action: 'save',
      icon: ButtonIcons.SAVE,
      type: ButtonTypes.SUCCESS,
      disabled: disabled || saveDisabled || !isDirty,
      size,
      tooltip: showTooltip ? '保存为草稿' : '',
      ariaLabel: '保存草稿',
      showLoading: true,
      debounce: true
    })
  }

  // 取消按钮 - 次要操作
  if (showCancel) {
    buttons.push({
      text: cancelText,
      action: 'cancel',
      icon: ButtonIcons.CANCEL,
      type: ButtonTypes.DEFAULT,
      disabled: disabled || cancelDisabled,
      size,
      tooltip: showTooltip ? '取消当前操作' : '',
      ariaLabel: '取消操作',
      showLoading: false,
      debounce: false
    })
  }

  // 重置按钮 - 危险操作
  if (showReset) {
    buttons.push({
      text: resetText,
      action: 'reset',
      icon: ButtonIcons.REFRESH,
      type: ButtonTypes.INFO,
      disabled: disabled || resetDisabled || !isDirty,
      size,
      tooltip: showTooltip ? '重置表单到初始状态' : '',
      ariaLabel: '重置表单',
      showLoading: false,
      debounce: true,
      class: 'warning-button'
    })
  }

  return buttons
}

/**
 * 生成现代化审批操作按钮
 * @param {Object} options 配置选项
 * @returns {Array} 按钮配置数组
 */
export function generateApprovalButtons(options = {}) {
  const {
    // 基础按钮控制
    showApprove = true,
    showReject = true,
    showTransfer = false,
    showWithdraw = false,

    // 按钮文本自定义
    approveText = '批准',
    rejectText = '驳回',
    transferText = '转审',
    withdrawText = '撤回',

    // 禁用控制
    disabled = false,
    approveDisabled = false,
    rejectDisabled = false,
    transferDisabled = false,
    withdrawDisabled = false,

    // 现代化配置
    size = 'medium',
    showTooltip = true,

    // 审批状态
    status = 'pending',
    canApprove = true,
    canReject = true,
    canTransfer = true,
    canWithdraw = false
  } = options

  const buttons = []

  // 批准按钮
  if (showApprove && canApprove) {
    buttons.push({
      text: approveText,
      action: 'approve',
      icon: ButtonIcons.APPROVE,
      type: ButtonTypes.SUCCESS,
      disabled: disabled || approveDisabled,
      size,
      tooltip: showTooltip ? '批准当前申请' : '',
      ariaLabel: '批准申请',
      showLoading: true,
      debounce: true,
      condition: row => row && row.status === 'pending'
    })
  }

  // 驳回按钮
  if (showReject && canReject) {
    buttons.push({
      text: rejectText,
      action: 'reject',
      icon: ButtonIcons.REJECT,
      type: ButtonTypes.DANGER,
      disabled: disabled || rejectDisabled,
      size,
      tooltip: showTooltip ? '驳回当前申请' : '',
      ariaLabel: '驳回申请',
      showLoading: true,
      debounce: true,
      condition: row => row && row.status === 'pending'
    })
  }

  // 转审按钮
  if (showTransfer && canTransfer) {
    buttons.push({
      text: transferText,
      action: 'transfer',
      icon: ButtonIcons.SEND,
      type: ButtonTypes.INFO,
      disabled: disabled || transferDisabled,
      size,
      tooltip: showTooltip ? '转交其他人审批' : '',
      ariaLabel: '转审申请',
      showLoading: true,
      debounce: true,
      condition: row => row && row.status === 'pending'
    })
  }

  // 撤回按钮
  if (showWithdraw && canWithdraw) {
    buttons.push({
      text: withdrawText,
      action: 'withdraw',
      icon: ButtonIcons.BACK,
      type: ButtonTypes.WARNING,
      disabled: disabled || withdrawDisabled,
      size,
      tooltip: showTooltip ? '撤回申请' : '',
      ariaLabel: '撤回申请',
      showLoading: true,
      debounce: true,
      condition: row => row && (row.status === 'pending' || row.status === 'reviewing')
    })
  }

  return buttons
}

/**
 * 生成批量操作按钮
 * @param {Object} options 配置选项
 * @returns {Array} 按钮配置数组
 */
export function generateBatchButtons(options = {}) {
  const {
    showBatchDelete = true,
    showBatchExport = true,
    showBatchEnable = false,
    showBatchDisable = false,
    selectedCount = 0,
    maxBatchSize = 1000,
    disabled = false,
    size = 'medium',
    showTooltip = true
  } = options

  const buttons = []
  const hasSelection = selectedCount > 0
  const exceedsLimit = selectedCount > maxBatchSize

  // 批量删除
  if (showBatchDelete) {
    buttons.push({
      text: `批量删除(${selectedCount})`,
      action: 'batch-delete',
      icon: ButtonIcons.DELETE,
      type: ButtonTypes.DANGER,
      disabled: disabled || !hasSelection || exceedsLimit,
      size,
      tooltip: showTooltip ? `删除选中的${selectedCount}项` : '',
      ariaLabel: `批量删除${selectedCount}项`,
      showLoading: true,
      debounce: true,
      class: 'danger-button'
    })
  }

  // 批量导出
  if (showBatchExport) {
    buttons.push({
      text: `批量导出(${selectedCount})`,
      action: 'batch-export',
      icon: ButtonIcons.EXPORT,
      type: ButtonTypes.PRIMARY,
      disabled: disabled || !hasSelection || exceedsLimit,
      size,
      tooltip: showTooltip ? `导出选中的${selectedCount}项` : '',
      ariaLabel: `批量导出${selectedCount}项`,
      showLoading: true,
      debounce: true
    })
  }

  // 批量启用
  if (showBatchEnable) {
    buttons.push({
      text: `批量启用(${selectedCount})`,
      action: 'batch-enable',
      icon: ButtonIcons.ENABLE,
      type: ButtonTypes.SUCCESS,
      disabled: disabled || !hasSelection || exceedsLimit,
      size,
      tooltip: showTooltip ? `启用选中的${selectedCount}项` : '',
      ariaLabel: `批量启用${selectedCount}项`,
      showLoading: true,
      debounce: true,
      class: 'success-button'
    })
  }

  // 批量禁用
  if (showBatchDisable) {
    buttons.push({
      text: `批量禁用(${selectedCount})`,
      action: 'batch-disable',
      icon: ButtonIcons.DISABLE,
      type: ButtonTypes.WARNING,
      disabled: disabled || !hasSelection || exceedsLimit,
      size,
      tooltip: showTooltip ? `禁用选中的${selectedCount}项` : '',
      ariaLabel: `批量禁用${selectedCount}项`,
      showLoading: true,
      debounce: true,
      class: 'warning-button'
    })
  }

  return buttons
}

// 导出预设配置工厂函数
export default {
  // 基础配置
  ButtonIcons,
  ButtonTypes,
  ButtonThemes,
  CommonButtons,
  CompoundButtons,

  // 生成器函数
  generateTableButtons,
  generateFormButtons,
  generateApprovalButtons,
  generateBatchButtons
}
