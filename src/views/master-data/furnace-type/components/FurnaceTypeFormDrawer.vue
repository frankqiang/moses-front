/**
 * 炉型表单抽屉组件
 * 功能描述：提供炉型新增、编辑和查看功能的表单，使用抽屉方式展示
 * 创建日期：2024-11-16
 * 重构日期：2024-12-19 - 使用BaseDrawer和EnhancedForm组件重构
 */
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="getDrawerTitle()"
    width="1700px"
    :wrapper-closable="false"
    :show-footer="true"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 抽屉内容 -->
    <div class="furnace-type-form-container">
      <!-- 表单区域 -->
              <enhanced-form
          ref="enhancedForm"
          :data="formData"
          :mode="innerType"
          :rules="formRules"
          label-width="110px"
          :loading="loading"
          :validate-before-submit="true"
          :show-footer="false"
          @submit="handleFormSubmit"
          @validate="handleCustomValidate"
          @validate-error="handleValidateError"
          @reset="handleFormReset"
        >
        <!-- 表单内容 -->
        <template v-slot="{ form, mode }">
          <!-- 一、基本信息 -->
          <div class="form-section">
            <div class="section-title">一、基本信息</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="炉型代码" prop="furnaceTypeCode">
                  <el-input
                    v-model="form.furnaceTypeCode"
                    placeholder="请输入炉型代码"
                    maxlength="30"
                    show-word-limit
                    :disabled="mode === 'view'"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="炉型名称" prop="furnaceTypeName">
                  <el-input
                    v-model="form.furnaceTypeName"
                    placeholder="请输入炉型名称"
                    maxlength="50"
                    show-word-limit
                    :disabled="mode === 'view'"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="状态" prop="status">
                  <el-radio-group v-model="form.status" :disabled="mode === 'view'">
                    <el-radio label="enabled">启用</el-radio>
                    <el-radio label="disabled">禁用</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="描述" prop="description">
                  <el-input
                    type="textarea"
                    v-model="form.description"
                    placeholder="请输入炉型描述"
                    :rows="3"
                    maxlength="200"
                    show-word-limit
                    :disabled="mode === 'view'"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 二、能力参数配置 -->
          <div class="form-section">
            <div class="section-title">二、能力参数配置</div>
            
            <!-- 设备功能开关 -->
            <div class="capability-group">
              <el-row :gutter="20">
                <el-col :span="5">
                  <el-form-item label="后区循环风机">
                    <el-switch
                      v-model="form.hasRearCirculationFan"
                      active-text="支持"
                      inactive-text="不支持"
                      :disabled="mode === 'view'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="负压风机">
                    <el-switch
                      v-model="form.hasVacuumFan"
                      active-text="支持"
                      inactive-text="不支持"
                      :disabled="mode === 'view'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="吹洗阀">
                    <el-switch
                      v-model="form.hasPurgeValve"
                      active-text="支持"
                      inactive-text="不支持"
                      :disabled="mode === 'view'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item label="冷却风机">
                    <el-switch
                      v-model="form.hasCoolingFan"
                      active-text="支持"
                      inactive-text="不支持"
                      :disabled="mode === 'view'"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item label="压力控制">
                    <el-switch
                      v-model="form.hasPressureControl"
                      active-text="支持"
                      inactive-text="不支持"
                      :disabled="mode === 'view'"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            
            </div>

            <!-- 参数限制 -->
            <div class="capability-group">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-form-item label="最大工艺段数" prop="maxSegments">
                    <el-input-number
                      v-model="form.maxSegments"
                      :min="1"
                      :max="30"
                      :disabled="mode === 'view'"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="温度上限(°C)" prop="maxTemperatureLimit">
                    <el-input-number
                      v-model="form.maxTemperatureLimit"
                      :min="100"
                      :max="2000"
                      :disabled="mode === 'view'"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="支持的气氛类型">
                    <el-select
                      v-model="form.supportedAtmosphereTypes"
                      multiple
                      placeholder="请选择气氛类型"
                      :disabled="mode === 'view'"
                      style="width: 100%"
                    >
                      <el-option label="纯氮气" value="纯氮气" />
                      <el-option label="氢氮混合气" value="氢氮混合气" />
                      <el-option label="真空" value="真空" />
                      <el-option label="氦气" value="氦气" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 三、关联信息（仅编辑和查看时显示） -->
          <div v-if="shouldShowRelatedData" class="form-section">
            <div class="section-title">三、关联信息</div>
            <div class="related-section">
              <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
                <!-- 关联设备标签页 -->
                <el-tab-pane 
                  :label="`关联设备列表 (${relatedEquipment.length})`" 
                  name="equipment"
                >
                  <div class="tab-content">
                    <!-- 设备表格 -->
                    <base-table
                      v-loading="relatedItemsLoading"
                      :data="filteredEquipment"
                      :columns="equipmentColumns"
                      :show-pagination="false"
                      stripe
                      border
                      height="400"
                      empty-text="暂无关联设备"
                      style="width: 100%"
                      fit
                    />
                  </div>
                </el-tab-pane>
                
                <!-- 关联工艺模板标签页 -->
                <el-tab-pane 
                  :label="`关联工艺模板列表 (${relatedTemplates.length})`" 
                  name="templates"
                >
                  <div class="tab-content">
                    <!-- 模板表格 -->
                    <base-table
                      v-loading="relatedItemsLoading"
                      :data="filteredTemplates"
                      :columns="templateColumns"
                      :show-pagination="false"
                      stripe
                      border
                      height="400"
                      empty-text="暂无关联工艺模板"
                      style="width: 100%"
                      fit
                    />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </template>

      </enhanced-form>
    </div>

    <!-- 抽屉底部按钮 -->
    <template #footer>
      <el-button @click="handleCancel">{{ innerType === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="innerType === 'create'" type="primary" @click="handleSubmitAndContinue" :loading="loading">保存并继续</el-button>
      <el-button v-if="innerType !== 'view'" type="primary" @click="handleSubmit" :loading="loading">{{ innerType === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import BaseTable from '@/components/BaseTable'
import { getRelatedEquipment, getRelatedTemplates } from '@/api/master-data/furnace-type'
import relatedDataTableMixin from '../mixins/relatedDataTableMixin'

export default {
  name: 'FurnaceTypeFormDrawer',
  components: {
    BaseDrawer,
    EnhancedForm,
    BaseTable
  },
  mixins: [relatedDataTableMixin],
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
    // 炉型数据（编辑和查看时使用）
    furnaceTypeData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 抽屉可见性
      drawerVisible: false,
      // 内部操作类型
      innerType: this.type,
      // 表单数据
      formData: this.initFormData(),
      // 加载状态
      loading: false,
      // 关联项加载状态
      relatedItemsLoading: false,
      // 关联设备数据
      relatedEquipment: [],
      // 关联工艺模板数据
      relatedTemplates: [],
      // 当前激活的标签页
      activeTab: 'equipment'
    }
  },
  computed: {
    // 表单验证规则
    formRules() {
      return {
        furnaceTypeCode: [
          { required: true, message: '请输入炉型代码', trigger: 'blur' },
          { max: 30, message: '长度不能超过30个字符', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9-_]+$/, message: '只能包含字母、数字、中划线和下划线', trigger: 'blur' }
        ],
        furnaceTypeName: [
          { required: true, message: '请输入炉型名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        maxSegments: [
          { required: true, message: '请输入最大工艺段数', trigger: 'blur' },
          { type: 'number', min: 1, max: 30, message: '最大工艺段数必须在1到30之间', trigger: 'blur' }
        ],
        maxTemperatureLimit: [
          { required: true, message: '请输入温度上限', trigger: 'blur' },
          { type: 'number', min: 100, max: 2000, message: '温度上限必须在100到2000°C之间', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
        ]
      }
    },

    // 是否显示关联数据
    shouldShowRelatedData() {
      return (this.innerType === 'update' || this.innerType === 'view') && 
             this.formData.furnaceTypeCode
    }
  },
  watch: {
    visible(val) {
      this.drawerVisible = val
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    },
    type(val) {
      this.innerType = val
    },
    
    // 监听表单数据变化
    'formData.furnaceTypeCode': {
      handler(val) {
        if (val && this.shouldShowRelatedData) {
          this.loadRelatedData(val)
        }
      },
      immediate: true
    }
  },
  methods: {
    // 初始化表单数据
    initFormData() {
      return {
        id: '',
        furnaceTypeCode: '',
        furnaceTypeName: '',
        status: 'enabled',
        description: '',
        maxSegments: 10,
        hasRearCirculationFan: false,
        hasVacuumFan: false,
        hasPurgeValve: false,
        hasCoolingFan: false,
        supportedAtmosphereTypes: [],
        maxTemperatureLimit: 1000,
        hasPressureControl: false
      }
    },

    // 获取抽屉标题
    getDrawerTitle() {
      if (this.innerType === 'create') {
        return '新增炉型'
      } else if (this.innerType === 'update') {
        return `编辑炉型: ${this.formData.furnaceTypeCode || ''}`
      } else {
        return `查看炉型: ${this.formData.furnaceTypeCode || ''}`
      }
    },

    // 加载关联数据
    loadRelatedData(id) {
      this.relatedItemsLoading = true
      
      // 如果表单中已经有关联数据，直接使用
      if (this.formData.relatedEquipment && this.formData.relatedTemplates) {
        this.relatedEquipment = this.formData.relatedEquipment || []
        this.relatedTemplates = this.formData.relatedTemplates || []
        this.relatedItemsLoading = false
        return
      }
      
      // 否则通过API获取
      Promise.all([
        getRelatedEquipment(id).catch(() => ({ data: [] })),
        getRelatedTemplates(id).catch(() => ({ data: [] }))
      ]).then(([equipmentResponse, templatesResponse]) => {
        this.relatedEquipment = equipmentResponse.data || []
        this.relatedTemplates = templatesResponse.data || []
      }).catch(() => {
        this.$message.error('获取关联数据失败')
      }).finally(() => {
        this.relatedItemsLoading = false
      })
    },

    // 处理抽屉打开
    handleDrawerOpen() {
      // 抽屉打开时的逻辑
    },

    // 处理抽屉关闭
    handleDrawerClose() {
      this.handleCancel()
    },

    // 处理表单提交
    handleFormSubmit(formData, continueEdit) {
      console.log('表单提交:', formData, continueEdit)
      
      // 处理表单数据，转换为API需要的格式
      const submitData = {
        ...formData
      }
      
      // 炉型代码字段统一使用furnaceTypeCode
      if (!submitData.furnaceTypeCode) {
        this.$message.error('炉型代码不能为空')
        return
      }
      
      // 触发提交事件，传递 continueEdit 标志
      this.$emit('submit', submitData, continueEdit)
    },

    // 提交成功后的处理（由父组件调用）
    handleSubmitSuccess(continueEdit = false) {
      if (!continueEdit) {
        // 不是继续编辑，关闭抽屉
        this.handleCancel()
      } else {
        // 继续编辑，重置表单为初始状态
        this.formData = this.initFormData()
        this.$message.success('保存成功，可以继续添加')
      }
    },

    // 直接提交
    handleSubmit() {
      if (this.$refs.enhancedForm) {
        // 获取表单数据
        const formData = this.$refs.enhancedForm.getFormData()
        
        // 手动验证
        this.$refs.enhancedForm.validate((valid) => {
          if (valid) {
            this.handleFormSubmit(formData, false)
          }
        })
      }
    },

    // 保存并继续
    handleSubmitAndContinue() {
      if (this.$refs.enhancedForm) {
        // 获取表单数据
        const formData = this.$refs.enhancedForm.getFormData()
        
        // 手动验证
        this.$refs.enhancedForm.validate((valid) => {
          if (valid) {
            this.handleFormSubmit(formData, true)
          }
        })
      }
    },

    // 自定义验证
    handleCustomValidate(formData, callback) {
      // 这里可以添加自定义验证逻辑
      callback(true)
    },

    // 验证失败处理
    handleValidateError() {
      this.$message.warning('表单填写有误，请检查')
    },

    // 表单重置
    handleFormReset(formData) {
      this.formData = this.initFormData()
      console.log('表单已重置:', formData)
    },

    // 取消/关闭
    handleCancel() {
      this.$emit('close')
      this.$emit('update:visible', false)
      
      // 重置表单数据
      this.formData = this.initFormData()
      
      // 重置关联数据状态
      this.resetRelatedDataState()
    },

    // 打开抽屉表单
    open(type = 'create', data = null) {
      this.innerType = type
      
      // 重置表单数据
      this.formData = this.initFormData()
      
      // 设置数据（用于编辑和查看）
      if (data && (type === 'update' || type === 'view')) {
        this.formData = {
          id: data.id,
          furnaceTypeCode: data.furnaceTypeCode,
          furnaceTypeName: data.furnaceTypeName,
          status: data.status,
          description: data.description,
          maxSegments: data.maxSegments,
          hasRearCirculationFan: data.hasRearCirculationFan,
          hasVacuumFan: data.hasVacuumFan,
          hasPurgeValve: data.hasPurgeValve,
          hasCoolingFan: data.hasCoolingFan,
          supportedAtmosphereTypes: data.supportedAtmosphereTypes || [],
          maxTemperatureLimit: data.maxTemperatureLimit,
          hasPressureControl: data.hasPressureControl,
          // 传递关联数据
          relatedEquipment: data.relatedEquipment || [],
          relatedTemplates: data.relatedTemplates || []
        }
        
        // 编辑或查看模式下加载关联数据
        if ((type === 'update' || type === 'view') && data.furnaceTypeCode) {
          this.loadRelatedData(data.furnaceTypeCode)
        }
      }
      
      // 重置关联数据状态
      this.resetRelatedDataState()
      
      // 打开抽屉
      this.drawerVisible = true
    },

    // 重置表单
    resetForm() {
      this.formData = this.initFormData()
      
      // 清除表单验证
      if (this.$refs.enhancedForm) {
        this.$refs.enhancedForm.clearValidate()
      }
      
      // 重置关联数据状态
      this.resetRelatedDataState()
    },

    // 处理标签页点击
    handleTabClick(tab) {
      this.activeTab = tab.name
    }
  }
}
</script>

<style lang="scss" scoped>
.furnace-type-form-container {
  height: 100%;
  overflow-y: auto;
  padding: 0 20px;
}

// 表单分段样式
.form-section {
  margin-bottom: 32px;
  
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 4px solid #409EFF;
    color: #303133;
  }
}

// 能力配置组样式
.capability-group {
  margin-bottom: 20px;
  
  .group-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #606266;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    border-left: 3px solid #409EFF;
  }
  
  .el-form-item {
    margin-bottom: 16px;
    
    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #606266;
    }
    
    :deep(.el-switch) {
      margin-left: 10px;
    }
  }
}

// 关联数据区域样式
.related-section {
  margin-top: 20px;
  
  .el-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
      
      .el-tabs__nav {
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        
        .el-tabs__item {
          border: none;
          padding: 12px 20px;
          font-weight: 500;
          color: #606266;
          transition: all 0.3s ease;
          
          &.is-active {
            background: #409EFF;
            color: white;
            
            &::before {
              display: none;
            }
          }
          
          &:hover:not(.is-active) {
            background: #f5f7fa;
            color: #409EFF;
          }
        }
      }
    }
    
    :deep(.el-tabs__content) {
      padding: 0;
    }
  }
  
  .tab-content {
    // 表格内容区域样式
  }
}

// 底部按钮样式
.form-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e6e6e6;
  text-align: right;
  
  .el-button {
    margin-left: 12px;
  }
}

// BaseTable 自定义样式
:deep(.base-table-container) {
  .el-table {
    .el-table__header th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 600;
    }
    
    .el-table__row {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

// 表格内容为空时的样式
:deep(.el-table__empty-block) {
  padding: 40px 0;
  
  .el-table__empty-text {
    color: #909399;
    font-size: 14px;
  }
}

// 表格自定义样式
:deep(.el-table) {
  .el-table__body-wrapper {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style> 