/**
 * 检验项目管理模块Mock数据
 * 功能描述：提供检验项目的基础数据和生成函数
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-19: 创建检验项目基础数据
 */

const Mock = require('mockjs')

// 检验方法类型
const inspectionMethods = ['VISUAL', 'MEASUREMENT', 'TESTING', 'SAMPLING', 'CHEMICAL']
const inspectionMethodTextMap = {
  'VISUAL': '目视检验',
  'MEASUREMENT': '测量检验',
  'TESTING': '试验检验',
  'SAMPLING': '抽样检验',
  'CHEMICAL': '化学检验'
}

// 适用产品类型
const applicableProducts = ['PRODUCT_A', 'PRODUCT_B', 'PRODUCT_C', 'ALL']
const applicableProductTextMap = {
  'PRODUCT_A': '产品A',
  'PRODUCT_B': '产品B',
  'PRODUCT_C': '产品C',
  'ALL': '全部产品'
}

// 检验类别类型
const inspectionCategories = ['Appearance', 'Dimension', 'Performance', 'Chemical', 'Physical', 'Mechanical']
const inspectionCategoryTextMap = {
  'Appearance': '外观检验',
  'Dimension': '尺寸检验',
  'Performance': '性能检验',
  'Chemical': '化学成分',
  'Physical': '物理性能',
  'Mechanical': '机械性能'
}

// 数据类型
const dataTypes = ['Numeric', 'Text', 'Boolean', 'Enum', 'Range']
const dataTypeTextMap = {
  'Numeric': '数值型',
  'Text': '文本型',
  'Boolean': '布尔型',
  'Enum': '枚举型',
  'Range': '范围型'
}

/**
 * 生成检验项目基础数据
 */
const generateInspectionItemsData = () => {
  const inspectionItemList = []

  // 预设一些基础检验项目
  const baseInspectionItems = [
    { id: 1, code: 'QI-001', name: '外观检验', method: 'VISUAL', product: 'ALL', category: 'Appearance', dataType: 'Text' },
    { id: 2, code: 'QI-002', name: '尺寸测量', method: 'MEASUREMENT', product: 'PRODUCT_A', category: 'Dimension', dataType: 'Numeric' },
    { id: 3, code: 'QI-003', name: '强度测试', method: 'TESTING', product: 'PRODUCT_B', category: 'Performance', dataType: 'Numeric' },
    { id: 4, code: 'QI-004', name: '成分分析', method: 'CHEMICAL', product: 'PRODUCT_C', category: 'Chemical', dataType: 'Range' },
    { id: 5, code: 'QI-005', name: '抽样检验', method: 'SAMPLING', product: 'ALL', category: 'Physical', dataType: 'Boolean' }
  ]

  // 添加预设检验项目
  baseInspectionItems.forEach(item => {
    inspectionItemList.push({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      categoryText: inspectionCategoryTextMap[item.category],
      dataType: item.dataType,
      dataTypeText: dataTypeTextMap[item.dataType],
      inspectionMethod: item.method,
      inspectionMethodText: inspectionMethodTextMap[item.method],
      applicableProduct: item.product,
      applicableProductText: applicableProductTextMap[item.product],
      standardValue: Mock.mock('@float(1, 100, 2, 2)'),
      toleranceRange: Mock.mock('@float(0.1, 5, 1, 2)'),
      unit: Mock.mock('@pick(["mm", "kg", "MPa", "%", "个"])'),
      description: `${item.name}的详细说明和检验要求`,
      status: Mock.mock('@pick([0, 1])'),
      createTime: Mock.mock('@datetime'),
      updateTime: Mock.mock('@datetime'),
      createdBy: Mock.mock('@cname'),
      updatedBy: Mock.mock('@cname')
    })
  })

  // 生成更多随机检验项目
  for (let i = 6; i <= 50; i++) {
    const method = Mock.mock('@pick(["VISUAL", "MEASUREMENT", "TESTING", "SAMPLING", "CHEMICAL"])')
    const product = Mock.mock('@pick(["PRODUCT_A", "PRODUCT_B", "PRODUCT_C", "ALL"])')
    const category = Mock.mock('@pick(["Appearance", "Dimension", "Performance", "Chemical", "Physical", "Mechanical"])')
    const dataType = Mock.mock('@pick(["Numeric", "Text", "Boolean", "Enum", "Range"])')
    
    inspectionItemList.push({
      id: i,
      code: `QI-${String(i).padStart(3, '0')}`,
      name: Mock.mock('@ctitle(3, 8)'),
      category: category,
      categoryText: inspectionCategoryTextMap[category],
      dataType: dataType,
      dataTypeText: dataTypeTextMap[dataType],
      inspectionMethod: method,
      inspectionMethodText: inspectionMethodTextMap[method],
      applicableProduct: product,
      applicableProductText: applicableProductTextMap[product],
      standardValue: Mock.mock('@float(1, 100, 2, 2)'),
      toleranceRange: Mock.mock('@float(0.1, 5, 1, 2)'),
      unit: Mock.mock('@pick(["mm", "kg", "MPa", "%", "个"])'),
      description: Mock.mock('@cparagraph(1, 3)'),
      status: Mock.mock('@pick([0, 1])'),
      createTime: Mock.mock('@datetime'),
      updateTime: Mock.mock('@datetime'),
      createdBy: Mock.mock('@cname'),
      updatedBy: Mock.mock('@cname')
    })
  }

  return inspectionItemList
}

// 导出数据和配置
module.exports = {
  data: generateInspectionItemsData(),
  inspectionMethods,
  inspectionMethodTextMap,
  applicableProducts,
  applicableProductTextMap,
  inspectionCategories,
  inspectionCategoryTextMap,
  dataTypes,
  dataTypeTextMap
}