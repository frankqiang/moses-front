<!--
文件名称：VersionCenterDrawer.vue
文件描述：工艺模板版本中心抽屉组件，提供版本列表与基础概览展示
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，完成TASK006 P0-1阶段需求
  - 2025-10-08: 新增"创建新版本"对话框功能，完成TASK006 P0-6
-->

<template>
  <div class="version-center-container">
    <Drawer
      :visible.sync="internalVisible"
      :title="drawerTitle"
      :width="drawerWidth"
      :loading="loading"
      :wrapper-closable="false"
      custom-class="version-center-drawer"
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

      <div
        v-if="templateDetail"
        class="version-center"
      >
        <aside class="version-center__sidebar">
          <div class="version-center__sidebar-header">
            <div class="version-center__template-name" :title="templateDetail.templateName">
              {{ templateDetail.templateName || '未命名模板' }}
            </div>
            <StatusTag
              v-if="templateDetail.status"
              :status="templateDetail.status"
              :text-map="templateStatusConfig.textMap"
              :type-map="templateStatusConfig.typeMap"
              size="mini"
            />
          </div>

          <div class="version-center__sidebar-subtitle">
            版本列表
          </div>

          <div class="version-center__sidebar-actions">
            <el-select
              v-model="versionStatusFilter"
              size="mini"
              placeholder="筛选版本状态"
              style="flex: 1;"
              @change="handleVersionStatusChange"
            >
              <el-option label="全部状态" value="ALL" />
              <el-option
                v-for="option in templateVersionStatusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-button
              type="primary"
              size="mini"
              plain
              @click="handleLocateActiveVersion"
            >
              定位生效版本
            </el-button>
          </div>

          <el-scrollbar class="version-center__version-scroll">
            <el-empty
              v-if="!versionList.length && !versionsLoading"
              description="暂无版本"
              :image-size="120"
            />

            <el-skeleton
              v-else-if="versionsLoading"
              animated
              :count="3"
              :throttle="200"
            >
              <template #template>
                <div class="version-item version-item--skeleton">
                  <el-skeleton-item variant="text" style="width: 60%" />
                  <el-skeleton-item variant="text" style="width: 40%" />
                  <el-skeleton-item variant="text" style="width: 80%" />
                </div>
              </template>
            </el-skeleton>

            <div
              v-for="version in versionList"
              v-else
              :key="version.id"
              class="version-item"
              :class="{ 'is-active': version.id === selectedVersionId }"
              @click="handleVersionSelect(version.id)"
            >
              <div class="version-item__header">
                <div class="version-item__row">
                  <span class="version-item__title">{{ version.versionNumber }}</span>
                  <StatusTag
                    v-if="version.status"
                    :status="version.status"
                    :text-map="versionStatusConfig.textMap"
                    :type-map="versionStatusConfig.typeMap"
                    size="mini"
                  />
                </div>
                <div v-if="version.isLatestVersion" class="version-item__badge">
                  最新版本
                </div>
              </div>
              <div class="version-item__meta">
                <span>{{ formatVersionMeta(version) }}</span>
              </div>
            </div>
          </el-scrollbar>
        </aside>

        <section class="version-center__content">
          <div class="version-overview-header">
            <div class="version-overview-header__title">
              <h3 class="version-overview-header__name">
                {{ (selectedVersion && selectedVersion.versionNumber) || '未选择版本' }}
              </h3>
              <StatusTag
                v-if="selectedVersion && selectedVersion.status"
                :status="selectedVersion.status"
                :text-map="versionStatusConfig.textMap"
                :type-map="versionStatusConfig.typeMap"
                size="small"
              />
            </div>
            <div v-if="selectedVersion" class="version-overview-header__actions">
              <ActionButtons
                :buttons="approvalButtons"
                mode="normal"
                size="mini"
                @click="handleApprovalAction"
              />
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-data-analysis"
                :disabled="!selectedVersion"
                @click="openCurveViewer"
              >
                查看曲线
              </el-button>
            </div>
            <p class="version-overview-header__description">
              {{ (selectedVersion && selectedVersion.versionDescription) || '尚未填写版本说明' }}
            </p>

            <div class="version-overview-header__meta">
              <div class="version-meta-item">
                <span class="version-meta-item__label">创建时间</span>
                <span class="version-meta-item__value">{{ formatDateTime(selectedVersion && selectedVersion.createdAt) }}</span>
              </div>
              <div class="version-meta-item">
                <span class="version-meta-item__label">最后更新时间</span>
                <span class="version-meta-item__value">{{ formatDateTime(selectedVersion && selectedVersion.updatedAt) }}</span>
              </div>
              <div class="version-meta-item">
                <span class="version-meta-item__label">生效时间</span>
                <span class="version-meta-item__value">{{ formatDateTime(selectedVersion && selectedVersion.effectiveDate) }}</span>
              </div>
              <div class="version-meta-item">
                <span class="version-meta-item__label">失效时间</span>
                <span class="version-meta-item__value">{{ formatDateTime(selectedVersion && selectedVersion.expiryDate) }}</span>
              </div>
            </div>
          </div>

          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="版本概览" name="overview">
              <el-descriptions
                v-if="selectedVersion"
                :column="2"
                border
                size="small"
              >
                <el-descriptions-item label="模板编码">
                  {{ templateDetail.templateCode || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="模板状态">
                  <StatusTag
                    :status="templateDetail.status"
                    :text-map="templateStatusConfig.textMap"
                    :type-map="templateStatusConfig.typeMap"
                    size="mini"
                  />
                </el-descriptions-item>
                <el-descriptions-item label="版本状态">
                  <StatusTag
                    :status="selectedVersion.status"
                    :text-map="versionStatusConfig.textMap"
                    :type-map="versionStatusConfig.typeMap"
                    size="mini"
                  />
                </el-descriptions-item>
                <el-descriptions-item label="适用产品数量">
                  {{ (templateDetail.applicableProducts || []).length || 0 }}
                </el-descriptions-item>
                <el-descriptions-item label="最新版本">
                  {{ (templateDetail.latestVersion && templateDetail.latestVersion.versionNumber) || '-' }}
                </el-descriptions-item>
              </el-descriptions>
              <el-empty v-else description="请选择版本" />
            </el-tab-pane>

            <el-tab-pane label="审批历史" name="approval">
              <div class="approval-actions">
                <el-button
                  v-if="selectedVersion && (selectedVersion.approvalRecords || []).length"
                  size="mini"
                  icon="el-icon-download"
                  @click="handleExportApprovalLog"
                >
                  导出审批记录
                </el-button>
              </div>
              <el-timeline v-if="selectedVersion && (selectedVersion.approvalRecords || []).length">
                <el-timeline-item
                  v-for="(record, index) in formattedApprovalRecords"
                  :key="`${record.timestamp}-${index}`"
                  :timestamp="record.timestampText"
                  placement="top"
                  :color="record.color"
                >
                  <div class="approval-record">
                    <div class="approval-record__action">{{ record.action }}</div>
                    <div class="approval-record__meta">
                      <span>{{ record.operator }}</span>
                      <span v-if="record.comment" class="approval-record__comment">{{ record.comment }}</span>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
              <el-empty
                v-else
                description="暂无审批记录"
                :image-size="140"
              />
            </el-tab-pane>

            <el-tab-pane label="版本对比" name="compare">
              <VersionComparePanel
                v-if="selectedVersion && activeTab === 'compare'"
                :template-id="templateId"
                :current-version="selectedVersion"
              />
              <el-empty
                v-else-if="!selectedVersion"
                description="请选择需要对比的版本"
                :image-size="160"
              />
            </el-tab-pane>

            <el-tab-pane label="参数配置" name="parameters">
              <VersionParametersPanel
                v-if="selectedVersion && activeTab === 'parameters'"
                :key="selectedVersion.id"
                :template-id="templateId"
                :version="selectedVersion"
                :editable="isVersionEditable(selectedVersion)"
                :saving="saving"
                :comparison-versions="curveComparisonVersions"
                :device-capability="curveDeviceCapability"
                :force-refresh-key="selectedVersionId"
                @save="handleParametersSave"
                @change="handleParametersChange"
              />
              <el-empty
                v-else
                description="请选择需要查看的版本"
                :image-size="160"
              />
            </el-tab-pane>
          </el-tabs>
        </section>
      </div>

      <el-empty
        v-else-if="!loading && !errorMessage"
        description="未找到工艺模板数据"
      />

      <template #footer>
        <div class="version-center__footer">
          <el-button @click="handleDrawerClose">关闭</el-button>
          <el-button type="primary" :loading="loading" @click="handleReload">刷新数据</el-button>
        </div>
      </template>
    </Drawer>

    <el-dialog
      title="温度曲线"
      :visible.sync="showCurveViewer"
      width="960px"
      append-to-body
      destroy-on-close
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="version-center__curve-dialog"
    >
      <TemperatureCurveViewer
        v-if="selectedVersion"
        :segments="selectedVersion.segments || []"
        :comparison-versions="curveComparisonVersions"
        :template-id="templateId"
        :version-id="selectedVersion.id"
        :device-capability="curveDeviceCapability"
      />
      <el-empty v-else description="暂无版本信息" />

      <span slot="footer" class="dialog-footer">
        <el-button @click="showCurveViewer = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 创建新版本对话框 -->
    <el-dialog
      title="创建新版本"
      :visible.sync="createNewVersionDialog.visible"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
      class="create-new-version-dialog"
      @close="handleCreateNewVersionDialogClose"
    >
      <el-alert
        title="创建新版本说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px;"
      >
        <template slot="default">
          <p style="margin: 0 0 8px;">将在当前模板下创建一个新版本，新版本号在同一模板下必须唯一。</p>
          <p style="margin: 0;">新版本会复制指定源版本的所有工艺参数配置，初始状态为"草稿"。</p>
        </template>
      </el-alert>

      <el-form
        ref="createNewVersionForm"
        :model="createNewVersionDialog.formData"
        :rules="createNewVersionRules"
        label-width="100px"
        size="small"
      >
        <el-form-item label="新版本号" prop="newVersionNumber">
          <el-input
            v-model="createNewVersionDialog.formData.newVersionNumber"
            placeholder="请输入版本号，格式如 v1.1 或 1.1"
            clearable
          />
        </el-form-item>

        <el-form-item label="版本说明" prop="versionDescription">
          <el-input
            v-model="createNewVersionDialog.formData.versionDescription"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
            placeholder="请描述新版本的主要变更内容、优化点等（选填）"
          />
        </el-form-item>

        <el-form-item label="源版本" prop="copyFromVersionId">
          <el-select
            v-model="createNewVersionDialog.formData.copyFromVersionId"
            placeholder="请选择要复制的源版本（默认为最新版本）"
            clearable
            style="width: 100%;"
          >
            <el-option
              v-for="version in versionList"
              :key="version.id"
              :label="`${version.versionNumber} (${version.status})`"
              :value="version.id"
            />
          </el-select>
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            选择一个已有版本作为新版本的基础，留空则使用最新版本
          </div>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCreateNewVersionDialogClose">取消</el-button>
        <el-button
          type="primary"
          :loading="createNewVersionDialog.loading"
          @click="handleCreateNewVersionSubmit"
        >
          创建
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import Drawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import VersionParametersPanel from './VersionParametersPanel.vue'
import TemperatureCurveViewer from './TemperatureCurveViewer.vue'
import VersionComparePanel from './VersionComparePanel.vue'
import { parseTime } from '@/utils'
import { cloneDeep } from 'lodash'
import {
  getProcessTemplateDetail,
  fetchProcessTemplateVersions,
  updateProcessTemplateVersion,
  submitProcessTemplateVersion,
  approveProcessTemplateVersion,
  rejectProcessTemplateVersion,
  withdrawProcessTemplateVersion,
  activateProcessTemplateVersion,
  voidProcessTemplateVersion,
  createNewVersion
} from '../api'
import {
  TEMPLATE_STATUS_CONFIG,
  VERSION_STATUS_CONFIG,
  VERSION_STATUS
} from '../constants/process-parameter-management'
import dictionaryMixin from '../mixins/dictionary'

const DEFAULT_VERSION_SORT = 'createdAt:desc'

export default {
  name: 'VersionCenterDrawer',
  components: {
    Drawer,
    StatusTag,
    ActionButtons,
    VersionParametersPanel,
    TemperatureCurveViewer,
    VersionComparePanel
  },
  mixins: [dictionaryMixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    templateId: {
      type: String,
      default: ''
    },
    defaultVersionId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      internalVisible: false,
      drawerWidth: '1800px',
      loading: false,
      versionsLoading: false,
      errorMessage: '',
      templateDetail: null,
      versionList: [],
      versionPagination: {
        page: 1,
        limit: 30,
        totalResults: 0
      },
      selectedVersionId: '',
      activeTab: 'overview',
      saving: false,
      pendingChanges: null,
      pendingActions: {},
      versionStatusFilter: 'ALL',
      showCurveViewer: false,
      curveComparisonVersions: [],
      curveDeviceCapability: {
        min: 0,
        max: 1200
      },
      createNewVersionDialog: {
        visible: false,
        loading: false,
        formData: {
          newVersionNumber: '',
          versionDescription: '',
          copyFromVersionId: ''
        }
      }
    }
  },
  computed: {
    createNewVersionRules() {
      return {
        newVersionNumber: [
          { required: true, message: '新版本号不能为空', trigger: 'blur' },
          {
            pattern: /^(v?\d+(\.\d+)?)$/,
            message: '版本号格式应为 v1.0 或 1.0',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback()
                return
              }
              // 检查版本号是否已存在
              const exists = this.versionList.some(v => {
                const normalizedExisting = v.versionNumber.toLowerCase().replace(/^v/, '')
                const normalizedInput = value.toLowerCase().replace(/^v/, '')
                return normalizedExisting === normalizedInput
              })
              if (exists) {
                callback(new Error('该版本号已存在，请使用其他版本号'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        versionDescription: [
          { max: 2000, message: '版本说明不能超过2000个字符', trigger: 'blur' }
        ]
      }
    },
    drawerTitle() {
      if (!this.templateDetail) {
        return '版本中心'
      }
      return `${this.templateDetail.templateName || '工艺模板'} · 版本中心`
    },
    templateStatusConfig() {
      return TEMPLATE_STATUS_CONFIG
    },
    versionStatusConfig() {
      return VERSION_STATUS_CONFIG
    },
    // versionStatusOptions 已由 mixin 提供（templateVersionStatusOptions）
    selectedVersion() {
      if (!this.selectedVersionId) {
        return null
      }
      return this.versionList.find(item => item && item.id === this.selectedVersionId) || null
    },
    formattedApprovalRecords() {
      if (!this.selectedVersion || !this.selectedVersion.approvalRecords) {
        return []
      }
      const records = [...this.selectedVersion.approvalRecords].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return timeB - timeA
      })
      return records.map(record => ({
        ...record,
        timestampText: this.formatDateTime(record.timestamp),
        operator: record.approverId || '系统',
        color: this.getApprovalColor(record.action)
      }))
    },
    approvalButtons() {
      if (!this.selectedVersion) {
        return []
      }
      const version = this.selectedVersion
      const buttons = []
      if (this.canSubmit(version)) {
        buttons.push({
          action: 'submitApproval',
          text: '提交审批',
          type: 'primary',
          icon: 'el-icon-s-promotion',
          loading: this.isActionLoading('submitApproval'),
          disabled: this.saving
        })
      }
      if (this.canApprove(version)) {
        buttons.push({
          action: 'approve',
          text: '审批通过',
          type: 'success',
          icon: 'el-icon-check',
          loading: this.isActionLoading('approve'),
          disabled: this.saving
        })
      }
      if (this.canReject(version)) {
        buttons.push({
          action: 'reject',
          text: '审批驳回',
          type: 'danger',
          icon: 'el-icon-close',
          loading: this.isActionLoading('reject'),
          disabled: this.saving
        })
      }
      if (this.canWithdraw(version)) {
        buttons.push({
          action: 'withdraw',
          text: '撤回审批',
          type: 'warning',
          icon: 'el-icon-refresh-left',
          loading: this.isActionLoading('withdraw'),
          disabled: this.saving
        })
      }
      if (this.canActivate(version)) {
        buttons.push({
          action: 'activate',
          text: '快速生效',
          type: 'primary',
          icon: 'el-icon-lightning',
          confirmText: '确认直接将该版本标记为生效吗？',
          loading: this.isActionLoading('activate'),
          disabled: this.saving
        })
      }
      if (this.canVoid(version)) {
        buttons.push({
          action: 'void',
          text: '作废版本',
          type: 'danger',
          icon: 'el-icon-delete',
          confirmText: '确认作废该版本吗？一旦作废将无法恢复',
          loading: this.isActionLoading('void'),
          disabled: this.saving
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
    templateId(val, oldVal) {
      if (this.internalVisible && val && val !== oldVal) {
        this.initialize()
      }
    },
    versionList(newList) {
      if (!Array.isArray(newList)) {
        return
      }
      if (!this.selectedVersionId && newList.length) {
        this.selectedVersionId = newList[0].id || ''
        return
      }
      if (this.selectedVersionId && !newList.some(item => item && item.id === this.selectedVersionId)) {
        this.selectedVersionId = newList[0] ? newList[0].id : ''
      }
    },
    selectedVersionId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        const selected = this.versionList.find(item => item && item.id === newVal)
        if (selected) {
          this.prepareCurveComparison()
        }
      }
    }
  },
  methods: {
    async initialize() {
      if (!this.templateId) {
        this.errorMessage = '缺少模板ID，无法加载版本信息'
        return
      }

      this.loading = true
      this.errorMessage = ''
      this.activeTab = 'overview'

      try {
        const [detailResponse] = await Promise.all([
          getProcessTemplateDetail(this.templateId),
          this.fetchVersionList({ reset: true })
        ])

        this.templateDetail = detailResponse.data || null

        const latestVersion = detailResponse.data && detailResponse.data.latestVersion
        if (latestVersion) {
          this.ensureVersionInList(latestVersion)
        }

        this.resolveDefaultSelection()
        this.prepareCurveComparison()
      } catch (error) {
        console.error('[VersionCenterDrawer] initialize failed', error)
        this.errorMessage = (error && error.message) || '加载工艺模板版本信息失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    async fetchVersionList({ reset = false } = {}) {
      if (!this.templateId) {
        return null
      }

      if (reset) {
        this.versionsLoading = true
        this.versionPagination.page = 1
      }

      try {
        const response = await fetchProcessTemplateVersions(this.templateId, {
          page: this.versionPagination.page,
          limit: this.versionPagination.limit,
          sortBy: DEFAULT_VERSION_SORT,
          status: this.versionStatusFilter !== 'ALL' ? this.versionStatusFilter : undefined
        })

        const versions = response.data && response.data.versions
        const list = (versions && versions.list) || []
        const pagination = versions && versions.pagination
        this.versionPagination = {
          page: (pagination && pagination.page) || this.versionPagination.page,
          limit: (pagination && pagination.limit) || this.versionPagination.limit,
          totalResults: (pagination && pagination.totalResults) || list.length
        }

        if (reset) {
          this.versionList = list
        } else {
          this.versionList = this.mergeVersionList(this.versionList, list)
        }

        const latestVersionFromDetail = this.templateDetail && this.templateDetail.latestVersion
        if (latestVersionFromDetail) {
          const latestFromList = list.find(item => item && item.id === latestVersionFromDetail.id)
          const enrichedLatest = latestFromList ? { ...latestFromList } : { ...latestVersionFromDetail }
          this.ensureVersionInList(enrichedLatest)
        }

        return response
      } catch (error) {
        console.error('[VersionCenterDrawer] fetchVersionList failed', error)
        if (!this.errorMessage) {
          this.errorMessage = (error && error.message) || '获取版本列表失败，请稍后重试'
        }
        return null
      } finally {
        if (reset) {
          this.versionsLoading = false
        }
      }
    },

    ensureVersionInList(version) {
      if (!version || !version.id) {
        return
      }
      const exists = this.versionList.some(item => item.id === version.id)
      if (!exists) {
        this.versionList = [version, ...this.versionList]
      }
    },

    mergeVersionList(existing, incoming) {
      const map = new Map()
      existing.forEach(item => {
        if (item && item.id) {
          map.set(item.id, item)
        }
      })
      incoming.forEach(item => {
        if (item && item.id) {
          map.set(item.id, item)
        }
      })
      return Array.from(map.values()).sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime()
        const timeB = new Date(b.createdAt || 0).getTime()
        return timeB - timeA
      })
    },

    resolveDefaultSelection() {
      if (this.defaultVersionId) {
        this.selectedVersionId = this.defaultVersionId
        return
      }

      const latestVersionId = this.templateDetail && this.templateDetail.latestVersion && this.templateDetail.latestVersion.id
      if (latestVersionId) {
        this.selectedVersionId = latestVersionId
        return
      }

      this.selectedVersionId = (this.versionList[0] && this.versionList[0].id) || ''
    },

    handleVersionSelect(versionId) {
      if (!versionId || versionId === this.selectedVersionId) {
        return
      }
      this.selectedVersionId = versionId
      this.activeTab = 'overview'
      this.$emit('version-change', {
        templateId: this.templateId,
        versionId
      })
      this.pendingChanges = null
      this.refreshSelectedVersion()
      this.prepareCurveComparison()
    },

    handleVersionStatusChange() {
      this.fetchVersionList({ reset: true })
    },

    handleLocateActiveVersion() {
      const activeVersion = this.versionList.find(item => item.status === VERSION_STATUS.ACTIVE)
      if (activeVersion) {
        this.handleVersionSelect(activeVersion.id)
        this.$nextTick(() => {
          const container = this.$el.querySelector('.version-center__version-scroll .el-scrollbar__wrap')
          const activeItem = this.$el.querySelector('.version-item.is-active')
          if (container && activeItem) {
            container.scrollTop = activeItem.offsetTop - 40
          }
        })
      } else {
        this.$message.info('当前筛选条件下暂无生效版本')
      }
    },

    handleReload() {
      if (this.loading) return
      this.initialize()
    },

    handleDrawerClose() {
      this.internalVisible = false
      this.$emit('close')
    },

    async handleParametersSave(payload) {
      if (!this.templateId || !this.selectedVersionId) {
        return
      }

      // 过滤掉系统字段，只保留业务字段
      const submitPayload = {
        segments: this.cleanSegments(payload.segments || []),
        atmosphereSettings: this.cleanAtmosphereSettings(payload.atmosphereSettings || []),
        fanSettings: this.cleanFanSettings(payload.fanSettings || [])
      }

      this.saving = true
      this.errorMessage = ''
      try {
        const response = await updateProcessTemplateVersion(
          this.templateId,
          this.selectedVersionId,
          submitPayload
        )

        const updatedVersion = response.data
        if (updatedVersion) {
          this.applyUpdatedVersion(updatedVersion)
        }

        this.$message.success(response.message || '版本参数保存成功')
        this.pendingChanges = null
        this.$emit('parameters-saved', {
          versionId: this.selectedVersionId,
          templateId: this.templateId
        })
      } catch (error) {
        console.error('[VersionCenterDrawer] handleParametersSave failed', error)
        const message = (error && error.message) || '保存参数失败，请稍后重试'
        this.errorMessage = message
        this.$message.error(message)
      } finally {
        this.saving = false
      }
    },

    /**
     * 清理温度段数据，只保留业务字段
     */
    cleanSegments(segments) {
      return segments.map(segment => {
        const cleaned = {
          segmentOrder: segment.segmentOrder,
          segmentType: segment.segmentType,
          targetTemperature: segment.targetTemperature,
          duration: segment.duration
        }

        // 可选字段
        if (segment.heatingRate !== null && segment.heatingRate !== undefined) {
          cleaned.heatingRate = segment.heatingRate
        }
        if (segment.coolingRate !== null && segment.coolingRate !== undefined) {
          cleaned.coolingRate = segment.coolingRate
        }
        if (segment.description) {
          cleaned.description = segment.description
        }

        return cleaned
      })
    },

    /**
     * 清理保护气氛数据，只保留业务字段
     */
    cleanAtmosphereSettings(atmosphereSettings) {
      return atmosphereSettings.map(atmosphere => {
        const cleaned = {
          atmosphereType: atmosphere.atmosphereType,
          flowRate: atmosphere.flowRate
        }

        // 可选字段
        if (atmosphere.flowRateMin !== null && atmosphere.flowRateMin !== undefined) {
          cleaned.flowRateMin = atmosphere.flowRateMin
        }
        if (atmosphere.flowRateMax !== null && atmosphere.flowRateMax !== undefined) {
          cleaned.flowRateMax = atmosphere.flowRateMax
        }
        if (atmosphere.pressure !== null && atmosphere.pressure !== undefined) {
          cleaned.pressure = atmosphere.pressure
        }
        if (atmosphere.pressureMin !== null && atmosphere.pressureMin !== undefined) {
          cleaned.pressureMin = atmosphere.pressureMin
        }
        if (atmosphere.pressureMax !== null && atmosphere.pressureMax !== undefined) {
          cleaned.pressureMax = atmosphere.pressureMax
        }
        if (atmosphere.supportsHydrogen !== null && atmosphere.supportsHydrogen !== undefined) {
          cleaned.supportsHydrogen = atmosphere.supportsHydrogen
        }
        if (atmosphere.description) {
          cleaned.description = atmosphere.description
        }

        return cleaned
      })
    },

    /**
     * 清理风机参数数据，只保留业务字段
     */
    cleanFanSettings(fanSettings) {
      return fanSettings.map(fan => {
        const cleaned = {
          frequency: fan.frequency
        }

        // 可选字段
        if (fan.frequencyMin !== null && fan.frequencyMin !== undefined) {
          cleaned.frequencyMin = fan.frequencyMin
        }
        if (fan.frequencyMax !== null && fan.frequencyMax !== undefined) {
          cleaned.frequencyMax = fan.frequencyMax
        }
        if (fan.segmentOrder !== null && fan.segmentOrder !== undefined) {
          cleaned.segmentOrder = fan.segmentOrder
        }
        if (fan.mode) {
          cleaned.mode = fan.mode
        }
        if (fan.description) {
          cleaned.description = fan.description
        }

        return cleaned
      })
    },

    handleParametersChange(changes) {
      this.pendingChanges = cloneDeep(changes)
    },

    openCurveViewer() {
      if (!this.selectedVersion) {
        this.$message.info('请选择需要查看的版本')
        return
      }
      this.prepareCurveComparison()
      this.showCurveViewer = true
    },

    prepareCurveComparison() {
      if (!this.templateDetail || !this.selectedVersion) {
        this.curveComparisonVersions = []
        return
      }

      const versions = this.templateDetail.versions || []
      const comparison = versions
        .filter(item => item.id !== this.selectedVersion.id)
        .slice(0, 5)
        .map(item => ({
          id: item.id,
          versionNumber: item.versionNumber,
          status: item.status,
          segments: item.segments || []
        }))

      this.curveComparisonVersions = comparison

      const capability = (this.templateDetail && this.templateDetail.latestVersion && this.templateDetail.latestVersion.deviceCapability) || {}
      this.curveDeviceCapability = {
        min: capability.minTemperature ?? 0,
        max: capability.maxTemperature ?? 1200
      }

      this.popCurveWarningIfNeeded()
    },

    popCurveWarningIfNeeded() {
      const segments = (this.selectedVersion && this.selectedVersion.segments) || []
      if (!segments.length) {
        return
      }

      const sorted = [...segments].sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))
      let warning = false
      for (let i = 1; i < sorted.length; i += 1) {
        const prev = Number(sorted[i - 1].targetTemperature)
        const curr = Number(sorted[i].targetTemperature)
        if (Number.isFinite(prev) && Number.isFinite(curr)) {
          const delta = Math.abs(curr - prev)
          if (delta >= 150) {
            warning = true
            break
          }
        }
      }

      if (warning) {
        this.$message.warning('检测到温度段之间存在较大温差，请确认升降温策略符合工艺安全要求')
      }
    },

    refreshSelectedVersion() {
      if (!this.selectedVersionId) return
      const target = this.versionList.find(item => item.id === this.selectedVersionId)
      if (target) {
        this.applyUpdatedVersion(target)
      }
    },

    resetState() {
      this.errorMessage = ''
      this.templateDetail = null
      this.versionList = []
      this.selectedVersionId = ''
      this.activeTab = 'overview'
      this.loading = false
      this.versionsLoading = false
      this.saving = false
      this.pendingChanges = null
      this.showCurveViewer = false
      this.curveComparisonVersions = []
    },

    formatVersionMeta(version) {
      if (!version) {
        return ''
      }
      const creator = version.createdBy || '系统'
      const createdAt = this.formatDateTime(version.createdAt)
      return `${creator} · ${createdAt}`
    },

    formatDateTime(timestamp) {
      if (!timestamp) {
        return '-'
      }
      return parseTime(timestamp, '{y}-{m}-{d} {h}:{i}')
    },

    getApprovalColor(action) {
      const actionMap = {
        '提交': '#409EFF',
        '批准': '#67C23A',
        '驳回': '#F56C6C',
        '撤回': '#E6A23C',
        '作废': '#909399'
      }
      return actionMap[action] || '#409EFF'
    },

    isVersionEditable(version) {
      if (!version) return false
      const editableStatuses = ['草稿', '驳回']
      return editableStatuses.includes(version.status)
    },

    applyUpdatedVersion(updatedVersion) {
      // 更新版本列表中的版本数据
      this.versionList = this.versionList.map(item =>
        item.id === updatedVersion.id ? { ...item, ...updatedVersion } : item
      )

      if (this.templateDetail) {
        // 更新 latestVersion（如果是最新版本）
        if (this.templateDetail.latestVersion && this.templateDetail.latestVersion.id === updatedVersion.id) {
          this.templateDetail = {
            ...this.templateDetail,
            latestVersion: { ...updatedVersion }
          }
        }

        // 更新 versions 数组
        if (Array.isArray(this.templateDetail.versions)) {
          this.templateDetail = {
            ...this.templateDetail,
            versions: this.templateDetail.versions.map(item =>
              item.id === updatedVersion.id ? { ...item, ...updatedVersion } : item
            )
          }
        }
      }

      this.ensureVersionInList(updatedVersion)

      if (updatedVersion.id === this.selectedVersionId) {
        this.prepareCurveComparison()
      }
    },

    async refreshTemplateDetail() {
      if (!this.templateId) {
        return
      }

      try {
        const response = await getProcessTemplateDetail(this.templateId)
        const freshTemplateDetail = response.data || null

        if (freshTemplateDetail) {
          // 更新模板详情，保持当前选中的版本ID不变
          this.templateDetail = freshTemplateDetail

          console.info('[VersionCenterDrawer] 模板详情已刷新', {
            templateId: this.templateId,
            status: freshTemplateDetail.status,
            latestVersion: freshTemplateDetail.latestVersion?.versionNumber
          })
        }
      } catch (error) {
        console.error('[VersionCenterDrawer] refreshTemplateDetail failed', error)
        // 刷新失败不阻塞用户操作，仅记录日志
      }
    },

    isActionLoading(action) {
      return Boolean(this.pendingActions[action])
    },

    toggleActionLoading(action, loading) {
      if (loading) {
        this.$set(this.pendingActions, action, true)
      } else if (this.pendingActions[action]) {
        this.$delete(this.pendingActions, action)
      }
    },

    async handleApprovalAction({ action }) {
      if (!this.selectedVersion) {
        return
      }

      const versionId = this.selectedVersion.id
      const templateId = this.templateId
      const currentStatus = this.selectedVersion.status

      const payload = { currentStatus }
      let apiCall
      let successMessage

      switch (action) {
        case 'submitApproval':
          apiCall = submitProcessTemplateVersion
          successMessage = '提交审批成功'
          break
        case 'approve':
          apiCall = approveProcessTemplateVersion
          payload.approvalComment = ''
          successMessage = '审批通过'
          break
        case 'reject':
          apiCall = rejectProcessTemplateVersion
          payload.approvalComment = '驳回'
          successMessage = '审批已驳回'
          break
        case 'withdraw':
          apiCall = withdrawProcessTemplateVersion
          payload.approvalComment = ''
          successMessage = '撤回成功'
          break
        case 'activate':
          apiCall = activateProcessTemplateVersion
          successMessage = '版本已快速生效'
          break
        case 'void':
          apiCall = voidProcessTemplateVersion
          successMessage = '版本已作废'
          break
        default:
          return
      }

      this.toggleActionLoading(action, true)
      try {
        const response = await apiCall(templateId, versionId, payload)
        const updatedVersion = response.data
        if (updatedVersion) {
          this.applyUpdatedVersion(updatedVersion)
        }

        // 重新获取完整的模板详情，确保模板状态等字段与后端同步
        await this.refreshTemplateDetail()

        this.$message.success(response.message || successMessage)
        this.$emit('approval-success', {
          templateId,
          versionId,
          action,
          response
        })
      } catch (error) {
        console.error(`[VersionCenterDrawer] ${action} failed`, error)
        const message = (error && error.message) || '操作失败，请稍后重试'
        this.errorMessage = message
        this.$message.error(message)
      } finally {
        this.toggleActionLoading(action, false)
      }
    },

    canSubmit(version) {
      return [VERSION_STATUS.DRAFT, VERSION_STATUS.REJECTED].includes(version.status)
    },

    canApprove(version) {
      return version.status === VERSION_STATUS.PENDING
    },

    canReject(version) {
      return version.status === VERSION_STATUS.PENDING
    },

    canWithdraw(version) {
      return version.status === VERSION_STATUS.PENDING
    },

    canActivate(version) {
      return [VERSION_STATUS.DRAFT, VERSION_STATUS.REJECTED].includes(version.status)
    },

    canVoid(version) {
      return [VERSION_STATUS.PENDING, VERSION_STATUS.ACTIVE].includes(version.status)
    },

    handleExportApprovalLog() {
      if (!this.selectedVersion || !(this.selectedVersion.approvalRecords || []).length) {
        this.$message.info('暂无审批记录可导出')
        return
      }
      const payload = {
        templateId: this.templateId,
        versionId: this.selectedVersion.id,
        approvalRecords: this.selectedVersion.approvalRecords
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `approval-log-${this.selectedVersion.versionNumber}-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      this.$message.success('审批记录导出成功')
    },

    openCreateNewVersionDialog() {
      if (!this.templateId) {
        this.$message.warning('请先选择工艺模板')
        return
      }

      // 重置表单
      this.createNewVersionDialog.formData = {
        newVersionNumber: '',
        versionDescription: '',
        copyFromVersionId: ''
      }

      // 设置默认源版本为最新版本
      if (this.templateDetail && this.templateDetail.latestVersion) {
        this.createNewVersionDialog.formData.copyFromVersionId = this.templateDetail.latestVersion.id
      }

      this.createNewVersionDialog.visible = true

      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.createNewVersionForm) {
          this.$refs.createNewVersionForm.clearValidate()
        }
      })
    },

    handleCreateNewVersionDialogClose() {
      this.createNewVersionDialog.visible = false
      this.createNewVersionDialog.formData = {
        newVersionNumber: '',
        versionDescription: '',
        copyFromVersionId: ''
      }
      if (this.$refs.createNewVersionForm) {
        this.$refs.createNewVersionForm.clearValidate()
      }
    },

    async handleCreateNewVersionSubmit() {
      if (!this.$refs.createNewVersionForm) {
        return
      }

      try {
        await this.$refs.createNewVersionForm.validate()
      } catch (error) {
        return
      }

      this.createNewVersionDialog.loading = true

      try {
        const payload = {
          newVersionNumber: this.createNewVersionDialog.formData.newVersionNumber.trim(),
          versionDescription: this.createNewVersionDialog.formData.versionDescription?.trim() || '',
          copyFromVersionId: this.createNewVersionDialog.formData.copyFromVersionId || undefined
        }

        const response = await createNewVersion(this.templateId, payload)

        const newVersion = response.data
        this.$message.success(response.message || '创建新版本成功')

        // 关闭对话框
        this.handleCreateNewVersionDialogClose()

        // 刷新版本列表
        await this.fetchVersionList({ reset: true })

        // 自动选中新创建的版本
        if (newVersion && newVersion.id) {
          this.selectedVersionId = newVersion.id
          this.activeTab = 'overview'

          // 滚动到新版本
          this.$nextTick(() => {
            const container = this.$el.querySelector('.version-center__version-scroll .el-scrollbar__wrap')
            const activeItem = this.$el.querySelector('.version-item.is-active')
            if (container && activeItem) {
              container.scrollTop = activeItem.offsetTop - 40
            }
          })
        }

        // 通知父组件
        this.$emit('version-created', {
          templateId: this.templateId,
          versionId: newVersion?.id,
          version: newVersion
        })
      } catch (error) {
        console.error('[VersionCenterDrawer] handleCreateNewVersionSubmit failed', error)
        const message = (error && error.message) || '创建新版本失败，请稍后重试'
        this.$message.error(message)
      } finally {
        this.createNewVersionDialog.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.version-center {
  display: flex;
  gap: 16px;
  min-height: 520px;
}

.version-center__sidebar {
  width: 280px;
  background: #f7f8fa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.version-center__sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.version-center__template-name {
  font-weight: 600;
  font-size: 15px;
  color: #1f2d3d;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-center__sidebar-subtitle {
  font-size: 13px;
  color: #909399;
  letter-spacing: 0.4px;
}

.version-center__sidebar-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
}

.version-center__version-scroll {
  flex: 1;
  padding-right: 4px;
}

.version-item {
  border-radius: 10px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  margin-bottom: 8px;
}

.version-item:hover {
  border-color: #c6e2ff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
}

.version-item.is-active {
  border-color: #409eff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.18);
}

.version-item__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.version-item__row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.version-item__title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2d3d;
  flex-shrink: 0;
}

.version-item__meta {
  font-size: 12px;
  color: #909399;
  line-height: 18px;
}

.version-item__badge {
  flex-shrink: 0;
  font-size: 12px;
  color: #409eff;
  padding: 2px 8px;
  background: #ecf5ff;
  border-radius: 10px;
  white-space: nowrap;
}

.version-item--skeleton {
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #ebeef5;
  margin-bottom: 8px;
}

.version-center__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-overview-header {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 10px 30px rgba(31, 45, 61, 0.04);
}

.version-overview-header__title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.version-overview-header__name {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1f2d3d;
}

.version-overview-header__description {
  font-size: 13px;
  line-height: 20px;
  color: #606266;
  margin: 0 0 12px;
}

.version-overview-header__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.version-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.version-meta-item__label {
  font-size: 12px;
  color: #a0a4ab;
  letter-spacing: 0.4px;
}

.version-meta-item__value {
  font-size: 13px;
  color: #303133;
}

.approval-record {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.approval-record__action {
  font-weight: 600;
  color: #303133;
}

.approval-record__meta {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #606266;
  gap: 2px;
}

.approval-record__comment {
  color: #909399;
}

.version-center__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
}

.version-overview-header__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}

.approval-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

::v-deep(.el-tabs--border-card) {
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(31, 45, 61, 0.06);
}

::v-deep(.el-tabs__item) {
  font-size: 13px;
}

::v-deep(.el-descriptions) {
  background-color: #ffffff;
}
</style>
