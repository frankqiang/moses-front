<!--
文件名称：TemplateDetailDrawer.vue
文件描述：工艺模板详情抽屉组件（v2.0架构），展示模板基本信息、12段参数、版本历史、审批记录和引用情况
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建，完成TASK03 P0阶段及P1第7、9、10项任务
-->

<template>
  <Drawer
    :visible.sync="internalVisible"
    :title="drawerTitle"
    :width="drawerWidth"
    :loading="loading"
    :wrapper-closable="false"
    custom-class="template-detail-drawer"
    @close="handleDrawerClose"
  >
    <template #error>
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        :closable="false"
        show-icon
      />
    </template>

    <div v-if="templateDetail" class="template-detail">
      <!-- 基本信息卡片 -->
      <el-card class="detail-card">
        <div slot="header" class="card-header">
          <div class="card-header-left">
            <h3 class="card-title">基本信息</h3>
            <StatusTag
              :status="templateDetail.status"
              :text-map="templateStatusConfig.textMap"
              :type-map="templateStatusConfig.typeMap"
            />
          </div>
          <div class="card-header-actions">
            <ActionButtons
              :buttons="headerActionButtons"
              mode="normal"
              size="mini"
              @click="handleHeaderAction"
            />
          </div>
        </div>

        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="模板编码">
            {{ templateDetail.templateCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="模板名称">
            {{ templateDetail.templateName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="当前版本">
            {{ currentVersion ? currentVersion.versionNumber : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="版本状态">
            <StatusTag
              v-if="currentVersion"
              :status="currentVersion.status"
              :text-map="versionStatusConfig.textMap"
              :type-map="versionStatusConfig.typeMap"
              size="mini"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="适用合金牌号">
            {{ templateDetail.applicableAlloyGrades || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="适用厚度范围">
            {{ templateDetail.applicableThicknessRange ? `${templateDetail.applicableThicknessRange} mm` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="适用宽度范围">
            {{ templateDetail.applicableWidthRange ? `${templateDetail.applicableWidthRange} mm` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="适用产品数量">
            {{ (templateDetail.applicableProducts || []).length }} 个
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">
            {{ formatDateTime(templateDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后更新时间" :span="2">
            {{ formatDateTime(templateDetail.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="templateDetail.description" label="模板描述" :span="2">
            {{ templateDetail.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 适用产品列表 -->
        <div v-if="templateDetail.applicableProducts && templateDetail.applicableProducts.length" class="applicable-products">
          <h4 class="section-subtitle">适用产品</h4>
          <el-table
            :data="templateDetail.applicableProducts"
            size="mini"
            border
            :max-height="200"
          >
            <el-table-column prop="productCode" label="产品编码" width="180" />
            <el-table-column prop="productName" label="产品名称" min-width="200" />
            <el-table-column prop="lifecycleStatus" label="生命周期" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.lifecycleStatus === '量产' ? 'success' : 'info'" size="mini">
                  {{ row.lifecycleStatus }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- 标签页内容 -->
      <el-card class="detail-card">
        <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
          <!-- 12段工艺参数 -->
          <el-tab-pane label="工艺参数" name="parameters">
            <div class="tab-pane-header">
              <h4 class="tab-pane-title">12段工艺参数配置</h4>
              <div class="tab-pane-actions">
                <el-button
                  size="mini"
                  icon="el-icon-printer"
                  @click="handlePrintParameters"
                >
                  打印
                </el-button>
                <el-button
                  size="mini"
                  icon="el-icon-download"
                  @click="handleExportParameters"
                >
                  导出Excel
                </el-button>
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-data-analysis"
                  @click="handleShowCurve"
                >
                  查看曲线
                </el-button>
              </div>
            </div>

            <el-table
              v-if="segments && segments.length"
              :data="segments"
              border
              stripe
              size="small"
              :max-height="500"
              class="parameters-table"
            >
              <el-table-column
                prop="segmentOrder"
                label="段序号"
                width="70"
                align="center"
                fixed="left"
              />
              <el-table-column
                prop="controlMode"
                label="控温方式"
                width="110"
                align="center"
              />
              <el-table-column
                prop="furnaceTemperature"
                label="炉温 (℃)"
                width="110"
                align="center"
              >
                <template #default="{ row }">
                  {{ formatNumber(row.furnaceTemperature) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="materialTemperature"
                label="料温 (℃)"
                width="110"
                align="center"
              >
                <template #default="{ row }">
                  {{ formatNumber(row.materialTemperature) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="timeSet"
                label="时间 (h)"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  {{ formatNumber(row.timeSet) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="runTime"
                label="运行时间 (h)"
                width="120"
                align="center"
              >
                <template #default="{ row }">
                  {{ row.runTime != null ? formatNumber(row.runTime) : '-' }}
                </template>
              </el-table-column>
              <el-table-column
                prop="circulationFanSpeed"
                label="循环风机"
                width="100"
                align="center"
              />
              <el-table-column
                prop="negativePressureFan"
                label="负压风机 (Hz)"
                width="130"
                align="center"
              >
                <template #default="{ row }">
                  {{ formatNumber(row.negativePressureFan) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="cleaningFan"
                label="吹洗风机 (Hz)"
                width="130"
                align="center"
              >
                <template #default="{ row }">
                  {{ formatNumber(row.cleaningFan) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="cleaningTime"
                label="吹洗时间 (min)"
                width="130"
                align="center"
              >
                <template #default="{ row }">
                  {{ formatNumber(row.cleaningTime) }}
                </template>
              </el-table-column>
            </el-table>

            <el-empty
              v-else
              description="暂无工艺参数数据"
              :image-size="120"
            />
          </el-tab-pane>

          <!-- 版本历史 -->
          <el-tab-pane label="版本历史" name="versions">
            <div class="tab-pane-header">
              <h4 class="tab-pane-title">版本历史记录</h4>
              <div class="tab-pane-actions">
                <el-select
                  v-model="versionStatusFilter"
                  size="mini"
                  placeholder="筛选状态"
                  clearable
                  style="width: 120px; margin-right: 8px;"
                  @change="handleVersionStatusChange"
                >
                  <el-option
                    v-for="option in templateVersionStatusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <el-button
                  size="mini"
                  icon="el-icon-refresh"
                  @click="fetchVersionHistory"
                >
                  刷新
                </el-button>
              </div>
            </div>

            <el-timeline v-if="versionHistory && versionHistory.length" class="version-timeline">
              <el-timeline-item
                v-for="version in versionHistory"
                :key="version.id"
                :timestamp="formatDateTime(version.createdAt)"
                placement="top"
                :color="getVersionTimelineColor(version.status)"
              >
                <el-card class="version-card" :class="{ 'is-current': version.id === currentVersion.id }">
                  <div class="version-card-header">
                    <div class="version-info">
                      <span class="version-number">{{ version.versionNumber }}</span>
                      <StatusTag
                        :status="version.status"
                        :text-map="versionStatusConfig.textMap"
                        :type-map="versionStatusConfig.typeMap"
                        size="mini"
                      />
                      <el-tag v-if="version.isLatestVersion" type="primary" size="mini">最新</el-tag>
                      <el-tag v-if="version.id === currentVersion.id" type="success" size="mini">当前查看</el-tag>
                    </div>
                    <el-button
                      v-if="version.id !== currentVersion.id"
                      type="text"
                      size="mini"
                      @click="handleSwitchVersion(version)"
                    >
                      切换查看
                    </el-button>
                  </div>
                  <div v-if="version.versionDescription" class="version-description">
                    {{ version.versionDescription }}
                  </div>
                  <div class="version-meta">
                    <span v-if="version.effectiveDate">生效时间：{{ formatDateTime(version.effectiveDate) }}</span>
                    <span v-if="version.expiryDate">失效时间：{{ formatDateTime(version.expiryDate) }}</span>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <el-empty
              v-else-if="!versionsLoading"
              description="暂无版本历史"
              :image-size="120"
            />

            <div v-if="versionsLoading" class="loading-container">
              <el-skeleton animated :count="3" />
            </div>
          </el-tab-pane>

          <!-- 审批记录 -->
          <el-tab-pane label="审批记录" name="approval">
            <div class="tab-pane-header">
              <h4 class="tab-pane-title">审批流程记录</h4>
              <div class="tab-pane-actions">
                <el-button
                  v-if="approvalRecords && approvalRecords.length"
                  size="mini"
                  icon="el-icon-download"
                  @click="handleExportApprovalRecords"
                >
                  导出记录
                </el-button>
              </div>
            </div>

            <el-timeline v-if="approvalRecords && approvalRecords.length">
              <el-timeline-item
                v-for="(record, index) in approvalRecords"
                :key="`${record.timestamp}-${index}`"
                :timestamp="formatDateTime(record.timestamp)"
                placement="top"
                :color="getApprovalTimelineColor(record.action)"
              >
                <el-card class="approval-card">
                  <div class="approval-action">{{ record.action }}</div>
                  <div class="approval-meta">
                    <span>操作人：{{ record.approverId || '系统' }}</span>
                  </div>
                  <div v-if="record.comment" class="approval-comment">
                    <span class="approval-comment-label">意见：</span>
                    <span class="approval-comment-content">{{ record.comment }}</span>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>

            <el-empty
              v-else
              description="暂无审批记录"
              :image-size="120"
            />
          </el-tab-pane>

          <!-- 引用情况 -->
          <el-tab-pane label="引用情况" name="usage">
            <div class="tab-pane-header">
              <h4 class="tab-pane-title">模板引用情况</h4>
              <div class="tab-pane-actions">
                <el-button
                  size="mini"
                  icon="el-icon-refresh"
                  :loading="usageLoading"
                  @click="fetchUsageInfo"
                >
                  刷新
                </el-button>
              </div>
            </div>

            <div v-if="usageInfo" class="usage-info">
              <!-- 引用统计 -->
              <div class="usage-stats">
                <div class="stat-card">
                  <div class="stat-value">{{ usageInfo.usage.productionPlans.count || 0 }}</div>
                  <div class="stat-label">生产计划引用</div>
                  <div class="stat-detail">活跃：{{ usageInfo.usage.productionPlans.activeCount || 0 }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ usageInfo.usage.productionPlanItems.count || 0 }}</div>
                  <div class="stat-label">计划项引用</div>
                  <div class="stat-detail">活跃：{{ usageInfo.usage.productionPlanItems.activeCount || 0 }}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ usageInfo.usage.products.count || 0 }}</div>
                  <div class="stat-label">关联产品</div>
                </div>
              </div>

              <!-- 引用状态 -->
              <el-alert
                :title="usageInfo.usage.isInUse ? '该模板正在使用中，不可删除或禁用' : '该模板当前未被引用'"
                :type="usageInfo.usage.isInUse ? 'warning' : 'success'"
                :closable="false"
                show-icon
                style="margin-top: 16px;"
              />
            </div>

            <div v-else-if="usageLoading" class="loading-container">
              <el-skeleton animated />
            </div>

            <el-empty
              v-else
              description="未加载引用信息"
              :image-size="120"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <el-empty
      v-else-if="!loading && !errorMessage"
      description="未找到工艺模板数据"
      :image-size="160"
    />

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleDrawerClose">关闭</el-button>
        <el-button type="primary" icon="el-icon-refresh" :loading="loading" @click="handleReload">
          刷新数据
        </el-button>
      </div>
    </template>

    <!-- 温度曲线对话框 -->
    <el-dialog
      title="温度曲线"
      :visible.sync="curveDialog.visible"
      width="960px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      class="curve-dialog"
    >
      <TemperatureCurveViewer
        v-if="curveDialog.visible && segments"
        :segments="segments"
        :template-id="templateId"
        :version-id="currentVersion ? currentVersion.id : ''"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="curveDialog.visible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 审批操作对话框 -->
    <ApprovalDialog
      :visible.sync="approvalDialog.visible"
      :action-type="approvalDialog.actionType"
      :template-info="approvalDialog.templateInfo"
      @confirm="handleApprovalConfirm"
      @cancel="approvalDialog.visible = false"
    />

    <!-- 版本对比对话框 -->
    <VersionCompareDialog
      v-if="versionCompareDialog.visible"
      :visible.sync="versionCompareDialog.visible"
      :template-id="templateId"
      :available-versions="versionHistory"
      :default-base-version-id="currentVersion ? currentVersion.id : ''"
      @close="versionCompareDialog.visible = false"
    />

    <!-- 创建新版本对话框 -->
    <CreateVersionDialog
      v-if="createVersionDialog.visible"
      :visible.sync="createVersionDialog.visible"
      :source-template="templateDetail"
      :available-versions="versionHistory"
      @success="handleCreateVersionSuccess"
      @close="createVersionDialog.visible = false"
    />

    <!-- 快速生效对话框 -->
    <QuickActivateDialog
      v-if="quickActivateDialog.visible"
      :visible.sync="quickActivateDialog.visible"
      :template-info="templateDetail"
      :version-info="currentVersion"
      @success="handleQuickActivateSuccess"
      @close="quickActivateDialog.visible = false"
    />
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import TemperatureCurveViewer from './TemperatureCurveViewer.vue'
import ApprovalDialog from './ApprovalDialog.vue'
import VersionCompareDialog from './VersionCompareDialog.vue'
import CreateVersionDialog from './CreateVersionDialog.vue'
import QuickActivateDialog from './QuickActivateDialog.vue'
import { parseTime } from '@/utils'
import {
  getProcessTemplateDetail,
  fetchProcessTemplateVersions,
  getProcessTemplateUsage,
  deleteProcessTemplate,
  submitProcessTemplateVersion,
  approveProcessTemplateVersion,
  rejectProcessTemplateVersion,
  withdrawProcessTemplateVersion,
  voidProcessTemplateVersion
} from '../api'
import {
  TEMPLATE_STATUS_CONFIG,
  VERSION_STATUS_CONFIG
} from '../constants/process-parameter-management'
import * as XLSX from 'xlsx'
import dictionaryMixin from '../mixins/dictionary'

export default {
  name: 'TemplateDetailDrawer',
  components: {
    Drawer,
    StatusTag,
    ActionButtons,
    TemperatureCurveViewer,
    ApprovalDialog,
    VersionCompareDialog,
    CreateVersionDialog,
    QuickActivateDialog
  },
  mixins: [dictionaryMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    templateId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      internalVisible: false,
      drawerWidth: '1400px',
      loading: false,
      versionsLoading: false,
      usageLoading: false,
      errorMessage: '',
      templateDetail: null,
      currentVersion: null,
      versionHistory: [],
      versionStatusFilter: '',
      usageInfo: null,
      activeTab: 'parameters',
      curveDialog: {
        visible: false
      },
      approvalDialog: {
        visible: false,
        actionType: 'submit',
        templateInfo: null
      },
      versionCompareDialog: {
        visible: false
      },
      createVersionDialog: {
        visible: false
      },
      quickActivateDialog: {
        visible: false
      }
    }
  },
  computed: {
    drawerTitle() {
      if (!this.templateDetail) {
        return '工艺模板详情'
      }
      return `${this.templateDetail.templateName || '工艺模板'} · 详情`
    },
    templateStatusConfig() {
      return TEMPLATE_STATUS_CONFIG
    },
    versionStatusConfig() {
      return VERSION_STATUS_CONFIG
    },
    // versionStatusOptions 已由 mixin 提供（templateVersionStatusOptions）
    segments() {
      if (!this.currentVersion || !this.currentVersion.segments) {
        return []
      }
      // 按段序号排序
      return [...this.currentVersion.segments].sort((a, b) => a.segmentOrder - b.segmentOrder)
    },
    approvalRecords() {
      if (!this.currentVersion || !this.currentVersion.approvalRecords) {
        return []
      }
      // 按时间倒序排列
      return [...this.currentVersion.approvalRecords].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
    },
    headerActionButtons() {
      const buttons = []

      if (!this.currentVersion) {
        return buttons
      }

      const status = this.currentVersion.status

      // 编辑按钮（草稿和驳回状态）
      if (['草稿', '驳回'].includes(status)) {
        buttons.push({
          action: 'edit',
          text: '编辑',
          type: 'primary',
          icon: 'el-icon-edit'
        })
      }

      // 提交审批按钮（草稿和驳回状态）
      if (['草稿', '驳回'].includes(status)) {
        buttons.push({
          action: 'submit',
          text: '提交审批',
          type: 'success',
          icon: 'el-icon-upload2'
        })
      }

      // 审批通过按钮（待审批状态）
      if (status === '待审批') {
        buttons.push({
          action: 'approve',
          text: '审批通过',
          type: 'success',
          icon: 'el-icon-circle-check'
        })
      }

      // 审批驳回按钮（待审批状态）
      if (status === '待审批') {
        buttons.push({
          action: 'reject',
          text: '审批驳回',
          type: 'warning',
          icon: 'el-icon-circle-close'
        })
      }

      // 撤回审批按钮（待审批状态）
      if (status === '待审批') {
        buttons.push({
          action: 'withdraw',
          text: '撤回审批',
          type: 'info',
          icon: 'el-icon-refresh-left'
        })
      }

      // 作废版本按钮（生效状态）
      if (status === '生效') {
        buttons.push({
          action: 'void',
          text: '作废版本',
          type: 'danger',
          icon: 'el-icon-circle-close'
        })
      }

      // 复制按钮
      buttons.push({
        action: 'copy',
        text: '复制',
        type: 'default',
        icon: 'el-icon-document-copy'
      })

      // 创建新版本按钮
      buttons.push({
        action: 'createVersion',
        text: '创建新版本',
        type: 'default',
        icon: 'el-icon-plus'
      })

      // 版本对比按钮（有多个版本时显示）
      if (this.versionHistory && this.versionHistory.length >= 2) {
        buttons.push({
          action: 'compareVersions',
          text: '版本对比',
          type: 'default',
          icon: 'el-icon-sort'
        })
      }

      // 快速生效按钮（非生效状态）
      if (status !== '生效') {
        buttons.push({
          action: 'quickActivate',
          text: '快速生效',
          type: 'warning',
          icon: 'el-icon-video-play'
        })
      }

      // 删除按钮（非生效状态且未被引用）
      if (this.templateDetail && this.templateDetail.status !== '生效' && this.usageInfo && !this.usageInfo.usage.isInUse) {
        buttons.push({
          action: 'delete',
          text: '删除',
          type: 'danger',
          icon: 'el-icon-delete'
        })
      }

      return buttons
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.internalVisible = val
        if (val) {
          this.initialize()
        }
      }
    },
    internalVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.resetState()
      }
    },
    activeTab(newTab) {
      // 切换到特定标签页时加载数据
      if (newTab === 'versions' && !this.versionHistory.length) {
        this.fetchVersionHistory()
      } else if (newTab === 'usage' && !this.usageInfo) {
        this.fetchUsageInfo()
      }
    }
  },
  methods: {
    async initialize() {
      if (!this.templateId) {
        this.errorMessage = '缺少模板ID，无法加载详情'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.activeTab = 'parameters'

      try {
        const response = await getProcessTemplateDetail(this.templateId)
        this.templateDetail = response.data || null

        if (this.templateDetail) {
          // 设置当前版本为最新版本
          this.currentVersion = this.templateDetail.latestVersion || null

          // 如果当前标签是版本历史，则加载版本历史
          if (this.activeTab === 'versions') {
            await this.fetchVersionHistory()
          }

          // 如果当前标签是引用情况，则加载引用信息
          if (this.activeTab === 'usage') {
            await this.fetchUsageInfo()
          }
        }
      } catch (error) {
        console.error('[TemplateDetailDrawer] initialize failed', error)
        this.errorMessage = error.message || '加载工艺模板详情失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    async fetchVersionHistory() {
      if (!this.templateId) {
        return
      }

      this.versionsLoading = true
      try {
        const params = {
          page: 1,
          limit: 50,
          sortBy: 'createdAt:desc'
        }

        if (this.versionStatusFilter) {
          params.status = this.versionStatusFilter
        }

        const response = await fetchProcessTemplateVersions(this.templateId, params)
        const versions = response.data?.versions
        this.versionHistory = (versions && versions.results) || []
      } catch (error) {
        console.error('[TemplateDetailDrawer] fetchVersionHistory failed', error)
        this.$message.error(error.message || '获取版本历史失败')
      } finally {
        this.versionsLoading = false
      }
    },

    async fetchUsageInfo() {
      if (!this.templateId) {
        return
      }

      this.usageLoading = true
      try {
        const response = await getProcessTemplateUsage(this.templateId)
        this.usageInfo = response.data || null
      } catch (error) {
        console.error('[TemplateDetailDrawer] fetchUsageInfo failed', error)
        this.$message.error(error.message || '获取引用情况失败')
      } finally {
        this.usageLoading = false
      }
    },

    handleVersionStatusChange() {
      this.fetchVersionHistory()
    },

    handleSwitchVersion(version) {
      this.currentVersion = version
      this.activeTab = 'parameters'
      this.$message.success(`已切换到版本 ${version.versionNumber}`)
    },

    handleTabClick(tab) {
      // 标签页切换逻辑在 watch 中处理
    },

    handleHeaderAction({ action }) {
      switch (action) {
        case 'edit':
          this.$emit('edit', {
            templateId: this.templateId,
            versionId: this.currentVersion ? this.currentVersion.id : ''
          })
          break
        case 'copy':
          this.$emit('copy', {
            templateId: this.templateId,
            version: this.currentVersion
          })
          break
        case 'createVersion':
          this.handleOpenCreateVersionDialog()
          break
        case 'compareVersions':
          this.handleOpenVersionCompareDialog()
          break
        case 'quickActivate':
          this.handleOpenQuickActivateDialog()
          break
        case 'delete':
          this.handleDelete()
          break
        case 'submit':
          this.handleOpenApprovalDialog('submit')
          break
        case 'approve':
          this.handleOpenApprovalDialog('approve')
          break
        case 'reject':
          this.handleOpenApprovalDialog('reject')
          break
        case 'withdraw':
          this.handleOpenApprovalDialog('withdraw')
          break
        case 'void':
          this.handleOpenApprovalDialog('void')
          break
      }
    },

    async handleDelete() {
      try {
        await this.$confirm(
          `确认删除工艺模板 "${this.templateDetail.templateName}" 吗？删除后将无法恢复。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        this.loading = true
        const response = await deleteProcessTemplate(this.templateId)
        this.$message.success(response.message || '删除成功')
        this.$emit('deleted', { templateId: this.templateId })
        this.handleDrawerClose()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('[TemplateDetailDrawer] handleDelete failed', error)
          this.$message.error(error.message || '删除失败')
        }
      } finally {
        this.loading = false
      }
    },

    // 打开审批对话框
    handleOpenApprovalDialog(actionType) {
      if (!this.templateDetail || !this.currentVersion) {
        this.$message.error('缺少必要的模板信息')
        return
      }

      this.approvalDialog.actionType = actionType
      this.approvalDialog.templateInfo = {
        templateCode: this.templateDetail.templateCode,
        templateName: this.templateDetail.templateName,
        versionNumber: this.currentVersion.versionNumber,
        status: this.currentVersion.status
      }
      this.approvalDialog.visible = true
    },

    // 处理审批操作确认
    async handleApprovalConfirm(payload) {
      try {
        this.loading = true
        this.approvalDialog.visible = false

        const templateId = this.templateId
        const versionId = this.currentVersion.id
        const actionType = this.approvalDialog.actionType

        let response

        switch (actionType) {
          case 'submit':
            response = await submitProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'approve':
            response = await approveProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'reject':
            response = await rejectProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'withdraw':
            response = await withdrawProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'void':
            response = await voidProcessTemplateVersion(templateId, versionId, payload)
            break
          default:
            throw new Error('未知的审批操作类型')
        }

        this.$message.success(response.message || '操作成功')

        // 刷新模板详情和版本历史
        await this.initialize()

        // 通知父组件刷新列表
        this.$emit('approval-success', {
          templateId,
          versionId,
          actionType
        })
      } catch (error) {
        console.error('[TemplateDetailDrawer] handleApprovalConfirm failed', error)
        this.$message.error(error.message || '操作失败')
      } finally {
        this.loading = false
      }
    },

    handlePrintParameters() {
      window.print()
    },

    handleExportParameters() {
      if (!this.segments || !this.segments.length) {
        this.$message.warning('暂无工艺参数可导出')
        return
      }

      try {
        // 准备导出数据
        const exportData = this.segments.map(segment => ({
          '段序号': segment.segmentOrder,
          '控温方式': segment.controlMode,
          '炉温(℃)': segment.furnaceTemperature,
          '料温(℃)': segment.materialTemperature,
          '时间(h)': segment.timeSet,
          '运行时间(h)': segment.runTime != null ? segment.runTime : '-',
          '循环风机': segment.circulationFanSpeed,
          '负压风机(Hz)': segment.negativePressureFan,
          '吹洗风机(Hz)': segment.cleaningFan,
          '吹洗时间(min)': segment.cleaningTime
        }))

        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, '工艺参数')

        // 导出文件
        const fileName = `${this.templateDetail.templateCode}_${this.currentVersion.versionNumber}_工艺参数_${Date.now()}.xlsx`
        XLSX.writeFile(wb, fileName)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('[TemplateDetailDrawer] handleExportParameters failed', error)
        this.$message.error('导出失败')
      }
    },

    handleShowCurve() {
      this.curveDialog.visible = true
    },

    handleExportApprovalRecords() {
      if (!this.approvalRecords || !this.approvalRecords.length) {
        this.$message.warning('暂无审批记录可导出')
        return
      }

      try {
        const exportData = this.approvalRecords.map(record => ({
          '操作': record.action,
          '操作人': record.approverId || '系统',
          '意见': record.comment || '-',
          '时间': this.formatDateTime(record.timestamp)
        }))

        const ws = XLSX.utils.json_to_sheet(exportData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, '审批记录')

        const fileName = `${this.templateDetail.templateCode}_${this.currentVersion.versionNumber}_审批记录_${Date.now()}.xlsx`
        XLSX.writeFile(wb, fileName)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('[TemplateDetailDrawer] handleExportApprovalRecords failed', error)
        this.$message.error('导出失败')
      }
    },

    handleReload() {
      this.initialize()
    },

    handleDrawerClose() {
      this.internalVisible = false
      this.$emit('close')
    },

    resetState() {
      this.templateDetail = null
      this.currentVersion = null
      this.versionHistory = []
      this.versionStatusFilter = ''
      this.usageInfo = null
      this.errorMessage = ''
      this.activeTab = 'parameters'
      this.loading = false
      this.versionsLoading = false
      this.usageLoading = false
    },

    // 打开版本对比对话框
    async handleOpenVersionCompareDialog() {
      // 确保版本历史已加载
      if (!this.versionHistory || this.versionHistory.length < 2) {
        await this.fetchVersionHistory()
      }

      if (this.versionHistory.length < 2) {
        this.$message.warning('至少需要两个版本才能进行对比')
        return
      }

      this.versionCompareDialog.visible = true
    },

    // 打开创建新版本对话框
    async handleOpenCreateVersionDialog() {
      // 确保版本历史已加载
      if (!this.versionHistory || this.versionHistory.length === 0) {
        await this.fetchVersionHistory()
      }

      this.createVersionDialog.visible = true
    },

    // 打开快速生效对话框
    handleOpenQuickActivateDialog() {
      if (!this.templateDetail || !this.currentVersion) {
        this.$message.error('缺少必要的模板信息')
        return
      }

      this.quickActivateDialog.visible = true
    },

    // 处理创建新版本成功
    async handleCreateVersionSuccess(data) {
      this.createVersionDialog.visible = false

      // 刷新模板详情和版本历史
      await this.initialize()

      // 切换到版本历史标签页
      this.activeTab = 'versions'
    },

    // 处理快速生效成功
    async handleQuickActivateSuccess(data) {
      this.quickActivateDialog.visible = false

      // 刷新模板详情和版本历史
      await this.initialize()
    },

    formatDateTime(timestamp) {
      if (!timestamp) {
        return '-'
      }
      return parseTime(timestamp, '{y}-{m}-{d} {h}:{i}')
    },

    formatNumber(value) {
      if (value == null) {
        return '-'
      }
      return Number(value).toFixed(2)
    },

    getVersionTimelineColor(status) {
      const colorMap = {
        '草稿': '#909399',
        '待审批': '#E6A23C',
        '生效': '#67C23A',
        '历史': '#C0C4CC',
        '驳回': '#F56C6C',
        '作废': '#909399'
      }
      return colorMap[status] || '#409EFF'
    },

    getApprovalTimelineColor(action) {
      const colorMap = {
        '提交审批': '#409EFF',
        '审批通过': '#67C23A',
        '审批驳回': '#F56C6C',
        '撤回审批': '#E6A23C',
        '作废版本': '#909399',
        '快速生效': '#67C23A'
      }
      return colorMap[action] || '#409EFF'
    }
  }
}
</script>

<style lang="scss" scoped>
.template-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  ::v-deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  ::v-deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header-actions {
  display: flex;
  gap: 8px;
}

.section-subtitle {
  margin: 20px 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.applicable-products {
  margin-top: 20px;
}

.tab-pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tab-pane-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.tab-pane-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.parameters-table {
  ::v-deep(.el-table__header) {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
  }
}

.version-timeline {
  padding: 0 20px;
}

.version-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.2s;

  &.is-current {
    border-color: #409eff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  ::v-deep(.el-card__body) {
    padding: 12px 16px;
  }
}

.version-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-number {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.version-description {
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.version-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.approval-card {
  border-radius: 8px;
  border: 1px solid #ebeef5;

  ::v-deep(.el-card__body) {
    padding: 12px 16px;
  }
}

.approval-action {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.approval-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.approval-comment {
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
}

.approval-comment-label {
  color: #909399;
  margin-right: 8px;
}

.approval-comment-content {
  color: #606266;
}

.usage-info {
  padding: 0 20px;
}

.usage-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 4px;
}

.stat-detail {
  font-size: 12px;
  opacity: 0.8;
}

.loading-container {
  padding: 20px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
}

::v-deep(.el-tabs--border-card) {
  border-radius: 12px;
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

::v-deep(.el-tabs__item) {
  font-size: 14px;
}

::v-deep(.el-descriptions) {
  background-color: #ffffff;
}

@media print {
  .detail-card {
    page-break-inside: avoid;
  }

  .card-header-actions,
  .tab-pane-actions,
  .drawer-footer {
    display: none !important;
  }
}
</style>

