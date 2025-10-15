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
            <el-tag size="mini" :type="item.count > 0 ? 'warning' : 'success'">
              {{ item.count }} 条
            </el-tag>
          </header>
          <div v-if="item.count > 0" class="template-usage-dialog__content">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="总引用数">
                <el-tag type="warning" size="mini">{{ item.count }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="item.activeCount !== null" label="活跃引用数">
                <el-tag type="danger" size="mini">{{ item.activeCount }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <el-alert
              type="info"
              :closable="false"
              :title="`该模板被 ${item.count} 个${item.title.replace('引用', '').replace('关联', '')}引用`"
              description="详细的引用列表信息需联系生产计划管理员查看"
              show-icon
              style="margin-top: 12px;"
            />
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
import { TEMPLATE_STATUS_CONFIG } from '../constants/process-parameter-management'

export default {
  name: 'TemplateUsageDialog',
  components: {
    Drawer,
    StatusTag
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
      // 根据接口文档 v2.0，usage 数据结构为：
      // {
      //   productionPlans: { count, activeCount },
      //   productionPlanItems: { count, activeCount },
      //   products: { count },
      //   isInUse: boolean
      // }
      return [
        {
          key: 'plans',
          title: '生产计划引用',
          count: (usageData.productionPlans && usageData.productionPlans.count) || 0,
          activeCount: (usageData.productionPlans && usageData.productionPlans.activeCount) || 0
        },
        {
          key: 'planItems',
          title: '生产计划项引用',
          count: (usageData.productionPlanItems && usageData.productionPlanItems.count) || 0,
          activeCount: (usageData.productionPlanItems && usageData.productionPlanItems.activeCount) || 0
        },
        {
          key: 'products',
          title: '关联产品',
          count: (usageData.products && usageData.products.count) || 0,
          activeCount: null // 产品没有 activeCount
        }
      ]
    },
    totalCount() {
      if (!this.usage) {
        return 0
      }
      return this.usageSections.reduce((total, section) => total + section.count, 0)
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

.template-usage-dialog__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
