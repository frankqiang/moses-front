/**
* 待审批申请表格组件
* 功能描述：展示待审批申请列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
* 创建日期：2024-12-23
* 重构日期：2024-12-23 - 使用BaseTable组件替代el-table，引入标准化架构
* 优化记录：
* - 2024-12-23: 使用ActionButtons组件优化操作列显示
* - 2024-12-23: 引入columnSettingsMixin实现列设置功能
*/

<template>
  <div class="application-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      ref="toolbar"
      :enable-column-settings="true"
      :column-options="columnOptions"
      :storage-key="columnSettingsKey"
      :default-visible-columns="defaultVisibleColumns"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      :enable-export="true"
      :export-api="exportApiFunction"
      :export-params="exportParams"
      :hide-status-buttons="true"
      :table-data="data"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <div class="table-title">
          <i class="el-icon-user" />
          待审批申请列表
          <span class="total-count">(共 {{ total }} 条)</span>
        </div>
      </template>
    </table-toolbar>

    <!-- 使用全局BaseTable组件 -->
    <BaseTable
      ref="baseTable"
      :data="data"
      :loading="loading"
      :load-error="loadError"
      :columns="baseTableColumns"
      :pagination="paginationConfig"
      :show-selection="true"
      :show-index="true"
      :index-label="'序号'"
      :empty-text="emptyText"
      :enable-virtual-scroll="enableVirtualScroll"
      :row-class-name="getRowClassName"
      :default-sort="{ prop: 'createdAt', order: 'descending' }"
      @pagination-change="handlePaginationChange"
      @sort-change="handleSortChange"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      @data-error="handleDataError"
      @format-error="handleFormatError"
    >
      <!-- 状态列 -->
      <template #status="{ row }">
        <StatusTag
          :status="row.status || 'unknown'"
          :text-map="statusTextMap"
          :type-map="statusTypeMap"
          :default-text="'数据错误'"
        />
      </template>

      <!-- 操作列 -->
      <template #actions="{ row }">
        <ActionButtons :buttons="getActionButtons(row)" mode="text" :row="row" @click="handleActionClick" />
      </template>

      <!-- 空状态自定义 -->
      <template #empty>
        <div class="custom-empty">
          <i class="el-icon-document-remove" style="font-size: 48px; color: #c0c4cc;" />
          <p>暂无待审批申请</p>
          <el-button type="primary" size="small" @click="handleRefresh">刷新数据</el-button>
        </div>
      </template>
    </BaseTable>

  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import TableToolbar from '@/components/TableToolbar'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'

import { parseTime, debounce } from '@/utils'
import {
  TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  STATUS_CONFIG
} from '../constants'

export default {
  name: 'ApplicationTable',
  components: {
    BaseTable,
    StatusTag,
    ActionButtons,
    TableToolbar
  },
  mixins: [columnSettingsMixin],
  props: {
    /**
     * 表格数据
     * @type {Array}
     * @description 待审批申请列表数据
     */
    data: {
      type: Array,
      default: () => []
    },
    /**
     * 总记录数
     * @type {Number}
     * @description 用于分页组件显示总数
     */
    total: {
      type: Number,
      default: 0
    },
    /**
     * 加载状态
     * @type {Boolean}
     * @description 控制表格加载动画显示
     */
    loading: {
      type: Boolean,
      default: false
    },
    /**
     * 加载错误状态
     * @type {Boolean|String|Error}
     * @description 表格数据加载错误信息
     */
    loadError: {
      type: [Boolean, String, Error],
      default: false
    },
    /**
     * 当前页码
     * @type {Number}
     * @description 分页当前页，支持.sync修饰符
     */
    page: {
      type: Number,
      default: 1
    },
    /**
     * 每页显示条数
     * @type {Number}
     * @description 分页每页条数，支持.sync修饰符
     */
    limit: {
      type: Number,
      default: 10
    },
    /**
     * 导出API地址
     * @type {String}
     * @description 数据导出接口地址
     */
    exportApi: {
      type: String,
      default: '/api/v1/register/pending/export'
    }
  },
  data() {
    return {
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'application_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 当前页码
      currentPage: 1,
      // 每页条数
      pageSize: 10
    }
  },
  computed: {
    /**
     * 状态文本映射
     * @returns {Object} 状态值到显示文本的映射
     * @description 从常量配置中获取状态文本映射
     */
    statusTextMap() {
      return STATUS_CONFIG.textMap
    },
    /**
     * 状态类型映射
     * @returns {Object} 状态值到Element UI标签类型的映射
     * @description 从常量配置中获取状态类型映射，用于StatusTag组件
     */
    statusTypeMap() {
      return STATUS_CONFIG.typeMap
    },
    /**
     * 所有可用列配置
     * @returns {Array} 表格列配置数组
     * @description 从常量配置中获取所有可用的表格列定义
     */
    columnOptions() {
      return TABLE_COLUMNS
    },
    /**
     * 默认可见列
     * @returns {Array} 默认显示的列标识符数组
     * @description 覆盖mixin中的默认可见列配置
     */
    defaultVisibleColumns() {
      return DEFAULT_VISIBLE_COLUMNS
    },
    /**
     * 导出API函数
     * @returns {Function} 导出请求函数
     * @description 返回用于数据导出的API请求函数
     */
    exportApiFunction() {
      return (params) => {
        return request({
          url: this.exportApi,
          method: 'post',
          data: params,
          responseType: 'blob'
        })
      }
    },
    /**
     * 是否启用虚拟滚动
     * @returns {Boolean} 是否启用虚拟滚动
     * @description 当数据量超过100条时自动启用虚拟滚动以提升性能
     */
    enableVirtualScroll() {
      return this.data.length > 100
    },
    /**
     * BaseTable列配置
     * @returns {Array} 过滤后的列配置数组
     * @description 根据用户选择的可见列过滤表格列配置
     */
    baseTableColumns() {
      return TABLE_COLUMNS.filter(col =>
        this.internalVisibleColumns.includes(col.prop)
      )
    },
    /**
     * 分页配置
     * @returns {Object} 分页组件配置对象
     * @description 生成BaseTable组件使用的分页配置
     */
    paginationConfig() {
      return {
        total: this.total,
        page: this.currentPage,
        limit: this.pageSize,
        pageSizes: [10, 20, 50, 100],
        layout: 'total, sizes, prev, pager, next, jumper',
        background: true,
        autoScroll: true
      }
    },
    /**
     * 空数据提示文本
     * @returns {String} 空状态显示文本
     * @description 根据加载状态返回相应的空数据提示文本
     */
    emptyText() {
      if (this.loading) {
        return '加载中...'
      }
      return '暂无待审批申请'
    }
  },
  watch: {
    // 监听页码变化
    page: {
      handler(val) {
        this.currentPage = val
      },
      immediate: true
    },
    // 监听每页条数变化
    limit: {
      handler(val) {
        this.pageSize = val
      },
      immediate: true
    }
  },
  created() {
    // 初始化导出参数
    this.updateExportParams()

    // 初始化列配置 - 使用columnOptions初始化allColumns
    this.allColumns = this.columnOptions

    // 加载列设置（使用mixin的方法）
    this.loadColumnSettings()

    // 创建防抖版本的批量删除函数
    this.debouncedBatchDelete = debounce(this.performBatchDelete, 300)
  },
  mounted() {
    // 初始化防抖刷新函数
    this.debouncedRefresh = debounce(() => {
      this.$emit('refresh')
    }, 300)
  },
  methods: {
    /**
     * 刷新成功回调
     * @param {String} message - 成功消息
     * @description 公开方法，供父组件调用，用于显示刷新成功状态
     */
    refreshSucceed(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshSucceed(message)
      }
    },

    /**
     * 刷新失败回调
     * @param {String} message - 失败消息
     * @description 公开方法，供父组件调用，用于显示刷新失败状态
     */
    refreshFail(message) {
      if (this.$refs.toolbar) {
        this.$refs.toolbar.refreshFail(message)
      }
    },

    /**
     * 时间格式化方法
     * @param {String|Date} dateTime - 日期时间
     * @param {String} format - 格式化模板
     * @returns {String} 格式化后的时间字符串
     * @description 将导入的parseTime函数添加为组件方法
     */
    parseTime(dateTime, format) {
      return parseTime(dateTime, format)
    },

    /**
     * 更新导出参数
     * @description 更新导出时使用的额外参数
     */
    updateExportParams() {
      // 更新导出参数（这里可以添加其他参数）
      this.exportParams = {
        // 导出时可以添加额外参数
      }
    },

    /**
     * 处理刷新事件
     * @description 使用防抖处理刷新操作，避免频繁请求
     */
    handleRefresh() {
      this.debouncedRefresh()
    },

    /**
     * 处理表格选择变更
     * @param {Array} selection - 选中的行数据
     * @description 更新选中行状态，用于批量操作
     */
    handleSelectionChange(selection) {
      console.log('选择变化:', selection)
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    /**
     * 处理重试操作
     * @description 向父组件发送重试事件
     */
    handleRetry() {
      this.$emit('retry')
    },

    /**
     * 处理行点击事件
     * @param {Object} row - 点击的行数据
     * @description 向父组件发送行点击事件
     */
    handleRowClick(row) {
      this.$emit('row-click', row)
    },

    /**
     * 处理数据错误
     * @param {Error} error - 错误对象
     * @description 向父组件发送数据错误事件
     */
    handleDataError(error) {
      this.$emit('data-error', error)
    },

    /**
     * 处理格式错误
     * @param {Error} error - 错误对象
     * @description 向父组件发送格式错误事件
     */
    handleFormatError(error) {
      this.$emit('format-error', error)
    },

    /**
     * 处理分页变化
     * @param {Object} pagination - 分页参数 {page, limit}
     * @description 更新内部分页状态并向父组件发送分页变化事件
     */
    handlePaginationChange({ page, limit }) {
      this.currentPage = page
      this.pageSize = limit
      this.$emit('pagination-change', { page, limit })
    },

    /**
     * 处理排序变化
     * @param {Object} sortInfo - 排序信息 { prop, order }
     * @description 当表格排序发生变化时，向父组件发送事件
     */
    handleSortChange(sortInfo) {
      console.log('表格排序变化:', sortInfo)
      this.$emit('sort-change', sortInfo)
    },

    /**
     * 获取行样式类名
     * @param {Object} params - 行参数 {row, rowIndex}
     * @returns {String} CSS类名
     * @description 根据行数据状态返回相应的CSS类名
     */
    getRowClassName({ row }) {
      if (row.status === 'rejected') {
        return 'row-disabled'
      }
      return ''
    },

    /**
     * 获取操作按钮配置
     * @param {Object} row - 行数据
     * @returns {Array} 操作按钮配置数组
     * @description 根据申请状态动态生成操作按钮配置
     */
    getActionButtons(row) {
      // 安全检查：确保row存在
      if (!row) {
        return []
      }

      const buttons = [
        {
          action: 'view',
          text: '查看',
          type: 'text',
          icon: 'el-icon-view',
          tooltip: '查看申请详情'
        }
      ]

      // 只有待审批状态才显示批准和拒绝按钮
      if (row.status === 'pending') {
        buttons.push(
          {
            action: 'approve',
            text: row.approving ? '批准中...' : '批准',
            type: 'text',
            icon: row.approving ? 'el-icon-loading' : 'el-icon-check',
            class: 'success',
            tooltip: '批准该申请',
            disabled: row.approving || row.rejecting
          },
          {
            action: 'reject',
            text: row.rejecting ? '拒绝中...' : '拒绝',
            type: 'text',
            icon: row.rejecting ? 'el-icon-loading' : 'el-icon-close',
            class: 'danger',
            tooltip: '拒绝该申请',
            disabled: row.approving || row.rejecting
          }
        )
      }

      return buttons
    },

    /**
     * 处理操作按钮点击
     * @param {Object} button - 按钮配置对象
     * @description 根据按钮类型向父组件发送相应事件
     */
    handleActionClick(button) {
      switch (button.action) {
        case 'view':
          this.$emit('view', button.row)
          break
        case 'approve':
          this.$emit('approve', button.row)
          break
        case 'reject':
          this.$emit('reject', button.row)
          break
      }
    },

    /**
     * 处理批量删除
     * @description 向父组件发送批量删除事件，传递选中的行数据
     */
    handleBatchDelete() {
      this.$emit('batch-delete', this.selectedRows)
    },

    /**
     * 执行批量删除（防抖版本）
     * @param {Array} rows - 要删除的行数据
     * @description 发出事件让父组件处理批量删除逻辑
     */
    performBatchDelete(rows) {
      // 发出事件让父组件处理批量删除逻辑
      this.$emit('batch-delete', rows)
    },

    /**
     * 处理导出成功
     * @param {Object} result - 导出结果对象
     * @description 显示导出成功消息
     */
    handleExportSuccess(result) {
      this.$message.success(`导出成功：${result.filename || '数据已导出'}`)
    },

    // 错误处理增强
    handleError(error, context = '操作') {
      console.error(`${context}失败:`, error)
      const message = error.response?.data?.message || error.message || `${context}失败，请重试`
      this.$message.error(message)
    },

    // 批量操作确认
    confirmBatchAction(action, selectedCount) {
      return this.$confirm(
        `确定要${action} ${selectedCount} 条记录吗？`,
        '批量操作确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
    },

    // 获取用户头像
    getUserAvatar(user) {
      if (user.avatar) {
        return user.avatar
      }
      // 使用用户名首字母作为头像
      return user.name ? user.name.charAt(0).toUpperCase() : 'U'
    },

    // 格式化部门路径
    formatDepartmentPath(department) {
      if (!department) return '-'
      return department.path || department.name || '-'
    },

    // 格式化时间显示
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      return this.parseTime(dateTime, '{y}-{m}-{d} {h}:{i}')
    },

    // 获取相对时间
    getRelativeTime(dateTime) {
      if (!dateTime) return ''
      const now = new Date()
      const date = new Date(dateTime)
      const diff = now - date
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor(diff / (1000 * 60))

      if (days > 0) {
        return `${days}天前`
      } else if (hours > 0) {
        return `${hours}小时前`
      } else if (minutes > 0) {
        return `${minutes}分钟前`
      } else {
        return '刚刚'
      }
    },

    // 重置表格状态
    resetTableState() {
      this.selectedRows = []
      this.currentPage = 1
      this.pageSize = 10
    },

    // 刷新当前页数据
    refreshCurrentPage() {
      this.$emit('pagination-change', {
        page: this.currentPage,
        limit: this.pageSize
      })
    },

    // 处理网络错误
    handleNetworkError(error) {
      if (!navigator.onLine) {
        this.$message.error('网络连接已断开，请检查网络设置')
        return
      }

      if (error.code === 'ECONNABORTED') {
        this.$message.error('请求超时，请重试')
        return
      }

      this.handleError(error, '网络请求')
    },

    // 验证数据完整性
    validateRowData(row) {
      const requiredFields = ['id', 'applicant', 'status']
      return requiredFields.every(field => row[field] !== undefined && row[field] !== null)
    },

    // 处理数据验证错误
    handleDataValidationError(invalidRows) {
      console.warn('发现无效数据行:', invalidRows)
      this.$message.warning(`发现 ${invalidRows.length} 条无效数据，已自动过滤`)
    }
  }
}
</script>

<style lang="scss" scoped>
.application-table {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  // 禁用行样式
  :deep(.row-disabled) {
    background-color: #f5f5f5;
    color: #999;

    .el-table__cell {
      background-color: #f5f5f5 !important;
    }
  }

  .table-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #303133;

    i {
      margin-right: 8px;
      color: #409eff;
    }

    .total-count {
      margin-left: 8px;
      font-size: 14px;
      color: #909399;
      font-weight: normal;
    }
  }

  .applicant-info {
    .name {
      font-weight: 500;
      color: #303133;
      margin-bottom: 4px;
    }

    .email {
      font-size: 12px;
      color: #909399;
    }
  }

  .time-info {
    .time-ago {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }

  .text-muted {
    color: #c0c4cc;
    font-style: italic;
  }

  .empty-state {
    padding: 40px 0;
    text-align: center;
    color: #909399;

    i {
      font-size: 48px;
      color: #c0c4cc;
      margin-bottom: 16px;
    }

    .empty-text {
      font-size: 14px;
      margin-bottom: 16px;
    }
  }

  // 时间信息样式
  .time-info {
    .time {
      color: #333;
    }

    .relative {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }
  }
}
</style>
