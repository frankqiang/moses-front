/**
 * 文件名称：PlanFormDialog.vue
 * 文件描述：生产计划创建对话框
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 */

<template>
  <el-dialog
    :visible.sync="visible"
    :title="dialogTitle"
    :close-on-click-modal="false"
    width="900px"
    @close="handleClose"
  >
    <el-form
      ref="planForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="plan-form"
    >
      <!-- 基本信息区 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划编号" prop="planNumber">
              <el-input
                v-model="formData.planNumber"
                placeholder="留空自动生成"
                maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划来源" prop="source">
              <el-select
                v-model="formData.source"
                placeholder="请选择计划来源"
                style="width: 100%"
              >
                <el-option
                  v-for="item in planSourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划优先级" prop="planPriority">
              <el-select
                v-model="formData.planPriority"
                placeholder="请选择计划优先级"
                style="width: 100%"
              >
                <el-option
                  v-for="item in planPriorityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划交期" prop="plannedDeliveryDate">
              <el-date-picker
                v-model="formData.plannedDeliveryDate"
                type="datetime"
                placeholder="请选择计划交期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-ddTHH:mm:ss.sssZ"
                :picker-options="pickerOptions"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 产品信息区 -->
      <div class="form-section">
        <div class="section-title">产品信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品选择" prop="productId">
              <el-select
                v-model="formData.productId"
                placeholder="请选择或搜索产品"
                filterable
                remote
                :remote-method="searchProduct"
                :loading="productLoading"
                style="width: 100%"
                @change="handleProductChange"
              >
                <el-option
                  v-for="item in productOptions"
                  :key="item.id"
                  :label="`${item.productCode} - ${item.productName}`"
                  :value="item.id"
                >
                  <span style="float: left">{{ item.productCode }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ item.productName }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品编码" prop="productCode">
              <el-input
                v-model="formData.productCode"
                placeholder="选择产品后自动填充"
                maxlength="50"
                clearable
                disabled
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="需求数量" prop="demandQuantity">
              <el-input-number
                v-model="formData.demandQuantity"
                :min="0.001"
                :max="9999999.999"
                :precision="3"
                :step="1"
                placeholder="请输入需求数量"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="需求单位" prop="demandUnit">
              <el-select
                v-model="formData.demandUnit"
                placeholder="请选择需求单位"
                style="width: 100%"
              >
                <el-option label="吨" value="吨" />
                <el-option label="卷" value="卷" />
                <el-option label="件" value="件" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 客户信息区 -->
      <div class="form-section">
        <div class="section-title">客户信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户名称" prop="customerName">
              <el-input
                v-model="formData.customerName"
                placeholder="请输入客户名称"
                maxlength="100"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户编码" prop="customerCode">
              <el-input
                v-model="formData.customerCode"
                placeholder="请输入客户编码"
                maxlength="50"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="特殊要求" prop="specificRequirements">
              <el-input
                v-model="formData.specificRequirements"
                type="textarea"
                :rows="3"
                placeholder="请输入特殊要求"
                maxlength="1000"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 工艺与设备配置区 -->
      <div class="form-section">
        <div class="section-title">工艺与设备配置</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认工艺模板" prop="defaultProcessTemplateId">
              <el-select
                v-model="formData.defaultProcessTemplateId"
                placeholder="请选择工艺模板"
                filterable
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in processTemplateOptions"
                  :key="item.id"
                  :label="`${item.code} - ${item.name}`"
                  :value="item.id"
                >
                  <span style="float: left">{{ item.code }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ item.name }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工艺模板关联类型" prop="processTemplateLinkType">
              <el-select
                v-model="formData.processTemplateLinkType"
                placeholder="请选择关联类型"
                clearable
                style="width: 100%"
              >
                <el-option label="主要工艺" value="PRIMARY" />
                <el-option label="备用工艺" value="BACKUP" />
                <el-option label="手动覆盖" value="MANUAL_OVERRIDE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createPlan } from '../api'
import dictionaryMixin from '../mixins/dictionary'
// 从铝箔产品管理模块获取产品数据
import { fetchFoilProductList } from '@/views/master-data/aluminum-foil-product-management/api/aluminum-foil-product-management'
// 从工艺参数管理模块获取工艺模板数据
import { fetchProcessTemplateList } from '@/views/master-data/process-parameter-management/api/process-parameter-management'

export default {
  name: 'PlanFormDialog',
  mixins: [dictionaryMixin],
  data() {
    // 验证计划交期必须晚于当前时间
    const validateDeliveryDate = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择计划交期'))
      } else {
        const selectedDate = new Date(value)
        const now = new Date()
        if (selectedDate <= now) {
          callback(new Error('计划交期必须晚于当前时间'))
        } else {
          callback()
        }
      }
    }

    return {
      visible: false,
      submitLoading: false,
      productLoading: false,
      formData: {
        planNumber: '',
        source: 'MANUAL',
        productId: '',
        productCode: '',
        demandQuantity: null,
        demandUnit: '吨',
        plannedDeliveryDate: '',
        customerName: '',
        customerCode: '',
        specificRequirements: '',
        planPriority: 'NORMAL',
        defaultProcessTemplateId: '',
        processTemplateLinkType: ''
      },
      formRules: {
        productId: [
          { required: true, message: '请选择产品', trigger: 'change' }
        ],
        demandQuantity: [
          { required: true, message: '请输入需求数量', trigger: 'blur' },
          { type: 'number', min: 0.001, message: '需求数量必须大于0', trigger: 'blur' }
        ],
        demandUnit: [
          { required: true, message: '请选择需求单位', trigger: 'change' },
          { max: 20, message: '需求单位最多20个字符', trigger: 'blur' }
        ],
        plannedDeliveryDate: [
          { required: true, validator: validateDeliveryDate, trigger: 'change' }
        ],
        planNumber: [
          { max: 50, message: '计划编号最多50个字符', trigger: 'blur' }
        ],
        customerName: [
          { max: 100, message: '客户名称最多100个字符', trigger: 'blur' }
        ],
        customerCode: [
          { max: 50, message: '客户编码最多50个字符', trigger: 'blur' }
        ],
        specificRequirements: [
          { max: 1000, message: '特殊要求最多1000个字符', trigger: 'blur' }
        ]
      },
      // 日期选择器配置
      pickerOptions: {
        disabledDate(time) {
          // 禁用今天之前的日期
          return time.getTime() < Date.now() - 8.64e7 // 减去一天的毫秒数
        }
      },
      // 选项数据（来源和优先级选项由 dictionaryMixin 提供）
      productOptions: [],
      processTemplateOptions: []
    }
  },
  computed: {
    dialogTitle() {
      return '创建生产计划'
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open() {
      this.visible = true
      this.resetForm()
      // 加载初始数据
      this.loadProductList()
      this.loadProcessTemplateList()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.visible = false
      this.resetForm()
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = {
        planNumber: '',
        source: 'MANUAL',
        productId: '',
        productCode: '',
        demandQuantity: null,
        demandUnit: '吨',
        plannedDeliveryDate: '',
        customerName: '',
        customerCode: '',
        specificRequirements: '',
        planPriority: 'NORMAL',
        defaultProcessTemplateId: '',
        processTemplateLinkType: ''
      }
      this.$nextTick(() => {
        this.$refs.planForm && this.$refs.planForm.clearValidate()
      })
    },

    /**
     * 加载产品列表
     */
    async loadProductList(query = '') {
      try {
        this.productLoading = true
        // 构建查询参数，search 为空时不传递该参数
        const params = {
          limit: 50,
          page: 1
        }
        if (query && query.trim()) {
          params.search = query.trim()
        }
        const response = await fetchFoilProductList(params)
        if (response.data && response.data.results) {
          this.productOptions = response.data.results
        }
      } catch (error) {
        console.error('加载产品列表失败:', error)
        this.$message.error(error.message || '加载产品列表失败')
      } finally {
        this.productLoading = false
      }
    },

    /**
     * 搜索产品
     */
    searchProduct(query) {
      if (query !== '') {
        this.loadProductList(query)
      } else {
        this.productOptions = []
      }
    },

    /**
     * 加载工艺模板列表
     */
    async loadProcessTemplateList() {
      try {
        const response = await fetchProcessTemplateList({
          status: '生效', // 只获取生效状态的工艺模板（中文状态值）
          limit: 100,
          page: 1
        })

        // 检查响应数据结构 - API 返回的字段是 templates，不是 results
        let templates = []
        if (response && response.data && response.data.templates) {
          templates = response.data.templates
        } else if (response && response.templates) {
          templates = response.templates
        }

        if (templates && templates.length > 0) {
          this.processTemplateOptions = templates.map(template => ({
            id: template.id,
            code: template.templateCode,
            name: template.templateName,
            status: template.status
          }))
        } else {
          this.processTemplateOptions = []
        }
      } catch (error) {
        console.error('加载工艺模板列表失败:', error)
        this.$message.error(error.message || '加载工艺模板列表失败')
      }
    },

    /**
     * 处理产品选择变化
     */
    handleProductChange(productId) {
      const selectedProduct = this.productOptions.find(item => item.id === productId)
      if (selectedProduct) {
        // 自动填充产品编码
        this.formData.productCode = selectedProduct.productCode || ''
      } else {
        this.formData.productCode = ''
      }
    },

    /**
     * 提交表单
     */
    handleSubmit() {
      this.$refs.planForm.validate(async(valid) => {
        if (!valid) {
          this.$message.error('请填写完整的表单信息')
          return
        }

        try {
          this.submitLoading = true

          // 构建请求数据
          const requestData = {
            source: this.formData.source,
            productId: this.formData.productId,
            demandQuantity: this.formData.demandQuantity,
            demandUnit: this.formData.demandUnit,
            plannedDeliveryDate: this.formData.plannedDeliveryDate,
            planPriority: this.formData.planPriority
          }

          // 可选字段
          if (this.formData.planNumber) {
            requestData.planNumber = this.formData.planNumber
          }
          if (this.formData.productCode) {
            requestData.productCode = this.formData.productCode
          }
          if (this.formData.customerName) {
            requestData.customerName = this.formData.customerName
          }
          if (this.formData.customerCode) {
            requestData.customerCode = this.formData.customerCode
          }
          if (this.formData.specificRequirements) {
            requestData.specificRequirements = this.formData.specificRequirements
          }
          if (this.formData.defaultProcessTemplateId) {
            requestData.defaultProcessTemplateId = this.formData.defaultProcessTemplateId
          }
          if (this.formData.processTemplateLinkType) {
            requestData.processTemplateLinkType = this.formData.processTemplateLinkType
          }

          const response = await createPlan(requestData)

          if (response.success) {
            // 优先使用后端返回的消息
            this.$message.success(response.message || '创建生产计划成功')
            this.handleClose()
            // 通知父组件刷新列表
            this.$emit('success')
          } else {
            this.$message.error(response.message || '创建生产计划失败')
          }
        } catch (error) {
          console.error('创建生产计划失败:', error)
          // 优先使用后端返回的错误消息
          const errorMessage = error.response?.data?.error?.message || error.message || '创建生产计划失败'
          this.$message.error(errorMessage)
        } finally {
          this.submitLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-form {
  .form-section {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;
    }
  }

  // 调整表单项的间距
  ::v-deep .el-form-item {
    margin-bottom: 16px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>

