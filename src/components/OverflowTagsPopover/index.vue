/**
 * 溢出标签弹出框组件 - 现代化版本
 * 功能描述：用于在表格单元格中显示多个标签，当标签数量超过设定值时，以弹出框形式显示全部标签
 * 创建日期：2024-11-18
 * 优化日期：2024-11-18
 * 
 * 主要优化：
 * - 添加严格的Props验证和错误处理
 * - 实现虚拟滚动支持大数据集
 * - 增强用户体验（加载状态、错误反馈）
 * - 内存管理和性能优化
 * - 向后兼容性设计
 */
<template>
  <div class="overflow-tags-popover" :class="{'modern-mode': enableModernFeatures}">
    <!-- 错误状态显示 -->
    <div v-if="hasError" class="error-state">
      <slot name="error" :error="errorInfo" :retry="handleRetry">
        <span class="error-text">数据加载失败</span>
        <el-button 
          v-if="enableModernFeatures && errorInfo.retryable" 
          size="mini" 
          type="text" 
          @click="handleRetry"
        >
          重试
        </el-button>
      </slot>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-state">
      <slot name="loading">
        <i class="el-icon-loading"></i>
        <span class="loading-text">加载中...</span>
      </slot>
    </div>

    <!-- 正常显示状态 -->
    <template v-else-if="formattedData.length > 0">
      <!-- 直接显示的标签 -->
      <div v-for="(item, index) in visibleItems" :key="getItemKey(item, index)" style="display: inline-block; margin-right: 8px;">
        <slot name="tag" :item="item" :index="index">
          <el-tag
            :size="size"
            :type="getTagType(item, index)"
            :effect="effect"
            :class="[tagClass, {'interactive-tag': enableModernFeatures}]"
            @click="handleTagClick(item, index)"
          >
            {{ safeGetItemLabel(item) }}
          </el-tag>
        </slot>
      </div>

      <!-- 溢出标签的弹出框 -->
      <el-popover
        v-if="hasMoreItems"
        :placement="placement"
        :width="popoverWidth"
        :trigger="trigger"
        :popper-class="[popoverClass, 'overflow-tags-popover-panel'].join(' ')"
        :disabled="loading || hasError"
        ref="popover"
      >
        <div class="overflow-tags-list">
          <!-- 弹出框头部 -->
          <div v-if="title || enableModernFeatures" class="overflow-tags-header">
            <span class="header-title">{{ title || '标签列表' }}</span>
            <span v-if="enableModernFeatures" class="header-count">
              共{{ formattedData.length }}项
            </span>
          </div>

          <!-- 搜索框 (现代模式) -->
          <div v-if="enableModernFeatures && enableSearch && formattedData.length > searchThreshold" class="overflow-tags-search">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索标签..."
              size="mini"
              prefix-icon="el-icon-search"
              clearable
              @input="handleSearch"
            />
          </div>

          <!-- 标签内容区域 -->
          <div 
            class="overflow-tags-content"
            ref="scrollContainer"
            @scroll="handleScroll"
          >
            <!-- 虚拟滚动容器 -->
            <div v-if="enableModernFeatures && shouldVirtualize" class="virtual-scroll-container">
              <div :style="{ height: totalHeight + 'px' }" class="virtual-total">
                <div 
                  :style="{ transform: `translateY(${startOffset}px)` }" 
                  class="virtual-items"
                >
                  <div
                    v-for="(item, index) in visibleVirtualItems"
                    :key="getItemKey(item.data, item.index)"
                    :style="{ height: virtualItemHeight + 'px' }"
                    class="overflow-tags-item virtual-item"
                  >
                    <slot name="popover-item" :item="item.data" :index="item.index">
                      <span>{{ item.index + 1 }}. {{ safeGetItemLabel(item.data) }}</span>
                    </slot>
                  </div>
                </div>
              </div>
            </div>

            <!-- 普通滚动模式 -->
            <div v-else>
              <div
                v-for="(item, index) in filteredData"
                :key="getItemKey(item, index)"
                class="overflow-tags-item"
              >
                <slot name="popover-item" :item="item" :index="index">
                  <span>{{ index + 1 }}. {{ safeGetItemLabel(item) }}</span>
                </slot>
              </div>
            </div>

            <!-- 无搜索结果 -->
            <div v-if="filteredData.length === 0 && searchKeyword" class="no-results">
              <slot name="no-results">
                <span>未找到匹配的标签</span>
              </slot>
            </div>
          </div>

          <!-- 弹出框底部 -->
          <div v-if="enableModernFeatures && (enableExport || enableSelectAll)" class="overflow-tags-footer">
            <el-button 
              v-if="enableSelectAll" 
              size="mini" 
              type="text" 
              @click="handleSelectAll"
            >
              全选
            </el-button>
            <el-button 
              v-if="enableExport" 
              size="mini" 
              type="text" 
              @click="handleExport"
            >
              导出
            </el-button>
          </div>
        </div>

        <!-- 触发弹出框的标签 -->
        <slot
          slot="reference"
          name="more-tag"
          :count="moreItemsCount"
          :click="handleMoreTagClick"
        >
          <el-tag
            :size="size"
            :type="moreTagType"
            :effect="effect"
            class="more-tag"
            :class="{'more-tag-modern': enableModernFeatures}"
            @click="handleMoreTagClick"
          >
            <span>+{{ moreItemsCount }}</span>
            <i v-if="enableModernFeatures" class="el-icon-arrow-down more-icon"></i>
          </el-tag>
        </slot>
      </el-popover>
    </template>

    <!-- 无数据时显示 -->
    <template v-else>
      <slot name="empty">
        <span class="empty-text">{{ emptyText }}</span>
      </slot>
    </template>
  </div>
</template>

<script>
import { debounce } from '@/utils'

export default {
  name: 'OverflowTagsPopover',
  props: {
    // === 基础配置 ===
    // 标签数据
    data: {
      type: Array,
      default: () => [],
      validator(value) {
        if (!Array.isArray(value)) {
          console.error('[OverflowTagsPopover] data prop must be an array')
          return false
        }
        return true
      }
    },
    
    // 最大显示数量
    maxShow: {
      type: Number,
      default: 1,
      validator(value) {
        if (value < 0) {
          console.error('[OverflowTagsPopover] maxShow must be >= 0')
          return false
        }
        return true
      }
    },
    
    // 对象数组时的标签文本字段
    labelKey: {
      type: String,
      default: null
    },

    // === 弹出框配置 ===
    // 弹出框标题
    title: {
      type: String,
      default: ''
    },
    
    // 弹出框宽度
    popoverWidth: {
      type: Number,
      default: 300,
      validator(value) {
        return value >= 100 && value <= 800
      }
    },
    
    // 弹出框位置
    placement: {
      type: String,
      default: 'top',
      validator(value) {
        const validPlacements = [
          'top', 'top-start', 'top-end',
          'bottom', 'bottom-start', 'bottom-end',
          'left', 'left-start', 'left-end',
          'right', 'right-start', 'right-end'
        ]
        return validPlacements.includes(value)
      }
    },
    
    // 触发方式
    trigger: {
      type: String,
      default: 'click',
      validator(value) {
        return ['click', 'focus', 'hover', 'manual'].includes(value)
      }
    },
    
    // 弹出框类名
    popoverClass: {
      type: String,
      default: ''
    },

    // === 标签样式配置 ===
    // 标签大小
    size: {
      type: String,
      default: 'small',
      validator(value) {
        return ['medium', 'small', 'mini'].includes(value)
      }
    },
    
    // 标签类型
    type: {
      type: String,
      default: 'primary',
      validator(value) {
        return ['success', 'info', 'warning', 'danger', 'primary'].includes(value)
      }
    },
    
    // 标签效果
    effect: {
      type: String,
      default: 'light',
      validator(value) {
        return ['dark', 'light', 'plain'].includes(value)
      }
    },
    
    // 标签类名
    tagClass: {
      type: String,
      default: ''
    },

    // "更多"标签类型
    moreTagType: {
      type: String,
      default: 'info'
    },
    
    // 空数据文本
    emptyText: {
      type: String,
      default: '-'
    },

    // === 现代化特性配置 ===
    // 启用现代化特性
    enableModernFeatures: {
      type: Boolean,
      default: false
    },
    
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    
    // 启用搜索功能
    enableSearch: {
      type: Boolean,
      default: true
    },
    
    // 搜索触发阈值
    searchThreshold: {
      type: Number,
      default: 10
    },
    
    // 启用虚拟滚动
    enableVirtualScroll: {
      type: Boolean,
      default: true
    },
    
    // 虚拟滚动触发阈值
    virtualThreshold: {
      type: Number,
      default: 100
    },
    
    // 虚拟滚动项高度
    virtualItemHeight: {
      type: Number,
      default: 32
    },
    
    // 虚拟滚动缓冲区大小
    virtualBuffer: {
      type: Number,
      default: 5
    },
    
    // 启用全选功能
    enableSelectAll: {
      type: Boolean,
      default: false
    },
    
    // 启用导出功能
    enableExport: {
      type: Boolean,
      default: false
    },
    
    // 自定义标签类型映射函数
    tagTypeMapper: {
      type: Function,
      default: null
    },

    // 错误重试次数
    maxRetries: {
      type: Number,
      default: 3
    }
  },

  data() {
    return {
      searchKeyword: '',
      scrollTop: 0,
      containerHeight: 0,
      hasError: false,
      errorInfo: null,
      retryCount: 0
    }
  },

  computed: {
    // 格式化后的数据
    formattedData() {
      try {
        const data = this.data || []
        return data.map((item, index) => {
          // 数据安全检查
          if (item === null || item === undefined) {
            return { _error: true, _originalIndex: index }
          }
          return item
        })
      } catch (error) {
        this.handleError(error, 'formattedData')
        return []
      }
    },

    // 过滤后的数据
    filteredData() {
      if (!this.enableModernFeatures || !this.searchKeyword) {
        return this.formattedData
      }
      
      try {
        const keyword = this.searchKeyword.toLowerCase()
        return this.formattedData.filter(item => {
          const label = this.safeGetItemLabel(item)
          return label.toLowerCase().includes(keyword)
        })
      } catch (error) {
        this.handleError(error, 'filteredData')
        return this.formattedData
      }
    },
    
    // 可见的标签项
    visibleItems() {
      try {
        const maxShow = Math.max(0, this.maxShow)
        const dataLength = this.formattedData.length
        return this.formattedData.slice(0, Math.min(maxShow, dataLength))
      } catch (error) {
        this.handleError(error, 'visibleItems')
        return []
      }
    },
    
    // 是否有更多标签
    hasMoreItems() {
      return this.formattedData.length > this.maxShow && this.maxShow >= 0
    },
    
    // 更多标签的数量
    moreItemsCount() {
      return Math.max(0, this.formattedData.length - this.maxShow)
    },

    // 是否启用虚拟滚动
    shouldVirtualize() {
      return this.enableModernFeatures && 
             this.enableVirtualScroll && 
             this.filteredData.length > this.virtualThreshold
    },

    // 虚拟滚动相关计算
    visibleVirtualItems() {
      if (!this.shouldVirtualize) return []
      
      const itemHeight = this.virtualItemHeight
      const containerHeight = this.containerHeight || 300
      const buffer = this.virtualBuffer
      
      const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - buffer)
      const endIndex = Math.min(
        this.filteredData.length,
        Math.ceil((this.scrollTop + containerHeight) / itemHeight) + buffer
      )
      
      return this.filteredData.slice(startIndex, endIndex).map((data, i) => ({
        data,
        index: startIndex + i
      }))
    },

    startOffset() {
      if (!this.shouldVirtualize) return 0
      const startIndex = Math.max(0, Math.floor(this.scrollTop / this.virtualItemHeight) - this.virtualBuffer)
      return startIndex * this.virtualItemHeight
    },

    totalHeight() {
      return this.filteredData.length * this.virtualItemHeight
    }
  },

  created() {
    // 创建防抖搜索函数
    this.debouncedSearch = debounce(this.performSearch, 300)
    
    // 初始化错误状态
    this.resetError()
  },

  mounted() {
    // 获取容器高度
    this.$nextTick(() => {
      this.updateContainerHeight()
    })
  },

  beforeDestroy() {
    // 清理防抖函数
    if (this.debouncedSearch && this.debouncedSearch.cancel) {
      this.debouncedSearch.cancel()
    }
  },

  methods: {
    // === 数据处理方法 ===
    // 安全获取标签显示文本
    safeGetItemLabel(item) {
      try {
        if (item && item._error) {
          return '[数据错误]'
        }
        
        if (this.labelKey && typeof item === 'object' && item !== null) {
          const label = item[this.labelKey]
          return label !== undefined && label !== null ? String(label) : '[无标签]'
        }
        
        return item !== undefined && item !== null ? String(item) : '[空值]'
      } catch (error) {
        console.warn('[OverflowTagsPopover] Error getting item label:', error)
        return '[获取失败]'
      }
    },

    // 获取项目唯一键
    getItemKey(item, index) {
      try {
        if (item && typeof item === 'object' && item.id) {
          return `item-${item.id}`
        }
        return `item-${index}-${this.safeGetItemLabel(item)}`
      } catch (error) {
        return `item-${index}`
      }
    },

    // 获取标签类型
    getTagType(item, index) {
      if (this.enableModernFeatures && this.tagTypeMapper) {
        try {
          return this.tagTypeMapper(item, index) || this.type
        } catch (error) {
          console.warn('[OverflowTagsPopover] Error in tagTypeMapper:', error)
        }
      }
      return this.type
    },

    // === 事件处理方法 ===
    // 标签点击事件
    handleTagClick(item, index) {
      if (this.enableModernFeatures) {
        this.$emit('tag-click', { item, index })
      }
    },

    // "更多"标签点击事件
    handleMoreTagClick() {
      if (this.enableModernFeatures) {
        this.$emit('more-click', {
          totalCount: this.formattedData.length,
          hiddenCount: this.moreItemsCount
        })
      }
    },

    // 搜索处理
    handleSearch(keyword) {
      if (this.enableModernFeatures) {
        this.debouncedSearch(keyword)
      }
    },

    performSearch(keyword) {
      this.searchKeyword = keyword
      this.$emit('search', keyword)
      
      // 重置滚动位置
      if (this.$refs.scrollContainer) {
        this.$refs.scrollContainer.scrollTop = 0
        this.scrollTop = 0
      }
    },

    // 滚动处理
    handleScroll(event) {
      if (this.shouldVirtualize) {
        this.scrollTop = event.target.scrollTop
      }
    },

    // 更新容器高度
    updateContainerHeight() {
      if (this.$refs.scrollContainer) {
        this.containerHeight = this.$refs.scrollContainer.clientHeight
      }
    },

    // === 现代化功能方法 ===
    // 全选处理
    handleSelectAll() {
      this.$emit('select-all', this.filteredData)
    },

    // 导出处理
    handleExport() {
      try {
        const data = this.filteredData.map((item, index) => ({
          index: index + 1,
          label: this.safeGetItemLabel(item),
          raw: item
        }))
        
        this.$emit('export', data)
      } catch (error) {
        this.handleError(error, 'export')
      }
    },

    // === 错误处理方法 ===
    // 处理错误
    handleError(error, context = 'unknown') {
      console.error(`[OverflowTagsPopover] Error in ${context}:`, error)
      
      if (this.enableModernFeatures) {
        this.hasError = true
        this.errorInfo = {
          message: error.message || '未知错误',
          context,
          retryable: this.retryCount < this.maxRetries,
          timestamp: new Date().toISOString()
        }
        
        this.$emit('error', this.errorInfo)
      }
    },

    // 重试处理
    handleRetry() {
      if (this.retryCount >= this.maxRetries) {
        this.$message.warning('重试次数已达上限')
        return
      }
      
      this.retryCount++
      this.resetError()
      this.$emit('retry', this.retryCount)
    },

    // 重置错误状态
    resetError() {
      this.hasError = false
      this.errorInfo = null
    }
  },

  watch: {
    // 监听数据变化，重置错误状态
    data: {
      handler() {
        this.resetError()
        this.retryCount = 0
      },
      immediate: false
    },

    // 监听现代化特性开关
    enableModernFeatures: {
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.updateContainerHeight()
          })
        }
      },
      immediate: false
    }
  }
}
</script>

<style lang="scss" scoped>
.overflow-tags-popover {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;

  &.modern-mode {
    .more-tag-modern {
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .more-icon {
        margin-left: 4px;
        font-size: 10px;
        transition: transform 0.2s ease;
      }
    }

    .interactive-tag {
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .more-tag {
    cursor: pointer;
  }

  .empty-text {
    color: #909399;
    font-size: 12px;
  }

  .error-state {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #F56C6C;
    font-size: 12px;

    .error-text {
      color: #F56C6C;
    }
  }

  .loading-state {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #909399;
    font-size: 12px;

    .loading-text {
      color: #909399;
    }
  }
}

// 弹出框样式
.overflow-tags-popover-panel {
  .overflow-tags-list {
    .overflow-tags-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;

      .header-title {
        flex: 1;
      }

      .header-count {
        color: #909399;
        font-size: 12px;
        font-weight: normal;
      }
    }

    .overflow-tags-search {
      margin-bottom: 8px;
    }

    .overflow-tags-content {
      max-height: 300px;
      overflow-y: auto;

      // 自定义滚动条
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;

        &:hover {
          background: #909399;
        }
      }
    }

    .overflow-tags-item {
      padding: 6px 0;
      border-bottom: 1px dashed #ebeef5;
      word-break: break-word;

      &:last-child {
        border-bottom: none;
      }

      &.virtual-item {
        display: flex;
        align-items: center;
        margin: 0;
        border-bottom: 1px dashed #ebeef5;
      }
    }

    .virtual-scroll-container {
      position: relative;

      .virtual-total {
        position: relative;
      }

      .virtual-items {
        position: relative;
      }
    }

    .no-results {
      text-align: center;
      color: #909399;
      padding: 20px 0;
      font-size: 12px;
    }

    .overflow-tags-footer {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #ebeef5;
      text-align: right;

      .el-button + .el-button {
        margin-left: 8px;
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .overflow-tags-popover-panel {
    .overflow-tags-list {
      .overflow-tags-content {
        max-height: 200px;
      }
    }
  }
}
</style>
