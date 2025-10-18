/**
 * 文件名称：progress-report.vue
 * 文件描述：生产计划进度报表页面（根据最新接口文档重构）
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 *   - 2025-10-17: 根据最新接口文档完整重构，支持JSON和CSV导出
 */

<template>
  <div class="progress-report">
    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" size="small">
        <el-form-item label="计划来源">
          <el-select
            v-model="filterForm.source"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in planSourceOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

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
            v-model="filterForm.planPriority"
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

        <el-form-item label="计划编号">
          <el-input
            v-model="filterForm.planNumber"
            placeholder="请输入计划编号"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="外部订单号">
          <el-input
            v-model="filterForm.externalOrderNumber"
            placeholder="请输入外部订单号"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="全局搜索">
          <el-input
            v-model="filterForm.search"
            placeholder="计划编号/产品编码/订单号"
            clearable
            style="width: 220px"
          >
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
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

        <el-form-item label="创建时间">
          <el-date-picker
            v-model="filterForm.createdDateRange"
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
              <div class="stat-value">{{ completedCount }}</div>
              <div class="stat-label">已完成计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #fff3e0;">
              <i class="el-icon-loading" style="color: #ff9800;" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ inProgressCount }}</div>
              <div class="stat-label">执行中计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background-color: #f3e5f5;">
              <i class="el-icon-document" style="color: #9c27b0;" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ avgProgressPercentage }}%</div>
              <div class="stat-label">平均完成度</div>
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
          <el-button
            size="small"
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExportJSON"
          >
            导出JSON
          </el-button>
          <el-button
            size="small"
            type="primary"
            icon="el-icon-download"
            :loading="exportLoading"
            @click="handleExportCSV"
          >
            导出CSV
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
          prop="status"
          label="状态"
          width="100"
          align="center"
        >
          <template slot-scope="{ row }">
            <status-tag
              :status="row.status"
              :text-map="planStatusTextMap"
              :type-map="planStatusTypeMap"
              size="small"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="plannedDeliveryDate"
          label="计划交期"
          min-width="110"
          align="center"
        >
          <template slot-scope="{ row }">
            {{ formatDate(row.plannedDeliveryDate) }}
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
              >
                <template slot="default" slot-scope="scope">
                  {{ scope.percentage }}%
                </template>
              </el-progress>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          prop="totalItems"
          label="计划项总数"
          width="100"
          align="center"
        />

        <el-table-column
          prop="completedItems"
          label="已完成项"
          width="90"
          align="center"
        >
          <template slot-scope="{ row }">
            <span style="color: #67c23a; font-weight: 500;">
              {{ row.completedItems }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="inProgressItems"
          label="执行中项"
          width="90"
          align="center"
        >
          <template slot-scope="{ row }">
            <span style="color: #409eff; font-weight: 500;">
              {{ row.inProgressItems }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="activeItems"
          label="活动项"
          width="80"
          align="center"
        >
          <template slot-scope="{ row }">
            {{ row.activeItems }}
          </template>
        </el-table-column>

        <el-table-column
          prop="cancelledItems"
          label="已取消项"
          width="90"
          align="center"
        >
          <template slot-scope="{ row }">
            <span v-if="row.cancelledItems > 0" style="color: #f56c6c;">
              {{ row.cancelledItems }}
            </span>
            <span v-else style="color: #909399;">-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="totalCount > 0"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100, 200, 500]"
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
import { PLAN_STATUS_TYPE_MAP, PLAN_PRIORITY_TYPE_MAP } from './constants'
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
      exportLoading: false,
      // 筛选表单
      filterForm: {
        source: '',
        status: '',
        planPriority: '',
        productCode: '',
        planNumber: '',
        externalOrderNumber: '',
        search: '',
        deliveryDateRange: null,
        createdDateRange: null
      },
      // 类型映射
      planStatusTypeMap: PLAN_STATUS_TYPE_MAP,
      planPriorityTypeMap: PLAN_PRIORITY_TYPE_MAP,
      // 报表数据
      reportData: [],
      totalCount: 0,
      // 分页参数（使用offset而不是page）
      pagination: {
        offset: 0,
        limit: 20
      }
    }
  },
  computed: {
    // 计算当前页码（用于分页组件显示）
    currentPage() {
      return Math.floor(this.pagination.offset / this.pagination.limit) + 1
    },
    // 文本映射（从字典获取）
    planStatusTextMap() {
      const map = {}
      this.planStatusOptions.forEach(item => {
        map[item.value] = item.label
      })
      return map
    },
    // 统计数据
    completedCount() {
      return this.reportData.filter(item => item.status === 'COMPLETED').length
    },
    inProgressCount() {
      return this.reportData.filter(item => item.status === 'IN_PROGRESS').length
    },
    avgProgressPercentage() {
      if (this.reportData.length === 0) return 0
      const sum = this.reportData.reduce((acc, item) => acc + (item.currentProgressPercentage || 0), 0)
      return Math.round(sum / this.reportData.length)
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
          offset: this.pagination.offset,
          limit: this.pagination.limit,
          format: 'json'
        }

        // 添加筛选条件
        if (this.filterForm.source) {
          params.source = this.filterForm.source
        }
        if (this.filterForm.status) {
          params.status = this.filterForm.status
        }
        if (this.filterForm.planPriority) {
          params.planPriority = this.filterForm.planPriority
        }
        if (this.filterForm.productCode) {
          params.productCode = this.filterForm.productCode
        }
        if (this.filterForm.planNumber) {
          params.planNumber = this.filterForm.planNumber
        }
        if (this.filterForm.externalOrderNumber) {
          params.externalOrderNumber = this.filterForm.externalOrderNumber
        }
        if (this.filterForm.search) {
          params.search = this.filterForm.search
        }

        // 日期范围参数（API会自动处理）
        if (this.filterForm.deliveryDateRange && this.filterForm.deliveryDateRange.length === 2) {
          params.deliveryDateRange = this.filterForm.deliveryDateRange
        }
        if (this.filterForm.createdDateRange && this.filterForm.createdDateRange.length === 2) {
          params.createdDateRange = this.filterForm.createdDateRange
        }

        const response = await fetchProgressReport(params)

        if (response.success && response.data) {
          // 根据接口文档，响应数据结构为 { columns, rows }
          this.reportData = response.data.rows || []
          // 总数从 meta.metadata.total 获取
          this.totalCount = response.meta?.metadata?.total || 0
        } else {
          this.reportData = []
          this.totalCount = 0
          // 区分失败和成功但无数据两种情况
          if (response.success === false) {
            // 请求失败，message 在 error 对象中
            this.$message.error(response.error?.message || '获取进度报表失败')
          } else {
            // 成功但数据为空，message 在顶层
            this.$message.warning(response.message || '暂无进度报表数据')
          }
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
      this.pagination.offset = 0
      this.fetchReport()
    },

    /**
     * 重置
     */
    handleReset() {
      this.filterForm = {
        source: '',
        status: '',
        planPriority: '',
        productCode: '',
        planNumber: '',
        externalOrderNumber: '',
        search: '',
        deliveryDateRange: null,
        createdDateRange: null
      }
      this.pagination.offset = 0
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
      this.pagination.offset = 0
      this.fetchReport()
    },

    /**
     * 页码变更
     */
    handlePageChange(page) {
      this.pagination.offset = (page - 1) * this.pagination.limit
      this.fetchReport()
    },

    /**
     * 查看详情
     */
    handleView(row) {
      // 接口已返回 id 字段，直接跳转
      this.$router.push({
        name: 'ProductionPlanDetail',
        params: { id: row.id }
      })
    },

    /**
     * 导出JSON格式
     */
    async handleExportJSON() {
      try {
        this.exportLoading = true

        const params = this.buildExportParams()
        params.format = 'json'
        // JSON导出建议增加限制，避免数据量过大
        params.limit = Math.min(params.limit || 5000, 5000)

        const response = await fetchProgressReport(params)

        if (response.success && response.data) {
          // 创建JSON文件并下载
          const jsonStr = JSON.stringify(response.data, null, 2)
          const blob = new Blob([jsonStr], { type: 'application/json' })
          const fileName = `production-progress-report-${Date.now()}.json`
          this.downloadFile(blob, fileName)

          this.$message.success(`成功导出 ${response.data.rows?.length || 0} 条记录`)
        } else {
          // 请求失败，message 在 error 对象中
          this.$message.error(response.error?.message || '导出失败')
        }
      } catch (error) {
        console.error('导出JSON失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.exportLoading = false
      }
    },

    /**
     * 导出CSV格式
     */
    async handleExportCSV() {
      try {
        this.exportLoading = true

        const params = this.buildExportParams()
        params.format = 'csv'
        params.fileName = `production-progress-report-${this.formatDateForFileName()}`

        // CSV格式返回blob
        const blob = await fetchProgressReport(params)

        // 从响应头获取文件名（如果有）
        const fileName = params.fileName + '.csv'
        this.downloadFile(blob, fileName)

        this.$message.success('CSV文件导出成功')
      } catch (error) {
        console.error('导出CSV失败:', error)
        const errorMessage = getErrorMessage(error)
        this.$message.error(errorMessage)
      } finally {
        this.exportLoading = false
      }
    },

    /**
     * 构建导出参数
     */
    buildExportParams() {
      const params = {
        offset: 0,
        limit: 5000 // 接口最大支持5000条
      }

      // 复制当前筛选条件
      if (this.filterForm.source) params.source = this.filterForm.source
      if (this.filterForm.status) params.status = this.filterForm.status
      if (this.filterForm.planPriority) params.planPriority = this.filterForm.planPriority
      if (this.filterForm.productCode) params.productCode = this.filterForm.productCode
      if (this.filterForm.planNumber) params.planNumber = this.filterForm.planNumber
      if (this.filterForm.externalOrderNumber) params.externalOrderNumber = this.filterForm.externalOrderNumber
      if (this.filterForm.search) params.search = this.filterForm.search

      if (this.filterForm.deliveryDateRange) {
        params.deliveryDateRange = this.filterForm.deliveryDateRange
      }
      if (this.filterForm.createdDateRange) {
        params.createdDateRange = this.filterForm.createdDateRange
      }

      return params
    },

    /**
     * 下载文件
     */
    downloadFile(blob, fileName) {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },

    /**
     * 格式化日期用于文件名
     */
    formatDateForFileName() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}${month}${day}`
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
     * 格式化日期
     */
    formatDate(value) {
      if (!value) return '-'
      return parseTime(value, '{y}-{m}-{d}')
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
