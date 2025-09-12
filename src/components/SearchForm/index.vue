/**
 * 高级搜索表单组件 V2
 * 功能描述：提供统一的搜索表单布局和功能，支持表单项配置、折叠展开、重置等功能
 * 优化了数据流向，避免死循环问题，减少了模板重复代码，增加了防抖功能
 * 创建日期：2024-12-16
 */
<template>
  <div class="search-form-container">
    <el-form
      ref="form"
      :model="localFormModel"
      :inline="inline"
      size="small"
      :label-width="labelWidth"
      @keyup.enter.native="handleSubmitWithDebounce"
    >
      <!-- 表单项渲染（包括可见项和展开项） -->
      <template v-for="(item, index) in computedFormItems">
        <el-form-item
          v-show="showMore || index < visibleItemCount"
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :class="[item.class, {'hidden-item': !showMore && index >= visibleItemCount}]"
        >
          <!-- 表单控件组件 - 使用动态组件渲染不同类型表单项 -->
          <component
            :is="getComponentName(item.type)"
            v-if="!isCustomComponent(item.type)"
            v-model="localFormModel[item.prop]"
            v-bind="getComponentProps(item)"
            @change="handleItemChange(item)"
            @clear="handleItemClear(item.prop)"
          >
            <!-- 渲染options内容（针对select/radio/checkbox等） -->
            <template v-if="hasOptions(item.type)">
              <component
                :is="getOptionComponentName(item.type)"
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.value"
                :value="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </component>
            </template>
          </component>

          <!-- 自定义插槽 -->
          <slot
            v-else-if="item.type === 'slot'"
            :name="item.slotName || item.prop"
            :model="localFormModel"
          />
        </el-form-item>
      </template>

      <!-- 表单操作按钮 -->
      <el-form-item class="search-buttons">
        <el-button
          type="primary"
          :loading="loading"
          class="form-button"
          @click="handleSubmitWithDebounce"
        >
          查询
        </el-button>
        <el-button
          class="form-button"
          @click="handleReset"
        >
          重置
        </el-button>

        <!-- 展开/收起按钮 -->
        <el-button
          v-if="expandable && computedFormItems.length > visibleItemCount"
          type="text"
          class="expand-button"
          @click="showMore = !showMore"
        >
          {{ showMore ? '收起' : '展开' }}
          <i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
        </el-button>

        <!-- 更多按钮插槽 -->
        <slot name="buttons" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// 组件映射关系
const COMPONENT_MAP = {
  input: 'el-input',
  select: 'el-select',
  date: 'el-date-picker',
  time: 'el-time-picker',
  radio: 'el-radio-group',
  checkbox: 'el-checkbox-group',
  number: 'el-input-number',
  rate: 'el-rate',
  switch: 'el-switch',
  slider: 'el-slider',
  'input-number': 'el-input-number'
}

// 选项组件映射
const OPTION_COMPONENT_MAP = {
  select: 'el-option',
  radio: 'el-radio',
  checkbox: 'el-checkbox'
}

// 需要选项的组件类型
const COMPONENTS_WITH_OPTIONS = ['select', 'radio', 'checkbox']

export default {
  name: 'SearchForm',
  props: {
    // 表单项配置数组
    items: {
      type: Array,
      required: true,
      validator: items => {
        return items.every(item => {
          return typeof item === 'object' && item.prop
        })
      }
    },
    // 表单数据对象 (v-model)
    value: {
      type: Object,
      default: () => ({})
    },
    // 是否为行内表单
    inline: {
      type: Boolean,
      default: true
    },
    // 标签宽度
    labelWidth: {
      type: String,
      default: ''
    },
    // 是否可展开收起
    expandable: {
      type: Boolean,
      default: true
    },
    // 始终可见的表单项数量（不算按钮）
    visibleItemCount: {
      type: Number,
      default: 3
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 重置后是否自动搜索
    searchAfterReset: {
      type: Boolean,
      default: false
    },
    // 防抖延迟时间(ms)
    debounceTime: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      // 本地表单数据模型
      localFormModel: {},
      // 是否显示更多表单项
      showMore: false,
      // 防抖定时器
      debounceTimer: null,
      // 标记表单是否正在被重置
      isResetting: false
    }
  },
  computed: {
    // 计算所有表单项（包括可见和折叠的）
    computedFormItems() {
      return this.items || []
    }
  },
  watch: {
    // 监听外部传入的value变化 - 使用深度监听
    value: {
      handler(newVal) {
        // 避免在重置过程中更新表单数据造成循环
        if (!this.isResetting) {
          // 深拷贝对象，避免引用问题
          this.localFormModel = JSON.parse(JSON.stringify(newVal || {}))
        }
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    // 初始化本地表单数据
    this.initFormModel()
  },
  methods: {
    // 初始化表单数据
    initFormModel() {
      const model = {}

      // 遍历表单项配置，设置初始值
      this.items.forEach(item => {
        if (item.prop) {
          // 检查value中是否有该字段的值
          if (this.value && this.value[item.prop] !== undefined) {
            model[item.prop] = this.value[item.prop]
          } else {
            // 根据字段类型设置默认空值
            if (item.type === 'select' && item.multiple) {
              model[item.prop] = []
            } else if (item.type === 'checkbox') {
              model[item.prop] = []
            } else if (item.type === 'number' || item.type === 'input-number') {
              model[item.prop] = undefined
            } else {
              model[item.prop] = ''
            }
          }
        }
      })

      this.localFormModel = model
    },

    // 获取组件名称
    getComponentName(type) {
      return COMPONENT_MAP[type] || 'el-input'
    },

    // 获取选项组件名称
    getOptionComponentName(type) {
      return OPTION_COMPONENT_MAP[type] || 'el-option'
    },

    // 判断是否为自定义组件类型
    isCustomComponent(type) {
      return type === 'slot'
    },

    // 判断组件是否需要选项
    hasOptions(type) {
      return COMPONENTS_WITH_OPTIONS.includes(type)
    },

    // 获取组件属性
    getComponentProps(item) {
      const props = { ...item }

      // 移除非组件属性
      delete props.prop
      delete props.label
      delete props.type
      delete props.class
      delete props.slotName

      // 为不同类型组件设置特殊属性
      if (item.type === 'date') {
        props.type = item.dateType || 'date'
      }

      return props
    },

    // 处理表单项变化
    handleItemChange(item) {
      // 触发change事件
      if (item.onChange && typeof item.onChange === 'function') {
        item.onChange(this.localFormModel[item.prop])
      }

      // 同步到父组件
      this.syncToParent()

      // 如果配置了自动搜索，使用防抖执行搜索
      if (item.searchOnChange) {
        this.handleSubmitWithDebounce()
      }
    },

    // 处理表单项清空
    handleItemClear(prop) {
      // 确保值被清空
      this.$nextTick(() => {
        this.localFormModel[prop] = ''

        // 同步到父组件
        this.syncToParent()

        // 自动触发搜索 - 使用防抖
        this.handleSubmitWithDebounce()
      })
    },

    // 同步数据到父组件
    syncToParent() {
      // 创建一个新对象，避免引用问题
      const formData = JSON.parse(JSON.stringify(this.localFormModel))
      this.$emit('input', formData)
    },

    // 创建搜索参数（移除空值）
    createSearchParams() {
      const params = {}

      Object.keys(this.localFormModel).forEach(key => {
        const value = this.localFormModel[key]

        // 检查值是否为空
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          params[key] = value
        }
      })

      return params
    },

    // 带防抖的提交处理
    handleSubmitWithDebounce() {
      // 清除之前的定时器
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      // 设置新的定时器
      this.debounceTimer = setTimeout(() => {
        this.handleSubmit()
      }, this.debounceTime)
    },

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 创建搜索参数
          const params = this.createSearchParams()

          // 触发搜索事件
          this.$emit('search', params)

          // 同步到父组件
          this.syncToParent()
        }
      })
    },

    // 重置表单
    handleReset() {
      // 标记重置开始
      this.isResetting = true

      // 使用el-form的resetFields方法重置表单
      this.$refs.form.resetFields()

      // 清空不在表单验证规则中的字段
      const emptyModel = {}
      this.items.forEach(item => {
        if (item.prop) {
          // 根据字段类型设置默认空值
          if (item.type === 'select' && item.multiple) {
            emptyModel[item.prop] = []
          } else if (item.type === 'checkbox') {
            emptyModel[item.prop] = []
          } else if (item.type === 'number' || item.type === 'input-number') {
            emptyModel[item.prop] = undefined
          } else {
            emptyModel[item.prop] = ''
          }
        }
      })

      // 更新内部表单模型
      this.localFormModel = { ...emptyModel }

      // 确保DOM更新后再继续操作
      this.$nextTick(() => {
        // 触发重置事件
        this.$emit('reset')

        // 同步到父组件
        this.syncToParent()

        // 如果需要重置后自动查询，则触发查询事件
        if (this.searchAfterReset) {
          this.$emit('search', {})
        }

        // 标记重置结束
        this.isResetting = false
      })
    },

    // 公开方法：提交表单 - 供父组件调用
    submit() {
      this.handleSubmit()
    },

    // 公开方法：重置表单 - 供父组件调用
    reset() {
      this.handleReset()
    },

    // 公开方法：设置表单值 - 供父组件调用
    setValues(values) {
      if (!values || typeof values !== 'object') return

      Object.keys(values).forEach(key => {
        if (this.localFormModel.hasOwnProperty(key)) {
          this.localFormModel[key] = values[key]
        }
      })

      // 同步到父组件
      this.syncToParent()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form-container {
  padding: 18px 20px 0;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 18px;
  // margin-bottom: 18px;

  .el-form {
    display: flex;
    flex-wrap: wrap;

    .el-form-item {
      margin-right: 18px;
      margin-bottom: 18px;
      transition: all 0.3s;

      &.full-width {
        width: 100%;
      }

      &.double-width {
        width: calc(50% - 18px);
      }

      &.hidden-item {
        display: none;
      }
    }

    .search-buttons {
      margin-right: 0;

      .form-button {
        min-width: 80px;
        transition: all 0.3s ease;

        &:first-child {
          margin-right: 10px;
        }
      }

      .expand-button {
        margin-left: 10px;
      }
    }
  }

  ::v-deep .el-form--inline .el-form-item__content {
    min-width: 200px;
  }

  ::v-deep .el-select {
    width: 100%;
  }

  ::v-deep .el-date-editor--daterange.el-input__inner,
  ::v-deep .el-date-editor--datetimerange.el-input__inner,
  ::v-deep .el-date-editor--timerange.el-input__inner {
    width: 350px;
  }

  ::v-deep .el-date-editor--date,
  ::v-deep .el-date-editor--datetime {
    width: 100%;
  }

  /* 修复按钮loading状态时的样式问题 */
  ::v-deep .el-button.is-loading {
    padding-left: 20px;
    padding-right: 20px;

    .el-icon-loading {
      font-size: 14px;
    }
  }

  /* 平滑过渡 */
  ::v-deep .el-button {
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
}
</style>
