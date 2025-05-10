/**
 * 刷新按钮组件
 * 功能描述：提供表格数据刷新功能，支持加载状态显示和自定义样式
 * 创建日期：2023-12-10
 */
<template>
  <el-button
    :size="size"
    :type="type"
    :plain="plain"
    :round="round"
    :circle="circle"
    :disabled="disabled || loading"
    :loading="loading"
    :title="title || text"
    @click="handleRefresh"
  >
    <i v-if="!loading && !hideIcon" :class="icon"></i>
    <span v-if="!circle && text">{{ text }}</span>
  </el-button>
</template>

<script>
export default {
  name: 'RefreshButton',
  props: {
    // 按钮文本
    text: {
      type: String,
      default: '刷新'
    },
    // 按钮图标
    icon: {
      type: String,
      default: 'el-icon-refresh'
    },
    // 是否隐藏图标
    hideIcon: {
      type: Boolean,
      default: false
    },
    // 按钮大小
    size: {
      type: String,
      default: 'mini'
    },
    // 按钮类型
    type: {
      type: String,
      default: 'default'
    },
    // 是否为朴素按钮
    plain: {
      type: Boolean,
      default: false
    },
    // 是否为圆角按钮
    round: {
      type: Boolean,
      default: false
    },
    // 是否为圆形按钮
    circle: {
      type: Boolean,
      default: false
    },
    // 按钮标题（tooltip）
    title: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 手动控制加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 点击后是否自动显示加载状态
    autoLoading: {
      type: Boolean,
      default: false
    },
    // 自动加载状态持续时间（毫秒）
    autoLoadingDuration: {
      type: Number,
      default: 500
    },
    // 刷新前确认
    confirmBeforeRefresh: {
      type: Boolean,
      default: false
    },
    // 刷新确认文本
    confirmText: {
      type: String,
      default: '确定刷新数据吗？'
    },
    // 刷新确认标题
    confirmTitle: {
      type: String,
      default: '刷新确认'
    }
  },
  data() {
    return {
      // 内部加载状态
      internalLoading: false,
      // 加载定时器
      loadingTimer: null
    }
  },
  computed: {
    // 组合加载状态
    isLoading() {
      return this.loading || this.internalLoading
    }
  },
  beforeDestroy() {
    // 清除定时器
    this.clearLoadingTimer()
  },
  methods: {
    // 处理刷新点击
    handleRefresh() {
      if (this.disabled || this.isLoading) return
      
      // 如需确认
      if (this.confirmBeforeRefresh) {
        this.$confirm(this.confirmText, this.confirmTitle, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.executeRefresh()
        }).catch(() => {
          // 取消刷新
          this.$emit('cancel')
        })
      } else {
        this.executeRefresh()
      }
    },
    
    // 执行刷新
    executeRefresh() {
      // 如果开启自动加载状态
      if (this.autoLoading) {
        this.startLoading()
      }
      
      // 触发刷新事件
      this.$emit('refresh')
    },
    
    // 开始加载状态
    startLoading() {
      this.clearLoadingTimer()
      this.internalLoading = true
      
      this.loadingTimer = setTimeout(() => {
        this.internalLoading = false
      }, this.autoLoadingDuration)
    },
    
    // 清除加载定时器
    clearLoadingTimer() {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer)
        this.loadingTimer = null
      }
    },
    
    // 手动停止加载状态
    stopLoading() {
      this.clearLoadingTimer()
      this.internalLoading = false
    }
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style> 