<template>
  <el-dialog 
    title="导入铝箔产品数据" 
    :visible.sync="dialogVisible"
    width="600px"
    @close="$emit('update:visible', false)"
    destroy-on-close
  >
    <div v-if="!importResult" class="import-container">
      <div class="upload-box">
        <el-upload
          class="upload-demo"
          drag
          action="#"
          :http-request="handleUpload"
          :multiple="false"
          :limit="1"
          :show-file-list="false"
          :disabled="loading"
          accept=".xlsx,.xls"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将Excel文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">
            只能上传 Excel 文件，且不超过10MB
          </div>
        </el-upload>
      </div>

      <div class="tip-box">
        <h4>上传须知：</h4>
        <ol>
          <li>请先下载模板，按照模板格式填写数据后再上传</li>
          <li>支持批量导入，一次最多导入500条数据</li>
          <li>数据格式需符合系统要求，详见模板中的说明</li>
          <li>上传成功后会返回导入结果，包含成功数量和失败原因</li>
        </ol>
      </div>
    </div>

    <div v-else class="result-container">
      <el-result 
        :icon="importResult.success === importResult.total ? 'success' : 'warning'"
        :title="importResult.success === importResult.total ? '导入成功' : '部分导入成功'"
        :sub-title="`共尝试导入${importResult.total}条数据，成功${importResult.success}条，失败${importResult.fail}条`"
      >
        <template v-if="importResult.fail > 0" slot="extra">
          <el-collapse accordion>
            <el-collapse-item title="查看失败详情">
              <el-table :data="importResult.errors" size="small" border>
                <el-table-column prop="row" label="行号" width="80" align="center" />
                <el-table-column prop="message" label="失败原因" min-width="300" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </template>
      </el-result>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:visible', false)">关 闭</el-button>
      <template v-if="!importResult">
        <el-button type="primary" @click="$emit('reset')">重 置</el-button>
        <el-button type="success" @click="handleTemplateDownload">下载模板</el-button>
      </template>
      <el-button v-else type="primary" @click="handleReset">继续导入</el-button>
    </div>
  </el-dialog>
</template>

<script>
/**
 * 导入对话框组件
 * 功能描述：提供铝箔产品数据导入界面
 */
export default {
  name: 'ImportDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    importResult: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    }
  },
  methods: {
    // 自定义上传处理
    handleUpload(options) {
      this.$emit('import', options.file)
    },
    
    // 模板下载
    handleTemplateDownload() {
      this.$emit('template-download')
    },
    
    // 重置
    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>

<style lang="scss" scoped>
.import-container {
  .upload-box {
    margin-bottom: 20px;
  }

  .tip-box {
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #606266;
    }
    
    ol {
      margin: 0;
      padding-left: 20px;
      color: #909399;
      
      li {
        margin-bottom: 5px;
        font-size: 13px;
      }
    }
  }
}

.result-container {
  padding: 20px 0;
}
</style> 