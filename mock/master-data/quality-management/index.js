/**
 * 质量管理模块Mock API路由统一入口
 * 功能描述：统一管理质量管理模块下所有子模块的Mock API路由
 * 创建日期：2024-12-19
 * 修改记录：
 *   - 2024-12-19: 创建质量管理模块路由入口
 */

// 导入各子模块的路由配置
const inspectionItemRoutes = require('./inspection-item-management')

// 可以在这里添加更多子模块的路由
// const inspectionPlanRoutes = require('./inspection-plan-management')
// const qualityReportRoutes = require('./quality-report-management')
// const nonConformityRoutes = require('./non-conformity-management')

/**
 * 质量管理模块所有路由配置
 * 采用扁平化结构，便于Mock服务器注册
 */
const qualityManagementRoutes = [
  // 检验项目管理路由
  ...inspectionItemRoutes,
  
  // 未来可以添加更多子模块路由
  // ...inspectionPlanRoutes,
  // ...qualityReportRoutes,
  // ...nonConformityRoutes
]

module.exports = qualityManagementRoutes