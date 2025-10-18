/**
 * 文件名称：TaskGenerateFromPlanDrawer.vue
 * 文件描述：基于生产计划批次生成退火任务的抽屉组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，实现基于计划批次生成任务功能（TASK004 P0 + P1.9）
 */

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="title"
    :loading="generating"
    :show-footer="false"
    width="920px"
    @close="handleClose"
  >
    <div class="task-generate-container">
      <!-- 步骤1：计划批次信息 -->
      <div class="section-card">
        <div class="section-header">
          <i class="el-icon-document" />
          <span>计划批次信息</span>
        </div>
        <div class="plan-info-grid">
          <div class="info-item">
            <span class="info-label">批次编号：</span>
            <span class="info-value">{{ planInfo.itemNumber || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">产品编码：</span>
            <span class="info-value">{{ planInfo.productCode || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">计划重量：</span>
            <span class="info-value highlight">{{ planInfo.plannedWeight || 0 }} 吨</span>
          </div>
          <div class="info-item">
            <span class="info-label">计划数量：</span>
            <span class="info-value">{{ planInfo.plannedQuantity || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 步骤2：生成参数设置 -->
      <div class="section-card">
        <div class="section-header">
          <i class="el-icon-setting" />
          <span>生成参数设置</span>
        </div>
        <el-form
          ref="paramForm"
          :model="params"
          label-width="120px"
          class="param-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="任务数量">
                <el-input-number
                  v-model="params.taskCount"
                  :min="1"
                  :max="50"
                  :step="1"
                  placeholder="留空则自动计算"
                  class="full-width"
                />
                <div class="field-hint">
                  <span class="info-hint">范围：1-50，留空则系统自动计算最优值</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="目标炉容量">
                <el-input-number
                  v-model="params.targetCapacity"
                  :min="35"
                  :max="42"
                  :precision="1"
                  :step="0.5"
                  placeholder="默认40吨"
                  class="full-width"
                />
                <span class="unit-text">吨</span>
                <div class="field-hint">
                  <span class="info-hint">范围：35-42吨，默认40吨</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="action-buttons">
          <el-button
            type="primary"
            icon="el-icon-view"
            :loading="previewing"
            @click="handlePreview"
          >
            预览装炉方案
          </el-button>
        </div>
      </div>

      <!-- 步骤3：预览结果 -->
      <div v-if="hasPreviewResult" class="section-card">
        <div class="section-header">
          <i class="el-icon-data-analysis" />
          <span>装炉方案预览</span>
          <el-tag v-if="previewResult.suggestedTaskCount" type="info" size="small" class="ml-2">
            系统建议：{{ previewResult.suggestedTaskCount }} 个任务
          </el-tag>
          <el-tag type="success" size="small" class="ml-2">
            最终任务数：{{ previewResult.finalTaskCount }} 个
          </el-tag>
        </div>

        <!-- 统计信息 -->
        <div class="summary-info">
          <div class="summary-item">
            <span class="summary-label">总重量：</span>
            <span class="summary-value">{{ previewResult.plannedWeight }} 吨</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">目标容量：</span>
            <span class="summary-value">{{ previewResult.targetCapacity }} 吨</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">炉容范围：</span>
            <span class="summary-value">
              {{ previewResult.capacityInfo.minCapacity }}-{{ previewResult.capacityInfo.maxCapacity }} 吨
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">范围内任务：</span>
            <span class="summary-value">
              <el-tag :type="allTasksInRange ? 'success' : 'warning'" size="mini">
                {{ tasksInRangeCount }}/{{ previewResult.finalTaskCount }}
              </el-tag>
            </span>
          </div>
        </div>

        <!-- P1.9 可视化图表：任务重量分布柱状图 -->
        <div v-if="showChart" class="chart-container">
          <div ref="weightChart" class="weight-chart" />
        </div>

        <!-- 任务预览表格 -->
        <div class="preview-table">
          <el-table
            :data="previewResult.taskPreview"
            border
            stripe
            :height="300"
            class="task-preview-table"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="taskName" label="任务名称" min-width="180">
              <template slot-scope="{ row }">
                <span class="task-name">{{ row.taskName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="plannedWeight" label="计划重量（吨）" width="140" align="right">
              <template slot-scope="{ row }">
                <span :class="{ 'weight-warning': !row.withinRange }">
                  {{ row.plannedWeight.toFixed(3) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="plannedQuantity" label="计划数量" width="110" align="right">
              <template slot-scope="{ row }">
                {{ row.plannedQuantity ? row.plannedQuantity.toFixed(0) : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="loadRate" label="装载率" width="120" align="center">
              <template slot-scope="{ row }">
                <el-progress
                  :percentage="Math.min(row.loadRate, 100)"
                  :color="getLoadRateColor(row.loadRate)"
                  :format="() => `${row.loadRate.toFixed(1)}%`"
                />
              </template>
            </el-table-column>
            <el-table-column prop="withinRange" label="炉容范围" width="120" align="center">
              <template slot-scope="{ row }">
                <el-tag
                  :type="row.withinRange ? 'success' : 'warning'"
                  size="small"
                  effect="plain"
                >
                  <i :class="row.withinRange ? 'el-icon-check' : 'el-icon-warning'" />
                  {{ row.withinRange ? '在范围内' : '超出范围' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons mt-3">
          <el-button
            icon="el-icon-refresh-left"
            @click="handleRePreview"
          >
            重新预览
          </el-button>
          <el-button
            type="success"
            icon="el-icon-check"
            :loading="generating"
            :disabled="!canGenerate"
            @click="handleGenerate"
          >
            确认生成任务
          </el-button>
        </div>
      </div>

      <!-- 生成结果展示 -->
      <div v-if="hasGenerateResult" class="section-card result-section">
        <div class="section-header">
          <i class="el-icon-success" />
          <span>生成结果</span>
        </div>
        <el-result
          icon="success"
          title="退火任务生成成功"
          :sub-title="`成功生成 ${generateResult.totalCount} 个退火任务`"
        >
          <template slot="extra">
            <div class="result-actions">
              <el-button
                type="primary"
                size="medium"
                icon="el-icon-document"
                @click="handleViewTaskList"
              >
                查看任务列表
              </el-button>
              <el-button
                size="medium"
                icon="el-icon-close"
                @click="handleClose"
              >
                关闭
              </el-button>
            </div>
          </template>
        </el-result>
        <div class="generated-tasks-summary">
          <div class="summary-title">生成的任务编号：</div>
          <div class="task-codes">
            <el-tag
              v-for="task in generateResult.tasks"
              :key="task.id"
              type="success"
              size="small"
              class="task-code-tag"
            >
              {{ task.taskCode }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import { simulateLoadingPlan, createAnnealingTask } from '../api'
import { FURNACE_CAPACITY, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants'
import * as echarts from 'echarts'

export default {
  name: 'TaskGenerateFromPlanDrawer',
  components: {
    BaseDrawer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    planItem: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 常量
      FURNACE_CAPACITY,

      // 抽屉状态
      drawerVisible: this.visible,
      previewing: false,
      generating: false,

      // 计划批次信息
      planInfo: {
        id: '',
        itemNumber: '',
        productCode: '',
        plannedWeight: 0,
        plannedQuantity: 0
      },

      // 生成参数
      params: {
        taskCount: null,
        targetCapacity: 40
      },

      // 预览结果
      previewResult: null,
      hasPreviewResult: false,

      // 生成结果
      generateResult: null,
      hasGenerateResult: false,

      // 图表实例
      chartInstance: null,
      showChart: true
    }
  },
  computed: {
    title() {
      return '基于计划批次生成退火任务'
    },
    // 所有任务是否都在炉容范围内
    allTasksInRange() {
      if (!this.hasPreviewResult || !this.previewResult.taskPreview) return false
      return this.previewResult.taskPreview.every(task => task.withinRange)
    },
    // 在范围内的任务数量
    tasksInRangeCount() {
      if (!this.hasPreviewResult || !this.previewResult.taskPreview) return 0
      return this.previewResult.taskPreview.filter(task => task.withinRange).length
    },
    // 是否可以生成任务
    canGenerate() {
      return this.hasPreviewResult && this.previewResult.taskPreview.length > 0
    }
  },
  watch: {
    visible(val) {
      this.drawerVisible = val
      if (val) {
        this.initDrawer()
      } else {
        this.resetDrawer()
      }
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    planItem: {
      handler(val) {
        if (val) {
          this.loadPlanInfo(val)
        }
      },
      immediate: true,
      deep: true
    }
  },
  beforeDestroy() {
    this.disposeChart()
  },
  methods: {
    // 初始化抽屉
    initDrawer() {
      this.resetPreview()
      this.resetGenerateResult()
      if (this.planItem) {
        this.loadPlanInfo(this.planItem)
      }
    },

    // 加载计划批次信息
    loadPlanInfo(planItem) {
      this.planInfo = {
        id: planItem.id || '',
        itemNumber: planItem.itemNumber || '',
        productCode: planItem.productCode || '',
        plannedWeight: planItem.plannedWeight || 0,
        plannedQuantity: planItem.plannedQuantity || 0
      }
    },

    // 预览装炉方案
    async handlePreview() {
      if (!this.planInfo.id) {
        this.$message.warning('请选择有效的计划批次')
        return
      }

      this.previewing = true
      try {
        // 构建请求参数
        const payload = {
          planItemId: this.planInfo.id
        }

        // 添加可选参数
        if (this.params.taskCount && this.params.taskCount > 0) {
          payload.taskCount = this.params.taskCount
        }
        if (this.params.targetCapacity) {
          payload.targetCapacity = this.params.targetCapacity
        }

        // 调用模拟接口
        const response = await simulateLoadingPlan(payload)

        // 保存预览结果
        this.previewResult = response.data
        this.hasPreviewResult = true

        // 渲染图表
        this.$nextTick(() => {
          this.renderChart()
        })

        this.$message.success('装炉方案预览成功')
      } catch (error) {
        console.error('预览装炉方案失败:', error)

        const errorCode = error.response?.data?.error?.code
        const errorMessage = error.response?.data?.error?.message

        if (errorCode === 'RESOURCE_NOT_FOUND') {
          this.$message.error(errorMessage || '计划批次不存在')
        } else if (errorCode === 'PARAM_ERROR') {
          this.$message.error(errorMessage || '参数错误，请检查输入')
        } else {
          this.$message.error(errorMessage || '预览装炉方案失败')
        }
      } finally {
        this.previewing = false
      }
    },

    // 重新预览
    handleRePreview() {
      this.resetPreview()
    },

    // 确认生成任务
    async handleGenerate() {
      if (!this.canGenerate) {
        this.$message.warning('请先预览装炉方案')
        return
      }

      // 如果有任务不在范围内，弹出确认提示
      if (!this.allTasksInRange) {
        try {
          await this.$confirm(
            `有 ${this.previewResult.finalTaskCount - this.tasksInRangeCount} 个任务的重量超出炉容范围（${FURNACE_CAPACITY.MIN}-${FURNACE_CAPACITY.MAX}吨），确定要生成吗？`,
            '确认生成',
            {
              confirmButtonText: '确定生成',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
        } catch {
          return
        }
      }

      this.generating = true
      try {
        // 构建请求参数
        const payload = {
          planItemId: this.planInfo.id
        }

        // 添加可选参数
        if (this.params.taskCount && this.params.taskCount > 0) {
          payload.taskCount = this.params.taskCount
        }
        if (this.params.targetCapacity) {
          payload.targetCapacity = this.params.targetCapacity
        }

        // 调用创建接口
        const response = await createAnnealingTask(payload)

        // 保存生成结果
        this.generateResult = response.data
        this.hasGenerateResult = true

        // 使用后端返回的消息
        const successMessage = response.message || SUCCESS_MESSAGES.CREATE
        this.$message.success(successMessage)

        // 通知父组件刷新列表
        this.$emit('success', response.data)
      } catch (error) {
        console.error('生成退火任务失败:', error)

        const errorCode = error.response?.data?.error?.code
        const errorMessage = error.response?.data?.error?.message

        if (errorCode === 'INVALID_STATUS') {
          this.$message.error(errorMessage || '计划批次状态不允许生成退火任务')
        } else if (errorCode === 'RESOURCE_NOT_FOUND') {
          this.$message.error(errorMessage || '计划批次不存在')
        } else if (errorCode === 'PARAM_ERROR') {
          this.$message.error(errorMessage || '参数错误，请检查输入')
        } else {
          this.$message.error(errorMessage || ERROR_MESSAGES.CREATE)
        }
      } finally {
        this.generating = false
      }
    },

    // 查看任务列表
    handleViewTaskList() {
      this.drawerVisible = false
      this.$emit('view-task-list')
    },

    // 关闭抽屉
    handleClose() {
      if (this.hasGenerateResult) {
        // 如果已经生成任务，直接关闭
        this.drawerVisible = false
        this.resetDrawer()
      } else if (this.hasPreviewResult) {
        // 如果已经预览但未生成，提示确认
        this.$confirm('确定要取消生成任务吗？预览结果将丢失。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.drawerVisible = false
          this.resetDrawer()
        }).catch(() => {
          // 取消操作，不关闭抽屉
        })
      } else {
        // 未预览，直接关闭
        this.drawerVisible = false
        this.resetDrawer()
      }
    },

    // 重置抽屉状态
    resetDrawer() {
      this.params = {
        taskCount: null,
        targetCapacity: 40
      }
      this.resetPreview()
      this.resetGenerateResult()
      this.disposeChart()
    },

    // 重置预览结果
    resetPreview() {
      this.previewResult = null
      this.hasPreviewResult = false
      this.disposeChart()
    },

    // 重置生成结果
    resetGenerateResult() {
      this.generateResult = null
      this.hasGenerateResult = false
    },

    // 获取装载率颜色
    getLoadRateColor(loadRate) {
      if (loadRate < 85) {
        return '#E6A23C' // 橙色：装载率偏低
      } else if (loadRate <= 105) {
        return '#67C23A' // 绿色：装载率理想
      } else {
        return '#F56C6C' // 红色：装载率超标
      }
    },

    // P1.9 渲染图表：任务重量分布柱状图
    renderChart() {
      if (!this.hasPreviewResult || !this.previewResult.taskPreview) {
        return
      }

      this.disposeChart()

      this.$nextTick(() => {
        const chartDom = this.$refs.weightChart
        if (!chartDom) return

        this.chartInstance = echarts.init(chartDom)

        const taskData = this.previewResult.taskPreview
        const xAxisData = taskData.map(task => task.taskName)
        const weightData = taskData.map(task => ({
          value: task.plannedWeight,
          itemStyle: {
            color: task.withinRange ? '#67C23A' : '#E6A23C'
          }
        }))

        const option = {
          title: {
            text: '任务重量分布',
            left: 'center',
            textStyle: {
              fontSize: 14,
              fontWeight: 'normal'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            },
            formatter: (params) => {
              const data = params[0]
              const task = taskData[data.dataIndex]
              return `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 8px;">${task.taskName}</div>
                  <div>计划重量：${task.plannedWeight.toFixed(3)} 吨</div>
                  <div>装载率：${task.loadRate.toFixed(1)}%</div>
                  <div>炉容范围：${task.withinRange ? '✓ 在范围内' : '✗ 超出范围'}</div>
                </div>
              `
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '15%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: xAxisData,
            axisLabel: {
              rotate: 45,
              interval: 0,
              fontSize: 11
            }
          },
          yAxis: {
            type: 'value',
            name: '重量（吨）',
            axisLabel: {
              formatter: '{value}'
            }
          },
          series: [
            {
              name: '计划重量',
              type: 'bar',
              data: weightData,
              barWidth: '60%',
              label: {
                show: true,
                position: 'top',
                formatter: (params) => {
                  return params.value.toFixed(1)
                },
                fontSize: 11
              },
              markLine: {
                silent: true,
                symbol: 'none',
                lineStyle: {
                  type: 'dashed'
                },
                data: [
                  {
                    name: '最小炉容',
                    yAxis: this.previewResult.capacityInfo.minCapacity,
                    lineStyle: { color: '#F56C6C' },
                    label: {
                      formatter: '最小炉容 {c}吨',
                      position: 'insideEndTop'
                    }
                  },
                  {
                    name: '目标炉容',
                    yAxis: this.previewResult.capacityInfo.targetCapacity,
                    lineStyle: { color: '#409EFF' },
                    label: {
                      formatter: '目标炉容 {c}吨',
                      position: 'insideEndTop'
                    }
                  },
                  {
                    name: '最大炉容',
                    yAxis: this.previewResult.capacityInfo.maxCapacity,
                    lineStyle: { color: '#F56C6C' },
                    label: {
                      formatter: '最大炉容 {c}吨',
                      position: 'insideEndTop'
                    }
                  }
                ]
              }
            }
          ]
        }

        this.chartInstance.setOption(option)

        // 响应式调整
        window.addEventListener('resize', this.handleChartResize)
      })
    },

    // 图表响应式调整
    handleChartResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    },

    // 销毁图表
    disposeChart() {
      if (this.chartInstance) {
        window.removeEventListener('resize', this.handleChartResize)
        this.chartInstance.dispose()
        this.chartInstance = null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.task-generate-container {
  padding: 0 8px;

  .section-card {
    background: #fff;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #EBEEF5;

      i {
        font-size: 18px;
        color: #409EFF;
      }

      .ml-2 {
        margin-left: 12px;
      }
    }

    // 计划批次信息网格
    .plan-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .info-item {
        display: flex;
        align-items: center;
        padding: 12px;
        background: #F5F7FA;
        border-radius: 6px;

        .info-label {
          font-size: 13px;
          color: #606266;
          min-width: 80px;
        }

        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #303133;

          &.highlight {
            color: #409EFF;
            font-weight: 600;
            font-size: 15px;
          }
        }
      }
    }

    // 参数表单
    .param-form {
      .full-width {
        width: 100%;
      }

      .unit-text {
        margin-left: 8px;
        color: #909399;
        font-size: 13px;
      }

      .field-hint {
        margin-top: 4px;
        font-size: 12px;

        .info-hint {
          color: #909399;
        }
      }
    }

    // 操作按钮
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-top: 16px;
    }

    // 统计信息
    .summary-info {
      display: flex;
      justify-content: space-around;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      margin-bottom: 20px;

      .summary-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;

        .summary-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
        }

        .summary-value {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }
      }
    }

    // 图表容器（P1.9）
    .chart-container {
      margin-bottom: 20px;
      padding: 16px;
      background: #FAFAFA;
      border-radius: 8px;

      .weight-chart {
        width: 100%;
        height: 300px;
      }
    }

    // 预览表格
    .preview-table {
      .task-name {
        font-weight: 500;
        color: #303133;
      }

      .weight-warning {
        color: #E6A23C;
        font-weight: 600;
      }
    }

    // 结果区域
    &.result-section {
      .result-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 16px;
      }

      .generated-tasks-summary {
        margin-top: 24px;
        padding: 16px;
        background: #F5F7FA;
        border-radius: 8px;

        .summary-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 12px;
        }

        .task-codes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .task-code-tag {
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }
        }
      }
    }
  }

  .mt-3 {
    margin-top: 16px;
  }
}

// 深度选择器样式
::v-deep .el-input-number {
  width: 100%;
}

::v-deep .el-progress__text {
  font-size: 12px !important;
}

::v-deep .el-table {
  font-size: 13px;

  .el-table__header th {
    background: #F5F7FA;
    font-weight: 600;
    color: #303133;
  }
}
</style>

