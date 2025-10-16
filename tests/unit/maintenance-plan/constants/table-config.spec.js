/**
 * 文件名称：table-config.spec.js
 * 文件描述：维护计划管理表格配置单元测试
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，验证表格配置的结构和完整性
 */

import { TABLE_COLUMNS } from '@/views/master-data/equipment-tpm-management/maintenance-plan/constants/table-config'

describe('维护计划管理表格配置测试', () => {
  describe('TABLE_COLUMNS - 表格列配置', () => {
    it('应该是一个数组', () => {
      expect(Array.isArray(TABLE_COLUMNS)).toBe(true)
    })

    it('应该包含所有必要的列', () => {
      const columnProps = TABLE_COLUMNS.map(col => col.prop)

      expect(columnProps).toContain('planCode')
      expect(columnProps).toContain('planName')
      expect(columnProps).toContain('equipment')
      expect(columnProps).toContain('maintenanceType')
      expect(columnProps).toContain('cycleInfo')
      expect(columnProps).toContain('standardDurationHours')
      expect(columnProps).toContain('status')
      expect(columnProps).toContain('actions')
    })

    it('每列应该包含必要的配置属性', () => {
      TABLE_COLUMNS.forEach(column => {
        expect(column).toHaveProperty('prop')
        expect(column).toHaveProperty('label')
        expect(typeof column.prop).toBe('string')
        expect(typeof column.label).toBe('string')
      })
    })

    it('计划编码列应该配置为左侧固定', () => {
      const planCodeColumn = TABLE_COLUMNS.find(col => col.prop === 'planCode')

      expect(planCodeColumn).toBeDefined()
      expect(planCodeColumn.fixed).toBe('left')
      expect(planCodeColumn.sortable).toBe('custom')
      expect(planCodeColumn.showOverflowTooltip).toBe(true)
    })

    it('状态列应该配置为右侧固定', () => {
      const statusColumn = TABLE_COLUMNS.find(col => col.prop === 'status')

      expect(statusColumn).toBeDefined()
      expect(statusColumn.fixed).toBe('right')
      expect(statusColumn.sortable).toBe('custom')
    })

    it('操作列应该配置为右侧固定', () => {
      const actionsColumn = TABLE_COLUMNS.find(col => col.prop === 'actions')

      expect(actionsColumn).toBeDefined()
      expect(actionsColumn.fixed).toBe('right')
    })

    it('需要自定义渲染的列应该配置slotName', () => {
      const slotColumns = [
        'equipment',
        'maintenanceType',
        'cycleInfo',
        'standardDurationHours',
        'status',
        'actions'
      ]

      slotColumns.forEach(prop => {
        const column = TABLE_COLUMNS.find(col => col.prop === prop)
        expect(column).toBeDefined()
        expect(column.slotName).toBe(prop)
      })
    })

    it('计划名称列应该配置排序和溢出提示', () => {
      const planNameColumn = TABLE_COLUMNS.find(col => col.prop === 'planName')

      expect(planNameColumn).toBeDefined()
      expect(planNameColumn.sortable).toBe('custom')
      expect(planNameColumn.showOverflowTooltip).toBe(true)
    })

    it('标准工时列应该配置排序', () => {
      const durationColumn = TABLE_COLUMNS.find(col => col.prop === 'standardDurationHours')

      expect(durationColumn).toBeDefined()
      expect(durationColumn.sortable).toBe('custom')
    })

    it('设备和周期信息列不应该可排序', () => {
      const equipmentColumn = TABLE_COLUMNS.find(col => col.prop === 'equipment')
      const cycleInfoColumn = TABLE_COLUMNS.find(col => col.prop === 'cycleInfo')

      expect(equipmentColumn.sortable).toBe(false)
      expect(cycleInfoColumn.sortable).toBe(false)
    })

    it('每列应该配置合理的宽度', () => {
      TABLE_COLUMNS.forEach(column => {
        const hasWidth = column.width || column.minWidth
        expect(hasWidth).toBeDefined()

        if (column.width) {
          expect(typeof column.width).toBe('number')
          expect(column.width).toBeGreaterThan(0)
        }

        if (column.minWidth) {
          expect(typeof column.minWidth).toBe('number')
          expect(column.minWidth).toBeGreaterThan(0)
        }
      })
    })

    it('列的固定位置配置应该合理', () => {
      const leftFixedColumns = TABLE_COLUMNS.filter(col => col.fixed === 'left')
      const rightFixedColumns = TABLE_COLUMNS.filter(col => col.fixed === 'right')

      // 左侧固定列应该在数组开始位置
      if (leftFixedColumns.length > 0) {
        expect(TABLE_COLUMNS[0].fixed).toBe('left')
      }

      // 右侧固定列应该在数组结束位置
      if (rightFixedColumns.length > 0) {
        const lastIndex = TABLE_COLUMNS.length - 1
        const secondLastIndex = TABLE_COLUMNS.length - 2

        expect(TABLE_COLUMNS[lastIndex].fixed).toBe('right')
        expect(TABLE_COLUMNS[secondLastIndex].fixed).toBe('right')
      }
    })

    it('sortable值应该只包含合法值', () => {
      const validSortableValues = ['custom', true, false]

      TABLE_COLUMNS.forEach(column => {
        if (column.hasOwnProperty('sortable')) {
          expect(validSortableValues).toContain(column.sortable)
        }
      })
    })
  })

  describe('表格列配置不变性', () => {
    it('TABLE_COLUMNS应该包含8列', () => {
      expect(TABLE_COLUMNS).toHaveLength(8)
    })

    it('列的顺序应该符合设计规范', () => {
      const expectedOrder = [
        'planCode',
        'planName',
        'equipment',
        'maintenanceType',
        'cycleInfo',
        'standardDurationHours',
        'status',
        'actions'
      ]

      const actualOrder = TABLE_COLUMNS.map(col => col.prop)
      expect(actualOrder).toEqual(expectedOrder)
    })
  })
})

