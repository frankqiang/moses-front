/**
 * 文件名称：spare-part-management.js
 * 文件描述：备件管理模块基础常量配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

// 默认分页配置
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
}

// 默认排序配置
export const DEFAULT_SORT = 'createdAt:desc'

// 库存状态配置
export const INVENTORY_STATUS_CONFIG = {
  typeMap: {
    LOW_STOCK: 'danger', // 低库存 - 红色警告
    NORMAL: 'success', // 正常库存 - 绿色
    SUFFICIENT: 'info' // 充足库存 - 蓝色
  },
  textMap: {
    LOW_STOCK: '低库存',
    NORMAL: '正常',
    SUFFICIENT: '充足'
  }
}

// 计量单位选项
export const UNIT_OPTIONS = [
  { label: '件', value: '件' },
  { label: '个', value: '个' },
  { label: '套', value: '套' },
  { label: '升', value: '升' },
  { label: '公斤', value: '公斤' },
  { label: '米', value: '米' },
  { label: '箱', value: '箱' }
]

// 排序字段选项
export const SORT_FIELD_OPTIONS = [
  { label: '备件编码', value: 'sparePartCode' },
  { label: '备件名称', value: 'sparePartName' },
  { label: '创建时间', value: 'createdAt' },
  { label: '更新时间', value: 'updatedAt' }
]

// 排序方向选项
export const SORT_ORDER_OPTIONS = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
]

