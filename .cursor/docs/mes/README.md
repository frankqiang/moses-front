# MES 需求文档拆分索引

为便于开发与上下文引用，`需求文档.md` 已按模块依赖与开发顺序拆分为以下子文档：

- 00 总览与架构（引言、系统概述）
  - `docs/mes/00-总览与架构.md`
- 01 开发顺序与依赖（模块依赖、开发阶段与并行策略、集成测试）
  - `docs/mes/01-开发顺序与依赖.md`
- 10 USER 用户权限管理（对应原文 3.6 模块）
  - `docs/mes/10-USER-用户权限管理.md`
- 20 MDM 主数据管理（对应原文 3.1 模块）
  - `docs/mes/20-MDM-主数据管理.md`
- 30 INV 库存管理（对应原文 3.2 模块）
  - `docs/mes/30-INV-库存管理.md`
- 40 PROD 生产任务管理（对应原文 3.3 模块）
  - `docs/mes/40-PROD-生产任务管理.md`
- 50 EXEC 执行与监控（对应原文 3.4 模块）
  - `docs/mes/50-EXEC-执行与监控.md`
- 60 REPORT 报表与看板（对应原文 3.5 模块）
  - `docs/mes/60-REPORT-报表与看板.md`

原完整文档：`需求文档.md`（保留为完整版参考）。

---

## 全局导航（各文档主要章节）

- 00 总览与架构
  - [1. 引言](00-总览与架构.md#1-引言)
    - [1.1. 文档目的](00-总览与架构.md#11-文档目的)
    - [1.2. 系统范围](00-总览与架构.md#12-系统范围)
    - [1.3. 读者对象](00-总览与架构.md#13-读者对象)
    - [1.4. 术语定义](00-总览与架构.md#14-术语定义)
    - [1.5. 假设与约束](00-总览与架构.md#15-假设与约束)
  - [2. 系统概述](00-总览与架构.md#2-系统概述)
    - [2.1. 系统描述](00-总览与架构.md#21-系统描述)
    - [2.2. 系统目标](00-总览与架构.md#22-系统目标)
    - [2.3. 主要特点](00-总览与架构.md#23-主要特点)
    - [2.4. 系统架构](00-总览与架构.md#24-系统架构)
    - [2.5. 核心业务实体](00-总览与架构.md#25-核心业务实体)

- 01 开发顺序与依赖
  - [4.1. 模块依赖关系分析](01-开发顺序与依赖.md#41-模块依赖关系分析)
    - [4.1.1. 各模块依赖关系详细列表](01-开发顺序与依赖.md#411-各模块依赖关系详细列表)
    - [4.1.2. 模块依赖关系图](01-开发顺序与依赖.md#412-模块依赖关系图)
    - [4.1.3. 关键路径识别](01-开发顺序与依赖.md#413-关键路径识别)
  - [4.2. 模块开发顺序规划](01-开发顺序与依赖.md#42-模块开发顺序规划)
    - [4.2.1. 开发阶段划分](01-开发顺序与依赖.md#421-开发阶段划分)
    - [4.2.2. 并行开发策略](01-开发顺序与依赖.md#422-并行开发策略)
    - [4.2.3. 风险控制与里程碑](01-开发顺序与依赖.md#423-风险控制与里程碑)
  - [4.3. 接口依赖与集成策略](01-开发顺序与依赖.md#43-接口依赖与集成策略)
    - [4.3.1. 模块间接口定义](01-开发顺序与依赖.md#431-模块间接口定义)
    - [4.3.2. 集成测试策略](01-开发顺序与依赖.md#432-集成测试策略)

- 10 USER 用户权限管理
  - [3.6.1. 用户登录认证](10-USER-用户权限管理.md#361-用户登录认证-user-authentication)
  - [3.6.2. 用户注册管理](10-USER-用户权限管理.md#362-用户注册管理-user-registration-management)
  - [3.6.3. 用户管理](10-USER-用户权限管理.md#363-用户管理-user-management)
  - [3.6.4. 权限配置](10-USER-用户权限管理.md#364-权限配置-permission-configuration)
  - [3.6.5. 安全策略](10-USER-用户权限管理.md#365-安全策略-security-policy)

- 20 MDM 主数据管理
  - [3.1.1. 料框规格管理](20-MDM-主数据管理.md#311-料框规格管理-bin-specification-management)
  - [3.1.2. 铝箔产品管理](20-MDM-主数据管理.md#312-铝箔产品管理-aluminum-foil-product-management)
  - [3.1.3. 物料编码管理](20-MDM-主数据管理.md#313-物料编码管理-material-code-management)
  - [3.1.4. 库位主数据管理](20-MDM-主数据管理.md#314-库位主数据管理-storage-location-master-data-management)
  - [3.1.5. 设备主数据管理](20-MDM-主数据管理.md#315-设备主数据管理-equipment-master-data-management)
  - [3.1.6. 工艺参数管理](20-MDM-主数据管理.md#316-工艺参数管理-process-parameter-management)
  - [3.1.7. 工序管理](20-MDM-主数据管理.md#317-工序管理-process-operation-management)
  - [3.1.8. 工艺路线编排](20-MDM-主数据管理.md#318-工艺路线编排-process-route-configuration)
  - [3.1.9. 质量标准配置](20-MDM-主数据管理.md#319-质量标准配置-quality-standard-configuration)

- 30 INV 库存管理
  - [3.2.1. 料框/料垛管理](30-INV-库存管理.md#321-料框料垛管理-binstack-management)
  - [3.2.2. 库存状态管理](30-INV-库存管理.md#322-库存状态管理-inventory-status-management)
  - [3.2.3. 物料位置追踪](30-INV-库存管理.md#323-物料位置追踪-material-location-tracking)
  - [3.2.4. 库位分配优化](30-INV-库存管理.md#324-库位分配优化-storage-location-assignment-optimization)

- 40 PROD 生产任务管理
  - [3.3.1. 生产计划管理](40-PROD-生产任务管理.md#331-生产计划管理-production-planning-management)
  - [3.3.2. 退火任务管理](40-PROD-生产任务管理.md#332-退火任务管理-annealing-task-management)
  - [3.3.3. 退火炉排程](40-PROD-生产任务管理.md#333-退火炉排程-annealing-furnace-scheduling)
  - [3.3.4. 物流任务生成](40-PROD-生产任务管理.md#334-物流任务生成-logistics-task-generation)

- 50 EXEC 执行与监控
  - [3.4.1. 退火过程监控](50-EXEC-执行与监控.md#341-退火过程监控-annealing-process-monitoring)
  - [3.4.2. 行车作业跟踪](50-EXEC-执行与监控.md#342-行车作业跟踪-crane-operation-tracking)
  - [3.4.3. 料车作业跟踪](50-EXEC-执行与监控.md#343-料车作业跟踪-agvrgv)
  - [3.4.4. 炉次过程管理](50-EXEC-执行与监控.md#344-炉次过程管理-furnace-batch-process-management)
  - [3.4.5. 设备状态监控](50-EXEC-执行与监控.md#345-设备状态监控-equipment-status-monitoring)
  - [3.4.6. 质量检验执行](50-EXEC-执行与监控.md#346-质量检验执行-quality-inspection-execution)

- 60 REPORT 报表与看板
  - [3.5.1. 生产分析报表](60-REPORT-报表与看板.md#351-生产分析报表-production-analysis-reports)
  - [3.5.2. 质量分析报表](60-REPORT-报表与看板.md#352-质量分析报表-quality-analysis-reports)
  - [3.5.3. 设备分析报表](60-REPORT-报表与看板.md#353-设备分析报表-equipment-analysis-reports)
  - [3.5.4. 实时监控看板](60-REPORT-报表与看板.md#354-实时监控看板-real-time-monitoring-dashboards)
  - [3.5.5. 数据分析工具](60-REPORT-报表与看板.md#355-数据分析工具-data-analysis-tools)


