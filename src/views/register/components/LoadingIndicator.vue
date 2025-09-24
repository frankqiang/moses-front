<template>
  <div class="loading-indicator">
    <!-- 全屏加载遮罩 -->
    <div
      v-if="fullscreen && visible"
      class="loading-overlay"
      :class="{ 'loading-overlay--transparent': transparent }"
    >
      <div class="loading-content">
        <i class="el-icon-loading loading-spinner" :style="{ fontSize: computedSpinnerSize + 'px' }" />
        <p v-if="text" class="loading-text">{{ text }}</p>
      </div>
    </div>

    <!-- 内联加载指示器 -->
    <div
      v-else-if="visible"
      class="loading-inline"
      :class="`loading-inline--${size}`"
    >
      <i class="el-icon-loading loading-spinner" :style="{ fontSize: computedSpinnerSize + 'px' }" />
      <span v-if="text" class="loading-text">{{ text }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingIndicator',

  props: {
    /**
     * 是否显示加载指示器
     */
    visible: {
      type: Boolean,
      default: false
    },

    /**
     * 加载提示文本
     */
    text: {
      type: String,
      default: ''
    },

    /**
     * 是否全屏显示
     */
    fullscreen: {
      type: Boolean,
      default: false
    },

    /**
     * 遮罩是否透明
     */
    transparent: {
      type: Boolean,
      default: false
    },

    /**
     * 加载指示器大小
     */
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },

    /**
     * 自定义旋转图标大小
     */
    spinnerSize: {
      type: [String, Number],
      default: null
    }
  },

  computed: {
    /**
     * 计算旋转图标大小
     */
    computedSpinnerSize() {
      if (this.spinnerSize) {
        return this.spinnerSize
      }

      const sizeMap = {
        small: 16,
        medium: 20,
        large: 24
      }

      return this.fullscreen ? 32 : sizeMap[this.size]
    }
  },

  watch: {
    visible(newVal) {
      if (this.fullscreen) {
        // 全屏模式下控制body滚动
        if (newVal) {
          document.body.style.overflow = 'hidden'
        } else {
          document.body.style.overflow = ''
        }
      }
    }
  },

  beforeDestroy() {
    // 组件销毁时恢复body滚动
    if (this.fullscreen) {
      document.body.style.overflow = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-indicator {
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(2px);

    &--transparent {
      background-color: rgba(255, 255, 255, 0.5);
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .loading-spinner {
        color: #409eff;
      }

      .loading-text {
        margin: 0;
        font-size: 14px;
        color: #606266;
        font-weight: 500;
      }
    }
  }

  .loading-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    .loading-spinner {
      color: #409eff;
    }

    .loading-text {
      font-size: 14px;
      color: #606266;
    }

    &--small {
      gap: 6px;

      .loading-text {
        font-size: 12px;
      }
    }

    &--medium {
      gap: 8px;

      .loading-text {
        font-size: 14px;
      }
    }

    &--large {
      gap: 10px;

      .loading-text {
        font-size: 16px;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-indicator {
    .loading-overlay {
      .loading-content {
        .loading-text {
          font-size: 13px;
        }
      }
    }

    .loading-inline {
      .loading-text {
        font-size: 13px;
      }

      &--small .loading-text {
        font-size: 11px;
      }

      &--large .loading-text {
        font-size: 15px;
      }
    }
  }
}
</style>
