/**
* 物料编码规则表格组件
* 功能描述：展示物料编码规则列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
* 功能增强：支持批量操作、导入导出等高级功能
* 创建日期：2023-10-01
* 更新日期：2024-10-28
*/
<template>
  <div class="code-rule-table">

    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="allColumns"
      :storage-key="currentStorageKey"
      :default-visible-columns="visibleColumnsList"
      :enable-batch-actions="true"
      :selected-rows="selectedRows"
      :enable-import="true"
      :import-api="importApiFunction"
      :template-api="templateApiFunction"
      :enable-export="true"
      :export-api="exportApiFunction"
      :export-params="exportParams"
      :status-buttons-mode="'buttons'"
      :status-confirm="false"
      :delete-confirm="false"
      :table-data="data"
      @refresh="handleRefresh"
      @column-change="handleColumnChange"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    >
      <template #toolbar-left>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增规则</el-button>
        <!-- 说明提示 -->
        <div class="description">
          <el-alert title="说明：物料编码规则用于定义料框ID的生成规则及二维码内容。系统将根据配置的规则自动生成料框ID。" type="info" :closable="false" show-icon />
        </div>
        <slot name="toolbar-left" />
      </template>

      <template #toolbar-right>
        <slot name="toolbar-right" />
      </template>
    </table-toolbar>

    <el-table
      v-loading="loading"
      :data="data"
      border
      highlight-current-row
      :fit="true"
      style="width: 100%"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" align="center" />

      <template v-for="col in tableColumns">
        <el-table-column :key="col.prop" v-bind="col" show-overflow-tooltip align="center">
          <template slot-scope="scope">
            <!-- 规则类型列使用Tag组件 -->
            <template v-if="col.prop === 'type'">
              <el-tag :type="getTagTypeByRuleType(scope.row.type)" size="small">
                {{ formatRuleType(scope.row.type) }}
              </el-tag>
            </template>
            <!-- 是否默认列使用Tag组件 -->
            <template v-else-if="col.prop === 'isDefault'">
              <el-tag :type="scope.row.isDefault ? 'success' : 'info'" size="small">
                {{ scope.row.isDefault ? '是' : '否' }}
              </el-tag>
            </template>
            <template v-else-if="col.formatter">
              {{ col.formatter(scope.row[col.prop], scope.row) }}
            </template>
            <template v-else-if="scope.row[col.prop] !== undefined && scope.row[col.prop] !== null">
              {{ scope.row[col.prop] }}
            </template>
            <template v-else>
              -
            </template>
          </template>
        </el-table-column>
      </template>

      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template slot-scope="scope">
          <!-- 使用ActionButtons组件替代原来的按钮组 -->
          <action-buttons
            :buttons="getActionButtons(scope.row)"
            mode="text"
            :row="scope.row"
            @click="handleActionClick"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      @pagination="handlePagination"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import TableToolbar from '@/components/TableToolbar'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import { generateTableButtons } from '@/components/ActionButtons/presets'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'
import { setDefaultCodeRule } from '@/api/master-data/material-code'

export default {
  name: 'CodeRuleTable',
  components: {
    Pagination,
    TableToolbar,
    ActionButtons,
    StatusTag
  },
  mixins: [columnSettingsMixin],
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 总记录数
    total: {
      type: Number,
      default: 0
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 当前页码
    page: {
      type: Number,
      default: 1
    },
    // 每页显示条数
    limit: {
      type: Number,
      default: 10
    },
    // 导入API
    importApi: {
      type: String,
      default: '/mes/master-data/material-code/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/mes/master-data/material-code/template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/mes/master-data/material-code/export'
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 列设置存储键前缀
      columnSettingsKeyPrefix: 'material_code_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 默认显示的列
      visibleColumnsList: [
        'id', 'name', 'type', 'prefix', 'sequenceLength', 'isDefault', 'createTime'
      ]
    }
  },
  computed: {
    // 列设置存储键
    currentStorageKey() {
      return `${this.columnSettingsKeyPrefix}`
    },

    // 导入API函数
    importApiFunction() {
      return (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return request({
          url: this.importApi,
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
    },

    // 模板API函数
    templateApiFunction() {
      return () => {
        return request({
          url: this.templateApi,
          method: 'get',
          responseType: 'blob'
        })
      }
    },

    // 导出API函数
    exportApiFunction() {
      return (params) => {
        return request({
          url: this.exportApi,
          method: 'post',
          data: params,
          responseType: 'blob'
        })
      }
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
    this.initCodeRuleColumns()
    this.updateExportParams()
  },
  methods: {
    // 获取操作按钮配置
    getActionButtons(row) {
      // 基本按钮：编辑
      const buttons = generateTableButtons(['edit'])

      // 设为默认按钮（仅当规则不是默认时显示）
      if (!row.isDefault) {
        const setDefaultButton = {
          text: '设为默认',
          action: 'setDefault',
          icon: 'el-icon-star-off',
          type: 'text',
          class: 'action-set-default',
          tooltip: '设为默认规则'
        }
        buttons.push(setDefaultButton)
      }

      return buttons
    },

    // 处理按钮点击事件
    handleActionClick({ action, row }) {
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'setDefault':
          this.handleSetDefault(row)
          break
      }
    },

    // 初始化列配置
    initCodeRuleColumns() {
      // 规则表格列
      const columns = [
        { prop: 'id', label: '编号', width: '80' },
        { prop: 'name', label: '规则名称', minWidth: '120' },
        { prop: 'type', label: '规则类型', width: '120' },
        { prop: 'prefix', label: '前缀', width: '100', formatter: (val) => val || '-' },
        {
          prop: 'sequenceLength',
          label: '序列号长度',
          width: '100',
          formatter: (val, row) => {
            if (row.type === 'custom') return '-'
            return val
          }
        },
        {
          prop: 'currentValue',
          label: '当前值',
          width: '100',
          formatter: (val, row) => {
            if (row.type === 'custom') return '-'
            return val
          }
        },
        {
          prop: 'stepValue',
          label: '步长',
          width: '80',
          formatter: (val, row) => {
            if (row.type === 'custom') return '-'
            return val
          }
        },
        {
          prop: 'customRule',
          label: '自定义规则',
          minWidth: '150',
          formatter: (val, row) => {
            if (row.type !== 'custom') return '-'
            return val || '无'
          }
        },
        { prop: 'qrCodeContent', label: '二维码内容', width: '120' },
        { prop: 'qrCodeSize', label: '二维码尺寸', width: '100' },
        { prop: 'errorCorrectionLevel', label: '纠错级别', width: '100' },
        { prop: 'isDefault', label: '是否默认', width: '100' },
        {
          prop: 'createTime',
          label: '创建时间',
          width: '160',
          formatter: this.formatDate
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: '160',
          formatter: this.formatDate
        }
      ]

      // 设置所有列
      this.allColumns = columns

      // 从本地存储加载列设置
      this.loadColumnSettings()

      // 如果没有可见列设置，使用默认值
      if (!this.internalVisibleColumns || this.internalVisibleColumns.length === 0) {
        this.internalVisibleColumns = [...this.visibleColumnsList]
      }
    },

    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        columns: this.internalVisibleColumns
      }
    },

    // 格式化规则类型
    formatRuleType(type) {
      const map = {
        pure_numeric: '纯数字流水号',
        prefix_numeric: '前缀+流水号',
        custom: '自定义规则'
      }
      return map[type] || type
    },

    // 根据规则类型获取Tag类型
    getTagTypeByRuleType(type) {
      const map = {
        pure_numeric: 'warning',
        prefix_numeric: 'success',
        custom: 'info'
      }
      return map[type] || ''
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-'

      try {
        const d = new Date(date)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      } catch (e) {
        return date || '-'
      }
    },

    // 行样式
    tableRowClassName({ row }) {
      return ''
    },

    // 选择行变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    // 新增按钮点击事件
    handleAdd() {
      this.$emit('create')
    },

    // 编辑按钮点击事件
    handleUpdate(row) {
      this.$emit('update', row)
    },

    // 设为默认规则
    handleSetDefault(row) {
      this.$confirm('确认将该规则设置为默认规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用设置默认规则API
        setDefaultCodeRule(row.id)
          .then(() => {
            this.$message.success('设置成功')
            // 触发父组件刷新列表
            this.$emit('refresh')
          })
          .catch(error => {
            console.error('设置默认规则失败:', error)
            this.$message.error('设置默认规则失败，请重试')
          })
      }).catch(() => {
        // 用户取消操作，不做任何处理
      })
    },

    // 分页变化
    handlePagination({ page, limit }) {
      this.$emit('pagination', { page, limit })
    },

    // 刷新表格
    handleRefresh() {
      this.$emit('refresh')
    },

    // 批量删除
    handleBatchDelete(rows) {
      this.$emit('batch-delete', rows || this.selectedRows)
    },

    // 批量启用
    handleBatchEnable(rows) {
      this.$emit('batch-enable', rows || this.selectedRows)
    },

    // 批量禁用
    handleBatchDisable(rows) {
      this.$emit('batch-disable', rows || this.selectedRows)
    },

    // 导入成功
    handleImportSuccess(result) {
      this.$emit('import-success', result)
      this.handleRefresh()
    },

    // 导出成功
    handleExportSuccess(result) {
      this.$emit('export-success', result)
    }
  }
}
</script>

<style lang="scss">
.code-rule-table {
  margin-bottom: 20px;

  .el-table {
    .cell {
      padding: 0 5px;
    }

    td {
      padding: 8px 0;
    }

    // 设置表格最小宽度，防止列过少时表格太窄
    min-width: 100%;

    table {
      width: 100% !important;
    }
  }

  .action-set-default {
    color: #e6a23c;
  }
}
</style>
