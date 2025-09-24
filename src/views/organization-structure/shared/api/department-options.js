/**
 * 文件名称：department-options.js
 * 文件描述：组织结构模块共享的部门选项API封装，供部门与岗位等子模块复用
 * 创建日期：2025-09-24
 * 修改记录：
 *   - 2025-09-24: 抽离部门选项接口，统一供多模块使用
 */

import request from '@/utils/request'

/**
 * 获取部门选项列表（用于下拉框和选择器组件）
 * @param {Object} params - 查询参数
 * @param {string} [params.status=active] - 部门状态筛选 (active/inactive)
 * @param {string} [params.name] - 按部门名称模糊查询
 * @param {number} [params.level] - 按部门层级筛选
 * @param {string} [params.parentId] - 按父部门ID筛选
 * @param {number} [params.limit=100] - 每页最大结果数 (1-100)
 * @param {number} [params.page=1] - 页码 (>=1)
 * @param {string} [params.sortBy=level:asc,sortOrder:asc] - 排序选项
 * @returns {Promise} 返回包含格式化选项的接口响应
 */
export function getDepartmentOptions(params = {}) {
  const apiParams = {
    status: 'active',
    limit: 100,
    page: 1,
    sortBy: 'level:asc,sortOrder:asc',
    ...params
  }

  return request({
    url: '/departments',
    method: 'get',
    params: apiParams
  }).then(response => {
    if (response && response.success && response.data && response.data.results) {
      const departments = response.data.results

      const options = departments.map(dept => ({
        value: dept.id,
        label: dept.name,
        code: dept.code,
        description: dept.description,
        level: dept.level,
        parentId: dept.parentId,
        status: dept.status,
        labelWithLevel: `${'  '.repeat((dept.level || 1) - 1)}${dept.name}`,
        fullLabel: `${dept.name} (${dept.code})`
      }))

      return {
        ...response,
        data: {
          ...response.data,
          options
        }
      }
    }

    return response
  })
}
