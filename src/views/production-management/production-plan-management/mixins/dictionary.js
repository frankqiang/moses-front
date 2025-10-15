/**
 * 文件名称：dictionary.js
 * 文件描述：生产计划管理模块字典 Mixin
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，从公共 mixin 迁移到模块私有
 *
 * 说明：
 * - 继承自 dictionaryBase 提供的基础能力
 * - 封装生产计划相关的便捷方法
 * - 仅供本模块内组件使用
 *
 * 使用方式：
 * import dictionaryMixin from '../mixins/dictionary'
 *
 * export default {
 *   mixins: [dictionaryMixin],
 *   async created() {
 *     await this.loadProductionPlanDictionary()
 *   }
 * }
 */

import dictionaryBase from '@/mixins/dictionaryBase'
import { getAllDictionaries } from '../api'

const MODULE_NAME = 'productionPlan'
const CACHE_KEY = 'app_dictionaries_cache'

export default {
  mixins: [dictionaryBase],

  computed: {
    // ============ 生产计划相关选项 ============
    /**
     * 计划状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planStatuses')
    },

    /**
     * 子批次状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planItemStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planItemStatuses')
    },

    /**
     * 计划优先级选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planPriorityOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planPriorities')
    },

    /**
     * 计划来源选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planSourceOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planSources')
    },

    /**
     * 审批状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    approvalStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'approvalStatuses')
    }
  },

  methods: {
    // ============ 生产计划相关标签 ============
    /**
     * 获取计划状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getPlanStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'planStatuses', status)
    },

    /**
     * 获取子批次状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getPlanItemStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'planItemStatuses', status)
    },

    /**
     * 获取计划优先级标签
     * @param {string} priority - 优先级值
     * @returns {string} 标签文本
     */
    getPlanPriorityLabel(priority) {
      return this.$getDictLabel(MODULE_NAME, 'planPriorities', priority)
    },

    /**
     * 获取计划来源标签
     * @param {string} source - 来源值
     * @returns {string} 标签文本
     */
    getPlanSourceLabel(source) {
      return this.$getDictLabel(MODULE_NAME, 'planSources', source)
    },

    /**
     * 获取工艺模板关联类型标签
     * @param {string} type - 类型值
     * @returns {string} 标签文本
     */
    getProcessTemplateLinkTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'processTemplateLinkTypes', type)
    },

    /**
     * 获取设备关联类型标签
     * @param {string} type - 类型值
     * @returns {string} 标签文本
     */
    getEquipmentLinkTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'equipmentLinkTypes', type)
    },

    /**
     * 获取变更类型标签
     * @param {string} type - 类型值
     * @returns {string} 标签文本
     */
    getChangeTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'changeTypes', type)
    },

    /**
     * 获取操作来源标签
     * @param {string} source - 来源值
     * @returns {string} 标签文本
     */
    getOperationSourceLabel(source) {
      return this.$getDictLabel(MODULE_NAME, 'operationSources', source)
    },

    /**
     * 获取审批状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getApprovalStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'approvalStatuses', status)
    },

    // ============ 加载字典 ============
    /**
     * 加载生产计划字典
     * @returns {Promise<void>}
     */
    async loadProductionPlanDictionary() {
      await this.$loadDictionary(MODULE_NAME, getAllDictionaries, CACHE_KEY)
    },

    // ============ 字典状态检查 ============
    /**
     * 检查生产计划字典是否已加载
     * @returns {boolean}
     */
    isProductionPlanDictionaryLoaded() {
      return this.$isDictionaryLoaded(MODULE_NAME)
    }
  }
}

