/**
 * 文件名称：ChangeLogsTimeline.vue
 * 文件描述：生产计划变更日志时间线组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

<template>
  <div class="change-logs-timeline">
    <el-timeline v-if="changeLogs && changeLogs.length > 0">
      <el-timeline-item
        v-for="log in changeLogs"
        :key="log.id"
        :timestamp="formatTime(log.createdAt)"
        placement="top"
        :color="getChangeTypeColor(log.changeType)"
      >
        <el-card class="log-card">
          <div class="log-header">
            <el-tag :type="getChangeTypeTagType(log.changeType)" size="small">
              {{ getChangeTypeText(log.changeType) }}
            </el-tag>
            <span class="operator-info">
              操作人：{{ log.operatorName || '-' }}
            </span>
            <span class="operation-source">
              来源：{{ getOperationSourceText(log.operationSource) }}
            </span>
          </div>

          <div class="log-description">
            {{ log.changeDescription || '无描述' }}
          </div>

          <div v-if="log.originalValue || log.newValue" class="log-changes">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="change-label">变更前：</div>
                <div class="change-value">
                  <pre>{{ formatValue(log.originalValue) }}</pre>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="change-label">变更后：</div>
                <div class="change-value changed">
                  <pre>{{ formatValue(log.newValue) }}</pre>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="log-meta">
            <span v-if="log.operatorIp" class="meta-item">
              <i class="el-icon-location-outline" />
              IP: {{ log.operatorIp }}
            </span>
            <span v-if="log.requestId" class="meta-item">
              <i class="el-icon-document" />
              请求ID: {{ log.requestId }}
            </span>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无变更日志"
      :image-size="100"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'ChangeLogsTimeline',
  props: {
    changeLogs: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 变更类型映射
      changeTypeMap: {
        SPLIT: '拆分',
        MERGE: '合并',
        ADJUST: '调整',
        STATUS_UPDATE: '状态变更',
        PROGRESS_SYNC: '进度同步',
        CREATE: '创建',
        UPDATE: '更新',
        DELETE: '删除'
      },
      changeTypeColorMap: {
        SPLIT: '#409EFF',
        MERGE: '#67C23A',
        ADJUST: '#E6A23C',
        STATUS_UPDATE: '#909399',
        PROGRESS_SYNC: '#409EFF',
        CREATE: '#67C23A',
        UPDATE: '#E6A23C',
        DELETE: '#F56C6C'
      },
      changeTypeTagTypeMap: {
        SPLIT: 'primary',
        MERGE: 'success',
        ADJUST: 'warning',
        STATUS_UPDATE: 'info',
        PROGRESS_SYNC: 'primary',
        CREATE: 'success',
        UPDATE: 'warning',
        DELETE: 'danger'
      },
      // 操作来源映射
      operationSourceMap: {
        ERP_SYNC: 'ERP同步',
        MANUAL: '手动操作',
        SYSTEM: '系统自动'
      }
    }
  },
  methods: {
    /**
     * 格式化时间
     */
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
    },

    /**
     * 获取变更类型文本
     */
    getChangeTypeText(changeType) {
      return this.changeTypeMap[changeType] || changeType || '-'
    },

    /**
     * 获取变更类型颜色
     */
    getChangeTypeColor(changeType) {
      return this.changeTypeColorMap[changeType] || '#909399'
    },

    /**
     * 获取变更类型标签类型
     */
    getChangeTypeTagType(changeType) {
      return this.changeTypeTagTypeMap[changeType] || 'info'
    },

    /**
     * 获取操作来源文本
     */
    getOperationSourceText(source) {
      return this.operationSourceMap[source] || source || '-'
    },

    /**
     * 格式化值
     */
    formatValue(value) {
      if (!value) return '-'
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.change-logs-timeline {
  padding: 10px 0;

  .log-card {
    margin-bottom: 0;

    .log-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .operator-info,
      .operation-source {
        font-size: 13px;
        color: #606266;
      }
    }

    .log-description {
      font-size: 14px;
      color: #303133;
      margin-bottom: 12px;
      line-height: 1.6;
    }

    .log-changes {
      margin: 16px 0;
      padding: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;

      .change-label {
        font-size: 12px;
        font-weight: 600;
        color: #909399;
        margin-bottom: 8px;
      }

      .change-value {
        padding: 8px;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #dcdfe6;

        pre {
          margin: 0;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          color: #606266;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        &.changed {
          border-color: #409eff;
          background-color: #ecf5ff;

          pre {
            color: #409eff;
          }
        }
      }
    }

    .log-meta {
      display: flex;
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid #ebeef5;

      .meta-item {
        font-size: 12px;
        color: #909399;

        i {
          margin-right: 4px;
        }
      }
    }
  }

  ::v-deep .el-timeline-item__timestamp {
    font-size: 13px;
    color: #909399;
  }
}
</style>

