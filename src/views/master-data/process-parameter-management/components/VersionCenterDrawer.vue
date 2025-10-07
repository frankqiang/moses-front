<!--
文件名称：VersionCenterDrawer.vue
文件描述：工艺模板版本中心抽屉组件，提供版本列表与基础概览展示
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，完成TASK006 P0-1阶段需求
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
              @change="handleVersionStatusChange"
            >
              <el-option label="全部状态" value="ALL" />
              <el-option
                v-for="option in versionStatusOptions"
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
              image-size="120"
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
              <div class="version-item__meta">
                <span>{{ formatVersionMeta(version) }}</span>
              </div>
              <div v-if="version.isLatestVersion" class="version-item__badge">
                最新版本
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
                image-size="140"
              />
            </el-tab-pane>

            <el-tab-pane label="版本对比" name="compare">
              <VersionComparePanel
                v-if="selectedVersion"
                :template-id="templateId"
                :current-version="selectedVersion"
              />
              <el-empty
                v-else
                description="请选择需要对比的版本"
                image-size="160"
              />
            </el-tab-pane>

            <el-tab-pane label="参数配置" name="parameters">
              <VersionParametersPanel
                v-if="selectedVersion"
                :template-id="templateId"
                :version="selectedVersion"
                :editable="isVersionEditable(selectedVersion)"
                :saving="saving"
                :comparison-versions="curveComparisonVersions"
                :device-capability="curveDeviceCapability"
                @save="handleParametersSave"
                @change="handleParametersChange"
              />
              <el-empty
                v-else
                description="请选择需要查看的版本"
                image-size="160"
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
  voidProcessTemplateVersion
} from '../api'
import {
  TEMPLATE_STATUS_CONFIG,
  VERSION_STATUS_CONFIG,
  VERSION_STATUS
} from '../constants/process-parameter-management'

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
      drawerWidth: '1080px',
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
      }
    }
  },
  computed: {
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
    selectedVersion() {
      if (!this.selectedVersionId) {
        return null
      }
      return this.versionList.find(item => item.id === this.selectedVersionId) || null
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
      if (this.defaultVersionId && this.versionList.some(item => item.id === this.defaultVersionId)) {
        this.selectedVersionId = this.defaultVersionId
        return
      }

      const latestVersionId = this.templateDetail && this.templateDetail.latestVersion && this.templateDetail.latestVersion.id
      if (latestVersionId && this.versionList.some(item => item.id === latestVersionId)) {
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

      const submitPayload = {
        segments: payload.segments || [],
        atmosphereSettings: payload.atmosphereSettings || [],
        fanSettings: payload.fanSettings || []
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
      this.versionList = this.versionList.map(item =>
        item.id === updatedVersion.id ? { ...item, ...updatedVersion } : item
      )

      if (this.templateDetail) {
        if (this.templateDetail.latestVersion && this.templateDetail.latestVersion.id === updatedVersion.id) {
          this.templateDetail = {
            ...this.templateDetail,
            latestVersion: { ...updatedVersion }
          }
        }

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

.version-item__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.version-item__title {
  font-weight: 600;
  font-size: 14px;
  color: #1f2d3d;
}

.version-item__meta {
  font-size: 12px;
  color: #909399;
  line-height: 18px;
}

.version-item__badge {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 12px;
  color: #409eff;
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
  justify-content: flex-end;
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
