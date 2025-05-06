<template>
  <div class="action-bar">
    <el-button-group>
      <el-button type="primary" icon="el-icon-plus" size="small" @click="$emit('create')">新增</el-button>
      <el-button type="danger" icon="el-icon-delete" size="small" :disabled="!selectedIds.length" @click="$emit('batch-delete', selectedIds)">批量删除</el-button>
    </el-button-group>

    <el-dropdown v-if="selectedIds.length" @command="handleStatusCommand" class="action-dropdown">
      <el-button type="warning" size="small">
        批量状态变更<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="trial">设为试产</el-dropdown-item>
        <el-dropdown-item command="production">设为量产</el-dropdown-item>
        <el-dropdown-item command="discontinued">设为停产</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dropdown @command="handleImportExport" class="action-dropdown">
      <el-button size="small">
        导入/导出<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="import">导入数据</el-dropdown-item>
        <el-dropdown-item command="export">导出数据</el-dropdown-item>
        <el-dropdown-item command="template">下载模板</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
/**
 * 操作按钮组件
 * 功能描述：提供铝箔产品管理页面的操作按钮
 */
export default {
  name: 'ActionBar',
  props: {
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 处理状态变更命令
    handleStatusCommand(command) {
      this.$emit('batch-status', this.selectedIds, command)
    },
    // 处理导入导出命令
    handleImportExport(command) {
      this.$emit('import-export', command)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-bar {
  margin-bottom: 16px;
  
  .action-dropdown {
    margin-left: 10px;
  }
}
</style> 