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
          <div class="diff-list__content">
            <div
              v-for="(value, key) in getFieldMap(item.current)"
              :key="key"
              class="diff-list__field"
            >
              <span class="diff-list__field-key">{{ key }}:</span>
              <span class="diff-list__field-value">{{ value }}</span>
            </div>
            <div v-if="!item.current" class="diff-list__empty">-</div>
          </div>
        </div>
        <div class="diff-list__column">
          <div class="diff-list__column-title">对比版本</div>
          <div class="diff-list__content">
            <div
              v-for="(value, key) in getFieldMap(item.compare)"
              :key="key"
              class="diff-list__field"
              :class="{ 'diff-list__field--changed': isFieldChanged(item, key) }"
            >
              <span class="diff-list__field-key">{{ key }}:</span>
              <span class="diff-list__field-value">{{ value }}</span>
            </div>
            <div v-if="!item.compare" class="diff-list__empty">-</div>
          </div>
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

    /**
     * 获取对象的字段映射（用于显示）
     * @param {Object} value - 对象值
     * @returns {Object} 字段映射
     */
    getFieldMap(value) {
      if (!value || typeof value !== 'object') {
        return {}
      }

      // 字段名称映射（中文显示）
      const fieldLabels = {
        segmentOrder: '段序号',
        controlMode: '控制模式',
        furnaceTemperature: '炉温(℃)',
        materialTemperature: '料温(℃)',
        timeSet: '时间设置(min)',
        runTime: '运行时间(min)',
        circulationFanSpeed: '循环风机转速(%)',
        negativePressureFan: '负压风机(%)',
        cleaningFan: '清洗风机(%)',
        cleaningTime: '清洗时间(min)'
      }

      const result = {}
      Object.keys(value).forEach(key => {
        // 跳过元数据字段
        if (['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'isDeleted'].includes(key)) {
          return
        }

        const label = fieldLabels[key] || key
        const val = value[key]
        result[label] = val === null || val === undefined ? '-' : val
      })

      return result
    },

    /**
     * 判断字段是否有变化（只高亮对比版本中变化的字段）
     * @param {Object} item - 对比项
     * @param {String} fieldLabel - 字段标签
     * @returns {Boolean} 是否有变化
     */
    isFieldChanged(item, fieldLabel) {
      if (!item.changed || !item.current || !item.compare) {
        return false
      }

      // 字段名称反向映射
      const fieldKeys = {
        '段序号': 'segmentOrder',
        '控制模式': 'controlMode',
        '炉温(℃)': 'furnaceTemperature',
        '料温(℃)': 'materialTemperature',
        '时间设置(min)': 'timeSet',
        '运行时间(min)': 'runTime',
        '循环风机转速(%)': 'circulationFanSpeed',
        '负压风机(%)': 'negativePressureFan',
        '清洗风机(%)': 'cleaningFan',
        '清洗时间(min)': 'cleaningTime'
      }

      const key = fieldKeys[fieldLabel] || fieldLabel
      return item.current[key] !== item.compare[key]
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
  }

  &__field {
    display: flex;
    align-items: baseline;
    padding: 4px 0;

    &--changed {
      background: rgba(230, 126, 34, 0.1);
      margin: 0 -10px;
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 600;
      color: #e67e22;
    }
  }

  &__field-key {
    flex-shrink: 0;
    margin-right: 8px;
    color: #909399;
    font-weight: 500;
    min-width: 130px;
  }

  &__field-value {
    word-break: break-word;
  }

  &__empty {
    color: #c0c4cc;
    font-style: italic;
  }
}
</style>
