/**
 * 待审批申请常量
 */

// 申请状态
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// 申请状态选项
export const APPLICATION_STATUS_OPTIONS = [
  { value: APPLICATION_STATUS.PENDING, label: '待审批' },
  { value: APPLICATION_STATUS.APPROVED, label: '已批准' },
  { value: APPLICATION_STATUS.REJECTED, label: '已拒绝' }
]

// 申请类型
export const APPLICATION_TYPES = {
  ACCOUNT: 'account',
  PERMISSION: 'permission',
  RESOURCE: 'resource'
}

// 申请类型选项
export const APPLICATION_TYPE_OPTIONS = [
  { value: APPLICATION_TYPES.ACCOUNT, label: '账户申请' },
  { value: APPLICATION_TYPES.PERMISSION, label: '权限申请' },
  { value: APPLICATION_TYPES.RESOURCE, label: '资源申请' }
]

// 性别选项
export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' }
]

// 性别映射
export const GENDER_MAP = {
  'male': '男',
  'female': '女',
  'other': '其他'
}

// 岗位选项（示例数据，实际应从API获取）
export const POSITION_OPTIONS = [
  { value: 'pos-001', label: '软件工程师' },
  { value: 'pos-002', label: '产品经理' },
  { value: 'pos-003', label: '测试工程师' },
  { value: 'pos-004', label: 'UI设计师' },
  { value: 'pos-005', label: '数据分析师' },
  { value: 'pos-006', label: '项目经理' },
  { value: 'pos-007', label: '运维工程师' },
  { value: 'pos-008', label: '前端工程师' },
  { value: 'pos-009', label: '后端工程师' },
  { value: 'pos-010', label: '架构师' }
]

// 部门选项（示例数据，实际应从API获取）
export const DEPARTMENT_OPTIONS = [
  { value: 'dept-001', label: '技术部' },
  { value: 'dept-002', label: '产品部' },
  { value: 'dept-003', label: '市场部' },
  { value: 'dept-004', label: '销售部' },
  { value: 'dept-005', label: '人力资源部' },
  { value: 'dept-006', label: '财务部' },
  { value: 'dept-007', label: '运营部' },
  { value: 'dept-008', label: '客服部' }
]

// 管理人员选项（示例数据，实际应从API获取）
export const MANAGER_OPTIONS = [
  { value: 'mgr-001', label: '张经理' },
  { value: 'mgr-002', label: '李总监' },
  { value: 'mgr-003', label: '王主管' },
  { value: 'mgr-004', label: '刘部长' },
  { value: 'mgr-005', label: '陈组长' }
]

// 状态配置 - 可以在组件中引用
export const STATUS_CONFIG = {
  textMap: {
    [APPLICATION_STATUS.PENDING]: '待审批',
    [APPLICATION_STATUS.APPROVED]: '已批准',
    [APPLICATION_STATUS.REJECTED]: '已拒绝'
  },
  typeMap: {
    [APPLICATION_STATUS.PENDING]: 'warning',
    [APPLICATION_STATUS.APPROVED]: 'success',
    [APPLICATION_STATUS.REJECTED]: 'danger'
  }
}

// 表格行样式配置
export const ROW_CLASS_CONFIG = {
  [APPLICATION_STATUS.REJECTED]: 'row-disabled'
}
