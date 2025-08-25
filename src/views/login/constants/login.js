/**
 * 登录模块常量定义
 */

// 默认登录表单数据
export const DEFAULT_LOGIN_FORM = {
  username: '',
  password: '',
  rememberMe: false
}

// 登录表单验证规则
export const LOGIN_RULES = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
  ]
}

// 环境配置
export const ENV_CONFIG = {
  isDev: process.env.NODE_ENV === 'development'
}

// 登录状态
export const LOGIN_STATUS = {
  NORMAL: 'normal', // 正常状态
  LOADING: 'loading', // 加载中
  ERROR: 'error' // 错误状态
}