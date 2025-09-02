# VSCode 配置说明

本项目已配置了完整的代码格式化和质量检查工具，包括 ESLint 和 Prettier。

## 自动配置功能

### 保存时自动修复

- **保存时格式化**: 使用 Prettier 自动格式化代码
- **保存时 ESLint 修复**: 自动修复可修复的 ESLint 错误

### 推荐扩展

项目会自动提示安装以下扩展：

- `ESLint` - JavaScript 代码质量检查
- `Prettier - Code formatter` - 代码格式化
- `Path Intellisense` - 路径智能提示
- `Auto Rename Tag` - 自动重命名标签

## 快捷键

| 快捷键         | 功能                         |
| -------------- | ---------------------------- |
| `Ctrl+Shift+L` | 运行 ESLint 修复所有文件     |
| `Ctrl+Shift+P` | 运行 Prettier 格式化所有文件 |
| `Ctrl+Shift+F` | 运行完整的代码检查和格式化   |

## 任务命令

可以通过 `Ctrl+Shift+P` 打开命令面板，然后输入 "Tasks: Run Task" 来执行：

1. **ESLint: Fix All** - 修复所有 ESLint 错误
2. **Prettier: Format All** - 格式化所有文件
3. **Lint and Format All** - 完整的代码检查和格式化流程

## Git 提交钩子

项目已配置 Husky pre-commit 钩子：

- 提交前自动运行 ESLint 检查
- 自动修复可修复的问题
- 如果有无法自动修复的错误，会阻止提交

## 配置文件说明

- `.vscode/settings.json` - VSCode 工作区设置
- `.vscode/tasks.json` - 自定义任务配置
- `.vscode/keybindings.json` - 快捷键配置
- `.vscode/extensions.json` - 推荐扩展列表
- `.eslintrc.json` - ESLint 规则配置
- `.prettierrc.json` - Prettier 格式化规则
- `.lintstagedrc.json` - Git 提交时的检查配置
