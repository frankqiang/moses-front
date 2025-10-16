/**
 * 文件名称：maintenancePlan.js
 * 文件描述：维护计划管理Vuex状态管理模块
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 */

import {
  getMaintenancePlans,
  getMaintenancePlanById,
  createMaintenancePlan,
  updateMaintenancePlan,
  enableMaintenancePlan,
  disableMaintenancePlan
} from '@/views/tpm-management/maintenance-plan/api'

const state = {
  // 列表数据
  list: [],
  // 当前计划详情
  currentPlan: null,
  // 分页信息
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalResults: 0
  },
  // 筛选条件
  filters: {
    equipmentId: '',
    maintenanceType: '',
    cycleType: '',
    status: '',
    search: '',
    sortBy: 'createdAt:desc'
  },
  // 加载状态
  loading: false
}

const mutations = {
  /**
   * 设置列表数据
   * @param {Object} state - 状态对象
   * @param {Array} list - 维护计划列表
   */
  SET_LIST(state, list) {
    state.list = list || []
  },

  /**
   * 设置当前计划详情
   * @param {Object} state - 状态对象
   * @param {Object} plan - 维护计划详情
   */
  SET_CURRENT_PLAN(state, plan) {
    state.currentPlan = plan
  },

  /**
   * 设置分页信息
   * @param {Object} state - 状态对象
   * @param {Object} pagination - 分页信息
   */
  SET_PAGINATION(state, pagination) {
    state.pagination = {
      ...state.pagination,
      ...pagination
    }
  },

  /**
   * 设置筛选条件
   * @param {Object} state - 状态对象
   * @param {Object} filters - 筛选条件
   */
  SET_FILTERS(state, filters) {
    state.filters = {
      ...state.filters,
      ...filters
    }
  },

  /**
   * 设置加载状态
   * @param {Object} state - 状态对象
   * @param {boolean} loading - 加载状态
   */
  SET_LOADING(state, loading) {
    state.loading = loading
  },

  /**
   * 重置状态
   * @param {Object} state - 状态对象
   */
  RESET_STATE(state) {
    state.list = []
    state.currentPlan = null
    state.pagination = {
      page: 1,
      limit: 10,
      totalPages: 0,
      totalResults: 0
    }
    state.filters = {
      equipmentId: '',
      maintenanceType: '',
      cycleType: '',
      status: '',
      search: '',
      sortBy: 'createdAt:desc'
    }
    state.loading = false
  }
}

const actions = {
  /**
   * 获取维护计划列表
   * @param {Object} context - Vuex上下文
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} 返回列表数据
   */
  async getList({ commit, state }, params = {}) {
    try {
      commit('SET_LOADING', true)

      // 合并筛选条件和分页参数
      const queryParams = {
        ...state.filters,
        ...params,
        page: params.page || state.pagination.page,
        limit: params.limit || state.pagination.limit
      }

      const response = await getMaintenancePlans(queryParams)

      if (response && response.data) {
        const { results, page, limit, totalPages, totalResults } = response.data

        // 更新列表数据
        commit('SET_LIST', results)

        // 更新分页信息
        commit('SET_PAGINATION', {
          page,
          limit,
          totalPages,
          totalResults
        })

        return response.data
      }

      return null
    } catch (error) {
      console.error('获取维护计划列表失败:', error)
      commit('SET_LIST', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 获取维护计划详情
   * @param {Object} context - Vuex上下文
   * @param {string} planId - 维护计划ID
   * @returns {Promise<Object>} 返回计划详情
   */
  async getDetail({ commit }, planId) {
    try {
      commit('SET_LOADING', true)

      const response = await getMaintenancePlanById(planId)

      if (response && response.data) {
        commit('SET_CURRENT_PLAN', response.data)
        return response.data
      }

      return null
    } catch (error) {
      console.error('获取维护计划详情失败:', error)
      commit('SET_CURRENT_PLAN', null)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 创建维护计划
   * @param {Object} context - Vuex上下文
   * @param {Object} data - 创建数据
   * @returns {Promise<Object>} 返回创建的计划
   */
  async create({ commit }, data) {
    try {
      commit('SET_LOADING', true)

      const response = await createMaintenancePlan(data)

      if (response && response.data) {
        return response.data
      }

      return null
    } catch (error) {
      console.error('创建维护计划失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 更新维护计划
   * @param {Object} context - Vuex上下文
   * @param {Object} payload - 更新数据
   * @param {string} payload.planId - 维护计划ID
   * @param {Object} payload.data - 更新数据
   * @returns {Promise<Object>} 返回更新后的计划
   */
  async update({ commit }, { planId, data }) {
    try {
      commit('SET_LOADING', true)

      const response = await updateMaintenancePlan(planId, data)

      if (response && response.data) {
        // 如果当前计划是被更新的计划，更新当前计划详情
        commit('SET_CURRENT_PLAN', response.data)
        return response.data
      }

      return null
    } catch (error) {
      console.error('更新维护计划失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 启用维护计划
   * @param {Object} context - Vuex上下文
   * @param {string} planId - 维护计划ID
   * @returns {Promise<Object>} 返回启用后的计划
   */
  async enable({ commit }, planId) {
    try {
      commit('SET_LOADING', true)

      const response = await enableMaintenancePlan(planId)

      if (response && response.data) {
        // 更新当前计划详情
        commit('SET_CURRENT_PLAN', response.data)
        return response.data
      }

      return null
    } catch (error) {
      console.error('启用维护计划失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 禁用维护计划
   * @param {Object} context - Vuex上下文
   * @param {string} planId - 维护计划ID
   * @returns {Promise<Object>} 返回禁用后的计划
   */
  async disable({ commit }, planId) {
    try {
      commit('SET_LOADING', true)

      const response = await disableMaintenancePlan(planId)

      if (response && response.data) {
        // 更新当前计划详情
        commit('SET_CURRENT_PLAN', response.data)
        return response.data
      }

      return null
    } catch (error) {
      console.error('禁用维护计划失败:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * 更新筛选条件
   * @param {Object} context - Vuex上下文
   * @param {Object} filters - 筛选条件
   */
  updateFilters({ commit }, filters) {
    commit('SET_FILTERS', filters)
  },

  /**
   * 更新分页信息
   * @param {Object} context - Vuex上下文
   * @param {Object} pagination - 分页信息
   */
  updatePagination({ commit }, pagination) {
    commit('SET_PAGINATION', pagination)
  },

  /**
   * 重置状态
   * @param {Object} context - Vuex上下文
   */
  resetState({ commit }) {
    commit('RESET_STATE')
  }
}

const getters = {
  /**
   * 获取启用状态的维护计划列表
   * @param {Object} state - 状态对象
   * @returns {Array} 启用的维护计划列表
   */
  enabledPlans(state) {
    return state.list.filter(plan => plan.status === '启用')
  },

  /**
   * 获取禁用状态的维护计划列表
   * @param {Object} state - 状态对象
   * @returns {Array} 禁用的维护计划列表
   */
  disabledPlans(state) {
    return state.list.filter(plan => plan.status === '禁用')
  },

  /**
   * 按设备分组维护计划
   * @param {Object} state - 状态对象
   * @returns {Object} 按设备ID分组的维护计划
   */
  plansByEquipment(state) {
    const grouped = {}

    state.list.forEach(plan => {
      const equipmentId = plan.equipmentId

      if (!grouped[equipmentId]) {
        grouped[equipmentId] = {
          equipment: plan.equipment,
          plans: []
        }
      }

      grouped[equipmentId].plans.push(plan)
    })

    return grouped
  },

  /**
   * 获取当前筛选条件
   * @param {Object} state - 状态对象
   * @returns {Object} 筛选条件
   */
  currentFilters(state) {
    return state.filters
  },

  /**
   * 获取当前分页信息
   * @param {Object} state - 状态对象
   * @returns {Object} 分页信息
   */
  currentPagination(state) {
    return state.pagination
  },

  /**
   * 获取加载状态
   * @param {Object} state - 状态对象
   * @returns {boolean} 加载状态
   */
  isLoading(state) {
    return state.loading
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

