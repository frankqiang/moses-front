<!--
文件名称：DiffList.vue
文件描述：差异列表组件，用于展示数组类型配置的变化，支持差异高亮
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，实现列表差异展示
-->

<template>
  <div class="diff-list">
    <div
      v-for="(item, index) in filteredItems"
      :key="index"
      class="diff-list__item"
      :class="{ 'diff-list__item--changed': item.changed }"
    >
      <header class="diff-list__item-header">
        <span class="diff-list__item-title">
          {{ buildTitle(item, index) }}
        </span>
        <el-tag v-if="item.changed" size="mini" type="warning">已修改</el-tag>
      </header>

      <div class="diff-list__columns">
        <div class="diff-list__column">
          <div class="diff-list__column-title">当前版本</div>
          <pre class="diff-list__content">{{ formatDisplay(item.current) }}</pre>
        </div>
        <div class="diff-list__column">
          <div class="diff-list__column-title">对比版本</div>
          <pre class="diff-list__content">{{ formatDisplay(item.compare) }}</pre>
        </div>
      </div>
    </div>

    <el-alert
      v-if="!filteredItems.length"
      type="info"
      :closable="false"
      show-icon
      title="暂无差异"
    />
  </div>
</template>

<script>
export default {
  name: 'DiffList',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    itemTitle: {
      type: String,
      default: '条目'
    },
    highlightMode: {
      type: String,
      default: 'diff'
    },
    formatItem: {
      type: Function,
      default: value => value
    }
  },
  computed: {
    filteredItems() {
      if (this.highlightMode === 'diff') {
        return this.items.filter(item => item?.changed)
      }
      return this.items
    }
  },
  methods: {
    buildTitle(item, index) {
      if (!item) {
        return `${this.itemTitle} #${index + 1}`
      }
      const display = this.formatItem(item.current) || this.formatItem(item.compare)
      if (display && display !== '-') {
        return display
      }
      return `${this.itemTitle} #${index + 1}`
    },
    formatDisplay(value) {
      if (!value) {
        return '-'
      }
      if (typeof value === 'string') {
        return value
      }
      return JSON.stringify(value, null, 2)
    }
  }
}
</script>

<style lang="scss" scoped>
.diff-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__item {
    border: 1px solid #ebeef5;
    border-radius: 10px;
    padding: 12px 16px;
    background: #ffffff;

    &--changed {
      border-color: #f6ad55;
      box-shadow: 0 8px 18px rgba(230, 126, 34, 0.1);
    }
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__item-title {
    font-weight: 600;
    color: #1f2d3d;
  }

  &__columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  &__column-title {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  &__content {
    background: #f7f8fa;
    border-radius: 8px;
    margin: 0;
    padding: 10px;
    font-size: 12px;
    line-height: 1.5;
    color: #303133;
    white-space: pre-wrap;
  }
}
</style>
