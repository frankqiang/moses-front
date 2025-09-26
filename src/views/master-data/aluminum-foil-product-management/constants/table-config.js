/**
 * 文件名称：table-config.js
 * 文件描述：铝箔产品管理模块表格配置
 * 创建日期：2025-09-26
 * 修改记录：
 *   - 2025-09-26: 初始创建，定义表格列、状态配置及工具栏配置
 */

import {
  LIFECYCLE_STATUS,
  UNIT_DISPLAY
} from './aluminum-foil-product-management'

// 表格列配置（按业务优先级排序）
export const TABLE_COLUMNS = [
  {
    prop: 'productCode',
    label: '产品编码',
    sortable: true,
    minWidth: 180,
    fixed: 'left',
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'productCode'
  },
  {
    prop: 'productName',
    label: '产品名称',
    sortable: true,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'alloyGrade',
    label: '合金牌号',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'temper',
    label: '状态/硬度',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'lifecycleStatus',
    label: '生命周期',
    sortable: true,
    minWidth: 120,
    align: 'center',
    slotName: 'lifecycleStatus',
    showOverflowTooltip: false
  },
  {
    prop: 'thickness',
    label: `厚度 (${UNIT_DISPLAY.thickness})`,
    sortable: true,
    minWidth: 140,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'thickness',
    formatter: (row) => (row.thickness ?? '-')
  },
  {
    prop: 'width',
    label: `宽度 (${UNIT_DISPLAY.width})`,
    sortable: true,
    minWidth: 140,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'width',
    formatter: (row) => (row.width ?? '-')
  },
  {
    prop: 'unitWeight',
    label: `单位重量 (${UNIT_DISPLAY.unitWeight})`,
    sortable: true,
    minWidth: 160,
    align: 'right',
    showOverflowTooltip: true,
    slotName: 'unitWeight',
    formatter: (row) => (row.unitWeight ?? '-')
  },
  {
    prop: 'unitWeightType',
    label: '重量类型',
    sortable: true,
    minWidth: 120,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'rawMaterialType',
    label: '原材料类型',
    sortable: true,
    minWidth: 160,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'processTemplateIds',
    label: '关联工艺模板',
    sortable: false,
    minWidth: 200,
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'processTemplateIds'
  },
  {
    prop: 'qualityStandardId',
    label: '质量标准',
    sortable: false,
    minWidth: 180,
    align: 'left',
    showOverflowTooltip: true,
    slotName: 'qualityStandard'
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    sortable: true,
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}:{s}',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedBy',
    label: '更新人',
    sortable: true,
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 220,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'productCode',
  'productName',
  'alloyGrade',
  'temper',
  'lifecycleStatus',
  'thickness',
  'width',
  'unitWeight',
  'unitWeightType',
  'rawMaterialType',
  'processTemplateIds',
  'qualityStandardId',
  'updatedAt',
  'actions'
]

// 生命周期状态标签配置
export const LIFECYCLE_STATUS_CONFIG = {
  textMap: {
    [LIFECYCLE_STATUS.TRIAL]: '试产',
    [LIFECYCLE_STATUS.MASS]: '量产',
    [LIFECYCLE_STATUS.RETIRED]: '停产'
  },
  typeMap: {
    [LIFECYCLE_STATUS.TRIAL]: 'warning',
    [LIFECYCLE_STATUS.MASS]: 'success',
    [LIFECYCLE_STATUS.RETIRED]: 'info'
  }
}

// 表格工具栏配置
export const TABLE_TOOLBAR_CONFIG = {
  enableColumnSettings: true,
  enableBatchActions: false,
  enableExport: false,
  enableImport: false,
  enableRefresh: true,
  enableDensity: true,
  columnSettings: {
    cacheKey: 'aluminumFoilProductTableColumns'
  }
}

// 行样式配置（预留）
export const ROW_CLASS_CONFIG = {
  statusField: 'lifecycleStatus',
  classMap: {
    [LIFECYCLE_STATUS.TRIAL]: 'row-warning',
    [LIFECYCLE_STATUS.MASS]: 'row-success',
    [LIFECYCLE_STATUS.RETIRED]: 'row-info'
  }
}

