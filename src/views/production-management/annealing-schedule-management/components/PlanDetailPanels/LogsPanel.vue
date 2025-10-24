<template>
  <div class="logs-panel">
    <!-- 操作日志列表 -->
    <base-table
      :data="logs"
      :columns="tableColumns"
      :loading="loading"
      :pagination="false"
    >
      <!-- 操作类型列 -->
      <template #action="{ row }">
        <div class="action-cell">
          <i :class="getActionIcon(row.action)" class="action-icon" />
          <span>{{ getActionText(row.action) }}</span>
        </div>
      </template>

      <!-- 操作人列 -->
      <template #operatorName="{ row }">
        <div class="operator-info">
          <div class="operator-name">{{ row.operatorName }}</div>
          <div class="operator-role">{{ row.operatorRole }}</div>
        </div>
      </template>

      <!-- 变更描述列 -->
      <template #changeDescription="{ row }">
        <div class="change-description">
          {{ row.changeDescription }}
        </div>
      </template>

      <!-- 操作时间列 -->
      <template #operatedAt="{ row }">
        {{ formatDate(row.operatedAt) }}
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <el-button
          type="text"
          size="small"
          icon="el-icon-view"
          @click="handleViewDetail(row)"
        >
          查看详情
        </el-button>
      </template>
    </base-table>

    <!-- 空状态 -->
    <el-empty
      v-if="logs.length === 0"
      description="暂无操作日志"
      :image-size="120"
    />

    <!-- 日志详情对话框 -->
    <el-dialog
      :visible.sync="detailDialogVisible"
      title="操作日志详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedLog" class="log-detail">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作类型">
            <div class="action-cell">
              <i :class="getActionIcon(selectedLog.action)" class="action-icon" />
              <span>{{ getActionText(selectedLog.action) }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ formatDate(selectedLog.operatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ selectedLog.operatorName }}
          </el-descriptions-item>
          <el-descriptions-item label="操作人角色">
            {{ selectedLog.operatorRole }}
          </el-descriptions-item>
          <el-descriptions-item label="操作目标类型">
            {{ selectedLog.targetType }}
          </el-descriptions-item>
          <el-descriptions-item label="操作目标ID">
            {{ selectedLog.targetId }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 变更内容 -->
        <div v-if="selectedLog.oldValue || selectedLog.newValue" class="change-section">
          <h4 class="section-title">变更内容</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="value-block old-value">
                <div class="value-header">旧值</div>
                <pre class="value-content">{{ formatValue(selectedLog.oldValue) }}</pre>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="value-block new-value">
                <div class="value-header">新值</div>
                <pre class="value-content">{{ formatValue(selectedLog.newValue) }}</pre>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 变更描述 -->
        <div v-if="selectedLog.changeDescription" class="change-section">
          <h4 class="section-title">变更描述</h4>
          <div class="description-content">
            {{ selectedLog.changeDescription }}
          </div>
        </div>

        <!-- 备注信息 -->
        <div v-if="selectedLog.remarks" class="change-section">
          <h4 class="section-title">备注信息</h4>
          <div class="description-content">
            {{ selectedLog.remarks }}
          </div>
        </div>

        <!-- 操作上下文 -->
        <div v-if="selectedLog.operationContext" class="change-section">
          <h4 class="section-title">操作上下文</h4>
          <pre class="context-content">{{ formatValue(selectedLog.operationContext) }}</pre>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import BaseTable from '@/components/BaseTable'
import {
  LOGS_COLUMNS,
  LOG_ACTION_MAP,
  LOG_ICON_MAP
} from '../../constants'

export default {
  name: 'LogsPanel',
  components: {
    BaseTable
  },
  props: {
    logs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      detailDialogVisible: false,
      selectedLog: null
    }
  },
  computed: {
    tableColumns() {
      return LOGS_COLUMNS
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
     * 获取操作类型文本
     */
    getActionText(action) {
      return LOG_ACTION_MAP[action] || action
    },

    /**
     * 获取操作类型图标
     */
    getActionIcon(action) {
      return LOG_ICON_MAP[action] || 'el-icon-info'
    },

    /**
     * 格式化值
     */
    formatValue(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    },

    /**
     * 查看日志详情
     */
    handleViewDetail(log) {
      this.selectedLog = log
      this.detailDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.logs-panel {
  .action-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .action-icon {
      font-size: 16px;
      color: #409eff;
    }
  }

  .operator-info {
    .operator-name {
      font-weight: 500;
      color: #303133;
    }

    .operator-role {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }

  .change-description {
    line-height: 1.6;
    color: #606266;
  }

  .log-detail {
    .change-section {
      margin-top: 24px;

      .section-title {
        margin-bottom: 12px;
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .value-block {
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;

        .value-header {
          padding: 8px 12px;
          background: #f5f7fa;
          font-size: 13px;
          font-weight: 500;
          color: #606266;
        }

        .value-content {
          padding: 12px;
          margin: 0;
          max-height: 300px;
          overflow: auto;
          font-size: 12px;
          line-height: 1.6;
          color: #303133;
          background: #fff;
          white-space: pre-wrap;
          word-break: break-all;
        }

        &.old-value {
          .value-header {
            background: #fef0f0;
            color: #f56c6c;
          }
        }

        &.new-value {
          .value-header {
            background: #f0f9ff;
            color: #409eff;
          }
        }
      }

      .description-content {
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px;
        line-height: 1.6;
        color: #606266;
      }

      .context-content {
        padding: 12px;
        margin: 0;
        background: #f5f7fa;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        max-height: 300px;
        overflow: auto;
        font-size: 12px;
        line-height: 1.6;
        color: #303133;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }

  .dialog-footer {
    text-align: right;
  }
}
</style>

