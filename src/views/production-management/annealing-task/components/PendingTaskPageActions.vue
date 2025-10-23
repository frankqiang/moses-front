/**
 * 文件名称：PendingTaskPageActions.vue
 * 文件描述：待排程任务页面操作区域，提供锁定与释放操作
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，实现锁定与释放操作交互
 */

<template>
  <div class="pending-task-actions">
    <el-dropdown @command="handleCommand">
      <el-button type="primary">
        批量操作
        <i class="el-icon-arrow-down el-icon--right" />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="lock">
          <i class="el-icon-lock" /> 锁定任务
        </el-dropdown-item>
        <el-dropdown-item command="unlock">
          <i class="el-icon-unlock" /> 释放锁定
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: 'PendingTaskPageActions',
  methods: {
    handleCommand(command) {
      this.$emit(command)
    }
  }
}
</script>

<style scoped>
.pending-task-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>

