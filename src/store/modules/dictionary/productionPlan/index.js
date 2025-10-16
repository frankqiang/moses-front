/**
 * 文件名称：productionPlan.js
 * 文件描述：生产计划模块字典 Store
 * 创建日期：2025-10-16
 * 修改记录：
 *   - 2025-10-16: 从 dictionary.js 拆分独立
 */

import { getAllDictionaries } from '@/views/production-management/production-plan-management/api'

const CACHE_KEY = 'app_dictionaries_cache'
const CACHE_VALIDITY_HOURS = 24

const state = {
  // 字典数据
  planStatuses: {},
  planItemStatuses: {},
  planPriorities: {},
  planSources: {},
  processTemplateLinkTypes: {},
  equipmentLinkTypes: {},
  changeTypes: {},
  operationSources: {},

  // 加载状态
  loaded: false,
  loading: false
}

const mutations = {
  SET_DICTIONARIES(state, dictionaries) {
    state.planStatuses = dictionaries.planStatuses || {}
    state.planItemStatuses = dictionaries.planItemStatuses || {}
    state.planPriorities = dictionaries.planPriorities || {}
    state.planSources = dictionaries.planSources || {}
    state.processTemplateLinkTypes = dictionaries.processTemplateLinkTypes || {}
    state.equipmentLinkTypes = dictionaries.equipmentLinkTypes || {}
    state.changeTypes = dictionaries.changeTypes || {}
    state.operationSources = dictionaries.operationSources || {}
  },

  SET_LOADED(state, loaded) {
    state.loaded = loaded
  },

  SET_LOADING(state, loading) {
    state.loading = loading
  }
}

const actions = {
  /**
   * 加载生产计划字典
   * @param {boolean} forceRefresh - 是否强制刷新（忽略缓存）
   */
  async loadDictionaries({ commit, state }, forceRefresh = false) {
    // 如果已加载且不强制刷新，直接返回
    if (state.loaded && !forceRefresh) {
      return
    }

    // 如果正在加载，等待完成
    if (state.loading) {
      let waitCount = 0
      while (state.loading && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 100))
        waitCount++
      }
      return
    }

    commit('SET_LOADING', true)

    try {
      // 检查缓存
      if (!forceRefresh) {
        const cachedData = getCachedDictionaries()
        if (cachedData) {
          commit('SET_DICTIONARIES', cachedData)
          commit('SET_LOADED', true)
          console.log('[ProductionPlan] 从缓存加载字典数据')
          return
        }
      }

      // 从服务器加载
      console.log('[ProductionPlan] 从服务器加载字典数据...')
      const response = await getAllDictionaries()

      if (response.success && response.data) {
        commit('SET_DICTIONARIES', response.data)
        commit('SET_LOADED', true)

        // 保存到缓存
        saveDictionariesToCache(response.data)
        console.log('[ProductionPlan] 字典数据加载成功')
      } else {
        console.error('[ProductionPlan] 加载字典失败:', response)
      }
    } catch (error) {
      console.error('[ProductionPlan] 加载字典异常:', error)

      // 加载失败时尝试使用过期缓存
      const cachedData = getCachedDictionaries(true)
      if (cachedData) {
        commit('SET_DICTIONARIES', cachedData)
        commit('SET_LOADED', true)
        console.warn('[ProductionPlan] 加载失败，使用过期缓存')
      }
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 清除字典缓存
   */
  clearCache({ commit }) {
    localStorage.removeItem(CACHE_KEY)
    commit('SET_LOADED', false)
    console.log('[ProductionPlan] 清除字典缓存')
  }
}

const getters = {
  /**
   * 获取计划状态标签
   */
  getPlanStatusLabel: (state) => (status) => {
    return state.planStatuses?.labels?.[status] || status
  },

  /**
   * 获取子批次状态标签
   */
  getPlanItemStatusLabel: (state) => (status) => {
    return state.planItemStatuses?.labels?.[status] || status
  },

  /**
   * 获取计划优先级标签
   */
  getPlanPriorityLabel: (state) => (priority) => {
    return state.planPriorities?.labels?.[priority] || priority
  },

  /**
   * 获取计划来源标签
   */
  getPlanSourceLabel: (state) => (source) => {
    return state.planSources?.labels?.[source] || source
  },

  /**
   * 获取工艺模板关联类型标签
   */
  getProcessTemplateLinkTypeLabel: (state) => (type) => {
    return state.processTemplateLinkTypes?.labels?.[type] || type
  },

  /**
   * 获取设备关联类型标签
   */
  getEquipmentLinkTypeLabel: (state) => (type) => {
    return state.equipmentLinkTypes?.labels?.[type] || type
  },

  /**
   * 获取变更类型标签
   */
  getChangeTypeLabel: (state) => (type) => {
    return state.changeTypes?.labels?.[type] || type
  },

  /**
   * 获取操作来源标签
   */
  getOperationSourceLabel: (state) => (source) => {
    return state.operationSources?.labels?.[source] || source
  },

  /**
   * 获取计划状态选项（用于下拉框）
   */
  planStatusOptions: (state) => {
    const dict = state.planStatuses
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
    const dict = state.planItemStatuses
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
    const dict = state.planPriorities
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
    const dict = state.planSources
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
    if (!cached) return null

    const cacheData = JSON.parse(cached)

    if (cacheData.data && cacheData.timestamp) {
      if (!ignoreExpiry) {
        const now = Date.now()
        const validityMs = CACHE_VALIDITY_HOURS * 60 * 60 * 1000

        if (now - cacheData.timestamp > validityMs) {
          console.log('[ProductionPlan] 缓存已过期')
          return null
        }
      }

      return cacheData.data
    }

    return null
  } catch (error) {
    console.error('[ProductionPlan] 读取缓存失败:', error)
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
    console.log('[ProductionPlan] 缓存已保存')
  } catch (error) {
    console.error('[ProductionPlan] 保存缓存失败:', error)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

