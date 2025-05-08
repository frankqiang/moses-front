<template>
  <div class="action-bar">
    <el-button
      type="primary"
      icon="el-icon-plus"
      @click="$emit('create')"
    >
      新增库位
    </el-button>
    
    <el-button
      type="danger"
      icon="el-icon-delete"
      :disabled="!hasSelected"
      @click="handleBatchDelete"
    >
      批量删除
    </el-button>
    
    <el-button-group v-if="hasSelected">
      <el-button
        type="warning"
        icon="el-icon-close"
        :disabled="!hasSelected"
        @click="handleBatchDisable"
      >
        批量禁用
      </el-button>
      <el-button
        type="success"
        icon="el-icon-check"
        :disabled="!hasSelected"
        @click="handleBatchEnable"
      >
        批量启用
      </el-button>
    </el-button-group>
    
    <el-dropdown
      split-button
      type="primary"
      @command="handleImportExport"
      style="margin-left: 10px;"
    >
      导入/导出
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="import">导入数据</el-dropdown-item>
        <el-dropdown-item command="export">导出数据</el-dropdown-item>
        <el-dropdown-item command="download-template">下载模板</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    
    <div class="selected-count" v-if="hasSelected">
      <span>已选择 <span class="count">{{ selectedIds.length }}</span> 项</span>
    </div>
  </div>
</template>

<script>
/**
 * 库位管理操作栏
 * 功能描述：提供新增、批量操作和导入导出功能
 * 创建日期：2023-09-01
 */
export default {
  name: 'ActionBar',
  props: {
    // 已选择的行ID数组
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    // 是否有选中行
    hasSelected() {
      return this.selectedIds && this.selectedIds.length > 0
    }
  },
  methods: {
    // 批量删除
    handleBatchDelete() {
      if (!this.hasSelected) return
      
      this.$confirm(`确认删除选中的${this.selectedIds.length}项数据吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('batch-delete', this.selectedIds)
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量禁用
    handleBatchDisable() {
      if (!this.hasSelected) return
      
      this.$confirm(`确认禁用选中的${this.selectedIds.length}项数据吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('batch-status', { ids: this.selectedIds, status: 0 })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量启用
    handleBatchEnable() {
      if (!this.hasSelected) return
      
      this.$confirm(`确认启用选中的${this.selectedIds.length}项数据吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('batch-status', { ids: this.selectedIds, status: 1 })
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

<style lang="scss" scoped>
.action-bar {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  
  .selected-count {
    margin-left: auto;
    color: #606266;
    font-size: 14px;
    
    .count {
      color: #409EFF;
      font-weight: bold;
      font-size: 16px;
    }
  }
}
</style> 