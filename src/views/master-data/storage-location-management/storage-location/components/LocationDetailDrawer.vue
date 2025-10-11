<!--
  文件名称: LocationDetailDrawer.vue
  文件描述: 库位详情抽屉组件
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建
-->

<template>
  <BaseDrawer
    :visible.sync="drawerVisible"
    title="库位详情"
    :loading="loading"
    :show-footer="false"
  >
    <div v-if="locationData" class="location-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="section-title">基本信息</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="库位ID">
            {{ locationData.locationId }}
          </el-descriptions-item>
          <el-descriptions-item label="库位类型">
            {{ locationData.locationTypeName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="所属库区" :span="2">
            <span v-if="locationData.storageArea">
              {{ locationData.storageArea.areaCode }} - {{ locationData.storageArea.areaName }}
              <el-tag
                :type="locationData.storageArea.status === 'enabled' ? 'success' : 'info'"
                size="mini"
                style="margin-left: 8px"
              >
                {{ locationData.storageArea.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="占用状态">
            <StatusTag
              :status="locationData.occupancyStatus"
              :type-map="statusConfig.typeMap"
              :text-map="statusConfig.textMap"
            />
          </el-descriptions-item>
          <el-descriptions-item label="承重限制">
            {{ locationData.loadCapacity }} kg
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 空间坐标 -->
      <div class="detail-section">
        <div class="section-title">空间坐标</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="X坐标">
            {{ formatValue(locationData.coordinateX, 'cm') }}
          </el-descriptions-item>
          <el-descriptions-item label="Y坐标">
            {{ formatValue(locationData.coordinateY, 'cm') }}
          </el-descriptions-item>
          <el-descriptions-item label="Z坐标">
            {{ formatValue(locationData.coordinateZ, 'cm') }}
          </el-descriptions-item>
          <el-descriptions-item label="坐标显示">
            <span v-if="hasCoordinates">
              ({{ formatNumber(locationData.coordinateX) }},
              {{ formatNumber(locationData.coordinateY) }},
              {{ formatNumber(locationData.coordinateZ) }})
            </span>
            <span v-else class="text-muted">未设置</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 尺寸限制 -->
      <div class="detail-section">
        <div class="section-title">尺寸限制</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="长度限制">
            {{ formatValue(locationData.lengthLimit, 'cm') }}
          </el-descriptions-item>
          <el-descriptions-item label="宽度限制">
            {{ formatValue(locationData.widthLimit, 'cm') }}
          </el-descriptions-item>
          <el-descriptions-item label="高度限制">
            {{ formatValue(locationData.heightLimit, 'cm') }}
          </el-descriptions-item>
          <el-descriptions-item label="尺寸显示">
            <span v-if="hasDimensions">
              {{ formatNumber(locationData.lengthLimit) }} ×
              {{ formatNumber(locationData.widthLimit) }} ×
              {{ formatNumber(locationData.heightLimit) }} cm
            </span>
            <span v-else class="text-muted">未设置</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 其他参数 -->
      <div class="detail-section">
        <div class="section-title">其他参数</div>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="适用料框规格">
            <div v-if="locationData.applicableBinSpecCodes && locationData.applicableBinSpecCodes.length > 0">
              <el-tag
                v-for="code in locationData.applicableBinSpecCodes"
                :key="code"
                size="mini"
                style="margin-right: 8px; margin-bottom: 4px"
              >
                {{ code }}
              </el-tag>
            </div>
            <span v-else class="text-muted">不限</span>
          </el-descriptions-item>
          <el-descriptions-item label="最大堆叠高度">
            <span v-if="locationData.locationType === 'ground_stacking' && locationData.maxStackHeight">
              {{ locationData.maxStackHeight }} 层
            </span>
            <span v-else class="text-muted">-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 系统信息 -->
      <div class="detail-section">
        <div class="section-title">系统信息</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(locationData.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(locationData.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <!-- 加载中或无数据 -->
    <div v-else class="no-data">
      <el-empty description="暂无数据" />
    </div>
  </BaseDrawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import { OCCUPANCY_STATUS_CONFIG } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'LocationDetailDrawer',
  components: {
    BaseDrawer,
    StatusTag
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    locationData: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statusConfig: OCCUPANCY_STATUS_CONFIG
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
    },
    hasCoordinates() {
      if (!this.locationData) return false
      return this.locationData.coordinateX !== null ||
             this.locationData.coordinateY !== null ||
             this.locationData.coordinateZ !== null
    },
    hasDimensions() {
      if (!this.locationData) return false
      return this.locationData.lengthLimit !== null ||
             this.locationData.widthLimit !== null ||
             this.locationData.heightLimit !== null
    }
  },
  methods: {
    /**
     * 格式化值（带单位）
     */
    formatValue(value, unit = '') {
      if (value === null || value === undefined) {
        return '-'
      }
      return unit ? `${value} ${unit}` : value
    },

    /**
     * 格式化数字
     */
    formatNumber(value) {
      if (value === null || value === undefined) return '-'
      return value
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}')
    }
  }
}
</script>

<style lang="scss" scoped>
.location-detail {
  .detail-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
      padding-left: 8px;
      border-left: 3px solid #409EFF;
    }
  }

  .text-muted {
    color: #909399;
    font-style: italic;
  }
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

::v-deep .el-descriptions-item__label {
  width: 140px;
  background-color: #fafafa;
}
</style>

