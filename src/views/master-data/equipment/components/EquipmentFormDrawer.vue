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
    @open="handleDrawerOpen"
    @form-change="handleFormChange"
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
import { getAllFurnaceTypes } from '@/api/master-data/furnace-type'

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
      ],
      // 炉型列表选项
      furnaceTypeOptions: [],
      // 炉型列表加载状态
      furnaceTypesLoading: false,
      // 用户交互标志
      userInteracted: false
    }
  },
  computed: {
    // 动态表单规则
    rules() {
      const furnaceRules = {
        furnaceTypeCode: [
          { 
            required: this.equipmentType === 'FURNACE', 
            message: '请选择所属炉型', 
            trigger: 'change',
            // 添加验证器，只在用户手动触发时才显示错误
            validator: (rule, value, callback) => {
              // 如果是第一次加载且用户还未交互，不显示错误
              if (this.type === 'create' && !this.userInteracted) {
                callback()
                return
              }
              
              // 常规验证逻辑
              if (rule.required && (!value || value === '')) {
                callback(new Error(rule.message))
              } else {
                callback()
              }
            }
          }
        ]
      }
      
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
        ...furnaceRules,
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
            prop: 'furnaceTypeCode',
            label: '所属炉型',
            type: 'select',
            placeholder: '请选择炉型',
            options: this.furnaceTypeOptions,
            loading: this.furnaceTypesLoading,
            filterable: true,
            clearable: true,
            tip: '选择退火炉所属的炉型，关联炉型能力参数',
            events: {
              change: this.handleFurnaceTypeChange
            }
          },
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
        if (val) {
          if (this.type === 'create') {
            // 初始化表单数据
            this.form = this.initFormData()
            console.log('可见性变化，初始化数据:', this.form)
          } else if (this.equipmentData) {
            // 设置表单数据
            this.setFormData()
            console.log('可见性变化，设置数据:', this.form)
          }
        }
      },
      immediate: true
    },
    // 监听drawerVisible变化，同步到父组件
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    // 监听设备类型变化，如果是退火炉，加载炉型列表
    equipmentType: {
      handler(newVal) {
        if (newVal === 'FURNACE' && this.furnaceTypeOptions.length === 0) {
          this.loadFurnaceTypes()
        }
        
        // 如果类型变化，重新初始化表单
        if (this.type === 'create' && this.drawerVisible) {
          this.form = this.initFormData()
          console.log('设备类型变化，重新初始化数据:', this.form)
        }
      },
      immediate: true
    },
    // 监听equipmentData变化
    equipmentData: {
      handler(newVal) {
        if (this.type !== 'create' && newVal && this.drawerVisible) {
          this.setFormData()
          console.log('设备数据变化，更新表单:', this.form)
        }
      },
      deep: true
    }
  },
  created() {
    // 如果是FURNACE类型，加载炉型选项
    if (this.equipmentType === 'FURNACE') {
      this.loadFurnaceTypes()
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
    
    // 加载炉型列表
    loadFurnaceTypes() {
      this.furnaceTypesLoading = true
      getAllFurnaceTypes()
        .then(response => {
          // 根据API返回格式处理数据
          let furnaceTypes = [];
          
          // 处理不同的API返回结构
          if (response.data && Array.isArray(response.data.items)) {
            // 标准分页格式的返回
            furnaceTypes = response.data.items;
          } else if (Array.isArray(response.data)) {
            // 直接返回数组的情况
            furnaceTypes = response.data;
          } else {
            console.error('无法识别的炉型数据格式:', response.data);
            furnaceTypes = [];
          }
          
          // 转换为下拉选项格式
          this.furnaceTypeOptions = furnaceTypes
            .filter(item => item.status === 'enabled' || item.status === 1) // 只显示启用的炉型
            .map(item => ({
              label: item.furnaceTypeName 
                ? `${item.furnaceTypeName} (${item.furnaceTypeCode})`
                : item.furnaceTypeCode,
              value: item.furnaceTypeCode
            }));
            
          // 如果当前表单已有炉型编码，但不在可选列表中（可能是已禁用的炉型）
          if (this.form.furnaceTypeCode && 
              !this.furnaceTypeOptions.some(option => option.value === this.form.furnaceTypeCode)) {
            // 找到对应的炉型数据
            const disabledType = furnaceTypes.find(item => item.furnaceTypeCode === this.form.furnaceTypeCode);
            if (disabledType) {
              // 添加此禁用的炉型到选项列表
              this.furnaceTypeOptions.push({
                label: disabledType.furnaceTypeName 
                  ? `${disabledType.furnaceTypeName} (${disabledType.furnaceTypeCode}) [已禁用]`
                  : `${disabledType.furnaceTypeCode} [已禁用]`,
                value: disabledType.furnaceTypeCode
              });
            }
          }
          
          this.furnaceTypesLoading = false
        })
        .catch(error => {
          console.error('加载炉型列表失败:', error)
          this.furnaceTypesLoading = false
          this.$message.error('获取炉型列表失败，请检查网络或联系管理员')
        });
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
          maintenanceCycle: 90,
          furnaceTypeCode: '' // 新增炉型代码字段
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
      
      // 深拷贝设备数据，避免直接修改源数据
      this.form = JSON.parse(JSON.stringify(this.initFormData()))
      
      // 复制通用字段
      const commonFields = ['id', 'equipmentId', 'name', 'model', 'installDate', 'status', 'supplier', 'remarks']
      commonFields.forEach(field => {
        if (this.equipmentData[field] !== undefined) {
          this.form[field] = this.equipmentData[field]
        }
      })
      
      // 根据设备类型复制特定字段
      if (this.equipmentType === 'FURNACE') {
        const furnaceFields = ['capacity', 'maxTemperature', 'ratedPower', 'plcAddress', 'maintenanceCycle']
        furnaceFields.forEach(field => {
          if (this.equipmentData[field] !== undefined) {
            this.form[field] = this.equipmentData[field]
          }
        })
        
        // 特殊处理炉型字段
        if (this.equipmentData.furnaceTypeCode) {
          this.form.furnaceTypeCode = this.equipmentData.furnaceTypeCode
        }
        
        // 确保对数值型字段进行转换
        this.form.capacity = Number(this.form.capacity)
        this.form.maxTemperature = Number(this.form.maxTemperature)
        this.form.ratedPower = Number(this.form.ratedPower)
        this.form.maintenanceCycle = Number(this.form.maintenanceCycle)
        
      } else if (this.equipmentType === 'CRANE') {
        const craneFields = ['liftCapacity', 'movingSpeed', 'controlInterface']
        craneFields.forEach(field => {
          if (this.equipmentData[field] !== undefined) {
            this.form[field] = this.equipmentData[field]
          }
        })
        
        // 特殊处理服务区域字段，确保是数组类型
        if (this.equipmentData.serviceArea) {
          this.form.serviceAreas = typeof this.equipmentData.serviceArea === 'string' 
            ? this.equipmentData.serviceArea.split(',') 
            : this.equipmentData.serviceArea
        }
        
        // 确保对数值型字段进行转换
        this.form.liftCapacity = Number(this.form.liftCapacity)
        
      } else if (this.equipmentType === 'AUTO_CART') {
        const cartFields = ['loadCapacity', 'movingSpeed', 'navigationMode', 'chargingType']
        cartFields.forEach(field => {
          if (this.equipmentData[field] !== undefined) {
            this.form[field] = this.equipmentData[field]
          }
        })
        
        // 确保对数值型字段进行转换
        this.form.loadCapacity = Number(this.form.loadCapacity)
        this.form.movingSpeed = Number(this.form.movingSpeed)
        
      } else if (this.equipmentType === 'STAGING_TABLE') {
        const tableFields = ['bearingCapacity', 'dimensions', 'surfaceMaterial', 'functionType']
        tableFields.forEach(field => {
          if (this.equipmentData[field] !== undefined) {
            this.form[field] = this.equipmentData[field]
          }
        })
        
        // 确保对数值型字段进行转换
        this.form.bearingCapacity = Number(this.form.bearingCapacity)
      }
      
      // 如果是退火炉并且有炉型代码，但炉型选项列表为空，则加载炉型列表
      if (this.equipmentType === 'FURNACE' && this.form.furnaceTypeCode && this.furnaceTypeOptions.length === 0) {
        this.loadFurnaceTypes()
      }
    },
    
    // 表单重置
    resetForm() {
      this.$refs.drawerForm && this.$refs.drawerForm.resetForm()
    },
    
    // 关闭抽屉
    handleClose() {         
      // 先清除表单验证信息，特别是炉型字段的校验信息
      if (this.$refs.drawerForm && this.$refs.drawerForm.$refs.form) {
        this.$refs.drawerForm.$refs.form.clearValidate()
      }
      this.drawerVisible = false
      this.$emit('close')
    },
    
    // 处理提交
    handleSubmit() {
      // 标记用户已交互，以便触发完整验证
      this.userInteracted = true
      
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (valid) {
          // 在提交前确保表单数据已同步
          console.log('提交数据验证通过，提交的表单数据:', this.form)
          this.submitFormData(false)
        } else {
          this.$message.warning('表单填写有误，请检查')
          return false
        }
      })
    },
    
    // 保存并继续
    handleSubmitAndContinue() {
      // 标记用户已交互，以便触发完整验证
      this.userInteracted = true
      
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (valid) {
          // 在提交前确保表单数据已同步
          console.log('提交并继续验证通过，提交的表单数据:', this.form)
          this.submitFormData(true)
        } else {
          this.$message.warning('表单填写有误，请检查')
          return false
        }
      })
    },
    
    // 表单提交处理
    handleFormSubmit(formData, continueCreate) {
      // 关键：在这里我们需要确保使用的是本地form数据，而不是传入的formData
      console.log('DrawerForm提交的原始数据:', JSON.stringify(formData, null, 2));
      console.log('本地表单数据:', JSON.stringify(this.form, null, 2));
      
      // 合并数据，确保同时获取到两边的数据
      const mergedData = { ...formData, ...this.form };
      console.log('合并后的表单数据:', JSON.stringify(mergedData, null, 2));
      
      // 使用合并后的数据继续提交
      this.submitFormData(continueCreate, mergedData);
    },
    
    // 处理表单变化
    handleFormChange(changedFields) {
      // 更新本地表单数据
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
    
    // 提交表单数据
    submitFormData(continueCreate, customFormData = null) {
      // 确保表单验证通过
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (!valid) {
          this.$message.warning('表单填写有误，请检查')
          return false
        }
        
        // 在提交前打印表单数据，确认是否包含用户输入
        const formToSubmit = customFormData || this.form;
        console.log('准备提交的最终表单数据:', JSON.stringify(formToSubmit, null, 2))
        
        // 深拷贝表单数据，避免操作原数据
        const formData = JSON.parse(JSON.stringify(formToSubmit))
        
        // 设置设备类型
        formData.equipmentType = this.equipmentType
        
        // 根据设备类型处理数据格式
        if (this.equipmentType === 'FURNACE') {
          // 对炉型字段进行特殊处理 
          if (formData.furnaceTypeCode) {
            // 如果之前没有通过handleFurnaceTypeChange设置炉型名称，则在这里设置
            if (!formData.furnaceTypeName) {
              const selectedOption = this.furnaceTypeOptions.find(
                option => option.value === formData.furnaceTypeCode
              )
              
              if (selectedOption) {
                // 从选项的label中提取炉型名称 (格式: "炉型名称 (炉型编码)")
                formData.furnaceTypeName = selectedOption.label.split(' (')[0]
                console.log('提交前更新炉型名称:', formData.furnaceTypeName)
              }
            }
          } else {
            // 如果未选择炉型，确保清空炉型名称
            formData.furnaceTypeName = ''
          }
          
          // 确保数值型字段为数字类型
          formData.capacity = Number(formData.capacity)
          formData.maxTemperature = Number(formData.maxTemperature)
          formData.ratedPower = Number(formData.ratedPower)
          formData.maintenanceCycle = Number(formData.maintenanceCycle)
          
        } else if (this.equipmentType === 'CRANE') {
          // 特殊处理服务区域字段
          if (Array.isArray(formData.serviceAreas)) {
            formData.serviceArea = formData.serviceAreas.join(',')
            delete formData.serviceAreas
          }
          
          // 确保数值型字段为数字类型
          formData.liftCapacity = Number(formData.liftCapacity)
          
        } else if (this.equipmentType === 'AUTO_CART') {
          // 确保数值型字段为数字类型
          formData.loadCapacity = Number(formData.loadCapacity)
          formData.movingSpeed = Number(formData.movingSpeed)
          
        } else if (this.equipmentType === 'STAGING_TABLE') {
          // 确保数值型字段为数字类型
          formData.bearingCapacity = Number(formData.bearingCapacity)
        }
        
        // 确保状态字段为数字类型
        formData.status = Number(formData.status)
        
        // 设置加载状态
        this.loading = true
        
        // 发送数据到父组件
        this.$emit('submit', formData, continueCreate)
        
        // 延迟重置loading状态
        setTimeout(() => {
          this.loading = false
        }, 1000)
      })
    },

    // 处理抽屉打开
    handleDrawerOpen() {
      console.log('抽屉打开，初始化表单数据')
      
      // 重置用户交互状态
      this.userInteracted = false
      
      // 确保表单有初始数据
      if (this.type === 'create') {
        // 重新初始化表单数据，确保数据是新的
        this.form = this.initFormData()
        console.log('新建表单，初始化数据:', this.form)
      } else if (this.equipmentData) {
        // 编辑或查看模式，重新设置表单数据
        this.setFormData()
        // 编辑模式下认为用户已交互
        this.userInteracted = true
        console.log('编辑/查看表单，设置数据:', this.form)
      }
      
      // 为表单绑定自定义事件触发器
      this.$nextTick(() => {
        // 获取抽屉表单内的实际内容
        const drawerContent = this.$refs.drawerForm && this.$refs.drawerForm.$el;
        if (!drawerContent) return;
        
        // 监听表单中的所有输入元素
        const handleInput = (e) => {
          // 获取输入的字段名和值
          const fieldName = e.target.dataset.prop || e.target.name;
          const fieldValue = e.target.value;
          
          if (fieldName && this.form.hasOwnProperty(fieldName)) {
            console.log(`字段 ${fieldName} 变更为: ${fieldValue}`);
            this.form[fieldName] = fieldValue;
          }
        };
        
        // 添加事件委托，捕获表单中所有输入类元素的变化
        drawerContent.addEventListener('input', handleInput, true);
        drawerContent.addEventListener('change', handleInput, true);
      });
    },

    // 专门处理炉型选择变化的方法
    handleFurnaceTypeChange(value) {
      console.log('炉型选择变化:', value)
      this.form.furnaceTypeCode = value
      this.userInteracted = true // 标记用户已交互
      
      // 如果有选中的炉型，更新炉型名称
      if (value) {
        const selectedOption = this.furnaceTypeOptions.find(
          option => option.value === value
        )
        
        if (selectedOption) {
          // 从选项的label中提取炉型名称 (格式: "炉型名称 (炉型编码)")
          const furnaceTypeName = selectedOption.label.split(' (')[0]
          console.log('更新炉型名称:', furnaceTypeName)
          this.form.furnaceTypeName = furnaceTypeName
        }
      } else {
        // 如果未选择炉型，清空炉型名称
        this.form.furnaceTypeName = ''
      }
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