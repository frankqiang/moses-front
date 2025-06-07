/**
 * SearchFormV2组件使用示例
 * 功能描述：演示SearchFormV2组件的基本和高级用法
 * 创建日期：2024-12-16
 */
<template>
  <div class="example-container">
    <h2>基本用法</h2>
    <search-form-v2
      ref="basicForm"
      :items="basicFormItems"
      v-model="basicFormModel"
      :loading="loading"
      @search="handleBasicSearch"
      @reset="handleBasicReset"
    />
    
    <div class="result-container" v-if="basicSearchResult">
      <h3>搜索结果：</h3>
      <pre>{{ basicSearchResult }}</pre>
    </div>
    
    <el-divider></el-divider>
    
    <h2>高级用法</h2>
    <search-form-v2
      ref="advancedForm"
      :items="advancedFormItems"
      v-model="advancedFormModel"
      :loading="advancedLoading"
      :visible-item-count="3"
      :debounce-time="500"
      :search-after-reset="true"
      @search="handleAdvancedSearch"
      @reset="handleAdvancedReset"
    >
      <!-- 自定义表单项插槽 -->
      <template #customField="{ model }">
        <div class="custom-field">
          <el-input v-model="model.customValue" placeholder="自定义输入">
            <template slot="append">
              <el-button @click="handleCustomAction">
                操作
              </el-button>
            </template>
          </el-input>
        </div>
      </template>
      
      <!-- 自定义按钮插槽 -->
      <template #buttons>
        <el-button type="success" size="small" @click="handleExport">
          导出
        </el-button>
      </template>
    </search-form-v2>
    
    <div class="result-container" v-if="advancedSearchResult">
      <h3>高级搜索结果：</h3>
      <pre>{{ advancedSearchResult }}</pre>
    </div>
  </div>
</template>

<script>
import SearchFormV2 from '@/components/SearchFormV2'

export default {
  name: 'SearchFormV2Example',
  components: {
    SearchFormV2
  },
  data() {
    return {
      // 基本表单数据
      basicFormModel: {
        name: '',
        status: ''
      },
      // 高级表单数据
      advancedFormModel: {
        keyword: '',
        dateRange: '',
        type: '',
        tags: [],
        priority: null,
        customValue: ''
      },
      // 加载状态
      loading: false,
      advancedLoading: false,
      // 搜索结果
      basicSearchResult: null,
      advancedSearchResult: null
    }
  },
  computed: {
    // 基本表单项配置
    basicFormItems() {
      return [
        {
          prop: 'name',
          label: '名称',
          type: 'input',
          placeholder: '请输入名称',
          clearable: true
        },
        {
          prop: 'status',
          label: '状态',
          type: 'select',
          placeholder: '请选择状态',
          clearable: true,
          options: [
            { label: '启用', value: 'active' },
            { label: '禁用', value: 'inactive' }
          ]
        }
      ]
    },
    
    // 高级表单项配置
    advancedFormItems() {
      return [
        {
          prop: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '请输入关键词',
          clearable: true,
          searchOnChange: true // 值变化时自动搜索
        },
        {
          prop: 'dateRange',
          label: '日期范围',
          type: 'date',
          dateType: 'daterange',
          placeholder: '请选择日期范围',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          valueFormat: 'yyyy-MM-dd',
          clearable: true
        },
        {
          prop: 'type',
          label: '类型',
          type: 'radio',
          options: [
            { label: '类型A', value: 'A' },
            { label: '类型B', value: 'B' },
            { label: '类型C', value: 'C' }
          ]
        },
        {
          prop: 'tags',
          label: '标签',
          type: 'select',
          placeholder: '请选择标签',
          multiple: true,
          collapseTags: true,
          clearable: true,
          options: [
            { label: '标签1', value: 'tag1' },
            { label: '标签2', value: 'tag2' },
            { label: '标签3', value: 'tag3' },
            { label: '标签4', value: 'tag4' }
          ]
        },
        {
          prop: 'priority',
          label: '优先级',
          type: 'number',
          placeholder: '请输入优先级',
          min: 1,
          max: 10,
          step: 1
        },
        {
          prop: 'customValue',
          label: '自定义字段',
          type: 'slot',
          slotName: 'customField'
        }
      ]
    }
  },
  methods: {
    // 处理基本搜索
    handleBasicSearch(params) {
      console.log('基本搜索参数:', params)
      this.loading = true
      
      // 模拟API调用
      setTimeout(() => {
        this.basicSearchResult = JSON.stringify(params, null, 2)
        this.loading = false
      }, 1000)
    },
    
    // 处理基本重置
    handleBasicReset() {
      console.log('基本表单已重置')
      this.basicSearchResult = null
    },
    
    // 处理高级搜索
    handleAdvancedSearch(params) {
      console.log('高级搜索参数:', params)
      this.advancedLoading = true
      
      // 模拟API调用
      setTimeout(() => {
        this.advancedSearchResult = JSON.stringify(params, null, 2)
        this.advancedLoading = false
      }, 1000)
    },
    
    // 处理高级重置
    handleAdvancedReset() {
      console.log('高级表单已重置')
      // 搜索结果会自动刷新，因为设置了 searchAfterReset: true
    },
    
    // 处理自定义操作
    handleCustomAction() {
      this.$message.success('执行自定义操作')
      console.log('自定义值:', this.advancedFormModel.customValue)
    },
    
    // 处理导出
    handleExport() {
      this.$message.success('导出成功')
      console.log('导出数据:', this.advancedFormModel)
    }
  }
}
</script>

<style lang="scss" scoped>
.example-container {
  padding: 20px;
  
  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 18px;
    color: #303133;
  }
  
  .result-container {
    margin-top: 20px;
    padding: 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 10px;
      font-size: 16px;
      color: #303133;
    }
    
    pre {
      margin: 0;
      padding: 10px;
      background-color: #fff;
      border-radius: 4px;
      color: #606266;
      font-family: monospace;
      white-space: pre-wrap;
    }
  }
  
  .el-divider {
    margin: 30px 0;
  }
}
</style> 