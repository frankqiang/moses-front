<!--
文件名称: AreaDetailDrawer.vue
文件描述: 库区详情抽屉组件
创建日期: 2025-01-20
修改记录:
  - 2025-01-20: 初始创建
-->

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    title="库区详情"
    :show-footer="false"
    width="600px"
  >
    <div v-if="detailData" class="detail-container">
      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="section-title">基本信息</div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">库区代码:</span>
            <span class="detail-value">{{ detailData.areaCode }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">库区名称:</span>
            <span class="detail-value">{{ detailData.areaName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">库区类型:</span>
            <span class="detail-value">{{ detailData.areaType }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">类型名称:</span>
            <span class="detail-value">{{ detailData.areaTypeName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">库区状态:</span>
            <status-tag
              :status="detailData.status"
              :type-map="statusConfig.typeMap"
              :text-map="statusConfig.textMap"
            />
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">库区描述:</span>
            <span class="detail-value">{{ detailData.description || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div v-if="locationCount !== null" class="detail-section">
        <div class="section-title">统计信息</div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">关联库位数量:</span>
            <span class="detail-value highlight">{{ locationCount }} 个</span>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div class="detail-section">
        <div class="section-title">系统信息</div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">创建时间:</span>
            <span class="detail-value">{{ formatTime(detailData.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">更新时间:</span>
            <span class="detail-value">{{ formatTime(detailData.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import { STORAGE_AREA_STATUS_CONFIG } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'AreaDetailDrawer',
  components: {
    BaseDrawer,
    StatusTag
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: null
    },
    locationCount: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      statusConfig: STORAGE_AREA_STATUS_CONFIG
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  padding: 8px;
}

.detail-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: flex-start;

  &.full-width {
    grid-column: 1 / -1;
  }

  .detail-label {
    flex-shrink: 0;
    width: 100px;
    color: #606266;
    font-size: 14px;
    font-weight: 500;
  }

  .detail-value {
    flex: 1;
    color: #303133;
    font-size: 14px;
    word-break: break-word;

    &.highlight {
      color: #409eff;
      font-weight: 600;
    }
  }
}
</style>

