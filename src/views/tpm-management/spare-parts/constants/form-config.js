/**
 * 文件名称：form-config.js
 * 文件描述：备件搜索表单配置
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建
 */

// 搜索表单配置
export const SEARCH_FORM_CONFIG = [
  {
    prop: 'sparePartCode',
    label: '备件编码',
    component: 'input',
    placeholder: '请输入备件编码',
    priority: 'primary',
    props: {
      clearable: true
    }
  },
  {
    prop: 'sparePartName',
    label: '备件名称',
    component: 'input',
    placeholder: '请输入备件名称',
    priority: 'primary',
    props: {
      clearable: true
    }
  },
  {
    prop: 'applicableEquipmentTypes',
    label: '适用设备类型',
    component: 'input',
    placeholder: '请输入适用设备类型',
    priority: 'primary',
    props: {
      clearable: true
    }
  },
  {
    prop: 'lowStock',
    label: '低库存筛选',
    component: 'switch',
    priority: 'advanced',
    props: {
      activeText: '仅显示低库存',
      inactiveText: '显示全部'
    }
  }
]

