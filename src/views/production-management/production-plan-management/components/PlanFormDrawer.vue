/**
 * 文件名称：PlanFormDrawer.vue
 * 文件描述：生产计划创建表单抽屉，使用BaseDrawer+el-form组合
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段核心功能
 *   - 2025-01-17: 重构为使用BaseDrawer组件（符合全局组件优先规则）
 */

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :loading="submitLoading"
    width="800px"
    :wrapper-closable="false"
    @confirm="handleSubmit"
    @cancel="handleCancel"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
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
                <el-option label="公斤（KG）" value="KG" />
                <el-option label="吨（TON）" value="TON" />
                <el-option label="卷（ROLL）" value="ROLL" />
                <el-option label="件（PCS）" value="PCS" />
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

      <!-- 工艺配置区（可选） -->
      <div class="form-section">
        <div class="section-title">
          工艺配置（可选）
          <el-tooltip placement="top">
            <div slot="content" style="max-width: 300px">
              <div><strong>自动继承规则：</strong></div>
              <div>1. 不填写 → 从产品主数据获取默认工艺</div>
              <div>2. 拆分时 → 子批次自动继承此处配置</div>
              <div>3. 95%场景：不填写，使用默认继承（推荐）</div>
            </div>
            <i class="el-icon-question" style="margin-left: 8px; color: #909399; cursor: help" />
          </el-tooltip>
        </div>
        <el-alert
          title="提示：工艺模板为可选字段"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        >
          <template slot="default">
            <div>• 不填写时，系统自动从产品主数据中获取默认工艺模板</div>
            <div>• 后续拆分计划时，子批次会自动继承此处设置的工艺模板</div>
            <div style="margin-top: 4px; color: #606266">
              <strong>推荐做法</strong>：95%场景下不需要填写，让系统自动继承即可
            </div>
          </template>
        </el-alert>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="默认工艺模板" prop="defaultProcessTemplateId">
              <el-select
                v-model="formData.defaultProcessTemplateId"
                placeholder="留空则自动从产品获取"
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
              <span class="form-item-tip">不填写则从产品主数据自动获取</span>
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
                <el-option label="主工艺" value="PRIMARY" />
                <el-option label="备用工艺" value="BACKUP" />
                <el-option label="手动指定" value="MANUAL_OVERRIDE" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 外部订单信息（可选） -->
      <div class="form-section">
        <div class="section-title">外部订单信息（可选）</div>
        <el-row>
          <el-col :span="24">
            <el-form-item label="外部订单号" prop="externalOrderNumber">
              <el-input
                v-model="formData.externalOrderNumber"
                placeholder="用于关联ERP系统订单号"
                maxlength="100"
                clearable
              />
              <span class="form-item-tip">计划来源为ERP时建议填写</span>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import { createPlan } from '../api'
import dictionaryMixin from '../mixins/dictionary'
// 从铝箔产品管理模块获取产品数据
import { fetchFoilProductList } from '@/views/master-data/aluminum-foil-product-management/api/aluminum-foil-product-management'
// 从工艺参数管理模块获取工艺模板数据
import { fetchProcessTemplateList } from '@/views/master-data/process-parameter-management/api/process-parameter-management'

export default {
  name: 'PlanFormDrawer',
  components: {
    BaseDrawer
  },
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
      drawerVisible: false,
      submitLoading: false,
      productLoading: false,
      formData: {
        planNumber: '',
        source: 'MANUAL',
        productId: '',
        productCode: '',
        demandQuantity: null,
        demandUnit: 'KG',
        plannedDeliveryDate: '',
        customerName: '',
        customerCode: '',
        specificRequirements: '',
        planPriority: 'NORMAL',
        defaultProcessTemplateId: '',
        processTemplateLinkType: '',
        externalOrderNumber: ''
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
          { max: 10, message: '需求单位最多10个字符', trigger: 'blur' }
        ],
        externalOrderNumber: [
          { max: 100, message: '外部订单号最多100个字符', trigger: 'blur' }
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
    drawerTitle() {
      return '创建生产计划'
    }
  },
  methods: {
    /**
     * 打开抽屉
     */
    open() {
      this.drawerVisible = true
    },

    /**
     * 抽屉打开时触发
     */
    handleDrawerOpen() {
      this.resetForm()
      // 加载初始数据
      this.loadProductList()
      this.loadProcessTemplateList()
    },

    /**
     * 取消按钮点击
     */
    handleCancel() {
      this.drawerVisible = false
    },

    /**
     * 抽屉关闭时触发
     */
    handleDrawerClose() {
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
        demandUnit: 'KG',
        plannedDeliveryDate: '',
        customerName: '',
        customerCode: '',
        specificRequirements: '',
        planPriority: 'NORMAL',
        defaultProcessTemplateId: '',
        processTemplateLinkType: '',
        externalOrderNumber: ''
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
     * 处理创建错误
     * 根据错误码显示用户友好的提示信息
     */
    handleCreateError(error) {
      // 获取错误响应数据
      const errorResponse = error.response?.data?.error || {}
      const errorCode = errorResponse.code
      const errorMessage = errorResponse.message
      const errorDetails = errorResponse.details

      // 错误码映射表（根据接口文档）
      const errorMessageMap = {
        'VALIDATION_ERROR': '参数验证失败',
        'PRODUCTION_PLAN_MANUAL_PAYLOAD_INVALID': '创建参数无效',
        'PRODUCTION_PLAN_PRODUCT_NOT_FOUND': '产品不存在，请检查产品ID是否正确',
        'PRODUCTION_PLAN_DELIVERY_DATE_INVALID': '计划交期必须晚于当前时间',
        'PRODUCTION_PLAN_PROCESS_TEMPLATE_INVALID': '工艺模板不存在或状态无效',
        'PRODUCTION_PLAN_CREATION_FAILED': '创建生产计划失败，请稍后重试',
        'UNAUTHORIZED': '未授权，请重新登录',
        'FORBIDDEN': '无权限创建生产计划'
      }

      // 根据错误码获取提示信息
      let displayMessage = errorMessage || errorMessageMap[errorCode] || '创建生产计划失败'

      // 对于验证错误，显示详细字段信息
      if (errorCode === 'VALIDATION_ERROR' && errorDetails?.field) {
        displayMessage = `${errorMessageMap[errorCode]}：${errorDetails.field} - ${errorMessage}`
      }

      // 对于产品不存在错误，清空产品选择
      if (errorCode === 'PRODUCTION_PLAN_PRODUCT_NOT_FOUND') {
        this.formData.productId = ''
        this.formData.productCode = ''
      }

      // 对于工艺模板无效错误，清空工艺模板选择
      if (errorCode === 'PRODUCTION_PLAN_PROCESS_TEMPLATE_INVALID') {
        this.formData.defaultProcessTemplateId = ''
        this.formData.processTemplateLinkType = ''
      }

      // 显示错误提示
      this.$message.error(displayMessage)

      // 对于401错误，跳转到登录页
      if (errorCode === 'UNAUTHORIZED' || error.response?.status === 401) {
        setTimeout(() => {
          this.$router.push('/login')
        }, 1500)
      }
    },

    /**
     * 提交表单（BaseDrawer的confirm事件）
     */
    async handleSubmit({ resolve, reject }) {
      try {
        // 表单验证
        const valid = await this.$refs.planForm.validate().catch(() => false)
        if (!valid) {
          this.$message.error('请填写完整的表单信息')
          reject(new Error('表单验证失败'))
          return
        }

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
          requestData.planNumber = this.formData.planNumber.trim().toUpperCase()
        }
        if (this.formData.productCode) {
          requestData.productCode = this.formData.productCode.trim().toUpperCase()
        }
        if (this.formData.customerName) {
          requestData.customerName = this.formData.customerName.trim()
        }
        if (this.formData.customerCode) {
          requestData.customerCode = this.formData.customerCode.trim().toUpperCase()
        }
        if (this.formData.specificRequirements) {
          requestData.specificRequirements = this.formData.specificRequirements.trim()
        }
        if (this.formData.defaultProcessTemplateId) {
          requestData.defaultProcessTemplateId = this.formData.defaultProcessTemplateId
        }
        if (this.formData.processTemplateLinkType) {
          requestData.processTemplateLinkType = this.formData.processTemplateLinkType
        }
        if (this.formData.externalOrderNumber) {
          requestData.externalOrderNumber = this.formData.externalOrderNumber.trim()
        }

        const response = await createPlan(requestData)

        if (response.success) {
          // 优先使用后端返回的消息
          this.$message.success(response.message || '创建生产计划成功')
          this.drawerVisible = false
          // 通知父组件刷新列表
          this.$emit('success')
          resolve()
        } else {
          // 失败时 message 在 error 对象中
          const errorMsg = response.error?.message || '创建生产计划失败'
          this.$message.error(errorMsg)
          reject(new Error(errorMsg))
        }
      } catch (error) {
        console.error('创建生产计划失败:', error)
        this.handleCreateError(error)
        reject(error)
      } finally {
        this.submitLoading = false
      }
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

.form-item-tip {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>

