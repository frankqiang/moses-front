/**
 * 文件名称：UserTable.vue
 * 文件描述：用户管理表格组件，负责用户列表的展示和基础操作
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 从index.vue中拆分出来，提高组件复用性
 */
<template>
  <base-table
    ref="userTable"
    :data="userList"
    :columns="tableColumns"
    :loading="loading"
    :pagination="pagination"
    :show-selection="true"
    @selection-change="handleSelectionChange"
    @pagination-change="handlePaginationChange"
  >
    <!-- 状态列自定义渲染 -->
    <template #status="{ row }">
      <status-tag
        v-if="row && row.status !== undefined"
        :status="row.status"
        :type="getStatusType(row.status)"
      >
        {{ getStatusText(row.status) }}
      </status-tag>
      <span v-else>-</span>
    </template>

    <!-- 操作列 -->
    <template #actions="{ row }">
      <ActionButtons
        :buttons="getActionButtons(row)"
        mode="text"
        :row="row"
        @click="handleActionClick"
      />
    </template>
  </base-table>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import { 
  TABLE_COLUMNS, 
  STATUS_CONFIG, 
  GENDER_CONFIG, 
  ACTION_BUTTONS_CONFIG,
  ROW_CLASS_CONFIG 
} from '../constants/table-config'
import { USER_STATUS } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'UserTable',
  components: {
    BaseTable,
    ActionButtons,
    StatusTag
  },
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
    }
  },
  computed: {
    /**
     * 表格列配置 - 使用统一配置文件
     */
    tableColumns() {
      return TABLE_COLUMNS.map(column => {
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
    }
  },
  methods: {
    /**
     * 格式化性别显示 - 使用统一配置
     */
    formatGender(row) {
      return GENDER_CONFIG.textMap[row.gender] || '-'
    },

    /**
     * 获取状态类型 - 使用统一配置
     */
    getStatusType(status) {
      if (!status) return 'info'
      return STATUS_CONFIG.typeMap[status] || 'info'
    },

    /**
     * 获取状态文本 - 使用统一配置
     */
    getStatusText(status) {
      if (!status) return '未知'
      return STATUS_CONFIG.textMap[status] || '未知'
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
      if (row.status === USER_STATUS.ACTIVE) {
        buttons.push({
          text: '禁用',
          action: 'disable',
          icon: 'el-icon-close',
          type: 'text',
          class: 'warning',
          tooltip: '禁用该用户'
        })
      } else if (row.status === USER_STATUS.DISABLED) {
        buttons.push({
          text: '启用',
          action: 'enable',
          icon: 'el-icon-check',
          type: 'text',
          class: 'success',
          tooltip: '启用该用户'
        })
      }

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
          this.$emit('view', button.row)
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
        case 'reset-password':
          this.$emit('reset-password', button.row)
          break
      }
    },

    /**
     * 选择变化处理
     */
    handleSelectionChange(selection) {
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
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>