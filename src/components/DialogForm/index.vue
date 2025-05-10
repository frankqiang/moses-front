/**
 * 弹窗表单组件
 * 功能描述：封装弹窗表单的常用功能，支持新增、编辑等操作，提供统一的表单验证和提交逻辑
 * 创建日期：2023-11-20
 */
<template>
  <el-dialog
    :title="formTitle"
    :visible.sync="dialogVisible"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="closeOnPressEscape"
    :before-close="handleClose"
    @open="handleOpen"
    @closed="handleClosed"
    append-to-body
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      :label-width="labelWidth"
      :size="size"
      @submit.native.prevent="submitForm"
    >
      <!-- 表单内容插槽 -->
      <slot :form="formData"></slot>
      
      <!-- 默认表单项，如果没有提供自定义插槽 -->
      <template v-if="!$slots.default">
        <el-form-item
          v-for="item in formItems"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
        >
          <!-- 输入框 -->
          <el-input
            v-if="item.type === 'input'"
            v-model="formData[item.prop]"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :maxlength="item.maxlength"
            :show-word-limit="item.showWordLimit"
            :clearable="item.clearable !== false"
          />
          
          <!-- 选择器 -->
          <el-select
            v-else-if="item.type === 'select'"
            v-model="formData[item.prop]"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            :multiple="item.multiple"
            :collapse-tags="item.collapseTags"
            style="width: 100%"
          >
            <el-option
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
              :disabled="opt.disabled"
            />
          </el-select>

          <!-- 文本域 -->
          <el-input
            v-else-if="item.type === 'textarea'"
            v-model="formData[item.prop]"
            type="textarea"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :maxlength="item.maxlength"
            :show-word-limit="item.showWordLimit"
            :rows="item.rows || 3"
            :clearable="item.clearable !== false"
          />
          
          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="formData[item.prop]"
            :type="item.dateType || 'date'"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            :format="item.format"
            :value-format="item.valueFormat"
            style="width: 100%"
          />
          
          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="item.type === 'number'"
            v-model="formData[item.prop]"
            :min="item.min"
            :max="item.max"
            :step="item.step"
            :precision="item.precision"
            :disabled="item.disabled"
            :controls="item.controls !== false"
            :placeholder="item.placeholder"
            style="width: 100%"
          />
          
          <!-- 单选框组 -->
          <el-radio-group
            v-else-if="item.type === 'radio'"
            v-model="formData[item.prop]"
            :disabled="item.disabled"
          >
            <el-radio
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
          
          <!-- 复选框组 -->
          <el-checkbox-group
            v-else-if="item.type === 'checkbox'"
            v-model="formData[item.prop]"
            :disabled="item.disabled"
          >
            <el-checkbox
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
          
          <!-- 开关 -->
          <el-switch
            v-else-if="item.type === 'switch'"
            v-model="formData[item.prop]"
            :disabled="item.disabled"
            :active-text="item.activeText"
            :inactive-text="item.inactiveText"
            :active-value="item.activeValue"
            :inactive-value="item.inactiveValue"
          />
          
          <!-- 上传 -->
          <el-upload
            v-else-if="item.type === 'upload'"
            :action="item.action"
            :headers="item.headers"
            :data="item.data"
            :name="item.name"
            :with-credentials="item.withCredentials"
            :show-file-list="item.showFileList !== false"
            :drag="item.drag"
            :accept="item.accept"
            :limit="item.limit"
            :file-list="formData[item.prop]"
            :disabled="item.disabled"
            :before-upload="item.beforeUpload"
            :on-success="file => handleUploadSuccess(file, item)"
            :on-error="item.onError"
            :on-progress="item.onProgress"
            :on-remove="file => handleRemoveFile(file, item)"
          >
            <i v-if="item.drag" class="el-icon-upload"></i>
            <div v-if="item.drag" class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <el-button v-else size="small" type="primary">点击上传</el-button>
            <div v-if="item.tip" class="el-upload__tip">{{ item.tip }}</div>
          </el-upload>
          
          <!-- 自定义插槽 -->
          <slot
            v-else-if="item.type === 'slot'"
            :name="item.slotName || item.prop"
            :form="formData"
          />
          
          <!-- 默认为输入框 -->
          <el-input
            v-else
            v-model="formData[item.prop]"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :maxlength="item.maxlength"
            :show-word-limit="item.showWordLimit"
            :clearable="item.clearable !== false"
          />
        </el-form-item>
      </template>
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <!-- 表单按钮插槽 -->
      <slot name="footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="loading">{{ confirmButtonText }}</el-button>
      </slot>
    </div>
  </el-dialog>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'DialogForm',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 弹窗是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 表单标题
    title: {
      type: String,
      default: ''
    },
    // 表单模式：add/edit/view
    mode: {
      type: String,
      default: 'add',
      validator: value => ['add', 'edit', 'view'].includes(value)
    },
    // 表单数据
    data: {
      type: Object,
      default: () => ({})
    },
    // 表单验证规则
    rules: {
      type: Object,
      default: () => ({})
    },
    // 表单项配置
    formItems: {
      type: Array,
      default: () => []
    },
    // 弹窗宽度
    width: {
      type: String,
      default: '500px'
    },
    // 表单标签宽度
    labelWidth: {
      type: String,
      default: '100px'
    },
    // 表单尺寸
    size: {
      type: String,
      default: 'small'
    },
    // 确认按钮文本
    confirmButtonText: {
      type: String,
      default: '确 定'
    },
    // 是否按Esc关闭
    closeOnPressEscape: {
      type: Boolean,
      default: true
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 内部弹窗可见状态
      dialogVisible: this.visible,
      // 内部表单数据
      formData: {},
      // 原始表单数据（用于重置）
      originFormData: {}
    }
  },
  computed: {
    // 表单标题
    formTitle() {
      if (this.title) return this.title
      
      const modeMap = {
        add: '新增',
        edit: '编辑',
        view: '查看'
      }
      
      return modeMap[this.mode] || '表单'
    }
  },
  watch: {
    // 监听外部visible变化
    visible(val) {
      this.dialogVisible = val
    },
    // 监听内部dialogVisible变化
    dialogVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.$emit('close')
      }
    },
    // 监听外部data变化
    data: {
      handler(val) {
        if (this.dialogVisible) {
          this.formData = cloneDeep(val)
          this.originFormData = cloneDeep(val)
        }
      },
      deep: true
    }
  },
  methods: {
    // 提交表单
    submitForm() {
      if (this.mode === 'view') {
        this.dialogVisible = false
        return
      }
      
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', cloneDeep(this.formData))
        } else {
          return false
        }
      })
    },
    
    // 取消表单
    handleCancel() {
      this.dialogVisible = false
      this.$emit('cancel')
    },
    
    // 关闭弹窗
    handleClose(done) {
      this.$emit('before-close')
      done()
    },
    
    // 弹窗打开时
    handleOpen() {
      this.formData = cloneDeep(this.data)
      this.originFormData = cloneDeep(this.data)
      this.$emit('open')
      
      // 表单处于查看模式时禁用所有输入框
      if (this.mode === 'view') {
        this.$nextTick(() => {
          const formItems = this.$el.querySelectorAll('.el-form-item__content .el-input, .el-form-item__content .el-select')
          formItems.forEach(item => {
            item.classList.add('is-disabled')
            const input = item.querySelector('input')
            if (input) input.setAttribute('disabled', 'disabled')
          })
        })
      }
    },
    
    // 弹窗关闭后
    handleClosed() {
      this.$refs.form.resetFields()
      this.formData = {}
      this.$emit('closed')
    },
    
    // 处理上传成功
    handleUploadSuccess(response, item) {
      if (typeof item.onSuccess === 'function') {
        item.onSuccess(response, this.formData)
      } else {
        if (Array.isArray(this.formData[item.prop])) {
          this.formData[item.prop].push(response)
        } else {
          this.$set(this.formData, item.prop, [response])
        }
      }
    },
    
    // 处理移除文件
    handleRemoveFile(file, item) {
      if (typeof item.onRemove === 'function') {
        item.onRemove(file, this.formData)
      } else {
        if (Array.isArray(this.formData[item.prop])) {
          const index = this.formData[item.prop].indexOf(file)
          if (index > -1) {
            this.formData[item.prop].splice(index, 1)
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-upload-dragger {
  width: 100%;
}

::v-deep .el-select {
  width: 100%;
}

::v-deep .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
  content: "*";
  color: #F56C6C;
  margin-right: 4px;
}
</style> 