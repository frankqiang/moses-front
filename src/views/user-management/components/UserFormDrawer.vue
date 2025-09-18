/**
 * 用户表单抽屉组件
 * 功能描述：提供用户新增、编辑和查看功能的表单，使用BaseDrawer+EnhancedForm组合
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 重构为现代化组件架构，参考OperationFormDrawer实现
 */
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="800px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 表单内容 -->
    <enhanced-form
      ref="enhancedForm"
      :data="formData"
      :mode="innerMode"
      :rules="formRules"
      label-width="120px"
      :show-footer="false"
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
                  @blur="handleUsernameBlur"
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
                  @blur="handleEmailBlur"
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

          <el-row :gutter="20" v-if="formMode === 'create'">
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

        <!-- 二、部门岗位信息 -->
        <div class="form-section">
          <div class="section-title">二、部门岗位信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="工号" prop="employeeId">
                <el-input
                  v-model="form.employeeId"
                  placeholder="请输入工号"
                  maxlength="30"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职位" prop="jobTitle">
                <el-input
                  v-model="form.jobTitle"
                  placeholder="请输入职位"
                  maxlength="50"
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="所属部门" prop="departmentId">
                <el-select
                  v-model="form.departmentId"
                  placeholder="请选择部门"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                >
                  <el-option
                    v-for="option in departmentOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
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
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 三、角色权限 -->
        <div class="form-section">
          <div class="section-title">三、角色权限</div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="分配角色" prop="roleIds">
                <el-select
                  v-model="form.roleIds"
                  multiple
                  placeholder="请选择用户角色"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                  collapse-tags
                >
                  <el-option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  >
                    <span style="float: left">{{ option.label }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ option.description }}</span>
                  </el-option>
                </el-select>
                <div class="field-hint">可选择多个角色，用户权限为所有角色权限的并集</div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 四、备注信息 -->
        <div class="form-section">
          <div class="section-title">四、备注信息</div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="form.remark"
                  type="textarea"
                  placeholder="请输入备注信息"
                  :rows="3"
                  maxlength="200"
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
      <el-button
        v-if="innerMode === 'create'"
        type="primary"
        :loading="loading"
        @click="handleSubmitAndContinue"
      >
        保存并继续
      </el-button>
      <el-button
        v-if="innerMode !== 'view'"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ innerMode === 'create' ? '确认保存' : '保存修改' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import { debounce } from '@/utils'
import {
  createUser, // eslint-disable-line no-unused-vars
  updateUser, // eslint-disable-line no-unused-vars
  checkUsernameAvailable,
  checkEmailAvailable,
  getDepartmentList,
  getRoleList
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
      // 部门选项
      departmentOptions: [],
      // 角色选项
      roleOptions: []
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
    // 性别选项
    genderOptions() {
      return GENDER_OPTIONS
    },
    // 用户状态选项
    userStatusOptions() {
      return USER_STATUS_OPTIONS
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
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
          {
            validator: this.validateUsernameUniqueness,
            trigger: 'blur'
          }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
          {
            validator: this.validateEmailUniqueness,
            trigger: 'blur'
          }
        ],
        phone: [
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
        ],
        status: [
          { required: true, message: '请选择用户状态', trigger: 'change' }
        ]
      }

      // 新增用户时添加密码验证
      if (this.mode === 'create') {
        rules.password = [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,50}$/,
            message: '密码必须包含大小写字母和数字，长度8-50位',
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
    // 创建防抖的验证函数
    this.debouncedCheckUsername = debounce(this.checkUsernameUniqueness, 500)
    this.debouncedCheckEmail = debounce(this.checkEmailUniqueness, 500)
    
    // 加载选项数据
    this.loadDepartmentOptions()
    this.loadRoleOptions()
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        id: undefined,
        username: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: '',
        status: 'active',
        employeeId: '',
        jobTitle: '',
        departmentId: '',
        hireDate: '',
        roleIds: [],
        remark: ''
      }
    },

    // 抽屉打开处理
    handleDrawerOpen() {
      // 初始化表单数据
      if (this.mode === 'create') {
        this.formData = this.initFormData()
      } else if (this.userData) {
        this.formData = { ...this.initFormData(), ...this.userData }
      }
    },

    // 抽屉关闭处理
    handleDrawerClose() {
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
        this.loading = true
        let response

        if (this.mode === 'create') {
          // 移除确认密码字段
          const { confirmPassword, ...submitData } = formData
          response = await createUser(submitData)
        } else if (this.mode === 'update') {
          // 移除密码相关字段
          const { password, confirmPassword, ...submitData } = formData
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
        let errorMessage = '操作失败，请稍后重试'

        if (error && error.response && error.response.data) {
          errorMessage = error.response.data.message || error.response.data.error?.message || errorMessage
        } else if (error && error.message) {
          errorMessage = error.message
        }

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
      // 聚焦到第一个错误字段
      this.$nextTick(() => {
        const firstErrorField = Object.keys(invalidFields)[0]
        if (firstErrorField && this.$refs.enhancedForm && this.$refs.enhancedForm.$el) {
          const fieldElement = this.$refs.enhancedForm.$el.querySelector(`[prop="${firstErrorField}"] input, [prop="${firstErrorField}"] textarea`)
          if (fieldElement) {
            fieldElement.focus()
          }
        }
      })
    },

    // 表单重置处理
    handleFormReset() {
      this.formData = this.initFormData()
    },

    // 用户名失焦处理
    handleUsernameBlur() {
      if (this.formData.username && this.mode === 'create') {
        this.debouncedCheckUsername(this.formData.username)
      }
    },

    // 邮箱失焦处理
    handleEmailBlur() {
      if (this.formData.email) {
        this.debouncedCheckEmail(this.formData.email)
      }
    },

    // 用户名唯一性验证
    validateUsernameUniqueness(rule, value, callback) {
      if (!value || this.mode === 'view') {
        callback()
        return
      }

      // 编辑模式下，如果用户名未变化，则不需要验证
      if (this.mode === 'update' && this.userData && value === this.userData.username) {
        callback()
        return
      }

      // 进行唯一性检查
      this.checkUsernameUniqueness(value)
        .then(exists => {
          if (exists) {
            callback(new Error('用户名已存在，请更换'))
          } else {
            callback()
          }
        })
        .catch(() => {
          // 网络错误时不阻止提交，但给出提示
          callback()
        })
    },

    // 邮箱唯一性验证
    validateEmailUniqueness(rule, value, callback) {
      if (!value || this.mode === 'view') {
        callback()
        return
      }

      // 编辑模式下，如果邮箱未变化，则不需要验证
      if (this.mode === 'update' && this.userData && value === this.userData.email) {
        callback()
        return
      }

      // 进行唯一性检查
      this.checkEmailUniqueness(value)
        .then(exists => {
          if (exists) {
            callback(new Error('邮箱已存在，请更换'))
          } else {
            callback()
          }
        })
        .catch(() => {
          // 网络错误时不阻止提交，但给出提示
          callback()
        })
    },

    // 确认密码验证
    validatePasswordConfirm(rule, value, callback) {
      if (value !== this.formData.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },

    // 检查用户名唯一性
    async checkUsernameUniqueness(username) {
      try {
        const response = await checkUsernameAvailable(username)
        return !response.data.available
      } catch (error) {
        console.warn('检查用户名唯一性失败:', error)
        return false
      }
    },

    // 检查邮箱唯一性
    async checkEmailUniqueness(email) {
      try {
        const response = await checkEmailAvailable(email)
        return !response.data.available
      } catch (error) {
        console.warn('检查邮箱唯一性失败:', error)
        return false
      }
    },

    // 加载部门选项
    async loadDepartmentOptions() {
      try {
        const response = await getDepartmentList()
        if (response.success) {
          this.departmentOptions = response.data.map(item => ({
            value: item.id,
            label: item.name
          }))
        }
      } catch (error) {
        console.warn('加载部门列表失败:', error)
        // 使用默认选项
        this.departmentOptions = [
          { value: 'tech', label: '技术部' },
          { value: 'product', label: '产品部' },
          { value: 'operation', label: '运营部' },
          { value: 'hr', label: '人事部' }
        ]
      }
    },

    // 加载角色选项
    async loadRoleOptions() {
      try {
        const response = await getRoleList()
        if (response.success) {
          this.roleOptions = response.data.map(item => ({
            value: item.id,
            label: item.name,
            description: item.description || '暂无描述'
          }))
        }
      } catch (error) {
        console.warn('加载角色列表失败:', error)
        // 使用默认选项
        this.roleOptions = [
          { value: 'admin', label: '管理员', description: '系统管理员' },
          { value: 'user', label: '普通用户', description: '普通系统用户' },
          { value: 'guest', label: '访客', description: '只读权限用户' }
        ]
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
</style>
