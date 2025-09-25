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
      :validate-on-data-change="false" :loading="formLoading || loading" @submit="handleFormSubmit"
      @validate="handleCustomValidate" @validate-error="handleValidateError" @reset="handleFormReset">
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
                  :disabled="formMode === 'view' || formMode === 'update'"
                  @input="value => handleCodeInput(value, form)" />
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
                  :disabled="formMode === 'view'" remote :remote-method="searchManagers" :loading="managerLoading"
                  :remote-show-suffix="true">
                  <el-option v-for="manager in internalManagerOptions" :key="manager.id || manager.value"
                    :label="getManagerLabel(manager)" :value="manager.value || manager.id" />
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
        <div v-if="formMode === 'view' && effectiveDepartmentData" class="form-section">
          <div class="section-title">四、系统信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="创建时间">
                <span>{{ formatDateTime(effectiveDepartmentData.createdAt) }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="更新时间">
                <span>{{ formatDateTime(effectiveDepartmentData.updatedAt) }}</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="effectiveDepartmentData.children && effectiveDepartmentData.children.length > 0">
            <el-col :span="24">
              <el-form-item label="子部门">
                <el-tag v-for="child in effectiveDepartmentData.children" :key="child.id" type="info" size="small"
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
import { createDepartment, getDepartmentDetail, updateDepartment } from '../api'
import { getUserList } from '@/views/user-management/api/user-management'
import { parseTime } from '@/utils'
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
    // 操作模式：create-新增, update/edit-编辑, view-查看
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view', 'edit'].includes(value)
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
      currentLevel: 1,
      // 部门经理选项（内部维护，避免直接修改prop）
      internalManagerOptions: [],
      // 记录上一次搜索关键词，减少重复请求
      lastManagerQuery: '',
      // 抽屉内部详情加载状态
      formLoading: false,
      // 当前部门详情（最新数据）
      detailData: null
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
    },
    // 有效的部门数据（优先使用详情数据）
    effectiveDepartmentData() {
      return this.detailData || this.departmentData
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
        if (this.innerMode === 'create') {
          return
        }

        if (newVal && (this.innerMode === 'update' || this.innerMode === 'view') && !this.detailData) {
          this.formData = { ...newVal }
        }
      }
    },
    managerOptions: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (!Array.isArray(newVal)) {
          this.internalManagerOptions = []
          return
        }

        this.setInternalManagerOptionsFromProps(newVal)
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
        status: 'active',
        level: 1
      }
    },

    // 抽屉打开处理
    async handleDrawerOpen() {
      // 初始化/重置状态
      this.detailData = null
      this.formLoading = false

      if (this.innerMode === 'create') {
        this.formData = this.initFormData()
        this.calculateCurrentLevel()
        return
      }

      if (!this.departmentData || !this.departmentData.id) {
        this.formData = this.initFormData()
        this.setInternalManagerOptionsFromProps()
        this.calculateCurrentLevel()
        return
      }

      try {
        this.formLoading = true
        const response = await getDepartmentDetail(this.departmentData.id, {
          populate: 'manager,parent,children'
        })

        if (response && response.success && response.data) {
          this.detailData = response.data
          this.formData = { ...response.data }
          if (typeof response.data.level === 'number') {
            this.currentLevel = response.data.level
          }
          this.populateManagerOption(response.data.manager)
        } else {
          this.formData = { ...this.departmentData }
          if (typeof this.departmentData.level === 'number') {
            this.currentLevel = this.departmentData.level
          }
          const fallbackMessage = response?.message || '未获取到最新的部门详情，已使用现有数据'
          this.$message.warning(fallbackMessage)
        }
      } catch (error) {
        console.error('获取部门详情失败:', error)
        this.formData = { ...this.departmentData }
        if (typeof this.departmentData?.level === 'number') {
          this.currentLevel = this.departmentData.level
        }
        const message = error?.response?.data?.error?.message || error?.message || '获取部门详情失败，请稍后重试'
        this.$message.error(message)
      } finally {
        this.ensureCurrentManagerOption()
        this.formLoading = false
        this.calculateCurrentLevel()
      }
    },

    // 抽屉关闭处理
    handleDrawerClose() {
      // 重置表单数据（组件会自动处理验证清除）
      this.formData = this.initFormData()
      this.detailData = null
      this.formLoading = false
      this.lastManagerQuery = ''
      this.setInternalManagerOptionsFromProps()
      this.currentLevel = 1
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
        const targetId = formData.id || this.detailData?.id || this.departmentData?.id

        const response = this.innerMode === 'create'
          ? await createDepartment(payload)
          : await updateDepartment(targetId, payload)

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
      this.detailData = null
      this.lastManagerQuery = ''
      this.setInternalManagerOptionsFromProps()
      this.calculateCurrentLevel()
    },

    // 处理编码输入
    handleCodeInput(value, formInstance) {
      const upperCode = (value || '').toUpperCase()

      if (formInstance) {
        formInstance.code = upperCode
      }
    },

    // 处理父部门变化
    handleParentChange() {
      this.calculateCurrentLevel()
    },

    // 计算当前层级
    calculateCurrentLevel() {
      if (typeof this.formData.level === 'number' && this.formData.level > 0) {
        this.currentLevel = this.formData.level
        return
      }

      if (!this.formData.parentId) {
        this.currentLevel = 1
        this.formData.level = 1
        return
      }

      // 根据父部门计算层级
      const parent = this.parentOptions.find(option => option.value === this.formData.parentId)
      if (parent) {
        const parentLevel = typeof parent.level === 'number' ? parent.level : 0
        this.currentLevel = parentLevel + 1
      } else {
        this.currentLevel = 1
      }

      this.formData.level = this.currentLevel
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}')
    },

    buildSubmitPayload(formData) {
      const {
        name,
        code,
        description,
        parentId,
        managerId,
        sortOrder,
        status,
        level
      } = formData

      const resolvedLevel = typeof level === 'number' && level > 0
        ? level
        : this.currentLevel

      return {
        name: name || '',
        code: code?.toUpperCase() || '',
        description: description || '',
        parentId: parentId || null,
        managerId: managerId || null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        status: status || 'active',
        level: resolvedLevel
      }
    },

    populateManagerOption(manager) {
      const option = this.normalizeManagerOption(manager)
      if (!option) {
        return
      }

      const existsIndex = this.internalManagerOptions.findIndex(item => (item.value || item.id) === option.value)

      if (existsIndex > -1) {
        const updated = {
          ...this.internalManagerOptions[existsIndex],
          ...option
        }
        this.$set(this.internalManagerOptions, existsIndex, updated)
        return
      }

      this.internalManagerOptions = [option, ...this.internalManagerOptions]
    },

    /**
     * 搜索经理候选人
     * @param {string} query - 搜索关键词
     */
    async searchManagers(query) {
      if (!query || query.length < 2) {
        this.managerLoading = false
        this.lastManagerQuery = ''
        const currentOption = this.getCurrentManagerCandidate()
        this.internalManagerOptions = currentOption ? [currentOption] : []
        return
      }

      // 避免重复触发相同搜索
      if (query === this.lastManagerQuery && this.internalManagerOptions.length > 0) {
        return
      }

      this.lastManagerQuery = query
      this.managerLoading = true
      try {
        // 使用用户管理API搜索经理候选人
        const currentOption = this.getCurrentManagerCandidate()
        const response = await getUserList({
          search: query,
          status: 'active',
          limit: 20 // 限制返回数量
        })

        const candidates = this.extractUserResults(response)

        if (Array.isArray(candidates) && candidates.length > 0) {
          let mapped = candidates
            .map(user => this.normalizeManagerOption({
              id: user.id,
              name: user.name || user.username,
              username: user.username,
              email: user.email
            }))
            .filter(Boolean)

          if (currentOption && !mapped.some(item => (item.value || item.id) === currentOption.value)) {
            mapped = [currentOption, ...mapped]
          }

          this.internalManagerOptions = mapped
        } else {
          this.internalManagerOptions = currentOption ? [currentOption] : []
        }
      } catch (error) {
        console.error('搜索经理候选人失败:', error)
        const currentOption = this.getCurrentManagerCandidate()
        this.internalManagerOptions = currentOption ? [currentOption] : []
        // 不显示错误消息，避免影响用户体验
      } finally {
        this.managerLoading = false
      }
    },

    extractUserResults(response) {
      if (!response) {
        return []
      }

      if (Array.isArray(response.data?.results)) {
        return response.data.results
      }

      if (Array.isArray(response.data?.users)) {
        return response.data.users
      }

      if (Array.isArray(response.data)) {
        return response.data
      }

      return []
    },

    setInternalManagerOptionsFromProps(options = this.managerOptions) {
      if (!Array.isArray(options)) {
        this.internalManagerOptions = []
        return
      }

      const normalized = options
        .map(option => this.normalizeManagerOption(option))
        .filter(Boolean)

      this.internalManagerOptions = normalized
      this.ensureCurrentManagerOption()
    },

    normalizeManagerOption(option) {
      if (!option) {
        return null
      }

      const id = option.id || option.value || option.managerId

      if (!id) {
        return null
      }

      const name = option.name || option.realName || option.username || ''
      const email = option.email || option.mail || ''
      const username = option.username || ''
      const value = option.value || id

      return {
        ...option,
        id,
        value,
        name,
        email,
        username,
        label: option.label || this.buildManagerLabel({ id, name, email, username })
      }
    },

    buildManagerLabel({ id, name, email, username } = {}) {
      const displayName = name || username

      if (displayName && email) {
        return `${displayName} (${email})`
      }

      if (displayName) {
        return displayName
      }

      if (email) {
        return email
      }

      return id || ''
    },

    getManagerLabel(manager) {
      if (!manager) {
        return ''
      }

      return manager.label || this.buildManagerLabel(manager)
    },

    getCurrentManagerCandidate() {
      const managerId = this.formData?.managerId || this.detailData?.manager?.id || this.departmentData?.manager?.id

      if (!managerId) {
        return null
      }

      const candidateSources = [
        this.formData?.manager,
        this.detailData?.manager,
        this.departmentData?.manager,
        ...(Array.isArray(this.internalManagerOptions) ? this.internalManagerOptions : []),
        ...(Array.isArray(this.managerOptions) ? this.managerOptions : [])
      ]

      for (const source of candidateSources) {
        const normalized = this.normalizeManagerOption(source)
        if (normalized && (normalized.id === managerId || normalized.value === managerId)) {
          return normalized
        }
      }

      return this.normalizeManagerOption({ id: managerId })
    },

    ensureCurrentManagerOption() {
      const currentOption = this.getCurrentManagerCandidate()

      if (!currentOption) {
        return
      }

      this.populateManagerOption(currentOption)
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
