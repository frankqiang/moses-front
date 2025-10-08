<!--
文件名称：index.vue
文件描述：工艺参数管理模块主页面，整合搜索、表格、表单、版本中心及曲线组件
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，实现TASK008 P0阶段核心功能以及P1第8项（筛选参数路由同步）
  - 2025-10-08: 新增处理"创建新版本"事件，完成TASK008 P0-6
-->

<template>
  <div class="process-parameter-management">
    <!-- 搜索与工具栏 -->
    <TemplateSearch
      ref="templateSearch"
      :loading="loading.list"
      :initial-params="initialSearchParams"
      @search="handleSearch"
    />

    <!-- 模板列表 -->
    <TemplateTable
      ref="templateTable"
      :data="tableData"
      :loading="loading.list"
      :load-error="listError || null"
      :pagination="pagination"
      :visible-columns="visibleColumns"
      :toolbar-buttons="toolbarButtons"
      @refresh="handleRefresh"
      @create="handleCreateTemplate"
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @column-change="handleColumnChange"
      @toolbar-action="handleToolbarAction"
      @action="handleTableAction"
      @view-detail="handleViewDetail"
      @retry="fetchTemplateList"
    />

    <!-- 模板表单抽屉 -->
    <TemplateFormDrawer
      v-if="formDrawer.visible"
      :key="`${formDrawer.templateId || 'new'}-${formDrawer.mode}-${formDrawer.versionId || ''}`"
      :visible.sync="formDrawer.visible"
      :mode="formDrawer.mode"
      :template-id="formDrawer.templateId"
      :version-id="formDrawer.versionId"
      :initial-data="formDrawer.initialData"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />

    <!-- 版本中心抽屉 -->
    <VersionCenterDrawer
      v-if="versionDrawer.visible"
      :visible.sync="versionDrawer.visible"
      :template-id="versionDrawer.templateId"
      :version-id="versionDrawer.versionId"
      @close="handleVersionDrawerClose"
      @approval-success="handleVersionActionSuccess"
      @parameters-saved="handleVersionParametersSaved"
      @version-created="handleVersionCreated"
    />

    <!-- 温度曲线查看器弹窗 -->
    <TemperatureCurveViewer
      v-if="curveViewer.visible"
      :segments="curveViewer.segments"
      :comparison-versions="curveViewer.comparisonVersions"
      :template-id="curveViewer.templateId"
      :version-id="curveViewer.versionId"
      :device-capability="curveViewer.deviceCapability"
      @close="handleCurveViewerClose"
    />

    <!-- 复制模板对话框 -->
    <CopyTemplateDialog
      v-if="copyDialog.visible"
      :visible.sync="copyDialog.visible"
      :source-template="copyDialog.sourceTemplate"
      :source-version="copyDialog.sourceVersion"
      :available-versions="copyDialog.availableVersions"
      @success="handleCopySuccess"
      @close="handleCopyDialogClose"
    />

    <TemplateUsageDialog
      v-if="usageDialog.visible"
      :visible.sync="usageDialog.visible"
      :loading="usageDialog.loading"
      :operation="usageDialog.operation"
      :template="usageDialog.template"
      :usage="usageDialog.usage"
      @close="handleUsageDialogClose"
    />

    <DangerOperationConfirmDialog
      v-if="dangerConfirm.visible"
      :visible.sync="dangerConfirm.visible"
      :operation="dangerConfirm.operation"
      :template-name="dangerConfirm.template && dangerConfirm.template.templateName"
      :confirm-keyword="dangerConfirm.keyword"
      :show-reason="true"
      @confirm="handleDangerConfirm"
      @cancel="handleDangerCancel"
    />

    <!-- 全局错误提示 -->
    <el-alert
      v-if="globalError"
      class="process-parameter-management__global-error"
      :title="globalError"
      type="error"
      show-icon
      closable
      @close="globalError = ''"
    />
  </div>
</template>

<script>
import TemplateSearch from './components/TemplateSearch.vue'
import TemplateTable from './components/TemplateTable.vue'
import TemplateFormDrawer from './components/TemplateFormDrawer.vue'
import VersionCenterDrawer from './components/VersionCenterDrawer.vue'
import TemperatureCurveViewer from './components/TemperatureCurveViewer.vue'
import CopyTemplateDialog from './components/CopyTemplateDialog.vue'
import TemplateUsageDialog from './components/TemplateUsageDialog.vue'
import DangerOperationConfirmDialog from './components/DangerOperationConfirmDialog.vue'
import {
  fetchProcessTemplateList,
  deleteProcessTemplate,
  submitProcessTemplateVersion,
  approveProcessTemplateVersion,
  rejectProcessTemplateVersion,
  withdrawProcessTemplateVersion,
  voidProcessTemplateVersion,
  activateProcessTemplateVersion,
  getProcessTemplateDetail,
  getProcessTemplateUsage
} from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  MESSAGE_FALLBACKS,
  ERROR_MESSAGES,
  DEFAULT_VISIBLE_COLUMNS,
  TABLE_COLUMN_SETTINGS_ID
} from './constants'
import { debounce } from '@/utils'
import tableConfigStore from '@/utils/table-config-store'

const DEFAULT_QUERY = {
  ...DEFAULT_PAGINATION,
  sortBy: DEFAULT_SORT
}

export default {
  name: 'ProcessParameterManagement',
  components: {
    TemplateSearch,
    TemplateTable,
    TemplateFormDrawer,
    VersionCenterDrawer,
    TemperatureCurveViewer,
    CopyTemplateDialog,
    TemplateUsageDialog,
    DangerOperationConfirmDialog
  },
  data() {
    return {
      initialSearchParams: {},
      currentQuery: { ...DEFAULT_QUERY },
      pagination: { ...DEFAULT_PAGINATION, total: 0 },
      tableData: [],
      listError: null,
      globalError: '',
      loading: {
        list: false,
        form: false,
        action: false
      },
      selectedRows: [],
      visibleColumns: tableConfigStore.getColumnConfig(TABLE_COLUMN_SETTINGS_ID) || DEFAULT_VISIBLE_COLUMNS,
      toolbarButtons: [
        {
          action: 'create',
          text: '新建模板',
          type: 'primary',
          icon: 'el-icon-plus'
        }
      ],
      formDrawer: {
        visible: false,
        mode: 'create',
        templateId: '',
        versionId: '',
        initialData: {}
      },
      versionDrawer: {
        visible: false,
        templateId: '',
        versionId: ''
      },
      curveViewer: {
        visible: false,
        templateId: '',
        versionId: '',
        segments: [],
        comparisonVersions: [],
        deviceCapability: {}
      },
      copyDialog: {
        visible: false,
        sourceTemplate: null,
        sourceVersion: null,
        availableVersions: []
      },
      usageDialog: {
        visible: false,
        loading: false,
        operation: 'delete',
        template: null,
        usage: null
      },
      dangerConfirm: {
        visible: false,
        operation: 'delete',
        template: null,
        keyword: '删除',
        resolving: false,
        payload: null
      }
    }
  },
  created() {
    this.initFromRoute()
    this.debouncedFetch = debounce(this.fetchTemplateList, 150)
    this.fetchTemplateList()
  },
  methods: {
    initFromRoute() {
      const { query } = this.$route
      if (query && Object.keys(query).length) {
        const parsed = { ...query }
        if (parsed.page) {
          const page = Number(parsed.page)
          if (!Number.isNaN(page)) {
            this.pagination.page = page
            parsed.page = page
          } else {
            delete parsed.page
          }
        }
        if (parsed.limit) {
          const limit = Number(parsed.limit)
          if (!Number.isNaN(limit)) {
            this.pagination.limit = limit
            parsed.limit = limit
          } else {
            delete parsed.limit
          }
        }
        if (parsed.applicableProductIds && typeof parsed.applicableProductIds === 'string') {
          parsed.applicableProductIds = parsed.applicableProductIds.split(',').filter(Boolean)
        }
        this.currentQuery = {
          ...DEFAULT_QUERY,
          ...parsed
        }
        this.initialSearchParams = { ...parsed }
      } else {
        this.currentQuery = { ...DEFAULT_QUERY }
        this.initialSearchParams = {}
      }
    },

    async fetchTemplateList(customQuery) {
      const query = {
        ...this.currentQuery,
        ...customQuery
      }
      this.loading.list = true
      this.listError = null
      try {
        const response = await fetchProcessTemplateList(query)
        const { templates = [], pagination = {}} = response.data || {}
        // 过滤并标准化数据：确保每条数据都是有效对象且有latestVersion字段
        const validTemplates = (Array.isArray(templates) ? templates : [])
          .filter(item => item && typeof item === 'object' && item.id)
          .map(item => ({
            ...item,
            latestVersion: item.latestVersion || null
          }))
        console.log('[Index] Processed templates:', validTemplates.length, validTemplates)
        this.tableData = validTemplates
        this.pagination = {
          page: pagination.page || query.page || 1,
          limit: pagination.limit || query.limit || 10,
          total: pagination.totalResults || 0
        }
        this.currentQuery = {
          ...query,
          page: this.pagination.page,
          limit: this.pagination.limit
        }
        this.syncRouteQuery()
      } catch (error) {
        console.error('[ProcessParameterManagement] fetchTemplateList failed', error)
        this.listError = (error && error.message) || ERROR_MESSAGES.fetchList
        this.globalError = this.listError
      } finally {
        this.loading.list = false
      }
    },

    syncRouteQuery() {
      const query = { ...this.currentQuery }
      if (query.applicableProductIds && Array.isArray(query.applicableProductIds)) {
        query.applicableProductIds = query.applicableProductIds.join(',')
      }
      this.$router.replace({
        path: this.$route.path,
        query
      }).catch(() => {})
    },

    handleSearch(params) {
      this.pagination.page = 1
      this.currentQuery = {
        ...params,
        page: 1,
        limit: this.pagination.limit || DEFAULT_PAGINATION.limit
      }
      this.fetchTemplateList()
    },

    handleRefresh() {
      this.fetchTemplateList()
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    handleColumnChange(columns) {
      this.visibleColumns = columns
      tableConfigStore.saveColumnConfig(TABLE_COLUMN_SETTINGS_ID, columns)
    },

    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.currentQuery = {
        ...this.currentQuery,
        page,
        limit
      }
      this.fetchTemplateList()
    },

    handleSortChange({ prop, order }) {
      let sortBy = DEFAULT_SORT
      if (prop && order) {
        const direction = order === 'descending' ? 'desc' : 'asc'
        sortBy = `${prop}:${direction}`
      }
      this.currentQuery = {
        ...this.currentQuery,
        sortBy,
        page: 1
      }
      this.pagination.page = 1
      this.fetchTemplateList()
    },

    handleCreateTemplate() {
      this.formDrawer = {
        visible: true,
        mode: 'create',
        templateId: '',
        versionId: '',
        initialData: {}
      }
    },

    handleToolbarAction(action) {
      // 处理工具栏按钮点击
      if (action === 'create') {
        this.handleCreateTemplate()
      }
    },

    handleFormSuccess() {
      // 消息提示已在 TemplateFormDrawer 组件中处理（使用后端返回的 message）
      this.formDrawer.visible = false
      this.fetchTemplateList()
    },

    handleFormClose() {
      this.formDrawer.visible = false
      this.formDrawer.templateId = ''
      this.formDrawer.versionId = ''
      this.formDrawer.initialData = {}
    },

    handleViewDetail({ templateId }) {
      this.openVersionDrawer(templateId)
    },

    handleTableAction({ action, template, version }) {
      switch (action) {
        case 'editTemplate':
          this.openEditTemplate(template)
          break
        case 'createVersion':
          this.openCreateVersion(template)
          break
        case 'submitApproval':
          this.handleApprovalAction('submit', template, version)
          break
        case 'approve':
          this.handleApprovalAction('approve', template, version)
          break
        case 'reject':
          this.handleApprovalAction('reject', template, version)
          break
        case 'withdraw':
          this.handleApprovalAction('withdraw', template, version)
          break
        case 'activate':
          this.handleApprovalAction('activate', template, version)
          break
        case 'void':
          this.handleVoidTemplateVersion(template, version)
          break
        case 'copy':
          this.handleCopyTemplate(template, version)
          break
        case 'delete':
          this.handleDeleteTemplate(template)
          break
        default:
          break
      }
    },

    async openEditTemplate(template) {
      try {
        this.loading.form = true
        const response = await getProcessTemplateDetail(template.id)
        const data = (response && response.data) || {}
        this.formDrawer = {
          visible: true,
          mode: 'update',
          templateId: data.id || template.id,
          versionId: (data.latestVersion && data.latestVersion.id) || (template.latestVersion && template.latestVersion.id) || '',
          initialData: data
        }
      } catch (error) {
        console.error('[ProcessParameterManagement] openEditTemplate failed', error)
        this.$message.error((error && error.message) || '获取模板详情失败')
      } finally {
        this.loading.form = false
      }
    },

    async openCreateVersion(template) {
      // 打开版本中心抽屉，并触发创建新版本对话框
      try {
        // 先打开版本中心抽屉
        this.versionDrawer = {
          visible: true,
          templateId: template.id,
          versionId: ''
        }

        // 等待版本中心加载完成后，打开创建新版本对话框
        this.$nextTick(() => {
          // 延迟一下确保版本中心已初始化
          setTimeout(() => {
            const versionCenterDrawer = this.$children.find(
              child => child.$options.name === 'VersionCenterDrawer'
            )
            if (versionCenterDrawer && versionCenterDrawer.openCreateNewVersionDialog) {
              versionCenterDrawer.openCreateNewVersionDialog()
            }
          }, 300)
        })
      } catch (error) {
        console.error('[ProcessParameterManagement] openCreateVersion failed', error)
        this.$message.error((error && error.message) || '打开创建新版本失败')
      }
    },

    openVersionDrawer(templateId, versionId = '') {
      this.versionDrawer = {
        visible: true,
        templateId,
        versionId
      }
    },

    handleVersionDrawerClose() {
      this.versionDrawer.visible = false
      this.versionDrawer.templateId = ''
      this.versionDrawer.versionId = ''
    },

    async handleApprovalAction(type, template, version) {
      if (!template || !version) return
      const templateId = template.id
      const versionId = version.id
      const currentStatus = version.status

      const confirmTextMap = {
        submit: '确认提交当前版本进入审批流程吗？',
        approve: '确认审批通过该版本吗？',
        reject: '确认驳回该版本吗？',
        withdraw: '确认撤回该版本的审批吗？',
        activate: '确认直接将该版本快速生效吗？',
        void: '确认作废该版本吗？'
      }

      const confirm = await this.$confirm(confirmTextMap[type] || '确认执行该操作？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => false)

      if (!confirm) {
        return
      }

      this.loading.action = true

      try {
        let response
        const payload = { currentStatus }
        switch (type) {
          case 'submit':
            response = await submitProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'approve':
            response = await approveProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'reject': {
            const comment = await this.promptForReason('请输入驳回意见')
            if (!comment) {
              this.$message.info('已取消驳回操作')
              return
            }
            response = await rejectProcessTemplateVersion(templateId, versionId, {
              ...payload,
              approvalComment: comment
            })
            break
          }
          case 'withdraw':
            response = await withdrawProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'activate':
            response = await activateProcessTemplateVersion(templateId, versionId, payload)
            break
          case 'void':
            this.openDangerConfirm('void', template, async() => {
              await this.performVoidVersion(template, version)
            }, { version })
            response = null
            break
          default:
            break
        }

        if (response) {
          this.$message.success(response.message || MESSAGE_FALLBACKS.submitApproval)
          this.fetchTemplateList()
        }
      } catch (error) {
        console.error('[ProcessParameterManagement] handleApprovalAction failed', error)
        this.$message.error((error && error.message) || '操作失败，请稍后重试')
      } finally {
        this.loading.action = false
      }
    },

    async handleCopyTemplate(template) {
      if (!template || !template.id) return
      try {
        this.loading.form = true
        const response = await getProcessTemplateDetail(template.id)
        const detail = response.data || {}

        // 打开简化的复制对话框
        this.copyDialog = {
          visible: true,
          sourceTemplate: detail,
          sourceVersion: detail.latestVersion,
          availableVersions: detail.versions || []
        }
      } catch (error) {
        console.error('[ProcessParameterManagement] handleCopyTemplate failed', error)
        this.$message.error((error && error.message) || '获取模板详情失败')
      } finally {
        this.loading.form = false
      }
    },

    async handleDeleteTemplate(template) {
      if (!template || !template.id) return
      this.openDangerConfirm('delete', template, async() => {
        await this.performDelete(template)
      })
    },

    async performDelete(template) {
      if (!template || !template.id) return
      this.loading.action = true
      try {
        const response = await deleteProcessTemplate(template.id)
        this.logDangerOperation('delete', template.id)
        this.$message.success(response.message || MESSAGE_FALLBACKS.deleteTemplate)
        this.fetchTemplateList()
      } catch (error) {
        console.error('[ProcessParameterManagement] performDelete failed', error)
        if ((error && error.code === 'PTM_016') || (error && error.response && error.response.data && error.response.data.error && error.response.data.error.code === 'PTM_016')) {
          await this.handleOperationBlocked('delete', template, error)
        } else {
          this.$message.error((error && error.message) || '删除失败，请稍后重试')
        }
      } finally {
        this.loading.action = false
      }
    },

    async performVoidVersion(template, version) {
      const templateId = template.id
      const versionId = version.id
      const payload = { currentStatus: version.status }
      this.loading.action = true
      try {
        const response = await voidProcessTemplateVersion(templateId, versionId, payload)
        this.logDangerOperation('void', templateId, versionId)
        this.$message.success(response.message || MESSAGE_FALLBACKS.voidVersion)
        this.fetchTemplateList()
      } catch (error) {
        console.error('[ProcessParameterManagement] performVoidVersion failed', error)
        if ((error && error.code === 'PTM_016') || (error && error.response && error.response.data && error.response.data.error && error.response.data.error.code === 'PTM_016')) {
          await this.handleOperationBlocked('void', template, error)
        } else {
          this.$message.error((error && error.message) || '作废失败，请稍后重试')
        }
      } finally {
        this.loading.action = false
      }
    },

    async handleOperationBlocked(operation, template, error) {
      const response = error && error.response
      const data = response && response.data
      const usage = (data && data.data) || null
      if (!template || !template.id) return
      this.usageDialog = {
        visible: true,
        loading: true,
        operation,
        template,
        usage: usage || null
      }
      try {
        let usageData = usage
        if (!usageData) {
          const usageResponse = await getProcessTemplateUsage(template.id)
          usageData = usageResponse.data
        }
        this.usageDialog = {
          ...this.usageDialog,
          usage: (usageData && usageData.usage) || usageData,
          loading: false
        }
      } catch (err) {
        console.error('[ProcessParameterManagement] fetch usage failed', err)
        this.$message.error((err && err.message) || '获取引用详情失败，请稍后重试')
        this.usageDialog = {
          ...this.usageDialog,
          loading: false
        }
      }
    },

    openDangerConfirm(operation, template, onConfirm, extra = {}) {
      this.dangerConfirm = {
        ...this.dangerConfirm,
        visible: true,
        operation,
        template,
        keyword: operation === 'void' ? '作废' : '删除',
        resolving: false,
        payload: {
          onConfirm,
          extra
        }
      }
    },

    async handleDangerConfirm({ reason }) {
      if (!(this.dangerConfirm.payload && this.dangerConfirm.payload.onConfirm) || this.dangerConfirm.resolving) {
        return
      }
      this.dangerConfirm.resolving = true
      try {
        const context = {
          reason,
          template: this.dangerConfirm.template,
          operation: this.dangerConfirm.operation,
          extra: this.dangerConfirm.payload.extra
        }
        console.info('[ProcessParameterManagement] danger operation confirmed', context)
        await this.dangerConfirm.payload.onConfirm()
      } finally {
        this.dangerConfirm.resolving = false
        this.dangerConfirm.visible = false
        this.dangerConfirm.payload = null
      }
    },

    handleDangerCancel() {
      this.dangerConfirm.visible = false
      this.dangerConfirm.payload = null
    },

    handleUsageDialogClose() {
      this.usageDialog.visible = false
      this.usageDialog.loading = false
    },

    logDangerOperation(operation, templateId, versionId) {
      const timestamp = new Date().toISOString()
      console.info('[ProcessParameterManagement] operation executed', {
        operation,
        templateId,
        versionId,
        timestamp
      })
    },

    async promptForReason(title) {
      const input = await this.$prompt(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请输入理由，200 字以内',
        inputValidator(value) {
          if (!value || !value.trim()) {
            return '请输入理由'
          }
          if (value.trim().length > 200) {
            return '理由长度不能超过200个字符'
          }
          return true
        }
      }).catch(() => null)

      return (input && input.value && input.value.trim()) || ''
    },

    handleVersionActionSuccess() {
      this.fetchTemplateList()
    },
    handleVersionParametersSaved() {
      this.fetchTemplateList()
    },
    handleVersionCreated({ templateId, versionId, version }) {
      // 刷新模板列表以显示最新版本信息
      this.fetchTemplateList()
      console.info('[ProcessParameterManagement] 新版本创建成功', {
        templateId,
        versionId,
        versionNumber: version?.versionNumber
      })
    },

    handleCurveViewerClose() {
      this.curveViewer.visible = false
      this.curveViewer.templateId = ''
      this.curveViewer.versionId = ''
      this.curveViewer.segments = []
      this.curveViewer.comparisonVersions = []
      this.curveViewer.deviceCapability = {}
    },

    handleCopySuccess() {
      // 消息提示已在 CopyTemplateDialog 组件中处理（使用后端返回的 message）
      this.copyDialog.visible = false
      this.fetchTemplateList()
    },

    handleCopyDialogClose() {
      this.copyDialog.visible = false
      this.copyDialog.sourceTemplate = null
      this.copyDialog.sourceVersion = null
      this.copyDialog.availableVersions = []
    }
  }
}
</script>

<style lang="scss" scoped>
.process-parameter-management {
  position: relative;
  padding: 20px;

  &__global-error {
    margin-top: 16px;
  }
}

@media (max-width: 1024px) {
  .process-parameter-management {
    padding: 16px;
  }
}
</style>

