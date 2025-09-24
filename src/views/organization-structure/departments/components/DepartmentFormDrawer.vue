/**
* 部门表单抽屉组件
* 功能描述：提供部门新增、编辑和查看功能的表单，使用BaseDrawer+EnhancedForm组合
* 创建日期：2024-01-20
* 修改记录：
* - 2024-01-20: 重构，符合process-management/operations模块的开发范式
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
        <!-- 一、基本信息 -->
        <div class="form-section">
          <div class="section-title">一、基本信息</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="部门名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入部门名称" maxlength="100" show-word-limit
                  :disabled="formMode === 'view'" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="部门编码" prop="code">
                <el-input v-model="form.code" placeholder="请输入部门编码，将自动转为大写" maxlength="50" show-word-limit
                  :disabled="formMode === 'view' || formMode === 'update'" @input="handleCodeInput" />
                <div class="field-hint">
                  部门编码用于系统内部识别，建议使用英文缩写，如：TECH、HR等
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="部门描述" prop="description">
                <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入部门描述（可选）"
                  maxlength="1000" show-word-limit :disabled="formMode === 'view'" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 二、层级关系 -->
        <div class="form-section">
          <div class="section-title">二、层级关系</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="上级部门" prop="parentId">
                <el-select v-model="form.parentId" placeholder="请选择上级部门（可选）" clearable filterable style="width: 100%"
                  :disabled="formMode === 'view'" @change="handleParentChange">
                  <el-option v-for="option in availableParentOptions" :key="option.value" :label="option.label"
                    :value="option.value" :disabled="option.disabled" />
                </el-select>
                <div v-if="form.parentId" class="field-hint">
                  当前部门层级：{{ currentLevel }}
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="排序顺序" prop="sortOrder">
                <el-input-number v-model="form.sortOrder" :min="0" :max="9999" placeholder="排序顺序" style="width: 100%"
                  :disabled="formMode === 'view'" />
                <div class="field-hint">
                  数值越小排序越靠前，用于同级部门的显示顺序
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 三、管理信息 -->
        <div class="form-section">
          <div class="section-title">三、管理信息</div>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="部门经理" prop="managerId">
                <el-select v-model="form.managerId" placeholder="请选择部门经理（可选）" clearable filterable style="width: 100%"
                  :disabled="formMode === 'view'" remote :remote-method="searchManagers" :loading="managerLoading">
                  <el-option v-for="manager in managerOptions" :key="manager.id"
                    :label="`${manager.name} (${manager.email})`" :value="manager.id" />
                </el-select>
                <div class="field-hint">
                  每个用户只能管理一个部门，选择后该用户将成为此部门的负责人
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="部门状态" prop="status">
                <el-radio-group v-model="form.status" :disabled="formMode === 'view'">
                  <el-radio label="active">启用</el-radio>
                  <el-radio label="inactive">禁用</el-radio>
                </el-radio-group>
                <div class="field-hint">
                  禁用的部门将不能分配员工，也不会在选择器中显示
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 四、系统信息（查看模式） -->
        <div v-if="formMode === 'view' && departmentData" class="form-section">
          <div class="section-title">四、系统信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="创建时间">
                <span>{{ formatDateTime(departmentData.createdAt) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间">
                <span>{{ formatDateTime(departmentData.updatedAt) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="departmentData.children && departmentData.children.length > 0">
            <el-col :span="24">
              <el-form-item label="子部门">
                <el-tag v-for="child in departmentData.children" :key="child.id" type="info" size="small"
                  style="margin-right: 8px; margin-bottom: 4px;">
                  {{ child.name }}
                </el-tag>
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
import { createDepartment, updateDepartment } from '../api'
import { formatDateTime } from '@/utils'
import { FORM_RULES } from '../constants'

export default {
  name: 'DepartmentFormDrawer',
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
    // 部门数据（编辑和查看时使用）
    departmentData: {
      type: Object,
      default: null
    },
    // 父部门选项
    parentOptions: {
      type: Array,
      default: () => []
    },
    // 部门经理选项
    managerOptions: {
      type: Array,
      default: () => []
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
      // 经理搜索加载状态
      managerLoading: false,
      // 当前层级
      currentLevel: 1
    }
  },
  computed: {
    // 内部模式
    innerMode() {
      // 统一模式命名：edit -> update
      return this.mode === 'edit' ? 'update' : this.mode
    },
    // 抽屉标题
    drawerTitle() {
      const titleMap = {
        create: '新增部门',
        update: '编辑部门',
        view: '查看部门'
      }
      return titleMap[this.innerMode] || '部门管理'
    },
    // 表单验证规则
    formRules() {
      return FORM_RULES
    },
    // 可用的父部门选项
    availableParentOptions() {
      if (!Array.isArray(this.parentOptions)) {
        return []
      }

      if (!this.departmentData || this.innerMode === 'view') {
        return this.parentOptions
      }

      const invalidIds = new Set([this.departmentData.id, ...this.findDescendantIds(this.departmentData)])

      return this.parentOptions.map(option => ({
        ...option,
        disabled: invalidIds.has(option.value)
      }))
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
    // 监听部门数据变化
    departmentData: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && (this.innerMode === 'update' || this.innerMode === 'view')) {
          this.formData = { ...newVal }
        }
      }
    }
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        id: undefined,
        name: '',
        code: '',
        description: '',
        parentId: '',
        managerId: '',
        sortOrder: 0,
        status: 'active'
      }
    },

    // 抽屉打开处理
    handleDrawerOpen() {
      // 初始化表单数据
      if (this.innerMode === 'create') {
        this.formData = this.initFormData()
      } else if (this.departmentData) {
        this.formData = { ...this.departmentData }
      }

      // 计算当前层级
      this.calculateCurrentLevel()
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
        const payload = this.buildSubmitPayload(formData)

        const response = this.innerMode === 'create'
          ? await createDepartment(payload)
          : await updateDepartment(payload.id, payload)

        const successMessage = response?.message || (this.innerMode === 'create' ? '部门创建成功' : '部门更新成功')
        this.$message.success(successMessage)
        this.$emit('success', { mode: this.innerMode, data: response?.data || payload, continueEdit })

        if (continueEdit) {
          this.formData = this.initFormData()
        } else {
          this.drawerVisible = false
        }
      } catch (error) {
        const message = error?.response?.data?.error?.message || error?.message || '操作失败，请稍后重试'
        this.$message.error(message)
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
      this.calculateCurrentLevel()
    },

    // 处理编码输入
    handleCodeInput(value) {
      // 自动转换为大写
      this.formData.code = value.toUpperCase()
    },

    // 处理父部门变化
    handleParentChange() {
      this.calculateCurrentLevel()
    },

    // 计算当前层级
    calculateCurrentLevel() {
      if (!this.formData.parentId) {
        this.currentLevel = 1
        return
      }

      // 根据父部门计算层级
      const parent = this.parentOptions.find(option => option.value === this.formData.parentId)
      if (parent) {
        this.currentLevel = (parent.level || 0) + 1
      } else {
        this.currentLevel = 1
      }
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      return formatDateTime(dateTime)
    },

    buildSubmitPayload(formData) {
      const payload = {
        ...formData,
        code: formData.code?.toUpperCase() || '',
        parentId: formData.parentId || null,
        managerId: formData.managerId || null
      }

      if (this.innerMode === 'update') {
        payload.id = formData.id || this.departmentData?.id
      }

      return payload
    },

    findDescendantIds(department) {
      const result = []

      const traverse = (node) => {
        if (!node || !Array.isArray(node.children)) {
          return
        }

        node.children.forEach(child => {
          result.push(child.id)
          traverse(child)
        })
      }

      traverse(department)
      return result
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
</style>
