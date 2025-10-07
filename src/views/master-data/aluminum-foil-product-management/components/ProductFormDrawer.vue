/**
 * 铝箔产品表单抽屉组件
 * 功能描述：提供铝箔产品新增、编辑和查看功能的表单，使用BaseDrawer+EnhancedForm组合
 * 创建日期：2024-12-28
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
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      size="small"
      :disabled="innerMode === 'view'"
    >
      <!-- 一、基础信息 -->
      <div class="form-section">
        <div class="section-title">一、基础信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品编码" prop="productCode">
              <el-input
                v-model="formData.productCode"
                placeholder="如：AF-1100-H18-0.006x1200"
                maxlength="50"
                show-word-limit
                :disabled="innerMode === 'view' || innerMode === 'update'"
                @blur="handleCodeBlur"
              />
              <div class="field-hint">产品编码创建后不可修改，格式：AF-合金-硬度-厚度x宽度</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input
                v-model="formData.productName"
                placeholder="请输入产品名称"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原材料类型" prop="rawMaterialType">
              <el-input
                v-model="formData.rawMaterialType"
                placeholder="请输入原材料类型"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生命周期状态" prop="lifecycleStatus">
              <el-select
                v-model="formData.lifecycleStatus"
                placeholder="请选择生命周期状态"
                style="width: 100%"
              >
                <el-option
                  v-for="option in lifecycleStatusOptions"
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
            <el-form-item label="合金牌号" prop="alloyGrade">
              <el-input
                v-model="formData.alloyGrade"
                placeholder="请输入合金牌号"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态/硬度" prop="temper">
              <el-input
                v-model="formData.temper"
                placeholder="请输入状态或硬度"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 二、规格参数 -->
      <div class="form-section">
        <div class="section-title">二、规格参数</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="厚度 (mm)" prop="thickness">
              <el-input-number
                v-model="formData.thickness"
                placeholder="请输入厚度"
                :min="0.001"
                :max="100"
                :precision="6"
                :step="0.001"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="宽度 (mm)" prop="width">
              <el-input-number
                v-model="formData.width"
                placeholder="请输入宽度"
                :min="1"
                :max="10000"
                :precision="3"
                :step="1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位重量" prop="unitWeight">
              <el-input-number
                v-model="formData.unitWeight"
                placeholder="请输入单位重量"
                :min="0.001"
                :max="10000"
                :precision="6"
                :step="0.1"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位重量类型" prop="unitWeightType">
              <el-select
                v-model="formData.unitWeightType"
                placeholder="请选择单位重量类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in unitWeightTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 三、工艺配置 -->
      <div class="form-section">
        <div class="section-title">三、工艺配置</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="工艺模板" prop="processTemplateIds">
              <el-select
                v-model="formData.processTemplateIds"
                placeholder="请选择工艺模板"
                style="width: 100%"
                multiple
                filterable
                collapse-tags
                :collapse-tags-tooltip="true"
              >
                <el-option
                  v-for="template in processTemplateOptions"
                  :key="template.value"
                  :label="template.label"
                  :value="template.value"
                />
              </el-select>
              <div class="field-hint">可选择多个工艺模板，用于生产指导</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 四、质量标准 -->
      <div class="form-section">
        <div class="section-title">四、质量标准</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="质量标准" prop="qualityStandardId">
              <el-select
                v-model="formData.qualityStandardId"
                placeholder="请选择质量标准"
                style="width: 100%"
                filterable
                clearable
              >
                <el-option
                  v-for="standard in qualityStandardOptions"
                  :key="standard.value"
                  :label="standard.label"
                  :value="standard.value"
                />
              </el-select>
              <div class="field-hint">选择适用的质量检验标准</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 五、产品描述 -->
      <div class="form-section">
        <div class="section-title">五、产品描述</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="产品描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入产品描述（选填，最多500字）"
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
  FORM_CONFIGS,
  LIFECYCLE_STATUS_OPTIONS,
  UNIT_WEIGHT_TYPE_OPTIONS,
  PROCESS_TEMPLATE_OPTIONS,
  QUALITY_STANDARD_OPTIONS
} from '../constants'
import { createProduct, updateProduct, getProductDetail } from '../api'

export default {
  name: 'ProductFormDrawer',
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
    productId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      drawerVisible: false,
      innerMode: 'create',
      formData: {
        productCode: '',
        productName: '',
        rawMaterialType: '',
        alloyGrade: '',
        temper: '',
        thickness: null,
        width: null,
        unitWeight: null,
        unitWeightType: 'kg/卷',
        processTemplateIds: [],
        qualityStandardId: null,
        lifecycleStatus: '试产',
        description: ''
      },
      submitLoading: false,
      lifecycleStatusOptions: LIFECYCLE_STATUS_OPTIONS,
      unitWeightTypeOptions: UNIT_WEIGHT_TYPE_OPTIONS,
      processTemplateOptions: PROCESS_TEMPLATE_OPTIONS,
      qualityStandardOptions: QUALITY_STANDARD_OPTIONS
    }
  },
  computed: {
    drawerTitle() {
      const titleMap = {
        create: '新增铝箔产品',
        update: '编辑铝箔产品',
        view: '查看铝箔产品'
      }
      return titleMap[this.innerMode] || '铝箔产品'
    },
    formRules() {
      return FORM_CONFIGS[this.innerMode] || FORM_CONFIGS.create
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
        } else if (this.productId) {
          const response = await getProductDetail(this.productId)
          this.formData = this.transformApiDataToForm(response.data)
        }
        // 清除验证
        await this.$nextTick()
        this.$refs.form && this.$refs.form.clearValidate()
      } catch (error) {
        console.error('初始化表单数据失败:', error)
        this.$message.error('获取产品详情失败')
        this.handleCancel()
      }
    },

    /**
     * 获取默认表单数据
     */
    getDefaultFormData() {
      return {
        productCode: '',
        productName: '',
        rawMaterialType: '',
        alloyGrade: '',
        temper: '',
        thickness: null,
        width: null,
        unitWeight: null,
        unitWeightType: 'kg/卷',
        processTemplateIds: [],
        qualityStandardId: null,
        lifecycleStatus: '试产',
        description: ''
      }
    },

    /**
     * 将API数据转换为表单数据
     */
    transformApiDataToForm(apiData) {
      return {
        productCode: apiData.productCode || '',
        productName: apiData.productName || '',
        rawMaterialType: apiData.rawMaterialType || '',
        alloyGrade: apiData.alloyGrade || '',
        temper: apiData.temper || '',
        thickness: apiData.thickness || null,
        width: apiData.width || null,
        unitWeight: apiData.unitWeight || null,
        unitWeightType: apiData.unitWeightType || 'kg/卷',
        processTemplateIds: apiData.processTemplateIds || [],
        qualityStandardId: apiData.qualityStandardId || null,
        lifecycleStatus: apiData.lifecycleStatus || '试产',
        description: apiData.description || ''
      }
    },

    /**
     * 将表单数据转换为API数据
     */
    transformFormDataToApi(formData) {
      const apiData = {
        productCode: formData.productCode,
        productName: formData.productName,
        rawMaterialType: formData.rawMaterialType,
        alloyGrade: formData.alloyGrade,
        temper: formData.temper,
        thickness: formData.thickness,
        width: formData.width,
        unitWeight: formData.unitWeight,
        unitWeightType: formData.unitWeightType,
        processTemplateIds: formData.processTemplateIds,
        lifecycleStatus: formData.lifecycleStatus,
        description: formData.description
      }

      // 创建模式才传递 qualityStandardId
      if (this.innerMode === 'create') {
        apiData.qualityStandardId = formData.qualityStandardId
      }

      return apiData
    },

    /**
     * 产品编码失焦处理
     */
    handleCodeBlur() {
      // 编码格式验证：AF-合金-硬度-厚度x宽度
      const code = this.formData.productCode
      if (code && !/^AF-[A-Z0-9]+-[A-Z0-9]+-[0-9]*\.?[0-9]+[xX][0-9]*\.?[0-9]+$/.test(code)) {
        this.$message.warning('产品编码格式应为：AF-合金-硬度-厚度x宽度，如：AF-1100-H18-0.006x1200')
      }
    },

    /**
     * 抽屉打开事件
     */
    handleDrawerOpen() {
      this.$emit('open')
    },

    /**
     * 抽屉关闭事件
     */
    handleDrawerClose() {
      this.formData = {}
      this.submitLoading = false
      this.$emit('close')
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.drawerVisible = false
    },

    /**
     * 提交表单
     */
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请检查表单填写是否正确')
          return
        }
        this.handleFormSubmit(this.formData)
      })
    },

    /**
     * 表单提交处理
     */
    async handleFormSubmit(formData) {
      this.submitLoading = true

      try {
        const apiData = this.transformFormDataToApi(formData)
        let response

        if (this.innerMode === 'create') {
          response = await createProduct(apiData)
          this.$message.success(response.message || '创建产品成功')
          this.$emit('created', response.data)
        } else if (this.innerMode === 'update') {
          response = await updateProduct(this.productId, apiData)
          this.$message.success(response.message || '更新产品成功')
          this.$emit('updated', response.data)
        }

        this.drawerVisible = false
      } catch (error) {
        console.error('提交失败:', error)
        const errorMessage = error.response?.data?.error?.message || error.message || '操作失败'
        this.$message.error(errorMessage)
      } finally {
        this.submitLoading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e4e7ed;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 40px;
      height: 2px;
      background: #409eff;
    }
  }
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

::v-deep .el-input-number {
  .el-input__inner {
    text-align: left;
  }
}

::v-deep .el-select {
  .el-tag {
    margin-right: 6px;
    margin-bottom: 2px;
  }
}
</style>
