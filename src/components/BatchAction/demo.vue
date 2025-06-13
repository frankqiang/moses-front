<template>
  <div class="batch-action-demo">
    <h1>BatchAction 现代化组件演示</h1>

    <!-- 功能说明卡片 -->
    <el-card class="demo-info" shadow="hover">
      <div slot="header">
        <span>🎯 现代化特性展示</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-lightning feature-icon success" />
            <h4>防抖保护</h4>
            <p>300ms防抖机制防止误操作</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-shield feature-icon warning" />
            <h4>错误边界</h4>
            <p>组件级错误隔离和恢复</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-mobile-phone feature-icon info" />
            <h4>响应式设计</h4>
            <p>完美适配各种设备</p>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="feature-item">
            <i class="el-icon-data-line feature-icon primary" />
            <h4>虚拟化支持</h4>
            <p>大数据量性能优化</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 控制面板 -->
    <el-card class="demo-controls" shadow="hover">
      <div slot="header">
        <span>🎛️ 控制面板</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="模拟数据量">
            <el-slider
              v-model="dataSize"
              :min="10"
              :max="5000"
              :step="100"
              show-input
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="防抖延迟(ms)">
            <el-input-number
              v-model="debounceDelay"
              :min="100"
              :max="1000"
              :step="100"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="启用虚拟化">
            <el-switch v-model="enableVirtualization" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-button type="primary" @click="generateMockData">
            生成模拟数据 ({{ dataSize }} 条)
          </el-button>
          <el-button @click="selectAll">全选</el-button>
          <el-button @click="selectRandom">随机选择</el-button>
          <el-button @click="clearSelection">清空选择</el-button>
          <el-button type="danger" @click="triggerError">模拟错误</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 现代化BatchAction组件展示 -->
    <el-card class="demo-main" shadow="hover">
      <div slot="header">
        <span>📊 现代化BatchAction组件</span>
        <span class="demo-status">
          当前选中: {{ selectedRows.length }} / {{ tableData.length }}
        </span>
      </div>

      <!-- BatchAction组件 -->
      <batch-action
        :selected-rows="selectedRows"
        :custom-actions="customActions"
        :debounce-delay="debounceDelay"
        :enable-virtualization="enableVirtualization"
        :virtualization-threshold="1000"
        @batch-delete="handleBatchDelete"
        @batch-status="handleBatchStatus"
        @custom-action="handleCustomAction"
        @delete-cancel="handleDeleteCancel"
        @status-cancel="handleStatusCancel"
        @custom-action-cancel="handleCustomActionCancel"
      />

      <!-- 数据表格 -->
      <el-table
        ref="dataTable"
        v-loading="tableLoading"
        :data="paginatedData"
        style="margin-top: 20px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="{ row }">
            <el-button size="mini" @click="editItem(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-show="tableData.length > 0"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="tableData.length"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; text-align: right;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 操作日志 -->
    <el-card class="demo-log" shadow="hover">
      <div slot="header">
        <span>📝 操作日志</span>
        <el-button size="mini" type="text" @click="clearLog">清空日志</el-button>
      </div>
      <div class="log-container">
        <div v-for="(log, index) in operationLog" :key="index" class="log-item">
          <el-tag :type="log.type" size="mini">{{ log.timestamp }}</el-tag>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="operationLog.length === 0" class="empty-log">
          暂无操作日志
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import BatchAction from './index.vue'

export default {
  name: 'BatchActionDemo',
  components: {
    BatchAction
  },
  data() {
    return {
      tableData: [],
      selectedRows: [],
      tableLoading: false,
      dataSize: 100,
      debounceDelay: 300,
      enableVirtualization: false,
      currentPage: 1,
      pageSize: 20,
      operationLog: [],
      customActions: [
        {
          label: '批量审核',
          icon: 'el-icon-check',
          type: 'success',
          action: 'batchApprove',
          needConfirm: true,
          confirmText: '确认批量审核选中项吗？',
          showCount: true,
          successMessage: '批量审核操作完成'
        },
        {
          label: '批量导出',
          icon: 'el-icon-download',
          type: 'primary',
          action: 'batchExport',
          needConfirm: false,
          condition: (rows) => rows.length <= 1000,
          showCount: true
        },
        {
          label: '批量分配',
          icon: 'el-icon-user',
          type: 'info',
          action: 'batchAssign',
          needConfirm: true,
          minSelection: 2,
          showCount: true
        },
        {
          label: '模拟失败',
          icon: 'el-icon-warning',
          type: 'danger',
          action: 'simulateError',
          needConfirm: true,
          confirmText: '此操作将模拟一个错误，确认继续吗？'
        }
      ]
    }
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.tableData.slice(start, end)
    }
  },
  created() {
    this.generateMockData()
  },
  methods: {
    // 生成模拟数据
    generateMockData() {
      this.tableLoading = true
      this.selectedRows = []

      // 模拟异步加载
      setTimeout(() => {
        this.tableData = Array.from({ length: this.dataSize }, (_, index) => ({
          id: index + 1,
          name: `项目-${String(index + 1).padStart(4, '0')}`,
          type: ['产品', '服务', '方案', '工具'][index % 4],
          status: Math.random() > 0.3 ? 1 : 0,
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
        }))
        this.tableLoading = false
        this.addLog('success', `成功生成 ${this.dataSize} 条模拟数据`)
      }, 500)
    },

    // 选择变化处理
    handleSelectionChange(selection) {
      this.selectedRows = selection
      if (selection.length > 0) {
        this.addLog('info', `选中了 ${selection.length} 项`)
      }
    },

    // 批量删除处理
    async handleBatchDelete(data) {
      try {
        this.addLog('warning', `开始批量删除操作...`)

        // 模拟API调用
        await this.simulateApiCall(1000)

        const deleteCount = data.isVirtualized ? data.length : data.length
        this.addLog('success', `成功删除 ${deleteCount} 项`)

        // 模拟删除数据
        if (data.isVirtualized) {
          const ids = data.getIds()
          this.tableData = this.tableData.filter(item => !ids.includes(item.id))
        } else {
          const ids = data.map(item => item.id)
          this.tableData = this.tableData.filter(item => !ids.includes(item.id))
        }

        this.selectedRows = []
      } catch (error) {
        this.addLog('error', `批量删除失败: ${error.message}`)
      }
    },

    // 批量状态变更处理
    async handleBatchStatus(data, status) {
      try {
        this.addLog('info', `开始批量${status === 1 ? '启用' : '禁用'}操作...`)

        // 模拟API调用
        await this.simulateApiCall(800)

        const updateCount = data.isVirtualized ? data.length : data.length
        this.addLog('success', `成功${status === 1 ? '启用' : '禁用'} ${updateCount} 项`)

        // 模拟更新数据
        if (data.isVirtualized) {
          const ids = data.getIds()
          this.tableData.forEach(item => {
            if (ids.includes(item.id)) {
              item.status = status
            }
          })
        } else {
          const ids = data.map(item => item.id)
          this.tableData.forEach(item => {
            if (ids.includes(item.id)) {
              item.status = status
            }
          })
        }
      } catch (error) {
        this.addLog('error', `批量状态变更失败: ${error.message}`)
      }
    },

    // 自定义操作处理
    async handleCustomAction(action, data) {
      try {
        this.addLog('info', `开始执行 ${action.label} 操作...`)

        switch (action.action) {
          case 'batchApprove':
            await this.simulateApiCall(1200)
            break
          case 'batchExport':
            await this.simulateApiCall(2000)
            break
          case 'batchAssign':
            await this.simulateApiCall(1500)
            break
          case 'simulateError':
            throw new Error('这是一个模拟的错误')
        }

        const count = data.isVirtualized ? data.length : data.length
        this.addLog('success', `${action.label} 操作完成，处理了 ${count} 项`)
      } catch (error) {
        this.addLog('error', `${action.label} 操作失败: ${error.message}`)
      }
    },

    // 取消操作处理
    handleDeleteCancel() {
      this.addLog('warning', '用户取消了删除操作')
    },

    handleStatusCancel(data) {
      this.addLog('warning', `用户取消了${data.command}操作`)
    },

    handleCustomActionCancel(action) {
      this.addLog('warning', `用户取消了${action.label}操作`)
    },

    // 工具方法
    selectAll() {
      this.$refs.dataTable.toggleAllSelection()
    },

    selectRandom() {
      this.$refs.dataTable.clearSelection()
      const randomCount = Math.floor(Math.random() * Math.min(50, this.paginatedData.length)) + 1
      const randomIndices = []

      while (randomIndices.length < randomCount) {
        const index = Math.floor(Math.random() * this.paginatedData.length)
        if (!randomIndices.includes(index)) {
          randomIndices.push(index)
        }
      }

      randomIndices.forEach(index => {
        this.$refs.dataTable.toggleRowSelection(this.paginatedData[index], true)
      })
    },

    clearSelection() {
      this.$refs.dataTable.clearSelection()
    },

    triggerError() {
      // 通过设置一个无效的选中项来触发组件错误
      this.selectedRows = [{ invalid: 'data' }]
      setTimeout(() => {
        this.selectedRows = []
      }, 3000)
    },

    editItem(row) {
      this.addLog('info', `编辑项目: ${row.name}`)
    },

    getTypeColor(type) {
      const colorMap = {
        '产品': 'primary',
        '服务': 'success',
        '方案': 'warning',
        '工具': 'info'
      }
      return colorMap[type] || ''
    },

    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },

    handleCurrentChange(page) {
      this.currentPage = page
    },

    addLog(type, message) {
      const timestamp = new Date().toLocaleTimeString()
      this.operationLog.unshift({
        type,
        message,
        timestamp
      })

      // 限制日志数量
      if (this.operationLog.length > 50) {
        this.operationLog = this.operationLog.slice(0, 50)
      }
    },

    clearLog() {
      this.operationLog = []
    },

    // 模拟API调用
    simulateApiCall(delay = 1000) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 5% 概率模拟失败
          if (Math.random() < 0.05) {
            reject(new Error('网络请求失败'))
          } else {
            resolve()
          }
        }, delay)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.batch-action-demo {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  h1 {
    text-align: center;
    color: #303133;
    margin-bottom: 30px;
    font-weight: 300;
  }

  .el-card {
    margin-bottom: 20px;

    .el-card__header {
      background: #fafafa;
      border-bottom: 1px solid #ebeef5;

      span {
        font-weight: 500;
        color: #303133;
      }
    }
  }

  .demo-info {
    .feature-item {
      text-align: center;
      padding: 20px 10px;

      .feature-icon {
        font-size: 32px;
        margin-bottom: 10px;
        display: block;

        &.success { color: #67c23a; }
        &.warning { color: #e6a23c; }
        &.info { color: #909399; }
        &.primary { color: #409eff; }
      }

      h4 {
        margin: 10px 0 5px;
        color: #303133;
        font-size: 16px;
      }

      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .demo-controls {
    .el-form-item {
      margin-bottom: 10px;
    }
  }

  .demo-main {
    .demo-status {
      float: right;
      color: #409eff;
      font-weight: 500;
    }
  }

  .demo-log {
    .log-container {
      max-height: 300px;
      overflow-y: auto;
      background: #fafafa;
      border-radius: 4px;
      padding: 10px;

      .log-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        padding: 8px;
        background: white;
        border-radius: 4px;
        border-left: 3px solid #ddd;

        .el-tag {
          margin-right: 12px;
          min-width: 80px;
          text-align: center;
        }

        .log-message {
          color: #606266;
          font-size: 14px;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }

      .empty-log {
        text-align: center;
        color: #c0c4cc;
        padding: 40px;
        font-style: italic;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .el-col {
      margin-bottom: 10px;
    }

    .demo-info .feature-item {
      padding: 15px 5px;

      .feature-icon {
        font-size: 24px;
      }

      h4 {
        font-size: 14px;
      }

      p {
        font-size: 12px;
      }
    }
  }
}

// 深色主题支持
@media (prefers-color-scheme: dark) {
  .batch-action-demo {
    background: #2d3a4b;
    color: #e5eaf3;

    .el-card {
      background: #334155;
      border-color: #475569;

      .el-card__header {
        background: #3c4b5c;
        border-color: #475569;
        color: #e5eaf3;
      }
    }

    .log-container {
      background: #3c4b5c;

      .log-item {
        background: #334155;
        border-left-color: #475569;
      }
    }
  }
}
</style>
