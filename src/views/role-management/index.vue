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
      <role-table
        ref="roleTable"
        :role-list="roleList"
        :loading="listLoading"
        :pagination="pagination"
        :search-params="searchParams"
        @selection-change="handleSelectionChange"
        @pagination-change="handlePaginationChange"
        @create="handleCreate"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
        @copy="handleCopy"
        @status-change="handleStatusChange"
        @sort-change="handleSortChange"
        @refresh="handleRefresh"
        @batch-delete="handleBatchDelete"
        @batch-enable="handleBatchEnable"
        @batch-disable="handleBatchDisable"
        @clear-search="handleClearSearch"
      />

      <!-- 角色表单抽屉 -->
      <role-form-drawer
        ref="roleFormDrawer"
        :visible.sync="drawerVisible"
        :mode="drawerMode"
        :role-data="currentRole"
        @success="handleFormSuccess"
        @close="handleDrawerClose"
      />
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
  batchUpdateRoleStatus,
  getRoleById
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
      // 抽屉模式：create-新增, update-编辑, view-查看, copy-复制
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
     * 处理搜索 - 支持完整的搜索和筛选功能
     */
    handleSearch(searchParams) {
      this.searchParams = { ...searchParams }
      this.pagination.page = 1 // 搜索时重置到第一页
      this.debouncedSearch()
    },

    /**
     * 处理重置搜索 - 清除所有搜索条件
     */
    handleReset() {
      this.searchParams = {}
      this.pagination.page = 1
      // 重置后立即刷新数据
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
      this.drawerMode = 'update'
      this.currentRole = role
      this.drawerVisible = true
    },

    /**
     * 处理复制角色
     */
    async handleCopy(role) {
      if (!role) {
        return
      }

      const confirmationMessage = `确定要复制角色"${role.name}"吗？\n复制后将创建一个新的角色，并可选择是否同步原角色的权限配置。`

      try {
        await this.$confirm(confirmationMessage, '复制角色确认', {
          confirmButtonText: '开始复制',
          cancelButtonText: '取消',
          type: 'info',
          distinguishCancelAndClose: true
        })
      } catch (confirmError) {
        // 用户取消或关闭对话框
        if (confirmError !== 'cancel') {
          this.$message.info('已取消复制操作')
        }
        return
      }

      try {
        this.listLoading = true
        const response = await getRoleById(role.id)
        const latestRoleData = response.data

        this.drawerMode = 'copy'
        this.currentRole = {
          ...latestRoleData,
          userCount: role.userCount
        }
        this.drawerVisible = true
      } catch (error) {
        console.error('获取角色详情失败:', error)
        const errorMessage = error?.message || '获取角色详细信息失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        this.listLoading = false
      }
    },

    /**
     * 处理删除角色
     */
    async handleDelete(role) {
      if (!role) {
        return
      }

      if (role.type === 'system' || role.isSystem) {
        this.$message.warning('系统角色不允许删除，请禁用该角色')
        return
      }

      if (role.isDefault) {
        this.$message.warning('默认角色不允许删除，如需删除请先取消默认设置')
        return
      }

      if (Number(role.userCount) > 0) {
        this.$message.warning('该角色正在被用户使用，无法删除，请先解除关联用户')
        return
      }

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

        const response = await deleteRole(role.id)
        this.$message.success(response.message || '删除角色成功')
        this.fetchRoleList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除角色失败:', error)

          if (error instanceof Error && error.code) {
            switch (error.code) {
              case 'ROLE_SYSTEM_CANNOT_DELETE':
                this.$message.error('系统角色不能删除，请联系管理员处理')
                break
              case 'ROLE_DELETE_HAS_USERS':
                this.$message.error('角色正在被用户使用，无法删除，请先解除关联用户')
                break
              case 'ROLE_DEFAULT_CANNOT_DELETE':
                this.$message.error('默认角色不能删除，如需删除请先取消默认设置')
                break
              default:
                this.$message.error(error.message || '删除失败，请稍后重试')
                break
            }
          } else {
            this.$message.error('删除失败，请稍后重试')
          }
        }
      }
    },

    /**
     * 处理角色状态切换
     */
    async handleStatusChange(role, newStatus) {
      if (!role) {
        return
      }

      if (role.type === 'system' || role.isSystem) {
        this.$message.warning('系统角色不允许禁用，请保留启用状态')
        return
      }

      try {
        const response = await updateRoleStatus(role.id, { status: newStatus })
        this.$message.success(response.message || `角色已${newStatus === 'active' ? '启用' : '禁用'}`)
        this.fetchRoleList()
      } catch (error) {
        console.error('状态切换失败:', error)

        if (error instanceof Error && error.code) {
          switch (error.code) {
            case 'ROLE_SYSTEM_CANNOT_DISABLE':
              this.$message.error('系统角色不能禁用，请保持启用状态')
              break
            case 'ROLE_STATUS_INVALID':
              this.$message.error('角色状态无效，请刷新页面后重试')
              break
            default:
              this.$message.error(error.message || '状态切换失败，请稍后重试')
              break
          }
        } else {
          this.$message.error('状态切换失败，请稍后重试')
        }
      }
    },

    /**
     * 处理批量删除
     */
    async handleBatchDelete(roles) {
      const deletableRoles = (roles || []).filter(role => {
        const isSystem = role.type === 'system' || role.isSystem
        const isDefault = !!role.isDefault
        const hasUsers = Number(role.userCount) > 0

        return !isSystem && !isDefault && !hasUsers
      })

      if (!roles || roles.length === 0) {
        this.$message.warning('请先选择需要删除的角色')
        return
      }

      if (deletableRoles.length === 0) {
        this.$message.warning('选中的角色均无法删除，请检查是否为系统角色、默认角色或正在被使用')
        return
      }

      if (deletableRoles.length < roles.length) {
        this.$message.warning('部分选中角色无法删除（系统角色、默认角色或正在被使用），将仅删除符合条件的角色')
      }

      try {
        await this.$confirm(
          `确定要删除选中的 ${deletableRoles.length} 个角色吗？删除后将无法恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await batchDeleteRoles(deletableRoles.map(role => role.id))
        this.$message.success(response.message || '批量删除成功')
        this.fetchRoleList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批量删除失败:', error)

          if (error instanceof Error && error.code === 'ROLE_DELETE_HAS_USERS') {
            this.$message.error('存在正在被用户使用的角色，删除失败，请先解除关联用户')
          } else {
            this.$message.error(error.message || '批量删除失败，请稍后重试')
          }
        }
      }
    },

    /**
     * 处理批量启用
     */
    async handleBatchEnable(roles) {
      try {
        const response = await batchUpdateRoleStatus(roles.map(role => role.id), { status: 'active' })
        this.$message.success(response.message || '批量启用成功')
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
      const targetRoles = (roles || []).filter(role => !(role.type === 'system' || role.isSystem))

      if (!roles || roles.length === 0) {
        this.$message.warning('请先选择需要禁用的角色')
        return
      }

      if (targetRoles.length === 0) {
        this.$message.warning('选中的角色均为系统角色，无法禁用')
        return
      }

      if (targetRoles.length < roles.length) {
        this.$message.warning('系统角色无法禁用，将仅禁用符合条件的角色')
      }

      try {
        const response = await batchUpdateRoleStatus(targetRoles.map(role => role.id), { status: 'inactive' })
        this.$message.success(response.message || '批量禁用成功')
        this.fetchRoleList()
      } catch (error) {
        console.error('批量禁用失败:', error)

        if (error instanceof Error && error.code === 'ROLE_SYSTEM_CANNOT_DISABLE') {
          this.$message.error('包含系统角色，无法禁用，请取消选中系统角色后重试')
        } else {
          this.$message.error(error.message || '批量禁用失败，请稍后重试')
        }
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
    },

    /**
     * 处理清除搜索条件
     */
    handleClearSearch() {
      // 通知搜索表单重置
      this.$refs.searchForm?.handleReset()
      // 清除搜索参数并刷新
      this.handleReset()
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
