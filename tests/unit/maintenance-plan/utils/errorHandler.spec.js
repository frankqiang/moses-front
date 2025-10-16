/**
 * 文件名称：errorHandlerspec.js
 * 文件描述：维护计划管理模块错误处理工具单元测试
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，实现错误处理函数完整测试覆盖
 */

import errorHandler from '@/views/master-data/equipment-tpm-management/maintenance-plan/utils/errorHandler'
import { Message } from 'element-ui'

// Mock Element UI Message
jest.mock('element-ui', () => ({
  Message: jest.fn(),
  MessageBox: {
    confirm: jest.fn()
  }
}))

describe('维护计划管理错误处理工具测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleError - 统一错误处理', () => {
    it('应该正确处理API错误并显示消息', () => {
      const error = {
        code: 'MAINTENANCE_PLAN_001',
        message: '维护计划编码已存在',
        status: 400
      }

      const result = errorHandler.handleError(error)

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '维护计划编码已存在',
        type: 'error'
      }))
      expect(result.handled).toBe(true)
      expect(result.code).toBe('MAINTENANCE_PLAN_001')
    })

    it('应该使用默认消息当错误消息为空时', () => {
      const error = { code: 'UNKNOWN_ERROR' }
      const defaultMessage = '自定义默认消息'

      errorHandler.handleError(error, { defaultMessage })

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: defaultMessage
      }))
    })

    it('应该支持不显示消息', () => {
      const error = { code: 'TEST_ERROR', message: '测试错误' }

      errorHandler.handleError(error, { showMessage: false })

      expect(Message).not.toHaveBeenCalled()
    })

    it('应该调用错误回调函数', () => {
      const error = { code: 'TEST_ERROR', message: '测试错误' }
      const onError = jest.fn()

      errorHandler.handleError(error, { onError })

      expect(onError).toHaveBeenCalledWith(error)
    })

    it('应该将MAINTENANCE_PLAN_005显示为警告消息', () => {
      const error = {
        code: 'MAINTENANCE_PLAN_005',
        message: '存在未完成的维护任务，无法禁用计划'
      }

      errorHandler.handleError(error)

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        type: 'warning',
        message: '存在未完成的维护任务，无法禁用计划'
      }))
    })
  })

  describe('getErrorMessage - 获取错误消息', () => {
    it('应该返回错误对象中的消息', () => {
      const error = { message: '自定义错误消息' }
      const result = errorHandler.getErrorMessage(error, '默认消息')
      expect(result).toBe('自定义错误消息')
    })

    it('应该返回默认消息当错误消息为空时', () => {
      const error = {}
      const result = errorHandler.getErrorMessage(error, '默认消息')
      expect(result).toBe('默认消息')
    })
  })

  describe('isValidationError - 验证错误判断', () => {
    it('应该识别验证错误', () => {
      expect(errorHandler.isValidationError({ code: 'VALIDATION_ERROR' })).toBe(true)
    })

    it('应该识别非验证错误', () => {
      expect(errorHandler.isValidationError({ code: 'OTHER_ERROR' })).toBe(false)
    })
  })

  describe('isPermissionError - 权限错误判断', () => {
    it('应该识别权限错误', () => {
      expect(errorHandler.isPermissionError({ code: 'FORBIDDEN' })).toBe(true)
      expect(errorHandler.isPermissionError({ status: 403 })).toBe(true)
    })

    it('应该识别非权限错误', () => {
      expect(errorHandler.isPermissionError({ code: 'OTHER_ERROR' })).toBe(false)
    })
  })

  describe('isAuthError - 认证错误判断', () => {
    it('应该识别认证错误', () => {
      expect(errorHandler.isAuthError({ code: 'UNAUTHORIZED' })).toBe(true)
      expect(errorHandler.isAuthError({ status: 401 })).toBe(true)
    })

    it('应该识别非认证错误', () => {
      expect(errorHandler.isAuthError({ code: 'OTHER_ERROR' })).toBe(false)
    })
  })
})
