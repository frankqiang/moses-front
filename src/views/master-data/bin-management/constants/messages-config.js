/**
 * 文件名称：messages-config.js
 * 文件描述：料框规格管理模块消息配置
 * 创建日期：2025-01-09
 * 修改记录：
 *   - 2025-01-09: 初始创建，定义操作成功和错误消息
 */

// 操作成功消息配置
export const SUCCESS_MESSAGES = {
  CREATE: '创建料框规格成功',
  UPDATE: '更新料框规格成功',
  DELETE: '删除料框规格成功',
  ENABLE: '启用料框规格成功',
  DISABLE: '禁用料框规格成功',
  IMPORT: '导入料框规格成功',
  EXPORT: '导出料框规格成功'
}

// 操作确认消息配置
export const CONFIRM_MESSAGES = {
  DELETE: '确定要删除该料框规格吗？删除后无法恢复。',
  ENABLE: '确定要启用该料框规格吗？',
  DISABLE: '确定要禁用该料框规格吗？禁用后将无法在料框注册时使用。',
  BATCH_DELETE: '确定要批量删除选中的料框规格吗？删除后无法恢复。',
  BATCH_ENABLE: '确定要批量启用选中的料框规格吗？',
  BATCH_DISABLE: '确定要批量禁用选中的料框规格吗？'
}

// 验证错误消息配置
export const VALIDATION_MESSAGES = {
  SPEC_CODE_REQUIRED: '请输入规格代码',
  SPEC_CODE_FORMAT: '规格代码只能包含大写字母、数字和中划线',
  SPEC_CODE_EXISTS: '规格代码已存在，请使用其他代码',
  SPEC_NAME_REQUIRED: '请输入规格名称',
  LENGTH_REQUIRED: '请输入长度',
  LENGTH_RANGE: '长度必须在0.01-10000cm之间',
  WIDTH_REQUIRED: '请输入宽度',
  WIDTH_RANGE: '宽度必须在0.01-10000cm之间',
  HEIGHT_REQUIRED: '请输入高度',
  HEIGHT_RANGE: '高度必须在0.01-10000cm之间',
  MAX_LOAD_CAPACITY_REQUIRED: '请输入最大载重',
  MAX_LOAD_CAPACITY_RANGE: '最大载重必须在0.01-100000kg之间',
  MATERIAL_REQUIRED: '请输入材质',
  MAX_STACK_LAYERS_REQUIRED: '请输入最大堆叠层数',
  MAX_STACK_LAYERS_RANGE: '最大堆叠层数必须在1-100之间'
}

// 业务错误消息配置
export const BUSINESS_MESSAGES = {
  SPEC_IN_USE: '该规格正在被料框实例使用，无法删除或禁用',
  NO_SELECTION: '请选择至少一条记录',
  LOAD_FAILED: '加载料框规格列表失败',
  DETAIL_FAILED: '获取料框规格详情失败',
  CREATE_FAILED: '创建料框规格失败',
  UPDATE_FAILED: '更新料框规格失败',
  DELETE_FAILED: '删除料框规格失败',
  STATUS_CHANGE_FAILED: '切换规格状态失败'
}

// 提示消息配置
export const INFO_MESSAGES = {
  NO_DATA: '暂无料框规格数据',
  LOADING: '加载中...',
  SEARCHING: '搜索中...',
  SAVING: '保存中...',
  DELETING: '删除中...',
  FORM_VALIDATION_FAILED: '请检查表单填写是否正确',
  UNSAVED_CHANGES: '有未保存的更改，确定要离开吗？'
}

