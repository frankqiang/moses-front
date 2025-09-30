/**
* 操作按钮组组件 - 现代化升级版
* 功能描述：提供统一的表格操作按钮布局，支持自定义按钮和权限控制
* 创建日期：2023-11-20
* 更新日期：2024-11-15
* 更新内容：现代化升级 - 性能优化、容错设计、用户体验提升
*/
<template>
  <div class="action-buttons" role="group" :aria-label="ariaLabel">
    <!-- 文本按钮模式 -->
    <template v-if="mode === 'text'">
      <template v-for="(button, index) in visibleButtons">
        <!-- 下拉菜单按钮 -->
        <el-dropdown
          v-if="button.children && button.children.length"
          :key="`dropdown-${index}`"
          trigger="click"
          :aria-label="`${button.text}菜单`"
          @command="handleChildCommand"
        >
          <error-boundary @error="handleButtonError">
            <el-tooltip
              v-if="button.tooltip && showTooltip"
              :content="button.tooltip"
              :disabled="!button.tooltip || button.disabled"
              placement="top"
            >
              <el-button
                :type="button.type || 'text'"
                :size="button.size || size"
                :icon="button.icon"
                :class="getButtonClass(button)"
                :disabled="button.disabled"
                :loading="getButtonLoading(button)"
                :aria-label="button.ariaLabel || button.text"
                @click="debouncedClick(button)"
              >
                {{ button.showText !== false ? button.text : '' }}
                <i v-if="button.showText !== false" class="el-icon-arrow-down el-icon--right" />
              </el-button>
            </el-tooltip>
            <el-button
              v-else
              :type="button.type || 'text'"
              :size="button.size || size"
              :icon="button.icon"
              :class="getButtonClass(button)"
              :disabled="button.disabled"
              :loading="getButtonLoading(button)"
              :aria-label="button.ariaLabel || button.text"
              @click="debouncedClick(button)"
            >
              {{ button.showText !== false ? button.text : '' }}
              <i v-if="button.showText !== false" class="el-icon-arrow-down el-icon--right" />
            </el-button>
          </error-boundary>

          <el-dropdown-menu slot="dropdown" role="menu">
            <el-dropdown-item
              v-for="(child, childIndex) in button.children"
              :key="`child-${childIndex}`"
              :command="{ action: child.action, row: row, parentAction: button.action }"
              :disabled="child.disabled"
              :divided="child.divided"
              role="menuitem"
              :aria-label="child.ariaLabel || child.text"
            >
              <i v-if="child.icon" :class="child.icon" aria-hidden="true" />
              {{ child.text }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- 普通按钮带tooltip -->
        <error-boundary v-else :key="`button-${index}`" @error="handleButtonError">
          <el-tooltip
            v-if="button.tooltip && showTooltip"
            :content="button.tooltip"
            :disabled="!button.tooltip || button.disabled"
            placement="top"
          >
            <el-button
              :type="button.type || 'text'"
              :size="button.size || size"
              :icon="button.icon"
              :class="getButtonClass(button)"
              :disabled="button.disabled"
              :loading="getButtonLoading(button)"
              :aria-label="button.ariaLabel || button.text"
              @click="debouncedClick(button)"
            >
              {{ button.showText !== false ? button.text : '' }}
            </el-button>
          </el-tooltip>

          <!-- 普通按钮不带tooltip -->
          <el-button
            v-else
            :type="button.type || 'text'"
            :size="button.size || size"
            :icon="button.icon"
            :class="getButtonClass(button)"
            :disabled="button.disabled"
            :loading="getButtonLoading(button)"
            :aria-label="button.ariaLabel || button.text"
            @click="debouncedClick(button)"
          >
            {{ button.showText !== false ? button.text : '' }}
          </el-button>
        </error-boundary>
      </template>

      <!-- 更多按钮下拉菜单 -->
      <el-dropdown v-if="moreButtons.length" aria-label="更多操作菜单" @command="handleCommand">
        <el-button type="text" :size="size" aria-label="更多操作">
          更多<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" role="menu">
          <el-dropdown-item
            v-for="(button, index) in moreButtons"
            :key="`more-${index}`"
            :command="button"
            :disabled="button.disabled"
            :divided="button.divided"
            role="menuitem"
            :aria-label="button.ariaLabel || button.text"
          >
            <i v-if="button.icon" :class="button.icon" aria-hidden="true" />
            {{ button.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>

    <!-- 普通按钮模式 -->
    <template v-else>
      <!-- 普通按钮模式下的下拉菜单 -->
      <el-dropdown
        v-for="(button, index) in visibleDropdownButtons"
        :key="`normal-dropdown-${index}`"
        :aria-label="`${button.text}菜单`"
        @command="handleChildCommand"
      >
        <error-boundary @error="handleButtonError">
          <el-button
            :type="button.type || 'primary'"
            :size="button.size || size"
            :icon="button.icon"
            :class="getButtonClass(button)"
            :disabled="button.disabled"
            :loading="getButtonLoading(button)"
            :aria-label="button.ariaLabel || button.text"
          >
            {{ button.text }}<i class="el-icon-arrow-down el-icon--right" />
          </el-button>
        </error-boundary>

        <el-dropdown-menu slot="dropdown" role="menu">
          <el-dropdown-item
            v-for="(child, childIndex) in button.children"
            :key="`normal-child-${childIndex}`"
            :command="{ action: child.action, row: row, parentAction: button.action }"
            :disabled="child.disabled"
            :divided="child.divided"
            role="menuitem"
            :aria-label="child.ariaLabel || child.text"
          >
            <i v-if="child.icon" :class="child.icon" aria-hidden="true" />
            {{ child.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- 普通按钮 -->
      <error-boundary
        v-for="(button, index) in visibleNormalButtons"
        :key="`normal-${index}`"
        @error="handleButtonError"
      >
        <el-button
          :type="button.type || 'primary'"
          :size="button.size || size"
          :icon="button.icon"
          :class="getButtonClass(button)"
          :disabled="button.disabled"
          :loading="getButtonLoading(button)"
          :aria-label="button.ariaLabel || button.text"
          @click="debouncedClick(button)"
        >
          {{ button.text }}
        </el-button>
      </error-boundary>

      <!-- 更多操作下拉菜单 -->
      <el-dropdown v-if="moreButtons.length" aria-label="更多操作菜单" @command="handleCommand">
        <el-button type="primary" :size="size" aria-label="更多操作">
          更多操作<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown" role="menu">
          <el-dropdown-item
            v-for="(button, index) in moreButtons"
            :key="`normal-more-${index}`"
            :command="button"
            :disabled="button.disabled"
            :divided="button.divided"
            role="menuitem"
            :aria-label="button.ariaLabel || button.text"
          >
            <i v-if="button.icon" :class="button.icon" aria-hidden="true" />
            {{ button.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>

<script>
import { debounce } from '@/utils'

// 错误边界组件
const ErrorBoundary = {
  name: 'ErrorBoundary',
  data() {
    return {
      hasError: false,
      errorInfo: null
    }
  },
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.errorInfo = { message: err.message, info }
    this.$emit('error', this.errorInfo)
    return false
  },
  render(h) {
    if (this.hasError) {
      return h('span', { class: 'error-fallback' }, '操作暂不可用')
    }
    return this.$slots.default
  }
}

export default {
  name: 'ActionButtons',
  components: {
    ErrorBoundary
  },
  props: {
    // 按钮配置数组
    buttons: {
      type: Array,
      default: () => [],
      validator(buttons) {
        return Array.isArray(buttons) && buttons.every(button => {
          if (!button || typeof button !== 'object') {
            console.warn('Button config must be an object')
            return false
          }
          if (!button.text || typeof button.text !== 'string') {
            console.warn('Button must have a text property')
            return false
          }
          if (!button.action || typeof button.action !== 'string') {
            console.warn('Button must have an action property')
            return false
          }
          return true
        })
      }
    },
    // 尺寸：medium / small / mini
    size: {
      type: String,
      default: 'mini',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    },
    // 模式：normal / text
    mode: {
      type: String,
      default: 'normal',
      validator: value => ['normal', 'text'].includes(value)
    },
    // 当前行数据（表格中使用时）
    row: {
      type: Object,
      default: null
    },
    // 最大显示按钮数（超出将显示在更多菜单中）
    maxVisible: {
      type: Number,
      default: 3,
      validator: value => value > 0 && value <= 10
    },
    // 是否显示tooltip
    showTooltip: {
      type: Boolean,
      default: false
    },
    // 防抖延迟时间（毫秒）
    debounceDelay: {
      type: Number,
      default: 300,
      validator: value => value >= 0 && value <= 2000
    },
    // 无障碍标签
    ariaLabel: {
      type: String,
      default: '操作按钮组'
    },
    // 权限检查函数
    permissionChecker: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      loadingStates: new Map(),
      clickTimestamps: new Map()
    }
  },
  computed: {
    // 过滤后的按钮（缓存结果）
    filteredButtons() {
      if (!Array.isArray(this.buttons)) return []

      return this.buttons.filter(button => {
        try {
          // 权限检查
          if (button.permission && !this.checkPermission(button.permission)) {
            return false
          }

          // 条件检查
          if (typeof button.condition === 'function' && this.row) {
            return button.condition(this.row)
          }

          return true
        } catch (error) {
          console.warn('Error filtering button:', error)
          return false
        }
      })
    },
    // 可见按钮
    visibleButtons() {
      return this.filteredButtons.slice(0, this.maxVisible)
    },
    // 更多按钮（放入下拉菜单）
    moreButtons() {
      return this.filteredButtons.slice(this.maxVisible)
    },
    // 普通模式下的下拉菜单按钮
    visibleDropdownButtons() {
      return this.visibleButtons.filter(btn => btn.children && btn.children.length)
    },
    // 普通模式下的普通按钮
    visibleNormalButtons() {
      return this.visibleButtons.filter(btn => !btn.children || !btn.children.length)
    }
  },
  created() {
    // 创建防抖点击函数
    this.debouncedClick = debounce(this.handleClick, this.debounceDelay, {
      leading: false,
      trailing: true
    })
  },
  beforeDestroy() {
    // 清理防抖函数
    if (this.debouncedClick && this.debouncedClick.cancel) {
      this.debouncedClick.cancel()
    }

    // 清理状态
    this.loadingStates.clear()
    this.clickTimestamps.clear()
  },
  methods: {
    // 处理按钮点击
    handleClick(button) {
      try {
        // 防止重复点击
        if (this.isRecentlyClicked(button.action)) {
          console.warn('Button clicked too frequently:', button.action)
          return
        }

        // 记录点击时间戳
        this.recordClick(button.action)

        // 设置加载状态
        if (button.showLoading !== false) {
          this.setButtonLoading(button.action, true)
        }

        // 执行点击处理
        const result = this.executeButtonAction(button)

        // 处理异步结果
        if (result && typeof result.then === 'function') {
          result
            .catch(error => {
              console.error('Button action failed:', error)
              this.$message.error('操作失败: ' + (error.message || '未知错误'))
            })
            .finally(() => {
              this.setButtonLoading(button.action, false)
            })
        } else {
          this.setButtonLoading(button.action, false)
        }
      } catch (error) {
        console.error('Error handling button click:', error)
        this.setButtonLoading(button.action, false)
        this.$message.error('操作异常: ' + error.message)
      }
    },

    // 执行按钮动作
    executeButtonAction(button) {
      const runAction = () => {
        if (typeof button.onClick === 'function') {
          return button.onClick(button.data || this.row)
        }
        this.$emit('click', {
          action: button.action,
          data: button.data || this.row,
          row: this.row
        })
        return Promise.resolve()
      }

      if (button.confirmText) {
        return this.$confirm(button.confirmText, button.confirmTitle || '提示', {
          confirmButtonText: button.confirmConfirmText || '确定',
          cancelButtonText: button.confirmCancelText || '取消',
          type: button.confirmType || 'warning'
        })
          .then(() => runAction())
          .catch(() => {
            this.setButtonLoading(button.action, false)
            if (button.confirmCancelMessage) {
              this.$message.info(button.confirmCancelMessage)
            }
            return Promise.resolve()
          })
      }

      return runAction()
    },

    // 处理下拉菜单命令
    handleCommand(button) {
      this.handleClick(button)
    },

    // 处理子按钮命令
    handleChildCommand(command) {
      try {
        this.$emit('click', {
          action: command.action,
          row: command.row || this.row,
          parentAction: command.parentAction
        })
      } catch (error) {
        console.error('Error handling child command:', error)
        this.$message.error('操作异常: ' + error.message)
      }
    },

    // 检查权限
    checkPermission(permission) {
      try {
        if (this.permissionChecker && typeof this.permissionChecker === 'function') {
          return this.permissionChecker(permission)
        }
        // 默认权限检查逻辑
        return true
      } catch (error) {
        console.warn('Permission check failed:', error)
        return false
      }
    },

    // 获取按钮样式类
    getButtonClass(button) {
      const classes = []

      if (button.class) {
        classes.push(button.class)
      }

      // 添加现代化样式类
      classes.push('modern-button')

      if (button.type === 'danger' || button.class === 'danger') {
        classes.push('danger-button')
      }

      if (button.type === 'success' || button.class === 'success') {
        classes.push('success-button')
      }

      if (button.type === 'warning' || button.class === 'warning') {
        classes.push('warning-button')
      }

      return classes.join(' ')
    },

    // 获取按钮加载状态
    getButtonLoading(button) {
      return this.loadingStates.get(button.action) || false
    },

    // 设置按钮加载状态
    setButtonLoading(action, loading) {
      if (loading) {
        this.loadingStates.set(action, true)
      } else {
        this.loadingStates.delete(action)
      }
      this.$forceUpdate() // 强制更新视图
    },

    // 检查是否最近点击过
    isRecentlyClicked(action) {
      const lastClick = this.clickTimestamps.get(action)
      if (!lastClick) return false

      const now = Date.now()
      return (now - lastClick) < this.debounceDelay
    },

    // 记录点击时间戳
    recordClick(action) {
      this.clickTimestamps.set(action, Date.now())
    },

    // 处理按钮错误
    handleButtonError(errorInfo) {
      console.error('Button error:', errorInfo)
      this.$emit('button-error', errorInfo)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;

  // 响应式适配
  @media (max-width: 768px) {
    gap: 4px;

    .el-button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  .el-button {
    margin: 0;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    // 现代化按钮样式
    &.modern-button {
      border-radius: 6px;
      font-weight: 500;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
      }

      &:active {
        transform: translateY(0);
      }

      &:focus {
        outline: 2px solid #409EFF;
        outline-offset: 2px;
      }
    }

    // 危险按钮样式
    &.danger-button {
      color: #F56C6C;

      &:hover {
        color: #F56C6C;
        background-color: #FEF0F0;
      }
    }

    // 成功按钮样式
    &.success-button {
      color: #67C23A;

      &:hover {
        color: #67C23A;
        background-color: #F0F9FF;
      }
    }

    // 警告按钮样式
    &.warning-button {
      color: #E6A23C;

      &:hover {
        color: #E6A23C;
        background-color: #FDF6EC;
      }
    }

    // 图标间距
    [class*="el-icon-"]+span {
      margin-left: 4px;
    }

    // 禁用状态
    &.is-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    // 加载状态
    &.is-loading {
      pointer-events: none;
    }
  }

  .el-dropdown {
    margin: 0;

    .el-button {
      margin: 0;
    }
  }

  // 错误回退样式
  .error-fallback {
    color: #F56C6C;
    font-size: 12px;
    padding: 4px 8px;
    background: #FEF0F0;
    border-radius: 4px;
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .action-buttons {
    .el-button {
      border: 2px solid currentColor;
    }
  }
}

// 动画偏好支持
@media (prefers-reduced-motion: reduce) {
  .action-buttons .el-button {
    transition: none;

    &:hover {
      transform: none;
    }
  }
}
</style>
