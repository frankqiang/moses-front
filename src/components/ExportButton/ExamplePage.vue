<template>
  <div class="export-button-example">
    <div class="page-header">
      <h1>ExportButton 现代化特性示例</h1>
      <p>展示导出按钮组件的各种功能和最佳实践</p>
    </div>

    <div class="example-section">
      <h2>基础用法（兼容模式）</h2>
      <p>保持向后兼容，现有代码无需修改</p>
      <div class="example-content">
        <export-button
          :export-api="mockExportApi"
          :params="{ type: 'basic' }"
          filename="基础导出数据"
        />
      </div>
    </div>

    <div class="example-section">
      <h2>现代化特性展示 🚀</h2>
      <p>启用现代化特性，包括防抖保护、智能重试、内存管理等</p>
      <div class="example-content">
        <div class="modern-controls">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="feature-card">
                <div slot="header">
                  <span>防抖保护</span>
                </div>
                <export-button
                  :export-api="mockExportApi"
                  :params="{ type: 'debounce-test' }"
                  filename="防抖测试"
                  text="快速点击我"
                  :enable-modern-features="true"
                  :debounce-delay="debounceDelay"
                  @export-start="onExportStart"
                  @export-success="onExportSuccess"
                />
                <div class="control-item">
                  <label>防抖延迟：{{ debounceDelay }}ms</label>
                  <el-slider
                    v-model="debounceDelay"
                    :min="100"
                    :max="2000"
                    :step="100"
                    show-stops
                  />
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="feature-card">
                <div slot="header">
                  <span>可取消导出</span>
                </div>
                <div class="cancel-demo">
                  <export-button
                    ref="cancellableExport"
                    :export-api="longRunningExportApi"
                    :params="{ type: 'long-running' }"
                    filename="长时间导出"
                    text="开始长时间导出"
                    :enable-modern-features="true"
                    :timeout="30000"
                    @export-start="longExportStarted = true"
                    @export-complete="longExportStarted = false"
                    @export-error="onExportError"
                  />
                  
                  <el-button 
                    v-if="longExportStarted" 
                    type="danger" 
                    size="small"
                    @click="cancelExport"
                  >
                    取消导出
                  </el-button>
                </div>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="feature-card">
                <div slot="header">
                  <span>智能重试</span>
                </div>
                <export-button
                  :export-api="errorProneExportApi"
                  :params="{ type: 'error-test' }"
                  filename="错误测试"
                  text="模拟错误"
                  :enable-modern-features="true"
                  @export-error="onExportError"
                />
                <div class="error-info">
                  <p><small>会模拟各种错误类型并提供重试选项</small></p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>

    <div class="example-section">
      <h2>不同文件类型和样式</h2>
      <div class="example-content">
        <el-row :gutter="20">
          <el-col :span="6">
            <export-button
              :export-api="mockExportApi"
              :params="{ type: 'xlsx' }"
              filename="Excel报表"
              file-type="xlsx"
              type="success"
              icon="el-icon-s-grid"
              :enable-modern-features="true"
            />
          </el-col>
          <el-col :span="6">
            <export-button
              :export-api="mockExportApi"
              :params="{ type: 'csv' }"
              filename="CSV数据"
              file-type="csv"
              type="warning"
              icon="el-icon-document"
              :enable-modern-features="true"
            />
          </el-col>
          <el-col :span="6">
            <export-button
              :export-api="mockExportApi"
              :params="{ type: 'pdf' }"
              filename="PDF报告"
              file-type="pdf"
              type="danger"
              icon="el-icon-document-copy"
              :enable-modern-features="true"
            />
          </el-col>
          <el-col :span="6">
            <export-button
              :export-api="mockExportApi"
              :params="{ type: 'custom' }"
              filename="自定义导出"
              text="自定义"
              type="info"
              size="mini"
              :need-confirm="false"
              :enable-modern-features="true"
            />
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="example-section">
      <h2>性能优化配置</h2>
      <div class="example-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <div slot="header">
                <span>大文件导出（长超时）</span>
              </div>
              <export-button
                :export-api="mockExportApi"
                :params="{ type: 'large-file', size: 'large' }"
                filename="大型数据报表"
                :timeout="300000"
                :debounce-delay="1000"
                :enable-modern-features="true"
                @export-start="onExportStart"
                @export-success="onExportSuccess"
              />
              <p><small>超时时间：5分钟，防抖：1秒</small></p>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <div slot="header">
                <span>快速导出（短防抖）</span>
              </div>
              <export-button
                :export-api="mockExportApi"
                :params="{ type: 'quick-export' }"
                filename="快速数据"
                :timeout="10000"
                :debounce-delay="200"
                :enable-modern-features="true"
                @export-start="onExportStart"
                @export-success="onExportSuccess"
              />
              <p><small>超时时间：10秒，防抖：200ms</small></p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="example-section">
      <h2>事件监听和状态管理</h2>
      <div class="example-content">
        <div class="event-demo">
          <export-button
            :export-api="mockExportApi"
            :params="{ type: 'event-demo' }"
            filename="事件演示"
            :enable-modern-features="true"
            @export-start="onExportStart"
            @export-success="onExportSuccess"
            @export-error="onExportError"
            @export-complete="onExportComplete"
            @cancel="onExportCancel"
          />
          
          <div class="event-log">
            <h4>事件日志</h4>
            <div class="log-container">
              <div v-for="(log, index) in eventLogs" :key="index" class="log-item">
                <span class="log-time">{{ log.time }}</span>
                <span :class="['log-type', `log-${log.type}`]">{{ log.type }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
            <el-button size="mini" @click="clearLogs">清空日志</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="example-section">
      <h2>Props验证演示</h2>
      <div class="example-content">
        <p>组件提供严格的Props验证，以下是一些验证示例：</p>
        <div class="validation-demo">
          <el-button @click="testValidation">测试Props验证</el-button>
          <div v-if="validationResults.length" class="validation-results">
            <h4>验证结果</h4>
            <ul>
              <li v-for="(result, index) in validationResults" :key="index">
                {{ result }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h3>组件使用统计</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ exportCount }}</div>
            <div class="stat-label">导出次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ successCount }}</div>
            <div class="stat-label">成功次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ errorCount }}</div>
            <div class="stat-label">错误次数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-number">{{ cancelCount }}</div>
            <div class="stat-label">取消次数</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import ExportButton from './index.vue'

export default {
  name: 'ExportButtonExample',
  components: {
    ExportButton
  },
  data() {
    return {
      // 控制参数
      debounceDelay: 500,
      longExportStarted: false,
      
      // 统计数据
      exportCount: 0,
      successCount: 0,
      errorCount: 0,
      cancelCount: 0,
      
      // 事件日志
      eventLogs: [],
      
      // 验证结果
      validationResults: []
    }
  },
  methods: {
    // Mock导出API - 基础版本
    async mockExportApi(params) {
      console.log('Mock导出API调用:', params)
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        data: 'export-success',
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }
    },
    
    // Mock长时间运行的导出API
    async longRunningExportApi(params) {
      console.log('长时间运行导出API:', params)
      
      // 模拟长时间操作
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`导出进度: ${(i + 1) * 10}%`)
      }
      
      return {
        data: 'export-success',
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      }
    },
    
    // Mock容易出错的导出API
    async errorProneExportApi(params) {
      console.log('错误测试API:', params)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 随机产生不同类型的错误
      const errorTypes = [
        { name: 'NetworkError', code: 'NETWORK_ERROR', message: '网络连接失败' },
        { name: 'TimeoutError', message: 'Export timeout' },
        { response: { status: 500, data: { message: '服务器内部错误' } } },
        { response: { status: 403, data: { message: '没有导出权限' } } },
        { response: { status: 404, data: { message: '导出接口不存在' } } }
      ]
      
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
      throw randomError
    },
    
    // 事件处理方法
    onExportStart(params) {
      this.exportCount++
      this.addLog('start', `开始导出，参数: ${JSON.stringify(params)}`)
    },
    
    onExportSuccess({ filename, size, isMock }) {
      this.successCount++
      let message = `导出成功: ${filename}`
      if (size) {
        message += `, 大小: ${this.formatFileSize(size)}`
      }
      if (isMock) {
        message += ' (Mock环境)'
      }
      this.addLog('success', message)
    },
    
    onExportError(error) {
      this.errorCount++
      this.addLog('error', `导出失败: ${error.message || error}`)
    },
    
    onExportComplete() {
      this.addLog('complete', '导出操作完成')
    },
    
    onExportCancel() {
      this.cancelCount++
      this.addLog('cancel', '用户取消导出')
    },
    
    // 取消导出
    cancelExport() {
      this.$refs.cancellableExport.cancelExport()
    },
    
    // 添加日志
    addLog(type, message) {
      const time = new Date().toLocaleTimeString()
      this.eventLogs.unshift({ time, type, message })
      
      // 只保留最近20条日志
      if (this.eventLogs.length > 20) {
        this.eventLogs = this.eventLogs.slice(0, 20)
      }
    },
    
    // 清空日志
    clearLogs() {
      this.eventLogs = []
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },
    
    // 测试Props验证
    testValidation() {
      this.validationResults = []
      
      // 模拟一些验证场景
      const testCases = [
        { prop: 'filename', value: 'test<file>', expected: '包含非法字符，验证失败' },
        { prop: 'fileType', value: 'unknown', expected: '不支持的文件类型，显示警告' },
        { prop: 'debounceDelay', value: 6000, expected: '超出范围(0-5000)，验证失败' },
        { prop: 'timeout', value: 400000, expected: '超出范围(1-300000)，验证失败' },
        { prop: 'type', value: 'invalid', expected: '无效的按钮类型，验证失败' }
      ]
      
      testCases.forEach(testCase => {
        this.validationResults.push(
          `${testCase.prop}: "${testCase.value}" - ${testCase.expected}`
        )
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.export-button-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    color: #606266;
    font-size: 16px;
  }
}

.example-section {
  margin-bottom: 40px;
  
  h2 {
    color: #409EFF;
    margin-bottom: 15px;
    border-bottom: 2px solid #409EFF;
    padding-bottom: 10px;
  }
  
  p {
    color: #606266;
    margin-bottom: 20px;
  }
}

.example-content {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.feature-card {
  height: 280px;
  
  .control-item {
    margin-top: 15px;
    
    label {
      display: block;
      color: #606266;
      font-size: 14px;
      margin-bottom: 8px;
    }
  }
}

.cancel-demo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.error-info {
  margin-top: 10px;
  color: #909399;
}

.event-demo {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.event-log {
  flex: 1;
  max-width: 400px;
  
  h4 {
    margin-bottom: 10px;
    color: #303133;
  }
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  background: white;
  margin-bottom: 10px;
}

.log-item {
  display: flex;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 12px;
  align-items: center;
}

.log-time {
  color: #909399;
  min-width: 80px;
}

.log-type {
  min-width: 60px;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  text-align: center;
  
  &.log-start {
    background: #e1f3d8;
    color: #67c23a;
  }
  
  &.log-success {
    background: #e1f3d8;
    color: #67c23a;
  }
  
  &.log-error {
    background: #fde2e2;
    color: #f56c6c;
  }
  
  &.log-complete {
    background: #e6f7ff;
    color: #409EFF;
  }
  
  &.log-cancel {
    background: #f5f7fa;
    color: #909399;
  }
}

.log-message {
  color: #303133;
  flex: 1;
}

.validation-demo {
  margin-top: 15px;
}

.validation-results {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  
  h4 {
    margin-bottom: 10px;
    color: #303133;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 5px;
      color: #606266;
      font-size: 14px;
    }
  }
}

.stats-section {
  margin-top: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  
  h3 {
    text-align: center;
    margin-bottom: 20px;
  }
}

.stat-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  
  .stat-number {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 14px;
    opacity: 0.8;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .export-button-example {
    padding: 10px;
  }
  
  .event-demo {
    flex-direction: column;
  }
  
  .feature-card {
    height: auto;
    margin-bottom: 20px;
  }
}
</style> 