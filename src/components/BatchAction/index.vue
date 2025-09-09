/**
 * 批量操作工具栏组件
 * 功能描述：提供表格批量操作功能，以下拉菜单形式展示批量删除、批量启用/禁用等操作
 * 创建日期：2023-12-10
 * 现代化改进：2024-01-10
 */
<template>
  <div
    v-if="showToolbar"
    class="batch-actions-container"
    :class="{
      'mobile-layout': isMobile,
      'loading': isLoading,
      'has-error': hasError
    }"
  >
    <!-- 错误提示 -->
    <div v-if="hasError" class="error-banner">
      <i class="el-icon-warning" />
      <span>{{ errorMessage }}</span>
      <el-button size="mini" type="text" @click="resetError">重试</el-button>
    </div>

    <!-- 选中行计数显示 -->
    <transition name="fade-slide">
      <div v-if="showSelectedCount && !hasError" class="selection-summary">

        <span class="selection-text">
          已选择 <strong class="count">{{ formatSelectedCount }}</strong> 项
        </span>
      </div>
    </transition>

    <!-- 按钮组模式 -->
    <div v-if="statusButtonsMode === 'buttons'" class="batch-buttons-group">
      <!-- 批量删除按钮 -->
      <el-button
        v-if="!hideDeleteButton"
        :size="size"
        type="danger"
        :disabled="deleteDisabled"
        :loading="isLoading"
        @click="handleBatchCommandSafe('delete')"
      >
        <i :class="deleteIcon" />
        {{ deleteText || '批量删除' }}
        <span v-if="selectedRows.length > 0">({{ selectedRows.length }})</span>
      </el-button>

      <!-- 批量启用按钮 -->
      <el-button
        v-if="!hideStatusButtons && shouldShowEnableButton"
        :size="size"
        type="success"
        :disabled="statusDisabled"
        :loading="isLoading"
        @click="handleBatchCommandSafe('enable')"
      >
        <i :class="enableIcon" />
        {{ enableText || '批量启用' }}
        <span v-if="selectedRows.length > 0">({{ selectedRows.length }})</span>
      </el-button>

      <!-- 批量禁用按钮 -->
      <el-button
        v-if="!hideStatusButtons && shouldShowDisableButton"
        :size="size"
        type="warning"
        :disabled="statusDisabled"
        :loading="isLoading"
        @click="handleBatchCommandSafe('disable')"
      >
        <i :class="disableIcon" />
        {{ disableText || '批量禁用' }}
        <span v-if="selectedRows.length > 0">({{ selectedRows.length }})</span>
      </el-button>

      <!-- 自定义操作按钮 -->
      <el-button
        v-for="(action, index) in validCustomActions"
        :key="action.key || action.action || index"
        :size="size"
        :type="action.type || 'default'"
        :disabled="!checkActionEnabled(action) || action.disabled || isLoading"
        :loading="isLoading"
        @click="handleBatchCommandSafe(action.action || action.key || action)"
      >
        <i v-if="action.icon" :class="action.icon" />
        {{ action.label || action.text }}
        <span v-if="action.showCount && selectedRows.length > 0">({{ selectedRows.length }})</span>
      </el-button>
    </div>

    <!-- 下拉菜单模式 -->
    <el-dropdown
      v-else
      trigger="click"
      placement="bottom-start"
      :disabled="isLoading || hasError"
      class="batch-dropdown"
      @command="handleBatchCommandSafe"
    >
      <el-button
        type="primary"
        :size="size"
        :loading="isLoading"
        class="batch-action-button"
        :class="{ 'pulse': hasNewSelection }"
      >
        批量操作
        <i class="el-icon-arrow-down el-icon--right dropdown-icon" />
      </el-button>

      <el-dropdown-menu slot="dropdown" class="batch-dropdown-menu">
        <!-- 批量删除 -->
        <el-dropdown-item
          v-if="!hideDeleteButton"
          command="delete"
          :disabled="deleteDisabled"
          class="dropdown-item danger-item"
        >
          <i :class="deleteIcon" class="item-icon" />
          <span>{{ deleteText || '批量删除' }}</span>
          <span v-if="selectedRows.length > 0" class="item-count">({{ selectedRows.length }})</span>
        </el-dropdown-item>

        <!-- 批量启用/禁用 -->
        <template v-if="!hideStatusButtons">
          <el-dropdown-item
            v-if="shouldShowEnableButton"
            command="enable"
            :disabled="statusDisabled"
            class="dropdown-item success-item"
          >
            <i :class="enableIcon" class="item-icon" />
            <span>{{ enableText || '批量启用' }}</span>
            <span v-if="selectedRows.length > 0" class="item-count">({{ selectedRows.length }})</span>
          </el-dropdown-item>
          <el-dropdown-item
            v-if="shouldShowDisableButton"
            command="disable"
            :disabled="statusDisabled"
            class="dropdown-item warning-item"
          >
            <i :class="disableIcon" class="item-icon" />
            <span>{{ disableText || '批量禁用' }}</span>
            <span v-if="selectedRows.length > 0" class="item-count">({{ selectedRows.length }})</span>
          </el-dropdown-item>
        </template>

        <!-- 自定义操作按钮 -->
        <template v-for="(action, index) in validCustomActions">
          <el-dropdown-item
            :key="action.key || action.action || index"
            :command="action.action || action.key || action"
            :disabled="!checkActionEnabled(action) || action.disabled || isLoading"
            :divided="action.divided"
            class="dropdown-item custom-item"
            :class="action.type ? `${action.type}-item` : ''"
          >
            <i v-if="action.icon" :class="action.icon" class="item-icon" />
            <span>{{ action.label || action.text }}</span>
            <span v-if="action.showCount && selectedRows.length > 0" class="item-count">
              ({{ selectedRows.length }})
            </span>
          </el-dropdown-item>
        </template>

        <!-- 自定义下拉菜单项插槽 -->
        <slot />
      </el-dropdown-menu>
    </el-dropdown>

    <!-- 加载遮罩 -->
    <div v-if="isLoading" class="loading-overlay">
      <i class="el-icon-loading" />
      <span>{{ loadingText }}</span>
    </div>
  </div>
</template>

<script>
import { debounce, throttle } from '@/utils'

export default {
  name: 'BatchAction',
  props: {
    // 选中的行数据
    selectedRows: {
      type: Array,
      default: () => [],
      validator(value) {
        if (!Array.isArray(value)) {
          console.error('BatchAction: selectedRows must be an array')
          return false
        }
        return true
      }
    },
    // 最小显示行数
    minSelection: {
      type: Number,
      default: 1,
      validator(value) {
        return value >= 0
      }
    },
    // 按钮大小
    size: {
      type: String,
      default: 'mini',
      validator(value) {
        return ['large', 'medium', 'small', 'mini'].includes(value)
      }
    },
    // 是否显示选中行计数
    showSelectedCount: {
      type: Boolean,
      default: true
    },
    // 是否显示默认操作按钮（删除和状态变更）
    showDefaultActions: {
      type: Boolean,
      default: true
    },
    // 隐藏删除按钮
    hideDeleteButton: {
      type: Boolean,
      default: false
    },
    // 隐藏状态按钮
    hideStatusButtons: {
      type: Boolean,
      default: false
    },
    // 删除按钮文本
    deleteText: {
      type: String,
      default: ''
    },
    // 删除按钮图标
    deleteIcon: {
      type: String,
      default: 'el-icon-delete'
    },
    // 状态操作文本
    statusText: {
      type: String,
      default: ''
    },
    // 启用按钮文本
    enableText: {
      type: String,
      default: ''
    },
    // 启用按钮图标
    enableIcon: {
      type: String,
      default: 'el-icon-check'
    },
    // 禁用按钮文本
    disableText: {
      type: String,
      default: ''
    },
    // 禁用按钮图标
    disableIcon: {
      type: String,
      default: 'el-icon-close'
    },
    // 状态按钮模式：'dropdown'(下拉菜单) 或 'buttons'(按钮组)
    statusButtonsMode: {
      type: String,
      default: 'dropdown',
      validator: (value) => ['dropdown', 'buttons'].includes(value)
    },
    // 自定义操作按钮数组
    customActions: {
      type: Array,
      default: () => [],
      validator(actions) {
        if (!Array.isArray(actions)) return false
        return actions.every(action => {
          if (typeof action === 'string') return true
          if (typeof action === 'object' && (action.label || action.text)) return true
          console.warn('BatchAction: Invalid custom action', action)
          return false
        })
      }
    },
    // 删除操作前确认
    deleteConfirm: {
      type: Boolean,
      default: true
    },
    // 删除确认提示文本
    deleteConfirmText: {
      type: String,
      default: '确认批量删除选中项吗？此操作不可恢复'
    },
    // 删除确认提示标题
    deleteConfirmTitle: {
      type: String,
      default: '警告'
    },
    // 状态变更确认
    statusConfirm: {
      type: Boolean,
      default: true
    },
    // 防抖延迟时间
    debounceDelay: {
      type: Number,
      default: 300
    },
    // 是否启用虚拟化（大数据量优化）
    enableVirtualization: {
      type: Boolean,
      default: false
    },
    // 虚拟化阈值
    virtualizationThreshold: {
      type: Number,
      default: 1000
    },
    // 状态字段名称
    statusField: {
      type: String,
      default: 'status'
    },
    // 启用状态的值
    enabledValue: {
      type: [String, Number, Boolean],
      default: 'Enabled'
    },
    // 禁用状态的值
    disabledValue: {
      type: [String, Number, Boolean],
      default: 'Disabled'
    },
    // 是否启用智能状态按钮判断
    smartStatusButtons: {
      type: Boolean,
      default: false
    },

  },
  data() {
    return {
      isLoading: false,
      hasError: false,
      errorMessage: '',
      loadingText: '处理中...',
      lastSelectionCount: 0,
      hasNewSelection: false,
      isMobile: false,
      resizeObserver: null
    }
  },
  computed: {
    // 是否显示工具栏
    showToolbar() {
      return this.selectedRows.length >= this.minSelection
    },
    // 删除按钮是否禁用
    deleteDisabled() {
      return this.selectedRows.length === 0 || this.isLoading
    },
    // 状态按钮是否禁用
    statusDisabled() {
      return this.selectedRows.length === 0 || this.isLoading
    },
    // 是否应该显示启用按钮
    shouldShowEnableButton() {
      if (!this.smartStatusButtons) return true // 如果没有启用智能判断，则始终显示

      // 检查选中的项目中是否有需要启用的（即当前状态不是启用状态）
      return this.selectedRows.some(row => row[this.statusField] !== this.enabledValue)
    },
    // 是否应该显示禁用按钮
    shouldShowDisableButton() {
      if (!this.smartStatusButtons) return true // 如果没有启用智能判断，则始终显示

      // 检查选中的项目中是否有需要禁用的（即当前状态不是禁用状态）
      return this.selectedRows.some(row => row[this.statusField] !== this.disabledValue)
    },
    // 格式化选中数量显示
    formatSelectedCount() {
      const count = this.selectedRows.length
      if (this.enableVirtualization && count > this.virtualizationThreshold) {
        return `${(count / 1000).toFixed(1)}k`
      }
      return count.toLocaleString()
    },
    // 有效的自定义操作
    validCustomActions() {
      return this.customActions.filter(action => {
        if (typeof action === 'string') return true
        return this.checkActionEnabled(action)
      })
    },
    // 虚拟化的选中行数据
    optimizedSelectedRows() {
      if (this.enableVirtualization && this.selectedRows.length > this.virtualizationThreshold) {
        return {
          length: this.selectedRows.length,
          isVirtualized: true,
          getIds: () => this.selectedRows.map(row => row.id || row._id),
          getSample: (limit = 10) => this.selectedRows.slice(0, limit)
        }
      }
      return this.selectedRows
    },

  },
  watch: {
    selectedRows: {
      handler(newVal, oldVal) {
        // 检测选中项变化，添加视觉反馈
        if (newVal.length !== this.lastSelectionCount) {
          this.hasNewSelection = true
          setTimeout(() => {
            this.hasNewSelection = false
          }, 1000)
          this.lastSelectionCount = newVal.length
        }
      },
      immediate: true
    }
  },
  created() {
    // 创建防抖函数
    this.debouncedBatchCommand = debounce(this.handleBatchCommand, this.debounceDelay)
    this.throttledResize = throttle(this.handleResize, 100)

    // 检测移动端
    this.checkMobileDevice()
  },
  mounted() {
    // 确保DOM渲染完成后再设置响应式监听
    this.$nextTick(() => {
      this.setupResponsiveListener()
    })
  },
  beforeDestroy() {
    // 清理资源
    this.cleanup()
  },
  // 错误边界捕获
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.errorMessage = '批量操作组件出现错误，请稍后重试'
    this.isLoading = false

    console.error('BatchAction组件错误:', {
      error: err,
      component: vm?.$options.name,
      errorInfo: info,
      selectedRowsCount: this.selectedRows?.length || 0,
      timestamp: new Date().toISOString()
    })

    // 错误上报（如果有监控系统）
    if (window.errorReporter) {
      window.errorReporter.captureException(err, {
        component: 'BatchAction',
        context: { selectedRowsCount: this.selectedRows?.length || 0 }
      })
    }

    return false // 阻止错误传播
  },
  methods: {
    // 安全的批量操作命令处理（带防抖）
    handleBatchCommandSafe(command) {
      if (this.isLoading || this.hasError) return
      this.debouncedBatchCommand(command)
    },

    // 批量操作命令处理
    async handleBatchCommand(command) {
      try {
        this.hasError = false

        switch (command) {
          case 'delete':
            await this.handleBatchDelete()
            break
          case 'enable':
            await this.handleBatchEnable()
            break
          case 'disable':
            await this.handleBatchDisable()
            break
          default:
            // 处理自定义命令
            await this.handleCustomCommand(command)
        }
      } catch (error) {
        this.handleOperationError(error, command)
      }
    },

    // 处理批量删除
    async handleBatchDelete() {
      if (this.deleteDisabled) return

      try {
        if (this.deleteConfirm) {
          await this.$confirm(this.deleteConfirmText, this.deleteConfirmTitle, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            closeOnClickModal: false,
            showClose: false
          })
        }

        this.setLoading(true, '删除中...')
        await this.emitBatchDelete()
        // 成功消息由父组件处理，不在这里显示
      } catch (error) {
        if (error === 'cancel') {
          this.$emit('delete-cancel')
        } else {
          throw error
        }
      } finally {
        this.setLoading(false)
      }
    },

    // 发送批量删除事件
    async emitBatchDelete() {
      const data = this.enableVirtualization && this.selectedRows.length > this.virtualizationThreshold
        ? this.optimizedSelectedRows.getIds()
        : this.selectedRows

      this.$emit('batch-delete', data)
    },

    // 处理批量启用
    async handleBatchEnable() {
      if (this.statusDisabled) return

      try {
        if (this.statusConfirm) {
          await this.$confirm(`确认批量启用选中的 ${this.selectedRows.length} 项吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          })
        }

        this.setLoading(true, '启用中...')
        await this.emitBatchEnable()
        // 成功消息由父组件处理，不在这里显示
      } catch (error) {
        if (error === 'cancel') {
          this.$emit('status-cancel', { command: 'enable', status: 1 })
        } else {
          throw error
        }
      } finally {
        this.setLoading(false)
      }
    },

    // 发送批量启用事件
    async emitBatchEnable() {
      this.$emit('batch-enable', this.optimizedSelectedRows)
      this.$emit('batch-status', this.optimizedSelectedRows, 1)
    },

    // 处理批量禁用
    async handleBatchDisable() {
      if (this.statusDisabled) return

      try {
        if (this.statusConfirm) {
          await this.$confirm(`确认批量禁用选中的 ${this.selectedRows.length} 项吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          })
        }

        this.setLoading(true, '禁用中...')
        await this.emitBatchDisable()
        // 成功消息由父组件处理，不在这里显示
      } catch (error) {
        if (error === 'cancel') {
          this.$emit('status-cancel', { command: 'disable', status: 0 })
        } else {
          throw error
        }
      } finally {
        this.setLoading(false)
      }
    },

    // 发送批量禁用事件
    async emitBatchDisable() {
      this.$emit('batch-disable', this.optimizedSelectedRows)
      this.$emit('batch-status', this.optimizedSelectedRows, 0)
    },

    // 检查自定义操作是否启用
    checkActionEnabled(action) {
      if (typeof action === 'string') return true

      // 如果有条件函数，执行条件判断
      if (typeof action.condition === 'function') {
        try {
          return action.condition(this.selectedRows)
        } catch (error) {
          console.warn('BatchAction: 条件函数执行失败', error)
          return false
        }
      }

      // 如果有minSelection属性，检查选中行是否达到最小数量
      if (action.minSelection !== undefined) {
        return this.selectedRows.length >= action.minSelection
      }

      // 如果有maxSelection属性，检查选中行是否未超过最大数量
      if (action.maxSelection !== undefined) {
        return this.selectedRows.length <= action.maxSelection
      }

      // 默认启用
      return true
    },

    // 处理自定义命令
    async handleCustomCommand(command) {
      let action = null // 在方法开始时声明action变量

      try {
        // 找到对应的自定义操作
        action = this.customActions.find(item =>
          (item.action || item.key || item) === command
        )

        if (!action) {
          console.warn('BatchAction: 未找到自定义操作', command)
          return
        }

        // 确认操作
        if (action.needConfirm) {
          const confirmText = action.confirmText || `确认执行${action.label || action.text}操作吗？`
          const confirmTitle = action.confirmTitle || '提示'
          const confirmType = action.confirmType || 'info'

          await this.$confirm(confirmText, confirmTitle, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: confirmType
          })
        }

        this.setLoading(true, `${action.label || action.text}中...`)

        this.$emit('custom-action', action, this.optimizedSelectedRows)

        // 如果有成功提示
        if (action.successMessage !== false) {
          const message = action.successMessage || `${action.label || action.text}操作成功`
          this.$message.success(message)
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$emit('custom-action-cancel', action)
        } else {
          throw error
        }
      } finally {
        this.setLoading(false)
      }
    },

    // 设置加载状态
    setLoading(loading, text = '处理中...') {
      this.isLoading = loading
      this.loadingText = text
    },

    // 处理操作错误
    handleOperationError(error, operation) {
      this.hasError = true
      this.isLoading = false

      let errorMessage = '操作失败'
      if (typeof error === 'string') {
        errorMessage = error
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      this.errorMessage = errorMessage
      this.$message.error(`${operation}操作失败: ${errorMessage}`)

      console.error('BatchAction操作错误:', {
        operation,
        error,
        selectedRowsCount: this.selectedRows.length
      })
    },

    // 重置错误状态
    resetError() {
      this.hasError = false
      this.errorMessage = ''
    },

    // 检查移动设备
    checkMobileDevice() {
      this.isMobile = window.innerWidth <= 768
    },

    // 处理窗口大小变化
    handleResize() {
      this.checkMobileDevice()
    },

    // 设置响应式监听器
    setupResponsiveListener() {
      window.addEventListener('resize', this.throttledResize)

      // 使用ResizeObserver监听容器大小变化
      if (window.ResizeObserver && this.$el && this.$el instanceof Element) {
        try {
          this.resizeObserver = new ResizeObserver(() => {
            this.checkMobileDevice()
          })
          this.resizeObserver.observe(this.$el)
        } catch (error) {
          console.warn('BatchAction: 设置ResizeObserver失败', error)
          // 如果ResizeObserver失败，降级为仅使用window resize事件
        }
      }
    },



    // 清理资源
    cleanup() {
      // 清理事件监听器
      window.removeEventListener('resize', this.throttledResize)

      // 清理ResizeObserver
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }

      // 取消防抖函数
      if (this.debouncedBatchCommand?.cancel) {
        this.debouncedBatchCommand.cancel()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-actions-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  transition: all 0.3s ease;

  // 响应式设计
  @media (max-width: 768px) {
    &.mobile-layout {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      margin-bottom: 12px;

      .selection-summary {
        margin-bottom: 8px;
        justify-content: center;
      }

      .batch-dropdown {
        width: 100%;

        .batch-action-button {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }

  // 加载状态
  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }

  // 错误状态
  &.has-error {
    .selection-summary,
    .batch-dropdown {
      opacity: 0.5;
    }
  }

  // 错误横幅
  .error-banner {
    position: absolute;
    top: -40px;
    left: 0;
    right: 0;
    background: #fef0f0;
    border: 1px solid #fbc4c4;
    border-radius: 4px;
    padding: 8px 12px;
    color: #f56c6c;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10;

    .el-icon-warning {
      flex-shrink: 0;
    }

    .el-button {
      margin-left: auto;
      color: #f56c6c;

      &:hover {
        color: #f78989;
      }
    }
  }

  // 选中项摘要
  .selection-summary {
    display: flex;
    align-items: center;
    margin-right: 12px;
    padding: 6px 12px;
    background: linear-gradient(135deg, #e8f4fd 0%, #f0f9ff 100%);
    border: 1px solid #d1ecf1;
    border-radius: 6px;
    font-size: 13px;
    color: #2c3e50;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover {
      background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
      border-color: #93c5fd;
      color: #1e40af;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }



    .selection-text {
      .count {
        font-weight: bold;
        color: #409eff;
        font-size: 14px;
      }
    }
  }

  // 按钮组模式
  .batch-buttons-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .el-button {
      border-radius: 4px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      font-weight: 500;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

        &::before {
          left: 100%;
        }
      }

      &:active {
        transform: translateY(0);
      }

      // 不同类型按钮的样式
      &.el-button--danger {
        background: linear-gradient(135deg, #f56c6c 0%, #ff8a8a 100%);
        border: none;
        box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);

        &:hover {
          box-shadow: 0 4px 16px rgba(245, 108, 108, 0.3);
        }
      }

      &.el-button--success {
        background: linear-gradient(135deg, #67c23a 0%, #85d45f 100%);
        border: none;
        box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);

        &:hover {
          box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
        }
      }

      &.el-button--warning {
        background: linear-gradient(135deg, #e6a23c 0%, #f0c05a 100%);
        border: none;
        box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2);

        &:hover {
          box-shadow: 0 4px 16px rgba(230, 162, 60, 0.3);
        }
      }

      // 禁用状态
      &.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          transform: none;
          box-shadow: none;
        }
      }

      // 响应式设计
      @media (max-width: 768px) {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  }

  // 批量操作下拉菜单
  .batch-dropdown {
    .batch-action-button {
      position: relative;
      transition: all 0.3s ease;
      border-radius: 4px;
      font-weight: 500;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
      }

      &:active {
        transform: translateY(0);
      }

      // 新选择动画
      &.pulse {
        animation: pulse-primary 0.6s ease-in-out;
      }

      .dropdown-icon {
        margin-left: 4px;
        transition: transform 0.3s ease;
      }

      &:hover .dropdown-icon {
        transform: rotate(180deg);
      }
    }
  }

  // 下拉菜单样式
  .batch-dropdown-menu {
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border: 1px solid #e4e7ed;
    padding: 4px 0;

    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background: #f5f7fa;
        transform: translateX(2px);
      }

      .item-icon {
        width: 16px;
        margin-right: 8px;
        text-align: center;
      }

      .item-count {
        margin-left: auto;
        font-size: 12px;
        color: #909399;
        background: #f0f2f5;
        padding: 2px 6px;
        border-radius: 10px;
      }

      // 不同类型的样式
      &.danger-item:hover {
        background: #fef0f0;
        color: #f56c6c;

        .item-count {
          background: #fbc4c4;
          color: #f56c6c;
        }
      }

      &.success-item:hover {
        background: #f0f9ff;
        color: #67c23a;

        .item-count {
          background: #c2f5c2;
          color: #67c23a;
        }
      }

      &.warning-item:hover {
        background: #fdf6ec;
        color: #e6a23c;

        .item-count {
          background: #f5dab1;
          color: #e6a23c;
        }
      }

      &.custom-item {
        &.primary-item:hover {
          background: #ecf5ff;
          color: #409eff;
        }

        &.info-item:hover {
          background: #f4f4f5;
          color: #909399;
        }
      }

      // 禁用状态
      &.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;

        &:hover {
          background: transparent;
          transform: none;
        }
      }
    }
  }

  // 加载遮罩
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    gap: 6px;
    backdrop-filter: blur(2px);

    .el-icon-loading {
      animation: rotating 2s linear infinite;
    }
  }
}

// 动画定义
@keyframes pulse-primary {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(64, 158, 255, 0);
  }
}

@keyframes rotating {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 过渡动画
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

// 高对比度支持
@media (prefers-contrast: high) {
  .batch-actions-container {
    .batch-action-button {
      border: 2px solid #409eff;
    }

    .dropdown-item {
      border-bottom: 1px solid #e4e7ed;
    }
  }
}

// 减少动画（用户偏好）
@media (prefers-reduced-motion: reduce) {
  .batch-actions-container *,
  .batch-actions-container *::before,
  .batch-actions-container *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
