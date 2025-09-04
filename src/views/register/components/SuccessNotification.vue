<template>
  <div class="success-notification">
    <!-- 成功对话框 -->
    <el-dialog
      :visible.sync="visible"
      :title="title"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      center
      class="success-dialog"
    >
      <div class="success-content">
        <!-- 成功图标 -->
        <div class="success-icon">
          <i class="el-icon-success"></i>
        </div>
        
        <!-- 成功消息 -->
        <div class="success-message">
          <h3 class="success-title">{{ successTitle }}</h3>
          <p class="success-description">{{ successMessage }}</p>
        </div>
        
        <!-- 详细信息 -->
        <div v-if="details && details.length > 0" class="success-details">
          <div v-for="(detail, index) in details" :key="index" class="detail-item">
            <span class="detail-label">{{ detail.label }}：</span>
            <span class="detail-value">{{ detail.value }}</span>
          </div>
        </div>
        
        <!-- 提示信息 -->
        <div v-if="tips && tips.length > 0" class="success-tips">
          <div class="tips-title">
            <i class="el-icon-info"></i>
            <span>温馨提示</span>
          </div>
          <ul class="tips-list">
            <li v-for="(tip, index) in tips" :key="index" class="tip-item">
              {{ tip }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div slot="footer" class="dialog-footer">
        <el-button
          v-for="(action, index) in actions"
          :key="index"
          :type="action.type || 'default'"
          :size="action.size || 'medium'"
          @click="handleAction(action)"
          class="action-btn"
        >
          {{ action.text }}
        </el-button>
      </div>
    </el-dialog>
    
    <!-- 成功消息提示 -->
    <transition name="fade">
      <div 
        v-if="showToast && toastVisible" 
        class="success-toast"
        :class="`success-toast--${toastPosition}`"
      >
        <div class="toast-content">
          <i class="el-icon-success toast-icon"></i>
          <span class="toast-message">{{ toastMessage }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SuccessNotification',
  
  props: {
    /**
     * 是否显示成功提示
     */
    visible: {
      type: Boolean,
      default: false
    },
    
    /**
     * 对话框标题
     */
    title: {
      type: String,
      default: '操作成功'
    },
    
    /**
     * 成功标题
     */
    successTitle: {
      type: String,
      default: '操作成功！'
    },
    
    /**
     * 成功消息
     */
    successMessage: {
      type: String,
      default: '您的操作已成功完成'
    },
    
    /**
     * 详细信息列表
     */
    details: {
      type: Array,
      default: () => []
    },
    
    /**
     * 提示信息列表
     */
    tips: {
      type: Array,
      default: () => []
    },
    
    /**
     * 操作按钮列表
     */
    actions: {
      type: Array,
      default: () => [
        {
          text: '确定',
          type: 'primary',
          action: 'confirm'
        }
      ]
    },
    
    /**
     * 是否显示Toast提示
     */
    showToast: {
      type: Boolean,
      default: false
    },
    
    /**
     * Toast消息内容
     */
    toastMessage: {
      type: String,
      default: '操作成功'
    },
    
    /**
     * Toast位置
     */
    toastPosition: {
      type: String,
      default: 'top',
      validator: (value) => ['top', 'center', 'bottom'].includes(value)
    },
    
    /**
     * Toast自动隐藏时间（毫秒）
     */
    toastDuration: {
      type: Number,
      default: 3000
    }
  },
  
  data() {
    return {
      toastVisible: false,
      toastTimer: null
    }
  },
  
  watch: {
    showToast(newVal) {
      if (newVal) {
        this.showToastMessage()
      } else {
        this.hideToastMessage()
      }
    }
  },
  
  methods: {
    /**
     * 处理操作按钮点击
     */
    handleAction(action) {
      this.$emit('action', action.action || action.text, action)
    },
    
    /**
     * 显示Toast消息
     */
    showToastMessage() {
      this.toastVisible = true
      
      // 自动隐藏
      if (this.toastDuration > 0) {
        this.toastTimer = setTimeout(() => {
          this.hideToastMessage()
        }, this.toastDuration)
      }
    },
    
    /**
     * 隐藏Toast消息
     */
    hideToastMessage() {
      this.toastVisible = false
      
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
        this.toastTimer = null
      }
    },
    
    /**
     * 关闭对话框
     */
    close() {
      this.$emit('update:visible', false)
    }
  },
  
  beforeDestroy() {
    // 清理定时器
    if (this.toastTimer) {
      clearTimeout(this.toastTimer)
    }
  }
}
</script>

<style lang="scss" scoped>
.success-notification {
  .success-dialog {
    .success-content {
      text-align: center;
      padding: 20px 0;
      
      .success-icon {
        margin-bottom: 20px;
        
        .el-icon-success {
          font-size: 64px;
          color: #67c23a;
        }
      }
      
      .success-message {
        margin-bottom: 24px;
        
        .success-title {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }
        
        .success-description {
          font-size: 14px;
          color: #606266;
          margin: 0;
          line-height: 1.5;
        }
      }
      
      .success-details {
        background-color: #f5f7fa;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 20px;
        text-align: left;
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          
          &:not(:last-child) {
            border-bottom: 1px solid #ebeef5;
            margin-bottom: 8px;
            padding-bottom: 8px;
          }
          
          .detail-label {
            font-weight: 500;
            color: #606266;
            min-width: 80px;
          }
          
          .detail-value {
            color: #303133;
            font-weight: 600;
          }
        }
      }
      
      .success-tips {
        background-color: #ecf5ff;
        border: 1px solid #d9ecff;
        border-radius: 6px;
        padding: 16px;
        text-align: left;
        
        .tips-title {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-weight: 500;
          color: #409eff;
          
          .el-icon-info {
            margin-right: 6px;
            font-size: 16px;
          }
        }
        
        .tips-list {
          margin: 0;
          padding-left: 20px;
          
          .tip-item {
            color: #606266;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 4px;
            
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
    
    .dialog-footer {
      text-align: center;
      
      .action-btn {
        margin: 0 8px;
        min-width: 80px;
      }
    }
  }
  
  .success-toast {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    background-color: #f0f9ff;
    border: 1px solid #67c23a;
    border-radius: 6px;
    padding: 12px 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    
    &--top {
      top: 20px;
    }
    
    &--center {
      top: 50%;
      transform: translate(-50%, -50%);
    }
    
    &--bottom {
      bottom: 20px;
    }
    
    .toast-content {
      display: flex;
      align-items: center;
      
      .toast-icon {
        color: #67c23a;
        font-size: 16px;
        margin-right: 8px;
      }
      
      .toast-message {
        color: #303133;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .success-notification {
    .success-dialog {
      width: 90% !important;
      
      .success-content {
        padding: 16px 0;
        
        .success-icon {
          .el-icon-success {
            font-size: 48px;
          }
        }
        
        .success-message {
          .success-title {
            font-size: 18px;
          }
          
          .success-description {
            font-size: 13px;
          }
        }
        
        .success-details {
          padding: 12px;
          
          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            
            .detail-label {
              margin-bottom: 4px;
            }
          }
        }
      }
    }
    
    .success-toast {
      left: 10px;
      right: 10px;
      transform: none;
      
      &--center {
        left: 10px;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}
</style>