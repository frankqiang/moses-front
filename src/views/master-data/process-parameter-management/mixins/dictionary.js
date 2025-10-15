/**
 * 文件名称：dictionary.js
 * 文件描述：工艺参数管理模块字典 Mixin
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，从公共 mixin 迁移到模块私有
 *
 * 说明：
 * - 继承自 dictionaryBase 提供的基础能力
 * - 封装工艺模板相关的便捷方法
 * - 仅供本模块内组件使用
 *
 * 使用方式：
 * import dictionaryMixin from '../mixins/dictionary'
 *
 * export default {
 *   mixins: [dictionaryMixin],
 *   async created() {
 *     await this.loadProcessTemplateDictionary()
 *   }
 * }
 */

import dictionaryBase from '@/mixins/dictionaryBase'
import { getAllDictionaries } from '../api'

const MODULE_NAME = 'processTemplate'
const CACHE_KEY = 'processTemplateDictionaries'

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
     * @returns {Object} 键值对映射
     */
    templateStatusLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.templateStatuses?.labels || {}
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
     * @returns {Object} 键值对映射
     */
    versionStatusLabels() {
      const state = this.$store.state.dictionary
      const moduleData = state.modules?.[MODULE_NAME] || state[MODULE_NAME]
      return moduleData?.templateVersionStatuses?.labels || {}
    },

    // ============ 保护气氛类型选项 ============
    /**
     * 保护气氛类型选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    atmosphereTypeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'atmosphereTypes')
    },

    // ============ 循环风机速度选项 ============
    /**
     * 循环风机速度选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    circulationFanSpeedOptions() {
      return this.$getDictOptions(MODULE_NAME, 'circulationFanSpeeds')
    },

    // ============ 控温方式选项 ============
    /**
     * 控温方式选项（用于下拉框）
     * @returns {Array<{value: string, label: string}>}
     */
    controlModeOptions() {
      return this.$getDictOptions(MODULE_NAME, 'controlModes')
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
     * 加载工艺模板字典
     * @returns {Promise<void>}
     */
    async loadProcessTemplateDictionary() {
      await this.$loadDictionary(MODULE_NAME, getAllDictionaries, CACHE_KEY)
    },

    // ============ 字典状态检查 ============
    /**
     * 检查工艺模板字典是否已加载
     * @returns {boolean}
     */
    isProcessTemplateDictionaryLoaded() {
      return this.$isDictionaryLoaded(MODULE_NAME)
    }
  }
}

