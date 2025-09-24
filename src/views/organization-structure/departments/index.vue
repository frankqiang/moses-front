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
  getDepartmentList,
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
    // TODO: 临时注释权限检查用于开发测试，生产环境请取消注释
    // if (!this.checkPagePermission()) {
    //   return
    // }

    // 🚧 开发环境认证设置 - 确保API调用能正常工作
    this.initDevelopmentAuth()

    // 创建防抖搜索函数
    this.debouncedSearch = debounce(this.fetchList, 300)

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
        return // 只在开发环境运行
      }

      console.log('🚧 开发环境认证初始化...')

      // 检查是否已有token
      if (this.$store.getters.token) {
        console.log('✅ 已存在token，跳过开发环境认证设置')
        return
      }

      // 设置临时的开发用token - 使用一个看起来像真实token的格式
      const devToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZfdXNlciIsImlhdCI6MTY0Mjc4MTIzNCwiZXhwIjoxNjQyNzg0ODM0fQ.dev_token_signature'
      console.log('🔑 设置开发环境临时token')

      // 设置token到store
      this.$store.commit('user/SET_TOKEN', devToken)

      // 设置基本用户信息
      this.$store.commit('user/SET_NAME', '开发测试用户')
      this.$store.commit('user/SET_ROLES', ['admin', 'organization_manager'])
      this.$store.commit('user/SET_PERMISSIONS', ['getDepartments', 'createDepartment', 'updateDepartment', 'deleteDepartment'])

      console.log('✅ 开发环境认证设置完成')
    },

    /**
     * 检查页面访问权限
     */
    checkPagePermission() {
      // 检查角色权限（路由级别）
      if (!this.hasRole(['admin', 'organization_manager'])) {
        this.$message.error('您没有部门管理角色权限，即将跳转到首页')
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
        return false
      }

      // 检查功能权限（页面级别）
      if (!this.hasPermission('getDepartments')) {
        this.$message.error('您没有部门查看权限，即将跳转到首页')
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

        // 添加调试信息
        console.log('开始获取部门列表数据...')
        console.log('搜索参数:', this.searchParams)
        console.log('分页参数:', this.pagination)

        // 构建查询参数
        const params = {
          // 分页参数
          page: this.pagination.page,
          limit: this.pagination.limit,
          // 搜索参数
          ...(this.searchParams.keyword && { name: this.searchParams.keyword }),
          ...(this.searchParams.status && { status: this.searchParams.status }),
          ...(this.searchParams.parentId && { parentId: this.searchParams.parentId }),
          // 关联查询参数
          populate: 'manager,parent',
          // 排序参数
          sortBy: 'level:asc,sortOrder:asc'
        }

        // 🌳 优先使用树形接口获取数据，这样更适合树形展示
        console.log('🌳 调用树形接口获取部门数据...')
        console.log('树形接口URL:', `${process.env.VUE_APP_BASE_API}/departments/tree`)

        // 使用专门的树形接口
        const response = await getDepartmentTree()

        console.log('📡 如果树形接口失败，将回退到列表接口')
        console.log('列表接口参数备用:', params)
        console.log('列表接口URL备用:', `${process.env.VUE_APP_BASE_API}/departments`)

        // 调试响应数据
        console.log('API响应原始数据:', response)

        // 处理响应数据 - 根据树形接口文档的响应格式
        if (response && response.success) {
          // 🌳 树形接口：数据直接在 response.data 中，已经是树形结构
          const treeData = response.data || []

          // 直接使用树形数据，无需转换
          this.treeData = treeData

          // 计算总数（遍历树形结构）
          this.total = this.calculateTotal(treeData)

          // 构建父部门选项（从树形数据构建）
          this.buildParentOptions()

          console.log('🌳 树形API数据处理完成:')
          console.log('- 树形根节点数量:', treeData.length)
          console.log('- 计算的总部门数:', this.total)
          console.log('- 树形数据结构:', this.treeData)

          // 打印树形结构概览
          if (treeData.length > 0) {
            console.log('📋 树形部门结构概览:')
            this.printTreeStructure(treeData, 0)
          }

          if (this.$refs.departmentTable) {
            this.$refs.departmentTable.refreshSucceed()
          }

          this.$message.success(`🌳 成功加载 ${this.total} 个部门（树形结构，${this.treeData.length} 个根节点）`)

          // 如果没有数据但API调用成功，给出提示
          if (this.total === 0) {
            console.warn('⚠️ 树形API调用成功但没有返回部门数据，请检查数据库中是否有部门记录')
            this.$message.warning('当前没有部门数据，请先添加部门')
          }
        } else {
          // 处理API响应错误
          const errorMessage = response?.error?.message || response?.message || '获取数据失败'
          console.error('API响应错误:', response)
          throw new Error(errorMessage)
        }
      } catch (error) {
        console.error('🌳 树形接口调用失败:', error)
        console.log('🔄 尝试回退到列表接口...')

        try {
          // 回退到列表接口
          const listResponse = await getDepartmentList(params)

          console.log('📋 列表接口响应数据:', listResponse)

          if (listResponse && listResponse.success) {
            // 使用列表接口的数据处理逻辑
            const listData = listResponse.data?.results || []
            const totalResults = listResponse.data?.totalResults || 0
            const totalPages = listResponse.data?.totalPages || 0

            // 将列表数据转换为树形结构用于展示
            this.treeData = this.buildTreeFromList(listData)
            this.total = totalResults

            // 构建父部门选项
            this.buildParentOptions(listData)

            console.log('📊 列表接口数据处理完成:')
            console.log('- 原始列表数据数量:', listData.length)
            console.log('- 构建的树形结构:', this.treeData.length, '个根节点')
            console.log('- 总记录数:', this.total)

            if (this.$refs.departmentTable) {
              this.$refs.departmentTable.refreshSucceed()
            }

            this.$message.success(`📋 通过列表接口成功加载 ${this.total} 个部门`)
            return // 成功回退，直接返回
          }
        } catch (fallbackError) {
          console.error('📋 列表接口回退也失败:', fallbackError)
        }

        // 所有接口都失败，显示错误
        console.error('❌ 所有API接口都失败了')
        console.error('错误详情:', error.response)

        this.treeData = []
        this.total = 0

        if (this.$refs.departmentTable) {
          this.$refs.departmentTable.refreshFail('获取数据失败，请稍后重试')
        }

        // 显示更详细的错误信息
        let errorMessage = '获取部门数据失败'
        if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message
        } else if (error.message) {
          errorMessage = error.message
        }

        // 如果是认证错误，给出具体的解决建议
        if (error.response?.status === 401) {
          errorMessage = '认证失败，请重新登录'
          console.error('🔐 认证失败，请检查：')
          console.error('1. 是否已设置开发环境token')
          console.error('2. 后端是否正常运行')
          console.error('3. API地址是否正确:', process.env.VUE_APP_BASE_API)
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          errorMessage = '网络连接失败，请检查后端服务是否启动'
          console.error('🌐 网络错误，请检查：')
          console.error('1. 后端服务是否在 localhost:3000 启动')
          console.error('2. 网络连接是否正常')
        }

        this.$message.error(errorMessage)
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
     * 打印树形结构概览 - 用于调试
     * @param {Array} nodes - 树形节点数组
     * @param {number} level - 当前层级
     */
    printTreeStructure(nodes, level = 0) {
      nodes.forEach((node, index) => {
        const indent = '  '.repeat(level)
        const prefix = level === 0 ? `${index + 1}.` : `${indent}├─`
        console.log(`${prefix} ${node.name} (${node.code}) - Level ${node.level} - Status: ${node.status}`)

        if (node.children && node.children.length > 0) {
          this.printTreeStructure(node.children, level + 1)
        }
      })
    },

    /**
     * 构建父部门选项
     */
    buildParentOptions(listData = null) {
      const options = []

      // 如果传入了列表数据，直接从列表构建选项
      if (listData && listData.length > 0) {
        listData.forEach(dept => {
          options.push({
            value: dept.id,
            label: `${'  '.repeat((dept.level || 1) - 1)}${dept.name}`,
            level: dept.level || 1,
            disabled: false
          })
        })

        // 按level排序
        options.sort((a, b) => a.level - b.level)
      } else {
        // 从树形数据构建选项
        const traverse = (nodes, level = 0) => {
          nodes.forEach(node => {
            options.push({
              value: node.id,
              label: '  '.repeat(level) + node.name,
              level: level,
              disabled: false
            })
            if (node.children && node.children.length > 0) {
              traverse(node.children, level + 1)
            }
          })
        }
        traverse(this.treeData)
      }

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
        const response = await batchUpdateDepartmentStatus(ids, 'active')

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
        const response = await batchUpdateDepartmentStatus(ids, 'inactive')

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
