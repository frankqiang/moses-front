/**
 * 物料编码规则管理
 * 功能描述：管理物料编码规则配置，支持添加、编辑、设置默认规则等功能
 * 创建日期：2023-10-01
 * 更新日期：2024-10-28
 */
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <search-form 
      :init-query="listQuery"
      :loading="listLoading"
      @search="handleSearch" 
      @reset="handleReset"
    />

    <!-- 表格数据 -->
    <code-rule-table 
      :data="list" 
      :loading="listLoading"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      :import-api="'/mes/master-data/material-code/import'"
      :template-api="'/mes/master-data/material-code/template'"
      :export-api="'/mes/master-data/material-code/export'"
      @update="handleUpdate" 
      @create="handleCreate"
      @refresh="getList"
      @pagination="handlePagination"
      @batch-delete="handleBatchDelete"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    />

    <!-- 编辑/新增对话框 -->
    <code-rule-form 
      ref="codeRuleForm"
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
  updateMaterialCodeRule,
  batchDeleteRules
} from '@/api/master-data/material-code'
import { scrollTo } from '@/utils/scroll-to'

// 引入子组件
import SearchForm from './components/SearchForm'
import CodeRuleTable from './components/CodeRuleTable'
import CodeRuleForm from './components/CodeRuleForm'

export default {
  name: 'MaterialCode',
  components: {
    SearchForm,
    CodeRuleTable,
    CodeRuleForm
  },
  data() {
    return {
      list: [], // 列表数据
      total: 0, // 总记录数
      listLoading: false, // 列表加载状态
      listQuery: { // 列表查询参数
        page: 1,
        limit: 10,
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
        this.total = response.data.total || this.list.length
        this.listLoading = false
        
        // 列表加载完成后滚动到顶部
        scrollTo(0, 500)
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 搜索
    handleSearch(params) {
      this.listQuery = {
        ...this.listQuery,
        page: 1, // 重置到第一页
        ...params
      }
      this.getList()
    },

    // 重置搜索
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 10,
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
      this.currentRowData = Object.assign({}, row)
      this.dialogVisible = true
    },

    // 提交表单
    submitForm(formData, continueAdd) {
      if (this.dialogType === 'create') {
        // 新增
        createMaterialCodeRule(formData).then(() => {
          this.$message.success('新增成功')
          if (!continueAdd) {
            this.dialogVisible = false
          } else {
            // 如果是保存并继续，重置表单但不关闭抽屉
            this.$refs.codeRuleForm && this.$refs.codeRuleForm.resetForm()
          }
          this.getList()
        }).catch(error => {
          console.error('新增失败:', error)
          this.$message.error('新增失败，请重试')
        })
      } else {
        // 更新
        updateMaterialCodeRule(formData).then(() => {
          this.$message.success('更新成功')
          this.dialogVisible = false
          this.getList()
        }).catch(error => {
          console.error('更新失败:', error)
          this.$message.error('更新失败，请重试')
        })
      }
    },

    // 分页变化处理
    handlePagination({ page, limit }) {
      this.listQuery.page = page
      this.listQuery.limit = limit
      this.getList()
    },

    // 批量删除
    handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请选择要删除的记录')
        return
      }

      this.$confirm(`确认删除选中的 ${rows.length} 条记录?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用批量删除API
        const ids = rows.map(item => item.id)
        batchDeleteRules(ids).then(response => {
          this.$message.success(`成功删除 ${response.data.count || rows.length} 条记录`)
          this.getList()
        }).catch(error => {
          // 特殊处理：默认规则无法删除的情况
          if (error.response && error.response.data && error.response.data.code === 50403) {
            this.$message.error('不能删除默认规则，请先设置其他规则为默认')
          } else {
            this.$message.error('删除失败，请重试')
          }
        })
      }).catch(() => {
        // 用户取消，不做处理
      })
    },

    // 导入成功
    handleImportSuccess(result) {
      this.$message.success(`成功导入 ${result.successCount || 0} 条记录`)
      this.getList()
    },

    // 导出成功
    handleExportSuccess() {
      this.$message.success('导出成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
}
</style> 