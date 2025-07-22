<template>
  <div class="routing-table-container">
    <table-toolbar
      :enable-column-settings="true"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-export="true"
      :export-api="exportApiFunction"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
    >
      <template #toolbar-left>
        <action-buttons
          :buttons="toolbarButtons"
          mode="normal"
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
  getAvailableActions,
  getActionPermission
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
      pageSize: this.limit
    }
  },
  computed: {
    statusTextMap() { return STATUS_CONFIG.textMap },
    statusTypeMap() { return STATUS_CONFIG.typeMap },
    toolbarButtons() {
      return [{ action: 'add', text: '新建工艺路线', type: 'primary', icon: 'el-icon-plus' }]
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
    this.debouncedRefresh = debounce(() => this.$emit('refresh'), 300)
  },
  methods: {
    handleToolbarAction({ action }) {
      if (action === 'add') this.$emit('add')
    },
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
           tooltip: '查看详情',
           permission: getActionPermission('view')
         },
         edit: {
           action: 'edit',
           text: '编辑',
           icon: 'el-icon-edit',
           tooltip: '编辑工艺路线',
           permission: getActionPermission('edit')
         },
         delete: {
           action: 'delete',
           text: '删除',
           icon: 'el-icon-delete',
           class: 'danger',
           tooltip: row.status === 'Draft' ? '删除此草稿' : '永久删除此记录',
           permission: getActionPermission('delete')
         },
         newVersion: {
           action: 'newVersion',
           text: '创建新版本',
           icon: 'el-icon-plus',
           tooltip: '基于此版本创建新版本',
           permission: getActionPermission('newVersion'),
           // 创建新版本的特殊可见性条件
           visible: this.checkNewVersionVisibility(row)
         },
         submitApproval: {
           action: 'submit',
           text: '提交审批',
           icon: 'el-icon-s-promotion',
           class: 'success',
           tooltip: '提交以供审批',
           permission: getActionPermission('submitApproval')
         },
         approve: {
           action: 'approve',
           text: '批准',
           icon: 'el-icon-check',
           class: 'success',
           tooltip: '批准此工艺路线',
           permission: getActionPermission('approve')
         },
         reject: {
           action: 'reject',
           text: '驳回',
           icon: 'el-icon-close',
           class: 'danger',
           tooltip: '驳回此工艺路线',
           permission: getActionPermission('reject')
         },
         archive: {
           action: 'archive',
           text: '归档',
           icon: 'el-icon-folder',
           tooltip: '归档此工艺路线',
           permission: getActionPermission('archive')
         }
       }

       // 根据可用操作生成按钮配置
       const actions = availableActions
         .map(actionKey => actionConfigMap[actionKey])
         .filter(config => {
           if (!config) return false

           // 检查权限（如果配置了权限）
           if (config.permission && !this.checkPermission(config.permission)) {
             return false
           }

           // 检查自定义可见性条件
           if (config.hasOwnProperty('visible') && !config.visible) {
             return false
           }

           return true
         })

       return actions
     },

     /**
      * 检查用户权限
      * @param {string} permission - 权限码
      * @returns {boolean} 是否有权限
      */
     checkPermission(permission) {
       // TODO: 集成实际的权限检查逻辑
       // 这里可以调用全局的权限检查方法或从store中获取用户权限
       // 暂时返回true，实际项目中需要替换为真实的权限检查
       return true
     },

     /**
      * 检查创建新版本按钮的可见性
      * @param {Object} row - 工艺路线数据行
      * @returns {boolean} 是否可见
      */
     checkNewVersionVisibility(row) {
       // 只有生效状态的工艺路线才能创建新版本
       if (row.status !== 'Enabled') {
         return false
       }

       // 检查是否已有更新的版本（可选的业务逻辑）
       // 如果当前版本不是最新版本，则不显示创建新版本按钮
       // 这里可以根据实际业务需求进行调整

       return true
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