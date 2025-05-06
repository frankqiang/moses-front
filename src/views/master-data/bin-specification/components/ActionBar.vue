<template>
  <div class="action-bar">
    <el-button type="primary" icon="el-icon-plus" @click="$emit('create')">
      新增料框规格
    </el-button>
    
    <el-button 
      type="danger" 
      icon="el-icon-delete" 
      :disabled="selectedIds.length === 0" 
      @click="$emit('batch-delete')"
    >
      批量删除
    </el-button>
    
    <el-button 
      type="warning" 
      icon="el-icon-close" 
      :disabled="selectedIds.length === 0" 
      @click="$emit('batch-status', 0)"
    >
      批量禁用
    </el-button>
    
    <el-button 
      type="success" 
      icon="el-icon-check" 
      :disabled="selectedIds.length === 0" 
      @click="$emit('batch-status', 1)"
    >
      批量启用
    </el-button>
    
    <el-dropdown split-button type="primary" size="medium" @command="handleCommand">
      <i class="el-icon-upload2 el-icon--left" />导入/导出
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="import">
          <i class="el-icon-upload2" />导入数据
        </el-dropdown-item>
        <el-dropdown-item command="export">
          <i class="el-icon-download" />导出数据
        </el-dropdown-item>
        <el-dropdown-item command="template">
          <i class="el-icon-document" />下载导入模板
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'ActionBar',
  props: {
    // 已选择的行ID数组
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 处理下拉菜单命令
    handleCommand(command) {
      this.$emit('import-export', command)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px;

  .el-button {
    margin-right: 0;
  }
}
</style> 