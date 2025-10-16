<!--
文件名称：CopyTemplateDialog.vue
文件描述：工艺模板复制对话框，简化的复制功能，只需填写新模板编码、名称和版本号
创建日期：2025-10-08
修改记录：
  - 2025-10-08: 初始创建，实现简化的模板复制功能
-->

<template>
  <el-dialog
    :visible.sync="visibleProxy"
    :title="dialogTitle"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="600px"
    class="copy-template-dialog"
    @close="handleClose"
  >
    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      type="error"
      show-icon
      :closable="false"
      :title="errorMessage"
      style="margin-bottom: 16px"
    />

    <!-- 源模板信息提示 -->
    <el-alert
      v-if="sourceTemplate"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    >
      <div slot="title">
        <strong>复制源模板：</strong>{{ sourceTemplate.templateCode }} - {{ sourceTemplate.templateName }}
        <span v-if="sourceVersion" style="margin-left: 12px; color: #909399;">
          （版本：{{ sourceVersion.versionNumber }}）
        </span>
      </div>
    </el-alert>

    <el-form
      ref="copyForm"
      :model="formData"
      :rules="formRules"
      label-width="130px"
      size="medium"
      :disabled="submitting"
      @submit.native.prevent
    >
      <el-form-item label="新模板编码" prop="newTemplateCode">
        <el-input
          v-model="formData.newTemplateCode"
          placeholder="请输入新模板编码，如：PT-AF1060-ANNEALING-V2"
          maxlength="100"
          show-word-limit
          clearable
        />
        <small class="field-hint">
          格式：PT-产品规格-工艺类型-版本标识，必须唯一
        </small>
      </el-form-item>

      <el-form-item label="新模板名称" prop="newTemplateName">
        <el-input
          v-model="formData.newTemplateName"
          placeholder="请输入新模板名称，如：1100-H18 退火工艺模板"
          maxlength="200"
          show-word-limit
          clearable
        />
        <small class="field-hint">
          建议格式：合金牌号-状态 工艺类型模板，便于识别
        </small>
      </el-form-item>

      <el-form-item label="新版本号" prop="newVersionNumber">
        <el-input
          v-model="formData.newVersionNumber"
          placeholder="请输入新版本号，如：v1.0"
          maxlength="20"
          show-word-limit
          clearable
        />
        <small class="field-hint">
          推荐格式：v主版本.次版本（如 v1.0, v2.1），必须唯一
        </small>
      </el-form-item>

      <el-form-item label="选择源版本" prop="copyFromVersionId">
        <el-select
          v-model="formData.copyFromVersionId"
          placeholder="请选择要复制的版本"
          style="width: 100%;"
          filterable
        >
          <el-option
            v-for="version in availableVersions"
            :key="version.id"
            :label="`${version.versionNumber} - ${version.status}`"
            :value="version.id"
          >
            <div class="version-option">
              <span class="version-number">{{ version.versionNumber }}</span>
              <el-tag :type="getVersionStatusType(version.status)" size="mini" style="margin-left: 8px;">
                {{ version.status }}
              </el-tag>
              <span v-if="version.versionDescription" class="version-desc">
                {{ version.versionDescription }}
              </span>
            </div>
          </el-option>
        </el-select>
        <small class="field-hint">
          选择要复制的源版本，将复制该版本的所有参数配置
        </small>
      </el-form-item>
    </el-form>

    <!-- 提示信息 -->
    <el-alert
      type="warning"
      :closable="false"
      show-icon
      style="margin-top: 16px;"
    >
      <div slot="title">
        <strong>温馨提示：</strong>复制操作将创建一个与源版本配置完全相同的新模板。如需修改参数，请在复制完成后，在模板列表中找到新模板并点击"编辑"按钮进行修改。
      </div>
    </el-alert>

    <div slot="footer" class="dialog-footer">
      <el-button :disabled="submitting" @click="handleCancel">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '复制中...' : '确认复制' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { copyProcessTemplate } from '../api'
import { MESSAGE_FALLBACKS } from '../constants/messages-config'

export default {
  name: 'CopyTemplateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    sourceTemplate: {
      type: Object,
      default: null
    },
    sourceVersion: {
      type: Object,
      default: null
    },
    availableVersions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visibleProxy: false,
      submitting: false,
      errorMessage: '',
      formData: {
        newTemplateCode: '',
        newTemplateName: '',
        newVersionNumber: '',
        copyFromVersionId: ''
      },
      formRules: {
        newTemplateCode: [
          { required: true, message: '请输入新模板编码', trigger: 'blur' },
          { min: 5, max: 100, message: '模板编码长度应在 5-100 个字符之间', trigger: 'blur' },
          {
            pattern: /^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$/,
            message: '模板编码只能包含大写字母、数字和连字符，且不能以连字符开头或结尾',
            trigger: 'blur'
          }
        ],
        newTemplateName: [
          { max: 200, message: '模板名称不能超过200个字符', trigger: 'blur' }
        ],
        newVersionNumber: [
          { required: true, message: '请输入新版本号', trigger: 'blur' },
          { min: 2, max: 20, message: '版本号长度应在 2-20 个字符之间', trigger: 'blur' },
          {
            pattern: /^v\d+\.\d+$/,
            message: '版本号格式应为 v主版本.次版本（如 v1.0）',
            trigger: 'blur'
          }
        ],
        copyFromVersionId: [
          { required: true, message: '请选择要复制的源版本', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.sourceTemplate
        ? `复制模板 - ${this.sourceTemplate.templateName}`
        : '复制工艺模板'
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.visibleProxy = val
        if (val) {
          this.initializeForm()
        }
      }
    },
    visibleProxy(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.resetForm()
      }
    }
  },
  methods: {
    initializeForm() {
      this.errorMessage = ''

      // 设置默认值
      if (this.sourceTemplate) {
        // 新模板名称默认为 "原名称-副本"
        this.formData.newTemplateName = `${this.sourceTemplate.templateName}-副本`

        // 如果只有一个版本（最新版本），自动选中
        if (this.availableVersions && this.availableVersions.length === 1) {
          this.formData.copyFromVersionId = this.availableVersions[0].id
        } else if (this.sourceVersion && this.sourceVersion.id) {
          // 否则使用传入的源版本
          this.formData.copyFromVersionId = this.sourceVersion.id
        }

        // 新版本号根据最新版本自动生成建议值
        if (this.sourceVersion && this.sourceVersion.versionNumber) {
          const versionMatch = this.sourceVersion.versionNumber.match(/^v(\d+)\.(\d+)$/)
          if (versionMatch) {
            const major = parseInt(versionMatch[1])
            const minor = parseInt(versionMatch[2])
            this.formData.newVersionNumber = `v${major}.${minor + 1}`
          } else {
            this.formData.newVersionNumber = 'v1.0'
          }
        } else {
          this.formData.newVersionNumber = 'v1.0'
        }
      }
    },

    getVersionStatusType(status) {
      const statusTypeMap = {
        '草稿': 'info',
        '待审批': 'warning',
        '生效': 'success',
        '历史': '',
        '驳回': 'danger',
        '已作废': 'info'
      }
      return statusTypeMap[status] || 'info'
    },

    async handleSubmit() {
      // 验证表单
      const valid = await new Promise((resolve) => {
        this.$refs.copyForm.validate((isValid) => {
          if (!isValid) {
            this.$message.warning('请完善必填项并检查输入格式')
          }
          resolve(isValid)
        })
      })

      if (!valid || this.submitting) {
        return
      }

      this.submitting = true
      this.errorMessage = ''

      try {
        // 调用复制接口
        const payload = {
          newTemplateCode: this.formData.newTemplateCode,
          newTemplateName: this.formData.newTemplateName || undefined,
          newVersionNumber: this.formData.newVersionNumber,
          copyFromVersionId: this.formData.copyFromVersionId
        }

        const response = await copyProcessTemplate(this.sourceTemplate.id, payload)

        // 使用后端返回的消息
        this.$message.success(response.message || MESSAGE_FALLBACKS.copyTemplate)

        // 通知父组件复制成功
        this.$emit('success', response.data)

        // 关闭对话框
        this.visibleProxy = false
      } catch (error) {
        console.error('[CopyTemplateDialog] submit failed', error)

        // 优先显示后端返回的错误消息
        const errorMsg = error?.response?.data?.error?.message || error?.message || '复制失败，请检查输入'

        this.errorMessage = errorMsg
        this.$message.error(errorMsg)
      } finally {
        this.submitting = false
      }
    },

    handleCancel() {
      this.visibleProxy = false
      this.$emit('cancel')
    },

    handleClose() {
      this.visibleProxy = false
      this.$emit('close')
    },

    resetForm() {
      this.formData = {
        newTemplateCode: '',
        newTemplateName: '',
        newVersionNumber: '',
        copyFromVersionId: ''
      }
      this.errorMessage = ''
      this.submitting = false

      // 清除验证状态
      this.$nextTick(() => {
        if (this.$refs.copyForm) {
          this.$refs.copyForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.copy-template-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px 30px;
  }
}

.field-hint {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.version-option {
  display: flex;
  align-items: center;
  line-height: 1.4;

  .version-number {
    font-weight: 600;
    color: #1f2d3d;
    font-size: 14px;
  }

  .version-desc {
    font-size: 12px;
    color: #909399;
    margin-left: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

