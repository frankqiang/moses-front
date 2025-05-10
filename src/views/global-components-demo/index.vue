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
          :status-buttons-mode="'buttons'"
          :table-data="demoTableData"
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
          :cell-style="{ textAlign: 'center' }"
          :header-cell-style="{ backgroundColor: '#f5f7fa', textAlign: 'center' }"
          @selection-change="handleDemoTableSelectionChange"
        >
          <el-table-column type="selection" width="55" fixed></el-table-column>
          <el-table-column v-if="tableColumns.includes('id')" prop="id" label="ID" width="80" align="center"></el-table-column>
          <el-table-column v-if="tableColumns.includes('name')" prop="name" label="名称" width="120" align="center"></el-table-column>
          <el-table-column v-if="tableColumns.includes('code')" prop="code" label="编码" width="150" align="center"></el-table-column>
          <el-table-column v-if="tableColumns.includes('type')" prop="type" label="类型" width="140" align="center"></el-table-column>
          <el-table-column v-if="tableColumns.includes('status')" label="状态" width="100" align="center">
            <template slot-scope="scope">
              <StatusTag :status="scope.row.status" :textMap="{ 0: '禁用', 1: '启用' }" :typeMap="{ 0: 'info', 1: 'success' }" />
            </template>
          </el-table-column>
          <el-table-column v-if="tableColumns.includes('createTime')" prop="createTime" label="创建时间" width="180" align="center"></el-table-column>
          <el-table-column v-if="tableColumns.includes('operations')" label="操作" width="170" align="center" fixed="right">
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
        { key: 'view', label: '查看', type: 'primary' },
        { key: 'edit', label: '编辑', type: 'warning' },
        { key: 'delete', label: '删除', type: 'danger' }
      ],
      normalButtons: [
        { key: 'view', label: '查看', type: 'primary', icon: 'el-icon-view' },
        { key: 'edit', label: '编辑', type: 'warning', icon: 'el-icon-edit' },
        { key: 'delete', label: '删除', type: 'danger', icon: 'el-icon-delete' }
      ],
      tableData: [
        { id: 1, name: '张三', status: 1 },
        { id: 2, name: '李四', status: 0 },
        { id: 3, name: '王五', status: 1 }
      ],
      
      // SearchForm示例数据
      searchItems: [
        { type: 'input', label: '姓名', prop: 'name', placeholder: '请输入姓名' },
        { type: 'select', label: '状态', prop: 'status', options: [
          { label: '全部', value: '' },
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 }
        ] },
        { type: 'date', label: '创建日期', prop: 'createDate' },
        { type: 'daterange', label: '日期范围', prop: 'dateRange', startProp: 'startDate', endProp: 'endDate' }
      ],
      searchForm: {
        name: '',
        status: '',
        createDate: '',
        dateRange: []
      },
      searchResult: null,
      
      // DialogForm示例数据
      dialogVisible: false,
      dialogMode: 'add',
      dialogTitle: '',
      formData: {
        name: '',
        age: '',
        gender: 'male',
        email: '',
        interests: []
      },
      formRules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        age: [
          { required: true, message: '请输入年龄', trigger: 'blur' },
          { type: 'number', message: '年龄必须为数字', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        interests: [
          { type: 'array', required: true, message: '请至少选择一个兴趣爱好', trigger: 'change' }
        ]
      },
      formItems: [
        { type: 'input', label: '姓名', prop: 'name', placeholder: '请输入姓名' },
        { type: 'input', label: '年龄', prop: 'age', placeholder: '请输入年龄', inputType: 'number' },
        { type: 'radio', label: '性别', prop: 'gender', options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' }
        ] },
        { type: 'input', label: '邮箱', prop: 'email', placeholder: '请输入邮箱' },
        { type: 'checkbox', label: '兴趣爱好', prop: 'interests', options: [
          { label: '阅读', value: 'reading' },
          { label: '旅行', value: 'travel' },
          { label: '运动', value: 'sports' },
          { label: '音乐', value: 'music' }
        ] }
      ],
      formResult: null,
      
      // TableToolbar示例数据
      selectedTableRows: [],
      demoTableData: [
        { id: 1, name: '产品A', code: 'A001', type: '电子产品', status: 1, createTime: '2023-11-01 10:00:00' },
        { id: 2, name: '产品B', code: 'B002', type: '家居用品', status: 0, createTime: '2023-11-02 11:20:00' },
        { id: 3, name: '产品C', code: 'C003', type: '食品', status: 1, createTime: '2023-11-03 09:30:00' },
        { id: 4, name: '产品D', code: 'D004', type: '电子产品', status: 1, createTime: '2023-11-04 14:15:00' },
        { id: 5, name: '产品E', code: 'E005', type: '家居用品', status: 0, createTime: '2023-11-05 16:45:00' },
        { id: 6, name: '产品F', code: 'F006', type: '食品', status: 1, createTime: '2023-11-06 08:30:00' },
        { id: 7, name: '产品G', code: 'G007', type: '电子产品', status: 0, createTime: '2023-11-07 12:00:00' },
        { id: 8, name: '产品H', code: 'H008', type: '家居用品', status: 1, createTime: '2023-11-08 10:30:00' },
        { id: 9, name: '产品I', code: 'I009', type: '食品', status: 1, createTime: '2023-11-09 09:15:00' },
        { id: 10, name: '产品J', code: 'J010', type: '电子产品', status: 0, createTime: '2023-11-10 11:20:00' },
        { id: 11, name: '产品K', code: 'K011', type: '家居用品', status: 1, createTime: '2023-11-11 13:45:00' },
        { id: 12, name: '产品L', code: 'L012', type: '食品', status: 0, createTime: '2023-11-12 15:30:00' },
        { id: 13, name: '产品M', code: 'M013', type: '电子产品', status: 1, createTime: '2023-11-13 10:20:00' },
        { id: 14, name: '产品N', code: 'N014', type: '家居用品', status: 1, createTime: '2023-11-14 09:40:00' },
        { id: 15, name: '产品O', code: 'O015', type: '食品', status: 0, createTime: '2023-11-15 14:10:00' },
        { id: 16, name: '产品P', code: 'P016', type: '电子产品', status: 1, createTime: '2023-11-16 16:30:00' },
        { id: 17, name: '产品Q', code: 'Q017', type: '家居用品', status: 0, createTime: '2023-11-17 11:45:00' },
        { id: 18, name: '产品R', code: 'R018', type: '食品', status: 1, createTime: '2023-11-18 08:20:00' },
        { id: 19, name: '产品S', code: 'S019', type: '电子产品', status: 0, createTime: '2023-11-19 13:15:00' },
        { id: 20, name: '产品T', code: 'T020', type: '家居用品', status: 1, createTime: '2023-11-20 10:50:00' }
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
      defaultColumns: ['id', 'name', 'code', 'status', 'createTime', 'operations'],
      tableColumns: ['id', 'name', 'code', 'status', 'createTime', 'operations'],
      mockExportParams: {
        includeHeaders: true,
        fileName: '产品列表导出',
        sheetName: '产品数据'
      },
      toolbarResult: null
    }
  },
  methods: {
    // 获取当前日期
    getCurrentDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
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
        age: '',
        gender: 'male',
        email: '',
        interests: []
      }
    },
    
    showEditDialog() {
      this.dialogMode = 'edit'
      this.dialogTitle = '编辑用户'
      this.dialogVisible = true
      this.formData = {
        name: '测试用户',
        age: 28,
        gender: 'female',
        email: 'test@example.com',
        interests: ['reading', 'travel']
      }
    },
    
    showViewDialog() {
      this.dialogMode = 'view'
      this.dialogTitle = '查看用户'
      this.dialogVisible = true
      this.formData = {
        name: '测试用户',
        age: 28,
        gender: 'female',
        email: 'test@example.com',
        interests: ['reading', 'travel']
      }
    },
    
    handleFormSubmit(formData) {
      this.formResult = JSON.stringify(formData, null, 2)
      this.$message.success(`表单提交成功: ${this.dialogMode}`)
      this.dialogVisible = false
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