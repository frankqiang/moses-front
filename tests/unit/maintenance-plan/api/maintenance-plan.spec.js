/**
 * 文件名称：maintenance-plan.spec.js
 * 文件描述：维护计划管理API服务单元测试
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，实现API服务完整测试覆盖
 */

import {
  getMaintenancePlans,
  getMaintenancePlanById,
  createMaintenancePlan,
  updateMaintenancePlan,
  enableMaintenancePlan,
  disableMaintenancePlan
} from '@/views/master-data/equipment-tpm-management/maintenance-plan/api/maintenance-plan'
import request from '@/utils/request'

// Mock request模块
jest.mock('@/utils/request')

describe('维护计划管理API服务测试', () => {
  // 每个测试前重置mock
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getMaintenancePlans - 查询维护计划列表', () => {
    it('应该成功查询维护计划列表（无参数）', async() => {
      const mockResponse = {
        success: true,
        data: {
          results: [
            {
              id: '770e8400-e29b-41d4-a716-446655440000',
              planCode: 'MP-EQ-001-1234567890',
              planName: '退火炉月度定期检查计划',
              equipmentId: '550e8400-e29b-41d4-a716-446655440000',
              maintenanceType: '定期检查',
              cycleType: '按时间',
              cycleValue: 30,
              cycleUnit: '天',
              status: '启用'
            }
          ],
          page: 1,
          limit: 10,
          totalPages: 1,
          totalResults: 1
        }
      }

      request.mockResolvedValue(mockResponse)

      const result = await getMaintenancePlans()

      expect(request).toHaveBeenCalledWith({
        url: '/mdm/tpm/maintenance-plans',
        method: 'get',
        params: {
          page: 1,
          limit: 10,
          sortBy: 'createdAt:desc'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该支持按设备ID筛选', async() => {
      const mockResponse = { success: true, data: { results: [] } }
      request.mockResolvedValue(mockResponse)

      const params = {
        equipmentId: '550e8400-e29b-41d4-a716-446655440000'
      }

      await getMaintenancePlans(params)

      expect(request).toHaveBeenCalledWith({
        url: '/mdm/tpm/maintenance-plans',
        method: 'get',
        params: expect.objectContaining({
          equipmentId: '550e8400-e29b-41d4-a716-446655440000'
        })
      })
    })

    it('应该处理请求失败', async() => {
      const mockError = new Error('网络错误')
      request.mockRejectedValue(mockError)

      await expect(getMaintenancePlans()).rejects.toThrow('网络错误')
    })
  })

  describe('getMaintenancePlanById - 查询单个维护计划详情', () => {
    const planId = '770e8400-e29b-41d4-a716-446655440000'

    it('应该成功查询维护计划详情', async() => {
      const mockResponse = {
        success: true,
        data: {
          id: planId,
          planCode: 'MP-EQ-001-1234567890',
          planName: '退火炉月度定期检查计划'
        }
      }

      request.mockResolvedValue(mockResponse)

      const result = await getMaintenancePlanById(planId)

      expect(request).toHaveBeenCalledWith({
        url: `/mdm/tpm/maintenance-plans/${planId}`,
        method: 'get'
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该在planId为空时拒绝请求', async() => {
      await expect(getMaintenancePlanById('')).rejects.toThrow('维护计划ID不能为空')
    })
  })

  describe('createMaintenancePlan - 创建维护计划', () => {
    it('应该成功创建维护计划', async() => {
      const planData = {
        planName: '退火炉月度定期检查计划',
        equipmentId: '550e8400-e29b-41d4-a716-446655440000',
        maintenanceType: '定期检查',
        maintenanceItems: '检查加热元件',
        cycleType: '按时间',
        cycleValue: 30,
        cycleUnit: '天'
      }

      const mockResponse = {
        success: true,
        data: { id: '770e8400-e29b-41d4-a716-446655440000', ...planData }
      }

      request.mockResolvedValue(mockResponse)

      const result = await createMaintenancePlan(planData)

      expect(request).toHaveBeenCalledWith({
        url: '/mdm/tpm/maintenance-plans',
        method: 'post',
        data: planData
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该在data为空时拒绝请求', async() => {
      await expect(createMaintenancePlan(null)).rejects.toThrow('创建数据不能为空')
    })
  })

  describe('updateMaintenancePlan - 更新维护计划', () => {
    const planId = '770e8400-e29b-41d4-a716-446655440000'

    it('应该成功更新维护计划', async() => {
      const updateData = { planName: '新计划名称' }
      const mockResponse = { success: true, data: { id: planId, ...updateData } }

      request.mockResolvedValue(mockResponse)

      const result = await updateMaintenancePlan(planId, updateData)

      expect(request).toHaveBeenCalledWith({
        url: `/mdm/tpm/maintenance-plans/${planId}`,
        method: 'patch',
        data: updateData
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该在planId为空时拒绝请求', async() => {
      await expect(updateMaintenancePlan('', { planName: '新名称' })).rejects.toThrow('维护计划ID不能为空')
    })

    it('应该在data为空时拒绝请求', async() => {
      await expect(updateMaintenancePlan(planId, {})).rejects.toThrow('更新数据不能为空，至少提供一个要更新的字段')
    })
  })

  describe('enableMaintenancePlan - 启用维护计划', () => {
    const planId = '770e8400-e29b-41d4-a716-446655440000'

    it('应该成功启用维护计划', async() => {
      const mockResponse = {
        success: true,
        data: { id: planId, status: '启用' }
      }

      request.mockResolvedValue(mockResponse)

      const result = await enableMaintenancePlan(planId)

      expect(request).toHaveBeenCalledWith({
        url: `/mdm/tpm/maintenance-plans/${planId}/enable`,
        method: 'post'
      })
      expect(result.data.status).toBe('启用')
    })

    it('应该在planId为空时拒绝请求', async() => {
      await expect(enableMaintenancePlan('')).rejects.toThrow('维护计划ID不能为空')
    })
  })

  describe('disableMaintenancePlan - 禁用维护计划', () => {
    const planId = '770e8400-e29b-41d4-a716-446655440000'

    it('应该成功禁用维护计划', async() => {
      const mockResponse = {
        success: true,
        data: { id: planId, status: '禁用' }
      }

      request.mockResolvedValue(mockResponse)

      const result = await disableMaintenancePlan(planId)

      expect(request).toHaveBeenCalledWith({
        url: `/mdm/tpm/maintenance-plans/${planId}/disable`,
        method: 'post'
      })
      expect(result.data.status).toBe('禁用')
    })

    it('应该在planId为空时拒绝请求', async() => {
      await expect(disableMaintenancePlan('')).rejects.toThrow('维护计划ID不能为空')
    })
  })
})
