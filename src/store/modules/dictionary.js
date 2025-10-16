/**
 * 文件名称：dictionary.js
 * 文件描述：字典模块主入口 - 协调管理所有业务模块的字典
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-10-15: 添加工艺模板模块字典支持
 *   - 2025-10-16: 重构为模块化架构，拆分各业务模块到独立文件
 *
 * ==================== 模块化架构说明 ====================
 *
 * 本文件作为字典模块的主入口，负责：
 * 1. 注册各业务模块的字典子模块（通过 Vuex modules）
 * 2. 提供向后兼容的 getters（代理到子模块）
 * 3. 保持旧版 API 的可用性
 *
 * 【目录结构】
 * src/store/modules/
 * ├── dictionary.js              # 主入口（本文件）
 * └── dictionary/                # 字典子模块目录
 *     ├── productionPlan.js     # 生产计划字典
 *     ├── processTemplate.js    # 工艺模板字典
 *     ├── tpm.js                # TPM字典
 *     └── ...                   # 其他模块字典
 *
 * 【使用方式】
 *
 * 1. 新版模块化方式（推荐）：
 * ```javascript
 * // 加载字典
 * await this.$store.dispatch('dictionary/productionPlan/loadDictionaries')
 *
 * // 获取数据
 * const label = this.$store.getters['dictionary/productionPlan/getPlanStatusLabel']('草稿')
 * const options = this.$store.getters['dictionary/productionPlan/planStatusOptions']
 * ```
 *
 * 2. 旧版方式（保持兼容）：
 * ```javascript
 * // 仍然可用
 * const label = this.$store.getters['dictionary/getPlanStatusLabel']('草稿')
 * ```
 *
 * 【扩展新模块】
 * 1. 在 dictionary/ 目录下创建新的模块文件
 * 2. 在本文件的 modules 中注册
 * 3. 无需修改其他代码，自动支持模块化访问
 */

import productionPlan from './dictionary/productionPlan/index'
import processTemplate from './dictionary/processTemplate/index'
import tpm from './dictionary/tpm/index'

const state = {
  // 主模块不再存储具体数据，只做协调
  // 所有数据都在子模块中管理
}

const mutations = {
  // 主模块不需要 mutations
}

const actions = {
  /**
   * 加载所有模块字典（可选功能）
   */
  async loadAll({ dispatch }) {
    const modules = ['productionPlan', 'processTemplate', 'tpm']
    await Promise.all(modules.map(module => dispatch(`${module}/loadDictionaries`)))
    console.log('[Dictionary] 所有模块字典加载完成')
  },

  /**
   * 清除所有模块缓存（可选功能）
   */
  clearAllCaches({ dispatch }) {
    const modules = ['productionPlan', 'processTemplate', 'tpm']
    modules.forEach(module => dispatch(`${module}/clearCache`))
    console.log('[Dictionary] 所有模块缓存已清除')
  }
}

const getters = {
  // ==================== 向后兼容的 Getters ====================
  // 代理到子模块，保持旧版 API 可用

  // ============ 生产计划模块 ============
  getPlanStatusLabel: (state, getters, rootState, rootGetters) => (status) => {
    return rootGetters['dictionary/productionPlan/getPlanStatusLabel'](status)
  },

  getPlanItemStatusLabel: (state, getters, rootState, rootGetters) => (status) => {
    return rootGetters['dictionary/productionPlan/getPlanItemStatusLabel'](status)
  },

  getPlanPriorityLabel: (state, getters, rootState, rootGetters) => (priority) => {
    return rootGetters['dictionary/productionPlan/getPlanPriorityLabel'](priority)
  },

  getPlanSourceLabel: (state, getters, rootState, rootGetters) => (source) => {
    return rootGetters['dictionary/productionPlan/getPlanSourceLabel'](source)
  },

  getProcessTemplateLinkTypeLabel: (state, getters, rootState, rootGetters) => (type) => {
    return rootGetters['dictionary/productionPlan/getProcessTemplateLinkTypeLabel'](type)
  },

  getEquipmentLinkTypeLabel: (state, getters, rootState, rootGetters) => (type) => {
    return rootGetters['dictionary/productionPlan/getEquipmentLinkTypeLabel'](type)
  },

  getChangeTypeLabel: (state, getters, rootState, rootGetters) => (type) => {
    return rootGetters['dictionary/productionPlan/getChangeTypeLabel'](type)
  },

  getOperationSourceLabel: (state, getters, rootState, rootGetters) => (source) => {
    return rootGetters['dictionary/productionPlan/getOperationSourceLabel'](source)
  },

  planStatusOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/productionPlan/planStatusOptions']
  },

  planItemStatusOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/productionPlan/planItemStatusOptions']
  },

  planPriorityOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/productionPlan/planPriorityOptions']
  },

  planSourceOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/productionPlan/planSourceOptions']
  },

  // ============ 工艺模板模块 ============
  getTemplateStatusLabel: (state, getters, rootState, rootGetters) => (status) => {
    return rootGetters['dictionary/processTemplate/getTemplateStatusLabel'](status)
  },

  getTemplateVersionStatusLabel: (state, getters, rootState, rootGetters) => (status) => {
    return rootGetters['dictionary/processTemplate/getTemplateVersionStatusLabel'](status)
  },

  getAtmosphereTypeLabel: (state, getters, rootState, rootGetters) => (type) => {
    return rootGetters['dictionary/processTemplate/getAtmosphereTypeLabel'](type)
  },

  getCirculationFanSpeedLabel: (state, getters, rootState, rootGetters) => (speed) => {
    return rootGetters['dictionary/processTemplate/getCirculationFanSpeedLabel'](speed)
  },

  getControlModeLabel: (state, getters, rootState, rootGetters) => (mode) => {
    return rootGetters['dictionary/processTemplate/getControlModeLabel'](mode)
  },

  templateStatusOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/processTemplate/templateStatusOptions']
  },

  templateVersionStatusOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/processTemplate/templateVersionStatusOptions']
  },

  atmosphereTypeOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/processTemplate/atmosphereTypeOptions']
  },

  circulationFanSpeedOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/processTemplate/circulationFanSpeedOptions']
  },

  controlModeOptions: (state, getters, rootState, rootGetters) => {
    return rootGetters['dictionary/processTemplate/controlModeOptions']
  }

  // 注意：TPM 模块使用新的 dictionaryBase mixin，不需要在这里代理
  // TPM 通过 this.$store.getters['dictionary/tpm/xxx'] 访问
}

export default {
  namespaced: true,
  modules: {
    productionPlan,
    processTemplate,
    tpm
  },
  state,
  mutations,
  actions,
  getters
}
