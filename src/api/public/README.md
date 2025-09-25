# 公开API模块

## 目录结构

```
src/api/public/
├── index.js                    # 统一导出入口
├── public-organization.js      # 公开组织架构API实现
└── README.md                   # 本文档
```

## 模块说明

本模块提供无需认证的公开API接口，专门为用户注册流程设计。解决了注册时需要选择部门、岗位、管理者等信息但用户尚未认证的循环依赖问题。

## 使用方式

### 推荐方式（统一导出）

```javascript
import {
  getPublicDepartmentOptions,
  getPublicPositionOptions,
  getPublicManagerOptions,
  getRegistrationOptions
} from '@/api/public'
```

### 直接导入（可选）

```javascript
import {
  getPublicDepartmentOptions,
  getPublicPositionOptions,
  getPublicManagerOptions
} from '@/api/public/public-organization'
```

## 主要接口

### 选项接口
- `getPublicDepartmentOptions(params)` - 获取部门选项列表
- `getPublicPositionOptions(params)` - 获取岗位选项列表
- `getPublicManagerOptions(params)` - 获取管理者选项列表

### 批量接口
- `getRegistrationOptions(params)` - 批量获取所有注册选项数据

### 基础接口
- `getPublicDepartments(params)` - 获取部门原始数据
- `getPublicDepartmentTree()` - 获取部门树形结构
- `getPublicPositions(params)` - 获取岗位原始数据
- `getPublicManagers(params)` - 获取管理者原始数据

## 使用示例

```javascript
// 获取树形部门结构（推荐）
const departments = await getPublicDepartmentOptions({ useTree: true })

// 根据部门筛选岗位
const positions = await getPublicPositionOptions({
  departmentId: 'dept-id'
})

// 批量获取所有选项（高效）
const allOptions = await getRegistrationOptions({
  includeInactive: false,
  useTree: true
})
```

## 注意事项

1. **ESLint忽略问题**：由于`.eslintignore`中包含`public`目录，需要使用`--no-ignore`标志强制检查：
   ```bash
   npm run lint src/api/public/*.js -- --no-ignore
   ```

2. **路径别名**：确保项目配置了`@`别名指向`src`目录

3. **数据格式**：所有接口保持与原有认证API相同的数据格式，确保向后兼容

4. **安全性**：接口无需认证，但只返回脱敏后的基础组织架构信息

## 维护说明

- 如需添加新的公开API，在`public-organization.js`中实现
- 记得在`index.js`中添加对应的导出
- 更新相关文档和使用示例
