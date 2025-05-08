<template>
  <el-dialog
    title="导入仓库数据"
    :visible.sync="dialogVisible"
    width="550px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="!importResult">
      <el-upload
        class="upload-container"
        :action="'#'"
        :http-request="handleUpload"
        :before-upload="beforeUpload"
        :show-file-list="false"
        :disabled="loading"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">
          只能上传xlsx/xls文件，且不超过10MB
          <el-link type="primary" :underline="false" @click.stop="handleDownloadTemplate">下载模板</el-link>
        </div>
      </el-upload>
    </div>
    
    <div v-else class="import-result">
      <div class="result-header">
        <i :class="['result-icon', importResult.fail === 0 ? 'el-icon-success success' : 'el-icon-warning warning']"></i>
        <div class="result-title">
          {{ importResult.fail === 0 ? '导入成功' : '部分导入成功' }}
        </div>
      </div>
      
      <div class="result-info">
        <div class="info-item">
          <span class="label">总数据量：</span>
          <span class="value">{{ importResult.total }}</span>
        </div>
        <div class="info-item">
          <span class="label">成功导入：</span>
          <span class="value success">{{ importResult.success }}</span>
        </div>
        <div class="info-item">
          <span class="label">导入失败：</span>
          <span class="value error">{{ importResult.fail }}</span>
        </div>
      </div>
      
      <div v-if="importResult.fail > 0" class="error-list">
        <div class="error-title">错误详情：</div>
        <el-table :data="importResult.errors" size="mini" border>
          <el-table-column prop="row" label="行号" width="80" align="center" />
          <el-table-column prop="message" label="错误原因" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ importResult ? '关闭' : '取消' }}</el-button>
      <el-button v-if="importResult" type="primary" @click="handleReset">继续导入</el-button>
      <el-button v-else type="primary" :loading="loading" @click="handleSelectFile">选择文件</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 仓库数据导入对话框组件
 * 功能描述：提供仓库数据的Excel导入功能
 * 创建日期：2023-11-01
 */
export default {
  name: 'ImportDialog',
  props: {
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 导入加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 导入结果
    importResult: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // 对话框可见性
      dialogVisible: false,
      // 文件对象
      fileObj: null
    }
  },
  watch: {
    // 监听对话框可见性变化
    visible: {
      handler(val) {
        this.dialogVisible = val
      },
      immediate: true
    }
  },
  methods: {
    // 关闭对话框
    handleClose() {
      this.$emit('update:visible', false)
    },
    
    // 重置导入
    handleReset() {
      this.$emit('reset')
    },
    
    // 选择文件
    handleSelectFile() {
      const uploadDom = this.$el.querySelector('.el-upload__input')
      if (uploadDom) {
        uploadDom.click()
      }
    },
    
    // 下载模板
    handleDownloadTemplate() {
      this.$emit('import-export', 'template')
    },
    
    // 上传前校验
    beforeUpload(file) {
      const isExcel = /\.(xlsx|xls)$/.test(file.name.toLowerCase())
      const isLt10M = file.size / 1024 / 1024 < 10
      
      if (!isExcel) {
        this.$message.error('上传文件只能是 Excel 格式!')
        return false
      }
      
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB!')
        return false
      }
      
      this.fileObj = file
      return true
    },
    
    // 自定义上传
    handleUpload() {
      if (!this.fileObj) {
        this.$message.error('请选择文件')
        return
      }
      
      // 创建表单数据
      const formData = new FormData()
      formData.append('file', this.fileObj)
      
      // 发送导入请求
      this.$emit('import', formData)
    }
  }
}
</script>

<style scoped>
.upload-container {
  text-align: center;
  padding: 20px 0;
}

.import-result {
  padding: 10px;
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.result-icon {
  font-size: 32px;
  margin-right: 10px;
}

.result-icon.success {
  color: #67c23a;
}

.result-icon.warning {
  color: #e6a23c;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
}

.result-info {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
}

.info-item .label {
  width: 80px;
  color: #606266;
}

.info-item .value {
  font-weight: bold;
}

.info-item .value.success {
  color: #67c23a;
}

.info-item .value.error {
  color: #f56c6c;
}

.error-list {
  margin-top: 15px;
}

.error-title {
  margin-bottom: 10px;
  font-weight: bold;
  color: #f56c6c;
}
</style> 