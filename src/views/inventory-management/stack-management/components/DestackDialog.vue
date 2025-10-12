/**
 * 文件名称：DestackDialog.vue
 * 文件描述：拆垛确认对话框组件
 * 创建日期：2025-01-10
 * 修改记录：
 *   - 2025-01-10: 初始创建，实现拆垛确认功能
 */

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="拆垛确认"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <!-- 料垛信息展示 -->
    <div class="stack-info-section">
      <el-alert
        title="料垛基本信息"
        type="info"
        :closable="false"
        show-icon
      >
        <template slot="default">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">料垛编号：</span>
              <span class="value">{{ stackInfo.stackCode || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">料框数量：</span>
              <span class="value highlight">{{ stackInfo.binCount || 0 }} 个</span>
            </div>
            <div class="info-item">
              <span class="label">堆叠层数：</span>
              <span class="value">{{ stackInfo.stackLayers || 0 }} 层</span>
            </div>
            <div class="info-item">
              <span class="label">总重量：</span>
              <span class="value">{{ stackInfo.totalWeight || 0 }} kg</span>
            </div>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 拆垛影响提示 -->
    <div class="warning-section">
      <el-alert
        title="拆垛操作影响提示"
        type="warning"
        :closable="false"
        show-icon
      >
        <template slot="default">
          <ul class="impact-list">
            <li>拆垛后，料垛状态将变更为"已拆垛"</li>
            <li>拆垛后，{{ stackInfo.binCount }} 个成员料框将恢复独立状态</li>
            <li>拆垛后，料框的料垛关联关系（stackId）将被清空</li>
            <li>拆垛操作将记录拆垛时间和操作员信息</li>
            <li><strong>拆垛操作不可逆，请谨慎操作</strong></li>
          </ul>
        </template>
      </el-alert>
    </div>

    <!-- 拆垛原因表单 -->
    <el-form
      ref="destackForm"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="destack-form"
    >
      <el-form-item label="拆垛原因" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="4"
          placeholder="请输入拆垛原因（可选，建议填写以便追溯，最多500字符）"
          maxlength="500"
          show-word-limit
        />
        <div class="form-item-tip">
          <i class="el-icon-info" />
          拆垛原因为可选项，建议填写以便后续追溯
        </div>
      </el-form-item>
    </el-form>

    <!-- 底部操作按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">
        取消
      </el-button>
      <el-button
        type="danger"
        :loading="submitting"
        @click="handleConfirm"
      >
        <i class="el-icon-warning" />
        确认拆垛
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { destackStack } from '../api'

export default {
  name: 'DestackDialog',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stack: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      dialogVisible: false,
      submitting: false,
      formData: {
        remarks: ''
      },
      formRules: {
        remarks: [
          { max: 500, message: '拆垛原因最多500字符', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    // 料垛信息
    stackInfo() {
      return {
        stackCode: this.stack?.stackCode,
        binCount: this.stack?.binCount,
        stackLayers: this.stack?.stackLayers,
        totalWeight: this.stack?.totalWeight
      }
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
      },
      immediate: true
    },

    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },

  methods: {
    /**
     * 确认拆垛
     */
    handleConfirm() {
      this.$refs.destackForm.validate(async(valid) => {
        if (!valid) return

        // 二次确认
        try {
          await this.$confirm(
            `确定要拆垛"${this.stackInfo.stackCode}"吗？拆垛后将影响 ${this.stackInfo.binCount} 个料框，且操作不可逆！`,
            '拆垛确认',
            {
              type: 'warning',
              confirmButtonText: '确认拆垛',
              cancelButtonText: '取消',
              confirmButtonClass: 'el-button--danger'
            }
          )
        } catch {
          return
        }

        this.submitting = true

        try {
          const data = {}

          // 拆垛原因（可选）
          if (this.formData.remarks) {
            data.remarks = this.formData.remarks
          }

          const response = await destackStack(this.stack.id, data)

          if (response.success) {
            // 显示成功消息，包含拆垛的料框数量
            const message = response.message || '拆垛成功'
            const destackedBinCount = response.data?.destackedBinCount || 0
            const isFullDestack = response.data?.isFullDestack !== false

            if (isFullDestack) {
              this.$message.success(`${message}，共拆解 ${destackedBinCount} 个料框`)
            } else {
              const remainingBinCount = response.data?.remainingBinCount || 0
              this.$message.success(`${message}，已拆解 ${destackedBinCount} 个料框，剩余 ${remainingBinCount} 个`)
            }

            this.$emit('destacked', response.data)
            this.handleClose()
          }
        } catch (error) {
          console.error('拆垛失败:', error)
          // 错误处理由request拦截器统一处理，显示后端返回的error.message
        } finally {
          this.submitting = false
        }
      })
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.handleClose()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      // 重置表单
      this.$refs.destackForm?.resetFields()
      this.formData.remarks = ''
      this.submitting = false

      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.stack-info-section {
  margin-bottom: 20px;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-top: 12px;

    .info-item {
      display: flex;
      align-items: center;

      .label {
        font-weight: 500;
        color: #606266;
        margin-right: 8px;
      }

      .value {
        color: #303133;

        &.highlight {
          color: #409eff;
          font-weight: 600;
          font-size: 16px;
        }
      }
    }
  }
}

.warning-section {
  margin-bottom: 20px;

  .impact-list {
    margin: 12px 0 0 0;
    padding-left: 20px;

    li {
      line-height: 1.8;
      color: #606266;
      margin-bottom: 4px;

      strong {
        color: #e6a23c;
      }
    }
  }
}

.destack-form {
  .form-item-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;

    i {
      margin-right: 4px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

