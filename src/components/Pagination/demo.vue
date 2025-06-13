/**
 * Pagination 分页组件演示页面
 * 功能描述：展示Pagination组件的各种功能和使用方法，包括现代化优化功能
 * 创建日期：2024-12-19
 * 更新日期：2024-12-19
 */
<template>
  <div class="pagination-demo">
    <!-- 页面标题 -->
    <div class="demo-header">
      <h1>Pagination 分页组件演示</h1>
      <p>基于Element UI的增强分页组件，支持防抖、错误处理、性能监控等现代化功能</p>
    </div>

    <!-- 基础用法示例 -->
    <div class="demo-section">
      <h2>1. 基础用法</h2>
      <div class="demo-description">
        <p>最基本的分页功能，保持向后兼容。</p>
      </div>

      <div class="demo-content">
        <div class="table-mock">
          <div v-for="item in basicData" :key="item.id" class="table-row">
            <span>ID: {{ item.id }}</span>
            <span>名称: {{ item.name }}</span>
            <span>状态: {{ item.status }}</span>
          </div>
        </div>

        <pagination
          :total="basicPagination.total"
          :page.sync="basicPagination.page"
          :limit.sync="basicPagination.limit"
          @pagination="handleBasicPagination"
        />
      </div>
    </div>

    <!-- 现代化功能示例 -->
    <div class="demo-section">
      <h2>2. 现代化功能 (防抖 + 错误处理)</h2>
      <div class="demo-description">
        <p>启用现代化功能，包括防抖保护、错误处理、重试机制等。</p>
        <p class="tip">💡 快速点击分页按钮测试防抖效果</p>
      </div>

      <div class="demo-controls">
        <el-button size="small" @click="simulateError">模拟错误</el-button>
        <el-button size="small" @click="clearModernError">清除错误</el-button>
        <el-button size="small" type="primary" @click="toggleModernLoading">
          {{ modernLoading ? '停止加载' : '开始加载' }}
        </el-button>
      </div>

      <div class="demo-content">
        <div class="table-mock">
          <div v-for="item in modernData" :key="item.id" class="table-row">
            <span>ID: {{ item.id }}</span>
            <span>名称: {{ item.name }}</span>
            <span>类型: {{ item.type }}</span>
            <span>时间: {{ formatTime(item.createTime) }}</span>
          </div>
        </div>

        <pagination
          :total="modernPagination.total"
          :page.sync="modernPagination.page"
          :limit.sync="modernPagination.limit"
          :enable-modern-features="true"
          :loading="modernLoading"
          :disabled="modernDisabled"
          :debounce-delay="500"
          :allow-retry="true"
          :max-retries="3"
          loading-text="数据加载中..."
          @pagination="handleModernPagination"
          @error="handlePaginationError"
          @retry="handlePaginationRetry"
          @performance="handlePerformanceMetrics"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 自定义配置示例 -->
    <div class="demo-section">
      <h2>3. 自定义配置</h2>
      <div class="demo-description">
        <p>演示各种配置选项和自定义功能。</p>
      </div>

      <div class="demo-controls">
        <el-form inline size="small">
          <el-form-item label="每页选项:">
            <el-select v-model="customPageSizes" multiple style="width: 200px;">
              <el-option :value="5" label="5条/页" />
              <el-option :value="10" label="10条/页" />
              <el-option :value="20" label="20条/页" />
              <el-option :value="50" label="50条/页" />
              <el-option :value="100" label="100条/页" />
            </el-select>
          </el-form-item>

          <el-form-item label="布局:">
            <el-select v-model="customLayout" style="width: 300px;">
              <el-option value="total, sizes, prev, pager, next, jumper" label="完整布局" />
              <el-option value="prev, pager, next" label="简化布局" />
              <el-option value="total, prev, pager, next" label="无跳转布局" />
              <el-option value="sizes, prev, pager, next" label="无总数布局" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="customBackground">背景色</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="customAutoScroll">自动滚动</el-checkbox>
          </el-form-item>
        </el-form>
      </div>

      <div class="demo-content">
        <div class="table-mock">
          <div v-for="item in customData" :key="item.id" class="table-row">
            <span>编号: {{ item.id }}</span>
            <span>产品: {{ item.product }}</span>
            <span>价格: ¥{{ item.price }}</span>
            <span>销量: {{ item.sales }}</span>
          </div>
        </div>

        <pagination
          :total="customPagination.total"
          :page.sync="customPagination.page"
          :limit.sync="customPagination.limit"
          :page-sizes="customPageSizes"
          :layout="customLayout"
          :background="customBackground"
          :auto-scroll="customAutoScroll"
          :enable-modern-features="true"
          @pagination="handleCustomPagination"
        />
      </div>
    </div>

    <!-- 编程式控制示例 -->
    <div class="demo-section">
      <h2>4. 编程式控制</h2>
      <div class="demo-description">
        <p>通过组件引用调用方法进行编程式控制。</p>
      </div>

      <div class="demo-controls">
        <el-button size="small" @click="goToFirstPage">第一页</el-button>
        <el-button size="small" @click="goToPrevPage">上一页</el-button>
        <el-button size="small" @click="goToNextPage">下一页</el-button>
        <el-button size="small" @click="goToLastPage">最后一页</el-button>
        <el-button size="small" type="primary" @click="goToRandomPage">随机页</el-button>
        <el-button size="small" type="success" @click="setPageSize(30)">设置30条/页</el-button>
        <el-button size="small" type="info" @click="showCurrentState">显示状态</el-button>
      </div>

      <div class="demo-content">
        <div class="table-mock">
          <div v-for="item in programData" :key="item.id" class="table-row">
            <span>用户: {{ item.user }}</span>
            <span>邮箱: {{ item.email }}</span>
            <span>部门: {{ item.department }}</span>
            <span>角色: {{ item.role }}</span>
          </div>
        </div>

        <pagination
          ref="programPagination"
          :total="programPagination.total"
          :page.sync="programPagination.page"
          :limit.sync="programPagination.limit"
          :enable-modern-features="true"
          @pagination="handleProgramPagination"
        />
      </div>
    </div>

    <!-- 响应式和移动端适配 -->
    <div class="demo-section">
      <h2>5. 响应式适配</h2>
      <div class="demo-description">
        <p>在不同屏幕尺寸下的分页组件表现。调整浏览器窗口大小查看效果。</p>
      </div>

      <div class="demo-content responsive-demo">
        <div class="table-mock">
          <div v-for="item in responsiveData" :key="item.id" class="table-row">
            <span>设备: {{ item.device }}</span>
            <span>型号: {{ item.model }}</span>
            <span>状态: {{ item.status }}</span>
          </div>
        </div>

        <pagination
          :total="responsivePagination.total"
          :page.sync="responsivePagination.page"
          :limit.sync="responsivePagination.limit"
          :enable-modern-features="true"
          layout="total, prev, pager, next"
          @pagination="handleResponsivePagination"
        />
      </div>
    </div>

    <!-- 性能监控信息 -->
    <div class="demo-section">
      <h2>6. 性能监控</h2>
      <div class="demo-description">
        <p>展示分页操作的性能指标（仅现代模式）。</p>
      </div>

      <div class="performance-info">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="performance-item">
              <span class="label">总操作次数:</span>
              <span class="value">{{ performanceStats.totalOperations }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="performance-item">
              <span class="label">平均响应时间:</span>
              <span class="value">{{ performanceStats.averageTime }}ms</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="performance-item">
              <span class="label">最快响应:</span>
              <span class="value">{{ performanceStats.minTime }}ms</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="performance-item">
              <span class="label">最慢响应:</span>
              <span class="value">{{ performanceStats.maxTime }}ms</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="performance-item">
              <span class="label">错误次数:</span>
              <span class="value error">{{ performanceStats.errorCount }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="performance-item">
              <span class="label">重试次数:</span>
              <span class="value warning">{{ performanceStats.retryCount }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 事件日志 -->
    <div class="demo-section">
      <h2>7. 事件日志</h2>
      <div class="demo-description">
        <p>实时显示分页组件触发的各种事件。</p>
        <el-button size="small" @click="clearEventLogs">清空日志</el-button>
      </div>

      <div class="event-logs">
        <div v-for="(log, index) in eventLogs" :key="index" :class="getLogClass(log.type)">
          <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
          <span class="log-type">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from './index.vue'

export default {
  name: 'PaginationDemo',
  components: {
    Pagination
  },

  data() {
    return {
      // 基础示例数据
      basicData: [],
      basicPagination: {
        page: 1,
        limit: 5,
        total: 50
      },

      // 现代化功能示例数据
      modernData: [],
      modernPagination: {
        page: 1,
        limit: 8,
        total: 100
      },
      modernLoading: false,
      modernDisabled: false,

      // 自定义配置示例数据
      customData: [],
      customPagination: {
        page: 1,
        limit: 10,
        total: 200
      },
      customPageSizes: [5, 10, 20, 50],
      customLayout: 'total, sizes, prev, pager, next, jumper',
      customBackground: true,
      customAutoScroll: true,

      // 编程式控制示例数据
      programData: [],
      programPagination: {
        page: 1,
        limit: 12,
        total: 150
      },

      // 响应式示例数据
      responsiveData: [],
      responsivePagination: {
        page: 1,
        limit: 6,
        total: 80
      },

      // 性能统计
      performanceStats: {
        totalOperations: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        errorCount: 0,
        retryCount: 0,
        times: []
      },

      // 事件日志
      eventLogs: [],
      maxLogs: 50
    }
  },

  created() {
    this.generateAllData()
  },

  methods: {
    // 生成所有示例数据
    generateAllData() {
      this.generateBasicData()
      this.generateModernData()
      this.generateCustomData()
      this.generateProgramData()
      this.generateResponsiveData()
    },

    // 生成基础示例数据
    generateBasicData() {
      const start = (this.basicPagination.page - 1) * this.basicPagination.limit
      const end = start + this.basicPagination.limit

      this.basicData = []
      for (let i = start; i < end && i < this.basicPagination.total; i++) {
        this.basicData.push({
          id: i + 1,
          name: `基础项目 ${i + 1}`,
          status: Math.random() > 0.5 ? '启用' : '禁用'
        })
      }
    },

    // 生成现代化功能示例数据
    generateModernData() {
      const start = (this.modernPagination.page - 1) * this.modernPagination.limit
      const end = start + this.modernPagination.limit
      const types = ['用户', '订单', '产品', '报告']

      this.modernData = []
      for (let i = start; i < end && i < this.modernPagination.total; i++) {
        this.modernData.push({
          id: i + 1,
          name: `现代项目 ${i + 1}`,
          type: types[Math.floor(Math.random() * types.length)],
          createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        })
      }
    },

    // 生成自定义配置示例数据
    generateCustomData() {
      const start = (this.customPagination.page - 1) * this.customPagination.limit
      const end = start + this.customPagination.limit
      const products = ['手机', '电脑', '平板', '耳机', '音箱']

      this.customData = []
      for (let i = start; i < end && i < this.customPagination.total; i++) {
        this.customData.push({
          id: i + 1,
          product: products[Math.floor(Math.random() * products.length)] + ` ${i + 1}`,
          price: Math.floor(Math.random() * 5000) + 100,
          sales: Math.floor(Math.random() * 1000) + 10
        })
      }
    },

    // 生成编程式控制示例数据
    generateProgramData() {
      const start = (this.programPagination.page - 1) * this.programPagination.limit
      const end = start + this.programPagination.limit
      const departments = ['技术部', '产品部', '设计部', '运营部', '市场部']
      const roles = ['开发', '测试', '产品经理', '设计师', '运营']

      this.programData = []
      for (let i = start; i < end && i < this.programPagination.total; i++) {
        this.programData.push({
          id: i + 1,
          user: `用户${i + 1}`,
          email: `user${i + 1}@company.com`,
          department: departments[Math.floor(Math.random() * departments.length)],
          role: roles[Math.floor(Math.random() * roles.length)]
        })
      }
    },

    // 生成响应式示例数据
    generateResponsiveData() {
      const start = (this.responsivePagination.page - 1) * this.responsivePagination.limit
      const end = start + this.responsivePagination.limit
      const devices = ['服务器', '交换机', '路由器', '防火墙']
      const models = ['A型', 'B型', 'C型', 'D型']
      const statuses = ['运行中', '维护中', '离线']

      this.responsiveData = []
      for (let i = start; i < end && i < this.responsivePagination.total; i++) {
        this.responsiveData.push({
          id: i + 1,
          device: devices[Math.floor(Math.random() * devices.length)],
          model: models[Math.floor(Math.random() * models.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
        })
      }
    },

    // 分页处理方法
    handleBasicPagination() {
      this.addEventLog('基础分页', `跳转到第${this.basicPagination.page}页，每页${this.basicPagination.limit}条`)
      this.generateBasicData()
    },

    handleModernPagination() {
      this.addEventLog('现代分页', `跳转到第${this.modernPagination.page}页，每页${this.modernPagination.limit}条`)
      // 模拟异步加载
      this.modernLoading = true
      setTimeout(() => {
        this.generateModernData()
        this.modernLoading = false
      }, 800)
    },

    handleCustomPagination() {
      this.addEventLog('自定义分页', `跳转到第${this.customPagination.page}页，每页${this.customPagination.limit}条`)
      this.generateCustomData()
    },

    handleProgramPagination() {
      this.addEventLog('编程式分页', `跳转到第${this.programPagination.page}页，每页${this.programPagination.limit}条`)
      this.generateProgramData()
    },

    handleResponsivePagination() {
      this.addEventLog('响应式分页', `跳转到第${this.responsivePagination.page}页，每页${this.responsivePagination.limit}条`)
      this.generateResponsiveData()
    },

    // 现代化功能事件处理
    handlePaginationError(errorInfo) {
      this.performanceStats.errorCount++
      this.addEventLog('错误', `分页操作失败: ${errorInfo.error.message}`, 'error')
    },

    handlePaginationRetry(retryInfo) {
      this.performanceStats.retryCount++
      this.addEventLog('重试', `第${retryInfo.retryCount}次重试`, 'warning')
    },

    handlePerformanceMetrics(metrics) {
      this.performanceStats.totalOperations++
      this.performanceStats.times.push(metrics.duration)

      // 计算统计数据
      const times = this.performanceStats.times
      this.performanceStats.averageTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      this.performanceStats.minTime = Math.round(Math.min(...times))
      this.performanceStats.maxTime = Math.round(Math.max(...times))

      this.addEventLog('性能', `操作耗时: ${Math.round(metrics.duration)}ms`, 'info')
    },

    handleSizeChange(changeInfo) {
      this.addEventLog('页面大小变化', `从${changeInfo.oldSize}条/页 变更为 ${changeInfo.newSize}条/页`, 'info')
    },

    handleCurrentChange(changeInfo) {
      this.addEventLog('当前页变化', `从第${changeInfo.oldPage}页 跳转到 第${changeInfo.newPage}页`, 'info')
    },

    // 模拟功能
    simulateError() {
      this.modernDisabled = true
      this.addEventLog('模拟错误', '人为触发分页错误', 'error')
      setTimeout(() => {
        this.modernDisabled = false
      }, 3000)
    },

    clearModernError() {
      this.modernDisabled = false
      this.addEventLog('清除错误', '手动清除错误状态', 'success')
    },

    toggleModernLoading() {
      this.modernLoading = !this.modernLoading
      this.addEventLog('加载状态', `切换加载状态: ${this.modernLoading ? '开始' : '结束'}`, 'info')
    },

    // 编程式控制方法
    goToFirstPage() {
      if (this.$refs.programPagination) {
        this.$refs.programPagination.goToFirst()
        this.addEventLog('编程控制', '跳转到第一页', 'success')
      }
    },

    goToPrevPage() {
      if (this.$refs.programPagination) {
        this.$refs.programPagination.prevPage()
        this.addEventLog('编程控制', '跳转到上一页', 'success')
      }
    },

    goToNextPage() {
      if (this.$refs.programPagination) {
        this.$refs.programPagination.nextPage()
        this.addEventLog('编程控制', '跳转到下一页', 'success')
      }
    },

    goToLastPage() {
      if (this.$refs.programPagination) {
        this.$refs.programPagination.goToLast()
        this.addEventLog('编程控制', '跳转到最后一页', 'success')
      }
    },

    goToRandomPage() {
      if (this.$refs.programPagination) {
        const totalPages = Math.ceil(this.programPagination.total / this.programPagination.limit)
        const randomPage = Math.floor(Math.random() * totalPages) + 1
        this.$refs.programPagination.goToPage(randomPage)
        this.addEventLog('编程控制', `跳转到随机页: ${randomPage}`, 'success')
      }
    },

    setPageSize(size) {
      if (this.$refs.programPagination) {
        this.$refs.programPagination.setPageSize(size)
        this.addEventLog('编程控制', `设置页面大小: ${size}`, 'success')
      }
    },

    showCurrentState() {
      if (this.$refs.programPagination) {
        const state = this.$refs.programPagination.getCurrentState()
        this.$alert(JSON.stringify(state, null, 2), '当前状态', {
          confirmButtonText: '确定'
        })
        this.addEventLog('编程控制', '获取当前状态', 'info')
      }
    },

    // 工具方法
    formatTime(time) {
      return new Date(time).toLocaleDateString()
    },

    formatLogTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },

    addEventLog(type, message, level = 'default') {
      this.eventLogs.unshift({
        type,
        message,
        level,
        timestamp: Date.now()
      })

      // 限制日志数量
      if (this.eventLogs.length > this.maxLogs) {
        this.eventLogs = this.eventLogs.slice(0, this.maxLogs)
      }
    },

    clearEventLogs() {
      this.eventLogs = []
      this.addEventLog('系统', '清空事件日志', 'info')
    },

    getLogClass(level) {
      return `event-log event-log-${level}`
    }
  }
}
</script>

<style scoped>
.pagination-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #ebeef5;
}

.demo-header h1 {
  color: #303133;
  margin-bottom: 10px;
}

.demo-header p {
  color: #606266;
  font-size: 16px;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
}

.demo-section h2 {
  color: #409eff;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.demo-description {
  margin-bottom: 20px;
  color: #606266;
  line-height: 1.6;
}

.demo-description .tip {
  background: #f4f4f5;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 14px;
}

.demo-controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.demo-content {
  background: #fafafa;
  border-radius: 6px;
  overflow: hidden;
}

.table-mock {
  min-height: 200px;
  padding: 20px;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row span {
  flex: 1;
  color: #606266;
}

.performance-info {
  margin-top: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.performance-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.performance-item:last-child {
  margin-bottom: 0;
}

.performance-item .label {
  font-weight: 500;
  color: #606266;
  flex: 1;
}

.performance-item .value {
  font-weight: 600;
  color: #409eff;
  font-family: monospace;
}

.performance-item .value.error {
  color: #f56c6c;
}

.performance-item .value.warning {
  color: #e6a23c;
}

.event-logs {
  max-height: 300px;
  overflow-y: auto;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.event-log {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 13px;
  border-left: 3px solid transparent;
}

.event-log:last-child {
  margin-bottom: 0;
}

.event-log-default {
  background: #f4f4f5;
  border-left-color: #909399;
}

.event-log-success {
  background: #f0f9ff;
  border-left-color: #67c23a;
  color: #529b2e;
}

.event-log-warning {
  background: #fdf6ec;
  border-left-color: #e6a23c;
  color: #b88230;
}

.event-log-error {
  background: #fef0f0;
  border-left-color: #f56c6c;
  color: #c45656;
}

.event-log-info {
  background: #f4f4f5;
  border-left-color: #409eff;
  color: #337ecc;
}

.log-time {
  width: 80px;
  font-family: monospace;
  color: #909399;
  margin-right: 10px;
}

.log-type {
  width: 80px;
  font-weight: bold;
  margin-right: 10px;
}

.log-message {
  flex: 1;
}

/* 响应式适配 */
.responsive-demo {
  border: 2px dashed #e6a23c;
  background: linear-gradient(45deg, #fff 25%, #f8f9fa 25%, #f8f9fa 50%, #fff 50%, #fff 75%, #f8f9fa 75%);
  background-size: 20px 20px;
}

@media (max-width: 768px) {
  .pagination-demo {
    padding: 10px;
  }

  .demo-section {
    padding: 10px;
  }

  .table-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-row span {
    margin-bottom: 5px;
  }

  .demo-controls .el-form-item {
    display: block;
    margin-bottom: 10px;
  }

  .event-log {
    flex-direction: column;
    align-items: flex-start;
  }

  .log-time,
  .log-type {
    width: auto;
    margin-bottom: 5px;
  }
}

/* 动画效果 */
.table-mock {
  transition: all 0.3s ease;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: #f5f7fa;
}

.event-log {
  animation: slideInLeft 0.3s ease;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
