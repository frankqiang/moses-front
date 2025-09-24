<template>
  <div class="validation-message">
    <!-- 字段级验证消息 -->
    <transition name="slide-fade">
      <div
        v-if="visible && message"
        class="validation-item"
        :class="[
          `validation-item--${type}`,
          { 'validation-item--inline': inline }
        ]"
      >
        <div class="validation-content">
          <!-- 图标 -->
          <i class="validation-icon" :class="iconClass" />

          <!-- 消息内容 -->
          <span class="validation-text">{{ message }}</span>

          <!-- 关闭按钮 -->
          <i v-if="closable" class="el-icon-close validation-close" @click="handleClose" />
        </div>
      </div>
    </transition>

    <!-- 多条验证消息列表 -->
    <transition-group name="list-fade" tag="div" class="validation-list">
      <div
        v-for="(item, index) in messageList"
        :key="item.id || index"
        class="validation-item"
        :class="[
          `validation-item--${item.type || 'error'}`,
          { 'validation-item--inline': inline }
        ]"
      >
        <div class="validation-content">
          <!-- 图标 -->
          <i class="validation-icon" :class="getIconClass(item.type || 'error')" />

          <!-- 消息内容 -->
          <span class="validation-text">{{ item.message }}</span>

          <!-- 字段名称 -->
          <span v-if="item.field" class="validation-field">
            ({{ item.field }})
          </span>

          <!-- 关闭按钮 -->
          <i v-if="closable" class="el-icon-close validation-close" @click="handleItemClose(index)" />
        </div>
      </div>
    </transition-group>

    <!-- 表单级验证摘要 -->
    <div
      v-if="showSummary && validationSummary.total > 0"
      class="validation-summary"
      :class="`validation-summary--${summaryType}`"
    >
      <div class="summary-header">
        <i :class="getSummaryIconClass()" />
        <span class="summary-title">{{ summaryTitle }}</span>
        <span class="summary-count">({{ validationSummary.total }})</span>
      </div>

      <div v-if="showSummaryDetails" class="summary-details">
        <div v-for="item in filteredSummaryByType" :key="item.type" class="summary-item">
          <i :class="getIconClass(item.type)" />
          <span class="summary-type">{{ getTypeText(item.type) }}</span>
          <span class="summary-type-count">{{ item.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ValidationMessage',

  props: {
    /**
     * 是否显示验证消息
     */
    visible: {
      type: Boolean,
      default: true
    },

    /**
     * 单条验证消息
     */
    message: {
      type: String,
      default: ''
    },

    /**
     * 验证消息类型
     */
    type: {
      type: String,
      default: 'error',
      validator: (value) => ['error', 'warning', 'info', 'success'].includes(value)
    },

    /**
     * 多条验证消息列表
     */
    messageList: {
      type: Array,
      default: () => []
    },

    /**
     * 是否内联显示
     */
    inline: {
      type: Boolean,
      default: false
    },

    /**
     * 是否可关闭
     */
    closable: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示验证摘要
     */
    showSummary: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示摘要详情
     */
    showSummaryDetails: {
      type: Boolean,
      default: true
    },

    /**
     * 摘要标题
     */
    summaryTitle: {
      type: String,
      default: '表单验证失败'
    },

    /**
     * 自动隐藏时间（毫秒）
     */
    autoHide: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      autoHideTimer: null
    }
  },

  computed: {
    /**
     * 图标类名
     */
    iconClass() {
      return this.getIconClass(this.type)
    },

    /**
     * 验证摘要统计
     */
    validationSummary() {
      const summary = {
        total: 0,
        byType: {
          error: 0,
          warning: 0,
          info: 0,
          success: 0
        }
      }

      this.messageList.forEach(item => {
        const type = item.type || 'error'
        summary.byType[type]++
        summary.total++
      })

      return summary
    },

    /**
     * 过滤后的类型统计（去除计数为0的项）
     */
    filteredSummaryByType() {
      const byType = this.validationSummary.byType
      return Object.keys(byType).filter(type => byType[type] > 0)
        .map(type => ({ type, count: byType[type] }))
    },

    /**
     * 摘要类型
     */
    summaryType() {
      if (this.validationSummary.byType.error > 0) return 'error'
      if (this.validationSummary.byType.warning > 0) return 'warning'
      if (this.validationSummary.byType.info > 0) return 'info'
      return 'success'
    }
  },

  watch: {
    visible(newVal) {
      if (newVal && this.autoHide > 0) {
        this.startAutoHide()
      } else {
        this.clearAutoHide()
      }
    },

    messageList: {
      handler() {
        if (this.messageList.length > 0 && this.autoHide > 0) {
          this.startAutoHide()
        }
      },
      deep: true
    }
  },

  beforeDestroy() {
    this.clearAutoHide()
  },

  methods: {
    /**
     * 获取图标类名
     */
    getIconClass(type) {
      const iconMap = {
        error: 'el-icon-warning',
        warning: 'el-icon-warning-outline',
        info: 'el-icon-info',
        success: 'el-icon-success'
      }
      return iconMap[type] || iconMap.error
    },

    /**
     * 获取摘要图标类名
     */
    getSummaryIconClass() {
      return this.getIconClass(this.summaryType)
    },

    /**
     * 获取类型文本
     */
    getTypeText(type) {
      const textMap = {
        error: '错误',
        warning: '警告',
        info: '提示',
        success: '成功'
      }
      return textMap[type] || textMap.error
    },

    /**
     * 处理关闭事件
     */
    handleClose() {
      this.$emit('close')
    },

    /**
     * 处理单项关闭事件
     */
    handleItemClose(index) {
      this.$emit('item-close', index)
    },

    /**
     * 开始自动隐藏
     */
    startAutoHide() {
      this.clearAutoHide()
      this.autoHideTimer = setTimeout(() => {
        this.$emit('auto-hide')
      }, this.autoHide)
    },

    /**
     * 清除自动隐藏
     */
    clearAutoHide() {
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer)
        this.autoHideTimer = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.validation-message {
  .validation-item {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    &--inline {
      display: inline-block;
      margin-right: 12px;
      margin-bottom: 4px;
    }

    .validation-content {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 13px;
      line-height: 1.4;
    }

    &--error {
      .validation-content {
        background-color: #fef0f0;
        border: 1px solid #fbc4c4;
        color: #f56c6c;
      }

      .validation-icon {
        color: #f56c6c;
      }
    }

    &--warning {
      .validation-content {
        background-color: #fdf6ec;
        border: 1px solid #f5dab1;
        color: #e6a23c;
      }

      .validation-icon {
        color: #e6a23c;
      }
    }

    &--info {
      .validation-content {
        background-color: #f4f4f5;
        border: 1px solid #d3d4d6;
        color: #909399;
      }

      .validation-icon {
        color: #909399;
      }
    }

    &--success {
      .validation-content {
        background-color: #f0f9ff;
        border: 1px solid #b3d8ff;
        color: #67c23a;
      }

      .validation-icon {
        color: #67c23a;
      }
    }

    .validation-icon {
      margin-right: 6px;
      font-size: 14px;
      flex-shrink: 0;
    }

    .validation-text {
      flex: 1;
      word-break: break-word;
    }

    .validation-field {
      margin-left: 6px;
      font-size: 12px;
      opacity: 0.8;
      flex-shrink: 0;
    }

    .validation-close {
      margin-left: 8px;
      cursor: pointer;
      font-size: 12px;
      opacity: 0.6;
      flex-shrink: 0;

      &:hover {
        opacity: 1;
      }
    }
  }

  .validation-summary {
    margin-top: 16px;
    padding: 12px;
    border-radius: 6px;

    &--error {
      background-color: #fef0f0;
      border: 1px solid #fbc4c4;
    }

    &--warning {
      background-color: #fdf6ec;
      border: 1px solid #f5dab1;
    }

    &--info {
      background-color: #f4f4f5;
      border: 1px solid #d3d4d6;
    }

    &--success {
      background-color: #f0f9ff;
      border: 1px solid #b3d8ff;
    }

    .summary-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-weight: 500;

      i {
        margin-right: 6px;
        font-size: 16px;
      }

      .summary-title {
        flex: 1;
      }

      .summary-count {
        font-size: 12px;
        opacity: 0.8;
      }
    }

    .summary-details {
      .summary-item {
        display: flex;
        align-items: center;
        padding: 4px 0;
        font-size: 12px;

        i {
          margin-right: 6px;
          font-size: 12px;
        }

        .summary-type {
          flex: 1;
        }

        .summary-type-count {
          font-weight: 500;
        }
      }
    }
  }
}

/* 动画效果 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.3s ease;
}

.list-fade-enter,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-fade-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .validation-message {
    .validation-item {
      &--inline {
        display: block;
        margin-right: 0;
        margin-bottom: 8px;
      }

      .validation-content {
        padding: 6px 10px;
        font-size: 12px;
      }

      .validation-field {
        display: block;
        margin-left: 0;
        margin-top: 2px;
      }
    }

    .validation-summary {
      padding: 10px;

      .summary-header {
        font-size: 13px;
      }

      .summary-details {
        .summary-item {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
