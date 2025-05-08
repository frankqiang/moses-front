<template>
  <el-dialog
    :title="type === 'create' ? '新增仓库' : '编辑仓库'"
    :visible.sync="dialogVisible"
    width="650px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="warehouseForm"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="small"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="仓库编码" prop="code">
            <el-input
              v-model="form.code"
              placeholder="请输入仓库编码"
              maxlength="30"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入仓库名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="仓库类型" prop="warehouseType">
            <el-select
              v-model="form.warehouseType"
              placeholder="请选择仓库类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in warehouseTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="仓库地址" prop="address">
            <el-input
              v-model="form.address"
              placeholder="请输入仓库地址"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="面积(㎡)" prop="area">
            <el-input-number
              v-model="form.area"
              :min="0"
              :precision="2"
              :step="100"
              style="width: 100%"
              placeholder="请输入面积"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="最大容量" prop="maxCapacity">
            <el-input-number
              v-model="form.maxCapacity"
              :min="0"
              :precision="0"
              :step="100"
              style="width: 100%"
              placeholder="请输入最大容量"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="负责人" prop="manager">
            <el-input
              v-model="form.manager"
              placeholder="请输入负责人姓名"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="contact">
            <el-input
              v-model="form.contact"
              placeholder="请输入联系方式"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="请输入仓库描述"
              :rows="3"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 仓库表单组件
 * 功能描述：提供仓库新增和编辑功能的表单
 * 创建日期：2023-11-01
 */
export default {
  name: 'WarehouseForm',
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
    // 编辑时的数据
    editData: {
      type: Object,
      default: null
    },
    // 仓库类型选项
    warehouseTypeOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // 手机号码验证
    const validatePhone = (rule, value, callback) => {
      if (value && !/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
    
    return {
      // 对话框可见性
      dialogVisible: false,
      // 表单数据
      form: {
        id: undefined,
        code: '',
        name: '',
        warehouseType: '',
        address: '',
        area: 0,
        maxCapacity: 0,
        currentUsage: 0,
        manager: '',
        contact: '',
        description: '',
        status: 1
      },
      // 表单验证规则
      rules: {
        code: [
          { required: true, message: '请输入仓库编码', trigger: 'blur' },
          { min: 3, max: 30, message: '长度在 3 到 30 个字符', trigger: 'blur' }
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
          { required: true, message: '请输入面积', trigger: 'blur' }
        ],
        maxCapacity: [
          { required: true, message: '请输入最大容量', trigger: 'blur' }
        ],
        manager: [
          { required: true, message: '请输入负责人', trigger: 'blur' }
        ],
        contact: [
          { required: true, message: '请输入联系方式', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ]
      },
      // 提交按钮加载状态
      submitLoading: false
    }
  },
  watch: {
    // 监听对话框可见性变化
    visible: {
      handler(val) {
        this.dialogVisible = val
        if (val && this.type === 'update' && this.editData) {
          // 编辑模式，填充表单数据
          this.form = {
            ...this.editData
          }
        } else if (val && this.type === 'create') {
          // 新增模式，重置表单
          this.resetForm()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 重置表单
    resetForm() {
      if (this.$refs.warehouseForm) {
        this.$refs.warehouseForm.resetFields()
      }
      
      this.form = {
        id: undefined,
        code: '',
        name: '',
        warehouseType: '',
        address: '',
        area: 0,
        maxCapacity: 0,
        currentUsage: 0,
        manager: '',
        contact: '',
        description: '',
        status: 1
      }
    },
    
    // 关闭对话框
    handleClose() {
      this.resetForm()
      this.$emit('update:visible', false)
    },
    
    // 提交表单
    handleSubmit() {
      this.$refs.warehouseForm.validate(valid => {
        if (!valid) {
          return
        }
        
        this.submitLoading = true
        
        // 提交表单数据
        this.$emit('submit', this.form)
        
        // 延迟关闭加载状态，避免闪烁
        setTimeout(() => {
          this.submitLoading = false
        }, 300)
      })
    }
  }
}
</script> 