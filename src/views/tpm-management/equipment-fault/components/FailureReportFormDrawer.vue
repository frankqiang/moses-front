/**
 * 故障报告表单抽屉组件
 * 功能描述：提供故障报告新增和编辑功能的表单
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建
 */
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="800px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      size="small"
      :disabled="innerMode === 'view'"
    >
      <!-- 一、基础信息 -->
      <div class="form-section">
        <div class="section-title">一、基础信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="故障编码" prop="failureCode">
              <el-input
                v-model="formData.failureCode"
                placeholder="留空自动生成"
                maxlength="100"
                show-word-limit
                clearable
              />
              <div class="field-hint">不填写则自动生成，格式：EF-设备编码-时间戳</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="故障发生时间" prop="failureTime">
              <el-date-picker
                v-model="formData.failureTime"
                type="datetime"
                placeholder="选择故障发生时间"
                style="width: 100%"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
                :picker-options="datePickerOptions"
              />
              <div class="field-hint">故障实际发生的时间点</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="故障设备" prop="equipmentId">
              <el-select
                v-model="formData.equipmentId"
                placeholder="请选择故障设备"
                style="width: 100%"
                filterable
                remote
                :remote-method="searchEquipments"
                :loading="equipmentLoading"
                @change="handleEquipmentChange"
              >
                <el-option
                  v-for="equipment in equipmentOptions"
                  :key="equipment.id"
                  :label="`${equipment.equipmentCode} - ${equipment.equipmentName}`"
                  :value="equipment.id"
                >
                  <span style="float: left">{{ equipment.equipmentCode }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ equipment.equipmentName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报告人" prop="reporterId">
              <el-select
                v-model="formData.reporterId"
                placeholder="请选择报告人"
                style="width: 100%"
                filterable
                remote
                :remote-method="searchUsers"
                :loading="userLoading"
              >
                <el-option
                  v-for="user in userOptions"
                  :key="user.id"
                  :label="user.username"
                  :value="user.id"
                >
                  <span style="float: left">{{ user.username }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ user.email }}</span>
                </el-option>
              </el-select>
              <div class="field-hint">默认为当前登录用户</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 二、故障分类 -->
      <div class="form-section">
        <div class="section-title">二、故障分类</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="故障等级" prop="failureLevel">
              <el-select
                v-model="formData.failureLevel"
                placeholder="请选择故障等级"
                style="width: 100%"
              >
                <el-option
                  v-for="option in failureLevelOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                >
                  <el-tag
                    :type="getLevelTagType(option.value)"
                    size="small"
                    effect="plain"
                  >
                    {{ option.label }}
                  </el-tag>
                </el-option>
              </el-select>
              <div class="field-hint">
                <el-tooltip placement="top" effect="dark">
                  <div slot="content">
                    <div>I级-严重：导致生产停机，影响交付</div>
                    <div>II级-重大：产能下降50%以上</div>
                    <div>III级-一般：产能下降50%以下</div>
                    <div>IV级-轻微：不影响正常生产</div>
                  </div>
                  <i class="el-icon-question" style="cursor: pointer; color: #409eff" /> 等级说明
                </el-tooltip>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="影响程度" prop="impactDegree">
              <el-select
                v-model="formData.impactDegree"
                placeholder="请选择影响程度"
                style="width: 100%"
                @change="handleImpactDegreeChange"
              >
                <el-option
                  v-for="option in impactDegreeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <div v-if="showImpactWarning" class="field-hint warning">
                <i class="el-icon-warning" /> 选择"停机"将自动将设备状态设为"维修中"
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="故障类型" prop="failureType">
              <el-select
                v-model="formData.failureType"
                placeholder="请选择故障类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in failureTypeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 三、故障描述 -->
      <div class="form-section">
        <div class="section-title">三、故障描述</div>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="故障现象描述" prop="failureDescription">
              <el-input
                v-model="formData.failureDescription"
                type="textarea"
                :rows="4"
                placeholder="请详细描述故障现象，包括异常声音、温度、震动等关键信息"
                maxlength="1000"
                show-word-limit
              />
              <div class="field-hint">详细描述故障表现，有助于快速定位和处理问题</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="初步原因分析" prop="failureCausePreliminary">
              <el-input
                v-model="formData.failureCausePreliminary"
                type="textarea"
                :rows="3"
                placeholder="选填，如果能够初步判断故障原因，请填写初步分析（最多500字）"
                maxlength="500"
                show-word-limit
              />
              <div class="field-hint">为维修人员提供参考，可提高故障处理效率</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="innerMode === 'update'" :gutter="20">
          <el-col :span="24">
            <el-form-item label="详细原因分析" prop="failureCauseDetailed">
              <el-input
                v-model="formData.failureCauseDetailed"
                type="textarea"
                :rows="3"
                placeholder="选填，在处理过程中如发现详细原因，可在此补充（最多500字）"
                maxlength="500"
                show-word-limit
              />
              <div class="field-hint">补充详细的故障原因分析，有助于后续根本原因分析</div>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>

    <!-- 抽屉底部按钮 -->
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        v-if="innerMode !== 'view'"
        type="primary"
        :loading="submitLoading"
        @click="handleSubmit"
      >
        {{ innerMode === 'create' ? '创建' : '更新' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import { createEquipmentFailure, getEquipmentFailureById, updateEquipmentFailure } from '@/api/mdm/tpm/equipmentFailure'
import {
  FAILURE_LEVEL_OPTIONS,
  IMPACT_DEGREE_OPTIONS,
  FAILURE_TYPE_OPTIONS,
  IMPACT_DEGREE,
  FAILURE_LEVEL_CONFIG
} from '../constants'
import store from '@/store'

export default {
  name: 'FailureReportFormDrawer',
  components: {
    BaseDrawer
  },
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'update', 'view'].includes(value)
    },
    failureId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      drawerVisible: false,
      innerMode: 'create',
      formData: {
        failureCode: '',
        equipmentId: '',
        failureTime: '',
        reporterId: '',
        failureDescription: '',
        failureLevel: '',
        impactDegree: '',
        failureType: '',
        failureCausePreliminary: '',
        failureCauseDetailed: ''
      },
      originalFormData: null, // 用于记录原始数据，检测变更
      submitLoading: false,
      equipmentLoading: false,
      userLoading: false,
      equipmentOptions: [],
      userOptions: [],
      failureLevelOptions: FAILURE_LEVEL_OPTIONS,
      impactDegreeOptions: IMPACT_DEGREE_OPTIONS,
      failureTypeOptions: FAILURE_TYPE_OPTIONS,
      datePickerOptions: {
        disabledDate: (time) => {
          // 不能晚于当前时间
          return time.getTime() > Date.now()
        }
      }
    }
  },
  computed: {
    drawerTitle() {
      const titleMap = {
        create: '创建故障报告',
        update: '编辑故障报告',
        view: '查看故障报告'
      }
      return titleMap[this.innerMode] || '故障报告'
    },
    formRules() {
      return {
        equipmentId: [
          { required: true, message: '请选择故障设备', trigger: 'change' }
        ],
        failureTime: [
          { required: true, message: '请选择故障发生时间', trigger: 'change' }
        ],
        reporterId: [
          { required: true, message: '请选择报告人', trigger: 'change' }
        ],
        failureDescription: [
          { required: true, message: '请输入故障现象描述', trigger: 'blur' },
          { min: 10, message: '故障描述至少10个字符', trigger: 'blur' }
        ],
        failureLevel: [
          { required: true, message: '请选择故障等级', trigger: 'change' }
        ],
        impactDegree: [
          { required: true, message: '请选择影响程度', trigger: 'change' }
        ],
        failureType: [
          { required: true, message: '请选择故障类型', trigger: 'change' }
        ]
      }
    },
    showImpactWarning() {
      return this.formData.impactDegree === IMPACT_DEGREE.SHUTDOWN
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val) {
          this.innerMode = this.mode
          this.$nextTick(() => {
            this.initializeForm()
          })
        }
      },
      immediate: true
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    /**
     * 初始化表单数据
     */
    async initializeForm() {
      try {
        if (this.innerMode === 'create') {
          this.formData = this.getDefaultFormData()
          this.originalFormData = null
          // 设置默认报告人为当前登录用户
          await this.setDefaultReporter()
          // 初始加载设备列表
          await this.loadInitialEquipments()
        } else if (this.innerMode === 'update' || this.innerMode === 'view') {
          // 编辑或查看模式：加载故障详情
          await this.loadFailureDetail()
        }
        // 清除验证
        await this.$nextTick()
        this.$refs.form && this.$refs.form.clearValidate()
      } catch (error) {
        console.error('初始化表单数据失败:', error)
        this.$message.error('初始化表单失败')
      }
    },

    /**
     * 获取默认表单数据
     */
    getDefaultFormData() {
      return {
        failureCode: '',
        equipmentId: '',
        failureTime: '',
        reporterId: '',
        failureDescription: '',
        failureLevel: '',
        impactDegree: '',
        failureType: '',
        failureCausePreliminary: '',
        failureCauseDetailed: ''
      }
    },

    /**
     * 加载故障详情（用于编辑模式）
     */
    async loadFailureDetail() {
      if (!this.failureId) {
        this.$message.error('缺少故障ID')
        this.drawerVisible = false
        return
      }

      try {
        const response = await getEquipmentFailureById(this.failureId)
        const detail = response.data

        // 回填表单数据
        this.formData = {
          failureCode: detail.failureCode || '',
          equipmentId: detail.equipmentId || '',
          failureTime: detail.failureTime || '',
          reporterId: detail.reporterId || '',
          failureDescription: detail.failureDescription || '',
          failureLevel: detail.failureLevel || '',
          impactDegree: detail.impactDegree || '',
          failureType: detail.failureType || '',
          failureCausePreliminary: detail.failureCausePreliminary || '',
          failureCauseDetailed: detail.failureCauseDetailed || ''
        }

        // 保存原始数据，用于检测变更
        this.originalFormData = JSON.parse(JSON.stringify(this.formData))

        // 回填设备选项
        if (detail.equipment) {
          this.equipmentOptions = [{
            id: detail.equipment.id,
            equipmentCode: detail.equipment.equipmentCode,
            equipmentName: detail.equipment.equipmentName
          }]
        }

        // 回填报告人选项
        if (detail.reporter) {
          this.userOptions = [{
            id: detail.reporter.id,
            username: detail.reporter.name,
            email: detail.reporter.email
          }]
        }
      } catch (error) {
        console.error('加载故障详情失败:', error)
        const errorMessage = error.response?.data?.error?.message || error.message || '加载故障详情失败'
        this.$message.error(errorMessage)
        this.drawerVisible = false
      }
    },

    /**
     * 设置默认报告人为当前登录用户
     */
    async setDefaultReporter() {
      try {
        const currentUser = store.getters.userInfo
        if (currentUser && currentUser.id) {
          this.formData.reporterId = currentUser.id
          this.userOptions = [{
            id: currentUser.id,
            username: currentUser.username || currentUser.name,
            email: currentUser.email || ''
          }]
        }
      } catch (error) {
        console.error('设置默认报告人失败:', error)
      }
    },

    /**
     * 初始加载设备列表
     */
    async loadInitialEquipments() {
      try {
        // 这里调用设备查询API，获取前20个设备
        // TODO: 需要实现设备API调用
        // const response = await getEquipments({ page: 1, limit: 20 })
        // this.equipmentOptions = response.data.results || []

        // 临时模拟数据
        this.equipmentOptions = []
      } catch (error) {
        console.error('加载设备列表失败:', error)
      }
    },

    /**
     * 搜索设备
     */
    async searchEquipments(query) {
      if (query === '') {
        await this.loadInitialEquipments()
        return
      }

      this.equipmentLoading = true
      try {
        // TODO: 调用设备搜索API
        // const response = await getEquipments({ keyword: query, page: 1, limit: 20 })
        // this.equipmentOptions = response.data.results || []

        // 临时模拟数据
        this.equipmentOptions = []
      } catch (error) {
        console.error('搜索设备失败:', error)
        this.$message.error('搜索设备失败')
      } finally {
        this.equipmentLoading = false
      }
    },

    /**
     * 搜索用户
     */
    async searchUsers(query) {
      if (query === '') {
        return
      }

      this.userLoading = true
      try {
        // TODO: 调用用户搜索API
        // const response = await getUsers({ keyword: query, page: 1, limit: 20 })
        // this.userOptions = response.data.results || []

        // 临时保持当前用户
        const currentUser = store.getters.userInfo
        if (currentUser) {
          this.userOptions = [{
            id: currentUser.id,
            username: currentUser.username || currentUser.name,
            email: currentUser.email || ''
          }]
        }
      } catch (error) {
        console.error('搜索用户失败:', error)
        this.$message.error('搜索用户失败')
      } finally {
        this.userLoading = false
      }
    },

    /**
     * 设备选择变化处理
     */
    handleEquipmentChange(equipmentId) {
      // 可以在这里获取设备详情，显示设备状态等信息
      console.log('选择的设备ID:', equipmentId)
    },

    /**
     * 影响程度变化处理
     */
    handleImpactDegreeChange(value) {
      if (value === IMPACT_DEGREE.SHUTDOWN) {
        this.$message.info('提示：选择"停机"后，系统将自动将设备状态设为"维修中"')
      }
    },

    /**
     * 获取故障等级标签类型
     */
    getLevelTagType(level) {
      return FAILURE_LEVEL_CONFIG.typeMap[level] || 'info'
    },

    /**
     * 将表单数据转换为API数据
     */
    transformFormDataToApi(formData) {
      const apiData = {
        equipmentId: formData.equipmentId,
        failureTime: formData.failureTime,
        reporterId: formData.reporterId,
        failureDescription: formData.failureDescription,
        failureLevel: formData.failureLevel,
        impactDegree: formData.impactDegree,
        failureType: formData.failureType
      }

      // 可选字段
      if (formData.failureCode) {
        apiData.failureCode = formData.failureCode
      }
      if (formData.failureCausePreliminary) {
        apiData.failureCausePreliminary = formData.failureCausePreliminary
      }

      return apiData
    },

    /**
     * 抽屉打开事件
     */
    handleDrawerOpen() {
      this.$emit('open')
    },

    /**
     * 抽屉关闭事件
     */
    handleDrawerClose() {
      this.formData = this.getDefaultFormData()
      this.equipmentOptions = []
      this.userOptions = []
      this.submitLoading = false
      this.$emit('close')
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.drawerVisible = false
    },

    /**
     * 提交表单
     */
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请检查表单填写是否正确')
          return
        }
        this.handleFormSubmit(this.formData)
      })
    },

    /**
     * 表单提交处理
     */
    async handleFormSubmit(formData) {
      this.submitLoading = true

      try {
        if (this.innerMode === 'create') {
          // 创建模式
          const apiData = this.transformFormDataToApi(formData)
          const response = await createEquipmentFailure(apiData)

          this.$message.success(response.message || '创建故障报告成功')
          this.$emit('created', response.data)
          this.drawerVisible = false
        } else if (this.innerMode === 'update') {
          // 编辑模式：只发送变更的字段
          const changedData = this.getChangedFields(formData)

          if (Object.keys(changedData).length === 0) {
            this.$message.info('未检测到任何变更')
            return
          }

          const response = await updateEquipmentFailure(this.failureId, changedData)

          this.$message.success(response.message || '更新故障信息成功')
          this.$emit('updated', response.data)
          this.drawerVisible = false
        }
      } catch (error) {
        console.error('提交失败:', error)
        const errorMessage = error.response?.data?.error?.message || error.message || '操作失败'
        this.$message.error(errorMessage)
      } finally {
        this.submitLoading = false
      }
    },

    /**
     * 获取变更的字段（用于PATCH请求）
     */
    getChangedFields(formData) {
      if (!this.originalFormData) {
        return formData
      }

      const changedData = {}

      // 比较每个字段，只发送变更的字段
      Object.keys(formData).forEach(key => {
        const currentValue = formData[key]
        const originalValue = this.originalFormData[key]

        // 处理空值的比较
        const normalizedCurrent = currentValue === '' ? null : currentValue
        const normalizedOriginal = originalValue === '' ? null : originalValue

        if (normalizedCurrent !== normalizedOriginal) {
          // 只有当值确实变更时才加入
          changedData[key] = currentValue
        }
      })

      return changedData
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e4e7ed;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: -2px;
      width: 40px;
      height: 2px;
      background: #409eff;
    }
  }
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;

  &.warning {
    color: #e6a23c;

    .el-icon-warning {
      margin-right: 4px;
    }
  }
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}

::v-deep .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

::v-deep .el-select-dropdown__item {
  height: auto;
  line-height: 1.5;
  padding: 10px 20px;
}
</style>

