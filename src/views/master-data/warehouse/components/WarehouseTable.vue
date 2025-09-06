/**
 * 仓库表格组件（新版）
 * 功能描述：展示仓库列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
 * 功能增强：支持批量操作、导入导出等高级功能
 * 创建日期：2023-11-01
 */
<template>
  <div class="warehouse-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="allColumns"
      :storage-key="tableStorageKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      :enable-import="true"
      :import-api="importApiFunction"
      :template-api="templateApiFunction"
      :enable-export="true"
      :export-api="exportApiFunction"
      :export-params="exportParams"
      :status-buttons-mode="'dropdown'"
      :status-confirm="false"
      :delete-confirm="false"
      :table-data="data"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-status="handleBatchStatus"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增仓库</el-button>
        <slot name="toolbar-left" />
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

      <template v-for="col in visibleColumnsConfig">
        <el-table-column
          :key="col.prop"
          v-bind="col"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <!-- 使用StatusTag组件展示状态列 -->
            <template v-if="col.prop === 'status'">
              <status-tag
                :status="scope.row.status"
                :text-map="statusTextMap"
                :type-map="statusTypeMap"
              />
            </template>
            <!-- 处理仓库类型列 -->
            <template v-else-if="col.prop === 'warehouseType'">
              {{ getWarehouseTypeText(scope.row.warehouseType) }}
            </template>
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
      </template>

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <!-- 使用ActionButtons组件替代原来的按钮组 -->
          <action-buttons
            :buttons="getActionButtons(scope.row)"
            mode="text"
            :row="scope.row"
            @click="handleActionClick"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      @pagination="handlePagination"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import TableToolbar from '@/components/TableToolbar'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import { generateTableButtons } from '@/components/ActionButtons/presets'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'WarehouseTable',
  components: {
    Pagination,
    TableToolbar,
    ActionButtons,
    StatusTag
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
    // 导入API
    importApi: {
      type: String,
      default: '/api/warehouse/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/api/warehouse/template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/api/warehouse/export'
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 存储键后缀，用于区分不同表格
      storageKeySuffix: 'warehouse',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 状态文本映射
      statusTextMap: {
        0: '禁用',
        1: '启用'
      },
      // 状态类型映射
      statusTypeMap: {
        0: 'info',
        1: 'success'
      }
    }
  },
  computed: {
    // 默认显示的列
    defaultVisibleColumns() {
      return ['code', 'name', 'warehouseType', 'address', 'manager', 'status']
    },

    // 导入API函数
    importApiFunction() {
      return (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return request({
          url: this.importApi,
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
    },

    // 模板API函数
    templateApiFunction() {
      return () => {
        return request({
          url: this.templateApi,
          method: 'get',
          responseType: 'blob'
        })
      }
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
    },
    // 监听可见列变化，更新导出参数
    visibleColumns: {
      handler(val) {
        this.updateExportParams()
      },
      deep: true
    }
  },
  created() {
    this.initWarehouseColumns()
    this.updateExportParams()
  },
  methods: {
    // 获取操作按钮配置
    getActionButtons(row) {
      // 检查 row 是否存在，避免访问 undefined 对象的属性
      if (!row) {
        return generateTableButtons(['edit'])
      }

      // 使用预设按钮生成操作按钮
      const buttons = generateTableButtons(['edit'])

      // 添加状态切换按钮
      const statusButton = {
        text: row.status === 1 ? '禁用' : '启用',
        action: 'statusToggle',
        icon: row.status === 1 ? 'el-icon-close' : 'el-icon-check',
        type: 'text',
        class: row.status === 1 ? 'status-disable' : 'status-enable'
      }

      return buttons.concat([statusButton])
    },

    // 处理按钮点击事件
    handleActionClick({ action, row }) {
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'statusToggle':
          this.handleStatusChange(row)
          break
      }
    },

    // 初始化仓库列配置
    initWarehouseColumns() {
      // 仓库列
      const columns = [
        { prop: 'code', label: '仓库编码', width: '150' },
        { prop: 'name', label: '仓库名称', width: '180' },
        { prop: 'warehouseType', label: '仓库类型', width: '120' },
        { prop: 'address', label: '仓库地址', minWidth: '180' },
        { prop: 'area', label: '面积(㎡)', width: '100', align: 'right' },
        { prop: 'manager', label: '负责人', width: '100' },
        { prop: 'contact', label: '联系方式', width: '130' },
        { prop: 'maxCapacity', label: '最大容量', width: '100', align: 'right' },
        { prop: 'currentUsage', label: '当前使用量', width: '100', align: 'right' },
        { prop: 'status', label: '状态', width: '80' },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: '120',
          formatter: this.formatDate
        }
      ]

      // 初始化列
      this.initColumns(columns)
    },

    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        columns: this.visibleColumns
      }
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-'

      try {
        const d = new Date(date)
        return d.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-')
      } catch (e) {
        return date || '-'
      }
    },

    // 获取仓库类型文本
    getWarehouseTypeText(type) {
      const typeMap = {
        'RAW': '原材料仓库',
        'FINISHED': '成品仓库',
        'SEMI': '半成品仓库',
        'CONSUMABLE': '耗材仓库',
        'SPARE_PARTS': '备件仓库'
      }
      return typeMap[type] || type
    },

    // 行样式
    tableRowClassName({ row }) {
      if (row.status === 0) {
        return 'disabled-row'
      }
      return ''
    },

    // 选择行变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    // 新增按钮点击事件
    handleAdd() {
      this.$emit('add')
    },

    // 编辑按钮点击事件
    handleUpdate(row) {
      this.$emit('update', row)
    },

    // 状态切换按钮点击事件
    handleStatusChange(row) {
      this.$emit('status-change', row)
    },

    // 分页变化
    handlePagination({ page, limit }) {
      // 滚动到顶部
      scrollTo(0, 800)

      this.$emit('pagination', { page, limit })
    },

    // 刷新表格
    handleRefresh() {
      this.$emit('refresh')
    },

    // 批量删除
    handleBatchDelete(rows) {
      this.$emit('batch-delete', rows || this.selectedRows)
    },

    // 批量状态变更
    handleBatchStatus(rows, status) {
      this.$emit('batch-status', rows || this.selectedRows, status)
    },

    // 导入成功
    handleImportSuccess(result) {
      this.$emit('import-success', result)
      this.handleRefresh()
    },

    // 导出成功
    handleExportSuccess(result) {
      this.$emit('export-success', result)
    },

    // 返回顶部方法，供外部调用
    backToTop() {
      scrollTo(0, 800)
    }
  }
}
</script>

<style lang="scss">
.warehouse-table {
  margin-bottom: 20px;

  .disabled-row {
    background-color: #f9f9f9;
    color: #909399;
  }

  .el-table {
    .cell {
      padding: 0 5px;
    }

    td {
      padding: 8px 0;
    }

    // 设置表格最小宽度，防止列过少时表格太窄
    min-width: 100%;
    table {
      width: 100% !important;
    }
  }
}
</style>
