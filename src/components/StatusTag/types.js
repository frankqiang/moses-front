/**
 * 状态标签类型配置
 * 提供预设的状态类型映射，方便在不同组件中复用
 * 创建日期：2023-11-20
 * 更新日期：2024-12-19
 */

// 通用启用/禁用状态映射
export const enabledStatusMap = {
  // 文本映射
  textMap: {
    0: '禁用',
    1: '启用',
    false: '禁用',
    true: '启用',
    'disabled': '禁用',
    'enabled': '启用'
  },
  // 类型映射
  typeMap: {
    0: 'info',
    1: 'success',
    false: 'info',
    true: 'success',
    'disabled': 'info',
    'enabled': 'success'
  },
  // 图标映射
  iconMap: {
    0: 'el-icon-circle-close',
    1: 'el-icon-circle-check',
    false: 'el-icon-circle-close',
    true: 'el-icon-circle-check',
    'disabled': 'el-icon-circle-close',
    'enabled': 'el-icon-circle-check'
  }
}

// 产品生命周期状态映射
export const productLifecycleMap = {
  // 文本映射
  textMap: {
    'draft': '草稿',
    'trial': '试产',
    'production': '量产',
    'discontinued': '停产',
    'obsolete': '淘汰'
  },
  // 类型映射
  typeMap: {
    'draft': 'info',
    'trial': 'warning',
    'production': 'success',
    'discontinued': 'info',
    'obsolete': 'danger'
  },
  // 图标映射
  iconMap: {
    'draft': 'el-icon-edit-outline',
    'trial': 'el-icon-warning-outline',
    'production': 'el-icon-check',
    'discontinued': 'el-icon-minus',
    'obsolete': 'el-icon-delete'
  }
}

// 审核状态映射
export const auditStatusMap = {
  // 文本映射
  textMap: {
    'pending': '待审核',
    'reviewing': '审核中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'cancelled': '已取消'
  },
  // 类型映射
  typeMap: {
    'pending': 'info',
    'reviewing': 'warning',
    'approved': 'success',
    'rejected': 'danger',
    'cancelled': 'info'
  },
  // 图标映射
  iconMap: {
    'pending': 'el-icon-time',
    'reviewing': 'el-icon-loading',
    'approved': 'el-icon-check',
    'rejected': 'el-icon-close',
    'cancelled': 'el-icon-minus'
  }
}

// 优先级映射
export const priorityMap = {
  // 文本映射
  textMap: {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急',
    'critical': '严重'
  },
  // 类型映射
  typeMap: {
    'low': 'info',
    'medium': 'primary',
    'high': 'warning',
    'urgent': 'danger',
    'critical': 'danger'
  },
  // 图标映射
  iconMap: {
    'low': 'el-icon-arrow-down',
    'medium': 'el-icon-minus',
    'high': 'el-icon-arrow-up',
    'urgent': 'el-icon-warning',
    'critical': 'el-icon-warning-outline'
  },
  // 颜色映射
  colorMap: {
    'critical': '#ff4757'
  }
}

// 进度状态映射
export const progressStatusMap = {
  // 文本映射
  textMap: {
    'notStarted': '未开始',
    'inProgress': '进行中',
    'completed': '已完成',
    'paused': '已暂停',
    'failed': '失败'
  },
  // 类型映射
  typeMap: {
    'notStarted': 'info',
    'inProgress': 'warning',
    'completed': 'success',
    'paused': 'primary',
    'failed': 'danger'
  },
  // 图标映射
  iconMap: {
    'notStarted': 'el-icon-timer',
    'inProgress': 'el-icon-loading',
    'completed': 'el-icon-check',
    'paused': 'el-icon-video-pause',
    'failed': 'el-icon-close'
  }
}

// 库存状态映射
export const inventoryStatusMap = {
  // 文本映射
  textMap: {
    'sufficient': '充足',
    'normal': '正常',
    'low': '偏低',
    'critical': '严重不足',
    'outOfStock': '缺货'
  },
  // 类型映射
  typeMap: {
    'sufficient': 'success',
    'normal': 'primary',
    'low': 'warning',
    'critical': 'danger',
    'outOfStock': 'danger'
  },
  // 图标映射
  iconMap: {
    'sufficient': 'el-icon-check',
    'normal': 'el-icon-minus',
    'low': 'el-icon-warning-outline',
    'critical': 'el-icon-warning',
    'outOfStock': 'el-icon-close'
  }
}

// 设备状态映射
export const deviceStatusMap = {
  // 文本映射
  textMap: {
    'online': '在线',
    'offline': '离线',
    'maintenance': '维护中',
    'error': '故障',
    'standby': '待机'
  },
  // 类型映射
  typeMap: {
    'online': 'success',
    'offline': 'info',
    'maintenance': 'warning',
    'error': 'danger',
    'standby': 'primary'
  },
  // 图标映射
  iconMap: {
    'online': 'el-icon-check',
    'offline': 'el-icon-close',
    'maintenance': 'el-icon-setting',
    'error': 'el-icon-warning',
    'standby': 'el-icon-time'
  }
}

// 订单状态映射
export const orderStatusMap = {
  // 文本映射
  textMap: {
    'pending': '待付款',
    'paid': '已付款',
    'processing': '处理中',
    'shipped': '已发货',
    'delivered': '已签收',
    'cancelled': '已取消',
    'refunded': '已退款'
  },
  // 类型映射
  typeMap: {
    'pending': 'warning',
    'paid': 'primary',
    'processing': 'info',
    'shipped': 'success',
    'delivered': 'success',
    'cancelled': 'info',
    'refunded': 'danger'
  },
  // 图标映射
  iconMap: {
    'pending': 'el-icon-time',
    'paid': 'el-icon-check',
    'processing': 'el-icon-loading',
    'shipped': 'el-icon-truck',
    'delivered': 'el-icon-circle-check',
    'cancelled': 'el-icon-close',
    'refunded': 'el-icon-refresh-left'
  }
}

// 用户状态映射
export const userStatusMap = {
  // 文本映射
  textMap: {
    'active': '活跃',
    'inactive': '非活跃',
    'pending': '待激活',
    'suspended': '已暂停',
    'banned': '已禁用'
  },
  // 类型映射
  typeMap: {
    'active': 'success',
    'inactive': 'info',
    'pending': 'warning',
    'suspended': 'warning',
    'banned': 'danger'
  },
  // 图标映射
  iconMap: {
    'active': 'el-icon-user',
    'inactive': 'el-icon-user-solid',
    'pending': 'el-icon-time',
    'suspended': 'el-icon-warning',
    'banned': 'el-icon-circle-close'
  }
}

// 质量状态映射
export const qualityStatusMap = {
  // 文本映射
  textMap: {
    'qualified': '合格',
    'unqualified': '不合格',
    'pending': '待检',
    'retesting': '复检中',
    'exceptional': '异常'
  },
  // 类型映射
  typeMap: {
    'qualified': 'success',
    'unqualified': 'danger',
    'pending': 'info',
    'retesting': 'warning',
    'exceptional': 'danger'
  },
  // 图标映射
  iconMap: {
    'qualified': 'el-icon-check',
    'unqualified': 'el-icon-close',
    'pending': 'el-icon-time',
    'retesting': 'el-icon-loading',
    'exceptional': 'el-icon-warning'
  }
}

// 网络状态映射
export const networkStatusMap = {
  // 文本映射
  textMap: {
    'connected': '已连接',
    'disconnected': '已断开',
    'connecting': '连接中',
    'timeout': '连接超时',
    'error': '连接错误'
  },
  // 类型映射
  typeMap: {
    'connected': 'success',
    'disconnected': 'info',
    'connecting': 'warning',
    'timeout': 'warning',
    'error': 'danger'
  },
  // 图标映射
  iconMap: {
    'connected': 'el-icon-check',
    'disconnected': 'el-icon-close',
    'connecting': 'el-icon-loading',
    'timeout': 'el-icon-time',
    'error': 'el-icon-warning'
  }
}

// 数据同步状态映射
export const syncStatusMap = {
  // 文本映射
  textMap: {
    'synced': '已同步',
    'syncing': '同步中',
    'failed': '同步失败',
    'pending': '待同步',
    'conflict': '冲突'
  },
  // 类型映射
  typeMap: {
    'synced': 'success',
    'syncing': 'warning',
    'failed': 'danger',
    'pending': 'info',
    'conflict': 'danger'
  },
  // 图标映射
  iconMap: {
    'synced': 'el-icon-check',
    'syncing': 'el-icon-loading',
    'failed': 'el-icon-close',
    'pending': 'el-icon-time',
    'conflict': 'el-icon-warning'
  }
}

// 工具函数：创建自定义状态映射
export function createStatusMap(config) {
  const { statuses, textPrefix = '', typeDefault = 'info', iconDefault = '' } = config

  const textMap = {}
  const typeMap = {}
  const iconMap = {}

  statuses.forEach(status => {
    if (typeof status === 'string') {
      textMap[status] = textPrefix + status
      typeMap[status] = typeDefault
      iconMap[status] = iconDefault
    } else if (typeof status === 'object') {
      const { key, text, type, icon } = status
      textMap[key] = text || textPrefix + key
      typeMap[key] = type || typeDefault
      iconMap[key] = icon || iconDefault
    }
  })

  return { textMap, typeMap, iconMap }
}

// 工具函数：合并多个状态映射
export function mergeStatusMaps(...maps) {
  const result = {
    textMap: {},
    typeMap: {},
    iconMap: {},
    colorMap: {}
  }

  maps.forEach(map => {
    if (map.textMap) Object.assign(result.textMap, map.textMap)
    if (map.typeMap) Object.assign(result.typeMap, map.typeMap)
    if (map.iconMap) Object.assign(result.iconMap, map.iconMap)
    if (map.colorMap) Object.assign(result.colorMap, map.colorMap)
  })

  return result
}

// 工具函数：获取所有预设映射
export function getAllPresetMaps() {
  return {
    enabledStatusMap,
    productLifecycleMap,
    auditStatusMap,
    priorityMap,
    progressStatusMap,
    inventoryStatusMap,
    deviceStatusMap,
    orderStatusMap,
    userStatusMap,
    qualityStatusMap,
    networkStatusMap,
    syncStatusMap
  }
}

// 默认导出常用映射
export default {
  enabledStatusMap,
  productLifecycleMap,
  auditStatusMap,
  priorityMap,
  progressStatusMap,
  inventoryStatusMap
}
