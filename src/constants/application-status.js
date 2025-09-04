/**
 * 申请状态常量配置
 * 功能描述：统一管理注册申请的各种状态配置，包括文本、类型、图标等映射
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 从 ApplicationCard 组件中抽取状态配置
 */

/**
 * 申请状态配置对象
 * 包含状态的文本、类型、图标等映射关系
 */
export const APPLICATION_STATUS_CONFIG = {
  // 状态文本映射
  TEXT_MAP: {
    'pending': '待审核',
    'under_review': '审核中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'expired': '已过期',
    'cancelled': '已取消',
    'draft': '草稿'
  },

  // 状态类型映射（Element UI标签类型）
  TYPE_MAP: {
    'pending': 'warning',
    'under_review': 'primary',
    'approved': 'success',
    'rejected': 'danger',
    'expired': 'info',
    'cancelled': 'info',
    'draft': 'info'
  },

  // 状态图标映射
  ICON_MAP: {
    'pending': 'el-icon-time',
    'under_review': 'el-icon-loading',
    'approved': 'el-icon-circle-check',
    'rejected': 'el-icon-circle-close',
    'expired': 'el-icon-warning-outline',
    'cancelled': 'el-icon-remove-outline',
    'draft': 'el-icon-edit-outline'
  },

  // 状态颜色映射（自定义颜色）
  COLOR_MAP: {
    'pending': '#E6A23C',
    'under_review': '#409EFF',
    'approved': '#67C23A',
    'rejected': '#F56C6C',
    'expired': '#909399',
    'cancelled': '#909399',
    'draft': '#909399'
  },

  // 状态描述映射
  DESCRIPTION_MAP: {
    'pending': '申请已提交，等待管理员审核',
    'under_review': '管理员正在审核您的申请',
    'approved': '申请已通过，账户已创建',
    'rejected': '申请被拒绝，请查看拒绝原因',
    'expired': '申请已过期，请重新提交',
    'cancelled': '申请已被取消',
    'draft': '申请尚未提交，仍为草稿状态'
  }
}

/**
 * 获取所有有效的申请状态
 * @returns {string[]} 状态数组
 */
export function getValidApplicationStatuses() {
  return Object.keys(APPLICATION_STATUS_CONFIG.TEXT_MAP)
}

/**
 * 获取状态的完整信息
 * @param {string} status - 状态值
 * @returns {Object} 状态信息对象
 */
export function getApplicationStatusInfo(status) {
  return {
    text: APPLICATION_STATUS_CONFIG.TEXT_MAP[status] || '未知状态',
    type: APPLICATION_STATUS_CONFIG.TYPE_MAP[status] || 'info',
    icon: APPLICATION_STATUS_CONFIG.ICON_MAP[status] || 'el-icon-question',
    color: APPLICATION_STATUS_CONFIG.COLOR_MAP[status] || '#909399',
    description: APPLICATION_STATUS_CONFIG.DESCRIPTION_MAP[status] || '状态描述不可用'
  }
}

/**
 * 验证状态是否有效
 * @param {string} status - 状态值
 * @returns {boolean} 是否有效
 */
export function isValidApplicationStatus(status) {
  return getValidApplicationStatuses().includes(String(status))
}
