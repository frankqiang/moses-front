<!--
 * 文件名称: HealthSearch.vue
 * 文件描述: 设备健康度评分查询条件组件
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
-->
<template>
  <div class="health-search">
    <el-form :model="searchForm" :inline="true" size="small">
      <el-form-item label="设备类型">
        <el-select
          v-model="searchForm.equipmentType"
          placeholder="请选择设备类型"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="item in equipmentTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="返回数量">
        <el-input-number
          v-model="searchForm.limit"
          :min="1"
          :max="100"
          :step="10"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="排序字段">
        <el-select
          v-model="searchForm.sortBy"
          placeholder="请选择排序字段"
          style="width: 150px"
        >
          <el-option
            v-for="item in sortByOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="排序方式">
        <el-select
          v-model="searchForm.sortOrder"
          placeholder="请选择排序方式"
          style="width: 120px"
        >
          <el-option
            v-for="item in sortOrderOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {
  EQUIPMENT_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
  SORT_ORDER_OPTIONS
} from '../constants'

export default {
  name: 'HealthSearch',
  props: {
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      searchForm: {
        equipmentType: '',
        limit: 20,
        sortBy: 'healthScore',
        sortOrder: 'asc'
      },
      equipmentTypeOptions: EQUIPMENT_TYPE_OPTIONS,
      sortByOptions: SORT_BY_OPTIONS,
      sortOrderOptions: SORT_ORDER_OPTIONS
    }
  },
  watch: {
    value: {
      handler(val) {
        if (val) {
          this.searchForm = { ...this.searchForm, ...val }
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchForm)
    },
    handleReset() {
      this.searchForm = {
        equipmentType: '',
        limit: 20,
        sortBy: 'healthScore',
        sortOrder: 'asc'
      }
      this.$emit('search', this.searchForm)
    }
  }
}
</script>

<style lang="scss" scoped>
.health-search {
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  margin-bottom: 16px;

  ::v-deep .el-form-item {
    margin-bottom: 0;
  }
}
</style>

