<template>
  <div class="import-button-example">
    <div class="page-header">
      <h1>ImportButton 现代化特性示例</h1>
      <p>展示导入按钮组件的各种功能和最佳实践</p>
    </div>

    <div class="example-section">
      <h2>基础用法（兼容模式）</h2>
      <p>保持向后兼容，现有代码无需修改</p>
      <div class="example-content">
        <import-button
          :import-api="mockImportApi"
          :template-api="mockTemplateApi"
          dialog-title="基础导入示例"
          @import-success="handleImportSuccess"
          @import-error="handleImportError"
        />
      </div>
    </div>

    <div class="example-section">
      <h2>现代化特性展示 🚀</h2>
      <p>启用现代化特性，包括防抖保护、多文件支持、请求取消等</p>
      <div class="example-content">
        <div class="modern-controls">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="feature-card">
                <div slot="header">
                  <span>防抖保护</span>
                </div>
                <el-form size="mini">
                  <el-form-item label="延迟时间">
                    <el-input-number
                      v-model="modernConfig.debounceDelay"
                      :min="0"
                      :max="5000"
                      :step="100"
                    />
                    <span class="unit">ms</span>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="feature-card">
                <div slot="header">
                  <span>多文件支持</span>
                </div>
                <el-form size="mini">
                  <el-form-item>
                    <el-checkbox v-model="modernConfig.enableMultiple">
                      启用多文件
                    </el-checkbox>
                  </el-form-item>
                  <el-form-item label="最大数量">
                    <el-input-number
                      v-model="modernConfig.maxFileCount"
                      :min="1"
                      :max="20"
                      :disabled="!modernConfig.enableM  ultiple"
                    />
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>

            <el-col :span="8">
              <el-card class="feature-card">
                <div slot="header">
                  <span>文件限制</span>
                </div>
                <el-form size="mini">
                  <el-form-item label="最大大小">
                    <el-input-number
                      v-model="modernConfig.maxFileSize"
                      :min="1"
                      :max="1024"
                    />
                    <span class="unit">MB</span>
                  </el-form-item>
                  <el-form-item label="超时时间">
                    <el-input-number
                      v-model="modernConfig.timeout"
                      :min="10000"
                      :max="600000"
                      :step="10000"
                    />
                    <span class="unit">ms</span>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <div class="modern-demo">
          <import-button
            :import-api="modernImportApi"
            :template-api="mockTemplateApi"
            dialog-title="现代化导入示例"
            :enable-modern-features="true"
            :enable-multiple-files="modernConfig.enableMultiple"
            :max-file-count="modernConfig.maxFileCount"
            :max-file-size="modernConfig.maxFileSize"
            :debounce-delay="modernConfig.debounceDelay"
            :timeout="modernConfig.timeout"
            :show-file-name="true"
            accept-types=".xlsx,.xls,.csv"
            file-type-tip="支持Excel和CSV文件，单个文件不超过指定大小"
            @import-start="handleImportStart"
            @import-success="handleImportSuccess"
            @import-error="handleImportError"
            @import-complete="handleImportComplete"
          >
            <template #tips>
              <ol>
                <li>支持Excel（.xlsx, .xls）和CSV文件格式</li>
                <li v-if="modernConfig.enableMultiple">
                  支持同时选择最多{{ modernConfig.maxFileCount }}个文件进行批量导入
                </li>
                <li>单个文件最大{{ modernConfig.maxFileSize }}MB</li>
                <li>导入过程中显示上传进度，支持取消操作</li>
                <li>错误数据可导出为CSV文件便于分析</li>
                <li>所有操作都有{{ modernConfig.debounceDelay }}ms防抖保护</li>
              </ol>
            </template>
          </import-button>
        </div>
      </div>
    </div>

    <div class="example-section">
      <h2>错误处理演示</h2>
      <p>展示不同类型的错误处理和用户反馈</p>
      <div class="example-content">
        <el-row :gutter="15">
          <el-col :span="6">
            <import-button
              :import-api="networkErrorApi"
              text="网络错误"
              type="warning"
              dialog-title="网络错误测试"
              :enable-modern-features="true"
              @import-error="handleImportError"
            />
          </el-col>
          <el-col :span="6">
            <import-button
              :import-api="timeoutErrorApi"
              text="超时错误"
              type="danger"
              dialog-title="超时错误测试"
              :enable-modern-features="true"
              :timeout="3000"
              @import-error="handleImportError"
            />
          </el-col>
          <el-col :span="6">
            <import-button
              :import-api="serverErrorApi"
              text="服务器错误"
              type="info"
              dialog-title="服务器错误测试"
              :enable-modern-features="true"
              @import-error="handleImportError"
            />
          </el-col>
          <el-col :span="6">
            <import-button
              :import-api="partialSuccessApi"
              text="部分成功"
              type="success"
              dialog-title="部分成功测试"
              @import-success="handleImportSuccess"
            />
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="example-section">
      <h2>事件监听示例</h2>
      <p>实时显示组件触发的各种事件</p>
      <div class="example-content">
        <div class="event-monitor">
          <div class="event-list">
            <h4>事件日志</h4>
            <div v-for="(event, index) in eventLog" :key="index" class="event-item">
              <span class="event-time">{{ event.time }}</span>
              <span class="event-type" :class="event.type">{{ event.type }}</span>
              <span class="event-message">{{ event.message }}</span>
            </div>
            <div v-if="eventLog.length === 0" class="no-events">
              暂无事件，请执行导入操作...
            </div>
          </div>
          <div class="event-controls">
            <el-button size="small" @click="clearEventLog">清空日志</el-button>
            <el-button size="small" type="primary" @click="exportEventLog">导出日志</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="example-section">
      <h2>配置对比表</h2>
      <p>兼容模式 vs 现代化模式功能对比</p>
      <div class="example-content">
        <el-table :data="featureComparison" border stripe>
          <el-table-column prop="feature" label="功能特性" width="200" />
          <el-table-column prop="compatible" label="兼容模式" width="120" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.compatible ? 'success' : 'info'" size="mini">
                {{ row.compatible ? '支持' : '不支持' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="modern" label="现代化模式" width="120" align="center">
            <template slot-scope="{ row }">
              <el-tag :type="row.modern ? 'success' : 'info'" size="mini">
                {{ row.modern ? '支持' : '不支持' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import ImportButton from './index.vue'

export default {
  name: 'ImportButtonExample',
  components: {
    ImportButton
  },
  data() {
    return {
      modernConfig: {
        enableMultiple: false,
        maxFileCount: 5,
        maxFileSize: 10,
        debounceDelay: 500,
        timeout: 60000
      },
      eventLog: [],
      featureComparison: [
        { feature: '基础导入功能', compatible: true, modern: true, description: '支持单文件上传和基础验证' },
        { feature: '模板下载', compatible: true, modern: true, description: '下载Excel模板文件' },
        { feature: '防抖保护', compatible: false, modern: true, description: '防止用户快速重复点击' },
        { feature: '多文件上传', compatible: false, modern: true, description: '支持批量文件导入' },
        { feature: '上传进度显示', compatible: false, modern: true, description: '实时显示文件上传进度' },
        { feature: '请求取消', compatible: false, modern: true, description: '支持取消进行中的导入操作' },
        { feature: '增强文件验证', compatible: false, modern: true, description: '文件内容和名称验证' },
        { feature: '错误数据导出', compatible: false, modern: true, description: '失败数据导出为CSV文件' },
        { feature: '分页错误列表', compatible: false, modern: true, description: '大量错误支持分页显示' },
        { feature: '内存管理', compatible: false, modern: true, description: '自动清理URL对象防止泄漏' }
      ]
    }
  },
  methods: {
    // 基础Mock API
    async mockImportApi(formData) {
      await this.delay(2000)
      return {
        data: {
          total: 100,
          success: 95,
          fail: 5,
          errors: [
            { row: 5, message: '产品编码重复' },
            { row: 12, message: '价格格式错误' },
            { row: 33, message: '必填字段为空' },
            { row: 67, message: '分类不存在' },
            { row: 89, message: '规格格式不正确' }
          ]
        }
      }
    },

    // 现代化Mock API（支持AbortController）
    async modernImportApi(formData, options = {}) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve({
            data: {
              total: this.modernConfig.enableMultiple ? 250 : 150,
              success: this.modernConfig.enableMultiple ? 235 : 142,
              fail: this.modernConfig.enableMultiple ? 15 : 8,
              errors: this.generateMockErrors(this.modernConfig.enableMultiple ? 15 : 8)
            }
          })
        }, 3000)

        // 支持请求取消
        if (options.signal) {
          options.signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('AbortError'))
          })
        }

        // 模拟上传进度
        if (options.onUploadProgress) {
          let progress = 0
          const progressTimer = setInterval(() => {
            progress += Math.random() * 20
            if (progress >= 100) {
              progress = 100
              clearInterval(progressTimer)
            }
            options.onUploadProgress({ loaded: progress, total: 100 })
          }, 200)

          if (options.signal) {
            options.signal.addEventListener('abort', () => {
              clearInterval(progressTimer)
            })
          }
        }
      })
    },

    // 模板下载API
    async mockTemplateApi() {
      await this.delay(1000)
      return { data: 'mock-template-download-success' }
    },

    // 错误模拟API
    async networkErrorApi() {
      await this.delay(1000)
      const error = new Error('网络连接失败')
      error.code = 'NETWORK_ERROR'
      error.retryable = true
      throw error
    },

    async timeoutErrorApi() {
      await this.delay(5000)
      const error = new Error('请求超时')
      error.code = 'TIMEOUT'
      error.retryable = true
      throw error
    },

    async serverErrorApi() {
      await this.delay(1500)
      const error = new Error('服务器内部错误')
      error.response = { status: 500, data: { message: '服务器繁忙，请稍后重试' }}
      error.retryable = true
      throw error
    },

    async partialSuccessApi() {
      await this.delay(2000)
      return {
        data: {
          total: 200,
          success: 150,
          fail: 50,
          errors: this.generateMockErrors(50)
        }
      }
    },

    // 生成模拟错误数据
    generateMockErrors(count) {
      const errorTypes = [
        '产品编码重复',
        '价格格式错误',
        '必填字段为空',
        '分类不存在',
        '规格格式不正确',
        '供应商编码无效',
        '库存数量必须为正数',
        '有效期格式错误',
        '单位不匹配',
        '描述过长'
      ]

      const fileNames = ['products_1.xlsx', 'products_2.xlsx', 'categories.xlsx']

      return Array.from({ length: count }, (_, index) => ({
        row: Math.floor(Math.random() * 1000) + 1,
        message: errorTypes[Math.floor(Math.random() * errorTypes.length)],
        fileName: this.modernConfig.enableMultiple
          ? fileNames[Math.floor(Math.random() * fileNames.length)]
          : undefined
      }))
    },

    // 事件处理
    handleImportStart(files) {
      this.addEventLog('import-start', `开始导入 ${files.length} 个文件`)
    },

    handleImportSuccess(result) {
      this.addEventLog('import-success', `导入完成：成功${result.success}条，失败${result.fail}条`)
    },

    handleImportError(error) {
      this.addEventLog('import-error', `导入失败：${error.message || '未知错误'}`)
    },

    handleImportComplete() {
      this.addEventLog('import-complete', '导入操作完成')
    },

    // 事件日志管理
    addEventLog(type, message) {
      this.eventLog.unshift({
        time: new Date().toLocaleTimeString(),
        type,
        message
      })

      // 限制日志数量
      if (this.eventLog.length > 50) {
        this.eventLog = this.eventLog.slice(0, 50)
      }
    },

    clearEventLog() {
      this.eventLog = []
    },

    exportEventLog() {
      const content = this.eventLog.map(event =>
        `${event.time}\t${event.type}\t${event.message}`
      ).join('\n')

      const blob = new Blob([`时间\t事件类型\t消息\n${content}`], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `import-events-${new Date().toISOString().slice(0, 10)}.txt`
      link.click()
      URL.revokeObjectURL(url)
    },

    // 工具函数
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style lang="scss" scoped>
.import-button-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

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
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    h2 {
      color: #303133;
      margin-bottom: 10px;
      border-bottom: 2px solid #409EFF;
      padding-bottom: 10px;
    }

    p {
      color: #606266;
      margin-bottom: 20px;
    }

    .example-content {
      .modern-controls {
        margin-bottom: 20px;

        .feature-card {
          margin-bottom: 15px;

          .el-card__header {
            padding: 10px 20px;
            font-weight: bold;
            color: #303133;
          }

          .unit {
            margin-left: 5px;
            color: #909399;
            font-size: 12px;
          }
        }
      }

      .modern-demo {
        text-align: center;
        padding: 20px;
        background: #f5f7fa;
        border-radius: 6px;
      }

      .event-monitor {
        border: 1px solid #dcdfe6;
        border-radius: 6px;
        overflow: hidden;

        .event-list {
          max-height: 300px;
          overflow-y: auto;
          background: #f9f9f9;

          h4 {
            margin: 0;
            padding: 15px 20px;
            background: #409EFF;
            color: white;
            font-size: 14px;
          }

          .event-item {
            padding: 10px 20px;
            border-bottom: 1px solid #ebeef5;
            display: flex;
            align-items: center;
            font-size: 13px;

            &:hover {
              background: #ecf5ff;
            }

            .event-time {
              width: 80px;
              color: #909399;
              font-family: monospace;
            }

            .event-type {
              width: 120px;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
              text-align: center;
              margin: 0 10px;

              &.import-start {
                background: #e1f3d8;
                color: #67c23a;
              }

              &.import-success {
                background: #e1f3d8;
                color: #67c23a;
              }

              &.import-error {
                background: #fde2e2;
                color: #f56c6c;
              }

              &.import-complete {
                background: #e6f7ff;
                color: #409eff;
              }
            }

            .event-message {
              flex: 1;
              color: #303133;
            }
          }

          .no-events {
            padding: 40px 20px;
            text-align: center;
            color: #909399;
            font-style: italic;
          }
        }

        .event-controls {
          padding: 15px 20px;
          background: white;
          border-top: 1px solid #ebeef5;
          text-align: right;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .import-button-example {
    padding: 10px;

    .modern-controls {
      .el-col {
        margin-bottom: 15px;
      }
    }

    .event-item {
      .event-time {
        display: none;
      }

      .event-type {
        width: 100px;
        margin: 0 5px;
      }
    }
  }
}
</style>
