import request from '@/utils/request'

/**
 * 获取工艺路线列表
 * @param {object} params 查询参数
 */
export function getRoutingList(params) {
  return request({
    url: '/mes/process-management/routings',
    method: 'get',
    params
  })
} 