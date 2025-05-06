<template>
  <el-dialog
    title="导入料框规格数据"
    :visible.sync="visible"
    width="500px"
    :close-on-click-modal="false"
  >
    <div v-if="!importResult" class="import-container">
      <el-upload
        class="upload-area"
        drag
        action="#"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          将Excel文件拖到此处，或<em>点击上传</em>
        </div>
        <div class="el-upload__tip" slot="tip">
          只能上传xlsx/xls文件，且大小不超过5MB
        </div>
      </el-upload>
      
      <div v-if="file" class="file-info">
        <span>已选择文件: {{ file.name }}</span>
        <el-button type="text" icon="el-icon-delete" @click="file = null">移除</el-button>
      </div>
      
      <div class="upload-tip">
        <p>
          <i class="el-icon-info" style="color: #E6A23C;"></i>
          导入说明：
        </p>
        <ol>
          <li>请先下载导入模板，按照模板格式填写数据</li>
          <li>所有标有*的字段为必填项</li>
          <li>规格代码不能重复</li>
          <li>文件大小不能超过5MB</li>
        </ol>
      </div>
    </div>
    
    <div v-else class="import-result">
      <div class="result-header">
        <i :class="importResult.failed === 0 ? 'el-icon-success success-icon' : 'el-icon-warning warning-icon'" />
        <h3>导入完成</h3>
      </div>
      
      <div class="result-summary">
        <p>总数据: {{ importResult.total }} 条</p>
        <p>成功导入: {{ importResult.success }} 条</p>
        <p>导入失败: {{ importResult.failed }} 条</p>
      </div>
      
      <div v-if="importResult.failed > 0" class="failed-list">
        <h4>失败明细:</h4>
        <el-table
          :data="importResult.failedItems"
          border
          style="width: 100%"
        >
          <el-table-column prop="row" label="行号" width="80" align="center" />
          <el-table-column prop="reason" label="失败原因" />
        </el-table>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ importResult ? '关闭' : '取消' }}</el-button>
      <el-button 
        v-if="!importResult && file" 
        type="primary" 
        :loading="loading" 
        @click="submitImport"
      >
        开始导入
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ImportDialog',
  props: {
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 加载状态
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
      // 导入文件
      file: null
    }
  },
  watch: {
    // 监听可见性变化，重置文件
    visible(val) {
      if (!val) {
        this.file = null
      }
    }
  },
  methods: {
    // 处理文件变更
    handleFileChange(file) {
      this.file = file.raw
    },
    
    // 上传前验证
    beforeUpload(file) {
      // 检查文件类型
      const isExcel = 
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.type === 'application/vnd.ms-excel'
      
      // 检查文件大小，限制为5MB
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
      }
      
      if (!isLt5M) {
        this.$message.error('文件大小不能超过5MB!')
      }
      
      return false // 阻止自动上传
    },
    
    // 提交导入
    submitImport() {
      if (!this.file) {
        this.$message.warning('请先选择文件')
        return
      }
      
      this.$emit('import', this.file)
    },
    
    // 关闭对话框
    handleClose() {
      this.$emit('update:visible', false)
      if (this.importResult) {
        this.$emit('reset')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.import-container {
  .upload-area {
    width: 100%;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.3s;
    
    &:hover {
      border-color: #409EFF;
    }
    
    .el-icon-upload {
      font-size: 48px;
      color: #c0c4cc;
      margin-bottom: 10px;
    }
    
    .el-upload__text {
      color: #606266;
      margin-bottom: 10px;
      
      em {
        color: #409EFF;
        font-style: normal;
      }
    }
  }
  
  .file-info {
    margin-top: 15px;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .upload-tip {
    margin-top: 20px;
    background-color: #fdf6ec;
    padding: 10px 15px;
    border-radius: 4px;
    border-left: 4px solid #E6A23C;
    
    p {
      margin: 0 0 10px;
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
        margin-bottom: 5px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.import-result {
  .result-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    i {
      font-size: 32px;
      margin-right: 15px;
      
      &.success-icon {
        color: #67C23A;
      }
      
      &.warning-icon {
        color: #E6A23C;
      }
    }
    
    h3 {
      margin: 0;
      font-size: 18px;
    }
  }
  
  .result-summary {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    
    p {
      margin: 0 0 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .failed-list {
    h4 {
      margin: 0 0 10px;
      color: #F56C6C;
    }
  }
}
</style> 