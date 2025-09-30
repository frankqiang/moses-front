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

        <el-collapse-item title="温度段配置" name="segments">
          <DiffList
            :items="compareResult.segments"
            item-title="段序号"
            :highlight-mode="highlightMode"
            :format-item="formatSegment"
          />
        </el-collapse-item>

        <el-collapse-item title="保护气氛配置" name="atmosphere">
          <DiffList
            :items="compareResult.atmosphereSettings"
            item-title="气氛类型"
            :highlight-mode="highlightMode"
            :format-item="formatAtmosphere"
          />
        </el-collapse-item>

        <el-collapse-item title="循环风机配置" name="fans">
          <DiffList
            :items="compareResult.fanSettings"
            item-title="频率设定"
            :highlight-mode="highlightMode"
            :format-item="formatFan"
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
      activeSections: ['basic', 'segments', 'atmosphere', 'fans'],
      highlightMode: 'diff'
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
    currentVersion: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadOtherVersions()
        }
      }
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
        const list = response.data?.versions?.list || []
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

      const versionInfo = [
        {
          label: '版本号',
          current: raw.baseVersion?.versionNumber,
          compare: raw.compareVersion?.versionNumber,
          changed: raw.versionInfo?.versionNumber?.changed
        },
        {
          label: '版本状态',
          current: raw.baseVersion?.status,
          compare: raw.compareVersion?.status,
          changed: raw.versionInfo?.status?.changed
        },
        {
          label: '生效时间',
          current: this.formatDate(raw.baseVersion?.effectiveDate),
          compare: this.formatDate(raw.compareVersion?.effectiveDate),
          changed: raw.versionInfo?.effectiveDate?.changed
        }
      ]

      const transformList = (section = {}) => {
        const results = []
        const baseList = section.base || []
        const compareList = section.compare || []
        const maxLength = Math.max(baseList.length, compareList.length)
        for (let i = 0; i < maxLength; i += 1) {
          results.push({
            current: cloneDeep(baseList[i]) || null,
            compare: cloneDeep(compareList[i]) || null,
            changed: section.changed && section.changed[i]
          })
        }
        return results
      }

      return {
        versionInfo,
        segments: transformList(raw.segments),
        atmosphereSettings: transformList(raw.atmosphereSettings),
        fanSettings: transformList(raw.fanSettings)
      }
    },

    formatSegment(item) {
      if (!item) return '-'
      return `段序号：${item.segmentOrder || '-'}，类型：${item.segmentType || '-'}`
    },

    formatAtmosphere(item) {
      if (!item) return '-'
      return `${item.atmosphereType || '-'}（流量：${item.flowRate || '-'} m³/h）`
    },

    formatFan(item) {
      if (!item) return '-'
      return `频率：${item.frequency || '-'} Hz，模式：${item.mode || '-'}`
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
