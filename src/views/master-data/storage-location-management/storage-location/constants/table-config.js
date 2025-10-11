/**
 * 文件名称: table-config.js
 * 文件描述: 库位表格配置
 * 创建日期: 2025-01-20
 * 修改记录:
 *   - 2025-01-20: 初始创建
 */

import { OCCUPANCY_STATUS_COLORS } from './storage-location'

// 库位表格列配置
export const LOCATION_TABLE_COLUMNS = [
  {
    prop: 'locationId',
    label: '库位ID',
    minWidth: 150,
    sortable: true,
    fixed: 'left',
    showOverflowTooltip: true
  },
  {
    prop: 'storageArea',
    label: '所属库区',
    minWidth: 120,
    slotName: 'storageArea',
    showOverflowTooltip: true
  },
  {
    prop: 'locationTypeName',
    label: '库位类型',
    width: 120,
    showOverflowTooltip: true
  },
  {
    prop: 'coordinates',
    label: '坐标(X,Y,Z)',
    minWidth: 150,
    slotName: 'coordinates',
    showOverflowTooltip: true
  },
  {
    prop: 'dimensions',
    label: '尺寸限制(长×宽×高)',
    minWidth: 180,
    slotName: 'dimensions',
    showOverflowTooltip: true
  },
  {
    prop: 'loadCapacity',
    label: '承重限制(kg)',
    width: 130,
    align: 'right',
    showOverflowTooltip: true
  },
  {
    prop: 'occupancyStatusName',
    label: '占用状态',
    width: 100,
    slotName: 'occupancyStatus',
    showOverflowTooltip: true
  },
  {
    prop: 'maxStackHeight',
    label: '最大堆叠高度',
    width: 130,
    align: 'right',
    slotName: 'maxStackHeight',
    showOverflowTooltip: true
  },
  {
    prop: 'applicableBinSpecCodes',
    label: '适用料框规格',
    minWidth: 150,
    slotName: 'binSpecCodes',
    showOverflowTooltip: true
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 160,
    sortable: true,
    showOverflowTooltip: true
  },
  {
    prop: 'actions',
    label: '操作',
    width: 260,
    fixed: 'right',
    slotName: 'actions',
    showOverflowTooltip: false
  }
]

// 占用状态配置
export const OCCUPANCY_STATUS_CONFIG = {
  typeMap: OCCUPANCY_STATUS_COLORS,
  textMap: {
    free: '空闲',
    occupied: '占用',
    reserved: '预留',
    disabled: '禁用',
    maintenance: '维护'
  }
}

