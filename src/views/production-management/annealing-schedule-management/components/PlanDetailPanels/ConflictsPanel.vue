<!--
  文件名称：ConflictsPanel.vue
  文件描述：排程冲突列表面板，展示排程方案中检测到的所有冲突
  修改记录：
    - 2025-10-28: 重构以适配后端接口更新，优先使用后端返回的 label 字段
-->

<template>
  <div class="conflicts-panel">
    <!-- 冲突统计 -->
    <el-alert
      v-if="conflictStats"
      :title="`共检测到 ${conflicts.length} 个冲突`"
      type="warning"
      :closable="false"
      show-icon
      class="conflict-stats"
    >
      <template #default>
        <div class="stats-content">
          <span class="stat-item critical">
            <i class="el-icon-error" />
            致命冲突：{{ conflictStats.critical }}
          </span>
          <span class="stat-item high">
            <i class="el-icon-warning" />
            高级冲突：{{ conflictStats.high }}
          </span>
          <span class="stat-item medium">
            <i class="el-icon-info" />
            中级冲突：{{ conflictStats.medium }}
          </span>
          <span class="stat-item low">
            <i class="el-icon-success" />
            低级冲突：{{ conflictStats.low }}
          </span>
        </div>
      </template>
    </el-alert>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <el-form :inline="true" :model="filterForm" size="small">
        <el-form-item label="严重程度">
          <el-select
            v-model="filterForm.severityLevel"
            placeholder="全部"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="致命" value="critical" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="冲突类型">
          <el-select
            v-model="filterForm.conflictType"
            placeholder="全部"
            clearable
            style="width: 160px"
            @change="handleFilter"
          >
            <el-option label="时间冲突" value="time-conflict" />
            <el-option label="容量超限" value="capacity-exceeded" />
            <el-option label="工艺不兼容" value="process-incompatible" />
            <el-option label="物料未就绪" value="material-not-ready" />
            <el-option label="维护冲突" value="maintenance-conflict" />
            <el-option label="设备状态异常" value="equipment-abnormal" />
            <el-option label="交期风险" value="deadline-risk" />
            <el-option label="能耗过高" value="high-energy-consumption" />
          </el-select>
        </el-form-item>
        <el-form-item label="解决状态">
          <el-select
            v-model="filterForm.isResolved"
            placeholder="全部"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="已解决" :value="true" />
            <el-option label="未解决" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-left" @click="handleResetFilter">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 冲突列表 -->
    <base-table
      :data="filteredConflicts"
      :columns="tableColumns"
      :loading="loading"
      :pagination="null"
    >
      <!-- 冲突类型列 -->
      <template #conflictType="{ row }">
        <el-tag type="warning" size="small">
          {{ row.typeLabel || conflictTypeMap[row.type || row.conflictType] || row.type || row.conflictType }}
        </el-tag>
      </template>

      <!-- 严重程度列 -->
      <template #severity="{ row }">
        <el-tag
          :type="getSeverityType(row.severity)"
          size="small"
        >
          {{ row.severityLabel || severityLevelMap[row.severity] || row.severity }}
        </el-tag>
      </template>

      <!-- 冲突描述列 -->
      <template #conflictDescription="{ row }">
        <div class="description-text">{{ row.conflictDescription }}</div>
      </template>

      <!-- 炉号列 -->
      <template #furnaceCode="{ row }">
        <span v-if="row.furnaceCode" class="furnace-code">
          {{ row.furnaceCode }}
        </span>
        <span v-else class="no-furnace">-</span>
      </template>

      <!-- 涉及任务列 -->
      <template #involvedTaskCodes="{ row }">
        <div class="affected-tasks">
          <el-tag
            v-for="(taskCode, index) in (row.involvedTaskCodes || []).slice(0, 2)"
            :key="index"
            type="info"
            size="mini"
            class="task-tag"
            @click="handleLocateTask(row.involvedTaskIds)"
          >
            {{ taskCode }}
          </el-tag>
          <el-popover
            v-if="(row.involvedTaskCodes || []).length > 2"
            placement="top"
            width="400"
            trigger="hover"
          >
            <div class="task-list">
              <el-tag
                v-for="(taskCode, index) in row.involvedTaskCodes"
                :key="index"
                type="info"
                size="mini"
                class="task-tag"
                @click="handleLocateTask(row.involvedTaskIds)"
              >
                {{ taskCode }}
              </el-tag>
            </div>
            <el-tag
              slot="reference"
              type="info"
              size="mini"
              class="task-tag"
            >
              +{{ row.involvedTaskCodes.length - 2 }}
            </el-tag>
          </el-popover>
        </div>
      </template>

      <!-- 状态列 -->
      <template #isResolved="{ row }">
        <el-tag
          :type="row.isResolved ? 'success' : 'warning'"
          size="small"
        >
          {{ row.isResolved ? '已解决' : '未解决' }}
        </el-tag>
      </template>

      <!-- 解决建议列 -->
      <template #resolutionSuggestion="{ row }">
        <el-popover
          placement="top"
          width="400"
          trigger="hover"
        >
          <div class="suggestion-content">
            <div class="suggestion-title">
              <i class="el-icon-info" />
              解决建议
            </div>
            <div class="suggestion-text">{{ row.resolutionSuggestion }}</div>
          </div>
          <el-button
            slot="reference"
            type="text"
            size="small"
            icon="el-icon-view"
          >
            查看建议
          </el-button>
        </el-popover>
      </template>

      <!-- 检测时间列 -->
      <template #createdAt="{ row }">
        {{ formatDate(row.createdAt) }}
      </template>
    </base-table>

    <!-- 空状态 -->
    <el-empty
      v-if="conflicts.length === 0"
      description="暂无冲突记录"
      :image-size="120"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import BaseTable from '@/components/BaseTable'
import {
  CONFLICTS_COLUMNS,
  CONFLICT_TYPE_MAP,
  SEVERITY_LEVEL_MAP,
  SEVERITY_TYPE_MAP
} from '../../constants/detail-config'

export default {
  name: 'ConflictsPanel',
  components: {
    BaseTable
  },
  props: {
    planId: {
      type: String,
      required: true
    },
    conflicts: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      filterForm: {
        severityLevel: '',
        conflictType: '',
        isResolved: null // null表示全部，true表示已解决，false表示未解决
      },
      // ✅ 备用映射：优先使用后端返回的 typeLabel 和 severityLabel
      // 这些映射仅在后端未返回 label 时作为备用
      conflictTypeMap: CONFLICT_TYPE_MAP,
      severityLevelMap: SEVERITY_LEVEL_MAP
    }
  },
  computed: {
    tableColumns() {
      return CONFLICTS_COLUMNS
    },
    conflictStats() {
      if (this.conflicts.length === 0) return null

      return {
        critical: this.conflicts.filter(c => c.severity === 'critical').length,
        high: this.conflicts.filter(c => c.severity === 'high').length,
        medium: this.conflicts.filter(c => c.severity === 'medium').length,
        low: this.conflicts.filter(c => c.severity === 'low').length
      }
    },
    filteredConflicts() {
      let result = [...this.conflicts]

      // 筛选
      if (this.filterForm.severityLevel) {
        result = result.filter(c => c.severity === this.filterForm.severityLevel)
      }
      if (this.filterForm.conflictType) {
        result = result.filter(c => c.conflictType === this.filterForm.conflictType)
      }
      if (this.filterForm.isResolved !== null && this.filterForm.isResolved !== '') {
        result = result.filter(c => c.isResolved === this.filterForm.isResolved)
      }

      // 排序：未解决优先，然后按严重程度，最后按检测时间
      result.sort((a, b) => {
        // 1. 未解决的排在前面
        if (a.isResolved !== b.isResolved) {
          return a.isResolved ? 1 : -1
        }

        // 2. 按严重程度排序
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const aSeverity = severityOrder[a.severity] || 0
        const bSeverity = severityOrder[b.severity] || 0

        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity
        }

        // 3. 按检测时间排序（最新的在前）
        return new Date(b.createdAt) - new Date(a.createdAt)
      })

      return result
    }
  },
  methods: {
    /**
     * 格式化日期
     */
    formatDate(date) {
      if (!date) return '-'
      return parseTime(date, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 获取严重程度类型
     * 用于 el-tag 的 type 属性，控制颜色
     * ✅ 后端已返回 severityLabel，此方法用于控制标签颜色
     */
    getSeverityType(severity) {
      return SEVERITY_TYPE_MAP[severity] || 'info'
    },

    /**
     * 处理筛选
     */
    handleFilter() {
      // 筛选逻辑在computed中处理
    },

    /**
     * 重置筛选
     */
    handleResetFilter() {
      this.filterForm = {
        severityLevel: '',
        conflictType: '',
        isResolved: null
      }
    },

    /**
     * 定位到任务
     */
    handleLocateTask(taskIds) {
      this.$emit('locate-task', taskIds)
    }
  }
}
</script>

<style lang="scss" scoped>
.conflicts-panel {
  .conflict-stats {
    margin-bottom: 20px;

    .stats-content {
      display: flex;
      gap: 24px;
      margin-top: 8px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 500;

        i {
          font-size: 16px;
        }

        &.critical {
          color: #f56c6c;
        }

        &.high {
          color: #e6a23c;
        }

        &.medium {
          color: #409eff;
        }

        &.low {
          color: #909399;
        }
      }
    }
  }

  .filter-toolbar {
    padding: 16px 16px 0px 16px;
    background: #f5f7fa;
    border-radius: 4px;

    .el-form {
      margin-bottom: 0;
    }
  }

  .description-text {
    line-height: 1.6;
    color: #606266;
  }

  .furnace-code {
    font-weight: 500;
    color: #409eff;
  }

  .no-furnace {
    color: #c0c4cc;
  }

  .affected-tasks {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .task-tag {
      cursor: pointer;
      transition: all 0.3s;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        opacity: 0.8;
        transform: translateY(-1px);
      }
    }
  }

  .task-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .suggestion-content {
    .suggestion-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #303133;

      i {
        color: #409eff;
        font-size: 16px;
      }
    }

    .suggestion-text {
      line-height: 1.8;
      color: #606266;
      white-space: pre-wrap;
    }
  }
}
</style>

