/**
 * 检验项目表格组件
 * 功能描述：展示检验项目列表数据，提供分页、选择、操作功能，支持批量操作、导入导出等高级功能
 * 创建日期：2024-12-19
 */
<template>
  <div class="inspection-item-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="allColumns"
      :storage-key="storageKey"
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">
          新增检验项目
        </el-button>
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

      <template v-for="col in tableColumns">
        <el-table-column
          :key="col.prop"
          v-bind="col"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <!-- 检验类别 -->
            <template v-if="col.prop === 'category'">
              <el-tag :type="getCategoryTagType(scope.row.category)" size="mini">
                {{ getCategoryLabel(scope.row.category) }}
              </el-tag>
            </template>
            <!-- 数据类型 -->
            <template v-else-if="col.prop === 'dataType'">
              <el-tag :type="getDataTypeTagType(scope.row.dataType)" size="mini">
                {{ getDataTypeLabel(scope.row.dataType) }}
              </el-tag>
            </template>
            <!-- 检验方法 -->
            <template v-else-if="col.prop === 'inspectionMethod'">
              <el-tag :type="getMethodTagType(scope.row.inspectionMethod)" size="mini">
                {{ getMethodLabel(scope.row.inspectionMethod) }}
              </el-tag>
            </template>
            <!-- 适用产品 -->
            <template v-else-if="col.prop === 'applicableProduct'">
              <el-tag :type="getProductTagType(scope.row.applicableProduct)" size="mini">
                {{ getProductLabel(scope.row.applicableProduct) }}
              </el-tag>
            </template>
            <!-- 使用StatusTag组件展示状态列 -->
            <template v-else-if="col.prop === 'status'">
              <status-tag
                :status="scope.row.status"
                :text-map="statusTextMap"
                :type-map="statusTypeMap"
              />
            </template>
            <!-- 标准值和公差范围的特殊处理 -->
            <template v-else-if="col.prop === 'standardValue'">
              <span v-if="scope.row.standardValue !== undefined && scope.row.standardValue !== null">
                {{ scope.row.standardValue }}
                <span v-if="scope.row.unit" class="unit-text">{{ scope.row.unit }}</span>
              </span>
              <span v-else>-</span>
            </template>
            <template v-else-if="col.prop === 'toleranceRange'">
              <span v-if="scope.row.toleranceRange">
                {{ scope.row.toleranceRange }}
                <span v-if="scope.row.unit" class="unit-text">{{ scope.row.unit }}</span>
              </span>
              <span v-else>-</span>
            </template>
            <!-- 其他列的默认处理 -->
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

      <el-table-column label="操作" width="230" align="center" fixed="right">
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

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="currentLimit"
      @pagination="handlePaginationChange"
    />
  </div>
</template>

<script>
import TableToolbar from '@/components/TableToolbar'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import Pagination from '@/components/Pagination'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  STATUS_CONFIG,
  INSPECTION_CATEGORY_OPTIONS,
  DATA_TYPE_OPTIONS,
  INSPECTION_METHOD_OPTIONS,
  APPLICABLE_PRODUCT_OPTIONS
} from '../constants'

export default {
  name: 'InspectionItemTable',
  components: {
    TableToolbar,
    StatusTag,
    ActionButtons,
    Pagination
  },
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
    // 每页数量
    limit: {
      type: Number,
      default: 10
    },
    // 导入API
    importApi: {
      type: Function,
      default: null
    },
    // 模板API
    templateApi: {
      type: Function,
      default: null
    },
    // 导出API
    exportApi: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      // 选中的行
      selectedRows: [],
      // 当前页码（内部状态）
      currentPage: this.page,
      // 当前每页数量（内部状态）
      currentLimit: this.limit,
      // 存储键
      storageKey: 'inspection-item-table-columns',
      // 所有列配置
      allColumns: TABLE_COLUMNS,
      // 默认显示列
      defaultVisibleColumns: DEFAULT_VISIBLE_COLUMNS,
      // 当前显示的列
      tableColumns: []
    }
  },
  computed: {
    // 状态文本映射
    statusTextMap() {
      return STATUS_CONFIG.textMap
    },
    // 状态类型映射
    statusTypeMap() {
      return STATUS_CONFIG.typeMap
    },
    // 导出参数
    exportParams() {
      return {
        // 可以添加额外的导出参数
      }
    },
    // 导入API函数
    importApiFunction() {
      return this.importApi || null
    },
    // 模板API函数
    templateApiFunction() {
      return this.templateApi || null
    },
    // 导出API函数
    exportApiFunction() {
      return this.exportApi || null
    }
  },
  watch: {
    // 监听页码变化
    page(newVal) {
      this.currentPage = newVal
    },
    // 监听每页数量变化
    limit(newVal) {
      this.currentLimit = newVal
    }
  },
  created() {
    // 初始化表格列
    this.initTableColumns()
  },
  methods: {
    /**
     * 初始化表格列
     */
    initTableColumns() {
      this.tableColumns = this.allColumns.filter(col => 
        this.defaultVisibleColumns.includes(col.prop)
      )
    },

    /**
     * 获取检验类别标签
     */
    getCategoryLabel(category) {
      const option = INSPECTION_CATEGORY_OPTIONS.find(opt => opt.value === category)
      return option ? option.label : category
    },

    /**
     * 获取检验类别标签类型
     */
    getCategoryTagType(category) {
      const typeMap = {
        'Appearance': 'primary',
        'Dimension': 'success',
        'Performance': 'warning',
        'Chemical': 'danger',
        'Physical': 'info',
        'Mechanical': ''
      }
      return typeMap[category] || ''
    },

    /**
     * 获取数据类型标签
     */
    getDataTypeLabel(dataType) {
      const option = DATA_TYPE_OPTIONS.find(opt => opt.value === dataType)
      return option ? option.label : dataType
    },

    /**
     * 获取数据类型标签类型
     */
    getDataTypeTagType(dataType) {
      const typeMap = {
        'Numeric': 'primary',
        'Text': 'success',
        'Boolean': 'warning',
        'Enum': 'danger',
        'Range': 'info'
      }
      return typeMap[dataType] || ''
    },

    /**
     * 获取检验方法标签
     */
    getMethodLabel(method) {
      const option = INSPECTION_METHOD_OPTIONS.find(opt => opt.value === method)
      return option ? option.label : method
    },

    /**
     * 获取检验方法标签类型
     */
    getMethodTagType(method) {
      const typeMap = {
        'Manual': 'warning',
        'Automatic': 'success',
        'SemiAutomatic': 'primary'
      }
      return typeMap[method] || ''
    },

    /**
     * 获取适用产品标签
     */
    getProductLabel(product) {
      const option = APPLICABLE_PRODUCT_OPTIONS.find(opt => opt.value === product)
      return option ? option.label : product
    },

    /**
     * 获取适用产品标签类型
     */
    getProductTagType(product) {
      const typeMap = {
        'AluminumFoil': 'primary',
        'AluminumSheet': 'success',
        'AluminumCoil': 'warning',
        'All': 'info'
      }
      return typeMap[product] || ''
    },

    /**
     * 表格行类名
     */
    tableRowClassName({ row }) {
      if (row.status === 'Inactive') {
        return 'warning-row'
      }
      return ''
    },

    /**
     * 获取操作按钮配置
     */
    getActionButtons(row) {
      const buttons = [
        {
          text: '查看',
          type: 'primary',
          action: 'view',
          icon: 'el-icon-view'
        },
        {
          text: '编辑',
          type: 'primary',
          action: 'edit',
          icon: 'el-icon-edit'
        }
      ]

      // 根据状态添加启用/禁用按钮
      if (row.status === 'Active') {
        buttons.push({
          text: '禁用',
          type: 'warning',
          action: 'disable',
          icon: 'el-icon-close'
        })
      } else {
        buttons.push({
          text: '启用',
          type: 'success',
          action: 'enable',
          icon: 'el-icon-check'
        })
      }

      buttons.push({
        text: '删除',
        type: 'danger',
        action: 'delete',
        icon: 'el-icon-delete'
      })

      return buttons
    },

    /**
     * 处理操作按钮点击
     */
    handleActionClick({ action, row }) {
      switch (action) {
        case 'view':
          this.$emit('view', row)
          break
        case 'edit':
          this.$emit('edit', row)
          break
        case 'delete':
          this.$emit('delete', row)
          break
        case 'enable':
          this.$emit('status-change', row, 'Active')
          break
        case 'disable':
          this.$emit('status-change', row, 'Inactive')
          break
        default:
          console.warn('未知操作:', action)
      }
    },

    /**
     * 处理选择变化
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange(pagination) {
      this.currentPage = pagination.page
      this.currentLimit = pagination.limit
      this.$emit('pagination-change', pagination)
    },

    /**
     * 处理列变化
     */
    handleColumnChange(visibleColumns) {
      this.tableColumns = this.allColumns.filter(col => 
        visibleColumns.includes(col.prop)
      )
    },

    /**
     * 处理新增
     */
    handleAdd() {
      this.$emit('add')
    },

    /**
     * 处理刷新
     */
    handleRefresh() {
      this.$emit('refresh')
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
     * 处理导入成功
     */
    handleImportSuccess(result) {
      this.$emit('import-success', result)
    },

    /**
     * 处理导出成功
     */
    handleExportSuccess(result) {
      this.$emit('export-success', result)
    },

    /**
     * 刷新成功
     */
    refreshSucceed() {
      // 可以添加刷新成功的处理逻辑
    },

    /**
     * 刷新失败
     */
    refreshFail(message) {
      this.$message.error(message || '刷新失败')
    }
  }
}
</script>

<style lang="scss" scoped>
.inspection-item-table {
  .unit-text {
    color: #909399;
    font-size: 12px;
    margin-left: 2px;
  }

  ::v-deep .warning-row {
    background: #fdf6ec;
  }

  ::v-deep .el-table {
    .el-tag {
      margin: 0;
    }
  }
}
</style>