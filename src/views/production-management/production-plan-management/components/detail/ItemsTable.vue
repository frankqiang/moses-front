/**
 * 文件名称：ItemsTable.vue
 * 文件描述：生产计划子批次列表组件
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-10-17: 根据接口文档重构，添加所有缺失字段，优化数据展示
 *   - 2025-10-17: 更新工艺和设备数据结构，适配后端返回的 processTemplate 和 equipment 对象
 */

<template>
  <div class="items-table">
    <el-table
      :data="displayItems"
      border
      stripe
      :default-sort="{ prop: 'sequence', order: 'ascending' }"
      @sort-change="handleSortChange"
    >
      <el-table-column
        prop="itemNumber"
        label="子计划编号"
        min-width="150"
        sortable="custom"
      />
      <el-table-column
        prop="sequence"
        label="拆分序号"
        width="100"
        sortable="custom"
        align="center"
      />
      <el-table-column
        prop="plannedWeight"
        label="预计重量(吨)"
        width="120"
        sortable="custom"
        align="right"
      >
        <template slot-scope="{ row }">
          {{ row.plannedWeight ? row.plannedWeight.toFixed(3) : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="plannedQuantity"
        label="预计数量"
        width="100"
        sortable="custom"
        align="right"
      >
        <template slot-scope="{ row }">
          {{ row.plannedQuantity || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="状态"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="计划装炉时段"
        min-width="180"
      >
        <template slot-scope="{ row }">
          <div v-if="row.expectedFurnaceWindowStart && row.expectedFurnaceWindowEnd">
            {{ formatTime(row.expectedFurnaceWindowStart) }}
            <br>
            至 {{ formatTime(row.expectedFurnaceWindowEnd) }}
          </div>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column
        label="工艺模板"
        min-width="150"
      >
        <template slot-scope="{ row }">
          {{ row.processTemplate ? row.processTemplate.name : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="工艺关联类型"
        width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          {{ row.processTemplate ? getProcessLinkTypeText(row.processTemplate.linkType) : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="remarks"
        label="备注"
        min-width="150"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          {{ row.remarks || '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="时间信息"
        min-width="180"
      >
        <template slot-scope="{ row }">
          <div class="time-info">
            <div>创建：{{ formatTime(row.createdAt) }}</div>
            <div>更新：{{ formatTime(row.updatedAt) }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button
            v-if="canGenerateTask(row)"
            type="text"
            size="small"
            icon="el-icon-s-operation"
            @click="handleGenerateTask(row)"
          >
            生成退火任务
          </el-button>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty
      v-if="!items || items.length === 0"
      description="暂无子批次数据"
      :image-size="100"
    />
  </div>
</template>

<script>
import { parseTime } from '@/utils'
import dictionaryMixin from '../../mixins/dictionary'

export default {
  name: 'ItemsTable',
  mixins: [dictionaryMixin],
  props: {
    items: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sortProp: 'sequence',
      sortOrder: 'ascending',
      // UI样式映射（保留用于标签颜色）
      itemStatusTypeMap: {
        DRAFT: 'info',
        READY_FOR_SCHEDULING: 'warning',
        SCHEDULED: 'primary',
        READY_FOR_EXECUTION: 'warning',
        RELEASED: 'success',
        IN_PROGRESS: 'success',
        COMPLETED: 'success',
        CANCELLED: 'danger'
      }
    }
  },
  computed: {
    /**
     * 显示的子批次列表
     * 根据接口文档：子批次项按sequence字段升序排序
     */
    displayItems() {
      if (!this.items || this.items.length === 0) {
        return []
      }
      // 排序（根据当前排序字段和顺序）
      const sortedItems = [...this.items]
      sortedItems.sort((a, b) => {
        const prop = this.sortProp
        const order = this.sortOrder === 'ascending' ? 1 : -1

        // 处理null/undefined值
        const aValue = a[prop] ?? ''
        const bValue = b[prop] ?? ''

        if (aValue < bValue) return -1 * order
        if (aValue > bValue) return 1 * order
        return 0
      })
      return sortedItems
    }
  },
  methods: {
    /**
     * 处理排序变化
     */
    handleSortChange({ prop, order }) {
      this.sortProp = prop
      this.sortOrder = order
    },

    /**
     * 获取状态文本（使用字典系统）
     */
    getStatusText(status) {
      return this.getPlanItemStatusLabel(status) || '-'
    },

    /**
     * 获取状态类型
     */
    getStatusType(status) {
      return this.itemStatusTypeMap[status] || 'info'
    },

    /**
     * 获取工艺模板关联类型文本
     * 根据接口文档附录：processTemplateLinkType枚举
     */
    getProcessLinkTypeText(linkType) {
      const map = {
        PRIMARY: '主工艺',
        BACKUP: '备用工艺',
        MANUAL_OVERRIDE: '手动指定'
      }
      return map[linkType] || linkType || '-'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}') : '-'
    },

    /**
     * 判断是否可以生成退火任务
     * 只有草稿(DRAFT)或待排程(READY_FOR_SCHEDULING)状态的批次可以生成任务
     *
     * 📢 状态流转说明：
     * - 生成任务前：状态为 DRAFT 或 READY_FOR_SCHEDULING
     * - 生成任务后：后端自动更新状态为 SCHEDULED（已排程）
     * - 状态为 SCHEDULED 后：此按钮会自动隐藏，避免重复生成
     *
     * 参考：
     * - docs/接口文档/单独接口/创建退火任务接口详细说明.md
     * - docs/创建退火任务自动更新子批次状态功能说明.md
     */
    canGenerateTask(item) {
      return item.status === 'DRAFT' || item.status === 'READY_FOR_SCHEDULING'
    },

    /**
     * 处理生成退火任务
     */
    handleGenerateTask(item) {
      this.$emit('generate-task', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.items-table {
  .time-info {
    font-size: 12px;
    color: #909399;
    line-height: 1.5;

    div {
      margin: 2px 0;
    }
  }

  .text-muted {
    color: #909399;
  }
}
</style>

