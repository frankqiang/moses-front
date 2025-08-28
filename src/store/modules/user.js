import { login, logout, getInfo } from '@/views/login/api'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: []
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
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
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
          const { token, refreshToken } = response.data

          // 设置token到store
          commit('SET_TOKEN', token)

          // 根据rememberMe设置token存储方式
          setToken(token, rememberMe)

          // 如果有refreshToken，也保存起来
          if (refreshToken) {
            // 可以在这里保存refreshToken用于后续刷新
            localStorage.setItem('refresh_token', refreshToken)
          }

          // 登录成功，清除失败次数
          localStorage.removeItem('login_failed_count')
          localStorage.removeItem('account_locked_until')

          // 返回完整响应给调用方
          resolve(response)
        } else {
          // 登录失败，增加失败次数
          const failedCount = parseInt(localStorage.getItem('login_failed_count') || '0') + 1
          localStorage.setItem('login_failed_count', failedCount.toString())

          // 如果失败次数达到5次，锁定账户30分钟
          if (failedCount >= 5) {
            const lockUntil = Date.now() + (30 * 60 * 1000) // 30分钟后解锁
            localStorage.setItem('account_locked_until', lockUntil.toString())
            reject(new Error('账户已被锁定30分钟，请稍后再试'))
          } else {
            reject(new Error(response.message || `登录失败，还可尝试 ${5 - failedCount} 次`))
          }
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
          const { name, username, avatar, roles, permissions } = response.data

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
          // 登出成功，清除本地存储
          commit('RESET_STATE')
          removeToken()
          resetRouter()

          // 清除refreshToken
          localStorage.removeItem('refresh_token')

          // 清除登录失败相关记录
          localStorage.removeItem('login_failed_count')
          localStorage.removeItem('account_locked_until')

          resolve()
        } else {
          // 即使服务端登出失败，也清除本地状态
          commit('RESET_STATE')
          removeToken()
          resetRouter()

          // 清除refreshToken
          localStorage.removeItem('refresh_token')

          // 清除登录失败相关记录
          localStorage.removeItem('login_failed_count')
          localStorage.removeItem('account_locked_until')

          resolve()
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

