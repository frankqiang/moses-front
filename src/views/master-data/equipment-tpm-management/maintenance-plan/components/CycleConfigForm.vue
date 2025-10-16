/**
 * 文件名称：CycleConfigForm.vue
 * 文件描述：周期配置组件，实现周期类型和单位的联动选择
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 */
<template>
  <div class="cycle-config-form">
    <el-row :gutter="20">
      <el-col :span="cycleTypeSpan">
        <el-form-item label="周期类型" :prop="propPrefix ? `${propPrefix}.cycleType` : 'cycleType'">
          <el-select
            v-model="innerCycleType"
            :placeholder="cycleTypePlaceholder"
            :disabled="disabled"
            :size="size"
            style="width: 100%"
            @change="handleCycleTypeChange"
          >
            <el-option
              v-for="item in cycleTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="cycleValueSpan">
        <el-form-item label="周期值" :prop="propPrefix ? `${propPrefix}.cycleValue` : 'cycleValue'">
          <el-input-number
            v-model="innerCycleValue"
            :min="1"
            :max="9999"
            :placeholder="cycleValuePlaceholder"
            :disabled="disabled"
            :size="size"
            controls-position="right"
            style="width: 100%"
            @change="handleCycleValueChange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="cycleUnitSpan">
        <el-form-item label="周期单位" :prop="propPrefix ? `${propPrefix}.cycleUnit` : 'cycleUnit'">
          <el-select
            v-model="innerCycleUnit"
            :placeholder="cycleUnitPlaceholder"
            :disabled="!innerCycleType || disabled"
            :size="size"
            style="width: 100%"
            @change="handleCycleUnitChange"
          >
            <el-option
              v-for="item in cycleUnitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <div v-if="showHint && cycleDescription" class="cycle-hint">
      <i class="el-icon-info" />
      {{ cycleDescription }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CycleConfigForm',

  props: {
    // 周期类型
    cycleType: {
      type: String,
      default: ''
    },
    // 周期值
    cycleValue: {
      type: Number,
      default: null
    },
    // 周期单位
    cycleUnit: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 组件大小
    size: {
      type: String,
      default: 'small',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    },
    // 是否显示提示信息
    showHint: {
      type: Boolean,
      default: true
    },
    // 表单属性前缀（用于嵌套表单）
    propPrefix: {
      type: String,
      default: ''
    },
    // 周期类型占据列数
    cycleTypeSpan: {
      type: Number,
      default: 8
    },
    // 周期值占据列数
    cycleValueSpan: {
      type: Number,
      default: 8
    },
    // 周期单位占据列数
    cycleUnitSpan: {
      type: Number,
      default: 8
    },
    // 占位符
    cycleTypePlaceholder: {
      type: String,
      default: '请选择周期类型'
    },
    cycleValuePlaceholder: {
      type: String,
      default: '请输入周期值'
    },
    cycleUnitPlaceholder: {
      type: String,
      default: '请选择单位'
    }
  },

  data() {
    return {
      innerCycleType: this.cycleType,
      innerCycleValue: this.cycleValue,
      innerCycleUnit: this.cycleUnit,
      // 周期类型选项
      cycleTypeOptions: [
        { label: '按时间', value: '按时间' },
        { label: '按运行时长', value: '按运行时长' },
        { label: '按生产批次', value: '按生产批次' }
      ],
      // 周期单位映射
      cycleUnitMap: {
        '按时间': [
          { label: '天', value: '天' },
          { label: '周', value: '周' },
          { label: '月', value: '月' },
          { label: '年', value: '年' }
        ],
        '按运行时长': [
          { label: '小时', value: '小时' }
        ],
        '按生产批次': [
          { label: '批次', value: '批次' }
        ]
      }
    }
  },

  computed: {
    /**
     * 当前可用的周期单位选项
     */
    cycleUnitOptions() {
      if (!this.innerCycleType) {
        return []
      }
      return this.cycleUnitMap[this.innerCycleType] || []
    },

    /**
     * 周期描述信息
     */
    cycleDescription() {
      if (!this.innerCycleType || !this.innerCycleValue || !this.innerCycleUnit) {
        return ''
      }

      const typeDescMap = {
        '按时间': `每${this.innerCycleValue}${this.innerCycleUnit}执行一次维护`,
        '按运行时长': `设备运行${this.innerCycleValue}${this.innerCycleUnit}后执行维护`,
        '按生产批次': `每生产${this.innerCycleValue}${this.innerCycleUnit}后执行维护`
      }

      return typeDescMap[this.innerCycleType] || ''
    }
  },

  watch: {
    cycleType(newVal) {
      this.innerCycleType = newVal
    },
    cycleValue(newVal) {
      this.innerCycleValue = newVal
    },
    cycleUnit(newVal) {
      this.innerCycleUnit = newVal
    }
  },

  methods: {
    /**
     * 周期类型变更处理
     */
    handleCycleTypeChange(value) {
      this.$emit('update:cycleType', value)
      this.$emit('cycle-type-change', value)

      // 周期类型变更时，清空周期单位并自动选择第一个单位
      const availableUnits = this.cycleUnitMap[value] || []
      if (availableUnits.length > 0) {
        const defaultUnit = availableUnits[0].value
        this.innerCycleUnit = defaultUnit
        this.$emit('update:cycleUnit', defaultUnit)
        this.$emit('cycle-unit-change', defaultUnit)
      } else {
        this.innerCycleUnit = ''
        this.$emit('update:cycleUnit', '')
        this.$emit('cycle-unit-change', '')
      }

      // 触发完整配置变更事件
      this.emitChange()
    },

    /**
     * 周期值变更处理
     */
    handleCycleValueChange(value) {
      this.$emit('update:cycleValue', value)
      this.$emit('cycle-value-change', value)
      this.emitChange()
    },

    /**
     * 周期单位变更处理
     */
    handleCycleUnitChange(value) {
      this.$emit('update:cycleUnit', value)
      this.$emit('cycle-unit-change', value)
      this.emitChange()
    },

    /**
     * 发送完整配置变更事件
     */
    emitChange() {
      this.$emit('change', {
        cycleType: this.innerCycleType,
        cycleValue: this.innerCycleValue,
        cycleUnit: this.innerCycleUnit
      })
    }
  }
}
</script>

<style scoped>
.cycle-config-form {
  width: 100%;
}

.cycle-hint {
  margin-top: -10px;
  padding: 8px 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  color: #606266;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.cycle-hint i {
  margin-right: 6px;
  color: #409eff;
}
</style>

