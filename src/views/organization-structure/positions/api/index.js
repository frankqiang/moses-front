/**
 * 文件名称：index.js
 * 文件描述：岗位管理模块API入口，统一导出岗位管理相关的API方法
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，统一导出岗位管理API
 *
 * 导出内容：
 *
 * 来自 ./positions：
 * - createPosition: 创建岗位
 * - getPositionList: 获取岗位列表
 * - getPositionDetail: 获取岗位详情
 * - updatePosition: 更新岗位信息
 * - deletePosition: 删除岗位
 * - updatePositionStatus: 变更岗位状态
 * - getPositionOptions: 获取岗位选项列表
 * - getPositionsByDepartment: 根据部门ID获取岗位选项
 * - exportPositionList: 导出岗位列表
 *
 * 来自 ../../shared/api/department-options：
 * - getDepartmentOptions: 获取部门选项列表
 *
 * 使用示例：
 * import { getPositionList, getDepartmentOptions } from '@/views/organization-structure/positions/api'
 */

export * from './positions'
export * from '../../shared/api/department-options'
