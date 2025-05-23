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
        width="600"
        trigger="hover"
        :visible-arrow="true"
        popper-class="furnace-capabilities-popover"
      >
        <div class="capabilities-card" v-if="selectedType && capabilities">
          <div class="capabilities-header">
            <div class="capabilities-title">炉型能力配置</div>
            <div class="capabilities-subtitle">{{ getSelectedTypeName() }}</div>
          </div>
          
          <div class="capabilities-content">
            <!-- 功能支持区域 -->
            <el-row :gutter="20" v-if="hasDeviceFeatures">
              <el-col :span="12" v-if="hasField('hasRearCirculationFan')">
                <div class="capability-item">
                  <span class="capability-label">后区循环风机:</span>
                  <span class="capability-value" :class="{'supported': capabilities.hasRearCirculationFan, 'unsupported': !capabilities.hasRearCirculationFan}">
                    {{ capabilities.hasRearCirculationFan ? '支持' : '不支持' }}
                  </span>
                </div>
              </el-col>
              <el-col :span="12" v-if="hasField('hasVacuumFan')">
                <div class="capability-item">
                  <span class="capability-label">负压风机:</span>
                  <span class="capability-value" :class="{'supported': capabilities.hasVacuumFan, 'unsupported': !capabilities.hasVacuumFan}">
                    {{ capabilities.hasVacuumFan ? '支持' : '不支持' }}
                  </span>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" v-if="hasDeviceFeatures">
              <el-col :span="12" v-if="hasField('hasPurgeValve')">
                <div class="capability-item">
                  <span class="capability-label">吹洗阀:</span>
                  <span class="capability-value" :class="{'supported': capabilities.hasPurgeValve, 'unsupported': !capabilities.hasPurgeValve}">
                    {{ capabilities.hasPurgeValve ? '支持' : '不支持' }}
                  </span>
                </div>
              </el-col>
              <el-col :span="12" v-if="hasField('hasCoolingFan')">
                <div class="capability-item">
                  <span class="capability-label">冷却风机:</span>
                  <span class="capability-value" :class="{'supported': capabilities.hasCoolingFan, 'unsupported': !capabilities.hasCoolingFan}">
                    {{ capabilities.hasCoolingFan ? '支持' : '不支持' }}
                  </span>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" v-if="hasDeviceFeatures">
              <el-col :span="12" v-if="hasField('hasPressureControl')">
                <div class="capability-item">
                  <span class="capability-label">压力控制:</span>
                  <span class="capability-value" :class="{'supported': capabilities.hasPressureControl, 'unsupported': !capabilities.hasPressureControl}">
                    {{ capabilities.hasPressureControl ? '支持' : '不支持' }}
                  </span>
                </div>
              </el-col>
              <el-col :span="12" v-if="hasField('hasRearCirculationFan')">
                <div class="capability-item">
                  <span class="capability-label">区域控制:</span>
                  <span class="capability-value">{{ capabilities.hasRearCirculationFan ? '前后双区' : '单区' }}</span>
                </div>
              </el-col>
            </el-row>
            
            <el-divider content-position="center" v-if="hasLimitParams">参数限制</el-divider>
            
            <el-row :gutter="20" v-if="hasLimitParams">
              <el-col :span="12" v-if="hasField('maxSegments')">
                <div class="capability-item">
                  <span class="capability-label">最大工艺段:</span>
                  <span class="capability-value highlight">{{ capabilities.maxSegments }}</span>
                </div>
              </el-col>
              <el-col :span="12" v-if="hasField('maxTemperatureLimit')">
                <div class="capability-item">
                  <span class="capability-label">最高温度:</span>
                  <span class="capability-value highlight">{{ capabilities.maxTemperatureLimit }}°C</span>
                </div>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" v-if="hasLimitParams">
              <el-col :span="12" v-if="hasField('maxHeatingRate')">
                <div class="capability-item">
                  <span class="capability-label">最大升温速率:</span>
                  <span class="capability-value highlight">{{ capabilities.maxHeatingRate }}°C/分钟</span>
                </div>
              </el-col>
              <el-col :span="12" v-if="hasField('supportedAtmosphereTypes')">
                <div class="capability-item">
                  <span class="capability-label">支持气氛:</span>
                  <span class="capability-value">{{ formatAtmosphereTypes(capabilities.supportedAtmosphereTypes) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="capabilities-card empty-card" v-else>
          <div class="no-selection">
            <i class="el-icon-info"></i>
            <p>请先选择炉型以查看能力配置</p>
          </div>
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
  computed: {
    // 判断是否有设备功能特性字段
    hasDeviceFeatures() {
      if (!this.capabilities) return false
      return this.hasField('hasRearCirculationFan') || 
             this.hasField('hasVacuumFan') || 
             this.hasField('hasPurgeValve') || 
             this.hasField('hasCoolingFan') || 
             this.hasField('hasPressureControl')
    },
    // 判断是否有参数限制字段
    hasLimitParams() {
      if (!this.capabilities) return false
      return this.hasField('maxSegments') || 
             this.hasField('maxTemperatureLimit') || 
             this.hasField('maxHeatingRate') || 
             this.hasField('supportedAtmosphereTypes')
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
    // 检查字段是否存在且有值
    hasField(field) {
      return this.capabilities && 
             this.capabilities[field] !== undefined && 
             this.capabilities[field] !== null
    },
    
    // 格式化气氛类型显示
    formatAtmosphereTypes(types) {
      if (!types || !Array.isArray(types) || types.length === 0) {
        return '无数据'
      }
      return types.join(', ')
    },
    
    // 获取选中炉型名称
    getSelectedTypeName() {
      if (!this.selectedType || !this.furnaceTypes || !this.furnaceTypes.length) {
        return '';
      }
      
      const selectedType = this.furnaceTypes.find(type => 
        (type.id === this.selectedType) || (type.furnaceTypeCode === this.selectedType)
      );
      
      return selectedType ? selectedType.furnaceTypeName || selectedType.name : '';
    },
    
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
        
        // 如果已经有选中值，只更新能力配置，不触发change事件
        if (this.selectedType) {
          this.updateCapabilities(this.selectedType)
        }
        // 移除自动选择第一个炉型的逻辑，防止清空其他表单字段
        
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
      // 先更新炉型能力配置
      this.updateCapabilities(value)
      // 再触发input事件通知父组件值变化
      this.$emit('input', value)
      // 最后触发change事件
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
        // 直接使用炉型对象的原始数据，不添加不存在的字段
        this.capabilities = { ...selectedType }
        
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
            // 直接使用炉型对象的原始数据，不添加不存在的字段
            this.capabilities = { ...updatedType }
          } else {
            // 仍然没有找到，设置为null
            this.capabilities = null
          }
          
          // 发送能力配置变更事件
          this.$emit('capabilities-change', this.capabilities)
          console.log('更新后的炉型能力配置:', this.capabilities)
          
          this.loading = false
        }).catch(() => {
          // 发生错误，设置为null
          this.capabilities = null
          
          // 发送能力配置变更事件
          this.$emit('capabilities-change', this.capabilities)
          console.log('获取炉型能力配置失败')
          
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

.capabilities-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &.empty-card {
    background: linear-gradient(120deg, #f5f7fa, #e4e8eb);
    min-height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .capabilities-header {
    background: linear-gradient(120deg, #0099ff, #0066cc);
    color: white;
    padding: 15px 20px;
    
    .capabilities-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .capabilities-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  .capabilities-content {
    padding: 20px;
    background: white;
    
    .capability-item {
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      
      .capability-label {
        color: #606266;
        flex: 0 0 auto;
        margin-right: 10px;
        min-width: 100px;
        max-width: 100px;
      }
      
      .capability-value {
        font-weight: 600;
        flex: 1;
        text-align: right;
        word-break: break-all;
        min-width: 100px;
        padding-left: 5px;
        
        &.supported {
          color: #67c23a;
        }
        
        &.unsupported {
          color: #909399;
        }
        
        &.highlight {
          color: #409eff;
          font-size: 16px;
        }
      }
    }
  }
  
  .no-selection {
    text-align: center;
    color: #909399;
    padding: 30px 0;
    
    i {
      font-size: 32px;
      margin-bottom: 10px;
      opacity: 0.5;
    }
    
    p {
      margin: 5px 0 0;
      font-size: 14px;
    }
  }
}

.el-divider {
  margin: 15px 0;
}
</style>

<style lang="scss">
.furnace-capabilities-popover {
  padding: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
  
  .el-popover__title {
    margin: 0;
    padding: 0;
  }
}
</style> 