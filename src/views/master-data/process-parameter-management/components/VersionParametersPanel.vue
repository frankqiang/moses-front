<!--
文件名称：VersionParametersPanel.vue
文件描述：工艺模板版本参数编辑面板，支持温度段、保护气氛与循环风机配置的查看与编辑
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，完成TASK006 P0-2基础结构
-->

<template>
  <div class="version-parameters-panel">
    <el-alert
      v-if="!editable"
      type="info"
      show-icon
      :closable="false"
      title="当前版本不可编辑，仅支持查看参数"
      class="version-parameters-panel__readonly-tip"
    />

    <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="温度段配置" name="segments">
        <TemperatureCurveViewer
          v-show="activeTab === 'segments'"
          ref="curveViewer"
          class="version-parameters-panel__curve"
          :segments="segmentList"
          :comparison-versions="comparisonVersions"
          :template-id="templateId"
          :version-id="version.id"
          :device-capability="deviceCapability"
        />

        <section class="parameter-section">
          <header class="parameter-section__header">
            <div>
              <h4 class="parameter-section__title">温度曲线段</h4>
              <p class="parameter-section__subtitle">按照工艺流程配置升温、保温、降温、快速冷却段参数</p>
            </div>
            <div class="parameter-section__actions">
              <el-button
                v-if="editable"
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="handleAddSegment"
              >
                新增段
              </el-button>
              <el-button
                v-if="editable"
                type="default"
                size="mini"
                icon="el-icon-refresh"
                @click="handleApplyRecommendations"
              >
                应用推荐模板
              </el-button>
            </div>
          </header>

          <div class="segment-table-wrapper">
            <el-empty
              v-if="segmentList.length === 0"
              :description="getEmptyDescription()"
              :image-size="120"
            />
            <el-table
              v-else
              :data="segmentList"
              :row-key="getSegmentRowKey"
              border
              class="segment-table"
            >
              <el-table-column prop="segmentOrder" label="段序号" width="90">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.segmentOrder"
                    :min="1"
                    :max="1000"
                    size="mini"
                    controls-position="right"
                    :disabled="!editable"
                    @change="() => normalizeSegmentOrder(index)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="segmentType" label="段类型" width="120">
                <template #default="{ row }">
                  <el-select
                    v-model="row.segmentType"
                    placeholder="选择类型"
                    size="mini"
                    :disabled="!editable"
                    @change="handleSegmentTypeChange(row)"
                  >
                    <el-option
                      v-for="option in segmentTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="targetTemperature" label="目标温度 (°C)" width="140">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.targetTemperature"
                    :min="-100"
                    :max="1500"
                    :step="1"
                    size="mini"
                    controls-position="right"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="duration" label="持续时间 (分钟)" width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.duration"
                    :min="1"
                    :max="10080"
                    :step="1"
                    size="mini"
                    controls-position="right"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="heatingRate" label="升温速率 (°C/h)" width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-if="needsHeatingRate(row)"
                    v-model="row.heatingRate"
                    :min="0.1"
                    :max="500"
                    :step="0.1"
                    size="mini"
                    :precision="1"
                    controls-position="right"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                  <span v-else style="color: #909399;">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="coolingRate" label="降温速率 (°C/h)" width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-if="needsCoolingRate(row)"
                    v-model="row.coolingRate"
                    :min="0.1"
                    :max="500"
                    :step="0.1"
                    size="mini"
                    :precision="1"
                    controls-position="right"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                  <span v-else style="color: #909399;">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="段说明">
                <template #default="{ row }">
                  <el-input
                    v-model="row.description"
                    :disabled="!editable"
                    size="mini"
                    placeholder="请输入段说明"
                    maxlength="200"
                    show-word-limit
                    @input="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column v-if="editable" label="操作" width="200" fixed="right">
                <template #default="{ $index }">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-top"
                    :disabled="$index === 0"
                    @click="handleSegmentMoveUp($index)"
                  >
                    上移
                  </el-button>
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-bottom"
                    :disabled="$index === segmentList.length - 1"
                    @click="handleSegmentMoveDown($index)"
                  >
                    下移
                  </el-button>
                  <el-button
                    type="text"
                    size="mini"
                    style="color: #f56c6c;"
                    @click="handleSegmentRemove($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="保护气氛配置" name="atmosphere">
        <section class="parameter-section">
          <header class="parameter-section__header">
            <div>
              <h4 class="parameter-section__title">保护气氛参数</h4>
              <p class="parameter-section__subtitle">配置退火过程中的气氛类型、流量与压力范围</p>
            </div>
            <div class="parameter-section__actions">
              <el-button
                v-if="editable"
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="handleAddAtmosphere"
              >
                新增参数
              </el-button>
            </div>
          </header>

          <div class="parameter-table-wrapper">
            <el-table
              :data="atmosphereList"
              :row-key="getAtmosphereRowKey"
              border
              :empty-text="editable ? '点击右上角【新增参数】按钮添加气氛配置' : '暂无气氛配置'"
            >
              <el-table-column prop="atmosphereType" label="气氛类型" width="160">
                <template #default="{ row }">
                  <el-select
                    v-model="row.atmosphereType"
                    placeholder="请选择"
                    size="mini"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  >
                    <el-option
                      v-for="option in atmosphereTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="flowRate" label="流量 (m³/h)" width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.flowRate"
                    :min="0.1"
                    :max="1000"
                    :step="0.1"
                    :precision="1"
                    size="mini"
                    controls-position="right"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column label="流量范围 (m³/h)" width="200">
                <template #default="{ row }">
                  <div class="inline-range">
                    <el-input-number
                      v-model="row.flowRateMin"
                      :min="0.1"
                      :max="1000"
                      :step="0.1"
                      :precision="1"
                      size="mini"
                      controls-position="right"
                      :disabled="!editable"
                      @change="debouncedEmitChange"
                    />
                    <span class="inline-range__separator">至</span>
                    <el-input-number
                      v-model="row.flowRateMax"
                      :min="0.1"
                      :max="1000"
                      :step="0.1"
                      :precision="1"
                      size="mini"
                      controls-position="right"
                      :disabled="!editable"
                      @change="debouncedEmitChange"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="pressure" label="压力 (Pa)" width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.pressure"
                    :min="0"
                    :max="100000"
                    :step="1"
                    size="mini"
                    controls-position="right"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column label="压力范围 (Pa)" width="220">
                <template #default="{ row }">
                  <div class="inline-range">
                    <el-input-number
                      v-model="row.pressureMin"
                      :min="0"
                      :max="100000"
                      :step="1"
                      size="mini"
                      controls-position="right"
                      :disabled="!editable"
                      @change="debouncedEmitChange"
                    />
                    <span class="inline-range__separator">至</span>
                    <el-input-number
                      v-model="row.pressureMax"
                      :min="0"
                      :max="100000"
                      :step="1"
                      size="mini"
                      controls-position="right"
                      :disabled="!editable"
                      @change="debouncedEmitChange"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="supportsHydrogen" label="支持氢气" width="110">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.supportsHydrogen"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="description" label="参数说明">
                <template #default="{ row }">
                  <el-input
                    v-model="row.description"
                    size="mini"
                    :disabled="!editable"
                    maxlength="200"
                    show-word-limit
                    placeholder="请输入说明"
                    @input="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column v-if="editable" label="操作" width="100" fixed="right">
                <template #default="{ $index }">
                  <el-button type="text" size="mini" @click="handleAtmosphereRemove($index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="循环风机配置" name="fans">
        <section class="parameter-section">
          <header class="parameter-section__header">
            <div>
              <h4 class="parameter-section__title">循环风机参数</h4>
              <p class="parameter-section__subtitle">配置风机频率、模式以及适用段序号</p>
            </div>
            <div class="parameter-section__actions">
              <el-button
                v-if="editable"
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="handleAddFanSetting"
              >
                新增风机参数
              </el-button>
            </div>
          </header>

          <div class="parameter-table-wrapper">
            <el-table
              :data="fanList"
              :row-key="getFanRowKey"
              border
              :empty-text="editable ? '点击右上角【新增风机参数】按钮添加配置' : '暂无风机配置'"
            >
              <el-table-column prop="frequency" label="频率设定 (Hz)" width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.frequency"
                    :min="0.1"
                    :max="100"
                    :step="0.1"
                    :precision="1"
                    size="mini"
                    controls-position="right"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column label="频率范围 (Hz)" width="200">
                <template #default="{ row }">
                  <div class="inline-range">
                    <el-input-number
                      v-model="row.frequencyMin"
                      :min="0.1"
                      :max="100"
                      :step="0.1"
                      :precision="1"
                      size="mini"
                      controls-position="right"
                      :disabled="!editable"
                      @change="debouncedEmitChange"
                    />
                    <span class="inline-range__separator">至</span>
                    <el-input-number
                      v-model="row.frequencyMax"
                      :min="0.1"
                      :max="100"
                      :step="0.1"
                      :precision="1"
                      size="mini"
                      controls-position="right"
                      :disabled="!editable"
                      @change="debouncedEmitChange"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="mode" label="运行模式" width="140">
                <template #default="{ row }">
                  <el-select
                    v-model="row.mode"
                    placeholder="请选择"
                    size="mini"
                    :disabled="!editable"
                    @change="debouncedEmitChange"
                  >
                    <el-option
                      v-for="option in fanModeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="segmentOrder" label="适用段序号" width="160">
                <template #default="{ row }">
                  <div style="display: flex; align-items: center; gap: 4px;">
                    <el-input-number
                      v-model="row.segmentOrder"
                      :min="1"
                      :max="maxSegmentOrder"
                      :step="1"
                      size="mini"
                      controls-position="right"
                      placeholder="留空表示全局"
                      :disabled="!editable"
                      @change="debouncedEmitChange"
                    />
                    <el-tooltip
                      v-if="row.segmentOrder && !isValidSegmentOrder(row.segmentOrder)"
                      content="该段序号在温度段配置中不存在"
                      placement="top"
                    >
                      <i class="el-icon-warning" style="color: #f56c6c;" />
                    </el-tooltip>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="备注说明">
                <template #default="{ row }">
                  <el-input
                    v-model="row.description"
                    size="mini"
                    :disabled="!editable"
                    maxlength="200"
                    show-word-limit
                    placeholder="请输入备注"
                    @input="debouncedEmitChange"
                  />
                </template>
              </el-table-column>
              <el-table-column v-if="editable" label="操作" width="100" fixed="right">
                <template #default="{ $index }">
                  <el-button type="text" size="mini" @click="handleFanRemove($index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>

    <div v-if="editable" class="version-parameters-panel__footer">
      <el-button :disabled="saving" @click="handleReset">重置</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        保存参数
      </el-button>
    </div>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash'
import {
  SEGMENT_TYPES,
  SEGMENT_TYPE_OPTIONS,
  FAN_MODE_OPTIONS,
  DEFAULT_SEGMENT_TEMPLATE
} from '../constants/process-parameter-management'
import TemperatureCurveViewer from './TemperatureCurveViewer.vue'
import dictionaryMixin from '../mixins/dictionary'

const DEFAULT_ATMOSPHERE = () => ({
  atmosphereType: '',
  flowRate: null,
  flowRateMin: null,
  flowRateMax: null,
  pressure: null,
  pressureMin: null,
  pressureMax: null,
  supportsHydrogen: false,
  description: ''
})

const DEFAULT_FAN = () => ({
  frequency: null,
  frequencyMin: null,
  frequencyMax: null,
  mode: '变频',
  segmentOrder: null,
  description: ''
})

export default {
  name: 'VersionParametersPanel',
  components: {
    TemperatureCurveViewer
  },
  mixins: [dictionaryMixin],
  props: {
    templateId: {
      type: String,
      default: ''
    },
    version: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    saving: {
      type: Boolean,
      default: false
    },
    comparisonVersions: {
      type: Array,
      default: () => []
    },
    deviceCapability: {
      type: Object,
      default: () => ({})
    },
    forceRefreshKey: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      activeTab: 'segments',
      segmentList: [],
      atmosphereList: [],
      fanList: [],
      // 防抖版本的 emitChange
      debouncedEmitChange: null
    }
  },
  computed: {
    segmentTypeOptions() {
      return SEGMENT_TYPE_OPTIONS
    },
    // atmosphereTypeOptions 已由 mixin 提供
    fanModeOptions() {
      return FAN_MODE_OPTIONS
    },
    // 有效的段序号列表（从温度段配置中提取）
    validSegmentOrders() {
      return this.segmentList.map(segment => segment.segmentOrder).filter(order => order > 0)
    },
    // 最大段序号
    maxSegmentOrder() {
      return this.validSegmentOrders.length > 0
        ? Math.max(...this.validSegmentOrders)
        : 1000
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
  created() {
    // 创建防抖函数，300ms 延迟
    this.debouncedEmitChange = debounce(this.emitChange, 300)
  },
  beforeDestroy() {
    // 组件销毁前取消防抖
    if (this.debouncedEmitChange) {
      this.debouncedEmitChange.cancel()
    }
  },
  methods: {
    handleTabClick() {
      // Tab 切换时的处理（v-if 已确保图表正确渲染）
    },

    getEmptyDescription() {
      return this.editable
        ? '暂无温度段配置，点击右上角"新增段"或"应用推荐模板"按钮添加'
        : '暂无温度段配置'
    },

    initializeParameters(version) {
      const segments = cloneDeep(version?.segments || [])
      const atmosphere = cloneDeep(version?.atmosphereSettings || [])
      const fans = cloneDeep(version?.fanSettings || [])

      this.segmentList = segments
        .map(segment => ({ ...segment }))
        .sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))
      this.atmosphereList = atmosphere.map(item => ({ ...item }))
      this.fanList = fans.map(item => ({ ...item }))

      if (process.env.NODE_ENV === 'development') {
        console.debug('[VersionParametersPanel] segmentList initialized', {
          versionId: version && version.id,
          segmentCount: this.segmentList.length,
          atmosphereCount: this.atmosphereList.length,
          fanCount: this.fanList.length
        })
      }
    },

    emitChange() {
      const segments = this.segmentList.map((segment, index) => {
        return {
          ...segment,
          segmentOrder: index + 1
        }
      })

      const atmosphereSettings = this.atmosphereList.map(item => ({ ...item }))
      const fanSettings = this.fanList.map(item => ({ ...item }))

      this.$emit('change', {
        segments,
        atmosphereSettings,
        fanSettings
      })
    },

    handleAddSegment() {
      const nextOrder = this.segmentList.length + 1
      const template = cloneDeep(DEFAULT_SEGMENT_TEMPLATE[0])
      template.segmentOrder = nextOrder
      template.segmentType = '升温'
      template.targetTemperature = 450
      template.duration = 120
      template.heatingRate = 30
      template.coolingRate = null
      template.description = ''
      this.segmentList.push({ ...template })
      this.emitChange()
    },

    handleSegmentUpdate(index, value) {
      const current = this.segmentList[index]
      this.$set(this.segmentList, index, {
        ...current,
        ...value
      })
      this.emitChange()
    },

    /**
     * 段类型变化时清理不需要的速率字段
     * @param {Object} row - 温度段对象
     */
    handleSegmentTypeChange(row) {
      // 如果不需要升温速率，清空该字段
      if (!this.needsHeatingRate(row)) {
        row.heatingRate = null
      }
      // 如果不需要降温速率，清空该字段
      if (!this.needsCoolingRate(row)) {
        row.coolingRate = null
      }
      this.emitChange()
    },

    handleSegmentMoveUp(index) {
      if (index === 0) return
      const temp = this.segmentList[index]
      this.$set(this.segmentList, index, this.segmentList[index - 1])
      this.$set(this.segmentList, index - 1, temp)
      this.renumberSegments()
      this.emitChange()
    },

    handleSegmentMoveDown(index) {
      if (index === this.segmentList.length - 1) return
      const temp = this.segmentList[index]
      this.$set(this.segmentList, index, this.segmentList[index + 1])
      this.$set(this.segmentList, index + 1, temp)
      this.renumberSegments()
      this.emitChange()
    },

    handleSegmentRemove(index) {
      this.segmentList.splice(index, 1)
      this.renumberSegments()
      this.emitChange()
    },

    normalizeSegmentOrder(index) {
      const value = this.segmentList[index].segmentOrder
      if (!value || value < 1) {
        this.$set(this.segmentList[index], 'segmentOrder', index + 1)
      }
      this.segmentList.sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))
      this.renumberSegments()
      this.emitChange()
    },

    renumberSegments() {
      this.segmentList = this.segmentList.map((segment, idx) => ({
        ...segment,
        segmentOrder: idx + 1
      }))
    },

    handleAddAtmosphere() {
      this.atmosphereList.push({ ...DEFAULT_ATMOSPHERE() })
      this.emitChange()
    },

    handleAtmosphereRemove(index) {
      this.atmosphereList.splice(index, 1)
      this.emitChange()
    },

    handleAddFanSetting() {
      this.fanList.push({ ...DEFAULT_FAN() })
      this.emitChange()
    },

    handleFanRemove(index) {
      this.fanList.splice(index, 1)
      this.emitChange()
    },

    /**
     * 校验风机的适用段序号是否有效
     * @param {number} order - 段序号
     * @returns {boolean} 是否有效
     */
    isValidSegmentOrder(order) {
      if (!order) return true // 空值表示全局，总是有效
      return this.validSegmentOrders.includes(order)
    },

    handleReset() {
      this.initializeParameters(this.version)
      this.emitChange()
    },

    handleSave() {
      const validationErrors = this.validateParameters()
      if (validationErrors.length) {
        this.$message.error(validationErrors[0])
        return
      }

      const segments = this.segmentList.map((segment, index) => {
        return {
          ...segment,
          segmentOrder: index + 1
        }
      })

      const atmosphereSettings = this.atmosphereList.map(item => ({ ...item }))
      const fanSettings = this.fanList.map(item => ({ ...item }))

      this.$emit('save', {
        segments,
        atmosphereSettings,
        fanSettings
      })
    },

    validateParameters() {
      const errors = []

      if (!this.segmentList.length) {
        errors.push('请至少配置一个温度段')
      }

      this.segmentList.forEach((segment, index) => {
        const context = `温度段#${index + 1}`
        if (!segment.segmentType) {
          errors.push(`${context}：请选择段类型`)
        }
        if (segment.targetTemperature === null || segment.targetTemperature === undefined) {
          errors.push(`${context}：请输入目标温度`)
        }
        if (!segment.duration) {
          errors.push(`${context}：请输入持续时间`)
        }
        if (segment.segmentType === '升温' && !segment.heatingRate) {
          errors.push(`${context}：升温段必须填写升温速率`)
        }
        if ((segment.segmentType === '降温' || segment.segmentType === '快速冷却') && !segment.coolingRate) {
          errors.push(`${context}：降温段必须填写降温速率`)
        }
      })

      if (!this.atmosphereList.length) {
        errors.push('请至少配置一个保护气氛参数')
      }

      if (!this.fanList.length) {
        errors.push('请至少配置一个循环风机参数')
      }

      // 校验风机的适用段序号
      this.fanList.forEach((fan, index) => {
        const context = `风机配置#${index + 1}`
        if (fan.segmentOrder && !this.isValidSegmentOrder(fan.segmentOrder)) {
          errors.push(`${context}：适用段序号 ${fan.segmentOrder} 在温度段配置中不存在`)
        }
      })

      // 校验风机段序号的连续性（必须从1开始连续递增）
      const segmentOrderError = this.validateFanSegmentOrderContinuity()
      if (segmentOrderError) {
        errors.push(segmentOrderError)
      }

      return errors
    },

    /**
     * 校验风机段序号的连续性
     * 后端要求：风机参数的段序号必须从1开始连续递增
     * @returns {string|null} 返回错误消息，如果校验通过则返回 null
     */
    validateFanSegmentOrderContinuity() {
      // 过滤出有段序号的风机（null 表示全局风机，不参与校验）
      const fansWithSegmentOrder = this.fanList.filter(fan => fan.segmentOrder !== null && fan.segmentOrder !== undefined)

      // 如果没有指定段序号的风机，不需要校验
      if (fansWithSegmentOrder.length === 0) {
        return null
      }

      // 提取所有段序号并排序
      const segmentOrders = fansWithSegmentOrder.map(fan => fan.segmentOrder).sort((a, b) => a - b)

      // 检查是否有重复
      const uniqueOrders = [...new Set(segmentOrders)]
      if (uniqueOrders.length !== segmentOrders.length) {
        const duplicates = segmentOrders.filter((item, index) => segmentOrders.indexOf(item) !== index)
        return `风机参数的段序号不能重复，重复的段序号：${[...new Set(duplicates)].join(', ')}`
      }

      // 检查是否从1开始
      if (segmentOrders[0] !== 1) {
        return `风机参数的段序号必须从1开始，当前最小段序号为 ${segmentOrders[0]}`
      }

      // 检查是否连续递增
      for (let i = 0; i < segmentOrders.length; i++) {
        if (segmentOrders[i] !== i + 1) {
          return `风机参数的段序号必须从1开始连续递增，当前缺少段序号 ${i + 1}`
        }
      }

      return null
    },

    handleApplyRecommendations() {
      const recommendedSegments = cloneDeep(DEFAULT_SEGMENT_TEMPLATE)
      this.segmentList = recommendedSegments.map((segment, index) => ({
        ...segment,
        segmentOrder: index + 1
      }))
      this.emitChange()
    },

    /**
     * 判断当前段是否需要显示升温速率
     * @param {Object} segment - 温度段对象
     * @returns {boolean} - 是否需要显示
     */
    needsHeatingRate(segment) {
      return segment.segmentType === SEGMENT_TYPES.HEATING
    },

    /**
     * 判断当前段是否需要显示降温速率
     * @param {Object} segment - 温度段对象
     * @returns {boolean} - 是否需要显示
     */
    needsCoolingRate(segment) {
      return segment.segmentType === SEGMENT_TYPES.COOLING ||
             segment.segmentType === SEGMENT_TYPES.QUICK_COOLING
    },

    /**
     * 获取温度段行的唯一key（用于表格性能优化）
     */
    getSegmentRowKey(row, index) {
      return row.id || `segment-${row.segmentOrder || index}`
    },

    /**
     * 获取保护气氛行的唯一key
     */
    getAtmosphereRowKey(row, index) {
      return row.id || `atmosphere-${index}`
    },

    /**
     * 获取循环风机行的唯一key
     */
    getFanRowKey(row, index) {
      return row.id || `fan-${index}`
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

.version-parameters-panel__footer {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
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

.parameter-section__actions {
  display: flex;
  gap: 10px;
}

.segment-table-wrapper,
.parameter-table-wrapper {
  width: 100%;
}

.segment-table {
  width: 100%;
}
</style>
