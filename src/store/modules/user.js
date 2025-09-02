import { login, logout, getInfo } from '@/views/login/api'
import { getToken, removeToken, setTokens } from '@/utils/auth'
import { resetRouter } from '@/router'
import authStorageManager from '@/utils/auth-storage'

const getDefaultState = () => {
  return {
    token: '',
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    rememberMe: false
  }
}

// 获取初始状态时需要从localStorage读取token
const getInitialState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: [],
    rememberMe: false
  }
}

const state = getInitialState()

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
  },
  SET_REMEMBER_ME: (state, rememberMe) => {
    state.rememberMe = rememberMe
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

          // 使用setTokens统一设置access token和refresh token
          const tokenData = {
            accessToken: token,
            refreshToken: refreshToken
          }
          setTokens(tokenData, rememberMe)

          // 登录成功，清除失败次数
          authStorageManager.clearLoginFailedCount()

          // 返回完整响应给调用方
          resolve(response)
        } else {
          // API返回success: false的情况，直接reject错误
          reject(new Error(response.message || '登录失败'))
        }
      }).catch(error => {
        // 网络错误或其他异常，直接reject
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo().then(response => {
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
      // 获取refreshToken和accessToken用于登出请求
      const refreshToken = authStorageManager.getRefreshToken()
      const accessToken = getToken()

      logout(refreshToken, accessToken).then(response => {
        // 处理Moses API响应格式
        if (response.success) {
          // 登出成功，清除本地存储
          commit('RESET_STATE')
          removeToken()
          resetRouter()

          // 清除refreshToken
          authStorageManager.clearAllAuthState()

          // 清除登录失败相关记录已包含在clearAllAuthState中

          resolve({ success: true, message: '登出成功' })
        } else {
          // 处理服务端登出失败的详细错误
          const errorCode = response.error?.code
          let errorMessage = response.error?.message || '登出失败'

          // 根据错误码提供详细的错误处理
          switch (errorCode) {
            case 'VAL_002':
              errorMessage = '请求参数缺失，但本地状态已清除'
              break
            case 'AUTH_001':
              errorMessage = '登录状态已失效，本地状态已清除'
              break
            case 'AUTH_033':
              errorMessage = '刷新令牌无效，本地状态已清除'
              break
            default:
              errorMessage = `登出失败：${errorMessage}，但本地状态已清除`
          }

          // 即使服务端登出失败，也清除本地状态
          commit('RESET_STATE')
          removeToken()
          resetRouter()

          // 清除refreshToken
          authStorageManager.clearAllAuthState()

          // 清除登录失败相关记录已包含在clearAllAuthState中

          resolve({ success: false, message: errorMessage, errorCode })
        }
      }).catch(error => {
        // 网络错误时也要清除本地状态
        commit('RESET_STATE')
        removeToken()
        authStorageManager.clearAllAuthState()
        resetRouter()

        // 即使网络错误也要resolve，确保前端能正常跳转
        console.warn('登出接口调用失败，但本地状态已清除:', error)
        resolve()
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

