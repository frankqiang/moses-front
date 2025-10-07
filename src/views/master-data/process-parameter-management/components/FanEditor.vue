<template>
  <div class="fan-editor">
    <div class="fan-editor__header">
      <h4 class="fan-editor__title">循环风机参数配置</h4>
      <el-button
        type="primary"
        size="small"
        icon="el-icon-plus"
        :disabled="disabled"
        @click="handleAdd"
      >
        添加配置
      </el-button>
    </div>

    <el-alert
      v-if="fans.length === 0 && !disabled"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 16px;"
    >
      至少需要配置 1 条风机参数
    </el-alert>

    <el-table
      :data="fans"
      border
      stripe
      class="fan-editor__table"
      :empty-text="disabled ? '暂无风机配置' : '点击【添加配置】按钮开始'"
    >
      <el-table-column
        type="index"
        label="序号"
        width="60"
        align="center"
      />

      <el-table-column
        label="频率 (Hz)"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-model="row.frequency"
            :disabled="disabled"
            :min="fieldLimits.frequency.min"
            :max="fieldLimits.frequency.max"
            :step="fieldLimits.frequency.step"
            :precision="1"
            size="small"
            controls-position="right"
            style="width: 100%;"
            @change="emitChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="频率范围 (Hz)"
        width="200"
      >
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-input-number
              v-model="row.frequencyMin"
              :disabled="disabled"
              :min="fieldLimits.frequency.min"
              :max="row.frequencyMax || fieldLimits.frequency.max"
              :step="fieldLimits.frequency.step"
              :precision="1"
              size="small"
              controls-position="right"
              placeholder="最小值"
              style="width: 90px;"
              @change="emitChange"
            />
            <span>~</span>
            <el-input-number
              v-model="row.frequencyMax"
              :disabled="disabled"
              :min="row.frequencyMin || fieldLimits.frequency.min"
              :max="fieldLimits.frequency.max"
              :step="fieldLimits.frequency.step"
              :precision="1"
              size="small"
              controls-position="right"
              placeholder="最大值"
              style="width: 90px;"
              @change="emitChange"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="适用段序号"
        width="140"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-model="row.segmentOrder"
            :disabled="disabled"
            :min="1"
            :max="maxSegmentOrder"
            :step="1"
            size="small"
            controls-position="right"
            placeholder="留空表示全局"
            style="width: 100%;"
            @change="emitChange"
          />
          <el-tooltip
            v-if="row.segmentOrder && !isValidSegmentOrder(row.segmentOrder)"
            content="该段序号在温度段配置中不存在"
            placement="top"
          >
            <i class="el-icon-warning" style="color: #f56c6c; margin-left: 4px;" />
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column
        label="运行模式"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-select
            v-model="row.mode"
            :disabled="disabled"
            size="small"
            style="width: 100%;"
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

    <div v-if="errorMessages.length > 0" class="fan-editor__errors">
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
  FAN_MODE_OPTIONS,
  FAN_MODES,
  FAN_FIELD_LIMITS
} from '../constants/process-parameter-management'

export default {
  name: 'FanEditor',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    segmentOrders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fans: [],
      fanModeOptions: FAN_MODE_OPTIONS,
      fieldLimits: FAN_FIELD_LIMITS
    }
  },
  computed: {
    maxSegmentOrder() {
      return this.segmentOrders.length > 0
        ? Math.max(...this.segmentOrders)
        : 1000
    },
    errorMessages() {
      const errors = []

      if (this.fans.length === 0 && !this.disabled) {
        errors.push('至少需要配置 1 条风机参数')
      }

      // 校验段序号有效性
      this.fans.forEach((fan, index) => {
        if (fan.segmentOrder && !this.isValidSegmentOrder(fan.segmentOrder)) {
          errors.push(`第 ${index + 1} 条风机配置的段序号 ${fan.segmentOrder} 在温度段配置中不存在`)
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
        this.fans = val ? JSON.parse(JSON.stringify(val)) : []
      }
    }
  },
  methods: {
    handleAdd() {
      const newFan = {
        frequency: 45,
        frequencyMin: null,
        frequencyMax: null,
        segmentOrder: null,
        mode: FAN_MODES.VARIABLE_FREQUENCY,
        description: ''
      }
      this.fans.push(newFan)
      this.emitChange()
    },
    handleDelete(index) {
      this.$confirm('确认删除该风机配置吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.fans.splice(index, 1)
        this.emitChange()
      }).catch(() => {})
    },
    isValidSegmentOrder(order) {
      return this.segmentOrders.includes(order)
    },
    emitChange() {
      this.$emit('input', this.fans)
      this.$emit('change', this.fans)
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
.fan-editor {
  width: 100%;
}

.fan-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fan-editor__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.fan-editor__table {
  width: 100%;
}

.fan-editor__errors {
  margin-top: 16px;
}

.fan-editor__errors .el-alert {
  margin-bottom: 8px;
}

.fan-editor__errors .el-alert:last-child {
  margin-bottom: 0;
}
</style>

