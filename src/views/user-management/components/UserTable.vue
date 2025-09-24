/**
* 文件名称：UserTable.vue
* 文件描述：用户管理表格组件，负责用户列表的展示和基础操作
* 创建日期：2024-01-15
* 修改记录：
* - 2024-01-15: 从index.vue中拆分出来，提高组件复用性
*/
<template>
  <div class="user-table">
    <!-- 表格工具栏 -->
    <table-toolbar
      ref="toolbar"
      :enable-column-settings="true"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-batch-actions="true"
      :selected-rows="selectedUsers"
      :enable-export="true"
      :export-api="exportApi"
      :export-params="exportParams"
      :export-filename="exportFilename"
      :enable-import="false"
      :status-confirm="false"
      :smart-status-buttons="true"
      :status-field="'status'"
      :enabled-value="userStatusActive"
      :disabled-value="userStatusInactive"
      :custom-actions="customBatchActions"
      :refresh-feedback-mode="'all'"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @custom-action="handleCustomBatchAction"
    >
      <template #toolbar-left>
        <slot name="toolbar-left" />
      </template>
      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <!-- 数据表格 -->
    <base-table
      ref="userTable"
      :data="userList"
      :columns="visibleTableColumns"
      :loading="loading"
      :pagination="pagination"
      :show-selection="true"
      :show-index="true"
      @selection-change="handleSelectionChange"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
    >
      <!-- 状态列自定义渲染 -->
      <template #status="{ row }">
        <status-tag
          v-if="row && row.status !== undefined"
          :status="row.status"
          :type-map="statusTypeMap"
          :text-map="statusTextMap"
        />
        <span v-else>-</span>
      </template>

      <!-- 性别列自定义渲染 -->
      <template #gender="{ row }">
        <span v-if="row && row.profile && row.profile.gender">
          <i :class="getGenderIcon(row.profile.gender)" style="margin-right: 4px;" />
          {{ getGenderText(row.profile.gender) }}
        </span>
        <span v-else>-</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <ActionButtons :buttons="getActionButtons(row)" mode="text" :row="row" @click="handleActionClick" />
      </template>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import TableToolbar from '@/components/TableToolbar'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import {
  TABLE_COLUMNS,
  STATUS_CONFIG,
  GENDER_CONFIG,
  DEFAULT_VISIBLE_COLUMNS
} from '../constants/table-config'
import { USER_STATUS } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'UserTable',
  components: {
    BaseTable,
    TableToolbar,
    ActionButtons,
    StatusTag
  },
  mixins: [columnSettingsMixin],
  props: {
    userList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 20,
        total: 0
      })
    },
    // 导出相关props
    exportApi: {
      type: Function,
      default: null
    },
    exportParams: {
      type: Object,
      default: () => ({})
    },
    exportFilename: {
      type: String,
      default: '用户列表'
    }
  },
  data() {
    return {
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'user_management_columns',
      // 选中的用户
      selectedUsers: []
    }
  },
  computed: {
    /**
     * 用户状态常量 - 供模板使用
     */
    userStatusActive() {
      return USER_STATUS.ACTIVE
    },

    userStatusInactive() {
      return USER_STATUS.INACTIVE
    },

    userStatusLocked() {
      return USER_STATUS.LOCKED
    },

    /**
     * 状态文本映射 - 直接使用常量
     */
    statusTextMap() {
      return STATUS_CONFIG.textMap
    },

    /**
     * 状态类型映射 - 直接使用常量
     */
    statusTypeMap() {
      return STATUS_CONFIG.typeMap
    },

    /**
     * 可见的表格列配置
     */
    visibleTableColumns() {
      // 先过滤可见的列，然后应用格式化
      const visibleColumns = TABLE_COLUMNS.filter(column =>
        this.internalVisibleColumns.includes(column.prop) || column.prop === 'actions'
      )

      // 应用格式化逻辑
      return visibleColumns.map(column => {
        // 为时间类型列添加格式化器
        if (column.type === 'datetime') {
          return {
            ...column,
            formatter: (row) => {
              const value = row[column.prop]
              return value ? parseTime(value, column.format || '{y}-{m}-{d} {h}:{i}') : '-'
            }
          }
        }
        // 为性别列添加格式化器
        if (column.prop === 'gender') {
          return {
            ...column,
            formatter: this.formatGender
          }
        }
        return column
      })
    },

    /**
     * 列选项配置
     */
    columnOptions() {
      return TABLE_COLUMNS
    },

    /**
     * 覆盖mixin中的默认可见列
     */
    defaultVisibleColumns() {
      return DEFAULT_VISIBLE_COLUMNS
    },

    /**
     * 自定义批量操作配置
     */
    customBatchActions() {
      return [{
        key: 'lock',
        action: 'lock',
        label: '批量锁定',
        text: '批量锁定',
        type: 'warning',
        icon: 'el-icon-lock',
        needConfirm: false, // 我们在父组件处理确认
        showCount: true,
        condition: (selectedRows) => {
          // 只有当选中的用户中存在非锁定状态的用户时，才显示批量锁定按钮
          return selectedRows.some(row => row.status !== this.userStatusLocked)
        }
      }
      ]
    }
  },
  created() {
    // 初始化列配置 - 使用columnOptions初始化allColumns
    this.allColumns = this.columnOptions

    // 加载列设置（使用mixin的方法）
    this.loadColumnSettings()
  },
  methods: {
    /**
     * 公开方法，供父组件调用 - 刷新成功提示
     */
    refreshSucceed(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed(message)
      }
    },

    /**
     * 公开方法，供父组件调用 - 刷新失败提示
     */
    refreshFail(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshFail(message)
      }
    },

    /**
     * 格式化性别显示 - 使用统一配置
     */
    formatGender(row) {
      return GENDER_CONFIG.textMap[row.gender] || '-'
    },

    /**
     * 获取性别文本
     */
    getGenderText(gender) {
      return GENDER_CONFIG.textMap[gender] || '未知'
    },

    /**
     * 获取性别图标
     */
    getGenderIcon(gender) {
      return GENDER_CONFIG.iconMap[gender] || 'el-icon-question'
    },

    /**
     * 获取操作按钮配置 - 使用统一配置
     */
    getActionButtons(row) {
      if (!row) {
        return []
      }

      const buttons = []

      // 添加查看按钮
      buttons.push({
        text: '查看',
        action: 'view',
        icon: 'el-icon-view',
        type: 'text',
        tooltip: '查看用户详情'
      })

      // 添加编辑按钮
      buttons.push({
        text: '编辑',
        action: 'edit',
        icon: 'el-icon-edit',
        type: 'text',
        tooltip: '编辑用户信息'
      })

      // 根据状态显示不同的操作按钮
      if (row.status === this.userStatusActive) {
        buttons.push({
          text: '禁用',
          action: 'disable',
          icon: 'el-icon-close',
          type: 'text',
          class: 'warning',
          tooltip: '禁用该用户'
        })
        buttons.push({
          text: '锁定',
          action: 'lock',
          icon: 'el-icon-lock',
          type: 'text',
          class: 'warning',
          tooltip: '锁定该用户账号'
        })
      } else if (row.status === this.userStatusInactive || row.status === this.userStatusLocked) {
        buttons.push({
          text: '启用',
          action: 'enable',
          icon: 'el-icon-check',
          type: 'text',
          class: 'success',
          tooltip: '启用该用户'
        })
      }

      // 添加角色分配按钮
      buttons.push({
        text: '角色分配',
        action: 'assign-roles',
        icon: 'el-icon-user',
        type: 'text',
        tooltip: '管理用户角色'
      })

      // 添加重置密码按钮
      buttons.push({
        text: '重置密码',
        action: 'reset-password',
        icon: 'el-icon-key',
        type: 'text',
        tooltip: '重置用户密码'
      })

      // 添加删除按钮
      buttons.push({
        text: '删除',
        action: 'delete',
        icon: 'el-icon-delete',
        type: 'text',
        class: 'danger',
        tooltip: '删除用户'
      })

      return buttons
    },

    /**
     * 处理操作按钮点击
     */
    handleActionClick(button) {
      switch (button.action) {
        case 'view':
          // 直接跳转到用户详情页面
          this.$router.push(`/user-management/detail/${button.row.id}`)
          break
        case 'edit':
          this.$emit('edit', button.row)
          break
        case 'delete':
          this.$emit('delete', button.row)
          break
        case 'enable':
          this.$emit('enable', button.row)
          break
        case 'disable':
          this.$emit('disable', button.row)
          break
        case 'lock':
          this.$emit('lock', button.row)
          break
        case 'assign-roles':
          this.$emit('assign-roles', button.row)
          break
        case 'reset-password':
          this.$emit('reset-password', button.row)
          break
      }
    },

    /**
     * 选择变化处理
     */
    handleSelectionChange(selection) {
      this.selectedUsers = selection
      this.$emit('selection-change', selection)
    },

    /**
     * 分页变化处理
     */
    handlePaginationChange(pagination) {
      this.$emit('pagination-change', pagination)
    },

    /**
     * 查看用户
     */
    handleView(row) {
      this.$emit('view', row)
    },

    /**
     * 编辑用户
     */
    handleEdit(row) {
      this.$emit('edit', row)
    },

    /**
     * 删除用户
     */
    handleDelete(row) {
      this.$emit('delete', row)
    },

    /**
     * 启用用户
     */
    handleEnable(row) {
      this.$emit('enable', row)
    },

    /**
     * 禁用用户
     */
    handleDisable(row) {
      this.$emit('disable', row)
    },

    /**
     * 重置密码
     */
    handleResetPassword(row) {
      this.$emit('reset-password', row)
    },

    /**
     * 排序变化处理
     */
    handleSortChange({ column, prop, order }) {
      // 将Element UI的排序参数转换为接口需要的格式
      let sortBy = ''
      if (prop && order) {
        const direction = order === 'ascending' ? 'asc' : 'desc'
        // 处理嵌套字段
        const sortField = prop === 'profile.department.name' ? 'department' : prop
        sortBy = `${sortField}:${direction}`
      }
      this.$emit('sort-change', sortBy)
    },

    /**
     * 刷新处理
     */
    handleRefresh() {
      this.$emit('refresh')
    },

    /**
     * 批量删除处理
     */
    handleBatchDelete(selectedRows) {
      this.$emit('batch-delete', selectedRows)
    },

    /**
     * 批量启用处理
     */
    handleBatchEnable(selectedRows) {
      this.$emit('batch-enable', selectedRows)
    },

    /**
     * 批量禁用处理
     */
    handleBatchDisable(selectedRows) {
      this.$emit('batch-disable', selectedRows)
    },

    /**
     * 处理自定义批量操作
     */
    handleCustomBatchAction(action, selectedRows) {
      switch (action.key || action.action) {
        case 'lock':
          this.$emit('batch-lock', selectedRows)
          break
        default:
          console.log('未知的自定义批量操作:', action)
      }
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>
