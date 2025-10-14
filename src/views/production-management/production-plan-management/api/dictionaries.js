/**
 * 文件名称：dictionaries.js
 * 文件描述：生产计划模块枚举字典API
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

import service from '@/utils/request'
import { buildApiPath, API_ENDPOINTS } from '../constants/api-config'

/**
 * 获取所有枚举字典
 * @returns {Promise}
 */
export function getAllDictionaries() {
  return service({
    url: buildApiPath(API_ENDPOINTS.DICTIONARIES),
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
    url: buildApiPath(API_ENDPOINTS.DICTIONARY_BY_TYPE, { type }),
    method: 'get'
  })
}

