/**
 * 错误处理组件
 * 功能描述：处理用户信息获取失败、401错误等异常情况的统一组件
 * 创建日期：2024-01-20
 */
<template>
  <div class="error-handler">
    <!-- 401 未授权错误 -->
    <el-dialog
      title="登录已过期"
      :visible.sync="show401Dialog"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      center
    >
      <div class="error-content">
        <i class="el-icon-warning error-icon" />
        <p class="error-message">{{ error401Message }}</p>
        <p class="error-tip">请重新登录以继续使用系统</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleRelogin">重新登录</el-button>
      </div>
    </el-dialog>

    <!-- 用户信息加载失败提示 -->
    <el-dialog
      title="用户信息加载失败"
      :visible.sync="showUserInfoErrorDialog"
      width="400px"
      center
    >
      <div class="error-content">
        <i class="el-icon-info error-icon warning" />
        <p class="error-message">{{ userInfoErrorMessage }}</p>
        <p class="error-tip">系统将使用默认信息，您可以稍后重试</p>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="showUserInfoErrorDialog = false">稍后重试</el-button>
        <el-button type="primary" @click="handleRetryUserInfo">立即重试</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ErrorHandler',
  data() {
    return {
      show401Dialog: false,
      showUserInfoErrorDialog: false,
      error401Message: '',
      userInfoErrorMessage: ''
    }
  },
  mounted() {
    // 监听全局错误事件
    this.$bus.$on('auth-error', this.handleAuthError)
    this.$bus.$on('user-info-error', this.handleUserInfoError)
  },
  beforeDestroy() {
    // 移除事件监听
    this.$bus.$off('auth-error', this.handleAuthError)
    this.$bus.$off('user-info-error', this.handleUserInfoError)
  },
  methods: {
    ...mapActions('user', ['getInfo', 'resetToken']),

    // 处理认证错误
    handleAuthError(error) {
      const { code, message } = error

      if (code === 'AUTH_001') {
        this.error401Message = '请先登录'
      } else if (code === 'AUTH_002') {
        this.error401Message = '登录已过期，请重新登录'
      } else {
        this.error401Message = message || '认证失败，请重新登录'
      }

      this.show401Dialog = true
    },

    // 处理用户信息获取错误
    handleUserInfoError(error) {
      this.userInfoErrorMessage = error.message || '获取用户信息失败'
      this.showUserInfoErrorDialog = true
    },

    // 重新登录
    async handleRelogin() {
      this.show401Dialog = false

      try {
        // 清除本地状态
        await this.resetToken()

        // 跳转到登录页
        this.$router.push(`/login?redirect=${this.$route.fullPath}`)

        this.$message({
          message: '请重新登录',
          type: 'info'
        })
      } catch (error) {
        console.error('重新登录处理失败:', error)
        // 强制跳转
        window.location.href = '/login'
      }
    },

    // 重试获取用户信息
    async handleRetryUserInfo() {
      this.showUserInfoErrorDialog = false

      try {
        const loading = this.$loading({
          lock: true,
          text: '正在获取用户信息...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        await this.getInfo()

        loading.close()

        this.$message({
          message: '用户信息获取成功',
          type: 'success'
        })
      } catch (error) {
        console.error('重试获取用户信息失败:', error)

        this.$message({
          message: '获取用户信息失败，请稍后重试',
          type: 'error'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.error-handler {
  .error-content {
    text-align: center;
    padding: 20px 0;

    .error-icon {
      font-size: 48px;
      color: #f56c6c;
      margin-bottom: 16px;

      &.warning {
        color: #e6a23c;
      }
    }

    .error-message {
      font-size: 16px;
      color: #303133;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .error-tip {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .dialog-footer {
    text-align: center;

    .el-button {
      margin: 0 8px;
    }
  }
}
</style>
