/**
 * 文件名称：form-config.js
 * 文件描述：维护记录搜索表单配置
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，定义搜索表单配置
 */

import { MAINTENANCE_TYPE_OPTIONS } from './maintenance-record'

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    prop: 'equipmentId',
    label: '设备',
    type: 'select',
    placeholder: '请选择设备',
    priority: 'primary',
    options: [], // 动态加载设备选项
    filterable: true,
    clearable: true
  },
  {
    prop: 'maintenanceType',
    label: '维护类型',
    type: 'select',
    placeholder: '请选择维护类型',
    priority: 'primary',
    options: MAINTENANCE_TYPE_OPTIONS,
    clearable: true
  },
  {
    prop: 'executorId',
    label: '执行人员',
    type: 'select',
    placeholder: '请选择执行人员',
    priority: 'primary',
    options: [], // 动态加载人员选项
    filterable: true,
    clearable: true
  },
  {
    prop: 'startDate',
    label: '开始日期',
    type: 'datetime',
    placeholder: '请选择开始日期',
    priority: 'advanced',
    valueFormat: 'yyyy-MM-ddTHH:mm:ss.sssZ',
    pickerOptions: {
      shortcuts: [
        {
          text: '今天',
          onClick(picker) {
            const start = new Date()
            start.setHours(0, 0, 0, 0)
            picker.$emit('pick', start)
          }
        },
        {
          text: '本周',
          onClick(picker) {
            const start = new Date()
            const day = start.getDay()
            const diff = start.getDate() - day + (day === 0 ? -6 : 1)
            start.setDate(diff)
            start.setHours(0, 0, 0, 0)
            picker.$emit('pick', start)
          }
        },
        {
          text: '本月',
          onClick(picker) {
            const start = new Date()
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
            picker.$emit('pick', start)
          }
        }
      ]
    }
  },
  {
    prop: 'endDate',
    label: '结束日期',
    type: 'datetime',
    placeholder: '请选择结束日期',
    priority: 'advanced',
    valueFormat: 'yyyy-MM-ddTHH:mm:ss.sssZ',
    pickerOptions: {
      shortcuts: [
        {
          text: '今天',
          onClick(picker) {
            const end = new Date()
            end.setHours(23, 59, 59, 999)
            picker.$emit('pick', end)
          }
        },
        {
          text: '本周',
          onClick(picker) {
            const end = new Date()
            const day = end.getDay()
            const diff = end.getDate() + (day === 0 ? 0 : 7 - day)
            end.setDate(diff)
            end.setHours(23, 59, 59, 999)
            picker.$emit('pick', end)
          }
        },
        {
          text: '本月',
          onClick(picker) {
            const end = new Date()
            end.setMonth(end.getMonth() + 1)
            end.setDate(0)
            end.setHours(23, 59, 59, 999)
            picker.$emit('pick', end)
          }
        }
      ]
    }
  },
  {
    prop: 'search',
    label: '关键词',
    type: 'input',
    placeholder: '搜索记录编码或维护内容',
    priority: 'advanced',
    clearable: true
  }
]

