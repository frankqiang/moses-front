<!--
文件名称：ProcessSegmentsEditor.vue
文件描述：工艺参数12段配置编辑组件（v2.0架构）
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建，支持固定12段参数编辑和预设模板
-->

<template>
  <div class="process-segments-editor">
    <!-- 预设模板选择 -->
    <div v-if="!disabled" class="editor-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            type="primary"
            size="small"
            :disabled="presetTemplate === 'standard'"
            @click="applyPresetTemplate('standard')"
          >
            标准退火
          </el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="presetTemplate === 'quick'"
            @click="applyPresetTemplate('quick')"
          >
            快速退火
          </el-button>
          <el-button
            type="primary"
            size="small"
            plain
            :disabled="presetTemplate === 'blank'"
            @click="applyPresetTemplate('blank')"
          >
            空白模板
          </el-button>
        </el-button-group>
        <span v-if="presetTemplate" class="preset-hint">
          当前使用：{{ PRESET_TEMPLATE_LABELS[presetTemplate] }}
        </span>
      </div>
    </div>

    <!-- 12段参数表格 -->
    <el-table
      :data="segmentsData"
      border
      stripe
      size="small"
      class="segments-table"
      :max-height="600"
      highlight-current-row
    >
      <el-table-column
        type="index"
        label="段序号"
        width="70"
        align="center"
        fixed="left"
      />

      <el-table-column
        prop="controlMode"
        label="控温方式"
        width="110"
        align="center"
        fixed="left"
      >
        <template #default>
          <span class="fixed-value">定时定温</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="furnaceTemperature"
        label="炉温 (℃)"
        width="120"
        align="center"
      >
        <template #default="{ row, $index }">
          <el-input-number
            v-model="row.furnaceTemperature"
            :disabled="disabled"
            :min="0"
            :max="1500"
            :precision="2"
            :step="10"
            :controls="false"
            size="mini"
            class="table-input-number"
            placeholder="0-1500"
            @change="handleFurnaceTempChange($index)"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="materialTemperature"
        label="料温 (℃)"
        width="120"
        align="center"
      >
        <template #default="{ row, $index }">
          <el-input-number
            v-model="row.materialTemperature"
            :disabled="disabled"
            :min="0"
            :max="1500"
            :precision="2"
            :step="10"
            :controls="false"
            size="mini"
            class="table-input-number"
            :class="{ 'is-invalid': isMaterialTempInvalid(row) }"
            placeholder="0-1500"
            @change="validateMaterialTemp($index)"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="timeSet"
        label="时间 (h)"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.timeSet"
            :disabled="disabled"
            :min="0"
            :max="999"
            :precision="2"
            :step="0.5"
            :controls="false"
            size="mini"
            class="table-input-number"
            placeholder="0-999"
            @change="handleParamChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="circulationFanSpeed"
        label="循环风机"
        width="110"
        align="center"
      >
        <template #default="{ row }">
          <el-select
            v-model="row.circulationFanSpeed"
            :disabled="disabled"
            size="mini"
            class="table-select"
            placeholder="选择"
            @change="handleParamChange"
          >
            <el-option label="低速" value="低速" />
            <el-option label="中速" value="中速" />
            <el-option label="高速" value="高速" />
          </el-select>
        </template>
      </el-table-column>

      <el-table-column
        prop="negativePressureFan"
        label="负压风机 (Hz)"
        width="130"
        align="center"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.negativePressureFan"
            :disabled="disabled"
            :min="0"
            :max="100"
            :precision="2"
            :step="5"
            :controls="false"
            size="mini"
            class="table-input-number"
            placeholder="0-100"
            @change="handleParamChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="cleaningFan"
        label="吹洗风机 (Hz)"
        width="130"
        align="center"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.cleaningFan"
            :disabled="disabled"
            :min="0"
            :max="100"
            :precision="2"
            :step="5"
            :controls="false"
            size="mini"
            class="table-input-number"
            placeholder="0-100"
            @change="handleParamChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="cleaningTime"
        label="吹洗时间 (min)"
        width="130"
        align="center"
      >
        <template #default="{ row }">
          <el-input-number
            v-model="row.cleaningTime"
            :disabled="disabled"
            :min="0"
            :max="999"
            :precision="2"
            :step="5"
            :controls="false"
            size="mini"
            class="table-input-number"
            placeholder="0-999"
            @change="handleParamChange"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 提示信息 -->
    <div class="editor-hint">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <div slot="title">
          <strong>参数说明：</strong>
          <ul>
            <li>必须配置完整的12段参数，段序号1-12连续不可跳号</li>
            <li>料温设置不能高于炉温设置（建议低于10-20℃）</li>
            <li>控温方式固定为"定时定温"</li>
            <li>循环风机仅支持三个档位：低速/中速/高速</li>
            <li>运行时间字段在创建时可为空，在任务执行时填写实际值</li>
          </ul>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash'
import {
  PRESET_TEMPLATES,
  PRESET_TEMPLATE_LABELS
} from '../constants/process-parameter-management'

export default {
  name: 'ProcessSegmentsEditor',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      segmentsData: [],
      presetTemplate: '',
      PRESET_TEMPLATE_LABELS,
      validationErrors: []
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val && val.length === 12) {
          this.segmentsData = cloneDeep(val)
        } else if (!val || val.length === 0) {
          this.initializeBlankSegments()
        }
      }
    }
    // ✅ 移除了深度监听，改为在具体修改方法中手动触发更新
  },
  created() {
    // ✅ 创建防抖的更新函数，避免频繁触发
    this.debouncedEmit = debounce(() => {
      this.$emit('input', this.segmentsData)
    }, 100)
  },
  methods: {
    /**
     * 初始化空白12段参数
     */
    initializeBlankSegments() {
      this.segmentsData = Array.from({ length: 12 }, (_, index) => ({
        segmentOrder: index + 1,
        controlMode: '定时定温',
        furnaceTemperature: 0,
        materialTemperature: 0,
        timeSet: 0,
        runTime: null,
        circulationFanSpeed: '低速',
        negativePressureFan: 0,
        cleaningFan: 0,
        cleaningTime: 0
      }))
      this.presetTemplate = 'blank'
      // ✅ 手动触发更新
      this.$emit('input', this.segmentsData)
    },

    /**
     * 应用预设模板
     */
    applyPresetTemplate(templateType) {
      this.$confirm(
        '应用预设模板将覆盖当前所有参数配置，是否继续？',
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const template = PRESET_TEMPLATES[templateType]
        if (template && Array.isArray(template)) {
          this.segmentsData = cloneDeep(template)
          this.presetTemplate = templateType
          this.$message.success(`已应用${PRESET_TEMPLATE_LABELS[templateType]}`)
          // ✅ 手动触发更新
          this.$emit('input', this.segmentsData)
        }
      }).catch(() => {
        // 用户取消
      })
    },

    /**
     * 炉温变化时自动调整料温（如果料温高于炉温）
     */
    handleFurnaceTempChange(index) {
      const segment = this.segmentsData[index]
      if (segment.materialTemperature > segment.furnaceTemperature) {
        segment.materialTemperature = segment.furnaceTemperature
        this.$message.warning(`第${index + 1}段：料温已自动调整为炉温值`)
      }
      // ✅ 手动触发更新（仅在炉温变化时）
      this.$emit('input', this.segmentsData)
    },

    /**
     * 验证料温不能高于炉温
     */
    validateMaterialTemp(index) {
      const segment = this.segmentsData[index]
      if (segment.materialTemperature > segment.furnaceTemperature) {
        this.$message.error(`第${index + 1}段：料温不能高于炉温`)
        segment.materialTemperature = segment.furnaceTemperature
      }
      // ✅ 手动触发更新（仅在料温变化时）
      this.$emit('input', this.segmentsData)
    },

    /**
     * 检查料温是否无效
     */
    isMaterialTempInvalid(row) {
      return row.materialTemperature > row.furnaceTemperature
    },

    /**
     * 通用的参数变化处理（使用防抖优化性能）
     */
    handleParamChange() {
      // ✅ 使用防抖的更新函数，避免频繁触发
      this.debouncedEmit()
    },

    /**
     * 验证12段参数完整性
     */
    validate() {
      this.validationErrors = []

      // 检查段数
      if (this.segmentsData.length !== 12) {
        this.validationErrors.push('必须配置12段参数')
        this.$message.error('必须配置12段参数')
        return false
      }

      // 检查段序号连续性
      const orders = this.segmentsData.map(s => s.segmentOrder).sort((a, b) => a - b)
      const expectedOrders = Array.from({ length: 12 }, (_, i) => i + 1)
      if (JSON.stringify(orders) !== JSON.stringify(expectedOrders)) {
        this.validationErrors.push('段序号必须从1到12连续')
        this.$message.error('段序号必须从1到12连续')
        return false
      }

      // 检查每段必填字段
      for (let i = 0; i < this.segmentsData.length; i++) {
        const segment = this.segmentsData[i]
        const requiredFields = [
          'furnaceTemperature',
          'materialTemperature',
          'timeSet',
          'circulationFanSpeed',
          'negativePressureFan',
          'cleaningFan',
          'cleaningTime'
        ]

        for (const field of requiredFields) {
          if (segment[field] === null || segment[field] === undefined || segment[field] === '') {
            this.validationErrors.push(`第${i + 1}段：${field}不能为空`)
            this.$message.error(`第${i + 1}段参数不完整`)
            return false
          }
        }

        // 检查料温不能高于炉温
        if (segment.materialTemperature > segment.furnaceTemperature) {
          this.validationErrors.push(`第${i + 1}段：料温不能高于炉温`)
          this.$message.error(`第${i + 1}段：料温不能高于炉温`)
          return false
        }

        // 检查参数范围
        if (segment.furnaceTemperature < 0 || segment.furnaceTemperature > 1500) {
          this.validationErrors.push(`第${i + 1}段：炉温必须在0-1500℃范围内`)
          this.$message.error(`第${i + 1}段：炉温超出范围`)
          return false
        }

        if (segment.materialTemperature < 0 || segment.materialTemperature > 1500) {
          this.validationErrors.push(`第${i + 1}段：料温必须在0-1500℃范围内`)
          this.$message.error(`第${i + 1}段：料温超出范围`)
          return false
        }

        if (segment.timeSet < 0 || segment.timeSet > 999) {
          this.validationErrors.push(`第${i + 1}段：时间必须在0-999小时范围内`)
          this.$message.error(`第${i + 1}段：时间超出范围`)
          return false
        }

        if (!['低速', '中速', '高速'].includes(segment.circulationFanSpeed)) {
          this.validationErrors.push(`第${i + 1}段：循环风机速度无效`)
          this.$message.error(`第${i + 1}段：循环风机速度无效`)
          return false
        }

        if (segment.negativePressureFan < 0 || segment.negativePressureFan > 100) {
          this.validationErrors.push(`第${i + 1}段：负压风机频率必须在0-100Hz范围内`)
          this.$message.error(`第${i + 1}段：负压风机频率超出范围`)
          return false
        }

        if (segment.cleaningFan < 0 || segment.cleaningFan > 100) {
          this.validationErrors.push(`第${i + 1}段：吹洗风机频率必须在0-100Hz范围内`)
          this.$message.error(`第${i + 1}段：吹洗风机频率超出范围`)
          return false
        }

        if (segment.cleaningTime < 0 || segment.cleaningTime > 999) {
          this.validationErrors.push(`第${i + 1}段：吹洗时间必须在0-999分钟范围内`)
          this.$message.error(`第${i + 1}段：吹洗时间超出范围`)
          return false
        }
      }

      return true
    },

    /**
     * 获取当前配置数据
     */
    getData() {
      return cloneDeep(this.segmentsData)
    }
  }
}
</script>

<style scoped>
.process-segments-editor {
  width: 100%;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preset-hint {
  font-size: 13px;
  color: #606266;
}

.segments-table {
  width: 100%;
  font-size: 13px;
}

.segments-table >>> .el-table__header th {
  background: #f5f7fa;
  color: #303133;
  font-weight: 600;
}

.segments-table >>> .el-table__row {
  height: 48px;
}

.fixed-value {
  color: #909399;
  font-size: 12px;
}

.table-input-number {
  width: 100%;
}

.table-input-number >>> .el-input__inner {
  text-align: center;
  padding: 0 8px;
}

.table-input-number.is-invalid >>> .el-input__inner {
  border-color: #f56c6c;
  background: #fef0f0;
}

.table-select {
  width: 100%;
}

.table-select >>> .el-input__inner {
  text-align: center;
  padding: 0 20px 0 8px;
}

.editor-hint {
  margin-top: 16px;
}

.editor-hint ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.editor-hint li {
  margin: 4px 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
}
</style>

