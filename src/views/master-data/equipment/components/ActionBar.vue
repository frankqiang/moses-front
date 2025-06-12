/**
 * 设备操作按钮组件
 * 功能描述：提供设备管理页面的主要操作按钮，包括新增、批量删除、批量启用/禁用等
 * 创建日期：2023-11-05
 */
<template>
  <div class="action-container">
    <el-button
      type="primary"
      icon="el-icon-plus"
      size="small"
      @click="handleCreate"
    >
      新增{{ getEquipmentTypeLabel() }}
    </el-button>

    <el-button
      type="danger"
      icon="el-icon-delete"
      size="small"
      :disabled="selectedIds.length === 0"
      @click="handleBatchDelete"
    >
      批量删除
    </el-button>

    <el-dropdown
      :disabled="selectedIds.length === 0"
      @command="handleBatchStatus"
    >
      <el-button
        type="info"
        size="small"
        :disabled="selectedIds.length === 0"
      >
        批量操作<i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="enable">批量启用</el-dropdown-item>
        <el-dropdown-item command="disable">批量禁用</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'EquipmentActionBar',
  props: {
    // 选中的记录ID数组
    selectedIds: {
      type: Array,
      default: () => []
    },
    // 设备类型
    equipmentType: {
      type: String,
      required: true
    }
  },
  methods: {
    // 获取当前设备类型的显示名称
    getEquipmentTypeLabel() {
      const typeMap = {
        'FURNACE': '退火炉',
        'CRANE': '行车',
        'AUTO_CART': '自动料车',
        'STAGING_TABLE': '备料台'
      }
      return typeMap[this.equipmentType] || '设备'
    },

    // 新增按钮点击事件
    handleCreate() {
      this.$emit('create')
    },

    // 批量删除按钮点击事件
    handleBatchDelete() {
      if (this.selectedIds.length === 0) {
        return
      }

      this.$emit('batch-delete', this.selectedIds)
    },

    // 批量状态操作
    handleBatchStatus(command) {
      if (this.selectedIds.length === 0) {
        return
      }

      const status = command === 'enable' ? 1 : 0
      this.$emit('batch-status', this.selectedIds, status)
    }
  }
}
</script>

<style lang="scss" scoped>
.action-container {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.el-button,
.el-dropdown {
  margin-right: 10px;
}
</style>
