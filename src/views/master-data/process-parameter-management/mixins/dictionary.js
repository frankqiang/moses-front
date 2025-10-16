/**
 * 文件名称：dictionary.js
 * 文件描述：工艺模板模块字典 Mixin
 * 创建日期：2025-10-16
 * 修改记录：
 *   - 2025-10-16: 初始创建，从旧版迁移到模块化架构
 *
 * 说明：
 * - 继承自 dictionaryBase 提供的基础能力
 * - 封装工艺模板相关的便捷方法
 * - 供工艺参数管理模块使用
 *
 * 使用方式：
 * import processTemplateDictionaryMixin from './mixins/dictionary'
 *
 * export default {
 *   mixins: [processTemplateDictionaryMixin],
 *   async created() {
 *     await this.loadProcessTemplateDictionary()
 *   }
 * }
 */

import dictionaryBase from '@/mixins/dictionaryBase'

const MODULE_NAME = 'processTemplate'

export default {
  mixins: [dictionaryBase],

  computed: {
    // ============ 工艺模板状态 ============
    /**
     * 工艺模板状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    templateStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'templateStatuses')
    },

    /**
     * 工艺模板状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射 { "DRAFT": "草稿", ... }
     */
    templateStatusLabels() {
      const state = this.$store.state.dictionary.processTemplate
      return state?.templateStatuses?.values || {}
    },

    // ============ 工艺模板版本状态 ============
    /**
     * 工艺模板版本状态选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    templateVersionStatusOptions() {
      return this.$getDictOptions(MODULE_NAME, 'templateVersionStatuses')
    },

    /**
     * 工艺模板版本状态标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射 { "DRAFT": "草稿", ... }
     */
    templateVersionStatusLabels() {
      const state = this.$store.state.dictionary.processTemplate
      return state?.templateVersionStatuses?.values || {}
    },

    // ============ 保护气氛类型 ============
    /**
     * 保护气氛类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    atmosphereTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'atmosphereTypes')
    },

    /**
     * 保护气氛类型标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射 { "PURE_NITROGEN": "纯氮气", ... }
     */
    atmosphereTypeLabels() {
      const state = this.$store.state.dictionary.processTemplate
      return state?.atmosphereTypes?.values || {}
    },

    // ============ 循环风机速度 ============
    /**
     * 循环风机速度选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    circulationFanSpeedOptions() {
      return this.$getDictOptions(MODULE_NAME, 'circulationFanSpeeds')
    },

    /**
     * 循环风机速度标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射 { "LOW": "低速", ... }
     */
    circulationFanSpeedLabels() {
      const state = this.$store.state.dictionary.processTemplate
      return state?.circulationFanSpeeds?.values || {}
    },

    // ============ 控温方式 ============
    /**
     * 控温方式选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    controlModeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'controlModes')
    },

    /**
     * 控温方式标签映射（用于表格 textMap）
     * @returns {Object} 键值对映射 { "TIME_TEMP": "定时定温", ... }
     */
    controlModeLabels() {
      const state = this.$store.state.dictionary.processTemplate
      return state?.controlModes?.values || {}
    }
  },

  methods: {
    // ============ 工艺模板状态标签 ============
    /**
     * 获取工艺模板状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getTemplateStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'templateStatuses', status)
    },

    // ============ 工艺模板版本状态标签 ============
    /**
     * 获取工艺模板版本状态标签
     * @param {string} status - 状态值
     * @returns {string} 标签文本
     */
    getTemplateVersionStatusLabel(status) {
      return this.$getDictLabel(MODULE_NAME, 'templateVersionStatuses', status)
    },

    // ============ 保护气氛类型标签 ============
    /**
     * 获取保护气氛类型标签
     * @param {string} type - 类型值
     * @returns {string} 标签文本
     */
    getAtmosphereTypeLabel(type) {
      return this.$getDictLabel(MODULE_NAME, 'atmosphereTypes', type)
    },

    // ============ 循环风机速度标签 ============
    /**
     * 获取循环风机速度标签
     * @param {string} speed - 速度值
     * @returns {string} 标签文本
     */
    getCirculationFanSpeedLabel(speed) {
      return this.$getDictLabel(MODULE_NAME, 'circulationFanSpeeds', speed)
    },

    // ============ 控温方式标签 ============
    /**
     * 获取控温方式标签
     * @param {string} mode - 控温方式值
     * @returns {string} 标签文本
     */
    getControlModeLabel(mode) {
      return this.$getDictLabel(MODULE_NAME, 'controlModes', mode)
    },

    // ============ 加载字典 ============
    /**
     * 加载工艺模板模块字典
     * @returns {Promise<void>}
     */
    async loadProcessTemplateDictionary() {
      await this.$loadDictionary(MODULE_NAME)
    },

    // ============ 字典状态检查 ============
    /**
     * 检查工艺模板模块字典是否已加载
     * @returns {boolean}
     */
    isProcessTemplateDictionaryLoaded() {
      return this.$isDictionaryLoaded(MODULE_NAME)
    }
  }
}
