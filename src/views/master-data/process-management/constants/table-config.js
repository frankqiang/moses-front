/**
 * 工序管理表格配置
 */

// 表格列配置
export const TABLE_COLUMNS = [
  { prop: 'code', label: '工序代码', sortable: true, minWidth: 120 },
  { prop: 'name', label: '工序名称', sortable: true, minWidth: 120 },
  { prop: 'type', label: '工序类型', sortable: true, minWidth: 120 },
  { prop: 'reportingPoint', label: '报告点', sortable: true, minWidth: 120 },
  { prop: 'status', label: '状态', sortable: true, minWidth: 100 },
  { prop: 'description', label: '描述', sortable: false, minWidth: 180 },
  { prop: 'createdBy', label: '创建人', sortable: true, minWidth: 100 },
  { prop: 'createdAt', label: '创建时间', sortable: true, minWidth: 150 },
  { prop: 'updatedBy', label: '更新人', sortable: true, minWidth: 100 },
  { prop: 'updatedAt', label: '更新时间', sortable: true, minWidth: 150 },
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'code', 'name', 'type', 'reportingPoint', 'status', 'actions'
]

// 表格行样式配置
export const ROW_CLASS_CONFIG = {
  'Disabled': 'row-disabled'
} 