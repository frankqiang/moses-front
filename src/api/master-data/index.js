/**
 * 文件名称：index.js
 * 文件描述：主数据公共API模块统一导出入口
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，提供主数据公共接口
 */

// 产品相关API
export * from './products'

// 设备相关API
export * from './equipment'

/**
 * 主数据公共API模块说明
 *
 * 本模块提供主数据相关的公共接口，供多个业务模块复用。
 * 遵循单一职责和DRY原则，避免各业务模块之间的耦合。
 *
 * === 目录结构 ===
 *
 * master-data/
 * ├── index.js              # 统一导出入口
 * ├── products/             # 产品相关公共API
 * │   └── index.js
 * ├── materials/            # 物料相关公共API（待添加）
 * ├── equipment/            # 设备相关公共API（待添加）
 * └── ...                   # 其他主数据模块
 *
 * === 产品相关接口 ===
 *
 * - getProductOptions() - 获取产品选项列表（通用）
 * - getProductionProductOptions() - 获取量产产品选项（快捷方法）
 * - searchProductOptions() - 搜索产品选项（快捷方法）
 *
 * === 使用示例 ===
 *
 * ```javascript
 * import { getProductOptions, getProductionProductOptions } from '@/api/master-data'
 *
 * // 获取所有量产产品
 * const response = await getProductionProductOptions({ limit: 100 })
 * this.productOptions = response.data.options
 *
 * // 搜索产品
 * const response = await getProductOptions({
 *   keyword: '1060',
 *   lifecycleStatus: '量产',
 *   limit: 30
 * })
 *
 * // 分页加载
 * const response = await getProductOptions({ page: 2, limit: 30 })
 * ```
 *
 * === 架构优势 ===
 *
 * - 零耦合：各业务模块不相互依赖
 * - 可复用：统一的数据格式和业务规则
 * - 易维护：修改只需一处
 * - 模块化：每个主数据类型独立子目录
 * - 符合规范：遵循项目公共API层设计模式
 */

