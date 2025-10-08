# Vue Admin Template 开发日志

## 2025-01-08 工艺参数管理模块优化

### 会话主要目的
优化工艺参数管理模块的操作列按钮，删除tooltip提示，与产品管理和设备管理模块保持统一的UI交互风格。

### 完成的主要任务
1. **删除操作列按钮tooltip提示**
   - 移除`TemplateTable.vue`组件中所有操作按钮的tooltip属性
   - 参考设备管理和产品管理模块的实现方式
   - 确保按钮配置保持简洁，只保留必要的action、text、icon、type属性

2. **修复表格列tooltip配置**
   - 在`table-config.js`的操作列配置中添加`showOverflowTooltip: false`
   - 禁用Element UI表格默认的溢出tooltip行为
   - 与产品管理模块保持一致的配置方式

### 关键决策和解决方案
1. **UI一致性决策**
   - 采用与设备管理模块（EquipmentTable.vue）相同的按钮配置方式
   - 移除tooltip属性，让按钮文字本身提供足够的操作说明
   - 保留confirmText属性用于需要二次确认的危险操作

2. **按钮配置优化**
   - 查看详情、编辑模板、新建版本等常规操作移除tooltip
   - 审批相关操作（提交审批、审批通过、审批驳回、撤回审批）移除tooltip
   - 快速生效、作废版本等保留confirmText二次确认
   - 复制模板、删除操作移除tooltip

3. **表格列配置修复**
   - Element UI表格默认在内容溢出时自动显示tooltip
   - 需要在操作列配置中显式设置`showOverflowTooltip: false`来禁用
   - 这是tooltip显示的根本原因

### 使用的技术栈
- Vue 2
- Element UI
- ActionButtons全局组件

### 修改的文件
1. `src/views/master-data/process-parameter-management/components/TemplateTable.vue`
   - 删除getActionButtons方法中所有按钮配置的tooltip属性（共10个按钮）
   - 保持按钮的基本配置：action、text、icon、type
   - 保留confirmText和danger等必要属性

2. `src/views/master-data/process-parameter-management/constants/table-config.js`
   - 在操作列配置中添加`showOverflowTooltip: false`（第152行）
   - 禁用Element UI表格默认的溢出tooltip行为

3. `README.md`
   - 新增本次开发日志记录

### 代码变更详情

#### TemplateTable.vue 修改点
- **第370-376行**：查看详情按钮 - 删除tooltip
- **第379-386行**：编辑模板按钮 - 删除tooltip
- **第389-396行**：新建版本按钮 - 删除tooltip
- **第402-408行**：提交审批按钮 - 删除tooltip
- **第411-418行**：审批通过按钮 - 删除tooltip
- **第421-428行**：审批驳回按钮 - 删除tooltip
- **第431-438行**：撤回审批按钮 - 删除tooltip
- **第441-449行**：快速生效按钮 - 删除tooltip（保留confirmText）
- **第452-461行**：作废版本按钮 - 删除tooltip（保留confirmText）
- **第464-469行**：复制模板按钮 - 删除tooltip
- **第472-481行**：删除按钮 - 删除tooltip（保留confirmText和danger）

#### table-config.js 修改点
- **第152行**：操作列配置添加`showOverflowTooltip: false`
- 这是解决tooltip显示的关键配置

### 问题分析
1. **tooltip显示的根本原因**：
   - Element UI表格列默认在内容溢出时会自动显示tooltip
   - ActionButtons组件虽然没有设置`:show-tooltip="true"`，但表格列本身的tooltip功能仍然生效
   - 需要在表格列配置中显式禁用

2. **解决方案**：
   - 删除按钮配置中的tooltip属性（避免ActionButtons组件显示tooltip）
   - 在表格列配置中设置`showOverflowTooltip: false`（禁用表格列的默认tooltip）

### 验证结果
- ✅ 所有linter检查通过
- ✅ 按钮配置与设备管理模块风格一致
- ✅ 保留了必要的二次确认功能
- ✅ 表格列tooltip已禁用，与产品管理模块一致

---

## 2025-01-08 修复版本中心作废版本按钮显示异常

### 会话主要目的
修复工艺参数管理模块版本中心的"作废版本"按钮文字显示异常问题（文字在红色背景上看不见）。

### 问题分析
1. **问题现象**：
   - 版本中心的"作废版本"按钮文字无法显示
   - 按钮背景是红色，但文字也是红色，导致不可见

2. **根本原因**：
   - VersionCenterDrawer中使用ActionButtons组件的normal模式，按钮配置为`type: 'danger'`
   - Element UI的`el-button`在`type="danger"`时应用红色背景+白色文字
   - ActionButtons组件又添加了`.danger-button`类，设置了`color: #F56C6C`（红色文字）
   - 两个样式冲突：红色文字覆盖了白色文字，在红色背景上无法显示

3. **设计缺陷**：
   - ActionButtons组件的`.danger-button`、`.success-button`、`.warning-button`样式只适用于text模式
   - 但样式没有限定适用范围，导致在normal模式下也会生效并覆盖Element UI原生样式

### 解决方案
修改ActionButtons组件的样式，限定danger/success/warning按钮样式仅对text类型按钮生效：

```scss
// 修改前
&.danger-button {
  color: #F56C6C;  // 会覆盖所有类型按钮的文字颜色

  &:hover {
    color: #F56C6C;
    background-color: #FEF0F0;
  }
}

// 修改后
&.danger-button {
  &.el-button--text {  // 仅对text类型按钮生效
    color: #F56C6C;

    &:hover {
      color: #F56C6C;
      background-color: #FEF0F0;
    }
  }
}
```

### 完成的主要任务
1. **修复danger-button样式**
   - 添加`.el-button--text`选择器限定，仅对text类型按钮应用自定义颜色
   - 保留Element UI原生danger按钮样式（红色背景+白色文字）

2. **修复success-button和warning-button样式**
   - 同样添加`.el-button--text`选择器限定
   - 防止类似问题在其他按钮上出现

### 修改的文件
1. `src/components/ActionButtons/index.vue`
   - 第594-603行：修改`.danger-button`样式，限定仅对text类型按钮生效
   - 第606-615行：修改`.success-button`样式，限定仅对text类型按钮生效
   - 第618-627行：修改`.warning-button`样式，限定仅对text类型按钮生效

2. `README.md`
   - 新增本次修复记录

### 使用的技术栈
- Vue 2
- Element UI
- SCSS

### 影响范围
- 修复了所有使用ActionButtons组件normal模式的danger/success/warning类型按钮显示问题
- text模式的按钮样式保持不变
- 不影响其他组件和模块

### 验证结果
- ✅ 所有linter检查通过
- ✅ 版本中心的"作废版本"按钮文字正常显示
- ✅ 其他danger/success/warning类型按钮也能正常显示
- ✅ text模式的按钮样式不受影响

---

## 2025-01-08 修复温度曲线不显示问题

### 会话主要目的
解决版本中心温度曲线弹窗及参数配置页中ECharts曲线不渲染的问题（图表区域为空白）。

### 问题分析
1. **DOM结构问题**：
   - `TemperatureCurveViewer`内部使用`<ErrorHandler>`组件包裹ECharts容器
   - 由于`ErrorHandler`模板没有渲染默认插槽，`.temperature-curve-viewer__chart`元素缺失
   - 浏览器Console执行`document.querySelector('.temperature-curve-viewer__chart')`返回`undefined`

2. **渲染流程受阻**：
   - ECharts初始化依赖`chartRef`获取真实DOM
   - DOM缺失导致`echarts.init`无法执行，曲线自然不会显示

### 解决方案
1. **移除ErrorHandler包装**：
   - 直接在模板中渲染显式的图表容器
   - 使用`errorMessage`控制显示错误提示，保障`chartRef`始终有效

2. **新增错误占位样式**：
   - 新增`.temperature-curve-viewer__chart-wrapper`与`.temperature-curve-viewer__chart-error`
   - 当存在错误时展示友好的提示面板，正常情况下渲染曲线

### 修改的文件
1. `src/views/master-data/process-parameter-management/components/TemperatureCurveViewer.vue`
   - 移除`<ErrorHandler>`包装，改为显式图表容器
   - 删除对`ErrorHandler`的引用
   - 新增图表容器包装与错误提示样式，确保布局稳定

2. `README.md`
   - 记录温度曲线问题的原因与修复方案

### 使用的技术栈
- Vue 2
- Element UI
- ECharts
- SCSS

### 验证结果
- ✅ DOM查询能够获取`temperature-curve-viewer__chart`节点
- ✅ 温度曲线在弹窗与参数配置页均正常显示
- ✅ 当存在错误时显示统一的错误提示

