/**
* 文件名称：RoleTable.vue
* 文件描述：角色管理表格组件，展示角色列表和操作功能
* 创建日期：2024-01-20
* 修改记录：
* - 2024-01-20: 初始创建，实现基础表格功能
*/
<template>
  <div class="role-table">
    <!-- 表格工具栏 -->
    <table-toolbar ref="toolbar" :enable-column-settings="true" :column-options="columnOptions"
      :storage-key="columnSettingsKey" :default-visible-columns="defaultVisibleColumns" :enable-batch-actions="true"
      :selected-rows="selectedRows" :enable-export="false" :hide-status-buttons="false"
      :status-buttons-mode="'dropdown'" :status-confirm="false" :delete-confirm="false" :table-data="roleList"
      :smart-status-buttons="true" :status-field="'status'" :enabled-value="'active'" :disabled-value="'inactive'"
      :refresh-feedback-mode="'all'" @refresh="handleRefresh" @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete" @batch-enable="handleBatchEnable" @batch-disable="handleBatchDisable">
      <template #toolbar-left>
        <action-buttons :buttons="toolbarButtons" mode="normal" @click="handleToolbarAction" />
        <slot name="toolbar-left" />
      </template>

      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <!-- 角色列表表格 -->
    <base-table ref="baseTable" :data="roleList" :columns="visibleTableColumns" :loading="loading"
      :pagination="paginationConfig" :selection="true" :index="true" :border="true" stripe
      @selection-change="handleSelectionChange" @sort-change="handleSortChange"
      @pagination-change="handlePaginationChange">
      <!-- 自定义空状态 - 搜索无结果时的友好提示 -->
      <template #empty>
        <div class="empty-block">
          <i class="el-icon-search" style="font-size: 48px; color: #C0C4CC; margin-bottom: 16px;" />
          <p style="color: #909399; font-size: 14px; margin: 0;">
            {{ hasSearchParams ? '未找到符合条件的角色' : '暂无角色数据' }}
          </p>
          <p v-if="hasSearchParams" style="color: #C0C4CC; font-size: 12px; margin: 8px 0 0 0;">
            请尝试调整搜索条件或
            <el-button type="text" size="small" style="padding: 0; margin-left: 4px;" @click="handleClearSearch">
              清除筛选条件
            </el-button>
          </p>
        </div>
      </template>
      <!-- 角色名称列 -->
      <template #name="{ row }">
        <div class="role-name-cell">
          <span class="role-name">{{ row.name }}</span>
          <el-tag v-if="row.isDefault" type="warning" size="mini" class="default-tag">
            默认
          </el-tag>
        </div>
      </template>

      <!-- 角色类型列 -->
      <template #type="{ row }">
        <status-tag :status="row.type" :text-map="typeStatusConfig.textMap" :type-map="typeStatusConfig.typeMap" />
      </template>

      <!-- 角色状态列 -->
      <template #status="{ row }">
        <status-tag :status="row.status" :text-map="statusConfig.textMap" :type-map="statusConfig.typeMap" />
      </template>

      <!-- 角色级别列 -->
      <template #level="{ row }">
        <el-tag :type="getLevelTagType(row.level)" size="small">
          {{ row.level }}级
        </el-tag>
      </template>

      <!-- 用户数量列 -->
      <template #userCount="{ row }">
        <span class="user-count">{{ row.userCount || 0 }}人</span>
      </template>

      <!-- 创建时间列 -->
      <template #createdAt="{ row }">
        <span>{{ formatDateTime(row.createdAt) }}</span>
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <action-buttons :buttons="getRowActionButtons(row)" :row="row" mode="text" size="small"
          @click="handleRowAction" />
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
import { parseTime } from '@/utils'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  STATUS_CONFIG,
  TYPE_STATUS_CONFIG as TYPE_CONFIG,
  ROLE_LEVEL_COLORS
} from '../constants'

export default {
  name: 'RoleTable',
  components: {
    BaseTable,
    TableToolbar,
    ActionButtons,
    StatusTag
  },
  mixins: [columnSettingsMixin],
  props: {
    // 角色列表数据
    roleList: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 分页信息
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        limit: 10,
        total: 0
      })
    },
    // 当前搜索参数 - 用于判断是否有搜索条件
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 选中的行
      selectedRows: [],
      // 重写列设置存储键前缀（columnSettingsMixin需要）
      columnSettingsKeyPrefix: 'role_management_columns',
      // 工具栏按钮配置
      toolbarButtons: [
        {
          text: '新增角色',
          type: 'primary',
          icon: 'el-icon-plus',
          action: 'create'
        }
      ],
      // 角色类型状态配置
      typeStatusConfig: TYPE_CONFIG,
      // 角色状态配置
      statusConfig: STATUS_CONFIG
    }
  },
  computed: {
    /**
     * 可见的表格列配置（参考UserTable.vue实现）
     */
    visibleTableColumns() {
      // 先过滤出可见的列，然后应用格式化
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
     * 分页配置
     */
    paginationConfig() {
      return {
        ...this.pagination,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper'
      }
    },

    /**
     * 判断是否有搜索参数 - 用于空状态提示
     */
    hasSearchParams() {
      return this.searchParams && Object.keys(this.searchParams).some(key => {
        const value = this.searchParams[key]
        return value !== undefined && value !== null && value !== '' &&
          (Array.isArray(value) ? value.length > 0 : true)
      })
    }
  },
  created() {
    // 初始化列配置 - 使用columnOptions初始化allColumns（参考OperationTable实现）
    this.allColumns = this.columnOptions

    // 加载列设置（使用mixin的方法）
    this.loadColumnSettings()
  },
  methods: {
    /**
             * 格式化日期时间
             */
    formatDateTime(dateTime) {
      return parseTime(dateTime, '{y}-{m}-{d} {h}:{i}')
    },

    /**
         * 获取级别标签类型
         */
    getLevelTagType(level) {
      return ROLE_LEVEL_COLORS[level] || 'info'
    },

    /**
     * 获取行操作按钮
     */
    getRowActionButtons(row) {
      // 防止在没有数据时调用
      if (!row) return []

      const isSystemRole = row.type === 'system' || row.isSystem
      const isDefaultRole = !!row.isDefault
      const hasRelatedUsers = Number(row.userCount) > 0

      const buttons = [
        {
          text: '查看',
          icon: 'el-icon-view',
          action: 'view',
          data: row
        },
        {
          text: '编辑',
          icon: 'el-icon-edit',
          action: 'edit',
          data: row,
          disabled: isSystemRole // 系统角色不允许编辑
        },
        {
          text: '复制',
          icon: 'el-icon-document-copy',
          action: 'copy',
          data: row
        },
        {
          text: row.status === 'active' ? '禁用' : '启用',
          icon: row.status === 'active' ? 'el-icon-close' : 'el-icon-check',
          action: 'toggle-status',
          data: row,
          type: row.status === 'active' ? 'warning' : 'success',
          disabled: isSystemRole // 系统角色不允许状态切换
        },
        {
          text: '删除',
          icon: 'el-icon-delete',
          action: 'delete',
          data: row,
          type: 'danger',
          disabled: isSystemRole || isDefaultRole || hasRelatedUsers // 系统角色、默认角色或关联用户的角色不允许删除
        }
      ]

      return buttons
    },

    /**
             * 处理表格选择变化
             */
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    /**
             * 处理排序变化
             */
    handleSortChange(sortInfo) {
      this.$emit('sort-change', sortInfo)
    },

    /**
             * 处理分页变化
             */
    handlePaginationChange(pagination) {
      this.$emit('pagination-change', pagination)
    },

    /**
             * 处理刷新
             */
    handleRefresh() {
      this.$emit('refresh')
    },

    /**
             * 处理列变化（交由mixin默认实现处理）
             */
    handleColumnChange(visibleColumns) {
      columnSettingsMixin.methods.handleColumnChange.call(this, visibleColumns)
    },

    /**
             * 处理工具栏操作
             */
    handleToolbarAction(action) {
      switch (action.action) {
        case 'create':
          this.$emit('create')
          break
      }
    },

    /**
             * 处理行操作
             */
    handleRowAction(action) {
      const { action: actionType, data, row } = action
      // 优先使用data，如果没有则使用row（向后兼容）
      const rowData = data || row

      switch (actionType) {
        case 'view':
          this.$emit('view', rowData)
          break
        case 'edit':
          this.$emit('edit', rowData)
          break
        case 'copy':
          this.$emit('copy', rowData)
          break
        case 'toggle-status': {
          const newStatus = rowData.status === 'active' ? 'inactive' : 'active'
          this.$emit('status-change', rowData, newStatus)
          break
        }
        case 'delete':
          this.$emit('delete', rowData)
          break
      }
    },

    /**
             * 处理批量删除
             */
    handleBatchDelete() {
      this.$emit('batch-delete', this.selectedRows)
    },

    /**
             * 处理批量启用
             */
    handleBatchEnable() {
      this.$emit('batch-enable', this.selectedRows)
    },

    /**
             * 处理批量禁用
             */
    handleBatchDisable() {
      this.$emit('batch-disable', this.selectedRows)
    },

    /**
             * 刷新成功回调
             */
    refreshSucceed() {
      this.$refs.toolbar?.refreshSucceed()
    },

    /**
     * 刷新失败回调
     */
    refreshFail(message) {
      this.$refs.toolbar?.refreshFail(message)
    },

    /**
     * 处理清除搜索条件
     */
    handleClearSearch() {
      this.$emit('clear-search')
    }
  }
}
</script>

<style lang="scss" scoped>
.role-table {
  .role-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .role-name {
      font-weight: 500;
    }

    .default-tag {
      font-size: 10px;
    }
  }

  .user-count {
    color: #606266;
    font-size: 13px;
  }
}
</style>
