<!--
文件名称：maintenance-plan-rate.vue
文件描述：维护计划执行率统计页面
创建日期：2024-01-20
修改记录：
  - 2024-01-20: 初始创建
-->

<template>
  <div class="maintenance-plan-rate-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">维护计划执行率统计</h2>
      <p class="page-description">评估维护管理效率，识别执行延迟和瓶颈</p>
    </div>

    <!-- 查询条件区域 -->
    <el-card class="query-card" shadow="never">
      <el-form
        ref="queryForm"
        :model="queryParams"
        :rules="queryRules"
        label-width="100px"
        class="query-form"
      >
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="queryParams.startDate"
                type="date"
                placeholder="请选择开始日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="queryParams.endDate"
                type="date"
                placeholder="请选择结束日期"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="设备类型" prop="equipmentType">
              <el-select
                v-model="queryParams.equipmentType"
                placeholder="请选择设备类型"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in equipmentTypes"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-form-item label="时间粒度" prop="timePeriod">
              <el-select
                v-model="queryParams.timePeriod"
                placeholder="请选择时间粒度"
                style="width: 100%"
              >
                <el-option
                  v-for="item in timePeriods"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" class="query-actions">
            <el-button
              type="primary"
              icon="el-icon-search"
              :loading="loading"
              @click="handleQuery"
            >
              查询
            </el-button>
            <el-button icon="el-icon-refresh" @click="handleReset">
              重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 总体执行率摘要 -->
    <el-card v-if="statisticsData.summary" class="summary-card" shadow="never">
      <div class="summary-header">
        <h3 class="summary-title">总体执行率摘要</h3>
        <el-tag :type="getExecutionRateType(parseFloat(statisticsData.summary.overallExecutionRate))" size="medium">
          当前粒度：{{ queryParams.timePeriod }}
        </el-tag>
      </div>

      <el-row :gutter="20" class="summary-content">
        <el-col :xs="24" :sm="8" :md="8">
          <div class="summary-item">
            <div class="summary-icon" style="background-color: #ecf5ff;">
              <i class="el-icon-document" style="color: #409eff;" />
            </div>
            <div class="summary-info">
              <div class="summary-label">总任务数</div>
              <div class="summary-value">{{ statisticsData.summary.totalTasks }}</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="8" :md="8">
          <div class="summary-item">
            <div class="summary-icon" style="background-color: #f0f9ff;">
              <i class="el-icon-circle-check" style="color: #67c23a;" />
            </div>
            <div class="summary-info">
              <div class="summary-label">已完成任务数</div>
              <div class="summary-value">{{ statisticsData.summary.completedTasks }}</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="8" :md="8">
          <div class="summary-item highlight">
            <div class="summary-icon" :style="{ backgroundColor: getExecutionRateColor(parseFloat(statisticsData.summary.overallExecutionRate), 0.1) }">
              <i class="el-icon-data-line" :style="{ color: getExecutionRateColor(parseFloat(statisticsData.summary.overallExecutionRate)) }" />
            </div>
            <div class="summary-info">
              <div class="summary-label">总体执行率</div>
              <div
                class="summary-value execution-rate"
                :style="{ color: getExecutionRateColor(parseFloat(statisticsData.summary.overallExecutionRate)) }"
              >
                {{ statisticsData.summary.overallExecutionRate }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表和表格视图切换 -->
    <el-card v-if="statisticsData.details && statisticsData.details.length > 0" class="chart-card" shadow="never">
      <div class="chart-header">
        <h3 class="chart-title">执行率趋势分析</h3>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button label="chart">
            <i class="el-icon-data-line" /> 图表
          </el-radio-button>
          <el-radio-button label="table">
            <i class="el-icon-s-grid" /> 表格
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 图表视图 -->
      <div v-show="viewMode === 'chart'" class="chart-container">
        <div ref="chartContainer" class="execution-rate-chart" />
      </div>

      <!-- 表格视图 -->
      <div v-show="viewMode === 'table'" class="table-container">
        <el-table
          :data="statisticsData.details"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column
            prop="period"
            label="时间段"
            min-width="180"
            :formatter="formatPeriod"
          />
          <el-table-column
            prop="totalTasks"
            label="总任务数"
            width="120"
            align="center"
          />
          <el-table-column
            prop="completedTasks"
            label="已完成任务数"
            width="130"
            align="center"
          />
          <el-table-column
            prop="executionRate"
            label="执行率"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-tag
                :type="getExecutionRateType(parseFloat(scope.row.executionRate))"
                effect="plain"
              >
                {{ scope.row.executionRate }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="健康度"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <div class="health-indicator">
                <i
                  :class="getHealthIcon(parseFloat(scope.row.executionRate))"
                  :style="{ color: getExecutionRateColor(parseFloat(scope.row.executionRate)) }"
                />
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && (!statisticsData.details || statisticsData.details.length === 0)"
      description="暂无数据"
      :image-size="200"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getMaintenancePlanRate } from './api/tpm-statistics'
import { EQUIPMENT_TYPES, TIME_PERIODS } from './constants'

export default {
  name: 'MaintenancePlanRate',

  data() {
    // 自定义日期验证规则
    const validateDateRange = (rule, value, callback) => {
      if (this.queryParams.startDate && this.queryParams.endDate) {
        const start = new Date(this.queryParams.startDate)
        const end = new Date(this.queryParams.endDate)
        if (end < start) {
          callback(new Error('结束日期不能早于开始日期'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      loading: false,
      viewMode: 'chart', // chart | table
      equipmentTypes: EQUIPMENT_TYPES.filter(item => item.value !== ''), // 过滤掉"全部设备"
      timePeriods: TIME_PERIODS,
      queryParams: {
        startDate: '',
        endDate: '',
        equipmentType: '',
        timePeriod: '月'
      },
      queryRules: {
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'change' },
          { validator: validateDateRange, trigger: 'change' }
        ]
      },
      statisticsData: {
        summary: null,
        details: [],
        timePeriod: ''
      },
      chartInstance: null
    }
  },

  mounted() {
    // 设置默认日期范围（最近3个月）
    this.initDefaultDateRange()
  },

  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
      this.chartInstance = null
    }
  },

  methods: {
    /**
     * 初始化默认日期范围
     */
    initDefaultDateRange() {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)

      this.queryParams.endDate = this.formatDate(end)
      this.queryParams.startDate = this.formatDate(start)
    },

    /**
     * 格式化日期
     */
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    /**
     * 查询统计数据
     */
    async handleQuery() {
      this.$refs.queryForm.validate(async(valid) => {
        if (!valid) {
          return
        }

        this.loading = true
        try {
          const params = {
            startDate: this.queryParams.startDate,
            endDate: this.queryParams.endDate,
            timePeriod: this.queryParams.timePeriod
          }

          if (this.queryParams.equipmentType) {
            params.equipmentType = this.queryParams.equipmentType
          }

          const response = await getMaintenancePlanRate(params)

          if (response.success) {
            this.statisticsData = {
              summary: response.data.summary,
              details: response.data.details || [],
              timePeriod: response.data.timePeriod
            }

            // 更新图表
            this.$nextTick(() => {
              this.initChart()
            })

            this.$message.success(response.message || '查询成功')
          }
        } catch (error) {
          console.error('查询执行率统计失败:', error)
          this.$message.error(error.message || '查询失败')
        } finally {
          this.loading = false
        }
      })
    },

    /**
     * 重置查询条件
     */
    handleReset() {
      this.$refs.queryForm.resetFields()
      this.initDefaultDateRange()
      this.statisticsData = {
        summary: null,
        details: [],
        timePeriod: ''
      }
      if (this.chartInstance) {
        this.chartInstance.clear()
      }
    },

    /**
     * 初始化图表
     */
    initChart() {
      if (!this.$refs.chartContainer) {
        return
      }

      // 销毁已存在的图表实例
      if (this.chartInstance) {
        this.chartInstance.dispose()
      }

      // 创建新的图表实例
      this.chartInstance = echarts.init(this.$refs.chartContainer)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          },
          formatter: (params) => {
            let html = `<div style="font-weight: 600; margin-bottom: 8px;">${this.formatPeriod({ period: params[0].axisValue })}</div>`
            params.forEach(param => {
              const value = param.seriesName === '执行率' ? `${param.value}%` : param.value
              html += `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
                  <span style="flex: 1;">${param.seriesName}:</span>
                  <span style="font-weight: 600; margin-left: 12px;">${value}</span>
                </div>
              `
            })
            return html
          }
        },
        legend: {
          data: ['总任务数', '已完成任务数', '执行率'],
          top: '0',
          left: 'center'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: this.statisticsData.details.map(item => item.period),
          axisLabel: {
            formatter: (value) => this.formatPeriodShort(value)
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '任务数',
            min: 0,
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: '执行率(%)',
            min: 0,
            max: 100,
            axisLabel: {
              formatter: '{value}%'
            }
          }
        ],
        series: [
          {
            name: '总任务数',
            type: 'bar',
            data: this.statisticsData.details.map(item => item.totalTasks),
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '已完成任务数',
            type: 'bar',
            data: this.statisticsData.details.map(item => item.completedTasks),
            itemStyle: {
              color: '#67C23A'
            }
          },
          {
            name: '执行率',
            type: 'line',
            yAxisIndex: 1,
            data: this.statisticsData.details.map(item => parseFloat(item.executionRate)),
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
                { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
              ])
            },
            itemStyle: {
              color: '#E6A23C'
            },
            lineStyle: {
              width: 3
            },
            markLine: {
              silent: true,
              data: [
                {
                  yAxis: 95,
                  label: {
                    formatter: '优秀线: 95%',
                    position: 'end'
                  },
                  lineStyle: {
                    color: '#67C23A',
                    type: 'dashed'
                  }
                },
                {
                  yAxis: 80,
                  label: {
                    formatter: '警戒线: 80%',
                    position: 'end'
                  },
                  lineStyle: {
                    color: '#F56C6C',
                    type: 'dashed'
                  }
                }
              ]
            }
          }
        ]
      }

      this.chartInstance.setOption(option)

      // 自适应窗口大小
      window.addEventListener('resize', this.handleChartResize)
    },

    /**
     * 处理图表窗口大小变化
     */
    handleChartResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },

    /**
     * 格式化时间段显示
     */
    formatPeriod({ period }) {
      if (!period) return ''
      const date = new Date(period)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      const timePeriod = this.statisticsData.timePeriod || this.queryParams.timePeriod

      switch (timePeriod) {
        case '日':
          return `${year}年${month}月${day}日`
        case '周':
          return `${year}年第${this.getWeekNumber(date)}周`
        case '月':
          return `${year}年${month}月`
        case '年':
          return `${year}年`
        default:
          return `${year}-${month}-${day}`
      }
    },

    /**
     * 格式化时间段显示（简短版）
     */
    formatPeriodShort(period) {
      if (!period) return ''
      const date = new Date(period)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      const timePeriod = this.statisticsData.timePeriod || this.queryParams.timePeriod

      switch (timePeriod) {
        case '日':
          return `${month}-${day}`
        case '周':
          return `第${this.getWeekNumber(date)}周`
        case '月':
          return `${month}月`
        case '年':
          return `${date.getFullYear()}年`
        default:
          return `${month}-${day}`
      }
    },

    /**
     * 获取周数
     */
    getWeekNumber(date) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
    },

    /**
     * 获取执行率类型标签
     */
    getExecutionRateType(rate) {
      if (rate >= 95) return 'success'
      if (rate >= 80) return 'warning'
      return 'danger'
    },

    /**
     * 获取执行率颜色
     */
    getExecutionRateColor(rate, opacity = 1) {
      let color = ''
      if (rate >= 95) {
        color = '#67C23A'
      } else if (rate >= 80) {
        color = '#E6A23C'
      } else {
        color = '#F56C6C'
      }

      if (opacity < 1) {
        // 转换为rgba
        const r = parseInt(color.slice(1, 3), 16)
        const g = parseInt(color.slice(3, 5), 16)
        const b = parseInt(color.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }

      return color
    },

    /**
     * 获取健康度图标
     */
    getHealthIcon(rate) {
      if (rate >= 95) return 'el-icon-success'
      if (rate >= 80) return 'el-icon-warning'
      return 'el-icon-error'
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-plan-rate-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .page-header {
    margin-bottom: 20px;

    .page-title {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .page-description {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .query-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 20px;
    }

    .query-form {
      .el-form-item {
        margin-bottom: 16px;
      }

      .query-actions {
        text-align: right;
        padding-top: 4px;
      }
    }
  }

  .summary-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 24px;
    }

    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .summary-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .summary-content {
      .summary-item {
        display: flex;
        align-items: center;
        padding: 20px;
        background-color: #fafafa;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        &.highlight {
          background: linear-gradient(135deg, #fef5e7 0%, #fff 100%);
          border: 1px solid #e6a23c;
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 12px;
          margin-right: 16px;

          i {
            font-size: 28px;
          }
        }

        .summary-info {
          flex: 1;

          .summary-label {
            font-size: 14px;
            color: #606266;
            margin-bottom: 8px;
          }

          .summary-value {
            font-size: 28px;
            font-weight: 600;
            color: #303133;

            &.execution-rate {
              font-size: 32px;
            }
          }
        }
      }
    }
  }

  .chart-card {
    ::v-deep .el-card__body {
      padding: 24px;
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .chart-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .chart-container {
      .execution-rate-chart {
        width: 100%;
        height: 450px;
      }
    }

    .table-container {
      .health-indicator {
        display: flex;
        justify-content: center;
        align-items: center;

        i {
          font-size: 20px;
        }
      }
    }
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .maintenance-plan-rate-container {
    .summary-content {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .chart-container {
      .execution-rate-chart {
        height: 350px;
      }
    }
  }
}
</style>

