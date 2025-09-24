<!--
 * 文件名称：PositionTable.vue
 * 文件描述：岗位表格组件，使用BaseTable展示数据
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 创建，使用BaseTable组件和全局组件规范
-->

<template>
  <div class="position-table">
    <!-- 使用全局表格工具栏组件 -->
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
      :hide-status-buttons="false"
      :status-buttons-mode="'dropdown'"
      :status-confirm="false"
      :delete-confirm="false"
      :table-data="data"
      :smart-status-buttons="true"
      :status-field="'status'"
      :enabled-value="'active'"
      :disabled-value="'inactive'"
      :refresh-feedback-mode="'all'"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <ActionButtons :buttons="toolbarButtons" mode="normal" @click="handleToolbarAction" />
        <slot name="toolbar-left" />
      </template>

      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <!-- 使用BaseTable组件 -->
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
      <!-- 注意：type字段在接口文档中未定义，暂时注释掉 -->
      <!-- <template #type="{ row }">
        <span>{{ getTypeLabel(row.type) }}</span>
      </template> -->

      <!-- 所属部门列 -->
      <template #department="{ row }">
        <span v-if="row.department">{{ row.department.name }}</span>
        <span v-else class="text-muted">-</span>
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <StatusTag :status="row.status" :text-map="statusTextMap" :type-map="statusTypeMap" />
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <ActionButtons :buttons="getActionButtons(row)" mode="text" :row="row" @click="handleActionClick" />
      </template>

      <!-- 空状态 -->
      <template #empty>
        <div class="custom-empty">
          <i class="el-icon-suitcase" style="font-size: 48px; color: #c0c4cc;" />
          <p>暂无岗位数据</p>
          <el-button type="primary" size="small" @click="handleAdd">新增岗位</el-button>
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
import { debounce } from '@/utils'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  STATUS_CONFIG,
  TOOLBAR_BUTTONS,
  ACTION_BUTTONS
} from '../constants'

export default {
  name: 'PositionTable',
  components: {
    BaseTable,
    StatusTag,
    ActionButtons,
    TableToolbar
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
      default: '/v1/positions/export'
    }
  },
  data() {
    return {
      // 选中的行
      selectedRows: []
    }
  },
  computed: {
    /**
         * 列配置存储键名
         */
    columnSettingsKey() {
      return 'position-table-columns'
    },

    /**
         * 列选项
         */
    columnOptions() {
      return TABLE_COLUMNS
    },

    /**
         * 默认可见列
         */
    defaultVisibleColumns() {
      return DEFAULT_VISIBLE_COLUMNS
    },

    /**
         * BaseTable列配置
         */
    baseTableColumns() {
      return this.visibleColumns
    },

    /**
         * 状态文本映射
         */
    statusTextMap() {
      return STATUS_CONFIG.textMap
    },

    /**
         * 状态类型映射
         */
    statusTypeMap() {
      return STATUS_CONFIG.typeMap
    },

    /**
         * 工具栏按钮
         */
    toolbarButtons() {
      return TOOLBAR_BUTTONS.filter(button => {
        // 开发阶段暂时不检查权限
        return true
        // TODO: 生产环境请启用权限检查
        // return !button.permission || this.$hasPermission(button.permission)
      })
    },

    /**
         * 分页配置
         */
    paginationConfig() {
      return {
        page: this.page,
        limit: this.limit,
        total: this.total
      }
    },

    /**
         * 是否启用虚拟滚动
         */
    enableVirtualScroll() {
      return this.data.length > 1000
    },

    /**
         * 导出API函数
         */
    exportApiFunction() {
      // 返回一个函数，而不是字符串
      return async(params) => {
        // 这里应该调用实际的导出API
        // 由于开发阶段暂时没有真实的导出接口，先返回Mock响应
        console.log('导出岗位数据，参数:', params)
        return Promise.resolve({
          success: true,
          message: '导出成功',
          data: { filename: '岗位数据.xlsx' }
        })
      }
    },

    /**
         * 导出参数
         */
    exportParams() {
      return {
        // 导出参数可以根据搜索条件动态生成
      }
    }
  },
  created() {
    // 创建防抖函数
    this.debouncedRefresh = debounce(this.handleRefresh, 300)
  },
  methods: {
    // 注意：type字段在接口文档中未定义，暂时注释掉
    // /**
    //      * 获取岗位类型标签
    //      */
    // getTypeLabel(type) {
    //   const option = POSITION_TYPE_OPTIONS.find(opt => opt.value === type)
    //   return option ? option.label : type
    // },

    /**
         * 获取操作按钮
         */
    getActionButtons(row) {
      const buttons = []

      // 根据权限和业务逻辑动态生成按钮
      Object.entries(ACTION_BUTTONS).forEach(([key, config]) => {
        // 开发阶段暂时不检查权限
        // eslint-disable-next-line no-constant-condition
        if (true) {
          // TODO: 生产环境请启用权限检查
          // if (!config.permission || this.$hasPermission(config.permission)) {
          const buttonConfig = { ...config, action: key, data: row }

          // 特殊处理切换状态按钮
          if (key === 'toggleStatus') {
            buttonConfig.text = row.status === 'active' ? '禁用' : '启用'
            buttonConfig.icon = row.status === 'active' ? 'el-icon-close' : 'el-icon-check'
          }

          buttons.push(buttonConfig)
        }
      })

      return buttons
    },

    /**
         * 处理选择变化
         */
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    /**
         * 处理刷新
         */
    handleRefresh() {
      this.$emit('refresh')
    },

    /**
         * 处理重试
         */
    handleRetry() {
      this.$emit('retry')
    },

    /**
         * 处理行点击
         */
    handleRowClick(row) {
      // 可以在这里添加行点击逻辑
      console.log('Row clicked:', row)
    },

    /**
         * 处理数据错误
         */
    handleDataError(error) {
      console.error('表格数据错误:', error)
      this.$message.error('数据格式错误，请检查数据源')
    },

    /**
         * 处理格式错误
         */
    handleFormatError(error) {
      console.error('表格格式错误:', error)
      this.$message.error('表格格式错误，请联系技术支持')
    },

    /**
         * 处理分页变化
         */
    handlePaginationChange({ page, limit }) {
      this.$emit('pagination-change', { page, limit })
    },

    /**
         * 处理工具栏操作
         */
    handleToolbarAction(button) {
      this.$emit(button.action, button.data)
    },

    /**
         * 处理操作按钮点击
         */
    handleActionClick(button) {
      this.$emit(button.action, button.data)
    },

    /**
         * 处理新增
         */
    handleAdd() {
      this.$emit('create')
    },

    /**
         * 处理批量删除
         */
    handleBatchDelete(rows) {
      this.$emit('batch-delete', rows)
    },

    /**
         * 处理批量启用
         */
    handleBatchEnable(rows) {
      this.$emit('batch-enable', rows)
    },

    /**
         * 处理批量禁用
         */
    handleBatchDisable(rows) {
      this.$emit('batch-disable', rows)
    },

    /**
         * 处理导出成功
         */
    handleExportSuccess(result) {
      this.$emit('export-success', result)
    },

    /**
         * 刷新成功反馈
         */
    refreshSucceed() {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed()
      }
    },

    /**
         * 刷新失败反馈
         */
    refreshFail(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshFail(message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.position-table {
  .text-muted {
    color: #909399;
  }

  .custom-empty {
    padding: 40px;
    text-align: center;
    color: #909399;

    p {
      margin: 16px 0;
      font-size: 14px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .position-table {
    font-size: 13px;
  }
}
</style>
