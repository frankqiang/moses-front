/**
 * 产品表格组件（新版）
 * 功能描述：展示产品列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
 * 功能增强：支持批量操作、导入导出等高级功能
 * 创建日期：2024-11-10
 */
<template>
  <div class="product-table">
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增产品</el-button>
        <el-dropdown v-if="selectedRows.length > 0" size="mini" trigger="click" @command="handleBatchLifecycleChange">
          <el-button type="primary" size="mini">
            生命周期 <i class="el-icon-arrow-down el-icon--right" />
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="trial">设为试产</el-dropdown-item>
            <el-dropdown-item command="production">设为量产</el-dropdown-item>
            <el-dropdown-item command="discontinued">设为停产</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
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

      <template v-for="col in tableColumns">
        <el-table-column
          :key="col.prop"
          v-bind="col"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <!-- 使用StatusTag组件展示生命周期状态列 -->
            <template v-if="col.prop === 'lifecycleStatus'">
              <status-tag
                :status="scope.row.lifecycleStatus"
                :text-map="lifecycleStatusTextMap"
                :type-map="lifecycleStatusTypeMap"
              />
            </template>
            <!-- 处理规格列 -->
            <template v-else-if="col.prop === 'specification'">
              {{ scope.row.thickness ? scope.row.thickness.toFixed(4) : '' }}mm x {{ scope.row.width || '' }}mm
            </template>
            <!-- 处理工艺模板列 -->
            <template v-else-if="col.prop === 'processTemplates'">
              <el-popover
                v-if="scope.row.processTemplates && scope.row.processTemplates.length"
                placement="top"
                width="300"
                trigger="click"
                popper-class="popover-template-list"
              >
                <div class="template-list">
                  <div class="template-list-header">关联工艺模板列表</div>
                  <div v-for="(item, index) in scope.row.processTemplates" :key="index" class="template-list-item">
                    <span>{{ index + 1 }}. {{ item.name }}</span>
                  </div>
                </div>
                <el-tag slot="reference" type="success" style="cursor: pointer">
                  {{ scope.row.processTemplates[0].name }} <span v-if="scope.row.processTemplates.length > 1">(+{{ scope.row.processTemplates.length - 1 }})</span>
                </el-tag>
              </el-popover>
              <span v-else>无</span>
            </template>
            <!-- 处理质量标准列 -->
            <template v-else-if="col.prop === 'qualityStandards'">
              <el-popover
                v-if="scope.row.qualityStandards && scope.row.qualityStandards.length"
                placement="top"
                width="300"
                trigger="click"
                popper-class="popover-template-list"
              >
                <div class="template-list">
                  <div class="template-list-header">关联质量标准列表</div>
                  <div v-for="(item, index) in scope.row.qualityStandards" :key="index" class="template-list-item">
                    <span>{{ index + 1 }}. {{ item.name }}</span>
                  </div>
                </div>
                <el-tag slot="reference" type="primary" style="cursor: pointer">
                  {{ scope.row.qualityStandards[0].name }} <span v-if="scope.row.qualityStandards.length > 1">(+{{ scope.row.qualityStandards.length - 1 }})</span>
                </el-tag>
              </el-popover>
              <span v-else>无</span>
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
import { CommonButtons, generateTableButtons } from '@/components/ActionButtons/presets'
import { productLifecycleMap } from '@/components/StatusTag/types'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'ProductTable',
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
      default: '/api/product/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/api/product/template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/api/product/export'
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'product_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 生命周期状态文本映射
      lifecycleStatusTextMap: productLifecycleMap.textMap,
      // 生命周期状态类型映射
      lifecycleStatusTypeMap: productLifecycleMap.typeMap
    }
  },
  computed: {
    // 重写列设置存储键
    currentStorageKey() {
      return this.columnSettingsKeyPrefix
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
    }
  },
  created() {
    this.initProductColumns()
    this.updateExportParams()
  },
  methods: {
    // 获取操作按钮配置
    getActionButtons(row) {
      // 创建自定义状态切换按钮
      const statusButtons = [
        {
          text: '设为试产',
          action: 'trial',
          type: 'text',
          disabled: row.lifecycleStatus === 'trial',
          tooltip: '将产品生命周期设置为试产阶段'
        },
        {
          text: '设为量产',
          action: 'production',
          type: 'text',
          disabled: row.lifecycleStatus === 'production',
          tooltip: '将产品生命周期设置为量产阶段'
        },
        {
          text: '设为停产',
          action: 'discontinued',
          type: 'text',
          disabled: row.lifecycleStatus === 'discontinued',
          tooltip: '将产品生命周期设置为停产阶段'
        }
      ]

      // 使用预设按钮生成操作按钮
      const buttons = [
        {
          // text: '编辑',
          action: 'edit',
          type: 'text',
          icon: 'el-icon-edit',
          tooltip: '编辑产品',
          showText: true
        },
        {
          // text: '查看',
          action: 'view',
          type: 'text',
          icon: 'el-icon-view',
          tooltip: '查看产品详情',
          showText: true
        }
      ]

      // 添加状态变更下拉按钮
      const statusButton = {
        text: '状态变更',
        action: 'statusDropdown',
        type: 'text',
        children: statusButtons,
        tooltip: '修改产品生命周期',
        showText: true
      }

      return [...buttons, statusButton]
    },

    // 处理按钮点击事件
    handleActionClick({ action, row, parentAction }) {
      // 如果是状态下拉菜单的子项点击
      if (parentAction === 'statusDropdown') {
        this.handleStatusChange(row, action)
        return
      }

      // 处理主要操作
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'view':
          this.handleView(row)
          break
        case 'trial':
        case 'production':
        case 'discontinued':
          this.handleStatusChange(row, action)
          break
      }
    },

    // 初始化产品列配置
    initProductColumns() {
      // 产品列
      const columns = [
        { prop: 'code', label: '产品编码', width: '160' },
        { prop: 'name', label: '产品名称', width: '150' },
        { prop: 'alloy', label: '合金牌号', width: '100' },
        { prop: 'state', label: '状态/硬度', width: '100' },
        { prop: 'specification', label: '规格', width: '160' },
        { prop: 'unitWeight', label: '单位重量(kg/卷)', width: '140' },
        { prop: 'lifecycleStatus', label: '产品生命周期', width: '120' },
        { prop: 'processTemplates', label: '关联工艺模板', width: '200' },
        { prop: 'qualityStandards', label: '关联质量标准', width: '200' },
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
        columns: this.internalVisibleColumns
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

    // 行样式
    tableRowClassName({ row }) {
      if (row.lifecycleStatus === 'discontinued') {
        return 'discontinued-row'
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
    handleStatusChange(row, lifecycleStatus) {
      this.$emit('status-change', row, lifecycleStatus)
    },

    // 查看按钮点击事件
    handleView(row) {
      this.$emit('view', row)
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
    },

    // 批量生命周期变更
    handleBatchLifecycleChange(status) {
      this.$emit('batch-lifecycle-change', status)
    }
  }
}
</script>

<style lang="scss">
.product-table {
  margin-bottom: 20px;

  .discontinued-row {
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

.template-list {
  max-height: 300px;
  overflow-y: auto;

  &-header {
    font-weight: bold;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  &-item {
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }
}

.popover-template-list {
  max-width: 80%;
  min-width: 200px;
}
</style>
