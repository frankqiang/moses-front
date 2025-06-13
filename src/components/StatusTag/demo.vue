/**
 * StatusTag 状态标签组件演示页面
 * 功能描述：展示StatusTag组件的各种功能和使用方法，包括现代化优化功能
 * 创建日期：2024-12-19
 */
<template>
  <div class="status-tag-demo">
    <!-- 页面标题 -->
    <div class="demo-header">
      <h1>StatusTag 状态标签组件演示</h1>
      <p>灵活的状态标签组件，支持自定义文本、类型、颜色和图标映射，包含现代化优化功能</p>
    </div>

    <!-- 基础用法示例 -->
    <div class="demo-section">
      <h2>1. 基础用法</h2>
      <div class="demo-description">
        <p>最基本的状态标签功能，支持文本和类型映射。</p>
      </div>

      <div class="demo-content">
        <div class="tag-group">
          <h3>启用/禁用状态</h3>
          <div class="tag-row">
            <StatusTag
              :status="1"
              :text-map="{ 0: '禁用', 1: '启用' }"
              :type-map="{ 0: 'info', 1: 'success' }"
              :icon-map="{ 0: 'el-icon-circle-close', 1: 'el-icon-circle-check' }"
            />
            <StatusTag
              :status="0"
              :text-map="{ 0: '禁用', 1: '启用' }"
              :type-map="{ 0: 'info', 1: 'success' }"
              :icon-map="{ 0: 'el-icon-circle-close', 1: 'el-icon-circle-check' }"
            />
          </div>
        </div>

        <div class="tag-group">
          <h3>布尔值状态</h3>
          <div class="tag-row">
            <StatusTag
              :status="true"
              :text-map="{ false: '关闭', true: '开启' }"
              :type-map="{ false: 'danger', true: 'success' }"
            />
            <StatusTag
              :status="false"
              :text-map="{ false: '关闭', true: '开启' }"
              :type-map="{ false: 'danger', true: 'success' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 预设配置示例 -->
    <div class="demo-section">
      <h2>2. 预设配置</h2>
      <div class="demo-description">
        <p>使用预定义的状态映射配置，覆盖常见业务场景。</p>
        <el-button size="small" @click="switchPresetDemo">切换演示数据</el-button>
      </div>

      <div class="demo-content">
        <div class="tag-group">
          <h3>产品生命周期</h3>
          <div class="tag-row">
            <StatusTag
              v-for="status in ['draft', 'trial', 'production', 'discontinued', 'obsolete']"
              :key="status"
              :status="status"
              :text-map="productLifecycleMap.textMap"
              :type-map="productLifecycleMap.typeMap"
              :icon-map="productLifecycleMap.iconMap"
            />
          </div>
        </div>

        <div class="tag-group">
          <h3>审核状态</h3>
          <div class="tag-row">
            <StatusTag
              v-for="status in ['pending', 'reviewing', 'approved', 'rejected', 'cancelled']"
              :key="status"
              :status="status"
              :text-map="auditStatusMap.textMap"
              :type-map="auditStatusMap.typeMap"
              :icon-map="auditStatusMap.iconMap"
            />
          </div>
        </div>

        <div class="tag-group">
          <h3>优先级</h3>
          <div class="tag-row">
            <StatusTag
              v-for="status in ['low', 'medium', 'high', 'urgent', 'critical']"
              :key="status"
              :status="status"
              :text-map="priorityMap.textMap"
              :type-map="priorityMap.typeMap"
              :icon-map="priorityMap.iconMap"
              :color-map="priorityMap.colorMap"
            />
          </div>
        </div>

        <div class="tag-group">
          <h3>设备状态</h3>
          <div class="tag-row">
            <StatusTag
              v-for="status in ['online', 'offline', 'maintenance', 'error', 'standby']"
              :key="status"
              :status="status"
              :text-map="deviceStatusMap.textMap"
              :type-map="deviceStatusMap.typeMap"
              :icon-map="deviceStatusMap.iconMap"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 现代化特性示例 -->
    <div class="demo-section">
      <h2>3. 现代化特性</h2>
      <div class="demo-description">
        <p>启用现代化特性，包括防抖点击、错误处理、点击交互等。</p>
        <div class="control-panel">
          <el-switch
            v-model="enableModernFeatures"
            active-text="启用现代化特性"
            inactive-text="传统模式"
          />
          <el-input-number
            v-model="clickDebounceDelay"
            :min="100"
            :max="2000"
            :step="100"
            size="small"
            style="margin-left: 20px;"
          />
          <span style="margin-left: 10px;">ms 防抖延迟</span>
        </div>
      </div>

      <div class="demo-content">
        <div class="tag-group">
          <h3>可点击标签</h3>
          <div class="tag-row">
            <StatusTag
              :status="'success'"
              :text-map="{ 'success': '点击我' }"
              :type-map="{ 'success': 'success' }"
              :icon-map="{ 'success': 'el-icon-mouse' }"
              :enable-modern-features="enableModernFeatures"
              :click-debounce-delay="clickDebounceDelay"
              :clickable="true"
              @click="handleTagClick"
            />
            <StatusTag
              :status="'warning'"
              :text-map="{ 'warning': '防抖测试' }"
              :type-map="{ 'warning': 'warning' }"
              :enable-modern-features="enableModernFeatures"
              :click-debounce-delay="clickDebounceDelay"
              :clickable="true"
              @click="handleTagClick"
            />
            <StatusTag
              :status="'error'"
              :text-map="{ 'error': '模拟错误' }"
              :type-map="{ 'error': 'danger' }"
              :enable-modern-features="enableModernFeatures"
              :clickable="true"
              @click="handleErrorSimulation"
              @error="handleTagError"
            />
          </div>

          <div v-if="clickEvents.length > 0" class="event-log">
            <h4>点击事件日志:</h4>
            <ul>
              <li v-for="(event, index) in clickEvents.slice(-5)" :key="index">
                {{ formatEventTime(event.timestamp) }} - 点击了 "{{ event.displayText }}" (点击次数: {{ event.clickCount }})
              </li>
            </ul>
            <el-button size="mini" @click="clearClickEvents">清空日志</el-button>
          </div>
        </div>

        <div class="tag-group">
          <h3>可关闭标签</h3>
          <div class="tag-row">
            <StatusTag
              v-for="(tag, index) in closableTags"
              :key="tag.id"
              :status="tag.status"
              :text-map="tag.textMap"
              :type-map="tag.typeMap"
              :closable="true"
              @close="handleTagClose(index)"
            />
          </div>
          <el-button size="small" @click="resetClosableTags">重置标签</el-button>
        </div>
      </div>
    </div>

    <!-- 自定义样式示例 -->
    <div class="demo-section">
      <h2>4. 自定义样式</h2>
      <div class="demo-description">
        <p>演示不同尺寸、效果和自定义颜色的标签。</p>
      </div>

      <div class="demo-content">
        <div class="tag-group">
          <h3>不同尺寸</h3>
          <div class="tag-row">
            <StatusTag
              :status="'large'"
              :text-map="{ 'large': '大尺寸' }"
              :type-map="{ 'large': 'primary' }"
              size="medium"
            />
            <StatusTag
              :status="'small'"
              :text-map="{ 'small': '小尺寸' }"
              :type-map="{ 'small': 'primary' }"
              size="small"
            />
            <StatusTag
              :status="'mini'"
              :text-map="{ 'mini': '迷你' }"
              :type-map="{ 'mini': 'primary' }"
              size="mini"
            />
          </div>
        </div>

        <div class="tag-group">
          <h3>不同效果</h3>
          <div class="tag-row">
            <StatusTag
              :status="'dark'"
              :text-map="{ 'dark': '深色效果' }"
              :type-map="{ 'dark': 'primary' }"
              effect="dark"
            />
            <StatusTag
              :status="'light'"
              :text-map="{ 'light': '浅色效果' }"
              :type-map="{ 'light': 'primary' }"
              effect="light"
            />
            <StatusTag
              :status="'plain'"
              :text-map="{ 'plain': '朴素效果' }"
              :type-map="{ 'plain': 'primary' }"
              effect="plain"
            />
          </div>
        </div>

        <div class="tag-group">
          <h3>自定义颜色</h3>
          <div class="tag-row">
            <StatusTag
              :status="'purple'"
              :text-map="{ 'purple': '紫色' }"
              :color-map="{ 'purple': '#722ed1' }"
            />
            <StatusTag
              :status="'orange'"
              :text-map="{ 'orange': '橙色' }"
              :color-map="{ 'orange': '#fa8c16' }"
            />
            <StatusTag
              :status="'cyan'"
              :text-map="{ 'cyan': '青色' }"
              :color-map="{ 'cyan': '#13c2c2' }"
            />
            <StatusTag
              :status="'pink'"
              :text-map="{ 'pink': '粉色' }"
              :color-map="{ 'pink': '#eb2f96' }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 实际应用示例 -->
    <div class="demo-section">
      <h2>5. 实际应用示例</h2>
      <div class="demo-description">
        <p>在表格中使用 StatusTag 组件显示各种状态信息。</p>
      </div>

      <div class="demo-content">
        <el-table :data="tableExampleData" border stripe>
          <el-table-column prop="name" label="设备名称" width="120" />
          <el-table-column prop="model" label="型号" width="100" />
          <el-table-column prop="status" label="运行状态" width="120">
            <template slot-scope="scope">
              <StatusTag
                :status="scope.row.status"
                :text-map="deviceStatusMap.textMap"
                :type-map="deviceStatusMap.typeMap"
                :icon-map="deviceStatusMap.iconMap"
              />
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="120">
            <template slot-scope="scope">
              <StatusTag
                :status="scope.row.priority"
                :text-map="priorityMap.textMap"
                :type-map="priorityMap.typeMap"
                :icon-map="priorityMap.iconMap"
                :color-map="priorityMap.colorMap"
                size="mini"
              />
            </template>
          </el-table-column>
          <el-table-column prop="syncStatus" label="同步状态" width="120">
            <template slot-scope="scope">
              <StatusTag
                :status="scope.row.syncStatus"
                :text-map="syncStatusMap.textMap"
                :type-map="syncStatusMap.typeMap"
                :icon-map="syncStatusMap.iconMap"
                size="mini"
              />
            </template>
          </el-table-column>
          <el-table-column prop="lastUpdate" label="最后更新" />
        </el-table>
      </div>
    </div>

    <!-- 性能测试示例 -->
    <div class="demo-section">
      <h2>6. 性能测试</h2>
      <div class="demo-description">
        <p>测试大量标签的渲染性能。</p>
        <div class="control-panel">
          <el-input-number
            v-model="performanceTestCount"
            :min="100"
            :max="5000"
            :step="100"
            size="small"
          />
          <span style="margin: 0 10px;">个标签</span>
          <el-button size="small" :loading="performanceTesting" @click="runPerformanceTest">
            {{ performanceTesting ? '测试中...' : '开始性能测试' }}
          </el-button>
          <span v-if="performanceResult" style="margin-left: 20px; color: #67c23a;">
            渲染耗时: {{ performanceResult }}ms
          </span>
        </div>
      </div>

      <div v-if="performanceTestTags.length > 0" class="demo-content">
        <div class="performance-test-container">
          <StatusTag
            v-for="(tag, index) in performanceTestTags"
            :key="index"
            :status="tag.status"
            :text-map="tag.textMap"
            :type-map="tag.typeMap"
            :icon-map="tag.iconMap"
            size="mini"
          />
        </div>
      </div>
    </div>

    <!-- 错误处理示例 -->
    <div class="demo-section">
      <h2>7. 错误处理</h2>
      <div class="demo-description">
        <p>演示组件的错误边界处理能力。</p>
      </div>

      <div class="demo-content">
        <div class="tag-group">
          <h3>错误场景测试</h3>
          <div class="tag-row">
            <StatusTag
              :status="null"
              default-text="空值处理"
              default-type="info"
            />
            <StatusTag
              :status="undefined"
              default-text="未定义处理"
              default-type="warning"
            />
            <StatusTag
              :status="invalidStatus"
              :text-map="null"
              error-fallback-text="映射错误"
              @error="handleTagError"
            />
          </div>

          <div v-if="errorLogs.length > 0" class="error-log">
            <h4>错误日志:</h4>
            <ul>
              <li v-for="(error, index) in errorLogs.slice(-3)" :key="index" class="error-item">
                {{ formatEventTime(error.timestamp) }} - {{ error.context }}: {{ error.message }}
              </li>
            </ul>
            <el-button size="mini" @click="clearErrorLogs">清空日志</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatusTag from './index.vue'
import {
  productLifecycleMap,
  auditStatusMap,
  priorityMap,
  deviceStatusMap,
  syncStatusMap,
  orderStatusMap,
  userStatusMap,
  qualityStatusMap,
  networkStatusMap
} from './types.js'

export default {
  name: 'StatusTagDemo',
  components: {
    StatusTag
  },

  data() {
    return {
      // 预设映射
      productLifecycleMap,
      auditStatusMap,
      priorityMap,
      deviceStatusMap,
      syncStatusMap,
      orderStatusMap,
      userStatusMap,
      qualityStatusMap,
      networkStatusMap,

      // 现代化特性控制
      enableModernFeatures: false,
      clickDebounceDelay: 300,

      // 事件日志
      clickEvents: [],
      errorLogs: [],

      // 可关闭标签
      closableTags: [
        {
          id: '1',
          status: 'tag1',
          textMap: { 'tag1': '标签1' },
          typeMap: { 'tag1': 'primary' }
        },
        {
          id: '2',
          status: 'tag2',
          textMap: { 'tag2': '标签2' },
          typeMap: { 'tag2': 'success' }
        },
        {
          id: '3',
          status: 'tag3',
          textMap: { 'tag3': '标签3' },
          typeMap: { 'tag3': 'warning' }
        }
      ],

      // 表格示例数据
      tableExampleData: [
        {
          name: '服务器-01',
          model: 'Dell R730',
          status: 'online',
          priority: 'high',
          syncStatus: 'synced',
          lastUpdate: '2024-12-19 10:30:00'
        },
        {
          name: '交换机-02',
          model: 'Cisco 2960',
          status: 'maintenance',
          priority: 'medium',
          syncStatus: 'syncing',
          lastUpdate: '2024-12-19 09:15:00'
        },
        {
          name: '防火墙-03',
          model: 'Fortinet 60E',
          status: 'error',
          priority: 'critical',
          syncStatus: 'failed',
          lastUpdate: '2024-12-19 08:45:00'
        },
        {
          name: '路由器-04',
          model: 'Huawei AR120',
          status: 'offline',
          priority: 'low',
          syncStatus: 'pending',
          lastUpdate: '2024-12-18 16:20:00'
        }
      ],

      // 性能测试
      performanceTestCount: 1000,
      performanceTesting: false,
      performanceResult: null,
      performanceTestTags: [],

      // 错误测试
      invalidStatus: { invalid: 'data' }
    }
  },

  methods: {
    // 处理标签点击
    handleTagClick(data) {
      this.clickEvents.push({
        timestamp: new Date(),
        displayText: data.displayText,
        status: data.status,
        clickCount: data.clickCount
      })

      this.$message.success(`点击了状态标签: ${data.displayText}`)
    },

    // 处理错误模拟
    handleErrorSimulation() {
      // 模拟一个错误
      throw new Error('这是一个模拟的错误')
    },

    // 处理标签错误
    handleTagError(errorInfo) {
      this.errorLogs.push(errorInfo)
      this.$message.error(`标签组件发生错误: ${errorInfo.context}`)
    },

    // 处理标签关闭
    handleTagClose(index) {
      this.closableTags.splice(index, 1)
      this.$message.info('标签已关闭')
    },

    // 重置可关闭标签
    resetClosableTags() {
      this.closableTags = [
        {
          id: '1',
          status: 'tag1',
          textMap: { 'tag1': '标签1' },
          typeMap: { 'tag1': 'primary' }
        },
        {
          id: '2',
          status: 'tag2',
          textMap: { 'tag2': '标签2' },
          typeMap: { 'tag2': 'success' }
        },
        {
          id: '3',
          status: 'tag3',
          textMap: { 'tag3': '标签3' },
          typeMap: { 'tag3': 'warning' }
        }
      ]
    },

    // 切换预设演示
    switchPresetDemo() {
      // 可以在这里切换不同的预设数据
      this.$message.info('预设数据已切换（演示功能）')
    },

    // 运行性能测试
    async runPerformanceTest() {
      this.performanceTesting = true
      this.performanceTestTags = []

      await this.$nextTick()

      const startTime = performance.now()

      // 生成测试数据
      const testTags = []
      const statuses = ['online', 'offline', 'maintenance', 'error', 'standby']

      for (let i = 0; i < this.performanceTestCount; i++) {
        const statusIndex = i % statuses.length

        testTags.push({
          status: statuses[statusIndex],
          textMap: this.deviceStatusMap.textMap,
          typeMap: this.deviceStatusMap.typeMap,
          iconMap: this.deviceStatusMap.iconMap
        })
      }

      this.performanceTestTags = testTags

      await this.$nextTick()

      const endTime = performance.now()
      this.performanceResult = Math.round(endTime - startTime)
      this.performanceTesting = false

      this.$message.success(`性能测试完成！渲染 ${this.performanceTestCount} 个标签耗时: ${this.performanceResult}ms`)
    },

    // 格式化事件时间
    formatEventTime(timestamp) {
      return timestamp.toLocaleTimeString()
    },

    // 清空点击事件
    clearClickEvents() {
      this.clickEvents = []
    },

    // 清空错误日志
    clearErrorLogs() {
      this.errorLogs = []
    }
  }
}
</script>

<style scoped>
.status-tag-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.demo-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.demo-header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.demo-section {
  margin-bottom: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.demo-section h2 {
  margin: 0;
  padding: 20px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-size: 20px;
  font-weight: 600;
  color: #495057;
}

.demo-description {
  padding: 20px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.demo-description p {
  margin: 0 0 10px 0;
  color: #6c757d;
}

.control-panel {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.demo-content {
  padding: 30px;
}

.tag-group {
  margin-bottom: 30px;
}

.tag-group:last-child {
  margin-bottom: 0;
}

.tag-group h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #343a40;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.event-log, .error-log {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.event-log h4, .error-log h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #495057;
}

.event-log ul, .error-log ul {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.event-log li, .error-log li {
  margin-bottom: 5px;
  font-size: 13px;
  color: #6c757d;
}

.error-item {
  color: #dc3545 !important;
}

.performance-test-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-tag-demo {
    padding: 10px;
  }

  .demo-header {
    padding: 20px;
  }

  .demo-header h1 {
    font-size: 24px;
  }

  .demo-content {
    padding: 20px;
  }

  .tag-row {
    gap: 8px;
  }

  .control-panel {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .performance-test-container {
    gap: 4px;
  }
}

/* 美化滚动条 */
.performance-test-container::-webkit-scrollbar {
  width: 6px;
}

.performance-test-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.performance-test-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.performance-test-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
