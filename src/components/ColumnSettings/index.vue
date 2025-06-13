/**
 * 列设置组件
 * 功能描述：提供表格列显示/隐藏的设置功能，支持全选/反选、应用和重置操作
 * 创建日期：2024-12-15
 * 更新日期：2024-12-16 - 集成表格配置存储服务，实现集中式配置管理
 * 更新日期：2024-12-16 - 应用现代前端开发范式优化，增强用户体验和代码质量
 */
<template>
  <el-dropdown
    ref="columnDropdown"
    trigger="click"
    :aria-label="`${text}设置菜单`"
    role="button"
    :tabindex="0"
    @command="handleCommand"
  >
    <el-button
      :size="size"
      :type="type"
      :plain="plain"
      :loading="loading"
      :aria-expanded="false"
      aria-haspopup="true"
    >
      <i class="el-icon-s-operation" aria-hidden="true" />
      {{ text }}
      <i class="el-icon-arrow-down el-icon--right" aria-hidden="true" />
    </el-button>

    <el-dropdown-menu slot="dropdown" class="column-dropdown">
      <div class="column-dropdown-header">
        <el-checkbox
          v-model="tempCheckAll"
          :indeterminate="tempIndeterminate"
          :disabled="loading"
          aria-label="全选所有列"
          @change="handleTempCheckAllChange"
        >
          全选
        </el-checkbox>
        <div class="column-dropdown-actions">
          <el-button
            type="text"
            :size="size"
            :loading="loading"
            :disabled="!hasChanges"
            @click="handleApplyClick"
          >
            应用
          </el-button>
          <el-button
            type="text"
            :size="size"
            :loading="loading"
            @click="handleResetClick"
          >
            重置
          </el-button>
        </div>
      </div>

      <el-dropdown-item divided />

      <div
        v-for="col in columnOptions"
        :key="col.prop"
        class="column-item"
      >
        <el-checkbox
          v-model="tempColumnVisibility[col.prop]"
          :disabled="loading"
          :aria-label="`切换${col.label}列显示`"
          @change="handleTempColumnChange"
        >
          {{ col.label }}
        </el-checkbox>
      </div>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
import tableConfigStore from '@/utils/table-config-store'
import { debounce } from '@/utils'

export default {
  name: 'ColumnSettings',
  props: {
    // 列选项 - 加强验证
    columnOptions: {
      type: Array,
      required: true,
      validator(columns) {
        if (!Array.isArray(columns)) {
          console.error('[ColumnSettings] columnOptions must be an array')
          return false
        }
        return columns.every(col => {
          if (!col.prop || typeof col.prop !== 'string') {
            console.error('[ColumnSettings] Each column must have a valid prop string')
            return false
          }
          if (!col.label || typeof col.label !== 'string') {
            console.error('[ColumnSettings] Each column must have a valid label string')
            return false
          }
          return true
        })
      }
    },

    // 存储键 - 加强验证
    storageKey: {
      type: String,
      required: true,
      validator(key) {
        if (!key || typeof key !== 'string') {
          console.error('[ColumnSettings] storageKey must be a non-empty string')
          return false
        }
        return true
      }
    },

    // 默认可见列
    defaultVisibleColumns: {
      type: Array,
      default: () => []
    },

    // 当前可见列
    visibleColumns: {
      type: Array,
      default: () => []
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

    // 按钮文本
    text: {
      type: String,
      default: '列设置'
    }
  },

  data() {
    return {
      // 加载状态
      loading: false,
      // 临时列可见性状态
      tempColumnVisibility: {},
      // 临时全选状态
      tempCheckAll: true,
      // 临时半选状态
      tempIndeterminate: false,
      // 原始列可见性状态 - 用于检测变更
      originalColumnVisibility: {}
    }
  },

  computed: {
    // 当前可见列
    computedVisibleColumns() {
      return this.columnOptions
        .filter(col => this.tempColumnVisibility[col.prop])
        .map(col => col.prop)
    },

    // 检测是否有变更
    hasChanges() {
      return JSON.stringify(this.tempColumnVisibility) !==
             JSON.stringify(this.originalColumnVisibility)
    }
  },

  created() {
    this.initTempColumnVisibility()
    this.initDebouncedMethods()
  },

  beforeDestroy() {
    this.cleanup()
  },

  methods: {
    // 初始化防抖方法
    initDebouncedMethods() {
      this.debouncedApply = debounce(this.applySettings, 300)
      this.debouncedReset = debounce(this.resetSettings, 300)
    },

    // 清理资源
    cleanup() {
      if (this.debouncedApply?.cancel) {
        this.debouncedApply.cancel()
      }
      if (this.debouncedReset?.cancel) {
        this.debouncedReset.cancel()
      }
    },

    // 防抖版本的点击处理
    handleApplyClick() {
      this.debouncedApply()
    },

    handleResetClick() {
      this.debouncedReset()
    },

    // 处理下拉菜单命令
    handleCommand(command) {
      // 可以用于处理特殊命令
    },

    // 初始化临时列可见性状态
    initTempColumnVisibility() {
      try {
        // 从配置存储服务获取可见列
        const visibleColumns = tableConfigStore.getColumnConfig(
          this.storageKey,
          this.visibleColumns && this.visibleColumns.length > 0
            ? [...this.visibleColumns]
            : [...this.defaultVisibleColumns]
        )

        // 初始化临时列可见性状态
        const tempVisibility = {}
        this.columnOptions.forEach(col => {
          tempVisibility[col.prop] = visibleColumns.includes(col.prop)
        })

        this.tempColumnVisibility = tempVisibility
        this.originalColumnVisibility = { ...tempVisibility }
        this.updateTempCheckAllState()
      } catch (error) {
        console.error('[ColumnSettings] Failed to initialize column visibility:', error)
        this.$message.error('初始化列设置失败')
      }
    },

    // 更新临时全选状态
    updateTempCheckAllState() {
      const selectedCount = Object.values(this.tempColumnVisibility).filter(v => v).length
      this.tempCheckAll = selectedCount === this.columnOptions.length
      this.tempIndeterminate = selectedCount > 0 && selectedCount < this.columnOptions.length
    },

    // 临时列变化处理
    handleTempColumnChange() {
      this.updateTempCheckAllState()
    },

    // 临时全选变化处理
    handleTempCheckAllChange(val) {
      Object.keys(this.tempColumnVisibility).forEach(key => {
        this.tempColumnVisibility[key] = val
      })
      this.tempIndeterminate = false
    },

    // 应用列设置 - 添加错误边界保护
    async applySettings() {
      if (this.loading) return

      try {
        this.loading = true

        // 验证数据有效性
        if (this.computedVisibleColumns.length === 0) {
          this.$message.warning('至少需要显示一列')
          return
        }

        // 保存配置
        await tableConfigStore.saveColumnConfig(this.storageKey, this.computedVisibleColumns)

        // 更新原始状态
        this.originalColumnVisibility = { ...this.tempColumnVisibility }

        // 发送列设置变更事件
        this.$emit('change', this.computedVisibleColumns)

        // 提示用户
        this.$message.success('列设置已应用')

        // 关闭下拉菜单
        this.$refs.columnDropdown.hide()
      } catch (error) {
        console.error('[ColumnSettings] Failed to apply settings:', error)
        this.$message.error('保存设置失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 重置列设置 - 添加错误边界保护
    async resetSettings() {
      if (this.loading) return

      try {
        this.loading = true

        // 重置为默认列配置
        const tempVisibility = {}
        this.columnOptions.forEach(col => {
          tempVisibility[col.prop] = this.defaultVisibleColumns.includes(col.prop)
        })

        this.tempColumnVisibility = tempVisibility
        this.originalColumnVisibility = { ...tempVisibility }
        this.updateTempCheckAllState()

        // 清除存储中保存的设置
        await tableConfigStore.removeColumnConfig(this.storageKey)

        // 发送列设置变更事件
        this.$emit('change', [...this.defaultVisibleColumns])

        // 提示用户
        this.$message.success('列设置已重置为默认')

        // 关闭下拉菜单
        this.$refs.columnDropdown.hide()
      } catch (error) {
        console.error('[ColumnSettings] Failed to reset settings:', error)
        this.$message.error('重置设置失败，请稍后重试')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss">
.column-dropdown {
  min-width: 180px;
  max-height: 400px;
  overflow-y: auto;

  .column-dropdown-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 5px;
    background-color: #f5f7fa;

    .column-dropdown-actions {
      .el-button {
        padding: 2px 5px;
        margin-left: 8px;

        // 禁用状态样式
        &.is-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .column-item {
    padding: 8px 16px;
    line-height: 1.5;
    cursor: pointer;

    .el-checkbox {
      width: 100%;
      display: flex;
      align-items: center;
      margin-right: 0;
    }

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .el-dropdown-menu__item.divided {
    margin: 0;
    padding: 0;
    height: 1px;
  }
}
</style>
