<template>
  <el-dialog
    :title="type === 'create' ? '新增库位' : '编辑库位'"
    :visible="localVisible"
    :width="dialogWidth"
    :close-on-click-modal="false"
    @closed="$refs.dataForm && $refs.dataForm.clearValidate()"
    @close="handleClose"
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
          <el-form-item label="库位编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入库位编码" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="库位名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入库位名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">位置信息</el-divider>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="所属仓库" prop="warehouseId">
            <el-select v-model="formData.warehouseId" placeholder="请选择所属仓库" style="width: 100%">
              <el-option
                v-for="item in warehouseOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="库位类型" prop="locationType">
            <el-select v-model="formData.locationType" placeholder="请选择库位类型" style="width: 100%">
              <el-option label="存储区" value="STORAGE" />
              <el-option label="收货区" value="RECEIVING" />
              <el-option label="发货区" value="SHIPPING" />
              <el-option label="暂存区" value="STAGING" />
              <el-option label="质检区" value="QC" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="24">
          <el-form-item label="位置描述" prop="locationDesc">
            <el-input v-model="formData.locationDesc" type="textarea" :rows="2" placeholder="请输入位置描述" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">容量信息</el-divider>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="8">
          <el-form-item label="长度(cm)" prop="length">
            <el-input-number v-model="formData.length" :min="0" :precision="2" :step="10" style="width: 100%" @change="updateDimension" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="宽度(cm)" prop="width">
            <el-input-number v-model="formData.width" :min="0" :precision="2" :step="10" style="width: 100%" @change="updateDimension" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="高度(cm)" prop="height">
            <el-input-number v-model="formData.height" :min="0" :precision="2" :step="10" style="width: 100%" @change="updateDimension" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="库位容量" prop="capacity">
            <el-input-number v-model="formData.capacity" :min="0" :step="100" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="最大承重(kg)" prop="maxWeight">
            <el-input-number v-model="formData.maxWeight" :min="0" :step="100" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">其他信息</el-divider>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12">
          <el-form-item label="允许混放" prop="allowMixed">
            <el-switch
              v-model="formData.allowMixed"
              active-text="允许"
              inactive-text="不允许"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="24">
          <el-form-item label="备注" prop="remarks">
            <el-input v-model="formData.remarks" type="textarea" :rows="2" placeholder="请输入备注信息" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="submitForm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 库位表单组件
 * 功能描述：提供新增和编辑库位的表单
 * 创建日期：2023-09-01
 */
export default {
  name: 'LocationForm',
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
    // 仓库选项
    warehouseOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localVisible: this.visible, // 本地可见性状态
      // 表单数据
      formData: this.getDefaultFormData(),
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
    // 对话框宽度
    dialogWidth() {
      return window.innerWidth < 768 ? '90%' : (window.innerWidth < 992 ? '70%' : '50%')
    }
  },
  watch: {
    // 监听可见性变化，初始化表单数据
    visible(val) {
      this.localVisible = val
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
        warehouseId: undefined,
        warehouseName: '',
        locationType: 'STORAGE',
        locationDesc: '',
        length: 100,
        width: 80,
        height: 120,
        dimension: '100x80x120',
        capacity: 1000,
        occupiedCapacity: 0,
        availableCapacity: 1000,
        maxWeight: 500,
        allowMixed: false,
        remarks: '',
        status: 1
      }
    },
    
    // 更新尺寸字符串
    updateDimension() {
      this.formData.dimension = `${this.formData.length}x${this.formData.width}x${this.formData.height}`
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
      if (!this.editData) return
      
      // 深拷贝行数据，避免直接修改原始数据
      const editData = JSON.parse(JSON.stringify(this.editData))
      
      // 如果维度信息是字符串，转换为数值
      if (editData.dimension && typeof editData.dimension === 'string') {
        const dimensions = editData.dimension.split('x')
        if (dimensions.length === 3) {
          editData.length = parseFloat(dimensions[0])
          editData.width = parseFloat(dimensions[1])
          editData.height = parseFloat(dimensions[2])
        }
      }
      
      this.formData = Object.assign({}, this.getDefaultFormData(), editData)
      this.$nextTick(() => {
        this.$refs.dataForm && this.$refs.dataForm.clearValidate()
      })
    },
    
    // 处理对话框关闭
    handleClose() {
      this.$emit('update:visible', false)
    },
    
    // 处理取消
    handleCancel() {
      this.$emit('update:visible', false)
    },
    
    // 提交表单
    submitForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          // 发送提交事件
          this.$emit('submit', this.formData)
        } else {
          return false
        }
      })
    },
    
    // 处理窗口大小变化
    handleResize() {
      // 不需要实现任何逻辑，只需要触发computed属性重新计算
    }
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f7fa;
  }
}

.el-divider {
  margin: 16px 0;
  
  ::v-deep .el-divider__text {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: bold;
    font-size: 14px;
  }
}
</style> 