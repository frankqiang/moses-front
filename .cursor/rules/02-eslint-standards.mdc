---
description: 
globs: 
alwaysApply: true
---
# 规则类型：Auto Attached

# 匹配模式：**/*.{js,vue,ts}
# 说明：所有代码文件都需要遵循代码规范

# ESLint规范指南

## 概述
该规范为项目中的ESLint代码质量检查提供了详细指导，用以确保代码风格一致性和避免常见错误。所有编码工作必须遵循这些规则，以保持代码质量和可维护性。

## ESLint核心规则

### 语法规则
- 不允许行尾空格 (`no-trailing-spaces`)
- 文件末尾需要空行 (`eol-last`)
- 不允许使用未定义的变量 (`no-undef`)
- 不允许定义未使用的变量 (`no-unused-vars`)
- 缩进使用2个空格 (`indent`)
- 禁止多余的空行，最多允许1行 (`no-multiple-empty-lines`)

### Vue组件规则
- 属性顺序 (`vue/attributes-order`)：按以下顺序排列：
  1. 定义 (如 `is`, `ref`)
  2. 列表渲染 (如 `v-for`)
  3. 条件渲染 (如 `v-if`, `v-else-if`, `v-else`, `v-show`)
  4. 渲染修饰符 (如 `v-once`, `v-pre`)
  5. 全局感知 (如 `id`)
  6. 唯一标识符 (如 `:key`)
  7. 双向绑定 (如 `v-model`)
  8. 其他属性 (`:prop`, `:is`, `:class`, `:style`)
  9. 事件 (`@click`, `@input`)
  10. 内容 (`v-html`, `v-text`)

- 组件名称使用PascalCase格式 (`vue/name-property-casing`)
- 单行HTML元素不强制换行 (`vue/singleline-html-element-content-newline`: "off")
- 多行HTML元素不强制换行 (`vue/multiline-html-element-content-newline`: "off")

## 编码实践

### 避免行尾空格
- 确保代码中没有行尾空格
- 大多数编辑器可以配置为自动删除行尾空格

示例：
```js
// 错误
const name = 'John';␣␣

// 正确
const name = 'John';
```

### 避免未使用的导入
- 删除或注释掉未使用的导入
- 如果可能将来会使用，添加明确的注释说明

示例：
```js
// 错误
import { A, B, C } from 'module';
// 只使用了A和B

// 正确
import { A, B } from 'module';
// 或
import { A, B, 
  // C, // 暂未使用，后续功能可能需要
} from 'module';
```

### Vue属性顺序
按照规定的顺序排列Vue组件的属性：

```vue
<!-- 错误 -->
<el-button
  @click="handleClick"
  type="primary"
  ref="button"
>
  按钮
</el-button>

<!-- 正确 -->
<el-button
  ref="button"
  type="primary"
  @click="handleClick"
>
  按钮
</el-button>
```

## 工具和设置

### 编辑器配置
在VSCode中，可以安装ESLint插件并配置保存时自动修复：

```json
// settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 命令行工具
使用项目配置的lint命令检查和修复代码：

```bash
# 检查代码
npm run lint

# 检查并自动修复
npm run lint -- --fix
```

### 预提交钩子
可以设置Git pre-commit钩子，在提交前自动运行lint检查：

```bash
npx husky add .husky/pre-commit "npm run lint"
```

## 实际案例

### 修复行尾空格
使用ESLint修复命令：
```bash
npm run lint -- --fix path/to/file.vue
```

### 修复未使用的导入
在Import语句中删除未使用的模块：
```js
// 修改前
import { A, B, C } from 'module';

// 修改后(仅使用A和B)
import { A, B } from 'module';
```

### 修复属性顺序
遵循Vue属性顺序规则，重新排列属性：
```vue
<!-- 修改前 -->
<el-pagination
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
  :current-page="listQuery.page"
  :page-sizes="[10, 20, 30, 50]"
  :page-size="listQuery.limit"
  layout="total, sizes, prev, pager, next, jumper"
  :total="total"
/>

<!-- 修改后 -->
<el-pagination
  :current-page="listQuery.page"
  :page-sizes="[10, 20, 30, 50]"
  :page-size="listQuery.limit"
  layout="total, sizes, prev, pager, next, jumper"
  :total="total"
  @size-change="handleSizeChange"
  @current-change="handleCurrentChange"
/>
```

遵循本规范将确保代码质量和一致性，减少协作开发中的冲突和问题。
