/**
* 文件名称：index.vue
* 文件描述：角色管理主页面，提供角色定义的查询、新增、编辑、删除等功能
* 创建日期：2024-01-20
* 修改记录：
* - 2024-01-20: 初始创建，实现基础架构
*/
<template>
  <div class="app-container">
    <!-- 角色管理主页面容器 -->
    <div class="role-management">
      <!-- 搜索表单区域 -->
      <search-form ref="searchForm" :loading="listLoading" @search="handleSearch" @reset="handleReset" />

      <!-- 角色列表表格区域 -->
      <role-table ref="roleTable" :role-list="roleList" :loading="listLoading" :pagination="pagination"
        @selection-change="handleSelectionChange" @pagination-change="handlePaginationChange" @view="handleView"
        @edit="handleEdit" @delete="handleDelete" @copy="handleCopy" @status-change="handleStatusChange"
        @sort-change="handleSortChange" @refresh="handleRefresh" @batch-delete="handleBatchDelete"
        @batch-enable="handleBatchEnable" @batch-disable="handleBatchDisable" />

      <!-- 角色表单抽屉 -->
      <role-form-drawer ref="roleFormDrawer" :visible.sync="drawerVisible" :mode="drawerMode" :role-data="currentRole"
        @success="handleFormSuccess" @close="handleDrawerClose" />
    </div>
  </div>
</template>

<script>
import SearchForm from './components/SearchForm.vue'
import RoleTable from './components/RoleTable.vue'
import RoleFormDrawer from './components/RoleFormDrawer.vue'
import { debounce } from '@/utils'
import {
  getRoleList,
  deleteRole,
  updateRoleStatus,
  batchDeleteRoles,
  batchUpdateRoleStatus
} from './api'

export default {
  name: 'RoleManagement',
  components: {
    SearchForm,
    RoleTable,
    RoleFormDrawer
  },
  data() {
    return {
      // 角色列表数据
      roleList: [],
      // 列表加载状态
      listLoading: false,
      // 分页信息
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },
      // 搜索参数
      searchParams: {},
      // 排序参数
      sortParams: {},
      // 抽屉可见状态
      drawerVisible: false,
      // 抽屉模式：create-新增, edit-编辑, view-查看, copy-复制
      drawerMode: 'create',
      // 当前操作的角色数据
      currentRole: null,
      // 选中的角色列表
      selectedRoles: []
    }
  },
  created() {
    // 创建防抖搜索函数
    this.debouncedSearch = debounce(this.fetchRoleList, 300)
    // 初始化加载角色列表
    this.fetchRoleList()
  },
  methods: {
    /**
     * 获取角色列表数据
     */
    async fetchRoleList() {
      try {
        this.listLoading = true

        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          includeUserCount: true,
          ...this.searchParams,
          ...this.sortParams
        }

        const response = await getRoleList(params)
        this.roleList = response.data.results || []
        this.pagination.total = response.data.totalResults || 0

        this.$refs.roleTable?.refreshSucceed()
      } catch (error) {
        console.error('获取角色列表失败:', error)
        this.$refs.roleTable?.refreshFail('获取数据失败，请稍后重试')
      } finally {
        this.listLoading = false
      }
    },

    /**
     * 处理搜索
     */
    handleSearch(searchParams) {
      this.searchParams = { ...searchParams }
      this.pagination.page = 1
      this.debouncedSearch()
    },

    /**
     * 处理重置搜索
     */
    handleReset() {
      this.searchParams = {}
      this.pagination.page = 1
      this.fetchRoleList()
    },

    /**
     * 处理表格选择变化
     */
    handleSelectionChange(selection) {
      this.selectedRoles = selection
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange(pagination) {
      this.pagination = { ...this.pagination, ...pagination }
      this.fetchRoleList()
    },

    /**
     * 处理排序变化
     */
    handleSortChange(sortParams) {
      this.sortParams = { ...sortParams }
      this.fetchRoleList()
    },

    /**
     * 处理刷新
     */
    handleRefresh() {
      this.fetchRoleList()
    },

    /**
     * 处理新增角色
     */
    handleCreate() {
      this.drawerMode = 'create'
      this.currentRole = null
      this.drawerVisible = true
    },

    /**
     * 处理查看角色
     */
    handleView(role) {
      this.drawerMode = 'view'
      this.currentRole = role
      this.drawerVisible = true
    },

    /**
     * 处理编辑角色
     */
    handleEdit(role) {
      this.drawerMode = 'edit'
      this.currentRole = role
      this.drawerVisible = true
    },

    /**
     * 处理复制角色
     */
    handleCopy(role) {
      this.drawerMode = 'copy'
      this.currentRole = role
      this.drawerVisible = true
    },

    /**
     * 处理删除角色
     */
    async handleDelete(role) {
      try {
        await this.$confirm(
          `确定要删除角色"${role.name}"吗？删除后将无法恢复，且该角色下的用户将失去相应权限。`,
          '删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await deleteRole(role.id)
        this.$message.success('删除成功')
        this.fetchRoleList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除角色失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      }
    },

    /**
     * 处理角色状态切换
     */
    async handleStatusChange(role, newStatus) {
      try {
        await updateRoleStatus(role.id, { status: newStatus })
        this.$message.success(`角色已${newStatus === 'active' ? '启用' : '禁用'}`)
        this.fetchRoleList()
      } catch (error) {
        console.error('状态切换失败:', error)
        this.$message.error('状态切换失败，请稍后重试')
      }
    },

    /**
     * 处理批量删除
     */
    async handleBatchDelete(roles) {
      try {
        await this.$confirm(
          `确定要删除选中的 ${roles.length} 个角色吗？删除后将无法恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await batchDeleteRoles(roles.map(role => role.id))
        this.$message.success('批量删除成功')
        this.fetchRoleList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败，请稍后重试')
        }
      }
    },

    /**
     * 处理批量启用
     */
    async handleBatchEnable(roles) {
      try {
        await batchUpdateRoleStatus(roles.map(role => role.id), { status: 'active' })
        this.$message.success('批量启用成功')
        this.fetchRoleList()
      } catch (error) {
        console.error('批量启用失败:', error)
        this.$message.error('批量启用失败，请稍后重试')
      }
    },

    /**
     * 处理批量禁用
     */
    async handleBatchDisable(roles) {
      try {
        await batchUpdateRoleStatus(roles.map(role => role.id), { status: 'inactive' })
        this.$message.success('批量禁用成功')
        this.fetchRoleList()
      } catch (error) {
        console.error('批量禁用失败:', error)
        this.$message.error('批量禁用失败，请稍后重试')
      }
    },

    /**
     * 处理表单提交成功
     */
    handleFormSuccess() {
      this.drawerVisible = false
      this.fetchRoleList()
    },

    /**
     * 处理抽屉关闭
     */
    handleDrawerClose() {
      this.drawerVisible = false
      this.currentRole = null
    }
  }
}
</script>

<style lang="scss" scoped>
.role-management {
  .app-container {
    padding: 20px;
  }
}
</style>
