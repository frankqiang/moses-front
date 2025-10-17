<!--
  文件名称：index.vue
  文件描述：维护任务管理列表页面
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现P0阶段核心功能
    - 2024-01-21: 添加逾期任务独立查询页签（P1阶段功能）
    - 2024-01-20: 重构，整合所有重构后的组件
-->
<template>
  <div class="maintenance-task-list">
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" class="maintenance-task-list__tabs" @tab-click="handleTabChange">
      <el-tab-pane label="全部任务" name="all">
        <!-- 搜索表单 -->
        <task-search
          ref="searchForm"
          :query-type="activeTab"
          @search="handleSearch"
          @reset="handleReset"
        />

        <!-- 数据表格 -->
        <task-table
          ref="taskTable"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          @create="handleCreate"
          @view="handleView"
          @assign="handleAssign"
          @cancel="handleCancel"
          @refresh="handleRefresh"
          @pagination-change="handlePaginationChange"
          @sort-change="handleSortChange"
        />
      </el-tab-pane>

      <el-tab-pane name="overdue">
        <span slot="label">
          <i class="el-icon-warning-outline" />
          逾期任务
          <el-badge
            v-if="overdueCount > 0"
            :value="overdueCount"
            :max="99"
            type="danger"
            class="maintenance-task-list__badge"
          />
        </span>

        <!-- 搜索表单 -->
        <task-search
          ref="overdueSearchForm"
          :query-type="activeTab"
          @search="handleSearch"
          @reset="handleReset"
        />

        <!-- 数据表格 -->
        <task-table
          ref="overdueTaskTable"
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          @create="handleCreate"
          @view="handleView"
          @assign="handleAssign"
          @cancel="handleCancel"
          @refresh="handleRefresh"
          @pagination-change="handlePaginationChange"
          @sort-change="handleSortChange"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 派工对话框 -->
    <assign-task-dialog
      :visible.sync="assignDialogVisible"
      :task-info="currentTask"
      @success="handleAssignSuccess"
    />

    <!-- 取消任务对话框 -->
    <cancel-task-dialog
      :visible.sync="cancelDialogVisible"
      :task-info="currentTask"
      @success="handleCancelSuccess"
    />
  </div>
</template>

<script>
import TaskSearch from './components/TaskSearch'
import TaskTable from './components/TaskTable'
import AssignTaskDialog from './components/AssignTaskDialog'
import CancelTaskDialog from './components/CancelTaskDialog'
import { getMaintenanceTasks, getOverdueTasks } from './api'
import { WARNING_MESSAGES } from './constants'

export default {
  name: 'MaintenanceTaskList',

  components: {
    TaskSearch,
    TaskTable,
    AssignTaskDialog,
    CancelTaskDialog
  },

  data() {
    return {
      // 当前标签页
      activeTab: 'all',
      // 逾期任务数量
      overdueCount: 0,
      // 表格数据
      tableData: [],
      // 加载状态
      loading: false,
      // 分页信息
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },
      // 查询参数
      queryParams: {
        page: 1,
        limit: 10,
        sortBy: 'plannedStartTime:asc'
      },
      // 派工对话框
      assignDialogVisible: false,
      // 取消任务对话框
      cancelDialogVisible: false,
      // 当前操作的任务
      currentTask: null
    }
  },

  created() {
    this.init()
  },

  methods: {
    /**
     * 初始化
     */
    async init() {
      await this.fetchData()
      await this.fetchOverdueCount()
    },

    /**
     * 获取数据
     */
    async fetchData() {
      this.loading = true
      try {
        let response

        // 根据当前标签页调用不同的API
        if (this.activeTab === 'overdue') {
          // 查询逾期任务
          // 根据接口文档，逾期任务接口只支持以下参数：
          // - equipmentId、assignedTo、page、limit、sortBy
          const overdueParams = this.filterOverdueParams(this.queryParams)
          response = await getOverdueTasks(overdueParams)
        } else {
          // 查询全部任务
          response = await getMaintenanceTasks(this.queryParams)
        }

        // 处理成功响应
        this.tableData = response.data.results || []
        this.pagination = {
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.totalResults || 0
        }
      } catch (error) {
        console.error('获取维护任务列表失败:', error)
        // 错误信息由 request.js 统一处理
        this.tableData = []
        this.pagination = {
          page: 1,
          limit: 10,
          total: 0
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 过滤逾期任务参数
     * 逾期任务接口只支持：equipmentId、assignedTo、page、limit、sortBy
     */
    filterOverdueParams(params) {
      const allowedKeys = ['equipmentId', 'assignedTo', 'page', 'limit', 'sortBy']
      const filteredParams = {}

      allowedKeys.forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          filteredParams[key] = params[key]
        }
      })

      return filteredParams
    },

    /**
     * 获取逾期任务数量
     */
    async fetchOverdueCount() {
      try {
        const response = await getOverdueTasks({ page: 1, limit: 1 })
        this.overdueCount = response.data.totalResults || 0
      } catch (error) {
        console.error('获取逾期任务数量失败:', error)
        this.overdueCount = 0
      }
    },

    /**
     * 标签页切换
     */
    handleTabChange(tab) {
      // 切换标签页时重置查询参数
      this.queryParams = {
        page: 1,
        limit: 10,
        sortBy: 'plannedStartTime:asc'
      }
      // 重新获取数据
      this.fetchData()

      // 如果切换到全部任务标签页，更新逾期任务数量
      if (tab.name === 'all') {
        this.fetchOverdueCount()
      }
    },

    /**
     * 搜索
     */
    handleSearch(searchParams) {
      this.queryParams = {
        ...this.queryParams,
        ...searchParams,
        page: 1
      }
      this.fetchData()
    },

    /**
     * 重置搜索
     */
    handleReset() {
      this.queryParams = {
        page: 1,
        limit: 10,
        sortBy: 'plannedStartTime:asc'
      }
      this.fetchData()
    },

    /**
     * 刷新
     */
    handleRefresh() {
      this.fetchData()
      this.fetchOverdueCount()
    },

    /**
     * 分页改变
     */
    handlePaginationChange({ page, limit }) {
      this.queryParams.page = page
      this.queryParams.limit = limit
      this.fetchData()
    },

    /**
     * 排序改变
     */
    handleSortChange({ prop, order }) {
      if (order) {
        const direction = order === 'ascending' ? 'asc' : 'desc'
        this.queryParams.sortBy = `${prop}:${direction}`
      } else {
        this.queryParams.sortBy = 'plannedStartTime:asc'
      }
      this.fetchData()
    },

    /**
     * 创建任务
     */
    handleCreate() {
      this.$router.push({
        name: 'MaintenanceTaskCreate',
        params: { mode: 'create' }
      })
    },

    /**
     * 查看详情
     */
    handleView(row) {
      this.$router.push({
        name: 'MaintenanceTaskDetail',
        params: { id: row.id }
      })
    },

    /**
     * 派工
     */
    handleAssign(row) {
      // 检查任务状态
      if (row.status !== '待执行') {
        this.$message.warning(WARNING_MESSAGES.TASK_STATUS_INVALID)
        return
      }
      // 设置当前任务并打开派工对话框
      this.currentTask = row
      this.assignDialogVisible = true
    },

    /**
     * 派工成功回调
     */
    handleAssignSuccess() {
      this.assignDialogVisible = false
      this.currentTask = null
      // 刷新列表
      this.handleRefresh()
    },

    /**
     * 取消任务
     */
    handleCancel(row) {
      // 检查任务状态
      if (!['待执行', '执行中', '已延期'].includes(row.status)) {
        this.$message.warning(`${row.status}状态的任务不能取消`)
        return
      }
      // 设置当前任务并打开取消对话框
      this.currentTask = row
      this.cancelDialogVisible = true
    },

    /**
     * 取消成功回调
     */
    handleCancelSuccess() {
      this.cancelDialogVisible = false
      this.currentTask = null
      // 刷新列表
      this.handleRefresh()
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-task-list {
  padding: 20px;

  &__tabs {
    ::v-deep .el-tabs__header {
      margin-bottom: 20px;
    }

    ::v-deep .el-tabs__item {
      font-size: 14px;
      font-weight: 500;

      .el-icon-warning-outline {
        color: #e6a23c;
        margin-right: 4px;
      }

      &.is-active .el-icon-warning-outline {
        color: #409eff;
      }
    }
  }

  &__badge {
    margin-left: 4px;
    vertical-align: middle;

    ::v-deep .el-badge__content {
      font-size: 12px;
    }
  }
}
</style>
