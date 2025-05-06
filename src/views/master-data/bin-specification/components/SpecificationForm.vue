<template>
  <el-dialog
    :title="type === 'create' ? '新增料框规格' : '编辑料框规格'"
    :visible.sync="visible"
    :width="dialogWidth"
    :close-on-click-modal="false"
    @closed="$refs.dataForm && $refs.dataForm.clearValidate()"
  >
    <el-form
      ref="dataForm"
      :model="formData"
      :rules="rules"
      label-width="120px"
      label-position="right"
      class="form-container"
    >
      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="规格代码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入规格代码" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="规格名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入规格名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">尺寸信息</el-divider>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="8">
          <el-form-item label="长度(cm)" prop="length">
            <el-input-number v-model="formData.length" :min="1" :max="1000" :precision="2" :step="10" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="宽度(cm)" prop="width">
            <el-input-number v-model="formData.width" :min="1" :max="1000" :precision="2" :step="10" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="高度(cm)" prop="height">
            <el-input-number v-model="formData.height" :min="1" :max="1000" :precision="2" :step="10" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">物理特性</el-divider>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="最大载重(kg)" prop="maxWeight">
            <el-input-number v-model="formData.maxWeight" :min="1" :max="10000" :step="100" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="材质" prop="material">
            <el-select v-model="formData.material" placeholder="请选择材质" style="width: 100%">
              <el-option label="铝合金" value="铝合金" />
              <el-option label="不锈钢" value="不锈钢" />
              <el-option label="碳钢" value="碳钢" />
              <el-option label="镀锌钢" value="镀锌钢" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="最大堆叠层数" prop="maxStackLayers">
            <el-input-number v-model="formData.maxStackLayers" :min="1" :max="10" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="供应商" prop="supplier">
            <el-input v-model="formData.supplier" placeholder="请输入供应商信息" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">适用范围</el-divider>

      <el-form-item label="适用产品类型" prop="applicableProducts">
        <el-select
          v-model="formData.applicableProducts"
          multiple
          filterable
          value-key="id"
          placeholder="请选择适用产品类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in productOptions"
            :key="item.id"
            :label="item.name"
            :value="item"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'SpecificationForm',
  props: {
    // 对话框类型：create-新增，update-编辑
    type: {
      type: String,
      default: 'create'
    },
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 编辑时的表单数据
    editData: {
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
      // 表单数据
      formData: this.getDefaultFormData(),
      // 表单验证规则
      rules: {
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
        ]
      }
    }
  },
  computed: {
    // 对话框宽度
    dialogWidth() {
      return window.innerWidth < 768 ? '90%' : (window.innerWidth < 992 ? '70%' : '50%')
    }
  },
  watch: {
    // 监听可见性变化，初始化表单数据
    visible(val) {
      if (val && this.type === 'update' && this.editData) {
        this.initEditForm()
      } else if (val && this.type === 'create') {
        this.resetForm()
      }
    }
  },
  created() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 移除窗口大小变化的监听
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 获取默认表单数据
    getDefaultFormData() {
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
    
    // 重置表单
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate()
      })
    },
    
    // 初始化编辑表单
    initEditForm() {
      // 深拷贝行数据，避免直接修改原始数据
      const editData = JSON.parse(JSON.stringify(this.editData))

      // 确保适用产品类型是对象数组形式
      if (editData.applicableProducts && Array.isArray(editData.applicableProducts)) {
        // 确保每个产品对象都有id属性作为唯一标识
        editData.applicableProducts = editData.applicableProducts.map(product => {
          return {
            id: product.id,
            name: product.name
          }
        })
      }

      this.formData = Object.assign({}, this.getDefaultFormData(), editData)
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate()
      })
    },
    
    // 提交表单
    submitForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          // 发送表单数据给父组件
          this.$emit('submit', { ...this.formData })
        }
      })
    },
    
    // 取消操作
    handleCancel() {
      this.$emit('update:visible', false)
    },
    
    // 处理窗口大小改变
    handleResize() {
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  padding: 8px 16px;
}

.el-divider__text {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}

::v-deep .el-input-number {
  width: 100%;

  .el-input__inner {
    text-align: center;
    padding-left: 38px;
    padding-right: 38px;
  }

  .el-input-number__decrease,
  .el-input-number__increase {
    width: 32px;
    height: 100%;
    top: 0;
    background-color: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .el-input-number__decrease {
    left: 1px;
    border-right: 1px solid #dcdfe6;
  }

  .el-input-number__increase {
    right: 1px;
    border-left: 1px solid #dcdfe6;
  }
}
</style> 