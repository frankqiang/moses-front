/**
 * 文件名称：form-config.spec.js
 * 文件描述：维护计划管理表单配置单元测试
 * 创建日期：2025-01-20
 * 修改记录：
 *   - 2025-01-20: 初始创建，验证表单配置的结构和完整性
 */

import {
  SEARCH_FORM_CONFIG,
  MAINTENANCE_PLAN_FORM_FIELDS,
  FORM_DEFAULT_VALUES,
  FORM_MODE_CONFIG,
  CHANGE_DETECTION_CONFIG,
  FORM_RULES,
  FORM_VALIDATION_CONFIG,
  FORM_HINTS_CONFIG
} from '@/views/master-data/equipment-tpm-management/maintenance-plan/constants/form-config'

describe('维护计划管理表单配置测试', () => {
  describe('SEARCH_FORM_CONFIG - 搜索表单配置', () => {
    it('应该是一个数组', () => {
      expect(Array.isArray(SEARCH_FORM_CONFIG)).toBe(true)
    })

    it('应该包含所有搜索字段', () => {
      const fieldProps = SEARCH_FORM_CONFIG.map(field => field.prop)

      expect(fieldProps).toContain('search')
      expect(fieldProps).toContain('equipmentId')
      expect(fieldProps).toContain('maintenanceType')
      expect(fieldProps).toContain('cycleType')
      expect(fieldProps).toContain('status')
    })

    it('每个字段应该包含必要的属性', () => {
      SEARCH_FORM_CONFIG.forEach(field => {
        expect(field).toHaveProperty('type')
        expect(field).toHaveProperty('prop')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('placeholder')
        expect(field).toHaveProperty('priority')
      })
    })

    it('关键词搜索应该是输入框类型', () => {
      const searchField = SEARCH_FORM_CONFIG.find(f => f.prop === 'search')
      expect(searchField.type).toBe('input')
      expect(searchField.priority).toBe('primary')
    })

    it('字典选择字段应该配置dictModule和dictKey', () => {
      const dictFields = SEARCH_FORM_CONFIG.filter(f => f.type === 'dict-select')

      dictFields.forEach(field => {
        expect(field).toHaveProperty('dictModule', 'tpm')
        expect(field).toHaveProperty('dictKey')
        expect(typeof field.dictKey).toBe('string')
      })
    })

    it('设备选择应该配置为远程搜索', () => {
      const equipmentField = SEARCH_FORM_CONFIG.find(f => f.prop === 'equipmentId')
      expect(equipmentField.remote).toBe(true)
      expect(equipmentField.remoteMethod).toBe('searchEquipment')
    })
  })

  describe('MAINTENANCE_PLAN_FORM_FIELDS - 表单字段配置', () => {
    it('应该是一个数组', () => {
      expect(Array.isArray(MAINTENANCE_PLAN_FORM_FIELDS)).toBe(true)
    })

    it('应该包含所有必要的表单部分', () => {
      const sectionKeys = MAINTENANCE_PLAN_FORM_FIELDS.map(s => s.sectionKey)

      expect(sectionKeys).toContain('basic')
      expect(sectionKeys).toContain('cycle')
      expect(sectionKeys).toContain('content')
      expect(sectionKeys).toContain('spareParts')
      expect(sectionKeys).toContain('status')
    })

    it('每个部分应该包含必要的属性', () => {
      MAINTENANCE_PLAN_FORM_FIELDS.forEach(section => {
        expect(section).toHaveProperty('section')
        expect(section).toHaveProperty('sectionKey')
        expect(typeof section.section).toBe('string')
        expect(typeof section.sectionKey).toBe('string')
      })
    })

    it('基础信息部分应该包含核心字段', () => {
      const basicSection = MAINTENANCE_PLAN_FORM_FIELDS.find(s => s.sectionKey === 'basic')
      const fieldProps = basicSection.fields.map(f => f.prop)

      expect(fieldProps).toContain('planCode')
      expect(fieldProps).toContain('planName')
      expect(fieldProps).toContain('equipmentId')
      expect(fieldProps).toContain('maintenanceType')
    })

    it('必填字段应该配置required和rules', () => {
      MAINTENANCE_PLAN_FORM_FIELDS.forEach(section => {
        if (section.fields) {
          section.fields.forEach(field => {
            if (field.required) {
              expect(Array.isArray(field.rules)).toBe(true)
              const hasRequiredRule = field.rules.some(rule => rule.required === true)
              expect(hasRequiredRule).toBe(true)
            }
          })
        }
      })
    })

    it('计划状态部分应该配置为仅在创建模式显示', () => {
      const statusSection = MAINTENANCE_PLAN_FORM_FIELDS.find(s => s.sectionKey === 'status')
      expect(statusSection.visibleWhen).toBe('create')
    })

    it('备件清单部分应该是特殊类型', () => {
      const sparePartsSection = MAINTENANCE_PLAN_FORM_FIELDS.find(s => s.sectionKey === 'spareParts')
      expect(sparePartsSection.type).toBe('spare-parts-table')
      expect(sparePartsSection.prop).toBe('requiredSpareParts')
    })
  })

  describe('FORM_DEFAULT_VALUES - 表单默认值', () => {
    it('应该是一个对象', () => {
      expect(typeof FORM_DEFAULT_VALUES).toBe('object')
      expect(FORM_DEFAULT_VALUES).not.toBeNull()
    })

    it('应该包含所有表单字段的默认值', () => {
      expect(FORM_DEFAULT_VALUES).toHaveProperty('planCode')
      expect(FORM_DEFAULT_VALUES).toHaveProperty('planName')
      expect(FORM_DEFAULT_VALUES).toHaveProperty('equipmentId')
      expect(FORM_DEFAULT_VALUES).toHaveProperty('maintenanceType')
      expect(FORM_DEFAULT_VALUES).toHaveProperty('cycleType')
      expect(FORM_DEFAULT_VALUES).toHaveProperty('cycleValue')
      expect(FORM_DEFAULT_VALUES).toHaveProperty('status')
    })

    it('状态字段默认值应该为"启用"', () => {
      expect(FORM_DEFAULT_VALUES.status).toBe('启用')
    })

    it('提前天数默认值应该为3', () => {
      expect(FORM_DEFAULT_VALUES.advanceDays).toBe(3)
    })

    it('备件清单默认值应该为空数组', () => {
      expect(Array.isArray(FORM_DEFAULT_VALUES.requiredSpareParts)).toBe(true)
      expect(FORM_DEFAULT_VALUES.requiredSpareParts).toHaveLength(0)
    })
  })

  describe('FORM_MODE_CONFIG - 表单模式配置', () => {
    it('应该包含所有表单模式', () => {
      expect(FORM_MODE_CONFIG).toHaveProperty('create')
      expect(FORM_MODE_CONFIG).toHaveProperty('update')
      expect(FORM_MODE_CONFIG).toHaveProperty('view')
    })

    it('每个模式应该配置标题和提交按钮文本', () => {
      Object.keys(FORM_MODE_CONFIG).forEach(mode => {
        const config = FORM_MODE_CONFIG[mode]
        expect(config).toHaveProperty('title')
        expect(config).toHaveProperty('submitText')
        expect(config).toHaveProperty('excludeSections')
      })
    })

    it('创建模式应该显示所有部分', () => {
      expect(FORM_MODE_CONFIG.create.excludeSections).toHaveLength(0)
      expect(FORM_MODE_CONFIG.create.title).toBe('创建维护计划')
      expect(FORM_MODE_CONFIG.create.submitText).toBe('创建')
    })

    it('编辑模式应该排除状态部分', () => {
      expect(FORM_MODE_CONFIG.update.excludeSections).toContain('status')
      expect(FORM_MODE_CONFIG.update.title).toBe('编辑维护计划')
      expect(FORM_MODE_CONFIG.update.submitText).toBe('保存')
    })

    it('查看模式不应该有提交按钮', () => {
      expect(FORM_MODE_CONFIG.view.submitText).toBeNull()
      expect(FORM_MODE_CONFIG.view.title).toBe('查看维护计划')
    })
  })

  describe('CHANGE_DETECTION_CONFIG - 变更检测配置', () => {
    it('应该包含需要检测的字段列表', () => {
      expect(Array.isArray(CHANGE_DETECTION_CONFIG.trackedFields)).toBe(true)
      expect(CHANGE_DETECTION_CONFIG.trackedFields.length).toBeGreaterThan(0)
    })

    it('应该包含周期相关字段配置', () => {
      expect(Array.isArray(CHANGE_DETECTION_CONFIG.cycleFields)).toBe(true)
      expect(CHANGE_DETECTION_CONFIG.cycleFields).toContain('cycleType')
      expect(CHANGE_DETECTION_CONFIG.cycleFields).toContain('cycleValue')
      expect(CHANGE_DETECTION_CONFIG.cycleFields).toContain('cycleUnit')
    })

    it('应该配置特殊字段的比较规则', () => {
      expect(CHANGE_DETECTION_CONFIG).toHaveProperty('specialFields')
      expect(CHANGE_DETECTION_CONFIG.specialFields).toHaveProperty('requiredSpareParts')

      const sparePartsConfig = CHANGE_DETECTION_CONFIG.specialFields.requiredSpareParts
      expect(sparePartsConfig.type).toBe('array')
      expect(Array.isArray(sparePartsConfig.compareKeys)).toBe(true)
    })
  })

  describe('FORM_RULES - 表单验证规则', () => {
    it('应该是一个对象', () => {
      expect(typeof FORM_RULES).toBe('object')
      expect(FORM_RULES).not.toBeNull()
    })

    it('必填字段应该包含required验证规则', () => {
      const requiredFields = ['planName', 'equipmentId', 'maintenanceType', 'maintenanceItems', 'cycleType', 'cycleValue', 'cycleUnit']

      requiredFields.forEach(field => {
        expect(FORM_RULES).toHaveProperty(field)
        const rules = FORM_RULES[field]
        expect(Array.isArray(rules)).toBe(true)

        const hasRequiredRule = rules.some(rule => rule.required === true)
        expect(hasRequiredRule).toBe(true)
      })
    })

    it('计划名称应该验证长度', () => {
      const planNameRules = FORM_RULES.planName
      const lengthRule = planNameRules.find(rule => rule.min && rule.max)

      expect(lengthRule).toBeDefined()
      expect(lengthRule.min).toBe(1)
      expect(lengthRule.max).toBe(200)
    })

    it('数值字段应该验证最小值', () => {
      expect(FORM_RULES.cycleValue).toBeDefined()
      expect(FORM_RULES.standardDurationHours).toBeDefined()
      expect(FORM_RULES.advanceDays).toBeDefined()

      const cycleValueRule = FORM_RULES.cycleValue.find(rule => rule.type === 'number')
      expect(cycleValueRule.min).toBeDefined()
      expect(cycleValueRule.min).toBeGreaterThanOrEqual(0)
    })

    it('URL字段应该验证格式', () => {
      const urlRules = FORM_RULES.instructionAttachmentUrl
      const urlRule = urlRules.find(rule => rule.type === 'url')

      expect(urlRule).toBeDefined()
    })
  })

  describe('FORM_VALIDATION_CONFIG - 表单验证配置', () => {
    it('应该包含自定义验证规则', () => {
      expect(FORM_VALIDATION_CONFIG).toHaveProperty('customRules')
      expect(typeof FORM_VALIDATION_CONFIG.customRules).toBe('object')
    })

    it('应该包含备件清单验证规则', () => {
      expect(FORM_VALIDATION_CONFIG.customRules).toHaveProperty('sparePartsValidation')
      expect(typeof FORM_VALIDATION_CONFIG.customRules.sparePartsValidation).toBe('function')
    })

    it('备件清单验证应该正确工作', (done) => {
      const validator = FORM_VALIDATION_CONFIG.customRules.sparePartsValidation

      // 测试空数组（应该通过）
      validator({}, [], (error) => {
        expect(error).toBeUndefined()

        // 测试完整数据（应该通过）
        validator({}, [{ sparePartId: '123', quantity: 1 }], (error) => {
          expect(error).toBeUndefined()

          // 测试不完整数据（应该失败）
          validator({}, [{ sparePartId: '', quantity: 1 }], (error) => {
            expect(error).toBeInstanceOf(Error)
            done()
          })
        })
      })
    })

    it('应该包含条件验证规则', () => {
      expect(FORM_VALIDATION_CONFIG).toHaveProperty('conditionalRules')
      expect(FORM_VALIDATION_CONFIG.conditionalRules).toHaveProperty('cycleUnit')
    })
  })

  describe('FORM_HINTS_CONFIG - 表单提示配置', () => {
    it('应该包含所有需要提示的字段', () => {
      expect(FORM_HINTS_CONFIG).toHaveProperty('planCode')
      expect(FORM_HINTS_CONFIG).toHaveProperty('advanceDays')
      expect(FORM_HINTS_CONFIG).toHaveProperty('instructionAttachmentUrl')
      expect(FORM_HINTS_CONFIG).toHaveProperty('status')
    })

    it('提示信息应该是字符串', () => {
      Object.values(FORM_HINTS_CONFIG).forEach(hint => {
        expect(typeof hint).toBe('string')
        expect(hint.length).toBeGreaterThan(0)
      })
    })
  })

  describe('配置导出别名验证', () => {
    it('所有配置应该有别名导出', () => {
      const config = require('@/views/master-data/equipment-tpm-management/maintenance-plan/constants/form-config')

      expect(config.searchFormConfig).toBe(SEARCH_FORM_CONFIG)
      expect(config.formFields).toBe(MAINTENANCE_PLAN_FORM_FIELDS)
      expect(config.defaultValues).toBe(FORM_DEFAULT_VALUES)
      expect(config.modeConfig).toBe(FORM_MODE_CONFIG)
      expect(config.changeDetectionConfig).toBe(CHANGE_DETECTION_CONFIG)
      expect(config.formRules).toBe(FORM_RULES)
      expect(config.validationConfig).toBe(FORM_VALIDATION_CONFIG)
      expect(config.hintsConfig).toBe(FORM_HINTS_CONFIG)
    })
  })
})

