<!--
文件名称：TemplateTable.vue
文件描述：工艺参数模板列表表格组件，基于BaseTable等全局组件实现
创建日期：2025-09-29
修改记录：
  - 2025-09-29: 初始创建，实现TASK004 P0阶段核心功能
-->

<template>
  <div class="template-table">
    <!-- 表格工具栏，提供导出、列设置、批量操作入口 -->
    <TableToolbar
      v-if="showToolbar"
      ref="tableToolbar"
      :loading="loading"
      :enable-column-settings="true"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="visibleColumns"
      :enable-batch-actions="enableBatchActions"
      :selected-rows="selectedRows"
      :enable-export="false"
      :enable-refresh="true"
      :refresh-feedback-mode="'all'"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @custom-action="handleCustomBatchAction"
      @column-settings="handleColumnSettings"
    >
      <template #toolbar-left>
        <ActionButtons
          v-if="toolbarButtons && toolbarButtons.length"
          :buttons="toolbarButtons"
          mode="normal"
          size="mini"
          @click="handleToolbarAction"
        />
      </template>
    </TableToolbar>

    <!-- 使用BaseTable组件渲染模板列表 -->
    <BaseTable
      ref="baseTable"
      :data="data"
      :columns="tableColumns"
      :loading="loading"
      :load-error="loadError"
      :pagination="paginationConfig"
      :show-selection="enableBatchActions"
      :show-index="true"
      :virtual-scroll="enableVirtualScroll"
      :virtual-threshold="1000"
      :virtual-height="600"
      :item-height="48"
      :allow-retry="true"
      :index-method="getIndexMethod"
      border
      stripe
      highlight-current-row
      @retry="handleRetry"
      @row-click="handleRowClick"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
    >
      <!-- 模板状态列 -->
      <template #templateStatus="{ row }">
        <StatusTag
          :status="row.status"
          :text-map="templateStatusConfig.textMap"
          :type-map="templateStatusConfig.typeMap"
          size="small"
        />
      </template>

      <!-- 适用产品列 - 使用OverflowTagsPopover处理溢出 -->
      <template #applicableProducts="{ row }">
        <OverflowTagsPopover
          v-if="row.applicableProducts && row.applicableProducts.length > 0"
          :data="row.applicableProducts"
          :max-show="2"
          :enable-modern-features="true"
          size="mini"
          type="primary"
          title="适用产品列表"
          :popover-width="400"
          placement="top"
          label-key="productName"
          :tag-formatter="formatProductTag"
        >
          <!-- 自定义弹出框内容 -->
          <template #popover-item="{ item }">
            <div class="product-item">
              <div class="product-main">
                <span class="product-code">{{ item.productCode }}</span>
                <span class="product-name">{{ item.productName }}</span>
              </div>
              <div class="product-meta">
                <StatusTag
                  :status="item.lifecycleStatus"
                  :text-map="productStatusTextMap"
                  :type-map="productStatusTypeMap"
                  size="mini"
                />
              </div>
            </div>
          </template>
        </OverflowTagsPopover>
        <span v-else class="empty-text">-</span>
      </template>

      <!-- 最新版本状态列 -->
      <template #latestVersionStatus="{ row }">
        <StatusTag
          v-if="row.latestVersion && row.latestVersion.status"
          :status="row.latestVersion.status"
          :text-map="versionStatusConfig.textMap"
          :type-map="versionStatusConfig.typeMap"
          size="small"
        />
        <span v-else class="empty-text">-</span>
      </template>

      <!-- 温度段概览列 -->
      <template #segmentSummary="{ row }">
        <div v-if="row.latestVersion && row.latestVersion.segments && row.latestVersion.segments.length > 0" class="segment-summary">
          <div
            v-for="(segment, index) in getVisibleSegments(row.latestVersion.segments)"
            :key="segment.id || index"
            class="segment-item"
            :style="{ backgroundColor: getSegmentColor(segment.segmentType) }"
          >
            <span class="segment-order">{{ segment.segmentOrder }}</span>
            <span class="segment-type">{{ segment.segmentType }}</span>
            <span class="segment-temp">{{ segment.targetTemperature }}°C</span>
          </div>
          <div
            v-if="row.latestVersion && row.latestVersion.segments && row.latestVersion.segments.length > maxVisibleSegments"
            class="segment-more"
          >
            +{{ row.latestVersion && row.latestVersion.segments ? row.latestVersion.segments.length - maxVisibleSegments : 0 }}
          </div>
        </div>
        <span v-else class="empty-text">-</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <ActionButtons
          :buttons="getActionButtons(row)"
          mode="text"
          :row="row"
          size="small"
          :max-visible="3"
          @click="handleActionClick"
        />
      </template>

      <!-- 空状态自定义 -->
      <template #empty>
        <div class="custom-empty">
          <i class="el-icon-document-remove" style="font-size: 48px; color: #c0c4cc;" />
          <p>暂无工艺模板数据</p>
          <p class="empty-tip">您可以点击"新建模板"按钮创建第一个工艺模板</p>
          <el-button type="primary" size="small" @click="handleCreateTemplate">
            新建模板
          </el-button>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import TableToolbar from '@/components/TableToolbar'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  TABLE_COLUMN_SETTINGS_ID
} from '../constants'
import {
  TEMPLATE_STATUS_CONFIG,
  VERSION_STATUS_CONFIG,
  SEGMENT_COLOR_MAP
} from '../constants'

export default {
  name: 'TemplateTable',
  components: {
    BaseTable,
    StatusTag,
    ActionButtons,
    OverflowTagsPopover,
    TableToolbar
  },
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 加载错误状态
    loadError: {
      type: [Boolean, String, Error],
      default: false
    },
    // 分页配置
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 10,
        total: 0
      })
    },
    // 可见列配置
    visibleColumns: {
      type: Array,
      default: () => DEFAULT_VISIBLE_COLUMNS
    },
    // 是否显示工具栏
    showToolbar: {
      type: Boolean,
      default: true
    },
    // 是否启用批量操作
    enableBatchActions: {
      type: Boolean,
      default: true
    },
    // 导出API方法（返回Promise）
    exportApi: {
      type: Function,
      default: null
    },
    // 导出参数（默认使用当前查询条件）
    exportParams: {
      type: Object,
      default: () => ({})
    },
    // 导出文件名
    exportFilename: {
      type: String,
      default: '工艺模板导出'
    },
    // 工具栏左侧按钮配置
    toolbarButtons: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 温度段概览最大显示数量
      maxVisibleSegments: 3,
      // 当前选中的行
      selectedRows: [],
      // 列设置存储键
      columnSettingsKey: TABLE_COLUMN_SETTINGS_ID,
      // 可配置列选项（排除操作列，操作列始终显示）
      columnOptions: TABLE_COLUMNS.filter(col => col.columnId !== 'versionActions'),
      // 批量操作Loading状态
      batchLoading: false,
      // 批量操作加载状态管理
      pendingActions: {}
    }
  },
  computed: {
    // 模板状态配置
    templateStatusConfig() {
      return TEMPLATE_STATUS_CONFIG
    },
    // 版本状态配置
    versionStatusConfig() {
      return VERSION_STATUS_CONFIG
    },
    // 产品状态文本映射
    productStatusTextMap() {
      return {
        '在产': '在产',
        '停产': '停产',
        '试产': '试产'
      }
    },
    // 产品状态类型映射
    productStatusTypeMap() {
      return {
        '在产': 'success',
        '停产': 'danger',
        '试产': 'warning'
      }
    },
    // 是否启用虚拟滚动
    enableVirtualScroll() {
      return this.data.length > 100
    },
    // 表格列配置 - 根据可见列过滤，操作列始终显示
    tableColumns() {
      return TABLE_COLUMNS.filter(col =>
        this.visibleColumns.includes(col.columnId) || col.columnId === 'versionActions'
      )
    },
    // 分页配置
    paginationConfig() {
      return {
        total: this.pagination.total,
        page: this.pagination.page,
        limit: this.pagination.limit,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper',
        background: true,
        autoScroll: true
      }
    }
  },
  methods: {
    /**
     * 获取序号计算方法
     */
    getIndexMethod(index) {
      return (this.pagination.page - 1) * this.pagination.limit + index + 1
    },

    /**
     * 格式化产品标签
     */
    formatProductTag(product) {
      return `${product.productCode} - ${product.productName}`
    },

    /**
     * 获取可见的温度段（最多显示前几个）
     */
    getVisibleSegments(segments) {
      if (!segments || segments.length === 0) return []
      return segments.slice(0, this.maxVisibleSegments)
    },

    /**
     * 获取温度段颜色
     */
    getSegmentColor(segmentType) {
      const color = SEGMENT_COLOR_MAP[segmentType]
      return color ? `${color}20` : '#f5f5f5' // 20% 透明度
    },

    /**
     * 获取操作按钮配置
     */
    getActionButtons(row) {
      if (!row) {
        return []
      }
      const buttons = []
      const template = row
      const latestVersion = row.latestVersion

      // 查看详情 - 总是可用
      buttons.push({
        action: 'viewDetail',
        text: '查看详情',
        icon: 'el-icon-view',
        type: 'text'
      })

      // 编辑模板 - 草稿/驳回状态可编辑
      if (this.canEditTemplate(template, latestVersion)) {
        buttons.push({
          action: 'editTemplate',
          text: '编辑模板',
          icon: 'el-icon-edit',
          type: 'text'
        })
      }

      // 创建新版本 - 生效/历史状态可创建新版本
      if (this.canCreateVersion(template, latestVersion)) {
        buttons.push({
          action: 'createVersion',
          text: '创建新版本',
          icon: 'el-icon-plus',
          type: 'text'
        })
      }

      // 审批相关操作
      if (latestVersion) {
        // 提交审批 - 草稿/驳回状态可提交
        if (this.canSubmitApproval(latestVersion)) {
          buttons.push({
            action: 'submitApproval',
            text: '提交审批',
            icon: 'el-icon-s-promotion',
            type: 'text'
          })
        }

        // 审批通过 - 待审批状态可审批
        if (this.canApprove(latestVersion)) {
          buttons.push({
            action: 'approve',
            text: '审批通过',
            icon: 'el-icon-check',
            type: 'text'
          })
        }

        // 审批驳回 - 待审批状态可驳回
        if (this.canReject(latestVersion)) {
          buttons.push({
            action: 'reject',
            text: '审批驳回',
            icon: 'el-icon-close',
            type: 'text'
          })
        }

        // 撤回审批 - 待审批状态可撤回
        if (this.canWithdraw(latestVersion)) {
          buttons.push({
            action: 'withdraw',
            text: '撤回审批',
            icon: 'el-icon-refresh-left',
            type: 'text'
          })
        }

        // 快速生效 - 草稿/驳回状态可快速生效
        if (this.canActivate(latestVersion)) {
          buttons.push({
            action: 'activate',
            text: '快速生效',
            icon: 'el-icon-success',
            type: 'text',
            confirmText: '确认快速生效该版本吗？'
          })
        }

        // 作废版本 - 待审批/生效状态可作废
        if (this.canVoid(latestVersion)) {
          buttons.push({
            action: 'void',
            text: '作废版本',
            icon: 'el-icon-delete',
            type: 'text',
            confirmText: '确认作废该版本吗？此操作不可恢复'
          })
        }
      }

      // 复制模板 - 总是可用
      buttons.push({
        action: 'copy',
        text: '复制模板',
        icon: 'el-icon-document-copy',
        type: 'text'
      })

      // 删除模板 - 非生效状态可删除
      if (this.canDelete(template, latestVersion)) {
        buttons.push({
          action: 'delete',
          text: '删除',
          icon: 'el-icon-delete',
          type: 'text',
          confirmText: '确认删除该模板吗？此操作不可恢复',
          danger: true
        })
      }

      return buttons
    },

    /**
     * 判断是否可以编辑模板
     */
    canEditTemplate(template, latestVersion) {
      if (!latestVersion) return true
      return ['草稿', '驳回'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以创建新版本
     */
    canCreateVersion(template, latestVersion) {
      if (!latestVersion) return false
      return ['生效', '历史'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以提交审批
     */
    canSubmitApproval(latestVersion) {
      if (!latestVersion) return false
      return ['草稿', '驳回'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以审批通过
     */
    canApprove(latestVersion) {
      if (!latestVersion) return false
      return latestVersion.status === '待审批'
    },

    /**
     * 判断是否可以审批驳回
     */
    canReject(latestVersion) {
      if (!latestVersion) return false
      return latestVersion.status === '待审批'
    },

    /**
     * 判断是否可以撤回审批
     */
    canWithdraw(latestVersion) {
      if (!latestVersion) return false
      return latestVersion.status === '待审批'
    },

    /**
     * 判断是否可以快速生效
     */
    canActivate(latestVersion) {
      if (!latestVersion) return false
      return ['草稿', '驳回'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以作废
     */
    canVoid(latestVersion) {
      if (!latestVersion) return false
      return ['待审批', '生效'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以删除模板
     */
    canDelete(template, latestVersion) {
      if (!latestVersion) return true
      return latestVersion.status !== '生效'
    },

    /**
     * 处理操作按钮点击
     * @param {Object} eventData - ActionButtons组件发出的事件数据 { action, row, data }
     */
    handleActionClick(eventData) {
      // ActionButtons 组件发出的 click 事件包含 { action, row, data }
      const { action, row } = eventData

      // 防御性检查
      if (!row) {
        console.error('[TemplateTable] handleActionClick: row is undefined', eventData)
        return
      }

      // 发送操作事件给父组件，附带模板和版本信息
      const payload = {
        action: action,
        template: row,
        version: row.latestVersion,
        templateId: row.id,
        versionId: row.latestVersion?.id
      }

      if (payload.action === 'viewDetail') {
        this.$emit('view-detail', payload)
        return
      }

      this.$emit('action', payload)
    },

    /**
     * 处理行点击
     */
    handleRowClick(row) {
      this.$emit('row-click', row)
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange(pagination) {
      this.$emit('pagination-change', pagination)
    },

    /**
     * 处理排序变化
     */
    handleSortChange(sortInfo) {
      this.$emit('sort-change', sortInfo)
    },

    /**
     * 处理重试
     */
    handleRetry() {
      this.$emit('retry')
    },

    /**
     * 处理创建模板（空状态按钮）
     */
    handleCreateTemplate() {
      this.$emit('create')
    },

    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    handleRefresh() {
      this.$emit('refresh')
    },

    handleColumnChange(columns) {
      const columnIds = columns.map(column => column.columnId || column)
      this.$emit('column-change', columnIds)
    },

    handleBatchDelete(rows) {
      this.emitBatchAction('batch-delete', rows)
    },

    handleBatchEnable(rows) {
      this.emitBatchAction('batch-enable', rows)
    },

    handleBatchDisable(rows) {
      this.emitBatchAction('batch-disable', rows)
    },

    handleCustomBatchAction(action, rows) {
      switch (action) {
        case 'batch-approve':
        case 'batch-void':
        case 'batch-submit-approval':
          this.emitBatchAction(action, rows)
          break
        default:
          this.emitBatchAction('batch-custom', rows)
          this.$emit('batch-custom', action, rows)
      }
    },

    emitBatchAction(eventName, rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      this.$emit(eventName, {
        rows,
        templateIds: rows.map(item => item.id),
        versionIds: rows.map(item => item.latestVersion?.id).filter(Boolean)
      })
    },

    togglePendingAction(action, templateId, versionId, loading) {
      const key = `${action}_${templateId || 'unknown'}_${versionId || 'none'}`
      if (loading) {
        this.$set(this.pendingActions, key, true)
      } else if (Object.prototype.hasOwnProperty.call(this.pendingActions, key)) {
        this.$delete(this.pendingActions, key)
      }
    },

    isActionPending(action, templateId, versionId) {
      const key = `${action}_${templateId || 'unknown'}_${versionId || 'none'}`
      return Boolean(this.pendingActions[key])
    },

    handleExportSuccess(result) {
      this.$emit('export-success', result)
    },

    handleExportError(error) {
      this.$emit('export-error', error)
    },

    handleColumnSettings() {
      this.$emit('column-settings')
    },

    handleToolbarAction({ action }) {
      this.$emit('toolbar-action', action)
    },

    clearSelection() {
      if (this.$refs.baseTable) {
        this.$refs.baseTable.clearSelection()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.template-table {
  .custom-empty {
    text-align: center;
    padding: 40px 20px;
    color: #909399;

    p {
      margin: 16px 0 8px;
      font-size: 14px;
    }

    .empty-tip {
      font-size: 12px;
      color: #c0c4cc;
    }
  }

  .empty-text {
    color: #c0c4cc;
    font-style: italic;
  }

  // 产品项样式
  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .product-main {
      flex: 1;

      .product-code {
        font-weight: 500;
        color: #303133;
        margin-right: 8px;
      }

      .product-name {
        color: #606266;
        font-size: 12px;
      }
    }

    .product-meta {
      margin-left: 12px;
    }
  }

  // 温度段概览样式
  .segment-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;

    .segment-item {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 11px;
      line-height: 1.2;
      border: 1px solid rgba(0, 0, 0, 0.1);

      .segment-order {
        font-weight: 600;
        margin-right: 2px;
      }

      .segment-type {
        margin-right: 4px;
        color: #666;
      }

      .segment-temp {
        font-weight: 500;
        color: #333;
      }
    }

    .segment-more {
      padding: 2px 6px;
      background: #f5f5f5;
      border-radius: 10px;
      font-size: 11px;
      color: #999;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .template-table {
    .segment-summary {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;

      .segment-item {
        font-size: 10px;
        padding: 1px 4px;
      }
    }

    .product-item {
      flex-direction: column;
      align-items: flex-start;

      .product-meta {
        margin-left: 0;
        margin-top: 4px;
      }
    }
  }
}
</style>
