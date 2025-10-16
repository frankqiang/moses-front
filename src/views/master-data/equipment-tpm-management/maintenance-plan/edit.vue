<!--
  文件名称：edit.vue
  文件描述：编辑维护计划页面，支持表单数据回填、字段变更检测、确认提示等功能
  创建日期：2025-10-15
  修改记录：
    - 2025-10-15: 初始创建
    - 2025-10-15: 实现编辑表单功能
-->

<template>
  <div class="app-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          type="text"
          icon="el-icon-arrow-left"
          @click="handleBack"
        >
          返回
        </el-button>
        <h1 class="page-title">编辑维护计划</h1>
      </div>
      <div class="header-right">
        <el-button
          type="primary"
          size="small"
          :loading="loadingDetail"
          @click="handleEdit"
        >
          <i class="el-icon-edit" />
          编辑计划
        </el-button>
      </div>
    </div>

    <!-- 计划详情展示 -->
    <div v-if="planDetail && !loadingDetail" class="plan-detail-card">
      <el-card shadow="never" class="detail-card">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-document" />
            计划详情
          </span>
          <el-tag
            :type="getStatusTagType(planDetail.status)"
            size="small"
            class="status-tag"
          >
            {{ planDetail.status }}
          </el-tag>
        </div>

        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label>计划编码：</label>
                <span>{{ planDetail.planCode || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>计划名称：</label>
                <span>{{ planDetail.planName || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>关联设备：</label>
                <span>
                  {{ planDetail.equipment ? `${planDetail.equipment.equipmentCode} - ${planDetail.equipment.name}` : '-' }}
                </span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>维护类型：</label>
                <el-tag
                  :type="getMaintenanceTypeTagType(planDetail.maintenanceType)"
                  size="small"
                >
                  {{ planDetail.maintenanceType || '-' }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 维护周期 -->
        <div class="detail-section">
          <div class="section-title">维护周期</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="info-item">
                <label>周期类型：</label>
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
                <label>周期配置：</label>
                <span>{{ formatCycleInfo(planDetail) }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="info-item">
                <label>提前天数：</label>
                <span>{{ planDetail.advanceDays || 0 }}天</span>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 维护内容 -->
        <div class="detail-section">
          <div class="section-title">维护内容</div>
          <div class="info-item">
            <label>维护项目：</label>
            <div class="content-text">{{ planDetail.maintenanceItems || '-' }}</div>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label>标准工时：</label>
                <span>{{ planDetail.standardDurationHours ? `${planDetail.standardDurationHours}小时` : '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>所需技能：</label>
                <span>{{ planDetail.requiredSkills || '-' }}</span>
              </div>
            </el-col>
          </el-row>
          <div class="info-item">
            <label>安全注意事项：</label>
            <div class="content-text">{{ planDetail.safetyNotes || '-' }}</div>
          </div>
          <div class="info-item">
            <label>作业指导书：</label>
            <span v-if="planDetail.instructionAttachmentUrl">
              <el-link :href="planDetail.instructionAttachmentUrl" target="_blank" type="primary">
                查看附件
              </el-link>
            </span>
            <span v-else>-</span>
          </div>
        </div>

        <!-- 备件清单 -->
        <div class="detail-section">
          <div class="section-title">备件清单</div>
          <el-table
            v-if="planDetail.requiredSpareParts && planDetail.requiredSpareParts.length > 0"
            :data="planDetail.requiredSpareParts"
            border
            size="small"
          >
            <el-table-column label="序号" type="index" width="60" align="center" />
            <el-table-column label="备件ID" prop="sparePartId" min-width="250" />
            <el-table-column label="数量" prop="quantity" width="100" align="center" />
          </el-table>
          <div v-else class="empty-data">
            暂无备件清单
          </div>
        </div>

        <!-- 基础信息 -->
        <div class="detail-section">
          <div class="section-title">基础信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <label>创建人：</label>
                <span>{{ planDetail.creator ? `${planDetail.creator.name}(${planDetail.creator.email})` : '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>创建时间：</label>
                <span>{{ formatDateTime(planDetail.createdAt) }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>更新人：</label>
                <span>{{ planDetail.updater ? `${planDetail.updater.name}(${planDetail.updater.email})` : '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <label>更新时间：</label>
                <span>{{ formatDateTime(planDetail.updatedAt) }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>

    <!-- 加载状态 -->
    <div v-if="loadingDetail" class="loading-container">
      <el-loading text="正在加载计划详情..." background="rgba(0, 0, 0, 0.1)" />
    </div>

    <!-- 编辑表单抽屉 -->
    <maintenance-plan-form-drawer
      :visible.sync="drawerVisible"
      :mode="'update'"
      :plan-data="planDetail"
      @success="handleEditSuccess"
    />

    <!-- 编辑确认对话框 -->
    <el-dialog
      title="编辑确认"
      :visible.sync="editConfirmVisible"
      width="500px"
      center
    >
      <div class="confirm-content">
        <i class="el-icon-warning-outline confirm-icon" />
        <div class="confirm-text">
          <p><strong>确定要编辑此维护计划吗？</strong></p>
          <p class="confirm-tips">
            • 修改维护周期参数可能会影响未来任务的生成时间<br>
            • 修改设备信息需要确保新设备存在<br>
            • 请谨慎操作，确认后将打开编辑表单
          </p>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editConfirmVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确认编辑</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import MaintenancePlanFormDrawer from './components/MaintenancePlanFormDrawer'
import { getMaintenancePlanById } from './api/maintenance-plan'
import tpmDictionaryMixin from '../mixins/dictionary'
import {
  STATUS_TAG_CONFIG,
  MAINTENANCE_TYPE_TAG_CONFIG,
  CYCLE_TYPE_TAG_CONFIG
} from './constants'
import { parseTime } from '@/utils'

export default {
  name: 'MaintenancePlanEdit',

  components: {
    MaintenancePlanFormDrawer
  },

  mixins: [tpmDictionaryMixin],

  data() {
    return {
      planId: this.$route.params.id,
      planDetail: null,
      loadingDetail: false,
      drawerVisible: false,
      editConfirmVisible: false
    }
  },

  async created() {
    // 加载TPM模块字典
    await this.loadTPMDictionary()
    // 加载计划详情
    this.fetchPlanDetail()
  },

  methods: {
    /**
     * 获取维护计划详情
     */
    async fetchPlanDetail() {
      if (!this.planId) {
        this.$message.error('维护计划ID不能为空')
        this.handleBack()
        return
      }

      try {
        this.loadingDetail = true
        const response = await getMaintenancePlanById(this.planId)
        this.planDetail = response.data
      } catch (error) {
        console.error('获取维护计划详情失败:', error)
        this.$message.error(error.message || '获取维护计划详情失败')
        // 如果计划不存在，返回列表页
        if (error.code === 'MAINTENANCE_PLAN_002') {
          this.handleBack()
        }
      } finally {
        this.loadingDetail = false
      }
    },

    /**
     * 处理编辑按钮点击
     */
    handleEdit() {
      if (!this.planDetail) {
        this.$message.warning('请等待计划详情加载完成')
        return
      }
      this.editConfirmVisible = true
    },

    /**
     * 确认编辑
     */
    confirmEdit() {
      this.editConfirmVisible = false
      this.drawerVisible = true
    },

    /**
     * 编辑成功处理
     */
    handleEditSuccess(updatedPlan) {
      this.$message.success('维护计划更新成功')
      // 更新本地数据
      this.planDetail = updatedPlan
      // 刷新详情数据
      this.fetchPlanDetail()
    },

    /**
     * 返回上一页
     */
    handleBack() {
      // 返回维护计划列表页面
      this.$router.push('/master-data/equipment-tpm-management/maintenance-plan')
    },

    /**
     * 获取状态标签类型
     */
    getStatusTagType(status) {
      return STATUS_TAG_CONFIG.typeMap[status] || 'info'
    },

    /**
     * 获取维护类型标签类型
     */
    getMaintenanceTypeTagType(type) {
      return MAINTENANCE_TYPE_TAG_CONFIG.typeMap[type] || 'info'
    },

    /**
     * 获取周期类型标签类型
     */
    getCycleTypeTagType(type) {
      return CYCLE_TYPE_TAG_CONFIG.typeMap[type] || 'info'
    },

    /**
     * 格式化周期信息
     */
    formatCycleInfo(plan) {
      if (!plan.cycleValue || !plan.cycleUnit) {
        return '-'
      }
      return `每${plan.cycleValue}${plan.cycleUnit}`
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateStr) {
      if (!dateStr) return '-'
      return parseTime(dateStr, '{y}-{m}-{d} {h}:{i}:{s}')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #EBEEF5;

  .header-left {
    display: flex;
    align-items: center;

    .page-title {
      margin: 0 0 0 12px;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.plan-detail-card {
  .detail-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      i {
        margin-right: 8px;
        color: #1976D2;
      }
    }

    .status-tag {
      font-weight: 500;
    }
  }
}

.detail-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #EBEEF5;
  }

  .info-item {
    margin-bottom: 16px;

    label {
      font-size: 13px;
      color: #606266;
      font-weight: 500;
      margin-right: 8px;
      min-width: 100px;
      display: inline-block;
    }

    span {
      color: #303133;
    }

    .content-text {
      color: #303133;
      line-height: 1.6;
      margin-top: 4px;
      padding: 8px 12px;
      background-color: #F5F7FA;
      border-radius: 4px;
      min-height: 40px;
    }
  }
}

.empty-data {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .confirm-icon {
    font-size: 24px;
    color: #E6A23C;
    margin-top: 4px;
  }

  .confirm-text {
    flex: 1;

    p {
      margin: 0 0 12px 0;
      line-height: 1.6;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .confirm-tips {
      font-size: 13px;
      color: #606266;
      line-height: 1.8;
    }
  }
}
</style>

