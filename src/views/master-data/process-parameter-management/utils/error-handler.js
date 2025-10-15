/**
 * 文件名称：error-handler.js
 * 文件描述：工艺参数管理模块统一错误处理工具
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建，实现TASK11 P0阶段错误处理
 *   - 2025-10-15: 修正为优先使用后端返回的消息，符合项目规范
 */

// ==================== 错误处理核心函数 ====================

/**
 * 解析后端错误响应
 * 优先使用后端返回的 error.message，仅在必要时使用备用消息
 * @param {Object} error - Axios错误对象
 * @returns {Object} { code, message, details }
 */
export const parseErrorResponse = (error) => {
  // 网络错误（无响应）
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT_ERROR',
        message: '请求超时，请稍后重试',
        details: null
      }
    }
    return {
      code: 'NETWORK_ERROR',
      message: '网络连接失败，请检查网络后重试',
      details: null
    }
  }

  const { status, data } = error.response

  // 后端统一响应格式解析（优先使用后端返回的消息）
  if (data && data.error) {
    const { code, message, details } = data.error
    return {
      code: code || 'UNKNOWN_ERROR',
      message: message || '操作失败，请稍后重试', // 直接使用后端返回的 message
      details: details || null
    }
  }

  // HTTP状态码备用处理（仅在后端未返回标准格式时使用）
  const statusMessages = {
    401: '未授权，请重新登录',
    403: '无权限执行此操作，请联系管理员',
    404: '请求的资源不存在',
    500: '服务器内部错误，请稍后重试',
    502: '网关错误，请稍后重试',
    503: '服务暂时不可用，请稍后重试'
  }

  return {
    code: `HTTP_${status}`,
    message: statusMessages[status] || `请求失败 (${status})，请稍后重试`,
    details: null
  }
}

/**
 * 操作类型对应的失败消息前缀（用于拼接完整消息）
 */
const OPERATION_PREFIXES = {
  create: '创建失败',
  update: '更新失败',
  delete: '删除失败',
  copy: '复制失败',
  submit: '提交失败',
  approve: '审批通过失败',
  reject: '审批驳回失败',
  withdraw: '撤回失败',
  void: '作废失败',
  activate: '快速生效失败',
  query: '查询失败',
  compare: '对比失败',
  load: '加载失败'
}

/**
 * 处理API调用错误
 * @param {Object} error - Axios错误对象
 * @param {Object} options - 配置选项
 * @param {String} options.operation - 操作类型（create/update/delete等）
 * @param {Object} options.$message - Element UI Message组件
 * @param {Boolean} options.showMessage - 是否显示错误消息（默认true）
 * @param {Boolean} options.includePrefix - 是否包含操作类型前缀（默认true）
 * @returns {Object} 解析后的错误对象
 */
export const handleApiError = (error, options = {}) => {
  const {
    operation = 'query',
    $message = null,
    showMessage = true,
    includePrefix = true
  } = options

  // 解析错误（优先使用后端返回的消息）
  const parsedError = parseErrorResponse(error)

  // 构建完整的错误消息（根据需要添加操作前缀）
  const prefix = includePrefix ? (OPERATION_PREFIXES[operation] || '操作失败') : ''
  const fullMessage = includePrefix
    ? `${prefix}：${parsedError.message}`
    : parsedError.message

  // 显示错误消息
  if (showMessage && $message) {
    // 根据错误码决定消息类型和持续时间
    const messageConfig = {
      message: fullMessage,
      showClose: true
    }

    // 特殊错误码处理
    if (parsedError.code === 'PTM_016') {
      // 工艺模板正在使用中，延长显示时间
      messageConfig.duration = 5000
      $message.error(messageConfig)
    } else if (parsedError.code === 'PTM_007') {
      // 工艺段参数无效，延长显示时间
      messageConfig.duration = 5000
      $message.error(messageConfig)
    } else if (parsedError.code === 'HTTP_401' || parsedError.message.includes('未授权')) {
      // 未授权，使用警告样式
      messageConfig.duration = 3000
      $message.warning(messageConfig)
    } else if (parsedError.code === 'HTTP_403' || parsedError.message.includes('无权限')) {
      // 无权限，使用警告样式
      messageConfig.duration = 3000
      $message.warning(messageConfig)
    } else {
      // 其他错误，标准错误样式
      messageConfig.duration = 3000
      $message.error(messageConfig)
    }
  }

  // 返回解析后的错误对象供调用方使用
  return {
    ...parsedError,
    fullMessage
  }
}

/**
 * 处理表单验证错误
 * @param {Object} $refs - Vue组件的$refs对象
 * @param {String} formRef - 表单ref名称
 * @param {Object} $message - Element UI Message组件
 * @returns {Promise<Boolean>} 校验是否通过
 */
export const handleFormValidation = async($refs, formRef, $message) => {
  if (!$refs[formRef]) {
    console.error(`表单ref "${formRef}" 不存在`)
    return false
  }

  try {
    await $refs[formRef].validate()
    return true
  } catch (error) {
    // 校验失败，显示错误提示
    if ($message) {
      $message.warning('请检查表单填写，修正标红的错误项')
    }

    // 自动定位到第一个错误字段
    setTimeout(() => {
      const errorField = document.querySelector('.el-form-item.is-error')
      if (errorField) {
        errorField.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }, 100)

    return false
  }
}

/**
 * 清除表单验证错误
 * @param {Object} $refs - Vue组件的$refs对象
 * @param {String} formRef - 表单ref名称
 */
export const clearFormValidation = ($refs, formRef) => {
  if ($refs[formRef]) {
    $refs[formRef].clearValidate()
  }
}

/**
 * 重置表单
 * @param {Object} $refs - Vue组件的$refs对象
 * @param {String} formRef - 表单ref名称
 */
export const resetForm = ($refs, formRef) => {
  if ($refs[formRef]) {
    $refs[formRef].resetFields()
  }
}

// ==================== 特定场景错误处理函数 ====================

/**
 * 处理工艺模板删除错误
 * @param {Object} error - 错误对象
 * @param {Object} $message - Element UI Message组件
 * @param {Function} onShowUsage - 显示引用情况的回调函数
 */
export const handleTemplateDeleteError = (error, $message, onShowUsage) => {
  const parsedError = parseErrorResponse(error)

  // PTM_016: 工艺模板正在使用中
  if (parsedError.code === 'PTM_016') {
    // 显示后端返回的错误消息
    $message.error({
      message: `删除失败：${parsedError.message}`,
      duration: 3000,
      showClose: true
    })

    // 触发显示引用情况对话框
    if (typeof onShowUsage === 'function') {
      setTimeout(() => {
        onShowUsage()
      }, 500)
    }
  } else {
    // 其他错误，使用通用处理
    handleApiError(error, {
      operation: 'delete',
      $message
    })
  }
}

/**
 * 处理版本作废错误
 * @param {Object} error - 错误对象
 * @param {Object} $message - Element UI Message组件
 * @param {Function} onShowUsage - 显示引用情况的回调函数
 */
export const handleVersionVoidError = (error, $message, onShowUsage) => {
  const parsedError = parseErrorResponse(error)

  // PTM_016: 版本正在使用中
  if (parsedError.code === 'PTM_016') {
    // 显示后端返回的错误消息
    $message.error({
      message: `作废失败：${parsedError.message}`,
      duration: 3000,
      showClose: true
    })

    // 触发显示引用情况对话框
    if (typeof onShowUsage === 'function') {
      setTimeout(() => {
        onShowUsage()
      }, 500)
    }
  } else {
    // 其他错误，使用通用处理
    handleApiError(error, {
      operation: 'void',
      $message
    })
  }
}

/**
 * 处理段参数校验错误
 * @param {Array} errors - 段参数错误数组
 * @param {Object} $message - Element UI Message组件
 */
export const handleSegmentValidationErrors = (errors, $message) => {
  if (!errors || errors.length === 0) return

  // 显示前3个错误
  const displayErrors = errors.slice(0, 3)
  const moreCount = errors.length > 3 ? errors.length - 3 : 0

  const errorMessage = displayErrors.join('；')
  const fullMessage = moreCount > 0
    ? `工艺参数校验失败：${errorMessage}（还有${moreCount}个错误）`
    : `工艺参数校验失败：${errorMessage}`

  $message.error({
    message: fullMessage,
    duration: 5000,
    showClose: true
  })
}

// ==================== 导出默认对象 ====================

export default {
  parseErrorResponse,
  handleApiError,
  handleFormValidation,
  clearFormValidation,
  resetForm,
  handleTemplateDeleteError,
  handleVersionVoidError,
  handleSegmentValidationErrors
}
