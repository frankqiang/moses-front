/**
 * 文件名称：tpm.js
 * 文件描述：TPM模块字典 Store
 * 创建日期：2025-10-16
 * 修改记录：
 *   - 2025-10-16: 创建独立的 TPM 字典 Store
 *   - 2025-10-16: 重构以适配新的后端接口格式（扁平的CODE->中文标签映射）
 */

import { getAllDictionaries } from '@/views/tpm-management/api/dictionary'

const CACHE_KEY = 'tpmDictionaries'
const CACHE_VALIDITY_HOURS = 24

const state = {
  // 字典数据
  maintenanceTypes: {},
  cycleTypes: {},
  cycleUnits: {},
  planStatuses: {},
  taskTypes: {},
  taskStatuses: {},
  failureLevels: {},
  impactDegrees: {},
  failureTypes: {},
  failureStatuses: {},

  // 加载状态
  loaded: false,
  loading: false
}

const mutations = {
  SET_DICTIONARIES(state, dictionaries) {
    // 后端返回的是扁平的 CODE->中文标签 映射，直接保存
    state.maintenanceTypes = dictionaries.maintenanceTypes || {}
    state.cycleTypes = dictionaries.cycleTypes || {}
    state.cycleUnits = dictionaries.cycleUnits || {}
    state.planStatuses = dictionaries.planStatuses || {}
    state.taskTypes = dictionaries.taskTypes || {}
    state.taskStatuses = dictionaries.taskStatuses || {}
    state.failureLevels = dictionaries.failureLevels || {}
    state.impactDegrees = dictionaries.impactDegrees || {}
    state.failureTypes = dictionaries.failureTypes || {}
    state.failureStatuses = dictionaries.failureStatuses || {}
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
   * 加载TPM字典
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
          console.log('[TPM] 从缓存加载字典数据')
          return
        }
      }

      // 从服务器加载
      console.log('[TPM] 从服务器加载字典数据...')
      const response = await getAllDictionaries()

      if (response.success && response.data) {
        commit('SET_DICTIONARIES', response.data)
        commit('SET_LOADED', true)

        // 保存到缓存
        saveDictionariesToCache(response.data)
        console.log('[TPM] 字典数据加载成功')
      } else {
        console.error('[TPM] 加载字典失败:', response)
      }
    } catch (error) {
      console.error('[TPM] 加载字典异常:', error)

      // 加载失败时尝试使用过期缓存
      const cachedData = getCachedDictionaries(true)
      if (cachedData) {
        commit('SET_DICTIONARIES', cachedData)
        commit('SET_LOADED', true)
        console.warn('[TPM] 加载失败，使用过期缓存')
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
    console.log('[TPM] 清除字典缓存')
  }
}

const getters = {
  // ============ 维护类型 ============
  maintenanceTypeOptions: (state) => {
    const dict = state.maintenanceTypes
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getMaintenanceTypeLabel: (state) => (type) => {
    return state.maintenanceTypes?.[type] || type
  },

  // ============ 维护周期类型 ============
  cycleTypeOptions: (state) => {
    const dict = state.cycleTypes
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getCycleTypeLabel: (state) => (type) => {
    return state.cycleTypes?.[type] || type
  },

  // ============ 周期单位 ============
  cycleUnitOptions: (state) => {
    const dict = state.cycleUnits
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getCycleUnitLabel: (state) => (unit) => {
    return state.cycleUnits?.[unit] || unit
  },

  // ============ 维护计划状态 ============
  planStatusOptions: (state) => {
    const dict = state.planStatuses
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getPlanStatusLabel: (state) => (status) => {
    return state.planStatuses?.[status] || status
  },

  // ============ 维护任务类型 ============
  taskTypeOptions: (state) => {
    const dict = state.taskTypes
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getTaskTypeLabel: (state) => (type) => {
    return state.taskTypes?.[type] || type
  },

  // ============ 维护任务状态 ============
  taskStatusOptions: (state) => {
    const dict = state.taskStatuses
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getTaskStatusLabel: (state) => (status) => {
    return state.taskStatuses?.[status] || status
  },

  // ============ 故障等级 ============
  failureLevelOptions: (state) => {
    const dict = state.failureLevels
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getFailureLevelLabel: (state) => (level) => {
    return state.failureLevels?.[level] || level
  },

  // ============ 影响程度 ============
  impactDegreeOptions: (state) => {
    const dict = state.impactDegrees
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getImpactDegreeLabel: (state) => (degree) => {
    return state.impactDegrees?.[degree] || degree
  },

  // ============ 故障类型 ============
  failureTypeOptions: (state) => {
    const dict = state.failureTypes
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getFailureTypeLabel: (state) => (type) => {
    return state.failureTypes?.[type] || type
  },

  // ============ 故障处理状态 ============
  failureStatusOptions: (state) => {
    const dict = state.failureStatuses
    if (!dict || Object.keys(dict).length === 0) return []
    return Object.keys(dict).map(key => ({
      value: key,
      label: dict[key]
    }))
  },

  getFailureStatusLabel: (state) => (status) => {
    return state.failureStatuses?.[status] || status
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
          console.log('[TPM] 缓存已过期')
          return null
        }
      }

      return cacheData.data
    }

    return null
  } catch (error) {
    console.error('[TPM] 读取缓存失败:', error)
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
    console.log('[TPM] 缓存已保存')
  } catch (error) {
    console.error('[TPM] 保存缓存失败:', error)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

