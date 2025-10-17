/**
 * 文件名称：table-config.js
 * 文件描述：维护任务管理表格配置
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 *   - 2024-01-20: 移除 textMap，状态文本从字典系统获取
 *   - 2024-01-20: 重构表格配置，参考铝箔产品管理模块架构
 */

import { STATUS_TAG_TYPE_MAP, TASK_TYPE_TAG_TYPE_MAP } from './maintenance-task'

/**
 * 表格列配置
 * 用于BaseTable组件
 */
export const TABLE_COLUMNS = [
  {
    prop: 'taskCode',
    label: '任务编码',
    minWidth: 180,
    sortable: 'custom',
    showOverflowTooltip: true,
    slotName: 'taskCode'
  },
  {
    prop: 'taskTitle',
    label: '任务标题',
    minWidth: 200,
    sortable: false,
    showOverflowTooltip: true
  },
  {
    prop: 'equipment',
    label: '设备信息',
    minWidth: 200,
    sortable: false,
    slotName: 'equipment'
  },
  {
    prop: 'taskType',
    label: '任务类型',
    width: 120,
    sortable: false,
    slotName: 'taskType'
  },
  {
    prop: 'plannedStartTime',
    label: '计划开始时间',
    width: 180,
    sortable: 'custom',
    slotName: 'plannedStartTime'
  },
  {
    prop: 'plannedEndTime',
    label: '计划结束时间',
    width: 180,
    sortable: false,
    slotName: 'plannedEndTime'
  },
  {
    prop: 'assignee',
    label: '执行人',
    width: 120,
    sortable: false,
    slotName: 'assignee'
  },
  {
    prop: 'status',
    label: '状态',
    width: 140,
    sortable: false,
    slotName: 'status'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    width: 180,
    sortable: 'custom',
    slotName: 'createdAt'
  },
  {
    prop: 'actions',
    label: '操作',
    width: 200,
    fixed: 'right',
    slotName: 'actions'
  }
]

/**
 * 状态标签配置
 */
export const STATUS_CONFIG = {
  typeMap: STATUS_TAG_TYPE_MAP
}

/**
 * 任务类型标签配置
 */
export const TASK_TYPE_CONFIG = {
  typeMap: TASK_TYPE_TAG_TYPE_MAP
}

