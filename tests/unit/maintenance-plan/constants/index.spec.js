/**
 * 文件名称：index.spec.js
 * 文件描述：维护计划管理常量配置单元测试
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，验证常量配置的结构和完整性
 */

import {
  STATUS_TAG_CONFIG,
  MAINTENANCE_TYPE_TAG_CONFIG,
  CYCLE_TYPE_TAG_CONFIG
} from '@/views/master-data/equipment-tpm-management/maintenance-plan/constants'

describe('维护计划管理常量配置测试', () => {
  describe('STATUS_TAG_CONFIG - 状态标签配置', () => {
    it('应该包含typeMap配置', () => {
      expect(STATUS_TAG_CONFIG).toHaveProperty('typeMap')
      expect(typeof STATUS_TAG_CONFIG.typeMap).toBe('object')
    })

    it('应该包含textMap配置', () => {
      expect(STATUS_TAG_CONFIG).toHaveProperty('textMap')
      expect(typeof STATUS_TAG_CONFIG.textMap).toBe('object')
    })

    it('typeMap应该包含所有状态的标签类型', () => {
      const { typeMap } = STATUS_TAG_CONFIG
      expect(typeMap).toHaveProperty('启用', 'success')
      expect(typeMap).toHaveProperty('禁用', 'info')
    })

    it('textMap应该包含所有状态的文本映射', () => {
      const { textMap } = STATUS_TAG_CONFIG
      expect(textMap).toHaveProperty('启用', '启用')
      expect(textMap).toHaveProperty('禁用', '禁用')
    })

    it('typeMap和textMap的键应该一致', () => {
      const typeKeys = Object.keys(STATUS_TAG_CONFIG.typeMap).sort()
      const textKeys = Object.keys(STATUS_TAG_CONFIG.textMap).sort()
      expect(typeKeys).toEqual(textKeys)
    })
  })

  describe('MAINTENANCE_TYPE_TAG_CONFIG - 维护类型标签配置', () => {
    it('应该包含typeMap配置', () => {
      expect(MAINTENANCE_TYPE_TAG_CONFIG).toHaveProperty('typeMap')
      expect(typeof MAINTENANCE_TYPE_TAG_CONFIG.typeMap).toBe('object')
    })

    it('typeMap应该包含所有维护类型的标签配置', () => {
      const { typeMap } = MAINTENANCE_TYPE_TAG_CONFIG
      expect(typeMap).toHaveProperty('日常保养', 'primary')
      expect(typeMap).toHaveProperty('定期检查', 'success')
      expect(typeMap).toHaveProperty('大修', 'warning')
      expect(typeMap).toHaveProperty('专项维护', 'danger')
    })

    it('所有标签类型应该是有效的Element UI类型', () => {
      const validTypes = ['primary', 'success', 'warning', 'danger', 'info']
      const { typeMap } = MAINTENANCE_TYPE_TAG_CONFIG

      Object.values(typeMap).forEach(type => {
        expect(validTypes).toContain(type)
      })
    })
  })

  describe('CYCLE_TYPE_TAG_CONFIG - 周期类型标签配置', () => {
    it('应该包含typeMap配置', () => {
      expect(CYCLE_TYPE_TAG_CONFIG).toHaveProperty('typeMap')
      expect(typeof CYCLE_TYPE_TAG_CONFIG.typeMap).toBe('object')
    })

    it('typeMap应该包含所有周期类型的标签配置', () => {
      const { typeMap } = CYCLE_TYPE_TAG_CONFIG
      expect(typeMap).toHaveProperty('按时间', 'primary')
      expect(typeMap).toHaveProperty('按运行时长', 'success')
      expect(typeMap).toHaveProperty('按生产批次', 'warning')
    })

    it('所有标签类型应该是有效的Element UI类型', () => {
      const validTypes = ['primary', 'success', 'warning', 'danger', 'info']
      const { typeMap } = CYCLE_TYPE_TAG_CONFIG

      Object.values(typeMap).forEach(type => {
        expect(validTypes).toContain(type)
      })
    })
  })

  describe('常量导出完整性验证', () => {
    it('所有常量应该被正确导出', () => {
      const constants = require('@/views/master-data/equipment-tpm-management/maintenance-plan/constants')

      // 验证直接导出的常量
      expect(constants).toHaveProperty('STATUS_TAG_CONFIG')
      expect(constants).toHaveProperty('MAINTENANCE_TYPE_TAG_CONFIG')
      expect(constants).toHaveProperty('CYCLE_TYPE_TAG_CONFIG')

      // 验证从子模块导出的配置
      expect(constants).toHaveProperty('TABLE_COLUMNS')
      expect(constants).toHaveProperty('SEARCH_FORM_CONFIG')
      expect(constants).toHaveProperty('MAINTENANCE_PLAN_FORM_FIELDS')
    })
  })
})

