# TemperatureCurveViewer.vue v2.0 兼容性重构完成报告

## 📋 变更概述
全面重构 `TemperatureCurveViewer.vue` 组件，完全兼容工艺参数管理模块 v2.0 版本的数据结构（固定12段工艺参数）。

## 🔄 重要数据结构变更

### 旧版本 → v2.0 版本字段映射

| 功能 | 旧版本字段 | v2.0版本字段 | 说明 |
|------|-----------|-------------|------|
| 段类型 | `segmentType` (升温/保温/降温/快速冷却) | `controlMode` (固定值"定时定温") | v2.0统一为定时定温控制 |
| 温度设置 | `targetTemperature` (单一目标温度) | `furnaceTemperature` + `materialTemperature` | v2.0分别设置炉温和料温 |
| 时间设置 | `duration` (分钟) | `timeSet` (小时) | 单位从分钟改为小时 |
| 运行时间 | - | `runTime` (小时) | v2.0新增执行时填写字段 |
| 风机速度 | - | `circulationFanSpeed` (低速/中速/高速) | v2.0明确风机速度枚举值 |
| 负压风机 | - | `negativePressureFan` (Hz) | v2.0新增参数 |
| 吹洗风机 | - | `cleaningFan` (Hz) | v2.0新增参数 |
| 吹洗时间 | - | `cleaningTime` (分钟) | v2.0新增参数 |

## ✅ 完成的修改

### 1. 数据校验逻辑更新 (`validationMessages` 计算属性)

**移除的旧版本校验**：
- ❌ `segmentType` 段类型检查
- ❌ `targetTemperature` 目标温度检查
- ❌ `duration` 持续时间检查

**新增的 v2.0 校验**：
- ✅ 固定12段数量检查
- ✅ `furnaceTemperature` 炉温设置检查（0-1500℃）
- ✅ `materialTemperature` 料温设置检查（0-1500℃）
- ✅ 料温不能高于炉温的业务规则检查
- ✅ `timeSet` 时间设置检查（小时）
- ✅ `circulationFanSpeed` 循环风机速度检查
- ✅ 炉温变化幅度检查（替代旧版本的目标温度变化检查）

### 2. 图表数据构建方法重构 (`buildSeriesData`)

**修改内容**：
```javascript
// 旧版本：单一温度曲线
buildSeriesData(segmentList, color) {
  // 使用 targetTemperature 和 duration（分钟）
  // 根据 segmentType 选择颜色
}

// v2.0版本：双温度曲线
buildSeriesData(segmentList, tempType = 'furnace', color) {
  // 根据 tempType 参数选择 furnaceTemperature 或 materialTemperature
  // 使用 timeSet（小时）
  // 不再依赖 segmentType 颜色映射
}
```

**新增功能**：
- 支持 `tempType` 参数选择炉温或料温数据
- 时间累计单位从分钟改为小时
- 返回的数据点包含完整的 v2.0 字段

### 3. 温度曲线配置方法重构 (`composeOption`)

**核心变更**：
```javascript
// 旧版本：单条曲线
composeOption(seriesData) {
  // 单一温度曲线
  // 显示目标温度、段类型、持续时间
}

// v2.0版本：双曲线（炉温+料温）
composeOption(furnaceTempData, materialTempData) {
  // 炉温曲线（红色，实线，圆圈标记）
  // 料温曲线（蓝色，实线，菱形标记）
  // Tooltip 显示：控温方式、炉温、料温、时间、循环风机
}
```

**视觉增强**：
- 炉温：红色 (#E74C3C)，实线，圆圈标记
- 料温：蓝色 (#3498DB)，实线，菱形标记
- X轴标签：`{value} h`（小时）
- Y轴标签：`{value} °C`
- Tooltip 显示完整的 v2.0 字段信息

### 4. 版本对比功能升级 (`buildComparisonSeries`)

**新增功能**：
- 对比版本同时显示炉温和料温
- 炉温对比线：虚线样式
- 料温对比线：点线样式
- 图例自动包含 "炉温" 和 "料温" 标签

### 5. 移除旧版本依赖

**移除的导入**：
```javascript
// ❌ 移除
import { SEGMENT_COLOR_MAP } from '../constants/chart-config'
```

**保留的导入**：
```javascript
// ✅ 保留
import {
  TEMPERATURE_COMPARISON_COLORS,
  TEMPERATURE_ALARM_ZONES,
  DEVICE_CAPABILITY_ZONES,
  TEMPERATURE_SUDDEN_DROP_THRESHOLD
} from '../constants/chart-config'
```

### 6. 用户界面更新

**描述文本更新**：
```javascript
currentChartDescription() {
  const descriptions = {
    temperature: '展示12段工艺参数的炉温和料温变化趋势（v2.0版本）',
    // ...
  }
}
```

## 📊 v2.0 版本数据示例

```json
{
  "segments": [
    {
      "segmentOrder": 1,
      "controlMode": "定时定温",
      "furnaceTemperature": 450.00,
      "materialTemperature": 430.00,
      "timeSet": 2.50,
      "runTime": null,
      "circulationFanSpeed": "中速",
      "negativePressureFan": 25.00,
      "cleaningFan": 20.00,
      "cleaningTime": 30.00
    }
    // ... 共12段
  ]
}
```

## ⚠️ 重要业务规则

### v2.0 版本新增规则
1. **固定12段**：工艺参数必须包含正好12个段
2. **料温 ≤ 炉温**：每段的料温必须低于或等于炉温
3. **时间单位**：时间设置单位为小时（非分钟）
4. **控温方式**：固定值为 "定时定温"
5. **风机速度**：仅支持 "低速"、"中速"、"高速" 三种枚举值

## 🧪 测试建议

### 1. 基础功能测试
- [ ] 使用 v2.0 数据结构加载温度曲线
- [ ] 验证炉温和料温双曲线正确显示
- [ ] 检查 X 轴时间单位为"小时"
- [ ] 检查 Tooltip 显示正确的 v2.0 字段

### 2. 数据校验测试
- [ ] 测试工艺段数量不是12段时的警告
- [ ] 测试料温高于炉温时的错误提示
- [ ] 测试缺少必填字段的错误提示
- [ ] 测试炉温变化幅度过大的警告

### 3. 版本对比测试
- [ ] 测试两个 v2.0 版本的对比显示
- [ ] 验证对比版本的炉温和料温曲线样式
- [ ] 检查图例正确显示所有曲线

### 4. 边界条件测试
- [ ] 空数据处理
- [ ] 不完整的12段数据
- [ ] 极端温度值（0℃, 1500℃）
- [ ] 极端时间值（0小时, 999小时）

## 📚 相关文档

- **接口文档**: `src/views/master-data/process-parameter-management/docs/接口文档/工艺参数管理模块接口文档_v2.0.md`
- **数据结构**: 参见接口文档中的"段参数对象（segments数组元素）字段说明"
- **常量配置**: `src/views/master-data/process-parameter-management/constants/chart-config.js`

## ✨ 后续优化建议

1. **性能优化**：对于大量数据点（12段×多版本），考虑添加数据抽样
2. **交互增强**：添加点击图例高亮对应曲线段的功能
3. **导出功能**：导出数据时包含 v2.0 完整字段信息
4. **可访问性**：添加键盘导航和屏幕阅读器支持

## 🎉 总结

TemperatureCurveViewer 组件已完全兼容 v2.0 版本数据结构，移除了所有旧版本字段的残留，实现了双温度曲线显示（炉温+料温），并完善了针对 v2.0 版本的数据校验规则。组件现在能够正确处理固定12段工艺参数，并提供更丰富的可视化信息。

---

**重构完成日期**: 2025-10-16
**兼容版本**: v2.0
**ESLint 状态**: ✅ 无错误
**向后兼容**: ❌ 不兼容旧版本数据（需要迁移）

