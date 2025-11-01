<!--
  文件名称：WorkloadTable.vue
  文件描述：分组工作量统计表格组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->

<template>
  <el-card class="workload-table-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">
        <i class="el-icon-s-data" />
        分组工作量统计
      </span>
      <div class="header-actions">
        <el-radio-group v-model="sortField" size="small" @change="handleSortChange">
          <el-radio-button label="totalTasks">总任务数</el-radio-button>
          <el-radio-button label="totalWorkHours">总工时</el-radio-button>
          <el-radio-button label="completionRate">完成率</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-table
      :data="sortedWorkloadData"
      stripe
      border
      :default-sort="{ prop: sortField, order: 'descending' }"
      style="width: 100%"
      @sort-change="handleTableSort"
    >
      <!-- 维护人员分组 -->
      <template v-if="groupBy === 'assignee'">
        <el-table-column
          prop="assigneeName"
          label="维护人员"
          min-width="120"
          fixed
        >
          <template slot-scope="scope">
            <div class="name-cell">
              <el-avatar :size="32" style="margin-right: 8px;">
                {{ scope.row.assigneeName ? scope.row.assigneeName.charAt(0) : '?' }}
              </el-avatar>
              <span>{{ scope.row.assigneeName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
      </template>

      <!-- 设备类型分组 -->
      <template v-else-if="groupBy === 'equipmentType'">
        <el-table-column
          prop="equipmentType"
          label="设备类型"
          min-width="120"
          fixed
        >
          <template slot-scope="scope">
            <el-tag :type="getEquipmentTypeTag(scope.row.equipmentType)">
              {{ scope.row.equipmentType || '-' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>

      <!-- 维护类型分组 -->
      <template v-else-if="groupBy === 'maintenanceType'">
        <el-table-column
          prop="maintenanceType"
          label="维护类型"
          min-width="140"
          fixed
        >
          <template slot-scope="scope">
            <el-tag :type="getMaintenanceTypeTag(scope.row.maintenanceType)">
              {{ scope.row.maintenanceType || '-' }}
            </el-tag>
          </template>
        </el-table-column>
      </template>

      <!-- 统计数据列 -->
      <el-table-column
        prop="totalTasks"
        label="总任务数"
        width="120"
        sortable="custom"
        align="center"
      >
        <template slot-scope="scope">
          <div class="data-cell">
            <span class="data-value">{{ scope.row.totalTasks }}</span>
            <span class="data-unit">个</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="completedTasks"
        label="已完成"
        width="100"
        sortable="custom"
        align="center"
      >
        <template slot-scope="scope">
          <div class="data-cell">
            <span class="data-value success">{{ scope.row.completedTasks }}</span>
            <span class="data-unit">个</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="totalWorkHours"
        label="总工时"
        width="120"
        sortable="custom"
        align="center"
      >
        <template slot-scope="scope">
          <div class="data-cell">
            <span class="data-value warning">{{ scope.row.totalWorkHours }}</span>
            <span class="data-unit">小时</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="avgWorkHours"
        label="平均工时"
        width="120"
        sortable="custom"
        align="center"
      >
        <template slot-scope="scope">
          <div class="data-cell">
            <span class="data-value">{{ scope.row.avgWorkHours }}</span>
            <span class="data-unit">小时/任务</span>
          </div>
          <div>
            <el-tag
              :type="getAvgWorkHoursType(parseFloat(scope.row.avgWorkHours))"
              size="mini"
            >
              {{ getAvgWorkHoursLabel(parseFloat(scope.row.avgWorkHours)) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="completionRate"
        label="完成率"
        width="140"
        sortable="custom"
        align="center"
      >
        <template slot-scope="scope">
          <div class="progress-cell">
            <el-progress
              :percentage="parseFloat(scope.row.completionRate)"
              :color="getCompletionRateColor(parseFloat(scope.row.completionRate))"
              :stroke-width="18"
              :text-inside="true"
            />
          </div>
          <div style="margin-top: 4px;">
            <el-tag
              :type="getCompletionRateType(parseFloat(scope.row.completionRate))"
              size="mini"
            >
              {{ getCompletionRateLabel(parseFloat(scope.row.completionRate)) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="工作量评估"
        width="120"
        align="center"
        v-if="groupBy === 'assignee' && showBalanceAnalysis"
      >
        <template slot-scope="scope">
          <el-tag
            :type="getWorkloadLevelType(scope.row)"
            size="small"
          >
            {{ getWorkloadLevelLabel(scope.row) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div v-if="!workloadData || workloadData.length === 0" class="empty-state">
      <i class="el-icon-warning-outline" />
      <p>暂无工作量数据</p>
    </div>
  </el-card>
</template>

<script>
import {
  AVG_WORK_HOURS_STANDARDS,
  COMPLETION_RATE_STANDARDS,
  WORKLOAD_LEVEL_STANDARDS
} from '../constants/maintenance-workload'

export default {
  name: 'WorkloadTable',
  props: {
    workloadData: {
      type: Array,
      default: () => []
    },
    groupBy: {
      type: String,
      default: 'assignee'
    },
    showBalanceAnalysis: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sortField: 'totalWorkHours',
      sortOrder: 'descending'
    }
  },
  computed: {
    sortedWorkloadData() {
      if (!this.workloadData || this.workloadData.length === 0) {
        return []
      }

      const data = [...this.workloadData]
      const field = this.sortField
      const order = this.sortOrder === 'ascending' ? 1 : -1

      return data.sort((a, b) => {
        const valueA = this.getSortValue(a[field])
        const valueB = this.getSortValue(b[field])
        return (valueA - valueB) * order
      })
    }
  },
  methods: {
    getSortValue(value) {
      if (typeof value === 'number') return value
      if (typeof value === 'string') return parseFloat(value) || 0
      return 0
    },
    handleSortChange(value) {
      this.sortField = value
    },
    handleTableSort({ prop, order }) {
      this.sortField = prop
      this.sortOrder = order || 'descending'
    },
    getEquipmentTypeTag(type) {
      const tagMap = {
        '退火炉': 'danger',
        '行车': 'warning',
        '自动料车': 'success',
        '备料台': 'info'
      }
      return tagMap[type] || ''
    },
    getMaintenanceTypeTag(type) {
      const tagMap = {
        '预防性维护': 'success',
        '纠正性维护': 'warning',
        '改善性维护': 'primary',
        '预测性维护': 'info',
        '应急维护': 'danger'
      }
      return tagMap[type] || ''
    },
    getAvgWorkHoursLabel(hours) {
      if (hours <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.label
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return AVG_WORK_HOURS_STANDARDS.NORMAL.label
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return AVG_WORK_HOURS_STANDARDS.SLOW.label
      } else {
        return AVG_WORK_HOURS_STANDARDS.INEFFICIENT.label
      }
    },
    getAvgWorkHoursType(hours) {
      if (hours <= AVG_WORK_HOURS_STANDARDS.HIGH_EFFICIENT.max) {
        return 'success'
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.NORMAL.max) {
        return 'primary'
      } else if (hours <= AVG_WORK_HOURS_STANDARDS.SLOW.max) {
        return 'warning'
      } else {
        return 'danger'
      }
    },
    getCompletionRateLabel(rate) {
      if (rate >= COMPLETION_RATE_STANDARDS.EXCELLENT.min) {
        return COMPLETION_RATE_STANDARDS.EXCELLENT.label
      } else if (rate >= COMPLETION_RATE_STANDARDS.GOOD.min) {
        return COMPLETION_RATE_STANDARDS.GOOD.label
      } else {
        return COMPLETION_RATE_STANDARDS.NEED_IMPROVEMENT.label
      }
    },
    getCompletionRateType(rate) {
      if (rate >= COMPLETION_RATE_STANDARDS.EXCELLENT.min) {
        return 'success'
      } else if (rate >= COMPLETION_RATE_STANDARDS.GOOD.min) {
        return 'primary'
      } else {
        return 'danger'
      }
    },
    getCompletionRateColor(rate) {
      if (rate >= COMPLETION_RATE_STANDARDS.EXCELLENT.min) {
        return COMPLETION_RATE_STANDARDS.EXCELLENT.color
      } else if (rate >= COMPLETION_RATE_STANDARDS.GOOD.min) {
        return COMPLETION_RATE_STANDARDS.GOOD.color
      } else {
        return COMPLETION_RATE_STANDARDS.NEED_IMPROVEMENT.color
      }
    },
    getWorkloadLevelLabel(row) {
      const hours = parseFloat(row.totalWorkHours)
      if (hours >= WORKLOAD_LEVEL_STANDARDS.OVERLOAD.hours) {
        return WORKLOAD_LEVEL_STANDARDS.OVERLOAD.label
      } else if (hours >= WORKLOAD_LEVEL_STANDARDS.HIGH.hours) {
        return WORKLOAD_LEVEL_STANDARDS.HIGH.label
      } else if (hours >= WORKLOAD_LEVEL_STANDARDS.NORMAL.hours) {
        return WORKLOAD_LEVEL_STANDARDS.NORMAL.label
      } else if (hours >= WORKLOAD_LEVEL_STANDARDS.LOW.hours) {
        return WORKLOAD_LEVEL_STANDARDS.LOW.label
      } else {
        return WORKLOAD_LEVEL_STANDARDS.UNDERLOAD.label
      }
    },
    getWorkloadLevelType(row) {
      const hours = parseFloat(row.totalWorkHours)
      if (hours >= WORKLOAD_LEVEL_STANDARDS.OVERLOAD.hours) {
        return 'danger'
      } else if (hours >= WORKLOAD_LEVEL_STANDARDS.HIGH.hours) {
        return 'warning'
      } else if (hours >= WORKLOAD_LEVEL_STANDARDS.NORMAL.hours) {
        return 'success'
      } else if (hours >= WORKLOAD_LEVEL_STANDARDS.LOW.hours) {
        return 'primary'
      } else {
        return 'info'
      }
    }
  }
}
</script>

<style scoped lang="scss">
.workload-table-card {
  margin-bottom: 16px;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;

      i {
        margin-right: 8px;
        font-size: 18px;
        vertical-align: middle;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .name-cell {
    display: flex;
    align-items: center;
  }

  .data-cell {
    .data-value {
      font-size: 16px;
      font-weight: 600;
      margin-right: 4px;

      &.success {
        color: #67C23A;
      }

      &.warning {
        color: #E6A23C;
      }
    }

    .data-unit {
      font-size: 12px;
      color: #909399;
    }
  }

  .progress-cell {
    padding: 0 8px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #909399;

    i {
      font-size: 64px;
      margin-bottom: 16px;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }
}
</style>

