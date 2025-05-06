<template>
  <el-form ref="searchForm" :model="searchData" :inline="true" class="search-form">
    <el-form-item label="规格代码" prop="code">
      <el-input v-model="searchData.code" placeholder="请输入规格代码" clearable @keyup.enter.native="handleSearch" />
    </el-form-item>
    <el-form-item label="规格名称" prop="name">
      <el-input v-model="searchData.name" placeholder="请输入规格名称" clearable @keyup.enter.native="handleSearch" />
    </el-form-item>
    <el-form-item label="状态" prop="status">
      <el-select v-model="searchData.status" placeholder="请选择状态" clearable>
        <el-option label="启用" value="1" />
        <el-option label="禁用" value="0" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
      <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'SearchForm',
  props: {
    // 初始查询参数，由父组件传入
    initQuery: {
      type: Object,
      default: () => ({
        code: undefined,
        name: undefined,
        status: undefined
      })
    }
  },
  data() {
    return {
      searchData: { ...this.initQuery }
    }
  },
  watch: {
    // 监听传入的initQuery变化，更新本地searchData
    initQuery: {
      handler(val) {
        this.searchData = { ...val }
      },
      deep: true
    }
  },
  methods: {
    // 搜索操作
    handleSearch() {
      // 向父组件发送搜索事件
      this.$emit('search', { ...this.searchData })
    },
    
    // 重置搜索
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.searchData = {
        code: undefined,
        name: undefined,
        status: undefined
      }
      this.$emit('reset', { ...this.searchData })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-form {
  margin-bottom: 24px;
  background-color: #f5f7fa;
  padding: 16px 16px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
</style> 