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
          // API返回失败状态
          throw new Error(response?.message || '登录失败')
        }
      } catch (error) {
        // 登录失败处理
        console.error('登录失败:', error)
        
        // 根据错误类型显示不同的错误信息
        let errorMessage = '登录失败，请检查用户名和密码'
        
        if (error.response) {
          // HTTP错误响应
          const { status, data } = error.response
          if (status === 401) {
            errorMessage = '用户名或密码错误'
          } else if (status === 403) {
            errorMessage = '账户已被禁用，请联系管理员'
          } else if (status === 429) {
            errorMessage = '登录尝试次数过多，请稍后再试'
          } else if (data && data.message) {
            errorMessage = data.message
          }
        } else if (error.message) {
          errorMessage = error.message
        }
        
        // 通知登录表单组件处理失败
        this.$refs.loginForm.handleLoginFailure()
        
        this.$message({
          message: errorMessage,
          type: 'error'
        })
      } finally {
        this.loading = false
      }
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
