/**
 * 文件名称: constants/index.js
 * 文件描述: 设备健康度评分常量定义
 * 创建日期: 2024-01-20
 * 修改记录:
 *   - 2024-01-20: 初始创建
 */

// 健康等级配置
export const HEALTH_LEVEL_CONFIG = {
  '优秀': {
    color: '#67C23A',
    icon: 'el-icon-success',
    bgColor: '#f0f9ff',
    range: '90-100分',
    description: '状态良好，维持现有维护计划'
  },
  '良好': {
    color: '#409EFF',
    icon: 'el-icon-info',
    bgColor: '#ecf5ff',
    range: '75-89分',
    description: '正常运行，继续常规维护'
  },
  '一般': {
    color: '#E6A23C',
    icon: 'el-icon-warning',
    bgColor: '#fdf6ec',
    range: '60-74分',
    description: '需要关注，增加维护频次'
  },
  '差': {
    color: '#F56C6C',
    icon: 'el-icon-error',
    bgColor: '#fef0f0',
    range: '0-59分',
    description: '存在重大风险，立即检查'
  }
}

// 设备类型选项
export const EQUIPMENT_TYPE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '退火炉', value: '退火炉' },
  { label: '行车', value: '行车' },
  { label: '自动料车', value: '自动料车' },
  { label: '备料台', value: '备料台' }
]

// 排序字段选项
export const SORT_BY_OPTIONS = [
  { label: '健康度评分', value: 'healthScore' },
  { label: '设备编码', value: 'equipmentCode' },
  { label: '最后维护时间', value: 'lastMaintenance' }
]

// 排序方式选项
export const SORT_ORDER_OPTIONS = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' }
]

// 健康度评分算法说明
export const SCORING_ALGORITHM = {
  title: '设备健康度评分算法说明',
  description: '采用扣分制，初始分100分，根据5个维度的风险等级进行扣分',
  formula: '最终评分 = 100 - 故障次数扣分 - 维护完成率扣分 - 修复时间扣分 - 维护间隔扣分 - 设备状态扣分',
  dimensions: [
    {
      name: '故障次数评估',
      subtitle: '（最近3个月）',
      rules: [
        { condition: '0-3次', risk: '低风险', score: 0, description: '设备运行稳定，故障率正常' },
        { condition: '4-6次', risk: '中风险', score: 15, description: '故障频率偏高，需要关注' },
        { condition: '7次以上', risk: '高风险', score: 30, description: '故障频繁，存在系统性问题' }
      ]
    },
    {
      name: '维护完成率评估',
      subtitle: '（最近3个月）',
      rules: [
        { condition: '95%及以上', risk: '低风险', score: 0, description: '维护计划执行良好' },
        { condition: '80%-94%', risk: '中风险', score: 10, description: '维护计划执行一般，有待改善' },
        { condition: '80%以下', risk: '高风险', score: 20, description: '维护计划执行不力，存在隐患' }
      ]
    },
    {
      name: '平均修复时间评估',
      subtitle: '（MTTR）',
      rules: [
        { condition: '8小时以内', risk: '低风险', score: 0, description: '故障处理及时，修复能力强' },
        { condition: '8-24小时', risk: '中风险', score: 5, description: '故障处理一般，有改进空间' },
        { condition: '24小时以上', risk: '高风险', score: 15, description: '故障处理缓慢，影响生产' }
      ]
    },
    {
      name: '维护间隔评估',
      subtitle: '',
      rules: [
        { condition: '90天以内', risk: '低风险', score: 0, description: '维护及时，符合计划' },
        { condition: '90-180天', risk: '中风险', score: 10, description: '维护间隔偏长，需要关注' },
        { condition: '180天以上', risk: '高风险', score: 15, description: '维护严重滞后，存在重大隐患' }
      ]
    },
    {
      name: '设备状态评估',
      subtitle: '',
      rules: [
        { condition: '运行/停机', risk: '低风险', score: 0, description: '设备正常运行' },
        { condition: '维护中', risk: '中风险', score: 5, description: '设备正在维护，暂时不可用' },
        { condition: '故障', risk: '高风险', score: 20, description: '设备处于故障状态，需要紧急处理' }
      ]
    }
  ]
}

// 表格列配置
export const TABLE_COLUMNS = [
  { prop: 'equipmentCode', label: '设备编码', width: '120', sortable: true },
  { prop: 'equipmentName', label: '设备名称', width: '150' },
  { prop: 'equipmentType', label: '设备类型', width: '100' },
  { prop: 'healthScore', label: '健康度评分', width: '120', sortable: true, slotName: 'healthScore' },
  { prop: 'healthLevel', label: '健康等级', width: '120', slotName: 'healthLevel' },
  { prop: 'status', label: '设备状态', width: '100', slotName: 'status' },
  { prop: 'failureCount', label: '故障次数', width: '100', sortable: true },
  { prop: 'maintenanceCompletionRate', label: '维护完成率', width: '120', slotName: 'rate' },
  { prop: 'avgMTTR', label: '平均修复时间(h)', width: '140', sortable: true },
  { prop: 'daysSinceLastMaintenance', label: '距上次维护(天)', width: '150', sortable: true },
  { prop: 'actions', label: '操作', width: '120', fixed: 'right', slotName: 'actions' }
]

