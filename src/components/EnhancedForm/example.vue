/**
* EnhancedForm组件示例 - 展示现代前端开发范式优化特性
* 创建日期：2024-12-16
*/
<template>
  <div class="enhanced-form-example">
    <div class="demo-header">
      <h2>EnhancedForm 现代化特性演示</h2>
      <p>此示例展示了组件的所有现代前端开发范式优化特性</p>
    </div>

    <!-- 控制面板 -->
    <el-card class="control-panel" header="控制面板">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="表单模式">
            <el-radio-group v-model="mode" @change="handleModeChange">
              <el-radio-button label="create">创建</el-radio-button>
              <el-radio-button label="update">编辑</el-radio-button>
              <el-radio-button label="view">查看</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="外部加载状态">
            <el-switch v-model="externalLoading" @change="handleLoadingChange" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="自动保存">
            <el-switch v-model="autoSaveEnabled" @change="handleAutoSaveChange" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <!-- 主表单区域 -->
    <el-card class="form-card" header="增强表单">
      <enhanced-form
        ref="enhancedForm"
        :data="formData"
        :mode="mode"
        :rules="formRules"
        :loading="externalLoading"
        :auto-save-interval="autoSaveEnabled ? 10000 : 0"
        :allow-empty-submit="false"
        :show-continue-button="mode === 'create'"
        label-width="120px"
        @submit="handleSubmit"
        @reset="handleReset"
        @validate="handleCustomValidate"
        @validate-error="handleValidateError"
        @field-change="handleFieldChange"
        @auto-save="handleAutoSave"
        @error="handleError"
        @form-update="handleFormUpdate"
      >
        <!-- 表单内容插槽 -->
        <template v-slot="{ form, formMode, formHasChanges, isValid, setFieldValue }">
          <!-- 状态指示器 -->
          <div class="status-indicators">
            <el-tag v-if="formHasChanges" type="warning" size="small">
              <i class="el-icon-edit" /> 有未保存的更改
            </el-tag>
            <el-tag v-if="isValid" type="success" size="small">
              <i class="el-icon-check" /> 表单验证通过
            </el-tag>
            <el-tag v-else type="info" size="small">
              <i class="el-icon-warning" /> 表单验证待完成
            </el-tag>
          </div>

          <!-- 基本信息 -->
          <h4>基本信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input
                  v-model="form.username"
                  placeholder="请输入用户名"
                  :disabled="formMode === 'view'"
                  @blur="() => demoValidateField('username')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="真实姓名" prop="realName">
                <el-input v-model="form.realName" placeholder="请输入真实姓名" :disabled="formMode === 'view'" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" placeholder="请输入邮箱地址" :disabled="mode === 'view' || autoGenerateEmail" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" :disabled="formMode === 'view'" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 自动功能演示 -->
          <h4>智能功能演示</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="自动生成邮箱">
                <el-switch
                  v-model="autoGenerateEmail"
                  :disabled="formMode === 'view'"
                  @change="(value) => handleAutoEmailChange(value, setFieldValue)"
                />
                <span class="feature-desc">根据用户名自动生成邮箱</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="部门" prop="department">
                <el-select
                  v-model="form.department"
                  placeholder="请选择部门"
                  :disabled="formMode === 'view'"
                  @change="(value) => handleDepartmentChange(value, setFieldValue)"
                >
                  <el-option label="技术部" value="tech" />
                  <el-option label="产品部" value="product" />
                  <el-option label="运营部" value="operation" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="角色" prop="role">
                <el-select v-model="form.role" placeholder="请选择角色" :disabled="formMode === 'view'">
                  <el-option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model="form.status" :disabled="mode === 'view'">
                  <el-radio :label="1">启用</el-radio>
                  <el-radio :label="0">禁用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 其他信息 -->
          <h4>其他信息</h4>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              :disabled="mode === 'view'"
            />
          </el-form-item>
        </template>

        <!-- 自定义底部按钮 -->
        <template #footer="{ loading, submit, reset, hasChanges: footerHasChanges, isValid }">
          <div class="custom-footer">
            <div class="left-actions">
              <el-button
                v-if="formMode !== 'view'"
                :disabled="!footerHasChanges"
                icon="el-icon-document"
                @click="handleSaveDraft"
              >
                保存草稿
              </el-button>
              <el-button v-if="formMode !== 'view'" :disabled="!isValid" icon="el-icon-view" @click="handlePreview">
                预览
              </el-button>
            </div>
            <div class="right-actions">
              <el-button :disabled="!footerHasChanges" icon="el-icon-refresh" @click="reset">
                重置
              </el-button>
              <el-button
                v-if="formMode === 'create'"
                type="primary"
                :loading="loading"
                :disabled="!isValid || !hasChanges"
                icon="el-icon-check"
                @click="submit"
              >
                创建并继续
              </el-button>
              <el-button
                v-if="formMode !== 'view'"
                type="primary"
                :loading="loading"
                :disabled="!isValid || !hasChanges"
                icon="el-icon-check"
                @click="submit"
              >
                {{ formMode === 'create' ? '创建' : '保存' }}
              </el-button>
            </div>
          </div>
        </template>
      </enhanced-form>
    </el-card>

    <!-- 功能演示区域 -->
    <el-row :gutter="20" class="demo-cards">
      <el-col :span="12">
        <el-card header="操作日志">
          <div class="log-container">
            <div v-for="(log, index) in operationLogs" :key="index" class="log-item" :class="log.type">
              <span class="log-time">{{ log.time }}</span>
              <span class="log-content">{{ log.content }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="表单状态">
          <div class="status-info">
            <p><strong>表单模式：</strong>{{ modeText }}</p>
            <p><strong>是否有变更：</strong>{{ hasChanges ? '是' : '否' }}</p>
            <p><strong>验证状态：</strong>{{ isFormValid ? '通过' : '待验证' }}</p>
            <p><strong>加载状态：</strong>{{ actualLoading ? '加载中' : '空闲' }}</p>
            <p><strong>自动保存：</strong>{{ autoSaveEnabled ? '已启用' : '已禁用' }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷键说明 -->
    <el-card class="shortcut-info" header="快捷键说明">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="shortcut-item">
            <kbd>Ctrl + S</kbd>
            <span>保存表单</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="shortcut-item">
            <kbd>Ctrl + R</kbd>
            <span>重置表单</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="shortcut-item">
            <kbd>Tab</kbd>
            <span>字段导航</span>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="shortcut-item">
            <kbd>Enter</kbd>
            <span>提交表单</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import EnhancedForm from './index.vue'

export default {
  name: 'EnhancedFormExample',
  components: {
    EnhancedForm
  },
  data() {
    return {
      mode: 'create',
      externalLoading: false,
      autoSaveEnabled: false,
      autoGenerateEmail: false,
      formData: {
        username: '',
        realName: '',
        email: '',
        phone: '',
        department: '',
        role: '',
        status: 1,
        remark: ''
      },
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '用户名必须以字母开头，只能包含字母、数字和下划线',
            trigger: 'blur'
          }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        department: [
          { required: true, message: '请选择部门', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      roleOptions: [
        { label: '超级管理员', value: 'super_admin' },
        { label: '管理员', value: 'admin' },
        { label: '用户', value: 'user' }
      ],
      operationLogs: [],
      hasChanges: false,
      isFormValid: false,
      actualLoading: false
    }
  },
  computed: {
    modeText() {
      const modeMap = {
        create: '创建模式',
        update: '编辑模式',
        view: '查看模式'
      }
      return modeMap[this.mode] || '未知模式'
    }
  },

  mounted() {
    this.addLog('EnhancedForm示例页面已加载', 'success')

    // 监听表单状态变化
    setInterval(() => {
      if (this.$refs.enhancedForm) {
        const formRef = this.$refs.enhancedForm
        this.hasChanges = formRef.hasFormChanges
        this.isFormValid = formRef.isFormValid
        this.actualLoading = formRef.actualLoading
      }
    }, 1000)
  },
  methods: {
    // 模式切换处理
    handleModeChange(newMode) {
      this.addLog(`切换到${this.modeText}`, 'info')

      // 切换到编辑模式时填充示例数据
      if (newMode === 'update') {
        this.formData = {
          username: 'demo_user',
          realName: '演示用户',
          email: 'demo@example.com',
          phone: '13800138000',
          department: 'tech',
          role: 'user',
          status: 1,
          remark: '这是一个演示用户账号'
        }
      } else if (newMode === 'create') {
        this.formData = {
          username: '',
          realName: '',
          email: '',
          phone: '',
          department: '',
          role: '',
          status: 1,
          remark: ''
        }
      }
    },

    // 加载状态切换
    handleLoadingChange(loading) {
      this.addLog(`${loading ? '开启' : '关闭'}外部加载状态`, 'info')
    },

    // 自动保存切换
    handleAutoSaveChange(enabled) {
      this.addLog(`${enabled ? '启用' : '禁用'}自动保存功能`, 'info')
    },

    // 自动邮箱生成
    handleAutoEmailChange(enabled, setFieldValue) {
      if (enabled && this.formData.username) {
        const autoEmail = `${this.formData.username}@company.com`
        setFieldValue('email', autoEmail)
        this.addLog(`自动生成邮箱: ${autoEmail}`, 'success')
      }
    },

    // 部门变更处理（角色联动）
    handleDepartmentChange(department, setFieldValue) {
      const departmentRoleMap = {
        tech: 'user',
        product: 'user',
        operation: 'admin'
      }

      if (departmentRoleMap[department]) {
        setFieldValue('role', departmentRoleMap[department])
        this.addLog(`根据部门自动设置角色`, 'info')
      }
    },

    // 表单提交处理
    async handleSubmit(formData, continueEdit) {
      this.addLog(`开始提交表单 ${continueEdit ? '(保存并继续)' : ''}`, 'info')

      try {
        // 模拟API请求
        await new Promise(resolve => setTimeout(resolve, 2000))

        this.addLog('表单提交成功', 'success')
        this.$message.success(`${this.mode === 'create' ? '创建' : '保存'}成功`)

        if (continueEdit) {
          // 继续编辑逻辑
          this.addLog('准备创建下一个', 'info')
        }
      } catch (error) {
        this.addLog(`提交失败: ${error.message}`, 'error')
        throw error
      }
    },

    // 表单重置处理
    handleReset() {
      this.addLog('表单已重置', 'info')
    },

    // 自定义验证处理
    handleCustomValidate(formData, callback) {
      // 演示自定义验证逻辑
      if (formData.username === 'admin' && formData.role !== 'super_admin') {
        this.addLog('自定义验证失败: admin用户必须是超级管理员角色', 'error')
        this.$message.error('admin用户必须是超级管理员角色')
        callback(false)
        return
      }

      this.addLog('自定义验证通过', 'success')
      callback(true)
    },

    // 验证错误处理
    handleValidateError(invalidFields) {
      const fieldCount = Object.keys(invalidFields).length
      this.addLog(`表单验证失败，${fieldCount}个字段不符合要求`, 'error')
    },

    // 字段变更处理
    handleFieldChange({ field, value }) {
      this.addLog(`字段 ${field} 更新为: ${value}`, 'info')

      // 自动邮箱生成
      if (field === 'username' && this.autoGenerateEmail && value) {
        this.$refs.enhancedForm.setFieldValue('email', `${value}@company.com`)
      }
    },

    // 自动保存处理
    handleAutoSave(formData) {
      this.addLog('执行自动保存', 'info')
      console.log('自动保存数据:', formData)
    },

    // 错误处理
    handleError(error) {
      this.addLog(`组件错误: ${error.message}`, 'error')
      console.error('EnhancedForm Error:', error)
    },

    // 表单数据更新
    handleFormUpdate(formData) {
      this.addLog('表单数据已更新', 'info')
    },

    // 保存草稿
    handleSaveDraft() {
      const formData = this.$refs.enhancedForm.getFormData()
      this.addLog('保存草稿', 'info')
      console.log('草稿数据:', formData)
      this.$message.success('草稿已保存')
    },

    // 预览
    handlePreview() {
      const formData = this.$refs.enhancedForm.getFormData()
      this.addLog('预览表单数据', 'info')
      this.$alert(JSON.stringify(formData, null, 2), '表单数据预览', {
        type: 'info'
      })
    },

    // 演示字段验证
    demoValidateField(field) {
      if (field === 'username') {
        this.addLog(`验证用户名字段`, 'info')
      }
    },

    // 添加操作日志
    addLog(content, type = 'info') {
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

      this.operationLogs.unshift({
        time,
        content,
        type
      })

      // 只保留最近50条日志
      if (this.operationLogs.length > 50) {
        this.operationLogs = this.operationLogs.slice(0, 50)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.enhanced-form-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 20px;

  h2 {
    color: #303133;
    margin-bottom: 8px;
  }

  p {
    color: #606266;
    margin: 0;
  }
}

.control-panel {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.form-card {
  margin-bottom: 20px;
}

.status-indicators {
  margin-bottom: 20px;

  .el-tag {
    margin-right: 10px;
  }
}

.feature-desc {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.custom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;

  .left-actions,
  .right-actions {
    display: flex;
    gap: 10px;
  }
}

.demo-cards {
  margin-bottom: 20px;
}

.log-container {
  height: 200px;
  overflow-y: auto;
  font-size: 12px;

  .log-item {
    padding: 4px 0;
    border-bottom: 1px solid #f0f0f0;

    &.success {
      color: #67C23A;
    }

    &.error {
      color: #F56C6C;
    }

    &.info {
      color: #409EFF;
    }

    .log-time {
      margin-right: 8px;
      color: #909399;
    }
  }
}

.status-info {
  font-size: 14px;

  p {
    margin: 8px 0;

    strong {
      color: #303133;
    }
  }
}

.shortcut-info {
  .shortcut-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;

    kbd {
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 2px 6px;
      margin-right: 8px;
      font-size: 12px;
      color: #333;
    }

    span {
      color: #606266;
      font-size: 14px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .enhanced-form-example {
    padding: 10px;
  }

  .custom-footer {
    flex-direction: column;
    gap: 10px;

    .left-actions,
    .right-actions {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
