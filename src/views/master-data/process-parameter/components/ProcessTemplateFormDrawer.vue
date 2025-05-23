/**
 * 工艺模板表单抽屉组件
 * 功能描述：提供工艺模板新增、编辑和查看功能的表单，使用抽屉方式展示
 * 创建日期：2024-11-15
 */
<template>
  <drawer-form
    ref="drawerForm"
    :visible.sync="drawerVisible"
    :title="getDrawerTitle()"
    :mode="type"
    :data="form"
    :rules="rules"
    :form-sections="formSections"
    :loading="loading"
    width="1700px"
    direction="rtl"
    label-width="100px"
    :wrapper-closable="false"
    @submit="handleFormSubmit"
    @close="handleClose"
    @form-change="handleFormChange"
  >
    <template #footer>
      <el-button @click="handleClose">{{ type === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="type !== 'view'" type="primary" @click="validateAndSubmit" :loading="loading">{{ type === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </template>
    
    <!-- 炉型选择器 -->
    <template #furnaceType>
      <el-form-item  prop="furnaceTypeId" :rules="rules.furnaceTypeId">
        <furnace-type-selector
          v-model="form.furnaceTypeId"
          :disabled="type === 'view' || loading"
          @capabilities-change="handleFurnaceCapabilitiesChange"
        />
      </el-form-item>
    </template>
    
    <!-- 工艺段定义区域 -->
    <template #segments>
      <div class="segments-container">
        <!-- 工艺曲线图表 -->
        <process-curve-chart
          ref="processCurveChart"
          :segments="form.segments"
          height="350"
          width="100%"
          :initial-temp="25"
          :interactive="type !== 'view'"
          :downloadable="true"
          :theme="'light'"
        />
        
        <!-- 工艺段表格 -->
        <process-segment-table
          v-model="form.segments"
          :disabled="type === 'view'"
          :furnace-capabilities="furnaceCapabilities"
          @change="handleSegmentsChange"
          @input="handleSegmentsInput"
        />
      </div>
    </template>
    
    <!-- 适用产品选择区域 -->
    <template #applicableProducts>
      <el-transfer
        v-model="form.applicableProductIds"
        :data="productOptions"
        :titles="['可选产品', '已选产品']"
        :button-texts="['移除', '添加']"
        :props="{
          key: 'id',
          label: 'name'
        }"
        :disabled="type === 'view'"
        filterable
        filter-placeholder="请输入产品名称或代码"
      >
        <template #left-footer>
          <div class="transfer-footer">
            <span>共 {{ productOptions.length }} 项</span>
          </div>
        </template>
        <template #right-footer>
          <div class="transfer-footer">
            <span>已选 {{ form.applicableProductIds.length }} 项</span>
          </div>
        </template>
      </el-transfer>
    </template>
    
    <!-- 审批记录区域 -->
    <template #approvalLog>
      <div class="approval-log">
        <el-timeline v-if="form.approvalLog && form.approvalLog.length">
          <el-timeline-item
            v-for="(activity, index) in form.approvalLog"
            :key="index"
            :timestamp="activity.timestamp"
            :type="getTimelineItemType(activity.action)"
            :icon="getTimelineItemIcon(activity.action)"
          >
            <div class="timeline-content">
              <div class="timeline-title">
                {{ activity.action }}
                <span class="timeline-user">{{ activity.user }}</span>
              </div>
              <div class="timeline-comment" v-if="activity.comment">
                {{ activity.comment }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无审批记录" :image-size="80"></el-empty>
      </div>
    </template>
  </drawer-form>
</template>

<script>
import DrawerForm from '@/components/DrawerForm'
import ProcessCurveChart from './ProcessCurveChart'
import ProcessSegmentTable from './ProcessSegmentTable'
import FurnaceTypeSelector from './FurnaceTypeSelector'
import { getAllFurnaceTypes } from '@/api/master-data/furnace-type'
import { getAllProductList } from '@/api/master-data/product-management'

export default {
  name: 'ProcessTemplateFormDrawer',
  components: {
    DrawerForm,
    ProcessCurveChart,
    ProcessSegmentTable,
    FurnaceTypeSelector
  },
  props: {
    // 抽屉可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 操作类型：create-新增, update-编辑, view-查看
    type: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view'].includes(value)
    },
    // 工艺模板数据（编辑和查看时使用）
    templateData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 抽屉可见性
      drawerVisible: false,
      // 表单数据
      form: this.initFormData(),
      // 加载状态
      loading: false,
      // 炉型选项
      furnaceTypeOptions: [],
      // 产品选项
      productOptions: [],
      // 当前选中炉型的能力配置
      furnaceCapabilities: {
        hasBackZone: true,
        hasNegativePressure: true,
        hasCoolingValve: true,
        maxSegments: 12
      }
    }
  },
  computed: {
    // 动态表单规则
    rules() {
      return {
        templateName: [
          { required: true, message: '请输入工艺模板名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        furnaceTypeId: [
          { required: true, message: '请选择关联炉型', trigger: 'change' }
        ],
        applicableProductIds: [
          { type: 'array', required: true, message: '请选择适用产品范围', trigger: 'blur' }
        ],
        segments: [
          { type: 'array', required: true, message: '至少需要一个工艺段', trigger: 'change' }
        ]
      }
    },
    
    // 动态表单分段
    formSections() {
      // 1. 基础信息段
      const baseSection = {
        title: '一、基本信息',
        items: [
          {
            prop: 'templateId',
            label: '模板ID',
            type: 'input',
            placeholder: '系统自动生成',
            disabled: true,
            rowClass: 'first-row',
            colSpan: 6
          },
          {
            prop: 'templateName',
            label: '模板名称',
            type: 'input',
            placeholder: '请输入工艺模板名称',
            maxlength: 50,
            showWordLimit: true,
            rowClass: 'first-row',
            colSpan: 6
          },
          {
            prop: 'version',
            label: '版本号',
            type: 'input',
            placeholder: '系统自动生成',
            disabled: true,
            rowClass: 'first-row',
            colSpan: 6
          },
          {
            prop: 'furnaceTypeId',
            label: '关联炉型',
            type: 'slot',
            slotName: 'furnaceType',
            rowClass: 'first-row',
            colSpan: 6
          },
          {
            prop: 'description',
            label: '描述',
            type: 'textarea',
            placeholder: '请输入工艺模板描述',
            rows: 3,
            maxlength: 200,
            showWordLimit: true,
            rowClass: 'second-row',
            colSpan: 24
          }
        ]
      }
      
      // 2. 工艺段定义段
      const segmentsSection = {
        title: '二、工艺段定义',
        items: [
          {
            prop: 'segments',
            label: '',
            type: 'slot',
            slotName: 'segments'
          }
        ]
      }
      
      // 3. 适用产品范围段
      const productsSection = {
        title: '三、适用产品范围',
        items: [
          {
            prop: 'applicableProductIds',
            label: '',
            type: 'slot',
            slotName: 'applicableProducts'
          }
        ]
      }
      
      // 4. 版本与审批记录段（仅编辑和查看时显示）
      const sections = [baseSection, segmentsSection, productsSection]
      
      if (this.type !== 'create' && this.form.approvalLog) {
        const approvalSection = {
          title: '四、版本与审批记录',
          items: [
            {
              prop: 'createdBy',
              label: '创建人',
              type: 'input',
              disabled: true
            },
            {
              prop: 'createdAt',
              label: '创建时间',
              type: 'input',
              disabled: true
            },
            {
              prop: 'updatedBy',
              label: '最后修改人',
              type: 'input',
              disabled: true
            },
            {
              prop: 'updatedAt',
              label: '最后修改时间',
              type: 'input',
              disabled: true
            },
            {
              prop: 'approvalLog',
              label: '审批记录',
              type: 'slot',
              slotName: 'approvalLog'
            }
          ]
        }
        sections.push(approvalSection)
      }
      
      return sections
    }
  },
  watch: {
    // 监听可见性变化
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val) {
          // 抽屉打开时初始化数据
          this.initData()
        } else {
          // 抽屉关闭时重置表单数据和校验状态
          this.$nextTick(() => {
            // 完全重置表单数据为初始状态
            this.form = this.initFormData()
            // 清除所有验证
            if (this.$refs.drawerForm && this.$refs.drawerForm.$refs.form) {
              this.$refs.drawerForm.$refs.form.clearValidate()
            }
          })
        }
      },
      immediate: true
    },
    
    // 不再需要监听furnaceTypeId变化，现在通过capabilities-change事件处理
  },
  created() {
    // 获取炉型列表
    this.getFurnaceTypes()
    // 获取产品列表
    this.getProducts()
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        templateId: '',
        templateName: '',
        version: 'v1.0',
        status: 'draft',
        furnaceTypeId: '',
        description: '',
        segments: [],
        applicableProductIds: [],
        applicableProducts: []
      }
    },
    
    // 初始化数据
    initData() {
      // 无论什么情况都先重置表单
      this.form = this.initFormData()
      
      // 初始化默认炉型能力配置
      this.furnaceCapabilities = {
        hasBackZone: true,
        hasNegativePressure: true,
        hasCoolingValve: true,
        maxSegments: 12,
        maxTemperature: 1000,
        maxHeatingRate: 10,
        supportedAtmosphereTypes: ['纯氮气']
      }
      
      // 如果是新增模式
      if (this.type === 'create') {
        // 获取炉型列表
        this.getFurnaceTypes()
        
        // 创建默认工艺段
        this.createInitialSegment()
      } else if (this.templateData) {
        // 编辑或查看模式，复制传入的数据
        const data = JSON.parse(JSON.stringify(this.templateData))
        
        // 转换适用产品IDs
        const applicableProductIds = data.applicableProducts ? 
          data.applicableProducts.map(product => product.id) : []
        
        this.form = {
          ...data,
          applicableProductIds
        }
        
        // 如果没有工艺段数据，创建一个默认段
        if (!this.form.segments || !this.form.segments.length) {
          this.createInitialSegment()
        }
      }
    },
    
    // 获取炉型列表
    getFurnaceTypes() {
      getAllFurnaceTypes().then(response => {
        let furnaceTypes = []
        
        // 处理嵌套的API返回结构
        if (response && response.code === 20000) {
          if (response.data && response.data.items) {
            // 分页格式的返回
            furnaceTypes = response.data.items
          } else if (Array.isArray(response.data)) {
            // 直接返回数组的情况
            furnaceTypes = response.data
          }
        }
        
        this.furnaceTypeOptions = furnaceTypes.map(type => ({
          label: type.furnaceTypeName || type.name,
          value: type.furnaceTypeCode || type.id
        }))
      }).catch(() => {
        this.$message.error('获取炉型列表失败')
      })
    },
    
    // 获取产品列表
    getProducts() {
      getAllProductList().then(response => {
        // 防止response.data.items不是数组
        if (!response || !response.data || !response.data.items || !Array.isArray(response.data.items)) {
          console.error('产品列表数据格式不正确', response)
          this.$message.error('产品列表数据格式不正确')
          this.productOptions = []
          return
        }
        
        const products = response.data.items
        this.productOptions = products.map(product => ({
          id: product.id,
          name: `${product.name} (${product.code})`,
          code: product.code
        }))
      }).catch((error) => {
        console.error('获取产品列表失败', error)
        this.$message({
          message: '获取产品列表失败',
          type: 'error',
          duration: 3000
        })
        this.productOptions = []
      })
    },
    
    // 更新炉型能力配置
    handleFurnaceCapabilitiesChange(capabilities) {
      // 更新炉型能力配置
      this.furnaceCapabilities = capabilities || {
        hasBackZone: true,
        hasNegativePressure: true,
        hasCoolingValve: true,
        maxSegments: 12,
        maxTemperature: 1000,
        maxHeatingRate: 10,
        supportedAtmosphereTypes: ['纯氮气']
      }
      
      // 映射字段名称，确保与ProcessSegmentTable组件期望的字段名称一致
      if (capabilities) {
        // 映射后区循环风机字段
        if (capabilities.hasRearCirculationFan !== undefined) {
          this.furnaceCapabilities.hasBackZone = capabilities.hasRearCirculationFan
        }
        
        // 映射负压风机字段
        if (capabilities.hasVacuumFan !== undefined) {
          this.furnaceCapabilities.hasNegativePressure = capabilities.hasVacuumFan
        }
        
        // 映射吹洗阀字段
        if (capabilities.hasPurgeValve !== undefined) {
          this.furnaceCapabilities.hasCoolingValve = capabilities.hasPurgeValve
        }
        
        // 映射最高温度字段
        if (capabilities.maxTemperatureLimit !== undefined) {
          this.furnaceCapabilities.maxTemperature = capabilities.maxTemperatureLimit
        }
      }
      
      console.log('工艺模板表单接收到炉型能力配置:', this.furnaceCapabilities)
      
      // 根据新的炉型能力配置更新工艺段
      if (this.form.segments && this.form.segments.length > 0) {
        // 如果工艺段数超过最大限制，截断多余段
        if (this.form.segments.length > this.furnaceCapabilities.maxSegments) {
          this.$message.warning(`根据所选炉型，工艺段数量已自动调整为${this.furnaceCapabilities.maxSegments}段`)
          this.form.segments = this.form.segments.slice(0, this.furnaceCapabilities.maxSegments)
        }
        
        // 强制更新工艺段表格组件
        this.$nextTick(() => {
          // 确保工艺段表格组件能够感知到炉型能力配置的变化
          this.$forceUpdate()
        })
      }
    },
    
    // 获取抽屉标题
    getDrawerTitle() {
      if (this.type === 'create') {
        return '新增工艺模板'
      } else if (this.type === 'update') {
        return `编辑工艺模板: ${this.form.templateId || ''}`
      } else {
        return `查看工艺模板: ${this.form.templateId || ''}`
      }
    },
    
    // 处理工艺段变化（通过change事件）
    handleSegmentsChange(segments) {
      console.log('ProcessTemplateFormDrawer: handleSegmentsChange called')
      this.form.segments = JSON.parse(JSON.stringify(segments))
      // 确保图表更新
      this.$nextTick(() => {
        if (this.$refs.processCurveChart) {
          console.log('ProcessTemplateFormDrawer: forcing chart update')
          // 强制更新图表
          this.$refs.processCurveChart.updateChartData()
          this.$refs.processCurveChart.updateChart()
        }
      })
    },
    
    // 处理工艺段变化（通过input事件）
    handleSegmentsInput(segments) {
      console.log('ProcessTemplateFormDrawer: handleSegmentsInput called')
      this.form.segments = JSON.parse(JSON.stringify(segments))
      // 确保图表更新
      this.$nextTick(() => {
        if (this.$refs.processCurveChart) {
          console.log('ProcessTemplateFormDrawer: forcing chart update from input')
          // 强制更新图表
          this.$refs.processCurveChart.updateChartData()
          this.$refs.processCurveChart.updateChart()
        }
      })
    },
    
    // 处理表单验证和提交
    validateAndSubmit() {
      // 首先执行默认的表单验证
      this.$refs.drawerForm.$refs.form.validate((valid) => {
        if (valid) {
          // 表单基本校验通过后，执行自定义校验
          if (this.validateSegmentsTemperature()) {
            this.$refs.drawerForm.submitForm()
          }
        }
      })
    },
    
    // 自定义校验 - 检查工艺段目标温度是否超过炉型上限
    validateSegmentsTemperature() {
      // 如果没有选择炉型或没有工艺段数据，不执行校验
      if (!this.furnaceCapabilities || !this.form.segments || !this.form.segments.length) {
        return true
      }
      
      const maxTemp = this.furnaceCapabilities.maxTemperature || 1000
      const exceedSegments = this.form.segments.filter(segment => segment.targetTemp > maxTemp)
      
      if (exceedSegments.length > 0) {
        // 找到超出温度限制的段
        const segmentNumbers = exceedSegments.map(s => s.segmentNumber).join('、')
        this.$confirm(
          `工艺段 ${segmentNumbers} 的目标温度超过了所选炉型的最高温度限制 (${maxTemp}°C)，是否继续保存？`,
          '温度超限警告',
          {
            confirmButtonText: '继续保存',
            cancelButtonText: '返回修改',
            type: 'warning'
          }
        ).then(() => {
          // 用户确认继续，提交表单
          this.$refs.drawerForm.submitForm()
        }).catch(() => {
          // 用户选择返回修改
          this.$message({
            type: 'info',
            message: '请调整工艺段温度后再保存'
          })
          return false
        })
        
        return false // 阻止默认提交
      }
      
      return true // 没有问题，允许提交
    },
    
    // 处理表单数据变化
    handleFormChange(changedFields) {
      // 更新本地表单数据，保留原有数据不被覆盖
      if (changedFields && Object.keys(changedFields).length > 0) {
        console.log('表单数据更新(来自DrawerForm):', JSON.stringify(changedFields, null, 2))
        
        // 比较新旧数据，检查是否有实际变化
        let hasChanged = false
        Object.keys(changedFields).forEach(key => {
          if (JSON.stringify(this.form[key]) !== JSON.stringify(changedFields[key])) {
            this.form[key] = changedFields[key]
            hasChanged = true
          }
        })
        
        if (hasChanged) {
          console.log('表单数据已实际更新，当前form数据:', JSON.stringify(this.form, null, 2))
        }
      }
    },
    
    // 处理表单提交（验证通过后）
    handleFormSubmit(formData) {
      // 构建提交数据，合并DrawerForm提交的数据和本地表单数据
      const submitData = { ...formData, ...this.form }
      console.log('合并后的提交数据:', submitData)
      
      // 将适用产品IDs转换为对象数组
      submitData.applicableProducts = submitData.applicableProductIds.map(id => {
        const product = this.productOptions.find(p => p.id === id)
        return {
          id,
          name: product ? product.name : '',
          code: product ? product.code : ''
        }
      })
      
      // 触发提交事件
      this.$emit('submit', submitData)
    },
    
    // 处理关闭
    handleClose() {
      this.$emit('close')
      this.$emit('update:visible', false)
      // 重置表单校验状态和数据
      if (this.$refs.drawerForm) {
        this.$refs.drawerForm.$refs.form && this.$refs.drawerForm.$refs.form.clearValidate()
      }
      // 完全重置表单为初始状态
      this.form = this.initFormData()
    },
    
    // 获取时间线项目类型
    getTimelineItemType(action) {
      if (action === '提交审批') return 'primary'
      if (action === '批准') return 'success'
      if (action === '驳回') return 'danger'
      return 'info'
    },
    
    // 获取时间线项目图标
    getTimelineItemIcon(action) {
      if (action === '提交审批') return 'el-icon-s-promotion'
      if (action === '批准') return 'el-icon-check'
      if (action === '驳回') return 'el-icon-close'
      return 'el-icon-more'
    },
    
    // 创建初始工艺段
    createInitialSegment() {
      this.form.segments = [{
        segmentNumber: 1,
        segmentType: '升温',
        targetTemp: 300,
        duration: 1, // 默认使用1小时作为持续时间单位
        vfQSet: this.furnaceCapabilities.hasBackZone !== false ? 30 : 0,
        vfHSet: this.furnaceCapabilities.hasBackZone ? 30 : 0,
        vfFySet: this.furnaceCapabilities.hasNegativePressure ? 10 : 0,
        cvSet: this.furnaceCapabilities.hasCoolingValve ? 0 : 0 // 确保吹洗阀被设置为0而不是undefined
      }]
      
      // 清除可能的验证错误
      this.$nextTick(() => {
        if (this.$refs.drawerForm && this.$refs.drawerForm.$refs.form) {
          this.$refs.drawerForm.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>

<style lang="scss">
/* 使用非scoped样式以确保覆盖Element UI默认样式 */
.el-transfer-panel {
  width: 500px !important;
  min-width: 500px !important;
  max-width: 500px !important;
}

.el-drawer__wrapper {
  .el-drawer__body {
    height: calc(100% - 55px);
    overflow-y: auto;
  }
}
</style>

<style lang="scss" scoped>
.segments-container {
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  
  // 确保子组件能够撑满容器宽度
  :deep(.process-curve-chart),
  :deep(.process-segment-table) {
    width: 100%;
    overflow-x: auto;
  }
  
  :deep(.chart-container) {
    width: 100% !important;
    min-width: 800px;
  }
}

.transfer-footer {
  margin-left: 20px;
  color: #606266;
  font-size: 12px;
}

.approval-log {
  padding: 10px 0;
  
  .timeline-content {
    .timeline-title {
      font-weight: bold;
      margin-bottom: 5px;
      
      .timeline-user {
        font-weight: normal;
        font-size: 12px;
        color: #909399;
        margin-left: 10px;
      }
    }
    
    .timeline-comment {
      font-size: 13px;
      color: #606266;
      padding: 5px 0;
    }
  }
}

::v-deep(.el-transfer__panel) {  
  width: 500px !important;
  flex: none !important;
}
</style>


