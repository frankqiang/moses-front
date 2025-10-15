/**
 * 文件名称：progress-report.vue
 * 文件描述：生产计划进度报表页面
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <div class="progress-report">
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" size="small">
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="option in planStatusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级">
          <el-select
            v-model="filterForm.priority"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in planPriorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="产品编码">
          <el-input
            v-model="filterForm.productCode"
            placeholder="请输入产品编码"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="计划交期">
          <el-date-picker
            v-model="filterForm.deliveryDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">
            重置
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="handleRefresh">
            刷新
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报表统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #e3f2fd;">
              <i class="el-icon-tickets" style="color: #2196f3;" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalCount }}</div>
              <div class="stat-label">计划总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #e8f5e9;">
              <i class="el-icon-circle-check" style="color: #4caf50;" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ onScheduleCount }}</div>
              <div class="stat-label">按期计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #fff3e0;">
              <i class="el-icon-warning" style="color: #ff9800;" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ riskCount }}</div>
              <div class="stat-label">预警计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #ffebee;">
              <i class="el-icon-error" style="color: #f44336;" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ delayedCount }}</div>
              <div class="stat-label">延期计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 进度报表 -->
    <el-card class="table-card" shadow="never">
      <div slot="header" class="card-header">
        <span><i class="el-icon-data-line" /> 生产进度报表</span>
        <div class="header-actions">
          <el-button size="small" icon="el-icon-download" @click="handleExport">
            导出报表
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="reportData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="planNumber"
          label="计划编号"
          min-width="150"
          fixed
        >
          <template slot-scope="{ row }">
            <el-link type="primary" @click="handleView(row)">
              {{ row.planNumber }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          prop="productCode"
          label="产品编码"
          min-width="130"
          show-overflow-tooltip
        />

        <el-table-column
          prop="productName"
          label="产品名称"
          min-width="150"
          show-overflow-tooltip
        />

        <el-table-column
          label="需求数量"
          min-width="120"
          align="right"
        >
          <template slot-scope="{ row }">
            {{ formatNumber(row.demandQuantity) }} {{ row.demandUnit }}
          </template>
        </el-table-column>

        <el-table-column
          prop="plannedDeliveryDate"
          label="计划交期"
          min-width="160"
        >
          <template slot-scope="{ row }">
            {{ formatDateTime(row.plannedDeliveryDate) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template slot-scope="{ row }">
            <status-tag
              :status="row.status"
              :text-map="statusConfig.textMap"
              :type-map="statusConfig.typeMap"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column
          label="完成进度"
          min-width="200"
        >
          <template slot-scope="{ row }">
            <div class="progress-cell">
              <el-progress
                :percentage="Math.round(row.currentProgressPercentage || 0)"
                :color="getProgressColor(row.currentProgressPercentage)"
                :stroke-width="16"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="已完成数量"
          min-width="120"
          align="right"
        >
          <template slot-scope="{ row }">
            {{ formatNumber(row.completedQuantity) }} {{ row.demandUnit }}
          </template>
        </el-table-column>

        <el-table-column
          label="在制品数量"
          min-width="120"
          align="right"
        >
          <template slot-scope="{ row }">
            <span class="in-progress-quantity">
              {{ formatNumber(row.inProgressQuantity) }} {{ row.demandUnit }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="剩余数量"
          min-width="120"
          align="right"
        >
          <template slot-scope="{ row }">
            {{ formatNumber(row.remainingQuantity) }} {{ row.demandUnit }}
          </template>
        </el-table-column>

        <el-table-column
          label="预计完成时间"
          min-width="160"
        >
          <template slot-scope="{ row }">
            {{ formatDateTime(row.estimatedCompletionDate) }}
          </template>
        </el-table-column>

        <el-table-column
          label="延期预警"
          width="100"
          align="center"
          fixed="right"
        >
          <template slot-scope="{ row }">
            <el-tag
              :type="getDelayWarningType(row)"
              size="small"
            >
              {{ getDelayWarningText(row) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="totalCount > 0"
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.limit"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; text-align: right"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && reportData.length === 0"
        description="暂无进度报表数据"
        :image-size="120"
      />
    </el-card>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import { parseTime } from '@/utils'
import { fetchProgressReport } from './api'
import {
  STATUS_CONFIG
} from './constants'
import { getErrorMessage } from './constants/messages-config'
import dictionaryMixin from './mixins/dictionary'

export default {
  name: 'ProgressReport',
  components: {
    StatusTag
  },
  mixins: [dictionaryMixin],
  data() {
    return {
      loading: false,
      // 筛选表单
      filterForm: {
        status: '',
        priority: '',
        productCode: '',
        deliveryDateRange: null
      },
      // 状态和优先级选项 - 从字典mixin获取
      // statusOptions: this.planStatusOptions
      // priorityOptions: this.planPriorityOptions
      statusConfig: STATUS_CONFIG,
      // 报表数据
      reportData: [],
      totalCount: 0,
      // 分页参数
      pagination: {
        page: 1,
        limit: 20
      }
    }
  },
  computed: {
    // 统计数据
    onScheduleCount() {
      return this.reportData.filter(item => this.getDelayStatus(item) === 'normal').length
    },
    riskCount() {
      return this.reportData.filter(item => this.getDelayStatus(item) === 'warning').length
    },
    delayedCount() {
      return this.reportData.filter(item => this.getDelayStatus(item) === 'danger').length
    }
  },
  async created() {
    // 加载字典
    await this.loadProductionPlanDictionary()
    // 加载报表数据
    this.fetchReport()
  },
  methods: {
    /**
     * 加载进度报表
     */
    async fetchReport() {
      try {
        this.loading = true

        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          format: 'json'
        }

        // 添加筛选条件
        if (this.filterForm.status) {
          params.status = this.filterForm.status
        }
        if (this.filterForm.priority) {
          params.planPriority = this.filterForm.priority
        }
        if (this.filterForm.productCode) {
          params.productCode = this.filterForm.productCode
        }
        if (this.filterForm.deliveryDateRange && this.filterForm.deliveryDateRange.length === 2) {
          params.plannedDeliveryDateStart = `${this.filterForm.deliveryDateRange[0]}T00:00:00.000Z`
          params.plannedDeliveryDateEnd = `${this.filterForm.deliveryDateRange[1]}T23:59:59.999Z`
        }

        const response = await fetchProgressReport(params)

        if (response.success && response.data) {
          this.reportData = response.data.reports || []
          this.totalCount = response.data.totalCount || 0
        } else {
          this.reportData = []
          this.totalCount = 0
          this.$message.error(response.message || '获取进度报表失败')
        }
      } catch (error) {
        console.error('加载进度报表失败:', error)
        this.reportData = []
        this.totalCount = 0
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
     * 搜索
     */
    handleSearch() {
      this.pagination.page = 1
      this.fetchReport()
    },

    /**
     * 重置
     */
    handleReset() {
      this.filterForm = {
        status: '',
        priority: '',
        productCode: '',
        deliveryDateRange: null
      }
      this.pagination.page = 1
      this.fetchReport()
    },

    /**
     * 刷新
     */
    async handleRefresh() {
      await this.fetchReport()
      this.$message.success('刷新成功')
    },

    /**
     * 分页大小变更
     */
    handleSizeChange(size) {
      this.pagination.limit = size
      this.pagination.page = 1
      this.fetchReport()
    },

    /**
     * 页码变更
     */
    handlePageChange(page) {
      this.pagination.page = page
      this.fetchReport()
    },

    /**
     * 查看详情
     */
    handleView(row) {
      this.$router.push({
        name: 'ProductionPlanDetail',
        params: { id: row.id }
      })
    },

    /**
     * 导出报表
     */
    async handleExport() {
      try {
        this.$message.info('导出功能开发中，敬请期待')
        // TODO: 实现导出功能
      } catch (error) {
        console.error('导出报表失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      }
    },

    /**
     * 获取延期状态
     */
    getDelayStatus(row) {
      if (!row.estimatedCompletionDate || !row.plannedDeliveryDate) {
        return 'normal'
      }

      const estimatedDate = new Date(row.estimatedCompletionDate)
      const plannedDate = new Date(row.plannedDeliveryDate)
      const diffDays = Math.ceil((plannedDate - estimatedDate) / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'danger' // 已延期
      if (diffDays <= 3) return 'warning' // 预警
      return 'normal' // 正常
    },

    /**
     * 获取延期预警类型
     */
    getDelayWarningType(row) {
      const status = this.getDelayStatus(row)
      const typeMap = {
        normal: 'success',
        warning: 'warning',
        danger: 'danger'
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取延期预警文本
     */
    getDelayWarningText(row) {
      const status = this.getDelayStatus(row)
      const textMap = {
        normal: '正常',
        warning: '预警',
        danger: '延期'
      }
      return textMap[status] || '-'
    },

    /**
     * 获取进度条颜色
     */
    getProgressColor(percentage) {
      if (percentage >= 80) return '#67C23A'
      if (percentage >= 50) return '#E6A23C'
      if (percentage >= 30) return '#F56C6C'
      return '#909399'
    },

    /**
     * 格式化数字
     */
    formatNumber(value, precision = 2) {
      if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '-'
      }
      return Number(value).toFixed(precision)
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(value) {
      if (!value) return '-'
      return parseTime(value, '{y}-{m}-{d} {h}:{i}')
    }
  }
}
</script>

<style lang="scss" scoped>
.progress-report {
  padding: 20px;

  .filter-card {
    margin-bottom: 16px;
  }

  .stats-row {
    margin-bottom: 16px;

    .stat-card {
      .stat-item {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;

          i {
            font-size: 28px;
          }
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;

      i {
        margin-right: 6px;
        color: #409eff;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .progress-cell {
      padding: 4px 0;
    }

    .in-progress-quantity {
      color: #409eff;
      font-weight: 500;
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .stats-row {
      .el-col {
        margin-bottom: 16px;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 10px;

    .stats-row {
      .stat-card {
        .stat-item {
          .stat-icon {
            width: 48px;
            height: 48px;

            i {
              font-size: 24px;
            }
          }

          .stat-content {
            .stat-value {
              font-size: 24px;
            }
          }
        }
      }
    }
  }
}
</style>

