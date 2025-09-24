/**
* 额外全局组件演示页面
* 功能描述：展示未在主演示页包含的全局组件
* 创建日期：2023-12-20
*/
<template>
  <div class="app-container">
    <h2>额外全局组件演示</h2>

    <el-divider content-position="left">1. 批量操作工具栏 (BatchActionsToolbar)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <div class="demo-item">
        <p>请先在表格中选择数据：</p>
        <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="120" />
          <el-table-column prop="name" label="名称" width="160" />
          <el-table-column prop="status" label="状态" width="120">
            <template slot-scope="scope">
              <StatusTag
                :status="scope.row.status"
                :text-map="{ 0: '禁用', 1: '启用' }"
                :type-map="{ 0: 'info', 1: 'success' }"
              />
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" />
        </el-table>

        <BatchActionsToolbar
          class="mt-20"
          :selected-rows="selectedRows"
          :custom-actions="customActions"
          @batch-delete="handleBatchDelete"
          @batch-enable="handleBatchEnable"
          @batch-disable="handleBatchDisable"
          @custom-action="handleCustomAction"
        />
      </div>
    </div>

    <el-divider content-position="left">2. 刷新按钮 (RefreshButton)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <div class="demo-item">
        <RefreshButton @refresh="handleRefresh" />

        <RefreshButton text="刷新数据" :animation-duration="1000" type="success" size="medium" @refresh="handleRefresh" />

        <p v-if="lastRefreshTime">上次刷新时间: {{ lastRefreshTime }}</p>
      </div>
    </div>

    <el-divider content-position="left">3. 导入按钮 (ImportButton)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <div class="demo-item">
        <ImportButton :import-api="mockImportApi" :template-api="mockTemplateApi" @import="handleImport" />

        <ImportButton
          text="导入数据"
          :import-api="mockImportApi"
          :template-api="mockTemplateApi"
          type="primary"
          size="medium"
          :show-template-download="true"
          @import="handleImport"
        />
      </div>

      <div v-if="importResult" class="import-result">
        <pre>{{ importResult }}</pre>
      </div>
    </div>

    <el-divider content-position="left">4. 导出按钮 (ExportButton)</el-divider>
    <div class="demo-section">
      <h3>基本用法</h3>
      <div class="demo-item">
        <ExportButton :export-api="mockExportApi" :params="{ data: tableData }" filename="用户数据" @export="handleExport" />

        <ExportButton
          text="导出为Excel"
          :export-api="mockExportApi"
          :params="{ data: tableData, columns: exportColumns }"
          filename="用户数据.xlsx"
          file-type="xlsx"
          type="success"
          size="medium"
          @export="handleExport"
        />
      </div>
    </div>
  </div>
</template>

<script>
// 示例页面，暂不使用这些组件

export default {
  name: 'ComponentsExamples',
  data() {
    return {
      selectedRows: [],
      tableData: [
        { id: 1, name: '产品A', status: 1, type: '电子产品' },
        { id: 2, name: '产品B', status: 0, type: '家用电器' },
        { id: 3, name: '产品C', status: 1, type: '食品' },
        { id: 4, name: '产品D', status: 1, type: '服装' },
        { id: 5, name: '产品E', status: 0, type: '家具' }
      ],
      customActions: [
        {
          label: '批量审核',
          type: 'success',
          icon: 'el-icon-check',
          action: 'approve'
        },
        {
          label: '更多操作',
          type: 'info',
          isDropdown: true,
          items: [
            { label: '导出选中', command: 'export-selected' },
            { label: '批量标记', command: 'mark' },
            { label: '批量归档', command: 'archive' }
          ]
        }
      ],
      lastRefreshTime: '',
      importResult: null,
      exportColumns: [
        { prop: 'id', label: 'ID' },
        { prop: 'name', label: '名称' },
        { prop: 'status', label: '状态', formatter: (row) => row.status === 1 ? '启用' : '禁用' },
        { prop: 'type', label: '类型' }
      ]
    }
  },
  methods: {
    // BatchActionsToolbar相关方法
    handleSelectionChange(val) {
      this.selectedRows = val
    },

    handleBatchDelete() {
      this.$message.success(`已执行批量删除，选中 ${this.selectedRows.length} 项`)
      console.log('要删除的数据:', this.selectedRows)
    },

    handleBatchEnable() {
      this.$message.success(`已执行批量启用，选中 ${this.selectedRows.length} 项`)
      // 实际项目中这里应该调用API批量更新状态
    },

    handleBatchDisable() {
      this.$message.success(`已执行批量禁用，选中 ${this.selectedRows.length} 项`)
      // 实际项目中这里应该调用API批量更新状态
    },

    handleCustomAction(action, command) {
      if (action === 'approve') {
        this.$message.success(`已执行批量审核，选中 ${this.selectedRows.length} 项`)
      } else if (command) {
        this.$message.info(`执行了 ${command} 操作，选中 ${this.selectedRows.length} 项`)
      }
    },

    // RefreshButton相关方法
    handleRefresh() {
      this.$message.info('刷新数据中...')

      // 模拟异步刷新
      setTimeout(() => {
        this.lastRefreshTime = new Date().toLocaleTimeString()
        this.$message.success('数据已刷新')
      }, 600)
    },

    // ImportButton相关方法
    handleImport(file) {
      this.$message.info('正在导入文件...')

      // 模拟导入处理
      setTimeout(() => {
        this.importResult = {
          total: 100,
          success: 95,
          failed: 5,
          errors: [
            { row: 5, message: '数据格式错误' },
            { row: 12, message: '必填字段缺失' },
            { row: 45, message: '参数超出范围' },
            { row: 67, message: '数据重复' },
            { row: 89, message: '外键引用错误' }
          ]
        }

        this.$message.success(`导入完成：成功${this.importResult.success}条，失败${this.importResult.failed}条`)
      }, 1000)
    },

    // ExportButton相关方法
    handleExport(options) {
      this.$message.info(`正在导出为${options.fileType}格式...`)

      // 模拟导出处理
      setTimeout(() => {
        this.$message.success(`数据已导出为：${options.filename}`)
      }, 800)
    },

    // 模拟API方法 - 导入
    mockImportApi(file) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              total: 100,
              success: 95,
              failed: 5,
              errors: [
                { row: 5, message: '数据格式错误' },
                { row: 12, message: '必填字段缺失' },
                { row: 45, message: '参数超出范围' },
                { row: 67, message: '数据重复' },
                { row: 89, message: '外键引用错误' }
              ]
            }
          })
        }, 1500)
      })
    },

    // 模拟API方法 - 导出
    mockExportApi(params) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: 'export-success-mock-data'
          })
        }, 1000)
      })
    },

    // 模拟API方法 - 下载模板
    mockTemplateApi() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.$message.success('模板下载成功（模拟）')
          resolve({})
        }, 500)
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
    }

    .mt-20 {
      margin-top: 20px;
    }

    .import-result {
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
  }
}
</style>
