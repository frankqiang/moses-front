/**
 * 文件名称：pending-tasks.vue
 * 文件描述：待排程任务管理页面，提供待排程任务查询、筛选及锁定操作
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，实现待排程任务管理P0阶段功能与P1第9项
 *   - 2025-10-20: 从 menus 目录移到顶层，作为独立路由页面
 */

<template>
  <div class="pending-task-management">
    <PendingTaskSearch
      v-model="searchParams"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <PendingTaskTable
      ref="pendingTable"
      :data="tableData"
      :loading="loading"
      :load-error="loadError"
      :pagination="pagination"
      @refresh="loadPendingTasks"
      @retry="loadPendingTasks"
      @pagination-change="handlePaginationChange"
      @lock="handleLockSelected"
      @unlock="handleUnlockSelected"
      @lock-single="handleLockSingle"
      @unlock-single="handleUnlockSingle"
      @view="handleView"
      @selection-change="handleSelectionChange"
    />

    <LockTaskDialog
      :visible.sync="lockDialogVisible"
      :selected-tasks="selectedRows"
      @confirm="handleLockConfirm"
    />
  </div>
</template>

<script>
import PendingTaskSearch from './components/PendingTaskSearch.vue'
import PendingTaskTable from './components/PendingTaskTable.vue'
import LockTaskDialog from './components/LockTaskDialog.vue'
import {
  fetchPendingScheduleTasks,
  lockTasksForSchedule,
  unlockTasksFromSchedule
} from './api'
import {
  PENDING_DEFAULT_PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from './constants'

export default {
  name: 'PendingTaskManagement',
  components: {
    PendingTaskSearch,
    PendingTaskTable,
    LockTaskDialog
  },
  data() {
    return {
      searchParams: {
        ...PENDING_DEFAULT_PAGINATION,
        includeScheduleLocked: false
      },
      tableData: [],
      pagination: {
        limit: 20,
        offset: 0,
        total: 0
      },
      loading: false,
      loadError: null,
      selectedRows: [],
      lockDialogVisible: false
    }
  },
  mounted() {
    this.loadPendingTasks()
  },
  methods: {
    async loadPendingTasks() {
      this.loading = true
      this.loadError = null
      try {
        const params = {
          ...this.searchParams,
          limit: this.pagination.limit,
          offset: this.pagination.offset
        }

        const response = await fetchPendingScheduleTasks(params)

        if (response && response.data) {
          this.tableData = response.data.tasks || []
          this.pagination = {
            limit: params.limit,
            offset: params.offset,
            total: response.data.totalCount || 0
          }
        }
      } catch (error) {
        console.error('获取待排程任务列表失败:', error)
        this.loadError = error.message || ERROR_MESSAGES.FETCH_LIST
        this.tableData = []
        this.pagination.total = 0

        const errorMessage = error.response?.data?.error?.message || ERROR_MESSAGES.FETCH_LIST
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    handleSearch(params) {
      this.searchParams = {
        ...PENDING_DEFAULT_PAGINATION,
        ...this.searchParams,
        ...params
      }
      this.pagination.offset = 0
      this.loadPendingTasks()
    },
    handleReset(params) {
      this.searchParams = {
        ...PENDING_DEFAULT_PAGINATION,
        ...params
      }
      this.pagination = {
        ...PENDING_DEFAULT_PAGINATION,
        total: 0
      }
      this.loadPendingTasks()
    },
    handlePaginationChange({ offset, limit }) {
      this.pagination.offset = offset
      this.pagination.limit = limit
      this.loadPendingTasks()
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    handleLockSelected() {
      if (!this.selectedRows.length) {
        this.$message.warning('请先选择要锁定的任务')
        return
      }
      this.lockDialogVisible = true
    },
    handleUnlockSelected() {
      if (!this.selectedRows.length) {
        this.$message.warning('请先选择要释放的任务')
        return
      }
      this.handleUnlockConfirm(this.selectedRows.map((item) => item.id))
    },
    handleLockSingle(row) {
      if (!row) return
      this.selectedRows = [row]
      this.lockDialogVisible = true
    },
    handleUnlockSingle(row) {
      if (!row) return
      this.handleUnlockConfirm([row.id])
    },
    async handleLockConfirm({ taskIds, lockDurationMinutes, schedulePlanId }) {
      if (!taskIds || !taskIds.length) {
        this.$message.warning('请选择要锁定的任务')
        return
      }

      try {
        this.loading = true
        const response = await lockTasksForSchedule({
          taskIds,
          lockDurationMinutes,
          schedulePlanId
        })

        if (response && response.success) {
          this.$message.success(response.message || SUCCESS_MESSAGES.LOCK)
          this.lockDialogVisible = false
          this.selectedRows = []
          this.loadPendingTasks()
        }
      } catch (error) {
        console.error('锁定任务失败:', error)
        const errorMessage = error.response?.data?.error?.message || ERROR_MESSAGES.LOCK
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    async handleUnlockConfirm(taskIds) {
      if (!taskIds || !taskIds.length) {
        this.$message.warning('请选择要释放的任务')
        return
      }

      try {
        this.loading = true
        const response = await unlockTasksFromSchedule({ taskIds })

        if (response && response.success) {
          this.$message.success(response.message || SUCCESS_MESSAGES.UNLOCK)
          this.selectedRows = []
          this.loadPendingTasks()
        }
      } catch (error) {
        console.error('释放锁定失败:', error)
        const errorMessage = error.response?.data?.error?.message || ERROR_MESSAGES.UNLOCK
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },
    handleView(row) {
      if (row && row.id) {
        this.$router.push(`/production-management/annealing-task/${row.id}`)
      }
    }
  }
}
</script>

<style scoped>
.pending-task-management {
  padding: 16px;
}
</style>

