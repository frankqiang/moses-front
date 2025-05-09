/**
 * 设备表单抽屉组件
 * 功能描述：提供设备新增、编辑和查看功能的表单，使用抽屉方式展示
 * 创建日期：2023-11-05
 */
<template>
  <el-drawer
    :title="getDrawerTitle()"
    :visible.sync="drawerVisible"
    :size="'550px'"
    :direction="'rtl'"
    :before-close="handleClose"
    custom-class="equipment-form-drawer"
    :wrapperClosable="false"
  >
    <div class="drawer-content" ref="drawerContent">
      <el-form 
        ref="equipmentForm"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="small"
        :disabled="type === 'view'"
      >
        <!-- 一、基础信息 -->
        <div class="form-section">
          <h3 class="section-title">一、基础信息</h3>
          
          <el-form-item label="设备ID" prop="equipmentId">
            <el-input 
              v-model="form.equipmentId" 
              placeholder="输入或系统自动生成" 
              :disabled="type === 'update'"
            />
          </el-form-item>
          
          <el-form-item label="设备名称" prop="name">
            <el-input 
              v-model="form.name" 
              placeholder="请输入设备名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="设备型号" prop="model">
            <el-input 
              v-model="form.model" 
              placeholder="请输入设备型号"
              maxlength="30"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="安装日期" prop="installDate">
            <el-date-picker
              v-model="form.installDate"
              type="date"
              placeholder="选择安装日期"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="设备状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
        
        <!-- 二、特定设备类型参数 -->
        <div class="form-section">
          <h3 class="section-title">二、{{ getTypeSpecificTitle() }}</h3>
          
          <!-- 退火炉参数 -->
          <template v-if="equipmentType === 'FURNACE'">
            <el-form-item label="规格(容量)" prop="capacity">
              <el-input-number 
                v-model="form.capacity"
                :min="0"
                :step="5"
                :precision="0"
                style="width: 100%"
              />
              <span class="unit-label">T</span>
            </el-form-item>
            
            <el-form-item label="最大温度" prop="maxTemperature">
              <el-input-number 
                v-model="form.maxTemperature"
                :min="0"
                :max="2000"
                :step="50"
                :precision="0"
                style="width: 100%"
              />
              <span class="unit-label">°C</span>
            </el-form-item>
            
            <el-form-item label="额定功率" prop="ratedPower">
              <el-input-number 
                v-model="form.ratedPower"
                :min="0"
                :step="10"
                :precision="0"
                style="width: 100%"
              />
              <span class="unit-label">kW</span>
            </el-form-item>
            
            <el-form-item label="PLC通讯地址" prop="plcAddress">
              <el-input 
                v-model="form.plcAddress" 
                placeholder="例如：192.168.1.10:502"
              />
              <div class="form-tip">请确保格式正确，如：opc.tcp://address:port/server</div>
            </el-form-item>
            
            <el-form-item label="维护周期" prop="maintenanceCycle">
              <el-input-number 
                v-model="form.maintenanceCycle"
                :min="1"
                :step="30"
                :precision="0"
                style="width: 100%"
              />
              <span class="unit-label">天</span>
            </el-form-item>
          </template>
          
          <!-- 行车参数 -->
          <template v-else-if="equipmentType === 'CRANE'">
            <el-form-item label="额定起重量" prop="liftCapacity">
              <el-input-number 
                v-model="form.liftCapacity"
                :min="0"
                :step="1"
                :precision="1"
                style="width: 100%"
              />
              <span class="unit-label">T</span>
            </el-form-item>
            
            <el-form-item label="运行速度" prop="movingSpeed">
              <el-input 
                v-model="form.movingSpeed" 
                placeholder="例如：主0-20 / 副0-60"
              />
              <span class="unit-label">m/min</span>
            </el-form-item>
            
            <el-form-item label="服务范围" prop="serviceArea">
              <el-select
                v-model="form.serviceAreas"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入服务范围"
                style="width: 100%"
              >
                <el-option 
                  v-for="item in serviceAreaOptions" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="控制系统接口" prop="controlInterface">
              <el-input 
                v-model="form.controlInterface" 
                placeholder="例如：TCP:192.168.1.20:10001"
              />
              <div class="form-tip">请注明协议及地址端口</div>
            </el-form-item>
          </template>
          
          <!-- 自动料车参数 -->
          <template v-else-if="equipmentType === 'AUTO_CART'">
            <el-form-item label="载重能力" prop="loadCapacity">
              <el-input-number 
                v-model="form.loadCapacity"
                :min="0"
                :step="1"
                :precision="1"
                style="width: 100%"
              />
              <span class="unit-label">T</span>
            </el-form-item>
            
            <el-form-item label="移动速度" prop="movingSpeed">
              <el-input-number 
                v-model="form.movingSpeed"
                :min="0"
                :step="5"
                :precision="1"
                style="width: 100%"
              />
              <span class="unit-label">m/min</span>
            </el-form-item>
            
            <el-form-item label="导航方式" prop="navigationMode">
              <el-select 
                v-model="form.navigationMode"
                placeholder="请选择导航方式"
                style="width: 100%"
              >
                <el-option label="激光导航" value="LASER" />
                <el-option label="磁导航" value="MAGNETIC" />
                <el-option label="视觉导航" value="VISION" />
                <el-option label="惯性导航" value="INERTIAL" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="充电类型" prop="chargingType">
              <el-select 
                v-model="form.chargingType"
                placeholder="请选择充电类型"
                style="width: 100%"
              >
                <el-option label="自动充电" value="AUTO" />
                <el-option label="手动充电" value="MANUAL" />
                <el-option label="电池更换" value="BATTERY_SWAP" />
              </el-select>
            </el-form-item>
          </template>
          
          <!-- 备料台参数 -->
          <template v-else-if="equipmentType === 'STAGING_TABLE'">
            <el-form-item label="承载能力" prop="bearingCapacity">
              <el-input-number 
                v-model="form.bearingCapacity"
                :min="0"
                :step="1"
                :precision="1"
                style="width: 100%"
              />
              <span class="unit-label">T</span>
            </el-form-item>
            
            <el-form-item label="台面尺寸" prop="dimensions">
              <el-input 
                v-model="form.dimensions" 
                placeholder="例如：3.5×2.0×0.8"
              />
              <span class="unit-label">m</span>
            </el-form-item>
            
            <el-form-item label="台面材质" prop="surfaceMaterial">
              <el-select 
                v-model="form.surfaceMaterial"
                placeholder="请选择台面材质"
                style="width: 100%"
              >
                <el-option label="碳钢" value="CARBON_STEEL" />
                <el-option label="不锈钢" value="STAINLESS_STEEL" />
                <el-option label="合金钢" value="ALLOY_STEEL" />
                <el-option label="其他" value="OTHER" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="功能类型" prop="functionType">
              <el-select 
                v-model="form.functionType"
                placeholder="请选择功能类型"
                style="width: 100%"
              >
                <el-option label="固定式" value="FIXED" />
                <el-option label="可移动式" value="MOVABLE" />
                <el-option label="可调高度" value="ADJUSTABLE_HEIGHT" />
                <el-option label="多功能" value="MULTI_FUNCTION" />
              </el-select>
            </el-form-item>
          </template>
        </div>
        
        <!-- 三、其他信息 -->
        <div class="form-section">
          <h3 class="section-title">三、其他信息</h3>
          
          <el-form-item label="供应商" prop="supplier">
            <el-input 
              v-model="form.supplier" 
              placeholder="请输入供应商名称"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="备注" prop="remarks">
            <el-input 
              v-model="form.remarks" 
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
    
    <div class="drawer-footer">
      <el-button @click="handleClose">{{ type === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="type === 'create'" type="primary" @click="handleSubmitAndContinue">保存并继续</el-button>
      <el-button v-if="type !== 'view'" type="primary" @click="handleSubmit">{{ type === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'EquipmentFormDrawer',
  props: {
    // 抽屉可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 操作类型：create-新增, update-编辑, view-查看
    type: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view'].includes(value)
    },
    // 设备类型
    equipmentType: {
      type: String,
      required: true
    },
    // 设备数据（编辑和查看时使用）
    equipmentData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 抽屉可见性
      drawerVisible: false,
      // 表单数据
      form: this.initFormData(),
      // 表单验证规则
      rules: {
        equipmentId: [
          { required: false, message: '请输入设备ID', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入设备名称', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择设备状态', trigger: 'change' }
        ],
        // 退火炉特有字段验证
        capacity: [
          { required: this.equipmentType === 'FURNACE', message: '请输入规格容量', trigger: 'blur' }
        ],
        plcAddress: [
          { required: this.equipmentType === 'FURNACE', message: '请输入PLC通讯地址', trigger: 'blur' }
        ],
        // 行车特有字段验证
        liftCapacity: [
          { required: this.equipmentType === 'CRANE', message: '请输入额定起重量', trigger: 'blur' }
        ],
        controlInterface: [
          { required: this.equipmentType === 'CRANE', message: '请输入控制系统接口', trigger: 'blur' }
        ]
      },
      // 服务区域选项（行车）
      serviceAreaOptions: [
        { label: 'A区1-5炉', value: 'A区1-5炉' },
        { label: 'B区缓存位', value: 'B区缓存位' },
        { label: 'C区装车位', value: 'C区装车位' },
        { label: 'D区检查台', value: 'D区检查台' }
      ]
    }
  },
  watch: {
    // 监听visible变化
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val && this.type !== 'create') {
          this.setFormData()
        } else if (val && this.type === 'create') {
          this.form = this.initFormData()
        }
      },
      immediate: true
    },
    // 监听drawerVisible变化，同步到父组件
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    // 监听设备类型变化，重置表单
    equipmentType() {
      if (this.type === 'create') {
        this.form = this.initFormData()
      }
    }
  },
  methods: {
    // 获取抽屉标题
    getDrawerTitle() {
      const typeMap = {
        'FURNACE': '退火炉',
        'CRANE': '行车',
        'AUTO_CART': '自动料车',
        'STAGING_TABLE': '备料台'
      }
      const equipmentTypeText = typeMap[this.equipmentType] || '设备'
      
      if (this.type === 'create') {
        return `新增${equipmentTypeText}`
      } else if (this.type === 'update') {
        return `编辑: ${this.form.equipmentId || ''}`
      } else {
        return `查看: ${this.form.equipmentId || ''}`
      }
    },
    
    // 获取特定设备类型的标题
    getTypeSpecificTitle() {
      const typeMap = {
        'FURNACE': '退火炉特性参数',
        'CRANE': '行车特性参数',
        'AUTO_CART': '自动料车特性参数',
        'STAGING_TABLE': '备料台特性参数'
      }
      return typeMap[this.equipmentType] || '设备特性参数'
    },
    
    // 初始化表单数据
    initFormData() {
      // 通用字段
      const commonFields = {
        id: undefined,
        equipmentId: '',
        name: '',
        model: '',
        installDate: '',
        status: 1,
        supplier: '',
        remarks: ''
      }
      
      // 根据设备类型添加特定字段
      let specificFields = {}
      
      if (this.equipmentType === 'FURNACE') {
        specificFields = {
          capacity: 40,
          maxTemperature: 1150,
          ratedPower: 350,
          plcAddress: '',
          maintenanceCycle: 90
        }
      } else if (this.equipmentType === 'CRANE') {
        specificFields = {
          liftCapacity: 10,
          movingSpeed: '',
          serviceAreas: [],
          controlInterface: ''
        }
      } else if (this.equipmentType === 'AUTO_CART') {
        specificFields = {
          loadCapacity: 5,
          movingSpeed: 20,
          navigationMode: 'LASER',
          chargingType: 'AUTO'
        }
      } else if (this.equipmentType === 'STAGING_TABLE') {
        specificFields = {
          bearingCapacity: 10,
          dimensions: '',
          surfaceMaterial: 'CARBON_STEEL',
          functionType: 'FIXED'
        }
      }
      
      return { ...commonFields, ...specificFields }
    },
    
    // 设置表单数据（编辑和查看时）
    setFormData() {
      if (!this.equipmentData) return
      
      // 浅拷贝设备数据
      Object.assign(this.form, this.equipmentData)
      
      // 特殊处理字段
      if (this.equipmentType === 'CRANE' && this.equipmentData.serviceArea) {
        // 如果serviceArea是字符串，转换为数组
        this.form.serviceAreas = typeof this.equipmentData.serviceArea === 'string' 
          ? this.equipmentData.serviceArea.split(',') 
          : this.equipmentData.serviceArea
      }
    },
    
    // 表单重置
    resetForm() {
      this.$refs.equipmentForm && this.$refs.equipmentForm.resetFields()
      this.form = this.initFormData()
    },
    
    // 关闭抽屉
    handleClose() {
      this.drawerVisible = false
      this.$emit('close')
      setTimeout(() => {
        this.resetForm()
      }, 300)
    },
    
    // 处理提交
    handleSubmit() {
      this.$refs.equipmentForm.validate(valid => {
        if (valid) {
          // 特殊处理字段
          const formData = { ...this.form }
          
          if (this.equipmentType === 'CRANE' && Array.isArray(formData.serviceAreas)) {
            formData.serviceArea = formData.serviceAreas.join(',')
            delete formData.serviceAreas
          }
          
          this.$emit('submit', formData, false)
        } else {
          return false
        }
      })
    },
    
    // 保存并继续
    handleSubmitAndContinue() {
      this.$refs.equipmentForm.validate(valid => {
        if (valid) {
          // 特殊处理字段
          const formData = { ...this.form }
          
          if (this.equipmentType === 'CRANE' && Array.isArray(formData.serviceAreas)) {
            formData.serviceArea = formData.serviceAreas.join(',')
            delete formData.serviceAreas
          }
          
          this.$emit('submit', formData, true)
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-form-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #e6e6e6;
  }
  
  :deep(.el-drawer__body) {
    height: calc(100% - 140px);
    overflow: hidden;
    padding: 0;
  }
}

.drawer-content {
  padding: 20px;
  height: calc(100% - 80px); /* 减去footer高度 */
  overflow-y: auto;
  position: relative;
}

.form-section {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
  }
}

.unit-label {
  margin-left: 8px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e6e6e6;
  text-align: right;
  z-index: 1;
  
  .el-button {
    margin-left: 10px;
  }
}
</style> 