/**
 * Mock工具函数统一导出模块
 * 提供所有Mock相关的工具函数，包括参数解析和响应处理
 */

// 导入参数解析工具
const { param2Obj } = require('./param')

// 导入响应工具函数
const response = require('./response')

// 统一导出所有工具函数
module.exports = {
  // 参数解析工具
  param2Obj,
  
  // 响应工具函数
  ...response
}