/**
 * 文件名称：TaskSearch.vue
 * 文件描述：退火任务搜索组件，基于全局SearchForm实现筛选功能
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，实现核心搜索与高级筛选折叠
 */
<template>
  <div class="task-search">
    <SearchForm
      :items="orderedSearchItems"
      :loading="loading"
      :visible-item-count="primaryFieldCount"
      :value="localQuery"
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #buttons>
        <el-popover
          placement="bottom"
          trigger="hover"
          width="300"
          popper-class="filter-tooltip"
        >
          <div class="tooltip-content">
            <div class="tooltip-title">任务状态说明</div>
            <div class="status-tags">
              <StatusTag :status="TASK_STATUS.DRAFT" :text-map="statusConfig.textMap" :type-map="statusConfig.typeMap" />
              <StatusTag :status="TASK_STATUS.PENDING_SCHEDULE" :text-map="statusConfig.textMap" :type-map="statusConfig.typeMap" />
              <StatusTag :status="TASK_STATUS.SCHEDULED" :text-map="statusConfig.textMap" :type-map="statusConfig.typeMap" />
              <StatusTag :status="TASK_STATUS.IN_PROGRESS" :text-map="statusConfig.textMap" :type-map="statusConfig.typeMap" />
              <StatusTag :status="TASK_STATUS.COMPLETED" :text-map="statusConfig.textMap" :type-map="statusConfig.typeMap" />
            </div>
            <ul>
              <li>草稿：任务已创建，尚未提交排程</li>
              <li>待排程：任务已提交，等待排程系统分配炉号时间</li>
              <li>已排程：已分配炉号和时间，等待装炉</li>
              <li>执行中：退火炉正在执行退火工艺</li>
              <li>已完成：出炉完成，任务结束</li>
            </ul>
          </div>
          <el-button slot="reference" type="text" class="status-info">状态说明</el-button>
        </el-popover>
      </template>
    </SearchForm>
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import StatusTag from '@/components/StatusTag'
import { SEARCH_FORM_CONFIG } from '../constants/form-config'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  TASK_STATUS,
  STATUS_CONFIG
} from '../constants'

export default {
  name: 'TaskSearch',
  components: {
    SearchForm,
    StatusTag
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localQuery: {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        ...this.value
      }
    }
  },
  computed: {
    orderedSearchItems() {
      const primary = SEARCH_FORM_CONFIG.filter((item) => item.priority === 'primary')
      const advanced = SEARCH_FORM_CONFIG.filter((item) => item.priority === 'advanced')
      return [...primary, ...advanced]
    },
    primaryFieldCount() {
      const primaryCount = this.orderedSearchItems.filter((item) => item.priority === 'primary').length
      return Math.max(primaryCount, 1)
    },
    statusConfig() {
      return STATUS_CONFIG
    },
    TASK_STATUS() {
      return TASK_STATUS
    }
  },
  watch: {
    value: {
      deep: true,
      handler(newVal) {
        this.localQuery = {
          ...DEFAULT_PAGINATION,
          sortBy: DEFAULT_SORT,
          ...newVal
        }
      }
    }
  },
  methods: {
    handleSearch(formValues) {
      const sanitized = this.normalizeQuery(formValues)
      const payload = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT,
        ...sanitized
      }
      this.localQuery = { ...payload }
      this.$emit('search', payload)
      this.$emit('input', { ...payload })
    },
    handleReset() {
      this.localQuery = {
        ...DEFAULT_PAGINATION,
        sortBy: DEFAULT_SORT
      }
      this.$emit('reset', { ...this.localQuery })
      this.$emit('input', { ...this.localQuery })
    },
    normalizeQuery(values = {}) {
      const result = {}
      Object.keys(values).forEach((key) => {
        const value = values[key]
        if (value === undefined || value === null || value === '') {
          return
        }
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return
          }
          // 处理状态多选
          if (key === 'status' && value.length > 0) {
            // 接口支持多状态筛选，但需要单独传递，这里先使用第一个值
            result[key] = value[0]
          } else {
            result[key] = value
          }
          return
        }
        if (typeof value === 'string') {
          const trimmed = value.trim()
          if (!trimmed) {
            return
          }
          // 自动转换为大写的字段
          result[key] = ['plannedFurnaceCode', 'productCode', 'alloyGrade'].includes(key)
            ? trimmed.toUpperCase()
            : trimmed
          return
        }
        // 处理日期时间类型
        if (value instanceof Date) {
          result[key] = value.toISOString()
          return
        }
        result[key] = value
      })

      return result
    }
  }
}
</script>

<style scoped>
.status-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.status-tags .el-tag {
  margin: 0;
}

.tooltip-content {
  font-size: 14px;
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.tooltip-content ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.tooltip-content li {
  margin: 4px 0;
  color: #606266;
  line-height: 1.5;
}

.status-info {
  padding: 0 4px;
  font-size: 13px;
}
</style>

