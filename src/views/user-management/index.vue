/**
 * 文件名称：index.vue
 * 文件描述：用户管理主页面，提供用户信息的查询、新增、编辑、删除等功能
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建，实现基础架构
 */
<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">用户管理</h2>
      <p class="page-description">管理系统用户信息，包括用户账号、基本信息、权限设置等</p>
    </div>

    <!-- 搜索表单 -->
    <search-form
      :items="searchFormItems"
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
    <base-table
      ref="userTable"
      :data="userList"
      :columns="tableColumns"
      :loading="listLoading"
      :pagination="pagination"
      :show-selection="true"
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
    >
      <!-- 状态列自定义渲染 -->
      <template #status="{ row }">
        <status-tag
          :status="row.status"
          :type="getStatusType(row.status)"
        >
          {{ getStatusText(row.status) }}
        </status-tag>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <action-buttons
          :buttons="getActionButtons(row)"
          @view="handleView(row)"
          @edit="handleEdit(row)"
          @delete="handleDelete(row)"
          @enable="handleEnable(row)"
          @disable="handleDisable(row)"
          @reset-password="handleResetPassword(row)"
        />
      </template>
    </base-table>

    <!-- 用户表单抽屉 -->
    <drawer-form
      ref="userFormDrawer"
      :visible.sync="drawerVisible"
      :title="drawerTitle"
      :form-items="formItems"
      :form-data="currentUser"
      :form-rules="formRules"
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
import SearchForm from '@/components/SearchForm'
import BaseTable from '@/components/BaseTable'
import TableToolbar from '@/components/TableToolbar'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import DrawerForm from '@/components/DrawerForm'
import DialogForm from '@/components/DialogForm'

// 导入API函数
/* eslint-disable no-unused-vars */
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
/* eslint-enable no-unused-vars */

// 导入常量配置
import {
  USER_STATUS,
  USER_STATUS_OPTIONS,
  GENDER_OPTIONS,
  DEPARTMENT_OPTIONS
} from './constants'

// 导入工具函数
// eslint-disable-next-line no-unused-vars
import { scrollTo } from '@/utils/scroll-to'
import { parseTime } from '@/utils'

export default {
  name: 'UserManagement',
  components: {
    SearchForm,
    BaseTable,
    TableToolbar,
    ActionButtons,
    StatusTag,
    DrawerForm,
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
        realName: '',
        email: '',
        phone: '',
        department: '',
        status: '',
        createTimeRange: []
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
     * 搜索表单配置项
     */
    searchFormItems() {
      return [
        {
          prop: 'username',
          label: '用户名',
          type: 'input',
          placeholder: '请输入用户名',
          clearable: true
        },
        {
          prop: 'realName',
          label: '真实姓名',
          type: 'input',
          placeholder: '请输入真实姓名',
          clearable: true
        },
        {
          prop: 'email',
          label: '邮箱',
          type: 'input',
          placeholder: '请输入邮箱',
          clearable: true
        },
        {
          prop: 'phone',
          label: '手机号',
          type: 'input',
          placeholder: '请输入手机号',
          clearable: true
        },
        {
          prop: 'department',
          label: '部门',
          type: 'select',
          placeholder: '请选择部门',
          options: DEPARTMENT_OPTIONS,
          clearable: true
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择状态',
          options: USER_STATUS_OPTIONS,
          clearable: true
        },
        {
          prop: 'createTimeRange',
          label: '创建时间',
          type: 'date',
          dateType: 'datetimerange',
          placeholder: '选择时间范围',
          startPlaceholder: '开始时间',
          endPlaceholder: '结束时间',
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          clearable: true
        }
      ]
    },

    /**
     * 表格列配置
     */
    tableColumns() {
      return [
        { prop: 'username', label: '用户名', width: '120', sortable: true },
        { prop: 'realName', label: '真实姓名', width: '100' },
        { prop: 'email', label: '邮箱', width: '180' },
        { prop: 'phone', label: '手机号', width: '120' },
        { prop: 'department', label: '部门', width: '100' },
        { prop: 'gender', label: '性别', width: '60', formatter: this.formatGender },
        {
          prop: 'status',
          label: '状态',
          width: '80',
          slot: 'status'
        },
        {
          prop: 'lastLoginTime',
          label: '最后登录',
          width: '150',
          formatter: (row) => row.lastLoginTime ? parseTime(row.lastLoginTime, '{y}-{m}-{d} {h}:{i}') : '-'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '150',
          formatter: (row) => parseTime(row.createTime, '{y}-{m}-{d} {h}:{i}')
        },
        {
          prop: 'actions',
          label: '操作',
          width: '200',
          fixed: 'right',
          slot: 'actions'
        }
      ]
    },

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
     * 表单配置项
     */
    formItems() {
      return [
        {
          prop: 'username',
          label: '用户名',
          type: 'input',
          placeholder: '请输入用户名',
          required: true,
          disabled: this.drawerType === 'edit'
        },
        {
          prop: 'realName',
          label: '真实姓名',
          type: 'input',
          placeholder: '请输入真实姓名',
          required: true
        },
        {
          prop: 'email',
          label: '邮箱',
          type: 'input',
          placeholder: '请输入邮箱',
          required: true
        },
        {
          prop: 'phone',
          label: '手机号',
          type: 'input',
          placeholder: '请输入手机号',
          required: true
        },
        {
          prop: 'department',
          label: '部门',
          type: 'select',
          placeholder: '请选择部门',
          options: DEPARTMENT_OPTIONS,
          required: true
        },
        {
          prop: 'gender',
          label: '性别',
          type: 'radio',
          options: GENDER_OPTIONS,
          required: true
        },
        {
          prop: 'status',
          label: '状态',
          type: 'radio',
          options: USER_STATUS_OPTIONS,
          required: true
        },
        {
          prop: 'remark',
          label: '备注',
          type: 'textarea',
          placeholder: '请输入备注信息'
        }
      ]
    },

    /**
     * 表单验证规则
     */
    formRules() {
      return {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '姓名长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
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
  created() {
    this.fetchUserList()
  },
  methods: {
    /**
     * 获取用户列表
     */
    async fetchUserList() {
      this.listLoading = true
      try {
        // TODO: 调用API获取用户列表
        // const response = await getUserList({
        //   ...this.searchQuery,
        //   page: this.pagination.page,
        //   limit: this.pagination.limit
        // })
        // this.userList = response.data.list
        // this.pagination.total = response.data.total

        // 模拟数据
        this.userList = []
        this.pagination.total = 0

        console.log('获取用户列表')
      } catch (error) {
        console.error('获取用户列表失败:', error)
        this.$message.error('获取用户列表失败')
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
        realName: '',
        email: '',
        phone: '',
        department: '',
        status: '',
        createTimeRange: []
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
     * 获取状态类型
     */
    getStatusType(status) {
      const typeMap = {
        [USER_STATUS.ACTIVE]: 'success',
        [USER_STATUS.INACTIVE]: 'danger',
        [USER_STATUS.LOCKED]: 'warning'
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const textMap = {
        [USER_STATUS.ACTIVE]: '正常',
        [USER_STATUS.INACTIVE]: '禁用',
        [USER_STATUS.LOCKED]: '锁定'
      }
      return textMap[status] || '未知'
    },

    /**
     * 格式化性别
     */
    formatGender(row) {
      const genderMap = {
        'male': '男',
        'female': '女'
      }
      return genderMap[row.gender] || '-'
    },

    /**
     * 获取操作按钮配置
     */
    getActionButtons(row) {
      const buttons = [
        {
          key: 'view',
          label: '查看',
          type: 'text',
          icon: 'el-icon-view'
        },
        {
          key: 'edit',
          label: '编辑',
          type: 'text',
          icon: 'el-icon-edit'
        }
      ]

      if (row.status === USER_STATUS.ACTIVE) {
        buttons.push({
          key: 'disable',
          label: '禁用',
          type: 'text',
          icon: 'el-icon-close'
        })
      } else {
        buttons.push({
          key: 'enable',
          label: '启用',
          type: 'text',
          icon: 'el-icon-check'
        })
      }

      buttons.push(
        {
          key: 'reset-password',
          label: '重置密码',
          type: 'text',
          icon: 'el-icon-key'
        },
        {
          key: 'delete',
          label: '删除',
          type: 'text',
          icon: 'el-icon-delete',
          danger: true
        }
      )

      return buttons
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