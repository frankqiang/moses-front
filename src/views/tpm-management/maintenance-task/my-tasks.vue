<!--
  文件名称：my-tasks.vue
  文件描述：我的任务页面 - 展示当前登录用户的维护任务，支持按状态分组展示、接单、开始执行等操作
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，路由配置占位组件
    - 2024-01-20: 实现P0阶段功能 - 任务查询、状态分组、接单、开始执行、筛选功能
    - 2024-01-20: 根据查询我的任务接口文档重构，完全对齐后端接口规范
-->
<template>
  <div class="my-tasks-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的任务</h1>
      <el-button type="primary" icon="el-icon-refresh" :loading="loading" @click="fetchTasks">
        刷新
      </el-button>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :model="queryParams" :inline="true" label-width="80px">
        <el-form-item label="快捷筛选">
          <el-button-group>
            <el-button
              :type="dateRangeType === 'today' ? 'primary' : 'default'"
              size="small"
              @click="handleQuickDateRange('today')"
            >
              今日任务
            </el-button>
            <el-button
              :type="dateRangeType === 'week' ? 'primary' : 'default'"
              size="small"
              @click="handleQuickDateRange('week')"
            >
              本周任务
            </el-button>
            <el-button
              :type="dateRangeType === 'all' ? 'primary' : 'default'"
              size="small"
              @click="handleQuickDateRange('all')"
            >
              全部任务
            </el-button>
          </el-button-group>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            @change="handleDateRangeChange"
          />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.search"
            placeholder="搜索任务编码或标题"
            clearable
            style="width: 250px"
            @keyup.enter.native="handleSearch"
            @clear="handleSearch"
          >
            <el-button slot="append" icon="el-icon-search" @click="handleSearch" />
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 状态分组标签页 -->
    <el-tabs v-model="activeStatus" type="card" class="status-tabs" @tab-click="handleStatusChange">
      <el-tab-pane label="待执行" name="待执行">
        <template slot="label">
          <span class="tab-label">
            <i class="el-icon-time" />
            待执行
            <el-badge v-if="taskStats.pending > 0" :value="taskStats.pending" class="status-badge" />
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="执行中" name="执行中">
        <template slot="label">
          <span class="tab-label">
            <i class="el-icon-loading" />
            执行中
            <el-badge v-if="taskStats.inProgress > 0" :value="taskStats.inProgress" class="status-badge" />
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="已完成" name="已完成">
        <template slot="label">
          <span class="tab-label">
            <i class="el-icon-check" />
            已完成
            <el-badge v-if="taskStats.completed > 0" :value="taskStats.completed" class="status-badge" />
          </span>
        </template>
      </el-tab-pane>
      <el-tab-pane label="已延期" name="已延期">
        <template slot="label">
          <span class="tab-label">
            <i class="el-icon-warning" />
            已延期
            <el-badge v-if="taskStats.delayed > 0" :value="taskStats.delayed" class="status-badge" />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <!-- 任务卡片列表 -->
    <div v-loading="loading" class="task-list">
      <el-empty v-if="!loading && taskList.length === 0" description="暂无任务" />

      <el-row v-else :gutter="16">
        <el-col
          v-for="task in taskList"
          :key="task.id"
          :xs="24"
          :sm="12"
          :md="12"
          :lg="8"
          :xl="6"
          class="task-col"
        >
          <task-card :task="task" shadow="hover">
            <!-- 操作按钮插槽 -->
            <template #footer>
              <div class="task-actions">
                <el-button
                  v-if="task.status === '待执行'"
                  type="primary"
                  size="small"
                  icon="el-icon-check"
                  :loading="actionLoading[task.id]"
                  @click="handleAcceptTask(task)"
                >
                  接单
                </el-button>
                <el-button
                  v-if="task.status === '待执行' || task.status === '已延期'"
                  type="success"
                  size="small"
                  icon="el-icon-video-play"
                  :loading="actionLoading[task.id]"
                  @click="handleStartTask(task)"
                >
                  开始执行
                </el-button>
                <el-button
                  type="default"
                  size="small"
                  icon="el-icon-view"
                  @click="handleViewDetail(task)"
                >
                  查看详情
                </el-button>
              </div>
            </template>
          </task-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          :current-page="queryParams.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="queryParams.limit"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TaskCard from './components/TaskCard'
import { getMyTasks, acceptTask, startTask } from './api/maintenance-task'
import { parseTime } from '@/utils'

export default {
  name: 'MyMaintenanceTasks',

  components: {
    TaskCard
  },

  data() {
    return {
      // 加载状态
      loading: false,
      actionLoading: {}, // 操作按钮加载状态（按任务ID）

      // 查询参数 - 符合接口文档规范
      queryParams: {
        status: '待执行', // 任务状态筛选（支持逗号分隔多个状态）
        search: '', // 模糊搜索（任务编码、任务标题）
        startDate: '', // 计划开始时间范围查询-开始日期（ISO 8601格式）
        endDate: '', // 计划开始时间范围查询-结束日期（ISO 8601格式）
        page: 1, // 当前页码
        limit: 10, // 每页记录数
        sortBy: 'plannedStartTime:asc' // 排序规则（默认按计划开始时间升序）
      },

      // 任务列表和分页元信息
      taskList: [],
      total: 0,
      totalPages: 0,

      // 状态统计
      taskStats: {
        pending: 0, // 待执行
        inProgress: 0, // 执行中
        completed: 0, // 已完成
        delayed: 0 // 已延期
      },

      // 当前选中状态
      activeStatus: '待执行',

      // 时间范围（用于日期选择器）
      dateRange: null,
      dateRangeType: 'all' // today, week, all
    }
  },

  mounted() {
    this.initPage()
  },

  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      await this.fetchTasks()
      await this.fetchTaskStats()
    },

    /**
     * 获取任务列表
     * 接口文档：GET /v1/mdm/tpm/maintenance-tasks/my-tasks
     *
     * 响应数据格式：
     * {
     *   success: true,
     *   data: {
     *     results: [...], // 任务列表数组
     *     page: 1, // 当前页码
     *     limit: 10, // 每页记录数
     *     totalPages: 5, // 总页数
     *     totalResults: 45 // 总记录数
     *   },
     *   message: "查询我的任务成功"
     * }
     */
    async fetchTasks() {
      this.loading = true
      try {
        // 调用查询我的任务接口
        const response = await getMyTasks(this.queryParams)

        // 检查响应成功标识
        if (response.success) {
          const { results, page, limit, totalPages, totalResults } = response.data

          // 更新任务列表
          this.taskList = results || []

          // 更新分页信息
          this.queryParams.page = page
          this.queryParams.limit = limit
          this.totalPages = totalPages
          this.total = totalResults
        } else {
          // 处理业务失败情况（success = false）
          this.$message.error(response.error?.message || '获取任务列表失败')
        }
      } catch (error) {
        // 处理网络错误或其他异常
        console.error('获取我的任务列表失败:', error)
        const errorMessage = error.error?.message || error.message || '获取任务列表失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取任务状态统计
     * 通过并行查询各状态的任务数量，用于显示标签页的徽章数字
     *
     * 接口文档：GET /v1/mdm/tpm/maintenance-tasks/my-tasks?status={状态}&page=1&limit=1
     * 只需要获取totalResults，不需要完整的任务数据
     */
    async fetchTaskStats() {
      try {
        // 分别查询各状态的任务数量（仅查询第一页1条记录，只为获取totalResults）
        const statusList = ['待执行', '执行中', '已完成', '已延期']
        const promises = statusList.map(status =>
          getMyTasks({ status, page: 1, limit: 1 })
        )

        const results = await Promise.all(promises)

        // 从响应中提取totalResults，符合接口文档的响应格式
        this.taskStats = {
          pending: results[0].success ? (results[0].data.totalResults || 0) : 0,
          inProgress: results[1].success ? (results[1].data.totalResults || 0) : 0,
          completed: results[2].success ? (results[2].data.totalResults || 0) : 0,
          delayed: results[3].success ? (results[3].data.totalResults || 0) : 0
        }
      } catch (error) {
        console.error('获取任务状态统计失败:', error)
        // 统计失败不影响主流程，静默处理
      }
    },

    /**
     * 任务接单
     * 接口文档：POST /v1/mdm/tpm/maintenance-tasks/:taskId/accept
     *
     * 业务规则（接口文档第75-76行）：
     * - 只能接收状态为"待执行"的任务
     * - 任务未派工或已派工给当前用户时才能接单
     * - 接单后如果任务未派工则自动关联当前用户为执行人
     *
     * 错误码（接口文档第348-356行）：
     * - 400 TPM_TASK_011: 只有待执行状态的任务才能接单
     * - 403 TPM_TASK_016: 只能接收派工给自己的任务
     * - 404 TPM_TASK_001: 维护任务不存在
     *
     * @param {Object} task - 任务对象
     */
    async handleAcceptTask(task) {
      // 前端状态验证：只有待执行状态的任务才能接单
      // 接口文档：步骤3 - 验证任务状态（接口文档第93-97行）
      if (task.status !== '待执行') {
        this.$message.warning('只有待执行状态的任务才能接单')
        return
      }

      try {
        // 二次确认对话框
        // 接口文档：业务场景说明（接口文档第39-60行）
        // 接口文档：步骤4 - 检查权限（接口文档第155-160行）
        const confirmMessage = task.assignedTo
          ? `确认接收此维护任务？\n\n任务标题：${task.taskTitle}\n设备信息：${this.getEquipmentInfo(task)}\n\n提示：此任务已派工给您，接单后确认执行。`
          : `确认接收此维护任务？\n\n任务标题：${task.taskTitle}\n设备信息：${this.getEquipmentInfo(task)}\n\n提示：接单后系统将自动关联您为执行人。`

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

        this.$set(this.actionLoading, task.id, true)

        // 调用接单接口（无请求体）
        // 接口文档：基本信息（接口文档第188-190行）
        const response = await acceptTask(task.id)

        // 处理成功响应（接口文档第219-283行）
        if (response.success) {
          // 使用后端返回的消息提示（符合开发阶段配置规则）
          this.$message.success(response.message || '任务接单成功')

          // 刷新任务列表和统计
          await this.fetchTasks()
          await this.fetchTaskStats()
        } else {
          // 处理业务失败响应（接口文档第346-423行）
          this.$message.error(response.error?.message || '接单失败')
        }
      } catch (error) {
        // 用户取消操作
        if (error === 'cancel') {
          return
        }

        // 处理网络错误或其他异常（接口文档第346-423行）
        console.error('任务接单失败:', error)
        const errorMessage = error.error?.message || error.message || '接单失败，请稍后重试'
        this.$message.error(errorMessage)
      } finally {
        this.$set(this.actionLoading, task.id, false)
      }
    },

    /**
     * 获取设备信息字符串
     * 用于确认对话框显示
     *
     * @param {Object} task - 任务对象
     * @returns {string} 设备信息字符串
     */
    getEquipmentInfo(task) {
      if (task.equipment) {
        return `${task.equipment.equipmentCode || ''} - ${task.equipment.name || ''}`
      }
      return '未指定'
    },

    /**
     * 开始执行任务
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
     * 2. 设备维护期间的状态管理场景：通过更新设备状态为"维护中"来标识当前状态
     * 3. 维护数据统计和分析场景：记录actualStartTime用于计算工作效率
     * 4. 任务重新执行场景：任务已延期，延期期限已到，可以重新开始执行
     *
     * 使用前提（接口文档第61-67行）：
     * - 维护任务必须处于"待执行"或"已延期"状态
     * - 当前登录用户必须是任务的执行人（assignedTo == currentUserId）
     * - 操作人员必须具有 mdm.tpm.maintenance-task.execute 权限
     * - 关联的设备必须存在且处于可维护状态
     *
     * 业务流程（接口文档第77-195行）：
     * 步骤1: 验证请求参数 - 检查taskId格式
     * 步骤2: 查询维护任务 - 检查任务是否存在
     * 步骤3: 验证任务状态 - 待执行或已延期
     * 步骤4: 验证执行人 - 检查是否是执行人
     * 步骤5: 验证用户有效性 - 检查用户是否激活
     * 步骤6: 更新任务状态 - 状态变为执行中，记录实际开始时间
     * 步骤7: 更新设备状态 - 设备状态变为维护中
     * 步骤8: 记录操作日志 - 记录开始执行信息
     * 步骤9: 返回更新后的任务信息
     *
     * 成功响应（HTTP 200）（接口文档第234-297行）：
     * {
     *   success: true,
     *   data: {
     *     id: "d4e5f6a7-b8c9-0123-def0-234567890123",
     *     taskCode: "MT-EQ001-1729012345678",
     *     status: "执行中",
     *     actualStartTime: "2024-01-20T08:15:00.000Z",
     *     equipment: {
     *       id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
     *       equipmentCode: "EQ001",
     *       name: "退火炉#1",
     *       status: "维护中"
     *     },
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
     * - 403 FORBIDDEN: 无权限操作（缺少required权限）
     *
     * @param {Object} task - 任务对象
     * @param {string} task.id - 任务ID（UUID格式）
     * @param {string} task.status - 任务当前状态
     * @param {string} task.taskTitle - 任务标题
     * @param {Object} task.equipment - 设备信息对象
     * @param {string} task.equipment.equipmentCode - 设备编码
     * @param {string} task.equipment.name - 设备名称
     */
    async handleStartTask(task) {
      // 前端状态验证：只有待执行或已延期状态的任务才能开始执行
      // 接口文档：步骤3 - 验证任务状态（接口文档第159-163行）
      if (task.status !== '待执行' && task.status !== '已延期') {
        this.$message.warning('只有待执行或已延期状态的任务才能开始执行')
        return
      }

      try {
        // 获取设备信息用于确认对话框显示
        const equipmentInfo = task.equipment
          ? `${task.equipment.equipmentCode || ''} - ${task.equipment.name || ''}`
          : '未指定'

        // 二次确认对话框（接口文档：业务场景说明，接口文档第38-60行）
        // 提示用户开始执行后的状态变更
        const confirmMessage = task.status === '已延期'
          ? `确认重新开始执行此维护任务？\n\n任务标题：${task.taskTitle}\n设备信息：${equipmentInfo}\n任务状态：${task.status}\n\n提示：开始后任务状态将变为"执行中"，设备状态将变为"维护中"。系统将自动记录实际开始时间。`
          : `确认开始执行此维护任务？\n\n任务标题：${task.taskTitle}\n设备信息：${equipmentInfo}\n\n提示：开始后任务状态将变为"执行中"，设备状态将变为"维护中"。系统将自动记录实际开始时间。`

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
        this.$set(this.actionLoading, task.id, true)

        // 调用开始执行接口（无请求体）
        // 接口文档：基本信息（接口文档第202-213行）
        const response = await startTask(task.id)

        // 处理成功响应（接口文档第234-297行）
        if (response.success) {
          // 使用后端返回的消息提示（符合开发阶段配置规则）
          this.$message.success(response.message || '开始执行任务成功')

          // 验证响应数据中的关键字段更新
          // 接口文档：响应字段说明（接口文档第299-359行）
          if (response.data) {
            // status应该变为"执行中"
            // actualStartTime应该有值
            // equipment.status应该变为"维护中"
            console.log('任务开始执行成功:', {
              taskId: response.data.id,
              taskCode: response.data.taskCode,
              status: response.data.status,
              actualStartTime: response.data.actualStartTime,
              equipmentStatus: response.data.equipment?.status
            })
          }

          // 刷新任务列表和统计（确保显示最新状态）
          await this.fetchTasks()
          await this.fetchTaskStats()
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
        console.error('开始执行任务失败:', error)

        // 根据错误码提供友好的错误提示
        const errorCode = error.error?.code || error.code
        let errorMessage = error.error?.message || error.message || '开始执行失败，请稍后重试'

        // 特殊错误码处理（接口文档第362-369行）
        if (errorCode === 'MAINTENANCE_TASK_006') {
          // 任务状态不允许开始执行
          errorMessage = '只有待执行或已延期状态的任务才能开始执行'
        } else if (errorCode === 'MAINTENANCE_TASK_007') {
          // 不是任务执行人
          errorMessage = '只有任务执行人才能开始执行任务'
        } else if (errorCode === 'MAINTENANCE_TASK_002') {
          // 任务不存在
          errorMessage = '维护任务不存在或已被删除'
        } else if (errorCode === 'UNAUTHORIZED') {
          // 未授权（接口文档第365行）
          errorMessage = '未授权，请重新登录'
        } else if (errorCode === 'FORBIDDEN') {
          // 无权限（接口文档第367行）
          errorMessage = '无权限操作，请联系管理员授予执行维护任务权限'
        }

        this.$message.error(errorMessage)
      } finally {
        this.$set(this.actionLoading, task.id, false)
      }
    },

    /**
     * 查看任务详情
     * 跳转到任务详情页面
     *
     * @param {Object} task - 任务对象
     */
    handleViewDetail(task) {
      this.$router.push({
        path: `/mdm/tpm/maintenance-tasks/${task.id}`
      })
    },

    /**
     * 状态标签页切换
     * 切换状态时重置页码并重新查询
     *
     * 接口文档：status参数支持逗号分隔多个状态值
     *
     * @param {Object} tab - 标签页对象
     */
    handleStatusChange(tab) {
      this.activeStatus = tab.name
      this.queryParams.status = tab.name
      this.queryParams.page = 1
      this.fetchTasks()
    },

    /**
     * 快捷时间范围选择
     * 提供今日任务、本周任务、全部任务三种快捷筛选方式
     *
     * 接口文档：
     * - startDate: 计划开始时间范围查询-开始日期（ISO 8601格式）
     * - endDate: 计划开始时间范围查询-结束日期（ISO 8601格式）
     *
     * @param {string} type - 时间范围类型（today/week/all）
     */
    handleQuickDateRange(type) {
      this.dateRangeType = type
      const now = new Date()
      let startDate = null
      let endDate = null

      if (type === 'today') {
        // 今日任务：今天00:00:00 - 今天23:59:59
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      } else if (type === 'week') {
        // 本周任务：本周一00:00:00 - 本周日23:59:59
        const day = now.getDay() || 7 // 周日为0，转换为7
        const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1, 0, 0, 0)
        const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 7, 23, 59, 59, 999)
        startDate = monday
        endDate = sunday
      } else {
        // 全部任务：清空时间范围
        this.dateRange = null
        this.queryParams.startDate = ''
        this.queryParams.endDate = ''
        this.queryParams.page = 1
        this.fetchTasks()
        return
      }

      // 设置时间范围（用于日期选择器显示）
      this.dateRange = [
        parseTime(startDate, '{y}-{m}-{d} {h}:{i}:{s}'),
        parseTime(endDate, '{y}-{m}-{d} {h}:{i}:{s}')
      ]

      // 转换为ISO 8601格式并更新查询参数
      this.queryParams.startDate = startDate.toISOString()
      this.queryParams.endDate = endDate.toISOString()
      this.queryParams.page = 1
      this.fetchTasks()
    },

    /**
     * 时间范围变化处理
     * 日期选择器值变化时触发，将日期转换为ISO 8601格式
     *
     * 接口文档要求：
     * - 日期格式必须符合ISO 8601标准（如"2024-01-20T00:00:00.000Z"）
     * - endDate必须晚于或等于startDate
     *
     * @param {Array} value - 日期范围数组 [开始时间, 结束时间]
     */
    handleDateRangeChange(value) {
      if (value && value.length === 2) {
        // 转换为ISO 8601格式（符合接口文档要求）
        this.queryParams.startDate = new Date(value[0]).toISOString()
        this.queryParams.endDate = new Date(value[1]).toISOString()
      } else {
        // 清空时间范围
        this.queryParams.startDate = ''
        this.queryParams.endDate = ''
      }
      this.dateRangeType = 'custom'
      this.queryParams.page = 1
      this.fetchTasks()
    },

    /**
     * 搜索处理
     *
     * 接口文档：
     * - search参数：模糊搜索（对任务编码、任务标题进行全文搜索）
     * - 最大100字符
     */
    handleSearch() {
      this.queryParams.page = 1
      this.fetchTasks()
    },

    /**
     * 分页大小变化处理
     *
     * 接口文档：
     * - limit: 正整数，最小值1，最大值100
     * - 修改分页大小时重置到第一页
     *
     * @param {number} val - 新的分页大小
     */
    handleSizeChange(val) {
      this.queryParams.limit = val
      this.queryParams.page = 1
      this.fetchTasks()
    },

    /**
     * 当前页变化处理
     *
     * 接口文档：
     * - page: 正整数，最小值为1
     *
     * @param {number} val - 新的页码
     */
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.fetchTasks()
    },

    /**
     * 格式化日期时间
     * 将ISO 8601格式的时间转换为本地时间显示
     *
     * @param {string} dateTimeStr - ISO 8601格式的日期时间字符串
     * @returns {string} 格式化后的日期时间字符串（YYYY-MM-DD HH:mm）
     */
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '-'
      return parseTime(dateTimeStr, '{y}-{m}-{d} {h}:{i}')
    },

    /**
     * 判断任务是否逾期
     *
     * 业务规则：
     * - 逾期任务定义：计划开始时间 < 当前时间 且 状态为"待执行"或"执行中"
     * - 已完成和已取消的任务不算逾期
     *
     * @param {Object} task - 任务对象
     * @returns {boolean} 是否逾期
     */
    isOverdue(task) {
      if (task.status === '已完成' || task.status === '已取消') {
        return false
      }
      const now = new Date()
      const plannedStartTime = new Date(task.plannedStartTime)
      return plannedStartTime < now
    }
  }
}
</script>

<style lang="scss" scoped>
.my-tasks-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    ::v-deep .el-card__body {
      padding: 16px 20px;
    }

    .el-form {
      margin-bottom: 0;

      .el-form-item {
        margin-bottom: 0;
      }
    }
  }

  .status-tabs {
    margin-bottom: 20px;

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;

      i {
        font-size: 14px;
      }

      .status-badge {
        margin-left: 4px;

        ::v-deep .el-badge__content {
          background-color: #f56c6c;
          border: none;
        }
      }
    }
  }

  .task-list {
    min-height: 400px;

    .task-col {
      margin-bottom: 16px;
    }

    .task-card {
      height: 100%;
      transition: all 0.3s;
      border-radius: 8px;

      &:hover {
        transform: translateY(-4px);
      }

      .task-header {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }

      .task-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .task-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 13px;
        color: #606266;

        .info-item {
          display: flex;
          align-items: center;
          gap: 6px;

          i {
            color: #909399;
            font-size: 14px;
          }

          span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .task-description {
        font-size: 13px;
        color: #909399;
        line-height: 1.5;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .task-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;

        .el-button {
          flex: 1;
          min-width: 0;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
    padding: 16px 0;
  }
}
</style>

