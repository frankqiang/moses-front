/**
 * 文件名称：index.js
 * 文件描述：组织结构管理模块API统一入口文件，提供模块导航和文档说明
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 重构为独立模块架构，部门和岗位管理分离
 */

/**
 * 组织结构管理模块架构说明
 *
 * 本模块采用独立子模块架构，每个子模块都有完整的API、组件和常量定义：
 *
 * 📁 organization-structure/
 * ├── 📁 departments/          # 部门管理模块（独立）
 * │   ├── 📁 api/
 * │   │   ├── index.js         # 统一导出
 * │   │   └── departments.js   # 部门管理API
 * │   ├── 📁 components/       # 部门管理组件
 * │   ├── 📁 constants/        # 部门相关常量
 * │   └── index.vue           # 部门管理主页面
 * │
 * ├── 📁 positions/            # 岗位管理模块（独立）
 * │   ├── 📁 api/
 * │   │   ├── index.js         # 统一导出
 * │   │   ├── positions.js     # 岗位管理API
 * │   │   └── departments.js   # 岗位模块中的部门选项API
 * │   ├── 📁 components/       # 岗位管理组件
 * │   ├── 📁 constants/        # 岗位相关常量
 * │   └── index.vue           # 岗位管理主页面
 * │
 * └── 📁 api/                  # 模块导航（本文件）
 *     └── index.js             # 架构说明和使用指南
 */

/**
 * === 模块使用指南 ===
 *
 * 1. 部门管理模块：
 * ```javascript
 * // 导入部门管理API
 * import {
 *   getDepartmentList,
 *   createDepartment,
 *   updateDepartment,
 *   deleteDepartment,
 *   getDepartmentTree,
 *   updateDepartmentStatus,
 *   getDepartmentOptions
 * } from '@/views/organization-structure/departments/api'
 *
 * // 使用示例
 * const departments = await getDepartmentList({ status: 'active' })
 * const tree = await getDepartmentTree()
 * ```
 *
 * 2. 岗位管理模块：
 * ```javascript
 * // 导入岗位管理API
 * import {
 *   getPositionList,
 *   createPosition,
 *   updatePosition,
 *   deletePosition,
 *   getPositionOptions,
 *   getDepartmentOptions  // 岗位模块中的部门选项
 * } from '@/views/organization-structure/positions/api'
 *
 * // 使用示例
 * const positions = await getPositionList({ departmentId: 'xxx' })
 * const options = await getPositionOptions({ status: 'active' })
 * ```
 *
 * === 模块独立性原则 ===
 *
 * 1. **API独立**：每个模块有自己的API文件和统一导出
 * 2. **组件独立**：每个模块有自己的组件，不相互依赖
 * 3. **路由独立**：每个模块有自己的路由配置
 * 4. **数据独立**：每个模块管理自己的状态和数据
 *
 * === 跨模块数据获取 ===
 *
 * 当岗位管理需要部门数据时：
 * - 岗位模块有自己的 `departments.js` API文件
 * - 提供 `getDepartmentOptions()` 函数获取部门选项
 * - 不直接依赖部门管理模块的API
 *
 * === 错误处理 ===
 *
 * 所有模块都使用统一的错误处理机制：
 *
 * ```javascript
 * try {
 *   const result = await createDepartment(data)
 *   console.log('创建成功:', result.data)
 * } catch (error) {
 *   // 统一错误处理
 *   if (error.code === 'DUPLICATE_RESOURCE') {
 *     this.$message.error('编码已存在，请更换')
 *   } else {
 *     this.$message.error(error.message || '操作失败')
 *   }
 * }
 * ```
 *
 * === 常见错误码 ===
 *
 * - DUPLICATE_RESOURCE: 资源已存在（编码重复）
 * - RESOURCE_NOT_FOUND: 资源不存在
 * - OPERATION_NOT_ALLOWED: 操作不被允许（存在关联数据）
 * - USER_NOT_FOUND: 用户不存在（设置部门经理时）
 * - VAL_001: 输入数据验证失败
 * - AUTH_001: 未授权访问
 * - AUTH_009: 权限不足
 */

// 注意：此文件仅用于架构说明和使用指南
// 实际的API导入请直接从对应的子模块中导入：
// - 部门管理：@/views/organization-structure/departments/api
// - 岗位管理：@/views/organization-structure/positions/api

export default {
  name: 'OrganizationStructureApiGuide',
  description: '组织结构管理模块API使用指南',
  modules: {
    departments: '@/views/organization-structure/departments/api',
    positions: '@/views/organization-structure/positions/api'
  }
}
