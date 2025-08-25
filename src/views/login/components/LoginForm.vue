/**
 * 登录表单组件
 * 功能描述：提供用户登录表单，包含用户名、密码输入框、记住我选项和登录按钮
 * 创建日期：2024-07-24
 */
<template>
  <enhanced-form
    ref="loginForm"
    :data="loginForm"
    :rules="loginRules"
    class="login-form"
    label-width="0px"
    :loading="loading"
    :show-footer="false"
    @submit="handleLogin"
  >
    <template>
      <div class="title-container">
        <h3 class="title">用户登录</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="请输入用户名"
          name="username"
          type="text"
          tabindex="1"
          auto-complete="on"
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
          placeholder="请输入密码"
          name="password"
          tabindex="2"
          auto-complete="on"
          @keyup.enter.native="handleLogin"
        />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>
      
      <div class="remember-container">
        <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
        <a href="javascript:;" class="forgot-password" @click="handleForgotPassword">忘记密码?</a>
      </div>

      <el-button type="primary" class="login-button" @click.native.prevent="handleLogin">登录</el-button>

      <div class="tips" v-if="isDev">
        <span>测试账号: admin</span>
        <span>密码: 任意6位以上</span>
      </div>
    </template>
  </enhanced-form>
</template>

<script>
import { DEFAULT_LOGIN_FORM, LOGIN_RULES, ENV_CONFIG } from '../constants'
import EnhancedForm from '@/components/EnhancedForm'

export default {
  name: 'LoginForm',
  components: {
    EnhancedForm
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loginForm: { ...DEFAULT_LOGIN_FORM },
      loginRules: LOGIN_RULES,
      passwordType: 'password',
      isDev: ENV_CONFIG.isDev
    }
  },
  created() {
    // 从本地存储中获取记住的登录信息
    this.loadRememberedUser()
  },
  methods: {
    loadRememberedUser() {
      const rememberedUser = localStorage.getItem('rememberedUser')
      if (rememberedUser) {
        try {
          const userInfo = JSON.parse(rememberedUser)
          this.loginForm.username = userInfo.username
          this.loginForm.rememberMe = true
        } catch (e) {
          // 解析失败，清除可能损坏的数据
          localStorage.removeItem('rememberedUser')
        }
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
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          // 处理记住我功能
          this.saveRememberedUser()
          
          // 触发登录事件
          this.$emit('login', { ...this.loginForm })
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    },
    saveRememberedUser() {
      if (this.loginForm.rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({
          username: this.loginForm.username
        }))
      } else {
        localStorage.removeItem('rememberedUser')
      }
    },
    handleForgotPassword() {
      this.$emit('forgot-password')
    },
    // 重置表单
    resetForm() {
      this.$refs.loginForm.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.login-form {
  width: 100%;
}

.remember-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .forgot-password {
    color: #1890ff;
    font-size: 14px;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.login-button {
  width: 100%;
  margin-bottom: 24px;
}

.tips {
  font-size: 14px;
  color: #666;
  margin-bottom: 40px;
  text-align: center;

  span {
    display: block;
    line-height: 1.5;
    
    &:first-of-type {
      margin-bottom: 4px;
    }
  }
}

.svg-container {
  padding: 6px 5px 6px 15px;
  color: #bfbfbf;
  vertical-align: middle;
  width: 30px;
  display: inline-block;
  transition: all 0.3s;
}

.title-container {
  position: relative;

  .title {
    font-size: 24px;
    color: #333;
    margin: 0 auto 30px;
    text-align: center;
    font-weight: 600;
  }
}

.show-pwd {
  position: absolute;
  right: 10px;
  top: 14px;
  font-size: 16px;
  color: #bfbfbf;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;

  &:hover {
    color: #1890ff;
  }
}
</style>