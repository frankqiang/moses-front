/**
 * 设备表单抽屉组件
 * 功能描述：提供设备新增、编辑和查看功能的表单，使用抽屉方式展示
 * 创建日期：2023-11-05
 * 更新日期：2024-10-28
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
    width="550px"
    direction="rtl"
    :wrapper-closable="false"
    @submit="handleFormSubmit"
    @close="handleClose"
  >
    <template #footer>
      <el-button @click="handleClose">{{ type === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="type === 'create'" type="primary" @click="handleSubmitAndContinue" :loading="loading">保存并继续</el-button>
      <el-button v-if="type !== 'view'" type="primary" @click="handleSubmit" :loading="loading">{{ type === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </template>
  </drawer-form>
</template>

<script>
import DrawerForm from '@/components/DrawerForm'

export default {
  name: 'EquipmentFormDrawer',
  components: {
    DrawerForm
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
    // 设备类型
    equipmentType: {
      type: String,
      required: true
    },
    // 设备数据（编辑和查看时使用）
    equipmentData: {
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
      // 服务区域选项（行车）
      serviceAreaOptions: [
        { label: 'A区1-5炉', value: 'A区1-5炉' },
        { label: 'B区缓存位', value: 'B区缓存位' },
        { label: 'C区装车位', value: 'C区装车位' },
        { label: 'D区检查台', value: 'D区检查台' }
      ]
    }
  },
  computed: {
    // 动态表单规则
    rules() {
      return {
        equipmentId: [
          { required: false, message: '请输入设备ID', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择设备状态', trigger: 'change' }
        ],
        // 退火炉特有字段验证
        capacity: [
          { required: this.equipmentType === 'FURNACE', message: '请输入规格容量', trigger: 'blur' }
        ],
        plcAddress: [
          { required: this.equipmentType === 'FURNACE', message: '请输入PLC通讯地址', trigger: 'blur' }
        ],
        // 行车特有字段验证
        liftCapacity: [
          { required: this.equipmentType === 'CRANE', message: '请输入额定起重量', trigger: 'blur' }
        ],
        controlInterface: [
          { required: this.equipmentType === 'CRANE', message: '请输入控制系统接口', trigger: 'blur' }
        ]
      }
    },
    
    // 动态表单分段
    formSections() {
      // 1. 基础信息段
      const baseSection = {
        title: '一、基础信息',
        items: [
          {
            prop: 'equipmentId',
            label: '设备ID',
            type: 'input',
            placeholder: '输入或系统自动生成',
            disabled: this.type === 'update'
          },
          {
            prop: 'name',
            label: '设备名称',
            type: 'input',
            placeholder: '请输入设备名称',
            maxlength: 50,
            showWordLimit: true
          },
          {
            prop: 'model',
            label: '设备型号',
            type: 'input',
            placeholder: '请输入设备型号',
            maxlength: 30,
            showWordLimit: true
          },
          {
            prop: 'installDate',
            label: '安装日期',
            type: 'date',
            placeholder: '选择安装日期',
            valueFormat: 'yyyy-MM-dd'
          },
          {
            prop: 'status',
            label: '设备状态',
            type: 'radio',
            options: [
              { label: '启用', value: 1 },
              { label: '禁用', value: 0 }
            ]
          }
        ]
      }
      
      // 2. 特定设备类型参数段
      let specificSection = {
        title: `二、${this.getTypeSpecificTitle()}`,
        items: []
      }
      
      if (this.equipmentType === 'FURNACE') {
        specificSection.items = [
          {
            prop: 'capacity',
            label: '规格(容量)',
            type: 'number-with-unit',
            min: 0,
            step: 5,
            precision: 0,
            unit: 'T'
          },
          {
            prop: 'maxTemperature',
            label: '最大温度',
            type: 'number-with-unit',
            min: 0,
            max: 2000,
            step: 50,
            precision: 0,
            unit: '°C'
          },
          {
            prop: 'ratedPower',
            label: '额定功率',
            type: 'number-with-unit',
            min: 0,
            step: 10,
            precision: 0,
            unit: 'kW'
          },
          {
            prop: 'plcAddress',
            label: 'PLC通讯地址',
            type: 'input',
            placeholder: '例如：192.168.1.10:502',
            tip: '请确保格式正确，如：opc.tcp://address:port/server'
          },
          {
            prop: 'maintenanceCycle',
            label: '维护周期',
            type: 'number-with-unit',
            min: 1,
            step: 30,
            precision: 0,
            unit: '天'
          }
        ]
      } else if (this.equipmentType === 'CRANE') {
        specificSection.items = [
          {
            prop: 'liftCapacity',
            label: '额定起重量',
            type: 'number-with-unit',
            min: 0,
            step: 1,
            precision: 1,
            unit: 'T'
          },
          {
            prop: 'movingSpeed',
            label: '运行速度',
            type: 'input',
            placeholder: '例如：主0-20 / 副0-60',
            unit: 'm/min'
          },
          {
            prop: 'serviceAreas',
            label: '服务范围',
            type: 'select',
            multiple: true,
            filterable: true,
            placeholder: '请选择或输入服务范围',
            options: this.serviceAreaOptions
          },
          {
            prop: 'controlInterface',
            label: '控制系统接口',
            type: 'input',
            placeholder: '例如：TCP:192.168.1.20:10001',
            tip: '请注明协议及地址端口'
          }
        ]
      } else if (this.equipmentType === 'AUTO_CART') {
        specificSection.items = [
          {
            prop: 'loadCapacity',
            label: '载重能力',
            type: 'number-with-unit',
            min: 0,
            step: 1,
            precision: 1,
            unit: 'T'
          },
          {
            prop: 'movingSpeed',
            label: '移动速度',
            type: 'number-with-unit',
            min: 0,
            step: 5,
            precision: 1,
            unit: 'm/min'
          },
          {
            prop: 'navigationMode',
            label: '导航方式',
            type: 'select',
            placeholder: '请选择导航方式',
            options: [
              { label: '激光导航', value: 'LASER' },
              { label: '磁导航', value: 'MAGNETIC' },
              { label: '视觉导航', value: 'VISION' },
              { label: '惯性导航', value: 'INERTIAL' }
            ]
          },
          {
            prop: 'chargingType',
            label: '充电类型',
            type: 'select',
            placeholder: '请选择充电类型',
            options: [
              { label: '自动充电', value: 'AUTO' },
              { label: '手动充电', value: 'MANUAL' },
              { label: '电池更换', value: 'BATTERY_SWAP' }
            ]
          }
        ]
      } else if (this.equipmentType === 'STAGING_TABLE') {
        specificSection.items = [
          {
            prop: 'bearingCapacity',
            label: '承载能力',
            type: 'number-with-unit',
            min: 0,
            step: 1,
            precision: 1,
            unit: 'T'
          },
          {
            prop: 'dimensions',
            label: '台面尺寸',
            type: 'input',
            placeholder: '例如：3.5×2.0×0.8',
            unit: 'm'
          },
          {
            prop: 'surfaceMaterial',
            label: '台面材质',
            type: 'select',
            placeholder: '请选择台面材质',
            options: [
              { label: '碳钢', value: 'CARBON_STEEL' },
              { label: '不锈钢', value: 'STAINLESS_STEEL' },
              { label: '合金钢', value: 'ALLOY_STEEL' },
              { label: '其他', value: 'OTHER' }
            ]
          },
          {
            prop: 'functionType',
            label: '功能类型',
            type: 'select',
            placeholder: '请选择功能类型',
            options: [
              { label: '固定式', value: 'FIXED' },
              { label: '可移动式', value: 'MOVABLE' },
              { label: '可调高度', value: 'ADJUSTABLE_HEIGHT' },
              { label: '多功能', value: 'MULTI_FUNCTION' }
            ]
          }
        ]
      }
      
      // 3. 其他信息段
      const otherSection = {
        title: '三、其他信息',
        items: [
          {
            prop: 'supplier',
            label: '供应商',
            type: 'input',
            placeholder: '请输入供应商名称',
            maxlength: 50,
            showWordLimit: true
          },
          {
            prop: 'remarks',
            label: '备注',
            type: 'textarea',
            placeholder: '请输入备注信息',
            maxlength: 200,
            showWordLimit: true,
            rows: 3
          }
        ]
      }
      
      return [baseSection, specificSection, otherSection]
    }
  },
  watch: {
    // 监听visible变化
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val && this.type !== 'create') {
          this.setFormData()
        } else if (val && this.type === 'create') {
          this.form = this.initFormData()
        }
      },
      immediate: true
    },
    // 监听drawerVisible变化，同步到父组件
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    // 监听设备类型变化，重置表单
    equipmentType() {
      if (this.type === 'create') {
        this.form = this.initFormData()
      }
    }
  },
  methods: {
    // 获取抽屉标题
    getDrawerTitle() {
      const typeMap = {
        'FURNACE': '退火炉',
        'CRANE': '行车',
        'AUTO_CART': '自动料车',
        'STAGING_TABLE': '备料台'
      }
      const equipmentTypeText = typeMap[this.equipmentType] || '设备'
      
      if (this.type === 'create') {
        return `新增${equipmentTypeText}`
      } else if (this.type === 'update') {
        return `编辑: ${this.form.equipmentId || ''}`
      } else {
        return `查看: ${this.form.equipmentId || ''}`
      }
    },
    
    // 获取特定设备类型的标题
    getTypeSpecificTitle() {
      const typeMap = {
        'FURNACE': '退火炉特性参数',
        'CRANE': '行车特性参数',
        'AUTO_CART': '自动料车特性参数',
        'STAGING_TABLE': '备料台特性参数'
      }
      return typeMap[this.equipmentType] || '设备特性参数'
    },
    
    // 初始化表单数据
    initFormData() {
      // 通用字段
      const commonFields = {
        id: undefined,
        equipmentId: '',
        name: '',
        model: '',
        installDate: '',
        status: 1,
        supplier: '',
        remarks: ''
      }
      
      // 根据设备类型添加特定字段
      let specificFields = {}
      
      if (this.equipmentType === 'FURNACE') {
        specificFields = {
          capacity: 40,
          maxTemperature: 1150,
          ratedPower: 350,
          plcAddress: '',
          maintenanceCycle: 90
        }
      } else if (this.equipmentType === 'CRANE') {
        specificFields = {
          liftCapacity: 10,
          movingSpeed: '',
          serviceAreas: [],
          controlInterface: ''
        }
      } else if (this.equipmentType === 'AUTO_CART') {
        specificFields = {
          loadCapacity: 5,
          movingSpeed: 20,
          navigationMode: 'LASER',
          chargingType: 'AUTO'
        }
      } else if (this.equipmentType === 'STAGING_TABLE') {
        specificFields = {
          bearingCapacity: 10,
          dimensions: '',
          surfaceMaterial: 'CARBON_STEEL',
          functionType: 'FIXED'
        }
      }
      
      return { ...commonFields, ...specificFields }
    },
    
    // 设置表单数据（编辑和查看时）
    setFormData() {
      if (!this.equipmentData) return
      
      // 浅拷贝设备数据
      Object.assign(this.form, this.equipmentData)
      
      // 特殊处理字段
      if (this.equipmentType === 'CRANE' && this.equipmentData.serviceArea) {
        // 如果serviceArea是字符串，转换为数组
        this.form.serviceAreas = typeof this.equipmentData.serviceArea === 'string' 
          ? this.equipmentData.serviceArea.split(',') 
          : this.equipmentData.serviceArea
      }
    },
    
    // 表单重置
    resetForm() {
      this.$refs.drawerForm && this.$refs.drawerForm.resetForm()
    },
    
    // 关闭抽屉
    handleClose() {
      this.drawerVisible = false
      this.$emit('close')
      setTimeout(() => {
        this.form = this.initFormData()
      }, 300)
    },
    
    // 处理提交
    handleSubmit() {
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (valid) {
          this.submitFormData(false)
        }
      })
    },
    
    // 保存并继续
    handleSubmitAndContinue() {
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (valid) {
          this.submitFormData(true)
        }
      })
    },
    
    // 表单提交处理
    handleFormSubmit(formData, continueCreate) {
      this.submitFormData(continueCreate)
    },
    
    // 提交表单数据
    submitFormData(continueCreate) {
      // 特殊处理字段
      const formData = { ...this.form }
      
      // 设置设备类型
      formData.equipmentType = this.equipmentType
      
      if (this.equipmentType === 'CRANE' && Array.isArray(formData.serviceAreas)) {
        formData.serviceArea = formData.serviceAreas.join(',')
        delete formData.serviceAreas
      }
      
      this.loading = true
      this.$emit('submit', formData, continueCreate)
      
      // 由于提交是异步的，这里不能直接设置loading=false
      // 父组件负责在提交完成后关闭抽屉或重置表单
      setTimeout(() => {
        this.loading = false
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-form-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #e6e6e6;
  }
  
  :deep(.el-drawer__body) {
    height: calc(100% - 140px);
    overflow: hidden;
    padding: 0;
  }
}

.drawer-content {
  padding: 20px;
  height: calc(100% - 80px); /* 减去footer高度 */
  overflow-y: auto;
  position: relative;
}

.form-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
}

.unit-label {
  margin-left: 8px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e6e6e6;
  text-align: right;
  z-index: 1;
  
  .el-button {
    margin-left: 10px;
  }
}
</style> 