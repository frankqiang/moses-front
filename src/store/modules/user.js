import { login, logout, getInfo } from '@/views/login/api'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password, rememberMe } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password, rememberMe }).then(response => {
        // 处理Moses API响应格式
        if (response.success && response.data) {
          const { token, refreshToken, expiresIn } = response.data
          
          // 设置token到store
          commit('SET_TOKEN', token)
          
          // 根据rememberMe设置token存储方式
          setToken(token, rememberMe)
          
          // 如果有refreshToken，也保存起来
          if (refreshToken) {
            // 可以在这里保存refreshToken用于后续刷新
            localStorage.setItem('refresh_token', refreshToken)
          }
          
          // 返回完整响应给调用方
          resolve(response)
        } else {
          // API返回失败状态
          reject(new Error(response.message || '登录失败'))
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        // 处理Moses API响应格式
        if (response.success && response.data) {
          const { name, username, email, avatar, roles, permissions } = response.data

          // 设置用户信息到store
          commit('SET_NAME', name || username)
          commit('SET_AVATAR', avatar || '')
          
          // 可以在这里保存其他用户信息
          if (roles) {
            // 保存用户角色信息
            commit('SET_ROLES', roles)
          }
          
          if (permissions) {
            // 保存用户权限信息
            commit('SET_PERMISSIONS', permissions)
          }
          
          resolve(response.data)
        } else {
          reject(new Error(response.message || 'Verification failed, please Login again.'))
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout().then(response => {
        // 处理Moses API响应格式
        if (response.success) {
          // 清除本地存储的token和用户信息
          commit('SET_TOKEN', '')
          commit('SET_NAME', '')
          commit('SET_AVATAR', '')
          
          // 清除token存储
          removeToken()
          
          // 清除refreshToken
          localStorage.removeItem('refresh_token')
          
          // 重置路由
          resetRouter()

          // reset visited views and cached views
          // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
          dispatch('tagsView/delAllViews', null, { root: true })

          resolve(response)
        } else {
          // 即使服务端登出失败，也要清除本地状态
          commit('SET_TOKEN', '')
          commit('SET_NAME', '')
          commit('SET_AVATAR', '')
          removeToken()
          localStorage.removeItem('refresh_token')
          resetRouter()
          
          resolve(response)
        }
      }).catch(error => {
        // 网络错误时也要清除本地状态
        commit('SET_TOKEN', '')
        commit('SET_NAME', '')
        commit('SET_AVATAR', '')
        removeToken()
        localStorage.removeItem('refresh_token')
        resetRouter()
        
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

