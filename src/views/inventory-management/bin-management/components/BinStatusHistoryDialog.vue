<!--
  文件名称：BinStatusHistoryDialog.vue
  文件描述：料框状态历史对话框组件，用于查看料框状态变更历史记录
  创建日期：2025-01-10
  修改记录：
    - 2025-01-10: 初始创建
-->

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="料框状态历史"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 筛选表单 -->
    <el-form :inline="true" :model="queryParams" class="filter-form">
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          :clearable="true"
          @change="handleTimeRangeChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="fetchStatusHistory">查询</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 时间轴展示 -->
    <el-timeline v-if="historyList.length > 0" class="history-timeline">
      <el-timeline-item
        v-for="(item, index) in historyList"
        :key="item.id"
        :timestamp="formatDateTime(item.changedAt)"
        placement="top"
      >
        <el-card>
          <div class="history-item">
            <!-- 状态变更 -->
            <div class="status-change">
              <span class="label">状态变更：</span>
              <StatusTag
                v-if="item.oldStatus"
                :status="item.oldStatus"
                :text-map="BIN_STATUS_TEXT_MAP"
                :type-map="BIN_STATUS_TYPE_MAP"
              />
              <span v-else class="new-registration">新注册</span>
              <i class="el-icon-right arrow-icon" />
              <StatusTag
                :status="item.newStatus"
                :text-map="BIN_STATUS_TEXT_MAP"
                :type-map="BIN_STATUS_TYPE_MAP"
              />
            </div>

            <!-- 触发类型 -->
            <div class="history-detail">
              <span class="label">触发类型：</span>
              <el-tag size="small" type="info">{{ TRIGGER_TYPE_TEXT_MAP[item.triggerType] || item.triggerType }}</el-tag>
            </div>

            <!-- 操作员 -->
            <div v-if="item.operatorId" class="history-detail">
              <span class="label">操作员：</span>
              <span class="value">{{ item.operatorId }}</span>
            </div>

            <!-- 设备 -->
            <div v-if="item.equipmentId" class="history-detail">
              <span class="label">设备ID：</span>
              <span class="value">{{ item.equipmentId }}</span>
            </div>

            <!-- 备注 -->
            <div v-if="item.remarks" class="history-detail">
              <span class="label">备注：</span>
              <span class="value">{{ item.remarks }}</span>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>

    <!-- 空状态 -->
    <el-empty v-else description="暂无状态变更记录" />

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        :current-page="currentPage"
        :page-size="queryParams.limit"
        :total="total"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBinStatusHistory } from '../api/bin-management'
import StatusTag from '@/components/StatusTag'
import { BIN_STATUS_TEXT_MAP, BIN_STATUS_TYPE_MAP, TRIGGER_TYPE_TEXT_MAP } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'BinStatusHistoryDialog',

  components: {
    StatusTag
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    binId: {
      type: String,
      default: ''
    },
    binCode: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      BIN_STATUS_TEXT_MAP,
      BIN_STATUS_TYPE_MAP,
      TRIGGER_TYPE_TEXT_MAP,
      dialogVisible: false,
      historyList: [],
      timeRange: null,
      queryParams: {
        limit: 10,
        offset: 0,
        startDate: undefined,
        endDate: undefined
      },
      currentPage: 1,
      total: 0,
      loading: false
    }
  },

  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val && this.binId) {
        this.initDialog()
      }
    }
  },

  methods: {
    /**
     * 初始化对话框
     */
    initDialog() {
      this.resetQueryParams()
      this.fetchStatusHistory()
    },

    /**
     * 获取状态历史记录
     */
    async fetchStatusHistory() {
      if (!this.binId) {
        this.$message.warning('料框ID不能为空')
        return
      }

      this.loading = true
      try {
        const response = await getBinStatusHistory(this.binId, this.queryParams)
        this.historyList = response.data || []

        // 注意：接口返回的是数组，需要根据实际分页需要手动处理total
        // 这里假设需要完整数据来判断分页，实际应由后端返回total
        this.total = this.historyList.length
      } catch (error) {
        const errorMessage = error.response?.data?.error?.message || '获取状态历史失败'
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
     * 时间范围变化处理
     */
    handleTimeRangeChange(value) {
      if (value && value.length === 2) {
        // 转换为ISO 8601格式
        this.queryParams.startDate = this.convertToISO8601(value[0])
        this.queryParams.endDate = this.convertToISO8601(value[1])
      } else {
        this.queryParams.startDate = undefined
        this.queryParams.endDate = undefined
      }
    },

    /**
     * 转换为ISO 8601格式
     */
    convertToISO8601(dateTimeStr) {
      if (!dateTimeStr) return undefined
      // 将 "YYYY-MM-DD HH:mm:ss" 转换为 ISO 8601格式
      return new Date(dateTimeStr).toISOString()
    },

    /**
     * 格式化时间显示
     */
    formatDateTime(datetime) {
      return parseTime(datetime, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 重置查询参数
     */
    resetQueryParams() {
      this.timeRange = null
      this.queryParams = {
        limit: 10,
        offset: 0,
        startDate: undefined,
        endDate: undefined
      }
      this.currentPage = 1
    },

    /**
     * 重置按钮处理
     */
    handleReset() {
      this.resetQueryParams()
      this.fetchStatusHistory()
    },

    /**
     * 每页数量变化
     */
    handleSizeChange(val) {
      this.queryParams.limit = val
      this.queryParams.offset = 0
      this.currentPage = 1
      this.fetchStatusHistory()
    },

    /**
     * 页码变化
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.queryParams.offset = (val - 1) * this.queryParams.limit
      this.fetchStatusHistory()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.dialogVisible = false
      this.$emit('update:visible', false)
      this.historyList = []
      this.resetQueryParams()
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-form {
  margin-bottom: 16px;
}

.history-timeline {
  margin-top: 20px;
  max-height: 500px;
  overflow-y: auto;

  ::v-deep .el-timeline-item__timestamp {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
  }
}

.history-item {
  .status-change {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;

    .label {
      font-weight: 500;
      color: #606266;
      margin-right: 8px;
    }

    .new-registration {
      display: inline-block;
      padding: 0 8px;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      color: #909399;
      background-color: #f4f4f5;
      border: 1px solid #e9e9eb;
      border-radius: 4px;
    }

    .arrow-icon {
      margin: 0 8px;
      color: #909399;
    }
  }

  .history-detail {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 14px;

    .label {
      font-weight: 500;
      color: #606266;
      margin-right: 8px;
    }

    .value {
      color: #303133;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>

