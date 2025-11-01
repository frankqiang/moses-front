/**
 * 文件名称：index.js
 * 文件描述：出入库记录查询页面常量配置
 * 创建日期：2025-10-25
 * 修改记录：
 *   - 2025-10-25: 初始创建
 */

// 出入库类型配置
export const TRANSACTION_TYPES = [
  { label: '入库', value: '入库', type: 'success' },
  { label: '领用', value: '领用', type: 'primary' },
  { label: '退库', value: '退库', type: 'warning' },
  { label: '报废', value: '报废', type: 'danger' }
]

// 时间范围快捷选项
export const TIME_SHORTCUTS = [
  {
    text: '今天',
    value: () => {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date()
      end.setHours(23, 59, 59, 999)
      return [start, end]
    }
  },
  {
    text: '近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 表格列配置
export const TABLE_COLUMNS = [
  { prop: 'transactionCode', label: '出入库单号', width: '180', sortable: false },
  { prop: 'sparePart.sparePartCode', label: '备件编码', width: '140', sortable: false },
  { prop: 'sparePart.sparePartName', label: '备件名称', width: '140', sortable: false },
  { prop: 'transactionType', label: '出入库类型', width: '120', sortable: false, slotName: 'transactionType' },
  { prop: 'quantity', label: '数量', width: '100', sortable: true, align: 'right' },
  { prop: 'sparePart.unit', label: '单位', width: '80', sortable: false },
  { prop: 'transactionTime', label: '出入库时间', width: '180', sortable: true, slotName: 'transactionTime' },
  { prop: 'operator.name', label: '经手人', width: '120', sortable: false },
  { prop: 'maintenanceTask', label: '关联任务', width: '140', sortable: false, slotName: 'maintenanceTask' },
  { prop: 'equipmentFailure', label: '关联故障单', width: '140', sortable: false, slotName: 'equipmentFailure' },
  { prop: 'purpose', label: '用途说明', minWidth: '150', sortable: false, showOverflowTooltip: true },
  { prop: 'actions', label: '操作', width: '100', fixed: 'right', slotName: 'actions' }
]

// 排序字段配置
export const SORT_OPTIONS = [
  { label: '出入库时间', value: 'transactionTime' },
  { label: '出入库单号', value: 'transactionCode' },
  { label: '数量', value: 'quantity' }
]

// API配置
export const API_CONFIG = {
  BASE_PATH: '/v1/mdm/tpm/spare-parts',
  TRANSACTIONS_PATH: '/v1/mdm/tpm/spare-parts/transactions'
}

// 默认查询参数
export const DEFAULT_QUERY = {
  page: 1,
  limit: 10,
  sortBy: 'transactionTime',
  sortOrder: 'desc'
}

