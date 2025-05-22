/**
 * 炉型选择器组件
 * 功能描述：提供炉型选择功能，并展示炉型的能力配置信息
 * 创建日期：2024-11-16
 */
<template>
  <div class="furnace-type-selector">
    <div class="selector-container">
      <el-select
        v-model="selectedType"
        :placeholder="placeholder"
        :disabled="disabled"
        :clearable="clearable"
        filterable
        @change="handleChange"
        class="furnace-select"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          <span>{{ item.label }}</span>
        </el-option>
      </el-select>
      
      <el-popover
        placement="right"
        width="350"
        trigger="hover"
        :visible-arrow="true"
        popper-class="furnace-capabilities-popover"
      >
        <div class="capabilities-container" v-if="selectedType && capabilities">
          <div class="capabilities-title">炉型能力配置</div>
          <el-divider></el-divider>
          <div class="capabilities-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="capability-item">
                  <span class="capability-label">区域控制:</span>
                  <span class="capability-value">{{ capabilities.hasBackZone ? '前后双区' : '单区' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="capability-item">
                  <span class="capability-label">负压系统:</span>
                  <span class="capability-value">{{ capabilities.hasNegativePressure ? '支持' : '不支持' }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="capability-item">
                  <span class="capability-label">吹洗阀:</span>
                  <span class="capability-value">{{ capabilities.hasCoolingValve ? '支持' : '不支持' }}</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="capability-item">
                  <span class="capability-label">最大工艺段:</span>
                  <span class="capability-value">{{ capabilities.maxSegments || 12 }}</span>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="capability-item">
                  <span class="capability-label">最高温度:</span>
                  <span class="capability-value">{{ capabilities.maxTemperature || 1000 }}°C</span>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="capability-item">
                  <span class="capability-label">最大升温速率:</span>
                  <span class="capability-value">{{ capabilities.maxHeatingRate || 10 }}°C/分钟</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="capabilities-container" v-else>
          <div class="no-selection">请先选择炉型以查看能力配置</div>
        </div>
        <el-button slot="reference" type="text" icon="el-icon-info" :disabled="!selectedType">查看能力配置</el-button>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { getAllFurnaceTypes } from '@/api/master-data/furnace-type'

export default {
  name: 'FurnaceTypeSelector',
  props: {
    // 绑定值
    value: {
      type: [String, Number],
      default: ''
    },
    // 占位文本
    placeholder: {
      type: String,
      default: '请选择炉型'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedType: this.value,
      options: [],
      furnaceTypes: [],
      capabilities: null,
      loading: false
    }
  },
  watch: {
    value: {
      handler(val) {
        this.selectedType = val
        if (val) {
          this.updateCapabilities(val)
        } else {
          this.capabilities = null
        }
      },
      immediate: true
    }
  },
  created() {
    this.fetchFurnaceTypes()
  },
  methods: {
    // 获取炉型列表
    fetchFurnaceTypes() {
      this.loading = true
      getAllFurnaceTypes().then(response => {
        let furnaceTypes = []
        
        // 处理嵌套的API返回结构
        if (response && response.code === 20000) {
          if (response.data && response.data.items) {
            // 分页格式的返回
            furnaceTypes = response.data.items
          } else if (Array.isArray(response.data)) {
            // 直接返回数组的情况
            furnaceTypes = response.data
          }
        }
        
        this.furnaceTypes = furnaceTypes
        
        // 转换为下拉选项格式
        this.options = furnaceTypes.map(type => ({
          label: `${type.furnaceTypeName || type.name} (${type.furnaceTypeCode || type.code || '无代码'})`,
          value: type.furnaceTypeCode || type.id
        }))
        
        // 如果未设置value但有炉型选项，自动选择第一个并触发change事件
        if (!this.selectedType && furnaceTypes.length > 0 && !this.disabled) {
          const firstType = furnaceTypes[0].furnaceTypeCode || furnaceTypes[0].id
          this.selectedType = firstType
          this.$emit('input', firstType)
          this.updateCapabilities(firstType)
        } else if (this.selectedType) {
          // 更新当前选中炉型的能力配置
          this.updateCapabilities(this.selectedType)
        }
        
        this.loading = false
      }).catch(error => {
        console.error('获取炉型列表失败', error)
        this.$message.error('获取炉型列表失败')
        this.loading = false
      })
    },
    
    // 处理炉型变更
    handleChange(value) {
      this.selectedType = value
      this.updateCapabilities(value)
      this.$emit('input', value)
      this.$emit('change', value, this.capabilities)
    },
    
    // 更新炉型能力配置
    updateCapabilities(furnaceTypeId) {
      if (!furnaceTypeId || !this.furnaceTypes || !this.furnaceTypes.length) {
        this.capabilities = null
        this.$emit('capabilities-change', null)
        return
      }
      
      // 查找匹配的炉型，使用ID或者代码
      const selectedType = this.furnaceTypes.find(type => 
        (type.id === furnaceTypeId) || (type.furnaceTypeCode === furnaceTypeId)
      )
      
      if (selectedType) {
        // 直接从炉型对象中提取能力参数
        this.capabilities = {
          hasBackZone: selectedType.hasRearCirculationFan, // 后区循环风机对应后区控制
          hasNegativePressure: selectedType.hasVacuumFan, // 负压风机
          hasCoolingValve: selectedType.hasPurgeValve, // 吹洗阀
          maxSegments: selectedType.maxSegments || 12,
          maxTemperature: selectedType.maxTemperatureLimit || 1000,
          maxHeatingRate: selectedType.maxHeatingRate || 10,
          supportedAtmosphereTypes: selectedType.supportedAtmosphereTypes || ['纯氮气']
        }
        
        // 发送能力配置变更事件
        this.$emit('capabilities-change', this.capabilities)
        
        console.log('已更新炉型能力配置:', this.capabilities)
      } else {
        // 没有找到能力配置，尝试从后端获取详细信息
        this.loading = true
        getAllFurnaceTypes().then(response => {
          let furnaceTypes = []
          
          // 处理不同的API返回结构
          if (response.data && Array.isArray(response.data.items)) {
            furnaceTypes = response.data.items
          } else if (Array.isArray(response.data)) {
            furnaceTypes = response.data
          }
          
          // 尝试根据ID或代码找到炉型
          const updatedType = furnaceTypes.find(type => 
            (type.id === furnaceTypeId) || (type.furnaceTypeCode === furnaceTypeId)
          )
          
          if (updatedType) {
            // 直接从炉型对象中提取能力参数
            this.capabilities = {
              hasBackZone: updatedType.hasRearCirculationFan,
              hasNegativePressure: updatedType.hasVacuumFan,
              hasCoolingValve: updatedType.hasPurgeValve,
              maxSegments: updatedType.maxSegments || 12,
              maxTemperature: updatedType.maxTemperatureLimit || 1000,
              maxHeatingRate: updatedType.maxHeatingRate || 10,
              supportedAtmosphereTypes: updatedType.supportedAtmosphereTypes || ['纯氮气']
            }
          } else {
            // 仍然没有找到，使用默认配置
            this.capabilities = {
              hasBackZone: true,
              hasNegativePressure: true,
              hasCoolingValve: true,
              maxSegments: 12,
              maxTemperature: 1000,
              maxHeatingRate: 10,
              supportedAtmosphereTypes: ['纯氮气']
            }
          }
          
          // 发送能力配置变更事件
          this.$emit('capabilities-change', this.capabilities)
          console.log('更新后的炉型能力配置:', this.capabilities)
          
          this.loading = false
        }).catch(() => {
          // 发生错误，使用默认配置
          this.capabilities = {
            hasBackZone: true,
            hasNegativePressure: true,
            hasCoolingValve: true,
            maxSegments: 12,
            maxTemperature: 1000,
            maxHeatingRate: 10,
            supportedAtmosphereTypes: ['纯氮气']
          }
          
          // 发送能力配置变更事件
          this.$emit('capabilities-change', this.capabilities)
          console.log('使用默认炉型能力配置:', this.capabilities)
          
          this.loading = false
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.furnace-type-selector {
  width: 100%;
  
  .selector-container {
    display: flex;
    align-items: center;
    
    .furnace-select {
      width: 100%;
      margin-right: 10px;
    }
  }
}

.capabilities-container {
  padding: 10px;
  
  .capabilities-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;
    text-align: center;
    margin-bottom: 10px;
  }
  
  .capabilities-content {
    margin-top: 15px;
    
    .capability-item {
      margin-bottom: 15px;
      
      .capability-label {
        color: #606266;
        margin-right: 10px;
      }
      
      .capability-value {
        font-weight: bold;
        color: #303133;
      }
    }
  }
  
  .no-selection {
    text-align: center;
    color: #909399;
    padding: 20px 0;
  }
}
</style>

<style lang="scss">
.furnace-capabilities-popover {
  min-width: 350px;
  
  .el-popover__title {
    margin: 0;
    padding: 0;
  }
}
</style> 