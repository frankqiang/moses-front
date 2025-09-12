/**
 * 登录模块API入口
 * 文件描述：统一导出登录模块相关的API方法
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 重构为模块化组织方式，分离认证和token管理功能
 */

// 导出认证相关API
export * from './auth'

// 导出token管理相关API
export * from './token'

// 默认导出（保持向后兼容）
export { default as authAPI } from './auth'
export { default as tokenAPI } from './token'
