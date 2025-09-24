/**
* 角色表单抽屉组件
* 功能描述：提供角色新增、编辑、查看、复制功能，使用BaseDrawer+EnhancedForm组合
* 创建日期：2024-01-20
* 修改记录：
* - 2024-01-20: 初始创建，实现基础表单功能
* - 2024-12-24: 重构使用EnhancedForm组件，遵循现代前端开发范式
*/
<template>
  <base-drawer :visible.sync="drawerVisible" :title="drawerTitle" width="700px" :wrapper-closable="false"
    @open="handleDrawerOpen" @close="handleDrawerClose">
    <!-- 表单内容 -->
    <enhanced-form ref="enhancedForm" :data="formData" :mode="innerMode" :rules="formRules" label-width="120px"
      :show-footer="false" :clear-validate-on-data-update="true" :disable-initial-validation="true"
      :validate-on-data-change="false" @submit="handleFormSubmit" @validate="handleCustomValidate"
      @validate-error="handleValidateError" @reset="handleFormReset">
      <!-- 表单内容 -->
      <template v-slot="{ form, mode: formMode }">
        <!-- 一、基础信息 -->
        <div class="form-section">
          <div class="section-title">一、基础信息</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="角色名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入角色名称（1-100字符）" maxlength="100" show-word-limit
                  :disabled="formMode === 'view'" clearable />
                <div class="field-hint">
                  角色名称支持中文、英文、数字、空格、括号
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="角色编码" prop="code">
                <el-input v-model="form.code" placeholder="请输入角色编码（1-50字符）" maxlength="50" show-word-limit
                  :disabled="isFieldDisabled('code')" clearable />
                <div class="field-hint">
                  角色编码只能包含字母、数字、下划线、中划线，不能以数字、下划线或中划线开头或结尾
                  <span v-if="innerMode === 'update' && isSystemRole" class="field-hint-warning">（系统角色编码不可修改）</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="角色类型" prop="type">
                <el-select v-model="form.type" placeholder="请选择角色类型" style="width: 100%"
                  :disabled="isFieldDisabled('type')">
                  <el-option v-for="option in typeOptions" :key="option.value" :label="option.label"
                    :value="option.value" :disabled="option.value === 'system'" />
                </el-select>
                <div class="field-hint">
                  系统角色由系统预置，用户只能创建自定义角色
                  <span v-if="innerMode === 'update' && isSystemRole" class="field-hint-warning">（系统角色类型不可修改）</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="角色级别" prop="level">
                <el-select v-model="form.level" placeholder="请选择角色级别（1-999）" style="width: 100%"
                  :disabled="isFieldDisabled('level')">
                  <el-option v-for="level in levelOptions" :key="level.value" :label="level.label"
                    :value="level.value" />
                </el-select>
                <div class="field-hint">
                  角色级别用于权限层级控制，数字越小级别越高
                  <span v-if="innerMode === 'update' && isSystemRole" class="field-hint-warning">（系统角色级别不可修改）</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="角色状态" prop="status">
                <el-radio-group v-model="form.status" :disabled="formMode === 'view'">
                  <el-radio label="active">启用</el-radio>
                  <el-radio label="inactive">禁用</el-radio>
                </el-radio-group>
                <div class="field-hint">
                  启用状态的角色可以分配给用户，禁用状态的角色不能分配给新用户
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="默认角色" prop="isDefault">
                <el-switch v-model="form.isDefault" :disabled="formMode === 'view'" active-text="是" inactive-text="否" />
                <div class="field-hint">
                  默认角色会在新用户注册时自动分配
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 二、详细信息 -->
        <div class="form-section">
          <div class="section-title">二、详细信息</div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="角色描述" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入角色描述（最大1000字符）"
                  maxlength="1000" show-word-limit :disabled="formMode === 'view'" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 三、复制配置（复制模式专用） -->
        <div v-if="isCopyMode" class="form-section">
          <div class="section-title">三、复制配置</div>
          <el-row>
            <el-col :span="24">
              <el-form-item label="复制权限配置" prop="copyPermissions">
                <el-switch v-model="form.copyPermissions" active-text="是" inactive-text="否" />
                <div class="field-hint">
                  是否同时复制原角色的权限配置
                </div>
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
        {{ innerMode === 'create' ? '确认保存' : innerMode === 'copy' ? '复制创建' : '保存修改' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import { createRole, updateRole, copyRole, getRoleById } from '../api'
import { ROLE_LEVEL_OPTIONS, ROLE_TYPE_OPTIONS, FORM_RULES, ROLE_TYPES } from '../constants'

export default {
  name: 'RoleFormDrawer',
  components: {
    BaseDrawer,
    EnhancedForm
  },
  props: {
    // 抽屉可见状态
    visible: {
      type: Boolean,
      default: false
    },
    // 模式：create-新增, update-编辑, view-查看, copy-复制
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update', 'view', 'copy'].includes(value)
    },
    // 角色数据（编辑和查看时使用）
    roleData: {
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
      // 级别选项
      levelOptions: ROLE_LEVEL_OPTIONS,
      // 类型选项
      typeOptions: ROLE_TYPE_OPTIONS
    }
  },
  computed: {
    // 内部模式
    innerMode() {
      return this.mode === 'edit' ? 'update' : this.mode
    },
    // 抽屉标题
    drawerTitle() {
      const titleMap = {
        create: '新增角色',
        update: '编辑角色',
        view: '查看角色',
        copy: '复制角色'
      }
      return titleMap[this.innerMode] || '角色信息'
    },
    // 是否为复制模式
    isCopyMode() {
      return this.mode === 'copy'
    },
    // 表单验证规则
    formRules() {
      return FORM_RULES
    },
    // 是否为系统角色
    isSystemRole() {
      return this.formData.type === ROLE_TYPES.SYSTEM
    },
    // 是否允许编辑
    canEdit() {
      // 新增模式和复制模式总是允许编辑
      if (this.mode === 'create' || this.mode === 'copy') {
        return true
      }
      // 查看模式不允许编辑
      if (this.mode === 'view') {
        return false
      }
      // 编辑模式：系统角色不允许编辑关键字段
      return true
    },
    // 系统角色的字段是否禁用
    isFieldDisabled() {
      return (field) => {
        // 查看模式所有字段都禁用
        if (this.innerMode === 'view') {
          return true
        }

        // 编辑模式下，系统角色的某些关键字段不允许修改
        if (this.innerMode === 'update' && this.isSystemRole) {
          const restrictedFields = ['code', 'type', 'level']
          return restrictedFields.includes(field)
        }

        // 其他情况按默认逻辑处理
        return this.innerMode === 'view'
      }
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
    // 监听角色数据变化
    roleData: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // 只在抽屉未打开时处理数据变化，避免与handleDrawerOpen冲突
        if (newVal && !this.drawerVisible && (this.mode === 'update' || this.mode === 'view' || this.mode === 'copy')) {
          this.formData = this.prepareFormData(newVal)
        }
      }
    }
  },
  created() {
    // EnhancedForm 已内置防抖机制，无需手动创建
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        id: undefined,
        name: '',
        code: '',
        type: 'custom',
        level: 1,
        status: 'active',
        isDefault: false,
        description: '',
        permissions: {},
        copyPermissions: true // 复制模式专用
      }
    },

    // 准备表单数据（编辑、查看、复制模式使用）
    prepareFormData(roleData) {
      const data = {
        ...roleData,
        permissions: roleData.permissions || {},
        copyPermissions: true
      }

      // 复制模式：修改名称和编码
      if (this.mode === 'copy') {
        data.name = `${roleData.name}_副本`
        data.code = `${roleData.code}_copy`
        // 确保复制的角色不是默认角色
        data.isDefault = false
      }

      return data
    },

    // 抽屉打开处理
    async handleDrawerOpen() {
      try {
        // 初始化表单数据
        if (this.mode === 'create') {
          this.formData = this.initFormData()
        } else if (this.roleData) {
          // 对于编辑、查看、复制模式，先使用传入的数据进行快速回填
          this.formData = this.prepareFormData(this.roleData)
          
          // 编辑和查看模式：重新获取最新数据
          if (this.mode === 'update' || this.mode === 'view') {
            this.loading = true
            try {
              const response = await getRoleById(this.roleData.id)
              const latestRoleData = response.data
              this.formData = this.prepareFormData(latestRoleData)
            } catch (error) {
              console.error('获取角色详情失败:', error)
              this.$message.warning('获取最新角色信息失败，使用当前数据')
            } finally {
              this.loading = false
            }
          }
        } else {
          // 如果没有角色数据，说明数据传递有问题
          console.error('roleData 为空，无法进行编辑/查看操作')
          this.$message.error('角色数据获取失败，请重新尝试')
          this.formData = this.initFormData()
        }

        // 由于组件已配置自动清除验证，无需手动处理
      } catch (error) {
        console.error('抽屉打开处理失败:', error)
        this.formData = this.initFormData()
      }
    },

    // 抽屉关闭处理
    handleDrawerClose() {
      // 重置表单数据（组件会自动处理验证清除）
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

        // 准备提交数据，移除不需要的字段
        const submitData = { ...formData }

        // 系统角色编辑限制验证
        if (this.mode === 'update' && this.isSystemRole) {
          // 移除系统角色不允许修改的字段
          delete submitData.code
          delete submitData.type
          delete submitData.level

          // 提示用户系统角色的限制
          this.$message.info('系统角色的编码、类型和级别不可修改')
        }

        // 根据模式处理特殊字段
        if (this.mode === 'copy') {
          // 复制模式保留 copyPermissions 字段
          submitData.copyPermissions = formData.copyPermissions
        } else {
          // 其他模式移除 copyPermissions 字段
          delete submitData.copyPermissions
        }

        if (this.mode === 'create') {
          response = await createRole(submitData)
        } else if (this.mode === 'copy') {
          response = await copyRole(this.roleData.id, submitData)
        } else if (this.mode === 'update') {
          response = await updateRole(this.roleData.id, submitData)
        }

        // 从API响应中获取消息，提供备选默认消息
        const actionText = this.mode === 'create' ? '创建' : this.mode === 'copy' ? '复制创建' : '更新'
        const successMessage = response?.message || `角色${actionText}成功`
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
        console.error('角色保存失败:', error)
        let errorMessage = '操作失败，请稍后重试'

        if (error && error.response && error.response.data) {
          const apiError = error.response.data.error || error.response.data
          if (apiError.code === 'ROLE_CODE_ALREADY_EXISTS') {
            errorMessage = '角色编码已存在，请使用其他编码'
          } else if (apiError.code === 'ROLE_NAME_ALREADY_EXISTS') {
            errorMessage = '角色名称已存在，请使用其他名称'
          } else if (apiError.message) {
            errorMessage = apiError.message
          }
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

  .field-hint-warning {
    color: #e6a23c;
    font-weight: 500;
  }
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
</style>
