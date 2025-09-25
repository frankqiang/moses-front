# API 模块说明

## 公开组织架构API模块

### 概述

`public/` 目录下的模块提供了无需认证的公开组织架构API接口，专门为用户注册流程设计。解决了注册时需要选择部门、岗位、管理者等信息但用户尚未认证的循环依赖问题。

### 主要功能

#### 基础接口
- `getPublicDepartments()` - 获取公开部门列表
- `getPublicDepartmentTree()` - 获取公开部门树形结构
- `getPublicPositions()` - 获取公开岗位列表
- `getPublicManagers()` - 获取公开管理者列表

#### 选项接口（与原有API格式兼容）
- `getPublicDepartmentOptions()` - 获取部门选项列表
- `getPublicPositionOptions()` - 获取岗位选项列表
- `getPublicManagerOptions()` - 获取管理者选项列表

#### 批量接口
- `getRegistrationOptions()` - 批量获取注册所需的所有选项数据

### 使用示例

```javascript
import {
  getPublicDepartmentOptions,
  getPublicPositionOptions,
  getPublicManagerOptions,
  getRegistrationOptions
} from '@/api/public'

// 获取部门选项（树形结构）
const deptResponse = await getPublicDepartmentOptions({ useTree: true })

// 获取岗位选项
const posResponse = await getPublicPositionOptions()

// 获取管理者选项
const mgmtResponse = await getPublicManagerOptions()

// 批量获取所有选项
const allOptions = await getRegistrationOptions()
```

### API端点映射

| 新API函数 | 后端端点 | 说明 |
|-----------|----------|------|
| `getPublicDepartments()` | `GET /v1/public/departments` | 获取部门列表 |
| `getPublicDepartmentTree()` | `GET /v1/public/departments/tree` | 获取部门树形结构 |
| `getPublicPositions()` | `GET /v1/public/positions` | 获取岗位列表 |
| `getPublicManagers()` | `GET /v1/public/managers` | 获取管理者列表 |

### 重构说明

#### 原有API vs 新API

**原有API（需要认证）：**
```javascript
// 来自不同模块的认证API
import { getDepartmentOptions } from '@/views/organization-structure/shared/api/department-options'
import { getPositionOptions } from '@/views/organization-structure/positions/api/positions'
import { getManagerOptions } from '@/views/user-management/api/user-management'
```

**新API（无需认证）：**
```javascript
// 统一的公开API模块
import {
  getPublicDepartmentOptions,
  getPublicPositionOptions,
  getPublicManagerOptions
} from '@/api/public'
```

#### 数据格式兼容性

新API保持与原有API相同的数据格式，确保无缝迁移：

```javascript
// 响应格式保持一致
{
  success: true,
  data: {
    options: [
      {
        value: "uuid",
        label: "显示名称",
        // 其他字段...
      }
    ]
  },
  message: "操作成功"
}
```

### 安全说明

- 所有接口均无需认证
- 只返回基础组织架构信息，不包含敏感数据
- 数据已进行脱敏处理，适合公开访问

### 依赖项

- `@/utils/request` - HTTP请求工具
- 后端公开组织架构接口模块
