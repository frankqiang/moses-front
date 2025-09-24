/**
 * 检验项目管理表格配置
 * 支持BaseTable组件的完整配置
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-19: 从 inspection-item.js 重构分离表格配置
 */

// 表格列配置 - 原生支持BaseTable组件
export const TABLE_COLUMNS = [
  {
    prop: 'code',
    label: '检验项目编码',
    sortable: true,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'name',
    label: '检验项目名称',
    sortable: true,
    minWidth: 160,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'category',
    label: '检验类别',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'category',
    showOverflowTooltip: true
  },
  {
    prop: 'dataType',
    label: '数据类型',
    sortable: true,
    minWidth: 100,
    align: 'center',
    slotName: 'dataType',
    showOverflowTooltip: true
  },
  {
    prop: 'unit',
    label: '单位',
    sortable: false,
    minWidth: 80,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'standardValue',
    label: '标准值',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'toleranceRange',
    label: '公差范围',
    sortable: false,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'inspectionMethod',
    label: '检验方法',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'inspectionMethod',
    showOverflowTooltip: true
  },
  {
    prop: 'applicableProduct',
    label: '适用产品',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'applicableProduct',
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    sortable: true,
    minWidth: 100,
    align: 'center',
    type: 'status',
    slotName: 'status',
    showOverflowTooltip: false
  },
  {
    prop: 'createdBy',
    label: '创建人',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    sortable: true,
    minWidth: 150,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedBy',
    label: '更新人',
    sortable: true,
    minWidth: 100,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    sortable: true,
    minWidth: 150,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 200,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 默认可见列配置
export const DEFAULT_VISIBLE_COLUMNS = [
  'code',
  'name',
  'category',
  'dataType',
  'unit',
  'standardValue',
  'toleranceRange',
  'inspectionMethod',
  'applicableProduct',
  'status',
  'actions'
]
