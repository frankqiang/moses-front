/**
 * 批量删除确认组件
 * 功能描述：封装删除确认逻辑、冲突检测和展示功能，提供统一的删除操作API
 * 创建日期：2024-01-10
 */
<template>
  <div>
    <!-- 确认删除对话框 -->
    <el-dialog
      :title="confirmTitle"
      :visible.sync="confirmDialogVisible"
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      append-to-body
      @close="handleConfirmCancel"
    >
      <div class="delete-confirm-content">
        <div class="confirm-header">
          <i class="el-icon-warning confirm-icon" />
          <div class="confirm-text">
            <h3>确认{{ actionName }}操作</h3>
            <p>{{ confirmMessage }}</p>
          </div>
        </div>

        <div v-if="previewItems.length > 0" class="confirm-details">
          <div class="preview-section">
            <h4>{{ actionName }}项目：</h4>
            <div class="preview-list">
              <div
                v-for="(item, index) in previewItems"
                :key="item[displayFields.id]"
                class="preview-item"
              >
                <span class="item-number">{{ index + 1 }}</span>
                <span class="item-code">{{ item[displayFields.code] }}</span>
                <span class="item-name">{{ item[displayFields.name] }}</span>
                <span class="item-status">待{{ actionName }}</span>
              </div>
              <div v-if="remainingCount > 0" class="remaining-count">
                等{{ remainingCount }}项...
              </div>
            </div>
          </div>
        </div>

        <div class="confirm-note">
          <i class="el-icon-info" />
          <span>此操作不可撤销，请确认后继续</span>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleConfirmCancel">取消</el-button>
        <el-button
          type="danger"
          :loading="loading"
          @click="handleConfirmDelete"
        >
          确定{{ actionName }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 冲突检测对话框 -->
    <el-dialog
      title="删除冲突"
      :visible.sync="conflictDialogVisible"
      width="900px"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
      append-to-body
      @close="handleConflictCancel"
    >
      <div class="conflict-content">
        <div class="conflict-header">
          <i class="el-icon-warning conflict-icon" />
          <div class="conflict-text">
            <h3>部分项目无法{{ actionName }}</h3>
            <p>发现 {{ conflictItems.length }} 个项目正在使用中{{ deletableItems.length > 0 ? `，${deletableItems.length} 个项目可安全${actionName}` : '' }}</p>
          </div>
        </div>

        <div class="conflict-details">
          <!-- 无法删除的项目 -->
          <div v-if="conflictItems.length > 0" class="blocked-section">
            <h4>无法{{ actionName }}的项目：</h4>
            <div class="conflict-list">
              <div
                v-for="(item, index) in conflictItems"
                :key="item[displayFields.id]"
                class="conflict-item blocked"
              >
                <span class="item-number">{{ index + 1 }}</span>
                <span class="item-code">{{ item[displayFields.code] }}</span>
                <span class="item-name">{{ item[displayFields.name] }}</span>
                <span class="item-status">{{ item.reason || '使用中' }}</span>
              </div>
            </div>
          </div>

          <!-- 可安全删除的项目 -->
          <div v-if="deletableItems.length > 0" class="allowed-section">
            <h4>可安全{{ actionName }}的项目：</h4>
            <div class="allowed-list">
              <div
                v-for="(item, index) in deletableItems"
                :key="item[displayFields.id]"
                class="allowed-item"
              >
                <span class="item-number">{{ index + 1 }}</span>
                <span class="item-code">{{ item[displayFields.code] }}</span>
                <span class="item-name">{{ item[displayFields.name] }}</span>
                <span class="item-status">可{{ actionName }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="conflict-note">
          <i class="el-icon-info" />
          <span>{{ deletableItems.length > 0 ? `您可以选择继续${actionName}可用的项目` : `所有项目都在使用中，无法${actionName}` }}</span>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleConflictCancel">取消</el-button>
        <el-button
          v-if="deletableItems.length > 0"
          type="danger"
          :loading="loading"
          @click="handleConflictConfirm"
        >
          仅{{ actionName }}可{{ actionName }}的项目
        </el-button>
        <el-button
          v-else
          @click="handleConflictCancel"
        >
          我知道了
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'BatchDeleteConfirm',
  props: {
    // 待删除的数据项（通过show方法传递，不需要required）
    items: {
      type: Array,
      required: false,
      default: () => []
    },
    // 删除API函数
    deleteApi: {
      type: Function,
      required: true
    },
    // 冲突检测函数
    conflictDetector: {
      type: Function,
      default: null
    },
    // 显示字段配置
    displayFields: {
      type: Object,
      default: () => ({
        id: 'id',
        code: 'code',
        name: 'name'
      })
    },
    // 确认对话框标题
    title: {
      type: String,
      default: '批量删除确认'
    },
    // 操作名称（用于提示文本）
    actionName: {
      type: String,
      default: '删除'
    }
  },
  data() {
    return {
      // 对话框显示状态
      confirmDialogVisible: false,
      conflictDialogVisible: false,

      // 数据状态
      currentItems: [],
      conflictItems: [],
      deletableItems: [],

      // 操作状态
      loading: false,
      isSuccessClose: false, // 标记是否为成功后关闭

      // 配置状态
      currentConfig: {}
    }
  },
  computed: {
    // 确认对话框标题
    confirmTitle() {
      return this.title
    },

    // 确认消息
    confirmMessage() {
      return `确定要${this.actionName}选中的 ${this.currentItems.length} 个项目吗？此操作不可撤销。`
    },

    // 预览项目（最多显示5项）
    previewItems() {
      return this.currentItems.slice(0, 5)
    },

    // 剩余项目数量
    remainingCount() {
      return Math.max(0, this.currentItems.length - 5)
    }
  },
  methods: {
    // 显示删除确认对话框
    async show(items) {
      try {
        this.currentItems = [...items]

        // 如果有冲突检测函数，先执行冲突检测
        if (this.conflictDetector) {
          await this.handleConflictDetection(items)
        } else {
          // 直接显示确认对话框
          this.confirmDialogVisible = true
        }
      } catch (error) {
        console.error('显示删除确认对话框失败:', error)
        this.$emit('delete-error', { error })
      }
    },

    // 隐藏对话框
    hide() {
      this.confirmDialogVisible = false
      this.conflictDialogVisible = false
      this.currentItems = []
      this.conflictItems = []
      this.deletableItems = []
      this.loading = false
      // 不在这里重置成功关闭标记，在事件处理函数中重置
    },

    // 执行删除操作
    async executeDelete(items) {
      try {
        this.loading = true
        const result = await this.deleteApi(items)

        if (result.success) {
          this.$emit('delete-success', {
            deletedCount: result.deletedCount || items.length,
            message: result.message || `${this.actionName}成功`
          })
          // 标记为成功关闭，避免触发取消事件
          this.isSuccessClose = true
          this.hide()
        } else {
          throw new Error(result.message || `${this.actionName}失败`)
        }
      } catch (error) {
        console.error(`${this.actionName}操作失败:`, error)
        this.$emit('delete-error', { error })
        // 确保在错误时也重置loading状态
        this.loading = false
      } finally {
        this.loading = false
      }
    },

    // 处理冲突检测
    async handleConflictDetection(items) {
      try {
        const result = await this.conflictDetector(items)

        if (result.hasConflicts) {
          this.conflictItems = result.conflicts || []
          this.deletableItems = result.canDelete || []
          this.$emit('conflict-detected', {
            conflicts: this.conflictItems,
            canDelete: this.deletableItems
          })
          this.conflictDialogVisible = true
        } else {
          // 无冲突，直接显示确认对话框
          this.confirmDialogVisible = true
        }
      } catch (error) {
        console.error('冲突检测失败:', error)
        // 检测失败时仍然显示确认对话框
        this.confirmDialogVisible = true
      }
    },

    // 格式化显示文本
    formatDisplayText(items) {
      if (!items || items.length === 0) return ''

      const displayItems = items.slice(0, 3).map(item =>
        `${item[this.displayFields.code]} - ${item[this.displayFields.name]}`
      ).join('、')

      const remaining = items.length - 3
      return remaining > 0 ? `${displayItems} 等${items.length}项` : displayItems
    },

    // 确认删除处理
    async handleConfirmDelete() {
      await this.executeDelete(this.currentItems)
    },

    // 取消确认处理
    handleConfirmCancel() {
      this.confirmDialogVisible = false
      this.loading = false // 重置loading状态
      
      // 使用 nextTick 确保在对话框关闭后处理
      this.$nextTick(() => {
        // 只有在非成功关闭时才发出取消事件
        if (!this.isSuccessClose) {
          this.$emit('delete-cancel')
        }
        
        // 重置成功关闭标记
        this.isSuccessClose = false
      })
    },

    // 冲突确认处理（仅删除可删除项）
    async handleConflictConfirm() {
      // executeDelete方法内部已经处理了isSuccessClose标记
      await this.executeDelete(this.deletableItems)
    },

    // 取消冲突处理
    handleConflictCancel() {
      this.conflictDialogVisible = false
      this.loading = false // 重置loading状态
      
      // 使用 nextTick 确保在对话框关闭后处理
      this.$nextTick(() => {
        // 只有在非成功关闭时才发出取消事件（与确认对话框保持一致）
        if (!this.isSuccessClose) {
          this.$emit('delete-cancel')
        }
        
        // 重置成功关闭标记
        this.isSuccessClose = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.delete-confirm-content {
  .confirm-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;

    .confirm-icon {
      color: #e6a23c;
      font-size: 24px;
      margin-right: 12px;
      margin-top: 2px;
    }

    .confirm-text {
      flex: 1;

      h3 {
        margin: 0 0 5px 0;
        font-size: 16px;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .confirm-details {
    margin-bottom: 20px;

    .preview-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #606266;
      }
    }

    .preview-list {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      max-height: 280px;
      overflow-y: auto;

      .preview-item {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #ebeef5;
        background: #f0f9ff;

        &:last-child {
          border-bottom: none;
        }

        .item-number {
          width: 30px;
          color: #909399;
          font-size: 12px;
          flex-shrink: 0;
        }

        .item-code {
          min-width: 120px;
          max-width: 200px;
          font-weight: 500;
          color: #409eff;
          flex-shrink: 0;
          margin-right: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
        }

        .item-name {
          flex: 1;
          color: #303133;
          margin-right: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-status {
          // width: 80px;
          text-align: right;
          font-size: 12px;
          color: #409eff;
          flex-shrink: 0;
        }
      }

      .remaining-count {
        padding: 10px 15px;
        color: #909399;
        font-size: 12px;
        text-align: center;
        border-bottom: 1px solid #ebeef5;
        background: #f9f9f9;

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }

  .confirm-note {
    padding: 10px 15px;
    background: #f4f4f5;
    border-radius: 4px;

    span {
      font-size: 13px;
      color: #606266;
    }
  }
}

.conflict-content {
  .conflict-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;

    .conflict-icon {
      color: #e6a23c;
      font-size: 24px;
      margin-right: 12px;
      margin-top: 2px;
    }

    .conflict-text {
      flex: 1;

      h3 {
        margin: 0 0 5px 0;
        font-size: 16px;
        color: #303133;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #606266;
      }
    }
  }

  .conflict-details {
    margin-bottom: 20px;

    .blocked-section, .allowed-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #606266;
      }
    }

    .conflict-list, .allowed-list {
      border: 1px solid #ebeef5;
      border-radius: 4px;
      max-height: 280px;
      overflow-y: auto;

      .conflict-item, .allowed-item {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .item-number {
          width: 30px;
          color: #909399;
          font-size: 12px;
          flex-shrink: 0;
        }

        .item-code {
          min-width: 120px;
          max-width: 200px;
          font-weight: 500;
          flex-shrink: 0;
          margin-right: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          word-break: break-all;
        }

        .item-name {
          flex: 1;
          color: #303133;
          margin-right: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-status {
          // width: 120px;
          text-align: right;
          font-size: 12px;
          flex-shrink: 0;
        }
      }

      .conflict-item {
        background: #fef0f0;

        .item-code {
          color: #f56c6c;
        }

        .item-status {
          color: #f56c6c;
        }
      }

      .allowed-item {
        background: #f0f9ff;

        .item-code {
          color: #67c23a;
        }

        .item-status {
          color: #67c23a;
        }
      }
    }
  }

  .conflict-note {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    background: #f4f4f5;
    border-radius: 4px;

    i {
      color: #909399;
      margin-right: 8px;
    }

    span {
      font-size: 13px;
      color: #606266;
    }
  }
}

.dialog-footer {
  text-align: right;

  .el-button + .el-button {
    margin-left: 10px;
  }
}
</style>
