/**
 * 料框规格表单抽屉组件
 * 功能描述：提供料框规格新增、编辑和查看功能的表单，使用抽屉方式展示
 * 创建日期：2024-10-30
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
      <el-button v-if="type === 'create'" type="primary" :loading="loading" @click="handleSubmitAndContinue">保存并继续</el-button>
      <el-button v-if="type !== 'view'" type="primary" :loading="loading" @click="handleSubmit">{{ type === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </template>
  </drawer-form>
</template>

<script>
import DrawerForm from '@/components/DrawerForm'

export default {
  name: 'SpecificationFormDrawer',
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
    // 料框数据（编辑和查看时使用）
    binData: {
      type: Object,
      default: null
    },
    // 产品类型选项
    productOptions: {
      type: Array,
      default: () => []
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
      // 材质选项
      materialOptions: [
        { label: '铝合金', value: '铝合金' },
        { label: '不锈钢', value: '不锈钢' },
        { label: '碳钢', value: '碳钢' },
        { label: '镀锌钢', value: '镀锌钢' }
      ]
    }
  },
  computed: {
    // 动态表单规则
    rules() {
      return {
        code: [
          { required: true, message: '请输入规格代码', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入规格名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        length: [
          { required: true, message: '请输入长度', trigger: 'blur' },
          { type: 'number', message: '长度必须为数字', trigger: 'blur' }
        ],
        width: [
          { required: true, message: '请输入宽度', trigger: 'blur' },
          { type: 'number', message: '宽度必须为数字', trigger: 'blur' }
        ],
        height: [
          { required: true, message: '请输入高度', trigger: 'blur' },
          { type: 'number', message: '高度必须为数字', trigger: 'blur' }
        ],
        maxWeight: [
          { required: true, message: '请输入最大载重', trigger: 'blur' },
          { type: 'number', message: '最大载重必须为数字', trigger: 'blur' }
        ],
        material: [
          { required: true, message: '请选择材质', trigger: 'change' }
        ],
        maxStackLayers: [
          { required: true, message: '请输入最大堆叠层数', trigger: 'blur' },
          { type: 'number', message: '最大堆叠层数必须为数字', trigger: 'blur' }
        ],
        supplier: [
          { required: true, message: '请输入供应商信息', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    },

    // 动态表单分段
    formSections() {
      return [
        {
          title: '一、基础信息',
          items: [
            {
              prop: 'code',
              label: '规格代码',
              type: 'input',
              placeholder: '请输入规格代码',
              maxlength: 20,
              showWordLimit: true,
              disabled: this.type === 'update'
            },
            {
              prop: 'name',
              label: '规格名称',
              type: 'input',
              placeholder: '请输入规格名称',
              maxlength: 50,
              showWordLimit: true
            },
            {
              prop: 'status',
              label: '状态',
              type: 'radio',
              options: [
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 }
              ]
            }
          ]
        },
        {
          title: '二、尺寸信息',
          items: [
            {
              prop: 'length',
              label: '长度(cm)',
              type: 'number',
              min: 1,
              max: 1000,
              precision: 2,
              step: 10
            },
            {
              prop: 'width',
              label: '宽度(cm)',
              type: 'number',
              min: 1,
              max: 1000,
              precision: 2,
              step: 10
            },
            {
              prop: 'height',
              label: '高度(cm)',
              type: 'number',
              min: 1,
              max: 1000,
              precision: 2,
              step: 10
            }
          ]
        },
        {
          title: '三、物理特性',
          items: [
            {
              prop: 'maxWeight',
              label: '最大载重(kg)',
              type: 'number',
              min: 1,
              max: 10000,
              step: 100
            },
            {
              prop: 'material',
              label: '材质',
              type: 'select',
              options: this.materialOptions,
              placeholder: '请选择材质'
            },
            {
              prop: 'maxStackLayers',
              label: '最大堆叠层数',
              type: 'number',
              min: 1,
              max: 10,
              step: 1
            },
            {
              prop: 'supplier',
              label: '供应商',
              type: 'input',
              placeholder: '请输入供应商信息',
              maxlength: 100,
              showWordLimit: true
            }
          ]
        },
        {
          title: '四、适用范围',
          items: [
            {
              prop: 'applicableProducts',
              label: '适用产品类型',
              type: 'select',
              multiple: true,
              filterable: true,
              options: this.productOptions.map(item => ({
                label: item.name,
                value: item.id
              })),
              placeholder: '请选择适用产品类型'
            }
          ]
        }
      ]
    }
  },
  watch: {
    // 监听可见性变化
    visible(val) {
      this.drawerVisible = val
      if (val) {
        this.initForm()
      }
    },
    // 监听抽屉可见性变化
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        id: undefined,
        code: '',
        name: '',
        length: 100,
        width: 80,
        height: 80,
        maxWeight: 1000,
        material: '铝合金',
        maxStackLayers: 3,
        applicableProducts: [],
        supplier: '',
        status: 1
      }
    },

    // 初始化表单
    initForm() {
      if (this.type === 'create') {
        // 新增
        this.form = this.initFormData()
      } else if (this.binData) {
        // 编辑或查看
        const data = JSON.parse(JSON.stringify(this.binData))

        // 确保适用产品类型是ID数组形式
        if (data.applicableProducts && Array.isArray(data.applicableProducts)) {
          // 提取产品ID数组
          data.applicableProducts = data.applicableProducts.map(product => product.id)
        }

        this.form = Object.assign({}, this.initFormData(), data)
      }
    },

    // 获取抽屉标题
    getDrawerTitle() {
      const typeText = {
        create: '新增',
        update: '编辑',
        view: '查看'
      }
      return `${typeText[this.type]}料框规格`
    },

    // 提交表单
    handleSubmit() {
      this.$refs.drawerForm.submitForm()
    },

    // 提交并继续
    handleSubmitAndContinue() {
      this.$refs.drawerForm.submitForm(true)
    },

    // 表单提交处理
    handleFormSubmit(formData, continueCreate) {
      this.loading = true
      this.$emit('submit', formData, continueCreate)
      setTimeout(() => {
        this.loading = false
      }, 500)
    },

    // 关闭抽屉
    handleClose() {
      this.drawerVisible = false
      this.$emit('close')
    },

    // 重置表单
    resetForm() {
      this.form = this.initFormData()
    }
  }
}
</script>

<style lang="scss" scoped>
// 自定义样式
</style>
