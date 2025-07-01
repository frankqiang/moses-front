/**
 * 工序管理模块Mock服务入口
 * 描述：统一注册基础工序和工艺路线管理的Mock API路由
 * 创建日期：2024-10-28
 */

const operationAPI = require('./operation')
const routingAPI = require('./routing')

// 导出所有工序管理相关的Mock路由
module.exports = [
  // 基础工序管理API路由
  // 获取基础工序列表
  {
    url: '/mes/master-data/process-management/operation/list',
    type: 'get',
    response: operationAPI.getOperationList
  },
  // 获取基础工序详情
  {
    url: '/mes/master-data/process-management/operation/detail',
    type: 'get',
    response: operationAPI.getOperationDetail
  },
  // 创建基础工序
  {
    url: '/mes/master-data/process-management/operation',
    type: 'post',
    response: operationAPI.createOperation
  },
  // 更新基础工序
  {
    url: '/mes/master-data/process-management/operation',
    type: 'put',
    response: operationAPI.updateOperation
  },
  // 更新工序状态
  {
    url: '/mes/master-data/process-management/operation/status',
    type: 'put',
    response: operationAPI.updateOperationStatus
  },
  // 删除基础工序
  {
    url: '/mes/master-data/process-management/operation',
    type: 'delete',
    response: operationAPI.deleteOperation
  },
  // 批量删除基础工序
  {
    url: '/mes/master-data/process-management/operation/batch',
    type: 'delete',
    response: operationAPI.batchDeleteOperation
  },
  // 获取启用的工序列表
  {
    url: '/mes/master-data/process-management/operation/enabled',
    type: 'get',
    response: operationAPI.getEnabledOperations
  },

  // 工艺路线管理API路由
  // 获取工艺路线列表
  {
    url: '/mes/master-data/process-management/routing/list',
    type: 'get',
    response: routingAPI.getRoutingList
  },
  // 获取工艺路线详情
  {
    url: '/mes/master-data/process-management/routing/detail',
    type: 'get',
    response: routingAPI.getRoutingDetail
  },
  // 创建工艺路线
  {
    url: '/mes/master-data/process-management/routing',
    type: 'post',
    response: routingAPI.createRouting
  },
  // 更新工艺路线
  {
    url: '/mes/master-data/process-management/routing',
    type: 'put',
    response: routingAPI.updateRouting
  },
  // 删除工艺路线
  {
    url: '/mes/master-data/process-management/routing',
    type: 'delete',
    response: routingAPI.deleteRouting
  },
  // 更新工艺路线状态
  {
    url: '/mes/master-data/process-management/routing/status',
    type: 'put',
    response: routingAPI.updateRoutingStatus
  },
  // 获取工艺路线步骤
  {
    url: '/mes/master-data/process-management/routing/steps',
    type: 'get',
    response: routingAPI.getRoutingSteps
  },
  // 更新工艺路线步骤
  {
    url: '/mes/master-data/process-management/routing/steps',
    type: 'put',
    response: routingAPI.updateRoutingSteps
  }
] 