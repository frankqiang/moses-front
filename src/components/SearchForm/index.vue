/**
 * 高级搜索表单组件
 * 功能描述：提供统一的搜索表单布局和功能，支持表单项配置、折叠展开、重置等功能
 * 创建日期：2023-11-20
 */
<template>
  <div class="search-form-container">
    <el-form
      :model="formModel"
      ref="form"
      :inline="inline"
      size="small"
      :label-width="labelWidth"
      @keyup.enter.native="handleSubmit"
    >
      <!-- 始终可见的表单项 -->
      <template v-for="item in visibleItems">
        <el-form-item
          :key="item.prop"
          :label="item.label"
          :prop="item.prop"
          :class="item.class"
        >
          <!-- 输入框 -->
          <el-input
            v-if="item.type === 'input'"
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            :maxlength="item.maxlength"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            @change="item.onChange && item.onChange(formModel[item.prop])"
          />
          
          <!-- 选择器 -->
          <el-select
            v-else-if="item.type === 'select'"
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            :multiple="item.multiple"
            :collapse-tags="item.collapseTags"
            @change="item.onChange && item.onChange(formModel[item.prop])"
          >
            <el-option
              v-for="opt in item.options"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
              :disabled="opt.disabled"
            />
          </el-select>
          
          <!-- 日期选择器 -->
          <el-date-picker
            v-else-if="item.type === 'date'"
            v-model="formModel[item.prop]"
            :type="item.dateType || 'date'"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            :format="item.format"
            :value-format="item.valueFormat"
            :start-placeholder="item.startPlaceholder"
            :end-placeholder="item.endPlaceholder"
            @change="item.onChange && item.onChange(formModel[item.prop])"
          />
          
          <!-- 时间选择器 -->
          <el-time-picker
            v-else-if="item.type === 'time'"
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            :format="item.format"
            :value-format="item.valueFormat"
            @change="item.onChange && item.onChange(formModel[item.prop])"
          />
          
          <!-- 单选框组 -->
          <el-radio-group
            v-else-if="item.type === 'radio'"
            v-model="formModel[item.prop]"
            :disabled="item.disabled"
            @change="item.onChange && item.onChange(formModel[item.prop])"
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
            v-model="formModel[item.prop]"
            :disabled="item.disabled"
            @change="item.onChange && item.onChange(formModel[item.prop])"
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
          
          <!-- 数字输入框 -->
          <el-input-number
            v-else-if="item.type === 'number'"
            v-model="formModel[item.prop]"
            :min="item.min"
            :max="item.max"
            :step="item.step"
            :precision="item.precision"
            :disabled="item.disabled"
            :controls="item.controls !== false"
            :placeholder="item.placeholder"
            @change="item.onChange && item.onChange(formModel[item.prop])"
          />
          
          <!-- 评分 -->
          <el-rate
            v-else-if="item.type === 'rate'"
            v-model="formModel[item.prop]"
            :max="item.max"
            :disabled="item.disabled"
            :allow-half="item.allowHalf"
            @change="item.onChange && item.onChange(formModel[item.prop])"
          />
          
          <!-- 自定义插槽 -->
          <slot
            v-else-if="item.type === 'slot'"
            :name="item.slotName || item.prop"
            :model="formModel"
          />
          
          <!-- 默认为输入框 -->
          <el-input
            v-else
            v-model="formModel[item.prop]"
            :placeholder="item.placeholder"
            :maxlength="item.maxlength"
            :disabled="item.disabled"
            :clearable="item.clearable !== false"
            @change="item.onChange && item.onChange(formModel[item.prop])"
          />
        </el-form-item>
      </template>
      
      <!-- 折叠的表单项 -->
      <template v-if="showMore && expandedItems.length > 0">
        <template v-for="item in expandedItems">
          <el-form-item
            :key="item.prop"
            :label="item.label"
            :prop="item.prop"
            :class="item.class"
          >
            <!-- 与上面相同的表单项逻辑，但是为了更好的性能，只有在展开时才渲染 -->
            <el-input
              v-if="item.type === 'input'"
              v-model="formModel[item.prop]"
              :placeholder="item.placeholder"
              :maxlength="item.maxlength"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              @change="item.onChange && item.onChange(formModel[item.prop])"
            />
            
            <el-select
              v-else-if="item.type === 'select'"
              v-model="formModel[item.prop]"
              :placeholder="item.placeholder"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              :multiple="item.multiple"
              :collapse-tags="item.collapseTags"
              @change="item.onChange && item.onChange(formModel[item.prop])"
            >
              <el-option
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
                :disabled="opt.disabled"
              />
            </el-select>
            
            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="formModel[item.prop]"
              :type="item.dateType || 'date'"
              :placeholder="item.placeholder"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              :format="item.format"
              :value-format="item.valueFormat"
              :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder"
              @change="item.onChange && item.onChange(formModel[item.prop])"
            />
            
            <slot
              v-else-if="item.type === 'slot'"
              :name="item.slotName || item.prop"
              :model="formModel"
            />
            
            <el-input
              v-else
              v-model="formModel[item.prop]"
              :placeholder="item.placeholder"
              :maxlength="item.maxlength"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              @change="item.onChange && item.onChange(formModel[item.prop])"
            />
          </el-form-item>
        </template>
      </template>
      
      <!-- 表单操作按钮 -->
      <el-form-item class="search-buttons">
        <el-button type="primary" @click="handleSubmit" :loading="loading">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        
        <!-- 展开/收起按钮 -->
        <el-button
          v-if="expandable && expandedItems.length > 0"
          type="text"
          class="expand-button"
          @click="showMore = !showMore"
        >
          {{ showMore ? '收起' : '展开' }}
          <i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
        </el-button>
        
        <!-- 更多按钮插槽 -->
        <slot name="buttons"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SearchForm',
  props: {
    // 表单项配置数组
    items: {
      type: Array,
      required: true
    },
    // 表单数据对象
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
      default: '100px'
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
    }
  },
  data() {
    return {
      // 表单数据模型（内部使用）
      formModel: {},
      // 是否显示更多表单项
      showMore: false
    }
  },
  computed: {
    // 始终可见的表单项
    visibleItems() {
      return this.items.slice(0, this.visibleItemCount)
    },
    // 折叠的表单项
    expandedItems() {
      return this.items.slice(this.visibleItemCount)
    }
  },
  watch: {
    // 监听外部传入的value变化
    value: {
      handler(val) {
        this.formModel = { ...val }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$emit('search', this.formModel)
        }
      })
    },
    
    // 重置表单
    handleReset() {
      this.$refs.form.resetFields()
      
      // 清空不在表单验证规则中的字段
      const emptyModel = {}
      this.items.forEach(item => {
        if (item.prop) {
          emptyModel[item.prop] = undefined
        }
      })
      this.formModel = { ...emptyModel }
      
      // 触发更新事件
      this.$emit('reset')
      this.$emit('input', this.formModel)
      
      // 如果需要重置后自动查询，则触发查询事件
      if (this.searchAfterReset) {
        this.$emit('search', this.formModel)
      }
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
  
  .el-form {
    display: flex;
    flex-wrap: wrap;
    
    .el-form-item {
      margin-right: 18px;
      margin-bottom: 18px;
      
      &.full-width {
        width: 100%;
      }
      
      &.double-width {
        width: calc(50% - 18px);
      }
    }
    
    .search-buttons {
      margin-right: 0;
      
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
}
</style> 