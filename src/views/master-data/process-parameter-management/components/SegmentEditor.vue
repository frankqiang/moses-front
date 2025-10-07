<template>
  <div class="segment-editor">
    <div class="segment-editor__header">
      <h4 class="segment-editor__title">温度曲线段配置</h4>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        :disabled="disabled"
        @click="handleAdd"
      >
        添加段
      </el-button>
    </div>

    <el-alert
      v-if="segments.length === 0 && !disabled"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 16px;"
    >
      至少需要配置 1 个温度段，请点击"添加段"按钮开始配置
    </el-alert>

    <el-table
      :data="segments"
      border
      stripe
      class="segment-editor__table"
      :empty-text="disabled ? '暂无温度段配置' : '点击【添加段】按钮开始配置'"
    >
      <el-table-column
        label="段序号"
        width="80"
        align="center"
      >
        <template slot-scope="{ row }">
          <span class="segment-order-badge">{{ row.segmentOrder }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="段类型"
        width="120"
      >
        <template slot-scope="{ row, $index }">
          <el-select
            v-model="row.segmentType"
            :disabled="disabled"
            size="small"
            style="width: 100%;"
            @change="handleSegmentTypeChange(row, $index)"
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

      <el-table-column
        label="目标温度 (°C)"
        width="140"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-model="row.targetTemperature"
            :disabled="disabled"
            :min="fieldLimits.targetTemperature.min"
            :max="fieldLimits.targetTemperature.max"
            :step="fieldLimits.targetTemperature.step"
            size="small"
            controls-position="right"
            style="width: 100%;"
            @change="emitChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="持续时间 (分钟)"
        width="140"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-model="row.duration"
            :disabled="disabled"
            :min="fieldLimits.duration.min"
            :max="fieldLimits.duration.max"
            :step="fieldLimits.duration.step"
            size="small"
            controls-position="right"
            style="width: 100%;"
            @change="emitChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="升温速率 (°C/h)"
        width="140"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-if="needsHeatingRate(row)"
            v-model="row.heatingRate"
            :disabled="disabled"
            :min="fieldLimits.heatingRate.min"
            :max="fieldLimits.heatingRate.max"
            :step="fieldLimits.heatingRate.step"
            :precision="1"
            size="small"
            controls-position="right"
            style="width: 100%;"
            @change="emitChange"
          />
          <span v-else class="text-placeholder">-</span>
        </template>
      </el-table-column>

      <el-table-column
        label="降温速率 (°C/h)"
        width="140"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-if="needsCoolingRate(row)"
            v-model="row.coolingRate"
            :disabled="disabled"
            :min="fieldLimits.coolingRate.min"
            :max="fieldLimits.coolingRate.max"
            :step="fieldLimits.coolingRate.step"
            :precision="1"
            size="small"
            controls-position="right"
            style="width: 100%;"
            @change="emitChange"
          />
          <span v-else class="text-placeholder">-</span>
        </template>
      </el-table-column>

      <el-table-column
        label="描述"
        min-width="200"
      >
        <template slot-scope="{ row }">
          <el-input
            v-model="row.description"
            :disabled="disabled"
            type="textarea"
            :rows="2"
            maxlength="500"
            size="small"
            placeholder="选填，最多500字"
            @change="emitChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="100"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ $index }">
          <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            :disabled="disabled"
            @click="handleDelete($index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="errorMessages.length > 0" class="segment-editor__errors">
      <el-alert
        v-for="(error, index) in errorMessages"
        :key="index"
        type="error"
        :closable="false"
        show-icon
        :title="error"
      />
    </div>
  </div>
</template>

<script>
import {
  SEGMENT_TYPES,
  SEGMENT_TYPE_OPTIONS,
  SEGMENT_FIELD_LIMITS
} from '../constants/process-parameter-management'

export default {
  name: 'SegmentEditor',
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
      segments: [],
      segmentTypeOptions: SEGMENT_TYPE_OPTIONS,
      fieldLimits: SEGMENT_FIELD_LIMITS
    }
  },
  computed: {
    errorMessages() {
      const errors = []

      if (this.segments.length === 0 && !this.disabled) {
        errors.push('至少需要配置 1 个温度段')
      }

      // 校验段序号连续性
      const orders = this.segments.map(seg => seg.segmentOrder).sort((a, b) => a - b)
      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i + 1) {
          errors.push(`段序号必须从 1 开始连续递增，当前缺少序号 ${i + 1}`)
          break
        }
      }

      // 校验升温段必填升温速率
      this.segments.forEach(seg => {
        if (this.needsHeatingRate(seg) && !seg.heatingRate) {
          errors.push(`段序号 ${seg.segmentOrder}（${seg.segmentType}）缺少升温速率`)
        }
        if (this.needsCoolingRate(seg) && !seg.coolingRate) {
          errors.push(`段序号 ${seg.segmentOrder}（${seg.segmentType}）缺少降温速率`)
        }
      })

      return errors
    }
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(val) {
        this.segments = val ? JSON.parse(JSON.stringify(val)) : []
      }
    }
  },
  methods: {
    handleAdd() {
      const newSegment = {
        segmentOrder: this.segments.length + 1,
        segmentType: SEGMENT_TYPES.HEATING,
        targetTemperature: 450,
        duration: 180,
        heatingRate: 35,
        coolingRate: null,
        description: ''
      }
      this.segments.push(newSegment)
      this.emitChange()
    },
    handleDelete(index) {
      this.$confirm('确认删除该温度段吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.segments.splice(index, 1)
        // 重新排序段序号
        this.reorderSegments()
        this.emitChange()
      }).catch(() => {})
    },
    handleSegmentTypeChange(row, index) {
      // 段类型变化时，清理不需要的速率字段
      if (!this.needsHeatingRate(row)) {
        row.heatingRate = null
      }
      if (!this.needsCoolingRate(row)) {
        row.coolingRate = null
      }
      this.emitChange()
    },
    reorderSegments() {
      this.segments.forEach((seg, index) => {
        seg.segmentOrder = index + 1
      })
    },
    needsHeatingRate(segment) {
      return segment.segmentType === SEGMENT_TYPES.HEATING
    },
    needsCoolingRate(segment) {
      return segment.segmentType === SEGMENT_TYPES.COOLING ||
             segment.segmentType === SEGMENT_TYPES.QUICK_COOLING
    },
    emitChange() {
      this.$emit('input', this.segments)
      this.$emit('change', this.segments)
    },
    validate() {
      return this.errorMessages.length === 0
    },
    getValidationErrors() {
      return this.errorMessages
    }
  }
}
</script>

<style scoped>
.segment-editor {
  width: 100%;
}

.segment-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.segment-editor__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.segment-editor__table {
  width: 100%;
}

.segment-order-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #409eff;
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.text-placeholder {
  color: #c0c4cc;
  font-size: 14px;
}

.segment-editor__errors {
  margin-top: 16px;
}

.segment-editor__errors .el-alert {
  margin-bottom: 8px;
}

.segment-editor__errors .el-alert:last-child {
  margin-bottom: 0;
}
</style>

