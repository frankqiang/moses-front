/**
 * 用户管理模块常量导出
 * 文件描述：统一导出用户管理模块的所有常量定义
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 初始创建，定义基础常量
 *   - 2024-01-20: 重构为从user-management.js导入并重新导出
 *   - 2024-12-19: 调整为通配符导出方式，与register模块保持一致
 *   - 2024-12-23: 添加表格配置和表单配置的导出，参考operations模块范式
 *   - 2024-12-23: 按功能拆分常量文件，优化文件结构
 */

// 基础常量（状态、性别、部门、角色等枚举）
export * from './user-management'

// 表格配置
export * from './table-config'

// 表单配置
export * from './form-config'

// API配置
export * from './api-config'

// 消息配置
export * from './messages-config'
