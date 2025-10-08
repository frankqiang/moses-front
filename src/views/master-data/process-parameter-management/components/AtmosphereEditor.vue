<template>
  <div class="atmosphere-editor">
    <div class="atmosphere-editor__header">
      <h4 class="atmosphere-editor__title">保护气氛参数配置</h4>
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
      v-if="atmospheres.length === 0 && !disabled"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 16px;"
    >
      至少需要配置 1 条保护气氛参数
    </el-alert>

    <el-table
      :data="atmospheres"
      border
      stripe
      class="atmosphere-editor__table"
      :empty-text="disabled ? '暂无保护气氛配置' : '点击【添加配置】按钮开始'"
    >
      <el-table-column
        type="index"
        label="序号"
        width="60"
        align="center"
      />

      <el-table-column
        label="气氛类型"
        width="150"
      >
        <template slot-scope="{ row }">
          <el-select
            v-model="row.atmosphereType"
            :disabled="disabled"
            size="small"
            style="width: 100%;"
            @change="handleAtmosphereTypeChange(row)"
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

      <el-table-column
        label="流量 (m³/h)"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-model="row.flowRate"
            :disabled="disabled"
            :min="fieldLimits.flowRate.min"
            :max="fieldLimits.flowRate.max"
            :step="fieldLimits.flowRate.step"
            :precision="1"
            size="small"
            controls-position="right"
            style="width: 100%;"
            @change="emitChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="流量范围 (m³/h)"
        width="200"
      >
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-input-number
              v-model="row.flowRateMin"
              :disabled="disabled"
              :min="fieldLimits.flowRate.min"
              :max="row.flowRateMax || fieldLimits.flowRate.max"
              :step="fieldLimits.flowRate.step"
              :precision="1"
              size="small"
              controls-position="right"
              placeholder="最小值"
              style="width: 90px;"
              @change="emitChange"
            />
            <span>~</span>
            <el-input-number
              v-model="row.flowRateMax"
              :disabled="disabled"
              :min="row.flowRateMin || fieldLimits.flowRate.min"
              :max="fieldLimits.flowRate.max"
              :step="fieldLimits.flowRate.step"
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
        label="压力 (Pa)"
        width="120"
      >
        <template slot-scope="{ row }">
          <el-input-number
            v-model="row.pressure"
            :disabled="disabled"
            :min="fieldLimits.pressure.min"
            :max="fieldLimits.pressure.max"
            :step="fieldLimits.pressure.step"
            size="small"
            controls-position="right"
            style="width: 100%;"
            @change="emitChange"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="压力范围 (Pa)"
        width="200"
      >
        <template slot-scope="{ row }">
          <div style="display: flex; align-items: center; gap: 8px;">
            <el-input-number
              v-model="row.pressureMin"
              :disabled="disabled"
              :min="fieldLimits.pressure.min"
              :max="row.pressureMax || fieldLimits.pressure.max"
              :step="fieldLimits.pressure.step"
              size="small"
              controls-position="right"
              placeholder="最小值"
              style="width: 90px;"
              @change="emitChange"
            />
            <span>~</span>
            <el-input-number
              v-model="row.pressureMax"
              :disabled="disabled"
              :min="row.pressureMin || fieldLimits.pressure.min"
              :max="fieldLimits.pressure.max"
              :step="fieldLimits.pressure.step"
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
        label="支持氢气"
        width="100"
        align="center"
      >
        <template slot-scope="{ row }">
          <el-checkbox
            v-model="row.supportsHydrogen"
            :disabled="disabled || isHydrogenRequired(row)"
            @change="emitChange"
          />
          <el-tooltip
            v-if="isHydrogenRequired(row)"
            content="氢气混合气类型必须支持氢气"
            placement="top"
          >
            <i class="el-icon-warning" style="color: #e6a23c; margin-left: 4px;" />
          </el-tooltip>
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

    <div v-if="errorMessages.length > 0" class="atmosphere-editor__errors">
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
  ATMOSPHERE_TYPES,
  ATMOSPHERE_TYPE_OPTIONS,
  ATMOSPHERE_FIELD_LIMITS
} from '../constants/process-parameter-management'

export default {
  name: 'AtmosphereEditor',
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
      atmospheres: [],
      atmosphereTypeOptions: ATMOSPHERE_TYPE_OPTIONS,
      fieldLimits: ATMOSPHERE_FIELD_LIMITS
    }
  },
  computed: {
    errorMessages() {
      const errors = []

      if (this.atmospheres.length === 0 && !this.disabled) {
        errors.push('至少需要配置 1 条保护气氛参数')
      }

      // 校验氢气混合气类型必须支持氢气
      this.atmospheres.forEach((atm, index) => {
        if (this.isHydrogenRequired(atm) && !atm.supportsHydrogen) {
          errors.push(`第 ${index + 1} 条气氛配置（${atm.atmosphereType}）必须支持氢气`)
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
        // 深拷贝并确保 supportsHydrogen 字段存在且为布尔类型
        this.atmospheres = val ? JSON.parse(JSON.stringify(val)).map(item => ({
          ...item,
          supportsHydrogen: item.supportsHydrogen === true || item.supportsHydrogen === false
            ? item.supportsHydrogen
            : false  // 如果是 null/undefined，设置为 false
        })) : []
      }
    }
  },
  methods: {
    handleAdd() {
      const newAtmosphere = {
        atmosphereType: ATMOSPHERE_TYPES.NITROGEN,
        flowRate: 80,
        flowRateMin: null,
        flowRateMax: null,
        pressure: null,
        pressureMin: null,
        pressureMax: null,
        supportsHydrogen: false,  // 确保初始值是布尔类型 false，而不是 null
        description: ''
      }
      this.atmospheres.push(newAtmosphere)
      this.emitChange()
    },
    handleDelete(index) {
      this.$confirm('确认删除该气氛配置吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.atmospheres.splice(index, 1)
        this.emitChange()
      }).catch(() => {})
    },
    handleAtmosphereTypeChange(row) {
      // 如果是氢气混合气类型，自动设置 supportsHydrogen 为 true
      if (this.isHydrogenRequired(row)) {
        row.supportsHydrogen = true
      }
      this.emitChange()
    },
    isHydrogenRequired(atmosphere) {
      return atmosphere.atmosphereType === ATMOSPHERE_TYPES.HYDROGEN_NITROGEN ||
             atmosphere.atmosphereType === ATMOSPHERE_TYPES.NITROGEN_HYDROGEN
    },
    emitChange() {
      // 调试日志：检查 supportsHydrogen 的值
      this.atmospheres.forEach((atm, index) => {
        console.log(`[AtmosphereEditor] 气氛#${index + 1} supportsHydrogen:`, atm.supportsHydrogen, 'type:', typeof atm.supportsHydrogen)
      })
      this.$emit('input', this.atmospheres)
      this.$emit('change', this.atmospheres)
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
.atmosphere-editor {
  width: 100%;
}

.atmosphere-editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.atmosphere-editor__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.atmosphere-editor__table {
  width: 100%;
}

.atmosphere-editor__errors {
  margin-top: 16px;
}

.atmosphere-editor__errors .el-alert {
  margin-bottom: 8px;
}

.atmosphere-editor__errors .el-alert:last-child {
  margin-bottom: 0;
}
</style>

