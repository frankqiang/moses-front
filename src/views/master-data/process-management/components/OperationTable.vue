/**
 * 工序表格组件
 * 功能描述：展示工序列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
 * 创建日期：2024-12-20
 * 重构日期：2024-12-20 - 使用BaseTable组件替代el-table
 * 优化记录：
 *   - 2024-12-20: 使用OverflowTagsPopover组件优化关联资源类型列的显示
 */
<template>
  <div class="operation-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      :enable-export="true"
      :export-api="exportApiFunction"
      :export-params="exportParams"
      :hide-status-buttons="false"
      :status-buttons-mode="'dropdown'"
      :status-confirm="false"
      :delete-confirm="false"
      :table-data="data"
      :smart-status-buttons="true"
      :status-field="'status'"
      :enabled-value="'Enabled'"
      :disabled-value="'Disabled'"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <ActionButtons
          :buttons="toolbarButtons"
          mode="normal"
          @click="handleToolbarAction"
        />
        <slot name="toolbar-left" />
      </template>

      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <!-- 使用BaseTable组件替代el-table，使用内置分页功能 -->
    <BaseTable
      :data="data"
      :columns="baseTableColumns"
      :loading="loading"
      :pagination="paginationConfig"
      :show-selection="true"
      :show-index="true"
      :virtual-scroll="enableVirtualScroll"
      :virtual-threshold="1000"
      :virtual-height="600"
      :item-height="48"
      :allow-retry="true"
      :load-error="loadError"
      border
      stripe
      highlight-current-row
      @selection-change="handleSelectionChange"
      @retry="handleRetry"
      @row-click="handleRowClick"
      @data-error="handleDataError"
      @format-error="handleFormatError"
      @pagination-change="handlePaginationChange"
    >
      <!-- 状态列自定义渲染 -->
      <template #status="{ row }">
        <StatusTag
          :status="row.status"
          :text-map="statusTextMap"
          :type-map="statusTypeMap"
        />
      </template>

      <!-- 工序类型列 -->
      <template #type="{ row }">
        <span>{{ getTypeLabel(row.type) }}</span>
      </template>

      <!-- 报告点列 -->
      <template #reportingPoint="{ row }">
        <span>{{ getReportingPointLabel(row.reportingPoint) }}</span>
      </template>

      <!-- 关联资源类型列 -->
      <template #associatedResourceType="{ row }">
        <!-- 使用全局组件OverflowTagsPopover优化多标签显示 -->
        <OverflowTagsPopover
          v-if="row.associatedResourceType && row.associatedResourceType.length > 0"
          :data="row.associatedResourceType"
          :max-show="1"
          :enable-modern-features="true"
          size="mini"
          type="primary"
          title="关联资源类型"
          :popover-width="300"
          placement="top"
        />
        <span v-else>-</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <ActionButtons
          :buttons="getActionButtons(row)"
          mode="text"
          :row="row"
          @click="handleActionClick"
        />
      </template>

      <!-- 空状态自定义 -->
      <template #empty>
        <div class="custom-empty">
          <i class="el-icon-document-remove" style="font-size: 48px; color: #c0c4cc;" />
          <p>暂无工序数据</p>
          <el-button type="primary" size="small" @click="handleAdd">新增工序</el-button>
        </div>
      </template>
    </BaseTable>

  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import TableToolbar from '@/components/TableToolbar'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import request from '@/utils/request'

import { parseTime, debounce } from '@/utils'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  OPERATION_TYPE_OPTIONS,
  REPORTING_POINT_OPTIONS,
  STATUS_CONFIG
} from '../constants'

export default {
  name: 'OperationTable',
  components: {
    BaseTable,
    StatusTag,
    ActionButtons,
    TableToolbar,
    OverflowTagsPopover
  },
  mixins: [columnSettingsMixin],
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 总记录数
    total: {
      type: Number,
      default: 0
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
    // 当前页码
    page: {
      type: Number,
      default: 1
    },
    // 每页显示条数
    limit: {
      type: Number,
      default: 10
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/mes/v1/master-data/process-management/operations/export'
    }
  },
  data() {
    return {
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'operation_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 当前页码
      currentPage: 1,
      // 每页条数
      pageSize: 10
    }
  },
  computed: {
    // 状态文本映射 - 直接使用常量
    statusTextMap() {
      return STATUS_CONFIG.textMap
    },
    // 状态类型映射 - 直接使用常量
    statusTypeMap() {
      return STATUS_CONFIG.typeMap
    },
    // 工具栏按钮配置
    toolbarButtons() {
      return [
        {
          action: 'add',
          text: '新增工序',
          type: 'primary',
          icon: 'el-icon-plus',
          size: 'mini'
        }
      ]
    },
    // 所有可用列
    columnOptions() {
      return TABLE_COLUMNS
    },
    // 覆盖mixin中的默认可见列
    defaultVisibleColumns() {
      return DEFAULT_VISIBLE_COLUMNS
    },
    // 导出API函数
    exportApiFunction() {
      return (params) => {
        return request({
          url: this.exportApi,
          method: 'post',
          data: params,
          responseType: 'blob'
        })
      }
    },
    // 是否启用虚拟滚动
    enableVirtualScroll() {
      return this.data.length > 100
    },
    // BaseTable列配置 - 直接使用常量，无需转换
    baseTableColumns() {
      return TABLE_COLUMNS.filter(col =>
        this.internalVisibleColumns.includes(col.prop)
      )
    },
    // 分页配置
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
    // 监听页码变化
    page: {
      handler(val) {
        this.currentPage = val
      },
      immediate: true
    },
    // 监听每页条数变化
    limit: {
      handler(val) {
        this.pageSize = val
      },
      immediate: true
    }
  },
  created() {
    // 初始化导出参数
    this.updateExportParams()

    // 初始化列配置 - 使用columnOptions初始化allColumns
    this.allColumns = this.columnOptions

    // 加载列设置（使用mixin的方法）
    this.loadColumnSettings()

    // 创建防抖函数
    this.debouncedRefresh = debounce(() => {
      this.$emit('refresh')
    }, 300)

    // 创建防抖版本的批量删除函数
    this.debouncedBatchDelete = debounce(this.performBatchDelete, 300)
  },
  methods: {
    // 将导入的parseTime函数添加为组件方法
    parseTime(dateTime, format) {
      return parseTime(dateTime, format)
    },

    // 获取工序类型标签
    getTypeLabel(type) {
      const option = OPERATION_TYPE_OPTIONS.find(opt => opt.value === type)
      return option ? option.label : type
    },

    // 获取报告点标签
    getReportingPointLabel(reportingPoint) {
      const option = REPORTING_POINT_OPTIONS.find(opt => opt.value === reportingPoint)
      return option ? option.label : reportingPoint
    },

    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        // 可添加固定的导出参数
      }
    },

    // 处理分页事件
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination', {
        page,
        limit
      })
    },

    // 处理刷新事件（带防抖）
    handleRefresh() {
      this.debouncedRefresh()
    },

    // 处理重试事件
    handleRetry() {
      this.$emit('retry')
    },

    // 处理数据错误
    handleDataError(errorInfo) {
      console.error('表格数据错误:', errorInfo)
      this.$emit('data-error', errorInfo)
    },

    // 处理格式化错误
    handleFormatError(errorInfo) {
      console.error('数据格式化错误:', errorInfo)
      this.$emit('format-error', errorInfo)
    },

    // 处理行点击事件
    handleRowClick(row, column, event) {
      this.$emit('row-click', row, column, event)
    },

    // 处理选择变更事件
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    // 处理新增事件
    handleAdd() {
      this.$emit('create')
    },

    // 处理工具栏按钮点击事件
    handleToolbarAction(button) {
      switch (button.action) {
        case 'add':
          this.handleAdd()
          break
        default:
          console.warn('未知的工具栏操作:', button.action)
      }
    },

    // 处理批量删除事件
    handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      // 使用防抖函数处理批量删除
      this.debouncedBatchDelete(rows)
    },

    // 执行批量删除（防抖版本）
    performBatchDelete(rows) {
      // 构建简洁确认对话框内容
      const confirmContent = `
        <div class="simple-batch-delete-confirm">
          <div class="confirm-header">
            <i class="el-icon-warning confirm-icon"></i>
            <div class="confirm-text">
              <h3>确认批量删除</h3>
              <p>您即将删除以下 ${rows.length} 个工序，此操作不可撤销</p>
            </div>
          </div>
          
          <div class="operation-list">
            ${rows.map((row, index) => `
              <div class="operation-item">
                <span class="item-number">${index + 1}</span>
                <span class="item-code">${row.code}</span>
                <span class="item-name">${row.name}</span>
                <span class="item-type">${this.getTypeLabel(row.type)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="warning-note">
            <i class="el-icon-info"></i>
            <span>此操作不可恢复，请谨慎确认</span>
          </div>
        </div>
      `

      this.$confirm(confirmContent, '批量删除确认', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'simple-batch-delete-message-box'
      }).then(() => {
        this.$emit('batch-delete', rows)
      }).catch(() => {
        this.$message.info('已取消删除操作')
      })
    },

    // 处理批量启用事件
    handleBatchEnable(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      this.$emit('batch-enable', rows)
    },

    // 处理批量禁用事件
    handleBatchDisable(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      this.$emit('batch-disable', rows)
    },

    // 处理导出成功事件
    handleExportSuccess() {
      this.$emit('export-success')
    },

    // 获取操作按钮配置
    getActionButtons(row) {
      if (!row) {
        console.warn('行数据为空，无法生成操作按钮')
        return []
      }

      const buttons = []

      // 添加常规操作按钮
      buttons.push({
        text: '编辑',
        action: 'edit',
        icon: 'el-icon-edit',
        type: 'text',
        tooltip: '编辑工序信息'
      })

      // 根据状态添加启用/禁用按钮
      if (row.status === 'Enabled') {
        buttons.push({
          text: '禁用',
          action: 'disable',
          icon: 'el-icon-close',
          type: 'text',
          class: 'warning',
          tooltip: '禁用该工序'
        })
      } else {
        buttons.push({
          text: '启用',
          action: 'enable',
          icon: 'el-icon-check',
          type: 'text',
          class: 'success',
          tooltip: '启用该工序'
        })
      }

      // 删除按钮总是显示
      buttons.push({
        text: '删除',
        action: 'delete',
        icon: 'el-icon-delete',
        type: 'text',
        class: 'danger',
        tooltip: '删除工序'
      })

      return buttons
    },

    // 处理按钮点击事件
    handleActionClick(button) {
      switch (button.action) {
        case 'edit':
          this.$emit('edit', button.row)
          break
        case 'delete':
          // 直接发送删除事件，让主页面处理确认逻辑
          this.$emit('delete', button.row)
          break
        case 'enable':
          this.$emit('status-change', {
            id: button.row.id,
            status: 'Enabled'
          })
          break
        case 'disable':
          this.$emit('status-change', {
            id: button.row.id,
            status: 'Disabled'
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-table {
  .custom-empty {
    text-align: center;
    padding: 40px 0;

    p {
      margin: 16px 0 8px;
      color: #909399;
    }
  }
}
</style>

<style lang="scss">
// 简洁批量删除对话框样式
.simple-batch-delete-message-box {
  .el-message-box__content {
    .el-message-box__message {
      .simple-batch-delete-confirm {
        .confirm-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .confirm-icon {
            font-size: 24px;
            color: #e6a23c;
            margin-right: 12px;
          }

          .confirm-text {
            h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: #606266;
            }
          }
        }

        .operation-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          margin-bottom: 16px;

          .operation-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border-bottom: 1px solid #f5f7fa;
            font-size: 14px;

            &:last-child {
              border-bottom: none;
            }

            .item-number {
              width: 30px;
              color: #909399;
              font-weight: 500;
            }

            .item-code {
              width: 100px;
              color: #409eff;
              font-weight: 500;
              margin-right: 12px;
            }

            .item-name {
              flex: 1;
              color: #303133;
              margin-right: 12px;
            }

            .item-type {
              color: #606266;
              font-size: 12px;
              background-color: #f4f4f5;
              padding: 2px 6px;
              border-radius: 3px;
            }
          }
        }

        .warning-note {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #e6a23c;
          background-color: #fdf6ec;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #f5dab1;

          i {
            margin-right: 6px;
            font-size: 14px;
          }
        }
      }
    }
  }
}

// 简洁冲突对话框样式
.simple-conflict-dialog-box {
  .el-message-box__content {
    .el-message-box__message {
      .simple-conflict-dialog {
        .conflict-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;

          .conflict-icon {
            font-size: 24px;
            color: #e6a23c;
            margin-right: 12px;
          }

          .conflict-text {
            h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
              color: #303133;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: #606266;
            }
          }
        }

        .blocked-operations,
        .allowed-operations {
          margin-bottom: 16px;

          h4 {
            margin: 0 0 8px 0;
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }

          .operation-list {
            max-height: 120px;
            overflow-y: auto;
            border: 1px solid #e4e7ed;
            border-radius: 4px;

            .operation-item {
              display: flex;
              align-items: center;
              padding: 6px 12px;
              border-bottom: 1px solid #f5f7fa;
              font-size: 13px;

              &:last-child {
                border-bottom: none;
              }

              &.blocked {
                background-color: #fef0f0;

                .item-code {
                  color: #f56c6c;
                }

                .item-status {
                  background-color: #f56c6c;
                  color: white;
                }
              }

              &.allowed {
                background-color: #f0f9ff;

                .item-code {
                  color: #67c23a;
                }

                .item-status {
                  background-color: #67c23a;
                  color: white;
                }
              }

              .item-number {
                width: 25px;
                color: #909399;
                font-weight: 500;
              }

              .item-code {
                width: 80px;
                font-weight: 500;
                margin-right: 12px;
              }

              .item-name {
                flex: 1;
                color: #303133;
                margin-right: 12px;
              }

              .item-status {
                font-size: 12px;
                padding: 2px 6px;
                border-radius: 3px;
              }
            }
          }
        }

        .conflict-note {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #e6a23c;
          background-color: #fdf6ec;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #f5dab1;

          i {
            margin-right: 6px;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
