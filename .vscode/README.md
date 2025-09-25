# VSCode 自动修复故障排除指南

## 如果保存时自动修复不工作，请按以下步骤操作：

### 1. 重新加载 VS Code 窗口
- 按 `Ctrl+Shift+P` 打开命令面板
- 输入 "Developer: Reload Window" 并执行
- 或者直接重启 VS Code

### 2. 检查扩展状态
- 确保 ESLint 扩展已安装并启用
- 确保 Prettier 扩展已安装并启用
- 在扩展页面禁用然后重新启用这两个扩展

### 3. 检查 ESLint 状态
- 按 `Ctrl+Shift+P` 打开命令面板
- 输入 "ESLint: Show Output Channel" 查看 ESLint 日志
- 查看是否有错误信息

### 4. 手动测试
- 打开一个 .vue 文件
- 故意添加一些格式错误（如多余的分号）
- 保存文件，观察是否自动修复

### 5. 如果仍然不工作
- 使用快捷键 `Ctrl+Shift+L` 手动触发 ESLint 修复
- 或者在终端运行 `npm run lint:fix`

### 6. 检查文件是否在工作区
- 确保文件在当前工作区内
- VS Code 只会对工作区内的文件应用自动修复

## 更新的配置特性

新的配置包含以下改进：
- `eslint.enable: true` - 明确启用 ESLint
- `eslint.options` - 指定 ESLint 处理的文件扩展名
- `eslint.workingDirectories` - 自动检测工作目录
- `source.organizeImports: never` - 避免与 ESLint 冲突
