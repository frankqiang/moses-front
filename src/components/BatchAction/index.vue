/**
 * 批量操作工具栏组件
 * 功能描述：提供表格批量操作功能，以下拉菜单形式展示批量删除、批量启用/禁用等操作
 * 创建日期：2023-12-10
 */
<template>
  <div class="batch-actions-dropdown" v-if="showToolbar">
    <!-- 选中行计数显示 -->
    <span v-if="showSelectedCount" class="selected-count">
      <i class="el-icon-tickets"></i>
      已选择 <span class="count">{{ selectedRows.length }}</span> 项
    </span>
    
    <!-- 批量操作下拉菜单 -->
    <el-dropdown @command="handleBatchCommand" trigger="click">
      <el-button type="primary" size="mini">
        批量操作 <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      
      <el-dropdown-menu slot="dropdown">
        <!-- 批量删除 -->
        <el-dropdown-item v-if="!hideDeleteButton" command="delete" :disabled="deleteDisabled">
          <i :class="deleteIcon"></i> {{ deleteText || '批量删除' }}
        </el-dropdown-item>
        
        <!-- 批量启用/禁用 -->
        <template v-if="!hideStatusButtons">
          <el-dropdown-item command="enable" :disabled="statusDisabled">
            <i :class="enableIcon"></i> {{ enableText || '批量启用' }}
          </el-dropdown-item>
          <el-dropdown-item command="disable" :disabled="statusDisabled">
            <i :class="disableIcon"></i> {{ disableText || '批量禁用' }}
          </el-dropdown-item>
        </template>
        
        <!-- 自定义操作按钮 -->
        <template v-for="(action, index) in customActions">
          <el-dropdown-item 
            v-if="checkActionEnabled(action)"
            :key="index"
            :command="action.action || action.key || action" 
            :disabled="!checkActionEnabled(action) || action.disabled"
            :divided="action.divided"
          >
            <i v-if="action.icon" :class="action.icon"></i> {{ action.label || action.text }}
          </el-dropdown-item>
        </template>
        
        <!-- 自定义下拉菜单项插槽 -->
        <slot></slot>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'BatchAction',
  props: {
    // 选中的行数据
    selectedRows: {
      type: Array,
      default: () => []
    },
    // 最小显示行数
    minSelection: {
      type: Number,
      default: 1
    },
    // 按钮大小
    size: {
      type: String,
      default: 'mini'
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
      default: 'dropdown', // 'dropdown' 或 'buttons'
      validator: (value) => ['dropdown', 'buttons'].includes(value)
    },
    // 自定义操作按钮数组
    customActions: {
      type: Array,
      default: () => []
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
    }
  },
  computed: {
    // 是否显示工具栏
    showToolbar() {
      return this.selectedRows.length >= this.minSelection
    },
    // 删除按钮是否禁用
    deleteDisabled() {
      return this.selectedRows.length === 0
    },
    // 状态按钮是否禁用
    statusDisabled() {
      return this.selectedRows.length === 0
    }
  },
  methods: {
    // 批量操作命令处理
    handleBatchCommand(command) {
      switch (command) {
        case 'delete':
          this.handleBatchDelete()
          break
        case 'enable':
          this.handleBatchEnable()
          break
        case 'disable':
          this.handleBatchDisable()
          break
        default:
          // 处理自定义命令
          this.handleCustomCommand(command)
      }
    },
    
    // 处理批量删除
    handleBatchDelete() {
      if (this.deleteDisabled) return
      
      if (this.deleteConfirm) {
        this.$confirm(this.deleteConfirmText, this.deleteConfirmTitle, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.emitBatchDelete()
        }).catch(() => {
          // 用户取消删除
        })
      } else {
        this.emitBatchDelete()
      }
    },
    
    // 发送批量删除事件
    emitBatchDelete() {
      this.$emit('batch-delete', this.selectedRows)
    },
    
    // 处理批量启用
    handleBatchEnable() {
      if (this.statusDisabled) return
      
      if (this.statusConfirm) {
        this.$confirm('确认批量启用选中项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.emitBatchEnable()
        }).catch(() => {
          // 用户取消操作
        })
      } else {
        this.emitBatchEnable()
      }
    },
    
    // 发送批量启用事件
    emitBatchEnable() {
      this.$emit('batch-enable', this.selectedRows)
      this.$emit('batch-status', this.selectedRows, 1)
    },
    
    // 处理批量禁用
    handleBatchDisable() {
      if (this.statusDisabled) return
      
      if (this.statusConfirm) {
        this.$confirm('确认批量禁用选中项吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.emitBatchDisable()
        }).catch(() => {
          // 用户取消操作
        })
      } else {
        this.emitBatchDisable()
      }
    },
    
    // 发送批量禁用事件
    emitBatchDisable() {
      this.$emit('batch-disable', this.selectedRows)
      this.$emit('batch-status', this.selectedRows, 0)
    },
    
    // 检查自定义操作是否启用
    checkActionEnabled(action) {
      // 如果有条件函数，执行条件判断
      if (typeof action.condition === 'function') {
        return action.condition(this.selectedRows)
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
    handleCustomCommand(command) {
      // 找到对应的自定义操作
      const action = this.customActions.find(item => 
        (item.action || item.key || item) === command
      )
      
      if (action) {
        this.$emit('custom-action', action, this.selectedRows)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-actions-dropdown {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  
  .selected-count {
    margin-right: 8px;
    font-size: 13px;
    color: #606266;
    
    .count {
      font-weight: bold;
      color: #409EFF;
    }
  }
}
</style>
