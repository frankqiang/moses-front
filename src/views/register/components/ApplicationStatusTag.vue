/**
 * 注册申请状态标签组件
 * 功能描述：基于全局StatusTag组件扩展，专门用于显示注册申请的各种状态
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现注册申请状态标签功能
 */
<template>
  <StatusTag
    :status="status"
    :text-map="statusTextMap"
    :type-map="statusTypeMap"
    :icon-map="statusIconMap"
    :color-map="statusColorMap"
    :enable-modern-features="enableModernFeatures"
    :clickable="clickable"
    :closable="closable"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
// 注册申请状态配置
const APPLICATION_STATUS_CONFIG = {
  // 状态文本映射
  textMap: {
    'pending': '待审核',
    'under_review': '审核中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'expired': '已过期',
    'cancelled': '已取消',
    'draft': '草稿'
  },

  // 状态类型映射（Element UI标签类型）
  typeMap: {
    'pending': 'warning',
    'under_review': 'primary',
    'approved': 'success',
    'rejected': 'danger',
    'expired': 'info',
    'cancelled': 'info',
    'draft': 'info'
  },

  // 状态图标映射
  iconMap: {
    'pending': 'el-icon-time',
    'under_review': 'el-icon-loading',
    'approved': 'el-icon-circle-check',
    'rejected': 'el-icon-circle-close',
    'expired': 'el-icon-warning-outline',
    'cancelled': 'el-icon-remove-outline',
    'draft': 'el-icon-edit-outline'
  },

  // 状态颜色映射（自定义颜色）
  colorMap: {
    'pending': '#E6A23C',
    'under_review': '#409EFF',
    'approved': '#67C23A',
    'rejected': '#F56C6C',
    'expired': '#909399',
    'cancelled': '#909399',
    'draft': '#909399'
  }
}

export default {
  name: 'ApplicationStatusTag',

  inheritAttrs: false,

  props: {
    /**
     * 申请状态
     * 可选值：pending, under_review, approved, rejected, expired, cancelled, draft
     */
    status: {
      type: [String, Number],
      required: true,
      validator(value) {
        const validStatuses = Object.keys(APPLICATION_STATUS_CONFIG.textMap)
        return validStatuses.includes(String(value))
      }
    },

    /**
     * 是否启用现代化特性
     */
    enableModernFeatures: {
      type: Boolean,
      default: true
    },

    /**
     * 是否可点击
     */
    clickable: {
      type: Boolean,
      default: false
    },

    /**
     * 是否可关闭
     */
    closable: {
      type: Boolean,
      default: false
    },

    /**
     * 自定义状态文本映射（会与默认配置合并）
     */
    customTextMap: {
      type: Object,
      default: () => ({})
    },

    /**
     * 自定义状态类型映射（会与默认配置合并）
     */
    customTypeMap: {
      type: Object,
      default: () => ({})
    },

    /**
     * 自定义状态图标映射（会与默认配置合并）
     */
    customIconMap: {
      type: Object,
      default: () => ({})
    },

    /**
     * 自定义状态颜色映射（会与默认配置合并）
     */
    customColorMap: {
      type: Object,
      default: () => ({})
    }
  },

  computed: {
    /**
     * 合并后的状态文本映射
     */
    statusTextMap() {
      return { ...APPLICATION_STATUS_CONFIG.textMap, ...this.customTextMap }
    },

    /**
     * 合并后的状态类型映射
     */
    statusTypeMap() {
      return { ...APPLICATION_STATUS_CONFIG.typeMap, ...this.customTypeMap }
    },

    /**
     * 合并后的状态图标映射
     */
    statusIconMap() {
      return { ...APPLICATION_STATUS_CONFIG.iconMap, ...this.customIconMap }
    },

    /**
     * 合并后的状态颜色映射
     */
    statusColorMap() {
      return { ...APPLICATION_STATUS_CONFIG.colorMap, ...this.customColorMap }
    }
  },

  methods: {
    /**
     * 获取状态描述信息
     * @param {string} status - 状态值
     * @returns {Object} 状态描述对象
     */
    getStatusDescription(status) {
      const descriptions = {
        'pending': '申请已提交，等待管理员审核',
        'under_review': '管理员正在审核您的申请',
        'approved': '申请已通过，账户已创建',
        'rejected': '申请被拒绝，请查看拒绝原因',
        'expired': '申请已过期，请重新提交',
        'cancelled': '申请已被取消',
        'draft': '申请尚未提交，仍为草稿状态'
      }

      return {
        text: this.statusTextMap[status] || '未知状态',
        description: descriptions[status] || '状态描述不可用',
        type: this.statusTypeMap[status] || 'info',
        icon: this.statusIconMap[status] || 'el-icon-question',
        color: this.statusColorMap[status] || '#909399'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// 组件特定样式（如果需要的话）
// 由于使用了全局StatusTag组件，大部分样式已经在全局组件中定义
</style>
