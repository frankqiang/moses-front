/**
 * 库位表单组件（新版）
 * 功能描述：提供库位新增、编辑、查看功能的表单
 * 创建日期：2023-09-01
 */
<template>
  <div class="location-form">
    <Drawer
      ref="drawer"
      :visible.sync="innerVisible"
      :title="formTitle"
      :mode="type"
      :data="formData"
      :rules="rules"
      :form-sections="formSections"
      :width="'550px'"
      @submit="handleSubmit"
      @closed="handleClosed"
    />
  </div>
</template>

<script>
import Drawer from '@/components/Drawer'

export default {
  name: 'LocationForm',
  components: {
    Drawer
  },
  props: {
    // 表单类型：create-新增，update-编辑，view-查看
    type: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update', 'view'].includes(value)
    },
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 编辑时的库位数据
    editData: {
      type: Object,
      default: () => null
    },
    // 仓库选项
    warehouseOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 内部可见性，用于sync
      innerVisible: false,
      // 表单数据
      formData: {
        id: undefined,
        code: '',
        name: '',
        warehouseId: '',
        locationType: '',
        locationDesc: '',
        length: undefined,
        width: undefined,
        height: undefined,
        dimension: '',
        capacity: undefined,
        occupiedCapacity: 0,
        maxWeight: undefined,
        allowMixed: false,
        status: 1,
        remarks: ''
      },
      // 表单验证规则
      rules: {
        code: [
          { required: true, message: '请输入库位编码', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入库位名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        warehouseId: [
          { required: true, message: '请选择所属仓库', trigger: 'change' }
        ],
        locationType: [
          { required: true, message: '请选择库位类型', trigger: 'change' }
        ],
        capacity: [
          { required: true, message: '请输入库位容量', trigger: 'blur' },
          { type: 'number', message: '库位容量必须为数字', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 表单标题
    formTitle() {
      const titleMap = {
        create: '新增库位',
        update: '编辑库位',
        view: '查看库位'
      }
      return titleMap[this.type]
    },

    // 表单分段配置
    formSections() {
      return [
        {
          title: '一、基础信息',
          items: [
            {
              prop: 'code',
              label: '库位编码',
              type: 'input',
              placeholder: '请输入库位编码',
              maxlength: 20,
              showWordLimit: true,
              disabled: this.type === 'update'
            },
            {
              prop: 'name',
              label: '库位名称',
              type: 'input',
              placeholder: '请输入库位名称',
              maxlength: 50,
              showWordLimit: true
            },
            {
              prop: 'warehouseId',
              label: '所属仓库',
              type: 'select',
              placeholder: '请选择所属仓库',
              options: this.warehouseOptions.map(item => ({
                label: item.name,
                value: item.id
              }))
            },
            {
              prop: 'locationType',
              label: '库位类型',
              type: 'select',
              placeholder: '请选择库位类型',
              options: [
                { label: '存储区', value: 'STORAGE' },
                { label: '收货区', value: 'RECEIVING' },
                { label: '发货区', value: 'SHIPPING' },
                { label: '暂存区', value: 'STAGING' },
                { label: '质检区', value: 'QC' }
              ]
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
          title: '二、位置与尺寸信息',
          items: [
            {
              prop: 'locationDesc',
              label: '位置描述',
              type: 'textarea',
              placeholder: '请输入位置描述',
              maxlength: 200,
              showWordLimit: true,
              rows: 2
            },
            {
              prop: 'length',
              label: '长度(cm)',
              type: 'number',
              placeholder: '请输入长度',
              min: 0,
              precision: 2,
              step: 10,
              change: this.updateDimension,
              events: {
                change: this.updateDimension
              }
            },
            {
              prop: 'width',
              label: '宽度(cm)',
              type: 'number',
              placeholder: '请输入宽度',
              min: 0,
              precision: 2,
              step: 10,
              change: this.updateDimension,
              events: {
                change: this.updateDimension
              }
            },
            {
              prop: 'height',
              label: '高度(cm)',
              type: 'number',
              placeholder: '请输入高度',
              min: 0,
              precision: 2,
              step: 10,
              change: this.updateDimension,
              events: {
                change: this.updateDimension
              }
            },
            {
              prop: 'dimension',
              label: '尺寸展示',
              type: 'input',
              placeholder: '自动计算',
              disabled: true
            }
          ]
        },
        {
          title: '三、容量信息',
          items: [
            {
              prop: 'capacity',
              label: '库位容量',
              type: 'number',
              placeholder: '请输入库位容量',
              min: 0,
              step: 100
            },
            {
              prop: 'occupiedCapacity',
              label: '已用容量',
              type: 'number',
              placeholder: '已用容量',
              min: 0,
              disabled: true
            },
            {
              prop: 'maxWeight',
              label: '最大承重(kg)',
              type: 'number',
              placeholder: '请输入最大承重',
              min: 0,
              step: 100
            },
            {
              prop: 'allowMixed',
              label: '允许混放',
              type: 'switch',
              activeText: '允许',
              inactiveText: '不允许'
            }
          ]
        },
        {
          title: '四、其他信息',
          items: [
            {
              prop: 'remarks',
              label: '备注',
              type: 'textarea',
              placeholder: '请输入备注信息',
              maxlength: 500,
              showWordLimit: true,
              rows: 3
            }
          ]
        }
      ]
    }
  },
  watch: {
    // 监听visible变化
    visible: {
      handler(val) {
        this.innerVisible = val
        if (val) {
          this.initFormData()
        }
      },
      immediate: true
    },
    // 监听innerVisible变化，当关闭时通知父组件
    innerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      if (this.type === 'create') {
        // 新增时重置表单
        this.resetForm()
      } else if (this.editData) {
        // 编辑或查看时填充数据
        this.formData = {
          ...this.formData,
          ...this.editData
        }
        // 确保尺寸展示字段正确计算
        this.$nextTick(() => {
          this.updateDimension()
        })
      }
    },

    // 重置表单
    resetForm() {
      this.formData = {
        id: undefined,
        code: '',
        name: '',
        warehouseId: '',
        locationType: '',
        locationDesc: '',
        length: undefined,
        width: undefined,
        height: undefined,
        dimension: '',
        capacity: undefined,
        occupiedCapacity: 0,
        maxWeight: undefined,
        allowMixed: false,
        status: 1,
        remarks: ''
      }

      // 如果表单实例存在，调用其 resetForm 方法
      if (this.$refs.drawerForm) {
        this.$refs.drawerForm.resetForm()
      }
    },

    // 提交表单
    handleSubmit(formData) {
      // 确保提交前尺寸展示字段已更新
      if (formData.length && formData.width && formData.height) {
        formData.dimension = `${formData.length} × ${formData.width} × ${formData.height}`
      }
      this.$emit('submit', formData)
    },

    // 处理抽屉关闭事件
    handleClosed() {
      this.$emit('closed')
    },

    // 更新尺寸展示
    updateDimension() {
      if (this.formData.length && this.formData.width && this.formData.height) {
        this.formData.dimension = `${this.formData.length} × ${this.formData.width} × ${this.formData.height}`
      } else {
        this.formData.dimension = ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.location-form {
  // 表单样式可以在此处添加
}
</style>
