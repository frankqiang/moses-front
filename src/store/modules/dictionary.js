/**
 * 文件名称：dictionary.js
 * 文件描述：枚举字典Vuex模块 - 统一管理所有模块的枚举字典
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-10-15: 添加工艺模板模块字典支持
 */

import { getAllDictionaries as getProductionPlanDictionaries } from '@/views/production-management/production-plan-management/api'
import { getAllDictionaries as getProcessTemplateDictionaries } from '@/views/master-data/process-parameter-management/api'

const CACHE_KEY = 'app_dictionaries_cache'
const PROCESS_TEMPLATE_CACHE_KEY = 'processTemplateDictionaries'
const CACHE_VALIDITY_HOURS = 24 // 缓存有效期24小时

const state = {
  // 生产计划相关字典
  productionPlan: {
    planStatuses: {},
    planItemStatuses: {},
    planPriorities: {},
    planSources: {},
    processTemplateLinkTypes: {},
    equipmentLinkTypes: {},
    changeTypes: {},
    operationSources: {}
  },
  // 工艺模板相关字典
  processTemplate: {
    templateStatuses: {},
    templateVersionStatuses: {},
    atmosphereTypes: {},
    circulationFanSpeeds: {},
    controlModes: {}
  },
  // 字典加载状态
  loaded: false,
  loading: false,
  processTemplateLoaded: false,
  processTemplateLoading: false
}

const mutations = {
  SET_PRODUCTION_PLAN_DICTIONARIES(state, dictionaries) {
    state.productionPlan = {
      planStatuses: dictionaries.planStatuses || {},
      planItemStatuses: dictionaries.planItemStatuses || {},
      planPriorities: dictionaries.planPriorities || {},
      planSources: dictionaries.planSources || {},
      processTemplateLinkTypes: dictionaries.processTemplateLinkTypes || {},
      equipmentLinkTypes: dictionaries.equipmentLinkTypes || {},
      changeTypes: dictionaries.changeTypes || {},
      operationSources: dictionaries.operationSources || {}
    }
  },
  SET_PROCESS_TEMPLATE_DICTIONARIES(state, dictionaries) {
    state.processTemplate = {
      templateStatuses: dictionaries.templateStatuses || {},
      templateVersionStatuses: dictionaries.templateVersionStatuses || {},
      atmosphereTypes: dictionaries.atmosphereTypes || {},
      circulationFanSpeeds: dictionaries.circulationFanSpeeds || {},
      controlModes: dictionaries.controlModes || {}
    }
  },
  SET_LOADED(state, loaded) {
    state.loaded = loaded
  },
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_PROCESS_TEMPLATE_LOADED(state, loaded) {
    state.processTemplateLoaded = loaded
  },
  SET_PROCESS_TEMPLATE_LOADING(state, loading) {
    state.processTemplateLoading = loading
  }
}

const actions = {
  /**
   * 加载生产计划字典
   * @param {boolean} forceRefresh - 是否强制刷新（忽略缓存）
   */
  async loadProductionPlanDictionaries({ commit, state }, forceRefresh = false) {
    // 如果已加载且不强制刷新，直接返回
    if (state.loaded && !forceRefresh) {
      return
    }

    // 检查缓存
    if (!forceRefresh) {
      const cachedData = getCachedDictionaries()
      if (cachedData) {
        commit('SET_PRODUCTION_PLAN_DICTIONARIES', cachedData)
        commit('SET_LOADED', true)
        console.log('[Dictionary] 从缓存加载字典数据')
        return
      }
    }

    // 从服务器加载
    try {
      commit('SET_LOADING', true)
      const response = await getProductionPlanDictionaries()

      if (response.success && response.data) {
        commit('SET_PRODUCTION_PLAN_DICTIONARIES', response.data)
        commit('SET_LOADED', true)

        // 保存到缓存
        saveDictionariesToCache(response.data)
        console.log('[Dictionary] 从服务器加载字典数据')
      } else {
        console.error('[Dictionary] 加载字典失败:', response)
      }
    } catch (error) {
      console.error('[Dictionary] 加载字典异常:', error)
      // 加载失败时尝试使用缓存
      const cachedData = getCachedDictionaries(true) // 忽略有效期
      if (cachedData) {
        commit('SET_PRODUCTION_PLAN_DICTIONARIES', cachedData)
        commit('SET_LOADED', true)
        console.warn('[Dictionary] 加载失败，使用过期缓存')
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 清除字典缓存
   */
  clearDictionaryCache({ commit }) {
    localStorage.removeItem(CACHE_KEY)
    commit('SET_LOADED', false)
    console.log('[Dictionary] 清除字典缓存')
  },

  /**
   * 加载工艺模板字典
   * @param {boolean} forceRefresh - 是否强制刷新（忽略缓存）
   */
  async loadProcessTemplateDictionaries({ commit, state }, forceRefresh = false) {
    // 如果已加载且不强制刷新，直接返回
    if (state.processTemplateLoaded && !forceRefresh) {
      return
    }

    // 检查缓存
    if (!forceRefresh) {
      const cachedData = getProcessTemplateCachedDictionaries()
      if (cachedData) {
        commit('SET_PROCESS_TEMPLATE_DICTIONARIES', cachedData)
        commit('SET_PROCESS_TEMPLATE_LOADED', true)
        console.log('[Dictionary] 工艺模板字典从缓存加载')
        return
      }
    }

    // 从服务器加载
    try {
      commit('SET_PROCESS_TEMPLATE_LOADING', true)
      const response = await getProcessTemplateDictionaries()

      if (response.success && response.data) {
        commit('SET_PROCESS_TEMPLATE_DICTIONARIES', response.data)
        commit('SET_PROCESS_TEMPLATE_LOADED', true)

        // 保存到缓存
        saveProcessTemplateDictionariesToCache(response.data)
        console.log('[Dictionary] 工艺模板字典从服务器加载')
      } else {
        console.error('[Dictionary] 加载工艺模板字典失败:', response)
      }
    } catch (error) {
      console.error('[Dictionary] 加载工艺模板字典异常:', error)
      // 加载失败时尝试使用缓存
      const cachedData = getProcessTemplateCachedDictionaries(true) // 忽略有效期
      if (cachedData) {
        commit('SET_PROCESS_TEMPLATE_DICTIONARIES', cachedData)
        commit('SET_PROCESS_TEMPLATE_LOADED', true)
        console.warn('[Dictionary] 加载失败，使用过期缓存')
      }
    } finally {
      commit('SET_PROCESS_TEMPLATE_LOADING', false)
    }
  },

  /**
   * 调试：测试后端接口（强制调用，忽略缓存）
   */
  async debugTestAPI({ commit }) {
    console.log('🧪 [Dictionary Debug] 开始测试后端接口...')

    try {
      commit('SET_LOADING', true)
      const response = await getProductionPlanDictionaries()

      console.log('📡 [Dictionary Debug] 接口响应:', response)

      if (response.success && response.data) {
        // 检查数据结构
        console.log('🔍 [Dictionary Debug] 数据结构检查:')

        Object.keys(response.data).forEach(key => {
          const dict = response.data[key]
          console.log(`   ${key}:`, {
            hasValues: !!dict.values,
            hasLabels: !!dict.labels,
            valuesCount: dict.values ? Object.keys(dict.values).length : 0,
            labelsCount: dict.labels ? Object.keys(dict.labels).length : 0
          })
        })

        // 测试存储和获取
        commit('SET_PRODUCTION_PLAN_DICTIONARIES', response.data)
        commit('SET_LOADED', true)
        saveDictionariesToCache(response.data)

        console.log('✅ [Dictionary Debug] 接口测试成功，数据已更新')

        return response.data
      } else {
        console.error('❌ [Dictionary Debug] 接口返回失败:', response)
        return null
      }
    } catch (error) {
      console.error('❌ [Dictionary Debug] 接口调用异常:', error)
      return null
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

const getters = {
  /**
   * 获取计划状态标签
   */
  getPlanStatusLabel: (state) => (status) => {
    return state.productionPlan.planStatuses?.labels?.[status] || status
  },

  /**
   * 获取子批次状态标签
   */
  getPlanItemStatusLabel: (state) => (status) => {
    return state.productionPlan.planItemStatuses?.labels?.[status] || status
  },

  /**
   * 获取计划优先级标签
   */
  getPlanPriorityLabel: (state) => (priority) => {
    return state.productionPlan.planPriorities?.labels?.[priority] || priority
  },

  /**
   * 获取计划来源标签
   */
  getPlanSourceLabel: (state) => (source) => {
    return state.productionPlan.planSources?.labels?.[source] || source
  },

  /**
   * 获取工艺模板关联类型标签
   */
  getProcessTemplateLinkTypeLabel: (state) => (type) => {
    return state.productionPlan.processTemplateLinkTypes?.labels?.[type] || type
  },

  /**
   * 获取设备关联类型标签
   */
  getEquipmentLinkTypeLabel: (state) => (type) => {
    return state.productionPlan.equipmentLinkTypes?.labels?.[type] || type
  },

  /**
   * 获取变更类型标签
   */
  getChangeTypeLabel: (state) => (type) => {
    return state.productionPlan.changeTypes?.labels?.[type] || type
  },

  /**
   * 获取操作来源标签
   */
  getOperationSourceLabel: (state) => (source) => {
    return state.productionPlan.operationSources?.labels?.[source] || source
  },

  /**
   * 获取计划状态选项（用于下拉框）
   */
  planStatusOptions: (state) => {
    const dict = state.productionPlan.planStatuses
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  /**
   * 获取子批次状态选项（用于下拉框）
   */
  planItemStatusOptions: (state) => {
    const dict = state.productionPlan.planItemStatuses
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  /**
   * 获取计划优先级选项（用于下拉框）
   */
  planPriorityOptions: (state) => {
    const dict = state.productionPlan.planPriorities
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  /**
   * 获取计划来源选项（用于下拉框）
   */
  planSourceOptions: (state) => {
    const dict = state.productionPlan.planSources
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  // ============ 工艺模板相关 getters ============

  /**
   * 获取工艺模板状态标签
   */
  getTemplateStatusLabel: (state) => (status) => {
    return state.processTemplate.templateStatuses?.labels?.[status] || status
  },

  /**
   * 获取工艺模板版本状态标签
   */
  getTemplateVersionStatusLabel: (state) => (status) => {
    return state.processTemplate.templateVersionStatuses?.labels?.[status] || status
  },

  /**
   * 获取保护气氛类型标签
   */
  getAtmosphereTypeLabel: (state) => (type) => {
    return state.processTemplate.atmosphereTypes?.labels?.[type] || type
  },

  /**
   * 获取循环风机速度标签
   */
  getCirculationFanSpeedLabel: (state) => (speed) => {
    return state.processTemplate.circulationFanSpeeds?.labels?.[speed] || speed
  },

  /**
   * 获取控温方式标签
   */
  getControlModeLabel: (state) => (mode) => {
    return state.processTemplate.controlModes?.labels?.[mode] || mode
  },

  /**
   * 获取工艺模板状态选项（用于下拉框）
   */
  templateStatusOptions: (state) => {
    const dict = state.processTemplate.templateStatuses
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  /**
   * 获取工艺模板版本状态选项（用于下拉框）
   */
  templateVersionStatusOptions: (state) => {
    const dict = state.processTemplate.templateVersionStatuses
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  /**
   * 获取保护气氛类型选项（用于下拉框）
   */
  atmosphereTypeOptions: (state) => {
    const dict = state.processTemplate.atmosphereTypes
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  /**
   * 获取循环风机速度选项（用于下拉框）
   */
  circulationFanSpeedOptions: (state) => {
    const dict = state.processTemplate.circulationFanSpeeds
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  },

  /**
   * 获取控温方式选项（用于下拉框）
   */
  controlModeOptions: (state) => {
    const dict = state.processTemplate.controlModes
    if (!dict.values || !dict.labels) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.labels[key]
    }))
  }
}

/**
 * 从缓存获取字典数据
 * @param {boolean} ignoreExpiry - 是否忽略有效期
 * @returns {Object|null}
 */
function getCachedDictionaries(ignoreExpiry = false) {
  try {
    const cached = localStorage.getItem(CACHE_KEY)

    if (!cached) {
      return null
    }

    const cacheData = JSON.parse(cached)

    // 检查新格式（包含timestamp）
    if (cacheData.data && cacheData.timestamp) {
      // 检查有效期
      if (!ignoreExpiry) {
        const now = Date.now()
        const validityMs = CACHE_VALIDITY_HOURS * 60 * 60 * 1000

        if (now - cacheData.timestamp > validityMs) {
          console.log('[Dictionary] 缓存已过期')
          return null
        }
      }

      return cacheData.data
    }

    // 兼容旧格式（直接数据），同时清理旧的timestamp key
    localStorage.removeItem('app_dictionaries_timestamp')
    console.log('[Dictionary] 检测到旧格式缓存，已清理')
    return null
  } catch (error) {
    console.error('[Dictionary] 读取缓存失败:', error)
    return null
  }
}

/**
 * 保存字典数据到缓存
 * @param {Object} data - 字典数据
 */
function saveDictionariesToCache(data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))

    // 清理旧的timestamp key（如果存在）
    localStorage.removeItem('app_dictionaries_timestamp')

    console.log('[Dictionary] 缓存已保存（新格式）')
  } catch (error) {
    console.error('[Dictionary] 保存缓存失败:', error)
  }
}

/**
 * 从缓存获取工艺模板字典数据
 * @param {boolean} ignoreExpiry - 是否忽略有效期
 * @returns {Object|null}
 */
function getProcessTemplateCachedDictionaries(ignoreExpiry = false) {
  try {
    const cached = localStorage.getItem(PROCESS_TEMPLATE_CACHE_KEY)

    if (!cached) {
      return null
    }

    const cacheData = JSON.parse(cached)

    // 检查格式（包含timestamp）
    if (cacheData.data && cacheData.timestamp) {
      // 检查有效期
      if (!ignoreExpiry) {
        const now = Date.now()
        const validityMs = CACHE_VALIDITY_HOURS * 60 * 60 * 1000

        if (now - cacheData.timestamp > validityMs) {
          console.log('[Dictionary] 工艺模板字典缓存已过期')
          return null
        }
      }

      return cacheData.data
    }

    return null
  } catch (error) {
    console.error('[Dictionary] 读取工艺模板字典缓存失败:', error)
    return null
  }
}

/**
 * 保存工艺模板字典数据到缓存
 * @param {Object} data - 字典数据
 */
function saveProcessTemplateDictionariesToCache(data) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    }
    localStorage.setItem(PROCESS_TEMPLATE_CACHE_KEY, JSON.stringify(cacheData))
    console.log('[Dictionary] 工艺模板字典缓存已保存')
  } catch (error) {
    console.error('[Dictionary] 保存工艺模板字典缓存失败:', error)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

