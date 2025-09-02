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
        ref="loginForm"
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
     * 处理登录
     * @param {Object} loginData - 登录数据
     * @param {string} loginData.username - 用户名
     * @param {string} loginData.password - 密码
     * @param {boolean} loginData.rememberMe - 是否记住登录状态
     */
    async handleLogin(loginData) {
      this.loading = true
      try {
        // 调用store中的登录action
        const response = await this.$store.dispatch('user/login', loginData)

        // 检查Moses API响应格式
        if (response && response.success) {
          // 通知登录表单组件处理成功
          this.$refs.loginForm.handleLoginSuccess()

          // 登录成功提示
          this.$message({
            message: response.message || '登录成功',
            type: 'success'
          })

          // 跳转到目标页面
          this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
        } else {
          console.log(response)
        }
      } catch (error) {
        console.error('登录失败:', error)

        // 处理Moses API错误响应格式
        let errorMessage = '登录失败，请重试'

        if (error.response && error.response.data) {
          // 处理HTTP响应错误（如400, 401等）
          const errorData = error.response.data
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message
          } else if (errorData.message) {
            errorMessage = errorData.message
          }
        } else if (error.message) {
          // 处理其他类型的错误（如网络错误）
          errorMessage = error.message
        }

        // 构造标准化的错误对象
        const errorObj = {
          code: error.response?.data?.error?.code || error.code,
          message: errorMessage,
          details: error.response?.data?.error?.details
        }

        // 通知登录表单组件处理失败，传递错误对象
        let handled = false
        if (this.$refs.loginForm && this.$refs.loginForm.handleLoginFailure) {
          handled = this.$refs.loginForm.handleLoginFailure(errorObj)
        }

        // 如果LoginForm组件没有处理该错误，则显示通用错误提示
        if (!handled) {
          this.$message({
            message: errorMessage,
            type: 'error'
          })
        }
      } finally {
        // 确保loading状态被重置
        this.loading = false
      }
    },
    /**
     * 处理忘记密码
     * 显示密码重置功能开发中的提示
     */
    handleForgotPassword() {
      this.$message({
        message: '密码重置功能正在开发中',
        type: 'info'
      })
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
