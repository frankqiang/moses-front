/**
 * 产品表单组件
 * 功能描述：提供铝箔产品的新增和编辑表单
 */
<template>
  <drawer-form
    ref="drawerForm"
    :visible.sync="drawerVisible"
    :title="formTitle"
    :mode="type"
    :data="formData"
    :rules="rules"
    :form-sections="formSections"
    @submit="handleSubmitForm"
    @close="handleClose"
  >
    <template #footer>
      <el-button @click="handleClose">{{ type === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="type !== 'view'" type="primary" :loading="submitLoading" @click="submitForm">{{ type === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </template>
  </drawer-form>
</template>

<script>
/**
 * 产品表单组件
 * 功能描述：提供铝箔产品的新增和编辑表单
 */
import DrawerForm from '@/components/DrawerForm'

export default {
  name: 'ProductForm',
  components: {
    DrawerForm
  },
  props: {
    type: {
      type: String,
      default: 'create', // create、update或view
      validator: value => ['create', 'update', 'view'].includes(value)
    },
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    },
    processTemplateOptions: {
      type: Array,
      default: () => []
    },
    qualityStandardOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 校验产品编码格式
    const validateCode = (rule, value, callback) => {
      const pattern = /^AF-\d{4}-[A-Z0-9]+-\d+\.\d{4}x\d+$/
      if (!pattern.test(value)) {
        callback(new Error('产品编码格式不正确，请按照"AF-合金牌号-状态-厚度x宽度"格式填写'))
      } else {
        callback()
      }
    }
    
    return {
      drawerVisible: false,
      submitLoading: false,
      formData: {
        code: '',
        name: '',
        rawMaterialType: '',
        alloy: '',
        state: '',
        thickness: 0.01,
        width: 1000,
        unitWeight: 1.0,
        processTemplates: [],
        qualityStandards: [],
        lifecycleStatus: 'trial'
      },
      rules: {
        code: [
          { required: true, message: '请输入产品编码', trigger: 'blur' },
          { validator: validateCode, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        rawMaterialType: [
          { required: true, message: '请选择原材料类型', trigger: 'change' }
        ],
        alloy: [
          { required: true, message: '请选择合金牌号', trigger: 'change' }
        ],
        state: [
          { required: true, message: '请选择状态/硬度', trigger: 'change' }
        ],
        thickness: [
          { required: true, message: '请输入厚度', trigger: 'blur' },
          { type: 'number', min: 0.0001, message: '厚度必须大于0', trigger: 'blur' }
        ],
        width: [
          { required: true, message: '请输入宽度', trigger: 'blur' },
          { type: 'number', min: 100, message: '宽度必须大于100mm', trigger: 'blur' }
        ],
        unitWeight: [
          { required: true, message: '请输入单位重量', trigger: 'blur' },
          { type: 'number', min: 0.1, message: '单位重量必须大于0.1', trigger: 'blur' }
        ],
        processTemplates: [
          { required: true, message: '请选择至少一个关联工艺模板', trigger: 'change' },
          { type: 'array', min: 1, message: '请至少选择一个关联工艺模板', trigger: 'change' }
        ],
        qualityStandards: [
          { required: true, message: '请选择至少一个关联质量标准', trigger: 'change' },
          { type: 'array', min: 1, message: '请至少选择一个关联质量标准', trigger: 'change' }
        ],
        lifecycleStatus: [
          { required: true, message: '请选择产品生命周期状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 表单标题
    formTitle() {
      if (this.type === 'create') {
        return '新增铝箔产品'
      } else if (this.type === 'update') {
        return '编辑铝箔产品'
      } else {
        return '查看铝箔产品'
      }
    },
    
    // 表单分段配置
    formSections() {
      return [
        {
          title: '基础信息',
          items: [
            {
              prop: 'code',
              label: '产品编码',
              type: 'input',
              placeholder: '如: AF-1100-H18-0.0060x1200',
              maxlength: 50,
              showWordLimit: true
            },
            {
              prop: 'name',
              label: '产品名称',
              type: 'input',
              placeholder: '如: 1100合金H18态双零箔',
              maxlength: 50,
              showWordLimit: true
            },
            {
              prop: 'rawMaterialType',
              label: '原材料类型',
              type: 'select',
              placeholder: '请选择原材料类型',
              options: [
                { label: '铝锭', value: '铝锭' },
                { label: '铸轧卷', value: '铸轧卷' },
                { label: '热轧卷', value: '热轧卷' }
              ]
            },
            {
              prop: 'alloy',
              label: '合金牌号',
              type: 'select',
              placeholder: '请选择合金牌号',
              options: [
                { label: '1100', value: '1100' },
                { label: '8011', value: '8011' },
                { label: '3003', value: '3003' },
                { label: '8021', value: '8021' }
              ]
            },
            {
              prop: 'state',
              label: '状态/硬度',
              type: 'select',
              placeholder: '请选择状态/硬度',
              options: [
                { label: 'H18', value: 'H18' },
                { label: 'O', value: 'O' },
                { label: 'H22', value: 'H22' },
                { label: 'H24', value: 'H24' }
              ]
            },
            {
              prop: 'lifecycleStatus',
              label: '产品生命周期',
              type: 'select',
              placeholder: '请选择产品生命周期状态',
              options: [
                { label: '试产', value: 'trial' },
                { label: '量产', value: 'production' },
                { label: '停产', value: 'discontinued' }
              ]
            }
          ]
        },
        {
          title: '规格参数',
          items: [
            {
              prop: 'thickness',
              label: '厚度(mm)',
              type: 'number',
              precision: 4,
              step: 0.0001,
              min: 0.0001,
              max: 1
            },
            {
              prop: 'width',
              label: '宽度(mm)',
              type: 'number',
              precision: 0,
              step: 10,
              min: 100,
              max: 2000
            },
            {
              prop: 'unitWeight',
              label: '单位重量',
              type: 'number',
              precision: 2,
              step: 0.1,
              min: 0.1,
              placeholder: 'kg/卷或kg/m²'
            }
          ]
        },
        {
          title: '关联信息',
          items: [
            {
              prop: 'processTemplates',
              label: '工艺模板',
              type: 'select',
              placeholder: '请选择关联退火工艺模板',
              multiple: true,
              collapseTags: true,
              options: this.processTemplateOptions.map(item => ({
                label: item.name,
                value: item.id
              }))
            },
            {
              prop: 'qualityStandards',
              label: '质量标准',
              type: 'select',
              placeholder: '请选择关联质量标准',
              multiple: true,
              collapseTags: true,
              options: this.qualityStandardOptions.map(item => ({
                label: item.name,
                value: item.id
              }))
            }
          ]
        }
      ]
    }
  },
  watch: {
    visible(val) {
      this.drawerVisible = val
      if (val && this.type === 'create') {
        // 如果是新增模式，确保表单被重置
        this.$nextTick(() => {
          this.resetForm()
        })
      }
    },
    drawerVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    },
    type(val) {
      // 当类型变为create时，确保表单被重置
      if (val === 'create') {
        this.$nextTick(() => {
          this.resetForm()
        })
      }
    },
    editData: {
      handler(val) {
        if (val) {
          // 深拷贝编辑数据
          this.formData = JSON.parse(JSON.stringify(val))
          
          // 处理关联对象的id转换
          if (this.formData.processTemplates && Array.isArray(this.formData.processTemplates)) {
            this.formData.processTemplates = this.formData.processTemplates.map(item => item.id)
          }
          
          if (this.formData.qualityStandards && Array.isArray(this.formData.qualityStandards)) {
            this.formData.qualityStandards = this.formData.qualityStandards.map(item => item.id)
          }
        } else {
          this.resetForm()
        }
      },
      immediate: true
    },
    // 监听processTemplateOptions和qualityStandardOptions的变化，更新formSections
    processTemplateOptions: {
      handler() {
        // 由于formSections是计算属性，它会自动更新
      },
      deep: true
    },
    qualityStandardOptions: {
      handler() {
        // 由于formSections是计算属性，它会自动更新
      },
      deep: true
    }
  },
  methods: {
    // 重置表单
    resetForm() {
      this.formData = {
        code: '',
        name: '',
        rawMaterialType: '',
        alloy: '',
        state: '',
        thickness: 0.01,
        width: 1000,
        unitWeight: 1.0,
        processTemplates: [],
        qualityStandards: [],
        lifecycleStatus: 'trial'
      }
      
      // 延迟执行以确保表单已经被渲染
      this.$nextTick(() => {
        if (this.$refs.drawerForm && this.$refs.drawerForm.$refs.form) {
          this.$refs.drawerForm.$refs.form.resetFields()
          this.$refs.drawerForm.$refs.form.clearValidate()
        }
      })
    },
    
    // 处理关闭
    handleClose() {
      this.drawerVisible = false
      // 关闭时清除验证状态
      this.$nextTick(() => {
        this.resetForm()
      })
    },
    
    // 处理DrawerForm的submit事件
    handleSubmitForm(formData) {
      this.submitForm()
    },
    
    // 提交表单
    submitForm() {
      if (this.type === 'view') {
        this.drawerVisible = false
        return
      }
      
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          
          // 获取当前表单数据
          const currentFormData = this.$refs.drawerForm.formData
          
          // 创建提交数据对象
          const submitData = JSON.parse(JSON.stringify(currentFormData))
          
          // 处理关联对象的id转换回对象
          if (submitData.processTemplates && Array.isArray(submitData.processTemplates)) {
            submitData.processTemplates = submitData.processTemplates.map(id => {
              const template = this.processTemplateOptions.find(item => item.id === id)
              return template || { id }
            })
          }
          
          if (submitData.qualityStandards && Array.isArray(submitData.qualityStandards)) {
            submitData.qualityStandards = submitData.qualityStandards.map(id => {
              const standard = this.qualityStandardOptions.find(item => item.id === id)
              return standard || { id }
            })
          }
          
          // 触发提交事件
          this.$emit('submit', submitData)
          
          // 模拟异步操作
          setTimeout(() => {
            this.submitLoading = false
          }, 500)
        } else {
          this.$message.warning('请检查表单填写是否正确')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/* 抽屉表单样式已由全局DrawerForm组件提供 */
</style> 