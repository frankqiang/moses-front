<!--
  文件名称：detail.vue
  文件描述：维护任务详情页面
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现任务详情展示和操作功能
-->
<template>
  <div class="app-container maintenance-task-detail">
    <!-- 页面标题和操作栏 -->
    <div class="detail-header">
      <div class="header-left">
        <el-page-header :content="pageTitle" @back="goBack" />
      </div>
      <div class="header-right">
        <!-- 任务操作按钮 -->
        <el-button
          v-if="canAssign"
          size="mini"
          type="primary"
          icon="el-icon-s-custom"
          @click="handleAssign"
        >
          派工
        </el-button>
        <el-button
          v-if="canAccept"
          size="mini"
          type="success"
          icon="el-icon-check"
          @click="handleAccept"
        >
          接单
        </el-button>
        <el-button
          v-if="canStart"
          size="mini"
          type="primary"
          icon="el-icon-video-play"
          @click="handleStart"
        >
          开始执行
        </el-button>
        <el-button
          v-if="canComplete"
          size="mini"
          type="success"
          icon="el-icon-circle-check"
          @click="handleComplete"
        >
          完成任务
        </el-button>
        <el-button
          v-if="canPostpone"
          size="mini"
          type="warning"
          icon="el-icon-time"
          @click="handlePostpone"
        >
          申请延期
        </el-button>
        <el-button
          v-if="canCancel"
          size="mini"
          type="danger"
          icon="el-icon-close"
          @click="handleCancel"
        >
          取消任务
        </el-button>
        <!-- 通用操作按钮 -->
        <el-button size="mini" icon="el-icon-refresh" @click="fetchTaskDetail">刷新</el-button>
        <el-button size="mini" type="primary" icon="el-icon-back" @click="goBack">返回列表</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-loading="loading" class="detail-content">
      <template v-if="!loading && taskDetail">
        <!-- 基础信息卡片 -->
        <!-- 接口文档：基础字段包含 id, taskCode, taskType, taskTitle, taskDescription, status, remark 等 -->
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">基础信息</span>
            <el-tag :type="getStatusTagType(taskDetail.status)" size="medium">
              {{ taskDetail.status || '未知状态' }}
            </el-tag>
          </div>

          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="任务编码">
              <span class="code-text">{{ taskDetail.taskCode || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="任务类型">
              <el-tag
                v-if="taskDetail.taskType"
                :type="getTaskTypeTagType(taskDetail.taskType)"
                size="small"
              >
                {{ taskDetail.taskType }}
              </el-tag>
              <span v-else class="empty-text">-</span>
            </el-descriptions-item>
            <el-descriptions-item label="任务标题">
              {{ taskDetail.taskTitle || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="任务描述" :span="3">
              <div class="description-text">
                {{ taskDetail.taskDescription || '无' }}
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="3">
              {{ taskDetail.remark || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 设备信息卡片 -->
        <!-- 接口文档：equipment 对象包含 { id, equipmentCode, name, equipmentType, status } -->
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">设备信息</span>
          </div>

          <el-descriptions :column="4" border size="small">
            <el-descriptions-item label="设备编码">
              <span class="code-text">{{ taskDetail.equipment && taskDetail.equipment.equipmentCode || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="设备名称">
              {{ taskDetail.equipment && taskDetail.equipment.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="设备类型">
              {{ taskDetail.equipment && taskDetail.equipment.equipmentTypeLabel || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="设备状态">
              <template v-if="taskDetail.equipment && taskDetail.equipment.statusLabel">
                {{ taskDetail.equipment.statusLabel }}
              </template>
              <span v-else class="empty-text">-</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 维护计划信息卡片（如有关联） -->
        <!-- 接口文档：maintenancePlan 对象（可为null）包含 { id, planCode, planName, maintenanceType } -->
        <el-card v-if="taskDetail.maintenancePlan" class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">关联维护计划</span>
          </div>

          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="计划编码">
              <span class="code-text">{{ taskDetail.maintenancePlan.planCode || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="计划名称">
              {{ taskDetail.maintenancePlan.planName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="维护类型">
              {{ taskDetail.maintenancePlan.maintenanceType || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 时间信息卡片 -->
        <!-- 接口文档：时间字段包含 plannedStartTime, plannedEndTime, actualStartTime, actualEndTime, delayReason, confirmedAt -->
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">时间信息</span>
            <el-tag v-if="isOverdue" type="danger" size="small">
              <i class="el-icon-warning" /> 已逾期
            </el-tag>
          </div>

          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="计划开始时间">
              {{ formatDateTime(taskDetail.plannedStartTime) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="计划结束时间">
              {{ formatDateTime(taskDetail.plannedEndTime) || '未设置' }}
            </el-descriptions-item>
            <el-descriptions-item label="实际开始时间">
              {{ formatDateTime(taskDetail.actualStartTime) || '未开始' }}
            </el-descriptions-item>
            <el-descriptions-item label="实际结束时间">
              {{ formatDateTime(taskDetail.actualEndTime) || '未完成' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="taskDetail.delayReason" label="延期原因" :span="2">
              <div class="warning-text">
                <i class="el-icon-warning" />
                {{ taskDetail.delayReason }}
              </div>
            </el-descriptions-item>
            <!-- 接口文档：取消原因保存在 remark 字段中 -->
            <el-descriptions-item v-if="showCancelReason" label="取消原因" :span="2">
              <div class="danger-text">
                <i class="el-icon-warning" />
                {{ getCancelReason }}
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 人员信息卡片 -->
        <!-- 接口文档：用户对象包含 { id, name, email } -->
        <!-- assignee, confirmer, creator, updater 都遵循此结构 -->
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">人员信息</span>
          </div>

          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="执行人员">
              <div v-if="taskDetail.assignee" class="user-info">
                <i class="el-icon-user" />
                <span>{{ taskDetail.assignee.name || '-' }}</span>
                <span v-if="taskDetail.assignee.email" class="email-text">（{{ taskDetail.assignee.email }}）</span>
              </div>
              <span v-else class="empty-text">未分配</span>
            </el-descriptions-item>
            <el-descriptions-item label="确认人员">
              <div v-if="taskDetail.confirmer" class="user-info">
                <i class="el-icon-user" />
                <span>{{ taskDetail.confirmer.name || '-' }}</span>
                <span v-if="taskDetail.confirmer.email" class="email-text">（{{ taskDetail.confirmer.email }}）</span>
              </div>
              <span v-else class="empty-text">未确认</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="taskDetail.confirmedAt" label="确认时间">
              {{ formatDateTime(taskDetail.confirmedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="创建人员">
              <div v-if="taskDetail.creator" class="user-info">
                <i class="el-icon-user" />
                <span>{{ taskDetail.creator.name || '-' }}</span>
                <span v-if="taskDetail.creator.email" class="email-text">（{{ taskDetail.creator.email }}）</span>
              </div>
              <span v-else class="empty-text">-</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(taskDetail.createdAt) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后更新人">
              <div v-if="taskDetail.updater" class="user-info">
                <i class="el-icon-user" />
                <span>{{ taskDetail.updater.name || '-' }}</span>
                <span v-if="taskDetail.updater.email" class="email-text">（{{ taskDetail.updater.email }}）</span>
              </div>
              <span v-else class="empty-text">-</span>
            </el-descriptions-item>
            <el-descriptions-item label="最后更新时间" :span="2">
              {{ formatDateTime(taskDetail.updatedAt) || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 任务时间线 -->
        <el-card class="detail-card" shadow="never">
          <div slot="header" class="card-header">
            <span class="card-title">任务时间线</span>
          </div>
          <task-timeline :task="taskDetail" />
        </el-card>
      </template>

      <!-- 空状态 -->
      <el-empty v-if="!loading && !taskDetail" description="未找到任务详情" />
    </div>

    <!-- 派工对话框 -->
    <assign-task-dialog
      :visible.sync="assignDialogVisible"
      :task-info="taskDetail"
      @success="handleAssignSuccess"
    />

    <!-- 完成任务对话框 -->
    <complete-task-dialog
      :visible.sync="completeDialogVisible"
      :task-info="taskDetail"
      @success="handleCompleteSuccess"
    />

    <!-- 任务延期对话框 -->
    <postpone-task-dialog
      :visible.sync="postponeDialogVisible"
      :task-info="taskDetail"
      @success="handlePostponeSuccess"
    />

    <!-- 任务取消对话框 -->
    <cancel-task-dialog
      :visible.sync="cancelDialogVisible"
      :task-info="taskDetail"
      @success="handleCancelSuccess"
    />
  </div>
</template>

<script>
// 使用模块内API（优先使用模块内API，避免全局污染）
import { getMaintenanceTaskById, acceptTask, startTask } from './api/maintenance-task'
import { parseTime } from '@/utils'
import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'
import TaskTimeline from './components/TaskTimeline'
import AssignTaskDialog from './components/AssignTaskDialog'
import CompleteTaskDialog from './components/CompleteTaskDialog'
import PostponeTaskDialog from './components/PostponeTaskDialog'
import CancelTaskDialog from './components/CancelTaskDialog'
import {
  STATUS_TAG_TYPE_MAP,
  TASK_TYPE_TAG_TYPE_MAP
} from './constants/maintenance-task'

export default {
  name: 'MaintenanceTaskDetail',

  components: {
    TaskTimeline,
    AssignTaskDialog,
    CompleteTaskDialog,
    PostponeTaskDialog,
    CancelTaskDialog
  },

  mixins: [tpmDictionaryMixin],

  data() {
    return {
      loading: false,
      taskDetail: null,
      taskId: null,
      assignDialogVisible: false,
      completeDialogVisible: false,
      postponeDialogVisible: false,
      cancelDialogVisible: false,
      actionLoading: false // 操作按钮加载状态
    }
  },

  computed: {
    /**
     * 页面标题
     */
    pageTitle() {
      return this.taskDetail ? `维护任务详情 - ${this.taskDetail.taskCode}` : '维护任务详情'
    },

    /**
     * 是否逾期
     */
    isOverdue() {
      if (!this.taskDetail) return false
      const { plannedStartTime, status } = this.taskDetail
      const isPending = status === '待执行' || status === '执行中'
      return isPending && new Date(plannedStartTime) < new Date()
    },

    /**
     * 是否显示取消原因
     */
    showCancelReason() {
      if (!this.taskDetail) return false
      return this.taskDetail.status === '已取消' && this.taskDetail.remark
    },

    /**
     * 获取取消原因（从备注中提取）
     */
    getCancelReason() {
      if (!this.taskDetail || !this.taskDetail.remark) return ''
      // 如果备注中包含"取消原因："，则提取后面的内容
      const match = this.taskDetail.remark.match(/取消原因：(.+)/)
      return match ? match[1] : this.taskDetail.remark
    },

    /**
     * 是否可以派工
     */
    canAssign() {
      return this.taskDetail && this.taskDetail.status === '待执行'
    },

    /**
     * 是否可以接单
     */
    canAccept() {
      return this.taskDetail && this.taskDetail.status === '待执行'
    },

    /**
     * 是否可以开始执行
     */
    canStart() {
      if (!this.taskDetail) return false
      const status = this.taskDetail.status
      return status === '待执行' || status === '已延期'
    },

    /**
     * 是否可以完成任务
     */
    canComplete() {
      return this.taskDetail && this.taskDetail.status === '执行中'
    },

    /**
     * 是否可以申请延期
     */
    canPostpone() {
      if (!this.taskDetail) return false
      const status = this.taskDetail.status
      return status === '待执行' || status === '执行中'
    },

    /**
     * 是否可以取消任务
     */
    canCancel() {
      if (!this.taskDetail) return false
      const status = this.taskDetail.status
      return status === '待执行' || status === '执行中' || status === '已延期'
    }
  },

  async created() {
    // 加载TPM字典
    await this.loadTPMDictionary()

    // 从路由参数获取任务ID
    this.taskId = this.$route.params.id
    if (this.taskId) {
      this.fetchTaskDetail()
    } else {
      this.$message.error('缺少任务ID参数')
      this.goBack()
    }
  },

  methods: {
    /**
     * 获取任务详情
     * 严格按照接口文档的响应格式处理数据
     */
    async fetchTaskDetail() {
      this.loading = true
      try {
        const response = await getMaintenanceTaskById(this.taskId)
        // 接口文档：成功响应格式 { success: true, data: {...}, message: "...", meta: {...} }
        if (response.success && response.data) {
          this.taskDetail = response.data
        } else {
          throw new Error(response.message || '获取任务详情失败')
        }
      } catch (error) {
        console.error('获取任务详情失败:', error)

        // 接口文档：错误响应格式 { success: false, error: { code: "...", message: "...", details: {...} } }
        const errorMessage = error.error?.message || error.message || '获取任务详情失败'
        const errorCode = error.error?.code || error.code

        this.$message.error(errorMessage)

        // 如果是404错误（任务不存在），返回列表
        if (errorCode === 'TPM_TASK_001') {
          this.$message.warning('维护任务不存在或已被删除')
          setTimeout(() => {
            this.goBack()
          }, 1500)
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 格式化日期时间
     * @param {string} dateTime - ISO 8601格式的日期时间字符串
     * @returns {string} 格式化后的日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 获取任务状态标签类型
     * @param {string} status - 任务状态
     * @returns {string} Element UI标签类型
     */
    getStatusTagType(status) {
      // 使用统一的状态标签类型映射常量
      return STATUS_TAG_TYPE_MAP[status] || 'info'
    },

    /**
     * 获取任务类型标签类型
     * @param {string} taskType - 任务类型
     * @returns {string} Element UI标签类型
     */
    getTaskTypeTagType(taskType) {
      // 使用统一的任务类型标签类型映射常量
      return TASK_TYPE_TAG_TYPE_MAP[taskType] || 'info'
    },

    /**
     * 返回列表
     */
    goBack() {
      this.$router.push({ name: 'MaintenanceTaskList' })
    },

    /**
     * 处理派工操作
     */
    handleAssign() {
      // 检查任务状态
      if (this.taskDetail.status !== '待执行') {
        this.$message.warning('只有待执行状态的任务才能派工')
        return
      }
      // 打开派工对话框
      this.assignDialogVisible = true
    },

    /**
     * 派工成功回调
     */
    handleAssignSuccess(updatedTask) {
      // 刷新任务详情
      this.fetchTaskDetail()
    },

    /**
     * 处理接单操作
     * 接口文档：POST /v1/mdm/tpm/maintenance-tasks/:taskId/accept
     *
     * 业务规则（接口文档第18-32行）：
     * - 只能接收状态为"待执行"的任务
     * - 任务未派工或已派工给当前用户时才能接单
     * - 接单后如果任务未派工则自动关联当前用户为执行人
     *
     * 错误码（接口文档第348-356行）：
     * - 400 TPM_TASK_011: 只有待执行状态的任务才能接单
     * - 403 TPM_TASK_016: 只能接收派工给自己的任务
     * - 404 TPM_TASK_001: 维护任务不存在
     */
    async handleAccept() {
      // 前端状态验证：只有待执行状态的任务才能接单
      // 接口文档：步骤3 - 验证任务状态（接口文档第93-97行）
      if (this.taskDetail.status !== '待执行') {
        this.$message.warning('只有待执行状态的任务才能接单')
        return
      }

      try {
        // 二次确认对话框，根据派工状态显示不同提示
        // 接口文档：业务场景说明（接口文档第39-60行）
        // 接口文档：步骤4 - 检查权限（接口文档第155-160行）
        const taskTitle = this.taskDetail.taskTitle || '未命名任务'
        const equipmentInfo = this.taskDetail.equipment
          ? `${this.taskDetail.equipment.equipmentCode} - ${this.taskDetail.equipment.name}`
          : '未指定'

        const confirmMessage = this.taskDetail.assignedTo
          ? `确认接收此维护任务？\n\n任务标题：${taskTitle}\n设备信息：${equipmentInfo}\n\n提示：此任务已派工给您，接单后确认执行。`
          : `确认接收此维护任务？\n\n任务标题：${taskTitle}\n设备信息：${equipmentInfo}\n\n提示：接单后系统将自动关联您为执行人。`

        await this.$confirm(
          confirmMessage,
          '确认接单',
          {
            confirmButtonText: '确认接单',
            cancelButtonText: '取消',
            type: 'info',
            dangerouslyUseHTMLString: false
          }
        )

        this.actionLoading = true

        // 调用接单接口（无请求体）
        // 接口文档：基本信息（接口文档第188-190行）
        const response = await acceptTask(this.taskDetail.id)

        // 处理成功响应（接口文档第219-283行）
        if (response.success) {
          // 使用后端返回的消息提示（符合开发阶段配置规则）
          this.$message.success(response.message || '任务接单成功')

          // 刷新任务详情
          await this.fetchTaskDetail()
        } else {
          // 处理业务失败响应（接口文档第346-423行）
          const errorMessage = response.error?.message || '接单失败'
          this.$message.error(errorMessage)
        }
      } catch (error) {
        // 用户取消操作
        if (error === 'cancel') {
          return
        }

        // 处理网络错误或其他异常（接口文档第346-423行）
        console.error('接单失败:', error)
        const errorMessage = error.error?.message || error.message || '接单失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        this.actionLoading = false
      }
    },

    /**
     * 处理开始执行操作
     * 接口文档：POST /v1/mdm/tpm/maintenance-tasks/:taskId/start
     * 详细文档：docs/接口文档/单独接口文档/开始执行任务接口详细说明_已重构.md
     *
     * 功能概述（接口文档第17-31行）：
     * - 执行人员正式开始执行维护任务
     * - 任务状态从"待执行"或"已延期"自动转变为"执行中"
     * - 系统自动记录任务的实际开始时间（actualStartTime）
     * - 关联设备状态自动更新为"维护中"，防止冲突操作
     * - 严格验证只有任务的执行人才能开始执行
     * - 任务状态更新和设备状态更新在事务中原子执行
     *
     * 业务场景（接口文档第34-74行）：
     * 1. 正式开始维护作业场景：执行人员已接单任务并做好准备，现在需要正式开始维护作业
     * 2. 设备维护期间的状态管理场景：通过更新设备状态为"维护中"来标识当前状态，防止其他业务系统对该设备的并发操作
     * 3. 维护数据统计和分析场景：记录actualStartTime用于计算工作效率（等待时长 = actualStartTime - plannedStartTime）
     * 4. 任务重新执行场景：任务已延期（状态为"已延期"），延期期限已到，可以重新开始执行
     *
     * 使用前提（接口文档第61-67行）：
     * - 维护任务必须处于"待执行"或"已延期"状态
     * - 当前登录用户必须是任务的执行人（assignedTo == currentUserId）
     * - 操作人员必须具有 mdm.tpm.maintenance-task.execute 权限
     * - 关联的设备必须存在且处于可维护状态
     *
     * 不适用场景（接口文档第68-74行）：
     * - 任务已处于"执行中"状态时无法再次开始执行
     * - 任务已完成、已取消等终止状态时无法开始执行
     * - 当前用户不是任务的执行人时无法开始执行
     * - 当前用户没有执行维护任务的权限时无法开始执行
     *
     * 业务流程（接口文档第77-195行）：
     * 步骤1: 验证请求参数 - 检查taskId格式（UUID）
     * 步骤2: 查询维护任务 - 检查任务是否存在且未被删除
     * 步骤3: 验证任务状态 - 待执行或已延期
     * 步骤4: 验证执行人 - 检查task.assignedTo是否等于当前用户ID
     * 步骤5: 验证用户有效性 - 检查执行用户是否存在且处于激活状态
     * 步骤6: 更新任务状态 - 在事务中更新：status="执行中", actualStartTime=当前时间戳, updatedBy, updatedAt
     * 步骤7: 更新设备状态 - 将关联设备状态更新为"维护中"
     * 步骤8: 记录操作日志 - INFO级别，记录任务开始执行操作
     * 步骤9: 返回更新后的任务信息 - 包含关联的设备、维护计划、执行人员等
     *
     * 成功响应（HTTP 200）（接口文档第234-297行）：
     * {
     *   success: true,
     *   data: {
     *     id: "d4e5f6a7-b8c9-0123-def0-234567890123",
     *     taskCode: "MT-EQ001-1729012345678",
     *     status: "执行中",
     *     actualStartTime: "2024-01-20T08:15:00.000Z",  // 新增
     *     actualEndTime: null,
     *     equipment: {
     *       id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
     *       equipmentCode: "EQ001",
     *       name: "退火炉#1",
     *       status: "维护中"  // 设备状态自动更新
     *     },
     *     assignee: { id, name, email },
     *     updater: { id, name, email },  // 更新人变为当前操作人
     *     updatedAt: "2024-01-20T08:15:00.000Z",  // 更新时间
     *     // ... 其他完整任务信息
     *   },
     *   message: "开始执行任务成功"
     * }
     *
     * 错误响应（接口文档第360-437行）：
     * - 400 MAINTENANCE_TASK_006: 只有待执行或已延期状态的任务才能开始执行
     * - 403 MAINTENANCE_TASK_007: 只有任务执行人才能开始执行任务
     * - 404 MAINTENANCE_TASK_002: 维护任务不存在
     * - 401 UNAUTHORIZED: 未授权，Token无效或过期
     * - 403 FORBIDDEN: 无权限操作（缺少 mdm.tpm.maintenance-task.execute 权限）
     * - 500 INTERNAL_ERROR: 服务器内部错误
     *
     * 常见问题（接口文档第552-591行）：
     * Q1: 开始执行任务后能否取消任务？
     * A: 可以。任务开始执行后（状态为"执行中"），仍然可以通过"取消任务"接口取消。当任务被取消时，关联的设备状态会自动恢复为"空闲"。
     *
     * Q2: 设备状态是否会自动恢复？
     * A: 不会自动恢复。设备会保持"维护中"状态，直到任务完成、任务取消或手动修改设备状态。
     *
     * Q3: 如果我不是执行人能否调用此接口？
     * A: 不能。系统会进行严格的执行人校验，只有task.assignedTo与当前登录用户ID相同时才能调用此接口。
     *
     * Q4: actualStartTime什么时候被记录？
     * A: actualStartTime在调用此接口时被记录为当前服务器时间。该时间用于后续统计任务执行的等待时长、执行耗时等指标。
     *
     * Q5: 能否在延期后立即开始执行？
     * A: 可以。当任务状态为"已延期"时，仍然可以通过此接口开始执行，系统不强制要求等待延期时间到达。
     *
     * 任务与设备状态对应关系（接口文档第624-633行）：
     * - 待执行 → 空闲（任务未开始，设备正常可用）
     * - 执行中 → 维护中（任务正在执行，设备被占用）
     * - 已完成 → 空闲（任务完成，设备恢复可用）
     * - 已延期 → 空闲（任务延期等待，设备正常可用）
     * - 已取消 → 空闲（任务取消，设备恢复可用）
     */
    async handleStart() {
      // 前端状态验证：只有待执行或已延期状态的任务才能开始执行
      // 接口文档：步骤3 - 验证任务状态（接口文档第159-163行）
      const status = this.taskDetail.status
      if (status !== '待执行' && status !== '已延期') {
        this.$message.warning('只有待执行或已延期状态的任务才能开始执行')
        return
      }

      try {
        // 获取设备信息用于确认对话框显示
        const equipmentInfo = this.taskDetail.equipment
          ? `${this.taskDetail.equipment.equipmentCode || ''} - ${this.taskDetail.equipment.name || ''}`
          : '未指定'

        const taskTitle = this.taskDetail.taskTitle || '未命名任务'

        // 二次确认对话框（接口文档：业务场景说明，接口文档第38-60行）
        // 根据任务当前状态显示不同的确认提示
        const confirmMessage = status === '已延期'
          ? `确认重新开始执行此维护任务？\n\n任务编码：${this.taskDetail.taskCode}\n任务标题：${taskTitle}\n设备信息：${equipmentInfo}\n任务状态：${status}\n\n提示：\n1. 开始后任务状态将变为"执行中"\n2. 设备状态将变为"维护中"\n3. 系统将自动记录实际开始时间\n4. 设备在维护期间将无法执行其他操作`
          : `确认开始执行此维护任务？\n\n任务编码：${this.taskDetail.taskCode}\n任务标题：${taskTitle}\n设备信息：${equipmentInfo}\n\n提示：\n1. 开始后任务状态将变为"执行中"\n2. 设备状态将变为"维护中"\n3. 系统将自动记录实际开始时间\n4. 设备在维护期间将无法执行其他操作`

        await this.$confirm(
          confirmMessage,
          '确认开始执行',
          {
            confirmButtonText: '确认开始',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        )

        // 设置加载状态
        this.actionLoading = true

        // 调用开始执行接口（无请求体）
        // 接口文档：基本信息（接口文档第202-213行）
        const response = await startTask(this.taskDetail.id)

        // 处理成功响应（接口文档第234-297行）
        if (response.success) {
          // 使用后端返回的消息提示（符合开发阶段配置规则）
          this.$message.success(response.message || '开始执行任务成功')

          // 验证响应数据中的关键字段更新
          // 接口文档：响应字段说明（接口文档第299-359行）
          if (response.data) {
            // 记录关键状态变更日志（便于调试和追踪）
            console.log('任务开始执行成功:', {
              taskId: response.data.id,
              taskCode: response.data.taskCode,
              status: response.data.status, // 应该变为"执行中"
              actualStartTime: response.data.actualStartTime, // 应该有值
              equipmentStatus: response.data.equipment?.status, // 应该变为"维护中"
              updatedBy: response.data.updatedBy,
              updatedAt: response.data.updatedAt
            })
          }

          // 刷新任务详情（确保显示最新状态）
          await this.fetchTaskDetail()
        } else {
          // 处理业务失败响应（接口文档第360-437行）
          const errorMessage = response.error?.message || '开始执行失败'
          this.$message.error(errorMessage)
        }
      } catch (error) {
        // 用户取消操作
        if (error === 'cancel') {
          return
        }

        // 处理网络错误或其他异常（接口文档第360-437行）
        console.error('开始执行失败:', error)

        // 根据错误码提供友好的错误提示
        const errorCode = error.error?.code || error.code
        let errorMessage = error.error?.message || error.message || '开始执行失败，请稍后重试'

        // 特殊错误码处理（接口文档第360-437行）
        if (errorCode === 'MAINTENANCE_TASK_006') {
          // 任务状态不允许开始执行
          // 错误详情：当前任务已处于某种状态，无法开始执行
          errorMessage = '只有待执行或已延期状态的任务才能开始执行'
          console.warn('任务状态不符合要求:', {
            currentStatus: error.error?.details?.currentStatus,
            taskId: error.error?.details?.taskId
          })
        } else if (errorCode === 'MAINTENANCE_TASK_007') {
          // 不是任务执行人
          // 错误详情：此任务派工给其他人，只有派工对象才能开始执行
          errorMessage = '只有任务执行人才能开始执行任务'
          console.warn('权限不足，不是任务执行人:', {
            taskId: error.error?.details?.taskId,
            assignedTo: error.error?.details?.assignedTo,
            currentUserId: error.error?.details?.currentUserId
          })
        } else if (errorCode === 'MAINTENANCE_TASK_002') {
          // 任务不存在
          errorMessage = '维护任务不存在或已被删除'
          console.warn('任务不存在:', {
            taskId: error.error?.details?.taskId
          })
        } else if (errorCode === 'UNAUTHORIZED') {
          // 未授权
          errorMessage = '未授权，请重新登录'
        } else if (errorCode === 'FORBIDDEN') {
          // 无权限
          errorMessage = '无权限操作，请联系管理员授予执行维护任务权限'
        }

        this.$message.error(errorMessage)
      } finally {
        this.actionLoading = false
      }
    },

    /**
     * 处理完成任务操作
     */
    handleComplete() {
      // 检查任务状态
      if (this.taskDetail.status !== '执行中') {
        this.$message.warning('只有执行中状态的任务才能完成')
        return
      }

      // 打开完成任务对话框
      this.completeDialogVisible = true
    },

    /**
     * 完成任务成功回调
     */
    async handleCompleteSuccess(updatedTask) {
      // 刷新任务详情
      await this.fetchTaskDetail()
    },

    /**
     * 处理申请延期操作
     */
    handlePostpone() {
      // 检查任务状态
      const status = this.taskDetail.status
      if (status !== '待执行' && status !== '执行中') {
        this.$message.warning('只有待执行或执行中状态的任务才能申请延期')
        return
      }

      // 打开延期对话框
      this.postponeDialogVisible = true
    },

    /**
     * 延期成功回调
     */
    async handlePostponeSuccess(updatedTask) {
      // 刷新任务详情
      await this.fetchTaskDetail()
    },

    /**
     * 处理取消任务操作
     */
    handleCancel() {
      // 检查任务状态
      const status = this.taskDetail.status
      if (status !== '待执行' && status !== '执行中' && status !== '已延期') {
        this.$message.warning('只有待执行、执行中或已延期状态的任务才能取消')
        return
      }

      // 打开取消对话框
      this.cancelDialogVisible = true
    },

    /**
     * 取消成功回调
     */
    async handleCancelSuccess(updatedTask) {
      // 刷新任务详情
      await this.fetchTaskDetail()
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-task-detail {
  padding: 16px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-left {
      flex: 1;
    }

    .header-right {
      display: flex;
      gap: 8px;
    }
  }

  .detail-content {
    min-height: 400px;

    .detail-card {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      // 代码文本样式
      .code-text {
        font-family: 'Courier New', Courier, monospace;
        color: #409eff;
        font-weight: 500;
      }

      // 描述文本样式
      .description-text {
        line-height: 1.6;
        color: #606266;
        white-space: pre-wrap;
        word-break: break-word;
      }

      // 用户信息样式
      .user-info {
        display: flex;
        align-items: center;
        gap: 6px;

        i {
          color: #909399;
        }

        .email-text {
          color: #909399;
          font-size: 12px;
        }
      }

      // 空状态文本
      .empty-text {
        color: #c0c4cc;
      }

      // 警告文本样式
      .warning-text {
        color: #e6a23c;
        display: flex;
        align-items: center;
        gap: 6px;

        i {
          font-size: 16px;
        }
      }

      // 危险文本样式
      .danger-text {
        color: #f56c6c;
        display: flex;
        align-items: center;
        gap: 6px;

        i {
          font-size: 16px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .maintenance-task-detail {
    padding: 12px;

    .detail-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .header-right {
        justify-content: flex-end;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
