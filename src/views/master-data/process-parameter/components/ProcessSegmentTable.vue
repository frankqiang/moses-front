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
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          :disabled="segments.length >= maxSegments || disabled"
          @click="handleAddSegment"
        >
          添加工艺段
        </el-button>
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
        width="120"
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
        width="180"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.targetTemp"
            :min="0"
            :max="1000"
            size="mini"
            :disabled="disabled"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 持续时间 -->
      <el-table-column
        label="持续时间 (小时)"
        width="180"
        align="center"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.duration"
            :min="1"
            :max="1440"
            size="mini"
            :disabled="disabled"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 升/降温速率 -->
      <el-table-column
        label="速率 (°C/小时)"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ calculateRate(scope.row, scope.$index) }}</span>
        </template>
      </el-table-column>
      
      <!-- 前区循环风机设定 -->
      <el-table-column
        label="前区循环风机 (Hz)"
        width="180"
        align="center"
        v-if="furnaceCapabilities.hasBackZone !== false"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.vfQSet"
            :min="0"
            :max="60"
            size="mini"
            :disabled="disabled"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 后区循环风机设定 -->
      <el-table-column
        label="后区循环风机 (Hz)"
        width="180"
        align="center"
        v-if="furnaceCapabilities.hasBackZone"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.vfHSet"
            :min="0"
            :max="60"
            size="mini"
            :disabled="disabled"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 负压风机设定 -->
      <el-table-column
        label="负压风机 (Hz)"
        width="180"
        align="center"
        v-if="furnaceCapabilities.hasNegativePressure"
      >
        <template slot-scope="scope">
          <el-input-number
            v-model="scope.row.vfFySet"
            :min="0"
            :max="30"
            size="mini"
            :disabled="disabled"
            @change="handleValueChange"
          />
        </template>
      </el-table-column>
      
      <!-- 吹洗阀设定 -->
      <el-table-column
        label="吹洗阀"
        width="180"
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
            :disabled="disabled"
            @change="handleValueChange"
          >
            <template #suffix>%</template>
          </el-input-number>
        </template>
      </el-table-column>
      
      <!-- 操作 -->
      <el-table-column
        label="操作"
        width="100"
        align="center"
  
      >
        <template slot-scope="scope">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            circle
            :disabled="segments.length <= 1 || disabled"
            @click="handleDeleteSegment(scope.$index)"
          />
        </template>
      </el-table-column>
    </el-table>
    
    <div class="table-footer" v-if="segments.length >= maxSegments">
      <el-alert
        title="已达到最大工艺段数量限制"
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
        maxSegments: 12
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
      ]
    }
  },
  computed: {
    // 最大段数
    maxSegments() {
      return this.furnaceCapabilities.maxSegments || 12
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
    }
  },
  methods: {
    // 创建默认工艺段
    createDefaultSegment(segmentNumber) {
      return {
        segmentNumber,
        segmentType: '升温',
        targetTemp: 300,
        duration: 5,
        vfQSet: 30,
        vfHSet: this.furnaceCapabilities.hasBackZone ? 30 : 0,
        vfFySet: this.furnaceCapabilities.hasNegativePressure ? 10 : 0,
        cvSet: this.furnaceCapabilities.hasCoolingValve ? 0 : undefined
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
        // 快速冷却段：如果有上一段，则温度设为上一段的一半
        if (index > 0) {
          segment.targetTemp = Math.floor(this.segments[index - 1].targetTemp / 2)
        } else {
          segment.targetTemp = 100 // 默认冷却到100度
        }
        
        // 设置吹洗阀开度为75%
        if (this.furnaceCapabilities.hasCoolingValve) {
          segment.cvSet = 75
        }
      }
      
      this.emitChange()
    },
    
    // 处理值变化
    handleValueChange() {
      this.emitChange()
    },
    
    // 计算升/降温速率
    calculateRate(segment, index) {
      // 保温段速率为0
      if (segment.segmentType === '保温') {
        return '0'
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
      
      // 计算速率
      if (segment.duration <= 0) return '0'
      const rate = tempDiff / segment.duration
      
      // 格式化为两位小数
      return rate.toFixed(2)
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
  }
  
  .table-footer {
    margin-top: 10px;
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
