/**
 * 文件名称：dictionary.js
 * 文件描述：TPM模块字典 Mixin（整个TPM模块共用）
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 *
 * 说明：
 * - 继承自 dictionaryBase 提供的基础能力
 * - 封装TPM相关的便捷方法
 * - 供TPM所有子模块使用（维护计划、维护任务、维护记录、设备故障等）
 *
 * 使用方式：
 * import tpmDictionaryMixin from '@/views/master-data/equipment-tpm-management/mixins/dictionary'
 *
 * export default {
 *   mixins: [tpmDictionaryMixin],
 *   async created() {
 *     await this.loadTPMDictionary()
 *   }
 * }
 */

import dictionaryBase from '@/mixins/dictionaryBase'
import { getAllDictionaries } from '../api/dictionary'

const MODULE_NAME = 'tpm'
const CACHE_KEY = 'tpmDictionaries'

export default {
  mixins: [dictionaryBase],

  computed: {
    // ============ 维护类型 ============
    /**
     * 维护类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    maintenanceTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'maintenanceTypes')
    },

    /**
     * 维护类型标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    maintenanceTypeLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.maintenanceTypes?.labels || {}
    },

    // ============ 维护周期类型 ============
    /**
     * 维护周期类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    cycleTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'cycleTypes')
    },

    /**
     * 维护周期类型标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    cycleTypeLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.cycleTypes?.labels || {}
    },

    // ============ 周期单位 ============
    /**
     * 周期单位选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    cycleUnitOptions() {
      return this.$getDictOptions(MODULE_NAME, 'cycleUnits')
    },

    /**
     * 按时间周期单位选项
     * @returns {Array<{value: string, label: string}>}
     */
    timeBasedCycleUnitOptions() {
      const allOptions = this.$getDictOptions(MODULE_NAME, 'cycleUnits')
      return allOptions.filter(opt => ['天', '周', '月', '年'].includes(opt.label))
    },

    /**
     * 按运行时长周期单位选项
     * @returns {Array<{value: string, label: string}>}
     */
    runtimeBasedCycleUnitOptions() {
      const allOptions = this.$getDictOptions(MODULE_NAME, 'cycleUnits')
      return allOptions.filter(opt => opt.label === '小时')
    },

    /**
     * 按生产批次周期单位选项
     * @returns {Array<{value: string, label: string}>}
     */
    batchBasedCycleUnitOptions() {
      const allOptions = this.$getDictOptions(MODULE_NAME, 'cycleUnits')
      return allOptions.filter(opt => opt.label === '批次')
    },

    // ============ 维护计划状态 ============
    /**
     * 维护计划状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    planStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'planStatuses')
    },

    /**
     * 维护计划状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    planStatusLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.planStatuses?.labels || {}
    },

    // ============ 维护任务类型 ============
    /**
     * 维护任务类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    taskTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'taskTypes')
    },

    /**
     * 维护任务类型标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    taskTypeLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.taskTypes?.labels || {}
    },

    // ============ 维护任务状态 ============
    /**
     * 维护任务状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    taskStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'taskStatuses')
    },

    /**
     * 维护任务状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    taskStatusLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.taskStatuses?.labels || {}
    },

    // ============ 故障等级 ============
    /**
     * 故障等级选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    failureLevelOptions() {
      return this.$getDictOptions(MODULE_NAME, 'failureLevels')
    },

    /**
     * 故障等级标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    failureLevelLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.failureLevels?.labels || {}
    },

    // ============ 影响程度 ============
    /**
     * 影响程度选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    impactDegreeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'impactDegrees')
    },

    // ============ 故障类型 ============
    /**
     * 故障类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    failureTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'failureTypes')
    },

    // ============ 故障处理状态 ============
    /**
     * 故障处理状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    failureStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'failureStatuses')
    },

    /**
     * 故障处理状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射
     */
    failureStatusLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.failureStatuses?.labels || {}
    }
  },

  methods: {
    // ============ 维护类型标签 ============
    /**
     * 获取维护类型标签
     * @param {string} type - 维护类型值
     * @returns {string} 标签文本
     */
    getMaintenanceTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'maintenanceTypes', type)
    },

    // ============ 维护周期类型标签 ============
    /**
     * 获取维护周期类型标签
     * @param {string} type - 周期类型值
     * @returns {string} 标签文本
     */
    getCycleTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'cycleTypes', type)
    },

    // ============ 周期单位标签 ============
    /**
     * 获取周期单位标签
     * @param {string} unit - 周期单位值
     * @returns {string} 标签文本
     */
    getCycleUnitLabel(unit) {
      return this.$getDictLabel(MODULE_NAME, 'cycleUnits', unit)
    },

    /**
     * 根据周期类型获取对应的单位选项
     * @param {string} cycleType - 周期类型
     * @returns {Array<{value: string, label: string}>}
     */
    getCycleUnitOptionsByCycleType(cycleType) {
      if (cycleType === '按时间') {
        return this.timeBasedCycleUnitOptions
      } else if (cycleType === '按运行时长') {
        return this.runtimeBasedCycleUnitOptions
      } else if (cycleType === '按生产批次') {
        return this.batchBasedCycleUnitOptions
      }
      return []
    },

    // ============ 维护计划状态标签 ============
    /**
     * 获取维护计划状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getPlanStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'planStatuses', status)
    },

    // ============ 维护任务类型标签 ============
    /**
     * 获取维护任务类型标签
     * @param {string} type - 任务类型值
     * @returns {string} 标签文本
     */
    getTaskTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'taskTypes', type)
    },

    // ============ 维护任务状态标签 ============
    /**
     * 获取维护任务状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getTaskStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'taskStatuses', status)
    },

    // ============ 故障等级标签 ============
    /**
     * 获取故障等级标签
     * @param {string} level - 等级值
     * @returns {string} 标签文本
     */
    getFailureLevelLabel(level) {
      return this.$getDictLabel(MODULE_NAME, 'failureLevels', level)
    },

    // ============ 影响程度标签 ============
    /**
     * 获取影响程度标签
     * @param {string} degree - 影响程度值
     * @returns {string} 标签文本
     */
    getImpactDegreeLabel(degree) {
      return this.$getDictLabel(MODULE_NAME, 'impactDegrees', degree)
    },

    // ============ 故障类型标签 ============
    /**
     * 获取故障类型标签
     * @param {string} type - 故障类型值
     * @returns {string} 标签文本
     */
    getFailureTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'failureTypes', type)
    },

    // ============ 故障处理状态标签 ============
    /**
     * 获取故障处理状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getFailureStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'failureStatuses', status)
    },

    // ============ 加载字典 ============
    /**
     * 加载TPM模块字典
     * @returns {Promise<void>}
     */
    async loadTPMDictionary() {
      await this.$loadDictionary(MODULE_NAME, getAllDictionaries, CACHE_KEY)
    },

    // ============ 字典状态检查 ============
    /**
     * 检查TPM模块字典是否已加载
     * @returns {boolean}
     */
    isTPMDictionaryLoaded() {
      return this.$isDictionaryLoaded(MODULE_NAME)
    }
  }
}

