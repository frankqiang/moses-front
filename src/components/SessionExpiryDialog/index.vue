<template>
  <el-dialog
    title="会话即将过期"
    :visible.sync="internalVisible"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    center
    class="session-expiry-dialog"
  >
    <div class="dialog-content">
      <div class="warning-icon">
        <i
          class="el-icon-warning"
          style="color: #E6A23C; font-size: 48px;"
        />
      </div>
      <div class="message">
        <p>您的会话将在 <strong>{{ internalCountdown }}</strong> 秒后过期</p>
        <p>请选择继续工作或立即退出</p>
      </div>
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="info"
        @click="handleLogout"
      >
        立即退出
      </el-button>
      <el-button
        type="primary"
        @click="handleContinue"
      >
        继续工作
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SessionExpiryDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    countdown: {
      type: Number,
      default: 300 // 5分钟倒计时
    }
  },
  data() {
    return {
      internalCountdown: this.countdown,
      internalVisible: this.visible
    }
  },
  watch: {
    countdown(newVal) {
      this.internalCountdown = newVal
    },
    visible(newVal) {
      this.internalVisible = newVal
    }
  },
  methods: {
    handleContinue() {
      this.$emit('continue')
    },
    handleLogout() {
      this.$emit('logout')
    }
  }
}
</script>

<style lang="scss" scoped>
.session-expiry-dialog {
  ::v-deep .el-dialog {
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  ::v-deep .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 24px 16px;
    border-radius: 8px 8px 0 0;

    .el-dialog__title {
      color: white;
      font-weight: 600;
      font-size: 18px;
    }
  }

  ::v-deep .el-dialog__body {
    padding: 24px;
  }

  .dialog-content {
    text-align: center;

    .warning-icon {
      margin-bottom: 16px;
    }

    .message {
      p {
        margin: 8px 0;
        font-size: 16px;
        line-height: 1.5;
        color: #606266;

        strong {
          color: #E6A23C;
          font-weight: 600;
        }
      }
    }
  }

  .dialog-footer {
    text-align: center;
    padding-top: 16px;

    .el-button {
      margin: 0 8px;
      padding: 12px 24px;
      font-size: 14px;
      border-radius: 6px;

      &.el-button--primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;

        &:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }
      }
    }
  }
}

// 全局样式，确保弹窗在最顶层
::v-deep .session-expiry-dialog .el-dialog__wrapper {
  z-index: 3000 !important;
}
</style>
