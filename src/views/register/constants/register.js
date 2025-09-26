/**
 * 注册模块常量定义
 * 文件描述：定义注册模块相关的常量，包括表单配置、状态映射、验证规则等
 * 创建日期：2024-12-19
 */

// 默认注册申请表单数据
export const DEFAULT_REGISTER_FORM = {
  // 必填字段
  applicantName: '',
  applicantEmail: '',
  username: '',
  password: '',
  confirmPassword: '',

  // 可选字段 - 基本信息
  departmentId: '',
  jobTitle: '',
  phone: '',
  employeeId: '',
  positionId: '',
  hireDate: '',
  birthDate: '',
  gender: '',
  address: '',

  // 可选字段 - 联系人信息
  emergencyContact: '',
  emergencyPhone: '',
  managerId: '',

  // 可选字段 - 其他信息
  applicationReason: '',
  notes: '',
  customFields: {}
}

// 申请状态映射
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// 申请状态显示配置
export const STATUS_CONFIG = {
  [APPLICATION_STATUS.PENDING]: {
    text: '待审核',
    type: 'warning',
    icon: 'el-icon-time',
    color: '#E6A23C'
  },
  [APPLICATION_STATUS.APPROVED]: {
    text: '已通过',
    type: 'success',
    icon: 'el-icon-circle-check',
    color: '#67C23A'
  },
  [APPLICATION_STATUS.REJECTED]: {
    text: '已拒绝',
    type: 'danger',
    icon: 'el-icon-circle-close',
    color: '#F56C6C'
  },
  [APPLICATION_STATUS.CANCELLED]: {
    text: '已取消',
    type: 'info',
    icon: 'el-icon-remove',
    color: '#909399'
  }
}

// 表单验证规则
export const REGISTER_FORM_RULES = (formData) => ({
  // 必填字段验证
  applicantName: [
    { required: true, message: '请输入申请人姓名', trigger: 'blur' },
    { min: 1, max: 255, message: '姓名长度不能超过255个字符', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z\s·]+$/,
      message: '姓名只能包含中文、英文字母、空格和·',
      trigger: 'blur'
    }
  ],
  applicantEmail: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱地址格式',
      trigger: 'blur'
    }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度必须在 3 到 50 个字符之间', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z_][a-zA-Z0-9_]{2,49}$/,
      message: '用户名支持字母、数字、下划线，不能以数字开头',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 50, message: '密码长度必须在 8 到 50 个字符之间', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const hasLetter = /[a-zA-Z]/.test(value)
        const hasNumber = /[0-9]/.test(value)
        if (!hasLetter || !hasNumber) {
          callback(new Error('密码必须包含字母和数字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== formData.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],

  // 可选字段验证
  departmentId: [
    {
      pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
      message: '部门ID格式不正确',
      trigger: 'blur'
    }
  ],
  jobTitle: [
    { max: 100, message: '职位名称不能超过100个字符', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码格式',
      trigger: 'blur'
    }
  ],
  employeeId: [
    { max: 50, message: '员工ID不能超过50个字符', trigger: 'blur' }
  ],
  positionId: [
    {
      pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
      message: '岗位ID格式不正确',
      trigger: 'blur'
    }
  ],
  hireDate: [],
  birthDate: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }

        const selectedDate = new Date(value)
        if (Number.isNaN(selectedDate.getTime())) {
          callback(new Error('请选择有效的出生日期'))
          return
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        selectedDate.setHours(0, 0, 0, 0)

        if (selectedDate >= today) {
          callback(new Error('出生日期不能是未来时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  gender: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        if (!['male', 'female', 'other'].includes(value)) {
          callback(new Error('性别选择无效'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  address: [
    { max: 500, message: '家庭住址不能超过500个字符', trigger: 'blur' }
  ],
  emergencyContact: [
    { max: 100, message: '紧急联系人姓名不能超过100个字符', trigger: 'blur' }
  ],
  emergencyPhone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的紧急联系人手机号码格式',
      trigger: 'blur'
    }
  ],
  managerId: [
    {
      pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
      message: '直属上级ID格式不正确',
      trigger: 'blur'
    }
  ],
  applicationReason: [
    { max: 500, message: '申请原因不能超过500个字符', trigger: 'blur' }
  ],
  notes: [
    { max: 1000, message: '备注信息不能超过1000个字符', trigger: 'blur' }
  ]
})

// 查询表单验证规则
export const QUERY_FORM_RULES = {
  applicationId: [
    {
      required: true,
      message: '申请ID不能为空',
      trigger: 'blur'
    },
    {
      pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
      message: '申请ID格式不正确（请输入有效的申请ID）',
      trigger: 'blur'
    }
  ]
}

// 部门选项（示例数据，实际应从API获取）
export const DEPARTMENT_OPTIONS = [
  { value: 'dept-001', label: 'IT部门' },
  { value: 'dept-002', label: '人力资源部' },
  { value: 'dept-003', label: '财务部' },
  { value: 'dept-004', label: '销售部' },
  { value: 'dept-005', label: '市场部' },
  { value: 'dept-006', label: '运营部' },
  { value: 'dept-007', label: '研发部' },
  { value: 'dept-008', label: '生产部' }
]

// 岗位选项（示例数据，实际应从API获取）
export const POSITION_OPTIONS = [
  { value: 'pos-001', label: '软件工程师' },
  { value: 'pos-002', label: '前端开发工程师' },
  { value: 'pos-003', label: '后端开发工程师' },
  { value: 'pos-004', label: '产品经理' },
  { value: 'pos-005', label: '项目经理' },
  { value: 'pos-006', label: 'UI设计师' },
  { value: 'pos-007', label: '测试工程师' },
  { value: 'pos-008', label: '运维工程师' },
  { value: 'pos-009', label: '数据分析师' },
  { value: 'pos-010', label: '实习生' }
]

// 性别选项
export const GENDER_OPTIONS = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' }
]

// 申请原因选项
export const REASON_OPTIONS = [
  { value: 'NEW_EMPLOYEE', label: '新员工入职' },
  { value: 'CONTRACTOR', label: '外包人员' },
  { value: 'INTERN', label: '实习生' },
  { value: 'TEMPORARY', label: '临时访问' },
  { value: 'TRANSFER', label: '内部调动' },
  { value: 'OTHER', label: '其他' }
]

// 上级管理员选项（示例数据，实际应从API获取）
export const MANAGER_OPTIONS = [
  { value: 'mgr-001', label: '张经理 (研发部)' },
  { value: 'mgr-002', label: '李经理 (产品部)' },
  { value: 'mgr-003', label: '王经理 (运营部)' },
  { value: 'mgr-004', label: '陈经理 (人事部)' },
  { value: 'mgr-005', label: '刘经理 (财务部)' }
]

// 密码强度配置
export const PASSWORD_STRENGTH = {
  WEAK: {
    level: 1,
    text: '弱',
    color: '#F56C6C',
    percentage: 25
  },
  MEDIUM: {
    level: 2,
    text: '中等',
    color: '#E6A23C',
    percentage: 50
  },
  STRONG: {
    level: 3,
    text: '强',
    color: '#67C23A',
    percentage: 75
  },
  VERY_STRONG: {
    level: 4,
    text: '很强',
    color: '#409EFF',
    percentage: 100
  }
}

// API 端点
export const API_ENDPOINTS = {
  SUBMIT_APPLICATION: '/v1/auth/register-application',
  GET_APPLICATION: '/v1/auth/register-application'
}

// 消息配置
export const MESSAGE_CONFIG = {
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  WARNING_DURATION: 4000,
  INFO_DURATION: 3000
}

// 页面配置
export const PAGE_CONFIG = {
  APPLY_ROUTE: '/register/apply',
  STATUS_ROUTE: '/register/status',
  LOGIN_ROUTE: '/login'
}

// 本地存储键名
export const STORAGE_KEYS = {
  DRAFT_FORM_DATA: 'register_draft_form_data',
  LAST_APPLICATION_ID: 'register_last_application_id'
}

// 性别文本映射
export const GENDER_TEXT_MAP = {
  'male': '男',
  'female': '女',
  'other': '其他'
}

// 字段显示名称映射
export const FIELD_DISPLAY_NAMES = {
  // 基本信息
  id: '申请ID',
  applicantName: '申请人姓名',
  applicantEmail: '申请人邮箱',
  username: '用户名',

  // 职业信息
  departmentId: '部门ID',
  department: '部门',
  positionId: '岗位ID',
  position: '岗位',
  jobTitle: '职位名称',
  employeeId: '员工ID',
  managerId: '直属上级ID',
  manager: '直属上级',
  hireDate: '预期入职日期',

  // 个人信息
  gender: '性别',
  birthDate: '出生日期',
  phone: '手机号码',
  address: '家庭住址',

  // 紧急联系人
  emergencyContact: '紧急联系人',
  emergencyPhone: '紧急联系电话',

  // 其他信息
  applicationReason: '申请原因',
  notes: '备注信息',
  customFields: '自定义字段',

  // 审批信息
  status: '申请状态',
  createdAt: '申请时间',
  updatedAt: '更新时间',
  approver: '审批人'
}

// 字段分组配置
export const FIELD_GROUPS = {
  basic: {
    title: '基本信息',
    icon: 'el-icon-user',
    fields: ['id', 'applicantName', 'applicantEmail', 'username']
  },
  job: {
    title: '职业信息',
    icon: 'el-icon-suitcase',
    fields: ['department', 'position', 'jobTitle', 'employeeId', 'manager', 'hireDate']
  },
  personal: {
    title: '个人信息',
    icon: 'el-icon-user-solid',
    fields: ['gender', 'birthDate', 'phone', 'address']
  },
  emergency: {
    title: '紧急联系人',
    icon: 'el-icon-phone',
    fields: ['emergencyContact', 'emergencyPhone']
  },
  other: {
    title: '其他信息',
    icon: 'el-icon-info',
    fields: ['applicationReason', 'notes', 'customFields']
  },
  approval: {
    title: '审批信息',
    icon: 'el-icon-document-checked',
    fields: ['status', 'createdAt', 'updatedAt', 'approver']
  }
}
