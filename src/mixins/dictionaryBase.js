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
     * @param {string} moduleName - 模块名称（如 'tpm', 'processTemplate', 'productionPlan'）
     * @param {string} dictType - 字典类型（如 'templateStatuses'）
     * @param {string} value - 枚举值（英文枚举键，如 'DRAFT'）
     * @returns {string} 标签文本（中文标签，如 '草稿'）
     *
     * @example
     * this.$getDictLabel('processTemplate', 'templateStatuses', 'DRAFT')
     * // 返回: "草稿"
     */
    $getDictLabel(moduleName, dictType, value) {
      if (!moduleName || !dictType) {
        console.warn('[Dictionary] $getDictLabel: moduleName 或 dictType 为空')
        return value || ''
      }

      // 新架构：从子模块获取数据
      const moduleState = this.$store.state.dictionary[moduleName]

      if (!moduleState) {
        console.warn(`[Dictionary] 模块 "${moduleName}" 字典未加载`)
        return value || ''
      }

      const dict = moduleState[dictType]
      if (!dict) {
        console.warn(`[Dictionary] 字典类型 "${dictType}" 不存在于模块 "${moduleName}"`)
        return value || ''
      }

      // 修复：使用 values[value] 获取中文标签
      // 因为 values 的结构是 { "DRAFT": "草稿" }，key 是英文枚举，value 是中文标签
      return dict.values?.[value] || value || ''
    },

    /**
     * 通用：获取字典选项（用于下拉框）
     * @param {string} moduleName - 模块名称
     * @param {string} dictType - 字典类型
     * @returns {Array<{value: string, label: string}>} 选项数组
     *
     * @example
     * this.$getDictOptions('tpm', 'planStatuses')
     * // 返回: [{ value: 'DRAFT', label: '草稿' }, ...]
     */
    $getDictOptions(moduleName, dictType) {
      if (!moduleName || !dictType) {
        console.warn('[Dictionary] $getDictOptions: moduleName 或 dictType 为空')
        return []
      }

      // 新架构：从子模块获取数据
      const moduleState = this.$store.state.dictionary[moduleName]

      if (!moduleState) {
        console.warn(`[Dictionary] 模块 "${moduleName}" 字典未加载`)
        return []
      }

      const dict = moduleState[dictType]
      if (!dict || !dict.values) {
        console.warn(`[Dictionary] 字典类型 "${dictType}" 数据不完整`)
        return []
      }

      // 修复：使用 values[key] 获取中文标签，而不是 labels[key]
      // 因为 values 的结构是 { "DRAFT": "草稿" }，key 是英文枚举，value 是中文标签
      return Object.keys(dict.values).map(key => ({
        value: key,
        label: dict.values[key] || key
      }))
    },

    /**
     * 通用：加载模块字典（新版模块化方式）
     * @param {string} moduleName - 模块名称（tpm, productionPlan, processTemplate）
     * @returns {Promise<void>}
     *
     * @example
     * await this.$loadDictionary('tpm')
     */
    async $loadDictionary(moduleName) {
      if (!moduleName) {
        console.error('[Dictionary] $loadDictionary: 缺少 moduleName 参数')
        return
      }

      try {
        // 新架构：直接调用子模块的 action
        await this.$store.dispatch(`dictionary/${moduleName}/loadDictionaries`)
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
      // 新架构：检查子模块的 loaded 状态
      const moduleState = this.$store.state.dictionary[moduleName]

      if (!moduleState) {
        return false
      }

      return moduleState.loaded || false
    }
  }
}

