# 维护计划管理通用组件使用文档

本目录包含维护计划管理模块的所有通用组件，这些组件可以在维护计划相关页面中复用。

## 📦 组件列表

### 1. EquipmentSelector - 设备选择器

**功能：** 支持搜索和分页的设备选择器，显示设备编码、名称和类型

**使用示例：**

```vue
<template>
  <equipment-selector
    v-model="formData.equipmentId"
    placeholder="请选择设备"
    @select="handleEquipmentSelect"
  />
</template>

<script>
import EquipmentSelector from './EquipmentSelector.vue'

export default {
  components: {
    EquipmentSelector
  },
  data() {
    return {
      formData: {
        equipmentId: ''
      }
    }
  },
  methods: {
    handleEquipmentSelect(equipment) {
      console.log('选中的设备:', equipment)
    }
  }
}
</script>
```

**Props：**
- `value` (String): v-model 绑定值，设备ID
- `placeholder` (String): 占位符，默认"请选择设备"
- `disabled` (Boolean): 是否禁用
- `clearable` (Boolean): 是否可清空，默认 true
- `size` (String): 组件大小，可选 'medium'、'small'、'mini'

**Events：**
- `input`: v-model 绑定事件
- `change`: 选择变更事件
- `select`: 选中设备事件，返回完整设备信息
- `clear`: 清空事件

---

### 2. SparePartSelector - 备件选择器

**功能：** 支持搜索的备件选择器，显示备件编码、名称和库存状态

**使用示例：**

```vue
<template>
  <spare-part-selector
    v-model="formData.sparePartId"
    @select="handleSparePartSelect"
  />
</template>

<script>
import SparePartSelector from './SparePartSelector.vue'

export default {
  components: {
    SparePartSelector
  },
  data() {
    return {
      formData: {
        sparePartId: ''
      }
    }
  },
  methods: {
    handleSparePartSelect(sparePart) {
      console.log('选中的备件:', sparePart)
    }
  }
}
</script>
```

**Props：**
- `value` (String): v-model 绑定值，备件ID
- `placeholder` (String): 占位符
- `disabled` (Boolean): 是否禁用
- `size` (String): 组件大小

**Events：**
- `input`: v-model 绑定事件
- `change`: 选择变更事件
- `select`: 选中备件事件，返回完整备件信息

---

### 3. CycleConfigForm - 周期配置组件

**功能：** 维护周期配置，实现周期类型和单位的自动联动

**使用示例：**

```vue
<template>
  <cycle-config-form
    :cycle-type.sync="formData.cycleType"
    :cycle-value.sync="formData.cycleValue"
    :cycle-unit.sync="formData.cycleUnit"
    @change="handleCycleChange"
  />
</template>

<script>
import CycleConfigForm from './CycleConfigForm.vue'

export default {
  components: {
    CycleConfigForm
  },
  data() {
    return {
      formData: {
        cycleType: '',
        cycleValue: null,
        cycleUnit: ''
      }
    }
  },
  methods: {
    handleCycleChange(cycleConfig) {
      console.log('周期配置:', cycleConfig)
    }
  }
}
</script>
```

**Props：**
- `cycleType` (String): 周期类型，支持 .sync 修饰符
- `cycleValue` (Number): 周期值，支持 .sync 修饰符
- `cycleUnit` (String): 周期单位，支持 .sync 修饰符
- `disabled` (Boolean): 是否禁用
- `showHint` (Boolean): 是否显示提示信息，默认 true
- `size` (String): 组件大小

**Events：**
- `cycle-type-change`: 周期类型变更
- `cycle-value-change`: 周期值变更
- `cycle-unit-change`: 周期单位变更
- `change`: 完整配置变更，返回 { cycleType, cycleValue, cycleUnit }

---

### 4. MaintenanceTypeSelect - 维护类型选择器

**功能：** 维护类型选择器，包含所有维护类型枚举值

**使用示例：**

```vue
<template>
  <maintenance-type-select
    v-model="formData.maintenanceType"
    @select="handleTypeSelect"
  />
</template>

<script>
import MaintenanceTypeSelect from './MaintenanceTypeSelect.vue'

export default {
  components: {
    MaintenanceTypeSelect
  },
  data() {
    return {
      formData: {
        maintenanceType: ''
      }
    }
  },
  methods: {
    handleTypeSelect(typeInfo) {
      console.log('选中的维护类型:', typeInfo)
    }
  }
}
</script>
```

**维护类型枚举：**
- 日常保养
- 定期检查
- 大修
- 专项维护

**Props：**
- `value` (String): v-model 绑定值
- `placeholder` (String): 占位符
- `disabled` (Boolean): 是否禁用
- `size` (String): 组件大小

---

### 5. StandardDurationInput - 标准工时输入

**功能：** 标准工时输入组件，支持数值验证和单位显示

**使用示例：**

```vue
<template>
  <standard-duration-input
    v-model="formData.standardDurationHours"
    :min="0"
    :max="999"
    :precision="2"
    unit="小时"
    @duration-change="handleDurationChange"
  />
</template>

<script>
import StandardDurationInput from './StandardDurationInput.vue'

export default {
  components: {
    StandardDurationInput
  },
  data() {
    return {
      formData: {
        standardDurationHours: null
      }
    }
  },
  methods: {
    handleDurationChange({ value, formatted }) {
      console.log('工时:', value, '格式化:', formatted)
    }
  }
}
</script>
```

**Props：**
- `value` (Number): v-model 绑定值
- `min` (Number): 最小值，默认 0
- `max` (Number): 最大值，默认 999
- `precision` (Number): 精度，默认 2
- `step` (Number): 步长，默认 0.5
- `unit` (String): 单位文本，默认"小时"
- `showUnit` (Boolean): 是否显示单位，默认 true

---

### 6. SparePartsTable - 备件清单表格

**功能：** 备件清单表格组件，支持添加/删除/编辑备件

**使用示例：**

```vue
<template>
  <spare-parts-table
    v-model="formData.requiredSpareParts"
    :readonly="mode === 'view'"
    @add="handleSparePartAdd"
    @remove="handleSparePartRemove"
  />
</template>

<script>
import SparePartsTable from './SparePartsTable.vue'

export default {
  components: {
    SparePartsTable
  },
  data() {
    return {
      mode: 'edit',
      formData: {
        requiredSpareParts: []
      }
    }
  },
  methods: {
    handleSparePartAdd(sparePart) {
      console.log('添加备件:', sparePart)
    },
    handleSparePartRemove({ index, item }) {
      console.log('删除备件:', index, item)
    },
    // 验证备件清单
    validateSpareParts() {
      const result = this.$refs.sparePartsTable.validate()
      if (!result.valid) {
        console.error('验证失败:', result.errors)
      }
      return result.valid
    }
  }
}
</script>
```

**Props：**
- `value` (Array): v-model 绑定值，备件数组
- `readonly` (Boolean): 是否只读
- `showHeader` (Boolean): 是否显示表头
- `title` (String): 表头标题
- `maxItems` (Number): 最大备件数量，默认 50

**Events：**
- `add`: 添加备件事件
- `remove`: 删除备件事件，返回 { index, item }
- `spare-part-change`: 备件ID变更
- `quantity-change`: 数量变更
- `change`: 完整清单变更

**Methods：**
- `validate()`: 验证备件清单，返回 { valid, errors }
- `clear()`: 清空备件清单

---

### 7. StatusTag - 状态标签（全局组件）

**功能：** 状态标签组件，已存在于全局组件中

**使用示例：**

```vue
<template>
  <status-tag
    :status="plan.status"
    :type-map="{ '启用': 'success', '禁用': 'info' }"
    :text-map="{ '启用': '启用', '禁用': '禁用' }"
  />
</template>
```

---

### 8. 操作确认对话框（Element UI）

**功能：** 使用 Element UI 的 $confirm 实现操作确认

**使用示例：**

```javascript
// 启用确认
this.$confirm('确定要启用这个维护计划吗？启用后将自动按周期生成维护任务。', '启用确认', {
  confirmButtonText: '确定启用',
  cancelButtonText: '取消',
  type: 'warning'
}).then(() => {
  // 执行启用操作
}).catch(() => {
  // 取消操作
})

// 禁用确认
this.$confirm('确定要禁用这个维护计划吗？禁用后将停止生成新的维护任务。', '禁用确认', {
  confirmButtonText: '确定禁用',
  cancelButtonText: '取消',
  type: 'warning'
}).then(() => {
  // 执行禁用操作
}).catch(() => {
  // 取消操作
})
```

---

## 📝 使用注意事项

1. **组件导入：** 所有组件都支持按需导入，建议在使用前先导入
2. **表单验证：** 组件已内置基础验证，但业务逻辑验证需要在父组件中处理
3. **样式自定义：** 所有组件都支持通过 props 自定义样式和行为
4. **事件处理：** 建议使用组件提供的事件来处理业务逻辑
5. **错误处理：** 组件内部已包含基本错误处理，特殊情况需要在父组件中捕获

## 🔗 相关文档

- [维护计划管理接口文档](../docs/接口文档/维护计划管理接口文档.md)
- [维护计划管理前端开发任务清单](../docs/任务清单/维护计划管理前端开发任务清单.md)

