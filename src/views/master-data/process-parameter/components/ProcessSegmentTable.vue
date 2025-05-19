/**
 * 工艺段表格组件
 * 功能描述：展示和编辑工艺段参数，支持动态添加和删除工艺段
 * 创建日期：2024-11-15
 */
<template>
  <div class="process-segment-table">
    <div class="table-header">
      <div class="header-title">工艺段参数设置</div>
      <div class="header-actions">
        <el-tooltip content="添加新的工艺段" placement="top" effect="light">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            :disabled="segments.length >= maxSegments || disabled"
            @click="handleAddSegment"
          >
            添加工艺段
          </el-button>
        </el-tooltip>
        
        <el-tooltip :content="'最多允许添加 ' + maxSegments + ' 个工艺段'" placement="top" effect="light">
          <el-tag type="info" size="mini" class="segment-counter">
            {{ segments.length }}/{{ maxSegments }}
          </el-tag>
        </el-tooltip>
      </div>
    </div>
    
    <el-table
      :data="segments"
      border
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      fit
    >
      <!-- 段序号 -->
      <el-table-column
        label="段序号"
        width="70"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.segmentNumber }}
        </template>
      </el-table-column>
      
      <!-- 段类型 -->
      <el-table-column
        label="段类型"
        width="110"
        align="center"
      >
        <template slot-scope="scope">
          <el-select
            v-model="scope.row.segmentType"
            placeholder="请选择"
            size="mini"
            :disabled="disabled"
            @change="handleSegmentTypeChange(scope.$index)"
          >
            <el-option
              v-for="item in segmentTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </template>
      </el-table-column>
      
      <!-- 目标温度 -->
      <el-table-column
        label="目标温度 (°C)"
        width="160"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.targetTemp"
            :min="0"
            :max="maxTemperature"
            size="mini"
            :disabled="disabled"
            @change="handleTargetTempChange(scope.$index)"
          />
        </template>
      </el-table-column>
      
            <!-- 持续时间 -->      <el-table-column        label="持续时间 (小时)"        width="160"        align="center"      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.duration"
            :min="1"
            :max="1440"
            size="mini"
            :disabled="disabled"
            @change="handleDurationChange(scope.$index)"
          />
        </template>
      </el-table-column>
      
      <!-- 升/降温速率 -->
      <el-table-column
        label="速率 (°C/小时)"
        width="130"
        align="center"
      >
        <template slot-scope="scope">
          <div class="rate-container">
            <span 
              :class="{ 
                'rate-value': true, 
                'rate-warning': isRateExceeded(scope.row, scope.$index) 
              }"
              :title="getRateTooltip(scope.row, scope.$index)"
            >
              {{ calculateRate(scope.row, scope.$index) }}
            </span>
            <el-tooltip 
              v-if="isRateExceeded(scope.row, scope.$index)"
              :content="'最大建议速率: ' + maxHeatingRate + ' °C/小时'"
              placement="top" 
              effect="light"
            >
              <i class="el-icon-warning-outline rate-warning-icon"></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      
      <!-- 前区循环风机设定 -->
      <el-table-column
        label="前区循环风机 (Hz)"
        width="160"
        align="center"
        v-if="furnaceCapabilities.hasBackZone !== false"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.vfQSet"
            :min="0"
            :max="60"
            size="mini"
            :disabled="disabled || !isDeviceEnabled(scope.row.segmentType, 'vfQ')"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 后区循环风机设定 -->
      <el-table-column
        label="后区循环风机 (Hz)"
        width="160"
        align="center"
        v-if="furnaceCapabilities.hasBackZone"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.vfHSet"
            :min="0"
            :max="60"
            size="mini"
            :disabled="disabled || !isDeviceEnabled(scope.row.segmentType, 'vfH')"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 负压风机设定 -->
      <el-table-column
        label="负压风机 (Hz)"
        width="160"
        align="center"
        v-if="furnaceCapabilities.hasNegativePressure"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.vfFySet"
            :min="0"
            :max="30"
            size="mini"
            :disabled="disabled || !isDeviceEnabled(scope.row.segmentType, 'vfFy')"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 吹洗阀设定 -->
      <el-table-column
        label="吹洗阀"
        width="160"
        align="center"
        v-if="furnaceCapabilities.hasCoolingValve"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.cvSet"
            :min="0"
            :max="100"
            :step="5"
            size="mini"
            :disabled="disabled || !isDeviceEnabled(scope.row.segmentType, 'cv')"
            @change="handleValueChange"
          >
            <template #suffix>%</template>
          </el-input-number>
        </template>
      </el-table-column>
      
      <!-- 操作 -->
      <el-table-column
        label="操作"
        width="150"
        align="center"
      >
        <template slot-scope="scope">
          <div class="action-buttons">
            <el-tooltip content="上移" placement="top" effect="light" v-if="scope.$index > 0">
              <el-button
                type="text"
                icon="el-icon-arrow-up"
                size="mini"
                :disabled="disabled"
                @click="handleMoveSegment(scope.$index, 'up')"
              />
            </el-tooltip>
            
            <el-tooltip content="下移" placement="top" effect="light" v-if="scope.$index < segments.length - 1">
              <el-button
                type="text"
                icon="el-icon-arrow-down"
                size="mini"
                :disabled="disabled"
                @click="handleMoveSegment(scope.$index, 'down')"
              />
            </el-tooltip>
            
            <el-tooltip content="删除此工艺段" placement="top" effect="light">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                :disabled="segments.length <= 1 || disabled"
                @click="handleDeleteSegment(scope.$index)"
              />
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="table-footer">
      <el-alert
        v-if="segments.length >= maxSegments"
        title="已达到最大工艺段数量限制"
        type="warning"
        :closable="false"
        show-icon
      />
      
      <el-alert
        v-if="hasRateWarning"
        title="部分工艺段的升/降温速率超过推荐值，可能影响处理质量"
        type="warning"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProcessSegmentTable',
  props: {
    // 工艺段数据
    value: {
      type: Array,
      default: () => []
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 炉型能力配置
    furnaceCapabilities: {
      type: Object,
      default: () => ({
        hasBackZone: true,
        hasNegativePressure: true,
        hasCoolingValve: true,
        maxSegments: 12,
        maxTemperature: 1000,
        maxHeatingRate: 10
      })
    },
    // 初始温度（用于计算第一段的升/降温速率）
    initialTemp: {
      type: Number,
      default: 25 // 默认室温
    }
  },
  data() {
    return {
      segments: [],
      // 段类型选项
      segmentTypeOptions: [
        { value: '升温', label: '升温' },
        { value: '保温', label: '保温' },
        { value: '降温', label: '降温' },
        { value: '快速冷却', label: '快速冷却' }
      ],
      // 吹洗阀选项
      cvSetOptions: [
        { value: 0, label: '0%' },
        { value: 25, label: '25%' },
        { value: 50, label: '50%' },
        { value: 75, label: '75%' },
        { value: 100, label: '100%' }
      ],
      // 设备与段类型的推荐配置
      deviceRecommendations: {
        '升温': {
          vfQ: true,
          vfH: true,
          vfFy: true,
          cv: true // 默认允许编辑吹洗阀
        },
        '保温': {
          vfQ: true,
          vfH: true,
          vfFy: true,
          cv: true // 默认允许编辑吹洗阀
        },
        '降温': {
          vfQ: true,
          vfH: true,
          vfFy: true,
          cv: true // 默认允许编辑吹洗阀
        },
        '快速冷却': {
          vfQ: false,
          vfH: false,
          vfFy: true,
          cv: true
        }
      }
    }
  },
  computed: {
    // 最大段数
    maxSegments() {
      return this.furnaceCapabilities.maxSegments || 12
    },
    
    // 最大温度
    maxTemperature() {
      return this.furnaceCapabilities.maxTemperature || 1000
    },
    
    // 最大升温速率
    maxHeatingRate() {
      return this.furnaceCapabilities.maxHeatingRate || 10
    },
    
    // 是否有速率警告
    hasRateWarning() {
      return this.segments.some((segment, index) => {
        return this.isRateExceeded(segment, index)
      })
    }
  },
  watch: {
    // 监听外部传入的value变化
    value: {
      handler(newValue) {
        if (newValue && newValue.length) {
          this.segments = JSON.parse(JSON.stringify(newValue))
        } else {
          // 如果没有传入数据，创建一个默认段
          this.segments = [this.createDefaultSegment(1)]
        }
      },
      immediate: true,
      deep: true
    },
    
    // 监听炉型能力配置变化
    furnaceCapabilities: {
      handler() {
        // 更新工艺段配置以匹配炉型能力
        this.updateSegmentsForFurnaceCapabilities()
      },
      deep: true
    }
  },
  methods: {
    // 创建默认工艺段
    createDefaultSegment(segmentNumber) {
      return {
        segmentNumber,
        segmentType: '升温',
        targetTemp: 300,
        duration: 1, // 使用小时作为持续时间单位
        vfQSet: this.furnaceCapabilities.hasBackZone !== false ? 30 : 0,
        vfHSet: this.furnaceCapabilities.hasBackZone ? 30 : 0,
        vfFySet: this.furnaceCapabilities.hasNegativePressure ? 10 : 0,
        cvSet: this.furnaceCapabilities.hasCoolingValve ? 0 : 0 // 确保值不为undefined
      }
    },
    
    // 添加工艺段
    handleAddSegment() {
      if (this.segments.length >= this.maxSegments) {
        this.$message.warning(`最多只能添加${this.maxSegments}个工艺段`)
        return
      }
      
      const newSegment = this.createDefaultSegment(this.segments.length + 1)
      
      // 如果有上一段，新段的目标温度默认与上一段相同
      if (this.segments.length > 0) {
        const lastSegment = this.segments[this.segments.length - 1]
        newSegment.targetTemp = lastSegment.targetTemp
        newSegment.vfQSet = lastSegment.vfQSet
        newSegment.vfHSet = lastSegment.vfHSet
        newSegment.vfFySet = lastSegment.vfFySet
        newSegment.cvSet = lastSegment.cvSet
      }
      
      this.segments.push(newSegment)
      this.emitChange()
    },
    
    // 删除工艺段
    handleDeleteSegment(index) {
      if (this.segments.length <= 1) {
        this.$message.warning('至少需要保留一个工艺段')
        return
      }
      
      this.segments.splice(index, 1)
      
      // 重新编号
      this.segments.forEach((segment, idx) => {
        segment.segmentNumber = idx + 1
      })
      
      this.emitChange()
    },
    
    // 移动工艺段
    handleMoveSegment(index, direction) {
      if (direction === 'up' && index > 0) {
        // 上移
        const temp = this.segments[index]
        this.segments[index] = this.segments[index - 1]
        this.segments[index - 1] = temp
        
        // 更新序号
        this.segments[index].segmentNumber = index + 1
        this.segments[index - 1].segmentNumber = index
        
        this.emitChange()
      } else if (direction === 'down' && index < this.segments.length - 1) {
        // 下移
        const temp = this.segments[index]
        this.segments[index] = this.segments[index + 1]
        this.segments[index + 1] = temp
        
        // 更新序号
        this.segments[index].segmentNumber = index + 1
        this.segments[index + 1].segmentNumber = index + 2
        
        this.emitChange()
      }
    },
    
    // 处理段类型变化
    handleSegmentTypeChange(index) {
      const segment = this.segments[index]
      
      // 根据段类型设置默认值
      if (segment.segmentType === '保温') {
        // 保温段：如果有上一段，则温度保持不变
        if (index > 0) {
          segment.targetTemp = this.segments[index - 1].targetTemp
        }
      } else if (segment.segmentType === '快速冷却') {
        // 快速冷却段：如果有上一段，则温度设为上一段的一半或环境温度（取较高值）
        if (index > 0) {
          const prevTemp = this.segments[index - 1].targetTemp
          segment.targetTemp = Math.max(Math.floor(prevTemp / 2), this.initialTemp)
        } else {
          segment.targetTemp = 100 // 默认冷却到100度
        }
        
        // 设置吹洗阀开度为75%
        if (this.furnaceCapabilities.hasCoolingValve) {
          segment.cvSet = 75
        }
      }
      
      // 根据段类型更新设备设置
      this.updateDeviceSettingsForSegmentType(segment)
      
      this.emitChange()
    },
    
    // 处理目标温度变化
    handleTargetTempChange(index) {
      // 如果修改了目标温度，立即更新
      this.emitChange()
    },
    
    // 处理持续时间变化
    handleDurationChange(index) {
      // 如果修改了持续时间，立即更新
      this.emitChange()
    },
    
    // 处理值变化
    handleValueChange() {
      // 任何值变化都立即更新
      this.emitChange()
    },
    
    // 计算升/降温速率
    calculateRate(segment, index) {
      // 保温段速率为0
      if (segment.segmentType === '保温') {
        return '0.00'
      }
      
      // 获取起始温度
      let startTemp
      if (index === 0) {
        // 第一段使用初始温度
        startTemp = this.initialTemp
      } else {
        // 其他段使用上一段的目标温度
        startTemp = this.segments[index - 1].targetTemp
      }
      
      // 计算温度差
      const tempDiff = segment.targetTemp - startTemp
      
      // 计算速率 (°C/小时)
      if (segment.duration <= 0) return '0.00'
      
      // 直接计算每小时的速率
      const rate = tempDiff / segment.duration
      
      // 格式化为两位小数
      return rate.toFixed(2)
    },
    
    // 检查速率是否超过建议值
    isRateExceeded(segment, index) {
      // 保温段不检查
      if (segment.segmentType === '保温') {
        return false
      }
      
      const rate = parseFloat(this.calculateRate(segment, index))
      
      // 升温段检查上限
      if (segment.segmentType === '升温' && rate > this.maxHeatingRate * 60) {
        return true
      }
      
      // 降温段和冷却段也有速率限制，但通常比升温更宽松
      if ((segment.segmentType === '降温' || segment.segmentType === '快速冷却') && 
          Math.abs(rate) > this.maxHeatingRate * 60 * 1.5) {
        return true
      }
      
      return false
    },
    
    // 获取速率提示文本
    getRateTooltip(segment, index) {
      if (this.isRateExceeded(segment, index)) {
        const rate = this.calculateRate(segment, index)
        return `当前速率 ${rate} °C/小时超过了推荐最大速率 ${this.maxHeatingRate * 60} °C/小时`
      }
      return ''
    },
    
    // 检查设备是否启用
    isDeviceEnabled(segmentType, deviceType) {
      // 如果没有找到段类型的推荐配置，默认启用
      if (!this.deviceRecommendations[segmentType]) {
        return true
      }
      
      // 返回该段类型下该设备的启用状态
      return this.deviceRecommendations[segmentType][deviceType]
    },
    
    // 更新设备设置以适应段类型
    updateDeviceSettingsForSegmentType(segment) {
      const typeConfig = this.deviceRecommendations[segment.segmentType]
      if (!typeConfig) return
      
      // 为快速冷却段特别设置
      if (segment.segmentType === '快速冷却') {
        // 关闭循环风机
        if (this.furnaceCapabilities.hasBackZone !== false) {
          segment.vfQSet = 0
        }
        
        if (this.furnaceCapabilities.hasBackZone) {
          segment.vfHSet = 0
        }
        
        // 增加负压风机转速
        if (this.furnaceCapabilities.hasNegativePressure) {
          segment.vfFySet = 20
        }
        
        // 打开吹洗阀
        if (this.furnaceCapabilities.hasCoolingValve) {
          segment.cvSet = 75
        }
      }
    },
    
    // 更新工艺段以适应炉型能力
    updateSegmentsForFurnaceCapabilities() {
      if (!this.segments || !this.segments.length) return
      
      let hasChanges = false
      
      this.segments.forEach(segment => {
        // 检查后区风机
        if (this.furnaceCapabilities.hasBackZone === false) {
          if (segment.vfHSet !== 0) {
            segment.vfHSet = 0
            hasChanges = true
          }
        }
        
        // 检查负压风机
        if (this.furnaceCapabilities.hasNegativePressure === false) {
          if (segment.vfFySet !== 0) {
            segment.vfFySet = 0
            hasChanges = true
          }
        }
        
        // 检查吹洗阀
        if (this.furnaceCapabilities.hasCoolingValve === false) {
          if (segment.cvSet !== 0) {
            segment.cvSet = 0
            hasChanges = true
          }
        }
        
        // 检查温度上限
        if (segment.targetTemp > this.maxTemperature) {
          segment.targetTemp = this.maxTemperature
          hasChanges = true
        }
      })
      
      // 如果段数超过限制，截断多余段
      if (this.segments.length > this.maxSegments) {
        this.$message.warning(`根据炉型能力，已自动调整工艺段数量至${this.maxSegments}段`)
        this.segments.splice(this.maxSegments)
        hasChanges = true
      }
      
      if (hasChanges) {
        this.emitChange()
      }
    },
    
    // 向父组件发送变更
    emitChange() {
      this.$emit('input', JSON.parse(JSON.stringify(this.segments)))
      this.$emit('change', JSON.parse(JSON.stringify(this.segments)))
    }
  }
}
</script>

<style lang="scss" scoped>
.process-segment-table {
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    
    .header-title {
      font-size: 16px;
      font-weight: bold;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      
      .segment-counter {
        margin-left: 10px;
      }
    }
  }
  
  .table-footer {
    margin-top: 10px;
    
    .el-alert {
      margin-bottom: 10px;
    }
  }
  
  .rate-container {
    display: flex;
    align-items: center;
    justify-content: center;
    
    .rate-value {
      margin-right: 5px;
      
      &.rate-warning {
        color: #E6A23C;
      }
    }
    
    .rate-warning-icon {
      color: #E6A23C;
      cursor: pointer;
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    
    .el-button {
      margin: 0 3px;
    }
  }
  
  :deep(.el-table) {
    width: 100% !important;
    
    .el-table__header-wrapper,
    .el-table__body-wrapper {
      width: 100% !important;
    }
    
    .el-table__inner-wrapper,
    .el-table__body,
    .el-table__header {
      width: 100% !important;
    }
  }
}
</style>
