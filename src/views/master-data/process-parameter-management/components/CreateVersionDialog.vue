<!--
文件名称：CreateVersionDialog.vue
文件描述：创建新版本对话框，基于现有模板创建新版本
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建，完成TASK06 P0阶段第3项任务
-->

<template>
  <el-dialog
    :visible.sync="visibleProxy"
    title="创建新版本"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="600px"
    class="create-version-dialog"
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
        <strong>模板：</strong>{{ sourceTemplate.templateCode }} - {{ sourceTemplate.templateName }}
      </div>
    </el-alert>

    <el-form
      ref="versionForm"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      size="medium"
      :disabled="submitting"
      @submit.native.prevent
    >
      <el-form-item label="新版本号" prop="newVersionNumber">
        <el-input
          v-model="formData.newVersionNumber"
          placeholder="请输入新版本号，如：v2.0"
          maxlength="20"
          show-word-limit
          clearable
        />
        <small class="field-hint">
          推荐格式：v主版本.次版本（如 v1.0, v2.1），必须唯一
        </small>
      </el-form-item>

      <el-form-item label="版本描述" prop="versionDescription">
        <el-input
          v-model="formData.versionDescription"
          type="textarea"
          :rows="3"
          placeholder="请输入版本描述，如：优化第3段参数、提升退火效率等"
          maxlength="2000"
          show-word-limit
        />
        <small class="field-hint">
          建议说明本次版本的主要变更内容，便于后续查阅
        </small>
      </el-form-item>

      <el-form-item label="复制源版本" prop="copyFromVersionId">
        <el-select
          v-model="formData.copyFromVersionId"
          placeholder="选择要复制的版本（默认为最新版本）"
          style="width: 100%;"
          filterable
          clearable
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
              <span v-if="version.isLatestVersion" class="latest-badge">
                最新
              </span>
              <span v-if="version.versionDescription" class="version-desc">
                {{ version.versionDescription }}
              </span>
            </div>
          </el-option>
        </el-select>
        <small class="field-hint">
          不选择则默认复制最新版本的所有参数配置
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
        <strong>温馨提示：</strong>新版本将复制源版本的所有工艺参数配置，初始状态为"草稿"。创建成功后可在版本列表中找到该版本并进行编辑、提交审批等操作。
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
        {{ submitting ? '创建中...' : '确认创建' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createNewVersion } from '../api'
import { MESSAGE_FALLBACKS } from '../constants/messages-config'

export default {
  name: 'CreateVersionDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    sourceTemplate: {
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
        newVersionNumber: '',
        versionDescription: '',
        copyFromVersionId: ''
      },
      formRules: {
        newVersionNumber: [
          { required: true, message: '请输入新版本号', trigger: 'blur' },
          { min: 2, max: 20, message: '版本号长度应在 2-20 个字符之间', trigger: 'blur' },
          {
            pattern: /^v\d+\.\d+$/,
            message: '版本号格式应为 v主版本.次版本（如 v1.0）',
            trigger: 'blur'
          }
        ],
        versionDescription: [
          { max: 2000, message: '版本描述不能超过2000个字符', trigger: 'blur' }
        ]
      }
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

      // 自动生成新版本号建议值
      if (this.availableVersions && this.availableVersions.length) {
        // 找到最新版本
        const latestVersion = this.availableVersions.find(v => v.isLatestVersion) || this.availableVersions[0]

        if (latestVersion && latestVersion.versionNumber) {
          const versionMatch = latestVersion.versionNumber.match(/^v(\d+)\.(\d+)$/)
          if (versionMatch) {
            const major = parseInt(versionMatch[1])
            const minor = parseInt(versionMatch[2])
            // 次版本号+1
            this.formData.newVersionNumber = `v${major}.${minor + 1}`
          } else {
            this.formData.newVersionNumber = 'v1.0'
          }
        }

        // 默认不选择源版本（接口会自动使用最新版本）
        this.formData.copyFromVersionId = ''
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
        this.$refs.versionForm.validate((isValid) => {
          if (!isValid) {
            this.$message.warning('请完善必填项并检查输入格式')
          }
          resolve(isValid)
        })
      })

      if (!valid || this.submitting) {
        return
      }

      if (!this.sourceTemplate || !this.sourceTemplate.id) {
        this.$message.error('缺少模板信息')
        return
      }

      this.submitting = true
      this.errorMessage = ''

      try {
        // 调用创建新版本接口
        const payload = {
          newVersionNumber: this.formData.newVersionNumber,
          versionDescription: this.formData.versionDescription || undefined,
          copyFromVersionId: this.formData.copyFromVersionId || undefined
        }

        const response = await createNewVersion(this.sourceTemplate.id, payload)

        // 使用后端返回的消息
        this.$message.success(response.message || MESSAGE_FALLBACKS.createVersion)

        // 通知父组件创建成功
        this.$emit('success', {
          templateId: this.sourceTemplate.id,
          versionId: response.data.id,
          version: response.data
        })

        // 关闭对话框
        this.visibleProxy = false
      } catch (error) {
        console.error('[CreateVersionDialog] submit failed', error)

        // 优先显示后端返回的错误消息
        const errorMsg = error?.response?.data?.error?.message || error?.message || '创建新版本失败，请检查输入'

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
        newVersionNumber: '',
        versionDescription: '',
        copyFromVersionId: ''
      }
      this.errorMessage = ''
      this.submitting = false

      // 清除验证状态
      this.$nextTick(() => {
        if (this.$refs.versionForm) {
          this.$refs.versionForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.create-version-dialog {
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

  .latest-badge {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 8px;
    background: #f56c6c;
    color: #ffffff;
    font-size: 12px;
    border-radius: 10px;
    font-weight: 500;
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

