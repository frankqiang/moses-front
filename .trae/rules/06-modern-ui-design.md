---
description: 当进行UI设计、样式开发或组件美化时请求此规则
globs: 
alwaysApply: false
---
# 现代UI设计规范

## 核心设计理念
- **简约至上**：减少视觉杂乱，专注于内容本身
- **一致性**：保持统一的设计语言，提升用户学习效率
- **直观性**：用户无需思考即可理解界面操作
- **目的性**：每个设计元素都应有明确的目的
- **流畅性**：确保界面流畅响应，减少等待时间

## 色彩体系
### 构建统一色彩体系
- 选择1个主色调，2-3个辅助色，5-7个功能色
- 主色推荐：深蓝(#1976D2)、靛蓝(#3F51B5)、紫色(#673AB7)、青色(#00BCD4)、绿色(#4CAF50)
- 功能色：成功(绿)、警告(黄/橙)、错误(红)、信息(蓝/灰)
- 建立完整的色彩梯度：每种颜色至少5个深浅变化

### 推荐色彩工具
- [Adobe Color](mdc:https:/color.adobe.com) - 创建协调的配色方案
- [Coolors](mdc:https:/coolors.co) - 快速生成配色方案
- [Material Design Color Tool](mdc:https:/material.io/resources/color) - 基于Material设计的配色工具

## 排版系统
### 字体选择
- 无衬线字体：适合屏幕显示，推荐Inter、Roboto、SF Pro、Noto Sans
- 中文字体：推荐思源黑体、微软雅黑、苹方
- 推荐使用系统字体堆栈：
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  ```

### 字体大小比例
- 使用类型比例设置字体大小关系：1.125（小三度）或1.2（小四度）
- 基础字体大小：16px（桌面）/ 14px（移动）
- 标题层级清晰：H1(2.5rem)、H2(2rem)、H3(1.75rem)、H4(1.5rem)、H5(1.25rem)
- 行高：正文1.5-1.6，标题1.2-1.3

## 间距与布局
### 间距系统
- 使用8px网格系统（4px、8px、16px、24px、32px、48px、64px）
- 小间距（4px、8px）用于相关元素之间
- 中间距（16px、24px）用于内容分组
- 大间距（32px、48px、64px）用于主要分区

### 布局系统
- 采用响应式栅格系统：推荐12栅格
- 边距随屏幕尺寸变化：移动(16px)、平板(24px)、桌面(32px+)
- 关键断点：480px、768px、992px、1200px、1600px

## 开源组件库推荐
### UI组件框架
- [Tailwind CSS](mdc:https:/tailwindcss.com) - 实用优先的CSS框架
- [Chakra UI](mdc:https:/chakra-ui.com) - 简洁、模块化的组件库
- [Ant Design](mdc:https:/ant.design) - 企业级UI设计语言
- [Element Plus](mdc:https:/element-plus.org) - 基于Vue 3的组件库
- [MUI](mdc:https:/mui.com) - 遵循Material Design的React组件库

### 图标库
- [Iconify](mdc:https:/iconify.design) - 整合多个图标集的统一API
- [Phosphor Icons](mdc:https:/phosphoricons.com) - 灵活、一致的开源图标集
- [Font Awesome](mdc:https:/fontawesome.com) - 广泛使用的图标库
- [Remix Icon](mdc:https:/remixicon.com) - 开源中性风格图标系统
- [Tabler Icons](mdc:https:/tabler-icons.io) - 精心制作的开源SVG图标

### 图表库
- [Chart.js](mdc:https:/www.chartjs.org) - 简单易用的HTML5图表
- [D3.js](mdc:https:/d3js.org) - 强大的数据可视化库
- [ECharts](mdc:https:/echarts.apache.org) - 功能丰富的交互式图表
- [Recharts](mdc:https:/recharts.org) - 基于React的可组合图表库
- [ApexCharts](mdc:https:/apexcharts.com) - 现代交互式图表

## 设计模式
### 导航模式
- 桌面端：顶部导航栏、侧边栏、标签页导航
- 移动端：底部标签栏、汉堡菜单、滑动抽屉
- 通用：面包屑、返回按钮、搜索框

### 内容展示模式
- 卡片设计：边框半径4-8px，适当阴影（0 2px 8px rgba(0,0,0,0.1)）
- 列表视图：一致的行高和边距，明确的分割线
- 表格设计：行交替色、悬停高亮、分页控件
- 空状态：提供有帮助的提示和操作按钮

### 交互反馈
- 按钮状态：默认、悬停、点击、禁用，状态差异明显
- 加载状态：使用骨架屏、加载指示器，保持布局稳定
- 表单反馈：内联验证，即时反馈，清晰的错误信息
- 动效适度：页面切换(0.3s)、元素变化(0.2s)、提示出现(0.15s)

## 适配性与可访问性
### 响应式设计
- 移动优先：先设计移动版，再拓展到大屏幕
- 内容适配：重要内容优先，复杂功能在大屏展示
- 触控友好：可点击区域至少44×44px，避免密集操作区

### 可访问性标准
- 符合WCAG 2.1标准，目标AA级
- 颜色对比度：正文4.5:1，大字号3:1
- 键盘可访问：所有交互可通过键盘完成
- 支持屏幕阅读器：提供适当的aria标签和角色

## 设计资源
- [Figma](mdc:https:/www.figma.com) - 协作设计工具
- [Unsplash](mdc:https:/unsplash.com) - 免费高质量图片
- [unDraw](mdc:https:/undraw.co) - 开源插图
- [Humaaans](mdc:https:/www.humaaans.com) - 可定制的人物插图
- [Hero Patterns](mdc:https:/heropatterns.com) - SVG背景模式
