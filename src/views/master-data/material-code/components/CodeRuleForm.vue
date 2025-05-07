<template>
  <el-dialog
    :title="type === 'create' ? '新增编码规则' : '编辑编码规则'"
    :visible.sync="dialogVisible"
    width="650px"
    @close="handleClose"
  >
    <el-form
      ref="ruleForm"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
      size="small"
    >
      <el-form-item label="规则名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入规则名称"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="规则类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择规则类型"
          style="width: 100%"
        >
          <el-option
            v-for="item in ruleTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="formData.type === 'prefix_numeric'"
        label="前缀"
        prop="prefix"
      >
        <el-input
          v-model="formData.prefix"
          placeholder="请输入前缀（如：BIN-）"
          style="width: 100%"
        />
      </el-form-item>

      <template v-if="formData.type === 'pure_numeric' || formData.type === 'prefix_numeric'">
        <el-form-item label="流水号位数" prop="sequenceLength">
          <el-input-number
            v-model="formData.sequenceLength"
            :min="1"
            :max="20"
            controls-position="right"
            style="width: 200px"
          />
          <span class="form-tip">生成的流水号将补零至该位数</span>
        </el-form-item>

        <el-form-item label="起始值" prop="currentValue">
          <el-input-number
            v-model="formData.currentValue"
            :min="0"
            controls-position="right"
            style="width: 200px"
          />
          <span class="form-tip">流水号从该值开始递增</span>
        </el-form-item>

        <el-form-item label="步长" prop="stepValue">
          <el-input-number
            v-model="formData.stepValue"
            :min="1"
            controls-position="right"
            style="width: 200px"
          />
          <span class="form-tip">每次生成新编码时的增长值</span>
        </el-form-item>
      </template>

      <el-form-item
        v-if="formData.type === 'custom'"
        label="自定义规则"
        prop="customRule"
      >
        <el-input
          v-model="formData.customRule"
          type="textarea"
          rows="4"
          placeholder="请输入自定义编码规则的详细描述"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="二维码内容" prop="qrCodeContent">
        <el-select
          v-model="formData.qrCodeContent"
          placeholder="请选择二维码内容"
          style="width: 100%"
        >
          <el-option label="仅包含料框ID" value="id_only" />
          <el-option label="料框ID和规格信息" value="id_and_spec" />
          <el-option label="完整物料信息(JSON)" value="full_info" />
        </el-select>
        <span class="form-tip">推荐仅包含料框ID，避免包含易变信息</span>
      </el-form-item>

      <el-form-item label="QR码尺寸" prop="qrCodeSize">
        <el-select
          v-model="formData.qrCodeSize"
          placeholder="请选择QR码尺寸"
          style="width: 100%"
        >
          <el-option label="小 (200x200)" value="small" />
          <el-option label="中 (350x350)" value="medium" />
          <el-option label="大 (500x500)" value="large" />
        </el-select>
      </el-form-item>

      <el-form-item label="纠错级别" prop="errorCorrectionLevel">
        <el-select
          v-model="formData.errorCorrectionLevel"
          placeholder="请选择纠错级别"
          style="width: 100%"
        >
          <el-option label="L - 低 (7%)" value="L" />
          <el-option label="M - 中 (15%)" value="M" />
          <el-option label="Q - 较高 (25%)" value="Q" />
          <el-option label="H - 高 (30%)" value="H" />
        </el-select>
        <span class="form-tip">推荐使用M级别或Q级别，平衡纠错能力与密度</span>
      </el-form-item>

      <el-form-item label="设为默认" prop="isDefault">
        <el-switch v-model="formData.isDefault" />
        <span class="form-tip">设为默认后，新增料框时将使用此规则</span>
      </el-form-item>

      <el-form-item label="编码预览" v-if="formData.type !== 'custom'">
        <div class="preview-box">
          <span class="preview-title">预览结果：</span>
          <el-tag type="success" size="medium">
            {{ previewCode }}
          </el-tag>
        </div>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'CodeRuleForm',
  props: {
    type: {
      type: String,
      default: 'create'
    },
    visible: {
      type: Boolean,
      default: false
    },
    editData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false,
      submitLoading: false,
      formData: {
        name: '',
        type: 'prefix_numeric',
        prefix: 'BIN-',
        sequenceLength: 6,
        currentValue: 1,
        stepValue: 1,
        customRule: '',
        qrCodeContent: 'id_only',
        qrCodeSize: 'medium',
        errorCorrectionLevel: 'M',
        isDefault: false
      },
      rules: {
        name: [
          { required: true, message: '请输入规则名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择规则类型', trigger: 'change' }
        ],
        prefix: [
          { required: true, message: '请输入前缀', trigger: 'blur' }
        ],
        sequenceLength: [
          { required: true, message: '请输入流水号位数', trigger: 'blur' }
        ],
        currentValue: [
          { required: true, message: '请输入起始值', trigger: 'blur' }
        ],
        customRule: [
          { required: true, message: '请输入自定义规则', trigger: 'blur' }
        ],
        qrCodeContent: [
          { required: true, message: '请选择二维码内容', trigger: 'change' }
        ],
        errorCorrectionLevel: [
          { required: true, message: '请选择纠错级别', trigger: 'change' }
        ]
      },
      ruleTypeOptions: [
        { value: 'pure_numeric', label: '纯数字流水号' },
        { value: 'prefix_numeric', label: '前缀+流水号' },
        { value: 'custom', label: '自定义规则' }
      ]
    }
  },
  computed: {
    previewCode() {
      if (this.formData.type === 'pure_numeric') {
        return String(this.formData.currentValue).padStart(this.formData.sequenceLength, '0')
      } else if (this.formData.type === 'prefix_numeric') {
        return `${this.formData.prefix}${String(this.formData.currentValue).padStart(this.formData.sequenceLength, '0')}`
      }
      return ''
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    },
    editData: {
      handler(val) {
        if (val) {
          this.formData = { ...this.formData, ...val }
        } else {
          this.resetForm()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      if (this.$refs.ruleForm) {
        this.$refs.ruleForm.resetFields()
      }
      
      this.formData = {
        name: '',
        type: 'prefix_numeric',
        prefix: 'BIN-',
        sequenceLength: 6,
        currentValue: 1,
        stepValue: 1,
        customRule: '',
        qrCodeContent: 'id_only',
        qrCodeSize: 'medium',
        errorCorrectionLevel: 'M',
        isDefault: false
      }
    },
    submitForm() {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          
          // 根据规则类型，清理不需要的字段
          const submitData = { ...this.formData }
          if (submitData.type === 'pure_numeric') {
            submitData.prefix = ''
            submitData.customRule = ''
          } else if (submitData.type === 'prefix_numeric') {
            submitData.customRule = ''
          } else if (submitData.type === 'custom') {
            submitData.prefix = ''
            submitData.sequenceLength = 0
            submitData.currentValue = 0
            submitData.stepValue = 0
          }

          this.$emit('submit', submitData)
          this.submitLoading = false
          this.handleClose()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.preview-box {
  display: flex;
  align-items: center;
  margin-top: 5px;

  .preview-title {
    margin-right: 10px;
  }
}
</style>
