/**
 * 设备搜索表单组件
 * 功能描述：提供设备列表的搜索条件输入和搜索、重置功能
 * 创建日期：2023-11-05
 */
<template>
  <div class="filter-container">
    <div class="filter-row">
      <el-input
        v-model="queryParams.keyword"
        placeholder="搜索设备ID、名称或型号..."
        clearable
        class="filter-item search-input"
        prefix-icon="el-icon-search"
        @keyup.enter.native="handleSearch"
      />
      
      <el-select
        v-model="queryParams.status"
        placeholder="状态筛选"
        clearable
        class="filter-item"
      >
        <el-option label="全部" value="" />
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      
      <div class="filter-item right">
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EquipmentSearchForm',
  props: {
    // 初始查询条件
    initQuery: {
      type: Object,
      default: () => ({})
    },
    // 设备类型
    equipmentType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // 查询参数
      queryParams: {
        keyword: '',
        status: ''
      }
    }
  },
  watch: {
    // 监听初始查询条件变化
    initQuery: {
      handler(val) {
        this.queryParams = {
          keyword: val.keyword || '',
          status: val.status === undefined ? '' : val.status
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
      this.queryParams = {
        keyword: '',
        status: ''
      }
      this.$emit('reset', this.queryParams)
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding: 15px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  margin-right: 10px;
  margin-bottom: 10px;
  
  &.right {
    margin-left: auto;
  }
  
  &.search-input {
    width: 300px;
  }
}
</style> 