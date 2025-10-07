<!--
文件名称：TemplateUsageDialog.vue
文件描述：工艺模板引用详情抽屉，对删除/作废等危险操作提供引用拦截提示
创建日期：2025-09-30
修改记录：
  - 2025-09-30: 初始创建，实现TASK009引用检查可视化
-->

<template>
  <Drawer
    :visible.sync="internalVisible"
    :title="dialogTitle"
    :width="drawerWidth"
    :loading="loading"
    :wrapper-closable="false"
    custom-class="template-usage-dialog"
    @close="handleClose"
  >
    <template #default>
      <div v-loading="loading" class="template-usage-dialog__body">
        <el-alert
          class="template-usage-dialog__alert"
          :type="alertType"
          :title="alertTitle"
          description="存在引用关系的模板无法继续当前操作，请先解除引用或联系相关业务人员。"
          show-icon
          :closable="false"
        />

        <section class="template-usage-dialog__section">
          <header class="template-usage-dialog__section-header">
            <div class="template-usage-dialog__section-title">
              <h3>{{ (template && template.templateName) || '未命名模板' }}</h3>
              <span class="template-usage-dialog__code">{{ template && template.templateCode }}</span>
            </div>
            <StatusTag
              v-if="template && template.status"
              :status="template.status"
              :text-map="templateStatusConfig.textMap"
              :type-map="templateStatusConfig.typeMap"
              size="mini"
            />
          </header>
          <p class="template-usage-dialog__summary">
            共发现
            <strong>{{ totalCount }}</strong>
            条引用记录，当前操作已被阻止。
          </p>
        </section>

        <section
          v-for="item in usageSections"
          :key="item.key"
          class="template-usage-dialog__section"
        >
          <header class="template-usage-dialog__section-header">
            <h4>{{ item.title }}</h4>
            <el-tag size="mini" type="info">{{ item.count }} 条</el-tag>
          </header>
          <div v-if="item.count" class="template-usage-dialog__tags">
            <OverflowTagsPopover
              :data="item.data"
              :max-show="3"
              :label-key="'label'"
              :tag-formatter="formatTagLabel"
              :popover-width="420"
              placement="top"
              size="mini"
            >
              <template #popover-item="{ item: refItem }">
                <div class="template-usage-dialog__tag-item">
                  <div class="template-usage-dialog__tag-main">
                    <span class="template-usage-dialog__tag-code">{{ refItem.label }}</span>
                    <StatusTag
                      v-if="refItem.status"
                      :status="refItem.status"
                      :text-map="referenceStatusMap"
                      :type-map="referenceStatusTypeMap"
                      size="mini"
                    />
                  </div>
                  <div v-if="refItem.extra" class="template-usage-dialog__tag-extra">
                    {{ refItem.extra }}
                  </div>
                </div>
              </template>
            </OverflowTagsPopover>
          </div>
          <el-alert
            v-else
            type="success"
            :closable="false"
            title="未检测到引用"
            show-icon
          />
        </section>
      </div>
    </template>

    <template #footer>
      <div class="template-usage-dialog__footer">
        <el-button type="primary" @click="handleClose">我已知晓</el-button>
      </div>
    </template>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import { TEMPLATE_STATUS_CONFIG } from '../constants/process-parameter-management'

export default {
  name: 'TemplateUsageDialog',
  components: {
    Drawer,
    StatusTag,
    OverflowTagsPopover
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    template: {
      type: Object,
      default: () => ({})
    },
    usage: {
      type: Object,
      default: () => ({})
    },
    operation: {
      type: String,
      default: 'delete'
    }
  },
  data() {
    return {
      internalVisible: false,
      drawerWidth: '520px',
      templateStatusConfig: TEMPLATE_STATUS_CONFIG
    }
  },
  computed: {
    dialogTitle() {
      const map = {
        delete: '删除被阻止 - 存在引用',
        void: '作废被阻止 - 存在引用'
      }
      return map[this.operation] || '操作被阻止'
    },
    alertType() {
      return this.operation === 'void' ? 'warning' : 'error'
    },
    alertTitle() {
      const operationText = this.operation === 'void' ? '作废' : '删除'
      return `检测到引用关系，无法${operationText}模板`
    },
    usageSections() {
      const usageData = this.usage || {}
      return [
        {
          key: 'plans',
          title: '生产计划',
          count: (usageData.planReferences || []).length,
          data: (usageData.planReferences || []).map(item => ({
            label: item.planNumber || item.id,
            status: item.status,
            extra: item.comment || ''
          }))
        },
        {
          key: 'planItems',
          title: '生产计划项',
          count: (usageData.planItemReferences || []).length,
          data: (usageData.planItemReferences || []).map(item => ({
            label: item.planItemNumber || item.id,
            status: item.status,
            extra: item.processStage || ''
          }))
        },
        {
          key: 'products',
          title: '关联铝箔产品',
          count: (usageData.productReferences || []).length,
          data: (usageData.productReferences || []).map(item => ({
            label: `${item.productCode || item.id}`,
            status: item.lifecycleStatus,
            extra: item.productName
          }))
        }
      ]
    },
    totalCount() {
      if (!this.usage) {
        return 0
      }
      if (typeof this.usage.totalReferenceCount === 'number') {
        return this.usage.totalReferenceCount
      }
      return this.usageSections.reduce((total, section) => total + section.count, 0)
    },
    referenceStatusMap() {
      return {
        在产: '在产',
        停产: '停产',
        下达: '已下达',
        草稿: '草稿',
        待审批: '待审批',
        完成: '完成'
      }
    },
    referenceStatusTypeMap() {
      return {
        在产: 'success',
        停产: 'danger',
        下达: 'warning',
        草稿: 'info',
        待审批: 'warning',
        完成: 'success'
      }
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.internalVisible = val
      }
    },
    internalVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    handleClose() {
      this.internalVisible = false
      this.$emit('close')
    },
    formatTagLabel(item) {
      if (!item) {
        return '-'
      }
      const statusText = item.status ? `（${item.status}）` : ''
      return `${item.label}${statusText}`
    }
  }
}
</script>

<style lang="scss" scoped>
.template-usage-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-usage-dialog__alert {
  margin-bottom: 4px;
}

.template-usage-dialog__section {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.04);
}

.template-usage-dialog__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.template-usage-dialog__section-title {
  display: flex;
  flex-direction: column;
  gap: 4px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #1f2d3d;
  }
}

.template-usage-dialog__code {
  font-size: 13px;
  color: #606266;
}

.template-usage-dialog__summary {
  margin: 0;
  font-size: 13px;
  color: #303133;
}

.template-usage-dialog__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.template-usage-dialog__tag-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
}

.template-usage-dialog__tag-main {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2d3d;
  font-weight: 500;
}

.template-usage-dialog__tag-extra {
  font-size: 12px;
  color: #909399;
}

.template-usage-dialog__footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
}

@media (max-width: 768px) {
  .template-usage-dialog__section {
    padding: 12px;
  }
}
</style>
