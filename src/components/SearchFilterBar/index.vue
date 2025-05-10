/**
 * 通用搜索筛选栏组件
 * 功能描述：提供统一的搜索和筛选界面，支持各种类型的筛选字段
 * 创建日期：2023-12-10
 */
<template>
  <div :class="['search-filter-bar', containerClass]">
    <el-form
      ref="form"
      :model="formData"
      :inline="true"
      :size="size"
      :label-width="labelWidth"
    >
      <!-- 常规筛选字段 -->
      <el-form-item
        v-for="(field, index) in visibleFields"
        :key="index"
        :label="field.label"
        :prop="field.prop"
      >
        <!-- 文本输入框 -->
        <el-input
          v-if="field.type === 'input' || !field.type"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :clearable="field.clearable !== false"
          :style="getFieldStyle(field)"
          @keyup.enter.native="handleSearch"
        />
        
        <!-- 数字输入框 -->
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :min="field.min"
          :max="field.max"
          :step="field.step || 1"
          :precision="field.precision"
          :controls="field.controls !== false"
          :style="getFieldStyle(field)"
        />
        
        <!-- 下拉选择框 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :multiple="field.multiple"
          :collapse-tags="field.collapseTags"
          :style="getFieldStyle(field)"
        >
          <el-option
            v-for="option in field.options"
            :key="typeof option === 'object' ? option[field.valueKey || 'value'] : option"
            :label="typeof option === 'object' ? option[field.labelKey || 'label'] : option"
            :value="typeof option === 'object' ? option[field.valueKey || 'value'] : option"
            :disabled="option.disabled"
          />
        </el-select>
        
        <!-- 日期选择器 -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.prop]"
          :type="field.dateType || 'date'"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :format="field.format"
          :value-format="field.valueFormat || 'yyyy-MM-dd'"
          :style="getFieldStyle(field)"
        />
        
        <!-- 日期范围选择器 -->
        <el-date-picker
          v-else-if="field.type === 'daterange'"
          v-model="formData[field.prop]"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="field.clearable !== false"
          :format="field.format"
          :value-format="field.valueFormat || 'yyyy-MM-dd'"
          :style="getFieldStyle(field)"
        />
        
        <!-- 时间选择器 -->
        <el-time-picker
          v-else-if="field.type === 'time'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :format="field.format || 'HH:mm:ss'"
          :value-format="field.valueFormat"
          :style="getFieldStyle(field)"
        />
        
        <!-- 时间范围选择器 -->
        <el-time-picker
          v-else-if="field.type === 'timerange'"
          v-model="formData[field.prop]"
          is-range
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :clearable="field.clearable !== false"
          :format="field.format || 'HH:mm:ss'"
          :value-format="field.valueFormat"
          :style="getFieldStyle(field)"
        />
        
        <!-- 开关 -->
        <el-switch
          v-else-if="field.type === 'switch'"
          v-model="formData[field.prop]"
          :active-text="field.activeText"
          :inactive-text="field.inactiveText"
          :active-value="field.activeValue"
          :inactive-value="field.inactiveValue"
        />
        
        <!-- 单选框组 -->
        <el-radio-group
          v-else-if="field.type === 'radio'"
          v-model="formData[field.prop]"
          :style="getFieldStyle(field)"
        >
          <el-radio
            v-for="option in field.options"
            :key="typeof option === 'object' ? option[field.valueKey || 'value'] : option"
            :label="typeof option === 'object' ? option[field.valueKey || 'value'] : option"
            :disabled="option.disabled"
          >
            {{ typeof option === 'object' ? option[field.labelKey || 'label'] : option }}
          </el-radio>
        </el-radio-group>
        
        <!-- 复选框组 -->
        <el-checkbox-group
          v-else-if="field.type === 'checkbox'"
          v-model="formData[field.prop]"
          :style="getFieldStyle(field)"
        >
          <el-checkbox
            v-for="option in field.options"
            :key="typeof option === 'object' ? option[field.valueKey || 'value'] : option"
            :label="typeof option === 'object' ? option[field.valueKey || 'value'] : option"
            :disabled="option.disabled"
          >
            {{ typeof option === 'object' ? option[field.labelKey || 'label'] : option }}
          </el-checkbox>
        </el-checkbox-group>
        
        <!-- 级联选择器 -->
        <el-cascader
          v-else-if="field.type === 'cascader'"
          v-model="formData[field.prop]"
          :options="field.options"
          :props="field.props"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :style="getFieldStyle(field)"
        />
        
        <!-- 自定义插槽 -->
        <slot
          v-else-if="field.type === 'custom'"
          :name="field.slotName || field.prop"
          :field="field"
          :form-data="formData"
        ></slot>
      </el-form-item>
      
      <!-- 更多条件切换 -->
      <div v-if="showToggle" class="more-toggle" @click="toggleMoreFields">
        <span>{{ expandAll ? '收起' : '更多' }}</span>
        <i :class="expandAll ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
      </div>
      
      <!-- 操作按钮 -->
      <el-form-item class="action-buttons">
        <el-button
          type="primary"
          :icon="searchIcon"
          :size="size"
          @click="handleSearch"
        >
          {{ searchText }}
        </el-button>
        <el-button
          :icon="resetIcon"
          :size="size"
          @click="handleReset"
        >
          {{ resetText }}
        </el-button>
        <slot name="actions"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SearchFilterBar',
  props: {
    // 筛选字段配置
    filterFields: {
      type: Array,
      required: true
    },
    // 初始值
    initialValues: {
      type: Object,
      default: () => ({})
    },
    // 表单尺寸
    size: {
      type: String,
      default: 'small'
    },
    // 标签宽度
    labelWidth: {
      type: String,
      default: '100px'
    },
    // 搜索按钮文本
    searchText: {
      type: String,
      default: '搜索'
    },
    // 搜索按钮图标
    searchIcon: {
      type: String,
      default: 'el-icon-search'
    },
    // 重置按钮文本
    resetText: {
      type: String,
      default: '重置'
    },
    // 重置按钮图标
    resetIcon: {
      type: String,
      default: 'el-icon-refresh'
    },
    // 容器自定义class
    containerClass: {
      type: String,
      default: ''
    },
    // 每行显示的默认字段数（超出显示更多按钮）
    defaultFieldsPerRow: {
      type: Number,
      default: 0 // 0表示不启用展开/收起功能
    },
    // 默认输入框宽度
    defaultWidth: {
      type: String,
      default: '200px'
    },
    // 是否自动搜索（值变化时）
    autoSearch: {
      type: Boolean,
      default: false
    },
    // 自动搜索的防抖延迟（毫秒）
    autoSearchDelay: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      // 表单数据
      formData: {},
      // 是否展开所有字段
      expandAll: false,
      // 自动搜索定时器ID
      autoSearchTimer: null
    }
  },
  computed: {
    // 可见字段列表
    visibleFields() {
      if (this.defaultFieldsPerRow <= 0 || this.expandAll) {
        return this.filterFields
      }
      return this.filterFields.slice(0, this.defaultFieldsPerRow)
    },
    // 是否显示展开/收起切换按钮
    showToggle() {
      return this.defaultFieldsPerRow > 0 && this.filterFields.length > this.defaultFieldsPerRow
    }
  },
  watch: {
    // 监听初始值变化
    initialValues: {
      handler(newVal) {
        this.initFormData()
      },
      deep: true,
      immediate: true
    },
    // 监听表单数据变化（用于自动搜索）
    formData: {
      handler(newVal, oldVal) {
        if (this.autoSearch && oldVal && Object.keys(oldVal).length > 0) {
          this.debounceSearch()
        }
      },
      deep: true
    }
  },
  created() {
    this.initFormData()
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      const formData = {}
      
      // 从字段配置中提取属性名称和默认值
      this.filterFields.forEach(field => {
        let initialValue = this.initialValues[field.prop]
        
        // 如果初始值未提供，则使用字段配置的默认值
        if (initialValue === undefined && field.defaultValue !== undefined) {
          initialValue = field.defaultValue
        }
        
        // 特殊处理多选字段类型
        if ((field.type === 'checkbox' || (field.type === 'select' && field.multiple)) && 
            initialValue === undefined) {
          initialValue = []
        }
        
        formData[field.prop] = initialValue
      })
      
      this.formData = formData
    },
    
    // 处理搜索
    handleSearch() {
      if (this.autoSearchTimer) {
        clearTimeout(this.autoSearchTimer)
        this.autoSearchTimer = null
      }
      
      // 构建搜索参数（只包含有值的字段）
      const searchParams = {}
      Object.keys(this.formData).forEach(key => {
        const value = this.formData[key]
        if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value
        }
      })
      
      this.$emit('search', searchParams)
    },
    
    // 防抖自动搜索
    debounceSearch() {
      if (this.autoSearchTimer) {
        clearTimeout(this.autoSearchTimer)
      }
      
      this.autoSearchTimer = setTimeout(() => {
        this.handleSearch()
      }, this.autoSearchDelay)
    },
    
    // 处理重置
    handleReset() {
      if (this.autoSearchTimer) {
        clearTimeout(this.autoSearchTimer)
        this.autoSearchTimer = null
      }
      
      // 重置表单
      this.$refs.form.resetFields()
      
      // 初始化表单数据
      this.initFormData()
      
      this.$emit('reset', { ...this.formData })
    },
    
    // 切换展开/收起
    toggleMoreFields() {
      this.expandAll = !this.expandAll
      this.$emit('toggle', this.expandAll)
    },
    
    // 获取字段样式
    getFieldStyle(field) {
      const width = field.width || this.defaultWidth
      return { width }
    }
  }
}
</script>

<style lang="scss" scoped>
.search-filter-bar {
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  
  .el-form-item {
    margin-bottom: 10px;
    margin-right: 16px;
  }
  
  .more-toggle {
    color: #409EFF;
    cursor: pointer;
    font-size: 13px;
    margin: 0 16px 10px 0;
    display: inline-block;
    
    i {
      margin-left: 3px;
    }
  }
  
  .action-buttons {
    margin-bottom: 10px;
  }
}
</style> 