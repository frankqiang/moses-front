/**
 * 文件名称：index.vue
 * 文件描述：用户管理主页面，提供用户信息的查询、新增、编辑、删除等功能
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建，实现基础架构
 */
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <user-search
      :loading="listLoading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格工具栏 -->
    <table-toolbar
      :selected-count="selectedUsers.length"
      :show-batch-actions="selectedUsers.length > 0"
      @add="handleCreate"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @refresh="handleRefresh"
      @export="handleExport"
      @import="handleImport"
    >
      <template #actions>
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="handleCreate"
        >
          新增用户
        </el-button>
      </template>
    </table-toolbar>

    <!-- 用户列表表格 -->
    <user-table
      ref="userTable"
      :user-list="userList"
      :loading="listLoading"
      :pagination="pagination"
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
      @enable="handleEnable"
      @disable="handleDisable"
      @reset-password="handleResetPassword"
    />

    <!-- 用户表单抽屉 -->
    <user-form
      ref="userFormDrawer"
      :visible.sync="drawerVisible"
      :title="drawerTitle"
      :form-data="currentUser"
      :loading="formLoading"
      :readonly="drawerType === 'view'"
      @submit="handleFormSubmit"
      @close="handleDrawerClose"
    />

    <!-- 密码重置对话框 -->
    <dialog-form
      ref="passwordDialog"
      :visible.sync="passwordDialogVisible"
      title="重置密码"
      :form-items="passwordFormItems"
      :form-data="passwordFormData"
      :form-rules="passwordFormRules"
      :loading="passwordLoading"
      @submit="handlePasswordSubmit"
      @close="handlePasswordDialogClose"
    />
  </div>
</template>

<script>
// 导入通用组件
import TableToolbar from '@/components/TableToolbar'
import DialogForm from '@/components/DialogForm'

// 导入用户管理组件
import UserTable from './components/UserTable.vue'
import UserForm from './components/UserForm.vue'
import UserSearch from './components/UserSearch.vue'

// 导入API函数
import {
  getUserList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
  resetUserPassword
} from './api'

// 导入常量配置
import {
  USER_STATUS,
  USER_STATUS_OPTIONS,
  GENDER_OPTIONS,
  DEPARTMENT_OPTIONS
} from './constants'

// 导入工具函数
import { scrollTo } from '@/utils/scroll-to'
import { parseTime } from '@/utils'

export default {
  name: 'UserManagement',
  components: {
    UserTable,
    UserForm,
    UserSearch,
    TableToolbar,
    DialogForm
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
        status: '',
        createdTimeRange: []
      },

      // 抽屉表单
      drawerVisible: false,
      drawerType: 'create', // create, edit, view
      currentUser: {},
      formLoading: false,

      // 密码重置对话框
      passwordDialogVisible: false,
      passwordFormData: {
        userId: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordLoading: false
    }
  },
  computed: {

    /**
     * 抽屉标题
     */
    drawerTitle() {
      const titleMap = {
        create: '新增用户',
        edit: '编辑用户',
        view: '查看用户'
      }
      return titleMap[this.drawerType] || '用户信息'
    },



    /**
     * 密码表单配置项
     */
    passwordFormItems() {
      return [
        {
          prop: 'newPassword',
          label: '新密码',
          type: 'password',
          placeholder: '请输入新密码',
          required: true
        },
        {
          prop: 'confirmPassword',
          label: '确认密码',
          type: 'password',
          placeholder: '请再次输入新密码',
          required: true
        }
      ]
    },

    /**
     * 密码表单验证规则
     */
    passwordFormRules() {
      return {
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
          { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/, message: '密码必须包含大小写字母和数字', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.fetchUserList()
  },
  methods: {
    /**
     * 获取用户列表
     */
    async fetchUserList() {
      this.listLoading = true
      try {
        // 基础分页参数
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        }
        
        // 只添加有值的搜索参数
        Object.keys(this.searchQuery).forEach(key => {
          const value = this.searchQuery[key]
          if (value !== '' && value !== null && value !== undefined) {
            if (Array.isArray(value) && value.length > 0) {
              params[key] = value
            } else if (!Array.isArray(value)) {
              params[key] = value
            }
          }
        })
        
        // 处理时间范围参数
        if (this.searchQuery.createdTimeRange && this.searchQuery.createdTimeRange.length === 2) {
          params.createdFrom = this.searchQuery.createdTimeRange[0]
          params.createdTo = this.searchQuery.createdTimeRange[1]
          delete params.createdTimeRange
        }
        
        const response = await getUserList(params)
        this.userList = response.data.results || []
        this.pagination.total = response.data.totalResults || 0
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
        // 设置空数据避免页面报错
        this.userList = []
        this.pagination.total = 0
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
        status: '',
        createdTimeRange: []
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
     * 选择变化处理
     */
    handleSelectionChange(selection) {
      this.selectedUsers = selection
    },

    /**
     * 新增用户
     */
    handleCreate() {
      this.drawerType = 'create'
      this.currentUser = {
        status: USER_STATUS.ACTIVE,
        gender: 'male'
      }
      this.drawerVisible = true
    },

    /**
     * 查看用户
     */
    handleView(row) {
      this.drawerType = 'view'
      this.currentUser = { ...row }
      this.drawerVisible = true
    },

    /**
     * 编辑用户
     */
    handleEdit(row) {
      this.drawerType = 'edit'
      this.currentUser = { ...row }
      this.drawerVisible = true
    },

    /**
     * 删除用户
     */
    handleDelete(row) {
      this.$confirm(`确定要删除用户 "${row.realName}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
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
    async handleEnable(row) {
      try {
        // TODO: 调用启用API
        // await updateUserStatus(row.id, USER_STATUS.ACTIVE)
        this.$message.success('启用成功')
        this.fetchUserList()
      } catch (error) {
        console.error('启用用户失败:', error)
        this.$message.error('启用失败')
      }
    },

    /**
     * 禁用用户
     */
    async handleDisable(row) {
      try {
        // TODO: 调用禁用API
        // await updateUserStatus(row.id, USER_STATUS.INACTIVE)
        this.$message.success('禁用成功')
        this.fetchUserList()
      } catch (error) {
        console.error('禁用用户失败:', error)
        this.$message.error('禁用失败')
      }
    },

    /**
     * 重置密码
     */
    handleResetPassword(row) {
      this.passwordFormData = {
        userId: row.id,
        newPassword: '',
        confirmPassword: ''
      }
      this.passwordDialogVisible = true
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
      }).then(async() => {
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
    async handleBatchEnable() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要启用的用户')
        return
      }

      try {
        // eslint-disable-next-line no-unused-vars
        const userIds = this.selectedUsers.map(user => user.id)
        // TODO: 调用批量启用API
        // await batchUpdateUserStatus(userIds, USER_STATUS.ACTIVE)
        this.$message.success('批量启用成功')
        this.fetchUserList()
      } catch (error) {
        console.error('批量启用失败:', error)
        this.$message.error('批量启用失败')
      }
    },

    /**
     * 批量禁用
     */
    async handleBatchDisable() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要禁用的用户')
        return
      }

      try {
        // eslint-disable-next-line no-unused-vars
        const userIds = this.selectedUsers.map(user => user.id)
        // TODO: 调用批量禁用API
        // await batchUpdateUserStatus(userIds, USER_STATUS.INACTIVE)
        this.$message.success('批量禁用成功')
        this.fetchUserList()
      } catch (error) {
        console.error('批量禁用失败:', error)
        this.$message.error('批量禁用失败')
      }
    },

    /**
     * 刷新列表
     */
    handleRefresh() {
      this.fetchUserList()
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
     * 表单提交
     */
    async handleFormSubmit(formData) {
      this.formLoading = true
      try {
        if (this.drawerType === 'create') {
          // TODO: 调用创建API
          // await createUser(formData)
          this.$message.success('创建成功')
        } else if (this.drawerType === 'edit') {
          // TODO: 调用更新API
          // await updateUser(this.currentUser.id, formData)
          this.$message.success('更新成功')
        }

        this.drawerVisible = false
        this.fetchUserList()
      } catch (error) {
        console.error('保存用户失败:', error)
        this.$message.error('保存失败')
      } finally {
        this.formLoading = false
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
     * 密码提交
     */
    async handlePasswordSubmit(formData) {
      this.passwordLoading = true
      try {
        // TODO: 调用重置密码API
        // await resetUserPassword(formData.userId, formData.newPassword)
        this.$message.success('密码重置成功')
        this.passwordDialogVisible = false
      } catch (error) {
        console.error('重置密码失败:', error)
        this.$message.error('重置密码失败')
      } finally {
        this.passwordLoading = false
      }
    },

    /**
     * 密码对话框关闭
     */
    handlePasswordDialogClose() {
      this.passwordDialogVisible = false
      this.passwordFormData = {
        userId: '',
        newPassword: '',
        confirmPassword: ''
      }
    },





    /**
     * 确认密码验证
     */
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.passwordFormData.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }
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