<!--
  文件名称：RecordDetailDrawer.vue
  文件描述：维护记录详情抽屉组件，用于展示维护记录的完整信息
  创建日期：2025-01-20
  修改记录：
    - 2025-01-20: 初始创建，实现维护记录详情展示功能
-->
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="900px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 加载状态 -->
    <div v-if="loading" v-loading="loading" class="loading-container" element-loading-text="加载中..." />

    <!-- 详情内容 -->
    <div v-else-if="recordData" class="record-detail">
      <!-- 一、基本信息 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-info" />
          一、基本信息
        </div>
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="记录编码">
            <span class="code-text">{{ recordData.recordCode || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="维护日期">
            {{ formatDateTime(recordData.maintenanceDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="维护类型">
            <status-tag
              v-if="recordData.maintenanceType"
              :status="recordData.maintenanceType"
              :text-map="maintenanceTypeConfig.textMap"
              :type-map="maintenanceTypeConfig.typeMap"
              effect="light"
              size="medium"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="维护工时">
            <span class="work-hours-text">{{ formatWorkHours(recordData.workHours) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 二、关联设备信息 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-monitor" />
          二、关联设备信息
        </div>
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="设备编码">
            {{ (recordData.equipment && recordData.equipment.equipmentCode) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="设备名称">
            {{ (recordData.equipment && recordData.equipment.name) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="设备类型">
            {{ (recordData.equipment && recordData.equipment.equipmentType) || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="设备状态">
            <el-tag v-if="recordData.equipment && recordData.equipment.status" size="small" type="info">
              {{ recordData.equipment.status }}
            </el-tag>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 三、关联维护任务 -->
      <div v-if="recordData.maintenanceTask" class="detail-section">
        <div class="section-title">
          <i class="el-icon-document" />
          三、关联维护任务
        </div>
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="任务编码">
            {{ recordData.maintenanceTask.taskCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="任务标题">
            {{ recordData.maintenanceTask.taskTitle || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="任务类型" :span="2">
            {{ recordData.maintenanceTask.taskType || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 四、维护内容详情 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-edit-outline" />
          四、维护内容详情
        </div>
        <el-descriptions :column="1" border size="medium">
          <el-descriptions-item label="维护内容">
            <div class="content-text">{{ recordData.maintenanceContent || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="发现问题">
            <div class="content-text">{{ recordData.problemFound || '-' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="处理措施">
            <div class="content-text">{{ recordData.solutionApplied || '-' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 五、备件使用清单 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-box" />
          五、备件使用清单
        </div>
        <div v-if="hasSparePartsUsed" class="spare-parts-table">
          <el-table
            :data="recordData.sparePartsUsed"
            border
            stripe
            size="small"
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="sparePartCode" label="备件编码" min-width="140" />
            <el-table-column prop="sparePartName" label="备件名称" min-width="180" />
            <el-table-column prop="quantity" label="使用数量" width="120" align="right">
              <template slot-scope="{ row }">
                <span class="quantity-text">{{ row.quantity }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="无使用备件" :image-size="80" />
      </div>

      <!-- 六、人员信息 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-user" />
          六、人员信息
        </div>
        <el-descriptions :column="2" border size="medium">
          <el-descriptions-item label="执行人员">
            <div v-if="recordData.executor">
              <div class="user-name">{{ recordData.executor.name }}</div>
              <div class="user-email">{{ recordData.executor.email || '-' }}</div>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="确认人员">
            <div v-if="recordData.confirmer">
              <div class="user-name">{{ recordData.confirmer.name }}</div>
              <div class="user-email">{{ recordData.confirmer.email || '-' }}</div>
            </div>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 七、设备状态对比 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-s-data" />
          七、设备状态对比
        </div>
        <el-row :gutter="20" class="status-comparison">
          <el-col :span="12">
            <el-card shadow="never" class="status-card status-card--before">
              <div slot="header" class="status-card__header">
                <i class="el-icon-warning-outline" />
                维护前状态
              </div>
              <div class="status-card__content">
                {{ recordData.equipmentStatusBefore || '未记录' }}
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="status-card status-card--after">
              <div slot="header" class="status-card__header">
                <i class="el-icon-circle-check" />
                维护后状态
              </div>
              <div class="status-card__content">
                {{ recordData.equipmentStatusAfter || '未记录' }}
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 八、附件信息 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-paperclip" />
          八、附件信息
        </div>
        <div v-if="hasAttachments" class="attachments-list">
          <el-row :gutter="16">
            <el-col v-for="(attachment, index) in recordData.attachmentUrls" :key="index" :span="12">
              <el-card shadow="hover" class="attachment-card" @click.native="handlePreviewAttachment(attachment)">
                <div class="attachment-info">
                  <i class="el-icon-document" />
                  <div class="attachment-details">
                    <div class="attachment-name">{{ attachment.fileName || '未命名文件' }}</div>
                    <div class="attachment-type">{{ attachment.fileType || '-' }}</div>
                  </div>
                  <el-button
                    type="text"
                    icon="el-icon-download"
                    @click.stop="handleDownloadAttachment(attachment)"
                  >
                    下载
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <el-empty v-else description="暂无附件" :image-size="80" />
      </div>

      <!-- 九、其他信息 -->
      <div class="detail-section">
        <div class="section-title">
          <i class="el-icon-more" />
          九、其他信息
        </div>
        <el-descriptions :column="1" border size="medium">
          <el-descriptions-item label="下次维护建议">
            <div class="content-text">{{ recordData.nextMaintenanceSuggestion || '无' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="创建信息">
            <span v-if="recordData.creator">
              {{ recordData.creator.name }} ({{ recordData.creator.email }})
              于 {{ formatDateTime(recordData.createdAt) }}
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="更新信息">
            <span v-if="recordData.updater">
              {{ recordData.updater.name }} ({{ recordData.updater.email }})
              于 {{ formatDateTime(recordData.updatedAt) }}
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- 错误提示 -->
    <el-empty v-else description="暂无数据" :image-size="100" />

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="recordData" type="primary" icon="el-icon-edit" @click="handleEdit">
          编辑补充信息
        </el-button>
      </div>
    </template>

    <!-- 编辑抽屉 -->
    <record-edit-drawer
      :visible.sync="editDrawerVisible"
      :record-id="recordId"
      @success="handleEditSuccess"
      @close="handleEditClose"
    />
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import RecordEditDrawer from './RecordEditDrawer.vue'
import { getMaintenanceRecordById } from '../api'
import { MAINTENANCE_TYPE_CONFIG, WORK_HOURS_PRECISION } from '../constants/maintenance-record'

export default {
  name: 'RecordDetailDrawer',
  components: {
    BaseDrawer,
    StatusTag,
    RecordEditDrawer
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    recordId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      drawerVisible: false,
      loading: false,
      recordData: null,
      editDrawerVisible: false
    }
  },
  computed: {
    drawerTitle() {
      if (this.recordData) {
        return `维护记录详情 - ${this.recordData.recordCode || ''}`
      }
      return '维护记录详情'
    },
    maintenanceTypeConfig() {
      return MAINTENANCE_TYPE_CONFIG
    },
    hasSparePartsUsed() {
      return this.recordData && this.recordData.sparePartsUsed && this.recordData.sparePartsUsed.length > 0
    },
    hasAttachments() {
      return this.recordData && this.recordData.attachmentUrls && this.recordData.attachmentUrls.length > 0
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.drawerVisible = val
      },
      immediate: true
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    /**
     * 抽屉打开回调
     */
    async handleDrawerOpen() {
      if (this.recordId) {
        await this.loadRecordDetail()
      }
    },

    /**
     * 抽屉关闭回调
     */
    handleDrawerClose() {
      this.recordData = null
      this.$emit('close')
    },

    /**
     * 加载维护记录详情
     */
    async loadRecordDetail() {
      if (!this.recordId) {
        this.$message.warning('缺少维护记录ID')
        return
      }

      this.loading = true
      try {
        const response = await getMaintenanceRecordById(this.recordId)

        if (response.success && response.data) {
          this.recordData = response.data
        } else {
          // 使用后端返回的消息
          this.$message.error(response.message || '获取维护记录详情失败')
          this.handleClose()
        }
      } catch (error) {
        console.error('加载维护记录详情失败:', error)

        // 处理不同类型的错误，优先使用后端返回的错误消息
        let errorMessage = '获取维护记录详情失败'
        if (error.response) {
          const { status, data } = error.response
          if (status === 404) {
            errorMessage = (data && data.error && data.error.message) || '维护记录不存在'
          } else if (status === 401) {
            errorMessage = '请先登录'
          } else if (status === 403) {
            errorMessage = '权限不足'
          } else if (data && data.error && data.error.message) {
            // 优先使用后端返回的错误消息
            errorMessage = data.error.message
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
        this.handleClose()
      } finally {
        this.loading = false
      }
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(value) {
      if (!value) {
        return '-'
      }
      try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return '-'
        }
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
      } catch (error) {
        console.warn('格式化日期失败:', value, error)
        return '-'
      }
    },

    /**
     * 格式化维护工时
     */
    formatWorkHours(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      const hours = parseFloat(value)
      if (Number.isNaN(hours)) {
        return '-'
      }
      return `${hours.toFixed(WORK_HOURS_PRECISION)}小时`
    },

    /**
     * 预览附件
     */
    handlePreviewAttachment(attachment) {
      if (!attachment || !attachment.url) {
        this.$message.warning('附件URL不存在')
        return
      }
      // 在新窗口打开附件
      window.open(attachment.url, '_blank')
    },

    /**
     * 下载附件
     */
    handleDownloadAttachment(attachment) {
      if (!attachment || !attachment.url) {
        this.$message.warning('附件URL不存在')
        return
      }
      // 创建a标签下载
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.fileName || '附件'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    /**
     * 关闭抽屉
     */
    handleClose() {
      this.drawerVisible = false
    },

    /**
     * 打开编辑抽屉
     */
    handleEdit() {
      this.editDrawerVisible = true
    },

    /**
     * 编辑成功回调
     */
    async handleEditSuccess(updatedData) {
      this.$message.success('维护记录更新成功')
      // 重新加载详情
      await this.loadRecordDetail()
      // 通知父组件刷新列表
      this.$emit('update-success', updatedData)
    },

    /**
     * 编辑抽屉关闭回调
     */
    handleEditClose() {
      this.editDrawerVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-detail {
  padding: 0 4px;
}

.detail-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e4e7ed;

    i {
      margin-right: 8px;
      color: #409eff;
      font-size: 18px;
    }
  }
}

// 代码文本样式
.code-text {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
  color: #303133;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

// 工时文本样式
.work-hours-text {
  font-weight: 600;
  color: #409eff;
  font-size: 15px;
}

// 内容文本样式
.content-text {
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
}

// 备件表格样式
.spare-parts-table {
  .quantity-text {
    font-weight: 500;
    color: #303133;
  }
}

// 人员信息样式
.user-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #909399;
}

// 状态对比卡片样式
.status-comparison {
  .status-card {
    height: 100%;

    &__header {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 14px;

      i {
        margin-right: 6px;
        font-size: 16px;
      }
    }

    &__content {
      min-height: 80px;
      line-height: 1.8;
      color: #606266;
      white-space: pre-wrap;
      word-break: break-word;
    }

    &--before {
      .status-card__header {
        color: #e6a23c;

        i {
          color: #e6a23c;
        }
      }

      ::v-deep .el-card__header {
        background: #fdf6ec;
        border-bottom: 1px solid #f5dab1;
      }
    }

    &--after {
      .status-card__header {
        color: #67c23a;

        i {
          color: #67c23a;
        }
      }

      ::v-deep .el-card__header {
        background: #f0f9ff;
        border-bottom: 1px solid #b3d8ff;
      }
    }
  }
}

// 附件列表样式
.attachments-list {
  .attachment-card {
    margin-bottom: 12px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .attachment-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-icon-document {
        font-size: 32px;
        color: #409eff;
        flex-shrink: 0;
      }

      .attachment-details {
        flex: 1;
        min-width: 0;

        .attachment-name {
          font-weight: 500;
          color: #303133;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 4px;
        }

        .attachment-type {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

// 底部按钮样式
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Element UI Descriptions 样式覆盖
::v-deep .el-descriptions {
  .el-descriptions-item__label {
    font-weight: 500;
    color: #606266;
    background: #fafafa;
  }

  .el-descriptions-item__content {
    color: #303133;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .status-comparison {
    .el-col {
      margin-bottom: 12px;
    }
  }

  .attachments-list {
    .el-col {
      width: 100%;
    }
  }
}
</style>

