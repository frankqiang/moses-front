/**
* 文件名称：index.vue
* 文件描述：用户管理主页面，提供用户信息的查询、新增、编辑、删除等功能
* 创建日期：2024-01-15
* 修改记录：
* - 2024-01-15: 初始创建，实现基础架构
*/
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <user-search :loading="listLoading" @search="handleSearch" @reset="handleReset" />

    <!-- 用户列表表格 -->
    <user-table ref="userTable" :user-list="userList" :loading="listLoading" :pagination="pagination"
      :export-api="exportUserList" :export-params="exportParams"
      :export-filename="'用户列表_' + new Date().toISOString().slice(0, 10)" @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange" @view="handleView" @edit="handleEdit" @delete="handleDelete"
      @enable="handleEnable" @disable="handleDisable" @lock="handleLock" @reset-password="handleResetPassword"
      @sort-change="handleSortChange" @refresh="handleRefresh" @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable" @batch-disable="handleBatchDisable" @batch-lock="handleBatchLock">
      <template #toolbar-left>
        <el-button type="primary" icon="el-icon-plus" size="small" @click="handleCreate">
          新增用户
        </el-button>
      </template>
    </user-table>

    <!-- 用户表单抽屉 -->
    <user-form-drawer ref="userFormDrawer" :visible.sync="drawerVisible" :mode="drawerMode" :user-data="currentUser"
      @success="handleFormSuccess" @close="handleDrawerClose" />

    <!-- 管理员重置密码对话框 -->
    <reset-password-dialog :visible.sync="resetPasswordDialogVisible" :user-data="currentResetUser"
      @success="handleResetPasswordSuccess" @close="handleResetPasswordClose" />

  </div>
</template>

<script>
// 导入通用组件
import DialogForm from '@/components/DialogForm'

// 导入用户管理组件
import UserTable from './components/UserTable.vue'
import UserFormDrawer from './components/UserFormDrawer.vue'
import UserSearch from './components/UserSearch.vue'
import ResetPasswordDialog from './components/ResetPasswordDialog.vue'

// 导入API函数
import {
  getUserList,
  getUserDetail,
  createUser, // eslint-disable-line no-unused-vars
  updateUser, // eslint-disable-line no-unused-vars
  deleteUser, // eslint-disable-line no-unused-vars
  batchDeleteUsers, // eslint-disable-line no-unused-vars
  updateUserStatus,
  batchUpdateUserStatus,
  resetUserPassword, // eslint-disable-line no-unused-vars
  exportUserList
} from './api'

// 导入常量配置
import {
  USER_STATUS,
  USER_STATUS_OPTIONS, // eslint-disable-line no-unused-vars
  GENDER_OPTIONS, // eslint-disable-line no-unused-vars
  DEPARTMENT_OPTIONS // eslint-disable-line no-unused-vars
} from './constants'

// 导入工具函数
import { scrollTo } from '@/utils/scroll-to' // eslint-disable-line no-unused-vars
import { parseTime } from '@/utils' // eslint-disable-line no-unused-vars

export default {
  name: 'UserManagement',
  components: {
    UserTable,
    UserFormDrawer,
    UserSearch,
    DialogForm,
    ResetPasswordDialog
  },
  data() {
    return {
      // 列表数据
      userList: [],
      listLoading: false,
      selectedUsers: [],

      // 分页配置
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },

      // 搜索条件
      searchQuery: {
        username: '',
        name: '',
        email: '',
        search: '',
        department: '',
        status: [], // 改为数组支持多选
        role: '',
        gender: '',
        createdTimeRange: [],
        lastLoginTimeRange: []
      },

      // 排序条件
      sortBy: 'created_at:desc',

      // 抽屉表单
      drawerVisible: false,
      drawerMode: 'create', // create, update, view
      currentUser: {},

      // 密码重置对话框
      resetPasswordDialogVisible: false,
      currentResetUser: {}
    }
  },
  computed: {

    /**
     * 抽屉标题 (已废弃，由UserFormDrawer内部管理)
     */
    drawerTitle() {
      const titleMap = {
        create: '新增用户',
        update: '编辑用户',
        view: '查看用户'
      }
      return titleMap[this.drawerMode] || '用户信息'
    },


    /**
     * 导出参数 - 移除分页参数，保留筛选条件
     */
    exportParams() {
      const params = {}

      // 添加搜索条件
      if (this.searchQuery.username) params.username = this.searchQuery.username
      if (this.searchQuery.name) params.name = this.searchQuery.name
      if (this.searchQuery.email) params.email = this.searchQuery.email
      if (this.searchQuery.search) params.search = this.searchQuery.search
      if (this.searchQuery.status && this.searchQuery.status.length > 0) {
        if (Array.isArray(this.searchQuery.status)) {
          params.status = this.searchQuery.status.join(',')
        } else {
          params.status = this.searchQuery.status
        }
      }
      if (this.searchQuery.department) params.department = this.searchQuery.department
      if (this.searchQuery.role) params.role = this.searchQuery.role
      if (this.searchQuery.gender) params.gender = this.searchQuery.gender

      // 添加时间范围
      if (this.searchQuery.createdTimeRange && this.searchQuery.createdTimeRange.length === 2) {
        params.createdFrom = new Date(this.searchQuery.createdTimeRange[0]).toISOString()
        params.createdTo = new Date(this.searchQuery.createdTimeRange[1]).toISOString()
      }
      if (this.searchQuery.lastLoginTimeRange && this.searchQuery.lastLoginTimeRange.length === 2) {
        params.lastLoginFrom = new Date(this.searchQuery.lastLoginTimeRange[0]).toISOString()
        params.lastLoginTo = new Date(this.searchQuery.lastLoginTimeRange[1]).toISOString()
      }

      // 添加排序参数
      if (this.sortBy) params.sortBy = this.sortBy

      return params
    }
  },
  mounted() {
    this.fetchUserList()

    // 处理从详情页面返回时的编辑操作
    if (this.$route.query.action === 'edit' && this.$route.query.userId) {
      this.handleEditFromDetail(this.$route.query.userId)
    }
  },
  methods: {
    /**
     * 获取用户列表
     * 根据接口文档规范实现数据获取和处理
     */
    async fetchUserList() {
      this.listLoading = true
      try {
        // 构建查询参数，严格按照接口文档规范
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        }

        // 添加搜索条件 - 严格按照接口文档参数名
        if (this.searchQuery.username) {
          params.username = this.searchQuery.username
        }
        if (this.searchQuery.name) {
          params.name = this.searchQuery.name
        }
        if (this.searchQuery.email) {
          params.email = this.searchQuery.email
        }
        if (this.searchQuery.search) {
          params.search = this.searchQuery.search
        }
        if (this.searchQuery.status && this.searchQuery.status.length > 0) {
          // 多选状态处理 - 如果是数组，取第一个值或转换为逗号分隔的字符串
          if (Array.isArray(this.searchQuery.status)) {
            params.status = this.searchQuery.status.join(',')
          } else {
            params.status = this.searchQuery.status
          }
        }
        if (this.searchQuery.department) {
          params.department = this.searchQuery.department
        }
        if (this.searchQuery.role) {
          params.role = this.searchQuery.role
        }
        if (this.searchQuery.gender) {
          params.gender = this.searchQuery.gender
        }

        // 处理时间范围 - 转换为ISO 8601格式
        if (this.searchQuery.createdTimeRange && this.searchQuery.createdTimeRange.length === 2) {
          params.createdFrom = new Date(this.searchQuery.createdTimeRange[0]).toISOString()
          params.createdTo = new Date(this.searchQuery.createdTimeRange[1]).toISOString()
        }

        // 处理最后登录时间范围
        if (this.searchQuery.lastLoginTimeRange && this.searchQuery.lastLoginTimeRange.length === 2) {
          params.lastLoginFrom = new Date(this.searchQuery.lastLoginTimeRange[0]).toISOString()
          params.lastLoginTo = new Date(this.searchQuery.lastLoginTimeRange[1]).toISOString()
        }

        // 添加排序参数 - 默认按创建时间倒序
        params.sortBy = this.sortBy || 'created_at:desc'

        // 调用API
        const response = await getUserList(params)

        // 根据接口文档处理响应数据
        if (response.success && response.data) {
          this.userList = response.data.results || []
          this.pagination.total = response.data.totalResults || 0
          this.pagination.page = response.data.page || 1
          this.pagination.limit = response.data.limit || 20
        } else {
          this.userList = []
          this.pagination.total = 0
          this.$message.error(response.message || '获取用户列表失败')
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.userList = []
        this.pagination.total = 0

        // 处理不同类型的错误
        let errorMessage = '获取用户列表失败'
        if (error.response) {
          const { status, data } = error.response
          if (status === 401) {
            errorMessage = '请先登录'
            // this.$router.push('/login')
          } else if (status === 403) {
            errorMessage = '权限不足'
          } else if (data && data.error && data.error.message) {
            errorMessage = data.error.message
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      } finally {
        this.listLoading = false
      }
    },

    /**
     * 搜索处理
     */
    handleSearch(query) {
      this.searchQuery = { ...query }
      this.pagination.page = 1
      this.fetchUserList()
    },

    /**
     * 重置搜索
     */
    handleReset() {
      this.searchQuery = {
        username: '',
        name: '',
        email: '',
        search: '',
        department: '',
        status: [],
        role: '',
        gender: '',
        createdTimeRange: [],
        lastLoginTimeRange: []
      }
      this.pagination.page = 1
      this.fetchUserList()
    },

    /**
     * 分页变化处理
     */
    handlePaginationChange(pagination) {
      this.pagination = { ...pagination }
      this.fetchUserList()
    },

    /**
     * 排序变化处理
     */
    handleSortChange(sortBy) {
      this.sortBy = sortBy
      this.pagination.page = 1 // 重置到第一页
      this.fetchUserList()
    },

    /**
     * 选择变化处理
     */
    handleSelectionChange(selection) {
      this.selectedUsers = selection
    },

    /**
     * 新增用户
     */
    handleCreate() {
      this.drawerMode = 'create'
      this.currentUser = {}
      this.drawerVisible = true
    },

    /**
     * 查看用户
     */
    handleView(row) {
      this.drawerMode = 'view'
      this.currentUser = { ...row }
      this.drawerVisible = true
    },

    /**
     * 编辑用户
     */
    async handleEdit(row) {
      try {
        this.drawerMode = 'update'

        // 调用详情接口获取完整的用户数据
        const response = await getUserDetail(row.id)
        if (response.success) {
          this.currentUser = response.data
          this.drawerVisible = true
        } else {
          this.$message.error(response.message || '获取用户详情失败')
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        this.$message.error('获取用户详情失败，请稍后重试')
      }
    },

    /**
     * 处理从详情页面返回的编辑操作
     */
    async handleEditFromDetail(userId) {
      try {
        // 清除路由查询参数
        this.$router.replace({ path: this.$route.path })

        // 获取用户详情
        const response = await getUserDetail(userId)
        if (response.success) {
          this.handleEdit(response.data)
        } else {
          this.$message.error('获取用户信息失败')
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.$message.error('获取用户信息失败')
      }
    },

    /**
     * 删除用户
     */
    handleDelete(row) {
      this.$confirm(`确定要删除用户 "${row.realName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // TODO: 调用删除API
          // await deleteUser(row.id)
          this.$message.success('删除成功')
          this.fetchUserList()
        } catch (error) {
          console.error('删除用户失败:', error)
          this.$message.error('删除失败')
        }
      })
    },

    /**
     * 启用用户
     */
    handleEnable(row) {
      this.confirmStatusChange(row, USER_STATUS.ACTIVE, '启用', '启用后该用户将可以正常登录和使用系统')
    },

    /**
     * 禁用用户
     */
    handleDisable(row) {
      this.confirmStatusChange(row, USER_STATUS.INACTIVE, '禁用', '禁用后该用户将无法登录系统')
    },

    /**
     * 锁定用户
     */
    handleLock(row) {
      this.confirmStatusChange(row, USER_STATUS.LOCKED, '锁定', '锁定后该用户将无法登录系统，需要管理员解锁')
    },

    /**
     * 确认状态变更 - 提供友好的确认对话框
     */
    confirmStatusChange(row, targetStatus, actionName, description) {
      const statusText = {
        [USER_STATUS.ACTIVE]: '激活',
        [USER_STATUS.INACTIVE]: '禁用',
        [USER_STATUS.LOCKED]: '锁定'
      }

      this.$confirm(
        `确定要${actionName}用户 "${row.name || row.username}" 吗？\n\n${description}`,
        `${actionName}用户`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true,
          showCancelButton: true
        }
      ).then(() => {
        this.updateUserStatus(row, targetStatus, actionName)
      }).catch((action) => {
        if (action === 'cancel') {
          this.$message.info(`已取消${actionName}操作`)
        }
      })
    },

    /**
     * 更新用户状态 - 实现状态变更的核心逻辑
     */
    async updateUserStatus(row, status, actionName = '更新状态') {
      const loadingInstance = this.$loading({
        target: document.body,
        text: `正在${actionName}中...`
      })

      try {
        // 调用API更新用户状态
        const response = await updateUserStatus(row.id, status)

        if (response && response.success) {
          this.$message.success(`${actionName}成功`)

          // 更新本地数据，避免重新请求整个列表
          const userIndex = this.userList.findIndex(user => user.id === row.id)
          if (userIndex !== -1) {
            this.$set(this.userList, userIndex, {
              ...this.userList[userIndex],
              status: status,
              updatedAt: new Date().toISOString()
            })
          }
        } else {
          // 根据错误处理规范直接使用后端返回的错误消息
          const errorMessage = response?.error?.message || `${actionName}失败`
          this.$message.error(errorMessage)
        }
      } catch (error) {
        console.error(`${actionName}失败:`, error)

        // 处理不同类型的错误
        let errorMessage = `${actionName}失败`
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error.message
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      } finally {
        loadingInstance.close()
      }
    },

    /**
     * 重置密码
     */
    handleResetPassword(row) {
      this.currentResetUser = { ...row }
      this.resetPasswordDialogVisible = true
    },

    /**
     * 批量删除
     */
    handleBatchDelete() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要删除的用户')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedUsers.length} 个用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // eslint-disable-next-line no-unused-vars
          const userIds = this.selectedUsers.map(user => user.id)
          // TODO: 调用批量删除API
          // await batchDeleteUsers(userIds)
          this.$message.success('批量删除成功')
          this.fetchUserList()
        } catch (error) {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      })
    },

    /**
     * 批量启用
     */
    handleBatchEnable() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要启用的用户')
        return
      }

      this.confirmBatchStatusChange(this.selectedUsers, USER_STATUS.ACTIVE, '批量启用', '启用后这些用户将可以正常登录和使用系统')
    },

    /**
     * 批量禁用
     */
    handleBatchDisable() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要禁用的用户')
        return
      }

      this.confirmBatchStatusChange(this.selectedUsers, USER_STATUS.INACTIVE, '批量禁用', '禁用后这些用户将无法登录系统')
    },

    /**
     * 批量锁定
     */
    handleBatchLock() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要锁定的用户')
        return
      }

      this.confirmBatchStatusChange(this.selectedUsers, USER_STATUS.LOCKED, '批量锁定', '锁定后这些用户将无法登录系统，需要管理员解锁')
    },

    /**
     * 确认批量状态变更 - 保持简洁的文本样式
     */
    confirmBatchStatusChange(users, targetStatus, actionName, description) {
      const userNames = users.slice(0, 3).map(user => user.name || user.username).join('、')
      const displayText = users.length > 3 ? `${userNames} 等 ${users.length} 个用户` : userNames

      this.$confirm(
        `确定要${actionName} ${displayText} 吗？\n\n${description}`,
        actionName,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true,
          showCancelButton: true
        }
      ).then(() => {
        this.batchUpdateUserStatus(users, targetStatus, actionName)
      }).catch((action) => {
        if (action === 'cancel') {
          this.$message.info(`已取消${actionName}操作`)
        }
      })
    },


    /**
     * 批量更新用户状态
     */
    async batchUpdateUserStatus(users, status, actionName = '批量更新状态') {
      const loadingInstance = this.$loading({
        target: document.body,
        text: `正在${actionName}中...`
      })

      try {
        const userIds = users.map(user => user.id)

        // 调用批量状态更新API
        const response = await batchUpdateUserStatus(userIds, status)

        if (response && response.success) {
          this.$message.success(`${actionName}成功，共更新 ${response.data.affectedCount} 个用户`)

          // 批量更新本地数据
          users.forEach(user => {
            const userIndex = this.userList.findIndex(u => u.id === user.id)
            if (userIndex !== -1) {
              this.$set(this.userList, userIndex, {
                ...this.userList[userIndex],
                status: status,
                updatedAt: new Date().toISOString()
              })
            }
          })

          // 清空选择
          this.selectedUsers = []
          if (this.$refs.userTable && this.$refs.userTable.$refs.userTable) {
            this.$refs.userTable.$refs.userTable.clearSelection()
          }
        } else {
          // 根据错误处理规范直接使用后端返回的错误消息
          const errorMessage = response?.error?.message || `${actionName}失败`
          this.$message.error(errorMessage)
        }
      } catch (error) {
        console.error(`${actionName}失败:`, error)

        // 处理不同类型的错误
        let errorMessage = `${actionName}失败`
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error.message
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      } finally {
        loadingInstance.close()
      }
    },

    /**
     * 刷新列表
     */
    async handleRefresh() {
      try {
        await this.fetchUserList()
        // 刷新成功时调用子组件的反馈方法
        this.$refs.userTable.refreshSucceed('用户列表刷新成功')
      } catch (error) {
        // 刷新失败时调用子组件的反馈方法
        this.$refs.userTable.refreshFail('用户列表刷新失败，请重试')
        console.error('刷新用户列表失败:', error)
      }
    },

    /**
     * 导出数据
     */
    handleExport() {
      // TODO: 实现导出功能
      this.$message.info('导出功能开发中')
    },

    /**
     * 导入数据
     */
    handleImport() {
      // TODO: 实现导入功能
      this.$message.info('导入功能开发中')
    },

    /**
     * 表单提交成功处理
     */
    handleFormSuccess({ mode, data, continueEdit }) {
      console.log('用户操作成功:', { mode, data, continueEdit })

      // 刷新列表数据
      this.fetchUserList()

      // 如果不是继续编辑，则关闭抽屉
      if (!continueEdit) {
        this.drawerVisible = false
      }
    },

    /**
     * 抽屉关闭
     */
    handleDrawerClose() {
      this.drawerVisible = false
      this.currentUser = {}
    },

    /**
     * 重置密码成功处理
     */
    handleResetPasswordSuccess(data) {
      this.$message.success('密码重置成功')
      // 刷新用户列表以更新状态
      this.fetchUserList()
    },

    /**
     * 重置密码对话框关闭处理
     */
    handleResetPasswordClose() {
      this.currentResetUser = {}
    },


    /**
     * 导出用户列表 - 将导入的API函数暴露给模板
     */
    exportUserList
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
  }

  .page-description {
    margin: 0;
    font-size: 14px;
    color: #909399;
    line-height: 1.5;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    padding: 16px;
  }

  .page-header {
    .page-title {
      font-size: 20px;
    }
  }
}
</style>
