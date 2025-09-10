<template>
  <div class="stats-container">
    <div class="page-header">
      <h2>申请统计</h2>
      <p class="page-description">查看用户注册申请的统计数据和趋势分析</p>
    </div>

    <!-- 统计数据展示 -->
    <ApplicationStats
      :date-range="dateRange"
      :auto-load="true"
      :refresh-interval="300000"
      @stats-loaded="handleStatsLoaded"
      @stats-error="handleStatsError"
    />

    <!-- 时间范围选择器 -->
    <div class="date-range-selector">
      <el-card shadow="never">
        <div slot="header">
          <span>时间范围设置</span>
        </div>
        <el-radio-group v-model="dateRange" @change="handleDateRangeChange">
          <el-radio-button label="week">最近一周</el-radio-button>
          <el-radio-button label="month">最近一月</el-radio-button>
          <el-radio-button label="quarter">最近三月</el-radio-button>
          <el-radio-button label="year">最近一年</el-radio-button>
        </el-radio-group>
      </el-card>
    </div>

    <!-- 详细数据表格 -->
    <div v-if="statsData" class="stats-table">
      <el-card shadow="never">
        <div slot="header">
          <span>详细统计数据</span>
          <el-button
            style="float: right; padding: 3px 0"
            type="text"
            @click="exportStats"
          >
            导出数据
          </el-button>
        </div>
        <el-table :data="[statsData]" border>
          <el-table-column prop="dateRange" label="统计时间范围" width="150">
            <template slot-scope="scope">
              {{ formatDateRange(scope.row.dateRange) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalCount" label="总申请数" width="100" />
          <el-table-column prop="pendingCount" label="待审批" width="100" />
          <el-table-column prop="approvedCount" label="已通过" width="100" />
          <el-table-column prop="rejectedCount" label="已拒绝" width="100" />
          <el-table-column prop="approvalRate" label="通过率" width="100">
            <template slot-scope="scope">
              {{ (scope.row.approvalRate * 100).toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column prop="rejectionRate" label="拒绝率" width="100">
            <template slot-scope="scope">
              {{ (scope.row.rejectionRate * 100).toFixed(1) }}%
            </template>
          </el-table-column>
          <el-table-column prop="generatedAt" label="生成时间" width="180">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.generatedAt) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import ApplicationStats from '@/views/register/components/ApplicationStats'
// import { getApplicationStats } from '@/views/register/api/register'

export default {
  name: 'StatsPage',
  components: {
    ApplicationStats
  },
  data() {
    return {
      dateRange: 'month',
      statsData: null,
      loading: false
    }
  },
  methods: {
    /**
     * 处理统计数据加载成功
     * @param {Object} data - 统计数据
     */
    handleStatsLoaded(data) {
      this.statsData = data
      console.log('统计数据加载成功:', data)
    },

    /**
     * 处理统计数据加载失败
     * @param {Error} error - 错误信息
     */
    handleStatsError(error) {
      console.error('统计数据加载失败:', error)
      this.$message.error('统计数据加载失败，请稍后重试')
    },

    /**
     * 处理时间范围变化
     * @param {string} value - 新的时间范围值
     */
    handleDateRangeChange(value) {
      console.log('时间范围变更为:', value)
    },

    /**
     * 格式化日期时间
     * @param {string} dateTime - 日期时间字符串
     * @returns {string} 格式化后的日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return new Date(dateTime).toLocaleString('zh-CN')
    },

    /**
     * 格式化日期范围显示
     * @param {string} range - 日期范围标识
     * @returns {string} 格式化后的日期范围
     */
    formatDateRange(range) {
      const rangeMap = {
        week: '最近一周',
        month: '最近一月',
        quarter: '最近三月',
        year: '最近一年'
      }
      return rangeMap[range] || range
    },

    /**
     * 导出统计数据
     */
    async exportStats() {
      if (!this.statsData) {
        this.$message.warning('暂无数据可导出')
        return
      }

      try {
        // 这里可以实现数据导出功能
        // 例如导出为Excel或CSV格式
        this.$message.success('数据导出功能开发中')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败，请稍后重试')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .page-description {
    margin: 0;
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
  }
}

.date-range-selector {
  margin: 20px 0;

  .el-card {
    border: 1px solid #ebeef5;
  }

  .el-radio-group {
    width: 100%;
  }

  .el-radio-button {
    margin-right: 8px;

    &:last-child {
      margin-right: 0;
    }
  }
}

.stats-table {
  margin-top: 20px;

  .el-card {
    border: 1px solid #ebeef5;
  }

  .el-table {
    margin-top: 0;
  }

  .el-table th {
    background-color: #fafafa;
    color: #606266;
    font-weight: 600;
  }

  .el-table td {
    padding: 12px 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .stats-container {
    padding: 10px;
  }

  .page-header {
    padding: 15px;

    h2 {
      font-size: 20px;
    }
  }

  .date-range-selector {
    .el-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .el-radio-button {
      margin-right: 0;
      flex: 1;
    }
  }

  .stats-table {
    .el-table {
      font-size: 12px;
    }
  }
}
</style>
