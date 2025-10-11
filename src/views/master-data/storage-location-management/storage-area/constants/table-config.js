/**
 * 文件名称: table-config.js
 * 文件描述: 库区表格配置
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

import { AREA_STATUS_TAG_TYPE_MAP } from './storage-area'

// 库区表格列配置
export const STORAGE_AREA_TABLE_COLUMNS = [
  {
    prop: 'areaCode',
    label: '库区代码',
    width: 150,
    sortable: 'custom',
    fixed: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'areaName',
    label: '库区名称',
    width: 200,
    sortable: 'custom',
    showOverflowTooltip: true
  },
  {
    prop: 'areaType',
    label: '库区类型',
    width: 130,
    showOverflowTooltip: true
  },
  {
    prop: 'areaTypeName',
    label: '类型名称',
    width: 150,
    showOverflowTooltip: true
  },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    slotName: 'status'
  },
  {
    prop: 'description',
    label: '描述',
    minWidth: 200,
    showOverflowTooltip: true
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 180,
    sortable: 'custom',
    showOverflowTooltip: true
  },
  {
    prop: 'updatedAt',
    label: '更新时间',
    width: 180,
    sortable: 'custom',
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    width: 200,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 库区状态配置
export const STORAGE_AREA_STATUS_CONFIG = {
  typeMap: AREA_STATUS_TAG_TYPE_MAP,
  textMap: {
    enabled: '启用',
    disabled: '禁用'
  }
}

// 默认分页配置
export const DEFAULT_PAGE_CONFIG = {
  page: 1,
  limit: 10
}

// 默认排序配置
export const DEFAULT_SORT_CONFIG = {
  sortBy: 'createdAt:desc'
}

