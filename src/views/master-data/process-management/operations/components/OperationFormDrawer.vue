/**
 * 工序表单抽屉组件
 * 功能描述：提供工序新增、编辑和查看功能的表单，使用BaseDrawer+EnhancedForm组合
 * 创建日期：2024-12-21
 */
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="700px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      size="small"
      :disabled="innerMode === 'view'"
    >
      <!-- 一、基础信息 -->
      <div class="form-section">
        <div class="section-title">一、基础信息</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="工序代码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入工序代码"
                maxlength="30"
                show-word-limit
                :disabled="innerMode === 'update'"
                @blur="handleCodeBlur"
              />
              <div class="field-hint">工序代码必须以大写字母开头，只能包含大写字母、数字和下划线</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="工序名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入工序名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="工序类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="请选择工序类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in operationTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="报告点" prop="reportingPoint">
              <el-select
                v-model="formData.reportingPoint"
                placeholder="请选择报告点"
                style="width: 100%"
              >
                <el-option
                  v-for="option in reportingPointOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio
                  v-for="option in operationStatusOptions"
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

      <!-- 二、详细信息 -->
      <div class="form-section">
        <div class="section-title">二、详细信息</div>
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                placeholder="请输入工序描述"
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="关联资源类型" prop="associatedResourceType">
              <el-select
                v-model="formData.associatedResourceType"
                multiple
                placeholder="请选择关联资源类型"
                style="width: 100%"
                collapse-tags
              >
                <el-option
                  v-for="option in resourceTypeOptions"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
              <div class="field-hint">可选择多个关联资源类型，为空表示不限制资源类型</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

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
import { debounce } from '@/utils'
import {
  createOperation,
  updateOperation,
  checkOperationCode
} from '../api'
import {
  OPERATION_TYPE_OPTIONS,
  OPERATION_STATUS_OPTIONS,
  REPORTING_POINT_OPTIONS
} from '../constants'

export default {
  name: 'OperationFormDrawer',
  components: {
    BaseDrawer
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
    // 工序数据（编辑和查看时使用）
    operationData: {
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
      // 资源类型选项
      resourceTypeOptions: [
        'Rolling Mill',
        'Annealing Furnace',
        'Hardness Tester',
        'Tensile Tester',
        'Slitting Machine',
        'Packing Line',
        'Crane',
        'Transport Equipment'
      ]
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
        create: '新增工序',
        update: '编辑工序',
        view: '查看工序'
      }
      return titleMap[this.mode] || '工序管理'
    },
    // 工序类型选项
    operationTypeOptions() {
      return OPERATION_TYPE_OPTIONS
    },
    // 工序状态选项
    operationStatusOptions() {
      return OPERATION_STATUS_OPTIONS
    },
    // 报告点选项
    reportingPointOptions() {
      return REPORTING_POINT_OPTIONS
    },
    // 表单验证规则
    formRules() {
      return {
        code: [
          { required: true, message: '请输入工序代码', trigger: 'blur' },
          {
            pattern: /^[A-Z][A-Z0-9_]*$/,
            message: '工序代码必须以大写字母开头，只能包含大写字母、数字和下划线',
            trigger: 'blur'
          },
          {
            validator: this.validateCodeUniqueness,
            trigger: 'blur'
          }
        ],
        name: [
          { required: true, message: '请输入工序名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择工序类型', trigger: 'change' }
        ],
        reportingPoint: [
          { required: true, message: '请选择报告点', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
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
    // 监听操作数据变化
    operationData: {
      immediate: true,
      deep: true,
      handler(newVal) {
        if (newVal && (this.mode === 'update' || this.mode === 'view')) {
          this.formData = { ...newVal }
        }
      }
    }
  },
  created() {
    // 创建防抖的代码验证函数
    this.debouncedCheckCode = debounce(this.checkCodeUniqueness, 500)
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        id: undefined,
        code: '',
        name: '',
        type: '',
        description: '',
        reportingPoint: 'End Only',
        associatedResourceType: [],
        status: 'Enabled'
      }
    },

    // 抽屉打开处理
    handleDrawerOpen() {
      // 初始化表单数据
      if (this.mode === 'create') {
        this.formData = this.initFormData()
      } else if (this.operationData) {
        this.formData = { ...this.operationData }
      }

      // 清除验证
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
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
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请检查表单填写是否正确')
          return
        }
        this.handleFormSubmit(this.formData, false)
      })
    },

    // 保存并继续按钮处理
    handleSubmitAndContinue() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请检查表单填写是否正确')
          return
        }
        this.handleFormSubmit(this.formData, true)
      })
    },

    // 业务逻辑：实际的数据提交处理
    async handleFormSubmit(formData, continueEdit = false) {
      try {
        this.loading = true
        let response

        if (this.mode === 'create') {
          response = await createOperation(formData)
        } else if (this.mode === 'update') {
          response = await updateOperation(formData.id, formData)
        }

        // 从API响应中获取消息，提供备选默认消息
        const successMessage = response?.message ||
          (this.mode === 'create' ? '工序创建成功' : '工序更新成功')
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
        console.error('工序保存失败:', error)
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

    // 工序代码失焦处理
    handleCodeBlur() {
      if (this.formData.code && this.mode === 'create') {
        this.debouncedCheckCode(this.formData.code)
      }
    },

    // 工序代码唯一性验证
    validateCodeUniqueness(rule, value, callback) {
      if (!value || this.mode === 'view') {
        callback()
        return
      }

      // 编辑模式下，如果代码未变化，则不需要验证
      if (this.mode === 'update' && this.operationData && value === this.operationData.code) {
        callback()
        return
      }

      // 进行唯一性检查
      this.checkCodeUniqueness(value)
        .then(exists => {
          if (exists) {
            callback(new Error('工序代码已存在，请更换'))
          } else {
            callback()
          }
        })
        .catch(() => {
          // 网络错误时不阻止提交，但给出提示
          callback()
        })
    },

    // 检查工序代码唯一性
    async checkCodeUniqueness(code) {
      try {
        // 这里应该调用实际的API检查接口
        // 暂时使用模拟逻辑
        const response = await checkOperationCode({
          code,
          excludeId: this.mode === 'update' ? this.operationData?.id : undefined
        })
        return response.data.exists
      } catch (error) {
        console.warn('检查工序代码唯一性失败:', error)
        return false
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
</style>
