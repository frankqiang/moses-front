/**
 * RefreshButton 刷新按钮组件演示页面
 * 展示组件的各种功能和使用方式
 */
<template>
  <div class="refresh-button-demo">
    <div class="demo-header">
      <h1>RefreshButton 刷新按钮组件演示</h1>
      <p>展示刷新按钮组件的各种功能，包括基本用法、现代化特性、错误处理等。</p>
    </div>

    <!-- 基本用法 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>1. 基本用法</h2>
        <p>最简单的刷新按钮使用方式</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <h3>默认样式</h3>
          <refresh-button @refresh="handleBasicRefresh" />
          <p v-if="basicRefreshCount > 0" class="result-text">
            已刷新 {{ basicRefreshCount }} 次，最后刷新时间：{{ basicLastRefreshTime }}
          </p>
        </div>

        <div class="demo-item">
          <h3>不同尺寸</h3>
          <div class="button-group">
            <refresh-button size="large" text="大号刷新" @refresh="handleBasicRefresh" />
            <refresh-button size="medium" text="中号刷新" @refresh="handleBasicRefresh" />
            <refresh-button size="small" text="小号刷新" @refresh="handleBasicRefresh" />
            <refresh-button size="mini" text="迷你刷新" @refresh="handleBasicRefresh" />
          </div>
        </div>

        <div class="demo-item">
          <h3>不同类型</h3>
          <div class="button-group">
            <refresh-button type="primary" text="主要" @refresh="handleBasicRefresh" />
            <refresh-button type="success" text="成功" @refresh="handleBasicRefresh" />
            <refresh-button type="warning" text="警告" @refresh="handleBasicRefresh" />
            <refresh-button type="danger" text="危险" @refresh="handleBasicRefresh" />
            <refresh-button type="info" text="信息" @refresh="handleBasicRefresh" />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 现代化特性 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>2. 现代化特性</h2>
        <p>启用现代化特性后，支持防抖、错误重试、动画效果等高级功能</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <h3>现代化按钮（防抖保护）</h3>
          <div class="button-group">
            <refresh-button
              enable-modern-features
              text="现代化刷新"
              type="primary"
              :debounce-delay="500"
              @refresh="handleModernRefresh"
              @refresh-start="handleRefreshStart"
              @refresh-complete="handleRefreshComplete"
            />
            <refresh-button
              enable-modern-features
              text="快速防抖"
              type="success"
              :debounce-delay="200"
              @refresh="handleModernRefresh"
            />
          </div>
          <div v-if="modernRefreshEvents.length > 0" class="event-log">
            <h4>事件日志：</h4>
            <ul>
              <li v-for="(event, index) in modernRefreshEvents.slice(-5)" :key="index">
                {{ formatEventTime(event.time) }} - {{ event.message }}
              </li>
            </ul>
          </div>
        </div>

        <div class="demo-item">
          <h3>错误处理与重试</h3>
          <div class="button-group">
            <refresh-button
              ref="errorButton"
              enable-modern-features
              text="模拟错误"
              type="warning"
              :max-retries="3"
              :retry-delay="1000"
              @refresh="handleErrorRefresh"
              @refresh-error="handleRefreshError"
              @retry="handleRetry"
              @retry-exhausted="handleRetryExhausted"
            />
            <el-button @click="resetErrorButton">重置错误状态</el-button>
          </div>
          <div v-if="errorLog.length > 0" class="error-log">
            <h4>错误日志：</h4>
            <ul>
              <li v-for="(log, index) in errorLog.slice(-3)" :key="index" :class="log.type">
                {{ formatEventTime(log.time) }} - {{ log.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 样式变化 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>3. 样式变化</h2>
        <p>不同的按钮样式和形状</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <h3>朴素按钮</h3>
          <div class="button-group">
            <refresh-button plain text="朴素刷新" @refresh="handleBasicRefresh" />
            <refresh-button plain type="primary" text="朴素主要" @refresh="handleBasicRefresh" />
            <refresh-button plain type="success" text="朴素成功" @refresh="handleBasicRefresh" />
          </div>
        </div>

        <div class="demo-item">
          <h3>圆角和圆形按钮</h3>
          <div class="button-group">
            <refresh-button round text="圆角刷新" type="primary" @refresh="handleBasicRefresh" />
            <refresh-button circle type="primary" title="圆形刷新按钮" @refresh="handleBasicRefresh" />
            <refresh-button circle type="success" icon="el-icon-refresh-right" title="右旋转刷新" @refresh="handleBasicRefresh" />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 自动加载状态 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>4. 自动加载状态</h2>
        <p>点击后自动显示加载状态</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <h3>不同加载时长</h3>
          <div class="button-group">
            <refresh-button
              auto-loading
              :auto-loading-duration="800"
              text="短暂加载"
              @refresh="handleAutoLoadingRefresh"
            />
            <refresh-button
              auto-loading
              :auto-loading-duration="2000"
              text="较长加载"
              type="primary"
              @refresh="handleAutoLoadingRefresh"
            />
            <refresh-button
              auto-loading
              :auto-loading-duration="3000"
              text="长时间加载"
              type="success"
              @refresh="handleAutoLoadingRefresh"
            />
          </div>
        </div>

        <div class="demo-item">
          <h3>手动控制加载状态</h3>
          <div class="button-group">
            <refresh-button
              ref="manualLoadingButton"
              :loading="manualLoading"
              text="手动控制"
              type="warning"
              @refresh="handleManualLoadingRefresh"
            />
            <el-button @click="stopManualLoading">手动停止加载</el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 确认对话框 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>5. 确认对话框</h2>
        <p>刷新前显示确认对话框</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <h3>基本确认</h3>
          <div class="button-group">
            <refresh-button
              confirm-before-refresh
              text="需要确认"
              type="warning"
              @refresh="handleConfirmRefresh"
              @cancel="handleRefreshCancel"
            />
            <refresh-button
              confirm-before-refresh
              confirm-text="确定要重新加载所有数据吗？这可能需要一些时间。"
              confirm-title="重新加载确认"
              text="自定义确认"
              type="danger"
              @refresh="handleConfirmRefresh"
              @cancel="handleRefreshCancel"
            />
          </div>
          <p v-if="confirmResult" class="result-text">
            {{ confirmResult }}
          </p>
        </div>
      </div>
    </el-card>

    <!-- 禁用状态 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>6. 禁用状态</h2>
        <p>不同的禁用状态演示</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <h3>禁用控制</h3>
          <div class="button-group">
            <refresh-button
              :disabled="isDisabled"
              text="可禁用刷新"
              @refresh="handleBasicRefresh"
            />
            <el-button @click="isDisabled = !isDisabled">
              {{ isDisabled ? '启用' : '禁用' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 自定义样式 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>7. 自定义样式</h2>
        <p>使用自定义CSS类和现代化效果</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <h3>自定义样式</h3>
          <div class="button-group">
            <refresh-button
              enable-modern-features
              custom-class="gradient-button"
              text="渐变按钮"
              @refresh="handleBasicRefresh"
            />
            <refresh-button
              enable-modern-features
              custom-class="shadow-button"
              text="阴影按钮"
              type="primary"
              @refresh="handleBasicRefresh"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 与表格集成演示 -->
    <el-card class="demo-section">
      <div slot="header" class="section-header">
        <h2>8. 与表格集成演示</h2>
        <p>在实际表格场景中的使用</p>
      </div>

      <div class="demo-group">
        <div class="demo-item">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" icon="el-icon-plus" size="small">新增</el-button>
              <el-button type="success" icon="el-icon-download" size="small">导出</el-button>
            </div>
            <div class="toolbar-right">
              <refresh-button
                enable-modern-features
                size="small"
                auto-loading
                :auto-loading-duration="1500"
                @refresh="handleTableRefresh"
                @refresh-start="handleTableRefreshStart"
                @refresh-complete="handleTableRefreshComplete"
              />
            </div>
          </div>

          <el-table
            v-loading="tableLoading"
            :data="tableData"
            border
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称" />
            <el-table-column prop="status" label="状态" width="120">
              <template slot-scope="scope">
                <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
                  {{ scope.row.status === 'active' ? '活跃' : '非活跃' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间" width="180" />
          </el-table>

          <div v-if="tableRefreshLog.length > 0" class="table-log">
            <h4>表格刷新日志：</h4>
            <p>{{ tableRefreshLog[tableRefreshLog.length - 1] }}</p>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import RefreshButton from './index.vue'

export default {
  name: 'RefreshButtonDemo',
  components: {
    RefreshButton
  },
  data() {
    return {
      // 基本用法
      basicRefreshCount: 0,
      basicLastRefreshTime: '',

      // 现代化特性
      modernRefreshEvents: [],

      // 错误处理
      errorLog: [],
      errorRefreshCount: 0,

      // 确认对话框
      confirmResult: '',

      // 禁用状态
      isDisabled: false,

      // 手动加载状态
      manualLoading: false,

      // 表格演示
      tableLoading: false,
      tableRefreshLog: [],
      tableData: [
        { id: 1, name: '用户A', status: 'active', updateTime: '2024-01-15 10:30:00' },
        { id: 2, name: '用户B', status: 'inactive', updateTime: '2024-01-15 09:45:00' },
        { id: 3, name: '用户C', status: 'active', updateTime: '2024-01-15 11:20:00' },
        { id: 4, name: '用户D', status: 'active', updateTime: '2024-01-15 08:15:00' }
      ]
    }
  },
  methods: {
    // 基本刷新处理
    handleBasicRefresh() {
      this.basicRefreshCount++
      this.basicLastRefreshTime = new Date().toLocaleTimeString()
      this.$message.success(`第 ${this.basicRefreshCount} 次刷新完成`)
    },

    // 现代化刷新处理
    handleModernRefresh() {
      this.addModernEvent('触发现代化刷新')
      setTimeout(() => {
        this.$message.success('现代化刷新完成')
      }, 800)
    },

    // 刷新开始事件
    handleRefreshStart(eventData) {
      this.addModernEvent(`刷新开始，重试次数：${eventData.retryCount}`)
    },

    // 刷新完成事件
    handleRefreshComplete(eventData) {
      const duration = eventData.manual ? '手动停止' : `${eventData.duration}ms`
      this.addModernEvent(`刷新完成，耗时：${duration}`)
    },

    // 错误刷新处理（模拟错误）
    handleErrorRefresh() {
      this.errorRefreshCount++

      // 模拟有50%的概率发生错误
      if (Math.random() < 0.6) {
        this.addErrorLog('success', `模拟刷新成功 (第${this.errorRefreshCount}次)`)
        this.$message.success('刷新成功')
      } else {
        const error = new Error('模拟网络错误')
        this.handleRefreshError({ error, retryCount: 0, canRetry: true })
        throw error
      }
    },

    // 刷新错误处理
    handleRefreshError(errorData) {
      this.addErrorLog('error', `刷新失败：${errorData.error.message}，重试次数：${errorData.retryCount}`)
    },

    // 重试处理
    handleRetry(retryData) {
      this.addErrorLog('warning', `正在重试，第 ${retryData.retryCount} 次重试`)
    },

    // 重试耗尽处理
    handleRetryExhausted(data) {
      this.addErrorLog('error', `重试耗尽，最大重试次数：${data.maxRetries}`)
      this.$message.error('刷新失败，已达到最大重试次数')
    },

    // 重置错误按钮
    resetErrorButton() {
      this.$refs.errorButton.reset()
      this.errorRefreshCount = 0
      this.addErrorLog('info', '错误状态已重置')
    },

    // 自动加载刷新处理
    handleAutoLoadingRefresh() {
      this.$message.info('自动加载刷新中...')
    },

    // 手动加载刷新处理
    handleManualLoadingRefresh() {
      this.manualLoading = true
      this.$message.info('开始手动加载...')

      // 模拟异步操作
      setTimeout(() => {
        if (this.manualLoading) { // 检查是否已被手动停止
          this.manualLoading = false
          this.$message.success('手动加载完成')
        }
      }, 3000)
    },

    // 停止手动加载
    stopManualLoading() {
      this.manualLoading = false
      this.$refs.manualLoadingButton.stopLoading()
      this.$message.info('手动停止加载')
    },

    // 确认刷新处理
    handleConfirmRefresh() {
      this.confirmResult = `确认刷新完成，时间：${new Date().toLocaleTimeString()}`
      this.$message.success('确认刷新完成')
    },

    // 取消刷新处理
    handleRefreshCancel() {
      this.confirmResult = `用户取消刷新，时间：${new Date().toLocaleTimeString()}`
      this.$message.info('用户取消了刷新操作')
    },

    // 表格刷新处理
    handleTableRefresh() {
      // 模拟异步获取数据
      this.tableLoading = true
      setTimeout(() => {
        // 更新表格数据
        this.tableData = this.tableData.map(item => ({
          ...item,
          updateTime: new Date().toLocaleString()
        }))
        this.tableLoading = false
      }, 800)
    },

    // 表格刷新开始
    handleTableRefreshStart() {
      this.tableRefreshLog.push(`表格开始刷新 - ${new Date().toLocaleTimeString()}`)
    },

    // 表格刷新完成
    handleTableRefreshComplete() {
      this.tableRefreshLog.push(`表格刷新完成 - ${new Date().toLocaleTimeString()}`)
    },

    // 添加现代化事件
    addModernEvent(message) {
      this.modernRefreshEvents.push({
        time: new Date(),
        message
      })
    },

    // 添加错误日志
    addErrorLog(type, message) {
      this.errorLog.push({
        time: new Date(),
        type,
        message
      })
    },

    // 格式化事件时间
    formatEventTime(time) {
      return time.toLocaleTimeString()
    }
  }
}
</script>

<style scoped>
.refresh-button-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.demo-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.demo-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.demo-section {
  margin-bottom: 30px;
}

.section-header h2 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.section-header p {
  color: #7f8c8d;
  margin: 0;
}

.demo-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-item {
  padding: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fafafa;
}

.demo-item h3 {
  color: #2c3e50;
  margin: 0 0 15px 0;
  font-size: 16px;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.result-text {
  margin-top: 10px;
  color: #67c23a;
  font-weight: 500;
}

.event-log,
.error-log,
.table-log {
  margin-top: 15px;
  padding: 10px;
  background: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.event-log h4,
.error-log h4,
.table-log h4 {
  margin: 0 0 8px 0;
  color: #409eff;
  font-size: 14px;
}

.event-log ul,
.error-log ul {
  margin: 0;
  padding-left: 20px;
}

.event-log li,
.error-log li {
  font-size: 13px;
  line-height: 1.5;
}

.error-log .error {
  color: #f56c6c;
}

.error-log .warning {
  color: #e6a23c;
}

.error-log .success {
  color: #67c23a;
}

.error-log .info {
  color: #409eff;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 自定义按钮样式 */
.refresh-button-demo :deep(.gradient-button) {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.refresh-button-demo :deep(.gradient-button:hover) {
  background: linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
}

.refresh-button-demo :deep(.shadow-button) {
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.4);
}

.refresh-button-demo :deep(.shadow-button:hover) {
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .refresh-button-demo {
    padding: 10px;
  }

  .button-group {
    flex-direction: column;
    align-items: stretch;
  }

  .table-toolbar {
    flex-direction: column;
    gap: 10px;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
}
</style>
