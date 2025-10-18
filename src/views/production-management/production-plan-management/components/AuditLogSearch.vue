/**
 * 文件名称：AuditLogSearch.vue
 * 文件描述：生产计划审计日志搜索表单组件
 * 创建日期：2025-10-17
 * 修改记录：
 *   - 2025-10-17: 根据新接口文档创建，支持完整的筛选条件
 */

<template>
  <div class="audit-log-search">
    <el-form
      ref="searchForm"
      :model="searchParams"
      :inline="true"
      label-width="100px"
      @submit.native.prevent="handleSearch"
    >
      <el-row :gutter="20">
        <!-- 生产计划ID -->
        <el-col :span="8">
          <el-form-item label="生产计划">
            <el-input
              v-model="searchParams.planId"
              placeholder="请输入计划ID或计划编号"
              clearable
              @keyup.enter.native="handleSearch"
            >
              <i slot="prefix" class="el-input__icon el-icon-search" />
            </el-input>
          </el-form-item>
        </el-col>

        <!-- 子批次ID -->
        <el-col :span="8">
          <el-form-item label="子批次ID">
            <el-input
              v-model="searchParams.planItemId"
              placeholder="请输入子批次ID"
              clearable
              @keyup.enter.native="handleSearch"
            >
              <i slot="prefix" class="el-input__icon el-icon-search" />
            </el-input>
          </el-form-item>
        </el-col>

        <!-- 操作人 -->
        <el-col :span="8">
          <el-form-item label="操作人">
            <el-input
              v-model="searchParams.operatorId"
              placeholder="请输入操作人ID或姓名"
              clearable
              @keyup.enter.native="handleSearch"
            >
              <i slot="prefix" class="el-input__icon el-icon-user" />
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <!-- 变更类型 -->
        <el-col :span="8">
          <el-form-item label="变更类型">
            <el-select
              v-model="searchParams.changeType"
              placeholder="请选择变更类型"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in changeTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 操作来源 -->
        <el-col :span="8">
          <el-form-item label="操作来源">
            <el-select
              v-model="searchParams.operationSource"
              placeholder="请选择操作来源"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in operationSourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 时间范围 -->
        <el-col :span="8">
          <el-form-item label="操作时间">
            <el-date-picker
              v-model="searchParams.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              :default-time="['00:00:00', '23:59:59']"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 操作按钮 -->
      <el-row>
        <el-col :span="24" style="text-align: right">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">
            重置
          </el-button>
          <el-button
            v-if="enableExport"
            type="success"
            icon="el-icon-download"
            @click="handleExport"
          >
            导出日志
          </el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { OPERATION_SOURCE_OPTIONS } from '../constants'

export default {
  name: 'AuditLogSearch',
  props: {
    // 是否启用导出功能
    enableExport: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      searchParams: {
        planId: '',
        planItemId: '',
        operatorId: '',
        changeType: '',
        operationSource: '',
        timeRange: []
      },
      // 操作来源选项
      operationSourceOptions: OPERATION_SOURCE_OPTIONS,
      // 变更类型选项（完全符合接口文档附录的变更类型枚举）
      changeTypeOptions: [
        { value: 'SPLIT', label: '拆分' },
        { value: 'MERGE', label: '合并' },
        { value: 'ADJUST', label: '调整' },
        { value: 'STATUS_UPDATE', label: '状态更新' },
        { value: 'PROGRESS_SYNC', label: '进度同步' },
        { value: 'STATUS_UPDATE_REQUESTED', label: '状态更新请求' },
        { value: 'STATUS_UPDATE_APPROVED', label: '状态更新批准' },
        { value: 'STATUS_UPDATE_REJECTED', label: '状态更新拒绝' },
        { value: 'STATUS_UPDATE_CANCELLED', label: '状态更新取消' }
      ]
    }
  },
  methods: {
    /**
     * 处理搜索
     * 构建符合接口文档要求的查询参数
     */
    handleSearch() {
      // 构建查询参数
      const params = {}

      // planId
      if (this.searchParams.planId && this.searchParams.planId.trim()) {
        params.planId = this.searchParams.planId.trim()
      }

      // planItemId
      if (this.searchParams.planItemId && this.searchParams.planItemId.trim()) {
        params.planItemId = this.searchParams.planItemId.trim()
      }

      // operatorId
      if (this.searchParams.operatorId && this.searchParams.operatorId.trim()) {
        params.operatorId = this.searchParams.operatorId.trim()
      }

      // changeType
      if (this.searchParams.changeType) {
        params.changeType = this.searchParams.changeType
      }

      // operationSource
      if (this.searchParams.operationSource) {
        params.operationSource = this.searchParams.operationSource
      }

      // 时间范围（转换为ISO 8601格式）
      if (this.searchParams.timeRange && this.searchParams.timeRange.length === 2) {
        params.startTime = new Date(this.searchParams.timeRange[0]).toISOString()
        params.endTime = new Date(this.searchParams.timeRange[1]).toISOString()
      }

      // 触发搜索事件
      this.$emit('search', params)
    },

    /**
     * 重置搜索条件
     */
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.searchParams = {
        planId: '',
        planItemId: '',
        operatorId: '',
        changeType: '',
        operationSource: '',
        timeRange: []
      }
      this.$emit('reset')
    },

    /**
     * 导出日志
     */
    handleExport() {
      // 构建导出参数
      const params = {}

      if (this.searchParams.planId && this.searchParams.planId.trim()) {
        params.planId = this.searchParams.planId.trim()
      }
      if (this.searchParams.planItemId && this.searchParams.planItemId.trim()) {
        params.planItemId = this.searchParams.planItemId.trim()
      }
      if (this.searchParams.operatorId && this.searchParams.operatorId.trim()) {
        params.operatorId = this.searchParams.operatorId.trim()
      }
      if (this.searchParams.changeType) {
        params.changeType = this.searchParams.changeType
      }
      if (this.searchParams.operationSource) {
        params.operationSource = this.searchParams.operationSource
      }
      if (this.searchParams.timeRange && this.searchParams.timeRange.length === 2) {
        params.startTime = new Date(this.searchParams.timeRange[0]).toISOString()
        params.endTime = new Date(this.searchParams.timeRange[1]).toISOString()
      }

      this.$emit('export', params)
    }
  }
}
</script>

<style lang="scss" scoped>
.audit-log-search {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 16px;

  ::v-deep .el-form-item {
    margin-bottom: 16px;
  }

  ::v-deep .el-input__icon {
    line-height: 32px;
  }
}
</style>

