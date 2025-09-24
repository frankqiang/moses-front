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
    <department-table
      ref="departmentTable"
      :data="treeData"
      :loading="loading"
      :load-error="loadError"
      :total="total"
      :page="pagination.page"
      :limit="pagination.limit"
      @pagination-change="handlePaginationChange"
      @create="handleCreate"
      @edit="handleEdit"
      @view="handleView"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @toggleStatus="handleToggleStatus"
      @createChild="handleCreateChild"
      @setManager="handleSetManager"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @export-success="handleExportSuccess"
      @refresh="handleRefresh"
      @retry="handleRetry"
    />

    <!-- 部门表单抽屉 -->
    <department-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formMode"
      :department-data="currentDepartment"
      :parent-options="parentOptions"
      :manager-options="managerOptions"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
import { setTokens } from '@/utils/auth'
import SearchForm from './components/SearchForm.vue'
import DepartmentTable from './components/DepartmentTable.vue'
import DepartmentFormDrawer from './components/DepartmentFormDrawer.vue'
import {
  DEFAULT_SEARCH_PARAMS,
  DEPARTMENT_DEFAULT_QUERY
} from './constants'
import {
  getDepartmentList,
  getDepartmentTree,
  updateDepartmentStatus,
  batchUpdateDepartmentStatus,
  deleteDepartment,
  batchDeleteDepartments
} from './api'

const DEV_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZfdXNlciIsImlhdCI6MTY0Mjc4MTIzNCwiZXhwIjoxNjQyNzg0ODM0fQ.dev_token_signature'

export default {
  name: 'DepartmentManagement',
  components: {
    SearchForm,
    DepartmentTable,
    DepartmentFormDrawer
  },
  data() {
    return {
      // 搜索参数
      searchParams: { ...DEFAULT_SEARCH_PARAMS },
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
      // 加载错误状态
      loadError: false,
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单模式：create-新增, edit-编辑, view-查看
      formMode: 'create',
      // 当前操作的部门数据
      currentDepartment: null,
      // 选项数据
      parentOptions: [],
      managerOptions: [],
      // 当前数据是否来自列表接口
      useListMode: false,
      // 部门经理详情映射，用于补充树形数据的经理信息
      departmentManagerMap: new Map()
    }
  },
  created() {
    // 设置页面标题
    document.title = '部门管理 - 组织结构管理'

    // 🚧 开发环境认证设置 - 确保API调用能正常工作
    this.initDevelopmentAuth()

    // 初始化加载数据
    this.fetchList()
  },
  methods: {
    /**
     * 🚧 开发环境认证初始化
     * 在开发环境中设置临时token，使API调用能正常工作
     */
    initDevelopmentAuth() {
      if (process.env.NODE_ENV !== 'development') {
        return
      }

      if (this.$store.getters.token) {
        return
      }

      setTokens({ accessToken: DEV_ACCESS_TOKEN })
      this.$store.commit('user/SET_TOKEN', DEV_ACCESS_TOKEN)
      this.$store.commit('user/SET_NAME', '开发测试用户')
      this.$store.commit('user/SET_ROLES', ['admin', 'organization_manager'])
      this.$store.commit('user/SET_PERMISSIONS', ['getDepartments', 'createDepartment', 'updateDepartment', 'deleteDepartment'])
    },

    /**
     * 获取部门数据
     */
    async fetchList({ forceList = false } = {}) {
      this.loading = true
      this.loadError = false

      const shouldUseList = this.shouldUseList(forceList)

      try {
        if (!shouldUseList) {
          await this.loadTreeData()
          this.handleRefreshFeedback(true)
          return
        }

        await this.loadListData()
        this.handleRefreshFeedback(true)
      } catch (treeError) {
        if (!shouldUseList) {
          try {
            await this.loadListData()
            this.useListMode = true
            this.$message.warning('树形接口暂不可用，已切换为列表数据。')
            this.handleRefreshFeedback(true)
            return
          } catch (listError) {
            this.handleFetchError(listError)
          }
        } else {
          this.handleFetchError(treeError)
        }
      } finally {
        this.loading = false
      }
    },

    shouldUseList(forceList = false) {
      if (forceList) {
        return true
      }

      return this.useListMode || this.hasActiveFilters(this.searchParams)
    },

    hasActiveFilters(params) {
      return Boolean(params.keyword) || Boolean(params.status) || Boolean(params.parentId)
    },

    async loadTreeData() {
      const response = await getDepartmentTree()
      const treeData = Array.isArray(response.data) ? response.data : []
      await this.attachManagersToTree(treeData)
      this.applyTreeData(treeData)
    },

    async loadListData() {
      const params = this.buildListQueryParams()
      const response = await getDepartmentList(params)
      const meta = response.data || {}
      const list = meta.results || []
      this.applyListData(list, meta)
    },

    applyTreeData(treeData) {
      this.treeData = treeData
      this.total = this.countTreeNodes(treeData)
      this.useListMode = false
      this.buildParentOptions(treeData, true)
    },

    applyListData(listData, meta = {}) {
      this.treeData = this.buildTreeFromList(listData)
      this.total = meta.totalResults || listData.length
      this.pagination.page = meta.page || this.pagination.page
      this.pagination.limit = meta.limit || this.pagination.limit
      this.useListMode = true
      this.buildParentOptions(listData, false)
    },

    buildListQueryParams() {
      const params = {
        ...DEPARTMENT_DEFAULT_QUERY,
        page: this.pagination.page,
        limit: this.pagination.limit
      }

      if (this.searchParams.keyword) {
        params.name = this.searchParams.keyword
      }
      if (this.searchParams.status) {
        params.status = this.searchParams.status
      }
      if (this.searchParams.parentId) {
        params.parentId = this.searchParams.parentId
      }

      return params
    },

    countTreeNodes(nodes) {
      if (!Array.isArray(nodes) || nodes.length === 0) {
        return 0
      }

      let count = 0
      const traverse = (items) => {
        items.forEach(item => {
          count += 1
          if (Array.isArray(item.children) && item.children.length > 0) {
            traverse(item.children)
          }
        })
      }

      traverse(nodes)
      return count
    },

    buildParentOptions(source, isTree = true) {
      const options = []

      if (isTree) {
        const traverse = (nodes, level = 0) => {
          nodes.forEach(node => {
            options.push({
              value: node.id,
              label: `${'  '.repeat(level)}${node.name}`,
              level,
              status: node.status
            })
            if (Array.isArray(node.children) && node.children.length > 0) {
              traverse(node.children, level + 1)
            }
          })
        }

        traverse(source || [])
      } else {
        source.forEach(item => {
          const level = Math.max((item.level || 1) - 1, 0)
          options.push({
            value: item.id,
            label: `${'  '.repeat(level)}${item.name}`,
            level,
            status: item.status
          })
        })

        options.sort((a, b) => a.level - b.level)
      }

      this.parentOptions = options
    },

    handleFetchError(error) {
      const message = error?.message || '获取部门数据失败，请稍后重试'
      this.treeData = []
      this.total = 0
      this.loadError = message
      this.handleRefreshFeedback(false, message)
      this.$message.error(message)
    },

    handleRefreshFeedback(success, message = '') {
      if (!this.$refs.departmentTable) {
        return
      }

      if (success) {
        this.$refs.departmentTable.refreshSucceed()
      } else {
        this.$refs.departmentTable.refreshFail(message)
      }
    },

    refreshCurrentMode() {
      return this.fetchList({ forceList: this.useListMode })
    },

    // 搜索处理
    handleSearch(formData) {
      this.pagination.page = 1
      this.searchParams = {
        ...DEFAULT_SEARCH_PARAMS,
        ...formData
      }

      const needList = this.hasActiveFilters(this.searchParams)
      this.useListMode = needList
      this.fetchList({ forceList: needList })
    },

    // 重置搜索
    handleReset() {
      this.pagination.page = 1
      this.searchParams = { ...DEFAULT_SEARCH_PARAMS }
      this.useListMode = false
      this.fetchList()
    },

    // 分页处理
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.useListMode = true
      this.fetchList({ forceList: true })
    },

    /**
     * 将列表数据转换为树形结构
     */
    buildTreeFromList(listData) {
      if (!listData || listData.length === 0) {
        return []
      }

      // 创建ID映射
      const nodeMap = new Map()
      const rootNodes = []

      // 第一遍遍历：创建节点映射
      listData.forEach(item => {
        nodeMap.set(item.id, {
          ...item,
          children: []
        })
      })

      // 第二遍遍历：构建父子关系
      listData.forEach(item => {
        const node = nodeMap.get(item.id)
        if (item.parentId && nodeMap.has(item.parentId)) {
          // 有父节点，添加到父节点的children中
          const parentNode = nodeMap.get(item.parentId)
          parentNode.children.push(node)
        } else {
          // 没有父节点或父节点不存在，作为根节点
          rootNodes.push(node)
        }
      })

      // 排序处理
      const sortNodes = (nodes) => {
        nodes.sort((a, b) => {
          // 先按level排序，再按sortOrder排序
          if (a.level !== b.level) {
            return (a.level || 0) - (b.level || 0)
          }
          return (a.sortOrder || 0) - (b.sortOrder || 0)
        })

        // 递归排序子节点
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            sortNodes(node.children)
          }
        })
      }

      sortNodes(rootNodes)
      return rootNodes
    },

    async attachManagersToTree(treeData) {
      if (!Array.isArray(treeData) || treeData.length === 0) {
        return
      }

      try {
        const managerMap = await this.fetchDepartmentManagerMap()
        this.departmentManagerMap = managerMap
        this.applyManagerInfoToTree(treeData, managerMap)
      } catch (error) {
        console.error('附加部门经理信息失败:', error)
      }
    },

    async fetchDepartmentManagerMap() {
      const managerMap = new Map()
      const limit = 100
      let page = 1
      let totalPages = 1

      try {
        do {
          const params = {
            page,
            limit,
            sortBy: 'level:asc,sortOrder:asc',
            populate: 'manager'
          }

          const response = await getDepartmentList(params)
          const meta = response.data || {}
          const list = Array.isArray(meta.results) ? meta.results : []

          list.forEach(department => {
            managerMap.set(department.id, department.manager || null)
          })

          totalPages = meta.totalPages || Math.ceil((meta.totalResults || 0) / limit) || 1
          page += 1
        } while (page <= totalPages)
      } catch (error) {
        console.error('获取部门列表以补充经理信息失败:', error)
        throw error
      }

      return managerMap
    },

    applyManagerInfoToTree(nodes, managerMap) {
      if (!Array.isArray(nodes)) {
        return
      }

      nodes.forEach(node => {
        const manager = managerMap.get(node.id) || null
        this.$set(node, 'manager', manager)

        if (Array.isArray(node.children) && node.children.length > 0) {
          this.applyManagerInfoToTree(node.children, managerMap)
        }
      })
    },

    /**
     * 构建父部门选项
     */
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
          await this.refreshCurrentMode()
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
          await this.refreshCurrentMode()
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
    async handleBatchDelete(ids) {
      if (!ids || ids.length === 0) {
        this.$message.warning('请选择要删除的部门')
        return
      }

      try {
        await this.$confirm(
          `确定要批量删除选中的 ${ids.length} 个部门吗？\n此操作不可恢复！`,
          '批量删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'error'
          }
        )

        const response = await batchDeleteDepartments(ids)

        if (response.success) {
          this.$message.success(`成功删除 ${response.data?.count || ids.length} 个部门`)
          await this.refreshCurrentMode()
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
    async handleBatchEnable(ids) {
      if (!ids || ids.length === 0) {
        this.$message.warning('请选择要启用的部门')
        return
      }

      try {
        const response = await batchUpdateDepartmentStatus(ids, 'active')

        if (response.success) {
          this.$message.success(`成功启用 ${response.data?.count || ids.length} 个部门`)
          await this.refreshCurrentMode()
        } else {
          this.$message.error(response.error?.message || '批量启用失败')
        }
      } catch (error) {
        console.error('批量启用部门失败:', error)
        this.$message.error('批量启用失败，请稍后重试')
      }
    },

    // 批量禁用
    async handleBatchDisable(ids) {
      if (!ids || ids.length === 0) {
        this.$message.warning('请选择要禁用的部门')
        return
      }

      try {
        const response = await batchUpdateDepartmentStatus(ids, 'inactive')

        if (response.success) {
          this.$message.success(`成功禁用 ${response.data?.count || ids.length} 个部门`)
          await this.refreshCurrentMode()
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
      this.refreshCurrentMode()
    },

    handleRefresh() {
      this.refreshCurrentMode()
    },

    handleRetry() {
      this.refreshCurrentMode()
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
