/**
* 用户表单抽屉组件
* 功能描述：提供用户新增、编辑和查看功能的表单，使用BaseDrawer+EnhancedForm组合
* 创建日期：2024-01-15
* 修改记录：
* - 2024-01-15: 重构为现代化组件架构，参考OperationFormDrawer实现
*/
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="1000px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >

    <!-- 错误提示区域 -->
    <template #error>
      <div v-if="formErrorMessage" class="error-message">
        <i class="el-icon-warning" />
        <span>{{ formErrorMessage }}</span>
        <el-button type="text" size="mini" @click="clearFormError">
          <i class="el-icon-close" />
        </el-button>
      </div>
    </template>
    <!-- 表单内容 -->
    <enhanced-form
      ref="enhancedForm"
      :data="formData"
      :mode="innerMode"
      :rules="formRules"
      label-width="120px"
      :show-footer="false"
      :show-error="false"
      :clear-validate-on-data-update="true"
      :disable-initial-validation="true"
      :validate-on-data-change="false"
      @submit="handleFormSubmit"
      @validate="handleCustomValidate"
      @validate-error="handleValidateError"
      @reset="handleFormReset"
    >
      <!-- 表单内容 -->
      <template v-slot="{ form, mode: formMode }">
        <!-- 一、基础信息 -->
        <div class="form-section">
          <div class="section-title">一、基础信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="form.username"
                  placeholder="请输入用户名"
                  maxlength="50"
                  show-word-limit
                  :disabled="formMode === 'view' || formMode === 'update'"
                />
                <div class="field-hint">用户名只能包含字母、数字和下划线，创建后不可修改</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入真实姓名"
                  maxlength="50"
                  show-word-limit
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="form.email"
                  placeholder="请输入邮箱地址"
                  maxlength="100"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input
                  v-model="form.phone"
                  placeholder="请输入手机号码"
                  maxlength="20"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="formMode === 'create'" :gutter="20">
            <el-col :span="12">
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请输入密码"
                  maxlength="50"
                  show-password
                  :disabled="formMode === 'view'"
                />
                <div class="field-hint">密码长度8-50位，包含大小写字母、数字</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="form.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  maxlength="50"
                  show-password
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-select
                  v-model="form.gender"
                  placeholder="请选择性别"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                >
                  <el-option
                    v-for="option in genderOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="用户角色" prop="role">
                <el-select
                  v-model="form.role"
                  placeholder="请选择用户角色"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                >
                  <el-option
                    v-for="option in basicRoleOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
                <div class="field-hint">基础角色，用于系统权限控制</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.status" :disabled="formMode === 'view'">
                  <el-radio
                    v-for="option in userStatusOptions"
                    :key="option.value"
                    :label="option.value"
                  >
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 二、组织架构信息 -->
        <div class="form-section">
          <div class="section-title">二、组织架构信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="所属部门" prop="departmentId">
                <el-select
                  v-model="form.departmentId"
                  placeholder="请选择所属部门"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  :loading="departmentLoading"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="dept in departmentOptions"
                    :key="dept.value"
                    :label="dept.label"
                    :value="dept.value"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ dept.label }}</span>
                      <span v-if="dept.code" class="option-extra">{{ dept.code }}</span>
                    </div>
                  </el-option>
                </el-select>
                <div class="field-hint">选择用户所属的部门</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="岗位" prop="positionId">
                <el-select
                  v-model="form.positionId"
                  placeholder="请选择岗位"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  :loading="positionLoading"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="pos in positionOptions"
                    :key="pos.value"
                    :label="pos.label"
                    :value="pos.value"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ pos.label }}</span>
                      <span v-if="pos.code" class="option-extra">{{ pos.code }}</span>
                    </div>
                  </el-option>
                </el-select>
                <div class="field-hint">选择用户的岗位信息</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 三、档案信息 -->
        <div class="form-section">
          <div class="section-title">三、档案信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="员工工号" prop="employeeId">
                <el-input
                  v-model="form.employeeId"
                  placeholder="请输入员工工号"
                  maxlength="50"
                  :disabled="formMode === 'view'"
                />
                <div class="field-hint">工号必须全局唯一</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职位名称" prop="jobTitle">
                <el-input
                  v-model="form.jobTitle"
                  placeholder="请输入职位名称"
                  maxlength="100"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="直属上级" prop="managerId">
                <el-select
                  v-model="form.managerId"
                  placeholder="请选择直属上级"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  :loading="managerLoading"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="manager in managerOptions"
                    :key="manager.value"
                    :label="manager.label"
                    :value="manager.value"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ manager.label }}</span>
                      <span v-if="manager.department" class="option-extra">{{
                        manager.department.name }}</span>
                    </div>
                  </el-option>
                </el-select>
                <div class="field-hint">选择用户的直属上级，用于组织架构管理</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出生日期" prop="birthDate">
                <el-date-picker
                  v-model="form.birthDate"
                  type="date"
                  placeholder="请选择出生日期"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                />
                <div class="field-hint">年龄需在16-100岁之间</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="入职日期" prop="hireDate">
                <el-date-picker
                  v-model="form.hireDate"
                  type="date"
                  placeholder="请选择入职日期"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd"
                />
                <div class="field-hint">不能是未来日期</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="家庭住址" prop="address">
                <el-input
                  v-model="form.address"
                  placeholder="请输入家庭住址"
                  maxlength="500"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="紧急联系人" prop="emergencyContact">
                <el-input
                  v-model="form.emergencyContact"
                  placeholder="请输入紧急联系人姓名"
                  maxlength="100"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急联系电话" prop="emergencyPhone">
                <el-input
                  v-model="form.emergencyPhone"
                  placeholder="请输入紧急联系电话"
                  maxlength="20"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

        </div>

        <!-- 四、角色权限 -->
        <div class="form-section">
          <div class="section-title">四、角色权限</div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="分配角色" prop="roleIds">
                <el-select
                  v-model="form.roleIds"
                  multiple
                  placeholder="请选择分配角色"
                  style="width: 100%"
                  :disabled="formMode === 'view' || roleLoading"
                  filterable
                  collapse-tags
                  :loading="roleLoading"
                >
                  <el-option
                    v-for="role in roleOptions"
                    :key="role.value"
                    :label="role.label"
                    :value="role.value"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ role.label }}</span>
                      <span v-if="role.description" class="option-extra">{{ role.description
                      }}</span>
                    </div>
                  </el-option>
                </el-select>
                <div class="field-hint">可选择多个角色，用户权限为所有角色权限的并集</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 五、备注信息 -->
        <div class="form-section">
          <div class="section-title">五、备注信息</div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注信息" prop="notes">
                <el-input
                  v-model="form.notes"
                  type="textarea"
                  placeholder="请输入备注信息"
                  :rows="3"
                  maxlength="1000"
                  show-word-limit
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </template>
    </enhanced-form>

    <!-- 抽屉底部按钮 -->
    <template #footer>
      <el-button @click="handleCancel">{{ innerMode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="innerMode !== 'view'" @click="handleReset">重置</el-button>
      <el-button v-if="innerMode === 'create'" type="primary" :loading="loading" @click="handleSubmitAndContinue">
        保存并继续
      </el-button>
      <el-button v-if="innerMode !== 'view'" type="primary" :loading="loading" @click="handleSubmit">
        {{ innerMode === 'create' ? '确认保存' : '保存修改' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import {
  createUser, // eslint-disable-line no-unused-vars
  updateUser, // eslint-disable-line no-unused-vars
  getDepartmentOptions,
  getPositionOptions,
  getRoleOptions,
  getManagerOptions
} from '../api'
import {
  USER_STATUS_OPTIONS,
  GENDER_OPTIONS
} from '../constants'

export default {
  name: 'UserFormDrawer',
  components: {
    BaseDrawer,
    EnhancedForm
  },
  props: {
    // 抽屉可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 操作模式：create-新增, update-编辑, view-查看
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view'].includes(value)
    },
    // 用户数据（编辑和查看时使用）
    userData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 抽屉内部可见性
      drawerVisible: false,
      // 表单数据
      formData: this.initFormData(),
      // 加载状态
      loading: false,
      // 表单错误消息
      formErrorMessage: '',
      // 部门选项
      departmentOptions: [],
      // 部门数据加载状态
      departmentLoading: false,
      // 岗位选项
      positionOptions: [],
      // 岗位数据加载状态
      positionLoading: false,
      // 角色选项
      roleOptions: [],
      // 角色数据加载状态
      roleLoading: false,
      // 直属上级选项
      managerOptions: [],
      // 直属上级数据加载状态
      managerLoading: false
    }
  },
  computed: {
    // 内部模式
    innerMode() {
      return this.mode
    },
    // 抽屉标题
    drawerTitle() {
      const titleMap = {
        create: '新增用户',
        update: '编辑用户',
        view: '查看用户'
      }
      return titleMap[this.mode] || '用户管理'
    },
    // 权限检查：是否可以编辑用户
    canEditUser() {
      // 获取当前登录用户信息
      const currentUser = this.$store.state.user.userInfo
      if (!currentUser) return false

      // 检查是否有manageUsers权限
      const permissions = currentUser.permissions || []
      const hasManageUsersPermission = permissions.includes('manageUsers')

      // 管理员角色或拥有manageUsers权限的用户可以编辑
      const roles = currentUser.roles || []
      const isAdmin = roles.includes('admin') || roles.includes('administrator')

      return isAdmin || hasManageUsersPermission
    },
    // 权限检查：是否可以编辑当前用户
    canEditCurrentUser() {
      if (!this.canEditUser) return false

      // 在编辑模式下，检查是否可以编辑特定用户
      if (this.mode === 'update' && this.userData) {
        const currentUser = this.$store.state.user.userInfo

        // 普通用户只能编辑自己的信息
        if (!this.isAdminUser && this.userData.id !== currentUser.id) {
          return false
        }

        // 不能编辑比自己权限高的用户
        if (this.userData.role === 'admin' && !this.isAdminUser) {
          return false
        }
      }

      return true
    },
    // 是否为管理员用户
    isAdminUser() {
      const currentUser = this.$store.state.user.userInfo
      const roles = currentUser?.roles || []
      return roles.includes('admin') || roles.includes('administrator')
    },
    // 性别选项
    genderOptions() {
      return GENDER_OPTIONS
    },
    // 用户状态选项
    userStatusOptions() {
      return USER_STATUS_OPTIONS
    },
    // 基础角色选项（对应接口的role字段）
    basicRoleOptions() {
      return [
        { value: 'user', label: '普通用户' },
        { value: 'admin', label: '管理员' }
      ]
    },
    // 表单验证规则
    formRules() {
      const rules = {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z0-9_]+$/,
            message: '用户名只能包含字母、数字和下划线',
            trigger: 'blur'
          },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 1, max: 255, message: '长度在 1 到 255 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { max: 20, message: '手机号码最多20个字符', trigger: 'blur' },
          {
            pattern: /^\+?[1-9]\d{1,14}$/,
            message: '请输入正确的国际电话格式',
            trigger: 'blur'
          }
        ],
        status: [
          { required: true, message: '请选择用户状态', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择用户角色', trigger: 'change' }
        ],
        // 档案信息验证规则
        employeeId: [
          { max: 50, message: '员工工号最多50个字符', trigger: 'blur' }
        ],
        jobTitle: [
          { max: 100, message: '职位名称最多100个字符', trigger: 'blur' }
        ],
        address: [
          { max: 500, message: '家庭住址最多500个字符', trigger: 'blur' }
        ],
        emergencyContact: [
          { max: 100, message: '紧急联系人姓名最多100个字符', trigger: 'blur' }
        ],
        emergencyPhone: [
          { max: 20, message: '紧急联系电话最多20个字符', trigger: 'blur' },
          {
            pattern: /^\+?[1-9]\d{1,14}$/,
            message: '请输入正确的国际电话格式',
            trigger: 'blur'
          }
        ],
        notes: [
          { max: 1000, message: '备注信息最多1000个字符', trigger: 'blur' }
        ],
        hireDate: [
          {
            validator: this.validateHireDate,
            trigger: 'change'
          }
        ],
        birthDate: [
          {
            validator: this.validateBirthDate,
            trigger: 'change'
          }
        ]
      }

      // 新增用户时添加密码验证
      if (this.mode === 'create') {
        rules.password = [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, message: '密码至少8位', trigger: 'blur' },
          {
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
            message: '密码必须包含字母和数字',
            trigger: 'blur'
          }
        ]
        rules.confirmPassword = [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: this.validatePasswordConfirm,
            trigger: 'blur'
          }
        ]
      }

      return rules
    }
  },
  watch: {
    // 监听可见性变化
    visible: {
      immediate: true,
      handler(newVal) {
        this.drawerVisible = newVal
      }
    },
    // 监听抽屉内部可见性变化
    drawerVisible(newVal) {
      this.$emit('update:visible', newVal)
    },
    // 监听用户数据变化
    userData: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && (this.mode === 'update' || this.mode === 'view')) {
          this.formData = { ...this.initFormData(), ...newVal }
        }
      }
    }
  },
  created() {
    // 组件初始化
    this.loadDepartmentOptions()
    this.loadPositionOptions()
    this.loadRoleOptions()
    this.loadManagerOptions()
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        id: undefined,
        // 必填字段
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user', // 接口必填字段
        // 组织架构字段
        departmentId: '', // 部门ID
        positionId: '', // 岗位ID
        roleIds: [], // 角色ID列表
        // 档案信息字段
        employeeId: '', // 员工工号
        jobTitle: '', // 职位名称
        managerId: '', // 直属上级ID
        hireDate: '', // 入职日期
        birthDate: '', // 出生日期
        gender: '', // 性别
        address: '', // 家庭住址
        emergencyContact: '', // 紧急联系人姓名
        emergencyPhone: '', // 紧急联系人电话
        notes: '', // 备注信息
        // 其他字段
        phone: '',
        status: 'active'
      }
    },

    /**
         * 将用户详情数据映射到表单数据
         * @param {Object} userData - 从详情接口获取的用户数据
         * @returns {Object} 映射后的表单数据
         */
    mapUserDataToFormData(userData) {
      const formData = this.initFormData()

      // 基础用户信息映射
      if (userData.id) formData.id = userData.id
      if (userData.username) formData.username = userData.username
      if (userData.name) formData.name = userData.name
      if (userData.email) formData.email = userData.email
      if (userData.phone) formData.phone = userData.phone
      if (userData.role) formData.role = userData.role
      if (userData.status) formData.status = userData.status

      // 档案信息映射（从profile对象中提取）
      if (userData.profile) {
        const profile = userData.profile
        if (profile.employeeId) formData.employeeId = profile.employeeId
        if (profile.jobTitle) formData.jobTitle = profile.jobTitle
        if (profile.hireDate) formData.hireDate = profile.hireDate
        if (profile.birthDate) formData.birthDate = profile.birthDate
        if (profile.gender) formData.gender = profile.gender
        if (profile.address) formData.address = profile.address
        if (profile.emergencyContact) formData.emergencyContact = profile.emergencyContact
        if (profile.emergencyPhone) formData.emergencyPhone = profile.emergencyPhone
        if (profile.notes) formData.notes = profile.notes

        // 部门ID映射
        if (profile.department && profile.department.id) {
          formData.departmentId = profile.department.id
        }

        // 岗位ID映射
        if (profile.position && profile.position.id) {
          formData.positionId = profile.position.id
        }

        // 直属上级ID映射
        if (profile.manager && profile.manager.id) {
          formData.managerId = profile.manager.id
        }
      }

      // 角色ID列表映射（从userRoles数组中提取）
      if (userData.userRoles && Array.isArray(userData.userRoles)) {
        formData.roleIds = userData.userRoles
          .filter(userRole => userRole.status === 'active' && userRole.role && userRole.role.id)
          .map(userRole => userRole.role.id)
      }

      return formData
    },

    /**
         * 构建更新数据 - 根据接口文档严格构建更新请求数据
         * @param {Object} updateData - 表单更新数据
         * @returns {Object} 符合接口要求的更新数据
         */
    buildUpdateData(updateData) {
      const submitData = {}
      const originalData = this.userData || {}
      const originalProfile = originalData.profile || {}

      // 用户基本信息字段检查
      if (updateData.name !== undefined && updateData.name !== originalData.name) {
        submitData.name = updateData.name
      }
      if (updateData.email !== undefined && updateData.email !== originalData.email) {
        submitData.email = updateData.email
      }
      if (updateData.username !== undefined && updateData.username !== originalData.username) {
        submitData.username = updateData.username
      }
      if (updateData.phone !== undefined && updateData.phone !== originalData.phone) {
        submitData.phone = updateData.phone
      }
      if (updateData.status !== undefined && updateData.status !== originalData.status) {
        submitData.status = updateData.status
      }

      // 组织架构信息字段检查
      if (updateData.departmentId !== undefined && updateData.departmentId !== originalProfile.department?.id) {
        submitData.departmentId = updateData.departmentId || null
      }
      if (updateData.positionId !== undefined && updateData.positionId !== originalProfile.position?.id) {
        submitData.positionId = updateData.positionId || null
      }
      if (updateData.roleIds !== undefined) {
        const originalRoleIds = originalData.userRoles?.filter(ur => ur.status === 'active').map(ur => ur.role?.id) || []
        const currentRoleIds = updateData.roleIds || []
        if (JSON.stringify(currentRoleIds.sort()) !== JSON.stringify(originalRoleIds.sort())) {
          submitData.roleIds = currentRoleIds
        }
      }

      // 用户档案信息字段检查
      if (updateData.employeeId !== undefined && updateData.employeeId !== originalProfile.employeeId) {
        submitData.employeeId = updateData.employeeId
      }
      if (updateData.jobTitle !== undefined && updateData.jobTitle !== originalProfile.jobTitle) {
        submitData.jobTitle = updateData.jobTitle
      }
      if (updateData.managerId !== undefined && updateData.managerId !== originalProfile.manager?.id) {
        submitData.managerId = updateData.managerId || null
      }
      if (updateData.hireDate !== undefined && updateData.hireDate !== originalProfile.hireDate) {
        submitData.hireDate = updateData.hireDate
      }
      if (updateData.birthDate !== undefined && updateData.birthDate !== originalProfile.birthDate) {
        submitData.birthDate = updateData.birthDate
      }
      if (updateData.gender !== undefined && updateData.gender !== originalProfile.gender) {
        submitData.gender = updateData.gender
      }
      if (updateData.address !== undefined && updateData.address !== originalProfile.address) {
        submitData.address = updateData.address
      }
      if (updateData.emergencyContact !== undefined && updateData.emergencyContact !== originalProfile.emergencyContact) {
        submitData.emergencyContact = updateData.emergencyContact
      }
      if (updateData.emergencyPhone !== undefined && updateData.emergencyPhone !== originalProfile.emergencyPhone) {
        submitData.emergencyPhone = updateData.emergencyPhone
      }
      if (updateData.notes !== undefined && updateData.notes !== originalProfile.notes) {
        submitData.notes = updateData.notes
      }

      // 自定义字段检查（如果需要）
      if (updateData.customFields !== undefined) {
        const originalCustomFields = originalProfile.customFields || {}
        if (JSON.stringify(updateData.customFields) !== JSON.stringify(originalCustomFields)) {
          submitData.customFields = updateData.customFields
        }
      }

      return submitData
    },

    /**
         * 提取错误消息 - 严格按照接口文档的错误响应格式处理
         * @param {Error} error - 错误对象
         * @param {string} defaultMessage - 默认错误消息
         * @returns {string} 用户友好的错误消息
         */
    extractErrorMessage(error, defaultMessage = '操作失败，请稍后重试') {
      // 网络错误或其他非HTTP错误
      if (!error.response) {
        return error.message || defaultMessage
      }

      const errorData = error.response.data
      if (!errorData) {
        return defaultMessage
      }

      // 按照接口文档的标准错误格式处理
      if (errorData.error) {
        // 对VAL_001验证错误进行特殊格式化
        if (errorData.error.code === 'VAL_001' &&
                    errorData.error.details &&
                    Array.isArray(errorData.error.details)) {
          const messages = errorData.error.details.map(detail => `${detail.field}: ${detail.message}`)
          return `输入数据验证失败:\n${messages.join('\n')}`
        }

        // 其他错误直接返回后端消息
        return errorData.error.message || errorData.message || defaultMessage
      }

      // 兼容其他可能的错误格式
      return errorData.message || defaultMessage
    },

    // 抽屉打开处理
    handleDrawerOpen() {
      // 权限检查
      if ((this.mode === 'update' || this.mode === 'create') && !this.canEditCurrentUser) {
        this.$message.error('权限不足，无法编辑此用户')
        this.drawerVisible = false
        return
      }

      // 初始化表单数据
      if (this.mode === 'create') {
        this.formData = this.initFormData()
      } else if (this.userData) {
        this.formData = this.mapUserDataToFormData(this.userData)
      }

      // 重新加载直属上级数据，确保编辑模式下排除当前用户
      this.loadManagerOptions()
    },

    // 抽屉关闭处理
    handleDrawerClose() {
      // 清除错误消息
      this.clearFormError()
      // 重置表单数据
      this.formData = this.initFormData()
      this.$emit('close')
    },

    // 取消按钮处理
    handleCancel() {
      this.drawerVisible = false
    },

    // 重置按钮处理
    handleReset() {
      this.$confirm('确定要重置表单吗？', '重置确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleFormReset()
        this.$message.success('表单已重置')
      }).catch(() => {
        // 用户取消重置
      })
    },

    // 提交按钮处理
    handleSubmit() {
      // 触发 EnhancedForm 的内置提交机制
      if (this.$refs.enhancedForm) {
        this.$refs.enhancedForm.handleSubmitClick()
      }
    },

    // 保存并继续按钮处理
    handleSubmitAndContinue() {
      // 触发 EnhancedForm 的内置保存并继续机制
      if (this.$refs.enhancedForm) {
        this.$refs.enhancedForm.handleContinueClick()
      }
    },

    // 业务逻辑：实际的数据提交处理
    async handleFormSubmit(formData, continueEdit = false) {
      try {
        // 权限检查
        if (!this.canEditCurrentUser) {
          this.$message.error('权限不足，无法执行此操作')
          this.loading = false
          return
        }

        // 清除之前的错误消息
        this.clearFormError()
        this.loading = true
        let response

        if (this.mode === 'create') {
          // 移除确认密码字段，准备符合接口规范的数据
          const { confirmPassword, ...submitData } = formData // eslint-disable-line no-unused-vars
          response = await createUser(submitData)
        } else if (this.mode === 'update') {
          // 编辑模式：移除不需要的字段，只发送实际需要更新的字段
          const { password, confirmPassword, id, ...updateData } = formData // eslint-disable-line no-unused-vars

          // 构建符合接口文档的更新数据
          const submitData = this.buildUpdateData(updateData)

          // 检查是否有数据需要更新
          if (Object.keys(submitData).length === 0) {
            this.$message.info('没有检测到数据变化')
            this.loading = false
            return
          }

          response = await updateUser(formData.id, submitData)
        }

        // 从API响应中获取消息，提供备选默认消息
        const successMessage = response?.message ||
                    (this.mode === 'create' ? '用户创建成功' : '用户更新成功')
        this.$message.success(successMessage)

        this.$emit('success', { mode: this.mode, data: formData, continueEdit })

        if (continueEdit) {
          // 保存并继续 - 重置表单
          this.formData = this.initFormData()
        } else {
          // 普通保存 - 关闭抽屉
          this.drawerVisible = false
        }
      } catch (error) {
        console.error('用户保存失败:', error)

        // 直接使用后端返回的错误消息
        const errorMessage = this.extractErrorMessage(error, '用户保存失败')
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    // 自定义验证处理
    handleCustomValidate(formData, callback) {
      // 可以在这里添加额外的自定义验证逻辑
      callback(true)
    },

    // 验证错误处理
    handleValidateError(invalidFields) {
      console.log('表单验证失败:', invalidFields)

      // 提取第一个错误消息并显示在顶部
      const firstErrorField = Object.keys(invalidFields)[0]
      if (firstErrorField && invalidFields[firstErrorField] && invalidFields[firstErrorField][0]) {
        this.formErrorMessage = invalidFields[firstErrorField][0].message
      }

      // 聚焦到第一个错误字段
      this.$nextTick(() => {
        if (firstErrorField && this.$refs.enhancedForm && this.$refs.enhancedForm.$el) {
          const fieldElement = this.$refs.enhancedForm.$el.querySelector(`[prop="${firstErrorField}"] input, [prop="${firstErrorField}"] textarea`)
          if (fieldElement) {
            fieldElement.focus()
          }
        }
      })
    },

    // 清除表单错误消息
    clearFormError() {
      this.formErrorMessage = ''
    },

    // 表单重置处理
    handleFormReset() {
      this.formData = this.initFormData()
    },

    // 加载部门选项数据
    async loadDepartmentOptions() {
      try {
        this.departmentLoading = true

        const response = await getDepartmentOptions({
          status: 'active' // 只获取激活状态的部门
        })

        if (response && response.success && response.data && response.data.options) {
          this.departmentOptions = response.data.options
        } else if (response && response.success && response.data && response.data.results) {
          // 如果API返回的是标准列表格式，手动转换为选项格式
          this.departmentOptions = response.data.results.map(dept => ({
            value: dept.id,
            label: dept.name,
            code: dept.code,
            level: dept.level,
            status: dept.status
          }))
        } else {
          console.warn('部门数据格式异常:', response)
          this.departmentOptions = []
        }
      } catch (error) {
        console.error('加载部门数据失败:', error)

        // 使用统一的错误消息提取方法
        const errorMessage = this.extractErrorMessage(error, '加载部门数据失败')

        // 显示错误提示（使用较温和的警告而不是错误，因为这不会阻止用户使用其他功能）
        this.$message.warning(`${errorMessage}，部门选择功能暂时不可用`)

        // 设置空的部门选项
        this.departmentOptions = []
      } finally {
        this.departmentLoading = false
      }
    },

    // 加载岗位选项数据
    async loadPositionOptions() {
      try {
        this.positionLoading = true

        const response = await getPositionOptions({
          status: 'active' // 只获取激活状态的岗位
        })

        if (response && response.success && response.data && response.data.options) {
          this.positionOptions = response.data.options
        } else if (response && response.success && response.data && response.data.results) {
          // 如果API返回的是标准列表格式，手动转换为选项格式
          this.positionOptions = response.data.results.map(pos => ({
            value: pos.id,
            label: pos.name,
            code: pos.code,
            description: pos.description,
            departmentId: pos.departmentId,
            level: pos.level,
            status: pos.status
          }))
        } else {
          console.warn('岗位数据格式异常:', response)
          this.positionOptions = []
        }
      } catch (error) {
        console.error('加载岗位数据失败:', error)

        // 使用统一的错误消息提取方法
        const errorMessage = this.extractErrorMessage(error, '加载岗位数据失败')

        // 显示错误提示（使用较温和的警告而不是错误，因为这不会阻止用户使用其他功能）
        this.$message.warning(`${errorMessage}，岗位选择功能暂时不可用`)

        // 设置空的岗位选项
        this.positionOptions = []
      } finally {
        this.positionLoading = false
      }
    },

    // 加载角色选项数据
    async loadRoleOptions() {
      try {
        this.roleLoading = true

        const response = await getRoleOptions({
          status: 'active' // 只获取激活状态的角色
        })

        if (response && response.success && response.data && response.data.options) {
          this.roleOptions = response.data.options
        } else if (response && response.success && response.data && response.data.results) {
          // 如果API返回的是标准列表格式，手动转换为选项格式
          this.roleOptions = response.data.results.map(role => ({
            value: role.id,
            label: role.name,
            description: role.description,
            code: role.code,
            type: role.type,
            level: role.level,
            status: role.status,
            isDefault: role.isDefault
          }))
        } else {
          console.warn('角色数据格式异常:', response)
          this.roleOptions = []
        }
      } catch (error) {
        console.error('加载角色数据失败:', error)

        // 使用统一的错误消息提取方法
        const errorMessage = this.extractErrorMessage(error, '加载角色数据失败')

        // 显示错误提示（使用较温和的警告而不是错误，因为这不会阻止用户使用其他功能）
        this.$message.warning(`${errorMessage}，角色选择功能暂时不可用`)

        // 设置空的角色选项
        this.roleOptions = []
      } finally {
        this.roleLoading = false
      }
    },

    // 加载直属上级选项数据
    async loadManagerOptions() {
      try {
        this.managerLoading = true

        // 构建查询参数，排除当前编辑的用户（避免自己选择自己作为上级）
        const params = {
          status: 'active' // 只获取激活状态的用户
        }

        // 编辑模式下，排除当前用户
        if (this.mode === 'update' && this.formData && this.formData.id) {
          params.excludeUserId = this.formData.id
        }

        const response = await getManagerOptions(params)

        if (response && response.success && response.data && response.data.options) {
          this.managerOptions = response.data.options
        } else if (response && response.success && response.data && response.data.results) {
          // 如果API返回的是标准列表格式，手动转换为选项格式
          let users = response.data.results

          // 如果需要排除特定用户，在前端进行过滤
          if (params.excludeUserId) {
            users = users.filter(user => user.id !== params.excludeUserId)
          }

          this.managerOptions = users.map(user => ({
            value: user.id,
            label: `${user.name} (${user.username})`,
            email: user.email,
            username: user.username,
            name: user.name,
            department: user.profile?.department ? {
              id: user.profile.department.id,
              name: user.profile.department.name,
              code: user.profile.department.code
            } : null,
            jobTitle: user.profile?.jobTitle || '',
            status: user.status
          }))
        } else {
          console.warn('直属上级数据格式异常:', response)
          this.managerOptions = []
        }
      } catch (error) {
        console.error('加载直属上级数据失败:', error)

        // 使用统一的错误消息提取方法
        const errorMessage = this.extractErrorMessage(error, '加载直属上级数据失败')

        // 显示错误提示（使用较温和的警告而不是错误，因为这不会阻止用户使用其他功能）
        this.$message.warning(`${errorMessage}，直属上级选择功能暂时不可用`)

        // 设置空的直属上级选项
        this.managerOptions = []
      } finally {
        this.managerLoading = false
      }
    },

    // 确认密码验证
    validatePasswordConfirm(rule, value, callback) {
      // 直接从DOM获取密码输入框的值，确保获取最新值
      let currentPassword = ''

      // 尝试从EnhancedForm的formModel获取
      if (this.$refs.enhancedForm && this.$refs.enhancedForm.formModel) {
        currentPassword = this.$refs.enhancedForm.formModel.password || ''
      }

      // 如果EnhancedForm还没有准备好，尝试从formData获取
      if (!currentPassword && this.formData) {
        currentPassword = this.formData.password || ''
      }

      // 如果确认密码为空，不进行验证（由required规则处理）
      if (!value) {
        callback()
        return
      }

      if (value !== currentPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },

    // 验证入职日期
    validateHireDate(rule, value, callback) {
      if (!value) {
        callback()
        return
      }

      const hireDate = new Date(value)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // 设置为今天的最后一毫秒

      if (hireDate > today) {
        callback(new Error('入职日期不能是未来日期'))
      } else {
        callback()
      }
    },

    // 验证出生日期
    validateBirthDate(rule, value, callback) {
      if (!value) {
        callback()
        return
      }

      const birthDate = new Date(value)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      let realAge = age
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        realAge--
      }

      if (realAge < 16) {
        callback(new Error('年龄不能小于16岁'))
      } else if (realAge > 100) {
        callback(new Error('年龄不能大于100岁'))
      } else {
        callback()
      }
    }

  }
}
</script>

<style lang="scss" scoped>
.form-section {
    margin-bottom: 30px;

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e4e7ed;
    }
}

.field-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.4;
}

::v-deep .el-form-item__label {
    font-weight: 500;
}

::v-deep .el-textarea__inner {
    font-family: inherit;
}

::v-deep .el-radio {
    margin-right: 20px;
}

::v-deep .el-select .el-select__tags {
    max-width: calc(100% - 30px);
}

// 下拉框选项内容样式
.option-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-height: 20px;

    .option-label {
        flex: 1;
        margin-right: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
    }

    .option-extra {
        flex-shrink: 0;
        color: #8492a6;
        font-size: 12px;
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: right;
    }
}

// 针对Element UI的下拉选项进行样式优化
::v-deep .el-select-dropdown__item {
    padding: 8px 20px;
    height: auto;
    line-height: 1.4;

    .option-content {
        min-height: 24px;
    }
}

// 确保多选标签不会过长
::v-deep .el-tag {
    max-width: 150px;

    .el-tag__text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

// 错误消息样式
.error-message {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon-warning {
        color: #f56c6c;
        font-size: 16px;
        flex-shrink: 0;
    }

    span {
        flex: 1;
        font-weight: 500;
    }

    .el-button {
        color: #f56c6c;
        padding: 0;
        min-height: auto;

        &:hover {
            color: #f78989;
        }

        .el-icon-close {
            font-size: 14px;
        }
    }
}
</style>
