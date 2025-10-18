/**
 * 文件名称：processTemplate.js
 * 文件描述：工艺模板模块字典 Store
 * 创建日期：2025-10-16
 * 修改记录：
 *   - 2025-10-16: 从 dictionary.js 拆分独立
 *   - 2025-10-16: 重构以适配新的后端接口格式（CODE->中文直接映射）
 */

import { getAllDictionaries } from '@/views/master-data/process-parameter-management/api'

const CACHE_KEY = 'processTemplateDictionaries'
const CACHE_VALIDITY_HOURS = 24

const state = {
  // 字典数据 - 新格式：{ values: { CODE: "中文标签" } }
  templateStatuses: { values: {}},
  templateVersionStatuses: { values: {}},
  atmosphereTypes: { values: {}},
  circulationFanSpeeds: { values: {}},
  controlModes: { values: {}},

  // 加载状态
  loaded: false,
  loading: false
}

const mutations = {
  /**
   * 设置字典数据
   * @param {Object} dictionaries - 后端返回的字典数据（扁平化格式）
   *
   * 后端新格式：{ templateStatuses: { "DRAFT": "草稿", ... } }
   * Store存储格式：{ templateStatuses: { values: { "DRAFT": "草稿", ... } } }
   */
  SET_DICTIONARIES(state, dictionaries) {
    // 将后端扁平化格式包装成统一的 { values: {...} } 结构
    state.templateStatuses = {
      values: dictionaries.templateStatuses || {}
    }
    state.templateVersionStatuses = {
      values: dictionaries.templateVersionStatuses || {}
    }
    state.atmosphereTypes = {
      values: dictionaries.atmosphereTypes || {}
    }
    state.circulationFanSpeeds = {
      values: dictionaries.circulationFanSpeeds || {}
    }
    state.controlModes = {
      values: dictionaries.controlModes || {}
    }
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
   * 加载工艺模板字典
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
          console.log('[ProcessTemplate] 从缓存加载字典数据')
          return
        }
      }

      // 从服务器加载
      console.log('[ProcessTemplate] 从服务器加载字典数据...')
      const response = await getAllDictionaries()

      if (response.success && response.data) {
        commit('SET_DICTIONARIES', response.data)
        commit('SET_LOADED', true)

        // 保存到缓存
        saveDictionariesToCache(response.data)
        console.log('[ProcessTemplate] 字典数据加载成功')
      } else {
        console.error('[ProcessTemplate] 加载字典失败:', response)
      }
    } catch (error) {
      console.error('[ProcessTemplate] 加载字典异常:', error)

      // 加载失败时尝试使用过期缓存
      const cachedData = getCachedDictionaries(true)
      if (cachedData) {
        commit('SET_DICTIONARIES', cachedData)
        commit('SET_LOADED', true)
        console.warn('[ProcessTemplate] 加载失败，使用过期缓存')
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
    console.log('[ProcessTemplate] 清除字典缓存')
  }
}

const getters = {
  /**
   * 获取工艺模板状态标签
   */
  getTemplateStatusLabel: (state) => (status) => {
    return state.templateStatuses?.values?.[status] || status
  },

  /**
   * 获取工艺模板版本状态标签
   */
  getTemplateVersionStatusLabel: (state) => (status) => {
    return state.templateVersionStatuses?.values?.[status] || status
  },

  /**
   * 获取保护气氛类型标签
   */
  getAtmosphereTypeLabel: (state) => (type) => {
    return state.atmosphereTypes?.values?.[type] || type
  },

  /**
   * 获取循环风机速度标签
   */
  getCirculationFanSpeedLabel: (state) => (speed) => {
    return state.circulationFanSpeeds?.values?.[speed] || speed
  },

  /**
   * 获取控温方式标签
   */
  getControlModeLabel: (state) => (mode) => {
    return state.controlModes?.values?.[mode] || mode
  },

  /**
   * 获取工艺模板状态选项（用于下拉框）
   */
  templateStatusOptions: (state) => {
    const dict = state.templateStatuses
    if (!dict.values) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.values[key]
    }))
  },

  /**
   * 获取工艺模板版本状态选项（用于下拉框）
   */
  templateVersionStatusOptions: (state) => {
    const dict = state.templateVersionStatuses
    if (!dict.values) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.values[key]
    }))
  },

  /**
   * 获取保护气氛类型选项（用于下拉框）
   */
  atmosphereTypeOptions: (state) => {
    const dict = state.atmosphereTypes
    if (!dict.values) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.values[key]
    }))
  },

  /**
   * 获取循环风机速度选项（用于下拉框）
   */
  circulationFanSpeedOptions: (state) => {
    const dict = state.circulationFanSpeeds
    if (!dict.values) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.values[key]
    }))
  },

  /**
   * 获取控温方式选项（用于下拉框）
   */
  controlModeOptions: (state) => {
    const dict = state.controlModes
    if (!dict.values) return []
    return Object.keys(dict.values).map(key => ({
      value: key,
      label: dict.values[key]
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
          console.log('[ProcessTemplate] 缓存已过期')
          return null
        }
      }

      return cacheData.data
    }

    return null
  } catch (error) {
    console.error('[ProcessTemplate] 读取缓存失败:', error)
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
    console.log('[ProcessTemplate] 缓存已保存')
  } catch (error) {
    console.error('[ProcessTemplate] 保存缓存失败:', error)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

