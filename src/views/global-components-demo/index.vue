/**
 * 全局组件演示页面
 * 功能描述：展示所有全局组件的用法和示例
 * 创建日期：2023-11-20
 */
<template>
  <div class="app-container">
    <h2>全局组件演示</h2>
    
    <el-divider content-position="left">1. 状态标签 (StatusTag)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <div class="demo-item">
        <StatusTag :status="1" :textMap="{ 0: '禁用', 1: '启用' }" :typeMap="{ 0: 'info', 1: 'success' }" />
        <StatusTag :status="0" :textMap="{ 0: '禁用', 1: '启用' }" :typeMap="{ 0: 'info', 1: 'success' }" />
      </div>
      
      <h3>使用预设配置</h3>
      <div class="demo-item">
        <StatusTag :status="'trial'" :textMap="productLifecycle.textMap" :typeMap="productLifecycle.typeMap" />
        <StatusTag :status="'production'" :textMap="productLifecycle.textMap" :typeMap="productLifecycle.typeMap" />
        <StatusTag :status="'discontinued'" :textMap="productLifecycle.textMap" :typeMap="productLifecycle.typeMap" />
      </div>
      
      <h3>自定义颜色</h3>
      <div class="demo-item">
        <StatusTag 
          :status="'critical'" 
          :textMap="{ 'critical': '严重', 'major': '重要', 'minor': '次要' }" 
          :colorMap="{ 'critical': '#f56c6c', 'major': '#e6a23c', 'minor': '#67c23a' }"
        />
        <StatusTag 
          :status="'major'" 
          :textMap="{ 'critical': '严重', 'major': '重要', 'minor': '次要' }" 
          :colorMap="{ 'critical': '#f56c6c', 'major': '#e6a23c', 'minor': '#67c23a' }"
        />
        <StatusTag 
          :status="'minor'" 
          :textMap="{ 'critical': '严重', 'major': '重要', 'minor': '次要' }" 
          :colorMap="{ 'critical': '#f56c6c', 'major': '#e6a23c', 'minor': '#67c23a' }"
        />
      </div>
    </div>
    
    <el-divider content-position="left">2. 操作按钮 (ActionButtons)</el-divider>
    <div class="demo-section">
      <h3>基本用法 (文本模式)</h3>
      <div class="demo-item">
        <ActionButtons :buttons="textButtons" mode="text" @click="handleButtonClick" />
      </div>
      
      <h3>基本用法 (普通按钮模式)</h3>
      <div class="demo-item">
        <ActionButtons :buttons="normalButtons" @click="handleButtonClick" />
      </div>
      
      <h3>表格中使用</h3>
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="status" label="状态">
          <template slot-scope="scope">
            <StatusTag :status="scope.row.status" :textMap="{ 0: '禁用', 1: '启用' }" :typeMap="{ 0: 'info', 1: 'success' }" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template slot-scope="scope">
            <ActionButtons 
              :buttons="getRowButtons(scope.row)" 
              :row="scope.row" 
              mode="text" 
              @click="handleTableAction" 
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <el-divider content-position="left">3. 高级搜索表单 (SearchForm)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <SearchForm
        :items="searchItems"
        :value="searchForm"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #buttons>
          <el-button type="success" icon="el-icon-download" size="small">导出</el-button>
        </template>
      </SearchForm>
      
      <div class="search-result" v-if="searchResult">
        <pre>{{ searchResult }}</pre>
      </div>
    </div>
    
    <el-divider content-position="left">4. 弹窗表单 (DialogForm)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <el-button type="primary" @click="showAddDialog">新增用户</el-button>
      <el-button type="warning" @click="showEditDialog">编辑用户</el-button>
      <el-button type="info" @click="showViewDialog">查看用户</el-button>
      
      <DialogForm
        v-model="dialogVisible"
        :mode="dialogMode"
        :title="dialogTitle"
        :data="formData"
        :rules="formRules"
        :formItems="formItems"
        @submit="handleFormSubmit"
      />
      
      <div class="form-result" v-if="formResult">
        <pre>{{ formResult }}</pre>
      </div>
    </div>
    
    <el-divider content-position="left">5. 打印按钮 (PrintButton)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <div class="demo-item">
        <PrintButton 
          printTitle="用户数据表格" 
          printSelector="#printable-table"
          @before-print="handleBeforePrint"
          @after-print="handleAfterPrint"
        />
        <PrintButton 
          text="打印JSON数据" 
          type="success" 
          :printType="'json'" 
          :jsonData="tableData" 
          :properties="jsonProperties"
          printTitle="用户数据JSON"
        />
      </div>
      
      <h3>打印表格示例</h3>
      <div id="printable-table" class="printable-content">
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column label="状态" width="100">
            <template slot-scope="scope">
              <StatusTag :status="scope.row.status" :textMap="{ 0: '禁用', 1: '启用' }" :typeMap="{ 0: 'info', 1: 'success' }" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" class="no-print">
            <template slot-scope="scope">
              <el-button 
                size="mini" 
                type="text" 
                @click="handleView(scope.row)"
              >查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <h3>自定义打印按钮</h3>
      <div class="demo-item">
        <PrintButton printSelector="#printable-table" printTitle="自定义打印按钮">
          <el-button type="danger" icon="el-icon-printer">
            自定义打印按钮
          </el-button>
        </PrintButton>
      </div>
    </div>
    
    <el-divider content-position="left">6. 表格工具栏 (TableToolbar)</el-divider>
    <div class="demo-section">
      <h3>基本用法 - 集成批量操作、导入导出、打印和列设置</h3>
      <div class="demo-item">
        <table-toolbar
          :enable-batch-actions="true"
          :selected-rows="selectedTableRows"
          :column-options="tableColumnOptions"
          :default-visible-columns="defaultColumns"
          :enable-import="true"
          :import-api="mockImportApi"
          :template-api="mockTemplateApi"
          :enable-export="true"
          :export-api="mockExportApi"
          :export-params="mockExportParams"
          :enable-print="true"
          :print-selector="'#demo-table'"
          :status-buttons-mode="'buttons'"
          @refresh="handleToolbarRefresh"
          @column-change="handleToolbarColumnChange"
          @batch-delete="handleToolbarBatchDelete"
          @batch-enable="handleToolbarBatchEnable"
          @batch-disable="handleToolbarBatchDisable"
          @import-success="handleToolbarImportSuccess"
          @export-success="handleToolbarExportSuccess"
        >
          <template slot="toolbar-left">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleToolbarAdd">新增</el-button>
          </template>
        </table-toolbar>
        
        <el-table
          id="demo-table"
          ref="demoTable"
          :data="demoTableData"
          border
          style="width: 100%"
          @selection-change="handleDemoTableSelectionChange"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column v-if="tableColumns.includes('id')" prop="id" label="ID" width="80"></el-table-column>
          <el-table-column v-if="tableColumns.includes('name')" prop="name" label="名称" width="120"></el-table-column>
          <el-table-column v-if="tableColumns.includes('code')" prop="code" label="编码" width="150"></el-table-column>
          <el-table-column v-if="tableColumns.includes('type')" prop="type" label="类型" width="120"></el-table-column>
          <el-table-column v-if="tableColumns.includes('status')" label="状态" width="100">
            <template slot-scope="scope">
              <StatusTag :status="scope.row.status" :textMap="{ 0: '禁用', 1: '启用' }" :typeMap="{ 0: 'info', 1: 'success' }" />
            </template>
          </el-table-column>
          <el-table-column v-if="tableColumns.includes('createTime')" prop="createTime" label="创建时间" width="180"></el-table-column>
          <el-table-column v-if="tableColumns.includes('operations')" label="操作" width="150">
            <template slot-scope="scope">
              <ActionButtons 
                :buttons="getRowButtons(scope.row)" 
                :row="scope.row" 
                mode="text" 
                @click="handleTableAction"
              />
            </template>
          </el-table-column>
        </el-table>
        
        <div class="table-toolbar-result" v-if="toolbarResult">
          <h4>操作结果：</h4>
          <pre>{{ toolbarResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { productLifecycleMap } from '@/components/StatusTag/types'
import { CommonButtons, generateTableButtons, createStatusButtons } from '@/components/ActionButtons/presets'
import TableToolbar from '@/components/TableToolbar'

export default {
  name: 'GlobalComponentsDemo',
  components: {
    TableToolbar
  },
  data() {
    return {
      // StatusTag示例数据
      productLifecycle: productLifecycleMap,
      
      // ActionButtons示例数据
      textButtons: [
        { text: '查看', icon: 'el-icon-view', action: 'view' },
        { text: '编辑', icon: 'el-icon-edit', action: 'edit' },
        { text: '删除', icon: 'el-icon-delete', action: 'delete', type: 'danger' }
      ],
      normalButtons: [
        { text: '新增', icon: 'el-icon-plus', action: 'add', type: 'primary' },
        { text: '批量导入', icon: 'el-icon-upload2', action: 'import', type: 'success' },
        { text: '批量导出', icon: 'el-icon-download', action: 'export', type: 'warning' }
      ],
      tableData: [
        { id: 1, name: '张三', status: 1 },
        { id: 2, name: '李四', status: 0 },
        { id: 3, name: '王五', status: 1 }
      ],
      
      // SearchForm示例数据
      searchForm: {
        keyword: '',
        status: '',
        dateRange: []
      },
      searchItems: [
        { 
          prop: 'keyword', 
          label: '关键词', 
          type: 'input',
          placeholder: '请输入姓名/ID'
        },
        { 
          prop: 'status', 
          label: '状态', 
          type: 'select',
          placeholder: '请选择状态',
          options: [
            { label: '启用', value: 1 },
            { label: '禁用', value: 0 }
          ]
        },
        { 
          prop: 'dateRange', 
          label: '创建日期', 
          type: 'date',
          dateType: 'daterange',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          valueFormat: 'yyyy-MM-dd'
        },
        { 
          prop: 'category', 
          label: '分类', 
          type: 'select',
          placeholder: '请选择分类',
          options: [
            { label: '电子产品', value: 'electronics' },
            { label: '服装', value: 'clothing' },
            { label: '食品', value: 'food' }
          ]
        },
        { 
          prop: 'price', 
          label: '价格', 
          type: 'number',
          placeholder: '请输入价格',
          min: 0
        }
      ],
      searchResult: null,
      
      // DialogForm示例数据
      dialogVisible: false,
      dialogMode: 'add',
      dialogTitle: '',
      formData: {},
      formRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        gender: [
          { required: true, message: '请选择性别', trigger: 'change' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ]
      },
      formItems: [
        { prop: 'name', label: '姓名', type: 'input', placeholder: '请输入姓名' },
        { 
          prop: 'gender', 
          label: '性别', 
          type: 'radio',
          options: [
            { label: '男', value: 'male' },
            { label: '女', value: 'female' }
          ]
        },
        { prop: 'age', label: '年龄', type: 'number', min: 0, max: 120 },
        { prop: 'email', label: '邮箱', type: 'input', placeholder: '请输入邮箱' },
        { 
          prop: 'status', 
          label: '状态', 
          type: 'switch',
          activeText: '启用',
          inactiveText: '禁用',
          activeValue: 1,
          inactiveValue: 0
        },
        { 
          prop: 'description', 
          label: '描述', 
          type: 'textarea',
          rows: 4,
          placeholder: '请输入描述'
        }
      ],
      formResult: null,
      
      // PrintButton示例数据
      jsonProperties: [
        { field: 'id', displayName: 'ID' },
        { field: 'name', displayName: '姓名' },
        { field: 'status', displayName: '状态', callback: (value) => value === 1 ? '启用' : '禁用' }
      ],
      
      // TableToolbar示例数据
      selectedTableRows: [],
      demoTableData: [
        { id: 1, name: '产品A', code: 'PRD001', type: '电子', status: 1, createTime: '2024-01-15 10:30:45' },
        { id: 2, name: '产品B', code: 'PRD002', type: '家具', status: 0, createTime: '2024-02-22 09:15:30' },
        { id: 3, name: '产品C', code: 'PRD003', type: '电子', status: 1, createTime: '2024-03-10 14:25:18' },
        { id: 4, name: '产品D', code: 'PRD004', type: '食品', status: 1, createTime: '2024-04-05 16:42:20' },
        { id: 5, name: '产品E', code: 'PRD005', type: '家具', status: 0, createTime: '2024-05-12 11:38:55' }
      ],
      tableColumnOptions: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '名称' },
        { prop: 'code', label: '编码' },
        { prop: 'type', label: '类型' },
        { prop: 'status', label: '状态' },
        { prop: 'createTime', label: '创建时间' },
        { prop: 'operations', label: '操作' }
      ],
      defaultColumns: ['id', 'name', 'type', 'status', 'operations'],
      tableColumns: ['id', 'name', 'type', 'status', 'operations'],
      mockExportParams: { includeDisabled: true },
      toolbarResult: null
    }
  },
  methods: {
    // ActionButtons相关方法
    handleButtonClick(data) {
      this.$message.success(`点击了按钮: ${data.action}`)
    },
    
    getRowButtons(row) {
      return [
        CommonButtons.VIEW,
        CommonButtons.EDIT,
        row.status === 1 
          ? { ...CommonButtons.DISABLE, showText: true }
          : { ...CommonButtons.ENABLE, showText: true }
      ]
    },
    
    handleTableAction({ action, row }) {
      if (action === 'enable' || action === 'disable') {
        const newStatus = action === 'enable' ? 1 : 0
        const statusText = action === 'enable' ? '启用' : '禁用'
        this.$message.success(`已${statusText}用户: ${row.name}`)
        // 实际项目中这里应该调用API更新状态
        const index = this.tableData.findIndex(item => item.id === row.id)
        if (index !== -1) {
          this.tableData[index].status = newStatus
        }
      } else {
        this.$message.info(`对用户 ${row.name} 执行: ${action}`)
      }
    },
    
    // SearchForm相关方法
    handleSearch(formData) {
      this.searchResult = JSON.stringify(formData, null, 2)
      this.$message.success('搜索成功')
    },
    
    handleReset() {
      this.searchResult = null
      this.$message.info('表单已重置')
    },
    
    // DialogForm相关方法
    showAddDialog() {
      this.dialogMode = 'add'
      this.dialogTitle = '新增用户'
      this.dialogVisible = true
      this.formData = {
        name: '',
        gender: 'male',
        age: 30,
        email: '',
        status: 1,
        description: ''
      }
    },
    
    showEditDialog() {
      this.dialogMode = 'edit'
      this.dialogTitle = '编辑用户'
      this.dialogVisible = true
      this.formData = {
        name: '测试用户',
        gender: 'female',
        age: 28,
        email: 'test@example.com',
        status: 1,
        description: '这是一个测试用户'
      }
    },
    
    showViewDialog() {
      this.dialogMode = 'view'
      this.dialogTitle = '查看用户'
      this.dialogVisible = true
      this.formData = {
        name: '测试用户',
        gender: 'female',
        age: 28,
        email: 'test@example.com',
        status: 1,
        description: '这是一个测试用户'
      }
    },
    
    handleFormSubmit(formData) {
      this.formResult = JSON.stringify(formData, null, 2)
      this.$message.success(`表单提交成功: ${this.dialogMode}`)
      this.dialogVisible = false
    },
    
    // PrintButton相关方法
    handleBeforePrint() {
      this.$message.info('开始打印')
    },
    
    handleAfterPrint() {
      this.$message.success('打印完成')
    },
    
    handleView(row) {
      this.$message.info(`查看用户: ${row.name}`)
    },
    
    // TableToolbar相关方法
    handleDemoTableSelectionChange(selection) {
      this.selectedTableRows = selection
    },
    
    handleToolbarRefresh() {
      this.toolbarResult = '刷新表格数据'
      this.$message.success('已刷新表格数据')
    },
    
    handleToolbarColumnChange(columns) {
      this.tableColumns = columns
      this.toolbarResult = `列设置已更新: ${columns.join(', ')}`
    },
    
    handleToolbarBatchDelete(rows) {
      this.toolbarResult = `批量删除: ${rows.length}条数据`
      this.$message.success(`已删除${rows.length}条数据`)
    },
    
    handleToolbarBatchEnable(rows) {
      this.toolbarResult = `批量启用: ${rows.length}条数据`
      this.$message.success(`已启用${rows.length}条数据`)
    },
    
    handleToolbarBatchDisable(rows) {
      this.toolbarResult = `批量禁用: ${rows.length}条数据`
      this.$message.success(`已禁用${rows.length}条数据`)
    },
    
    handleToolbarImportSuccess(result) {
      this.toolbarResult = `导入成功: ${JSON.stringify(result)}`
      this.$message.success('数据导入成功')
    },
    
    handleToolbarExportSuccess(result) {
      this.toolbarResult = `导出成功: ${JSON.stringify(result)}`
      this.$message.success('数据导出成功')
    },
    
    handleToolbarAdd() {
      this.toolbarResult = '新增数据'
      this.$message.info('点击了新增按钮')
    },
    
    // 模拟API方法
    mockImportApi() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              success: 3,
              fail: 1,
              total: 4,
              errors: [
                { row: 3, message: '数据格式错误' }
              ]
            }
          })
        }, 1000)
      })
    },
    
    mockTemplateApi() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: 'mock-template-data' })
        }, 500)
      })
    },
    
    mockExportApi() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: 'export-success: mock-export-data'
          })
        }, 800)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  
  h2 {
    margin-top: 0;
    margin-bottom: 20px;
    font-weight: 600;
  }
  
  .demo-section {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 16px;
      font-weight: 500;
    }
    
    .demo-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 4px;
      
      .el-tag + .el-tag {
        margin-left: 10px;
      }
    }
    
    .search-result,
    .form-result {
      margin-top: 20px;
      padding: 15px;
      background: #f5f7fa;
      border-radius: 4px;
      border: 1px solid #e6ebf5;
      
      pre {
        margin: 0;
        white-space: pre-wrap;
      }
    }
    
    .el-table {
      margin-top: 15px;
    }
    
    .printable-content {
      margin-top: 15px;
      margin-bottom: 20px;
    }
  }
}

@media print {
  .no-print {
    display: none !important;
  }
}

.table-toolbar-result {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 500;
  }
  
  pre {
    margin: 0;
    white-space: pre-wrap;
  }
}
</style> 