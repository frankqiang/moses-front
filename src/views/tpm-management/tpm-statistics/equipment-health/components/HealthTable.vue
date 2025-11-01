<!--
 * 文件名称: HealthTable.vue
 * 文件描述: 设备健康度评分列表组件
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
-->
<template>
  <div class="health-table">
    <el-card shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title">设备健康度详情</span>
        <el-button
          type="text"
          icon="el-icon-question"
          @click="$emit('show-algorithm')"
        >
          评分算法说明
        </el-button>
      </div>

      <!-- 问题设备预警 -->
      <el-alert
        v-if="problemEquipmentCount > 0"
        :title="`检测到 ${problemEquipmentCount} 台设备健康度低于60分，需要重点关注！`"
        type="error"
        :closable="false"
        show-icon
        class="alert-warning"
      />

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :row-class-name="tableRowClassName"
      >
        <el-table-column
          prop="equipmentCode"
          label="设备编码"
          width="120"
          fixed
          sortable
        />

        <el-table-column
          prop="equipmentName"
          label="设备名称"
          width="150"
        />

        <el-table-column
          prop="equipmentType"
          label="设备类型"
          width="100"
        />

        <el-table-column
          prop="healthScore"
          label="健康度评分"
          width="120"
          sortable
        >
          <template slot-scope="{ row }">
            <el-progress
              :percentage="row.healthScore"
              :color="getScoreColor(row.healthScore)"
              :format="() => `${row.healthScore}分`"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="healthLevel"
          label="健康等级"
          width="120"
        >
          <template slot-scope="{ row }">
            <el-tag
              :type="getLevelType(row.healthLevel)"
              :color="getLevelColor(row.healthLevel)"
              effect="dark"
            >
              <i :class="getLevelIcon(row.healthLevel)" />
              {{ row.healthLevel }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="status"
          label="设备状态"
          width="100"
        >
          <template slot-scope="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="failureCount"
          label="故障次数"
          width="100"
          sortable
          align="center"
        >
          <template slot-scope="{ row }">
            <span :class="{'warning-text': row.failureCount >= 7}">
              {{ row.failureCount }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="maintenanceCompletionRate"
          label="维护完成率"
          width="120"
          align="center"
        >
          <template slot-scope="{ row }">
            <span :class="{'warning-text': row.maintenanceCompletionRate < 80}">
              {{ row.maintenanceCompletionRate }}%
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="avgMTTR"
          label="平均修复时间(h)"
          width="140"
          sortable
          align="center"
        >
          <template slot-scope="{ row }">
            <span :class="{'warning-text': row.avgMTTR > 24}">
              {{ row.avgMTTR }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="daysSinceLastMaintenance"
          label="距上次维护(天)"
          width="150"
          sortable
          align="center"
        >
          <template slot-scope="{ row }">
            <span :class="{'warning-text': row.daysSinceLastMaintenance > 180}">
              {{ row.daysSinceLastMaintenance }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          label="操作"
          width="120"
          fixed="right"
        >
          <template slot-scope="{ row }">
            <el-button
              type="text"
              size="small"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { HEALTH_LEVEL_CONFIG } from '../constants'

export default {
  name: 'HealthTable',
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    problemEquipmentCount() {
      return this.tableData.filter(item => item.healthScore < 60).length
    }
  },
  methods: {
    tableRowClassName({ row }) {
      if (row.healthScore < 60) {
        return 'problem-row'
      }
      return ''
    },
    getScoreColor(score) {
      if (score >= 90) return '#67C23A'
      if (score >= 75) return '#409EFF'
      if (score >= 60) return '#E6A23C'
      return '#F56C6C'
    },
    getLevelColor(level) {
      return HEALTH_LEVEL_CONFIG[level]?.color || '#909399'
    },
    getLevelIcon(level) {
      return HEALTH_LEVEL_CONFIG[level]?.icon || 'el-icon-info'
    },
    getLevelType(level) {
      const typeMap = {
        '优秀': 'success',
        '良好': 'info',
        '一般': 'warning',
        '差': 'danger'
      }
      return typeMap[level] || 'info'
    },
    getStatusType(status) {
      const typeMap = {
        '运行': 'success',
        '停机': 'info',
        '维护': 'warning',
        '故障': 'danger'
      }
      return typeMap[status] || 'info'
    },
    handleViewDetail(row) {
      this.$emit('view-detail', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.health-table {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .alert-warning {
    margin-bottom: 16px;
  }

  ::v-deep .problem-row {
    background: #fef0f0 !important;
  }

  .warning-text {
    color: #F56C6C;
    font-weight: 600;
  }

  ::v-deep .el-progress__text {
    font-size: 12px !important;
  }
}
</style>

