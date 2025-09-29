/**
 * 文件名称：EquipmentDetailDrawer.vue
 * 文件描述：设备主数据管理详情抽屉组件，支持独立复用展示设备基础信息与类型化详情
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成 TASK007 P0 及 P1#6/#7/#10 要求
 */

<template>
  <Drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :loading="loading"
    :width="drawerWidth"
    :wrapper-closable="false"
    @close="handleClose"
    @cancel="handleClose"
  >
    <div class="equipment-detail-drawer">
      <div v-if="errorMessage" class="detail-alert">
        <el-alert
          show-icon
          type="error"
          :title="errorMessage"
          :closable="false"
        >
          <template #description>
            <el-button type="text" size="mini" @click="retryFetch">重新加载</el-button>
          </template>
        </el-alert>
      </div>

      <el-skeleton v-else-if="loading" animated :rows="6" class="detail-skeleton" />

      <div v-else-if="detailData" class="detail-content">
        <header class="detail-header">
          <div class="header-left">
            <div
              class="type-chip"
              :style="{ backgroundColor: typeColor }"
              aria-hidden="true"
            >
              {{ typeShortName }}
            </div>
            <div class="header-texts">
              <h2 class="detail-title">{{ detailData.name || '-' }}</h2>
              <div class="detail-meta">
                <StatusTag
                  :status="detailData.status"
                  :text-map="statusConfig.textMap"
                  :type-map="statusConfig.typeMap"
                />
                <el-tag size="small" class="type-tag">
                  {{ equipmentTypeLabel }}
                </el-tag>
                <span v-if="detailData.updatedAt" class="meta-item">
                  最近更新：{{ formatDate(detailData.updatedAt) }}
                </span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <el-button
              v-if="detailData"
              type="text"
              icon="el-icon-edit-outline"
              class="header-edit"
              @click="handleEdit"
            >
              编辑设备
            </el-button>
          </div>
        </header>

        <div class="detail-section">
          <h3 class="section-title">基础信息</h3>
          <div class="info-grid">
            <detail-item
              v-for="item in basicInfoItems"
              :key="item.key"
              :label="item.label"
              :value="item.value"
              :copyable="item.copyable"
              :unit="item.unit"
              :tooltip="item.tooltip"
              @copy="handleCopy"
            />
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">通讯参数</h3>
          <div class="info-grid">
            <detail-item
              v-for="item in communicationItems"
              :key="item.key"
              :label="item.label"
              :value="item.value"
              :unit="item.unit"
              :copyable="item.copyable"
              :is-key-value="item.isKeyValue"
              :tooltip="item.tooltip"
              @copy="handleCopy"
            />
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">维护计划</h3>
          <div class="info-grid">
            <detail-item
              v-for="item in maintenanceItems"
              :key="item.key"
              :label="item.label"
              :value="item.value"
              :unit="item.unit"
              :tooltip="item.tooltip"
            />
          </div>
        </div>

        <div v-if="detailItems.length" class="detail-section">
          <h3 class="section-title">{{ detailSectionTitle }}</h3>
          <div class="info-grid">
            <detail-item
              v-for="item in detailItems"
              :key="item.key"
              :label="item.label"
              :value="item.value"
              :unit="item.unit"
              :is-key-value="item.isKeyValue"
              :tooltip="item.tooltip"
            />
          </div>
        </div>

        <div v-if="detailData.remark" class="detail-section">
          <h3 class="section-title">备注信息</h3>
          <div class="remark-card">{{ detailData.remark }}</div>
        </div>
      </div>

      <el-empty v-else description="暂无设备详情数据" />
    </div>

    <template #footer>
      <div class="detail-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button
          v-if="detailData"
          type="primary"
          icon="el-icon-edit-outline"
          class="footer-edit"
          @click="handleEdit"
        >
          编辑设备
        </el-button>
      </div>
    </template>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import {
  EQUIPMENT_TYPE_MAP,
  EQUIPMENT_TYPE_COLORS,
  EQUIPMENT_FIELD_UNITS,
  EQUIPMENT_DETAIL_LABELS
} from '../constants/equipment-management'
import { STATUS_CONFIG } from '../constants/table-config'
import { MESSAGE_FALLBACKS } from '../constants/messages-config'
import { getEquipmentDetail } from '../api'
import { parseTime } from '@/utils'
import {
  EQUIPMENT_COMMUNICATION_MAPPINGS,
  EQUIPMENT_MAINTENANCE_MAPPINGS,
  EQUIPMENT_DETAIL_SECTION_MAPPINGS,
  EQUIPMENT_DETAIL_TOOLTIPS
} from '../constants/detail-config'

const DetailItem = {
  name: 'DetailItem',
  functional: true,
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number, Array, Object],
      default: ''
    },
    unit: {
      type: String,
      default: ''
    },
    copyable: {
      type: Boolean,
      default: false
    },
    isKeyValue: {
      type: Boolean,
      default: false
    },
    tooltip: {
      type: String,
      default: ''
    }
  },
  render(h, { props, listeners }) {
    const renderList = () => {
      if (!props.isKeyValue || !Array.isArray(props.value)) {
        return null
      }
      return h('ul', { class: 'detail-item__list' }, props.value.map(item => h('li', { key: item.key }, [
        h('span', { class: 'detail-item__list-key' }, `${item.key}: `),
        h('span', { class: 'detail-item__list-value' }, item.value || '-')
      ])))
    }

    const displayValue = () => {
      if (props.isKeyValue && Array.isArray(props.value)) {
        return renderList()
      }
      if (props.value === undefined || props.value === null || props.value === '') {
        return h('span', { class: 'detail-item__value-text' }, '-')
      }
      return h('span', { class: 'detail-item__value-text' }, [props.value, props.unit ? ` ${props.unit}` : ''])
    }

    const copyButton = props.copyable && props.value
      ? h('el-tooltip', {
        props: {
          content: '复制',
          placement: 'top'
        }
      }, [
        h('el-button', {
          class: 'detail-item__copy',
          props: {
            type: 'text',
            icon: 'el-icon-document-copy'
          },
          on: {
            click: () => listeners.copy && listeners.copy({ value: props.value, label: props.label })
          }
        })
      ])
      : null

    const labelNode = props.tooltip
      ? h('span', { class: 'detail-item__label' }, [
        props.label,
        h('el-tooltip', {
          props: {
            content: props.tooltip,
            placement: 'top'
          }
        }, [
          h('i', { class: 'el-icon-info detail-item__label-icon' })
        ])
      ])
      : h('span', { class: 'detail-item__label' }, props.label)

    return h('div', { class: 'detail-item' }, [
      labelNode,
      h('div', { class: 'detail-item__value' }, [displayValue(), copyButton])
    ])
  }
}

export default {
  name: 'EquipmentDetailDrawer',
  components: {
    Drawer,
    StatusTag,
    DetailItem
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    equipmentId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      detailData: null,
      statusConfig: STATUS_CONFIG,
      pendingToken: null
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    drawerTitle() {
      if (!this.detailData) {
        return '设备详情'
      }
      return `${this.detailData.name || '设备'}详情`
    },
    drawerWidth() {
      return '920px'
    },
    equipmentTypeLabel() {
      if (!this.detailData) {
        return '未知类型'
      }
      return EQUIPMENT_TYPE_MAP[this.detailData.equipmentType] || '未知类型'
    },
    typeColor() {
      if (!this.detailData) {
        return '#909399'
      }
      return EQUIPMENT_TYPE_COLORS[this.detailData.equipmentType] || '#909399'
    },
    typeShortName() {
      if (!this.detailData) {
        return '设'
      }
      const label = this.equipmentTypeLabel
      return label ? label.charAt(0) : '设'
    },
    detailSectionTitle() {
      if (!this.detailData) {
        return '设备详情'
      }
      const label = this.equipmentTypeLabel
      return `${label}详情`
    },
    basicInfoItems() {
      if (!this.detailData) {
        return []
      }
      return [
        {
          key: 'equipmentCode',
          label: '设备编号',
          value: this.detailData.equipmentCode,
          copyable: true
        },
        {
          key: 'name',
          label: '设备名称',
          value: this.detailData.name
        },
        {
          key: 'equipmentType',
          label: '设备类型',
          value: this.equipmentTypeLabel
        },
        {
          key: 'status',
          label: '设备状态',
          value: this.statusConfig.textMap[this.detailData.status] || this.detailData.status
        },
        {
          key: 'model',
          label: '型号',
          value: this.detailData.model
        },
        {
          key: 'manufacturer',
          label: '制造商',
          value: this.detailData.manufacturer
        },
        {
          key: 'locationDescription',
          label: '位置描述',
          value: this.detailData.locationDescription
        },
        {
          key: 'installationDate',
          label: '安装日期',
          value: this.detailData.installationDate ? this.formatDate(this.detailData.installationDate) : ''
        }
      ]
    },
    communicationItems() {
      if (!this.detailData) {
        return []
      }

      const mapped = EQUIPMENT_COMMUNICATION_MAPPINGS.map(item => ({
        ...item,
        value: this.detailData[item.key],
        unit: item.unit,
        tooltip: EQUIPMENT_DETAIL_TOOLTIPS[item.key]
      }))

      if (this.detailData.communicationParams && Object.keys(this.detailData.communicationParams).length) {
        mapped.push({
          key: 'communicationParams',
          label: '通讯参数',
          value: this.normalizeKeyValue(this.detailData.communicationParams),
          isKeyValue: true,
          tooltip: EQUIPMENT_DETAIL_TOOLTIPS.controlInterfaceParams
        })
      }

      return mapped
    },
    maintenanceItems() {
      if (!this.detailData) {
        return []
      }
      return EQUIPMENT_MAINTENANCE_MAPPINGS.map(item => ({
        ...item,
        value: this.formatMaintenanceValue(item.key, this.detailData[item.key])
      }))
    },
    detailItems() {
      if (!this.detailData || !this.detailData.detail) {
        return []
      }

      const detail = this.detailData.detail
      const items = []

      Object.keys(detail).forEach((key) => {
        const rawValue = detail[key]
        const mapping = EQUIPMENT_DETAIL_SECTION_MAPPINGS[key] || {}
        const label = mapping.label || EQUIPMENT_DETAIL_LABELS[key] || key

        if (rawValue === undefined || rawValue === null || rawValue === '') {
          return
        }

        if (typeof rawValue === 'object' && rawValue !== null) {
          items.push({
            key,
            label,
            value: this.normalizeKeyValue(rawValue),
            isKeyValue: true,
            tooltip: EQUIPMENT_DETAIL_TOOLTIPS[key]
          })
          return
        }

        items.push({
          key,
          label,
          value: rawValue,
          unit: mapping.unit || EQUIPMENT_FIELD_UNITS[key],
          tooltip: EQUIPMENT_DETAIL_TOOLTIPS[key]
        })
      })

      return items
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.fetchDetail()
      } else {
        this.resetState()
      }
    },
    equipmentId() {
      if (this.visible) {
        this.fetchDetail()
      }
    }
  },
  methods: {
    formatDate(value) {
      const formatted = parseTime(value, '{y}-{m}-{d}')
      return formatted || '-'
    },
    async fetchDetail() {
      if (!this.equipmentId) {
        this.detailData = null
        return
      }

      this.loading = true
      this.errorMessage = ''
      const token = Symbol('equipment-detail-request')
      this.pendingToken = token

      try {
        const response = await getEquipmentDetail(this.equipmentId, { includeDetails: true })
        if (this.pendingToken !== token) {
          return
        }
        if (response.success) {
          this.detailData = response.data
        } else {
          this.errorMessage = response.error?.message || MESSAGE_FALLBACKS.fetchDetailError
        }
      } catch (error) {
        if (this.pendingToken !== token) {
          return
        }
        this.errorMessage = error?.message || MESSAGE_FALLBACKS.fetchDetailError
        console.error('[EquipmentDetailDrawer] fetchDetail error:', error)
      } finally {
        if (this.pendingToken === token) {
          this.loading = false
          this.pendingToken = null
        }
      }
    },
    normalizeKeyValue(value) {
      if (!value || typeof value !== 'object') {
        return []
      }
      return Object.entries(value).map(([key, val]) => ({
        key,
        value: Array.isArray(val) ? val.join(', ') : val
      }))
    },
    formatMaintenanceValue(key, value) {
      if (value === undefined || value === null || value === '') {
        return ''
      }
      if (key === 'maintenanceCycleDays') {
        return value
      }
      return this.formatDate(value)
    },
    async handleCopy({ value, label }) {
      if (!value) {
        this.$message.warning('暂无可复制内容')
        return
      }
      try {
        await this.copyToClipboard(value)
        this.$message.success(`${label}已复制`)
      } catch (error) {
        console.error('[EquipmentDetailDrawer] copy failed:', error)
        this.$message.warning('复制失败，请手动复制')
      }
    },
    async copyToClipboard(text) {
      const stringValue = String(text)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(stringValue)
        return
      }
      const textarea = document.createElement('textarea')
      textarea.value = stringValue
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'absolute'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    },
    handleEdit() {
      if (!this.detailData) {
        return
      }
      this.$emit('edit', this.detailData)
    },
    handleClose() {
      this.$emit('update:visible', false)
      this.$nextTick(() => {
        this.resetState()
        this.$emit('close')
      })
    },
    retryFetch() {
      this.fetchDetail()
    },
    resetState() {
      this.loading = false
      this.errorMessage = ''
      this.detailData = null
      this.pendingToken = null
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-detail-drawer {
  min-height: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 4px;
}

.detail-alert {
  margin-top: 8px;
}

.detail-skeleton {
  padding: 8px 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.type-chip {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.header-texts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #909399;
}

.type-tag {
  border: none;
  background-color: #f5f7fa;
  color: #606266;
}

.meta-item {
  display: inline-flex;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-edit {
  color: #409eff;
}

.footer-edit {
  min-width: 120px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f9fafc;
  border-radius: 8px;
  min-height: 72px;
}

.detail-item__label {
  font-size: 12px;
  color: #909399;
}

.detail-item__value {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #303133;
  font-size: 14px;
}

.detail-item__value-text {
  word-break: break-word;
  line-height: 20px;
}

.detail-item__copy {
  padding: 0;
  font-size: 14px;
}

.detail-item__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item__list-key {
  font-weight: 500;
  margin-right: 4px;
}

.detail-item__list-value {
  color: #303133;
}

.remark-card {
  padding: 16px;
  border-radius: 8px;
  background: #fef6e8;
  color: #804b00;
  line-height: 20px;
}

.detail-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

