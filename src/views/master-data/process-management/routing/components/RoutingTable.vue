<template>
  <div class="routing-table-container">
    <table-toolbar
      ref="toolbar"
      :enable-column-settings="true"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      :enable-export="true"
      :export-api="exportApiFunction"
      :export-params="exportParams"
      :hide-status-buttons="true"
      :delete-confirm="false"
      :table-data="data"
      :custom-actions="customBatchActions"
      :refresh-feedback-mode="'all'"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @custom-action="handleCustomBatchAction"
    >
      <template #toolbar-left>
        <action-buttons
          :buttons="toolbarButtons"
          mode="normal"
          :show-tooltip="true"
          @click="handleToolbarAction"
        />
      </template>
    </table-toolbar>

    <base-table
      :data="data"
      :columns="baseTableColumns"
      :loading="loading"
      :pagination="paginationConfig"
      :show-selection="true"
      :show-index="true"
      border
      stripe
      highlight-current-row
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
    >
      <template #status="{ row }">
        <status-tag
          :status="row.status"
          :text-map="statusTextMap"
          :type-map="statusTypeMap"
        />
      </template>
      
      <template #type="{ row }">
        <span>{{ getTypeLabel(row.type) }}</span>
      </template>

      <template #applicableProducts="{ row }">
        <overflow-tags-popover
          v-if="row.applicableProducts && row.applicableProducts.length > 0"
          :data="row.applicableProducts"
          :max-show="2"
          size="mini"
        />
        <span v-else>-</span>
      </template>

      <template #actions="{ row }">
        <action-buttons
          :buttons="generateActions(row)"
          :row="row"
          mode="text"
          :show-tooltip="true"
          @click="handleActionClick"
        />
      </template>

      <!-- 空状态自定义 -->
      <template #empty>
        <div class="custom-empty">
          <i class="el-icon-document-remove" style="font-size: 48px; color: #c0c4cc;" />
          <p>暂无工艺路线数据</p>
          <el-button type="primary" size="small" @click="handleToolbarAction({ action: 'add' })">新建工艺路线</el-button>
        </div>
      </template>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import TableToolbar from '@/components/TableToolbar'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'
import { debounce } from '@/utils'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  ROUTING_TYPE_OPTIONS,
  ROUTING_STATUS_CONFIG as STATUS_CONFIG,
  getAvailableActions
} from '../constants'

export default {
  name: 'RoutingTable',
  components: {
    BaseTable,
    StatusTag,
    ActionButtons,
    TableToolbar,
    OverflowTagsPopover
  },
  mixins: [columnSettingsMixin],
  props: {
    data: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 10
    },
    exportApi: {
      type: String,
      default: '/mes/process-management/routings/export'
    }
  },
  data() {
    return {
      columnSettingsKeyPrefix: 'routing_columns',
      selectedRows: [],
      currentPage: this.page,
      pageSize: this.limit,
      // 导出参数
      exportParams: {}
    }
  },
  computed: {
    statusTextMap() { return STATUS_CONFIG.textMap },
    statusTypeMap() { return STATUS_CONFIG.typeMap },
    toolbarButtons() {
      return [
        { action: 'add', text: '新建工艺路线', type: 'primary', icon: 'el-icon-plus' }
      ]
    },
    customBatchActions() {
      const actions = []
      
      // 批量归档操作 - 仅当选中的都是生效状态时显示
      const enabledRows = this.selectedRows.filter(row => row.status === 'Enabled')
      if (enabledRows.length > 0 && enabledRows.length === this.selectedRows.length) {
        actions.push({
          key: 'batchArchive',
          label: '批量归档',
          type: 'warning',
          icon: 'el-icon-folder',
          disabled: false,
          successMessage: false // 禁用自动成功提示，由业务逻辑处理
        })
      }
      
      return actions
    },
    columnOptions() { return TABLE_COLUMNS },
    defaultVisibleColumns() { return DEFAULT_VISIBLE_COLUMNS },
    exportApiFunction() {
      return (params) => request({ url: this.exportApi, method: 'post', data: params, responseType: 'blob' })
    },
    baseTableColumns() {
      return TABLE_COLUMNS.filter(col => this.internalVisibleColumns.includes(col.prop))
    },
    paginationConfig() {
      return {
        total: this.total,
        page: this.currentPage,
        limit: this.pageSize,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper',
        background: true,
        autoScroll: true
      }
    }
  },
  watch: {
    page(val) { this.currentPage = val },
    limit(val) { this.pageSize = val }
  },
  created() {
    this.allColumns = this.columnOptions
    this.loadColumnSettings()
    // 初始化导出参数
    this.updateExportParams()
  },
  mounted() {
    // 初始化防抖刷新函数
    this.debouncedRefresh = debounce(() => {
      this.$emit('refresh')
    }, 300)
  },
  methods: {
    /**
     * 公开方法，供父组件调用 - 刷新成功提示
     * @param {string} message - 成功提示信息
     */
    refreshSucceed(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed(message)
      }
    },

    /**
     * 公开方法，供父组件调用 - 刷新失败提示
     * @param {string} message - 失败提示信息
     */
    refreshFail(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshFail(message)
      }
    },

    /**
     * 更新导出参数
     */
    updateExportParams() {
      this.exportParams = {
        // 导出时可以添加额外参数
      }
    },
    handleToolbarAction({ action }) {
      if (action === 'add') {
        this.$emit('add')
      }
    },
    /**
     * 处理刷新事件 - 使用防抖功能
     */
    handleRefresh() {
      this.debouncedRefresh()
    },
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    handlePaginationChange(pagination) {
      this.currentPage = pagination.page
      this.pageSize = pagination.limit
      this.$emit('pagination-change', pagination)
    },
    handleActionClick(payload) {
      this.$emit(payload.action, payload.row)
    },
    /**
     * 处理批量删除操作
     * @param {Array} rows - 选中的工艺路线数据
     */
    handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      this.$emit('batch-delete', rows)
    },
    /**
     * 处理自定义批量操作
     * @param {Object} action - 批量操作配置
     * @param {Array} rows - 选中的工艺路线数据
     */
    handleCustomBatchAction(action, rows) {
      if (action.key === 'batchArchive') {
        this.handleBatchArchive(rows)
      }
    },
    /**
     * 处理批量归档操作
     * @param {Array} rows - 选中的工艺路线数据
     */
    handleBatchArchive(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      this.$emit('batch-archive', rows)
    },
    getTypeLabel(type) {
      const option = ROUTING_TYPE_OPTIONS.find(opt => opt.value === type)
      return option ? option.label : type
    },
    /**
     * 生成操作按钮列表
     * @param {Object} row - 工艺路线数据行
     * @returns {Array} 操作按钮配置数组
     */
    generateActions(row) {
      if (!row || !row.status) {
        return []
      }
      
      // 获取当前状态下可用的操作
      const availableActions = getAvailableActions(row.status)
      
      // 操作按钮配置映射
       const actionConfigMap = {
         view: {
           action: 'view',
           text: '查看',
           icon: 'el-icon-view',
           tooltip: '查看详情'
         },
         edit: {
           action: 'edit',
           text: '编辑',
           icon: 'el-icon-edit',
           tooltip: '编辑工艺路线'
         },
         delete: {
           action: 'delete',
           text: '删除',
           icon: 'el-icon-delete',
           class: 'danger',
           tooltip: row.status === 'Draft' ? '删除此草稿' : '永久删除此记录'
         },
         newVersion: {
           action: 'newVersion',
           text: '创建新版本',
           icon: 'el-icon-plus',
           tooltip: '基于此版本创建新版本',
           // 创建新版本的特殊可见性条件
           visible: this.checkNewVersionVisibility(row)
         },
         submitApproval: {
           action: 'submit',
           text: '提交审批',
           icon: 'el-icon-s-promotion',
           class: 'success',
           tooltip: '提交以供审批'
         },
         approve: {
           action: 'approve',
           text: '批准',
           icon: 'el-icon-check',
           class: 'success',
           tooltip: '批准此工艺路线'
         },
         reject: {
           action: 'reject',
           text: '驳回',
           icon: 'el-icon-close',
           class: 'danger',
           tooltip: '驳回此工艺路线'
         },
         archive: {
           action: 'archive',
           text: '归档',
           icon: 'el-icon-folder',
           tooltip: '归档此工艺路线'
         },
         history: {
           action: 'history',
           text: '历史记录',
           icon: 'el-icon-time',
           tooltip: '查看变更和审批历史'
         }
       }

       // 根据可用操作生成按钮配置
       const actions = availableActions
         .map(actionKey => actionConfigMap[actionKey])
         .filter(config => {
           if (!config) return false

           // 检查自定义可见性条件
           if (config.hasOwnProperty('visible') && !config.visible) {
             return false
           }

           return true
         })

       return actions
     },



     /**
      * 检查创建新版本按钮的可见性
      * @param {Object} row - 工艺路线数据行
      * @returns {boolean} 是否可见
      */
     checkNewVersionVisibility(row) {
       // 根据文档要求，仅当工艺路线状态为"生效 (Enabled)"时显示该按钮
       // 对于"草稿 (Draft)"、"待审批 (InApproval)"、"历史/归档 (Archived)"状态必须隐藏按钮
       if (!row || !row.status) {
         return false
       }
       
       return row.status === 'Enabled'
     }
  }
}
</script>

<style lang="scss" scoped>
.routing-table-container .custom-empty {
  text-align: center;
  padding: 40px 0;
}

.routing-table-container .custom-empty p {
  margin: 16px 0 8px;
  color: #909399;
}
</style>
