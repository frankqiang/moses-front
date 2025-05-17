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
    width="1500px"
    direction="rtl"
    :wrapper-closable="false"
    @submit="handleFormSubmit"
    @close="handleClose"
  >
    <template #footer>
      <el-button @click="handleClose">{{ type === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="type !== 'view'" type="primary" @click="handleSubmit" :loading="loading">{{ type === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </template>
    
    <!-- 工艺段定义区域 -->
    <template #segments>
      <div class="segments-container">
        <!-- 工艺曲线图表 -->
        <process-curve-chart
          :segments="form.segments"
          height="300"
          :interactive="false"
          :initial-temp="25"
        />
        
        <!-- 工艺段表格 -->
        <process-segment-table
          v-model="form.segments"
          :disabled="type === 'view'"
          :furnace-capabilities="furnaceCapabilities"
          @change="handleSegmentsChange"
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
import { getFurnaceTypeList } from '@/api/master-data/process-parameter'
import { getAllProductList } from '@/api/master-data/product-management'

export default {
  name: 'ProcessTemplateFormDrawer',
  components: {
    DrawerForm,
    ProcessCurveChart,
    ProcessSegmentTable
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
          { type: 'array', required: true, message: '请选择适用产品范围', trigger: 'change' }
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
            disabled: true
          },
          {
            prop: 'templateName',
            label: '模板名称',
            type: 'input',
            placeholder: '请输入工艺模板名称',
            maxlength: 50,
            showWordLimit: true
          },
          {
            prop: 'version',
            label: '版本号',
            type: 'input',
            placeholder: '系统自动生成',
            disabled: true
          },
          {
            prop: 'furnaceTypeId',
            label: '关联炉型',
            type: 'select',
            placeholder: '请选择关联炉型',
            options: this.furnaceTypeOptions
          },
          {
            prop: 'description',
            label: '描述',
            type: 'textarea',
            placeholder: '请输入工艺模板描述',
            rows: 3,
            maxlength: 200,
            showWordLimit: true
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
        }
      },
      immediate: true
    },
    
    // 监听关联炉型变化
    'form.furnaceTypeId': {
      handler(val) {
        if (val) {
          this.updateFurnaceCapabilities(val)
        }
      }
    }
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
      if (this.type === 'create') {
        // 新增模式
        this.form = this.initFormData()
        // 创建一个默认工艺段
        this.form.segments = [
          {
            segmentNumber: 1,
            segmentType: '升温',
            targetTemp: 300,
            duration: 120,
            vfQSet: 30,
            vfHSet: 30,
            vfFySet: 10,
            cvSet: 0
          }
        ]
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
          this.form.segments = [
            {
              segmentNumber: 1,
              segmentType: '升温',
              targetTemp: 300,
              duration: 120,
              vfQSet: 30,
              vfHSet: 30,
              vfFySet: 10,
              cvSet: 0
            }
          ]
        }
        
        // 更新炉型能力配置
        if (this.form.furnaceTypeId) {
          this.updateFurnaceCapabilities(this.form.furnaceTypeId)
        }
      }
    },
    
    // 获取炉型列表
    getFurnaceTypes() {
      getFurnaceTypeList().then(response => {
        const furnaceTypes = response.data || []
        this.furnaceTypeOptions = furnaceTypes.map(type => ({
          label: type.name,
          value: type.id
        }))
      }).catch(() => {
        this.$message.error('获取炉型列表失败')
      })
    },
    
    // 获取产品列表
    getProducts() {
      getAllProductList().then(response => {
        const products = response.data || []
        this.productOptions = products.map(product => ({
          id: product.id,
          name: `${product.name} (${product.code})`,
          code: product.code
        }))
      }).catch(() => {
        this.$message.error('获取产品列表失败')
      })
    },
    
    // 更新炉型能力配置
    updateFurnaceCapabilities(furnaceTypeId) {
      const furnaceType = this.furnaceTypeOptions.find(option => option.value === furnaceTypeId)
      if (!furnaceType) return
      
      // 查找完整的炉型数据
      getFurnaceTypeList().then(response => {
        const furnaceTypes = response.data || []
        const selectedType = furnaceTypes.find(type => type.id === furnaceTypeId)
        
        if (selectedType && selectedType.capabilities) {
          this.furnaceCapabilities = selectedType.capabilities
        } else {
          // 默认配置
          this.furnaceCapabilities = {
            hasBackZone: true,
            hasNegativePressure: true,
            hasCoolingValve: true,
            maxSegments: 12
          }
        }
      }).catch(() => {
        // 出错时使用默认配置
        this.furnaceCapabilities = {
          hasBackZone: true,
          hasNegativePressure: true,
          hasCoolingValve: true,
          maxSegments: 12
        }
      })
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
    
    // 处理工艺段变化
    handleSegmentsChange(segments) {
      this.form.segments = segments
    },
    
    // 处理表单提交
    handleSubmit() {
      this.$refs.drawerForm.submitForm()
    },
    
    // 处理表单提交（验证通过后）
    handleFormSubmit() {
      // 构建提交数据
      const formData = JSON.parse(JSON.stringify(this.form))
      
      // 将适用产品IDs转换为对象数组
      formData.applicableProducts = this.form.applicableProductIds.map(id => {
        const product = this.productOptions.find(p => p.id === id)
        return {
          id,
          name: product ? product.name : '',
          code: product ? product.code : ''
        }
      })
      
      // 触发提交事件
      this.$emit('submit', formData)
    },
    
    // 处理关闭
    handleClose() {
      this.$emit('close')
      this.$emit('update:visible', false)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.segments-container {
  margin-bottom: 20px;
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
</style>
