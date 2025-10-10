/**
 * 文件名称：BinFormDrawer.vue
 * 文件描述：料框表单抽屉组件，提供料框新增、编辑和查看功能
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，实现料框注册和编辑功能
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
            <el-form-item label="料框编号" prop="binCode">
              <el-input
                v-model="formData.binCode"
                placeholder="格式：LK-YYYYMMDD-XXXX（可选，不填自动生成）"
                maxlength="50"
                show-word-limit
                clearable
                @blur="handleCodeBlur"
              />
              <div class="field-hint">料框编号可选，不填时系统自动生成</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="料框规格" prop="binSpecificationId">
              <el-select
                v-model="formData.binSpecificationId"
                placeholder="请选择料框规格"
                style="width: 100%"
                filterable
                clearable
                @change="handleSpecificationChange"
              >
                <el-option
                  v-for="spec in binSpecificationOptions"
                  :key="spec.id"
                  :label="`${spec.specCode} - ${spec.specName}`"
                  :value="spec.id"
                />
              </el-select>
              <!-- 规格详细信息展示 -->
              <div v-if="selectedSpecification" class="info-card">
                <div class="info-item">
                  <span class="info-label">最大载重：</span>
                  <span class="info-value">{{ selectedSpecification.maxLoadCapacity }} kg</span>
                </div>
                <div class="info-item">
                  <span class="info-label">最大堆叠层数：</span>
                  <span class="info-value">{{ selectedSpecification.maxStackLayers }} 层</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="铝箔产品" prop="productId">
              <el-select
                v-model="formData.productId"
                placeholder="请选择铝箔产品"
                style="width: 100%"
                filterable
                clearable
                @change="handleProductChange"
              >
                <el-option
                  v-for="product in productOptions"
                  :key="product.id"
                  :label="`${product.productCode} - ${product.productName}`"
                  :value="product.id"
                />
              </el-select>
              <!-- 产品详细信息展示 -->
              <div v-if="selectedProduct" class="info-card">
                <div class="info-item">
                  <span class="info-label">合金牌号：</span>
                  <span class="info-value">{{ selectedProduct.alloyGrade || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">状态/硬度：</span>
                  <span class="info-value">{{ selectedProduct.temper || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">厚度×宽度：</span>
                  <span class="info-value">
                    {{ selectedProduct.thickness || '-' }} mm × {{ selectedProduct.width || '-' }} mm
                  </span>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品代码" prop="productCode">
              <el-input
                v-model="formData.productCode"
                placeholder="请输入产品代码"
                maxlength="100"
                show-word-limit
                clearable
              />
              <div class="field-hint">产品代码必填，将转换为大写格式</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="批次号" prop="batchNumber">
              <el-input
                v-model="formData.batchNumber"
                placeholder="请输入批次号（可选）"
                maxlength="100"
                show-word-limit
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="重量 (kg)" prop="weight">
              <el-input-number
                v-model="formData.weight"
                placeholder="请输入重量"
                :min="0.001"
                :precision="3"
                :step="0.1"
                controls-position="right"
                style="width: 100%"
              />
              <div v-if="selectedSpecification" class="field-hint field-hint--warning">
                <i class="el-icon-warning" />
                重量不得超过规格最大载重 {{ selectedSpecification.maxLoadCapacity }} kg
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 二、位置信息 -->
      <div class="form-section">
        <div class="section-title">二、位置信息</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="初始位置" prop="currentLocationId">
              <el-select
                v-model="formData.currentLocationId"
                placeholder="请选择初始位置（可选）"
                style="width: 100%"
                filterable
                clearable
              >
                <el-option
                  v-for="location in locationOptions"
                  :key="location.id"
                  :label="`${location.locationId} - ${location.locationType}`"
                  :value="location.id"
                />
              </el-select>
              <div class="field-hint">初始位置可选，留空时由系统管理</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 三、备注信息 -->
      <div class="form-section">
        <div class="section-title">三、备注信息</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入备注信息（可选），最多500字"
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
import { BIN_FORM_RULES, BIN_FORM_DEFAULTS, BIN_CODE_PATTERN } from '../constants/form-config'
import { registerBin, getBinDetail } from '../api/bin-management'
import { getBinSpecList } from '@/api/master-data/bin-specification'
import { getAllProductList } from '@/api/master-data/product-management'

export default {
  name: 'BinFormDrawer',
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
    binId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      drawerVisible: false,
      innerMode: 'create',
      formData: { ...BIN_FORM_DEFAULTS },
      submitLoading: false,
      binSpecificationOptions: [],
      productOptions: [],
      locationOptions: [], // 库位选项（暂时为空，后续实现）
      selectedSpecification: null,
      selectedProduct: null
    }
  },
  computed: {
    drawerTitle() {
      const titleMap = {
        create: '新增料框',
        update: '编辑料框',
        view: '查看料框'
      }
      return titleMap[this.innerMode] || '料框'
    },
    formRules() {
      const rules = { ...BIN_FORM_RULES }

      // 动态添加重量验证规则：不超过规格最大载重
      if (this.selectedSpecification) {
        rules.weight = [
          ...rules.weight,
          {
            validator: (_, value, callback) => {
              if (value && value > this.selectedSpecification.maxLoadCapacity) {
                callback(new Error(`重量不得超过规格最大载重 ${this.selectedSpecification.maxLoadCapacity} kg`))
                return
              }
              callback()
            },
            trigger: 'change'
          }
        ]
      }

      return rules
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
        // 加载下拉选项
        await Promise.all([
          this.loadBinSpecifications(),
          this.loadProducts()
        ])

        if (this.innerMode === 'create') {
          this.formData = { ...BIN_FORM_DEFAULTS }
          this.selectedSpecification = null
          this.selectedProduct = null
        } else if (this.binId) {
          const response = await getBinDetail(this.binId)
          this.formData = this.transformApiDataToForm(response.data)

          // 设置选中的规格和产品详细信息
          if (this.formData.binSpecificationId) {
            this.selectedSpecification = this.binSpecificationOptions.find(
              spec => spec.id === this.formData.binSpecificationId
            ) || response.data.specification
          }

          if (this.formData.productId) {
            this.selectedProduct = this.productOptions.find(
              product => product.id === this.formData.productId
            ) || response.data.product
          }
        }

        // 清除验证
        await this.$nextTick()
        this.$refs.form && this.$refs.form.clearValidate()
      } catch (error) {
        console.error('初始化表单数据失败:', error)
        const errorMessage = error.response?.data?.error?.message || error.message || '获取料框详情失败'
        this.$message.error(errorMessage)
        this.handleCancel()
      }
    },

    /**
     * 加载料框规格选项
     */
    async loadBinSpecifications() {
      try {
        const response = await getBinSpecList({ status: '启用', limit: 1000 })
        this.binSpecificationOptions = response.data?.results || []
      } catch (error) {
        console.error('加载料框规格失败:', error)
        this.binSpecificationOptions = []
      }
    },

    /**
     * 加载产品选项
     */
    async loadProducts() {
      try {
        const response = await getAllProductList({ limit: 1000 })
        this.productOptions = response.data?.results || []
      } catch (error) {
        console.error('加载产品列表失败:', error)
        this.productOptions = []
      }
    },

    /**
     * 料框规格选择变更处理
     */
    handleSpecificationChange(specId) {
      if (specId) {
        this.selectedSpecification = this.binSpecificationOptions.find(
          spec => spec.id === specId
        )
      } else {
        this.selectedSpecification = null
      }

      // 触发重量字段重新验证
      if (this.formData.weight) {
        this.$refs.form && this.$refs.form.validateField('weight')
      }
    },

    /**
     * 产品选择变更处理
     */
    handleProductChange(productId) {
      if (productId) {
        const product = this.productOptions.find(p => p.id === productId)
        this.selectedProduct = product

        // 自动填充产品代码
        if (product && product.productCode) {
          this.formData.productCode = product.productCode
        }
      } else {
        this.selectedProduct = null
      }
    },

    /**
     * 料框编号失焦处理
     */
    handleCodeBlur() {
      if (this.formData.binCode) {
        // 转换为大写
        this.formData.binCode = this.formData.binCode.toUpperCase().trim()

        // 验证格式
        if (!BIN_CODE_PATTERN.test(this.formData.binCode)) {
          this.$message.warning('料框编号格式应为：LK-YYYYMMDD-XXXX，如：LK-20250110-0001')
        }
      }
    },

    /**
     * 将API数据转换为表单数据
     */
    transformApiDataToForm(apiData) {
      return {
        binCode: apiData.binCode || '',
        binSpecificationId: apiData.binSpecificationId || '',
        productId: apiData.productId || '',
        productCode: apiData.productCode || '',
        batchNumber: apiData.batchNumber || '',
        weight: apiData.weight || null,
        currentLocationId: apiData.currentLocationId || '',
        remarks: apiData.remarks || ''
      }
    },

    /**
     * 将表单数据转换为API数据
     */
    transformFormDataToApi(formData) {
      const apiData = {
        binSpecificationId: formData.binSpecificationId,
        productId: formData.productId,
        productCode: formData.productCode.toUpperCase().trim(),
        weight: formData.weight
      }

      // 可选字段
      if (formData.binCode) {
        apiData.binCode = formData.binCode.toUpperCase().trim()
      }
      if (formData.batchNumber) {
        apiData.batchNumber = formData.batchNumber
      }
      if (formData.currentLocationId) {
        apiData.currentLocationId = formData.currentLocationId
      }
      if (formData.remarks) {
        apiData.remarks = formData.remarks
      }

      return apiData
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
      this.formData = { ...BIN_FORM_DEFAULTS }
      this.selectedSpecification = null
      this.selectedProduct = null
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
          response = await registerBin(apiData)
          this.$message.success(response.message || '料框注册成功')
          this.$emit('created', response.data)
        } else if (this.innerMode === 'update') {
          // TODO: 后续实现更新料框接口时启用
          // response = await updateBin(this.binId, apiData)
          // this.$message.success(response.message || '料框更新成功')
          // this.$emit('updated', response.data)
          this.$message.info('料框更新功能待实现')
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

  &--warning {
    color: #e6a23c;
    display: flex;
    align-items: center;
    gap: 4px;

    .el-icon-warning {
      font-size: 14px;
    }
  }
}

.info-card {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  border-left: 3px solid #409eff;

  .info-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    line-height: 1.8;

    .info-label {
      color: #909399;
      margin-right: 4px;
    }

    .info-value {
      color: #303133;
      font-weight: 500;
    }
  }
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
</style>

