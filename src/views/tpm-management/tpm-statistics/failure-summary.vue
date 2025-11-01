<!--
文件名称：failure-summary.vue
文件描述：故障汇总统计页面
创建日期：2024-01-20
修改记录：
  - 2024-01-20: 初始创建
-->

<template>
  <div class="failure-summary-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">故障汇总统计</h2>
      <p class="page-description">全面分析设备故障情况，识别故障模式和问题设备</p>
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
            <el-form-item label="故障类型" prop="failureType">
              <el-select
                v-model="queryParams.failureType"
                placeholder="请选择故障类型"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in failureTypes"
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

    <!-- 故障总体摘要 -->
    <el-card v-if="statisticsData.summary" class="summary-card" shadow="never">
      <div class="summary-header">
        <h3 class="summary-title">故障总体摘要</h3>
        <el-tag :type="getSevereFailureType()" size="medium">
          时间粒度：{{ statisticsData.summary.timePeriod }}
        </el-tag>
      </div>

      <el-row :gutter="20" class="summary-content">
        <el-col :xs="24" :sm="12" :md="12">
          <div class="summary-item">
            <div class="summary-icon" style="background-color: #fff3e0;">
              <i class="el-icon-warning-outline" style="color: #e6a23c;" />
            </div>
            <div class="summary-info">
              <div class="summary-label">总故障数</div>
              <div class="summary-value">{{ statisticsData.summary.totalFailures }}</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="12">
          <div class="summary-item highlight">
            <div class="summary-icon" style="background-color: #ffebee;">
              <i class="el-icon-close" style="color: #f56c6c;" />
            </div>
            <div class="summary-info">
              <div class="summary-label">严重故障数</div>
              <div class="summary-value severe">{{ statisticsData.summary.severeFailures }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 故障等级分布统计卡片 -->
    <el-card v-if="failureLevelStats.length > 0" class="level-stats-card" shadow="never">
      <div class="level-stats-header">
        <h3 class="level-stats-title">故障等级分布</h3>
      </div>

      <el-row :gutter="20" class="level-stats-content">
        <el-col
          v-for="item in failureLevelStats"
          :key="item.level"
          :xs="24"
          :sm="12"
          :md="6"
        >
          <div class="level-stat-item">
            <div class="level-stat-header">
              <span class="level-name">{{ item.level }}</span>
              <el-tag
                :type="getLevelTagType(item.level)"
                size="small"
                effect="plain"
              >
                {{ item.percentage }}
              </el-tag>
            </div>
            <div class="level-stat-value" :style="{ color: FAILURE_LEVEL_COLORS[item.level] }">
              {{ item.count }}
            </div>
            <div class="level-stat-progress">
              <el-progress
                :percentage="parseFloat(item.percentage)"
                :color="FAILURE_LEVEL_COLORS[item.level]"
                :show-text="false"
              />
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row v-if="statisticsData.timeStatistics && statisticsData.timeStatistics.length > 0" :gutter="20">
      <!-- 时间维度故障趋势图 -->
      <el-col :xs="24" :lg="14">
        <el-card class="chart-card" shadow="never">
          <div class="chart-header">
            <h3 class="chart-title">时间维度故障趋势</h3>
          </div>
          <div class="chart-container">
            <div ref="timeChartContainer" class="time-trend-chart" />
          </div>
        </el-card>
      </el-col>

      <!-- 故障类型分布饼图 -->
      <el-col :xs="24" :lg="10">
        <el-card class="chart-card" shadow="never">
          <div class="chart-header">
            <h3 class="chart-title">故障类型分布</h3>
          </div>
          <div class="chart-container">
            <div ref="typeChartContainer" class="type-distribution-chart" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 故障类型排名柱状图 -->
    <el-card
      v-if="statisticsData.typeStatistics && statisticsData.typeStatistics.length > 0"
      class="chart-card"
      shadow="never"
    >
      <div class="chart-header">
        <h3 class="chart-title">故障类型排名</h3>
        <el-radio-group v-model="typeRankChartOrientation" size="small" @change="handleOrientationChange">
          <el-radio-button label="horizontal">
            <i class="el-icon-s-operation" /> 横向
          </el-radio-button>
          <el-radio-button label="vertical">
            <i class="el-icon-menu" /> 纵向
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="chart-container">
        <div ref="typeRankChartContainer" class="type-rank-chart" />
      </div>
    </el-card>

    <!-- 问题设备TOP10列表 -->
    <el-card
      v-if="statisticsData.equipmentStatistics && statisticsData.equipmentStatistics.length > 0"
      class="equipment-card"
      shadow="never"
    >
      <div class="equipment-header">
        <h3 class="equipment-title">问题设备 TOP 10</h3>
        <el-tag type="info" size="small">按故障次数排序</el-tag>
      </div>

      <el-table
        :data="statisticsData.equipmentStatistics"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column
          type="index"
          label="排名"
          width="80"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.$index < 3"
              :type="getRankType(scope.$index)"
              effect="dark"
              size="small"
            >
              {{ scope.$index + 1 }}
            </el-tag>
            <span v-else>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="equipmentCode"
          label="设备编码"
          min-width="120"
        />

        <el-table-column
          prop="equipmentName"
          label="设备名称"
          min-width="150"
        />

        <el-table-column
          prop="failureCount"
          label="故障次数"
          width="120"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag type="danger" effect="plain">
              {{ scope.row.failureCount }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="avgMTTR"
          label="平均修复时间(小时)"
          width="160"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag :type="getMTTRType(parseFloat(scope.row.avgMTTR))" effect="plain">
              {{ scope.row.avgMTTR }}h
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && !statisticsData.summary"
      description="暂无数据，请选择查询条件后查询"
      :image-size="200"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getFailureSummary } from './api/tpm-statistics'
import {
  EQUIPMENT_TYPES,
  FAILURE_TYPES,
  TIME_PERIODS,
  FAILURE_LEVEL_COLORS,
  FAILURE_TYPE_COLORS
} from './constants'

export default {
  name: 'FailureSummary',

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
      equipmentTypes: EQUIPMENT_TYPES.filter(item => item.value !== ''),
      failureTypes: FAILURE_TYPES,
      timePeriods: TIME_PERIODS,
      FAILURE_LEVEL_COLORS,
      FAILURE_TYPE_COLORS,
      queryParams: {
        startDate: '',
        endDate: '',
        equipmentType: '',
        failureType: '',
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
        timeStatistics: [],
        typeStatistics: [],
        equipmentStatistics: []
      },
      timeChartInstance: null,
      typeChartInstance: null,
      typeRankChartInstance: null,
      typeRankChartOrientation: 'horizontal' // horizontal | vertical
    }
  },

  computed: {
    /**
     * 计算故障等级统计数据
     */
    failureLevelStats() {
      if (!this.statisticsData.timeStatistics || this.statisticsData.timeStatistics.length === 0) {
        return []
      }

      // 汇总所有时间段的故障等级数据
      const totalCounts = {
        'I级-严重': 0,
        'II级-重大': 0,
        'III级-一般': 0,
        'IV级-轻微': 0
      }

      this.statisticsData.timeStatistics.forEach(item => {
        totalCounts['I级-严重'] += item.severeCounts || 0
        totalCounts['II级-重大'] += item.majorCounts || 0
        totalCounts['III级-一般'] += item.normalCounts || 0
        totalCounts['IV级-轻微'] += item.minorCounts || 0
      })

      const total = Object.values(totalCounts).reduce((sum, count) => sum + count, 0)

      if (total === 0) {
        return []
      }

      return Object.keys(totalCounts).map(level => ({
        level,
        count: totalCounts[level],
        percentage: ((totalCounts[level] / total) * 100).toFixed(2) + '%'
      }))
    }
  },

  mounted() {
    // 设置默认日期范围（最近3个月）
    this.initDefaultDateRange()
  },

  beforeDestroy() {
    if (this.timeChartInstance) {
      this.timeChartInstance.dispose()
      this.timeChartInstance = null
    }
    if (this.typeChartInstance) {
      this.typeChartInstance.dispose()
      this.typeChartInstance = null
    }
    if (this.typeRankChartInstance) {
      this.typeRankChartInstance.dispose()
      this.typeRankChartInstance = null
    }
    window.removeEventListener('resize', this.handleChartResize)
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

          if (this.queryParams.failureType) {
            params.failureType = this.queryParams.failureType
          }

          const response = await getFailureSummary(params)

          if (response.success) {
            this.statisticsData = {
              summary: response.data.summary,
              timeStatistics: response.data.timeStatistics || [],
              typeStatistics: response.data.typeStatistics || [],
              equipmentStatistics: response.data.equipmentStatistics || []
            }

            // 更新图表
            this.$nextTick(() => {
              this.initTimeChart()
              this.initTypeChart()
              this.initTypeRankChart()
            })

            this.$message.success(response.message || '查询成功')
          }
        } catch (error) {
          console.error('查询故障汇总统计失败:', error)
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
        timeStatistics: [],
        typeStatistics: [],
        equipmentStatistics: []
      }
      if (this.timeChartInstance) {
        this.timeChartInstance.clear()
      }
      if (this.typeChartInstance) {
        this.typeChartInstance.clear()
      }
      if (this.typeRankChartInstance) {
        this.typeRankChartInstance.clear()
      }
    },

    /**
     * 初始化时间趋势图表
     */
    initTimeChart() {
      if (!this.$refs.timeChartContainer || !this.statisticsData.timeStatistics.length) {
        return
      }

      // 销毁已存在的图表实例
      if (this.timeChartInstance) {
        this.timeChartInstance.dispose()
      }

      // 创建新的图表实例
      this.timeChartInstance = echarts.init(this.$refs.timeChartContainer)

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            let html = `<div style="font-weight: 600; margin-bottom: 8px;">${this.formatPeriod(params[0].axisValue)}</div>`
            let total = 0
            params.forEach(param => {
              total += param.value
              html += `
                <div style="display: flex; align-items: center; margin-bottom: 4px;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
                  <span style="flex: 1;">${param.seriesName}:</span>
                  <span style="font-weight: 600; margin-left: 12px;">${param.value}</span>
                </div>
              `
            })
            html += `<div style="border-top: 1px solid #e4e7ed; margin-top: 8px; padding-top: 8px; font-weight: 600;">总计: ${total}</div>`
            return html
          }
        },
        legend: {
          data: ['I级-严重', 'II级-重大', 'III级-一般', 'IV级-轻微'],
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
          data: this.statisticsData.timeStatistics.map(item => item.period),
          axisLabel: {
            formatter: (value) => this.formatPeriodShort(value)
          }
        },
        yAxis: {
          type: 'value',
          name: '故障数量',
          min: 0,
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [
          {
            name: 'I级-严重',
            type: 'bar',
            stack: 'total',
            data: this.statisticsData.timeStatistics.map(item => item.severeCounts || 0),
            itemStyle: {
              color: FAILURE_LEVEL_COLORS['I级-严重']
            }
          },
          {
            name: 'II级-重大',
            type: 'bar',
            stack: 'total',
            data: this.statisticsData.timeStatistics.map(item => item.majorCounts || 0),
            itemStyle: {
              color: FAILURE_LEVEL_COLORS['II级-重大']
            }
          },
          {
            name: 'III级-一般',
            type: 'bar',
            stack: 'total',
            data: this.statisticsData.timeStatistics.map(item => item.normalCounts || 0),
            itemStyle: {
              color: FAILURE_LEVEL_COLORS['III级-一般']
            }
          },
          {
            name: 'IV级-轻微',
            type: 'bar',
            stack: 'total',
            data: this.statisticsData.timeStatistics.map(item => item.minorCounts || 0),
            itemStyle: {
              color: FAILURE_LEVEL_COLORS['IV级-轻微']
            }
          }
        ]
      }

      this.timeChartInstance.setOption(option)

      // 自适应窗口大小
      window.addEventListener('resize', this.handleChartResize)
    },

    /**
     * 初始化故障类型分布图表
     */
    initTypeChart() {
      if (!this.$refs.typeChartContainer || !this.statisticsData.typeStatistics.length) {
        return
      }

      // 销毁已存在的图表实例
      if (this.typeChartInstance) {
        this.typeChartInstance.dispose()
      }

      // 创建新的图表实例
      this.typeChartInstance = echarts.init(this.$refs.typeChartContainer)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: this.statisticsData.typeStatistics.map(item => item.failureType)
        },
        series: [
          {
            name: '故障类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: true,
              formatter: '{b}: {c}\n({d}%)'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: true
            },
            data: this.statisticsData.typeStatistics.map(item => ({
              value: item.failureCount,
              name: item.failureType,
              itemStyle: {
                color: FAILURE_TYPE_COLORS[item.failureType] || '#909399'
              }
            }))
          }
        ]
      }

      this.typeChartInstance.setOption(option)
    },

    /**
     * 处理图表窗口大小变化
     */
    handleChartResize() {
      if (this.timeChartInstance) {
        this.timeChartInstance.resize()
      }
      if (this.typeChartInstance) {
        this.typeChartInstance.resize()
      }
      if (this.typeRankChartInstance) {
        this.typeRankChartInstance.resize()
      }
    },

    /**
     * 格式化时间段显示
     */
    formatPeriod(period) {
      if (!period) return ''
      const date = new Date(period)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      const timePeriod = this.statisticsData.summary?.timePeriod || this.queryParams.timePeriod

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

      const timePeriod = this.statisticsData.summary?.timePeriod || this.queryParams.timePeriod

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
     * 获取严重故障类型标签
     */
    getSevereFailureType() {
      if (!this.statisticsData.summary) return 'info'
      const { severeFailures, totalFailures } = this.statisticsData.summary
      const rate = totalFailures > 0 ? (severeFailures / totalFailures) * 100 : 0
      if (rate > 20) return 'danger'
      if (rate > 10) return 'warning'
      return 'success'
    },

    /**
     * 获取故障等级标签类型
     */
    getLevelTagType(level) {
      const typeMap = {
        'I级-严重': 'danger',
        'II级-重大': 'warning',
        'III级-一般': 'info',
        'IV级-轻微': 'success'
      }
      return typeMap[level] || 'info'
    },

    /**
     * 获取排名标签类型
     */
    getRankType(index) {
      if (index === 0) return 'danger'
      if (index === 1) return 'warning'
      if (index === 2) return 'success'
      return 'info'
    },

    /**
     * 获取MTTR标签类型
     */
    getMTTRType(mttr) {
      if (mttr <= 8) return 'success'
      if (mttr <= 24) return 'warning'
      return 'danger'
    },

    /**
     * 初始化故障类型排名图表
     */
    initTypeRankChart() {
      if (!this.$refs.typeRankChartContainer || !this.statisticsData.typeStatistics.length) {
        return
      }

      // 销毁已存在的图表实例
      if (this.typeRankChartInstance) {
        this.typeRankChartInstance.dispose()
      }

      // 创建新的图表实例
      this.typeRankChartInstance = echarts.init(this.$refs.typeRankChartContainer)

      // 准备数据
      const types = this.statisticsData.typeStatistics.map(item => item.failureType)
      const counts = this.statisticsData.typeStatistics.map(item => item.failureCount)
      const colors = this.statisticsData.typeStatistics.map(item => FAILURE_TYPE_COLORS[item.failureType] || '#909399')

      // 根据方向决定配置
      const isHorizontal = this.typeRankChartOrientation === 'horizontal'

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const param = params[0]
            return `
              <div style="font-weight: 600; margin-bottom: 8px;">${param.name}</div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color}; margin-right: 8px;"></span>
                <span style="flex: 1;">故障数量:</span>
                <span style="font-weight: 600; margin-left: 12px;">${param.value}</span>
              </div>
            `
          }
        },
        grid: {
          left: isHorizontal ? '15%' : '3%',
          right: '4%',
          bottom: isHorizontal ? '3%' : '10%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: isHorizontal ? 'value' : 'category',
          name: isHorizontal ? '故障数量' : '',
          data: isHorizontal ? null : types,
          axisLabel: {
            interval: 0,
            rotate: isHorizontal ? 0 : 45
          }
        },
        yAxis: {
          type: isHorizontal ? 'category' : 'value',
          name: isHorizontal ? '' : '故障数量',
          data: isHorizontal ? types : null,
          axisLabel: {
            interval: 0
          }
        },
        series: [
          {
            name: '故障数量',
            type: 'bar',
            data: counts.map((value, index) => ({
              value,
              itemStyle: {
                color: colors[index]
              }
            })),
            barWidth: isHorizontal ? '60%' : '50%',
            label: {
              show: true,
              position: isHorizontal ? 'right' : 'top',
              formatter: '{c}',
              fontSize: 12
            },
            emphasis: {
              focus: 'series',
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }

      this.typeRankChartInstance.setOption(option)
    },

    /**
     * 处理方向切换
     */
    handleOrientationChange() {
      this.initTypeRankChart()
    }
  }
}
</script>

<style lang="scss" scoped>
.failure-summary-container {
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
          background: linear-gradient(135deg, #ffebee 0%, #fff 100%);
          border: 1px solid #f56c6c;
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

            &.severe {
              color: #f56c6c;
            }
          }
        }
      }
    }
  }

  .level-stats-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 24px;
    }

    .level-stats-header {
      margin-bottom: 20px;

      .level-stats-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .level-stats-content {
      .level-stat-item {
        padding: 16px;
        background-color: #fafafa;
        border-radius: 8px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .level-stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .level-name {
            font-size: 14px;
            color: #606266;
            font-weight: 500;
          }
        }

        .level-stat-value {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .level-stat-progress {
          ::v-deep .el-progress__text {
            display: none;
          }
        }
      }
    }
  }

  .chart-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 24px;
    }

    .chart-header {
      margin-bottom: 20px;

      .chart-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }

    .chart-container {
      .time-trend-chart {
        width: 100%;
        height: 400px;
      }

      .type-distribution-chart {
        width: 100%;
        height: 400px;
      }

      .type-rank-chart {
        width: 100%;
        height: 400px;
      }
    }
  }

  .equipment-card {
    ::v-deep .el-card__body {
      padding: 24px;
    }

    .equipment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .equipment-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}

// 响应式布局
@media screen and (max-width: 768px) {
  .failure-summary-container {
    .summary-content,
    .level-stats-content {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .chart-container {
      .time-trend-chart,
      .type-distribution-chart,
      .type-rank-chart {
        height: 300px;
      }
    }
  }
}
</style>

