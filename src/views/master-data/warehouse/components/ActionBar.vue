<template>
  <div class="action-container">
    <el-button
      type="primary"
      icon="el-icon-plus"
      size="mini"
      @click="handleCreate"
    >新增</el-button>
    <el-button
      type="danger"
      icon="el-icon-delete"
      size="mini"
      :disabled="selectedIds.length === 0"
      @click="handleBatchDelete"
    >批量删除</el-button>
    <el-dropdown
      @command="handleBatchStatus"
      :disabled="selectedIds.length === 0"
    >
      <el-button
        type="info"
        size="mini"
        :disabled="selectedIds.length === 0"
      >
        批量操作<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="enable">批量启用</el-dropdown-item>
        <el-dropdown-item command="disable">批量禁用</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown
      @command="handleImportExport"
    >
      <el-button
        type="success"
        size="mini"
      >
        导入导出<i class="el-icon-arrow-down el-icon--right"></i>
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
 * 仓库操作按钮组件
 * 功能描述：提供仓库管理页面的主要操作按钮，包括新增、批量删除、批量启用/禁用、导入导出等
 * 创建日期：2023-11-01
 */
export default {
  name: 'WarehouseActionBar',
  props: {
    // 选中的记录ID数组
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 新增按钮点击事件
    handleCreate() {
      this.$emit('create')
    },
    
    // 批量删除按钮点击事件
    handleBatchDelete() {
      if (this.selectedIds.length === 0) {
        return
      }
      
      this.$confirm('确认批量删除选中的仓库记录吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('batch-delete', this.selectedIds)
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量状态操作
    handleBatchStatus(command) {
      if (this.selectedIds.length === 0) {
        return
      }
      
      const status = command === 'enable' ? 1 : 0
      const statusText = status === 1 ? '启用' : '禁用'
      
      this.$confirm(`确认批量${statusText}选中的仓库记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('batch-status', this.selectedIds, status)
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 导入导出操作
    handleImportExport(command) {
      this.$emit('import-export', command)
    }
  }
}
</script>

<style scoped>
.action-container {
  margin-bottom: 15px;
}

.action-container .el-button,
.action-container .el-dropdown {
  margin-right: 10px;
}
</style> 