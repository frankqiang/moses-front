# 工序管理模块

## 模块概述
工序管理模块是制造执行系统(MES)中的核心模块，属于主数据管理体系。主要负责管理生产过程中的基础工序定义和工艺路线编排，为质量管理、生产执行等模块提供基础数据支撑。

## 功能架构

### A. 基础工序定义 (Operation Management)
- **功能描述**: 定义和管理生产过程中的标准化工序
- **核心字段**:
  - `operation_code`: 工序代码（唯一标识）
  - `operation_name`: 工序名称
  - `operation_type`: 工序类型（生产加工、检验、仓储/移动、包装）
  - `description`: 工序描述
  - `status`: 工序状态（启用、禁用）

### B. 工艺路线编排 (Routing Management)
- **功能描述**: 定义产品完整的工艺流程路线和版本控制
- **路线主信息**:
  - `routing_code`: 路线代码
  - `routing_name`: 路线名称  
  - `version`: 版本号
  - `status`: 状态（草稿、生效、历史）
  - `applicable_products`: 适用产品清单
- **工序步骤信息**:
  - `step_number`: 步骤号
  - `operation_code`: 关联工序代码
  - `next_step_number`: 下一步骤号
  - `on_failure_step_number`: 异常跳转步骤号

## 数据模型设计

### 基础工序模型 (Operation)
```javascript
{
  id: 1,
  operation_code: 'ANNEALING',     // 工序代码
  operation_name: '退火',          // 工序名称
  operation_type: '生产加工',       // 工序类型
  description: '对铝箔进行热处理...',  // 工序描述
  status: '启用',                  // 状态
  create_time: '2024-01-15 09:00:00',
  update_time: '2024-01-15 09:00:00'
}
```

### 工艺路线模型 (Routing)
```javascript
{
  id: 1,
  routing_code: 'RT-STD-FOIL-01',        // 路线代码
  routing_name: '标准双零箔生产路线',      // 路线名称
  version: 'v2.1',                       // 版本号
  status: '生效',                        // 状态
  applicable_products: [                 // 适用产品
    'AF-1100-H18-0.006x1200',
    'AF-1100-H18-0.007x1500'
  ],
  description: '适用于标准双零箔产品的完整生产工艺路线',
  create_time: '2024-01-10 08:00:00',
  update_time: '2024-02-15 10:30:00',
  create_user: '工艺工程师01',
  update_user: '工艺工程师02'
}
```

### 工序步骤模型 (Routing Steps)
```javascript
{
  id: 1,
  routing_id: 1,                    // 关联路线ID
  step_number: 10,                  // 步骤号
  operation_code: 'QC_INCOMING',    // 工序代码
  operation_name: '来料检验',        // 工序名称
  next_step_number: 20,             // 下一步骤号
  on_failure_step_number: null,     // 异常跳转步骤号
  description: '检验原料铝箔质量',    // 步骤描述
  create_time: '2024-01-10 08:00:00',
  update_time: '2024-02-15 10:30:00'
}
```

## API接口清单

### 基础工序管理（8个接口）
1. `GET /mes/master-data/process-management/operation/list` - 获取基础工序列表
2. `GET /mes/master-data/process-management/operation/detail` - 获取基础工序详情
3. `POST /mes/master-data/process-management/operation` - 创建基础工序
4. `PUT /mes/master-data/process-management/operation` - 更新基础工序
5. `PUT /mes/master-data/process-management/operation/status` - 更新工序状态
6. `DELETE /mes/master-data/process-management/operation` - 删除基础工序
7. `DELETE /mes/master-data/process-management/operation/batch` - 批量删除基础工序
8. `GET /mes/master-data/process-management/operation/enabled` - 获取启用工序列表

### 工艺路线管理（8个接口）
1. `GET /mes/master-data/process-management/routing/list` - 获取工艺路线列表
2. `GET /mes/master-data/process-management/routing/detail` - 获取工艺路线详情
3. `POST /mes/master-data/process-management/routing` - 创建工艺路线
4. `PUT /mes/master-data/process-management/routing` - 更新工艺路线
5. `DELETE /mes/master-data/process-management/routing` - 删除工艺路线
6. `PUT /mes/master-data/process-management/routing/status` - 更新路线状态
7. `GET /mes/master-data/process-management/routing/steps` - 获取路线步骤
8. `PUT /mes/master-data/process-management/routing/steps` - 更新路线步骤

## 技术特点

### 版本控制机制
- 工艺路线支持版本管理：草稿 → 生效 → 历史
- 生效状态的路线编辑时自动创建新版本
- 同一路线代码只能有一个生效版本

### 数据完整性
- 工序代码唯一性验证
- 路线代码+版本号联合唯一性验证
- 步骤流程完整性检查（步骤号、引用有效性）

### 业务逻辑
- 启用的工序才能用于工艺路线步骤
- 生效状态的路线不能直接删除
- 支持工序使用关联性检查

### Mock数据特色
- **真实业务场景**: 基于铝箔生产实际工艺流程
- **完整工序库**: 15个真实工序（退火、分切、包装、检验等）
- **完整路线示例**: 6条路线包含版本控制示例
- **合理步骤流程**: 19个步骤支持分支和异常处理

## 文件结构
```
src/views/master-data/process-management/
├── README.md                 # 模块说明文档
├── index.vue                # 主页面入口（待开发）
└── components/              # 组件目录（待开发）
    ├── OperationList.vue    # 基础工序列表
    ├── OperationForm.vue    # 工序表单
    ├── RoutingList.vue      # 工艺路线列表
    ├── RoutingForm.vue      # 路线表单
    └── StepsEditor.vue      # 步骤编辑器
```

## 下一步开发计划
1. **任务2**: API接口层开发 - 完善前端API调用封装
2. **任务3**: 基础工序定义功能开发 - 工序列表、表单、搜索等
3. **任务4**: 工艺路线编排功能开发 - 路线管理、版本控制等  
4. **任务5**: 工序步骤管理功能开发 - 步骤编辑器、流程图等
5. **任务6**: 集成联调与优化 - 测试、性能优化、文档完善

## 业务价值
- 为质量管理模块提供标准化工序基础数据
- 支撑生产执行模块的工艺路线执行
- 实现工艺标准化和版本化管理
- 提供灵活的工序步骤流程定义能力 