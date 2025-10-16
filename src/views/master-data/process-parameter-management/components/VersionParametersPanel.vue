<!--
文件名称：VersionParametersPanel.vue
文件描述：工艺模板版本参数展示面板 - v2.0固定12段架构
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建
  - 2025-10-15: 重构为v2.0固定12段架构，移除旧版多表结构
-->

<template>
  <div class="version-parameters-panel">
    <el-alert
      type="info"
      show-icon
      :closable="false"
      title="参数仅供查看，如需编辑请点击列表中的【编辑】按钮"
      class="version-parameters-panel__readonly-tip"
    />

    <section class="parameter-section">
      <header class="parameter-section__header">
        <div>
          <h4 class="parameter-section__title">工艺参数配置（固定12段）</h4>
          <p class="parameter-section__subtitle">每段包含炉温、料温、时间、风机等完整工艺参数</p>
        </div>
      </header>

      <div class="segment-table-wrapper">
        <el-empty
          v-if="segmentList.length === 0"
          description="暂无工艺参数配置"
          :image-size="120"
        />
        <el-table
          v-else
          :data="segmentList"
          border
          class="segment-table"
          size="small"
        >
          <el-table-column
            prop="segmentOrder"
            label="段序号"
            width="80"
            align="center"
            fixed
          />
          <el-table-column
            prop="controlMode"
            label="控温方式"
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ row.controlMode || '定时定温' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="furnaceTemperature"
            label="炉温 (°C)"
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ formatNumber(row.furnaceTemperature) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="materialTemperature"
            label="料温 (°C)"
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ formatNumber(row.materialTemperature) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="timeSet"
            label="时间设置 (h)"
            width="130"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ formatNumber(row.timeSet) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="runTime"
            label="运行时间 (h)"
            width="130"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ row.runTime !== null && row.runTime !== undefined ? formatNumber(row.runTime) : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="circulationFanSpeed"
            label="循环风机速度"
            width="130"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                size="small"
                :type="getFanSpeedType(row.circulationFanSpeed)"
              >{{ row.circulationFanSpeed || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="negativePressureFan"
            label="负压风机"
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ formatNumber(row.negativePressureFan) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="cleaningFan"
            label="吹洗风机"
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ formatNumber(row.cleaningFan) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="cleaningTime"
            label="吹洗时间 (s)"
            width="130"
            align="center"
          >
            <template #default="{ row }">
              <span>{{ formatNumber(row.cleaningTime) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'VersionParametersPanel',
  props: {
    templateId: {
      type: String,
      default: ''
    },
    version: {
      type: Object,
      required: true
    },
    forceRefreshKey: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      segmentList: []
    }
  },
  watch: {
    version: {
      immediate: true,
      handler(newVersion) {
        this.initializeParameters(newVersion)
      }
    },
    forceRefreshKey() {
      this.initializeParameters(this.version)
    }
  },
  methods: {
    initializeParameters(version) {
      const segments = cloneDeep(version?.segments || [])

      this.segmentList = segments
        .map(segment => ({ ...segment }))
        .sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))

      if (process.env.NODE_ENV === 'development') {
        console.debug('[VersionParametersPanel] v2.0架构 segmentList initialized', {
          versionId: version && version.id,
          segmentCount: this.segmentList.length
        })
      }
    },

    /**
     * 格式化数字显示
     * @param {number} value - 数值
     * @returns {string} 格式化后的字符串
     */
    formatNumber(value) {
      if (value === null || value === undefined) {
        return '-'
      }
      // 保留2位小数，去除末尾的0
      return Number(value).toFixed(2).replace(/\.?0+$/, '')
    },

    /**
     * 获取风机速度标签类型
     * @param {string} speed - 风机速度
     * @returns {string} 标签类型
     */
    getFanSpeedType(speed) {
      const typeMap = {
        '低速': 'info',
        '中速': 'warning',
        '高速': 'danger'
      }
      return typeMap[speed] || 'info'
    }
  }
}
</script>

<style scoped>
.version-parameters-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.version-parameters-panel__readonly-tip {
  margin-bottom: 15px;
}

.parameter-section {
  margin-bottom: 15px;
}

.parameter-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.parameter-section__title {
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: bold;
}

.parameter-section__subtitle {
  font-size: 14px;
  color: #606266;
}

.segment-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.segment-table {
  width: 100%;
}
</style>
