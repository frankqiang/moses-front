/**
 * 文件名称：table-config.js
 * 文件描述：料框规格管理模块表格列配置
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，定义表格列配置
 */

import { STATUS_CONFIG } from './bin-specification'

// 表格列配置
export const TABLE_COLUMNS = [
  {
    prop: 'specCode',
    label: '规格代码',
    minWidth: 120,
    sortable: true,
    fixed: 'left'
  },
  {
    prop: 'specName',
    label: '规格名称',
    minWidth: 150,
    sortable: true
  },
  {
    prop: 'dimensions',
    label: '尺寸(长×宽×高cm)',
    minWidth: 180,
    slotName: 'dimensions'
  },
  {
    prop: 'maxLoadCapacity',
    label: '最大载重(kg)',
    minWidth: 120,
    sortable: true
  },
  {
    prop: 'material',
    label: '材质',
    minWidth: 100
  },
  {
    prop: 'maxStackLayers',
    label: '最大堆叠层数',
    minWidth: 120
  },
  {
    prop: 'status',
    label: '状态',
    minWidth: 100,
    slotName: 'status'
  },
  {
    prop: 'createdAt',
    label: '创建时间',
    minWidth: 160,
    sortable: true
  },
  {
    prop: 'actions',
    label: '操作',
    minWidth: 150,
    fixed: 'right',
    slotName: 'actions'
  }
]

// 导出状态配置供表格使用
export { STATUS_CONFIG }

