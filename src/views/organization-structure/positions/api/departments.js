/**
 * 文件名称：departments.js
 * 文件描述：岗位管理模块中的部门相关API，用于获取部门选项数据
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 从岗位API中分离出部门相关功能
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
 * @returns {Promise} 返回格式化后的部门选项数据，适合下拉框使用
 */
export function getDepartmentOptions(params = {}) {
  // 设置默认参数，适合选择器使用
  const apiParams = {
    status: 'active', // 只获取激活状态的部门
    limit: 100, // 获取较多数据用于选择
    page: 1,
    sortBy: 'level:asc,sortOrder:asc', // 按层级和排序顺序排列
    ...params
  }

  return request({
    url: '/departments',
    method: 'get',
    params: apiParams
  }).then(response => {
    // 将API响应转换为适合下拉框使用的格式
    if (response && response.success && response.data && response.data.results) {
      const departments = response.data.results

      // 转换为下拉框选项格式
      const options = departments.map(dept => ({
        value: dept.id,
        label: dept.name,
        code: dept.code,
        description: dept.description,
        level: dept.level,
        parentId: dept.parentId,
        status: dept.status,
        // 用于显示层级结构的标签
        labelWithLevel: `${'  '.repeat((dept.level || 1) - 1)}${dept.name}`,
        // 完整的显示文本（包含编码）
        fullLabel: `${dept.name} (${dept.code})`
      }))

      return {
        ...response,
        data: {
          ...response.data,
          options // 添加格式化后的选项数据
        }
      }
    }

    return response
  })
}
