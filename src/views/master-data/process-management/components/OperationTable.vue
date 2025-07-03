/**
 * 工序表格组件
 * 功能描述：展示工序列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
 * 创建日期：2024-12-20
 */
<template>
  <div class="operation-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="columnOptions"
      :storage-key="currentStorageKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      :enable-export="true"
      :export-api="exportApiFunction"
      :export-params="exportParams"
      :status-buttons-mode="'buttons'"
      :status-confirm="false"
      :delete-confirm="true"
      :table-data="data"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增工序</el-button>
        <slot name="toolbar-left" />
      </template>

      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <el-table
      v-loading="loading"
      :data="data"
      border
      highlight-current-row
      :fit="true"
      style="width: 100%"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" align="center" fixed="left" />
      <el-table-column label="#" type="index" width="50" align="center" fixed="left" />

      <el-table-column
        v-for="col in tableColumns"
        :key="col.prop"
        v-bind="col"
        show-overflow-tooltip
        align="center"
      >
        <template slot-scope="scope">
          <!-- 使用StatusTag组件展示状态列 -->
          <template v-if="col.prop === 'status'">
            <StatusTag
              :status="scope.row.status"
              :text-map="statusTextMap"
              :type-map="statusTypeMap"
            />
          </template>

          <!-- 工序类型列 -->
          <template v-else-if="col.prop === 'type'">
            <span>{{ getTypeLabel(scope.row.type) }}</span>
          </template>

          <!-- 报告点列 -->
          <template v-else-if="col.prop === 'reportingPoint'">
            <span>{{ getReportingPointLabel(scope.row.reportingPoint) }}</span>
          </template>

                      <!-- 时间格式化 -->
            <template v-else-if="col.prop === 'createdAt' || col.prop === 'updatedAt'">
             {{ parseTime(scope.row[col.prop], '{y}-{m}-{d} {h}:{i}') || '-' }}
            </template>

          <!-- 其他列的默认渲染 -->
          <template v-else-if="col.formatter">
            {{ col.formatter(scope.row[col.prop], scope.row) }}
          </template>
          <template v-else-if="scope.row[col.prop] !== undefined && scope.row[col.prop] !== null">
            {{ scope.row[col.prop] }}
          </template>
          <template v-else>
            -
          </template>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template slot-scope="scope">
          <!-- 使用ActionButtons组件替代原来的按钮组 -->
          <ActionButtons
            :buttons="getActionButtons(scope.row)"
            mode="text"
            :row="scope.row"
            @click="handleActionClick"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      @pagination="handlePagination"
    />

  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import TableToolbar from '@/components/TableToolbar'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'

import { parseTime } from '@/utils'
import { 
  TABLE_COLUMNS, 
  DEFAULT_VISIBLE_COLUMNS,
  OPERATION_TYPE_OPTIONS, 
  OPERATION_STATUS_OPTIONS,
  REPORTING_POINT_OPTIONS
} from '../constants'

export default {
  name: 'OperationTable',
  components: {
    StatusTag,
    ActionButtons,
    TableToolbar,
    Pagination
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
      default: '/vue-admin-template/mes/operations/export'
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
      pageSize: 10,

      // 状态文本映射
      statusTextMap: {
        'Enabled': '启用',
        'Disabled': '禁用'
      },
      // 状态类型映射
      statusTypeMap: {
        'Enabled': 'success',
        'Disabled': 'info'
      }
    }
  },
  computed: {
    // 所有可用列
    columnOptions() {
      return TABLE_COLUMNS
    },
    // 覆盖mixin中的默认可见列
    defaultVisibleColumns() {
      return DEFAULT_VISIBLE_COLUMNS
    },
    // 重写列设置存储键
    currentStorageKey() {
      return `${this.columnSettingsKeyPrefix}_${this.$options.name || 'common'}`
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
    // 表格列配置
    tableColumns() {
      // 使用mixin中提供的方法筛选可见列
      if (!this.allColumns || this.allColumns.length === 0) {
        // 如果allColumns还没初始化，先使用columnOptions初始化
        return this.columnOptions.filter(col => this.internalVisibleColumns.includes(col.prop))
      }
      return this.allColumns.filter(col => this.internalVisibleColumns.includes(col.prop))
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

    // 设置初始可见列
    this.internalVisibleColumns = [...this.defaultVisibleColumns]

    // 尝试从localStorage读取用户设置的可见列
    const savedColumns = localStorage.getItem(this.currentStorageKey)
    if (savedColumns) {
      try {
        this.internalVisibleColumns = JSON.parse(savedColumns)
      } catch (e) {
        console.error('解析保存的列设置失败:', e)
      }
    }
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
    handlePagination({ page, limit }) {
      this.$emit('pagination', {
        page,
        limit
      })
    },

    // 处理刷新事件
    handleRefresh() {
      this.$emit('refresh')
    },

    // 处理列变更事件
    handleColumnChange(columns) {
      this.internalVisibleColumns = columns
      // 保存列设置到localStorage
      localStorage.setItem(this.currentStorageKey, JSON.stringify(columns))
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

    // 处理批量删除事件
    handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      this.$confirm('确认批量删除选中的记录吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
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
    handleActionClick({ action, row }) {
      switch (action) {
        case 'edit':
          this.$emit('edit', row)
          break
        case 'delete':
          this.confirmDelete(row)
          break
        case 'enable':
          this.$emit('status-change', {
            id: row.id,
            status: 'Enabled'
          })
          break
        case 'disable':
          this.$emit('status-change', {
            id: row.id,
            status: 'Disabled'
          })
          break
      }
    },

    // 确认删除
    confirmDelete(row) {
      this.$confirm(`确认删除工序 "${row.name}"？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete', row)
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 表格行样式
    tableRowClassName({ row }) {
      if (row.status === 'Disabled') {
        return 'row-disabled'
      }
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-table {
  .row-disabled {
    color: #c0c4cc;
  }
}
</style> 