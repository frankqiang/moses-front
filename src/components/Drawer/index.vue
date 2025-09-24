/**
* 抽屉组件
* 功能描述：纯粹的抽屉容器组件，专注于抽屉的显示和交互，不耦合表单逻辑
* 创建日期：2024-11-21
* 更新日期：2024-12-16 - 应用现代前端开发范式优化，增强用户体验和代码质量
*/
<template>
  <el-drawer
    :title="title"
    :visible.sync="drawerVisible"
    :size="width"
    :direction="direction"
    :before-close="handleClose"
    :custom-class="drawerClass"
    :wrapper-closable="wrapperClosable"
    :aria-label="`${title}抽屉`"
    :aria-modal="true"
    role="dialog"
    append-to-body
    @open="handleOpen"
    @closed="handleClosed"
  >
    <!-- 自定义头部插槽 -->
    <template #title>
      <slot name="title">
        <span :aria-label="`抽屉标题：${title}`">{{ title }}</span>
      </slot>
    </template>

    <!-- 错误提示区域 - 固定在顶部 -->
    <div v-if="$slots.error" class="drawer-error-bar" role="alert" aria-live="polite">
      <slot name="error" />
    </div>

    <!-- 内容区域 -->
    <div ref="drawerContent" class="drawer-content" :aria-busy="loading" role="main">
      <slot :visible="drawerVisible" :loading="loading" />
    </div>

    <!-- 底部区域 -->
    <div v-if="$slots.footer || showFooter" class="drawer-footer" role="toolbar" :aria-label="'抽屉操作按钮区域'">
      <slot name="footer">
        <el-button :disabled="loading" :aria-label="`${cancelButtonText}并关闭抽屉`" @click="handleCancelClick">
          {{ cancelButtonText }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="loading"
          :aria-label="`${confirmButtonText}操作`"
          @click="handleConfirmClick"
        >
          {{ confirmButtonText }}
        </el-button>
      </slot>
    </div>
  </el-drawer>
</template>

<script>
import { debounce } from '@/utils'

export default {
  name: 'BaseDrawer',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 抽屉是否可见
    visible: {
      type: Boolean,
      default: false
    },

    // 抽屉标题 - 加强验证
    title: {
      type: String,
      default: '抽屉',
      validator(value) {
        if (typeof value !== 'string') {
          console.error('[BaseDrawer] title must be a string')
          return false
        }
        if (value.length > 50) {
          console.warn('[BaseDrawer] title is too long, consider shorter text for better UX')
        }
        return true
      }
    },

    // 抽屉宽度 - 加强验证
    width: {
      type: String,
      default: '550px',
      validator(value) {
        // 验证CSS单位格式
        const cssUnitRegex = /^\d+(\.\d+)?(px|%|rem|em|vw|vh)$/
        if (!cssUnitRegex.test(value)) {
          console.error('[BaseDrawer] width must be a valid CSS unit (e.g., "550px", "50%", "30vw")')
          return false
        }
        return true
      }
    },

    // 抽屉方向
    direction: {
      type: String,
      default: 'rtl',
      validator: value => ['ltr', 'rtl', 'ttb', 'btt'].includes(value)
    },

    // 自定义类名
    customClass: {
      type: String,
      default: 'base-drawer'
    },

    // 是否点击遮罩关闭
    wrapperClosable: {
      type: Boolean,
      default: false
    },

    // 是否显示底部区域
    showFooter: {
      type: Boolean,
      default: true
    },

    // 确认按钮文本
    confirmButtonText: {
      type: String,
      default: '确 定'
    },

    // 取消按钮文本
    cancelButtonText: {
      type: String,
      default: '取 消'
    },

    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },

    // 关闭前确认
    confirmBeforeClose: {
      type: Boolean,
      default: false
    },

    // 关闭确认消息
    closeConfirmMessage: {
      type: String,
      default: '确定要关闭抽屉吗？未保存的更改将丢失。'
    }
  },

  data() {
    return {
      // 内部抽屉可见状态
      drawerVisible: this.visible,
      // 错误状态
      hasError: false,
      // 内部加载状态
      internalLoading: false
    }
  },

  computed: {
    // 实际的加载状态
    actualLoading() {
      return this.loading || this.internalLoading
    },

    // 抽屉CSS类名
    drawerClass() {
      const classes = [this.customClass]
      if (this.$slots.error) {
        classes.push('has-error')
      }
      return classes.join(' ')
    }
  },

  watch: {
    // 监听外部visible变化
    visible(val) {
      this.drawerVisible = val
    },

    // 监听内部drawerVisible变化
    drawerVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.$emit('close')
      }
    }
  },

  created() {
    this.initDebouncedMethods()
  },

  mounted() {
    this.setupKeyboardListeners()
  },

  beforeDestroy() {
    this.cleanup()
  },

  methods: {
    // 初始化防抖方法
    initDebouncedMethods() {
      this.debouncedConfirm = debounce(this.handleConfirm, 300)
      this.debouncedCancel = debounce(this.handleCancel, 300)
      this.debouncedClose = debounce(this.handleCloseConfirm, 300)
    },

    // 设置键盘监听
    setupKeyboardListeners() {
      this.handleKeydown = (event) => {
        if (!this.drawerVisible) return

        // ESC键关闭抽屉
        if (event.key === 'Escape') {
          event.preventDefault()
          this.handleCancelClick()
        }

        // Enter键确认（当焦点不在表单元素上时）
        if (event.key === 'Enter' && event.ctrlKey) {
          event.preventDefault()
          this.handleConfirmClick()
        }
      }

      document.addEventListener('keydown', this.handleKeydown)
    },

    // 清理资源
    cleanup() {
      if (this.debouncedConfirm?.cancel) {
        this.debouncedConfirm.cancel()
      }
      if (this.debouncedCancel?.cancel) {
        this.debouncedCancel.cancel()
      }
      if (this.debouncedClose?.cancel) {
        this.debouncedClose.cancel()
      }
      if (this.handleKeydown) {
        document.removeEventListener('keydown', this.handleKeydown)
      }
    },

    // 防抖版本的按钮点击处理
    handleConfirmClick() {
      this.debouncedConfirm()
    },

    handleCancelClick() {
      this.debouncedCancel()
    },

    // 确认按钮点击 - 添加错误处理
    async handleConfirm() {
      if (this.actualLoading || this.hasError) return

      try {
        this.internalLoading = true
        this.hasError = false

        // 发送确认事件并等待处理
        const result = await new Promise((resolve, reject) => {
          this.$emit('confirm', { resolve, reject })

          // 如果没有异步处理，默认成功
          this.$nextTick(() => {
            if (!this.actualLoading) {
              resolve()
            }
          })
        })

        // 成功后可能需要关闭抽屉（由父组件决定）
        // this.drawerVisible = false
      } catch (error) {
        console.error('[BaseDrawer] Confirm operation failed:', error)
        this.hasError = true
        this.$message.error(error.message || '操作失败，请稍后重试')
        this.$emit('error', error)
      } finally {
        this.internalLoading = false
      }
    },

    // 取消按钮点击 - 添加错误处理
    async handleCancel() {
      if (this.internalLoading) return

      try {
        // 检查是否需要确认关闭
        if (this.confirmBeforeClose) {
          await this.$confirm(this.closeConfirmMessage, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }

        this.drawerVisible = false
        this.hasError = false
        this.$emit('cancel')
      } catch (error) {
        if (error !== 'cancel') {
          console.error('[BaseDrawer] Cancel operation failed:', error)
          this.$emit('error', error)
        }
      }
    },

    // 关闭抽屉 - 增强错误处理
    async handleClose(done) {
      try {
        this.$emit('before-close', done)

        // 如果需要确认关闭
        if (this.confirmBeforeClose && !this.hasError) {
          await this.debouncedClose(done)
          return
        }

        done()
      } catch (error) {
        console.error('[BaseDrawer] Close operation failed:', error)
        this.$emit('error', error)
        // 即使出错也要关闭抽屉，避免卡住
        done()
      }
    },

    // 关闭确认处理
    async handleCloseConfirm(done) {
      try {
        await this.$confirm(this.closeConfirmMessage, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        done()
      } catch (error) {
        // 用户取消关闭，不执行done()
        if (error === 'cancel') {
          return
        }
        throw error
      }
    },

    // 抽屉打开时
    handleOpen() {
      this.hasError = false
      this.$emit('open')

      // 设置焦点到抽屉内容区域，提升可访问性
      this.$nextTick(() => {
        if (this.$refs.drawerContent) {
          this.$refs.drawerContent.focus()
        }
      })
    },

    // 抽屉关闭后
    handleClosed() {
      this.hasError = false
      this.internalLoading = false
      this.$emit('closed')
    },

    // 手动关闭抽屉
    close() {
      this.drawerVisible = false
    },

    // 手动设置加载状态
    setLoading(loading) {
      this.internalLoading = loading
    },

    // 重置错误状态
    resetError() {
      this.hasError = false
    }
  }
}
</script>

<style lang="scss" scoped>
.base-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #e6e6e6;
  }

  :deep(.el-drawer__body) {
    height: calc(100% - 60px);
    overflow-y: auto;
    padding: 0;
    width: 100%;
    position: relative;
  }

  // 确保错误提示条能够完全贴合抽屉顶部
  .drawer-error-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    margin: 0;
    width: 100%;
  }

  // 当有错误提示时，内容区域需要向下偏移
  &.has-error .drawer-content {
    padding-top: 60px; // 为错误提示条留出空间
  }
}

.drawer-content {
  padding: 20px;
  padding-bottom: 100px;
  /* 增加底部空间，确保错误提示不被footer遮挡 */
  position: relative;
  width: calc(100% - 40px);
  box-sizing: border-box;
  min-height: calc(100% - 40px);

  // 改善焦点可访问性
  &:focus {
    outline: none;
  }

  // 错误状态样式
  &[aria-busy="true"] {
    opacity: 0.8;
    pointer-events: none;
  }
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e6e6e6;
  text-align: right;
  z-index: 1;

  .el-button {
    margin-left: 10px;

    // 改善按钮的可访问性
    &:focus {
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
    }

    // 禁用状态样式
    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// 错误状态指示器
.drawer-error {
  border-left: 4px solid #f56c6c;
  background-color: #fef0f0;
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 4px;

  .error-message {
    color: #f56c6c;
    font-size: 14px;
  }
}

// 加载状态遮罩
.drawer-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

// 错误提示条样式（在.base-drawer内部已定义基本定位）
.drawer-error-bar {
  padding: 16px 20px 12px 20px;
  background-color: #fef0f0;
  border-bottom: 1px solid #fbc4c4;
  color: #f56c6c;
  font-size: 14px;
  line-height: 1.4;

  // 确保在内容滚动时始终可见
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.1);

  // 错误提示动画
  animation: slideInDown 0.3s ease-out;

  // 圆角只保留底部，让顶部完全平齐
  border-radius: 0 0 4px 4px;
}

// 响应式设计
@media (max-width: 768px) {
  .drawer-content {
    padding: 16px;
    padding-bottom: 80px;
    /* 移动端也增加底部空间 */
    width: calc(100% - 32px);
  }

  .drawer-error-bar {
    padding: 14px 16px 10px 16px;
    font-size: 13px;
  }

  .base-drawer.has-error .drawer-content {
    padding-top: 50px; // 移动端调整偏移量
  }

  .drawer-footer {
    padding: 12px 16px;

    .el-button {
      font-size: 14px;
      padding: 8px 16px;
    }
  }
}
</style>
