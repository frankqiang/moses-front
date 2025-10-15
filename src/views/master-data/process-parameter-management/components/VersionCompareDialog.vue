<!--
文件名称：VersionCompareDialog.vue
文件描述：版本对比对话框，支持选择两个版本进行差异对比，包含可视化图表对比
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建，完成TASK06 P0阶段第1项及P1第5项任务（可视化图表对比）
-->

<template>
  <el-dialog
    :visible.sync="visibleProxy"
    title="版本对比"
    :close-on-click-modal="false"
    width="90%"
    top="5vh"
    custom-class="version-compare-dialog"
    @close="handleClose"
  >
    <!-- 版本选择器 -->
    <div class="version-selector">
      <div class="version-selector-item">
        <label>基准版本：</label>
        <el-select
          v-model="baseVersionId"
          placeholder="选择基准版本"
          filterable
          :disabled="loading"
          @change="handleVersionChange"
        >
          <el-option
            v-for="version in availableVersions"
            :key="version.id"
            :label="`${version.versionNumber} - ${version.status}`"
            :value="version.id"
          >
            <div class="version-option">
              <span class="version-number">{{ version.versionNumber }}</span>
              <el-tag :type="getVersionStatusType(version.status)" size="mini">
                {{ version.status }}
              </el-tag>
              <span v-if="version.isLatestVersion" class="latest-badge">最新</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <div class="version-selector-separator">
        <i class="el-icon-d-arrow-right" />
      </div>

      <div class="version-selector-item">
        <label>对比版本：</label>
        <el-select
          v-model="compareVersionId"
          placeholder="选择对比版本"
          filterable
          :disabled="loading"
          @change="handleVersionChange"
        >
          <el-option
            v-for="version in availableVersions"
            :key="version.id"
            :label="`${version.versionNumber} - ${version.status}`"
            :value="version.id"
          >
            <div class="version-option">
              <span class="version-number">{{ version.versionNumber }}</span>
              <el-tag :type="getVersionStatusType(version.status)" size="mini">
                {{ version.status }}
              </el-tag>
              <span v-if="version.isLatestVersion" class="latest-badge">最新</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <div class="version-selector-actions">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-refresh"
          :disabled="!baseVersionId || !compareVersionId || loading"
          :loading="loading"
          @click="loadCompareResult"
        >
          {{ loading ? '对比中...' : '开始对比' }}
        </el-button>
        <el-button
          v-if="compareResult"
          size="small"
          icon="el-icon-download"
          @click="handleExportDiff"
        >
          导出差异
        </el-button>
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="errorMessage"
      type="error"
      show-icon
      :closable="false"
      :title="errorMessage"
      style="margin-top: 16px"
    />

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="10" animated style="margin-top: 20px" />

    <!-- 对比结果 -->
    <div v-else-if="compareResult" class="compare-content">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息对比 -->
        <el-tab-pane label="基本信息" name="basic">
          <div class="compare-section">
            <el-table
              :data="basicInfoDiff"
              border
              stripe
              size="small"
            >
              <el-table-column label="字段" prop="field" width="150" />
              <el-table-column label="基准版本" prop="baseValue">
                <template slot-scope="{ row }">
                  <span :class="{ 'diff-highlight': row.changed }">
                    {{ row.baseValue || '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="对比版本" prop="compareValue">
                <template slot-scope="{ row }">
                  <span :class="{ 'diff-highlight': row.changed }">
                    {{ row.compareValue || '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="差异" width="80" align="center">
                <template slot-scope="{ row }">
                  <el-tag v-if="row.changed" type="warning" size="mini">
                    已变更
                  </el-tag>
                  <el-tag v-else type="success" size="mini">
                    相同
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 12段参数对比 -->
        <el-tab-pane label="12段参数对比" name="segments">
          <div class="compare-section">
            <div class="segment-compare-header">
              <el-radio-group v-model="segmentViewMode" size="mini">
                <el-radio-button label="all">全部段</el-radio-button>
                <el-radio-button label="diff">仅差异段</el-radio-button>
              </el-radio-group>
            </div>

            <el-table
              :data="segmentsDiff"
              border
              stripe
              size="small"
              max-height="500"
            >
              <el-table-column label="段序号" prop="segmentOrder" width="80" fixed />
              <el-table-column label="参数" prop="field" width="150" fixed />
              <el-table-column label="基准版本值" prop="baseValue">
                <template slot-scope="{ row }">
                  <span :class="{ 'diff-highlight': row.changed }">
                    {{ row.baseValue || '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="对比版本值" prop="compareValue">
                <template slot-scope="{ row }">
                  <span :class="{ 'diff-highlight': row.changed }">
                    {{ row.compareValue || '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="差异" width="80" align="center">
                <template slot-scope="{ row }">
                  <el-tag v-if="row.changed" type="warning" size="mini">
                    已变更
                  </el-tag>
                  <el-tag v-else type="success" size="mini">
                    相同
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <!-- 统计信息 -->
            <div class="diff-summary">
              <el-tag type="info">总段数：12</el-tag>
              <el-tag type="warning">差异段数：{{ changedSegmentsCount }}</el-tag>
              <el-tag type="success">相同段数：{{ unchangedSegmentsCount }}</el-tag>
            </div>
          </div>
        </el-tab-pane>

        <!-- 温度曲线对比 -->
        <el-tab-pane label="温度曲线对比" name="curve">
          <div class="compare-section">
            <TemperatureCurveViewer
              v-if="baseVersion && compareVersion"
              :segments="baseVersion.segments || []"
              :comparison-versions="comparisonVersionsForChart"
              :template-id="templateId"
              :version-id="baseVersion.id"
            />
            <el-empty v-else description="暂无温度曲线数据" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 空状态 -->
    <el-empty v-else description="请选择两个版本并点击'开始对比'按钮" style="margin-top: 40px" />

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">
        关闭
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { compareProcessTemplateVersions } from '../api'
import TemperatureCurveViewer from './TemperatureCurveViewer.vue'
import { SEGMENT_FIELD_LABELS } from '../constants/process-parameter-management'

export default {
  name: 'VersionCompareDialog',
  components: {
    TemperatureCurveViewer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    templateId: {
      type: String,
      required: true
    },
    availableVersions: {
      type: Array,
      default: () => []
    },
    defaultBaseVersionId: {
      type: String,
      default: ''
    },
    defaultCompareVersionId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visibleProxy: false,
      loading: false,
      errorMessage: '',
      baseVersionId: '',
      compareVersionId: '',
      compareResult: null,
      baseVersion: null,
      compareVersion: null,
      activeTab: 'basic',
      segmentViewMode: 'diff'
    }
  },
  computed: {
    basicInfoDiff() {
      if (!this.compareResult) return []

      const differences = this.compareResult.differences
      if (!differences || !differences.templateInfo) return []

      const fields = differences.templateInfo.fields || []
      return fields.map(field => ({
        field: field.field,
        baseValue: field.baseValue,
        compareValue: field.compareValue,
        changed: field.baseValue !== field.compareValue
      }))
    },

    segmentsDiff() {
      if (!this.compareResult) return []

      const segments = this.compareResult.differences?.segments || []
      const rows = []

      segments.forEach(segment => {
        if (!segment.changed && this.segmentViewMode === 'diff') {
          return // 仅差异模式下跳过相同的段
        }

        const segmentOrder = segment.segmentOrder
        const differences = segment.differences || []

        // 如果整段都没有变化且是仅差异模式，跳过
        if (differences.length === 0 && this.segmentViewMode === 'diff') {
          return
        }

        // 为每个字段创建一行
        const fieldLabels = SEGMENT_FIELD_LABELS || {}
        const fields = [
          'controlMode',
          'furnaceTemperature',
          'materialTemperature',
          'timeSet',
          'runTime',
          'circulationFanSpeed',
          'negativePressureFan',
          'cleaningFan',
          'cleaningTime'
        ]

        fields.forEach(fieldKey => {
          const diff = differences.find(d => d.field === fieldKey)
          const changed = diff ? (diff.baseValue !== diff.compareValue) : false

          // 仅差异模式下，跳过相同的字段
          if (!changed && this.segmentViewMode === 'diff') {
            return
          }

          rows.push({
            segmentOrder,
            field: fieldLabels[fieldKey] || fieldKey,
            baseValue: diff ? diff.baseValue : '-',
            compareValue: diff ? diff.compareValue : '-',
            changed
          })
        })
      })

      return rows
    },

    changedSegmentsCount() {
      if (!this.compareResult) return 0
      const segments = this.compareResult.differences?.segments || []
      return segments.filter(s => s.changed).length
    },

    unchangedSegmentsCount() {
      return 12 - this.changedSegmentsCount
    },

    comparisonVersionsForChart() {
      if (!this.compareVersion) return []
      return [{
        id: this.compareVersion.id,
        versionNumber: this.compareVersion.versionNumber,
        segments: this.compareVersion.segments || []
      }]
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.visibleProxy = val
        if (val) {
          this.initializeDialog()
        }
      }
    },
    visibleProxy(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.resetDialog()
      }
    }
  },
  methods: {
    initializeDialog() {
      this.errorMessage = ''

      // 设置默认选中版本
      if (this.defaultBaseVersionId) {
        this.baseVersionId = this.defaultBaseVersionId
      } else if (this.availableVersions.length >= 1) {
        // 默认选择最新版本作为基准版本
        const latestVersion = this.availableVersions.find(v => v.isLatestVersion)
        this.baseVersionId = latestVersion ? latestVersion.id : this.availableVersions[0].id
      }

      if (this.defaultCompareVersionId) {
        this.compareVersionId = this.defaultCompareVersionId
      } else if (this.availableVersions.length >= 2) {
        // 默认选择第二个版本作为对比版本
        const otherVersions = this.availableVersions.filter(v => v.id !== this.baseVersionId)
        this.compareVersionId = otherVersions.length > 0 ? otherVersions[0].id : ''
      }

      // 如果两个版本都选中了，自动开始对比
      if (this.baseVersionId && this.compareVersionId && this.baseVersionId !== this.compareVersionId) {
        this.$nextTick(() => {
          this.loadCompareResult()
        })
      }
    },

    getVersionStatusType(status) {
      const statusTypeMap = {
        '草稿': 'info',
        '待审批': 'warning',
        '生效': 'success',
        '历史': '',
        '驳回': 'danger',
        '已作废': 'info'
      }
      return statusTypeMap[status] || 'info'
    },

    handleVersionChange() {
      // 清空之前的对比结果
      this.compareResult = null
      this.baseVersion = null
      this.compareVersion = null
    },

    async loadCompareResult() {
      if (!this.baseVersionId || !this.compareVersionId) {
        this.$message.warning('请先选择两个版本')
        return
      }

      if (this.baseVersionId === this.compareVersionId) {
        this.$message.warning('请选择不同的版本进行对比')
        return
      }

      this.loading = true
      this.errorMessage = ''

      try {
        const response = await compareProcessTemplateVersions(this.templateId, {
          baseVersionId: this.baseVersionId,
          compareVersionId: this.compareVersionId
        })

        this.compareResult = response.data
        this.baseVersion = response.data.baseVersion
        this.compareVersion = response.data.compareVersion

        this.$message.success('版本对比完成')
      } catch (error) {
        console.error('[VersionCompareDialog] compare failed', error)
        const errorMsg = error?.response?.data?.error?.message || error?.message || '版本对比失败，请稍后重试'
        this.errorMessage = errorMsg
        this.$message.error(errorMsg)
      } finally {
        this.loading = false
      }
    },

    handleExportDiff() {
      if (!this.compareResult) return

      try {
        const data = {
          templateId: this.templateId,
          baseVersionId: this.baseVersionId,
          compareVersionId: this.compareVersionId,
          compareResult: this.compareResult,
          exportTime: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `version-compare-${this.baseVersion.versionNumber}-vs-${this.compareVersion.versionNumber}-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)

        this.$message.success('差异数据导出成功')
      } catch (error) {
        console.error('[VersionCompareDialog] export failed', error)
        this.$message.error('导出失败，请稍后重试')
      }
    },

    handleClose() {
      this.visibleProxy = false
      this.$emit('close')
    },

    resetDialog() {
      this.baseVersionId = ''
      this.compareVersionId = ''
      this.compareResult = null
      this.baseVersion = null
      this.compareVersion = null
      this.errorMessage = ''
      this.loading = false
      this.activeTab = 'basic'
      this.segmentViewMode = 'diff'
    }
  }
}
</script>

<style scoped lang="scss">
.version-compare-dialog {
  ::v-deep .el-dialog__body {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.version-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;

  .version-selector-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;

    label {
      font-weight: 600;
      color: #1f2d3d;
      white-space: nowrap;
    }

    .el-select {
      flex: 1;
    }
  }

  .version-selector-separator {
    font-size: 24px;
    color: #909399;
  }

  .version-selector-actions {
    display: flex;
    gap: 8px;
  }
}

.version-option {
  display: flex;
  align-items: center;
  gap: 8px;

  .version-number {
    font-weight: 600;
    color: #1f2d3d;
  }

  .latest-badge {
    display: inline-block;
    padding: 2px 8px;
    background: #f56c6c;
    color: #ffffff;
    font-size: 12px;
    border-radius: 10px;
    font-weight: 500;
  }
}

.compare-content {
  margin-top: 20px;

  .compare-section {
    padding: 16px;
  }
}

.diff-highlight {
  background: #fff3cd;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.segment-compare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.diff-summary {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

