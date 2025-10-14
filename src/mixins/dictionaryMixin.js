/**
 * 文件名称：dictionaryMixin.js
 * 文件描述：枚举字典Mixin - 让组件可以方便地访问字典数据
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

export default {
  computed: {
    // 计划状态选项
    planStatusOptions() {
      return this.$store.getters['dictionary/planStatusOptions']
    },
    // 子批次状态选项
    planItemStatusOptions() {
      return this.$store.getters['dictionary/planItemStatusOptions']
    },
    // 计划优先级选项
    planPriorityOptions() {
      return this.$store.getters['dictionary/planPriorityOptions']
    },
    // 计划来源选项
    planSourceOptions() {
      return this.$store.getters['dictionary/planSourceOptions']
    }
  },
  methods: {
    // 获取计划状态标签
    getPlanStatusLabel(status) {
      return this.$store.getters['dictionary/getPlanStatusLabel'](status)
    },
    // 获取子批次状态标签
    getPlanItemStatusLabel(status) {
      return this.$store.getters['dictionary/getPlanItemStatusLabel'](status)
    },
    // 获取计划优先级标签
    getPlanPriorityLabel(priority) {
      return this.$store.getters['dictionary/getPlanPriorityLabel'](priority)
    },
    // 获取计划来源标签
    getPlanSourceLabel(source) {
      return this.$store.getters['dictionary/getPlanSourceLabel'](source)
    },
    // 获取工艺模板关联类型标签
    getProcessTemplateLinkTypeLabel(type) {
      return this.$store.getters['dictionary/getProcessTemplateLinkTypeLabel'](type)
    },
    // 获取设备关联类型标签
    getEquipmentLinkTypeLabel(type) {
      return this.$store.getters['dictionary/getEquipmentLinkTypeLabel'](type)
    },
    // 获取变更类型标签
    getChangeTypeLabel(type) {
      return this.$store.getters['dictionary/getChangeTypeLabel'](type)
    },
    // 获取操作来源标签
    getOperationSourceLabel(source) {
      return this.$store.getters['dictionary/getOperationSourceLabel'](source)
    }
  }
}

