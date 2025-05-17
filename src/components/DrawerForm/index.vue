/**
 * 抽屉表单组件
 * 功能描述：封装抽屉式表单的常用功能，支持新增、编辑、查看等操作，提供统一的表单验证和提交逻辑
 * 创建日期：2024-10-28
 */
<template>
  <el-drawer
    :title="formTitle"
    :visible.sync="drawerVisible"
    :size="width"
    :direction="direction"
    :before-close="handleClose"
    custom-class="drawer-form"
    :wrapperClosable="wrapperClosable"
    append-to-body
    @open="handleOpen"
    @closed="handleClosed"
  >
    <div class="drawer-content" ref="drawerContent">
      <el-form
        ref="form"
        :model="formData"
        :rules="rules"
        :label-width="labelWidth"
        :size="size"
        :disabled="mode === 'view'"
        @submit.native.prevent="submitForm"
      >
        <!-- 表单内容插槽 -->
        <slot :form="formData"></slot>
        
        <!-- 默认表单项，如果没有提供自定义插槽 -->
        <template v-if="!$slots.default">
          <!-- 表单分段 -->
          <template v-for="(section, sectionIndex) in formSections">
            <div :key="sectionIndex" class="form-section">
              <h3 v-if="section.title" class="section-title">{{ section.title }}</h3>
              
              <div class="form-row">
                <el-form-item
                  v-for="item in section.items"
                  :key="item.prop"
                  :label="item.label"
                  :prop="item.prop"
                  :class="[item.rowClass]"
                  :style="{ width: item.colSpan ? (item.colSpan / 24 * 100 + '%') : 'auto' }"
                >
                  <!-- 输入框 -->
                  <el-input
                    v-if="item.type === 'input'"
                    v-model="formData[item.prop]"
                    :placeholder="item.placeholder"
                    :disabled="item.disabled || mode === 'view'"
                    :maxlength="item.maxlength"
                    :show-word-limit="item.showWordLimit"
                    :clearable="item.clearable !== false"
                  />
                  
                  <!-- 选择器 -->
                  <el-select
                    v-else-if="item.type === 'select'"
                    v-model="formData[item.prop]"
                    :placeholder="item.placeholder"
                    :disabled="item.disabled || mode === 'view'"
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
                    :disabled="item.disabled || mode === 'view'"
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
                    :disabled="item.disabled || mode === 'view'"
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
                    :disabled="item.disabled || mode === 'view'"
                    :controls="item.controls !== false"
                    :placeholder="item.placeholder"
                    style="width: 100%"
                  />
                  
                  <template v-else-if="item.type === 'number-with-unit'">
                    <el-input-number
                      v-model="formData[item.prop]"
                      :min="item.min"
                      :max="item.max"
                      :step="item.step"
                      :precision="item.precision"
                      :disabled="item.disabled || mode === 'view'"
                      :controls="item.controls !== false"
                      :placeholder="item.placeholder"
                      style="width: 100%"
                    />
                    <span class="unit-label">{{ item.unit }}</span>
                  </template>
                  
                  <!-- 单选框组 -->
                  <el-radio-group
                    v-else-if="item.type === 'radio'"
                    v-model="formData[item.prop]"
                    :disabled="item.disabled || mode === 'view'"
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
                    :disabled="item.disabled || mode === 'view'"
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
                    :disabled="item.disabled || mode === 'view'"
                    :active-text="item.activeText"
                    :inactive-text="item.inactiveText"
                    :active-value="item.activeValue"
                    :inactive-value="item.inactiveValue"
                  />
                  
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
                    :disabled="item.disabled || mode === 'view'"
                    :maxlength="item.maxlength"
                    :show-word-limit="item.showWordLimit"
                    :clearable="item.clearable !== false"
                  />
                  
                  <!-- 表单提示 -->
                  <div v-if="item.tip" class="form-tip">{{ item.tip }}</div>
                </el-form-item>
              </div>
            </div>
          </template>
        </template>
      </el-form>
    </div>
    
    <div class="drawer-footer">
      <!-- 表单按钮插槽 -->
      <slot name="footer">
        <el-button @click="handleCancel">{{ cancelButtonText }}</el-button>
        <el-button v-if="mode === 'create'" type="primary" @click="handleSubmitAndContinue" :loading="loading">保存并继续</el-button>
        <el-button v-if="mode !== 'view'" type="primary" @click="submitForm" :loading="loading">{{ confirmButtonText }}</el-button>
      </slot>
    </div>
  </el-drawer>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'DrawerForm',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 抽屉是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 表单标题
    title: {
      type: String,
      default: ''
    },
    // 表单模式：create/update/view
    mode: {
      type: String,
      default: 'create',
      validator: value => ['create', 'update', 'view'].includes(value)
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
    // 表单分段配置
    formSections: {
      type: Array,
      default: () => []
    },
    // 抽屉宽度
    width: {
      type: String,
      default: '550px'
    },
    // 抽屉方向
    direction: {
      type: String,
      default: 'rtl',
      validator: value => ['ltr', 'rtl', 'ttb', 'btt'].includes(value)
    },
    // 表单标签宽度
    labelWidth: {
      type: String,
      default: '120px'
    },
    // 表单尺寸
    size: {
      type: String,
      default: 'small'
    },
    // 确认按钮文本
    confirmButtonText: {
      type: String,
      default: '确认保存'
    },
    // 取消按钮文本
    cancelButtonText: {
      type: String,
      default: '取 消'
    },
    // 是否点击遮罩关闭
    wrapperClosable: {
      type: Boolean,
      default: false
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 内部抽屉可见状态
      drawerVisible: this.visible,
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
        create: '新增',
        update: '编辑',
        view: '查看'
      }
      
      return modeMap[this.mode] || '表单'
    }
  },
  watch: {
    // 监听外部visible变化
    visible(val) {
      this.drawerVisible = val
    },
    // 监听内部drawerVisible变化
    drawerVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.$emit('close')
      }
    },
    // 监听外部data变化
    data: {
      handler(val) {
        if (this.drawerVisible) {
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
        this.drawerVisible = false
        return
      }
      
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', cloneDeep(this.formData), false)
        } else {
          return false
        }
      })
    },
    
    // 保存并继续
    handleSubmitAndContinue() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('submit', cloneDeep(this.formData), true)
        } else {
          return false
        }
      })
    },
    
    // 取消表单
    handleCancel() {
      this.drawerVisible = false
      this.$emit('cancel')
    },
    
    // 关闭抽屉
    handleClose(done) {
      this.$emit('before-close')
      done()
    },
    
    // 抽屉打开时
    handleOpen() {
      this.formData = cloneDeep(this.data)
      this.originFormData = cloneDeep(this.data)
      this.$emit('open')
    },
    
    // 抽屉关闭后
    handleClosed() {
      this.$refs.form && this.$refs.form.resetFields()
      this.formData = {}
      this.$emit('closed')
    },
    
    // 重置表单
    resetForm() {
      this.$refs.form && this.$refs.form.resetFields()
      this.formData = cloneDeep(this.originFormData)
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-form {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #e6e6e6;
  }
  
  :deep(.el-drawer__body) {
    height: calc(100% - 140px);
    overflow: hidden;
    padding: 0;
    width: 100%;
  }
}

.drawer-content {
  padding: 20px;
  height: calc(100% - 80px); /* 减去footer高度 */
  overflow-y: auto;
  position: relative;
  width: calc(100% - 40px);
  box-sizing: border-box;
  
  :deep(.el-form) {
    width: 100%;
    
    .el-form-item__content {
      width: calc(100% - 100px);
      box-sizing: border-box;
    }
    
    // 确保插槽内容宽度正确
    [class^="slot-"],
    [slot],
    .el-form-item {
      width: 100%;
      box-sizing: border-box;
    }
  }
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px;
  width: 100%;
  
  .el-form-item {
    padding: 0 10px;
    margin-bottom: 18px;
    box-sizing: border-box;
  }
}

.form-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
}

.unit-label {
  margin-left: 8px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e6e6e6;
  text-align: right;
  z-index: 1;
  
  .el-button {
    margin-left: 10px;
  }
}

::v-deep .el-select {
  width: 100%;
}

::v-deep .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
  content: "*";
  color: #F56C6C;
  margin-right: 4px;
}

::v-deep .el-form-item__content {
  width: calc(100% - 100px);
  box-sizing: border-box;
  
  > * {
    width: 100%;
  }
}
</style> 