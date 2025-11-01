<!--
 * 文件名称：TransactionSearch.vue
 * 文件描述：出入库记录搜索表单组件
 * 创建日期：2025-10-25
 * 修改记录：
 *   - 2025-10-25: 初始创建
-->

<template>
  <el-card shadow="never" class="search-card">
    <el-form
      ref="searchForm"
      :model="searchForm"
      inline
      label-width="100px"
      @submit.native.prevent
    >
      <el-row :gutter="16">
        <!-- 备件选择 -->
        <el-col :span="8">
          <el-form-item label="备件">
            <el-select
              v-model="searchForm.sparePartId"
              clearable
              filterable
              remote
              placeholder="请选择备件"
              :remote-method="handleSparePartSearch"
              :loading="sparePartLoading"
              style="width: 100%"
              @change="handleSearch"
            >
              <el-option
                v-for="item in sparePartOptions"
                :key="item.id"
                :label="`${item.sparePartCode} - ${item.sparePartName}`"
                :value="item.id"
              >
                <span style="float: left">{{ item.sparePartCode }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.sparePartName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 出入库类型 -->
        <el-col :span="8">
          <el-form-item label="出入库类型">
            <el-select
              v-model="searchForm.transactionType"
              clearable
              placeholder="请选择类型"
              style="width: 100%"
              @change="handleSearch"
            >
              <el-option
                v-for="item in transactionTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 出入库单号 -->
        <el-col :span="8">
          <el-form-item label="出入库单号">
            <el-input
              v-model="searchForm.transactionCode"
              clearable
              placeholder="请输入单号"
              @keyup.enter.native="handleSearch"
              @clear="handleSearch"
            />
          </el-form-item>
        </el-col>

        <!-- 时间范围 -->
        <el-col :span="16">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd"
              :picker-options="pickerOptions"
              style="width: 100%"
              @change="handleDateRangeChange"
            />
          </el-form-item>
        </el-col>

        <!-- 操作按钮 -->
        <el-col :span="8" style="text-align: right">
          <el-form-item label-width="0">
            <el-button type="primary" icon="el-icon-search" @click="handleSearch">
              查询
            </el-button>
            <el-button icon="el-icon-refresh-left" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-card>
</template>

<script>
import { getSpareParts } from '../../api/sparePart'
import { TRANSACTION_TYPES, TIME_SHORTCUTS } from '../constants'
import { debounce } from '@/utils'

export default {
  name: 'TransactionSearch',

  data() {
    return {
      searchForm: {
        sparePartId: '',
        transactionType: '',
        transactionCode: '',
        startDate: '',
        endDate: ''
      },
      dateRange: [],
      transactionTypes: TRANSACTION_TYPES,
      sparePartOptions: [],
      sparePartLoading: false,
      pickerOptions: {
        shortcuts: TIME_SHORTCUTS
      }
    }
  },

  created() {
    // 初始加载备件列表
    this.loadSpareParts()
  },

  methods: {
    /**
     * 搜索备件
     */
    handleSparePartSearch: debounce(function(query) {
      if (query) {
        this.loadSpareParts(query)
      } else {
        this.sparePartOptions = []
      }
    }, 300),

    /**
     * 加载备件列表
     */
    async loadSpareParts(keyword = '') {
      try {
        this.sparePartLoading = true
        const params = {
          page: 1,
          limit: 20
        }

        if (keyword) {
          params.sparePartCode = keyword
          params.sparePartName = keyword
        }

        const response = await getSpareParts(params)
        this.sparePartOptions = response.data.results || []
      } catch (error) {
        console.error('加载备件列表失败:', error)
      } finally {
        this.sparePartLoading = false
      }
    },

    /**
     * 处理时间范围变化
     */
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        this.searchForm.startDate = value[0]
        this.searchForm.endDate = value[1]
      } else {
        this.searchForm.startDate = ''
        this.searchForm.endDate = ''
      }
      this.handleSearch()
    },

    /**
     * 执行搜索
     */
    handleSearch() {
      this.$emit('search', { ...this.searchForm })
    },

    /**
     * 重置搜索条件
     */
    handleReset() {
      this.searchForm = {
        sparePartId: '',
        transactionType: '',
        transactionCode: '',
        startDate: '',
        endDate: ''
      }
      this.dateRange = []
      this.sparePartOptions = []
      this.handleSearch()
    }
  }
}
</script>

<style lang="scss" scoped>
.search-card {
  margin-bottom: 16px;

  ::v-deep .el-card__body {
    padding: 16px;
  }

  .el-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>

