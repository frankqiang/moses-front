/**
 * 溢出标签弹出框组件
 * 功能描述：用于在表格单元格中显示多个标签，当标签数量超过设定值时，以弹出框形式显示全部标签
 * 创建日期：2024-11-18
 */
<template>
  <div class="overflow-tags-popover">
    <!-- 显示的标签 -->
    <template v-if="formattedData.length > 0">
      <!-- 直接显示的标签 -->
      <template v-for="(item, index) in visibleItems">
        <slot name="tag" :item="item" :index="index">
          <el-tag 
            :key="index" 
            :size="size" 
            :type="type"
            :effect="effect"
            :class="tagClass"
          >
            {{ getItemLabel(item) }}
          </el-tag>
        </slot>
      </template>
      
      <!-- 溢出标签的弹出框 -->
      <el-popover
        v-if="hasMoreItems"
        :placement="placement"
        :width="popoverWidth"
        :trigger="trigger"
        :popper-class="popoverClass"
      >
        <div class="overflow-tags-list">
          <div class="overflow-tags-header" v-if="title">{{ title }}</div>
          <div class="overflow-tags-content">
            <div 
              v-for="(item, index) in formattedData" 
              :key="index" 
              class="overflow-tags-item"
            >
              <slot name="popover-item" :item="item" :index="index">
                <span>{{ index + 1 }}. {{ getItemLabel(item) }}</span>
              </slot>
            </div>
          </div>
        </div>
        
        <!-- 触发弹出框的标签 -->
        <slot 
          name="more-tag" 
          :count="moreItemsCount" 
          slot="reference"
        >
          <el-tag 
            :size="size" 
            :type="type"
            :effect="effect"
            class="more-tag"
            style="cursor: pointer"
          >
            +{{ moreItemsCount }}
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
export default {
  name: 'OverflowTagsPopover',
  props: {
    // 标签数据
    data: {
      type: Array,
      default: () => []
    },
    // 最大显示数量
    maxShow: {
      type: Number,
      default: 1
    },
    // 对象数组时的标签文本字段
    labelKey: {
      type: String,
      default: null
    },
    // 弹出框标题
    title: {
      type: String,
      default: ''
    },
    // 弹出框宽度
    popoverWidth: {
      type: Number,
      default: 300
    },
    // 弹出框位置
    placement: {
      type: String,
      default: 'top'
    },
    // 触发方式
    trigger: {
      type: String,
      default: 'click'
    },
    // 弹出框类名
    popoverClass: {
      type: String,
      default: ''
    },
    // 标签大小
    size: {
      type: String,
      default: 'small'
    },
    // 标签类型
    type: {
      type: String,
      default: 'primary'
    },
    // 标签效果
    effect: {
      type: String,
      default: 'light'
    },
    // 标签类名
    tagClass: {
      type: String,
      default: ''
    },
    // 空数据文本
    emptyText: {
      type: String,
      default: '-'
    }
  },
  computed: {
    // 格式化后的数据
    formattedData() {
      return this.data || []
    },
    // 可见的标签项
    visibleItems() {
      return this.formattedData.slice(0, Math.min(this.maxShow, this.formattedData.length))
    },
    // 是否有更多标签
    hasMoreItems() {
      return this.formattedData.length > this.maxShow
    },
    // 更多标签的数量
    moreItemsCount() {
      return this.formattedData.length - this.maxShow
    }
  },
  methods: {
    // 获取标签显示文本
    getItemLabel(item) {
      if (this.labelKey && typeof item === 'object') {
        return item[this.labelKey]
      }
      return item
    }
  }
}
</script>

<style lang="scss" scoped>
.overflow-tags-popover {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  
  .more-tag {
    cursor: pointer;
  }
  
  .empty-text {
    color: #909399;
  }
}

.overflow-tags-list {
  .overflow-tags-header {
    font-weight: bold;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }
  
  .overflow-tags-content {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .overflow-tags-item {
    padding: 4px 0;
    border-bottom: 1px dashed #ebeef5;
    
    &:last-child {
      border-bottom: none;
    }
  }
}
</style> 