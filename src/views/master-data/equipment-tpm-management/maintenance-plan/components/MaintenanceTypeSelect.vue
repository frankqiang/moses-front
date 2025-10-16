/**
 * 文件名称：MaintenanceTypeSelect.vue
 * 文件描述：维护类型选择器组件，包含所有维护类型枚举值
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 */
<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :size="size"
    style="width: 100%"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in maintenanceTypeOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
      <div class="maintenance-type-option">
        <i :class="item.icon" :style="{ color: item.color }" />
        <span class="type-label">{{ item.label }}</span>
        <span v-if="item.description" class="type-description">{{ item.description }}</span>
      </div>
    </el-option>
  </el-select>
</template>

<script>
export default {
  name: 'MaintenanceTypeSelect',

  props: {
    // v-model 绑定值
    value: {
      type: String,
      default: ''
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择维护类型'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: true
    },
    // 组件大小
    size: {
      type: String,
      default: 'small',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    }
  },

  data() {
    return {
      selectedValue: this.value,
      // 维护类型选项
      maintenanceTypeOptions: [
        {
          label: '日常保养',
          value: '日常保养',
          icon: 'el-icon-refresh',
          color: '#67C23A',
          description: '日常性的设备保养工作'
        },
        {
          label: '定期检查',
          value: '定期检查',
          icon: 'el-icon-view',
          color: '#409EFF',
          description: '定期进行的设备检查工作'
        },
        {
          label: '大修',
          value: '大修',
          icon: 'el-icon-setting',
          color: '#E6A23C',
          description: '大规模的设备维修工作'
        },
        {
          label: '专项维护',
          value: '专项维护',
          icon: 'el-icon-cpu',
          color: '#909399',
          description: '针对特定问题的专项维护工作'
        }
      ]
    }
  },

  watch: {
    value(newVal) {
      this.selectedValue = newVal
    }
  },

  methods: {
    /**
     * 选择变更处理
     * @param {string} value - 选中的维护类型
     */
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)

      // 发送完整的类型信息
      const selectedType = this.maintenanceTypeOptions.find(item => item.value === value)
      if (selectedType) {
        this.$emit('select', selectedType)
      }
    },

    /**
     * 清空处理
     */
    handleClear() {
      this.$emit('input', '')
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>
.maintenance-type-option {
  display: flex;
  align-items: center;
}

.maintenance-type-option i {
  margin-right: 8px;
  font-size: 16px;
}

.type-label {
  font-weight: 500;
  color: #303133;
  margin-right: 8px;
}

.type-description {
  color: #909399;
  font-size: 12px;
}
</style>

