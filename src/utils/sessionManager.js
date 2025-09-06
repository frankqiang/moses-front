/**
 * 会话超时管理模块
 * 实现30分钟无操作自动退出、会话过期提醒、多标签页同步等功能
 */

import { getToken, removeToken } from '@/utils/auth'
import authStorageManager from '@/utils/auth-storage'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
import Vue from 'vue'
import SessionExpiryDialog from '@/components/SessionExpiryDialog'

// 会话管理配置
const SESSION_CONFIG = {
  // 会话超时时间：1分钟（测试配置）
  SESSION_TIMEOUT: 5 * 60 * 1000,
  // 警告提前时间：20秒（测试配置）
  WARNING_TIME: 20 * 1000,
  // 活动检查间隔：5秒（测试配置）
  CHECK_INTERVAL: 5 * 1000
}

/**
 * 会话管理器类
 * 负责监听用户活动、管理会话超时、显示过期提醒等功能
 */
class SessionManager {
  constructor() {
    this.isActive = false
    this.activityTimer = null
    this.warningTimer = null
    this.logoutTimer = null
    this.countdownTimer = null
    this.dialogInstance = null
    this.countdownSeconds = 300 // 5分钟倒计时

    // 绑定事件处理函数的this
    this.handleActivity = this.handleActivity.bind(this)
    this.handleStorageChange = this.handleStorageChange.bind(this)
    this.handleDialogContinue = this.handleDialogContinue.bind(this)
    this.handleDialogLogout = this.handleDialogLogout.bind(this)
  }

  /**
   * 初始化会话管理器
   */
  init() {
    if (this.isActive) {
      console.log('会话管理器已经激活')
      return
    }

    // 检查是否有有效的token
    const token = getToken()
    if (!token) {
      console.log('没有有效的token，不启动会话管理器')
      return
    }

    this.isActive = true

    // 初始化会话状态
    authStorageManager.resetSessionState()

    // 添加活动监听器
    this.addActivityListeners()

    // 添加存储变化监听器（用于多标签页同步）
    window.addEventListener('storage', this.handleStorageChange)

    // 启动定时检查
    this.startTimers()

    console.log('会话管理器已启动')
  }

  /**
   * 销毁会话管理器
   */
  destroy() {
    if (!this.isActive) return

    this.isActive = false
    this.warningShown = false

    // 清除所有定时器
    if (this.activityTimer) {
      clearTimeout(this.activityTimer)
      this.activityTimer = null
    }

    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer)
      this.logoutTimer = null
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }

    // 销毁弹窗实例
    this.destroyDialog()

    // 移除事件监听
    this.removeActivityListeners()
    window.removeEventListener('storage', this.handleStorageChange)

    // 清除本地存储
    localStorage.removeItem(this.storageKey)

    console.log('会话管理器已销毁')
  }

  /**
   * 添加用户活动监听器
   */
  addActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true)
    })
  }

  /**
   * 移除用户活动监听器
   */
  removeActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true)
    })
  }

  /**
   * 处理用户活动
   */
  handleActivity() {
    if (!this.isActive) return

    // 更新最后活动时间到统一存储
    authStorageManager.setLastActivityTime()

    // 如果警告已显示但没有弹窗实例，说明是其他标签页的警告，可以隐藏
    // 如果有弹窗实例存在，不应该因为用户活动而自动关闭，只能通过按钮操作关闭
    if (authStorageManager.getWarningShown() && !this.dialogInstance) {
      authStorageManager.setWarningShown(false)
    }

    // 如果没有弹窗显示，重新启动定时器
    if (!this.dialogInstance) {
      this.startTimers()
    }
  }

  /**
   * 处理存储变化（多标签页同步）
   */
  handleStorageChange(event) {
    if (!this.isActive) return

    // 监听moses_auth_data的变化（多标签页同步）
    if (event.key === 'moses_auth_data' && event.newValue) {
      try {
        const authData = JSON.parse(event.newValue)
        const newActivityTime = authData.session?.lastActivityTime
        if (newActivityTime && newActivityTime > authStorageManager.getLastActivityTime()) {
          // 其他标签页有活动，同步状态
          authStorageManager.setLastActivityTime(newActivityTime)
          // 重新启动定时器
          this.startTimers()
          // 如果警告已显示，隐藏警告
          if (authStorageManager.getWarningShown()) {
            this.hideWarning()
          }
        }
      } catch (error) {
        console.error('解析存储数据失败:', error)
      }
    }

    // 监听登出事件
    if (event.key === 'logout_event') {
      this.destroy()
    }
  }

  /**
   * 启动定时器
   */
  startTimers() {
    // 清除现有定时器
    this.clearTimers()

    const now = Date.now()
    const lastActivityTime = authStorageManager.getLastActivityTime()
    const timeSinceLastActivity = now - lastActivityTime

    // 计算到警告时间的剩余时间
    const timeToWarning = SESSION_CONFIG.SESSION_TIMEOUT - SESSION_CONFIG.WARNING_TIME - timeSinceLastActivity
    // 计算到自动登出的剩余时间
    const timeToLogout = SESSION_CONFIG.SESSION_TIMEOUT - timeSinceLastActivity

    if (timeToLogout <= 0) {
      // 会话已过期，立即登出
      this.performLogout()
      return
    }

    if (timeToWarning <= 0) {
      // 应该显示警告
      this.showWarning()
    } else {
      // 设置警告定时器
      this.warningTimer = setTimeout(() => {
        this.showWarning()
      }, timeToWarning)
    }

    // 设置自动登出定时器
    this.logoutTimer = setTimeout(() => {
      this.performLogout()
    }, timeToLogout)
  }

  /**
   * 显示会话即将过期警告
   */
  showWarning() {
    if (authStorageManager.getWarningShown()) return

    authStorageManager.setWarningShown(true)
    // 倒计时时间应该等于WARNING_TIME（转换为秒）
    this.countdownSeconds = Math.floor(SESSION_CONFIG.WARNING_TIME / 1000)

    // 创建弹窗组件实例
    const DialogConstructor = Vue.extend(SessionExpiryDialog)
    this.dialogInstance = new DialogConstructor({
      propsData: {
        visible: true,
        countdown: this.countdownSeconds
      }
    })

    // 监听弹窗事件
    this.dialogInstance.$on('continue', this.handleDialogContinue)
    this.dialogInstance.$on('logout', this.handleDialogLogout)

    // 挂载弹窗到DOM
    this.dialogInstance.$mount()
    document.body.appendChild(this.dialogInstance.$el)

    // 开始倒计时
    this.startCountdown()

    console.log('会话即将过期提醒弹窗已显示')
  }

  /**
   * 隐藏警告
   */
  hideWarning() {
    this.destroyDialog()
  }

  /**
   * 清除定时器
   */
  clearTimers() {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer)
      this.logoutTimer = null
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  }

  /**
   * 执行登出操作
   */
  async performLogout() {
    console.log('执行会话超时登出')

    try {
      // 销毁会话管理器
      this.destroy()

      // 通知其他标签页
      localStorage.setItem('logout_event', Date.now().toString())
      localStorage.removeItem('logout_event')

      // 调用store的登出方法
      await store.dispatch('user/logout')

      // 显示提示消息
      Message({
        type: 'warning',
        message: '会话已过期，请重新登录',
        duration: 3000
      })

      // 跳转到登录页
      router.push('/login')
    } catch (error) {
      console.error('登出过程中发生错误:', error)
      // 即使登出失败，也要清除本地状态并跳转到登录页
      removeToken()
      router.push('/login')
    }
  }

  /**
   * 开始倒计时
   */
  startCountdown() {
    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--

      if (this.dialogInstance) {
        // 通过修改props来更新组件内部状态
        this.dialogInstance.$props.countdown = this.countdownSeconds
      }

      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
        this.performLogout()
      }
    }, 1000)
  }

  /**
   * 处理弹窗继续工作事件
   */
  handleDialogContinue() {
    this.handleActivity()
    this.destroyDialog()
  }

  /**
   * 处理弹窗立即退出事件
   */
  handleDialogLogout() {
    this.performLogout()
  }

  /**
   * 销毁弹窗实例
   */
  destroyDialog() {
    if (this.dialogInstance) {
      this.dialogInstance.$off('continue', this.handleDialogContinue)
      this.dialogInstance.$off('logout', this.handleDialogLogout)

      if (this.dialogInstance.$el && this.dialogInstance.$el.parentNode) {
        this.dialogInstance.$el.parentNode.removeChild(this.dialogInstance.$el)
      }

      this.dialogInstance.$destroy()
      this.dialogInstance = null
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }

    this.warningShown = false
  }
}

// 创建全局会话管理器实例
const sessionManager = new SessionManager()

export default sessionManager
export { SESSION_CONFIG }
