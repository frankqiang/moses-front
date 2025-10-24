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
            @change="handleFilter"
          >
            <el-option
              v-for="(text, key) in conflictTypeMap"
              :key="key"
              :label="text"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleResetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 冲突列表 -->
    <base-table
      :data="filteredConflicts"
      :columns="tableColumns"
      :loading="loading"
      :pagination="false"
    >
      <!-- 冲突类型列 -->
      <template #conflictType="{ row }">
        <el-tag type="warning" size="small">
          {{ conflictTypeMap[row.conflictType] || row.conflictType }}
        </el-tag>
      </template>

      <!-- 严重程度列 -->
      <template #severityLevel="{ row }">
        <el-tag
          :type="getSeverityType(row.severityLevel)"
          size="small"
        >
          {{ severityLevelMap[row.severityLevel] || row.severityLevel }}
        </el-tag>
      </template>

      <!-- 冲突描述列 -->
      <template #description="{ row }">
        <div class="description-text">{{ row.description }}</div>
      </template>

      <!-- 涉及任务列 -->
      <template #affectedTaskIds="{ row }">
        <div class="affected-tasks">
          <el-tag
            v-for="(taskId, index) in row.affectedTaskIds.slice(0, 3)"
            :key="taskId"
            type="info"
            size="mini"
            class="task-tag"
            @click="handleLocateTask(row.affectedTaskIds)"
          >
            任务{{ index + 1 }}
          </el-tag>
          <el-popover
            v-if="row.affectedTaskIds.length > 3"
            placement="top"
            width="300"
            trigger="hover"
          >
            <div class="task-list">
              <el-tag
                v-for="(taskId, index) in row.affectedTaskIds"
                :key="taskId"
                type="info"
                size="mini"
                class="task-tag"
              >
                任务{{ index + 1 }}
              </el-tag>
            </div>
            <el-tag
              slot="reference"
              type="info"
              size="mini"
              class="task-tag"
            >
              +{{ row.affectedTaskIds.length - 3 }}
            </el-tag>
          </el-popover>
        </div>
      </template>

      <!-- 解决建议列 -->
      <template #suggestion="{ row }">
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
            <div class="suggestion-text">{{ row.suggestion }}</div>
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
      <template #detectedAt="{ row }">
        {{ formatDate(row.detectedAt) }}
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
} from '../../constants'

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
        conflictType: ''
      },
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
        critical: this.conflicts.filter(c => c.severityLevel === 'critical').length,
        high: this.conflicts.filter(c => c.severityLevel === 'high').length,
        medium: this.conflicts.filter(c => c.severityLevel === 'medium').length,
        low: this.conflicts.filter(c => c.severityLevel === 'low').length
      }
    },
    filteredConflicts() {
      let result = [...this.conflicts]

      // 筛选
      if (this.filterForm.severityLevel) {
        result = result.filter(c => c.severityLevel === this.filterForm.severityLevel)
      }
      if (this.filterForm.conflictType) {
        result = result.filter(c => c.conflictType === this.filterForm.conflictType)
      }

      // 按严重程度和检测时间排序
      result.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const aSeverity = severityOrder[a.severityLevel] || 0
        const bSeverity = severityOrder[b.severityLevel] || 0

        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity
        }

        return new Date(b.detectedAt) - new Date(a.detectedAt)
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
        conflictType: ''
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
    margin-bottom: 16px;
    padding: 16px;
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

  .affected-tasks {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .task-tag {
      cursor: pointer;
      transition: all 0.3s;

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

