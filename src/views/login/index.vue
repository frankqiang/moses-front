/**
 * 登录页面
 * 功能描述：提供用户登录界面，包含登录表单、记住我功能和忘记密码功能
 * 创建日期：2024-07-24
 */
<template>
  <div class="login-container">
    <div class="login-content">
      <!-- 登录页面头部 -->
      <login-header />
      <!-- 登录表单 -->
      <login-form
        :loading="loading"
        @login="handleLogin"
        @forgot-password="handleForgotPassword"
      />
      <!-- 登录页面页脚 -->
      <login-footer />
    </div>
  </div>
</template>

<script>
// 导入组件
import LoginHeader from './components/LoginHeader'
import LoginForm from './components/LoginForm'
import LoginFooter from './components/LoginFooter'
import './styles/index.scss'

// 导入API
// import { login } from './api'

export default {
  name: 'Login',
  components: {
    LoginHeader,
    LoginForm,
    LoginFooter
  },
  data() {
    return {
      loading: false,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 处理登录请求
     * @param {Object} loginForm - 登录表单数据
     * @param {string} loginForm.username - 用户名
     * @param {string} loginForm.password - 密码
     * @param {boolean} loginForm.rememberMe - 是否记住登录状态
     */
    handleLogin(loginForm) {
      this.loading = true
      this.$store.dispatch('user/login', {
        username: loginForm.username,
        password: loginForm.password,
        rememberMe: loginForm.rememberMe
      }).then(() => {
        this.$message.success('登录成功')
        this.$router.push({ path: this.redirect || '/' })
        this.loading = false
      }).catch(error => {
        this.$message.error(error.message || '登录失败，请检查用户名和密码')
        this.loading = false
      })
    },
    handleForgotPassword() {
      this.$message.info('密码重置功能正在开发中')
    }
  }
}
</script>

<style lang="scss" scoped>
$bg: #f0f2f5;
$box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

.login-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg;
  background-image: url('../../assets/login-bg.svg');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .login-content {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: $box-shadow;
    width: 420px;
    padding: 30px;
    position: relative;
  }
}
</style>
