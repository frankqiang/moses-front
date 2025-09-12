---
description: 表格列表功能开发、全局组件使用和交互模式规范
globs: 
alwaysApply: false
---
# 表格模块开发规范

## 适用范围
本规则适用于所有包含表格列表的功能模块开发，规定了统一的组件架构、全局组件使用和交互模式，所有新的表格模块和改造的旧模块都需遵循此规范。

## 参考示例
请参考`src/views/master-data/equipment`目录作为表格模块开发的标准示例。该模块展示了如何使用全局组件和配置化方式构建高复用、易维护的表格功能。

## 性能优化要求
- **强制要求**：大数据量表格（>1000条）必须使用BaseTable的虚拟滚动功能
- **自动优化**：BaseTable内置防抖优化，自动处理排序和分页的频繁操作
- **内存管理**：BaseTable自动清理事件监听器，防止内存泄漏
- 复杂表单使用懒加载，表格数据使用本地缓存减少请求
- 列表页面添加防抖/节流优化搜索性能

## 强制使用的全局组件

### 1. SearchForm组件
- **组件标准**：所有列表搜索表单需使用全局SearchForm组件
- 通过配置方式定义表单项，支持展开/收起功能

### 2. TableToolbar组件
- **组件标准**：所有表格上方的工具栏需使用全局TableToolbar组件
- 整合了批量操作、列设置、导入导出和自定义操作按钮

### 3. BaseTable组件（现代化表格）
- **强制使用**：所有新开发的表格模块必须使用优化后的 [BaseTable组件](mdc:src/components/BaseTable/index.vue)
- 自动实现虚拟滚动、错误处理、防抖优化等现代化特性
- 提供完整的性能优化和用户体验保障

#### 核心特性
- **虚拟滚动**：自动处理大数据量（1000+条记录）的性能优化
- **错误边界**：内置错误捕获和恢复机制，确保表格稳定性
- **防抖优化**：排序和分页操作自动防抖，避免频繁请求
- **类型安全**：完整的props验证和数据结构检查
- **内存管理**：自动清理事件监听器，防止内存泄漏

#### 基本用法
```vue
<base-table
  :data="tableData"
  :columns="tableColumns"
  :loading="loading"
  :total="total"
  :current-page.sync="currentPage"
  :page-size.sync="pageSize"
  :virtual-scroll="data.length > 1000"
  @selection-change="handleSelectionChange"
  @pagination="handlePagination"
>
  <template #column-status="{ row }">
    <status-tag :status="row.status" />
  </template>
  <template #column-actions="{ row }">
    <action-buttons :buttons="getActionButtons(row)" @click="handleActionClick" />
  </template>
</base-table>
```

### 4. ActionButtons组件
- **组件标准**：表格中的操作按钮需使用全局ActionButtons组件
- 使用预设按钮配置或自定义按钮配置，支持文本模式和图标模式

### 5. StatusTag组件
- **组件标准**：所有状态展示需使用全局StatusTag组件
- 使用预设状态类型或自定义状态配置

### 6. OverflowTagsPopover组件
- **推荐使用**：表格中需要显示多个标签或对象数组时使用
- 支持设置最大显示数量，超出部分以弹出框形式展示

### 7. 表单与抽屉组件
- **组件标准**：所有表单抽屉需采用组件分离与组合模式，使用BaseDrawer和EnhancedForm组件
- 支持create/update/view三种模式
- **必须实现"保存并继续"功能**，允许用户在新增模式下连续添加多条记录

### 8. Pagination组件
- **组件标准**：所有表格分页需使用全局Pagination组件
- 正确处理分页事件和同步属性

## 组件集成规范

### [Module]Table 组件集成
- **强制要求**：新开发的表格组件必须使用BaseTable作为核心表格组件
- 表格组件应集成 TableToolbar、ActionButtons、StatusTag 和 Pagination
- 必须实现列设置功能，支持用户自定义显示列
- **性能保障**：自动启用虚拟滚动、防抖优化、错误处理等现代化特性

### [Module]FormDrawer 组件集成
- 表单抽屉组件应采用组件分离与组合模式
- 根据不同的模式（create/update/view）展示不同的表单内容

## 交互规范

### 表格操作
- 表格行操作使用文本按钮，放置在最右侧固定列中
- 批量操作放置在表格上方工具栏中
- 操作按钮图标和文字统一，参照预设按钮配置

### 表单抽屉
- 表单在抽屉中打开，不使用弹窗
- 表单按分类分段展示，每个分段有明确标题
- 表单抽屉宽度统一为700px
- 查看模式下表单项禁用，不显示保存按钮

### 状态展示
- 使用不同颜色和图标区分不同状态
- 状态切换操作需要二次确认
- 禁用状态的行整行显示为灰色

### 分类导航
- 对于需要按类型区分的数据，应使用类型导航栏
- 类型导航栏放置在搜索表单上方，支持快速切换不同类型数据
- 每个类型显示其包含的记录数量

## 批量操作规范

### 批量操作实现规范
- 批量操作前应检查是否有选中的行，如无则提示用户
- 危险操作（如删除）必须进行二次确认
- 批量操作应向用户展示操作进度或加载状态
- 操作完成后必须刷新数据列表

### 批量删除示例实现
```javascript
handleBatchDelete(rows) {
  if (!rows || rows.length === 0) {
    this.$message.warning('请至少选择一条记录')
    return
  }
  
  this.$confirm('确认批量删除选中的记录吗？此操作不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    this.listLoading = true
    const ids = rows.map(row => row.id)
    
    batchDeleteAPI(ids).then(response => {
      this.$message.success(response.data.message || `成功删除 ${response.data.count || ids.length} 条记录`)
      this.refreshList()
    }).catch(error => {
      if (error && error.code) {
        this.$message.error(error.message || '批量删除失败')
      }
      this.listLoading = false
    })
  }).catch(() => {
    this.$message.info('已取消删除操作')
  })
}
```

## 配置化开发

### 核心配置项
- **列设置存储键名**：使用模块名+类型名格式
- **导出参数**：包含查询参数和导出标识
- **导入API函数**：支持文件上传和类型参数
- **默认显示列**：定义初始显示的表格列

### 表单配置
- 使用动态表单分段配置，清晰组织表单字段
- 支持不同类型的表单控件配置

### 表格列配置
- 支持多种渲染类型：status、tags、actions等
- 列配置包含prop、label、width、sortable等属性

## 最佳实践

1. **使用计算属性**：将复杂的表单和表格配置放在计算属性中
2. **模块化API**：将API调用封装在单独的文件中
3. **配置预设**：使用预设配置简化常见操作
4. **文档完善**：在README.md中记录模块功能、组件说明和注意事项
5. **代码复用**：抽取可复用逻辑到mixins中

## 核心原则

1. **统一性**：所有表格模块使用相同的组件结构和交互模式
2. **配置化**：尽量通过配置而非硬编码实现功能
3. **复用性**：充分利用全局组件和预设配置
4. **可维护性**：清晰的结构和足够的文档
5. **用户体验**：一致的交互模式和视觉样式

## 质量检查清单

### 基础规范检查
- [ ] 目录结构符合规范
- [ ] 使用全局组件实现核心功能
- [ ] 代码注释完善，符合ESLint规范

### BaseTable组件检查
- [ ] **强制使用BaseTable组件**：新开发的表格模块必须使用优化后的BaseTable
- [ ] **虚拟滚动配置**：大数据量表格（>1000条）正确配置了虚拟滚动参数
- [ ] **错误处理实现**：正确处理loadError和retry事件
- [ ] **性能优化启用**：启用了防抖、虚拟滚动等性能优化特性

### 功能完整性检查
- [ ] 搜索表单实现完整搜索和重置功能
- [ ] 表格实现列设置功能和本地存储
- [ ] **确保实现"保存并继续"功能**，可以连续添加多条记录
- [ ] 批量操作实现符合规范
- [ ] 功能完整：查询、新增、编辑、查看、删除、状态切换

### 用户体验检查
- [ ] UI风格统一，与系统整体风格一致
- [ ] 错误处理完善，提供友好的错误提示
- [ ] 大数据量表格滚动流畅（60fps）
- [ ] 错误场景有重试机制和降级显示

### 性能优化检查
- [ ] **虚拟滚动性能**：大列表滚动保持流畅，内存占用稳定
- [ ] **防抖优化**：搜索、排序、分页等操作添加了防抖处理
- [ ] **内存管理**：组件销毁时正确清理事件监听器和定时器
- [ ] **类型验证**：Props进行了完整的类型验证和默认值设置


