/**
 * TableToolbar 表格工具栏组件演示页面
 * 功能描述：展示TableToolbar组件的各种功能和使用方法，包括现代化优化功能
 * 创建日期：2024-12-19
 */
<template>
  <div class="table-toolbar-demo">
    <!-- 页面标题 -->
    <div class="demo-header">
      <h1>TableToolbar 表格工具栏组件演示</h1>
      <p>强大的表格工具栏组件，集成批量操作、导入/导出、刷新和列设置等功能，为表格提供统一的操作界面。</p>
    </div>

    <!-- 功能特性介绍 -->
    <el-card class="demo-intro" shadow="hover">
      <div slot="header">
        <span>🌟 组件特性</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-s-operation feature-icon primary"></i>
            <h4>批量操作</h4>
            <p>支持批量删除、启用/禁用等操作</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-upload feature-icon success"></i>
            <h4>导入/导出</h4>
            <p>内置Excel导入导出功能</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-setting feature-icon warning"></i>
            <h4>列设置</h4>
            <p>动态控制表格列显示/隐藏</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-refresh feature-icon info"></i>
            <h4>刷新控制</h4>
            <p>一键刷新表格数据</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 基础工具栏示例 -->
    <div class="demo-section">
      <h2>1. 基础工具栏</h2>
      <div class="demo-description">
        <p>最基本的工具栏功能，包含刷新和列设置。</p>
      </div>

      <div class="demo-content">
        <table-toolbar
          :column-options="allColumns"
          :storage-key="'basic_demo_table'"
          :default-visible-columns="['name', 'code', 'status']"
          @refresh="handleBasicRefresh"
          @column-change="handleBasicColumnChange"
        >
          <template #toolbar-left>
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">
              新增数据
            </el-button>
          </template>
        </table-toolbar>

        <!-- 模拟表格 -->
        <el-table
          :data="basicTableData"
          border
          @selection-change="handleBasicSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <template v-for="col in basicVisibleColumns">
            <el-table-column
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              :width="col.width"
            />
          </template>
        </el-table>

        <div v-if="basicResult" class="result-display">
          <h4>操作结果：</h4>
          <pre>{{ basicResult }}</pre>
        </div>
      </div>
    </div>

    <!-- 完整功能示例 -->
    <div class="demo-section">
      <h2>2. 完整功能工具栏</h2>
      <div class="demo-description">
        <p>展示所有功能，包括批量操作、导入/导出、列设置等。</p>
      </div>

      <div class="demo-content">
        <table-toolbar
          :enable-batch-actions="true"
          :selected-rows="selectedRows"
          :enable-import="true"
          :import-api="mockImportApi"
          :template-api="mockTemplateApi"
          :enable-export="true"
          :export-api="mockExportApi"
          :export-params="exportParams"
          :column-options="allColumns"
          :storage-key="'full_demo_table'"
          :default-visible-columns="defaultVisibleColumns"
          :custom-actions="customActions"
          @refresh="handleFullRefresh"
          @column-change="handleFullColumnChange"
          @batch-delete="handleBatchDelete"
          @batch-enable="handleBatchEnable"
          @batch-disable="handleBatchDisable"
          @custom-action="handleCustomAction"
          @import-success="handleImportSuccess"
          @import-error="handleImportError"
          @export-success="handleExportSuccess"
          @export-error="handleExportError"
        >
          <template #toolbar-left>
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">
              新增产品
            </el-button>
            <el-button type="success" icon="el-icon-check" size="mini" @click="handleBatchApprove">
              批量审核
            </el-button>
          </template>

          <template #toolbar-right>
            <el-button type="info" icon="el-icon-s-tools" size="mini" @click="handleSettings">
              设置
            </el-button>
          </template>
        </table-toolbar>

        <!-- 完整功能表格 -->
        <el-table
          v-loading="tableLoading"
          :data="fullTableData"
          border
          highlight-current-row
          @selection-change="handleFullSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column type="index" label="#" width="50" />
          
          <template v-for="col in fullVisibleColumns">
            <el-table-column
              v-if="col.type === 'status'"
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              :width="col.width"
            >
              <template slot-scope="scope">
                <el-tag
                  :type="scope.row[col.prop] === 1 ? 'success' : 'info'"
                  size="small"
                >
                  {{ scope.row[col.prop] === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              v-else
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              :width="col.width"
            />
          </template>

          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" size="mini" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button type="text" size="mini" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button 
                type="text" 
                size="mini" 
                style="color: #f56c6c"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="fullResult" class="result-display">
          <h4>操作结果：</h4>
          <pre>{{ fullResult }}</pre>
        </div>
      </div>
    </div>

    <!-- 事件日志 -->
    <div class="demo-section">
      <h2>3. 事件日志</h2>
      <div class="demo-description">
        <p>查看工具栏组件触发的各种事件。</p>
      </div>

      <div class="demo-content">
        <div class="event-log-container">
          <div class="log-header">
            <h3>事件日志 (最近 {{ maxLogs }} 条)</h3>
            <el-button size="mini" @click="clearEventLogs">清空日志</el-button>
          </div>
          <div class="event-logs">
            <div 
              v-for="(log, index) in eventLogs.slice(-maxLogs)" 
              :key="index" 
              :class="getLogClass(log.type)"
            >
              <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
              <span class="log-type">{{ log.type }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TableToolbar from './index.vue'
import columnSettingsMixin from './columnSettingsMixin'

export default {
  name: 'TableToolbarDemo',
  components: {
    TableToolbar
  },
  mixins: [columnSettingsMixin],

  data() {
    return {
      // 全部列配置
      allColumns: [
        { prop: 'name', label: '产品名称', width: '150px' },
        { prop: 'code', label: '产品编码', width: '120px' },
        { prop: 'category', label: '产品分类', width: '120px' },
        { prop: 'price', label: '价格', width: '100px' },
        { prop: 'stock', label: '库存', width: '80px' },
        { prop: 'status', label: '状态', width: '80px', type: 'status' },
        { prop: 'createTime', label: '创建时间', width: '150px' },
        { prop: 'updateTime', label: '更新时间', width: '150px' }
      ],



      // 基础示例数据
      basicTableData: [
        { id: 1, name: '智能手机A', code: 'SP001', category: '电子产品', status: 1 },
        { id: 2, name: '笔记本B', code: 'NB002', category: '电子产品', status: 0 },
        { id: 3, name: '运动鞋C', code: 'SH003', category: '服装鞋帽', status: 1 }
      ],
      basicVisibleColumns: [],
      basicSelectedRows: [],
      basicResult: '',

      // 完整功能示例数据
      fullTableData: [
        { 
          id: 1, name: '智能手机Pro', code: 'SP001', category: '电子产品', 
          price: 3999, stock: 100, status: 1, 
          createTime: '2024-01-15 09:30:00', updateTime: '2024-12-19 14:20:00' 
        },
        { 
          id: 2, name: '游戏笔记本', code: 'NB002', category: '电子产品', 
          price: 8999, stock: 50, status: 1,
          createTime: '2024-02-20 10:15:00', updateTime: '2024-12-18 16:45:00' 
        },
        { 
          id: 3, name: '无线耳机', code: 'HP003', category: '电子产品', 
          price: 299, stock: 200, status: 0,
          createTime: '2024-03-10 11:20:00', updateTime: '2024-12-17 09:10:00' 
        },
        { 
          id: 4, name: '智能手表', code: 'SW004', category: '电子产品', 
          price: 1299, stock: 80, status: 1,
          createTime: '2024-04-05 14:30:00', updateTime: '2024-12-19 11:30:00' 
        },
        { 
          id: 5, name: '运动背包', code: 'BP005', category: '户外用品', 
          price: 199, stock: 150, status: 1,
          createTime: '2024-05-12 16:45:00', updateTime: '2024-12-16 13:20:00' 
        }
      ],
      fullVisibleColumns: [],
      selectedRows: [],
      fullResult: '',
      tableLoading: false,

      // 导出参数
      exportParams: {
        filename: 'product_list',
        fields: ['name', 'code', 'category', 'price', 'status']
      },

      // 自定义操作
      customActions: [
        { label: '批量审核', type: 'success', icon: 'el-icon-check', action: 'approve' },
        { label: '批量归档', type: 'warning', icon: 'el-icon-folder', action: 'archive' }
      ],

      // 事件日志
      eventLogs: [],
      maxLogs: 20,

      // 默认可见列
      defaultVisibleColumns: ['name', 'code', 'category', 'price', 'status']
    }
  },

  created() {
    // 初始化可见列
    this.basicVisibleColumns = this.allColumns.filter(col => 
      ['name', 'code', 'status'].includes(col.prop)
    )
    this.fullVisibleColumns = this.allColumns.filter(col => 
      this.defaultVisibleColumns.includes(col.prop)
    )
  },

  methods: {
    // 记录事件日志
    logEvent(type, message, data = null) {
      this.eventLogs.push({
        timestamp: Date.now(),
        type,
        message,
        data
      })
    },

    // 基础示例方法
    handleBasicRefresh() {
      this.logEvent('refresh', '基础工具栏：刷新数据')
      this.basicResult = '数据已刷新 - ' + new Date().toLocaleTimeString()
    },

    handleBasicColumnChange(columns) {
      this.basicVisibleColumns = this.allColumns.filter(col => 
        columns.includes(col.prop)
      )
      this.logEvent('column-change', `基础工具栏：列设置变更 - ${columns.join(', ')}`)
      this.basicResult = `列设置已更新: ${columns.join(', ')}`
    },

    handleBasicSelectionChange(selection) {
      this.basicSelectedRows = selection
    },

    // 完整功能示例方法
    handleFullRefresh() {
      this.tableLoading = true
      this.logEvent('refresh', '完整工具栏：刷新数据')
      
      setTimeout(() => {
        this.tableLoading = false
        this.fullResult = '数据已刷新 - ' + new Date().toLocaleTimeString()
      }, 800)
    },

    handleFullColumnChange(columns) {
      this.fullVisibleColumns = this.allColumns.filter(col => 
        columns.includes(col.prop)
      )
      this.logEvent('column-change', `完整工具栏：列设置变更 - ${columns.join(', ')}`)
      this.fullResult = `列设置已更新: ${columns.join(', ')}`
    },

    handleFullSelectionChange(selection) {
      this.selectedRows = selection
      this.logEvent('selection-change', `选中 ${selection.length} 项`)
    },

    handleBatchDelete(rows) {
      this.logEvent('batch-delete', `批量删除 ${rows.length} 项`, rows)
      this.fullResult = `批量删除 ${rows.length} 项：${rows.map(r => r.name).join(', ')}`
      this.$message.success(`已删除 ${rows.length} 项`)
    },

    handleBatchEnable(rows) {
      this.logEvent('batch-enable', `批量启用 ${rows.length} 项`, rows)
      this.fullResult = `批量启用 ${rows.length} 项：${rows.map(r => r.name).join(', ')}`
      this.$message.success(`已启用 ${rows.length} 项`)
    },

    handleBatchDisable(rows) {
      this.logEvent('batch-disable', `批量禁用 ${rows.length} 项`, rows)
      this.fullResult = `批量禁用 ${rows.length} 项：${rows.map(r => r.name).join(', ')}`
      this.$message.success(`已禁用 ${rows.length} 项`)
    },

    handleCustomAction(action, rows) {
      this.logEvent('custom-action', `自定义操作 ${action.action}: ${rows.length} 项`, { action, rows })
      this.fullResult = `执行 ${action.label}: ${rows.map(r => r.name).join(', ')}`
      this.$message.success(`已执行 ${action.label}`)
    },

    // 导入/导出相关方法
    async mockImportApi(file) {
      this.logEvent('import', `开始导入文件: ${file.name}`)
      
      // 模拟导入API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: '导入成功',
            data: { 
              total: 100, 
              success: 95, 
              failed: 5,
              filename: file.name 
            }
          })
        }, 2000)
      })
    },

    async mockTemplateApi() {
      this.logEvent('template-download', '下载模板文件')
      
      // 模拟模板下载
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            url: 'template.xlsx',
            filename: '产品导入模板.xlsx'
          })
        }, 500)
      })
    },

    async mockExportApi(params) {
      this.logEvent('export', '开始导出数据', params)
      
      // 模拟导出API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            filename: `${params.filename || 'export'}_${Date.now()}.xlsx`,
            url: 'export.xlsx'
          })
        }, 1500)
      })
    },

    handleImportSuccess(result) {
      this.logEvent('import-success', '导入成功', result)
      this.fullResult = `导入成功: ${result.data.success}/${result.data.total} 条记录`
    },

    handleImportError(error) {
      this.logEvent('import-error', '导入失败', error)
      this.fullResult = `导入失败: ${error.message || '未知错误'}`
    },

    handleExportSuccess(result) {
      this.logEvent('export-success', '导出成功', result)
      this.fullResult = `导出成功: ${result.filename}`
    },

    handleExportError(error) {
      this.logEvent('export-error', '导出失败', error)
      this.fullResult = `导出失败: ${error.message || '未知错误'}`
    },

    // 通用操作方法
    handleAdd() {
      this.logEvent('add', '新增按钮点击')
      this.$message.info('新增功能演示')
    },

    handleEdit(row) {
      this.logEvent('edit', `编辑：${row.name || row.title}`, row)
      this.$message.info(`编辑：${row.name || row.title}`)
    },

    handleView(row) {
      this.logEvent('view', `查看：${row.name || row.title}`, row)
      this.$message.info(`查看：${row.name || row.title}`)
    },

    handleDelete(row) {
      this.logEvent('delete', `删除：${row.name || row.title}`, row)
      this.$message.warning(`删除：${row.name || row.title}`)
    },

    handleBatchApprove() {
      this.logEvent('approve', '批量审核按钮点击')
      this.$message.success('批量审核功能演示')
    },

    handleSettings() {
      this.logEvent('settings', '设置按钮点击')
      this.$message.info('设置功能演示')
    },

    // 事件日志相关方法
    formatLogTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },

    getLogClass(type) {
      const baseClass = 'log-item'
      const typeClasses = {
        'refresh': 'info',
        'column-change': 'primary',
        'batch-delete': 'danger',
        'batch-enable': 'success',
        'batch-disable': 'warning',
        'import': 'info',
        'export': 'info',
        'error': 'danger'
      }
      return `${baseClass} ${typeClasses[type] || 'default'}`
    },

    clearEventLogs() {
      this.eventLogs = []
      this.$message.success('事件日志已清空')
    }
  }
}
</script>

<style lang="scss" scoped>
.table-toolbar-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .demo-header {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      color: #303133;
      margin-bottom: 10px;
    }

    p {
      color: #606266;
      font-size: 16px;
      line-height: 1.5;
    }
  }

  .demo-intro {
    margin-bottom: 30px;

    .feature-item {
      text-align: center;
      padding: 10px;

      .feature-icon {
        font-size: 32px;
        margin-bottom: 10px;
        display: block;

        &.primary { color: #409EFF; }
        &.success { color: #67C23A; }
        &.warning { color: #E6A23C; }
        &.info { color: #909399; }
      }

      h4 {
        margin: 8px 0;
        color: #303133;
      }

      p {
        color: #606266;
        font-size: 14px;
        margin: 0;
      }
    }
  }

  .demo-section {
    margin-bottom: 40px;

    h2 {
      color: #303133;
      border-bottom: 2px solid #409EFF;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }

    .demo-description {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-left: 4px solid #409EFF;
      border-radius: 4px;

      p {
        margin: 0;
        color: #606266;
        line-height: 1.5;
      }
    }

    .demo-content {
      .result-display {
        margin-top: 20px;
        padding: 15px;
        background-color: #f5f7fa;
        border: 1px solid #e4e7ed;
        border-radius: 4px;

        h4 {
          margin: 0 0 10px 0;
          color: #303133;
        }

        pre {
          margin: 0;
          color: #606266;
          font-family: Consolas, Monaco, monospace;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
    }
  }

  .event-log-container {
    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h3 {
        margin: 0;
        color: #303133;
      }
    }

    .event-logs {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      background-color: #fff;

      .log-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid #f5f7fa;
        font-size: 13px;

        &:last-child {
          border-bottom: none;
        }

        .log-time {
          width: 80px;
          color: #909399;
          font-family: monospace;
        }

        .log-type {
          width: 120px;
          font-weight: 500;
        }

        .log-message {
          flex: 1;
          color: #606266;
        }

        &.primary .log-type { color: #409EFF; }
        &.success .log-type { color: #67C23A; }
        &.warning .log-type { color: #E6A23C; }
        &.danger .log-type { color: #F56C6C; }
        &.info .log-type { color: #909399; }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .table-toolbar-demo {
    padding: 10px;

    .demo-intro .el-col {
      margin-bottom: 15px;
    }

    .event-log-container .log-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
}
</style> 