import request from '@/utils/request'

const BASE_URL = '/mes/v1/master-data/process-management/routings'

/**
 * 获取工艺路线列表
 * @param {object} params 查询参数
 */
export function getRoutingList(params) {
  return request({
    url: BASE_URL,
    method: 'get',
    params
  })
}

/**
 * 创建新的工艺路线
 * @param {object} data 工艺路线数据
 */
export function createRouting(data) {
  return request({
    url: BASE_URL,
    method: 'post',
    data
  })
}

/**
 * 更新工艺路线
 * @param {object} data 工艺路线数据
 */
export function updateRouting(data) {
  return request({
    url: `${BASE_URL}/${data.id}`,
    method: 'put',
    data
  })
}

export default {
  getRoutingList,
  createRouting,
  updateRouting
}
