/**
 * 关联数据表格混入
 * 功能描述：处理炉型关联设备和工艺模板的简单展示逻辑
 * 创建日期：2024-12-19
 * 优化日期：2024-12-19 - 简化表格显示，删除搜索功能
 */

export default {
  data() {
    return {
      // 当前活动标签页
      activeTab: 'equipment'
    }
  },

  computed: {

    // 设备表格列配置
    equipmentColumns() {
      return [
        { prop: 'equipmentId', label: '设备ID', width: '200', align: 'center' },
        { prop: 'name', label: '设备名称', minWidth: '300' }
      ]
    },

    // 模板表格列配置
    templateColumns() {
      return [
        { prop: 'templateId', label: '模板ID', width: '200', align: 'center' },
        { prop: 'templateName', label: '模板名称', minWidth: '300' }
      ]
    },

    // 关联设备数据（直接返回，不过滤）
    filteredEquipment() {
      return this.relatedEquipment || []
    },

    // 关联模板数据（直接返回，不过滤）
    filteredTemplates() {
      return this.relatedTemplates || []
    }
  },

  methods: {
    // 标签页切换
    handleTabClick(tab) {
      this.activeTab = tab.name
    },

    // 重置关联数据状态
    resetRelatedDataState() {
      this.activeTab = 'equipment'
    }
  }
}
