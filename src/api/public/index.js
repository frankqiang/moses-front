/**
 * 文件名称：index.js
 * 文件描述：公开API模块统一导出入口，提供无需认证的公开接口
 * 创建日期：2024-09-25
 * 修改记录：
 *   - 2024-09-25: 初始创建，统一导出公开组织架构API
 */

export * from './public-organization'

/**
 * 公开API模块说明
 *
 * 本模块提供无需认证的公开接口，专门为用户注册流程设计。
 * 解决了注册时需要选择部门、岗位、管理者等信息但用户尚未认证的循环依赖问题。
 *
 * === 主要接口 ===
 *
 * 基础接口：
 * - getPublicDepartments() - 获取公开部门列表
 * - getPublicDepartmentTree() - 获取公开部门树形结构
 * - getPublicPositions() - 获取公开岗位列表
 * - getPublicManagers() - 获取公开管理者列表
 *
 * 选项接口（与原有API格式兼容）：
 * - getPublicDepartmentOptions() - 获取部门选项列表
 * - getPublicPositionOptions() - 获取岗位选项列表
 * - getPublicManagerOptions() - 获取管理者选项列表
 *
 * 批量接口：
 * - getRegistrationOptions() - 批量获取注册所需的所有选项数据
 *
 * === 使用示例 ===
 *
 * ```javascript
 * import {
 *   getPublicDepartmentOptions,
 *   getPublicPositionOptions,
 *   getPublicManagerOptions,
 *   getRegistrationOptions
 * } from '@/api/public'
 *
 * // 获取部门选项（树形结构）
 * const deptResponse = await getPublicDepartmentOptions({ useTree: true })
 *
 * // 获取岗位选项
 * const posResponse = await getPublicPositionOptions()
 *
 * // 获取管理者选项
 * const mgmtResponse = await getPublicManagerOptions()
 *
 * // 批量获取所有选项
 * const allOptions = await getRegistrationOptions()
 * ```
 *
 * === 安全说明 ===
 *
 * - 所有接口均无需认证
 * - 只返回基础组织架构信息，不包含敏感数据
 * - 数据已进行脱敏处理，适合公开访问
 */
