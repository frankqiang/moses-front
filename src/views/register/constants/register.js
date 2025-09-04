/**
 * 注册模块常量定义
 * 文件描述：定义注册模块相关的常量，包括表单配置、状态映射、验证规则等
 * 创建日期：2024-12-19
 */

// 默认注册申请表单数据
export const DEFAULT_REGISTER_FORM = {
  applicantName: '',
  applicantEmail: '',
  username: '',
  password: '',
  confirmPassword: '',
  department: '',
  position: '',
  phone: '',
  employeeId: '',
  reason: ''
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
export const REGISTER_FORM_RULES = {
  applicantName: [
    { required: true, message: '请输入申请人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度必须在 2 到 50 个字符之间', trigger: 'blur' },
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
      message: '姓名只能包含中文、英文字母和空格',
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
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度必须在 8 到 20 个字符之间', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
      message: '密码必须包含大小写字母、数字和特殊字符',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' }
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码格式',
      trigger: 'blur'
    }
  ],
  employeeId: [
    {
      pattern: /^[A-Z0-9]{6,20}$/,
      message: '员工ID格式不正确（6-20位大写字母和数字）',
      trigger: 'blur'
    }
  ]
}

// 查询表单验证规则
export const QUERY_FORM_RULES = {
  applicationId: [
    { required: true, message: '请输入申请ID', trigger: 'blur' },
    {
      pattern: /^REG\d{14}$/,
      message: '申请ID格式不正确（格式：REG + 14位数字）',
      trigger: 'blur'
    }
  ]
}

// 部门选项（示例数据，实际应从API获取）
export const DEPARTMENT_OPTIONS = [
  { value: 'IT', label: 'IT部门' },
  { value: 'HR', label: '人力资源部' },
  { value: 'FINANCE', label: '财务部' },
  { value: 'SALES', label: '销售部' },
  { value: 'MARKETING', label: '市场部' },
  { value: 'OPERATIONS', label: '运营部' }
]

// 职位选项（示例数据）
export const POSITION_OPTIONS = [
  { value: 'DEVELOPER', label: '开发工程师' },
  { value: 'DESIGNER', label: '设计师' },
  { value: 'MANAGER', label: '经理' },
  { value: 'ANALYST', label: '分析师' },
  { value: 'SPECIALIST', label: '专员' },
  { value: 'INTERN', label: '实习生' }
]

// 申请原因选项
export const REASON_OPTIONS = [
  { value: 'NEW_EMPLOYEE', label: '新员工入职' },
  { value: 'CONTRACTOR', label: '外包人员' },
  { value: 'INTERN', label: '实习生' },
  { value: 'TEMPORARY', label: '临时访问' },
  { value: 'OTHER', label: '其他' }
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