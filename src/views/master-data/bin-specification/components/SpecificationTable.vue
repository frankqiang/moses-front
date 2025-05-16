/**
 * 料框规格表格组件
 * 功能描述：展示料框规格列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
 * 创建日期：2024-10-30
 */
<template>
  <div class="specification-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="allColumns"
      :storage-key="currentStorageKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      :enable-import="true"
      :import-api="importApiFunction"
      :template-api="templateApiFunction"
      :enable-export="true"
      :export-api="exportApiFunction"
      :export-params="exportParams"
      :status-buttons-mode="'buttons'"
      :status-confirm="false"
      :delete-confirm="false"
      :table-data="data"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增料框规格</el-button>
        <slot name="toolbar-left"></slot>
      </template>
      
      <template #toolbar-right>
        <slot name="toolbar-right"></slot>
      </template>
    </table-toolbar>

    <el-table
      v-loading="loading"
      :data="data"
      border
      highlight-current-row
      :fit="true"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :row-class-name="tableRowClassName"
    >
      <el-table-column type="selection" width="45" align="center" fixed="left" />
      <el-table-column label="#" type="index" width="50" align="center" fixed="left" />
      
      <template v-for="col in tableColumns">
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
            <!-- 尺寸列特殊处理 -->
            <template v-else-if="col.prop === 'dimensions'">
              {{ scope.row.length }} × {{ scope.row.width }} × {{ scope.row.height }}
            </template>
            <!-- 适用产品类型特殊处理 -->
            <template v-else-if="col.prop === 'applicableProducts'">
              <el-tag
                v-for="product in scope.row.applicableProducts"
                :key="product.id"
                size="small"
                effect="plain"
                style="margin-right: 4px; margin-bottom: 2px; border-radius: 4px;"
              >
                {{ product.name }}
              </el-tag>
              <span v-if="!scope.row.applicableProducts || scope.row.applicableProducts.length === 0" class="text-muted">无</span>
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

      <el-table-column label="操作" width="200" align="center" fixed="right">
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
import { CommonButtons, generateTableButtons } from '@/components/ActionButtons/presets'
import { enabledStatusMap } from '@/components/StatusTag/types'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'

export default {
  name: 'SpecificationTable',
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
      default: '/vue-admin-template/mes/bin-specification/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/vue-admin-template/mes/bin-specification/download-template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/vue-admin-template/mes/bin-specification/export'
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 列设置存储键前缀
      columnSettingsKeyPrefix: 'bin_specification_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 状态文本映射
      statusTextMap: enabledStatusMap.textMap,
      // 状态类型映射
      statusTypeMap: enabledStatusMap.typeMap
    }
  },
  computed: {
    // 列设置存储键
    currentStorageKey() {
      return `${this.columnSettingsKeyPrefix}`
    },
    
    // 默认显示的列
    defaultVisibleColumns() {
      return ['code', 'name', 'dimensions', 'maxWeight', 'material', 'status']
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
          method: 'get',
          params: params,
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
    }
  },
  created() {
    // 初始化列配置
    this.initSpecificationColumns()
    this.updateExportParams()
  },
  methods: {
    // 获取操作按钮配置
    getActionButtons(row) {
      // 创建自定义状态切换按钮
      const statusToggleButton = {
        text: row.status === 1 ? '禁用' : '启用',
        action: 'statusToggle',
        icon: row.status === 1 ? 'el-icon-close' : 'el-icon-check',
        type: 'text',
        class: row.status === 1 ? 'status-disable' : 'status-enable',
        // tooltip: row.status === 1 ? '禁用' : '启用'
      }
      
      // 使用预设按钮生成操作按钮，并添加状态切换按钮
      return generateTableButtons(['edit', 'view']).concat([statusToggleButton])
    },
    
    // 处理按钮点击事件
    handleActionClick({ action, row }) {
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'view':
          this.handleView(row)
          break
        case 'statusToggle':
          this.handleStatusChange(row)
          break
      }
    },
    
    // 初始化料框规格列配置
    initSpecificationColumns() {
      // 列配置
      const columns = [
        { prop: 'code', label: '规格代码', width: '120' },
        { prop: 'name', label: '规格名称', width: '150' },
        { 
          prop: 'dimensions', 
          label: '尺寸(cm)', 
          width: '150'
        },
        { 
          prop: 'maxWeight', 
          label: '最大载重(kg)', 
          width: '120'
        },
        { prop: 'material', label: '材质', width: '120' },
        { prop: 'maxStackLayers', label: '最大堆叠层数', width: '120' },
        { prop: 'applicableProducts', label: '适用产品类型', width: '200' },
        { prop: 'supplier', label: '供应商', width: '150' },
        { prop: 'status', label: '状态', width: '80' }
      ]

      // 初始化列
      this.initColumns(columns)
    },

    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        columns: this.internalVisibleColumns
      }
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
    
    // 查看按钮点击事件
    handleView(row) {
      this.$emit('view', row)
    },
    
    // 分页变化
    handlePagination({ page, limit }) {
      this.$emit('size-change', limit)
      this.$emit('current-change', page)
    },

    // 刷新表格
    handleRefresh() {
      this.$emit('current-change', this.currentPage)
    },
    
    // 批量删除
    handleBatchDelete(rows) {
      this.$emit('batch-delete', rows || this.selectedRows)
    },
    
    // 批量启用
    handleBatchEnable(rows) {
      this.$emit('batch-enable', rows || this.selectedRows)
    },
    
    // 批量禁用
    handleBatchDisable(rows) {
      this.$emit('batch-disable', rows || this.selectedRows)
    },
    
    // 导入成功
    handleImportSuccess(result) {
      this.$emit('import-success', result)
      this.handleRefresh()
    },
    
    // 导出成功
    handleExportSuccess(result) {
      this.$emit('export-success', result)
    }
  }
}
</script>

<style lang="scss">
.specification-table {
  margin-bottom: 20px;
  
  .disabled-row {
    background-color: #f9f9f9;
    color: #909399;
  }
  
  .text-muted {
    color: #909399;
    font-style: italic;
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
  
  .status-enable {
    color: #67c23a;
  }
  
  .status-disable {
    color: #f56c6c;
  }
}
</style> 