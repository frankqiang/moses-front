/**
 * 检验项目表格组件
 * 功能描述：展示检验项目列表数据，提供分页、选择、操作功能，支持批量操作、导入导出等高级功能
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-23: 修复重复操作列问题，统一操作按钮风格与OperationTable保持一致
 *   - 2024-12-24: 优化状态显示（解决0/1显示问题），添加OverflowTagsPopover支持多值列，完善刷新提示功能
 */
<template>
  <div class="inspection-item-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      ref="toolbar"
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
      :refresh-feedback-mode="'all'"
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
              <!-- 如果是数组，使用OverflowTagsPopover组件 -->
              <template v-if="Array.isArray(scope.row.category)">
                <OverflowTagsPopover
                  v-if="scope.row.category && scope.row.category.length > 0"
                  :data="scope.row.category"
                  :max-show="1"
                  :enable-modern-features="true"
                  size="mini"
                  type="primary"
                  title="检验类别"
                  :popover-width="300"
                  placement="top"
                  :formatter="getCategoryLabel"
                />
                <span v-else>-</span>
              </template>
              <!-- 如果是单个值，显示为标签 -->
              <template v-else>
                <el-tag :type="getCategoryTagType(scope.row.category)" size="mini">
                  {{ getCategoryLabel(scope.row.category) }}
                </el-tag>
              </template>
            </template>
            <!-- 数据类型 -->
            <template v-else-if="col.prop === 'dataType'">
              <el-tag :type="getDataTypeTagType(scope.row.dataType)" size="mini">
                {{ getDataTypeLabel(scope.row.dataType) }}
              </el-tag>
            </template>
            <!-- 检验方法 -->
            <template v-else-if="col.prop === 'inspectionMethod'">
              <!-- 如果是数组，使用OverflowTagsPopover组件 -->
              <template v-if="Array.isArray(scope.row.inspectionMethod)">
                <OverflowTagsPopover
                  v-if="scope.row.inspectionMethod && scope.row.inspectionMethod.length > 0"
                  :data="scope.row.inspectionMethod"
                  :max-show="1"
                  :enable-modern-features="true"
                  size="mini"
                  type="warning"
                  title="检验方法"
                  :popover-width="300"
                  placement="top"
                  :formatter="getMethodLabel"
                />
                <span v-else>-</span>
              </template>
              <!-- 如果是单个值，显示为标签 -->
              <template v-else>
                <el-tag :type="getMethodTagType(scope.row.inspectionMethod)" size="mini">
                  {{ getMethodLabel(scope.row.inspectionMethod) }}
                </el-tag>
              </template>
            </template>
            <!-- 适用产品 -->
            <template v-else-if="col.prop === 'applicableProduct'">
              <!-- 如果是数组，使用OverflowTagsPopover组件 -->
              <template v-if="Array.isArray(scope.row.applicableProduct)">
                <OverflowTagsPopover
                  v-if="scope.row.applicableProduct && scope.row.applicableProduct.length > 0"
                  :data="scope.row.applicableProduct"
                  :max-show="1"
                  :enable-modern-features="true"
                  size="mini"
                  type="primary"
                  title="适用产品"
                  :popover-width="300"
                  placement="top"
                  :formatter="getProductLabel"
                />
                <span v-else>-</span>
              </template>
              <!-- 如果是单个值，显示为标签 -->
              <template v-else>
                <el-tag :type="getProductTagType(scope.row.applicableProduct)" size="mini">
                  {{ getProductLabel(scope.row.applicableProduct) }}
                </el-tag>
              </template>
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
            <!-- 操作列特殊处理 -->
            <template v-else-if="col.prop === 'actions'">
              <ActionButtons
                :buttons="getActionButtons(scope.row)"
                mode="text"
                :row="scope.row"
                @click="handleActionClick"
              />
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

      <!-- 操作列通过TABLE_COLUMNS配置自动生成，无需手动添加 -->
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
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
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
    Pagination,
    OverflowTagsPopover
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
      if (!row) {
        console.warn('行数据为空，无法生成操作按钮')
        return []
      }

      const buttons = []

      // 添加查看按钮
      buttons.push({
        text: '查看',
        action: 'view',
        icon: 'el-icon-view',
        type: 'text',
        tooltip: '查看检验项目详情'
      })

      // 添加编辑按钮
      buttons.push({
        text: '编辑',
        action: 'edit',
        icon: 'el-icon-edit',
        type: 'text',
        tooltip: '编辑检验项目信息'
      })

      // 根据状态添加启用/禁用按钮
      if (row.status === 'Active') {
        buttons.push({
          text: '禁用',
          action: 'disable',
          icon: 'el-icon-close',
          type: 'text',
          class: 'warning',
          tooltip: '禁用该检验项目'
        })
      } else {
        buttons.push({
          text: '启用',
          action: 'enable',
          icon: 'el-icon-check',
          type: 'text',
          class: 'success',
          tooltip: '启用该检验项目'
        })
      }

      // 删除按钮总是显示
      buttons.push({
        text: '删除',
        action: 'delete',
        icon: 'el-icon-delete',
        type: 'text',
        class: 'danger',
        tooltip: '删除检验项目'
      })

      return buttons
    },

    /**
     * 处理操作按钮点击
     */
    handleActionClick(button) {
      switch (button.action) {
        case 'view':
          this.$emit('view', button.row)
          break
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
            status: 'Active'
          })
          break
        case 'disable':
          this.$emit('status-change', {
            id: button.row.id,
            status: 'Inactive'
          })
          break
        default:
          console.warn('未知操作:', button.action)
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
     * 刷新成功 - 公开方法，供父组件调用
     */
    refreshSucceed(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed(message)
      }
    },

    /**
     * 刷新失败 - 公开方法，供父组件调用
     */
    refreshFail(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshFail(message)
      }
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