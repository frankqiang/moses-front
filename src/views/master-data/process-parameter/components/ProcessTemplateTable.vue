/**
 * 工艺模板表格组件
 * 功能描述：展示工艺模板列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
 * 功能增强：支持批量操作、导入导出等高级功能
 * 创建日期：2024-11-15
 */
<template>
  <div class="process-template-table">
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
      :delete-confirm="true"
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增工艺模板</el-button>
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
          <!-- 适用产品范围列 -->
          <template v-else-if="col.prop === 'applicableProducts'">
            <overflow-tags-popover
              :data="scope.row.applicableProducts"
              :max-show="1"
              label-key="name"
              title="适用产品范围"
            >
              <template #popover-item="{ item, index }">
                <span>{{ index + 1 }}. {{ item.name }} ({{ item.code }})</span>
              </template>
            </overflow-tags-popover>
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

      <el-table-column label="操作" width="250" align="center" fixed="right">
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
// 全局组件无需导入
import TableToolbar from '@/components/TableToolbar'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'

export default {
  name: 'ProcessTemplateTable',
  components: {
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
      default: '/vue-admin-template/mes/process-template/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/vue-admin-template/mes/process-template/download-template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/vue-admin-template/mes/process-template/export'
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'process_template_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 状态文本映射
      statusTextMap: {
        'draft': '草稿',
        'pending': '待审批',
        'effective': '生效',
        'history': '历史'
      },
      // 状态类型映射
      statusTypeMap: {
        'draft': 'info',
        'pending': 'warning',
        'effective': 'success',
        'history': 'danger'
      },
      // 所有可用列
      allColumns: [
        { prop: 'templateId', label: '模板ID', width: '120' },
        { prop: 'templateName', label: '模板名称', width: '180' },
        { prop: 'version', label: '版本号', width: '80' },
        { prop: 'status', label: '状态', width: '100' },
        { prop: 'furnaceTypeName', label: '关联炉型', width: '150' },
        { prop: 'applicableProducts', label: '适用产品范围', },
        { prop: 'createdBy', label: '创建人', width: '120' },
        { prop: 'createdAt', label: '创建时间', width: '150', formatter: this.formatDateTime },
        { prop: 'updatedBy', label: '最后修改人', width: '120' },
        { prop: 'updatedAt', label: '最后修改时间', width: '150', formatter: this.formatDateTime }
      ]
    }
  },
  computed: {
    // 覆盖mixin中的默认可见列
    defaultVisibleColumns() {
      return ['templateId', 'templateName', 'version', 'status', 'furnaceTypeName', 'applicableProducts', 'createdAt']
    },
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
    // 初始化导出参数
    this.updateExportParams()
  },
  methods: {
    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        // 可添加固定的导出参数
      }
    },
    
    // 格式化日期时间
    formatDateTime(value) {
      if (!value) return '-'
      return value.substring(0, 16).replace('T', ' ')
    },
    
    // 获取适用产品的显示文本
    getProductsDisplay(products) {
      if (!products || !products.length) return '-'
      if (products.length === 1) return products[0].name
      return `${products[0].name} 等 ${products.length} 个产品`
    },
    
    // 获取适用产品的提示文本
    getProductsTooltip(products) {
      if (!products || !products.length) return ''
      return products.map(p => `${p.name} (${p.code})`).join('\n')
    },
    
    // 获取操作按钮配置
    getActionButtons(row) {
      const buttons = []
      
      // 根据状态显示不同的按钮
      if (row.status === 'draft') {
        // 草稿状态
        buttons.push(
          { text: '编辑', action: 'edit', icon: 'el-icon-edit', type: 'text', tooltip: '编辑工艺模板' },
          { text: '查看', action: 'view', icon: 'el-icon-view', type: 'text', tooltip: '查看工艺模板详情' },
          { text: '提交审批', action: 'submit', icon: 'el-icon-s-promotion', type: 'text', tooltip: '提交审批' },
          { text: '删除', action: 'delete', icon: 'el-icon-delete', type: 'text', class: 'danger', tooltip: '删除工艺模板' }
        )
      } else if (row.status === 'pending') {
        // 待审批状态
        buttons.push(
          { text: '查看', action: 'view', icon: 'el-icon-view', type: 'text', tooltip: '查看工艺模板详情' },
          { text: '批准', action: 'approve', icon: 'el-icon-check', type: 'text', class: 'success', tooltip: '批准工艺模板' },
          { text: '驳回', action: 'reject', icon: 'el-icon-close', type: 'text', class: 'danger', tooltip: '驳回工艺模板' }
        )
      } else if (row.status === 'effective') {
        // 生效状态
        buttons.push(
          { text: '查看', action: 'view', icon: 'el-icon-view', type: 'text', tooltip: '查看工艺模板详情' },
          { text: '新版本', action: 'new-version', icon: 'el-icon-document-copy', type: 'text', tooltip: '创建新版本' }
        )
      } else {
        // 历史状态
        buttons.push(
          { text: '查看', action: 'view', icon: 'el-icon-view', type: 'text', tooltip: '查看工艺模板详情' }
        )
      }
      
      return buttons
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
        case 'submit':
          this.handleSubmitApproval(row)
          break
        case 'approve':
          this.handleApprove(row)
          break
        case 'reject':
          this.handleReject(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
        case 'new-version':
          this.handleNewVersion(row)
          break
      }
    },
    
    // 表格行样式
    tableRowClassName({ row }) {
      if (row.status === 'history') {
        return 'row-history'
      }
      return ''
    },
    
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },
    
    // 处理分页
    handlePagination({ page, limit }) {
      this.$emit('size-change', limit)
      this.$emit('current-change', page)
    },
    
    // 处理刷新
    handleRefresh() {
      this.$emit('refresh')
    },
    
    // 处理新增
    handleAdd() {
      this.$emit('add')
    },
    
    // 处理编辑
    handleUpdate(row) {
      this.$emit('update', row)
    },
    
    // 处理查看
    handleView(row) {
      this.$emit('view', row)
    },
    
    // 处理删除
    handleDelete(row) {
      this.$confirm('此操作将永久删除该工艺模板, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete', row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    
    // 处理提交审批
    handleSubmitApproval(row) {
      this.$confirm('确认提交该工艺模板进行审批?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.$emit('submit-approval', row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消提交'
        })
      })
    },
    
    // 处理批准
    handleApprove(row) {
      this.$prompt('请输入审批意见', '批准工艺模板', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入审批意见（可选）'
      }).then(({ value }) => {
        this.$emit('approve', row, true, value)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消批准'
        })
      })
    },
    
    // 处理驳回
    handleReject(row) {
      this.$prompt('请输入驳回原因', '驳回工艺模板', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入驳回原因',
        inputValidator: value => {
          return value.trim() !== '' || '驳回原因不能为空'
        }
      }).then(({ value }) => {
        this.$emit('approve', row, false, value)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消驳回'
        })
      })
    },
    
    // 处理创建新版本
    handleNewVersion(row) {
      this.$confirm('确认基于此模板创建新版本?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.$emit('new-version', row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消创建'
        })
      })
    },
    
    // 处理批量删除
    handleBatchDelete(rows) {
      this.$emit('batch-delete', rows)
    },
    
    // 处理批量启用
    handleBatchEnable(rows) {
      this.$emit('batch-enable', rows)
    },
    
    // 处理批量禁用
    handleBatchDisable(rows) {
      this.$emit('batch-disable', rows)
    },
    
    // 处理导入成功
    handleImportSuccess(response) {
      this.$emit('import-success', response)
    },
    
    // 处理导出成功
    handleExportSuccess() {
      this.$emit('export-success')
    }
  }
}
</script>

<style lang="scss" scoped>
.process-template-table {
  .row-history {
    color: #999;
    background-color: #f9f9f9;
  }
  
  .products-cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }
  
  .product-list {
    padding: 5px 0;
    
    &-header {
      font-weight: bold;
      padding: 0 0 10px 0;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;
    }
    
    &-item {
      padding: 5px 0;
      
      &:not(:last-child) {
        border-bottom: 1px dashed #f0f0f0;
      }
    }
  }
}
</style>
