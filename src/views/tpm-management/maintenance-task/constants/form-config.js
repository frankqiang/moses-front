/**
 * 文件名称：form-config.js
 * 文件描述：维护任务管理表单配置
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建
 */

/**
 * 创建任务表单规则
 */
export const CREATE_TASK_RULES = {
  equipmentId: [
    { required: true, message: '请选择设备', trigger: 'change' }
  ],
  taskType: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  taskTitle: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { max: 200, message: '任务标题最多200个字符', trigger: 'blur' }
  ],
  plannedStartTime: [
    { required: true, message: '请选择计划开始时间', trigger: 'change' }
  ],
  plannedEndTime: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const form = rule.form || {}
        if (form.plannedStartTime && value <= form.plannedStartTime) {
          callback(new Error('计划结束时间必须晚于计划开始时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  description: [
    { max: 1000, message: '任务描述最多1000个字符', trigger: 'blur' }
  ],
  remark: [
    { max: 500, message: '备注最多500个字符', trigger: 'blur' }
  ]
}

/**
 * 派工表单规则
 */
export const ASSIGN_TASK_RULES = {
  assignedTo: [
    { required: true, message: '请选择执行人员', trigger: 'change' }
  ]
}

/**
 * 完成任务表单规则
 */
export const COMPLETE_TASK_RULES = {
  maintenanceContent: [
    { required: true, message: '请填写维护内容详情', trigger: 'blur' },
    { max: 2000, message: '维护内容最多2000个字符', trigger: 'blur' }
  ],
  problemsFound: [
    { max: 2000, message: '发现问题最多2000个字符', trigger: 'blur' }
  ],
  actionsTaken: [
    { max: 2000, message: '处理措施最多2000个字符', trigger: 'blur' }
  ],
  workHours: [
    { type: 'number', min: 0.1, max: 999.9, message: '工时必须在0.1-999.9之间', trigger: 'blur' }
  ],
  equipmentConditionBefore: [
    { max: 500, message: '设备状态（维护前）最多500个字符', trigger: 'blur' }
  ],
  equipmentConditionAfter: [
    { max: 500, message: '设备状态（维护后）最多500个字符', trigger: 'blur' }
  ],
  nextMaintenanceSuggestions: [
    { max: 1000, message: '下次维护建议最多1000个字符', trigger: 'blur' }
  ]
}

/**
 * 延期任务表单规则
 */
export const POSTPONE_TASK_RULES = {
  delayReason: [
    { required: true, message: '请填写延期原因', trigger: 'blur' },
    { max: 500, message: '延期原因最多500个字符', trigger: 'blur' }
  ],
  newPlannedStartTime: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const now = new Date()
        if (value < now) {
          callback(new Error('新的计划开始时间不能早于当前时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

/**
 * 取消任务表单规则
 */
export const CANCEL_TASK_RULES = {
  cancelReason: [
    { required: true, message: '请填写取消原因', trigger: 'blur' },
    { max: 500, message: '取消原因最多500个字符', trigger: 'blur' }
  ]
}

/**
 * 创建任务表单默认值
 */
export const CREATE_TASK_FORM_DEFAULT = {
  taskCode: '', // 可选，自动生成
  equipmentId: '',
  maintenancePlanId: '',
  taskType: '',
  taskTitle: '',
  plannedStartTime: '',
  plannedEndTime: '',
  assignedTo: '',
  description: '',
  remark: ''
}

/**
 * 派工表单默认值
 */
export const ASSIGN_TASK_FORM_DEFAULT = {
  assignedTo: ''
}

/**
 * 完成任务表单默认值
 */
export const COMPLETE_TASK_FORM_DEFAULT = {
  maintenanceContent: '',
  problemsFound: '',
  actionsTaken: '',
  spareParts: [],
  workHours: null,
  equipmentConditionBefore: '',
  equipmentConditionAfter: '',
  nextMaintenanceSuggestions: ''
}

/**
 * 延期任务表单默认值
 */
export const POSTPONE_TASK_FORM_DEFAULT = {
  delayReason: '',
  newPlannedStartTime: ''
}

/**
 * 取消任务表单默认值
 */
export const CANCEL_TASK_FORM_DEFAULT = {
  cancelReason: ''
}

