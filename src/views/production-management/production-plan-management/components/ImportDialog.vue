/**
 * 文件名称：ImportDialog.vue
 * 文件描述：生产计划批量导入对话框
 * 创建日期：2025-01-17
 * 修改记录：
 *   - 2025-01-17: 初始创建，实现P0阶段核心功能
 */

<template>
  <el-dialog
    :visible.sync="visible"
    title="批量导入生产计划"
    :close-on-click-modal="false"
    width="1000px"
    :before-close="handleBeforeClose"
    @close="handleClose"
  >
    <!-- 导入步骤指示器 -->
    <el-steps :active="currentStep" align-center finish-status="success" class="import-steps">
      <el-step title="上传文件" />
      <el-step title="数据预览" />
      <el-step title="导入处理" />
      <el-step title="查看结果" />
    </el-steps>

    <!-- 步骤1：文件上传区 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="upload-section">
        <el-upload
          ref="upload"
          class="upload-area"
          drag
          :action="uploadAction"
          :auto-upload="false"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :limit="1"
          accept=".xlsx,.xls"
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将Excel文件拖到此处，或<em>点击上传</em>
          </div>
          <div slot="tip" class="el-upload__tip">
            只能上传 .xlsx/.xls 文件，且不超过10MB
          </div>
        </el-upload>

        <div class="upload-actions">
          <el-button type="text" icon="el-icon-download" @click="downloadTemplate">
            下载导入模板
          </el-button>
        </div>

        <el-form label-width="140px" class="import-form">
          <el-form-item label="ERP同步批次令牌">
            <el-input
              v-model="importConfig.erpSyncBatchNo"
              placeholder="用于标识本次导入批次，便于追溯"
              maxlength="100"
              clearable
            />
          </el-form-item>
          <el-form-item label="导入时间">
            <el-date-picker
              v-model="importConfig.importTimestamp"
              type="datetime"
              placeholder="默认当前时间"
              format="yyyy-MM-dd HH:mm:ss"
              value-format="yyyy-MM-ddTHH:mm:ss.sssZ"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>

        <div v-if="selectedFile" class="file-info">
          <el-alert
            :title="`已选择文件：${selectedFile.name}（${formatFileSize(selectedFile.size)}）`"
            type="info"
            :closable="false"
          />
        </div>
      </div>
    </div>

    <!-- 步骤2：数据预览区 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="preview-section">
        <el-alert
          :title="`共解析${previewData.length}条记录，其中${validCount}条有效，${invalidCount}条无效`"
          :type="invalidCount > 0 ? 'warning' : 'success'"
          :closable="false"
          show-icon
          class="preview-summary"
        />

        <el-table
          :data="displayPreviewData"
          border
          stripe
          max-height="400"
          class="preview-table"
        >
          <el-table-column type="index" label="行号" width="60" fixed />
          <el-table-column label="状态" width="80" fixed>
            <template slot-scope="scope">
              <el-tag v-if="scope.row.valid" type="success" size="mini">
                <i class="el-icon-check" /> 有效
              </el-tag>
              <el-tag v-else type="danger" size="mini">
                <i class="el-icon-close" /> 无效
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="externalOrderNumber" label="外部订单号" width="150" />
          <el-table-column prop="productCode" label="产品编码" width="150" />
          <el-table-column prop="demandQuantity" label="需求数量" width="100" />
          <el-table-column prop="demandUnit" label="单位" width="80" />
          <el-table-column prop="plannedDeliveryDate" label="计划交期" width="150" />
          <el-table-column prop="customerName" label="客户名称" width="150" />
          <el-table-column prop="planPriority" label="优先级" width="100" />
          <el-table-column label="错误原因" min-width="200">
            <template slot-scope="scope">
              <span v-if="!scope.row.valid" class="error-message">
                {{ scope.row.errorMessage }}
              </span>
              <span v-else class="success-message">数据有效</span>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-if="previewData.length > pageSize"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="previewData.length"
          layout="total, prev, pager, next"
          class="preview-pagination"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 步骤3：导入进度 -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="progress-section">
        <el-progress
          :percentage="importProgress"
          :status="importStatus"
          :stroke-width="20"
        />
        <p class="progress-text">
          {{ importStatusText }}
        </p>
      </div>
    </div>

    <!-- 步骤4：导入结果 -->
    <div v-if="currentStep === 3" class="step-content">
      <div class="result-section">
        <!-- 结果摘要 -->
        <div class="result-summary">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-card shadow="hover">
                <div class="summary-item">
                  <div class="summary-icon total">
                    <i class="el-icon-document" />
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ importResult.total }}</div>
                    <div class="summary-label">总记录数</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <div class="summary-item">
                  <div class="summary-icon success">
                    <i class="el-icon-success" />
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ importResult.successCount }}</div>
                    <div class="summary-label">成功导入</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <div class="summary-item">
                  <div class="summary-icon failed">
                    <i class="el-icon-error" />
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ importResult.failedCount }}</div>
                    <div class="summary-label">导入失败</div>
                  </div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover">
                <div class="summary-item">
                  <div class="summary-icon skipped">
                    <i class="el-icon-warning" />
                  </div>
                  <div class="summary-content">
                    <div class="summary-value">{{ importResult.skippedCount }}</div>
                    <div class="summary-label">跳过记录</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 结果详情标签页 -->
        <el-tabs v-model="resultTab" class="result-tabs">
          <!-- 成功记录 -->
          <el-tab-pane label="成功记录" name="success">
            <el-table :data="importResult.successRecords" border stripe max-height="300">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="externalOrderNumber" label="外部订单号" width="150" />
              <el-table-column prop="planNumber" label="计划编号" width="150" />
              <el-table-column prop="productCode" label="产品编码" width="150" />
              <el-table-column prop="demandQuantity" label="需求数量" width="100" />
              <el-table-column prop="plannedDeliveryDate" label="计划交期" width="150" />
            </el-table>
          </el-tab-pane>

          <!-- 失败记录 -->
          <el-tab-pane label="失败记录" name="failed">
            <div v-if="importResult.failedRecords.length > 0" class="tab-actions">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-download"
                @click="exportFailedRecords"
              >
                导出失败记录
              </el-button>
            </div>
            <el-table :data="importResult.failedRecords" border stripe max-height="300">
              <el-table-column type="index" label="行号" width="60" />
              <el-table-column prop="externalOrderNumber" label="外部订单号" width="150" />
              <el-table-column prop="productCode" label="产品编码" width="150" />
              <el-table-column prop="failureReason" label="失败原因" min-width="250" />
            </el-table>
          </el-tab-pane>

          <!-- 跳过记录 -->
          <el-tab-pane label="跳过记录" name="skipped">
            <el-table :data="importResult.skippedRecords" border stripe max-height="300">
              <el-table-column type="index" label="行号" width="60" />
              <el-table-column prop="externalOrderNumber" label="外部订单号" width="150" />
              <el-table-column prop="productCode" label="产品编码" width="150" />
              <el-table-column prop="skipReason" label="跳过原因" min-width="250" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 对话框底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button v-if="currentStep > 0 && currentStep < 3" @click="handlePrevStep">
        上一步
      </el-button>
      <el-button @click="handleClose">
        {{ currentStep === 3 ? '关闭' : '取消' }}
      </el-button>
      <el-button
        v-if="currentStep === 0"
        type="primary"
        :disabled="!selectedFile"
        :loading="parseLoading"
        @click="handleParseFile"
      >
        解析文件
      </el-button>
      <el-button
        v-if="currentStep === 1"
        type="primary"
        :disabled="validCount === 0"
        :loading="importLoading"
        @click="handleStartImport"
      >
        开始导入（{{ validCount }}条有效记录）
      </el-button>
      <el-button
        v-if="currentStep === 3"
        type="success"
        @click="handleViewList"
      >
        查看计划列表
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import * as XLSX from 'xlsx'
import { importPlans } from '../api'

export default {
  name: 'ImportDialog',
  data() {
    return {
      visible: false,
      currentStep: 0,
      parseLoading: false,
      importLoading: false,

      // 文件上传
      uploadAction: '', // 不需要实际上传地址，使用本地解析
      selectedFile: null,

      // 导入配置
      importConfig: {
        erpSyncBatchNo: '',
        importTimestamp: null
      },

      // 数据预览
      previewData: [],
      currentPage: 1,
      pageSize: 10,

      // 导入进度
      importProgress: 0,
      importStatus: '',
      importStatusText: '准备导入...',

      // 导入结果
      resultTab: 'success',
      importResult: {
        total: 0,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0,
        successRecords: [],
        failedRecords: [],
        skippedRecords: []
      }
    }
  },
  computed: {
    /**
     * 当前页显示的预览数据
     */
    displayPreviewData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.previewData.slice(start, end)
    },

    /**
     * 有效记录数
     */
    validCount() {
      return this.previewData.filter(item => item.valid).length
    },

    /**
     * 无效记录数
     */
    invalidCount() {
      return this.previewData.filter(item => !item.valid).length
    }
  },
  methods: {
    /**
     * 打开对话框
     */
    open() {
      this.visible = true
      this.resetDialog()
    },

    /**
     * 关闭对话框前的确认
     */
    handleBeforeClose(done) {
      if (this.currentStep === 2 && this.importProgress < 100) {
        this.$confirm('导入正在进行中，确认要取消吗？', '提示', {
          type: 'warning'
        }).then(() => {
          done()
        }).catch(() => {})
      } else {
        done()
      }
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      if (this.currentStep === 3 && this.importResult.successCount > 0) {
        // 如果有成功导入的记录，通知父组件刷新列表
        this.$emit('success')
      }
      this.visible = false
      this.resetDialog()
    },

    /**
     * 重置对话框
     */
    resetDialog() {
      this.currentStep = 0
      this.selectedFile = null
      this.importConfig = {
        erpSyncBatchNo: '',
        importTimestamp: null
      }
      this.previewData = []
      this.currentPage = 1
      this.importProgress = 0
      this.importStatus = ''
      this.importStatusText = '准备导入...'
      this.resultTab = 'success'
      this.importResult = {
        total: 0,
        successCount: 0,
        failedCount: 0,
        skippedCount: 0,
        successRecords: [],
        failedRecords: [],
        skippedRecords: []
      }

      // 清空上传组件
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },

    /**
     * 下载导入模板
     */
    downloadTemplate() {
      // 创建模板数据
      const templateData = [
        {
          '外部订单号': 'ERP-ORDER-20250117-001',
          '产品编码': 'AF-1060-O-0.05X500',
          '需求数量': 1500.5,
          '需求单位': 'KG',
          '计划交期': '2025-02-15 00:00:00',
          '客户名称': '上海某某有限公司',
          '客户编码': 'CUST-SH-001',
          '计划优先级': 'HIGH',
          '特殊要求': '需要无油表面处理',
          '工艺模板ID': ''
        }
      ]

      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(templateData)

      // 设置列宽
      ws['!cols'] = [
        { wch: 25 }, // 外部订单号
        { wch: 20 }, // 产品编码
        { wch: 12 }, // 需求数量
        { wch: 10 }, // 需求单位
        { wch: 20 }, // 计划交期
        { wch: 20 }, // 客户名称
        { wch: 15 }, // 客户编码
        { wch: 12 }, // 计划优先级
        { wch: 30 }, // 特殊要求
        { wch: 36 } // 工艺模板ID
      ]

      XLSX.utils.book_append_sheet(wb, ws, '生产计划导入模板')

      // 下载文件
      XLSX.writeFile(wb, '生产计划导入模板.xlsx')
    },

    /**
     * 文件选择变化
     */
    handleFileChange(file) {
      this.selectedFile = file.raw
    },

    /**
     * 上传前的文件验证
     */
    beforeUpload(file) {
      // 文件类型检查
      const isExcel = file.type === 'application/vnd.ms-excel' ||
                     file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      if (!isExcel) {
        this.$message.error('只能上传Excel文件（.xlsx/.xls）')
        return false
      }

      // 文件大小检查（10MB）
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB')
        return false
      }

      return false // 阻止自动上传
    },

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    },

    /**
     * 解析Excel文件
     */
    async handleParseFile() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择要导入的Excel文件')
        return
      }

      try {
        this.parseLoading = true

        // 读取文件
        const data = await this.readFile(this.selectedFile)
        const workbook = XLSX.read(data, { type: 'binary' })

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          this.$message.error('Excel文件中没有数据')
          return
        }

        // 验证和转换数据
        this.previewData = jsonData.map((row, index) => {
          const record = this.validateAndTransformRow(row, index + 2) // 从第2行开始（表头为第1行）
          return record
        })

        // 进入下一步
        this.currentStep = 1

        this.$message.success(`成功解析${jsonData.length}条记录`)
      } catch (error) {
        console.error('解析文件失败:', error)
        this.$message.error('解析文件失败：' + error.message)
      } finally {
        this.parseLoading = false
      }
    },

    /**
     * 读取文件
     */
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve(e.target.result)
        }
        reader.onerror = reject
        reader.readAsBinaryString(file)
      })
    },

    /**
     * 验证并转换一行数据
     */
    validateAndTransformRow(row, rowNumber) {
      const errors = []
      const record = {
        rowNumber,
        valid: true,
        errorMessage: '',
        externalOrderNumber: row['外部订单号'] || '',
        productCode: row['产品编码'] || '',
        demandQuantity: row['需求数量'] || null,
        demandUnit: row['需求单位'] || '',
        plannedDeliveryDate: row['计划交期'] || '',
        customerName: row['客户名称'] || '',
        customerCode: row['客户编码'] || '',
        planPriority: row['计划优先级'] || 'NORMAL',
        specificRequirements: row['特殊要求'] || '',
        defaultProcessTemplateId: row['工艺模板ID'] || ''
      }

      // 必填字段校验
      if (!record.externalOrderNumber) {
        errors.push('外部订单号不能为空')
      }
      if (!record.productCode) {
        errors.push('产品编码不能为空')
      }
      if (!record.demandQuantity || record.demandQuantity <= 0) {
        errors.push('需求数量必须大于0')
      }
      if (!record.demandUnit) {
        errors.push('需求单位不能为空')
      }
      if (!record.plannedDeliveryDate) {
        errors.push('计划交期不能为空')
      }

      // 格式校验
      if (record.demandQuantity && !this.isValidNumber(record.demandQuantity, 3)) {
        errors.push('需求数量格式错误（最多3位小数）')
      }

      // 日期格式校验和转换
      if (record.plannedDeliveryDate) {
        try {
          const date = this.parseDate(record.plannedDeliveryDate)
          if (date < new Date()) {
            errors.push('计划交期不得早于当前日期')
          }
          record.plannedDeliveryDate = date.toISOString()
        } catch (error) {
          errors.push('计划交期格式错误')
        }
      }

      // 优先级校验
      const validPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
      if (record.planPriority && !validPriorities.includes(record.planPriority.toUpperCase())) {
        errors.push('计划优先级无效（应为LOW/NORMAL/HIGH/URGENT）')
      } else {
        record.planPriority = record.planPriority.toUpperCase()
      }

      // 需求单位校验和转换
      const validUnits = ['KG', 'TON', 'ROLL', 'PCS']
      if (record.demandUnit && !validUnits.includes(record.demandUnit.toUpperCase())) {
        errors.push('需求单位无效（应为KG/TON/ROLL/PCS）')
      } else {
        record.demandUnit = record.demandUnit.toUpperCase()
      }

      // 设置验证结果
      if (errors.length > 0) {
        record.valid = false
        record.errorMessage = errors.join('；')
      }

      return record
    },

    /**
     * 验证数字精度
     */
    isValidNumber(value, maxDecimals) {
      if (isNaN(value)) return false
      const str = value.toString()
      const decimalIndex = str.indexOf('.')
      if (decimalIndex === -1) return true
      return str.length - decimalIndex - 1 <= maxDecimals
    },

    /**
     * 解析日期
     */
    parseDate(dateStr) {
      // 支持多种日期格式
      const formats = [
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // YYYY-MM-DD HH:mm:ss
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{4}\/\d{2}\/\d{2}$/ // YYYY/MM/DD
      ]

      let parsedDate

      // Excel日期序列号（数字）
      if (typeof dateStr === 'number') {
        parsedDate = XLSX.SSF.parse_date_code(dateStr)
        return new Date(parsedDate.y, parsedDate.m - 1, parsedDate.d)
      }

      // 字符串日期
      const str = dateStr.toString().trim()
      for (const format of formats) {
        if (format.test(str)) {
          parsedDate = new Date(str.replace(' ', 'T'))
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate
          }
        }
      }

      throw new Error('无效的日期格式')
    },

    /**
     * 分页变化
     */
    handlePageChange(page) {
      this.currentPage = page
    },

    /**
     * 开始导入
     */
    async handleStartImport() {
      if (this.validCount === 0) {
        this.$message.warning('没有有效的记录可以导入')
        return
      }

      try {
        this.importLoading = true
        this.currentStep = 2
        this.importProgress = 0
        this.importStatus = ''
        this.importStatusText = '正在导入...'

        // 过滤出有效记录
        const validRecords = this.previewData.filter(item => item.valid).map(item => ({
          externalOrderNumber: item.externalOrderNumber,
          productCode: item.productCode,
          demandQuantity: item.demandQuantity,
          demandUnit: item.demandUnit,
          plannedDeliveryDate: item.plannedDeliveryDate,
          customerName: item.customerName || undefined,
          customerCode: item.customerCode || undefined,
          planPriority: item.planPriority,
          specificRequirements: item.specificRequirements || undefined,
          defaultProcessTemplateId: item.defaultProcessTemplateId || undefined
        }))

        // 构建请求数据
        const requestData = {
          plans: validRecords,
          erpSyncBatchNo: this.importConfig.erpSyncBatchNo || undefined,
          importTimestamp: this.importConfig.importTimestamp || new Date().toISOString()
        }

        // 模拟进度更新（实际应该通过WebSocket或轮询获取）
        const progressInterval = setInterval(() => {
          if (this.importProgress < 90) {
            this.importProgress += 10
            this.importStatusText = `正在导入第${Math.floor(this.importProgress / 100 * validRecords.length)}/${validRecords.length}条记录...`
          }
        }, 500)

        // 调用导入接口
        const response = await importPlans(requestData)

        clearInterval(progressInterval)

        // 更新进度为100%
        this.importProgress = 100
        this.importStatus = 'success'
        this.importStatusText = '导入完成！'

        // 解析结果
        if (response.success && response.data) {
          this.importResult = {
            total: response.data.total || validRecords.length,
            successCount: response.data.successCount || 0,
            failedCount: response.data.failedCount || 0,
            skippedCount: response.data.skippedCount || 0,
            successRecords: response.data.successRecords || [],
            failedRecords: response.data.failedRecords || [],
            skippedRecords: response.data.skippedRecords || []
          }
        }

        // 延迟进入结果页面
        setTimeout(() => {
          this.currentStep = 3
          this.$message.success(response.message || '导入完成')
        }, 1000)
      } catch (error) {
        console.error('导入失败:', error)
        this.importProgress = 100
        this.importStatus = 'exception'
        this.importStatusText = '导入失败：' + (error.message || '未知错误')

        this.$message.error(error.response?.data?.error?.message || error.message || '导入失败')

        // 延迟后允许返回上一步
        setTimeout(() => {
          this.currentStep = 1
        }, 2000)
      } finally {
        this.importLoading = false
      }
    },

    /**
     * 上一步
     */
    handlePrevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },

    /**
     * 导出失败记录
     */
    exportFailedRecords() {
      if (this.importResult.failedRecords.length === 0) {
        this.$message.warning('没有失败记录可以导出')
        return
      }

      // 添加失败原因列
      const exportData = this.importResult.failedRecords.map(record => ({
        '外部订单号': record.externalOrderNumber,
        '产品编码': record.productCode,
        '需求数量': record.demandQuantity,
        '需求单位': record.demandUnit,
        '计划交期': record.plannedDeliveryDate,
        '客户名称': record.customerName,
        '客户编码': record.customerCode,
        '计划优先级': record.planPriority,
        '特殊要求': record.specificRequirements,
        '工艺模板ID': record.defaultProcessTemplateId,
        '失败原因': record.failureReason
      }))

      // 创建工作簿
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // 设置列宽
      ws['!cols'] = [
        { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 20 },
        { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 36 }, { wch: 40 }
      ]

      XLSX.utils.book_append_sheet(wb, ws, '失败记录')

      // 下载文件
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      XLSX.writeFile(wb, `生产计划导入失败记录_${timestamp}.xlsx`)

      this.$message.success('导出成功')
    },

    /**
     * 查看计划列表
     */
    handleViewList() {
      this.handleClose()
      // 通知父组件跳转到列表页
      this.$emit('view-list')
    }
  }
}
</script>

<style lang="scss" scoped>
.import-steps {
  margin-bottom: 30px;
}

.step-content {
  min-height: 400px;
  padding: 20px 0;
}

// 上传区域
.upload-section {
  .upload-area {
    ::v-deep .el-upload-dragger {
      width: 100%;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .el-icon-upload {
      font-size: 67px;
      color: #C0C4CC;
      margin-bottom: 16px;
    }
  }

  .upload-actions {
    margin-top: 20px;
    text-align: center;
  }

  .import-form {
    margin-top: 30px;
  }

  .file-info {
    margin-top: 20px;
  }
}

// 预览区域
.preview-section {
  .preview-summary {
    margin-bottom: 20px;
  }

  .preview-table {
    margin-bottom: 20px;

    .error-message {
      color: #f56c6c;
    }

    .success-message {
      color: #67c23a;
    }
  }

  .preview-pagination {
    text-align: center;
  }
}

// 进度区域
.progress-section {
  padding: 60px 40px;
  text-align: center;

  .progress-text {
    margin-top: 20px;
    font-size: 16px;
    color: #606266;
  }
}

// 结果区域
.result-section {
  .result-summary {
    margin-bottom: 30px;

    .summary-item {
      display: flex;
      align-items: center;

      .summary-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: white;
        margin-right: 15px;

        &.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.success {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        }

        &.failed {
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
        }

        &.skipped {
          background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
        }
      }

      .summary-content {
        flex: 1;

        .summary-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
        }

        .summary-label {
          font-size: 14px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }

  .result-tabs {
    .tab-actions {
      margin-bottom: 10px;
      text-align: right;
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>

