/**
 * 文件名称：BasicInfo.vue
 * 文件描述：生产计划基本信息组件（只读展示）
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 *   - 2025-01-21: 删除编辑模式，改为只读展示
 *   - 2025-10-17: 根据接口文档重构，添加所有缺失字段，优化JSON对象展示
 *   - 2025-10-18: 添加备注说明(remarks)字段显示
 */

<template>
  <div class="basic-info">
    <div class="info-form">
      <!-- 计划基本信息 -->
      <div class="info-section">
        <div class="section-title">计划基本信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">计划编号：</span>
              <span class="info-value">{{ planData.planNumber || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">外部订单号：</span>
              <span class="info-value">{{ planData.externalOrderNumber || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">计划来源：</span>
              <span class="info-value">{{ getSourceText(planData.source) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">ERP同步批次号：</span>
              <span class="info-value">{{ planData.erpSyncBatchNo || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">计划优先级：</span>
              <status-tag
                v-if="planData.planPriority"
                :status="planData.planPriority"
                :text-map="planPriorityTextMap"
                :type-map="PLAN_PRIORITY_TYPE_MAP"
              />
              <span v-else class="info-value">-</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">计划状态：</span>
              <status-tag
                v-if="planData.status"
                :status="planData.status"
                :text-map="planStatusTextMap"
                :type-map="PLAN_STATUS_TYPE_MAP"
              />
              <span v-else class="info-value">-</span>
              <el-tag v-if="planData.isFrozen" type="danger" size="small" style="margin-left: 8px">
                已冻结
              </el-tag>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">完成进度：</span>
              <el-progress
                :percentage="planData.currentProgressPercentage || 0"
                :color="getProgressColor(planData.currentProgressPercentage)"
              />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 产品信息 -->
      <div class="info-section">
        <div class="section-title">产品信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">产品编码：</span>
              <span class="info-value">{{ planData.productCode || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">产品名称：</span>
              <span class="info-value">{{ planData.productName || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">需求数量：</span>
              <span class="info-value">
                {{ planData.demandQuantity }}{{ planData.demandUnit }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">需求单位：</span>
              <span class="info-value">{{ planData.demandUnit || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">计划交期：</span>
              <span class="info-value">
                {{ formatTime(planData.plannedDeliveryDate) }}
              </span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 客户信息 -->
      <div class="info-section">
        <div class="section-title">客户信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">客户名称：</span>
              <span class="info-value">{{ planData.customerName || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">客户编码：</span>
              <span class="info-value">{{ planData.customerCode || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="info-item">
              <span class="info-label">特殊要求：</span>
              <span class="info-value">{{ planData.specificRequirements || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <div class="info-item">
              <span class="info-label">备注说明：</span>
              <span class="info-value">{{ planData.remarks || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 工艺配置 -->
      <div class="info-section">
        <div class="section-title">工艺配置</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">默认工艺模板ID：</span>
              <span class="info-value">{{ planData.defaultProcessTemplateId || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">工艺模板关联类型：</span>
              <span class="info-value">
                {{ getProcessLinkTypeText(planData.processTemplateLinkType) }}
              </span>
            </div>
          </el-col>
        </el-row>
        <!-- 工艺能力快照（JSON对象） -->
        <el-row v-if="planData.referenceProcessCapability">
          <el-col :span="24">
            <div class="info-item">
              <span class="info-label">工艺能力快照：</span>
              <div class="info-value">
                <el-collapse accordion>
                  <el-collapse-item title="查看工艺参数详情" name="processCapability">
                    <pre class="json-display">{{ formatJsonObject(planData.referenceProcessCapability) }}</pre>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 操作人员信息 -->
      <div class="info-section">
        <div class="section-title">操作人员信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">创建人ID：</span>
              <span class="info-value">{{ planData.createdBy || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">最后更新人ID：</span>
              <span class="info-value">{{ planData.updatedBy || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 时间戳信息 -->
      <div class="info-section">
        <div class="section-title">时间信息</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ formatTime(planData.createdAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">更新时间：</span>
              <span class="info-value">{{ formatTime(planData.updatedAt) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">确认时间：</span>
              <span class="info-value">{{ formatTime(planData.confirmedAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">下达时间：</span>
              <span class="info-value">{{ formatTime(planData.releasedAt) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">完成时间：</span>
              <span class="info-value">{{ formatTime(planData.completedAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="info-label">取消时间：</span>
              <span class="info-value">{{ formatTime(planData.cancelledAt) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row v-if="planData.cancelReason">
          <el-col :span="24">
            <div class="info-item">
              <span class="info-label">取消原因：</span>
              <span class="info-value">{{ planData.cancelReason }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import StatusTag from '@/components/StatusTag'
import { parseTime } from '@/utils'
import dictionaryMixin from '../../mixins/dictionary'
import {
  PLAN_STATUS_TYPE_MAP,
  PLAN_PRIORITY_TYPE_MAP
} from '../../constants'

export default {
  name: 'BasicInfo',
  components: {
    StatusTag
  },
  mixins: [dictionaryMixin],
  props: {
    planData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      PLAN_STATUS_TYPE_MAP,
      PLAN_PRIORITY_TYPE_MAP
    }
  },
  computed: {
    // 计划状态文本映射（从字典生成，用于 StatusTag 组件）
    planStatusTextMap() {
      const map = {}
      if (this.planStatusOptions) {
        this.planStatusOptions.forEach(option => {
          map[option.value] = option.label
        })
      }
      return map
    },
    // 计划优先级文本映射（从字典生成，用于 StatusTag 组件）
    planPriorityTextMap() {
      const map = {}
      if (this.planPriorityOptions) {
        this.planPriorityOptions.forEach(option => {
          map[option.value] = option.label
        })
      }
      return map
    }
  },
  methods: {

    /**
     * 格式化时间
     */
    formatTime(time) {
      return time ? parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}') : '-'
    },

    /**
     * 获取来源文本
     */
    getSourceText(source) {
      return this.getPlanSourceLabel(source) || '-'
    },

    /**
     * 获取工艺模板关联类型文本
     * 根据接口文档附录：processTemplateLinkType枚举
     */
    getProcessLinkTypeText(linkType) {
      const map = {
        PRIMARY: '主工艺',
        BACKUP: '备用工艺',
        MANUAL_OVERRIDE: '手动指定'
      }
      return map[linkType] || linkType || '-'
    },

    /**
     * 格式化JSON对象为易读格式
     */
    formatJsonObject(obj) {
      if (!obj) return '-'
      try {
        return JSON.stringify(obj, null, 2)
      } catch (error) {
        console.error('JSON格式化失败:', error)
        return String(obj)
      }
    },

    /**
     * 获取进度条颜色
     */
    getProgressColor(percentage) {
      if (percentage >= 100) return '#67C23A'
      if (percentage >= 80) return '#409EFF'
      if (percentage >= 50) return '#E6A23C'
      return '#F56C6C'
    }
  }
}
</script>

<style lang="scss" scoped>
.basic-info {
  .info-section {
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;
    }
  }

  .info-value {
    display: inline-block;
    color: #606266;
    line-height: 32px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    min-height: 32px;

    .info-label {
      width: 140px;
      font-weight: 500;
      color: #606266;
      text-align: right;
      padding-right: 12px;
      line-height: 32px;
      flex-shrink: 0;
    }

    .info-value {
      color: #606266;
      line-height: 32px;
      flex: 1;
    }

    // 进度条特殊处理
    .el-progress {
      width: 100%;
      margin-top: 4px;
    }

    // 状态标签特殊处理
    .status-tag, .el-tag {
      margin-top: 4px;
    }

    // JSON展示容器样式
    .el-collapse {
      width: 100%;
      border: none;
    }

    .json-display {
      margin: 0;
      padding: 12px;
      background-color: #f5f7fa;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Courier New', Consolas, Monaco, monospace;
      color: #606266;
      line-height: 1.6;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>

