<template>
  <el-dialog 
    :title="type === 'create' ? '新增铝箔产品' : '编辑铝箔产品'" 
    :visible.sync="dialogVisible"
    width="800px"
    @close="$emit('update:visible', false)"
  >
    <el-form 
      ref="form" 
      :model="formData" 
      :rules="rules" 
      label-width="120px" 
      label-position="right"
      size="small"
      class="product-form"
    >
      <el-divider content-position="left">基础信息</el-divider>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12">
          <el-form-item label="产品编码" prop="code" class="form-item-with-error">
            <el-input v-model="formData.code" placeholder="如: AF-1100-H18-0.0060x1200" />
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="产品名称" prop="name" class="form-item-with-error">
            <el-input v-model="formData.name" placeholder="如: 1100合金H18态双零箔" />
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12">
          <el-form-item label="原材料类型" prop="rawMaterialType" class="form-item-with-error">
            <el-select v-model="formData.rawMaterialType" placeholder="请选择原材料类型" style="width: 100%">
              <el-option label="原铝" value="原铝" />
              <el-option label="再生铝" value="再生铝" />
              <el-option label="混合铝" value="混合铝" />
            </el-select>
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="合金牌号" prop="alloy" class="form-item-with-error">
            <el-select v-model="formData.alloy" placeholder="请选择合金牌号" style="width: 100%">
              <el-option label="1100" value="1100" />
              <el-option label="8011" value="8011" />
              <el-option label="3003" value="3003" />
              <el-option label="8021" value="8021" />
            </el-select>
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12">
          <el-form-item label="状态/硬度" prop="state" class="form-item-with-error">
            <el-select v-model="formData.state" placeholder="请选择状态/硬度" style="width: 100%">
              <el-option label="H18" value="H18" />
              <el-option label="O" value="O" />
              <el-option label="H22" value="H22" />
              <el-option label="H24" value="H24" />
            </el-select>
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="产品生命周期" prop="lifecycleStatus" class="form-item-with-error">
            <el-select v-model="formData.lifecycleStatus" placeholder="请选择产品生命周期状态" style="width: 100%">
              <el-option label="试产" value="trial" />
              <el-option label="量产" value="production" />
              <el-option label="停产" value="discontinued" />
            </el-select>
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">规格参数</el-divider>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="12">
          <el-form-item label="厚度(mm)" prop="thickness" class="form-item-with-error">
            <el-input-number 
              v-model="formData.thickness" 
              :precision="4" 
              :step="0.0001" 
              :min="0.0001" 
              :max="1" 
              style="width: 100%" 
            />
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="宽度(mm)" prop="width" class="form-item-with-error">
            <el-input-number 
              v-model="formData.width" 
              :precision="0" 
              :step="10" 
              :min="100" 
              :max="2000" 
              style="width: 100%" 
            />
            <div class="error-message-placeholder"></div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="单位重量" prop="unitWeight" class="form-item-with-error">
        <el-input-number 
          v-model="formData.unitWeight" 
          :precision="2" 
          :step="0.1" 
          :min="0.1" 
          placeholder="kg/卷或kg/m²" 
          style="width: 100%" 
        />
        <div class="error-message-placeholder"></div>
      </el-form-item>

      <el-divider content-position="left">关联信息</el-divider>

      <el-form-item label="工艺模板" prop="processTemplates" class="form-item-with-error">
        <el-select 
          v-model="formData.processTemplates" 
          multiple
          filterable
          value-key="id"
          placeholder="请选择关联退火工艺模板"
          style="width: 100%"
        >
          <el-option
            v-for="item in processTemplateOptions"
            :key="item.id"
            :label="item.name"
            :value="item"
          />
        </el-select>
        <div class="error-message-placeholder"></div>
      </el-form-item>

      <el-form-item label="质量标准" prop="qualityStandards" class="form-item-with-error">
        <el-select 
          v-model="formData.qualityStandards" 
          multiple
          filterable
          value-key="id"
          placeholder="请选择关联质量标准"
          style="width: 100%"
        >
          <el-option
            v-for="item in qualityStandardOptions"
            :key="item.id"
            :label="item.name"
            :value="item"
          />
        </el-select>
        <div class="error-message-placeholder"></div>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:visible', false)">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 产品表单组件
 * 功能描述：提供铝箔产品的新增和编辑表单
 */
export default {
  name: 'ProductForm',
  props: {
    type: {
      type: String,
      default: 'create', // create或update
      validator: value => ['create', 'update'].includes(value)
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
      dialogVisible: false,
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
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        // 对话框打开时，延迟一下再清除校验状态，确保表单已经被渲染
        this.$nextTick(() => {
          if (this.$refs.form) {
            this.$refs.form.clearValidate()
          }
        })
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
        // 对话框关闭时清除校验状态
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      }
    },
    editData: {
      handler(val) {
        if (val) {
          this.formData = { ...val }
          // 数据变化后，清除校验状态
          this.$nextTick(() => {
            if (this.$refs.form) {
              this.$refs.form.clearValidate()
            }
          })
        } else {
          this.resetForm()
        }
      },
      immediate: true
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
      
      if (this.$refs.form) {
        this.$refs.form.resetFields()
        this.$refs.form.clearValidate()
      }
    },
    
    // 提交表单
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.submitLoading = true
          
          // 处理表单数据
          const submitData = { ...this.formData }
          
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
.product-form {
  .el-select {
    width: 100%;
  }

  .form-item-with-error {
    margin-bottom: 22px;
    
    .error-message-placeholder {
      height: 18px;
      margin-top: 2px;
    }
  }
}

/* 修复表单校验错误信息样式 */
::v-deep .el-form-item__error {
  position: static;
  margin-top: 2px;
  margin-bottom: 0;
}

/* 对于弹出框内的表单，增加内部滚动条，避免内容过多导致对话框超出屏幕 */
::v-deep .el-dialog__body {
  max-height: 65vh;
  overflow-y: auto;
  padding-bottom: 30px;
}
</style> 