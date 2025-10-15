/**
 * 文件名称：dictionaryBase.js
 * 文件描述：字典基础 Mixin - 提供通用的字典访问方法
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，作为所有模块字典 mixin 的基础
 *
 * 说明：
 * - 提供最基础的字典访问能力
 * - 各模块可继承此 mixin 并扩展业务方法
 * - 不包含任何模块特定的业务逻辑
 *
 * 使用方式：
 * import dictionaryBase from '@/mixins/dictionaryBase'
 *
 * export default {
 *   mixins: [dictionaryBase],
 *   // 扩展模块特定方法...
 * }
 */

export default {
  methods: {
    /**
     * 通用：获取字典标签
     * @param {string} moduleName - 模块名称（如 'processTemplate', 'productionPlan'）
     * @param {string} dictType - 字典类型（如 'templateStatuses'）
     * @param {string} value - 枚举值
     * @returns {string} 标签文本（如果字典未加载，返回原值）
     *
     * @example
     * this.$getDictLabel('processTemplate', 'templateStatuses', '草稿')
     * // 返回: "草稿"
     */
    $getDictLabel(moduleName, dictType, value) {
      if (!moduleName || !dictType) {
        console.warn('[Dictionary] $getDictLabel: moduleName 或 dictType 为空')
        return value || ''
      }

      const state = this.$store.state.dictionary

      // 兼容新旧数据结构
      const moduleData = state.modules?.[moduleName] || state[moduleName]

      if (!moduleData) {
        console.warn(`[Dictionary] 模块 "${moduleName}" 字典未加载`)
        return value || ''
      }

      const dict = moduleData[dictType]
      if (!dict) {
        console.warn(`[Dictionary] 字典类型 "${dictType}" 不存在于模块 "${moduleName}"`)
        return value || ''
      }

      return dict.labels?.[value] || value || ''
    },

    /**
     * 通用：获取字典选项（用于下拉框）
     * @param {string} moduleName - 模块名称
     * @param {string} dictType - 字典类型
     * @returns {Array<{value: string, label: string}>} 选项数组
     *
     * @example
     * this.$getDictOptions('processTemplate', 'templateStatuses')
     * // 返回: [{ value: '草稿', label: '草稿' }, ...]
     */
    $getDictOptions(moduleName, dictType) {
      if (!moduleName || !dictType) {
        console.warn('[Dictionary] $getDictOptions: moduleName 或 dictType 为空')
        return []
      }

      const state = this.$store.state.dictionary

      // 兼容新旧数据结构
      const moduleData = state.modules?.[moduleName] || state[moduleName]

      if (!moduleData) {
        console.warn(`[Dictionary] 模块 "${moduleName}" 字典未加载`)
        return []
      }

      const dict = moduleData[dictType]
      if (!dict || !dict.values || !dict.labels) {
        console.warn(`[Dictionary] 字典类型 "${dictType}" 数据不完整`)
        return []
      }

      return Object.keys(dict.values).map(key => ({
        value: key,
        label: dict.labels[key] || key
      }))
    },

    /**
     * 通用：加载模块字典
     * @param {string} moduleName - 模块名称
     * @param {Function} apiFunction - API 函数
     * @param {string} cacheKey - localStorage 缓存键
     * @returns {Promise<void>}
     *
     * @example
     * await this.$loadDictionary('processTemplate', getAllDictionaries, 'processTemplateDictionaries')
     */
    async $loadDictionary(moduleName, apiFunction, cacheKey) {
      if (!moduleName || !apiFunction || !cacheKey) {
        console.error('[Dictionary] $loadDictionary: 缺少必需参数')
        return
      }

      try {
        await this.$store.dispatch('dictionary/loadModuleDictionaries', {
          moduleName,
          apiFunction,
          cacheKey
        })
      } catch (error) {
        console.error(`[Dictionary] 加载模块 "${moduleName}" 字典失败:`, error)
      }
    },

    /**
     * 通用：检查字典是否已加载
     * @param {string} moduleName - 模块名称
     * @returns {boolean}
     */
    $isDictionaryLoaded(moduleName) {
      const state = this.$store.state.dictionary

      // 兼容新旧数据结构
      if (state.loaded?.[moduleName] !== undefined) {
        return state.loaded[moduleName]
      }

      // 旧版兼容
      if (moduleName === 'productionPlan') {
        return state.loaded || false
      }
      if (moduleName === 'processTemplate') {
        return state.processTemplateLoaded || false
      }

      return false
    }
  }
}

