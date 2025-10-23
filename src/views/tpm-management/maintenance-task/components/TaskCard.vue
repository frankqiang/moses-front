<!--
  文件名称：TaskCard.vue
  文件描述：任务卡片组件 - 任务信息展示
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 根据查询我的任务接口文档优化，显示所有重要字段
-->
<template>
  <el-card class="task-card" :shadow="shadow">
    <div class="task-card-header">
      <div class="task-card-title">
        <span class="task-code">{{ task.taskCode }}</span>
        <task-status-tag :status="task.status" />
      </div>
      <div class="task-card-actions">
        <slot name="actions" :task="task" />
      </div>
    </div>

    <div class="task-card-body">
      <h3 class="task-title">{{ task.taskTitle }}</h3>

      <div class="task-info">
        <div class="task-info-item">
          <i class="el-icon-coin" />
          <span class="label">设备：</span>
          <span class="value">{{ equipmentName }}</span>
        </div>

        <div class="task-info-item">
          <i class="el-icon-document" />
          <span class="label">任务类型：</span>
          <el-tag :type="taskTypeTagType" size="mini">{{ taskTypeText }}</el-tag>
        </div>

        <div class="task-info-item">
          <i class="el-icon-user" />
          <span class="label">执行人：</span>
          <span class="value">{{ assigneeName }}</span>
        </div>

        <div class="task-info-item">
          <i class="el-icon-time" />
          <span class="label">计划时间：</span>
          <span class="value">{{ plannedTimeRange }}</span>
        </div>

        <div v-if="task.actualStartTime" class="task-info-item">
          <i class="el-icon-circle-check" />
          <span class="label">实际开始：</span>
          <span class="value">{{ formatDateTime(task.actualStartTime) }}</span>
        </div>

        <div v-if="task.actualEndTime" class="task-info-item">
          <i class="el-icon-circle-check" />
          <span class="label">实际结束：</span>
          <span class="value">{{ formatDateTime(task.actualEndTime) }}</span>
        </div>

        <div v-if="task.maintenancePlan" class="task-info-item">
          <i class="el-icon-document-copy" />
          <span class="label">维护计划：</span>
          <span class="value">{{ maintenancePlanName }}</span>
        </div>

        <div v-if="task.delayReason" class="task-info-item delay-reason">
          <i class="el-icon-warning-outline" />
          <span class="label">延期原因：</span>
          <span class="value">{{ task.delayReason }}</span>
        </div>
      </div>

      <div v-if="task.taskDescription" class="task-description">
        <span class="label">任务描述：</span>
        <p>{{ task.taskDescription }}</p>
      </div>

      <div v-if="task.remark" class="task-remark">
        <span class="label">备注：</span>
        <p>{{ task.remark }}</p>
      </div>
    </div>

    <div v-if="$slots.footer" class="task-card-footer">
      <slot name="footer" :task="task" />
    </div>
  </el-card>
</template>

<script>
import TaskStatusTag from './TaskStatusTag'
import { TASK_TYPE_TAG_TYPE_MAP } from '../constants/maintenance-task'
import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'
import { parseTime } from '@/utils'

export default {
  name: 'TaskCard',

  components: {
    TaskStatusTag
  },

  mixins: [tpmDictionaryMixin],

  props: {
    // 任务数据
    task: {
      type: Object,
      required: true
    },
    // 卡片阴影
    shadow: {
      type: String,
      default: 'hover',
      validator: value => ['always', 'hover', 'never'].includes(value)
    }
  },

  computed: {
    /**
     * 设备名称
     * 接口文档：equipment对象包含equipmentCode和name
     */
    equipmentName() {
      return this.task.equipment
        ? `${this.task.equipment.equipmentCode} - ${this.task.equipment.name}`
        : '未指定'
    },

    /**
     * 执行人姓名
     * 接口文档：assignee对象包含name字段
     */
    assigneeName() {
      return this.task.assignee?.name || '未分配'
    },

    /**
     * 维护计划名称
     * 接口文档：maintenancePlan对象包含planCode和planName
     */
    maintenancePlanName() {
      return this.task.maintenancePlan
        ? `${this.task.maintenancePlan.planCode} - ${this.task.maintenancePlan.planName}`
        : null
    },

    /**
     * 任务类型文本
     */
    taskTypeText() {
      return this.getTaskTypeLabel(this.task.taskType) || this.task.taskType
    },

    /**
     * 任务类型标签类型
     */
    taskTypeTagType() {
      return TASK_TYPE_TAG_TYPE_MAP[this.task.taskType] || 'info'
    },

    /**
     * 计划时间范围
     * 接口文档：plannedStartTime和plannedEndTime都是ISO 8601格式
     */
    plannedTimeRange() {
      const start = this.formatDateTime(this.task.plannedStartTime)
      const end = this.task.plannedEndTime
        ? this.formatDateTime(this.task.plannedEndTime)
        : '未设定'
      return `${start} ~ ${end}`
    }
  },

  async created() {
    // 加载TPM字典
    await this.loadTPMDictionary()
  },

  methods: {
    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      return dateTime ? parseTime(dateTime, '{y}-{m}-{d} {h}:{i}') : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.task-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  .task-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .task-card-title {
      display: flex;
      align-items: center;
      gap: 8px;

      .task-code {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .task-card-body {
    .task-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .task-info {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .task-info-item {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #606266;

        i {
          margin-right: 8px;
          color: #909399;
          font-size: 16px;
        }

        .label {
          color: #909399;
          margin-right: 4px;
        }

        .value {
          color: #303133;
        }

        &.delay-reason {
          .label,
          .value {
            color: #e6a23c;
          }
        }
      }
    }

    .task-description,
    .task-remark {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;

      .label {
        font-size: 14px;
        color: #909399;
        font-weight: 500;
      }

      p {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }

    .task-remark {
      .label {
        color: #409eff;
      }
    }
  }

  .task-card-footer {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }
}
</style>

