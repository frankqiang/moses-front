/**
 * 物料编码规则表单组件
 * 功能描述：提供新增和编辑物料编码规则的表单功能
 * 创建日期：2023-10-01
 * 更新日期：2024-10-28
 */
<template>
  <Drawer
    ref="drawer"
    :visible.sync="drawerVisible"
    :title="type === 'create' ? '新增编码规则' : '编辑编码规则'"
    :mode="type"
    :data="formData"
    :rules="rules"
    :form-sections="formSections"
    :loading="submitLoading"
    width="550px"
    @submit="submitForm"
    @close="handleClose"
    @open="handleOpen"
  >
    <template #footer>
      <div v-if="formData.type !== 'custom'" class="preview-box">
        <span class="preview-title">预览结果：</span>
        <el-tag type="success" size="medium">
          {{ previewCode }}
        </el-tag>
      </div>
      <div class="drawer-footer-buttons">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="type === 'create'" type="primary" :loading="submitLoading" @click="handleSubmitAndContinue">保存并继续</el-button>
        <el-button v-if="type !== 'view'" type="primary" :loading="submitLoading" @click="handleSubmit">{{ type === 'create' ? '确认保存' : '保存修改' }}</el-button>
      </div>
    </template>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import { cloneDeep } from 'lodash'
import { generatePreviewCode } from '@/api/master-data/material-code'

export default {
  name: 'CodeRuleForm',
  components: {
    Drawer
  },
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
      default: () => null
    }
  },
  data() {
    return {
      drawerVisible: false,
      submitLoading: false,
      formData: this.getDefaultFormData(),
      apiPreviewCode: '', // 存储从API获取的预览编码
      rules: {
        name: [
          { required: true, message: '请输入规则名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择规则类型', trigger: 'change' }
        ],
        prefix: [
          { required: false, message: '请输入前缀', trigger: 'blur' }
        ],
        sequenceLength: [
          { required: false, message: '请输入流水号位数', trigger: 'blur' }
        ],
        currentValue: [
          { required: false, message: '请输入起始值', trigger: 'blur' }
        ],
        customRule: [
          { required: false, message: '请输入自定义规则', trigger: 'blur' }
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
      // 如果有API返回的预览编码，优先使用API结果
      if (this.apiPreviewCode) {
        return this.apiPreviewCode
      }

      // 否则使用本地计算的预览编码
      if (this.formData.type === 'pure_numeric') {
        return String(this.formData.currentValue || 0).padStart(this.formData.sequenceLength || 0, '0')
      } else if (this.formData.type === 'prefix_numeric') {
        return `${this.formData.prefix || ''}${String(this.formData.currentValue || 0).padStart(this.formData.sequenceLength || 0, '0')}`
      }
      return ''
    },
    formSections() {
      return [
        {
          title: '基本信息',
          items: [
            {
              prop: 'name',
              label: '规则名称',
              type: 'input',
              placeholder: '请输入规则名称',
              maxlength: 50,
              showWordLimit: true
            },
            {
              prop: 'type',
              label: '规则类型',
              type: 'select',
              placeholder: '请选择规则类型',
              options: this.ruleTypeOptions
            }
          ]
        },
        {
          title: '编码规则配置',
          items: [
            ...(this.formData.type === 'prefix_numeric' ? [
              {
                prop: 'prefix',
                label: '前缀',
                type: 'input',
                placeholder: '请输入前缀（如：BIN-）'
              }
            ] : []),
            ...(this.formData.type === 'pure_numeric' || this.formData.type === 'prefix_numeric' ? [
              {
                prop: 'sequenceLength',
                label: '流水号位数',
                type: 'number',
                min: 1,
                max: 20,
                tip: '生成的流水号将补零至该位数'
              },
              {
                prop: 'currentValue',
                label: '起始值',
                type: 'number',
                min: 0,
                tip: '流水号从该值开始递增'
              },
              {
                prop: 'stepValue',
                label: '步长',
                type: 'number',
                min: 1,
                tip: '每次生成新编码时的增长值'
              }
            ] : []),
            ...(this.formData.type === 'custom' ? [
              {
                prop: 'customRule',
                label: '自定义规则',
                type: 'textarea',
                rows: 4,
                placeholder: '请输入自定义编码规则的详细描述'
              }
            ] : [])
          ]
        },
        {
          title: '二维码配置',
          items: [
            {
              prop: 'qrCodeContent',
              label: '二维码内容',
              type: 'select',
              placeholder: '请选择二维码内容',
              options: [
                { label: '仅包含料框ID', value: 'id_only' },
                { label: '料框ID和规格信息', value: 'id_and_spec' },
                { label: '完整物料信息(JSON)', value: 'full_info' }
              ],
              tip: '推荐仅包含料框ID，避免包含易变信息'
            },
            {
              prop: 'qrCodeSize',
              label: 'QR码尺寸',
              type: 'select',
              placeholder: '请选择QR码尺寸',
              options: [
                { label: '小 (200x200)', value: 'small' },
                { label: '中 (350x350)', value: 'medium' },
                { label: '大 (500x500)', value: 'large' }
              ]
            },
            {
              prop: 'errorCorrectionLevel',
              label: '纠错级别',
              type: 'select',
              placeholder: '请选择纠错级别',
              options: [
                { label: 'L - 低 (7%)', value: 'L' },
                { label: 'M - 中 (15%)', value: 'M' },
                { label: 'Q - 较高 (25%)', value: 'Q' },
                { label: 'H - 高 (30%)', value: 'H' }
              ],
              tip: '推荐使用M级别或Q级别，平衡纠错能力与密度'
            },
            {
              prop: 'isDefault',
              label: '设为默认',
              type: 'switch',
              tip: '设为默认后，新增料框时将使用此规则'
            }
          ]
        }
      ]
    }
  },
  watch: {
    visible(val) {
      this.drawerVisible = val
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    // 监听表单中与预览相关的字段变化
    'formData.type': {
      handler: 'updatePreviewCode',
      immediate: false
    },
    'formData.prefix': {
      handler: 'updatePreviewCode',
      immediate: false
    },
    'formData.sequenceLength': {
      handler: 'updatePreviewCode',
      immediate: false
    },
    'formData.currentValue': {
      handler: 'updatePreviewCode',
      immediate: false
    },
    // 监听DrawerForm中的表单数据变化
    '$refs.drawerForm.formData': {
      handler(val) {
        if (val) {
          // 将DrawerForm中的表单数据同步到本组件
          this.formData = cloneDeep(val)
          // 更新预览编码
          this.updatePreviewCode()
        }
      },
      deep: true
    }
  },
  created() {
    // 在组件创建时，设置MutationObserver监听DOM变化
    this.$nextTick(() => {
      this.setupFormChangeObserver()
    })
  },
  // 组件销毁时清理observer
  beforeDestroy() {
    if (this.formObserver) {
      this.formObserver.disconnect()
    }
  },
  methods: {
    getDefaultFormData() {
      return {
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
    handleOpen() {
      // 在抽屉打开时初始化表单数据
      if (this.type === 'create') {
        // 创建模式使用默认值
        this.formData = this.getDefaultFormData()
      } else if (this.type === 'update' && this.editData) {
        // 编辑模式使用传入的数据
        this.formData = cloneDeep(this.editData)
      }

      // 确保DrawerForm组件内部也更新了数据
      this.$nextTick(() => {
        if (this.$refs.drawerForm) {
          this.$refs.drawerForm.formData = cloneDeep(this.formData)
          // 表单打开时更新预览编码
          this.updatePreviewCode()
          // 设置表单项的验证规则
          this.updateFormValidation()
          // 重新设置DOM变化监听
          this.setupFormChangeObserver()
        }
      })
    },
    handleClose() {
      this.drawerVisible = false
      this.resetForm()
    },
    resetForm() {
      this.formData = this.getDefaultFormData()
      this.apiPreviewCode = ''
      if (this.$refs.drawerForm && this.$refs.drawerForm.$refs.form) {
        this.$refs.drawerForm.$refs.form.resetFields()
      }
    },
    handleSubmit() {
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (valid) {
          this.submitForm(this.$refs.drawerForm.formData, false)
        }
      })
    },
    handleSubmitAndContinue() {
      this.$refs.drawerForm.$refs.form.validate(valid => {
        if (valid) {
          this.submitForm(this.$refs.drawerForm.formData, true)
        }
      })
    },
    submitForm(formData, continueAdd) {
      this.submitLoading = true

      try {
        // 获取表单中的实际数据
        const actualFormData = this.$refs.drawerForm.formData

        // 根据规则类型，清理不需要的字段
        const submitData = cloneDeep(actualFormData)

        // 如果是编辑模式，需要保留ID
        if (this.type === 'update' && this.editData && this.editData.id) {
          submitData.id = this.editData.id
        }

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

        console.log('提交的数据:', submitData)
        this.$emit('submit', submitData, continueAdd)

        // 如果不是继续添加，则关闭抽屉
        if (!continueAdd) {
          this.drawerVisible = false
        } else {
          // 如果是继续添加，则重置表单
          this.resetForm()
        }
      } catch (error) {
        console.error('表单提交错误:', error)
        this.$message.error('表单提交失败，请重试')
      } finally {
        this.submitLoading = false
      }
    },
    // 设置表单变化的DOM监听
    setupFormChangeObserver() {
      // 确保在DOM渲染完成后执行
      this.$nextTick(() => {
        if (!this.$refs.drawerForm) return

        // 获取表单DOM元素
        const formElement = this.$refs.drawerForm.$el.querySelector('.el-form')
        if (!formElement) return

        // 创建MutationObserver监听表单内容变化
        const observer = new MutationObserver(mutations => {
          // 当表单内容变化时，获取最新的表单数据并更新预览
          if (this.$refs.drawerForm) {
            // 使用setTimeout确保在Vue更新DOM后执行
            setTimeout(() => {
              // 获取最新的表单数据
              const currentFormData = this.$refs.drawerForm.formData
              // 更新本地formData
              this.formData = cloneDeep(currentFormData)
              // 更新预览编码
              this.updatePreviewCode()
            }, 0)
          }
        })

        // 配置观察选项
        const config = {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true
        }

        // 开始观察
        observer.observe(formElement, config)

        // 保存observer引用以便后续清理
        this.formObserver = observer
      })
    },
    // 更新预览编码
    updatePreviewCode() {
      // 只有非自定义规则才需要更新预览
      if (!this.formData || this.formData.type === 'custom') {
        this.apiPreviewCode = ''
        return
      }

      // 调用API获取预览编码
      const previewData = {
        type: this.formData.type,
        prefix: this.formData.prefix || '',
        sequenceLength: this.formData.sequenceLength || 0,
        currentValue: this.formData.currentValue || 0
      }

      generatePreviewCode(previewData)
        .then(response => {
          if (response.data && response.data.previewCode) {
            this.apiPreviewCode = response.data.previewCode
          }
        })
        .catch(error => {
          console.error('获取预览编码失败:', error)
          // API调用失败时，使用本地计算的预览编码
          this.apiPreviewCode = ''
        })
    },
    // 根据规则类型更新表单验证规则
    updateFormValidation() {
      const type = this.formData.type

      // 根据规则类型设置不同字段的必填验证
      if (type === 'pure_numeric') {
        this.rules.prefix[0].required = false
        this.rules.sequenceLength[0].required = true
        this.rules.currentValue[0].required = true
        this.rules.customRule[0].required = false
      } else if (type === 'prefix_numeric') {
        this.rules.prefix[0].required = true
        this.rules.sequenceLength[0].required = true
        this.rules.currentValue[0].required = true
        this.rules.customRule[0].required = false
      } else if (type === 'custom') {
        this.rules.prefix[0].required = false
        this.rules.sequenceLength[0].required = false
        this.rules.currentValue[0].required = false
        this.rules.customRule[0].required = true
      }

      // 如果表单已经初始化，需要重新验证
      this.$nextTick(() => {
        if (this.$refs.drawerForm && this.$refs.drawerForm.$refs.form) {
          this.$refs.drawerForm.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.preview-box {
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;

  .preview-title {
    margin-right: 10px;
    font-weight: bold;
  }
}

.drawer-footer-buttons {
  text-align: right;

  .el-button {
    margin-left: 10px;
  }
}
</style>
