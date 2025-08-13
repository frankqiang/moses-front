/**
 * 检验项目表单抽屉组件
 * 功能描述：提供检验项目的新增、编辑、查看功能
 * 创建日期：2024-12-19
 */
<template>
  <drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :width="'800px'"
    :before-close="handleClose"
  >
    <el-form
      ref="inspectionItemForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      :disabled="mode === 'view'"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验项目编码" prop="code">
              <el-input
                v-model="formData.code"
                placeholder="请输入检验项目编码"
                :disabled="mode === 'update'"
                @blur="handleCodeBlur"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="检验项目名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入检验项目名称"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验类别" prop="category">
              <el-select
                v-model="formData.category"
                placeholder="请选择检验类别"
                style="width: 100%"
              >
                <el-option
                  v-for="option in categoryOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据类型" prop="dataType">
              <el-select
                v-model="formData.dataType"
                placeholder="请选择数据类型"
                style="width: 100%"
                @change="handleDataTypeChange"
              >
                <el-option
                  v-for="option in dataTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="检验方法" prop="inspectionMethod">
              <el-select
                v-model="formData.inspectionMethod"
                placeholder="请选择检验方法"
                style="width: 100%"
              >
                <el-option
                  v-for="option in methodOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用产品" prop="applicableProduct">
              <el-select
                v-model="formData.applicableProduct"
                placeholder="请选择适用产品"
                style="width: 100%"
              >
                <el-option
                  v-for="option in productOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input
                v-model="formData.unit"
                placeholder="请输入单位（如：mm、%、MPa等）"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="formData.status"
                placeholder="请选择状态"
                style="width: 100%"
              >
                <el-option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 检验标准 -->
      <div class="form-section">
        <div class="section-title">检验标准</div>
        
        <el-row :gutter="20" v-if="showStandardFields">
          <el-col :span="12">
            <el-form-item label="标准值" prop="standardValue">
              <el-input
                v-model="formData.standardValue"
                placeholder="请输入标准值"
                :type="isNumericType ? 'number' : 'text'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公差范围" prop="toleranceRange">
              <el-input
                v-model="formData.toleranceRange"
                placeholder="请输入公差范围（如：±0.1、0.5-1.5）"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="showRangeFields">
          <el-col :span="12">
            <el-form-item label="最小值" prop="minValue">
              <el-input
                v-model="formData.minValue"
                placeholder="请输入最小值"
                type="number"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大值" prop="maxValue">
              <el-input
                v-model="formData.maxValue"
                placeholder="请输入最大值"
                type="number"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="showEnumOptions">
          <el-col :span="24">
            <el-form-item label="枚举选项" prop="enumOptions">
              <el-input
                v-model="formData.enumOptions"
                type="textarea"
                :rows="3"
                placeholder="请输入枚举选项，每行一个选项"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 其他信息 -->
      <div class="form-section">
        <div class="section-title">其他信息</div>
        
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入检验项目描述"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <!-- 底部按钮 -->
    <div slot="footer" class="drawer-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ mode === 'create' ? '创建' : '更新' }}
      </el-button>
    </div>
  </drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import {
  INSPECTION_CATEGORY_OPTIONS,
  DATA_TYPE_OPTIONS,
  INSPECTION_METHOD_OPTIONS,
  APPLICABLE_PRODUCT_OPTIONS,
  INSPECTION_ITEM_STATUS_OPTIONS
} from '../constants'
import {
  createInspectionItem,
  updateInspectionItem,
  checkInspectionItemCode
} from '../api'

export default {
  name: 'InspectionItemFormDrawer',
  components: {
    Drawer
  },
  props: {
    // 抽屉可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 模式：create-新增, update-编辑, view-查看
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update', 'view'].includes(value)
    },
    // 检验项目数据（编辑和查看时使用）
    inspectionItemData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 抽屉可见性（内部状态）
      drawerVisible: this.visible,
      // 提交加载状态
      submitLoading: false,
      // 表单数据
      formData: {
        code: '',
        name: '',
        category: '',
        dataType: '',
        inspectionMethod: '',
        applicableProduct: '',
        unit: '',
        status: 'Active',
        standardValue: '',
        toleranceRange: '',
        minValue: '',
        maxValue: '',
        enumOptions: '',
        description: '',
        remark: ''
      },
      // 表单校验规则
      formRules: {
        code: [
          { required: true, message: '请输入检验项目编码', trigger: 'blur' },
          { min: 2, max: 50, message: '编码长度在 2 到 50 个字符', trigger: 'blur' },
          { pattern: /^[A-Z0-9_-]+$/, message: '编码只能包含大写字母、数字、下划线和横线', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入检验项目名称', trigger: 'blur' },
          { min: 2, max: 100, message: '名称长度在 2 到 100 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择检验类别', trigger: 'change' }
        ],
        dataType: [
          { required: true, message: '请选择数据类型', trigger: 'change' }
        ],
        inspectionMethod: [
          { required: true, message: '请选择检验方法', trigger: 'change' }
        ],
        applicableProduct: [
          { required: true, message: '请选择适用产品', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      },
      // 选项数据
      categoryOptions: INSPECTION_CATEGORY_OPTIONS,
      dataTypeOptions: DATA_TYPE_OPTIONS,
      methodOptions: INSPECTION_METHOD_OPTIONS,
      productOptions: APPLICABLE_PRODUCT_OPTIONS,
      statusOptions: INSPECTION_ITEM_STATUS_OPTIONS
    }
  },
  computed: {
    // 抽屉标题
    drawerTitle() {
      const titleMap = {
        create: '新增检验项目',
        update: '编辑检验项目',
        view: '查看检验项目'
      }
      return titleMap[this.mode] || '检验项目'
    },
    // 是否显示标准字段
    showStandardFields() {
      return ['Numeric', 'Text'].includes(this.formData.dataType)
    },
    // 是否显示范围字段
    showRangeFields() {
      return this.formData.dataType === 'Range'
    },
    // 是否显示枚举选项
    showEnumOptions() {
      return this.formData.dataType === 'Enum'
    },
    // 是否为数值类型
    isNumericType() {
      return ['Numeric', 'Range'].includes(this.formData.dataType)
    }
  },
  watch: {
    // 监听可见性变化
    visible(newVal) {
      this.drawerVisible = newVal
      if (newVal) {
        this.initFormData()
      }
    },
    // 监听抽屉可见性变化
    drawerVisible(newVal) {
      this.$emit('update:visible', newVal)
    },
    // 监听检验项目数据变化
    inspectionItemData: {
      handler() {
        if (this.visible) {
          this.initFormData()
        }
      },
      deep: true
    }
  },
  methods: {
    /**
     * 初始化表单数据
     */
    initFormData() {
      if (this.mode === 'create') {
        // 新增模式：重置表单
        this.resetFormData()
      } else if (this.inspectionItemData) {
        // 编辑/查看模式：填充数据
        this.formData = {
          ...this.formData,
          ...this.inspectionItemData
        }
      }
      
      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.inspectionItemForm) {
          this.$refs.inspectionItemForm.clearValidate()
        }
      })
    },

    /**
     * 重置表单数据
     */
    resetFormData() {
      this.formData = {
        code: '',
        name: '',
        category: '',
        dataType: '',
        inspectionMethod: '',
        applicableProduct: '',
        unit: '',
        status: 'Active',
        standardValue: '',
        toleranceRange: '',
        minValue: '',
        maxValue: '',
        enumOptions: '',
        description: '',
        remark: ''
      }
    },

    /**
     * 处理数据类型变化
     */
    handleDataTypeChange(dataType) {
      // 清空相关字段
      this.formData.standardValue = ''
      this.formData.toleranceRange = ''
      this.formData.minValue = ''
      this.formData.maxValue = ''
      this.formData.enumOptions = ''
    },

    /**
     * 处理编码失焦事件
     */
    async handleCodeBlur() {
      if (this.mode === 'create' && this.formData.code) {
        try {
          const response = await checkInspectionItemCode({
            code: this.formData.code
          })
          if (!response.data.available) {
            this.$message.warning('该编码已存在，请使用其他编码')
          }
        } catch (error) {
          console.error('检查编码失败:', error)
        }
      }
    },

    /**
     * 处理提交
     */
    async handleSubmit() {
      try {
        // 表单验证
        const valid = await this.$refs.inspectionItemForm.validate()
        if (!valid) {
          return
        }

        this.submitLoading = true

        // 准备提交数据
        const submitData = { ...this.formData }
        
        // 根据数据类型处理特殊字段
        if (this.formData.dataType === 'Enum' && this.formData.enumOptions) {
          // 将枚举选项转换为数组
          submitData.enumOptions = this.formData.enumOptions
            .split('\n')
            .map(option => option.trim())
            .filter(option => option)
        }

        let response
        if (this.mode === 'create') {
          response = await createInspectionItem(submitData)
        } else {
          response = await updateInspectionItem(this.formData.id, submitData)
        }

        this.$message.success(response.message || `${this.mode === 'create' ? '创建' : '更新'}成功`)
        this.$emit('success', response.data)
        this.handleClose()
      } catch (error) {
        console.error('提交失败:', error)
        const errorMessage = error.response?.data?.message || error.message || '操作失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 处理关闭
     */
    handleClose() {
      this.drawerVisible = false
      this.$emit('close')
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

.drawer-footer {
  text-align: right;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-textarea__inner {
  resize: vertical;
}
</style>