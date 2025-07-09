/**
 * BatchDeleteConfirm 组件演示页面
 * 功能描述：演示批量删除确认组件的完整功能，包括基本删除和冲突处理
 * 创建日期：2024-01-10
 */
<template>
  <div class="demo-container">
    <div class="demo-header">
      <h1>BatchDeleteConfirm 组件演示</h1>
      <p>演示批量删除确认组件的完整功能：删除确认、冲突检测、冲突处理</p>
    </div>

    <div class="demo-section">
      <h2>功能演示</h2>
      
      <!-- 模拟数据表格 -->
      <div class="demo-table">
        <div class="table-header">
          <h3>示例数据列表</h3>
          <div class="table-actions">
            <el-button 
              type="danger" 
              :disabled="selectedItems.length === 0"
              @click="handleBasicDelete"
            >
              普通删除示例
            </el-button>
            <el-button 
              type="danger" 
              :disabled="selectedItems.length === 0"
              @click="handleConflictDelete"
            >
              冲突删除示例
            </el-button>
            <el-button @click="selectAll">全选</el-button>
            <el-button @click="clearSelection">清空选择</el-button>
          </div>
        </div>

        <el-table 
          :data="demoData" 
          @selection-change="handleSelectionChange"
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="code" label="编码" width="120" />
          <el-table-column prop="name" label="名称" min-width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'danger'">
                {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="inUse" label="使用状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.inUse ? 'warning' : 'info'">
                {{ scope.row.inUse ? '使用中' : '空闲' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="selection-info">
          <p>已选择：{{ selectedItems.length }} 项</p>
          <p v-if="selectedItems.length > 0">
            选中项目：{{ selectedItems.map(item => item.name).join(', ') }}
          </p>
        </div>
      </div>
    </div>

    <!-- 批量删除确认组件 -->
    <batch-delete-confirm
      ref="batchDeleteConfirm"
      :delete-api="mockDeleteApi"
      :conflict-detector="mockConflictDetector"
      :display-fields="{
        id: 'id',
        code: 'code',
        name: 'name'
      }"
      title="批量删除确认"
      action-name="删除"
      @delete-success="handleDeleteSuccess"
      @delete-error="handleDeleteError"
      @delete-cancel="handleDeleteCancel"
      @conflict-detected="handleConflictDetected"
    />

    <!-- 操作日志 -->
    <div class="demo-section">
      <h2>操作日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in operationLogs" :key="index" class="log-item">
          <span class="log-time">{{ log.time }}</span>
          <span :class="['log-type', log.type]">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <div v-if="operationLogs.length === 0" class="no-logs">
          暂无操作日志
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BatchDeleteConfirmDemo',
  data() {
    return {
      // 演示数据
      demoData: [
        { id: 1, code: 'PROC_001', name: '预热工序', status: 'enabled', inUse: false },
        { id: 2, code: 'PROC_002', name: '加热工序', status: 'enabled', inUse: true },
        { id: 3, code: 'PROC_003', name: '保温工序', status: 'enabled', inUse: false },
        { id: 4, code: 'PROC_004', name: '冷却工序', status: 'disabled', inUse: true },
        { id: 5, code: 'PROC_005', name: '淬火工序', status: 'enabled', inUse: false },
        { id: 6, code: 'PROC_006', name: '回火工序', status: 'enabled', inUse: true }
      ],
      // 选中的项目
      selectedItems: [],
      // 操作日志
      operationLogs: [],
      // 强制冲突模式（用于演示）
      forceConflict: false
    }
  },
  methods: {
    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
      this.addLog('INFO', `选择了 ${selection.length} 个项目`)
    },

    // 全选
    selectAll() {
      this.$refs.demoTable && this.$refs.demoTable.toggleAllSelection()
    },

    // 清空选择
    clearSelection() {
      this.$refs.demoTable && this.$refs.demoTable.clearSelection()
    },

    // 普通删除示例
    handleBasicDelete() {
      this.forceConflict = false
      this.addLog('INFO', '触发普通删除流程')
      this.$refs.batchDeleteConfirm.show(this.selectedItems)
    },

    // 冲突删除示例
    handleConflictDelete() {
      this.forceConflict = true
      this.addLog('INFO', '触发冲突删除流程')
      this.$refs.batchDeleteConfirm.show(this.selectedItems)
    },

    // 模拟删除API
    async mockDeleteApi(items) {
      this.addLog('INFO', `正在删除 ${items.length} 个项目...`)
      
      // 模拟API延迟
      await this.delay(1000)
      
      // 模拟删除成功
      const deletedIds = items.map(item => item.id)
      this.demoData = this.demoData.filter(item => !deletedIds.includes(item.id))
      
      this.addLog('SUCCESS', `成功删除 ${items.length} 个项目`)
      
      return {
        success: true,
        message: `成功删除 ${items.length} 个项目`
      }
    },

    // 模拟冲突检测
    async mockConflictDetector(items) {
      this.addLog('INFO', '正在检测删除冲突...')
      
      // 模拟检测延迟
      await this.delay(800)
      
      if (this.forceConflict || items.some(item => item.inUse)) {
        // 模拟冲突情况
        const conflicts = items.filter(item => item.inUse)
        const canDelete = items.filter(item => !item.inUse)
        
        this.addLog('WARNING', `检测到 ${conflicts.length} 个冲突项目`)
        
        return {
          hasConflicts: true,
          conflicts: conflicts.map(item => ({
            ...item,
            reason: '该工序正在使用中，无法删除'
          })),
          canDelete
        }
      } else {
        // 无冲突情况
        this.addLog('SUCCESS', '无删除冲突，可以安全删除')
        return {
          hasConflicts: false,
          conflicts: [],
          canDelete: items
        }
      }
    },

    // 删除成功处理
    handleDeleteSuccess(result) {
      this.addLog('SUCCESS', `删除操作成功：${result.message}`)
      this.clearSelection()
    },

    // 删除错误处理
    handleDeleteError(error) {
      this.addLog('ERROR', `删除操作失败：${error.message}`)
    },

    // 删除取消处理
    handleDeleteCancel() {
      this.addLog('INFO', '用户取消了删除操作')
    },

    // 冲突检测处理
    handleConflictDetected(conflictInfo) {
      this.addLog('WARNING', `检测到冲突：${conflictInfo.conflicts.length} 个项目无法删除`)
    },

    // 添加日志
    addLog(type, message) {
      const now = new Date()
      const time = now.toLocaleTimeString()
      this.operationLogs.unshift({
        time,
        type,
        message
      })
      
      // 限制日志数量
      if (this.operationLogs.length > 20) {
        this.operationLogs = this.operationLogs.slice(0, 20)
      }
    },

    // 延迟函数
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  },
  mounted() {
    this.addLog('INFO', '演示页面已加载')
  }
}
</script>

<style lang="scss" scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    color: #606266;
    font-size: 14px;
  }
}

.demo-section {
  margin-bottom: 30px;
  
  h2 {
    color: #303133;
    border-bottom: 2px solid #409eff;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
}

.demo-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    h3 {
      margin: 0;
      color: #303133;
    }
    
    .table-actions {
      .el-button {
        margin-left: 10px;
      }
    }
  }
  
  .selection-info {
    margin-top: 15px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    
    p {
      margin: 5px 0;
      font-size: 14px;
      color: #606266;
    }
  }
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #fafafa;
  
  .log-item {
    display: flex;
    align-items: center;
    padding: 8px 15px;
    border-bottom: 1px solid #ebeef5;
    font-size: 13px;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      width: 80px;
      color: #909399;
    }
    
    .log-type {
      width: 60px;
      font-weight: 500;
      margin-right: 10px;
      
      &.INFO {
        color: #409eff;
      }
      
      &.SUCCESS {
        color: #67c23a;
      }
      
      &.WARNING {
        color: #e6a23c;
      }
      
      &.ERROR {
        color: #f56c6c;
      }
    }
    
    .log-message {
      flex: 1;
      color: #303133;
    }
  }
  
  .no-logs {
    padding: 20px;
    text-align: center;
    color: #909399;
    font-size: 13px;
  }
}
</style> 