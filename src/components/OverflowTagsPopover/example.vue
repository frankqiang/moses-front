<!--
  OverflowTagsPopover 组件现代化功能示例页面
  展示组件的各种现代化特性和使用场景
-->
<template>
  <div class="overflow-tags-example">
    <div class="page-header">
      <h1>OverflowTagsPopover 现代化功能演示</h1>
      <p>展示溢出标签弹出框组件的现代化特性和使用场景</p>
    </div>

    <!-- 功能开关 -->
    <el-card class="feature-controls" shadow="never">
      <div slot="header">
        <span>功能开关</span>
      </div>
      <div class="controls">
        <el-switch
          v-model="globalEnableModern"
          active-text="现代化模式"
          inactive-text="传统模式"
        />
        <el-switch
          v-model="simulateLoading"
          active-text="模拟加载"
          inactive-text="正常状态"
        />
        <el-switch
          v-model="simulateError"
          active-text="模拟错误"
          inactive-text="正常状态"
        />
      </div>
    </el-card>

    <!-- 基础用法示例 -->
    <el-card class="demo-section" shadow="never">
      <div slot="header">
        <span>1. 基础用法对比</span>
      </div>

      <div class="demo-row">
        <div class="demo-item">
          <h4>传统模式</h4>
          <div class="demo-content">
            <overflow-tags-popover
              :data="basicTags"
              :max-show="2"
              :enable-modern-features="false"
              title="基础标签"
              type="primary"
            />
          </div>
        </div>

        <div class="demo-item">
          <h4>现代化模式</h4>
          <div class="demo-content">
            <overflow-tags-popover
              :data="basicTags"
              :max-show="2"
              :enable-modern-features="true"
              :loading="simulateLoading"
              title="现代化标签"
              type="success"
              @tag-click="handleTagClick"
              @more-click="handleMoreClick"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 大数据集虚拟滚动 -->
    <el-card class="demo-section" shadow="never">
      <div slot="header">
        <span>2. 大数据集虚拟滚动</span>
        <el-tag size="mini" type="info" style="margin-left: 10px;">
          {{ largeTags.length }} 个标签
        </el-tag>
      </div>

      <div class="demo-content">
        <overflow-tags-popover
          :data="largeTags"
          :max-show="1"
          :enable-modern-features="globalEnableModern"
          :virtual-threshold="50"
          :virtual-item-height="36"
          enable-virtual-scroll
          title="大数据集标签"
          :popover-width="400"
        />
      </div>
    </el-card>

    <!-- 搜索和筛选功能 -->
    <el-card class="demo-section" shadow="never">
      <div slot="header">
        <span>3. 搜索和筛选功能</span>
      </div>

      <div class="demo-content">
        <overflow-tags-popover
          :data="productTags"
          :max-show="2"
          :enable-modern-features="globalEnableModern"
          label-key="name"
          enable-search
          :search-threshold="5"
          title="产品标签搜索"
          @search="handleSearch"
        >
          <template #popover-item="{ item, index }">
            <div class="product-item">
              <span class="product-name">{{ item.name }}</span>
              <span class="product-code">{{ item.code }}</span>
              <el-tag size="mini" :type="item.status === 'active' ? 'success' : 'warning'">
                {{ item.status }}
              </el-tag>
            </div>
          </template>
        </overflow-tags-popover>
      </div>
    </el-card>

    <!-- 自定义标签类型和样式 -->
    <el-card class="demo-section" shadow="never">
      <div slot="header">
        <span>4. 自定义标签类型映射</span>
      </div>

      <div class="demo-content">
        <overflow-tags-popover
          :data="statusTags"
          :max-show="3"
          :enable-modern-features="globalEnableModern"
          label-key="name"
          :tag-type-mapper="getStatusTagType"
          title="状态标签"
        >
          <template #tag="{ item, index }">
            <el-tag
              :type="getStatusTagType(item)"
              size="small"
              :class="{'premium-tag': item.premium}"
            >
              <i :class="item.icon" style="margin-right: 4px;" />
              {{ item.name }}
            </el-tag>
          </template>

          <template #popover-item="{ item, index }">
            <div class="status-item">
              <i :class="item.icon" />
              <span class="status-name">{{ item.name }}</span>
              <span class="status-desc">{{ item.description }}</span>
            </div>
          </template>
        </overflow-tags-popover>
      </div>
    </el-card>

    <!-- 错误处理和重试机制 -->
    <el-card class="demo-section" shadow="never">
      <div slot="header">
        <span>5. 错误处理和重试机制</span>
      </div>

      <div class="demo-content">
        <overflow-tags-popover
          :data="simulateError ? null : errorDemoTags"
          :max-show="2"
          :enable-modern-features="globalEnableModern"
          :loading="simulateLoading"
          :max-retries="3"
          title="错误处理演示"
          @error="handleError"
          @retry="handleRetry"
        >
          <template #error="{ error, retry }">
            <div class="custom-error">
              <i class="el-icon-warning-outline" />
              <span>{{ error.message }}</span>
              <el-button size="mini" type="text" @click="retry">
                重新加载
              </el-button>
            </div>
          </template>
        </overflow-tags-popover>
      </div>
    </el-card>

    <!-- 完整功能演示 -->
    <el-card class="demo-section" shadow="never">
      <div slot="header">
        <span>6. 完整功能演示</span>
      </div>

      <div class="demo-content">
        <overflow-tags-popover
          :data="fullFeatureTags"
          :max-show="2"
          :enable-modern-features="globalEnableModern"
          :loading="simulateLoading"
          label-key="name"
          enable-search
          enable-virtual-scroll
          enable-select-all
          enable-export
          :search-threshold="3"
          title="完整功能演示"
          :popover-width="450"
          @tag-click="handleTagClick"
          @more-click="handleMoreClick"
          @search="handleSearch"
          @select-all="handleSelectAll"
          @export="handleExport"
          @error="handleError"
        >
          <template #tag="{ item, index }">
            <el-tag
              :type="getFeatureTagType(item)"
              size="small"
              effect="dark"
            >
              {{ item.name }}
              <i v-if="item.featured" class="el-icon-star-on" style="margin-left: 4px;" />
            </el-tag>
          </template>

          <template #popover-item="{ item, index }">
            <div class="feature-item">
              <div class="item-header">
                <span class="item-name">{{ item.name }}</span>
                <el-tag size="mini" :type="item.category === 'premium' ? 'danger' : 'success'">
                  {{ item.category }}
                </el-tag>
              </div>
              <div class="item-desc">{{ item.description }}</div>
              <div class="item-tags">
                <el-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  size="mini"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </template>
        </overflow-tags-popover>
      </div>
    </el-card>

    <!-- 事件日志 -->
    <el-card class="demo-section" shadow="never">
      <div slot="header">
        <span>事件日志</span>
        <el-button size="mini" style="float: right;" @click="clearLogs">清空</el-button>
      </div>

      <div class="event-logs">
        <div v-if="eventLogs.length === 0" class="no-logs">
          暂无事件日志
        </div>
        <div
          v-for="(log, index) in eventLogs"
          :key="index"
          class="log-item"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-event">{{ log.event }}</span>
          <span class="log-data">{{ log.data }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import OverflowTagsPopover from './index.vue'

export default {
  name: 'OverflowTagsExample',
  components: {
    OverflowTagsPopover
  },

  data() {
    return {
      // 全局控制
      globalEnableModern: true,
      simulateLoading: false,
      simulateError: false,

      // 事件日志
      eventLogs: [],

      // 基础标签数据
      basicTags: [
        '前端开发', 'Vue.js', 'JavaScript', 'TypeScript', 'CSS3', 'HTML5'
      ],

      // 大数据集
      largeTags: [],

      // 产品标签
      productTags: [
        { id: 1, name: '智能手机', code: 'SP001', status: 'active' },
        { id: 2, name: '平板电脑', code: 'TB001', status: 'active' },
        { id: 3, name: '笔记本电脑', code: 'LP001', status: 'inactive' },
        { id: 4, name: '智能手表', code: 'SW001', status: 'active' },
        { id: 5, name: '蓝牙耳机', code: 'BH001', status: 'active' },
        { id: 6, name: '智能音箱', code: 'SS001', status: 'inactive' },
        { id: 7, name: '游戏手柄', code: 'GC001', status: 'active' },
        { id: 8, name: '充电器', code: 'CH001', status: 'active' }
      ],

      // 状态标签
      statusTags: [
        {
          id: 1,
          name: '运行中',
          description: '系统正常运行',
          status: 'running',
          icon: 'el-icon-success',
          premium: false
        },
        {
          id: 2,
          name: '维护中',
          description: '系统维护升级',
          status: 'maintenance',
          icon: 'el-icon-warning',
          premium: false
        },
        {
          id: 3,
          name: '故障',
          description: '系统出现故障',
          status: 'error',
          icon: 'el-icon-error',
          premium: false
        },
        {
          id: 4,
          name: '高级功能',
          description: '付费用户专享',
          status: 'premium',
          icon: 'el-icon-star-on',
          premium: true
        }
      ],

      // 错误演示数据
      errorDemoTags: [
        '正常标签1', '正常标签2', '正常标签3'
      ],

      // 完整功能演示数据
      fullFeatureTags: [
        {
          id: 1,
          name: 'Vue.js框架',
          category: 'premium',
          description: '渐进式JavaScript框架，用于构建用户界面',
          featured: true,
          tags: ['框架', '前端', 'SPA']
        },
        {
          id: 2,
          name: 'Element UI',
          category: 'standard',
          description: '基于Vue.js的桌面端组件库',
          featured: false,
          tags: ['组件库', 'UI', '桌面端']
        },
        {
          id: 3,
          name: 'TypeScript',
          category: 'premium',
          description: 'JavaScript的超集，添加了静态类型定义',
          featured: true,
          tags: ['语言', '类型安全', '编译器']
        },
        {
          id: 4,
          name: 'Webpack',
          category: 'standard',
          description: '现代JavaScript应用程序的静态模块打包器',
          featured: false,
          tags: ['构建工具', '模块化', '打包']
        },
        {
          id: 5,
          name: 'Sass/SCSS',
          category: 'standard',
          description: 'CSS预处理器，增强CSS的功能',
          featured: false,
          tags: ['CSS', '预处理器', '样式']
        },
        {
          id: 6,
          name: 'Jest测试框架',
          category: 'premium',
          description: 'JavaScript测试框架，专注于简洁性',
          featured: true,
          tags: ['测试', '单元测试', '框架']
        }
      ]
    }
  },

  created() {
    this.generateLargeTags()
  },

  methods: {
    // 生成大数据集
    generateLargeTags() {
      const categories = ['技术', '工具', '框架', '库', '语言', '平台', '服务', '产品']
      const prefixes = ['现代', '高效', '智能', '快速', '强大', '灵活', '安全', '可靠']
      const suffixes = ['系统', '工具', '平台', '服务', '框架', '组件', '模块', '应用']

      this.largeTags = Array.from({ length: 500 }, (_, index) => {
        const category = categories[index % categories.length]
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
        return `${category}-${prefix}${suffix}${index + 1}`
      })
    },

    // 获取状态标签类型
    getStatusTagType(item) {
      switch (item.status) {
        case 'running': return 'success'
        case 'maintenance': return 'warning'
        case 'error': return 'danger'
        case 'premium': return 'primary'
        default: return 'info'
      }
    },

    // 获取功能标签类型
    getFeatureTagType(item) {
      if (item.featured) return 'danger'
      return item.category === 'premium' ? 'warning' : 'success'
    },

    // 记录事件日志
    logEvent(event, data) {
      this.eventLogs.unshift({
        time: new Date().toLocaleTimeString(),
        event,
        data: typeof data === 'object' ? JSON.stringify(data) : data
      })

      // 限制日志数量
      if (this.eventLogs.length > 50) {
        this.eventLogs = this.eventLogs.slice(0, 50)
      }
    },

    // 清空日志
    clearLogs() {
      this.eventLogs = []
    },

    // === 事件处理器 ===
    handleTagClick(data) {
      this.logEvent('标签点击', data)
      this.$message.success(`点击了标签: ${JSON.stringify(data)}`)
    },

    handleMoreClick(data) {
      this.logEvent('更多标签点击', data)
      this.$message.info(`点击了更多标签: 总共${data.totalCount}个，隐藏${data.hiddenCount}个`)
    },

    handleSearch(keyword) {
      this.logEvent('搜索', keyword)
      console.log('搜索关键词:', keyword)
    },

    handleSelectAll(data) {
      this.logEvent('全选', `选中${data.length}项`)
      this.$message.success(`已选中 ${data.length} 项`)
    },

    handleExport(data) {
      this.logEvent('导出', `导出${data.length}项`)

      // 模拟导出功能
      const csvContent = data.map(item =>
        `${item.index},${item.label.replace(/,/g, ';')}`
      ).join('\n')

      const blob = new Blob([`序号,标签\n${csvContent}`], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `标签导出_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      this.$message.success('导出成功！')
    },

    handleError(error) {
      this.logEvent('错误', error)
      console.error('组件错误:', error)
    },

    handleRetry(retryCount) {
      this.logEvent('重试', `第${retryCount}次重试`)
      this.$message.info(`正在进行第 ${retryCount} 次重试...`)

      // 模拟重试逻辑
      setTimeout(() => {
        this.simulateError = false
        this.$message.success('重试成功！')
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.overflow-tags-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
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

.feature-controls {
  margin-bottom: 20px;

  .controls {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }
}

.demo-section {
  margin-bottom: 20px;

  .demo-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .demo-item {
    h4 {
      margin-bottom: 10px;
      color: #409EFF;
    }
  }

  .demo-content {
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px dashed #dcdfe6;
  }
}

// 自定义标签样式
.premium-tag {
  background: linear-gradient(45deg, #409EFF, #67C23A) !important;
  border: none !important;
  color: white !important;
}

// 产品项样式
.product-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .product-name {
    font-weight: bold;
    flex: 1;
  }

  .product-code {
    color: #909399;
    font-size: 12px;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
  }
}

// 状态项样式
.status-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-name {
    font-weight: bold;
    min-width: 60px;
  }

  .status-desc {
    color: #666;
    font-size: 12px;
    flex: 1;
  }
}

// 功能项样式
.feature-item {
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;

    .item-name {
      font-weight: bold;
      font-size: 14px;
    }
  }

  .item-desc {
    color: #666;
    font-size: 12px;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  .item-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
}

// 自定义错误样式
.custom-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;

  i {
    font-size: 16px;
  }
}

// 事件日志
.event-logs {
  max-height: 300px;
  overflow-y: auto;

  .no-logs {
    text-align: center;
    color: #909399;
    padding: 20px;
  }

  .log-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 12px;

    &:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #909399;
      min-width: 80px;
    }

    .log-event {
      color: #409EFF;
      font-weight: bold;
      min-width: 100px;
    }

    .log-data {
      color: #606266;
      flex: 1;
      word-break: break-word;
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .overflow-tags-example {
    padding: 10px;
  }

  .feature-controls .controls {
    flex-direction: column;
    gap: 10px;
  }

  .demo-section .demo-content {
    padding: 10px;
  }
}
</style>
