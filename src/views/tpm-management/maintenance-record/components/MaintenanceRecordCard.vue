<!--
  文件名称: MaintenanceRecordCard.vue
  文件描述: 维护记录卡片组件 - 展示单个维护记录的关键信息
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建
-->

<template>
  <el-card class="maintenance-record-card" shadow="hover" @click.native="handleClick">
    <div class="card-header">
      <div class="card-title">
        <status-tag :status="record.maintenanceType" :config="maintenanceTypeConfig" />
        <span class="record-code">{{ record.recordCode }}</span>
      </div>
      <i class="el-icon-arrow-right card-arrow" />
    </div>

    <div class="card-content">
      <div class="content-row">
        <div class="content-label">
          <i class="el-icon-document" />
          维护内容
        </div>
        <div class="content-value">{{ record.maintenanceContent }}</div>
      </div>

      <div class="content-row">
        <div class="content-label">
          <i class="el-icon-user" />
          执行人员
        </div>
        <div class="content-value">
          {{ record.executor ? record.executor.name : '-' }}
        </div>
      </div>

      <div class="content-row">
        <div class="content-label">
          <i class="el-icon-time" />
          维护工时
        </div>
        <div class="content-value work-hours">
          {{ formatWorkHours(record.workHours) }}
        </div>
      </div>

      <div v-if="record.problemFound" class="content-row problem">
        <div class="content-label">
          <i class="el-icon-warning" />
          发现问题
        </div>
        <div class="content-value">{{ record.problemFound }}</div>
      </div>

      <div v-if="record.solutionApplied" class="content-row solution">
        <div class="content-label">
          <i class="el-icon-check" />
          处理措施
        </div>
        <div class="content-value">{{ record.solutionApplied }}</div>
      </div>

      <div v-if="record.sparePartsUsed && record.sparePartsUsed.length > 0" class="content-row">
        <div class="content-label">
          <i class="el-icon-setting" />
          使用备件
        </div>
        <div class="content-value">
          <el-tag
            v-for="(part, index) in record.sparePartsUsed"
            :key="index"
            size="small"
            type="info"
            style="margin-right: 4px"
          >
            {{ part.sparePartName }} x{{ part.quantity }}
          </el-tag>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="footer-item">
        <i class="el-icon-circle-check" />
        确认人：{{ record.confirmer ? record.confirmer.name : '待确认' }}
      </div>
      <div v-if="record.maintenanceTask" class="footer-item">
        <i class="el-icon-s-order" />
        任务：{{ record.maintenanceTask.taskCode }}
      </div>
    </div>
  </el-card>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import { MAINTENANCE_TYPE_CONFIG } from '../constants/maintenance-record'

export default {
  name: 'MaintenanceRecordCard',
  components: {
    StatusTag
  },
  props: {
    record: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      maintenanceTypeConfig: MAINTENANCE_TYPE_CONFIG
    }
  },
  methods: {
    /**
     * 格式化工时显示
     */
    formatWorkHours(workHours) {
      if (!workHours) return '-'
      const hours = parseFloat(workHours)
      return `${hours.toFixed(2)} 小时`
    },

    /**
     * 处理卡片点击
     */
    handleClick() {
      this.$emit('click', this.record)
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-record-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  ::v-deep .el-card__body {
    padding: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #EBEEF5;

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .record-code {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }
    }

    .card-arrow {
      font-size: 16px;
      color: #C0C4CC;
      transition: all 0.3s ease;
    }
  }

  &:hover .card-arrow {
    color: #409EFF;
    transform: translateX(4px);
  }

  .card-content {
    .content-row {
      display: flex;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .content-label {
        display: flex;
        align-items: center;
        min-width: 90px;
        font-size: 13px;
        color: #909399;

        i {
          margin-right: 4px;
          font-size: 14px;
        }
      }

      .content-value {
        flex: 1;
        font-size: 13px;
        color: #606266;
        line-height: 1.5;
        word-break: break-word;

        &.work-hours {
          font-weight: 600;
          color: #409EFF;
        }
      }

      &.problem {
        .content-label {
          color: #F56C6C;
        }

        .content-value {
          color: #F56C6C;
        }
      }

      &.solution {
        .content-label {
          color: #67C23A;
        }

        .content-value {
          color: #67C23A;
        }
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #EBEEF5;

    .footer-item {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #909399;

      i {
        margin-right: 4px;
        font-size: 14px;
      }
    }
  }
}
</style>

