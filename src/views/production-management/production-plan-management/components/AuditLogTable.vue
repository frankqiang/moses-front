/**
 * 文件名称：AuditLogTable.vue
 * 文件描述：生产计划审计日志表格组件
 * 创建日期：2025-10-17
 * 修改记录：
 *   - 2025-10-17: 根据新接口文档创建，支持展开查看详情和变更对比
 */

<template>
  <div class="audit-log-table">
    <el-table
      :data="logs"
      v-loading="loading"
      border
      stripe
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <!-- 展开行：显示详细信息 -->
      <el-table-column type="expand">
        <template slot-scope="props">
          <div class="log-detail">
            <!-- 变更描述 -->
            <div class="detail-section">
              <h4>变更描述</h4>
              <p>{{ props.row.changeDescription || '无描述' }}</p>
            </div>

            <!-- 变更前后值对比 -->
            <div v-if="props.row.originalValue || props.row.newValue" class="detail-section">
              <h4>变更对比</h4>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="change-label">变更前：</div>
                  <div class="change-value">
                    <pre>{{ formatValue(props.row.originalValue) }}</pre>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="change-label">变更后：</div>
                  <div class="change-value changed">
                    <pre>{{ formatValue(props.row.newValue) }}</pre>
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- 关联工艺模板信息 -->
            <div v-if="props.row.affectedProcessTemplateId" class="detail-section">
              <h4>关联工艺模板</h4>
              <p>
                <el-tag size="mini" type="info">
                  {{ props.row.processTemplateLinkType || '-' }}
                </el-tag>
                工艺模板ID: {{ props.row.affectedProcessTemplateId }}
              </p>
            </div>

            <!-- 关联设备信息 -->
            <div v-if="props.row.affectedEquipmentId" class="detail-section">
              <h4>关联设备</h4>
              <p>
                <el-tag size="mini" type="info">
                  {{ props.row.equipmentLinkType || '-' }}
                </el-tag>
                设备ID: {{ props.row.affectedEquipmentId }}
              </p>
            </div>

            <!-- 元信息 -->
            <div class="detail-section">
              <h4>元信息</h4>
              <el-row :gutter="20">
                <el-col :span="8">
                  <span class="meta-label">记录ID:</span>
                  <span class="meta-value">{{ props.row.id }}</span>
                </el-col>
                <el-col :span="8">
                  <span class="meta-label">创建人:</span>
                  <span class="meta-value">{{ props.row.createdBy || '-' }}</span>
                </el-col>
                <el-col :span="8">
                  <span class="meta-label">创建时间:</span>
                  <span class="meta-value">{{ formatTime(props.row.createdAt) }}</span>
                </el-col>
              </el-row>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 操作时间 -->
      <el-table-column
        prop="createdAt"
        label="操作时间"
        width="160"
        sortable="custom"
      >
        <template slot-scope="scope">
          {{ formatTime(scope.row.createdAt) }}
        </template>
      </el-table-column>

      <!-- 主计划编号 -->
      <el-table-column
        prop="planId"
        label="主计划ID"
        width="120"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <el-link
            v-if="scope.row.planId"
            type="primary"
            @click="handleViewPlan(scope.row.planId)"
          >
            {{ scope.row.planId.substring(0, 8) }}...
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 子批次ID -->
      <el-table-column
        prop="planItemId"
        label="子批次ID"
        width="120"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          <span v-if="scope.row.planItemId">
            {{ scope.row.planItemId.substring(0, 8) }}...
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!-- 变更类型 -->
      <el-table-column
        prop="changeType"
        label="变更类型"
        width="140"
      >
        <template slot-scope="scope">
          <el-tag
            :type="getChangeTypeTagType(scope.row.changeType)"
            size="small"
          >
            {{ getChangeTypeText(scope.row.changeType) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作人 -->
      <el-table-column
        prop="operatorName"
        label="操作人"
        width="100"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.operatorName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 操作来源 -->
      <el-table-column
        prop="operationSource"
        label="操作来源"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            :type="getOperationSourceType(scope.row.operationSource)"
            size="mini"
          >
            {{ getOperationSourceText(scope.row.operationSource) }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作IP -->
      <el-table-column
        prop="operatorIp"
        label="操作IP"
        width="130"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.operatorIp || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 变更说明 -->
      <el-table-column
        prop="changeDescription"
        label="变更说明"
        min-width="200"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.changeDescription || '无描述' }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.limit"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import {
  CHANGE_TYPE_TAG_TYPE_MAP,
  OPERATION_SOURCE_MAP
} from '../constants'

export default {
  name: 'AuditLogTable',
  props: {
    // 审计日志数据
    logs: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 分页信息
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 20,
        total: 0
      })
    }
  },
  data() {
    return {
      // 变更类型映射（完全符合接口文档附录的变更类型枚举）
      changeTypeMap: {
        SPLIT: '拆分',
        MERGE: '合并',
        ADJUST: '调整',
        STATUS_UPDATE: '状态更新',
        PROGRESS_SYNC: '进度同步',
        STATUS_UPDATE_REQUESTED: '状态更新请求',
        STATUS_UPDATE_APPROVED: '状态更新批准',
        STATUS_UPDATE_REJECTED: '状态更新拒绝',
        STATUS_UPDATE_CANCELLED: '状态更新取消'
      },
      // 操作来源映射
      operationSourceMap: OPERATION_SOURCE_MAP
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
     * 格式化值
     */
    formatValue(value) {
      if (!value) return '-'
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2)
      }
      return String(value)
    },

    /**
     * 获取变更类型文本
     */
    getChangeTypeText(changeType) {
      return this.changeTypeMap[changeType] || changeType || '-'
    },

    /**
     * 获取变更类型标签类型
     */
    getChangeTypeTagType(changeType) {
      return CHANGE_TYPE_TAG_TYPE_MAP[changeType] || 'info'
    },

    /**
     * 获取操作来源文本
     */
    getOperationSourceText(source) {
      return this.operationSourceMap[source] || source || '-'
    },

    /**
     * 获取操作来源标签类型
     */
    getOperationSourceType(source) {
      const typeMap = {
        ERP_SYNC: 'warning',
        MANUAL: 'primary',
        SYSTEM: 'success'
      }
      return typeMap[source] || 'info'
    },

    /**
     * 查看计划详情
     */
    handleViewPlan(planId) {
      this.$emit('view-plan', planId)
    },

    /**
     * 处理排序变化
     */
    handleSortChange({ prop, order }) {
      // 转换为接口要求的格式：字段名:排序方向
      let sortBy = ''
      if (prop && order) {
        const direction = order === 'ascending' ? 'asc' : 'desc'
        sortBy = `${prop}:${direction}`
      }
      this.$emit('sort-change', sortBy)
    },

    /**
     * 处理每页数量变化
     */
    handleSizeChange(size) {
      this.$emit('page-size-change', size)
    },

    /**
     * 处理页码变化
     */
    handleCurrentChange(page) {
      this.$emit('page-change', page)
    }
  }
}
</script>

<style lang="scss" scoped>
.audit-log-table {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;

  .log-detail {
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .detail-section {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #dcdfe6;
      }

      p {
        font-size: 13px;
        color: #606266;
        line-height: 1.6;
        margin: 0;
      }

      .change-label {
        font-size: 12px;
        font-weight: 600;
        color: #909399;
        margin-bottom: 8px;
      }

      .change-value {
        padding: 12px;
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
          line-height: 1.6;
        }

        &.changed {
          border-color: #409eff;
          background-color: #ecf5ff;

          pre {
            color: #409eff;
          }
        }
      }

      .meta-label {
        font-size: 12px;
        color: #909399;
        margin-right: 8px;
      }

      .meta-value {
        font-size: 12px;
        color: #606266;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 20px;
    text-align: right;
  }

  ::v-deep .el-table {
    th {
      background-color: #f5f7fa;
    }

    .el-table__expanded-cell {
      padding: 0;
    }
  }
}
</style>

