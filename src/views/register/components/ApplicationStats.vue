<!--
/**
 * 文件名称：ApplicationStats.vue
 * 文件描述：申请统计数据展示组件，用于展示审批相关的统计信息
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，实现统计数据展示功能
 */
-->

<template>
  <div class="application-stats">
    <!-- 统计卡片容器 -->
    <div class="stats-cards">
      <!-- 总申请数 -->
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="el-icon-document" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statsData.total || 0 }}</div>
          <div class="stat-label">总申请数</div>
        </div>
      </div>

      <!-- 待审批 -->
      <div class="stat-card pending">
        <div class="stat-icon">
          <i class="el-icon-time" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statsData.pending || 0 }}</div>
          <div class="stat-label">待审批</div>
        </div>
      </div>

      <!-- 已通过 -->
      <div class="stat-card approved">
        <div class="stat-icon">
          <i class="el-icon-check" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statsData.approved || 0 }}</div>
          <div class="stat-label">已通过</div>
        </div>
      </div>

      <!-- 已拒绝 -->
      <div class="stat-card rejected">
        <div class="stat-icon">
          <i class="el-icon-close" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ statsData.rejected || 0 }}</div>
          <div class="stat-label">已拒绝</div>
        </div>
      </div>
    </div>

    <!-- 统计比率和时间范围选择器 -->
    <div class="stats-bottom">
      <!-- 统计比率 -->
      <div v-if="showRates" class="stats-rates">
        <div class="rate-item">
          <span class="rate-label">通过率：</span>
          <span class="rate-value success">{{ statsData.approvalRate || '0.00' }}%</span>
        </div>
        <div class="rate-item">
          <span class="rate-label">拒绝率：</span>
          <span class="rate-value danger">{{ statsData.rejectionRate || '0.00' }}%</span>
        </div>
      </div>

      <!-- 时间范围选择器 -->
      <div v-if="showDateRangeSelector" class="date-range-selector">
        <span class="range-label">统计时间范围：</span>
        <el-radio-group v-model="currentDateRange" @change="handleDateRangeChange">
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="week">最近一周</el-radio-button>
          <el-radio-button label="month">最近一月</el-radio-button>
          <el-radio-button label="year">最近一年</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 加载状态 -->
    <div
      v-if="loading"
      v-loading="loading"
      element-loading-text="正在加载统计数据..."
      element-loading-background="rgba(255, 255, 255, 0.8)"
      class="stats-loading"
    />

    <!-- 错误状态 -->
    <div v-if="error && !loading" class="stats-error">
      <div class="error-content">
        <i class="el-icon-warning" />
        <p>{{ errorMessage }}</p>
        <el-button size="small" @click="handleRetry">重新加载</el-button>
      </div>
    </div>

  </div>
</template>

<script>
import { getApplicationStats } from '../api/register'

export default {
  name: 'ApplicationStats',
  props: {

    /**
     * 指定审批人ID
     * @type {String}
     */
    approverId: {
      type: String,
      default: null
    },

    /**
     * 是否显示比率信息
     * @type {Boolean}
     * @default true
     */
    showRates: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示时间范围选择器
     * @type {Boolean}
     * @default false
     */
    showDateRangeSelector: {
      type: Boolean,
      default: false
    },

    /**
     * 默认时间范围
     * @type {String}
     * @default 'month'
     */
    defaultDateRange: {
      type: String,
      default: 'month'
    },

    /**
     * 是否自动加载数据
     * @type {Boolean}
     * @default true
     */
    autoLoad: {
      type: Boolean,
      default: true
    },

    /**
     * 刷新间隔（毫秒）
     * @type {Number}
     * @default 0 - 不自动刷新
     */
    refreshInterval: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      loading: false,
      error: false,
      errorMessage: '',
      statsData: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
        approvalRate: '0.00',
        rejectionRate: '0.00'
      },
      refreshTimer: null,
      currentDateRange: 'month'
    }
  },

  computed: {

  },

  watch: {
    /**
     * 监听审批人变化
     */
    approverId: {
      handler() {
        if (this.autoLoad) {
          this.loadStats()
        }
      },
      immediate: false
    }
  },

  mounted() {
    // 初始化当前时间范围
    this.currentDateRange = this.defaultDateRange

    if (this.autoLoad) {
      this.loadStats()
    }

    // 设置自动刷新
    if (this.refreshInterval > 0) {
      this.startAutoRefresh()
    }
  },

  beforeDestroy() {
    this.stopAutoRefresh()
  },

  methods: {
    /**
     * 加载统计数据
     * @returns {Promise}
     */
    async loadStats() {
      try {
        this.loading = true
        this.error = false
        this.errorMessage = ''

        // 构建查询参数
        const params = {
          dateRange: this.currentDateRange
        }

        if (this.approverId) {
          params.approverId = this.approverId
        }

        // 调用API获取统计数据
        const response = await getApplicationStats(params)

        if (response.success && response.data) {
          this.statsData = {
            ...this.statsData,
            ...response.data.statistics
          }

          // 触发加载完成事件
          this.$emit('stats-loaded', {
            data: this.statsData,
            dateRange: this.currentDateRange,
            approverId: this.approverId
          })
        } else {
          throw new Error(response.message || '获取统计数据失败')
        }
      } catch (error) {
        console.error('加载统计数据失败:', error)
        this.error = true
        this.errorMessage = error.message || '加载统计数据失败，请稍后重试'

        // 触发错误事件
        this.$emit('stats-error', {
          error,
          dateRange: this.currentDateRange,
          approverId: this.approverId
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 重试加载
     */
    handleRetry() {
      this.loadStats()
    },

    /**
     * 刷新统计数据
     * @returns {Promise}
     */
    refresh() {
      return this.loadStats()
    },

    /**
     * 开始自动刷新
     */
    startAutoRefresh() {
      if (this.refreshInterval > 0) {
        this.refreshTimer = setInterval(() => {
          this.loadStats()
        }, this.refreshInterval)
      }
    },

    /**
     * 停止自动刷新
     */
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },

    /**
     * 处理时间范围变化
     */
    handleDateRangeChange(value) {
      this.currentDateRange = value
      this.$emit('date-range-change', value)
      if (this.autoLoad) {
        this.loadStats()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.application-stats {
  width: 100%;
  position: relative;

  .stats-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 20px;

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      flex: 1;
      min-width: 200px;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;

        i {
          font-size: 24px;
          color: white;
        }
      }

      .stat-content {
        flex: 1;

        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 500;
        }
      }

      // 不同类型的卡片样式
      &.total .stat-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.pending .stat-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.approved .stat-icon {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }

      &.rejected .stat-icon {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      }
    }
  }

  .stats-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    flex-wrap: wrap;
    gap: 16px;
  }

  .stats-rates {
    display: flex;
    gap: 24px;

    .rate-item {
      display: flex;
      align-items: center;

      .rate-label {
        font-size: 14px;
        color: #606266;
        margin-right: 8px;
      }

      .rate-value {
        font-size: 16px;
        font-weight: 600;

        &.success {
          color: #67c23a;
        }

        &.danger {
          color: #f56c6c;
        }
      }
    }
  }

  .date-range-selector {
    display: flex;
    align-items: center;
    gap: 12px;

    .range-label {
      font-size: 14px;
      color: #606266;
      white-space: nowrap;
    }
  }

  .stats-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
  }

  .stats-error {
    text-align: center;
    padding: 40px 20px;

    .error-content {
      i {
        font-size: 48px;
        color: #f56c6c;
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
        color: #606266;
        margin: 0 0 16px 0;
      }
    }
  }

}

// 响应式设计
@media (max-width: 768px) {
  .application-stats {
    .stats-cards {
      gap: 12px;

      .stat-card {
        padding: 16px;
        min-width: 150px;

        .stat-icon {
          width: 40px;
          height: 40px;
          margin-right: 12px;

          i {
            font-size: 20px;
          }
        }

        .stat-content {
          .stat-value {
            font-size: 24px;
          }

          .stat-label {
            font-size: 13px;
          }
        }
      }
    }

    .stats-bottom {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
    }

    .stats-rates {
      flex-direction: column;
      gap: 12px;
      width: 100%;

      .rate-item {
        justify-content: space-between;
      }
    }

    .date-range-selector {
      width: 100%;
      justify-content: flex-start;

      .range-label {
        font-size: 13px;
      }
    }
  }
}
</style>
