/**
 * 文件名称：constants/user-management.js
 * 文件描述：用户管理模块的常量定义，包括状态、选项等配置
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建，定义基础常量
 */

// 用户状态常量
export const USER_STATUS = {
  ACTIVE: 'active', // 正常
  INACTIVE: 'inactive', // 禁用
  LOCKED: 'locked', // 锁定
  PENDING: 'pending', // 待激活
  DELETED: 'deleted' // 已删除
}

// 用户状态选项
export const USER_STATUS_OPTIONS = [
  { label: '正常', value: USER_STATUS.ACTIVE },
  { label: '禁用', value: USER_STATUS.INACTIVE },
  { label: '锁定', value: USER_STATUS.LOCKED },
  { label: '待激活', value: USER_STATUS.PENDING },
  { label: '已删除', value: USER_STATUS.DELETED }
]

// 用户状态映射（用于显示）
export const USER_STATUS_MAP = {
  [USER_STATUS.ACTIVE]: '正常',
  [USER_STATUS.INACTIVE]: '禁用',
  [USER_STATUS.LOCKED]: '锁定',
  [USER_STATUS.PENDING]: '待激活',
  [USER_STATUS.DELETED]: '已删除'
}

// 性别常量
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
}

// 性别选项
export const GENDER_OPTIONS = [
  { label: '男', value: GENDER.MALE },
  { label: '女', value: GENDER.FEMALE },
  { label: '其他', value: GENDER.OTHER }
]

// 部门常量
export const DEPARTMENT = {
  TECH: 'tech',
  PRODUCT: 'product',
  OPERATION: 'operation',
  MARKETING: 'marketing',
  HR: 'hr',
  FINANCE: 'finance',
  ADMIN: 'admin'
}

// 部门选项（示例数据，实际应从API获取）
export const DEPARTMENT_OPTIONS = [
  { label: '技术部', value: DEPARTMENT.TECH },
  { label: '产品部', value: DEPARTMENT.PRODUCT },
  { label: '运营部', value: DEPARTMENT.OPERATION },
  { label: '市场部', value: DEPARTMENT.MARKETING },
  { label: '人事部', value: DEPARTMENT.HR },
  { label: '财务部', value: DEPARTMENT.FINANCE },
  { label: '行政部', value: DEPARTMENT.ADMIN }
]

// 角色常量
export const ROLE = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
}

// 用户角色选项
export const ROLE_OPTIONS = [
  { label: '超级管理员', value: ROLE.SUPER_ADMIN },
  { label: '管理员', value: ROLE.ADMIN },
  { label: '普通用户', value: ROLE.USER },
  { label: '访客', value: ROLE.GUEST }
]

// 导出所有常量
export default {
  USER_STATUS,
  USER_STATUS_OPTIONS,
  USER_STATUS_MAP,
  GENDER,
  GENDER_OPTIONS,
  DEPARTMENT,
  DEPARTMENT_OPTIONS,
  ROLE,
  ROLE_OPTIONS
}
