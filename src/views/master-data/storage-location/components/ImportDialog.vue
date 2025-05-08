<template>
  <el-dialog
    title="导入库位数据"
    :visible="localVisible"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-container">
      <!-- 上传区域 -->
      <div v-if="!importResult" class="upload-area">
        <el-upload
          class="upload"
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="1"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">
            仅支持xlsx格式文件，且不超过10MB
          </div>
        </el-upload>
        
        <div class="tips">
          <el-alert
            title="导入注意事项"
            type="info"
            :closable="false"
          >
            <div>1. 请先下载导入模板，按照模板格式填写数据</div>
            <div>2. 库位编码和名称不能为空，且编码不能重复</div>
            <div>3. 所属仓库必须是系统中已存在的仓库</div>
            <div>4. 批量导入上限为1000条数据</div>
          </el-alert>
        </div>
      </div>
      
      <!-- 导入结果展示 -->
      <div v-else class="result-area">
        <el-result
          :icon="importResult.success ? 'success' : 'error'"
          :title="importResult.success ? '导入成功' : '导入失败'"
          :subTitle="getResultSubTitle()"
        >
          <!-- 失败信息展示 -->
          <template v-if="!importResult.success && importResult.errors && importResult.errors.length">
            <div class="error-list">
              <el-table
                :data="importResult.errors"
                border
                style="width: 100%; margin-top: 20px;"
                max-height="250"
              >
                <el-table-column
                  prop="row"
                  label="行号"
                  width="60"
                  align="center"
                />
                <el-table-column
                  prop="field"
                  label="字段"
                  width="120"
                />
                <el-table-column
                  prop="message"
                  label="错误信息"
                />
              </el-table>
            </div>
          </template>
          
          <template slot="extra">
            <el-button type="primary" @click="resetImport">返回重新导入</el-button>
          </template>
        </el-result>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button
        v-if="!importResult"
        type="primary"
        :disabled="!selectedFile"
        :loading="loading"
        @click="handleImport"
      >
        {{ loading ? '导入中...' : '开始导入' }}
      </el-button>
      <el-button
        v-if="importResult && importResult.success"
        type="primary"
        @click="handleCancel"
      >
        完 成
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 库位数据导入组件
 * 功能描述：提供库位数据的Excel批量导入功能
 * 创建日期：2023-09-01
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
      localVisible: this.visible, // 本地可见性状态
      fileList: [], // 上传文件列表
      selectedFile: null // 选中的文件
    }
  },
  watch: {
    // 监听可见性变化，更新本地状态并在关闭时重置状态
    visible(val) {
      this.localVisible = val
      if (!val) {
        this.resetLocalData()
      }
    }
  },
  methods: {
    // 处理文件选择变化
    handleFileChange(file, fileList) {
      // 限制文件格式
      const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.raw.type === 'application/vnd.ms-excel' ||
                      file.raw.name.endsWith('.xlsx') ||
                      file.raw.name.endsWith('.xls')
      
      // 限制文件大小，10MB
      const isLt10M = file.raw.size / 1024 / 1024 < 10
      
      if (!isExcel) {
        this.$message.error('上传文件只能是Excel格式!')
        this.fileList = []
        this.selectedFile = null
        return
      }
      
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过10MB!')
        this.fileList = []
        this.selectedFile = null
        return
      }
      
      this.fileList = fileList.slice(-1) // 只保留最后一个文件
      this.selectedFile = file.raw
    },
    
    // 开始导入
    handleImport() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择要导入的文件')
        return
      }
      
      // 创建FormData
      const formData = new FormData()
      formData.append('file', this.selectedFile)
      
      // 触发导入事件，父组件处理导入逻辑
      this.$emit('import', formData)
    },
    
    // 处理对话框关闭
    handleClose() {
      this.$emit('update:visible', false)
    },
    
    // 处理取消
    handleCancel() {
      // 如果正在导入，提示用户确认
      if (this.loading) {
        this.$confirm('导入正在进行中，确认取消吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('update:visible', false)
        }).catch(() => {
          // 取消操作
        })
      } else {
        this.$emit('update:visible', false)
      }
    },
    
    // 重置导入状态（返回上传界面）
    resetImport() {
      this.$emit('reset')
      this.resetLocalData()
    },
    
    // 重置本地数据
    resetLocalData() {
      this.fileList = []
      this.selectedFile = null
    },
    
    // 获取结果副标题
    getResultSubTitle() {
      if (!this.importResult) return ''
      
      if (this.importResult.success) {
        return `成功导入 ${this.importResult.totalCount || 0} 条数据`
      } else {
        return `共有 ${this.importResult.errors?.length || 0} 个错误需要修正`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.import-container {
  .upload-area {
    text-align: center;
    
    .upload {
      width: 100%;
    }
    
    .tips {
      margin-top: 20px;
      text-align: left;
    }
  }
  
  .result-area {
    .error-list {
      margin-top: 15px;
    }
  }
}
</style> 