/**
 * 文件名称：table-config.js
 * 文件描述：工艺参数管理模块表格列配置与列设置常量
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，对齐TASK002 P0阶段列表配置要求
 *   - 2025-10-15: 重构为工厂函数，textMap使用字典API，typeMap保留前端定义
 */

import {
  COLUMN_SETTINGS_ID,
  SEGMENT_COLOR_MAP
} from './process-parameter-management'

// 状态 Tag 样式映射（前端UI逻辑，保留硬编码）
const TEMPLATE_STATUS_TYPE_MAP = {
  '草稿': 'info',
  '待审批': 'warning',
  '生效': 'success',
  '历史': 'default'
}

const VERSION_STATUS_TYPE_MAP = {
  '草稿': 'info',
  '待审批': 'warning',
  '生效': 'success',
  '历史': 'default',
  '驳回': 'danger',
  '作废': 'info'
}

/**
 * 表格列配置工厂函数
 * @param {Object} dictionaries - 字典对象
 * @param {Object} dictionaries.templateStatusLabels - 模板状态标签映射（从后端字典获取）
 * @param {Object} dictionaries.versionStatusLabels - 版本状态标签映射（从后端字典获取）
 * @returns {Array} 表格列配置数组
 */
export const createTableColumns = ({
  templateStatusLabels = {},
  versionStatusLabels = {}
} = {}) => [
  {
    columnId: 'templateCode',
    prop: 'templateCode',
    label: '模板编码',
    minWidth: 180,
    sortable: true,
    align: 'left',
    fixed: 'left',
    showOverflowTooltip: true
  },
  {
    columnId: 'templateName',
    prop: 'templateName',
    label: '模板名称',
    minWidth: 200,
    sortable: true,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    columnId: 'status',
    prop: 'status',
    label: '模板状态',
    minWidth: 120,
    sortable: true,
    align: 'center',
    type: 'status',
    slotName: 'templateStatus',
    textMap: templateStatusLabels,
    typeMap: TEMPLATE_STATUS_TYPE_MAP,
    tagSize: 'small'
  },
  {
    columnId: 'applicableProducts',
    prop: 'applicableProducts',
    label: '适用产品',
    minWidth: 220,
    align: 'left',
    slotName: 'applicableProducts',
    showOverflowTooltip: false
  },
  {
    columnId: 'applicableAlloyGrades',
    prop: 'applicableAlloyGrades',
    label: '适用合金',
    minWidth: 160,
    align: 'left',
    showOverflowTooltip: true
  },
  {
    columnId: 'applicableThicknessRange',
    prop: 'applicableThicknessRange',
    label: '厚度范围 (mm)',
    minWidth: 150,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    columnId: 'applicableWidthRange',
    prop: 'applicableWidthRange',
    label: '宽度范围 (mm)',
    minWidth: 150,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    columnId: 'latestVersionNumber',
    prop: 'latestVersionNumber',
    label: '最新版本号',
    minWidth: 140,
    sortable: true,
    align: 'center',
    formatter: row => (row.latestVersion && row.latestVersion.versionNumber) || '-'
  },
  {
    columnId: 'latestVersionStatus',
    prop: 'latestVersionStatus',
    label: '版本状态',
    minWidth: 120,
    sortable: true,
    align: 'center',
    type: 'status',
    slotName: 'latestVersionStatus',
    textMap: versionStatusLabels,
    typeMap: VERSION_STATUS_TYPE_MAP,
    tagSize: 'small'
  },
  {
    columnId: 'effectiveDate',
    prop: 'effectiveDate',
    label: '生效时间',
    minWidth: 180,
    align: 'center',
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}',
    formatter: row => (row.latestVersion && row.latestVersion.effectiveDate) || null
  },
  {
    columnId: 'updatedAt',
    prop: 'updatedAt',
    label: '更新时间',
    minWidth: 180,
    align: 'center',
    sortable: true,
    type: 'datetime',
    format: '{y}-{m}-{d} {h}:{i}'
  },
  {
    columnId: 'updatedBy',
    prop: 'updatedBy',
    label: '更新人',
    minWidth: 140,
    align: 'center',
    showOverflowTooltip: true
  },
  {
    columnId: 'segmentSummary',
    prop: 'segmentSummary',
    label: '温度段概览',
    minWidth: 220,
    align: 'left',
    slotName: 'segmentSummary',
    columnTips: '按段序号展示温度段类型与目标温度',
    meta: {
      colors: SEGMENT_COLOR_MAP
    }
  },
  {
    columnId: 'versionActions',
    prop: 'actions',
    label: '操作',
    minWidth: 300,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 默认可见列
export const DEFAULT_VISIBLE_COLUMNS = [
  'templateCode',
  'templateName',
  'status',
  'applicableProducts',
  'applicableAlloyGrades',
  'latestVersionNumber',
  'latestVersionStatus',
  'effectiveDate',
  'updatedAt',
  'versionActions'
]

// 列配置存储ID
export const TABLE_COLUMN_SETTINGS_ID = COLUMN_SETTINGS_ID

// 表格配置版本 - 供 table-config-store 使用
export const TABLE_CONFIG_VERSION = 'v1.0.0'

