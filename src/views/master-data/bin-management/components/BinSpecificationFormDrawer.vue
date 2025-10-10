/**
 * 文件名称：BinSpecificationFormDrawer.vue
 * 文件描述：料框规格表单抽屉组件，使用Drawer+el-form实现新增/编辑功能
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，实现P0和P1第6项功能
 *   - 2025-01-09: TASK007-P0 增强表单验证和错误提示
 *   - 2025-01-09: TASK008-P1 集成高级验证规则（规格代码重复性检查、尺寸合理性、产品类型有效性、优化错误提示）
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
    <!-- 表单内容 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      size="small"
      :disabled="innerMode === 'view' || submitLoading"
      :validate-on-rule-change="false"
      :status-icon="true"
    >
      <!-- 一、基础信息 -->
      <div class="form-section">
        <div class="section-title">一、基础信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规格代码" prop="specCode">
              <el-input
                v-model="formData.specCode"
                placeholder="请输入规格代码，如：LK001"
                maxlength="50"
                show-word-limit
                :disabled="innerMode === 'view' || innerMode === 'update'"
                @blur="handleCodeBlur"
              />
              <div class="field-hint">规格代码创建后不可修改，只能包含大写字母、数字和中划线</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格名称" prop="specName">
              <el-input
                v-model="formData.specName"
                placeholder="请输入规格名称"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="材质" prop="material">
              <el-input
                v-model="formData.material"
                placeholder="请输入材质，如：钢材"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="formData.status"
                placeholder="请选择状态"
                style="width: 100%"
                :disabled="innerMode !== 'create'"
              >
                <el-option
                  v-for="option in statusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <div v-if="innerMode !== 'create'" class="field-hint">状态通过专门的启用/禁用操作修改</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 二、尺寸参数 -->
      <div class="form-section">
        <div class="section-title">二、尺寸参数</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="长度 (cm)" prop="length">
              <el-input-number
                v-model="formData.length"
                placeholder="请输入长度"
                :min="0.01"
                :max="10000"
                :precision="2"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宽度 (cm)" prop="width">
              <el-input-number
                v-model="formData.width"
                placeholder="请输入宽度"
                :min="0.01"
                :max="10000"
                :precision="2"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="高度 (cm)" prop="height">
              <el-input-number
                v-model="formData.height"
                placeholder="请输入高度"
                :min="0.01"
                :max="10000"
                :precision="2"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <div class="field-hint field-hint--section">
          请填写料框的长、宽、高尺寸，单位为厘米(cm)，范围0.01-10000cm，最多2位小数
        </div>
      </div>

      <!-- 三、承载参数 -->
      <div class="form-section">
        <div class="section-title">三、承载参数</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最大载重 (kg)" prop="maxLoadCapacity">
              <el-input-number
                v-model="formData.maxLoadCapacity"
                placeholder="请输入最大载重"
                :min="0.01"
                :max="100000"
                :precision="2"
                :step="10"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大堆叠层数" prop="maxStackLayers">
              <el-input-number
                v-model="formData.maxStackLayers"
                placeholder="请输入最大堆叠层数"
                :min="1"
                :max="100"
                :precision="0"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 四、适用产品类型（P1第6项） - 已隐藏 -->
      <div v-if="false" class="form-section">
        <div class="section-title">四、适用产品类型</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="适用产品类型" prop="applicableProductTypes">
              <el-select
                v-model="formData.applicableProductTypes"
                placeholder="请选择适用的产品类型"
                style="width: 100%"
                multiple
                filterable
                collapse-tags
                :collapse-tags-tooltip="true"
                clearable
              >
                <el-option
                  v-for="product in productTypeOptions"
                  :key="product.value"
                  :label="product.label"
                  :value="product.value"
                />
              </el-select>
              <div class="field-hint">可选择多个适用的产品类型，也可留空表示适用于所有产品</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 四、供应商信息 -->
      <div class="form-section">
        <div class="section-title">四、供应商信息</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="供应商信息" prop="supplierInfo">
              <el-input
                v-model="formData.supplierInfo"
                type="textarea"
                :rows="3"
                placeholder="请输入供应商信息（选填，最多500字）"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <!-- 抽屉底部按钮 -->
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        v-if="innerMode !== 'view'"
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        {{ innerMode === 'create' ? '创建' : '更新' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import {
  createFormValidationRules,
  FORM_INITIAL_VALUES,
  SPECIFICATION_STATUS_OPTIONS
} from '../constants'
import {
  createBinSpecification,
  updateBinSpecification,
  getBinSpecificationDetail,
  checkSpecCodeExists,
  validateDimensionRationality,
  validateApplicableProductTypes
} from '../api'

export default {
  name: 'BinSpecificationFormDrawer',
  components: {
    BaseDrawer
  },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view'].includes(value)
    },
    specificationId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      drawerVisible: false,
      innerMode: 'create',
      formData: {
        specCode: '',
        specName: '',
        length: null,
        width: null,
        height: null,
        maxLoadCapacity: null,
        material: '',
        maxStackLayers: null,
        applicableProductTypes: [],
        supplierInfo: '',
        status: '启用'
      },
      submitLoading: false,
      statusOptions: SPECIFICATION_STATUS_OPTIONS,
      productTypeOptions: []
    }
  },
  computed: {
    drawerTitle() {
      const titleMap = {
        create: '新增料框规格',
        update: '编辑料框规格',
        view: '查看料框规格'
      }
      return titleMap[this.innerMode] || '料框规格'
    },
    formRules() {
      // TASK008-P1: 使用高级验证规则工厂函数创建动态验证规则
      return createFormValidationRules({
        checkSpecCodeExists: this.innerMode === 'create' ? checkSpecCodeExists : null,
        currentSpecificationId: this.specificationId,
        validateDimensionRationality,
        validateApplicableProductTypes,
        getFormData: () => this.formData
      })
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val) {
          this.innerMode = this.mode
          this.$nextTick(() => {
            this.initializeForm()
          })
        }
      },
      immediate: true
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    /**
     * 初始化表单数据
     */
    async initializeForm() {
      try {
        if (this.innerMode === 'create') {
          this.formData = this.getDefaultFormData()
        } else if (this.specificationId) {
          await this.loadSpecificationDetail()
        }
        // 清除验证
        await this.$nextTick()
        this.$refs.form && this.$refs.form.clearValidate()
      } catch (error) {
        console.error('初始化表单数据失败:', error)

        // 显示后端返回的错误消息
        const message = error.response?.data?.error?.message || error.message || '获取规格详情失败'
        this.$message.error(message)

        this.handleCancel()
      }
    },

    /**
     * 获取默认表单数据
     */
    getDefaultFormData() {
      return {
        ...FORM_INITIAL_VALUES
      }
    },

    /**
     * 加载规格详情数据
     */
    async loadSpecificationDetail() {
      try {
        const response = await getBinSpecificationDetail(this.specificationId)
        if (response && response.data) {
          this.formData = this.transformApiDataToForm(response.data)
        } else {
          throw new Error('获取规格详情失败：数据为空')
        }
      } catch (error) {
        console.error('加载规格详情失败:', error)
        throw error
      }
    },

    /**
     * 将API数据转换为表单数据
     */
    transformApiDataToForm(apiData) {
      return {
        specCode: apiData.specCode || '',
        specName: apiData.specName || '',
        length: apiData.length ?? null,
        width: apiData.width ?? null,
        height: apiData.height ?? null,
        maxLoadCapacity: apiData.maxLoadCapacity ?? null,
        material: apiData.material || '',
        maxStackLayers: apiData.maxStackLayers ?? null,
        applicableProductTypes: Array.isArray(apiData.applicableProductTypes)
          ? [...apiData.applicableProductTypes]
          : [],
        supplierInfo: apiData.supplierInfo || '',
        status: apiData.status || '启用'
      }
    },

    /**
     * 将表单数据转换为API数据
     */
    transformFormDataToApi(formData) {
      const apiData = {
        specCode: formData.specCode?.trim().toUpperCase() || '',
        specName: formData.specName?.trim() || '',
        length: formData.length,
        width: formData.width,
        height: formData.height,
        maxLoadCapacity: formData.maxLoadCapacity,
        material: formData.material?.trim() || '',
        maxStackLayers: formData.maxStackLayers
      }

      // 可选字段
      if (formData.applicableProductTypes && formData.applicableProductTypes.length > 0) {
        apiData.applicableProductTypes = formData.applicableProductTypes
      }

      if (formData.supplierInfo?.trim()) {
        apiData.supplierInfo = formData.supplierInfo.trim()
      }

      // 新增时可设置状态
      if (this.innerMode === 'create' && formData.status) {
        apiData.status = formData.status
      }

      return apiData
    },

    /**
     * 规格代码输入框失焦处理
     */
    handleCodeBlur() {
      if (this.formData.specCode) {
        this.formData.specCode = this.formData.specCode.trim().toUpperCase()
      }
    },

    /**
     * 抽屉打开事件
     */
    handleDrawerOpen() {
      // 可以在这里加载产品类型选项
      this.loadProductTypeOptions()
    },

    /**
     * 抽屉关闭事件
     */
    handleDrawerClose() {
      this.resetForm()
    },

    /**
     * 加载产品类型选项
     * 注意：这是预留功能，待铝箔产品管理模块完成后实现
     */
    loadProductTypeOptions() {
      // TODO: 从铝箔产品管理API加载产品类型列表
      // 目前使用空数组作为占位
      this.productTypeOptions = []
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$refs.form && this.$refs.form.clearValidate()
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.drawerVisible = false
    },

    /**
     * 提交表单
     * TASK008-P1-10: 优化验证错误提示的用户体验
     */
    async handleSubmit() {
      try {
        // 表单验证
        const valid = await this.$refs.form.validate().catch((error) => {
          // TASK008-P1-10: 改进验证失败的错误提示
          console.log('表单验证失败:', error)

          // 收集所有验证错误
          const errorFields = this.$refs.form.fields.filter(field => field.validateState === 'error')
          const errorCount = errorFields.length

          // 滚动到第一个错误字段
          this.$nextTick(() => {
            const firstError = this.$el.querySelector('.is-error')
            if (firstError) {
              firstError.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              })
            }
          })

          // 显示友好的错误提示
          if (errorCount > 0) {
            const firstErrorField = errorFields[0]
            const fieldLabel = firstErrorField.label || '字段'
            const errorMessage = firstErrorField.validateMessage || '填写有误'

            this.$message({
              type: 'warning',
              message: `${fieldLabel}${errorMessage}，共有${errorCount}个字段需要修正`,
              duration: 3000,
              showClose: true
            })
          } else {
            this.$message.warning('请检查表单填写是否正确')
          }

          return false
        })

        if (!valid) {
          return
        }

        this.submitLoading = true

        // 转换表单数据
        const apiData = this.transformFormDataToApi(this.formData)

        let response
        if (this.innerMode === 'create') {
          response = await createBinSpecification(apiData)
        } else {
          response = await updateBinSpecification(this.specificationId, apiData)
        }

        // 显示后端返回的成功消息
        this.$message.success(response.message || (this.innerMode === 'create' ? '创建成功' : '更新成功'))

        // 触发成功事件（传递完整响应供父组件使用）
        this.$emit('success', response)

        // 关闭抽屉
        this.drawerVisible = false
      } catch (error) {
        console.error('提交表单失败:', error)

        // TASK008-P1-10: 优化错误处理和提示
        const errorData = error.response?.data?.error
        let message = ''

        if (errorData) {
          // 使用后端返回的错误消息
          message = errorData.message

          // 如果是字段验证错误，显示具体字段信息
          if (errorData.details?.field) {
            const fieldLabel = this.getFieldLabel(errorData.details.field)
            message = `${fieldLabel}：${message}`
          }
        } else {
          // 默认错误消息
          message = error.message || (this.innerMode === 'create' ? '创建失败' : '更新失败')
        }

        this.$message({
          type: 'error',
          message,
          duration: 5000,
          showClose: true
        })
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 获取字段的中文标签（用于错误提示优化）
     * TASK008-P1-10: 优化验证错误提示的用户体验
     */
    getFieldLabel(fieldName) {
      const labelMap = {
        specCode: '规格代码',
        specName: '规格名称',
        length: '长度',
        width: '宽度',
        height: '高度',
        maxLoadCapacity: '最大载重',
        material: '材质',
        maxStackLayers: '最大堆叠层数',
        applicableProductTypes: '适用产品类型',
        supplierInfo: '供应商信息',
        status: '状态'
      }
      return labelMap[fieldName] || fieldName
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
  }
}

.field-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;

  &--section {
    margin-top: 8px;
    padding: 8px 12px;
    background: #ecf5ff;
    border-radius: 4px;
    color: #409eff;
  }
}

::v-deep {
  .el-form-item {
    margin-bottom: 16px;
  }

  .el-form-item__label {
    font-weight: 500;
  }

  .el-input-number {
    .el-input__inner {
      text-align: left;
    }
  }
}
</style>

