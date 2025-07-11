<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="700px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <enhanced-form
      ref="routingForm"
      :data="formData"
      :rules="formRules"
      :mode="mode"
      label-width="110px"
      :show-footer="false"
    >
      <template #default="{ form, mode: formMode }">
        <div class="form-section">
          <div class="section-title">一、路线基本信息</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="路线代码" prop="code">
                <el-input
                  v-model="form.code"
                  placeholder="请输入路线代码"
                  maxlength="30"
                  show-word-limit
                  :disabled="formMode !== 'create'"
                />
                <div class="field-hint">路线代码必须唯一，建议使用大写字母、数字和下划线</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="路线名称" prop="name">
                <el-input
                  v-model="form.name"
                  placeholder="请输入路线名称"
                  maxlength="50"
                  show-word-limit
                  :disabled="formMode === 'view'"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="版本" prop="version">
                <el-input v-model="form.version" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                 <StatusTag
                   v-if="form.status"
                   :status="form.status"
                   :text-map="statusTextMap"
                   :type-map="statusTypeMap"
                 />
                 <span v-else>-</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="路线类型" prop="type">
                <el-select
                  v-model="form.type"
                  placeholder="请选择路线类型"
                  style="width: 100%"
                  :disabled="formMode === 'view'"
                >
                  <el-option
                    v-for="item in routingTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
           <el-row :gutter="20">
             <el-col :span="24">
               <el-form-item label="适用产品" prop="applicableProducts">
                 <el-select
                  v-model="form.applicableProducts"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请输入或选择适用的产品代码"
                  style="width: 100%;"
                  :disabled="formMode === 'view'"
                >
                 </el-select>
                 <div class="field-hint">可输入新的产品代码后按回车键添加</div>
               </el-form-item>
             </el-col>
           </el-row>
        </div>
      </template>
    </enhanced-form>

     <template #footer>
      <el-button @click="handleCancel">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" @click="handleReset">重置</el-button>
      <el-button
        v-if="mode === 'create'"
        type="primary"
        :loading="loading"
        @click="handleSubmitAndContinue"
      >
        保存并继续
      </el-button>
      <el-button
        v-if="mode !== 'view'"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ mode === 'create' ? '确认保存' : '保存修改' }}
      </el-button>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import StatusTag from '@/components/StatusTag'
import { createRouting, updateRouting } from '../api'
import { ROUTING_TYPE_OPTIONS, ROUTING_STATUS_CONFIG } from '../constants'

export default {
  name: 'RoutingFormDrawer',
  components: {
    BaseDrawer,
    EnhancedForm,
    StatusTag
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: (val) => ['create', 'update', 'view'].includes(val)
    },
    routingData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      formData: {},
      formRules: {
        code: [
          { required: true, message: '路线代码不能为空', trigger: 'blur' },
          { pattern: /^[A-Z0-9_]+$/, message: '只能包含大写字母、数字和下划线', trigger: 'blur' }
        ],
        name: [{ required: true, message: '路线名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '路线类型不能为空', trigger: 'change' }],
        applicableProducts: [{ type: 'array', required: true, message: '至少选择或输入一个适用产品', trigger: 'change' }]
      }
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    drawerTitle() {
      const titleMap = {
        create: '新增工艺路线',
        update: '编辑工艺路线',
        view: '查看工艺路线'
      }
      return titleMap[this.mode]
    },
    routingTypeOptions() {
      return ROUTING_TYPE_OPTIONS
    },
    statusTextMap() {
      return ROUTING_STATUS_CONFIG.textMap
    },
    statusTypeMap() {
      return ROUTING_STATUS_CONFIG.typeMap
    }
  },
  methods: {
    handleDrawerOpen() {
      this.formData = this.initFormData(this.routingData)
    },
    handleDrawerClose() {
      this.$refs.routingForm.resetFields()
      this.$emit('close')
    },
    initFormData(data) {
      if (this.mode === 'create') {
        return {
          code: '',
          name: '',
          version: '1.0',
          status: 'Draft',
          type: 'Standard',
          applicableProducts: []
        }
      }
      // 在编辑或查看时，确保返回一个新对象，避免直接修改prop
      return data ? { ...data } : {}
    },
    async handleSubmit(andContinue = false) {
      try {
        await this.$refs.routingForm.validate()
        this.loading = true
        const apiCall = this.mode === 'create' ? createRouting : updateRouting
        const response = await apiCall(this.formData)
        
        this.$message.success(response.message || '操作成功')

        if (andContinue) {
          this.$emit('success', { continue: true })
          this.handleReset()
        } else {
          this.$emit('success')
          this.drawerVisible = false
        }
      } catch (error) {
        // Validation error is handled by EnhancedForm, this catch is for API errors
        if (error && error.message) {
           console.error('API请求失败:', error)
        }
      } finally {
        this.loading = false
      }
    },
    handleSubmitAndContinue() {
      this.handleSubmit(true)
    },
    handleCancel() {
      this.drawerVisible = false
    },
    handleReset() {
      this.$refs.routingForm.resetFields()
      this.formData = this.initFormData()
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 30px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20px;
    padding-bottom: 8px;
    border-bottom: 2px solid #e4e7ed;
    border-left: 4px solid #409eff; /* 保留并融合用户指定的样式 */
    padding-left: 10px;
  }
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  line-height: 1.4;
}

::v-deep .el-form-item__label {
  font-weight: 500;
}
</style> 