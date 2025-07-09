# 批量删除确认组件 (BatchDeleteConfirm)

## 功能说明

BatchDeleteConfirm是一个通用的批量删除确认组件，封装了删除确认逻辑、冲突检测和展示功能，提供统一的删除操作API。该组件支持在多个业务模块中复用，大大简化了批量删除功能的实现。

## 核心特性

- ✅ **删除确认对话框**：提供友好的删除确认界面，显示待删除项目详情
- ✅ **冲突检测**：支持自定义冲突检测逻辑，智能处理无法删除的项目
- ✅ **冲突展示**：清晰展示冲突项目和可删除项目，支持部分删除
- ✅ **统一API**：提供标准化的删除操作接口，简化业务代码
- ✅ **错误处理**：完善的错误处理机制和用户反馈
- ✅ **可配置**：支持自定义显示字段、标题、操作名称等
- ✅ **事件通知**：提供完整的事件通知机制
- ✅ **简洁设计**：遵循Element UI设计规范，界面简洁实用

## 使用示例

### 基本使用

```vue
<template>
  <div>
    <!-- 批量操作工具栏 -->
    <batch-action
      :selected-rows="selectedRows"
      @batch-delete="handleBatchDelete"
    />
    
    <!-- 批量删除确认组件 -->
    <batch-delete-confirm
      ref="batchDeleteConfirm"
      :delete-api="deleteOperations"
      :conflict-detector="detectOperationConflicts"
      :display-fields="{
        id: 'id',
        code: 'code',
        name: 'name'
      }"
      title="批量删除工序"
      action-name="删除"
      @delete-success="handleDeleteSuccess"
      @delete-error="handleDeleteError"
      @delete-cancel="handleDeleteCancel"
      @conflict-detected="handleConflictDetected"
    />
  </div>
</template>

<script>
import BatchDeleteConfirm from '@/components/BatchDeleteConfirm'
import { batchDeleteOperations } from '@/api/operations'

export default {
  components: {
    BatchDeleteConfirm
  },
  data() {
    return {
      selectedRows: []
    }
  },
  methods: {
    // 处理批量删除触发
    handleBatchDelete(rows) {
      this.$refs.batchDeleteConfirm.show(rows)
    },
    
    // 删除API函数
    async deleteOperations(items) {
      try {
        const ids = items.map(item => item.id)
        const response = await batchDeleteOperations(ids)
        return {
          success: true,
          message: response.message,
          deletedCount: items.length
        }
      } catch (error) {
        return {
          success: false,
          message: error.message
        }
      }
    },
    
    // 冲突检测函数
    async detectOperationConflicts(items) {
      // 模拟冲突检测逻辑
      const conflicts = []
      const canDelete = []
      
      items.forEach(item => {
        // 检测逻辑：假设状态为'Active'的工序正在使用中
        if (item.status === 'Active') {
          conflicts.push({
            ...item,
            reason: '工序正在使用中'
          })
        } else {
          canDelete.push(item)
        }
      })
      
      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        canDelete
      }
    },
    
    // 删除成功处理
    handleDeleteSuccess({ deletedCount, message }) {
      this.$message.success(message || `成功删除${deletedCount}个工序`)
      this.refreshTable()
    },
    
    // 删除失败处理
    handleDeleteError({ error }) {
      this.$message.error(error.message || '删除失败')
    },
    
    // 取消删除处理
    handleDeleteCancel() {
      this.$message.info('已取消删除操作')
    },
    
    // 冲突检测处理
    handleConflictDetected({ conflicts, canDelete }) {
      console.log('检测到冲突:', conflicts)
      console.log('可删除项:', canDelete)
    },
    
    // 刷新表格
    refreshTable() {
      // 刷新逻辑
    }
  }
}
</script>
```

### 无冲突检测使用

```vue
<template>
  <batch-delete-confirm
    ref="batchDeleteConfirm"
    :delete-api="deleteItems"
    title="批量删除确认"
    action-name="删除"
    @delete-success="handleSuccess"
  />
</template>

<script>
export default {
  methods: {
    async deleteItems(items) {
      // 直接调用删除API
      const ids = items.map(item => item.id)
      const result = await api.batchDelete(ids)
      return {
        success: true,
        message: '删除成功',
        deletedCount: items.length
      }
    }
  }
}
</script>
```

## API文档

### Props

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| items | Array | 是 | [] | 待删除的数据项数组 |
| deleteApi | Function | 是 | - | 删除API函数 |
| conflictDetector | Function | 否 | null | 冲突检测函数 |
| displayFields | Object | 否 | {id:'id', code:'code', name:'name'} | 显示字段配置 |
| title | String | 否 | '批量删除确认' | 确认对话框标题 |
| actionName | String | 否 | '删除' | 操作名称（用于提示文本） |

#### deleteApi函数接口

```javascript
async function deleteApi(items) {
  // 参数: items为数组，每个元素包含id、code、name等字段
  // 返回: 删除结果对象
  return {
    success: boolean,      // 是否成功
    message: string,       // 提示信息
    deletedCount: number,  // 删除数量
    errors: []            // 错误信息（可选）
  }
}
```

#### conflictDetector函数接口

```javascript
async function conflictDetector(items) {
  // 参数: items为待删除项目数组
  // 返回: 冲突检测结果
  return {
    hasConflicts: boolean,  // 是否有冲突
    conflicts: [           // 冲突项目列表
      {
        id: string,
        code: string,
        name: string,
        reason: string,     // 冲突原因
        details: any       // 详细信息（可选）
      }
    ],
    canDelete: [          // 可删除项目列表
      {
        id: string,
        code: string,
        name: string
      }
    ]
  }
}
```

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| delete-success | {deletedCount: Number, message: String} | 删除成功时触发 |
| delete-error | {error: Error} | 删除失败时触发 |
| delete-cancel | {} | 取消删除时触发 |
| conflict-detected | {conflicts: Array, canDelete: Array} | 检测到冲突时触发 |

### Methods

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| show | items: Array | Promise&lt;void&gt; | 显示删除确认对话框 |
| hide | - | void | 隐藏对话框 |
| executeDelete | items: Array | Promise&lt;void&gt; | 执行删除操作 |

## 配置说明

### displayFields配置

用于配置在对话框中显示的字段映射：

```javascript
{
  id: 'id',           // 主键字段名
  code: 'code',       // 编码字段名
  name: 'name'        // 名称字段名
}
```

### 冲突检测配置

冲突检测函数应根据业务逻辑判断哪些项目无法删除：

```javascript
async function conflictDetector(items) {
  const conflicts = []
  const canDelete = []
  
  for (const item of items) {
    // 根据业务规则检测冲突
    const isInUse = await checkIfItemInUse(item.id)
    
    if (isInUse) {
      conflicts.push({
        ...item,
        reason: '项目正在使用中，无法删除'
      })
    } else {
      canDelete.push(item)
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    canDelete
  }
}
```

## 最佳实践

### 1. 错误处理

```javascript
async function deleteApi(items) {
  try {
    const result = await api.batchDelete(items.map(item => item.id))
    return {
      success: true,
      message: result.message || '删除成功',
      deletedCount: items.length
    }
  } catch (error) {
    console.error('删除失败:', error)
    return {
      success: false,
      message: error.message || '删除失败，请稍后重试'
    }
  }
}
```

### 2. 冲突检测优化

```javascript
// 批量检测，提高性能
async function conflictDetector(items) {
  const ids = items.map(item => item.id)
  const conflictIds = await api.checkBatchConflicts(ids)
  
  const conflicts = []
  const canDelete = []
  
  items.forEach(item => {
    if (conflictIds.includes(item.id)) {
      conflicts.push({
        ...item,
        reason: '存在依赖关系'
      })
    } else {
      canDelete.push(item)
    }
  })
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    canDelete
  }
}
```

### 3. 事件处理

```javascript
methods: {
  handleDeleteSuccess({ deletedCount, message }) {
    // 1. 显示成功提示
    this.$message.success(message)
    
    // 2. 刷新数据
    this.refreshTable()
    
    // 3. 清空选择
    this.selectedRows = []
    
    // 4. 记录操作日志
    this.logOperation('delete', deletedCount)
  },
  
  handleDeleteError({ error }) {
    // 1. 显示错误提示
    this.$message.error(error.message)
    
    // 2. 记录错误日志
    console.error('删除操作失败:', error)
    
    // 3. 可选：显示详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.log('错误详情:', error)
    }
  }
}
```

## 注意事项

1. **API函数格式**：deleteApi函数必须返回指定格式的对象
2. **冲突检测**：conflictDetector函数为可选，不传则直接显示确认对话框
3. **字段映射**：确保displayFields中的字段在数据项中存在
4. **事件处理**：建议监听所有事件并进行适当的用户反馈
5. **性能考虑**：大量数据时，冲突检测应使用批量API
6. **错误边界**：组件内部已处理基本错误，业务层应处理具体错误逻辑

## 实际使用案例

### 工序管理模块集成示例

在工序管理页面中已成功集成BatchDeleteConfirm组件：

```vue
<!-- 工序管理页面 (src/views/master-data/process-management/operations/index.vue) -->
<template>
  <div>
    <!-- 批量操作工具栏 -->
    <batch-action
      :selected-rows="selectedRows"
      @batch-delete="handleBatchDelete"
    />
    
    <!-- 批量删除确认组件 -->
    <batch-delete-confirm
      ref="batchDeleteConfirm"
      :delete-api="deleteOperationsApi"
      :conflict-detector="detectOperationConflicts"
      :display-fields="{
        id: 'id',
        code: 'code', 
        name: 'name'
      }"
      title="批量删除工序"
      action-name="删除"
      @delete-success="handleDeleteSuccess"
    />
  </div>
</template>

<script>
export default {
  methods: {
    // 批量删除处理
    handleBatchDelete(rows) {
      this.$refs.batchDeleteConfirm.show(rows)
    },

    // 删除API封装
    async deleteOperationsApi(items) {
      const ids = items.map(item => item.id)
      return await batchDeleteOperations(ids)
    },

    // 冲突检测函数
    async detectOperationConflicts(items) {
      try {
        const ids = items.map(item => item.id)
        await batchDeleteOperations(ids)
        return {
          hasConflicts: false,
          conflicts: [],
          canDelete: items
        }
      } catch (error) {
        if (error.code === 'OPERATIONS_IN_USE') {
          const { cannotDeleteIds } = error.details || {}
          const conflicts = items.filter(item => 
            cannotDeleteIds?.includes(item.id)
          )
          const canDelete = items.filter(item => 
            !cannotDeleteIds?.includes(item.id)
          )
          return {
            hasConflicts: true,
            conflicts: conflicts.map(item => ({
              ...item,
              reason: '该工序正在使用中，无法删除'
            })),
            canDelete
          }
        }
        throw error
      }
    },

    // 删除成功处理
    handleDeleteSuccess() {
      this.fetchList() // 刷新列表
      this.$refs.operationTable.clearSelection() // 清空选择
    }
  }
}
</script>
```

## 演示和测试

组件提供了完整的演示页面，可以在开发环境中测试所有功能：

```
src/components/BatchDeleteConfirm/demo.vue
```

演示页面包含：
- 模拟数据表格
- 普通删除流程演示
- 冲突删除流程演示
- 实时操作日志
- 完整的用户交互体验

## 更新日志

- 2024-01-10: 创建组件，实现基础删除确认和冲突处理功能
- 2024-01-10: 修复props设计问题，调整UI风格统一性
- 2024-01-10: 完成全局组件注册，在工序管理模块中成功集成
- 2024-01-10: 创建完整的演示页面和使用文档 