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

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane label="温度段配置" name="segments">
        <TemperatureCurveViewer
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
            <draggable
              v-model="segmentList"
              :item-key="segmentDragKey"
              handle=".drag-handle"
              ghost-class="segment-row--ghost"
              :disabled="!editable"
              @end="handleSegmentDragEnd"
            >
              <template #item="{ element, index }">
                <el-table
                  :key="segmentDragKey(element, index)"
                  :data="[element]"
                  border
                  class="segment-table-row"
                >
                  <el-table-column width="46">
                    <template #default>
                      <span
                        v-if="editable"
                        class="drag-handle"
                        title="拖拽调整段顺序"
                      >
                        <i class="el-icon-rank" />
                      </span>
                      <span v-else class="drag-placeholder" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="segmentOrder" label="段序号" width="90">
                    <template #default="{ row }">
                      <el-input-number
                        v-model="row.segmentOrder"
                        :min="1"
                        :max="1000"
                        size="mini"
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
                        @change="emitChange"
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
                        :disabled="!editable"
                        @change="emitChange"
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
                        :disabled="!editable"
                        @change="emitChange"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="heatingRate" label="升温速率 (°C/h)" width="150">
                    <template #default="{ row }">
                      <el-input-number
                        v-model="row.heatingRate"
                        :min="0.1"
                        :max="500"
                        :step="0.1"
                        size="mini"
                        :precision="1"
                        :disabled="!editable"
                        @change="emitChange"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="coolingRate" label="降温速率 (°C/h)" width="150">
                    <template #default="{ row }">
                      <el-input-number
                        v-model="row.coolingRate"
                        :min="0.1"
                        :max="500"
                        :step="0.1"
                        size="mini"
                        :precision="1"
                        :disabled="!editable"
                        @change="emitChange"
                      />
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
                        @input="emitChange"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column v-if="editable" label="操作" width="100" fixed="right">
                    <template #default>
                      <el-button type="text" size="mini" @click="handleSegmentRemove(index)">
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </draggable>
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
              border
              :empty-text="editable ? '点击右上角“新增参数”按钮添加气氛配置' : '暂无气氛配置'"
            >
              <el-table-column prop="atmosphereType" label="气氛类型" width="160">
                <template #default="{ row }">
                  <el-select
                    v-model="row.atmosphereType"
                    placeholder="请选择"
                    size="mini"
                    :disabled="!editable"
                    @change="emitChange"
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
                    :disabled="!editable"
                    @change="emitChange"
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
                      :disabled="!editable"
                      @change="emitChange"
                    />
                    <span class="inline-range__separator">至</span>
                    <el-input-number
                      v-model="row.flowRateMax"
                      :min="0.1"
                      :max="1000"
                      :step="0.1"
                      :precision="1"
                      size="mini"
                      :disabled="!editable"
                      @change="emitChange"
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
                    :disabled="!editable"
                    @change="emitChange"
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
                      :disabled="!editable"
                      @change="emitChange"
                    />
                    <span class="inline-range__separator">至</span>
                    <el-input-number
                      v-model="row.pressureMax"
                      :min="0"
                      :max="100000"
                      :step="1"
                      size="mini"
                      :disabled="!editable"
                      @change="emitChange"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="supportsHydrogen" label="支持氢气" width="110">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.supportsHydrogen"
                    :disabled="!editable"
                    @change="emitChange"
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
                    @input="emitChange"
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
              border
              :empty-text="editable ? '点击右上角“新增风机参数”按钮添加配置' : '暂无风机配置'"
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
                    :disabled="!editable"
                    @change="emitChange"
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
                      :disabled="!editable"
                      @change="emitChange"
                    />
                    <span class="inline-range__separator">至</span>
                    <el-input-number
                      v-model="row.frequencyMax"
                      :min="0.1"
                      :max="100"
                      :step="0.1"
                      :precision="1"
                      size="mini"
                      :disabled="!editable"
                      @change="emitChange"
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
                    @change="emitChange"
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
              <el-table-column prop="segmentOrder" label="适用段序号" width="140">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.segmentOrder"
                    :min="1"
                    :max="1000"
                    :step="1"
                    size="mini"
                    :disabled="!editable"
                    @change="emitChange"
                  />
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
                    @input="emitChange"
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
import { cloneDeep } from 'lodash'
import draggable from 'vuedraggable'
import {
  SEGMENT_TYPE_OPTIONS,
  ATMOSPHERE_TYPE_OPTIONS,
  FAN_MODE_OPTIONS,
  DEFAULT_SEGMENT_TEMPLATE
} from '../constants/process-parameter-management'
import TemperatureCurveViewer from './TemperatureCurveViewer.vue'

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
    draggable,
    TemperatureCurveViewer
  },
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
    }
  },
  data() {
    return {
      activeTab: 'segments',
      segmentList: [],
      atmosphereList: [],
      fanList: []
    }
  },
  computed: {
    segmentTypeOptions() {
      return SEGMENT_TYPE_OPTIONS
    },
    atmosphereTypeOptions() {
      return ATMOSPHERE_TYPE_OPTIONS
    },
    fanModeOptions() {
      return FAN_MODE_OPTIONS
    }
  },
  watch: {
    version: {
      immediate: true,
      handler(newVersion) {
        this.initializeParameters(newVersion)
      }
    }
  },
  methods: {
    initializeParameters(version) {
      const segments = cloneDeep(version?.segments || [])
      const atmosphere = cloneDeep(version?.atmosphereSettings || [])
      const fans = cloneDeep(version?.fanSettings || [])

      this.segmentList = segments
        .map(segment => ({ ...segment }))
        .sort((a, b) => (a.segmentOrder || 0) - (b.segmentOrder || 0))
      this.atmosphereList = atmosphere.map(item => ({ ...item }))
      this.fanList = fans.map(item => ({ ...item }))
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

    handleSegmentDragEnd() {
      this.renumberSegments()
      this.emitChange()
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
          errors.push(`${context}：降温/快速冷却段必须填写降温速率`)
        }
      })

      this.atmosphereList.forEach((atm, index) => {
        const context = `保护气氛#${index + 1}`
        if (!atm.atmosphereType) {
          errors.push(`${context}：请选择气氛类型`)
        }
        if (atm.flowRate === null || atm.flowRate === undefined) {
          errors.push(`${context}：请输入流量设定值`)
        }
        if (atm.flowRateMin && atm.flowRateMax && Number(atm.flowRateMin) > Number(atm.flowRateMax)) {
          errors.push(`${context}：流量下限不能大于上限`)
        }
        if (atm.pressureMin && atm.pressureMax && Number(atm.pressureMin) > Number(atm.pressureMax)) {
          errors.push(`${context}：压力下限不能大于上限`)
        }
        if (atm.atmosphereType && atm.atmosphereType.includes('氢') && atm.supportsHydrogen !== true) {
          errors.push(`${context}：氢气相关气氛必须勾选“支持氢气”`)
        }
      })

      this.fanList.forEach((fan, index) => {
        const context = `循环风机#${index + 1}`
        if (fan.frequency === null || fan.frequency === undefined) {
          errors.push(`${context}：请输入频率设定值`)
        }
        if (fan.frequencyMin && fan.frequencyMax && Number(fan.frequencyMin) > Number(fan.frequencyMax)) {
          errors.push(`${context}：频率下限不能大于上限`)
        }
      })

      return errors
    },

    segmentDragKey(segment, index) {
      return segment?.id || `segment-${index}`
    },

    handleApplyRecommendations() {
      this.segmentList = cloneDeep(DEFAULT_SEGMENT_TEMPLATE)
      this.renumberSegments()
      this.emitChange()
      this.$message.success('已应用温度段推荐模板')
    }
  }
}
</script>

<style lang="scss" scoped>
.version-parameters-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-parameters-panel__curve {
  margin-bottom: 16px;
}

.version-parameters-panel__readonly-tip {
  margin-bottom: 8px;
}

.parameter-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 18px rgba(31, 45, 61, 0.06);
}

.parameter-section__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.parameter-section__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.parameter-section__subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.parameter-section__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.segment-table-wrapper,
.parameter-table-wrapper {
  width: 100%;
}

.inline-range {
  display: flex;
  align-items: center;
  gap: 6px;

  &__separator {
    font-size: 12px;
    color: #909399;
  }
}

.version-parameters-panel__footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

