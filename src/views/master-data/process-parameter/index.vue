/**
 * 工艺参数管理页面
 * 功能描述：管理系统中的工艺模板，包括不同类型的工艺参数设置、工艺曲线定义等
 * 创建日期：2024-11-15
 */
<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-title">
      工艺参数管理
    </div>

    <!-- 搜索表单 -->
    <search-form
      ref="searchForm"
      :init-query="listQuery"
      :loading="listLoading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格组件 -->
    <process-template-table
      ref="templateTable"
      :data="list"
      :total="total"
      :loading="listLoading"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :import-api="'/mes/master-data/process-parameter/import'"
      :template-api="'/mes/master-data/process-parameter/download-template'"
      :export-api="'/mes/master-data/process-parameter/export'"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @update="handleUpdate"
      @view="handleView"
      @delete="handleDelete"
      @submit-approval="handleSubmitApproval"
      @approve="handleApprove"
      @new-version="handleNewVersion"
      @add="handleCreate"
      @refresh="getList"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    />

    <!-- 表单抽屉 -->
    <process-template-form-drawer
      ref="formDrawer"
      :visible.sync="drawerVisible"
      :type="drawerType"
      :template-data="currentTemplate"
      @submit="handleFormSubmit"
      @close="handleDrawerClose"
    />
  </div>
</template>

<script>
// 导入API函数
import {
  getProcessTemplateList,
  getProcessTemplateDetail,
  createProcessTemplate,
  updateProcessTemplate,
  deleteProcessTemplate,
  submitProcessTemplateForApproval,
  approveProcessTemplate,
  createNewVersion,
  batchDeleteProcessTemplate,
  batchChangeProcessTemplateStatus
} from '@/api/master-data/process-parameter'
import { getAllFurnaceTypes } from '@/api/master-data/furnace-type'

// 引入子组件
import SearchForm from './components/SearchForm'
import ProcessTemplateTable from './components/ProcessTemplateTable'
import ProcessTemplateFormDrawer from './components/ProcessTemplateFormDrawer'

// 引入工具函数
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'ProcessParameterManagement',
  components: {
    SearchForm,
    ProcessTemplateTable,
    ProcessTemplateFormDrawer
  },
  data() {
    return {
      // 列表数据
      list: [],
      // 总记录数
      total: 0,
      // 列表加载状态
      listLoading: false,
      // 查询参数
      listQuery: {
        page: 1,
        limit: 10,
        keyword: undefined,
        status: undefined,
        furnaceTypeId: undefined
      },
      // 选中行
      selectedRows: [],
      // 抽屉可见性
      drawerVisible: false,
      // 抽屉类型: create, update, view
      drawerType: 'create',
      // 当前操作的工艺模板数据
      currentTemplate: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取工艺模板列表
    getList() {
      this.listLoading = true

      // 先获取所有炉型数据
      getAllFurnaceTypes().then(furnaceResponse => {
        let furnaceTypes = []

        // 处理嵌套的API返回结构
        if (furnaceResponse && furnaceResponse.code === 20000) {
          if (furnaceResponse.data && furnaceResponse.data.items) {
            // 分页格式的返回
            furnaceTypes = furnaceResponse.data.items
          } else if (Array.isArray(furnaceResponse.data)) {
            // 直接返回数组的情况
            furnaceTypes = furnaceResponse.data
          }
        }

        // 创建炉型ID到名称的映射表
        const furnaceTypeMap = {}
        furnaceTypes.forEach(type => {
          furnaceTypeMap[type.furnaceTypeCode || type.id] = type.furnaceTypeName || type.name
        })

        console.log('炉型映射表:', furnaceTypeMap)
        console.log('当前查询参数:', this.listQuery)

        // 获取工艺模板列表
        getProcessTemplateList(this.listQuery).then(response => {
          this.listLoading = false

          if (response && response.code === 20000 && response.data) {
            this.list = response.data.items || []
            this.total = response.data.total || 0

            console.log('API返回数据:', this.list)

            // 添加炉型名称字段
            this.list.forEach(item => {
              if (item.furnaceTypeId && furnaceTypeMap[item.furnaceTypeId]) {
                item.furnaceTypeName = furnaceTypeMap[item.furnaceTypeId]
              }
            })
          } else {
            this.$message.error('获取工艺模板列表失败')
          }
        }).catch(() => {
          this.listLoading = false
          this.$message.error('获取工艺模板列表失败')
        })
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取炉型数据失败')
      })
    },

    // 搜索
    handleSearch(formData) {
      console.log('接收到的搜索参数:', formData)
      // 只保留分页相关参数，其他查询条件全部使用当前传入的
      this.listQuery = {
        page: 1,
        limit: this.listQuery.limit || 10,
        ...formData
      }
      console.log('最终查询参数:', this.listQuery)
      this.getList()
    },

    // 重置
    handleReset() {
      console.log('接收到重置事件')
      // 只保留分页相关参数，其他查询条件全部清空
      this.listQuery = {
        page: 1,
        limit: this.listQuery.limit || 10
        // 不再包含其他查询参数
      }

      console.log('重置后的查询参数:', this.listQuery)
      // 立即触发查询
      this.$nextTick(() => {
        this.getList()
      })
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 每页条数变化
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },

    // 新增
    handleCreate() {
      this.drawerType = 'create'
      this.currentTemplate = null
      this.drawerVisible = true
    },

    // 编辑
    handleUpdate(row) {
      this.drawerType = 'update'
      this.currentTemplate = row
      this.drawerVisible = true
    },

    // 查看
    handleView(row) {
      this.drawerType = 'view'
      this.currentTemplate = row
      this.drawerVisible = true
    },

    // 删除
    handleDelete(row) {
      deleteProcessTemplate(row.id).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '删除失败'
        })
      })
    },

    // 提交审批
    handleSubmitApproval(row) {
      submitProcessTemplateForApproval(row.id).then(() => {
        this.$message({
          type: 'success',
          message: '提交审批成功!'
        })
        this.getList()
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '提交审批失败'
        })
      })
    },

    // 审批
    handleApprove(row, approved, comment) {
      approveProcessTemplate(row.id, approved, comment).then(() => {
        this.$message({
          type: 'success',
          message: approved ? '批准成功!' : '驳回成功!'
        })
        this.getList()
      }).catch(() => {
        this.$message({
          type: 'error',
          message: approved ? '批准失败' : '驳回失败'
        })
      })
    },

    // 创建新版本
    handleNewVersion(row) {
      createNewVersion(row.id).then(response => {
        this.$message({
          type: 'success',
          message: '创建新版本成功!'
        })
        // 打开编辑抽屉
        this.drawerType = 'update'
        this.currentTemplate = {
          id: response.data.id,
          templateId: response.data.templateId
        }
        this.drawerVisible = true
        this.getList()
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '创建新版本失败'
        })
      })
    },

    // 表单提交
    handleFormSubmit(formData) {
      if (this.drawerType === 'create') {
        // 创建
        createProcessTemplate(formData).then(() => {
          this.$message({
            type: 'success',
            message: '创建成功!'
          })
          this.drawerVisible = false
          this.getList()
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '创建失败'
          })
        })
      } else if (this.drawerType === 'update') {
        // 更新
        updateProcessTemplate(formData).then(() => {
          this.$message({
            type: 'success',
            message: '更新成功!'
          })
          this.drawerVisible = false
          this.getList()
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '更新失败'
          })
        })
      }
    },

    // 抽屉关闭
    handleDrawerClose() {
      this.drawerVisible = false
      this.currentTemplate = null
    },

    // 批量删除
    handleBatchDelete(rows) {
      const ids = rows.map(row => row.id)
      batchDeleteProcessTemplate(ids).then(response => {
        this.$message({
          type: 'success',
          message: `成功删除 ${response.data.count} 条记录!`
        })
        this.getList()
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '批量删除失败'
        })
      })
    },

    // 批量启用
    handleBatchEnable(rows) {
      const ids = rows.map(row => row.id)
      batchChangeProcessTemplateStatus(ids, 'effective').then(response => {
        this.$message({
          type: 'success',
          message: `成功启用 ${response.data.count} 条记录!`
        })
        this.getList()
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '批量启用失败'
        })
      })
    },

    // 批量禁用
    handleBatchDisable(rows) {
      const ids = rows.map(row => row.id)
      batchChangeProcessTemplateStatus(ids, 'history').then(response => {
        this.$message({
          type: 'success',
          message: `成功禁用 ${response.data.count} 条记录!`
        })
        this.getList()
      }).catch(() => {
        this.$message({
          type: 'error',
          message: '批量禁用失败'
        })
      })
    },

    // 导入成功
    handleImportSuccess(response) {
      this.$message({
        type: 'success',
        message: `导入成功! 成功: ${response.data.success}, 失败: ${response.data.failed}`
      })
      this.getList()
    },

    // 导出成功
    handleExportSuccess() {
      this.$message({
        type: 'success',
        message: '导出成功!'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}
</style>
