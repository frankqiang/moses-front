<!--
 * 文件名称: AlgorithmDialog.vue
 * 文件描述: 健康度评分算法说明弹窗组件
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
-->
<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="algorithm.title"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="algorithm-content">
      <!-- 算法描述 -->
      <el-alert
        :title="algorithm.description"
        type="info"
        :closable="false"
        show-icon
        class="alert-info"
      />

      <!-- 计算公式 -->
      <div class="formula-section">
        <div class="section-title">计算公式</div>
        <div class="formula-content">{{ algorithm.formula }}</div>
      </div>

      <!-- 评分维度 -->
      <div class="dimensions-section">
        <div class="section-title">评分维度详解</div>
        <el-collapse v-model="activeNames" accordion>
          <el-collapse-item
            v-for="(dimension, index) in algorithm.dimensions"
            :key="index"
            :name="index"
          >
            <template slot="title">
              <span class="dimension-title">
                {{ index + 1 }}. {{ dimension.name }}
                <span v-if="dimension.subtitle" class="dimension-subtitle">{{ dimension.subtitle }}</span>
              </span>
            </template>
            <el-table
              :data="dimension.rules"
              border
              stripe
              style="width: 100%"
            >
              <el-table-column prop="condition" label="条件" width="150" />
              <el-table-column prop="risk" label="风险等级" width="100">
                <template slot-scope="{ row }">
                  <el-tag :type="getRiskType(row.risk)" size="small">
                    {{ row.risk }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="扣分" width="80" align="center">
                <template slot-scope="{ row }">
                  <span :class="{'score-text': row.score > 0}">
                    {{ row.score > 0 ? `-${row.score}分` : '不扣分' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" />
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 评分示例 -->
      <div class="example-section">
        <div class="section-title">评分示例</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-card shadow="hover" class="example-card excellent">
              <div class="example-title">优秀设备</div>
              <ul class="example-list">
                <li>故障次数：2次 → 扣0分</li>
                <li>维护完成率：98% → 扣0分</li>
                <li>平均修复时间：6小时 → 扣0分</li>
                <li>距上次维护：45天 → 扣0分</li>
                <li>设备状态：运行 → 扣0分</li>
              </ul>
              <div class="example-result">
                <span class="result-label">最终评分：</span>
                <span class="result-value excellent-text">100分（优秀）</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="example-card normal">
              <div class="example-title">一般设备</div>
              <ul class="example-list">
                <li>故障次数：5次 → 扣15分</li>
                <li>维护完成率：85% → 扣10分</li>
                <li>平均修复时间：10小时 → 扣5分</li>
                <li>距上次维护：70天 → 扣0分</li>
                <li>设备状态：运行 → 扣0分</li>
              </ul>
              <div class="example-result">
                <span class="result-label">最终评分：</span>
                <span class="result-value normal-text">70分（一般）</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" class="example-card problem">
              <div class="example-title">问题设备</div>
              <ul class="example-list">
                <li>故障次数：10次 → 扣30分</li>
                <li>维护完成率：70% → 扣20分</li>
                <li>平均修复时间：30小时 → 扣15分</li>
                <li>距上次维护：200天 → 扣15分</li>
                <li>设备状态：故障 → 扣20分</li>
              </ul>
              <div class="example-result">
                <span class="result-label">最终评分：</span>
                <span class="result-value problem-text">0分（差）</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { SCORING_ALGORITHM } from '../constants'

export default {
  name: 'AlgorithmDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      activeNames: 0,
      algorithm: SCORING_ALGORITHM
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
    handleClose() {
      this.dialogVisible = false
    },
    getRiskType(risk) {
      const typeMap = {
        '低风险': 'success',
        '中风险': 'warning',
        '高风险': 'danger'
      }
      return typeMap[risk] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.algorithm-content {
  .alert-info {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-left: 8px;
    border-left: 4px solid #409EFF;
  }

  .formula-section {
    margin-bottom: 24px;

    .formula-content {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      font-size: 14px;
      color: #606266;
      font-family: Consolas, Monaco, monospace;
    }
  }

  .dimensions-section {
    margin-bottom: 24px;

    .dimension-title {
      font-size: 15px;
      font-weight: 500;

      .dimension-subtitle {
        color: #909399;
        font-size: 13px;
        margin-left: 4px;
      }
    }

    .score-text {
      color: #F56C6C;
      font-weight: 600;
    }
  }

  .example-section {
    .example-card {
      margin-bottom: 16px;

      .example-title {
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 12px;
        text-align: center;
      }

      .example-list {
        list-style: none;
        padding: 0;
        margin: 0 0 12px 0;

        li {
          padding: 6px 0;
          font-size: 13px;
          color: #606266;
          line-height: 1.6;
        }
      }

      .example-result {
        padding-top: 12px;
        border-top: 1px solid #EBEEF5;
        text-align: center;

        .result-label {
          font-size: 14px;
          color: #606266;
        }

        .result-value {
          font-size: 18px;
          font-weight: 600;
          margin-left: 8px;

          &.excellent-text {
            color: #67C23A;
          }

          &.normal-text {
            color: #E6A23C;
          }

          &.problem-text {
            color: #F56C6C;
          }
        }
      }

      &.excellent {
        border-top: 3px solid #67C23A;
      }

      &.normal {
        border-top: 3px solid #E6A23C;
      }

      &.problem {
        border-top: 3px solid #F56C6C;
      }
    }
  }
}

::v-deep .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>

