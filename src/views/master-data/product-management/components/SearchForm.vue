<template>
  <div class="search-form-container">
    <el-form :model="form" :inline="true" size="small">
      <el-form-item label="产品编码">
        <el-input v-model="form.code" placeholder="请输入产品编码" clearable />
      </el-form-item>
      <el-form-item label="产品名称">
        <el-input v-model="form.name" placeholder="请输入产品名称" clearable />
      </el-form-item>
      <el-form-item label="合金牌号">
        <el-select v-model="form.alloy" placeholder="请选择合金牌号" clearable style="width: 200px">
          <el-option label="1100" value="1100" />
          <el-option label="8011" value="8011" />
          <el-option label="3003" value="3003" />
          <el-option label="8021" value="8021" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品状态">
        <el-select v-model="form.lifecycleStatus" placeholder="请选择产品状态" clearable style="width: 200px">
          <el-option label="试产" value="trial" />
          <el-option label="量产" value="production" />
          <el-option label="停产" value="discontinued" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
/**
 * 搜索表单组件
 * 功能描述：提供铝箔产品查询条件输入和搜索/重置功能
 */
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
      form: {
        code: '',
        name: '',
        alloy: '',
        lifecycleStatus: ''
      }
    }
  },
  created() {
    // 初始化表单值
    this.initFormValues()
  },
  methods: {
    // 初始化表单值
    initFormValues() {
      this.form = {
        code: this.initQuery.code || '',
        name: this.initQuery.name || '',
        alloy: this.initQuery.alloy || '',
        lifecycleStatus: this.initQuery.lifecycleStatus || ''
      }
    },
    // 搜索
    handleSearch() {
      const params = {}
      // 只添加非空值到搜索参数中
      Object.keys(this.form).forEach(key => {
        if (this.form[key] !== '' && this.form[key] !== null && this.form[key] !== undefined) {
          params[key] = this.form[key]
        }
      })
      this.$emit('search', params)
    },
    // 重置
    handleReset() {
      this.form = {
        code: '',
        name: '',
        alloy: '',
        lifecycleStatus: ''
      }
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form-container {
  background-color: #fff;
  padding: 16px 16px 0;
  margin-bottom: 16px;
}
</style> 