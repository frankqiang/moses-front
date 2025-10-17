<!--
  文件名称：TaskTypeSelector.vue
  文件描述：任务类型选择器组件 - 枚举值选择
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->
<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    @input="handleInput"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in taskTypeOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script>
import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'

export default {
  name: 'TaskTypeSelector',

  mixins: [tpmDictionaryMixin],

  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择任务类型'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },

  async created() {
    // 加载TPM字典
    await this.loadTPMDictionary()
  },

  methods: {
    /**
     * 输入处理
     */
    handleInput(val) {
      this.$emit('input', val)
    },

    /**
     * 值变化处理
     */
    handleChange(val) {
      const selectedType = this.taskTypeOptions.find(item => item.value === val)
      this.$emit('change', val, selectedType)
    },

    /**
     * 清除处理
     */
    handleClear() {
      this.$emit('clear')
      this.$emit('change', '', null)
    }
  }
}
</script>

