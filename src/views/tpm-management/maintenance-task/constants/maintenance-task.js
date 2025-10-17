/**
 * 文件名称：maintenance-task.js
 * 文件描述：维护任务管理 UI 配置常量
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 *   - 2024-01-20: 移除冗余枚举值，改为从字典系统获取
 *
 * 说明：
 * - 本文件仅保留 UI 层配置（如标签颜色映射）
 * - 业务枚举值（状态、类型等）应从字典系统获取
 * - 使用方式：import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'
 */

/**
 * 任务状态标签类型映射（UI配置）
 * 用于 el-tag 的 type 属性
 */
export const STATUS_TAG_TYPE_MAP = {
  '待执行': 'info',
  '执行中': 'warning',
  '已完成': 'success',
  '已延期': 'warning',
  '已取消': 'danger'
}

/**
 * 任务类型标签类型映射（UI配置）
 * 用于 el-tag 的 type 属性
 */
export const TASK_TYPE_TAG_TYPE_MAP = {
  '计划维护': 'primary',
  '应急抢修': 'danger',
  '状态检修': 'warning'
}

/**
 * 设备状态标签类型映射（UI配置）
 * 用于 el-tag 的 type 属性
 */
export const EQUIPMENT_STATUS_TAG_TYPE_MAP = {
  '空闲': 'success',
  '运行中': 'primary',
  '维护中': 'warning',
  '故障': 'danger',
  '停用': 'info'
}

