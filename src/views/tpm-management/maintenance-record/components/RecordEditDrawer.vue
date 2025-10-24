<!--
  文件名称：RecordEditDrawer.vue
  文件描述：维护记录补充编辑抽屉组件，用于补充和完善维护记录信息
  创建日期：2025-01-23
  修改记录：
    - 2025-01-23: 初始创建，实现维护记录补充编辑功能
-->
<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    width="900px"
    :wrapper-closable="false"
    @open="handleDrawerOpen"
    @close="handleDrawerClose"
  >
    <!-- 加载状态 -->
    <div v-if="initialLoading" v-loading="initialLoading" class="loading-container" element-loading-text="加载中..." />

    <!-- 编辑表单 -->
    <el-form
      v-else
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      size="small"
    >
      <!-- 一、基本信息（只读展示） -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-info" />
          一、基本信息（只读）
        </div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="记录编码">
            <span class="code-text">{{ (recordData && recordData.recordCode) || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="维护日期">
            {{ formatDateTime(recordData && recordData.maintenanceDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="维护类型">
            <status-tag
              v-if="recordData && recordData.maintenanceType"
              :status="recordData.maintenanceType"
              :text-map="maintenanceTypeConfig.textMap"
              :type-map="maintenanceTypeConfig.typeMap"
              effect="light"
              size="small"
            />
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="设备">
            {{ (recordData && recordData.equipment && recordData.equipment.name) || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 二、维护内容补充 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-edit-outline" />
          二、维护内容补充
        </div>
        <el-form-item label="发现问题" prop="problemFound">
          <el-input
            v-model="formData.problemFound"
            type="textarea"
            :rows="4"
            placeholder="请描述维护过程中发现的问题（如有）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="处理措施" prop="solutionApplied">
          <el-input
            v-model="formData.solutionApplied"
            type="textarea"
            :rows="4"
            placeholder="请描述采取的处理措施（如有）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="下次维护建议" prop="nextMaintenanceSuggestion">
          <el-input
            v-model="formData.nextMaintenanceSuggestion"
            type="textarea"
            :rows="3"
            placeholder="请输入下次维护建议（如有）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="维护工时 (小时)" prop="workHours">
          <el-input-number
            v-model="formData.workHours"
            :min="0"
            :max="999.99"
            :precision="2"
            :step="0.5"
            controls-position="right"
            placeholder="请输入维护工时"
            style="width: 200px"
          />
          <span class="field-hint"> 精确到0.01小时</span>
        </el-form-item>

        <el-form-item label="维护后设备状态" prop="equipmentStatusAfter">
          <el-input
            v-model="formData.equipmentStatusAfter"
            type="textarea"
            :rows="3"
            placeholder="请描述维护后的设备状态"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 三、备件使用清单 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-box" />
          三、备件使用清单
        </div>
        <el-form-item label="备件清单" prop="sparePartsUsed">
          <div class="spare-parts-editor">
            <el-table
              :data="formData.sparePartsUsed"
              border
              stripe
              size="small"
              style="width: 100%"
              class="spare-parts-table"
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column label="备件编码" min-width="140">
                <template slot-scope="{ row, $index }">
                  <el-input
                    v-model="row.sparePartCode"
                    placeholder="备件编码"
                    size="small"
                    maxlength="50"
                    @blur="validateSparePartRow($index)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="备件名称" min-width="160">
                <template slot-scope="{ row, $index }">
                  <el-input
                    v-model="row.sparePartName"
                    placeholder="备件名称"
                    size="small"
                    maxlength="100"
                    @blur="validateSparePartRow($index)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="使用数量" width="140">
                <template slot-scope="{ row, $index }">
                  <el-input-number
                    v-model="row.quantity"
                    :min="1"
                    :max="9999"
                    :precision="0"
                    controls-position="right"
                    size="small"
                    placeholder="数量"
                    style="width: 100%"
                    @blur="validateSparePartRow($index)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" align="center">
                <template slot-scope="{ $index }">
                  <el-button
                    type="text"
                    size="small"
                    icon="el-icon-delete"
                    class="delete-btn"
                    @click="handleDeleteSparePart($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="spare-parts-actions">
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="small"
                plain
                @click="handleAddSparePart"
              >
                添加备件
              </el-button>
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- 四、附件上传 -->
      <div class="form-section">
        <div class="section-title">
          <i class="el-icon-paperclip" />
          四、附件上传
        </div>
        <el-form-item label="附件" prop="attachmentUrls">
          <div class="attachment-uploader">
            <!-- 附件列表 -->
            <div v-if="formData.attachmentUrls && formData.attachmentUrls.length" class="attachment-list">
              <el-card
                v-for="(attachment, index) in formData.attachmentUrls"
                :key="index"
                shadow="hover"
                class="attachment-item"
              >
                <div class="attachment-info">
                  <i class="el-icon-document" />
                  <div class="attachment-details">
                    <div class="attachment-name">{{ attachment.fileName || '未命名文件' }}</div>
                    <div class="attachment-type">{{ attachment.fileType || '-' }}</div>
                  </div>
                  <el-button
                    type="text"
                    icon="el-icon-delete"
                    class="delete-btn"
                    @click="handleDeleteAttachment(index)"
                  >
                    删除
                  </el-button>
                </div>
              </el-card>
            </div>

            <!-- 上传按钮 -->
            <el-upload
              ref="upload"
              class="upload-demo"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :file-list="fileList"
              :show-file-list="false"
              accept="image/*,.pdf,.doc,.docx"
              :limit="10"
              :on-exceed="handleExceed"
            >
              <el-button size="small" type="primary" plain icon="el-icon-upload">
                选择文件
              </el-button>
              <div slot="tip" class="el-upload__tip">
                支持上传图片（jpg、png等）或文档（pdf、doc、docx），单个文件不超过10MB，最多10个文件
              </div>
            </el-upload>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <!-- 底部操作按钮 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          保存
        </el-button>
      </div>
    </template>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import { getMaintenanceRecordById, updateMaintenanceRecord } from '../api'
import { MAINTENANCE_TYPE_CONFIG } from '../constants/maintenance-record'

export default {
  name: 'RecordEditDrawer',
  components: {
    BaseDrawer,
    StatusTag
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    recordId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      drawerVisible: false,
      initialLoading: false,
      submitting: false,
      recordData: null,
      formData: {
        problemFound: '',
        solutionApplied: '',
        nextMaintenanceSuggestion: '',
        workHours: null,
        equipmentStatusAfter: '',
        sparePartsUsed: [],
        attachmentUrls: []
      },
      formRules: {
        workHours: [
          { type: 'number', message: '工时必须为数字', trigger: 'blur' }
        ]
      },
      fileList: []
    }
  },
  computed: {
    drawerTitle() {
      if (this.recordData) {
        return `补充编辑 - ${this.recordData.recordCode || ''}`
      }
      return '补充编辑维护记录'
    },
    maintenanceTypeConfig() {
      return MAINTENANCE_TYPE_CONFIG
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.drawerVisible = val
      },
      immediate: true
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    /**
     * 抽屉打开回调
     */
    async handleDrawerOpen() {
      if (this.recordId) {
        await this.loadRecordDetail()
      }
    },

    /**
     * 抽屉关闭回调
     */
    handleDrawerClose() {
      this.resetForm()
      this.$emit('close')
    },

    /**
     * 加载维护记录详情
     */
    async loadRecordDetail() {
      if (!this.recordId) {
        this.$message.warning('缺少维护记录ID')
        return
      }

      this.initialLoading = true
      try {
        const response = await getMaintenanceRecordById(this.recordId)

        if (response.success && response.data) {
          this.recordData = response.data
          this.fillFormData(response.data)
        } else {
          this.$message.error(response.message || '获取维护记录详情失败')
          this.handleClose()
        }
      } catch (error) {
        console.error('加载维护记录详情失败:', error)

        let errorMessage = '获取维护记录详情失败'
        if (error.response) {
          const { status, data } = error.response
          if (status === 404) {
            errorMessage = (data && data.error && data.error.message) || '维护记录不存在'
          } else if (data && data.error && data.error.message) {
            errorMessage = data.error.message
          }
        }

        this.$message.error(errorMessage)
        this.handleClose()
      } finally {
        this.initialLoading = false
      }
    },

    /**
     * 填充表单数据
     */
    fillFormData(data) {
      this.formData.problemFound = data.problemFound || ''
      this.formData.solutionApplied = data.solutionApplied || ''
      this.formData.nextMaintenanceSuggestion = data.nextMaintenanceSuggestion || ''
      this.formData.workHours = data.workHours ? parseFloat(data.workHours) : null
      this.formData.equipmentStatusAfter = data.equipmentStatusAfter || ''

      // 深拷贝备件清单
      this.formData.sparePartsUsed = data.sparePartsUsed && data.sparePartsUsed.length > 0
        ? JSON.parse(JSON.stringify(data.sparePartsUsed))
        : []

      // 深拷贝附件列表
      this.formData.attachmentUrls = data.attachmentUrls && data.attachmentUrls.length > 0
        ? JSON.parse(JSON.stringify(data.attachmentUrls))
        : []
    },

    /**
     * 添加备件行
     */
    handleAddSparePart() {
      this.formData.sparePartsUsed.push({
        sparePartId: null,
        sparePartCode: '',
        sparePartName: '',
        quantity: 1
      })
    },

    /**
     * 删除备件行
     */
    handleDeleteSparePart(index) {
      this.$confirm('确定删除该备件记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.formData.sparePartsUsed.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {
        // 取消删除
      })
    },

    /**
     * 验证备件行
     */
    validateSparePartRow(index) {
      const row = this.formData.sparePartsUsed[index]
      if (row.sparePartCode || row.sparePartName || row.quantity > 1) {
        // 如果有任一字段有值，则其他必填字段也要有值
        if (!row.sparePartCode) {
          this.$message.warning(`第 ${index + 1} 行：备件编码不能为空`)
          return false
        }
        if (!row.sparePartName) {
          this.$message.warning(`第 ${index + 1} 行：备件名称不能为空`)
          return false
        }
        if (!row.quantity || row.quantity < 1) {
          this.$message.warning(`第 ${index + 1} 行：使用数量必须大于0`)
          return false
        }
      }
      return true
    },

    /**
     * 文件选择变化
     */
    handleFileChange(file, fileList) {
      // 验证文件大小
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error(`文件 ${file.name} 大小超过 10MB，请选择更小的文件`)
        return
      }

      // 模拟上传成功后的URL（实际项目中应调用上传接口获取真实URL）
      const mockUrl = `https://example.com/files/${Date.now()}-${file.name}`

      this.formData.attachmentUrls.push({
        url: mockUrl,
        fileName: file.name,
        fileType: file.raw.type
      })

      this.$message.success(`文件 ${file.name} 添加成功`)
      this.fileList = []
    },

    /**
     * 文件数量超限
     */
    handleExceed() {
      this.$message.warning('最多只能上传10个文件')
    },

    /**
     * 删除附件
     */
    handleDeleteAttachment(index) {
      this.$confirm('确定删除该附件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.formData.attachmentUrls.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {
        // 取消删除
      })
    },

    /**
     * 提交表单
     */
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (!valid) {
          this.$message.warning('请检查表单填写是否正确')
          return
        }

        // 验证备件清单
        const validSparePartsUsed = this.formData.sparePartsUsed.filter(row => {
          return row.sparePartCode && row.sparePartName && row.quantity > 0
        })

        // 检查是否至少提供了一个字段
        const hasChanges = this.formData.problemFound ||
          this.formData.solutionApplied ||
          this.formData.nextMaintenanceSuggestion ||
          this.formData.workHours !== null ||
          this.formData.equipmentStatusAfter ||
          validSparePartsUsed.length > 0 ||
          this.formData.attachmentUrls.length > 0

        if (!hasChanges) {
          this.$message.warning('请至少修改一个字段')
          return
        }

        this.submitting = true
        try {
          // 构建提交数据（只提交有值的字段）
          const submitData = {}

          if (this.formData.problemFound) {
            submitData.problemFound = this.formData.problemFound
          }
          if (this.formData.solutionApplied) {
            submitData.solutionApplied = this.formData.solutionApplied
          }
          if (this.formData.nextMaintenanceSuggestion) {
            submitData.nextMaintenanceSuggestion = this.formData.nextMaintenanceSuggestion
          }
          if (this.formData.workHours !== null && this.formData.workHours !== undefined) {
            submitData.workHours = this.formData.workHours
          }
          if (this.formData.equipmentStatusAfter) {
            submitData.equipmentStatusAfter = this.formData.equipmentStatusAfter
          }
          if (validSparePartsUsed.length > 0) {
            submitData.sparePartsUsed = validSparePartsUsed
          }
          if (this.formData.attachmentUrls.length > 0) {
            submitData.attachmentUrls = this.formData.attachmentUrls
          }

          const response = await updateMaintenanceRecord(this.recordId, submitData)

          if (response.success) {
            this.$message.success(response.message || '更新维护记录成功')
            this.$emit('success', response.data)
            this.handleClose()
          } else {
            this.$message.error(response.message || '更新维护记录失败')
          }
        } catch (error) {
          console.error('更新维护记录失败:', error)

          let errorMessage = '更新维护记录失败'
          if (error.response) {
            const { status, data } = error.response
            if (status === 400) {
              errorMessage = (data && data.error && data.error.message) || '请求参数验证失败'
            } else if (status === 404) {
              errorMessage = (data && data.error && data.error.message) || '维护记录不存在'
            } else if (data && data.error && data.error.message) {
              errorMessage = data.error.message
            }
          }

          this.$message.error(errorMessage)
        } finally {
          this.submitting = false
        }
      })
    },

    /**
     * 格式化日期时间
     */
    formatDateTime(value) {
      if (!value) {
        return '-'
      }
      try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) {
          return '-'
        }
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      } catch (error) {
        console.warn('格式化日期失败:', value, error)
        return '-'
      }
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.recordData = null
      this.formData = {
        problemFound: '',
        solutionApplied: '',
        nextMaintenanceSuggestion: '',
        workHours: null,
        equipmentStatusAfter: '',
        sparePartsUsed: [],
        attachmentUrls: []
      }
      this.fileList = []
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
    },

    /**
     * 关闭抽屉
     */
    handleClose() {
      this.drawerVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }

  .section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e4e7ed;

    i {
      margin-right: 8px;
      color: #409eff;
      font-size: 18px;
    }
  }
}

.code-text {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
  color: #303133;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

// 备件编辑器样式
.spare-parts-editor {
  width: 100%;

  .spare-parts-table {
    margin-bottom: 12px;

    .delete-btn {
      color: #f56c6c;

      &:hover {
        color: #f78989;
      }
    }
  }

  .spare-parts-actions {
    display: flex;
    justify-content: flex-start;
  }
}

// 附件上传器样式
.attachment-uploader {
  width: 100%;

  .attachment-list {
    margin-bottom: 16px;

    .attachment-item {
      margin-bottom: 12px;

      .attachment-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .el-icon-document {
          font-size: 32px;
          color: #409eff;
          flex-shrink: 0;
        }

        .attachment-details {
          flex: 1;
          min-width: 0;

          .attachment-name {
            font-weight: 500;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-bottom: 4px;
          }

          .attachment-type {
            font-size: 12px;
            color: #909399;
          }
        }

        .delete-btn {
          color: #f56c6c;

          &:hover {
            color: #f78989;
          }
        }
      }
    }
  }

  .upload-demo {
    .el-upload__tip {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      line-height: 1.5;
    }
  }
}

// 底部按钮样式
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// Element UI Descriptions 样式覆盖
::v-deep .el-descriptions {
  .el-descriptions-item__label {
    font-weight: 500;
    color: #606266;
    background: #fafafa;
  }

  .el-descriptions-item__content {
    color: #303133;
  }
}

// 表单样式
::v-deep .el-form {
  .el-form-item {
    margin-bottom: 18px;
  }

  .el-textarea__inner {
    font-family: inherit;
  }
}
</style>

