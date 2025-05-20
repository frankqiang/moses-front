/**
 * 炉型表单抽屉组件
 * 功能描述：提供炉型新增、编辑和查看功能的表单，使用抽屉方式展示
 * 创建日期：2024-11-16
 */
<template>
  <drawer-form
    ref="drawerForm"
    :visible.sync="drawerVisible"
    :title="getDrawerTitle()"
    :mode="innerType"
    :data="form"
    :rules="rules"
    :form-sections="formSections"
    :loading="loading"
    width="700px"
    direction="rtl"
    label-width="140px"
    :wrapper-closable="false"
    @submit="handleFormSubmit"
    @close="handleClose"
  >
    <template #footer>
      <el-button @click="handleClose">{{ innerType === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="innerType === 'create'" type="primary" @click="handleSubmitAndContinue" :loading="loading">保存并继续</el-button>
      <el-button v-if="innerType !== 'view'" type="primary" @click="handleSubmit" :loading="loading">{{ innerType === 'create' ? '确认保存' : '保存修改' }}</el-button>
    </template>
    
    <!-- 关联设备列表 -->
    <template #relatedEquipment>
      <div class="related-list" v-loading="relatedItemsLoading">
        <div class="related-list-header">关联设备列表</div>
        <el-table
          v-if="form.furnace_type_code && relatedEquipment.length > 0"
          :data="relatedEquipment"
          border
          style="width: 100%"
          max-height="300"
        >
          <el-table-column prop="equipmentId" label="设备编号" width="120" />
          <el-table-column prop="name" label="设备名称" />
          <el-table-column prop="model" label="型号" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <StatusTag
                :status="scope.row.status"
                :text-map="equipmentStatusTextMap"
                :type-map="equipmentStatusTypeMap"
              />
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-content">
          <i class="el-icon-document"></i>
          <p>暂无关联设备</p>
        </div>
      </div>
    </template>
    
    <!-- 关联工艺模板列表 -->
    <template #relatedTemplates>
      <div class="related-list" v-loading="relatedItemsLoading">
        <div class="related-list-header">关联工艺模板列表</div>
        <el-table
          v-if="form.furnace_type_code && relatedTemplates.length > 0"
          :data="relatedTemplates"
          border
          style="width: 100%"
          max-height="300"
        >
          <el-table-column prop="templateId" label="模板ID" width="120" />
          <el-table-column prop="templateName" label="模板名称" />
          <el-table-column prop="version" label="版本" width="80" />
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <StatusTag
                :status="scope.row.status"
                :text-map="templateStatusTextMap"
                :type-map="templateStatusTypeMap"
              />
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-content">
          <i class="el-icon-tickets"></i>
          <p>暂无关联工艺模板</p>
        </div>
      </div>
    </template>
  </drawer-form>
</template>

<script>
import DrawerForm from '@/components/DrawerForm'
import { getRelatedEquipment, getRelatedTemplates } from '@/api/master-data/furnace-type'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'FurnaceTypeFormDrawer',
  components: {
    DrawerForm,
    StatusTag
  },
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
      form: this.initFormData(),
      // 加载状态
      loading: false,
      // 关联项加载状态
      relatedItemsLoading: false,
      // 关联设备数据
      relatedEquipment: [],
      // 关联工艺模板数据
      relatedTemplates: [],
      // 设备状态文本映射
      equipmentStatusTextMap: {
        'enabled': '启用',
        'disabled': '禁用',
        'maintenance': '维修中'
      },
      // 设备状态类型映射
      equipmentStatusTypeMap: {
        'enabled': 'success',
        'disabled': 'info',
        'maintenance': 'warning'
      },
      // 工艺模板状态文本映射
      templateStatusTextMap: {
        'draft': '草稿',
        'pending': '待审批',
        'effective': '生效',
        'history': '历史'
      },
      // 工艺模板状态类型映射
      templateStatusTypeMap: {
        'draft': 'info',
        'pending': 'warning',
        'effective': 'success',
        'history': 'danger'
      }
    }
  },
  computed: {
    // 动态表单规则
    rules() {
      return {
        furnace_type_code: [
          { required: true, message: '请输入炉型代码', trigger: 'blur' },
          { max: 30, message: '长度不能超过30个字符', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9-_]+$/, message: '只能包含字母、数字、中划线和下划线', trigger: 'blur' }
        ],
        furnace_type_name: [
          { required: true, message: '请输入炉型名称', trigger: 'blur' },
          { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
        ],
        max_segments: [
          { required: true, message: '请输入最大工艺段数', trigger: 'blur' },
          { type: 'number', min: 1, max: 30, message: '最大工艺段数必须在1到30之间', trigger: 'blur' }
        ],
        max_temperature_limit: [
          { required: true, message: '请输入温度上限', trigger: 'blur' },
          { type: 'number', min: 100, max: 2000, message: '温度上限必须在100到2000°C之间', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '长度不能超过200个字符', trigger: 'blur' }
        ]
      }
    },
    
    // 动态表单分段
    formSections() {
      // 1. 基础信息段
      const baseSection = {
        title: '一、基本信息',
        items: [
          {
            prop: 'furnace_type_code',
            label: '炉型代码',
            type: 'input',
            placeholder: '请输入炉型代码',
            maxlength: 30,
            showWordLimit: true,
            rowClass: 'first-row',
            colSpan: 12
          },
          {
            prop: 'furnace_type_name',
            label: '炉型名称',
            type: 'input',
            placeholder: '请输入炉型名称',
            maxlength: 50,
            showWordLimit: true,
            rowClass: 'first-row',
            colSpan: 12
          },
          {
            prop: 'status',
            label: '状态',
            type: 'radio',
            options: [
              { label: '启用', value: 'enabled' },
              { label: '禁用', value: 'disabled' }
            ],
            rowClass: 'second-row',
            colSpan: 12
          },
          {
            prop: 'description',
            label: '描述',
            type: 'textarea',
            placeholder: '请输入炉型描述',
            rows: 3,
            maxlength: 200,
            showWordLimit: true,
            rowClass: 'third-row',
            colSpan: 24
          }
        ]
      }
      
      // 2. 能力参数段
      const capabilitiesSection = {
        title: '二、能力参数配置',
        items: [
          {
            prop: 'has_rear_circulation_fan',
            label: '后区循环风机',
            type: 'switch',
            rowClass: 'capability-row',
            colSpan: 12,
            activeText: '支持',
            inactiveText: '不支持'
          },
          {
            prop: 'has_vacuum_fan',
            label: '负压风机',
            type: 'switch',
            rowClass: 'capability-row',
            colSpan: 12,
            activeText: '支持',
            inactiveText: '不支持'
          },
          {
            prop: 'has_purge_valve',
            label: '吹洗阀',
            type: 'switch',
            rowClass: 'capability-row',
            colSpan: 12,
            activeText: '支持',
            inactiveText: '不支持'
          },
          {
            prop: 'has_cooling_fan',
            label: '冷却风机',
            type: 'switch',
            rowClass: 'capability-row',
            colSpan: 12,
            activeText: '支持',
            inactiveText: '不支持'
          },
          {
            prop: 'has_pressure_control',
            label: '压力控制能力',
            type: 'switch',
            rowClass: 'capability-row',
            colSpan: 12,
            activeText: '支持',
            inactiveText: '不支持'
          },
          {
            prop: 'max_segments',
            label: '最大工艺段数',
            type: 'number',
            min: 1,
            max: 30,
            rowClass: 'capability-row',
            colSpan: 12
          },
          {
            prop: 'max_temperature_limit',
            label: '温度上限(°C)',
            type: 'number',
            min: 100,
            max: 2000,
            rowClass: 'capability-row',
            colSpan: 12
          },
          {
            prop: 'supported_atmosphere_types',
            label: '支持的气氛类型',
            type: 'select',
            multiple: true,
            placeholder: '请选择气氛类型',
            options: [
              { label: '纯氮气', value: '纯氮气' },
              { label: '氢氮混合气', value: '氢氮混合气' },
              { label: '真空', value: '真空' },
              { label: '氦气', value: '氦气' }
            ],
            rowClass: 'capability-row',
            colSpan: 24
          }
        ]
      }
      
      // 3. 关联信息段（仅编辑和查看时显示）
      const sections = [baseSection, capabilitiesSection]
      
      if (this.innerType !== 'create' && this.form.furnace_type_code) {
        const relatedSection = {
          title: '三、关联信息',
          items: [
            {
              prop: 'relatedEquipment',
              label: '',
              type: 'slot',
              slotName: 'relatedEquipment'
            },
            {
              prop: 'relatedTemplates',
              label: '',
              type: 'slot',
              slotName: 'relatedTemplates'
            }
          ]
        }
        sections.push(relatedSection)
      }
      
      return sections
    }
  },
  watch: {
    visible(val) {
      this.drawerVisible = val;
    },
    drawerVisible(val) {
      this.$emit('update:visible', val);
    },
    type(val) {
      this.innerType = val;
    },
    
    // 监听form.id变化，用于加载关联信息
    'form.furnace_type_code': {
      handler(val) {
        if (val && (this.innerType === 'update' || this.innerType === 'view')) {
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
        furnace_type_code: '',
        code: '',
        furnace_type_name: '',
        status: 'enabled',
        description: '',
        max_segments: 10,
        has_rear_circulation_fan: false,
        has_vacuum_fan: false,
        has_purge_valve: false,
        has_cooling_fan: false,
        supported_atmosphere_types: [],
        max_temperature_limit: 1000,
        has_pressure_control: false
      }
    },
    
    // 初始化数据
    initData() {
      // 无论什么情况都先重置表单
      this.form = this.initFormData()
      
      // 如果是编辑或查看模式，复制传入的数据
      if (this.innerType !== 'create' && this.furnaceTypeData) {
        // 直接复制数据，不需要处理capabilities对象
        this.form = JSON.parse(JSON.stringify(this.furnaceTypeData))
      }
      
      // 加载关联数据（如果有ID）
      if (this.form.furnace_type_code && (this.innerType === 'update' || this.innerType === 'view')) {
        this.loadRelatedData(this.form.furnace_type_code)
      }
    },
    
    // 加载关联数据
    loadRelatedData(id) {
      this.relatedItemsLoading = true
      
      // 获取关联设备列表
      getRelatedEquipment(id)
        .then(response => {
          this.relatedEquipment = response.data || []
        })
        .catch(() => {
          this.$message.error('获取关联设备列表失败')
        })
        .finally(() => {
          this.relatedItemsLoading = false
        })
      
      // 获取关联工艺模板列表
      getRelatedTemplates(id)
        .then(response => {
          this.relatedTemplates = response.data || []
        })
        .catch(() => {
          this.$message.error('获取关联工艺模板列表失败')
        })
        .finally(() => {
          this.relatedItemsLoading = false
        })
    },
    
    // 获取抽屉标题
    getDrawerTitle() {
      if (this.innerType === 'create') {
        return '新增炉型'
      } else if (this.innerType === 'update') {
        return `编辑炉型: ${this.form.furnace_type_code || ''}`
      } else {
        return `查看炉型: ${this.form.furnace_type_code || ''}`
      }
    },
    
    // 处理表单提交
    handleSubmit() {
      this.$refs.drawerForm.submitForm()
    },
    
    // 处理保存并继续
    handleSubmitAndContinue() {
      this.$refs.drawerForm.$refs.form.validate((valid) => {
        if (valid) {
          const formData = { ...this.form }
          this.$emit('submit', formData, true) // 传递第二个参数表示保存并继续
        }
      })
    },
    
    // 表单提交处理
    handleFormSubmit(formData) {
      // 处理表单数据，转换为API需要的格式
      const submitData = {
        ...formData
      }
      
      // 炉型代码字段统一使用furnace_type_code
      if (!submitData.furnace_type_code) {
        this.$message.error('炉型代码不能为空')
        return
      }
      
      // 触发提交事件
      this.$emit('submit', submitData)
    },
    
    // 处理关闭
    handleClose() {
      this.$emit('close')
      this.$emit('update:visible', false)
      // 重置表单校验状态和数据
      if (this.$refs.drawerForm) {
        this.$refs.drawerForm.$refs.form && this.$refs.drawerForm.$refs.form.clearValidate()
      }
      // 完全重置表单为初始状态
      this.form = this.initFormData()
    },

    // 打开抽屉表单
    open(type = 'create', data = null) {
      this.innerType = type
      
      // 重置表单数据
      this.form = this.initFormData()
      
      // 设置数据（用于编辑和查看）
      if (data && (type === 'update' || type === 'view')) {
        this.form = {
          id: data.id,
          furnace_type_code: data.furnace_type_code,
          furnace_type_name: data.furnace_type_name,
          status: data.status,
          description: data.description,
          max_segments: data.max_segments,
          has_rear_circulation_fan: data.has_rear_circulation_fan,
          has_vacuum_fan: data.has_vacuum_fan,
          has_purge_valve: data.has_purge_valve,
          has_cooling_fan: data.has_cooling_fan,
          supported_atmosphere_types: data.supported_atmosphere_types || [],
          max_temperature_limit: data.max_temperature_limit,
          has_pressure_control: data.has_pressure_control
        }
        
        // 查看模式下加载关联数据
        if (type === 'view' && data.furnace_type_code) {
          this.loadRelatedData(data.furnace_type_code)
        }
      }
      
      // 打开抽屉
      this.drawerVisible = true
    },
    
    // 重置表单
    resetForm() {
      this.form = this.initFormData()
      
      // 清除表单验证
      if (this.$refs.drawerForm && this.$refs.drawerForm.$refs.form) {
        this.$refs.drawerForm.$refs.form.clearValidate()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.related-list {
  margin-bottom: 20px;
  
  &-header {
    font-weight: bold;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
  }
}

// 添加能力参数配置相关样式
:deep(.capability-row) {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fc;
  border-radius: 4px;
  
  .el-form-item {
    margin-bottom: 0;
    
    .el-form-item__label {
      font-weight: 500;
      color: #606266;
    }
    
    .el-switch {
      margin-left: 15px;
    }
    
    .el-input-number {
      width: 180px;
    }
  }
}

// 为表单分段标题添加样式
:deep(.form-section-title) {
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

// 空内容显示样式
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  color: #909399;
  
  i {
    font-size: 40px;
    margin-bottom: 10px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
}
</style> 