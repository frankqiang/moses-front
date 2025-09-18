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
      @enable="handleEnable" @disable="handleDisable" @reset-password="handleResetPassword"
      @sort-change="handleSortChange" @refresh="handleRefresh" @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable" @batch-disable="handleBatchDisable">
      <template #toolbar-left>
        <el-button type="primary" icon="el-icon-plus" size="small" @click="handleCreate">
          新增用户
        </el-button>
      </template>
    </user-table>

    <!-- 用户表单抽屉 -->
    <user-form-drawer
      ref="userFormDrawer"
      :visible.sync="drawerVisible"
      :mode="drawerMode"
      :user-data="currentUser"
      @success="handleFormSuccess"
      @close="handleDrawerClose"
    />

    <!-- 密码重置对话框 -->
    <dialog-form ref="passwordDialog" :visible.sync="passwordDialogVisible" title="重置密码" :form-items="passwordFormItems"
      :form-data="passwordFormData" :form-rules="passwordFormRules" :loading="passwordLoading"
      @submit="handlePasswordSubmit" @close="handlePasswordDialogClose" />
  </div>
</template>

<script>
// 导入通用组件
import DialogForm from '@/components/DialogForm'

// 导入用户管理组件
import UserTable from './components/UserTable.vue'
import UserFormDrawer from './components/UserFormDrawer.vue'
import UserSearch from './components/UserSearch.vue'

// 导入API函数
import {
  getUserList,
  getUserDetail,
  createUser, // eslint-disable-line no-unused-vars
  updateUser, // eslint-disable-line no-unused-vars
  deleteUser, // eslint-disable-line no-unused-vars
  batchDeleteUsers, // eslint-disable-line no-unused-vars
  updateUserStatus, // eslint-disable-line no-unused-vars
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
    handleEdit(row) {
      this.drawerMode = 'update'
      this.currentUser = { ...row }
      this.drawerVisible = true
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
