/**
 * 导入按钮组件
 * 功能描述：提供通用的数据导入功能，支持文件上传、模板下载和结果展示
 * 创建日期：2023-12-10
 */
<template>
  <div class="import-button-container">
    <!-- 触发按钮 -->
    <el-button
      :type="type"
      :size="size"
      :disabled="disabled || loading"
      @click="showImportDialog"
    >
      <i :class="icon" v-if="icon"></i>
      <span>{{ text }}</span>
    </el-button>
    
    <!-- 导入对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      :width="dialogWidth"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <div v-if="!importResult" class="import-container">
        <!-- 上传区域 -->
        <el-upload
          class="upload-area"
          drag
          action="#"
          :auto-upload="false"
          :show-file-list="showFileList"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :multiple="false"
          :accept="acceptTypes"
          :disabled="loading"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">
            {{ fileTypeTip }}
            <el-link 
              v-if="templateApi" 
              type="primary" 
              :underline="false" 
              @click.stop="downloadTemplate"
            >
              {{ templateText }}
            </el-link>
          </div>
        </el-upload>
        
        <!-- 已选择的文件信息 -->
        <div v-if="selectedFile" class="file-info">
          <span>已选择文件: {{ selectedFile.name }}</span>
          <el-button type="text" icon="el-icon-delete" @click="selectedFile = null">移除</el-button>
        </div>
        
        <!-- 导入说明 -->
        <div class="import-tips">
          <div class="tips-title">
            <i class="el-icon-info" style="color: #E6A23C;"></i>
            {{ tipTitle }}
          </div>
          <slot name="tips">
            <ol>
              <li>请先下载导入模板，按照模板格式填写数据</li>
              <li>所有标有*的字段为必填项</li>
              <li>编码字段不能重复</li>
              <li>数据格式需符合系统要求，详见模板中的说明</li>
            </ol>
          </slot>
        </div>
      </div>
      
      <!-- 导入结果展示 -->
      <div v-else class="import-result">
        <el-result
          :icon="importResult.success === importResult.total ? 'success' : 'warning'"
          :title="getResultTitle()"
          :sub-title="getResultSubTitle()"
        >
          <template slot="extra">
            <el-button type="primary" @click="resetImport">继续导入</el-button>
            <el-button @click="handleDialogClose">关闭</el-button>
          </template>
          
          <!-- 失败数据展示 -->
          <div v-if="importResult.fail > 0 && importResult.errors" class="error-list">
            <div class="error-title">失败详情：</div>
            <el-table
              :data="importResult.errors"
              max-height="300"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column type="index" label="#" width="50" />
              <el-table-column v-if="showRowNumber" prop="row" label="行号" width="80" />
              <el-table-column prop="message" label="错误原因" min-width="250" />
            </el-table>
          </div>
        </el-result>
      </div>
      
      <div slot="footer" class="dialog-footer" v-if="!importResult">
        <el-button @click="handleDialogClose">{{ cancelText }}</el-button>
        <el-button 
          type="primary" 
          @click="submitImport" 
          :loading="loading" 
          :disabled="!selectedFile"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ImportButton',
  props: {
    // 导入API方法
    importApi: {
      type: Function,
      required: true
    },
    // 模板下载API方法
    templateApi: {
      type: Function,
      default: null
    },
    // 按钮文本
    text: {
      type: String,
      default: '导入'
    },
    // 按钮图标
    icon: {
      type: String,
      default: 'el-icon-upload2'
    },
    // 按钮类型
    type: {
      type: String,
      default: 'primary'
    },
    // 按钮大小
    size: {
      type: String,
      default: 'small'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 对话框标题
    dialogTitle: {
      type: String,
      default: '导入数据'
    },
    // 对话框宽度
    dialogWidth: {
      type: String,
      default: '550px'
    },
    // 是否显示文件列表
    showFileList: {
      type: Boolean,
      default: false
    },
    // 接受的文件类型
    acceptTypes: {
      type: String,
      default: '.xlsx,.xls'
    },
    // 文件类型提示
    fileTypeTip: {
      type: String,
      default: '只能上传Excel文件(xlsx/xls)，且不超过10MB'
    },
    // 模板下载按钮文本
    templateText: {
      type: String,
      default: '下载模板'
    },
    // 确认按钮文本
    confirmText: {
      type: String,
      default: '开始导入'
    },
    // 取消按钮文本
    cancelText: {
      type: String,
      default: '取消'
    },
    // 导入提示标题
    tipTitle: {
      type: String,
      default: '导入说明：'
    },
    // 最大文件大小（MB）
    maxFileSize: {
      type: Number,
      default: 10
    },
    // 是否在错误表格中显示行号
    showRowNumber: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // 对话框可见性
      dialogVisible: false,
      // 加载状态
      loading: false,
      // 选中的文件
      selectedFile: null,
      // 导入结果
      importResult: null
    }
  },
  methods: {
    // 显示导入对话框
    showImportDialog() {
      this.dialogVisible = true
    },
    
    // 处理对话框关闭
    handleDialogClose() {
      if (this.loading) return
      this.dialogVisible = false
      
      // 延迟重置，避免视觉跳动
      setTimeout(() => {
        this.resetImport()
      }, 300)
    },
    
    // 处理文件变更
    handleFileChange(file) {
      this.selectedFile = file.raw
    },
    
    // 上传前验证
    beforeUpload(file) {
      // 检查文件类型
      const isExcel = 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.type === 'application/vnd.ms-excel' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      
      // 检查文件大小
      const isValidSize = file.size / 1024 / 1024 < this.maxFileSize

      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
        return false
      }
      
      if (!isValidSize) {
        this.$message.error(`文件大小不能超过${this.maxFileSize}MB!`)
        return false
      }
      
      return true
    },
    
    // 提交导入
    submitImport() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择文件')
        return
      }
      
      this.loading = true
      this.$emit('import-start', this.selectedFile)
      
      // 创建FormData
      const formData = new FormData()
      formData.append('file', this.selectedFile)
      
      // 调用导入API
      this.importApi(formData).then(response => {
        this.importResult = response.data
        
        // 发送导入结果事件
        this.$emit('import-success', this.importResult)
        
        // 显示结果消息
        if (this.importResult.success === this.importResult.total) {
          this.$message.success('导入成功')
        } else {
          this.$message.warning(`导入完成，成功${this.importResult.success}条，失败${this.importResult.fail}条`)
        }
      }).catch(error => {
        console.error('导入错误:', error)
        this.$message.error('导入失败：' + (error.message || '未知错误'))
        this.$emit('import-error', error)
      }).finally(() => {
        this.loading = false
        this.$emit('import-complete')
      })
    },
    
    // 下载模板
    downloadTemplate() {
      if (!this.templateApi) return
      
      this.$emit('template-download-start')
      
      this.templateApi().then(response => {
        // 判断是否是Mock数据
        if (typeof response.data === 'string' && response.data.includes('template-download-success')) {
          // Mock环境处理
          this.$message.success('模板下载成功（Mock环境）')
          this.$emit('template-download-success', { isMock: true })
        } else {
          // 实际环境处理文件下载
          this.downloadFile(response.data, `${this.dialogTitle.replace(/导入/g, '')}导入模板.xlsx`)
          this.$message.success('模板下载成功')
          this.$emit('template-download-success')
        }
      }).catch(error => {
        console.error('下载模板错误:', error)
        this.$message.error('模板下载失败：' + (error.message || '未知错误'))
        this.$emit('template-download-error', error)
      })
    },
    
    // 重置导入状态
    resetImport() {
      this.selectedFile = null
      this.importResult = null
      this.$emit('reset')
    },
    
    // 获取结果标题
    getResultTitle() {
      if (this.importResult.success === this.importResult.total) {
        return '导入成功'
      } else if (this.importResult.success > 0) {
        return '部分导入成功'
      } else {
        return '导入失败'
      }
    },
    
    // 获取结果子标题
    getResultSubTitle() {
      return `总数据 ${this.importResult.total} 条，成功 ${this.importResult.success} 条，失败 ${this.importResult.fail} 条`
    },
    
    // 下载文件
    downloadFile(data, fileName) {
      // 创建Blob对象
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    }
  }
}
</script>

<style lang="scss" scoped>
.import-button-container {
  display: inline-block;
}

.import-container {
  margin-bottom: 10px;
}

.upload-area {
  width: 100%;
  
  ::v-deep .el-upload {
    width: 100%;
    
    .el-upload-dragger {
      width: 100%;
    }
  }
}

.file-info {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.import-tips {
  margin-top: 20px;
  
  .tips-title {
    font-weight: bold;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    
    i {
      margin-right: 5px;
    }
  }
  
  ol {
    margin: 0;
    padding-left: 25px;
    
    li {
      line-height: 1.8;
      color: #606266;
    }
  }
}

.import-result {
  .error-list {
    margin-top: 20px;
    
    .error-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
  }
}
</style> 