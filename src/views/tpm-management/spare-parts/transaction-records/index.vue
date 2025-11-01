<!--
 * 文件名称：index.vue
 * 文件描述：出入库记录查询页面主文件
 * 创建日期：2025-10-25
 * 修改记录：
 *   - 2025-10-25: 初始创建
-->

<template>
  <div class="app-container transaction-records-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">出入库记录查询</h2>
    </div>

    <!-- 搜索表单 -->
    <transaction-search @search="handleSearch" />

    <!-- 数据表格 -->
    <el-card shadow="never">
      <transaction-table
        :table-data="tableData"
        :loading="loading"
        :pagination="pagination"
        @view-detail="handleViewDetail"
        @view-task="handleViewTask"
        @view-failure="handleViewFailure"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @sort-change="handleSortChange"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      title="出入库记录详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions
        v-if="currentRecord"
        :column="2"
        border
        size="medium"
      >
        <el-descriptions-item label="出入库单号" :span="2">
          {{ currentRecord.transactionCode }}
        </el-descriptions-item>
        <el-descriptions-item label="备件编码">
          {{ currentRecord.sparePart.sparePartCode }}
        </el-descriptions-item>
        <el-descriptions-item label="备件名称">
          {{ currentRecord.sparePart.sparePartName }}
        </el-descriptions-item>
        <el-descriptions-item label="出入库类型">
          <el-tag :type="getTransactionTypeTag(currentRecord.transactionType)">
            {{ currentRecord.transactionType }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数量">
          {{ currentRecord.quantity }} {{ currentRecord.sparePart.unit }}
        </el-descriptions-item>
        <el-descriptions-item label="出入库时间" :span="2">
          {{ formatDateTime(currentRecord.transactionTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="经手人">
          {{ currentRecord.operator.name }}
        </el-descriptions-item>
        <el-descriptions-item label="经手人邮箱">
          {{ currentRecord.operator.email }}
        </el-descriptions-item>
        <el-descriptions-item label="关联维护任务" :span="2">
          <el-link
            v-if="currentRecord.maintenanceTask"
            type="primary"
            :underline="false"
            @click="handleViewTask(currentRecord.maintenanceTask)"
          >
            {{ currentRecord.maintenanceTask.taskCode }} - {{ currentRecord.maintenanceTask.taskTitle }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="关联故障单" :span="2">
          <el-link
            v-if="currentRecord.equipmentFailure"
            type="primary"
            :underline="false"
            @click="handleViewFailure(currentRecord.equipmentFailure)"
          >
            {{ currentRecord.equipmentFailure.failureCode }} - {{ currentRecord.equipmentFailure.failureDescription }}
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="用途说明" :span="2">
          {{ currentRecord.purpose || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentRecord.remark || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ formatDateTime(currentRecord.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TransactionSearch from './components/TransactionSearch'
import TransactionTable from './components/TransactionTable'
import { getSparePartTransactions } from '../api/sparePart'
import { DEFAULT_QUERY } from './constants'

export default {
  name: 'TransactionRecords',

  components: {
    TransactionSearch,
    TransactionTable
  },

  data() {
    return {
      // 表格数据
      tableData: [],
      loading: false,

      // 分页信息
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },

      // 查询参数
      queryParams: {
        ...DEFAULT_QUERY
      },

      // 详情对话框
      detailDialogVisible: false,
      currentRecord: null
    }
  },

  created() {
    this.loadTransactionRecords()
  },

  /**
   * 路由离开前钩子 - 清理组件状态
   */
  beforeRouteLeave(to, from, next) {
    // 关闭详情对话框
    this.detailDialogVisible = false

    // 清理当前记录数据
    this.currentRecord = null

    next()
  },

  methods: {
    /**
     * 加载出入库记录列表
     */
    async loadTransactionRecords() {
      try {
        this.loading = true

        const params = {
          ...this.queryParams,
          page: this.pagination.page,
          limit: this.pagination.limit
        }

        const response = await getSparePartTransactions(params)

        if (response.success) {
          this.tableData = response.data.results || []
          this.pagination.total = response.data.totalResults || 0
        } else {
          this.$message.error(response.message || '获取出入库记录失败')
        }
      } catch (error) {
        console.error('加载出入库记录失败:', error)
        this.$message.error('加载出入库记录失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理搜索
     */
    handleSearch(searchParams) {
      this.queryParams = {
        ...DEFAULT_QUERY,
        ...searchParams
      }
      this.pagination.page = 1
      this.loadTransactionRecords()
    },

    /**
     * 处理页码变化
     */
    handlePageChange(page) {
      this.pagination.page = page
      this.loadTransactionRecords()
    },

    /**
     * 处理每页数量变化
     */
    handleSizeChange(size) {
      this.pagination.limit = size
      this.pagination.page = 1
      this.loadTransactionRecords()
    },

    /**
     * 处理排序变化
     */
    handleSortChange({ sortBy, sortOrder }) {
      this.queryParams.sortBy = sortBy
      this.queryParams.sortOrder = sortOrder
      this.pagination.page = 1
      this.loadTransactionRecords()
    },

    /**
     * 查看详情
     */
    handleViewDetail(row) {
      this.currentRecord = row
      this.detailDialogVisible = true
    },

    /**
     * 查看关联任务
     */
    handleViewTask(task) {
      // TODO: 跳转到维护任务详情页面
      this.$message.info(`查看维护任务：${task.taskCode}`)
      // 实际应该跳转到任务详情页面
      // this.$router.push({ path: `/tpm-management/maintenance-tasks/${task.id}` })
    },

    /**
     * 查看关联故障单
     */
    handleViewFailure(failure) {
      // TODO: 跳转到故障单详情页面
      this.$message.info(`查看故障单：${failure.failureCode}`)
      // 实际应该跳转到故障单详情页面
      // this.$router.push({ path: `/tpm-management/equipment-failures/${failure.id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.transaction-records-page {
  .page-header {
    margin-bottom: 16px;

    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #303133;
    }
  }

  ::v-deep .el-card {
    .el-card__body {
      padding: 16px;
    }
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>

