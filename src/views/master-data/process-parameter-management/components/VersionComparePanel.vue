<!--
文件名称：VersionComparePanel.vue
文件描述：工艺模板版本对比面板，展示当前版本与其他版本的差异并支持差异高亮
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，支持基础差异展示与差异高亮
-->

<template>
  <div class="version-compare-panel">
    <div class="version-compare-panel__header">
      <div class="version-compare-panel__title">版本差异对比</div>
      <div class="version-compare-panel__controls">
        <el-select
          v-model="compareVersionId"
          placeholder="选择对比版本"
          filterable
          size="mini"
          :disabled="loading"
          @change="handleCompareChange"
        >
          <el-option
            v-for="version in otherVersions"
            :key="version.id"
            :label="version.versionNumber"
            :value="version.id"
          />
        </el-select>
        <el-radio-group v-model="highlightMode" size="mini">
          <el-radio-button label="all">全部字段</el-radio-button>
          <el-radio-button label="diff">仅显示差异</el-radio-button>
        </el-radio-group>
        <el-button
          v-if="compareResult"
          size="mini"
          icon="el-icon-document"
          :loading="exporting"
          @click="handleExportDiff"
        >
          导出差异
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="!otherVersions.length && !loading"
      type="info"
      :closable="false"
      show-icon
      title="暂无其他版本可供对比"
      class="version-compare-panel__empty-tip"
    />

    <el-skeleton v-if="loading" :rows="6" animated />

    <div v-else-if="compareResult" class="version-compare-panel__content">
      <el-collapse v-model="activeSections">
        <el-collapse-item title="基础信息" name="basic">
          <DiffTable
            :columns="basicInfoColumns"
            :rows="compareResult.versionInfo"
            :highlight-mode="highlightMode"
          />
        </el-collapse-item>

        <el-collapse-item title="12段参数配置" name="segments">
          <DiffList
            :items="compareResult.segments"
            item-title="段序号"
            :highlight-mode="highlightMode"
            :format-item="formatSegment"
          />
        </el-collapse-item>
      </el-collapse>
    </div>

    <el-empty v-else description="请选择需要对比的版本" />
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'
import DiffTable from './diff/DiffTable.vue'
import DiffList from './diff/DiffList.vue'
import { fetchProcessTemplateVersions, compareProcessTemplateVersions } from '../api'

export default {
  name: 'VersionComparePanel',
  components: {
    DiffTable,
    DiffList
  },
  props: {
    templateId: {
      type: String,
      required: true
    },
    currentVersion: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      exporting: false,
      compareVersionId: '',
      compareResult: null,
      otherVersions: [],
      activeSections: ['basic', 'segments'],
      highlightMode: 'diff' // 默认仅显示差异
    }
  },
  computed: {
    basicInfoColumns() {
      return [
        { label: '字段', prop: 'label' },
        { label: '当前版本', prop: 'current' },
        { label: '对比版本', prop: 'compare' }
      ]
    }
  },
  watch: {
    currentVersion(newVal, oldVal) {
      // 只在版本切换时重新加载（不在初次挂载时触发）
      if (newVal && oldVal && newVal.id !== oldVal.id) {
        this.loadOtherVersions()
      }
    }
  },
  mounted() {
    // 组件挂载时（即用户切换到"版本对比" tab）才加载数据
    if (this.currentVersion) {
      this.loadOtherVersions()
    }
  },
  methods: {
    async loadOtherVersions() {
      this.loading = true
      try {
        const response = await fetchProcessTemplateVersions(this.templateId, {
          page: 1,
          limit: 50
        })
        const list = response.data?.versions?.results || []
        this.otherVersions = list.filter(item => item.id !== this.currentVersion.id)
        if (this.otherVersions.length) {
          this.compareVersionId = this.otherVersions[0].id
          await this.loadCompareResult()
        }
      } catch (error) {
        console.error('[VersionComparePanel] load versions failed', error)
        this.$message.error(error?.message || '加载版本列表失败')
      } finally {
        this.loading = false
      }
    },

    async handleCompareChange() {
      await this.loadCompareResult()
    },

    async loadCompareResult() {
      if (!this.compareVersionId) {
        this.compareResult = null
        return
      }

      this.loading = true
      try {
        const response = await compareProcessTemplateVersions(this.templateId, {
          baseVersionId: this.currentVersion.id,
          compareVersionId: this.compareVersionId
        })
        this.compareResult = this.transformCompareResult(response.data)
      } catch (error) {
        console.error('[VersionComparePanel] compare failed', error)
        this.$message.error(error?.message || '版本对比失败，请稍后重试')
        this.compareResult = null
      } finally {
        this.loading = false
      }
    },

    transformCompareResult(raw) {
      if (!raw) return null

      // 从 differences 中获取对比数据
      const differences = raw.differences || {}
      const versionInfoDiff = differences.versionInfo || {}

      const versionInfo = [
        {
          label: '版本号',
          current: versionInfoDiff.base?.versionNumber || raw.baseVersion?.versionNumber,
          compare: versionInfoDiff.compare?.versionNumber || raw.compareVersion?.versionNumber,
          changed: versionInfoDiff.base?.versionNumber !== versionInfoDiff.compare?.versionNumber
        },
        {
          label: '版本状态',
          current: versionInfoDiff.base?.status || raw.baseVersion?.status,
          compare: versionInfoDiff.compare?.status || raw.compareVersion?.status,
          changed: versionInfoDiff.base?.status !== versionInfoDiff.compare?.status
        },
        {
          label: '版本描述',
          current: versionInfoDiff.base?.versionDescription || raw.baseVersion?.versionDescription,
          compare: versionInfoDiff.compare?.versionDescription || raw.compareVersion?.versionDescription,
          changed: versionInfoDiff.base?.versionDescription !== versionInfoDiff.compare?.versionDescription
        },
        {
          label: '创建时间',
          current: this.formatDate(versionInfoDiff.base?.createdAt || raw.baseVersion?.createdAt),
          compare: this.formatDate(versionInfoDiff.compare?.createdAt || raw.compareVersion?.createdAt),
          changed: versionInfoDiff.base?.createdAt !== versionInfoDiff.compare?.createdAt
        }
      ]

      const transformList = (section = {}) => {
        const results = []
        const baseList = section.base || []
        const compareList = section.compare || []
        const maxLength = Math.max(baseList.length, compareList.length)

        // 需要对比的字段（排除元数据字段）
        const compareFields = [
          'segmentOrder', 'controlMode', 'furnaceTemperature', 'materialTemperature',
          'timeSet', 'runTime', 'circulationFanSpeed', 'negativePressureFan',
          'cleaningFan', 'cleaningTime'
        ]

        for (let i = 0; i < maxLength; i += 1) {
          const current = baseList[i] || null
          const compare = compareList[i] || null

          // 智能检测是否有实际差异（比较业务字段，忽略ID、时间戳等元数据）
          let hasChange = false
          if (current && compare) {
            hasChange = compareFields.some(field => current[field] !== compare[field])
          } else if (current || compare) {
            hasChange = true // 一个有值一个没有，说明有差异
          }

          results.push({
            current: cloneDeep(current),
            compare: cloneDeep(compare),
            changed: hasChange
          })
        }
        return results
      }

      return {
        versionInfo,
        segments: transformList(differences.segments || {})
      }
    },

    formatSegment(item) {
      if (!item) return '-'
      return `第 ${item.segmentOrder} 段`
    },

    formatDate(value) {
      if (!value) return '-'
      return value.replace('T', ' ').replace('Z', '')
    },

    async handleExportDiff() {
      if (!this.compareResult) return
      this.exporting = true
      try {
        const data = {
          templateId: this.templateId,
          baseVersionId: this.currentVersion.id,
          compareVersionId: this.compareVersionId,
          result: this.compareResult
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `process-template-diff-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
        this.$message.success('差异数据导出成功')
      } catch (error) {
        console.error('[VersionComparePanel] export diff failed', error)
        this.$message.error('导出失败，请稍后重试')
      } finally {
        this.exporting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.version-compare-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.version-compare-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.version-compare-panel__title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.version-compare-panel__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version-compare-panel__empty-tip {
  margin: 0;
}

.version-compare-panel__content {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.05);
}
</style>
