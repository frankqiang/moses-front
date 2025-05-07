<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form 
      :init-query="listQuery" 
      @search="handleSearch" 
      @reset="handleReset"
    />

    <!-- 操作按钮 -->
    <action-bar 
      @create="handleCreate" 
    />

    <!-- 表格数据 -->
    <code-rule-table 
      :data="list" 
      :loading="listLoading"
      @update="handleUpdate" 
    />

    <!-- 编辑/新增对话框 -->
    <code-rule-form 
      :type="dialogType" 
      :visible.sync="dialogVisible" 
      :edit-data="currentRowData" 
      @submit="submitForm"
    />
  </div>
</template>

<script>
import {
  getMaterialCodeRules,
  createMaterialCodeRule,
  updateMaterialCodeRule
} from '@/api/master-data/material-code'

// 引入子组件
import SearchForm from './components/SearchForm'
import ActionBar from './components/ActionBar'
import CodeRuleTable from './components/CodeRuleTable'
import CodeRuleForm from './components/CodeRuleForm'

export default {
  name: 'MaterialCode',
  components: {
    SearchForm,
    ActionBar,
    CodeRuleTable,
    CodeRuleForm
  },
  data() {
    return {
      list: [], // 列表数据
      listLoading: false, // 列表加载状态
      listQuery: { // 列表查询参数
        ruleName: undefined,
        ruleType: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑
      currentRowData: null // 当前编辑的行数据
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      getMaterialCodeRules(this.listQuery).then(response => {
        this.list = response.data.items
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 搜索
    handleSearch(params) {
      this.listQuery = {
        ...this.listQuery,
        ...params
      }
      this.getList()
    },

    // 重置搜索
    handleReset() {
      this.listQuery = {
        ruleName: undefined,
        ruleType: undefined
      }
      this.getList()
    },

    // 新增
    handleCreate() {
      this.dialogType = 'create'
      this.currentRowData = null
      this.dialogVisible = true
    },

    // 编辑
    handleUpdate(row) {
      this.dialogType = 'update'
      this.currentRowData = row
      this.dialogVisible = true
    },

    // 提交表单
    submitForm(formData) {
      if (this.dialogType === 'create') {
        // 新增
        createMaterialCodeRule(formData).then(() => {
          this.$message.success('新增成功')
          this.dialogVisible = false
          this.getList()
        })
      } else {
        // 更新
        updateMaterialCodeRule(formData).then(() => {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.getList()
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
}
</style> 