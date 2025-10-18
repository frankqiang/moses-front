/**
 * 文件名称：detail-config.js
 * 文件描述：退火任务详情页面配置
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，定义详情页面的字段配置和映射
 */

// 物料类型映射
export const MATERIAL_TYPE_MAP = {
  basket: '料框',
  stack: '料垛'
}

// 任务状态颜色映射
export const STATUS_COLOR_MAP = {
  draft: 'info',
  'pending-schedule': 'primary',
  scheduled: 'success',
  'waiting-loading': 'warning',
  loading: 'warning',
  'waiting-execute': 'warning',
  'in-progress': 'warning',
  'waiting-unload': 'warning',
  completed: 'success',
  paused: 'info',
  cancelled: 'danger',
  terminated: 'danger'
}

// 任务优先级颜色映射
export const PRIORITY_COLOR_MAP = {
  emergency: 'danger',
  high: 'warning',
  normal: 'primary',
  low: 'info'
}

// 任务来源映射
export const SOURCE_MAP = {
  'plan-split': '计划拆分',
  manual: '手工创建'
}

// 进度阶段映射
export const PROGRESS_PHASE_MAP = {
  preparation: '准备阶段',
  scheduled: '已排程',
  loading: '装炉阶段',
  'waiting-execution': '待执行',
  execution: '执行阶段',
  'waiting-unloading': '待出炉',
  completed: '已完成',
  paused: '已暂停',
  cancelled: '已取消',
  terminated: '异常终止'
}

// 进度状态映射
export const PROGRESS_STATUS_MAP = {
  'not-started': '未开始',
  waiting: '等待中',
  'in-progress': '进行中',
  completed: '已完成'
}

// 进度状态颜色映射
export const PROGRESS_STATUS_COLOR_MAP = {
  'not-started': '#909399',
  waiting: '#E6A23C',
  'in-progress': '#409EFF',
  completed: '#67C23A'
}

