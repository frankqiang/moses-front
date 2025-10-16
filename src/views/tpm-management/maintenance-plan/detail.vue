<!--
文件名称：detail.vue
文件描述：维护计划详情页面
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建
-->

<template>
  <div class="app-container maintenance-plan-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header content="维护计划详情" @back="handleBack" />
      <div class="header-actions">
        <el-button @click="handleBack">返回列表</el-button>
        <el-button
          v-if="planDetail.status === '禁用'"
          type="success"
          @click="handleEnable"
        >
          启用计划
        </el-button>
        <el-button
          v-if="planDetail.status === '启用'"
          type="warning"
          @click="handleDisable"
        >
          禁用计划
        </el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-loading="loading" class="detail-content">
      <!-- 基础信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">基础信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">计划编码：</span>
              <span class="info-value">{{ planDetail.planCode || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">计划名称：</span>
              <span class="info-value">{{ planDetail.planName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">计划状态：</span>
              <el-tag
                :type="getStatusTagType(planDetail.status)"
                size="small"
              >
                {{ planDetail.status || '-' }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备编码：</span>
              <span class="info-value">{{ (planDetail.equipment && planDetail.equipment.equipmentCode) || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备名称：</span>
              <span class="info-value">{{ (planDetail.equipment && planDetail.equipment.name) || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备类型：</span>
              <span class="info-value">{{ (planDetail.equipment && planDetail.equipment.equipmentType) || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">设备状态：</span>
              <span class="info-value">{{ (planDetail.equipment && planDetail.equipment.status) || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">维护类型：</span>
              <el-tag
                :type="getMaintenanceTypeTagType(planDetail.maintenanceType)"
                size="small"
              >
                {{ planDetail.maintenanceType || '-' }}
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 维护周期信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">维护周期信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">周期类型：</span>
              <el-tag
                :type="getCycleTypeTagType(planDetail.cycleType)"
                size="small"
              >
                {{ planDetail.cycleType || '-' }}
              </el-tag>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">周期配置：</span>
              <span class="info-value">{{ formatCycleInfo(planDetail) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">提前生成天数：</span>
              <span class="info-value">{{ planDetail.advanceDays || '-' }} 天</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 维护内容 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">维护内容</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="24">
            <div class="info-item">
              <span class="info-label">维护项目：</span>
              <div class="info-value multiline">{{ planDetail.maintenanceItems || '-' }}</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="8">
            <div class="info-item">
              <span class="info-label">标准工时：</span>
              <span class="info-value">{{ formatStandardHours(planDetail.standardDurationHours) }}</span>
            </div>
          </el-col>
          <el-col :span="16">
            <div class="info-item">
              <span class="info-label">所需技能：</span>
              <span class="info-value">{{ planDetail.requiredSkills || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="24">
            <div class="info-item">
              <span class="info-label">安全注意事项：</span>
              <div class="info-value multiline">{{ planDetail.safetyNotes || '-' }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 备件清单 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">备件清单</span>
        </div>
        <el-table
          v-if="planDetail.requiredSpareParts && planDetail.requiredSpareParts.length > 0"
          :data="planDetail.requiredSpareParts"
          border
          stripe
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="sparePartId" label="备件ID" min-width="200" />
          <el-table-column prop="quantity" label="数量" width="120" align="center" />
        </el-table>
        <div v-else class="empty-text">
          暂无备件清单
        </div>
      </el-card>

      <!-- 附件信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">作业指导书</span>
        </div>
        <div v-if="planDetail.instructionAttachmentUrl" class="attachment-info">
          <el-link
            :href="planDetail.instructionAttachmentUrl"
            type="primary"
            target="_blank"
            :underline="false"
          >
            <i class="el-icon-document" />
            查看/下载作业指导书
          </el-link>
        </div>
        <div v-else class="empty-text">
          暂无作业指导书
        </div>
      </el-card>

      <!-- 关联信息 -->
      <el-card class="detail-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title">关联信息</span>
        </div>
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">创建人：</span>
              <span class="info-value">
                {{ (planDetail.creator && planDetail.creator.name) || '-' }}
                <span v-if="planDetail.creator && planDetail.creator.email" class="email-text">
                  ({{ planDetail.creator.email }})
                </span>
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ formatDateTime(planDetail.createdAt) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">更新人：</span>
              <span class="info-value">
                {{ (planDetail.updater && planDetail.updater.name) || '-' }}
                <span v-if="planDetail.updater && planDetail.updater.email" class="email-text">
                  ({{ planDetail.updater.email }})
                </span>
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">更新时间：</span>
              <span class="info-value">{{ formatDateTime(planDetail.updatedAt) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="24" style="margin-top: 16px">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">最后生成任务时间：</span>
              <span class="info-value">{{ formatDateTime(planDetail.lastGeneratedAt) }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getMaintenancePlanById, enableMaintenancePlan, disableMaintenancePlan } from './api/maintenance-plan'
import {
  STATUS_TAG_CONFIG,
  MAINTENANCE_TYPE_TAG_CONFIG,
  CYCLE_TYPE_TAG_CONFIG
} from './constants'
import { parseTime } from '@/utils'

export default {
  name: 'MaintenancePlanDetail',

  data() {
    return {
      // 加载状态
      loading: false,
      // 计划详情
      planDetail: {
        equipment: {},
        creator: {},
        updater: {}
      }
    }
  },

  created() {
    const planId = this.$route.params.id
    if (planId) {
      this.fetchPlanDetail(planId)
    } else {
      this.$message.error('维护计划ID不能为空')
      this.handleBack()
    }
  },

  methods: {
    // 获取计划详情
    async fetchPlanDetail(planId) {
      this.loading = true
      try {
        const response = await getMaintenancePlanById(planId)
        this.planDetail = response.data || {}
      } catch (error) {
        console.error('获取维护计划详情失败:', error)
        this.$message.error(error.message || '获取维护计划详情失败')
        this.handleBack()
      } finally {
        this.loading = false
      }
    },

    // 获取状态标签类型
    getStatusTagType(status) {
      return STATUS_TAG_CONFIG.typeMap[status] || 'info'
    },

    // 获取维护类型标签类型
    getMaintenanceTypeTagType(type) {
      return MAINTENANCE_TYPE_TAG_CONFIG.typeMap[type] || 'info'
    },

    // 获取周期类型标签类型
    getCycleTypeTagType(type) {
      return CYCLE_TYPE_TAG_CONFIG.typeMap[type] || 'info'
    },

    // 格式化周期信息
    formatCycleInfo(plan) {
      if (!plan.cycleValue || !plan.cycleUnit) {
        return '-'
      }
      return `每${plan.cycleValue}${plan.cycleUnit}`
    },

    // 格式化标准工时
    formatStandardHours(hours) {
      if (!hours) {
        return '-'
      }
      return `${hours}小时`
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) {
        return '-'
      }
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    // 处理返回
    handleBack() {
      this.$router.push({
        path: '/master-data/equipment-tpm/maintenance-plans'
      })
    },

    // 处理编辑
    handleEdit() {
      this.$router.push({
        path: `/master-data/equipment-tpm/maintenance-plans/${this.planDetail.id}/edit`
      })
    },

    // 处理启用
    async handleEnable() {
      try {
        await this.$confirm('确认启用该维护计划？启用后系统将自动生成维护任务。', '启用确认', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })

        const response = await enableMaintenancePlan(this.planDetail.id)
        this.$message.success(response.message || '启用维护计划成功')
        // 刷新详情
        this.fetchPlanDetail(this.planDetail.id)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('启用维护计划失败:', error)
          this.$message.error(error.message || '启用维护计划失败')
        }
      }
    },

    // 处理禁用
    async handleDisable() {
      try {
        await this.$confirm('确认禁用该维护计划？禁用后将停止生成新的维护任务。', '禁用确认', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })

        const response = await disableMaintenancePlan(this.planDetail.id)
        this.$message.success(response.message || '禁用维护计划成功')
        // 刷新详情
        this.fetchPlanDetail(this.planDetail.id)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('禁用维护计划失败:', error)
          // 特殊处理"存在未完成任务"错误
          if (error.code === 'MAINTENANCE_PLAN_005') {
            this.$message.error('存在未完成的维护任务，无法禁用计划')
          } else {
            this.$message.error(error.message || '禁用维护计划失败')
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-plan-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px 24px;
    background: #fff;
    border-radius: 4px;

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .detail-content {
    min-height: 400px;
  }

  .detail-card {
    margin-bottom: 16px;
    border-radius: 4px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
      }
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;

      .info-label {
        min-width: 120px;
        font-weight: 500;
        color: #606266;
        flex-shrink: 0;
      }

      .info-value {
        color: #303133;
        word-break: break-word;

        &.multiline {
          white-space: pre-wrap;
          line-height: 1.6;
        }

        .email-text {
          color: #909399;
          font-size: 12px;
        }
      }
    }

    .empty-text {
      padding: 24px 0;
      text-align: center;
      color: #909399;
      font-size: 14px;
    }

    .attachment-info {
      padding: 8px 0;

      .el-link {
        font-size: 14px;

        i {
          margin-right: 8px;
        }
      }
    }
  }
}
</style>
