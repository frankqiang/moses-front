/**
 * 列设置组件
 * 功能描述：提供表格列显示/隐藏的设置功能，支持全选/反选、应用和重置操作
 * 创建日期：2024-12-15
 * 更新日期：2024-12-16 - 集成表格配置存储服务，实现集中式配置管理
 */
<template>
  <el-dropdown
    ref="columnDropdown"
    trigger="click"
    @command="handleCommand"
  >
    <el-button :size="size" :type="type" :plain="plain">
      <i class="el-icon-s-operation" />
      {{ text }}
      <i class="el-icon-arrow-down el-icon--right" />
    </el-button>

    <el-dropdown-menu slot="dropdown" class="column-dropdown">
      <div class="column-dropdown-header">
        <el-checkbox
          v-model="tempCheckAll"
          :indeterminate="tempIndeterminate"
          @change="handleTempCheckAllChange"
        >
          全选
        </el-checkbox>
        <div class="column-dropdown-actions">
          <el-button type="text" :size="size" @click="applySettings">应用</el-button>
          <el-button type="text" :size="size" @click="resetSettings">重置</el-button>
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

export default {
  name: 'ColumnSettings',
  props: {
    // 列选项
    columnOptions: {
      type: Array,
      required: true
    },
    // 存储键
    storageKey: {
      type: String,
      required: true
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
      // 临时列可见性状态
      tempColumnVisibility: {},
      // 临时全选状态
      tempCheckAll: true,
      // 临时半选状态
      tempIndeterminate: false
    }
  },
  computed: {
    // 当前可见列
    computedVisibleColumns() {
      return this.columnOptions
        .filter(col => this.tempColumnVisibility[col.prop])
        .map(col => col.prop)
    }
  },
  created() {
    this.initTempColumnVisibility()
  },
  methods: {
    // 处理下拉菜单命令
    handleCommand(command) {
      // 可以用于处理特殊命令
    },

    // 初始化临时列可见性状态
    initTempColumnVisibility() {
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
      this.updateTempCheckAllState()
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

    // 应用列设置
    applySettings() {
      // 通过配置存储服务保存设置
      tableConfigStore.saveColumnConfig(this.storageKey, this.computedVisibleColumns)

      // 发送列设置变更事件
      this.$emit('change', this.computedVisibleColumns)

      // 提示用户
      this.$message.success('列设置已应用')

      // 关闭下拉菜单
      this.$refs.columnDropdown.hide()
    },

    // 重置列设置
    resetSettings() {
      // 重置为默认列配置
      const tempVisibility = {}
      this.columnOptions.forEach(col => {
        tempVisibility[col.prop] = this.defaultVisibleColumns.includes(col.prop)
      })

      this.tempColumnVisibility = tempVisibility
      this.updateTempCheckAllState()

      // 清除存储中保存的设置
      tableConfigStore.removeColumnConfig(this.storageKey)

      // 发送列设置变更事件
      this.$emit('change', [...this.defaultVisibleColumns])

      // 提示用户
      this.$message.success('列设置已重置为默认')

      // 关闭下拉菜单
      this.$refs.columnDropdown.hide()
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
      background-color: transparent;
    }
  }

  .el-dropdown-menu__item.divided {
    margin: 0;
    padding: 0;
    height: 1px;
  }
}
</style>
