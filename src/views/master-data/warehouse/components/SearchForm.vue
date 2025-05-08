<template>
  <div class="filter-container">
    <el-form :inline="true" :model="queryParams" ref="searchForm" size="small" label-width="100px">
      <el-form-item label="仓库编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入仓库编码"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="仓库名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入仓库名称"
          clearable
          style="width: 200px"
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="仓库类型" prop="warehouseType">
        <el-select
          v-model="queryParams.warehouseType"
          placeholder="请选择仓库类型"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in warehouseTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          style="width: 200px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
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
 * 仓库搜索表单组件
 * 功能描述：提供仓库列表的搜索条件输入和搜索、重置功能
 * 创建日期：2023-11-01
 */
export default {
  name: 'WarehouseSearchForm',
  props: {
    // 初始查询条件
    initQuery: {
      type: Object,
      default: () => ({})
    },
    // 仓库类型选项
    warehouseTypeOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 查询参数
      queryParams: {
        code: undefined,
        name: undefined,
        warehouseType: undefined,
        status: undefined
      }
    }
  },
  watch: {
    // 监听初始查询条件变化
    initQuery: {
      handler(val) {
        this.queryParams = {
          code: val.code,
          name: val.name,
          warehouseType: val.warehouseType,
          status: val.status
        }
      },
      immediate: true
    }
  },
  methods: {
    // 搜索按钮点击事件
    handleSearch() {
      this.$emit('search', this.queryParams)
    },
    // 重置按钮点击事件
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.$emit('reset', this.queryParams)
    }
  }
}
</script>

<style scoped>
.filter-container {
  padding: 10px 0;
  margin-bottom: 10px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-radius: 2px;
}
</style> 