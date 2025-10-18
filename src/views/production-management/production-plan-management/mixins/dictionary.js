/**
 * 文件名称：dictionary.js
 * 文件描述：生产计划模块字典 Mixin
 * 创建日期：2025-10-16
 * 修改记录：
 *   - 2025-10-16: 初始创建，从旧版迁移到模块化架构
 *   - 2025-10-16: 重构以适配新的扁平化接口格式，新增审批状态等字典支持
 *
 * 说明：
 * - 继承自 dictionaryBase 提供的基础能力
 * - 封装生产计划相关的便捷方法
 * - 供生产计划管理模块使用
 *
 * 使用方式：
 * import productionPlanDictionaryMixin from './mixins/dictionary'
 *
 * export default {
 *   mixins: [productionPlanDictionaryMixin],
 *   async created() {
 *     await this.loadProductionPlanDictionary()
 *   }
 * }
 */

import dictionaryBase from '@/mixins/dictionaryBase'

const MODULE_NAME = 'productionPlan'

export default {
  mixins: [dictionaryBase],

  computed: {
    // ============ 计划状态 ============
    /**
     * 计划状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planStatuses')
    },

    /**
     * 计划状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    planStatusLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.planStatuses || {}
    },

    // ============ 子批次状态 ============
    /**
     * 子批次状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planItemStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planItemStatuses')
    },

    /**
     * 子批次状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    planItemStatusLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.planItemStatuses || {}
    },

    // ============ 计划优先级 ============
    /**
     * 计划优先级选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planPriorityOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planPriorities')
    },

    /**
     * 计划优先级标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    planPriorityLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.planPriorities || {}
    },

    // ============ 计划来源 ============
    /**
     * 计划来源选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planSourceOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planSources')
    },

    /**
     * 计划来源标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    planSourceLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.planSources || {}
    },

    // ============ 工艺模板关联类型 ============
    /**
     * 工艺模板关联类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    processTemplateLinkTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'processTemplateLinkTypes')
    },

    /**
     * 工艺模板关联类型标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    processTemplateLinkTypeLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.processTemplateLinkTypes || {}
    },

    // ============ 设备关联类型 ============
    /**
     * 设备关联类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    equipmentLinkTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'equipmentLinkTypes')
    },

    /**
     * 设备关联类型标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    equipmentLinkTypeLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.equipmentLinkTypes || {}
    },

    // ============ 变更类型 ============
    /**
     * 变更类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    changeTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'changeTypes')
    },

    /**
     * 变更类型标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    changeTypeLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.changeTypes || {}
    },

    // ============ 操作来源 ============
    /**
     * 操作来源选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    operationSourceOptions() {
      return this.$getDictOptions(MODULE_NAME, 'operationSources')
    },

    /**
     * 操作来源标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    operationSourceLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.operationSources || {}
    },

    // ============ 审批状态 ============
    /**
     * 审批状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    approvalStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'approvalStatuses')
    },

    /**
     * 审批状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    approvalStatusLabels() {
      const state = this.$store.state.dictionary.productionPlan
      return state?.approvalStatuses || {}
    }
  },

  methods: {
    // ============ 计划状态标签 ============
    /**
     * 获取计划状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getPlanStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'planStatuses', status)
    },

    // ============ 子批次状态标签 ============
    /**
     * 获取子批次状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getPlanItemStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'planItemStatuses', status)
    },

    // ============ 计划优先级标签 ============
    /**
     * 获取计划优先级标签
     * @param {string} priority - 优先级值
     * @returns {string} 标签文本
     */
    getPlanPriorityLabel(priority) {
      return this.$getDictLabel(MODULE_NAME, 'planPriorities', priority)
    },

    // ============ 计划来源标签 ============
    /**
     * 获取计划来源标签
     * @param {string} source - 来源值
     * @returns {string} 标签文本
     */
    getPlanSourceLabel(source) {
      return this.$getDictLabel(MODULE_NAME, 'planSources', source)
    },

    // ============ 工艺模板关联类型标签 ============
    /**
     * 获取工艺模板关联类型标签
     * @param {string} type - 类型值
     * @returns {string} 标签文本
     */
    getProcessTemplateLinkTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'processTemplateLinkTypes', type)
    },

    // ============ 设备关联类型标签 ============
    /**
     * 获取设备关联类型标签
     * @param {string} type - 类型值
     * @returns {string} 标签文本
     */
    getEquipmentLinkTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'equipmentLinkTypes', type)
    },

    // ============ 变更类型标签 ============
    /**
     * 获取变更类型标签
     * @param {string} type - 类型值
     * @returns {string} 标签文本
     */
    getChangeTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'changeTypes', type)
    },

    // ============ 操作来源标签 ============
    /**
     * 获取操作来源标签
     * @param {string} source - 来源值
     * @returns {string} 标签文本
     */
    getOperationSourceLabel(source) {
      return this.$getDictLabel(MODULE_NAME, 'operationSources', source)
    },

    // ============ 审批状态标签 ============
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
     * 加载生产计划模块字典
     * @returns {Promise<void>}
     */
    async loadProductionPlanDictionary() {
      await this.$loadDictionary(MODULE_NAME)
    },

    // ============ 字典状态检查 ============
    /**
     * 检查生产计划模块字典是否已加载
     * @returns {boolean}
     */
    isProductionPlanDictionaryLoaded() {
      return this.$isDictionaryLoaded(MODULE_NAME)
    }
  }
}
