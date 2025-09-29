/**
 * 文件名称：index.js
 * 文件描述：工艺参数管理模块常量统一导出入口
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，导出TASK002 P0阶段全部常量配置
 */

import * as baseConstants from './process-parameter-management'
import * as tableConfig from './table-config'
import * as searchConfig from './search-config'
import * as templateFormConfig from './template-form-config'
import * as versionFormConfig from './version-form-config'
import * as messagesConfig from './messages-config'
import * as chartConfig from './chart-config'

export default {
  ...baseConstants,
  ...tableConfig,
  ...searchConfig,
  ...templateFormConfig,
  ...versionFormConfig,
  ...messagesConfig,
  ...chartConfig
}

