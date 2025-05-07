<template>
  <div class="search-container">
    <el-form :model="formData" :inline="true" class="search-form">
      <el-form-item label="规则名称">
        <el-input
          v-model="formData.ruleName"
          placeholder="请输入规则名称"
          clearable
          size="small"
          @keyup.enter.native="search"
        />
      </el-form-item>

      <el-form-item label="规则类型">
        <el-select
          v-model="formData.ruleType"
          placeholder="请选择规则类型"
          clearable
          size="small"
        >
          <el-option
            v-for="item in ruleTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="small"
          @click="search"
        >
          搜索
        </el-button>
        <el-button
          icon="el-icon-refresh"
          size="small"
          @click="reset"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SearchForm',
  props: {
    initQuery: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formData: {
        ruleName: undefined,
        ruleType: undefined
      },
      ruleTypeOptions: [
        { value: 'pure_numeric', label: '纯数字流水号' },
        { value: 'prefix_numeric', label: '前缀+流水号' },
        { value: 'custom', label: '自定义规则' }
      ]
    }
  },
  watch: {
    initQuery: {
      handler(val) {
        if (val) {
          this.formData = { ...val }
        }
      },
      immediate: true
    }
  },
  methods: {
    search() {
      this.$emit('search', { ...this.formData })
    },
    reset() {
      this.formData = {
        ruleName: undefined,
        ruleType: undefined
      }
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .search-form {
    .el-form-item {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }
}
</style> 