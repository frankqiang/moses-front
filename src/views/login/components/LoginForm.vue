/**
 * 登录表单组件
 * 功能描述：提供用户登录表单，包含用户名、密码输入框、记住我选项和登录按钮
 * 创建日期：2024-07-24
 */
<template>
  <el-form
    ref="loginForm"
    :model="loginForm"
    :rules="loginRules"
    class="login-form"
    auto-complete="on"
    label-position="left"
  >
    <div class="title-container">
      <h3 class="title">用户登录</h3>
    </div>

    <!-- 登录方式选择 -->
    <div class="login-type-container">
      <el-radio-group v-model="loginForm.loginType" @change="handleLoginTypeChange">
        <el-radio-button label="username">用户名登录</el-radio-button>
        <el-radio-button label="email">邮箱登录</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 用户名输入框 -->
    <el-form-item v-if="loginForm.loginType === 'username'" prop="username">
      <span class="svg-container">
        <svg-icon icon-class="user" />
      </span>
      <el-input
        ref="username"
        v-model="loginForm.username"
        placeholder="请输入用户名（3-50字符）"
        name="username"
        type="text"
        tabindex="1"
        auto-complete="on"
        maxlength="50"
        show-word-limit
      />
    </el-form-item>

    <!-- 邮箱输入框 -->
    <el-form-item v-if="loginForm.loginType === 'email'" prop="email">
      <span class="svg-container">
        <svg-icon icon-class="email" />
      </span>
      <el-input
        ref="email"
        v-model="loginForm.email"
        placeholder="请输入邮箱地址"
        name="email"
        type="email"
        tabindex="1"
        auto-complete="on"
        maxlength="100"
      />
    </el-form-item>

    <el-form-item prop="password">
      <span class="svg-container">
        <svg-icon icon-class="password" />
      </span>
      <el-input
        :key="passwordType"
        ref="password"
        v-model="loginForm.password"
        :type="passwordType"
        placeholder="请输入密码（6-20字符）"
        name="password"
        tabindex="2"
        auto-complete="on"
        maxlength="20"
        show-word-limit
        @keyup.enter.native="handleLogin"
      />
      <span class="show-pwd" @click="showPwd">
        <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
      </span>
    </el-form-item>

    <div class="remember-container">
      <div class="remember-me-section">
        <el-checkbox
          v-model="loginForm.rememberMe"
          class="remember-checkbox"
        >
          <span class="remember-text">记住登录状态</span>
          <el-tooltip
            content="勾选后将在本设备保持登录状态，建议仅在个人设备上使用"
            placement="top"
          >
            <i class="el-icon-question remember-tip" />
          </el-tooltip>
        </el-checkbox>
        <div v-if="loginForm.rememberMe" class="security-warning">
          <i class="el-icon-warning-outline" />
          <span>请确保在安全的个人设备上使用此功能</span>
          <a href="javascript:;" class="clear-remembered" @click="clearRememberedState">清除记住的状态</a>
        </div>
      </div>
      <a href="javascript:;" class="forgot-password" @click="handleForgotPassword">忘记密码?</a>
    </div>

    <!-- 账户锁定提示 -->
    <div v-if="isLocked" class="lockout-notice">
      <i class="el-icon-lock" />
      <span>账户已被锁定，请在 {{ formatCountdown(lockoutCountdown) }} 后重试</span>
    </div>

    <el-button
      type="primary"
      class="login-button"
      :loading="loading"
      :disabled="isLocked"
      @click.native.prevent="handleLogin"
    >
      {{ isLocked ? `锁定中 (${formatCountdown(lockoutCountdown)})` : '登录' }}
    </el-button>

    <!-- 注册入口 -->
    <div class="register-section">
      <span class="register-text">还没有账号？</span>
      <router-link to="/register" class="register-link">立即注册</router-link>
    </div>

    <div v-if="isDev" class="tips">
      <span>测试账号: admin</span>
      <span>密码: 任意6位以上</span>
    </div>
  </el-form>
</template>

<script>
import { DEFAULT_LOGIN_FORM, LOGIN_RULES, ENV_CONFIG } from '../constants'
import { getRememberedUser, saveRememberedUser, removeRememberedUser, isRememberMe, clearRememberedState } from '@/utils/auth'
import authStorageManager from '@/utils/auth-storage'

export default {
  name: 'LoginForm',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loginForm: {
        ...DEFAULT_LOGIN_FORM,
        rememberMe: isRememberMe() // 初始化记住登录状态
      },
      loginRules: LOGIN_RULES,
      passwordType: 'password',
      isDev: ENV_CONFIG.isDev,
      loginAttempts: 0,
      maxLoginAttempts: 5,
      lockoutTime: 15 * 60 * 1000, // 15分钟
      isLocked: false,
      lockoutEndTime: null,
      lockoutCountdown: 0,
      countdownTimer: null
    }
  },
  created() {
    this.redirect = this.$route.query && this.$route.query.redirect
    this.loadRememberedUser()

    // 检查是否已被锁定
    if (authStorageManager.isAccountLocked()) {
      this.startLockoutCountdown()
    }
  },

  beforeDestroy() {
    // 清除定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
  },
  methods: {
    /**
     * 加载记住的用户信息
     */
    loadRememberedUser() {
      const rememberedUser = getRememberedUser()
      if (rememberedUser && rememberedUser.username) {
        this.loginForm.username = rememberedUser.username
        this.loginForm.rememberMe = true
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    /**
     * 处理登录方式切换
     */
    handleLoginTypeChange(newType) {
      // 清除当前输入的用户名或邮箱
      if (newType === 'username') {
        this.loginForm.email = ''
        this.$nextTick(() => {
          if (this.$refs.username) {
            this.$refs.username.focus()
          }
        })
      } else {
        this.loginForm.username = ''
        this.$nextTick(() => {
          if (this.$refs.email) {
            this.$refs.email.focus()
          }
        })
      }
      // 清除表单验证状态
      this.$nextTick(() => {
        this.$refs.loginForm.clearValidate()
      })
    },
    /**
     * 处理登录提交
     * 验证表单后调用登录接口
     */
    handleLogin() {
      // 检查是否被锁定
      if (this.isLocked) {
        const remainingTime = Math.ceil((this.lockoutEndTime - Date.now()) / 1000 / 60)
        this.$message.error(`登录已被锁定，请在 ${remainingTime} 分钟后重试`)
        return false
      }

      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // 根据登录方式进行不同的验证
          if (this.loginForm.loginType === 'username') {
            // 验证用户名格式
            const usernamePattern = /^[a-zA-Z0-9_\u4e00-\u9fa5]{3,50}$/
            if (!usernamePattern.test(this.loginForm.username)) {
              this.$message.error('用户名格式不正确，只能包含字母、数字、下划线和中文字符')
              return false
            }
          }

          // 验证密码格式
          const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,20}$/
          if (!passwordPattern.test(this.loginForm.password)) {
            this.$message.error('密码格式不正确，必须包含至少一个字母和一个数字')
            return false
          }

          // 构建登录数据
          const loginData = {
            password: this.loginForm.password,
            rememberMe: this.loginForm.rememberMe
          }

          // 根据登录方式添加对应字段
          if (this.loginForm.loginType === 'username') {
            loginData.username = this.loginForm.username.trim()
          } else {
            loginData.email = this.loginForm.email.trim()
          }

          this.$emit('login', loginData)
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    },
    /**
     * 处理记住用户信息
     */
    handleRememberUser() {
      if (this.loginForm.rememberMe) {
        // 保存用户信息到本地存储
        saveRememberedUser({
          username: this.loginForm.username
        })
      } else {
        // 清除记住的用户信息
        removeRememberedUser()
      }
    },
    handleForgotPassword() {
      this.$emit('forgot-password')
    },
    // 重置表单
    resetForm() {
      this.$refs.loginForm.resetFields()
    },
    /**
     * 清除记住的登录状态
     */
    clearRememberedState() {
      clearRememberedState()
      this.loginForm.rememberMe = false
      this.$message({
        message: '已清除记住的登录状态',
        type: 'success',
        duration: 2000
      })
    },

    /**
     * 处理登录失败
     * @param {Object} error - 错误对象
     * @returns {boolean} 是否已处理该错误
     */
    handleLoginFailure(error) {
      const errorCode = error?.code
      const maxAttempts = 5

      // 如果是密码错误，增加失败次数
      if (errorCode === 'AUTH_011') {
        const failedCount = authStorageManager.incrementLoginFailedCount()
        const remainingAttempts = maxAttempts - failedCount

        if (remainingAttempts > 0) {
          this.$message.error(`密码错误，还可尝试 ${remainingAttempts} 次`)
        }

        // 如果达到最大尝试次数，锁定账户
        if (failedCount >= maxAttempts) {
          authStorageManager.setAccountLocked(15 * 60 * 1000) // 15分钟
          this.startLockoutCountdown()
        }
        return true // 表示已处理该错误
      }

      // 如果是账户锁定错误，启动倒计时
      if (errorCode === 'AUTH_014') {
        this.startLockoutCountdown()
        this.$message.error('账户已被锁定，请稍后再试')
        return true // 表示已处理该错误
      }

      // 返回false表示未处理该错误，由父组件显示通用错误信息
      return false
    },

    /**
     * 处理登录成功
     */
    handleLoginSuccess() {
      // 重置登录尝试次数
      this.loginAttempts = 0
      this.isLocked = false
      this.lockoutEndTime = null
      this.lockoutCountdown = 0

      // 清除倒计时定时器
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }

      // 清除存储的失败次数和锁定状态
      authStorageManager.clearLoginFailedCount()

      // 处理记住用户信息
      this.handleRememberUser()
    },

    /**
     * 启动账户锁定倒计时
     */
    startLockoutCountdown() {
      this.isLocked = true
      const remainingTime = authStorageManager.getAccountLockRemainingTime()

      if (remainingTime > 0) {
        this.lockoutCountdown = Math.ceil(remainingTime / 1000)

        // 清除之前的定时器
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer)
        }

        // 启动倒计时
        this.countdownTimer = setInterval(() => {
          this.lockoutCountdown--

          if (this.lockoutCountdown <= 0) {
            this.clearLockout()
          }
        }, 1000)
      }
    },

    /**
     * 清除锁定状态
     */
    clearLockout() {
      this.isLocked = false
      this.lockoutCountdown = 0

      if (this.countdownTimer) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }

      authStorageManager.clearLoginFailedCount()
    },

    /**
     * 格式化倒计时显示
     */
    formatCountdown(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style lang="scss" scoped>
.login-form {
  width: 100%;

  .el-form-item {
    margin-bottom: 22px;
  }

  .el-input {
    // height: 47px;
    padding: 0 15px 0 20px; /* 增加左侧内边距，避免文字被图标遮挡 */
    input {
      height: 47px;
      line-height: 47px;

      border-radius: 6px;
      border: 1px solid #dcdfe6;
      background-color: #fff;
      color: #606266;

      &:focus {
        border-color: #409eff;
        outline: none;
      }

      &::placeholder {
        color: #c0c4cc;
        padding-left: 5px; /* 为placeholder添加额外的左侧内边距 */
      }
    }
  }
}

.title-container {
  margin-bottom: 30px;

  .title {
    font-size: 24px;
    color: #303133;
    margin: 0;
    text-align: center;
    font-weight: 600;
  }
}

.svg-container {
    padding: 6px 5px 0px 15px;
    color: #889aa4;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1; /* 降低图标的z-index，避免遮挡输入框文本 */
    pointer-events: none; /* 确保图标不会拦截鼠标事件 */
  }

.show-pwd {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #889aa4;
  cursor: pointer;
  user-select: none;
  z-index: 1;

  &:hover {
    color: #409eff;
  }
}

.remember-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .remember-me-section {
    flex: 1;

    .remember-checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .remember-text {
        color: #606266;
        font-size: 14px;
        margin-right: 5px;
      }

      .remember-tip {
        color: #909399;
        font-size: 14px;
        cursor: help;

        &:hover {
          color: #409EFF;
        }
      }
    }

    .security-warning {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 8px 12px;
      background-color: #fdf6ec;
      border: 1px solid #faecd8;
      border-radius: 4px;
      color: #e6a23c;
      font-size: 12px;
      margin-top: 5px;

      i {
        margin-right: 5px;
        font-size: 14px;
      }

      span {
        line-height: 1.4;
        flex: 1;
      }

      .clear-remembered {
        color: #409EFF;
        text-decoration: none;
        margin-left: 10px;
        white-space: nowrap;
        font-size: 12px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .forgot-password {
    color: #1890ff;
    font-size: 14px;
    text-decoration: none;
    margin-left: 16px;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }
}

.login-type-container {
  margin-bottom: 20px;
  text-align: center;

  .el-radio-group {
    .el-radio-button {
      .el-radio-button__inner {
        border-radius: 20px;
        padding: 8px 20px;
        font-size: 14px;
        transition: all 0.3s;

        &:hover {
          color: #409EFF;
          border-color: #409EFF;
        }
      }

      &.is-active {
        .el-radio-button__inner {
          background-color: #409EFF;
          border-color: #409EFF;
          color: #fff;
          box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
        }
      }

      &:first-child {
        .el-radio-button__inner {
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
        }
      }

      &:last-child {
        .el-radio-button__inner {
          border-top-right-radius: 20px;
          border-bottom-right-radius: 20px;
        }
      }
    }
  }
}

.login-button {
  width: 100%;
  margin-bottom: 16px;
}

.register-section {
  text-align: center;
  margin-bottom: 20px;
  font-size: 14px;

  .register-text {
    color: #909399;
    margin-right: 8px;
  }

  .register-link {
    color: #409eff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;

    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }
}

.tips {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
  text-align: center;

  span {
    display: block;
    line-height: 1.5;

    &:first-of-type {
      margin-bottom: 4px;
    }
  }
}

.lockout-notice {
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
  color: #f56c6c;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-size: 14px;

  i {
    margin-right: 8px;
    font-size: 16px;
  }
}

.login-button:disabled {
  background-color: #c0c4cc !important;
  border-color: #c0c4cc !important;
  color: #ffffff !important;
  cursor: not-allowed !important;
}

// 修复输入框图标和密码显示按钮的定位
.el-form-item {
  position: relative;

  .el-input {
    input {
      padding-left: 45px;
      padding-right: 45px;
    }
  }
}
</style>
