/**
 * 检验项目管理主页面
 * 功能描述：检验项目的列表展示、搜索、新增、编辑、删除等功能
 * 创建日期：2024-12-19
 */
<template>
  <div class="inspection-item-management">
    <!-- 搜索表单 -->
    <SearchForm
      ref="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 检验项目表格 -->
    <InspectionItemTable
      ref="inspectionItemTable"
      :data="list"
      :total="total"
      :loading="listLoading"
      :pagination="pagination"
      :import-api="handleImportApi"
      :template-api="downloadInspectionItemTemplate"
      :export-api="exportInspectionItems"
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @create="handleCreate"
      @edit="handleEdit"
      @view="handleView"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @export="handleExport"
      @import="handleImport"
      @download-template="handleDownloadTemplate"
      @refresh="handleRefresh"
    />

    <!-- 表单抽屉 -->
    <InspectionItemFormDrawer
      :visible.sync="drawerVisible"
      :mode="drawerMode"
      :inspection-item-data="currentInspectionItem"
      @success="handleFormSuccess"
      @close="handleFormClose"
    />
  </div>
</template>

<script>
import SearchForm from './components/SearchForm'
import InspectionItemTable from './components/InspectionItemTable'
import InspectionItemFormDrawer from './components/InspectionItemFormDrawer'
import tableRefreshMixin from '@/mixins/tableRefreshMixin'
import {
  getInspectionItemList,
  deleteInspectionItem,
  batchDeleteInspectionItems,
  batchUpdateInspectionItemStatus,
  exportInspectionItems,
  downloadInspectionItemTemplate
} from './api'

export default {
  name: 'InspectionItemManagement',
  mixins: [tableRefreshMixin],
  components: {
    SearchForm,
    InspectionItemTable,
    InspectionItemFormDrawer
  },
  data() {
    return {
      // 表格组件ref名称（用于tableRefreshMixin）
      tableRef: 'inspectionItemTable',
      // 列表数据
      list: [],
      // 总数
      total: 0,
      // 列表加载状态
      listLoading: false,
      // 分页配置
      pagination: {
        page: 1,
        size: 20
      },
      // 搜索条件
      searchParams: {},
      // 选中的行
      selectedRows: [],
      // 抽屉可见性
      drawerVisible: false,
      // 抽屉模式
      drawerMode: 'create',
      // 当前检验项目数据
      currentInspectionItem: null
    }
  },
  computed: {
    // 是否有选中项
    hasSelection() {
      return this.selectedRows.length > 0
    },
    // 是否有禁用项
    hasDisabledItems() {
      return this.selectedRows.some(item => item.status === 'Inactive')
    },
    // 是否有启用项
    hasEnabledItems() {
      return this.selectedRows.some(item => item.status === 'Active')
    }
  },
  methods: {
    /**
     * 获取列表数据
     */
    async fetchList() {
      try {
        this.listLoading = true
        
        const params = {
          page: this.pagination.page,
          size: this.pagination.size,
          ...this.searchParams
        }
        
        const response = await getInspectionItemList(params)
        
        this.list = response.data.items || []
        this.total = response.data.total || 0
        
        // 更新分页信息
        this.pagination = {
          ...this.pagination,
          total: this.total
        }
        
        // 刷新成功提示
        this.$refs.inspectionItemTable?.refreshSucceed()
      } catch (error) {
        console.error('获取检验项目列表失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '获取数据失败，请稍后重试'
        
        // 重置数据
        this.list = []
        this.total = 0
        
        // 刷新失败提示
        this.$refs.inspectionItemTable?.refreshFail(errorMessage)
      } finally {
        this.listLoading = false
      }
    },

    /**
     * 处理搜索
     * 覆盖mixin中的方法，添加搜索参数处理
     */
    handleSearch(searchParams) {
      this.searchParams = { ...searchParams }
      // 调用mixin中的方法
      this.$options.mixins[0].methods.handleSearch.call(this)
    },

    /**
     * 处理选择变化
     */
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    /**
     * 处理新增
     */
    handleCreate() {
      this.drawerMode = 'create'
      this.currentInspectionItem = null
      this.drawerVisible = true
    },

    /**
     * 处理编辑
     */
    handleEdit(row) {
      this.drawerMode = 'update'
      this.currentInspectionItem = { ...row }
      this.drawerVisible = true
    },

    /**
     * 处理查看
     */
    handleView(row) {
      this.drawerMode = 'view'
      this.currentInspectionItem = { ...row }
      this.drawerVisible = true
    },

    /**
     * 处理删除
     */
    async handleDelete(row) {
      try {
        await this.$confirm(
          `确定要删除检验项目"${row.name}"吗？删除后不可恢复。`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const response = await deleteInspectionItem(row.id)
        this.$message.success(response.message || '删除成功')
        
        // 刷新列表
        this.handleDeleteSuccess()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除检验项目失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '删除失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }
    },

    /**
     * 处理批量删除
     */
    async handleBatchDelete() {
      if (!this.hasSelection) {
        this.$message.warning('请先选择要删除的检验项目')
        return
      }
      
      try {
        await this.$confirm(
          `确定要删除选中的 ${this.selectedRows.length} 个检验项目吗？删除后不可恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const ids = this.selectedRows.map(item => item.id)
        const response = await batchDeleteInspectionItems({ ids })
        
        this.$message.success(response.message || '批量删除成功')
        
        // 批量操作成功处理
        this.handleBatchSuccess()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除检验项目失败:', error)
          const errorMessage = error.response?.data?.message || error.message || '批量删除失败，请稍后重试'
          this.$message.error(errorMessage)
        }
      }
    },

    /**
     * 处理批量启用
     */
    async handleBatchEnable() {
      if (!this.hasSelection) {
        this.$message.warning('请先选择要启用的检验项目')
        return
      }
      
      try {
        const ids = this.selectedRows.map(item => item.id)
        const response = await batchUpdateInspectionItemStatus({
          ids,
          status: 'Active'
        })
        
        this.$message.success(response.message || '批量启用成功')
        
        // 批量操作成功处理
        this.handleBatchSuccess()
      } catch (error) {
        console.error('批量启用检验项目失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '批量启用失败，请稍后重试'
        this.$message.error(errorMessage)
      }
    },

    /**
     * 处理批量禁用
     */
    async handleBatchDisable() {
      if (!this.hasSelection) {
        this.$message.warning('请先选择要禁用的检验项目')
        return
      }
      
      try {
        const ids = this.selectedRows.map(item => item.id)
        const response = await batchUpdateInspectionItemStatus({
          ids,
          status: 'Inactive'
        })
        
        this.$message.success(response.message || '批量禁用成功')
        
        // 批量操作成功处理
        this.handleBatchSuccess()
      } catch (error) {
        console.error('批量禁用检验项目失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '批量禁用失败，请稍后重试'
        this.$message.error(errorMessage)
      }
    },

    /**
     * 处理导出
     */
    async handleExport() {
      try {
        const params = {
          ...this.searchParams
        }
        
        // 如果有选中项，只导出选中的
        if (this.hasSelection) {
          params.ids = this.selectedRows.map(item => item.id)
        }
        
        const response = await exportInspectionItems(params)
        
        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `检验项目_${new Date().toISOString().slice(0, 10)}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出检验项目失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '导出失败，请稍后重试'
        this.$message.error(errorMessage)
      }
    },

    /**
     * 处理导入API
     */
    handleImportApi(file) {
      // 这里返回导入API的Promise
      // 实际项目中应该调用真实的导入API
      return new Promise((resolve, reject) => {
        // 模拟API调用
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90%成功率
            resolve({ message: '导入成功' })
          } else {
            reject(new Error('导入失败'))
          }
        }, 1000)
      })
    },

    /**
     * 下载检验项目导入模板
     */
    downloadInspectionItemTemplate() {
      // 调用下载模板API
      this.$message.success('模板下载成功')
    },

    /**
     * 导出检验项目数据
     */
    exportInspectionItems() {
      // 调用导出API
      this.$message.success('数据导出成功')
    },

    /**
     * 处理导入
     */
    handleImport() {
      // 创建文件输入元素
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx,.xls'
      input.onchange = this.processImportFile
      input.click()
    },

    /**
     * 处理导入文件
     */
    async processImportFile(event) {
      const file = event.target.files[0]
      if (!file) {
        return
      }
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // 这里需要调用导入API
        // const response = await importInspectionItems(formData)
        
        this.$message.success('导入成功')
        this.handleImportSuccess()
      } catch (error) {
        console.error('导入检验项目失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '导入失败，请稍后重试'
        this.$message.error(errorMessage)
      }
    },

    /**
     * 处理下载模板
     */
    async handleDownloadTemplate() {
      try {
        const response = await downloadInspectionItemTemplate()
        
        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '检验项目导入模板.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        this.$message.success('模板下载成功')
      } catch (error) {
        console.error('下载模板失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '下载失败，请稍后重试'
        this.$message.error(errorMessage)
      }
    },

    /**
     * 处理表单成功
     * 覆盖mixin中的方法，添加成功消息提示
     */
    handleFormSuccess(data) {
      // 调用mixin中的方法处理刷新
      this.$options.mixins[0].methods.handleFormSuccess.call(this)
      
      // 添加成功消息提示
      if (this.drawerMode === 'create' && data) {
        this.$message.success('检验项目创建成功')
      } else if (this.drawerMode === 'update') {
        this.$message.success('检验项目更新成功')
      }
    },

    /**
     * 处理表单关闭
     */
    handleFormClose() {
      this.currentInspectionItem = null
    }
  }
}
</script>

<style lang="scss" scoped>
.inspection-item-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
  
  > * {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>