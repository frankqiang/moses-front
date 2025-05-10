/**
 * 状态标签类型配置
 * 提供预设的状态类型映射，方便在不同组件中复用
 */

// 通用启用/禁用状态映射
export const enabledStatusMap = {
  // 文本映射
  textMap: {
    0: '禁用',
    1: '启用',
    false: '禁用',
    true: '启用'
  },
  // 类型映射
  typeMap: {
    0: 'info',
    1: 'success',
    false: 'info',
    true: 'success'
  }
}

// 产品生命周期状态映射
export const productLifecycleMap = {
  // 文本映射
  textMap: {
    'trial': '试产',
    'production': '量产',
    'discontinued': '停产'
  },
  // 类型映射
  typeMap: {
    'trial': 'warning',
    'production': 'success',
    'discontinued': 'info'
  }
}

// 审核状态映射
export const auditStatusMap = {
  // 文本映射
  textMap: {
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  },
  // 类型映射
  typeMap: {
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
}

// 优先级映射
export const priorityMap = {
  // 文本映射
  textMap: {
    'high': '高',
    'medium': '中',
    'low': '低'
  },
  // 类型映射
  typeMap: {
    'high': 'danger',
    'medium': 'warning',
    'low': 'info'
  }
}

// 进度状态映射
export const progressStatusMap = {
  // 文本映射
  textMap: {
    'notStarted': '未开始',
    'inProgress': '进行中',
    'completed': '已完成'
  },
  // 类型映射
  typeMap: {
    'notStarted': 'info',
    'inProgress': 'warning',
    'completed': 'success'
  }
}

// 库存状态映射
export const inventoryStatusMap = {
  // 文本映射
  textMap: {
    'sufficient': '充足',
    'normal': '正常',
    'low': '偏低',
    'outOfStock': '缺货'
  },
  // 类型映射
  typeMap: {
    'sufficient': 'success',
    'normal': 'primary',
    'low': 'warning',
    'outOfStock': 'danger'
  }
} 