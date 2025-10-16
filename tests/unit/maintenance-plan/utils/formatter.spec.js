/**
 * 文件名称：formatter.spec.js
 * 文件描述：维护计划管理模块数据格式化工具函数单元测试
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，实现格式化函数完整测试覆盖
 */

import {
  formatDateTime,
  formatCycleInfo,
  formatStandardDuration,
  getStatusTagType,
  getStatusText,
  getMaintenanceTypeText,
  getMaintenanceTypeTagType,
  getCycleTypeText,
  getCycleTypeTagType
} from '@/views/master-data/equipment-tpm-management/maintenance-plan/utils/formatter'
import { parseTime } from '@/utils'

// Mock parseTime工具函数
jest.mock('@/utils', () => ({
  parseTime: jest.fn()
}))

describe('维护计划管理格式化工具函数测试', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('formatDateTime - 日期时间格式化', () => {
    it('应该正确格式化日期时间（默认格式）', () => {
      const datetime = '2024-01-20T10:30:00.000Z'
      const expected = '2024-01-20 10:30:00'

      parseTime.mockReturnValue(expected)

      const result = formatDateTime(datetime)

      expect(parseTime).toHaveBeenCalledWith(datetime, '{y}-{m}-{d} {h}:{i}:{s}')
      expect(result).toBe(expected)
    })

    it('应该支持自定义日期格式', () => {
      const datetime = '2024-01-20T10:30:00.000Z'
      const format = '{y}-{m}-{d}'
      const expected = '2024-01-20'

      parseTime.mockReturnValue(expected)

      const result = formatDateTime(datetime, format)

      expect(parseTime).toHaveBeenCalledWith(datetime, format)
      expect(result).toBe(expected)
    })

    it('应该在输入为空时返回null', () => {
      expect(formatDateTime(null)).toBeNull()
      expect(formatDateTime(undefined)).toBeNull()
      expect(formatDateTime('')).toBeNull()
    })

    it('应该处理格式化错误', () => {
      const datetime = 'invalid-date'
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      parseTime.mockImplementation(() => {
        throw new Error('Invalid date')
      })

      const result = formatDateTime(datetime)

      expect(result).toBeNull()
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })
  })

  describe('formatCycleInfo - 周期信息格式化', () => {
    it('应该正确格式化按时间周期', () => {
      const cycleInfo = {
        cycleType: '按时间',
        cycleValue: 30,
        cycleUnit: '天'
      }

      const result = formatCycleInfo(cycleInfo)

      expect(result).toBe('每30天')
    })

    it('应该正确格式化按运行时长周期', () => {
      const cycleInfo = {
        cycleType: '按运行时长',
        cycleValue: 2,
        cycleUnit: '小时'
      }

      const result = formatCycleInfo(cycleInfo)

      expect(result).toBe('每2小时')
    })

    it('应该正确格式化按生产批次周期', () => {
      const cycleInfo = {
        cycleType: '按生产批次',
        cycleValue: 100,
        cycleUnit: '批次'
      }

      const result = formatCycleInfo(cycleInfo)

      expect(result).toBe('每100批次')
    })

    it('应该在参数不完整时返回"-"', () => {
      expect(formatCycleInfo(null)).toBe('-')
      expect(formatCycleInfo({})).toBe('-')
      expect(formatCycleInfo({ cycleValue: 30 })).toBe('-')
      expect(formatCycleInfo({ cycleUnit: '天' })).toBe('-')
    })
  })

  describe('formatStandardDuration - 标准工时格式化', () => {
    it('应该正确格式化工时（默认精度和单位）', () => {
      expect(formatStandardDuration('2.50')).toBe('2.5 小时')
      expect(formatStandardDuration(2.50)).toBe('2.5 小时')
    })

    it('应该支持自定义精度', () => {
      expect(formatStandardDuration('2.50', 2)).toBe('2.50 小时')
      expect(formatStandardDuration('2.5', 0)).toBe('3 小时') // 2.5四舍五入到0位小数是3
    })

    it('应该支持不显示单位', () => {
      expect(formatStandardDuration('2.50', 1, false)).toBe(2.5)
      expect(formatStandardDuration('2.50', 2, false)).toBe(2.50)
    })

    it('应该正确处理0值', () => {
      expect(formatStandardDuration(0)).toBe('0.0 小时')
      expect(formatStandardDuration('0')).toBe('0.0 小时')
    })

    it('应该在输入为空时返回"-"', () => {
      expect(formatStandardDuration(null)).toBe('-')
      expect(formatStandardDuration(undefined)).toBe('-')
      expect(formatStandardDuration('')).toBe('-')
    })

    it('应该处理非数值输入', () => {
      expect(formatStandardDuration('invalid')).toBe('-')
      expect(formatStandardDuration('abc')).toBe('-')
    })
  })

  describe('getStatusTagType - 状态标签类型转换', () => {
    it('应该将"启用"转换为success', () => {
      expect(getStatusTagType('启用')).toBe('success')
    })

    it('应该将"禁用"转换为info', () => {
      expect(getStatusTagType('禁用')).toBe('info')
    })

    it('应该处理未知状态', () => {
      expect(getStatusTagType('其他')).toBe('info')
      expect(getStatusTagType('')).toBe('info')
      expect(getStatusTagType(null)).toBe('info')
    })
  })

  describe('getStatusText - 状态文本转换', () => {
    it('应该正确返回状态文本', () => {
      expect(getStatusText('启用')).toBe('启用')
      expect(getStatusText('禁用')).toBe('禁用')
    })

    it('应该处理未知状态', () => {
      expect(getStatusText('其他')).toBe('其他')
    })

    it('应该在状态为空时返回"-"', () => {
      expect(getStatusText('')).toBe('-')
      expect(getStatusText(null)).toBe('-')
    })
  })

  describe('getMaintenanceTypeText - 维护类型文本转换', () => {
    it('应该正确返回维护类型文本', () => {
      expect(getMaintenanceTypeText('日常保养')).toBe('日常保养')
      expect(getMaintenanceTypeText('定期检查')).toBe('定期检查')
      expect(getMaintenanceTypeText('大修')).toBe('大修')
      expect(getMaintenanceTypeText('专项维护')).toBe('专项维护')
    })

    it('应该处理未知维护类型', () => {
      expect(getMaintenanceTypeText('其他')).toBe('其他')
    })

    it('应该在维护类型为空时返回"-"', () => {
      expect(getMaintenanceTypeText('')).toBe('-')
      expect(getMaintenanceTypeText(null)).toBe('-')
    })
  })

  describe('getMaintenanceTypeTagType - 维护类型标签类型转换', () => {
    it('应该正确转换维护类型到Tag类型', () => {
      expect(getMaintenanceTypeTagType('日常保养')).toBe('primary')
      expect(getMaintenanceTypeTagType('定期检查')).toBe('success')
      expect(getMaintenanceTypeTagType('大修')).toBe('warning')
      expect(getMaintenanceTypeTagType('专项维护')).toBe('danger')
    })

    it('应该处理未知维护类型', () => {
      expect(getMaintenanceTypeTagType('其他')).toBe('info')
      expect(getMaintenanceTypeTagType('')).toBe('info')
      expect(getMaintenanceTypeTagType(null)).toBe('info')
    })
  })

  describe('getCycleTypeText - 周期类型文本转换', () => {
    it('应该正确返回周期类型文本', () => {
      expect(getCycleTypeText('按时间')).toBe('按时间')
      expect(getCycleTypeText('按运行时长')).toBe('按运行时长')
      expect(getCycleTypeText('按生产批次')).toBe('按生产批次')
    })

    it('应该处理未知周期类型', () => {
      expect(getCycleTypeText('其他')).toBe('其他')
    })

    it('应该在周期类型为空时返回"-"', () => {
      expect(getCycleTypeText('')).toBe('-')
      expect(getCycleTypeText(null)).toBe('-')
    })
  })

  describe('getCycleTypeTagType - 周期类型标签类型转换', () => {
    it('应该正确转换周期类型到Tag类型', () => {
      expect(getCycleTypeTagType('按时间')).toBe('primary')
      expect(getCycleTypeTagType('按运行时长')).toBe('success')
      expect(getCycleTypeTagType('按生产批次')).toBe('warning')
    })

    it('应该处理未知周期类型', () => {
      expect(getCycleTypeTagType('其他')).toBe('info')
      expect(getCycleTypeTagType('')).toBe('info')
      expect(getCycleTypeTagType(null)).toBe('info')
    })
  })
})
