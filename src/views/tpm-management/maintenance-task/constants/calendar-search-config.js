/**
 * 文件名称：calendar-search-config.js
 * 文件描述：维护任务日历视图搜索表单配置
 * 创建日期：2025-10-31
 * 修改记录：
 *   - 2025-10-31: 初始创建
 *   - 2025-10-31: 统一使用与列表视图相同的数据格式
 */

/**
 * 日历视图搜索表单配置
 * 用于日历页面的任务筛选
 * 数据格式与列表视图保持一致：
 * - 设备：{ label: '编码 - 名称', value: 'id' }
 * - 执行人：{ label: '姓名 (部门)', value: 'id' }
 */
export const CALENDAR_SEARCH_FORM_CONFIG = [
  {
    prop: 'equipmentId',
    label: '设备',
    type: 'select',
    placeholder: '请选择设备',
    clearable: true,
    filterable: true,
    priority: 'primary',
    options: [] // 动态加载
  },
  {
    prop: 'assignedTo',
    label: '执行人',
    type: 'select',
    placeholder: '请选择执行人',
    clearable: true,
    filterable: true,
    priority: 'primary',
    options: [] // 动态加载
  }
]
