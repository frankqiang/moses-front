/**
 * 文件名称：dictionaries.js
 * 文件描述：工艺参数管理模块枚举字典API
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，参考生产计划模块实现
 */

import service from '@/utils/request'

// API基础路径
const BASE_URL = '/mdm/process-templates'

/**
 * 获取所有枚举字典
 * @returns {Promise}
 */
export function getAllDictionaries() {
  return service({
    url: `${BASE_URL}/dictionaries`,
    method: 'get'
  })
}

/**
 * 获取特定类型的枚举字典
 * @param {string} type - 字典类型
 * @returns {Promise}
 */
export function getDictionaryByType(type) {
  return service({
    url: `${BASE_URL}/dictionaries/${type}`,
    method: 'get'
  })
}

