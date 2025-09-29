<!--
文件名称：TemplateTable.vue
文件描述：工艺参数模板列表表格组件，基于BaseTable等全局组件实现
创建日期：2025-09-29
修改记录：
  - 2025-09-29: 初始创建，实现TASK004 P0阶段核心功能
-->

<template>
  <div class="template-table">
    <!-- 使用BaseTable组件渲染模板列表 -->
    <BaseTable
      :data="data"
      :columns="tableColumns"
      :loading="loading"
      :load-error="loadError"
      :pagination="paginationConfig"
      :show-selection="false"
      :show-index="true"
      :virtual-scroll="enableVirtualScroll"
      :virtual-threshold="1000"
      :virtual-height="600"
      :item-height="48"
      :allow-retry="true"
      :index-method="getIndexMethod"
      border
      stripe
      highlight-current-row
      @retry="handleRetry"
      @row-click="handleRowClick"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
    >
      <!-- 模板状态列 -->
      <template #templateStatus="{ row }">
        <StatusTag
          :status="row.status"
          :text-map="templateStatusConfig.textMap"
          :type-map="templateStatusConfig.typeMap"
          size="small"
        />
      </template>

      <!-- 适用产品列 - 使用OverflowTagsPopover处理溢出 -->
      <template #applicableProducts="{ row }">
        <OverflowTagsPopover
          v-if="row.applicableProducts && row.applicableProducts.length > 0"
          :data="row.applicableProducts"
          :max-show="2"
          :enable-modern-features="true"
          size="mini"
          type="primary"
          title="适用产品列表"
          :popover-width="400"
          placement="top"
          label-key="productName"
          :tag-formatter="formatProductTag"
        >
          <!-- 自定义弹出框内容 -->
          <template #popover-item="{ item }">
            <div class="product-item">
              <div class="product-main">
                <span class="product-code">{{ item.productCode }}</span>
                <span class="product-name">{{ item.productName }}</span>
              </div>
              <div class="product-meta">
                <StatusTag
                  :status="item.lifecycleStatus"
                  :text-map="productStatusTextMap"
                  :type-map="productStatusTypeMap"
                  size="mini"
                />
              </div>
            </div>
          </template>
        </OverflowTagsPopover>
        <span v-else class="empty-text">-</span>
      </template>

      <!-- 最新版本状态列 -->
      <template #latestVersionStatus="{ row }">
        <StatusTag
          v-if="row.latestVersion && row.latestVersion.status"
          :status="row.latestVersion.status"
          :text-map="versionStatusConfig.textMap"
          :type-map="versionStatusConfig.typeMap"
          size="small"
        />
        <span v-else class="empty-text">-</span>
      </template>

      <!-- 温度段概览列 -->
      <template #segmentSummary="{ row }">
        <div v-if="row.latestVersion && row.latestVersion.segments && row.latestVersion.segments.length > 0" class="segment-summary">
          <div
            v-for="(segment, index) in getVisibleSegments(row.latestVersion.segments)"
            :key="segment.id || index"
            class="segment-item"
            :style="{ backgroundColor: getSegmentColor(segment.segmentType) }"
          >
            <span class="segment-order">{{ segment.segmentOrder }}</span>
            <span class="segment-type">{{ segment.segmentType }}</span>
            <span class="segment-temp">{{ segment.targetTemperature }}°C</span>
          </div>
          <div
            v-if="row.latestVersion.segments.length > maxVisibleSegments"
            class="segment-more"
          >
            +{{ row.latestVersion.segments.length - maxVisibleSegments }}
          </div>
        </div>
        <span v-else class="empty-text">-</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <ActionButtons
          :buttons="getActionButtons(row)"
          mode="text"
          :row="row"
          size="small"
          :max-visible="3"
          @click="handleActionClick"
        />
      </template>

      <!-- 空状态自定义 -->
      <template #empty>
        <div class="custom-empty">
          <i class="el-icon-document-remove" style="font-size: 48px; color: #c0c4cc;" />
          <p>暂无工艺模板数据</p>
          <p class="empty-tip">您可以点击"新建模板"按钮创建第一个工艺模板</p>
          <el-button type="primary" size="small" @click="handleCreateTemplate">
            新建模板
          </el-button>
        </div>
      </template>
    </BaseTable>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS
} from '../constants'
import {
  TEMPLATE_STATUS_CONFIG,
  VERSION_STATUS_CONFIG,
  SEGMENT_COLOR_MAP
} from '../constants'

export default {
  name: 'TemplateTable',
  components: {
    BaseTable,
    StatusTag,
    ActionButtons,
    OverflowTagsPopover
  },
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 加载错误状态
    loadError: {
      type: [Boolean, String, Error],
      default: false
    },
    // 分页配置
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 10,
        total: 0
      })
    },
    // 可见列配置
    visibleColumns: {
      type: Array,
      default: () => DEFAULT_VISIBLE_COLUMNS
    }
  },
  data() {
    return {
      // 温度段概览最大显示数量
      maxVisibleSegments: 3
    }
  },
  computed: {
    // 模板状态配置
    templateStatusConfig() {
      return TEMPLATE_STATUS_CONFIG
    },
    // 版本状态配置
    versionStatusConfig() {
      return VERSION_STATUS_CONFIG
    },
    // 产品状态文本映射
    productStatusTextMap() {
      return {
        '在产': '在产',
        '停产': '停产',
        '试产': '试产'
      }
    },
    // 产品状态类型映射
    productStatusTypeMap() {
      return {
        '在产': 'success',
        '停产': 'danger',
        '试产': 'warning'
      }
    },
    // 是否启用虚拟滚动
    enableVirtualScroll() {
      return this.data.length > 100
    },
    // 表格列配置 - 根据可见列过滤
    tableColumns() {
      return TABLE_COLUMNS.filter(col =>
        this.visibleColumns.includes(col.columnId)
      )
    },
    // 分页配置
    paginationConfig() {
      return {
        total: this.pagination.total,
        page: this.pagination.page,
        limit: this.pagination.limit,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper',
        background: true,
        autoScroll: true
      }
    }
  },
  methods: {
    /**
     * 获取序号计算方法
     */
    getIndexMethod(index) {
      return (this.pagination.page - 1) * this.pagination.limit + index + 1
    },

    /**
     * 格式化产品标签
     */
    formatProductTag(product) {
      return `${product.productCode} - ${product.productName}`
    },

    /**
     * 获取可见的温度段（最多显示前几个）
     */
    getVisibleSegments(segments) {
      if (!segments || segments.length === 0) return []
      return segments.slice(0, this.maxVisibleSegments)
    },

    /**
     * 获取温度段颜色
     */
    getSegmentColor(segmentType) {
      const color = SEGMENT_COLOR_MAP[segmentType]
      return color ? `${color}20` : '#f5f5f5' // 20% 透明度
    },

    /**
     * 获取操作按钮配置
     */
    getActionButtons(row) {
      const buttons = []
      const template = row
      const latestVersion = row.latestVersion

      // 查看详情 - 总是可用
      buttons.push({
        action: 'viewDetail',
        text: '查看详情',
        icon: 'el-icon-view',
        type: 'text',
        tooltip: '查看工艺模板详细信息'
      })

      // 编辑模板 - 草稿/驳回状态可编辑
      if (this.canEditTemplate(template, latestVersion)) {
        buttons.push({
          action: 'editTemplate',
          text: '编辑模板',
          icon: 'el-icon-edit',
          type: 'text',
          tooltip: '编辑模板基础信息'
        })
      }

      // 新建版本 - 生效/历史状态可新建版本
      if (this.canCreateVersion(template, latestVersion)) {
        buttons.push({
          action: 'createVersion',
          text: '新建版本',
          icon: 'el-icon-plus',
          type: 'text',
          tooltip: '基于当前模板创建新版本'
        })
      }

      // 审批相关操作
      if (latestVersion) {
        // 提交审批 - 草稿/驳回状态可提交
        if (this.canSubmitApproval(latestVersion)) {
          buttons.push({
            action: 'submitApproval',
            text: '提交审批',
            icon: 'el-icon-s-promotion',
            type: 'text',
            tooltip: '提交版本至审批流程'
          })
        }

        // 审批通过 - 待审批状态可审批
        if (this.canApprove(latestVersion)) {
          buttons.push({
            action: 'approve',
            text: '审批通过',
            icon: 'el-icon-check',
            type: 'text',
            tooltip: '审批通过该版本'
          })
        }

        // 审批驳回 - 待审批状态可驳回
        if (this.canReject(latestVersion)) {
          buttons.push({
            action: 'reject',
            text: '审批驳回',
            icon: 'el-icon-close',
            type: 'text',
            tooltip: '驳回该版本审批'
          })
        }

        // 撤回审批 - 待审批状态可撤回
        if (this.canWithdraw(latestVersion)) {
          buttons.push({
            action: 'withdraw',
            text: '撤回审批',
            icon: 'el-icon-refresh-left',
            type: 'text',
            tooltip: '撤回版本审批'
          })
        }

        // 快速生效 - 草稿/驳回状态可快速生效
        if (this.canActivate(latestVersion)) {
          buttons.push({
            action: 'activate',
            text: '快速生效',
            icon: 'el-icon-success',
            type: 'text',
            tooltip: '跳过审批直接生效',
            confirmText: '确认快速生效该版本吗？'
          })
        }

        // 作废版本 - 待审批/生效状态可作废
        if (this.canVoid(latestVersion)) {
          buttons.push({
            action: 'void',
            text: '作废版本',
            icon: 'el-icon-delete',
            type: 'text',
            tooltip: '作废该版本',
            confirmText: '确认作废该版本吗？此操作不可恢复'
          })
        }
      }

      // 复制模板 - 总是可用
      buttons.push({
        action: 'copy',
        text: '复制模板',
        icon: 'el-icon-document-copy',
        type: 'text',
        tooltip: '复制模板创建新模板'
      })

      // 删除模板 - 非生效状态可删除
      if (this.canDelete(template, latestVersion)) {
        buttons.push({
          action: 'delete',
          text: '删除',
          icon: 'el-icon-delete',
          type: 'text',
          tooltip: '删除工艺模板',
          confirmText: '确认删除该模板吗？此操作不可恢复',
          danger: true
        })
      }

      return buttons
    },

    /**
     * 判断是否可以编辑模板
     */
    canEditTemplate(template, latestVersion) {
      if (!latestVersion) return true
      return ['草稿', '驳回'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以新建版本
     */
    canCreateVersion(template, latestVersion) {
      if (!latestVersion) return false
      return ['生效', '历史'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以提交审批
     */
    canSubmitApproval(latestVersion) {
      return ['草稿', '驳回'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以审批通过
     */
    canApprove(latestVersion) {
      return latestVersion.status === '待审批'
    },

    /**
     * 判断是否可以审批驳回
     */
    canReject(latestVersion) {
      return latestVersion.status === '待审批'
    },

    /**
     * 判断是否可以撤回审批
     */
    canWithdraw(latestVersion) {
      return latestVersion.status === '待审批'
    },

    /**
     * 判断是否可以快速生效
     */
    canActivate(latestVersion) {
      return ['草稿', '驳回'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以作废
     */
    canVoid(latestVersion) {
      return ['待审批', '生效'].includes(latestVersion.status)
    },

    /**
     * 判断是否可以删除模板
     */
    canDelete(template, latestVersion) {
      if (!latestVersion) return true
      return latestVersion.status !== '生效'
    },

    /**
     * 处理操作按钮点击
     */
    handleActionClick(action, row) {
      // 发送操作事件给父组件，附带模板和版本信息
      this.$emit('action', {
        action: action.action,
        template: row,
        version: row.latestVersion,
        templateId: row.id,
        versionId: row.latestVersion?.id
      })
    },

    /**
     * 处理行点击
     */
    handleRowClick(row) {
      this.$emit('row-click', row)
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange(pagination) {
      this.$emit('pagination-change', pagination)
    },

    /**
     * 处理排序变化
     */
    handleSortChange(sortInfo) {
      this.$emit('sort-change', sortInfo)
    },

    /**
     * 处理重试
     */
    handleRetry() {
      this.$emit('retry')
    },

    /**
     * 处理创建模板（空状态按钮）
     */
    handleCreateTemplate() {
      this.$emit('create')
    }
  }
}
</script>

<style lang="scss" scoped>
.template-table {
  .custom-empty {
    text-align: center;
    padding: 40px 20px;
    color: #909399;

    p {
      margin: 16px 0 8px;
      font-size: 14px;
    }

    .empty-tip {
      font-size: 12px;
      color: #c0c4cc;
    }
  }

  .empty-text {
    color: #c0c4cc;
    font-style: italic;
  }

  // 产品项样式
  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .product-main {
      flex: 1;

      .product-code {
        font-weight: 500;
        color: #303133;
        margin-right: 8px;
      }

      .product-name {
        color: #606266;
        font-size: 12px;
      }
    }

    .product-meta {
      margin-left: 12px;
    }
  }

  // 温度段概览样式
  .segment-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;

    .segment-item {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      border-radius: 12px;
      font-size: 11px;
      line-height: 1.2;
      border: 1px solid rgba(0, 0, 0, 0.1);

      .segment-order {
        font-weight: 600;
        margin-right: 2px;
      }

      .segment-type {
        margin-right: 4px;
        color: #666;
      }

      .segment-temp {
        font-weight: 500;
        color: #333;
      }
    }

    .segment-more {
      padding: 2px 6px;
      background: #f5f5f5;
      border-radius: 10px;
      font-size: 11px;
      color: #999;
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .template-table {
    .segment-summary {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;

      .segment-item {
        font-size: 10px;
        padding: 1px 4px;
      }
    }

    .product-item {
      flex-direction: column;
      align-items: flex-start;

      .product-meta {
        margin-left: 0;
        margin-top: 4px;
      }
    }
  }
}
</style>
