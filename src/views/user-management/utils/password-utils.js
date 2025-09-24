/**
 * 文件名称：password-utils.js
 * 文件描述：密码管理相关的工具函数，包括密码强度验证、安全性检查等
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现密码强度验证和安全性工具
 */

/**
 * 密码强度等级定义
 */
export const PASSWORD_STRENGTH = {
  WEAK: 1, // 弱密码
  MEDIUM: 2, // 中等密码
  STRONG: 3, // 强密码
  VERY_STRONG: 4 // 非常强的密码
}

/**
 * 密码强度等级中文描述
 */
export const PASSWORD_STRENGTH_TEXT = {
  [PASSWORD_STRENGTH.WEAK]: '弱',
  [PASSWORD_STRENGTH.MEDIUM]: '中',
  [PASSWORD_STRENGTH.STRONG]: '强',
  [PASSWORD_STRENGTH.VERY_STRONG]: '很强'
}

/**
 * 密码强度等级对应的颜色
 */
export const PASSWORD_STRENGTH_COLOR = {
  [PASSWORD_STRENGTH.WEAK]: '#F56C6C',
  [PASSWORD_STRENGTH.MEDIUM]: '#E6A23C',
  [PASSWORD_STRENGTH.STRONG]: '#67C23A',
  [PASSWORD_STRENGTH.VERY_STRONG]: '#409EFF'
}

/**
 * 验证密码是否符合基本要求
 * 基于需求文档中的密码策略：至少8位，必须包含字母和数字
 * @param {string} password - 密码
 * @returns {boolean} 是否符合要求
 */
export function validatePasswordBasic(password) {
  if (!password || typeof password !== 'string') {
    return false
  }

  // 最小长度8位
  if (password.length < 8) {
    return false
  }

  // 必须包含字母
  if (!/[a-zA-Z]/.test(password)) {
    return false
  }

  // 必须包含数字
  if (!/\d/.test(password)) {
    return false
  }

  return true
}

/**
 * 计算密码强度
 * @param {string} password - 密码
 * @returns {Object} 密码强度信息
 */
export function calculatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return {
      strength: PASSWORD_STRENGTH.WEAK,
      score: 0,
      text: PASSWORD_STRENGTH_TEXT[PASSWORD_STRENGTH.WEAK],
      color: PASSWORD_STRENGTH_COLOR[PASSWORD_STRENGTH.WEAK],
      feedback: ['密码不能为空']
    }
  }

  let score = 0
  const feedback = []

  // 长度检查
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('密码长度至少8位')
  }

  if (password.length >= 12) {
    score += 1
  }

  // 字符类型检查
  const hasLowerCase = /[a-z]/.test(password)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (hasLowerCase) score += 1
  if (hasUpperCase) score += 1
  if (hasNumbers) score += 1
  if (hasSymbols) score += 1

  // 基本要求检查
  if (!hasLowerCase && !hasUpperCase) {
    feedback.push('密码必须包含字母')
  }
  if (!hasNumbers) {
    feedback.push('密码必须包含数字')
  }

  // 复杂度建议
  if (!hasUpperCase) {
    feedback.push('建议包含大写字母')
  }
  if (!hasSymbols) {
    feedback.push('建议包含特殊字符')
  }

  // 确定强度等级
  let strength = PASSWORD_STRENGTH.WEAK
  if (score >= 6) {
    strength = PASSWORD_STRENGTH.VERY_STRONG
  } else if (score >= 5) {
    strength = PASSWORD_STRENGTH.STRONG
  } else if (score >= 3) {
    strength = PASSWORD_STRENGTH.MEDIUM
  }

  // 如果不符合基本要求，强制为弱密码
  if (!validatePasswordBasic(password)) {
    strength = PASSWORD_STRENGTH.WEAK
  }

  return {
    strength,
    score,
    text: PASSWORD_STRENGTH_TEXT[strength],
    color: PASSWORD_STRENGTH_COLOR[strength],
    feedback: feedback.length > 0 ? feedback : ['密码强度良好'],
    isValid: validatePasswordBasic(password)
  }
}

/**
 * 生成随机安全密码
 * @param {number} length - 密码长度，默认12位
 * @returns {string} 生成的密码
 */
export function generateSecurePassword(length = 12) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'

  const allChars = lowercase + uppercase + numbers + symbols

  let password = ''

  // 确保包含各种字符类型
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // 打乱密码字符顺序
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * 检查密码是否包含常见弱密码模式
 * @param {string} password - 密码
 * @returns {Array} 检测到的弱密码模式
 */
export function checkWeakPasswordPatterns(password) {
  const weakPatterns = []

  if (!password) {
    return weakPatterns
  }

  // 检查连续字符
  if (/(.)\1{2,}/.test(password)) {
    weakPatterns.push('包含连续重复字符')
  }

  // 检查键盘序列
  const keyboardSequences = [
    'qwerty', 'asdfgh', 'zxcvbn',
    '123456', '654321', 'abcdef'
  ]

  for (const sequence of keyboardSequences) {
    if (password.toLowerCase().includes(sequence)) {
      weakPatterns.push('包含键盘序列')
      break
    }
  }

  // 检查常见弱密码
  const commonPasswords = [
    'password', '123456', 'admin', 'user',
    'qwerty', 'letmein', 'welcome', 'monkey'
  ]

  for (const common of commonPasswords) {
    if (password.toLowerCase().includes(common)) {
      weakPatterns.push('包含常见弱密码模式')
      break
    }
  }

  return weakPatterns
}

/**
 * 禁用密码输入框的复制粘贴功能
 * @param {HTMLElement} inputElement - 密码输入框元素
 */
export function disablePasswordCopyPaste(inputElement) {
  if (!inputElement) {
    return
  }

  const preventAction = (e) => {
    e.preventDefault()
    return false
  }

  // 禁用右键菜单
  inputElement.addEventListener('contextmenu', preventAction)

  // 禁用复制粘贴快捷键
  inputElement.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        return false
      }
    }
  })

  // 禁用拖拽
  inputElement.addEventListener('dragstart', preventAction)
  inputElement.addEventListener('drop', preventAction)

  // 禁用选择
  inputElement.addEventListener('selectstart', preventAction)
}

/**
 * 移除密码输入框的安全限制
 * @param {HTMLElement} inputElement - 密码输入框元素
 */
export function enablePasswordCopyPaste(inputElement) {
  if (!inputElement) {
    return
  }

  // 移除所有事件监听器需要保存引用，这里使用克隆节点的方式
  const newElement = inputElement.cloneNode(true)
  inputElement.parentNode.replaceChild(newElement, inputElement)

  return newElement
}

