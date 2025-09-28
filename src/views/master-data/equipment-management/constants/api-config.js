/**
 * 文件名称：api-config.js
 * 文件描述：设备主数据管理模块接口路径与参数配置
 * 创建日期：2025-09-28
 * 修改记录：
 *   - 2025-09-28: 初始创建，定义 API 路径常量与默认参数
 */

export const EQUIPMENT_API_ENDPOINTS = {
  base: '/v1/mdm/equipments',
  detail: (equipmentId) => `/v1/mdm/equipments/${equipmentId}`
}

export const EQUIPMENT_LIST_DEFAULT_PARAMS = {
  includeDetails: true,
  limit: 10,
  page: 1,
  sortBy: 'createdAt:desc'
}

export const EQUIPMENT_QUERY_PARAM_MAP = {
  installationDateRange: ['installationDateFrom', 'installationDateTo'],
  nextMaintenanceDateRange: ['nextMaintenanceDateFrom', 'nextMaintenanceDateTo']
}

export const EQUIPMENT_MUTATION_REQUIRED_FIELDS = ['equipmentCode', 'name', 'equipmentType', 'communicationEndpoint', 'communicationParams']
