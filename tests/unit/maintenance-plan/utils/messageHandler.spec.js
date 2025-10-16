/**
 * 文件名称：messageHandler.spec.js
 * 文件描述：维护计划管理模块消息处理工具单元测试
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，实现消息处理工具完整测试覆盖
 */

import messageHandler, { MessageHandler } from '@/views/master-data/equipment-tpm-management/maintenance-plan/utils/messageHandler'
import { Message } from 'element-ui'

// Mock Element UI Message
jest.mock('element-ui', () => ({
  Message: jest.fn()
}))

describe('维护计划管理消息处理工具测试', () => {
  // 保存原始环境变量
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console方法
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    // 恢复console方法
    console.log.mockRestore()
    console.error.mockRestore()
    console.warn.mockRestore()
    // 恢复环境变量
    process.env.NODE_ENV = originalEnv
  })

  describe('success - 成功消息', () => {
    it('应该显示成功消息（字符串参数）', () => {
      const message = '操作成功'

      messageHandler.success(message)

      expect(Message).toHaveBeenCalledWith({
        message: '操作成功',
        type: 'success',
        duration: 3000,
        showClose: false
      })
    })

    it('应该显示成功消息（响应对象参数）', () => {
      const response = {
        success: true,
        message: '创建维护计划成功',
        data: { id: '123' }
      }

      messageHandler.success(response)

      expect(Message).toHaveBeenCalledWith({
        message: '创建维护计划成功',
        type: 'success',
        duration: 3000,
        showClose: false
      })
    })

    it('应该支持自定义选项', () => {
      const message = '操作成功'
      const options = {
        duration: 5000,
        showClose: true
      }

      messageHandler.success(message, options)

      expect(Message).toHaveBeenCalledWith({
        message: '操作成功',
        type: 'success',
        duration: 5000,
        showClose: true
      })
    })

    it('应该在开发环境输出日志', () => {
      process.env.NODE_ENV = 'development'
      const message = '操作成功'

      messageHandler.success(message)

      expect(console.log).toHaveBeenCalledWith('✅ 成功消息:', message)
    })

    it('不应该在生产环境输出日志', () => {
      process.env.NODE_ENV = 'production'
      const message = '操作成功'

      messageHandler.success(message)

      expect(console.log).not.toHaveBeenCalled()
    })
  })

  describe('error - 错误消息', () => {
    it('应该显示错误消息', () => {
      const message = '操作失败'

      messageHandler.error(message)

      expect(Message).toHaveBeenCalledWith({
        message: '操作失败',
        type: 'error',
        duration: 5000,
        showClose: true
      })
    })

    it('应该支持自定义选项', () => {
      const message = '操作失败'
      const options = {
        duration: 10000,
        showClose: false
      }

      messageHandler.error(message, options)

      expect(Message).toHaveBeenCalledWith({
        message: '操作失败',
        type: 'error',
        duration: 10000,
        showClose: false
      })
    })

    it('应该在开发环境输出错误日志', () => {
      process.env.NODE_ENV = 'development'
      const message = '操作失败'

      messageHandler.error(message)

      expect(console.error).toHaveBeenCalledWith('❌ 错误消息:', message)
    })

    it('不应该在生产环境输出日志', () => {
      process.env.NODE_ENV = 'production'
      const message = '操作失败'

      messageHandler.error(message)

      expect(console.error).not.toHaveBeenCalled()
    })
  })

  describe('warning - 警告消息', () => {
    it('应该显示警告消息', () => {
      const message = '请注意'

      messageHandler.warning(message)

      expect(Message).toHaveBeenCalledWith({
        message: '请注意',
        type: 'warning',
        duration: 4000,
        showClose: true
      })
    })

    it('应该支持自定义选项', () => {
      const message = '请注意'
      const options = {
        duration: 6000,
        showClose: false
      }

      messageHandler.warning(message, options)

      expect(Message).toHaveBeenCalledWith({
        message: '请注意',
        type: 'warning',
        duration: 6000,
        showClose: false
      })
    })

    it('应该在开发环境输出警告日志', () => {
      process.env.NODE_ENV = 'development'
      const message = '请注意'

      messageHandler.warning(message)

      expect(console.warn).toHaveBeenCalledWith('⚠️ 警告消息:', message)
    })

    it('不应该在生产环境输出日志', () => {
      process.env.NODE_ENV = 'production'
      const message = '请注意'

      messageHandler.warning(message)

      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe('info - 信息消息', () => {
    it('应该显示信息消息', () => {
      const message = '提示信息'

      messageHandler.info(message)

      expect(Message).toHaveBeenCalledWith({
        message: '提示信息',
        type: 'info',
        duration: 3000,
        showClose: false
      })
    })

    it('应该支持自定义选项', () => {
      const message = '提示信息'
      const options = {
        duration: 2000,
        showClose: true
      }

      messageHandler.info(message, options)

      expect(Message).toHaveBeenCalledWith({
        message: '提示信息',
        type: 'info',
        duration: 2000,
        showClose: true
      })
    })

    it('应该在开发环境输出信息日志', () => {
      process.env.NODE_ENV = 'development'
      const message = '提示信息'

      messageHandler.info(message)

      expect(console.log).toHaveBeenCalledWith('ℹ️ 信息消息:', message)
    })

    it('不应该在生产环境输出日志', () => {
      process.env.NODE_ENV = 'production'
      const message = '提示信息'

      messageHandler.info(message)

      expect(console.log).not.toHaveBeenCalled()
    })
  })

  describe('showOperationSuccess - 操作成功消息', () => {
    it('应该优先使用响应对象中的消息（create）', () => {
      const response = {
        success: true,
        message: '维护计划创建成功'
      }

      messageHandler.showOperationSuccess('create', response)

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '维护计划创建成功',
        type: 'success'
      }))
    })

    it('应该使用备用消息（create - 无响应消息）', () => {
      messageHandler.showOperationSuccess('create')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '创建维护计划成功',
        type: 'success'
      }))
    })

    it('应该使用备用消息（update）', () => {
      messageHandler.showOperationSuccess('update')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '更新维护计划成功',
        type: 'success'
      }))
    })

    it('应该使用备用消息（delete）', () => {
      messageHandler.showOperationSuccess('delete')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '删除维护计划成功',
        type: 'success'
      }))
    })

    it('应该使用备用消息（enable）', () => {
      messageHandler.showOperationSuccess('enable')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '启用维护计划成功',
        type: 'success'
      }))
    })

    it('应该使用备用消息（disable）', () => {
      messageHandler.showOperationSuccess('disable')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '禁用维护计划成功',
        type: 'success'
      }))
    })

    it('应该处理未知操作类型', () => {
      messageHandler.showOperationSuccess('unknown-operation')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '操作成功',
        type: 'success'
      }))
    })

    it('应该处理响应对象为null', () => {
      messageHandler.showOperationSuccess('create', null)

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '创建维护计划成功',
        type: 'success'
      }))
    })
  })

  describe('showOperationWarning - 操作警告消息', () => {
    it('应该显示未完成任务警告', () => {
      messageHandler.showOperationWarning('has-unfinished-tasks')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '存在未完成的维护任务，无法禁用计划',
        type: 'warning'
      }))
    })

    it('应该显示已启用警告', () => {
      messageHandler.showOperationWarning('already-enabled')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '维护计划已经是启用状态',
        type: 'warning'
      }))
    })

    it('应该显示已禁用警告', () => {
      messageHandler.showOperationWarning('already-disabled')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '维护计划已经是禁用状态',
        type: 'warning'
      }))
    })

    it('应该显示编码已存在警告', () => {
      messageHandler.showOperationWarning('code-exists')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '维护计划编码已存在，请更换编码',
        type: 'warning'
      }))
    })

    it('应该显示设备不存在警告', () => {
      messageHandler.showOperationWarning('equipment-not-found')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '设备不存在，请检查设备信息',
        type: 'warning'
      }))
    })

    it('应该使用data中的自定义消息', () => {
      const data = { message: '自定义警告消息' }

      messageHandler.showOperationWarning('unknown-scenario', data)

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '自定义警告消息',
        type: 'warning'
      }))
    })

    it('应该处理未知场景', () => {
      messageHandler.showOperationWarning('unknown-scenario')

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '操作受限',
        type: 'warning'
      }))
    })
  })

  describe('MessageHandler类 - 创建新实例', () => {
    it('应该能够创建新的MessageHandler实例', () => {
      const newHandler = new MessageHandler()

      expect(newHandler).toBeInstanceOf(MessageHandler)
      expect(typeof newHandler.success).toBe('function')
      expect(typeof newHandler.error).toBe('function')
      expect(typeof newHandler.warning).toBe('function')
      expect(typeof newHandler.info).toBe('function')
    })

    it('新实例应该具有完整的功能', () => {
      const newHandler = new MessageHandler()
      const message = '测试消息'

      newHandler.success(message)

      expect(Message).toHaveBeenCalledWith(expect.objectContaining({
        message: '测试消息',
        type: 'success'
      }))
    })
  })

  describe('单例实例验证', () => {
    it('应该导出单例实例', () => {
      expect(messageHandler).toBeInstanceOf(MessageHandler)
      expect(typeof messageHandler.success).toBe('function')
      expect(typeof messageHandler.error).toBe('function')
      expect(typeof messageHandler.warning).toBe('function')
      expect(typeof messageHandler.info).toBe('function')
      expect(typeof messageHandler.showOperationSuccess).toBe('function')
      expect(typeof messageHandler.showOperationWarning).toBe('function')
    })
  })
})

