<!--
 * 文件名称：departments/index.vue
 * 文件描述：部门管理主页面，采用process-management/operations模块的开发范式
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现部门管理基础页面结构
 *   - 2024-01-20: TASK001 - 重构为符合项目范式的组件化架构
-->

<template>
  <div class="department-management">
    <!-- 搜索表单 -->
    <search-form :loading="loading" :parent-options="parentOptions" @search="handleSearch" @reset="handleReset" />

    <!-- 部门表格 -->
    <department-table ref="departmentTable" :data="treeData" :loading="loading" :total="total" :page="pagination.page"
      :limit="pagination.limit" @pagination-change="handlePaginationChange" @create="handleCreate" @edit="handleEdit"
      @view="handleView" @delete="handleDelete" @batch-delete="handleBatchDelete" @toggleStatus="handleToggleStatus"
      @createChild="handleCreateChild" @setManager="handleSetManager" @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable" @export-success="handleExportSuccess" @refresh="fetchList"
      @retry="fetchList" />

    <!-- 部门表单抽屉 -->
    <department-form-drawer :visible.sync="formDrawerVisible" :mode="formMode" :department-data="currentDepartment"
      :parent-options="parentOptions" :manager-options="managerOptions" @success="handleFormSuccess" />
  </div>
</template>

<script>
import { permissionMixin } from '@/utils/permission'
import { debounce } from '@/utils'
import SearchForm from './components/SearchForm.vue'
import DepartmentTable from './components/DepartmentTable.vue'
import DepartmentFormDrawer from './components/DepartmentFormDrawer.vue'
import {
  getDepartmentTree,
  updateDepartmentStatus,
  batchUpdateDepartmentStatus,
  deleteDepartment,
  batchDeleteDepartments
} from './api'

export default {
  name: 'DepartmentManagement',
  components: {
    SearchForm,
    DepartmentTable,
    DepartmentFormDrawer
  },
  mixins: [permissionMixin],
  data() {
    return {
      // 搜索参数
      searchParams: {
        keyword: '',
        status: '',
        parentId: ''
      },
      // 树形数据
      treeData: [],
      // 总记录数
      total: 0,
      // 分页参数
      pagination: {
        page: 1,
        limit: 10
      },
      // 加载状态
      loading: false,
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单模式：create-新增, edit-编辑, view-查看
      formMode: 'create',
      // 当前操作的部门数据
      currentDepartment: null,
      // 选项数据
      parentOptions: [],
      managerOptions: []
    }
  },
  created() {
    // 设置页面标题
    document.title = '部门管理 - 组织结构管理'

    // 权限检查
    if (!this.checkPagePermission()) {
      return
    }

    // 创建防抖搜索函数
    this.debouncedSearch = debounce(this.fetchList, 300)

    // 初始化加载数据
    this.fetchList()
  },
  methods: {
    /**
     * 检查页面访问权限
     */
    checkPagePermission() {
      if (!this.hasPermission('getDepartments')) {
        this.$message.error('您没有部门管理权限，即将跳转到首页')
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
        return false
      }
      return true
    },

    // 获取列表数据
    async fetchList() {
      try {
        this.loading = true
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.searchParams
        }

        const response = await getDepartmentTree(params)
        this.treeData = response.data || []
        this.total = this.calculateTotal(this.treeData)
        this.buildParentOptions()
        this.$refs.departmentTable.refreshSucceed()
      } catch (error) {
        console.error('获取部门列表失败:', error)
        this.$refs.departmentTable.refreshFail('获取数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    // 搜索处理
    handleSearch(formData) {
      this.pagination.page = 1
      this.searchParams = formData
      this.debouncedSearch()
    },

    // 重置搜索
    handleReset() {
      this.pagination.page = 1
      this.searchParams = {
        keyword: '',
        status: '',
        parentId: ''
      }
      this.fetchList()
    },

    // 分页处理
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },

    // 计算总数
    calculateTotal(data) {
      let total = 0
      const traverse = (nodes) => {
        nodes.forEach(node => {
          total++
          if (node.children && node.children.length > 0) {
            traverse(node.children)
          }
        })
      }
      traverse(data)
      return total
    },

    /**
     * 构建父部门选项
     */
    buildParentOptions() {
      const options = []
      const traverse = (nodes, level = 0) => {
        nodes.forEach(node => {
          options.push({
            id: node.id,
            name: '  '.repeat(level) + node.name,
            level: level,
            disabled: false
          })
          if (node.children && node.children.length > 0) {
            traverse(node.children, level + 1)
          }
        })
      }
      traverse(this.treeData)
      this.parentOptions = options
    },

    // 新增部门
    handleCreate() {
      this.formMode = 'create'
      this.currentDepartment = null
      this.formDrawerVisible = true
    },

    // 新增子部门
    handleCreateChild(department) {
      this.formMode = 'create'
      this.currentDepartment = {
        parentId: department.id,
        parentName: department.name
      }
      this.formDrawerVisible = true
    },

    // 查看部门
    handleView(department) {
      this.formMode = 'view'
      this.currentDepartment = department
      this.formDrawerVisible = true
    },

    // 编辑部门
    handleEdit(department) {
      this.formMode = 'edit'
      this.currentDepartment = department
      this.formDrawerVisible = true
    },

    // 切换状态
    async handleToggleStatus(department) {
      const newStatus = department.status === 'active' ? 'inactive' : 'active'
      const actionText = newStatus === 'active' ? '启用' : '禁用'

      try {
        await this.$confirm(
          `确定要${actionText}部门「${department.name}」吗？`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await updateDepartmentStatus(department.id, {
          status: newStatus
        })

        if (response.success) {
          this.$message.success(`${actionText}成功`)
          this.fetchList()
        } else {
          this.$message.error(response.error?.message || `${actionText}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('切换部门状态失败:', error)
          this.$message.error(`${actionText}失败，请稍后重试`)
        }
      }
    },

    // 删除部门
    async handleDelete(department) {
      try {
        await this.$confirm(
          `确定要删除部门「${department.name}」吗？\n删除后将无法恢复，请谨慎操作！`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'error',
            dangerouslyUseHTMLString: true
          }
        )

        const response = await deleteDepartment(department.id)

        if (response.success) {
          this.$message.success('删除成功')
          this.fetchList()
        } else {
          this.$message.error(response.error?.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除部门失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      }
    },

    // 设置部门经理
    handleSetManager(department) {
      // TODO: 实现设置部门经理功能
      this.$message.info('设置部门经理功能待实现')
    },

    // 批量删除
    async handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请选择要删除的部门')
        return
      }

      try {
        await this.$confirm(
          `确定要批量删除选中的 ${rows.length} 个部门吗？\n此操作不可恢复！`,
          '批量删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'error'
          }
        )

        const ids = rows.map(row => row.id)
        const response = await batchDeleteDepartments(ids)

        if (response.success) {
          this.$message.success(`成功删除 ${response.data.count || ids.length} 个部门`)
          this.fetchList()
        } else {
          this.$message.error(response.error?.message || '批量删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除部门失败:', error)
          this.$message.error('批量删除失败，请稍后重试')
        }
      }
    },

    // 批量启用
    async handleBatchEnable(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请选择要启用的部门')
        return
      }

      try {
        const ids = rows.map(row => row.id)
        const response = await batchUpdateDepartmentStatus(ids, { status: 'active' })

        if (response.success) {
          this.$message.success(`成功启用 ${response.data.count || ids.length} 个部门`)
          this.fetchList()
        } else {
          this.$message.error(response.error?.message || '批量启用失败')
        }
      } catch (error) {
        console.error('批量启用部门失败:', error)
        this.$message.error('批量启用失败，请稍后重试')
      }
    },

    // 批量禁用
    async handleBatchDisable(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请选择要禁用的部门')
        return
      }

      try {
        const ids = rows.map(row => row.id)
        const response = await batchUpdateDepartmentStatus(ids, { status: 'inactive' })

        if (response.success) {
          this.$message.success(`成功禁用 ${response.data.count || ids.length} 个部门`)
          this.fetchList()
        } else {
          this.$message.error(response.error?.message || '批量禁用失败')
        }
      } catch (error) {
        console.error('批量禁用部门失败:', error)
        this.$message.error('批量禁用失败，请稍后重试')
      }
    },

    // 导出成功
    handleExportSuccess(result) {
      this.$message.success('导出成功')
    },

    // 表单操作成功处理
    handleFormSuccess() {
      this.formDrawerVisible = false
      this.fetchList()
    }
  }
}
</script>

<style lang="scss" scoped>
.department-management {
  padding: 24px;
  min-height: 500px;
}

// 响应式设计
@media (max-width: 768px) {
  .department-management {
    padding: 16px;
  }
}
</style>
