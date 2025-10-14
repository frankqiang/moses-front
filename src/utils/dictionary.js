/**
 * 文件名称：dictionary.js
 * 文件描述：枚举字典工具函数
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

import store from '@/store'

/**
 * 获取计划状态标签
 * @param {string} status - 状态值
 * @returns {string}
 */
export function getPlanStatusLabel(status) {
  return store.getters['dictionary/getPlanStatusLabel'](status)
}

/**
 * 获取子批次状态标签
 * @param {string} status - 状态值
 * @returns {string}
 */
export function getPlanItemStatusLabel(status) {
  return store.getters['dictionary/getPlanItemStatusLabel'](status)
}

/**
 * 获取计划优先级标签
 * @param {string} priority - 优先级值
 * @returns {string}
 */
export function getPlanPriorityLabel(priority) {
  return store.getters['dictionary/getPlanPriorityLabel'](priority)
}

/**
 * 获取计划来源标签
 * @param {string} source - 来源值
 * @returns {string}
 */
export function getPlanSourceLabel(source) {
  return store.getters['dictionary/getPlanSourceLabel'](source)
}

/**
 * 获取工艺模板关联类型标签
 * @param {string} type - 类型值
 * @returns {string}
 */
export function getProcessTemplateLinkTypeLabel(type) {
  return store.getters['dictionary/getProcessTemplateLinkTypeLabel'](type)
}

/**
 * 获取设备关联类型标签
 * @param {string} type - 类型值
 * @returns {string}
 */
export function getEquipmentLinkTypeLabel(type) {
  return store.getters['dictionary/getEquipmentLinkTypeLabel'](type)
}

/**
 * 获取变更类型标签
 * @param {string} type - 类型值
 * @returns {string}
 */
export function getChangeTypeLabel(type) {
  return store.getters['dictionary/getChangeTypeLabel'](type)
}

/**
 * 获取操作来源标签
 * @param {string} source - 来源值
 * @returns {string}
 */
export function getOperationSourceLabel(source) {
  return store.getters['dictionary/getOperationSourceLabel'](source)
}

/**
 * 获取计划状态选项（用于下拉框）
 * @returns {Array<{value: string, label: string}>}
 */
export function getPlanStatusOptions() {
  return store.getters['dictionary/planStatusOptions']
}

/**
 * 获取子批次状态选项（用于下拉框）
 * @returns {Array<{value: string, label: string}>}
 */
export function getPlanItemStatusOptions() {
  return store.getters['dictionary/planItemStatusOptions']
}

/**
 * 获取计划优先级选项（用于下拉框）
 * @returns {Array<{value: string, label: string}>}
 */
export function getPlanPriorityOptions() {
  return store.getters['dictionary/planPriorityOptions']
}

/**
 * 获取计划来源选项（用于下拉框）
 * @returns {Array<{value: string, label: string}>}
 */
export function getPlanSourceOptions() {
  return store.getters['dictionary/planSourceOptions']
}

