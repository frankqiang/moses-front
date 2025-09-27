/**
 * 仓库表单组件（新版）
 * 功能描述：提供仓库新增、编辑、查看功能的表单
 * 创建日期：2023-11-01
 */
<template>
  <div class="warehouse-form">
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
  name: 'WarehouseForm',
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
    // 编辑时的仓库数据
    editData: {
      type: Object,
      default: () => null
    },
    // 仓库类型选项
    warehouseTypeOptions: {
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
        warehouseType: '',
        address: '',
        area: undefined,
        manager: '',
        contact: '',
        maxCapacity: undefined,
        currentUsage: 0,
        status: 1,
        description: ''
      },
      // 表单验证规则
      rules: {
        code: [
          { required: true, message: '请输入仓库编码', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入仓库名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        warehouseType: [
          { required: true, message: '请选择仓库类型', trigger: 'change' }
        ],
        address: [
          { required: true, message: '请输入仓库地址', trigger: 'blur' }
        ],
        area: [
          { required: true, message: '请输入仓库面积', trigger: 'blur' },
          { type: 'number', message: '面积必须为数字', trigger: 'blur' }
        ],
        manager: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        maxCapacity: [
          { required: true, message: '请输入最大容量', trigger: 'blur' },
          { type: 'number', message: '容量必须为数字', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    // 表单标题
    formTitle() {
      const titleMap = {
        create: '新增仓库',
        update: '编辑仓库',
        view: '查看仓库'
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
              label: '仓库编码',
              type: 'input',
              placeholder: '请输入仓库编码',
              maxlength: 20,
              showWordLimit: true,
              disabled: this.type === 'update'
            },
            {
              prop: 'name',
              label: '仓库名称',
              type: 'input',
              placeholder: '请输入仓库名称',
              maxlength: 50,
              showWordLimit: true
            },
            {
              prop: 'warehouseType',
              label: '仓库类型',
              type: 'select',
              placeholder: '请选择仓库类型',
              options: this.warehouseTypeOptions
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
          title: '二、位置与容量信息',
          items: [
            {
              prop: 'address',
              label: '仓库地址',
              type: 'input',
              placeholder: '请输入仓库地址',
              maxlength: 200,
              showWordLimit: true
            },
            {
              prop: 'area',
              label: '面积(㎡)',
              type: 'number',
              placeholder: '请输入仓库面积',
              min: 0
            },
            {
              prop: 'maxCapacity',
              label: '最大容量',
              type: 'number',
              placeholder: '请输入最大容量',
              min: 0
            },
            {
              prop: 'currentUsage',
              label: '当前使用量',
              type: 'number',
              placeholder: '请输入当前使用量',
              min: 0,
              disabled: true
            }
          ]
        },
        {
          title: '三、联系人信息',
          items: [
            {
              prop: 'manager',
              label: '负责人',
              type: 'input',
              placeholder: '请输入负责人姓名',
              maxlength: 20
            },
            {
              prop: 'contact',
              label: '联系方式',
              type: 'input',
              placeholder: '请输入联系方式',
              maxlength: 20
            }
          ]
        },
        {
          title: '四、其他信息',
          items: [
            {
              prop: 'description',
              label: '备注说明',
              type: 'textarea',
              placeholder: '请输入备注说明',
              maxlength: 500,
              showWordLimit: true,
              rows: 4
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
      }
    },

    // 重置表单
    resetForm() {
      this.formData = {
        id: undefined,
        code: '',
        name: '',
        warehouseType: '',
        address: '',
        area: undefined,
        manager: '',
        contact: '',
        maxCapacity: undefined,
        currentUsage: 0,
        status: 1,
        description: ''
      }

      // 如果表单实例存在，调用其 resetForm 方法
      if (this.$refs.drawerForm) {
        this.$refs.drawerForm.resetForm()
      }
    },

    // 提交表单
    handleSubmit(formData) {
      this.$emit('submit', formData)
    },

    // 处理抽屉关闭事件
    handleClosed() {
      this.$emit('closed')
    }
  }
}
</script>

<style lang="scss" scoped>
.warehouse-form {
  // 表单样式可以在此处添加
}
</style>
