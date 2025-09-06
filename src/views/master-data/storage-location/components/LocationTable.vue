/**
 * 库位表格组件（新版）
 * 功能描述：展示库位数据，提供分页、编辑和状态管理功能，支持动态列显示及持久化设置
 * 功能增强：支持批量操作、导入导出等高级功能
 * 创建日期：2023-09-01
 */
<template>
  <div class="location-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="allColumns"
      :storage-key="currentStorageKey"
      :default-visible-columns="defaultVisibleColumns"
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增库位</el-button>
        <slot name="toolbar-left" />
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
      <el-table-column type="selection" width="45" align="center" fixed="left" />
      <el-table-column label="#" type="index" width="50" align="center" />

      <template v-for="col in tableColumns">
        <el-table-column
          :key="col.prop"
          v-bind="col"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <!-- 使用StatusTag组件展示状态列 -->
            <template v-if="col.prop === 'status'">
              <status-tag
                :status="scope.row.status === null || scope.row.status === undefined ? '' : scope.row.status"
                :text-map="statusTextMap"
                :type-map="statusTypeMap"
                :default-text="'未知'"
              />
            </template>
            <!-- 处理库位类型列 -->
            <template v-else-if="col.prop === 'locationType'">
              {{ getLocationTypeName(scope.row.locationType) }}
            </template>
            <!-- 处理允许混放列 -->
            <template v-else-if="col.prop === 'allowMixed'">
              <el-tag :type="scope.row.allowMixed ? 'success' : 'info'" effect="plain" size="small">
                {{ scope.row.allowMixed ? '允许' : '不允许' }}
              </el-tag>
            </template>
            <!-- 处理尺寸列 -->
            <template v-else-if="col.prop === 'dimension'">
              {{ scope.row.dimension || '-' }}
            </template>
            <!-- 处理容量列 -->
            <template v-else-if="col.prop === 'capacity'">
              <div class="capacity-info">
                <el-progress
                  :percentage="getCapacityPercentage(scope.row)"
                  :status="getCapacityStatus(scope.row)"
                  :format="() => ''"
                  class="capacity-progress"
                />
                <div class="capacity-details">
                  <div class="capacity-row">
                    <span class="label">总容量：</span>
                    <span class="value">{{ scope.row.capacity }}</span>
                  </div>
                  <div class="capacity-row">
                    <span class="label">已使用：</span>
                    <span class="value">{{ scope.row.occupiedCapacity }}</span>
                    <span class="percentage">({{ getCapacityPercentage(scope.row) }}%)</span>
                  </div>
                  <div class="capacity-row">
                    <span class="label">剩余：</span>
                    <span class="value">{{ scope.row.capacity - scope.row.occupiedCapacity }}</span>
                  </div>
                </div>
              </div>
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
            :show-tooltip="false"
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
/**
 * 库位数据表格组件
 * 功能描述：展示库位数据，提供分页、编辑和状态管理功能
 * 创建日期：2023-09-01
 */
import Pagination from '@/components/Pagination'
import TableToolbar from '@/components/TableToolbar'
import ActionButtons from '@/components/ActionButtons'
import StatusTag from '@/components/StatusTag'
import { generateTableButtons } from '@/components/ActionButtons/presets'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'LocationTable',
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
      default: '/api/master-data/storage-location/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/api/master-data/storage-location/template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/api/master-data/storage-location/export'
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'storage_location_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 状态文本映射
      statusTextMap: {
        0: '禁用',
        1: '启用'
      },
      // 状态类型映射
      statusTypeMap: {
        0: 'info',
        1: 'success'
      },
      // 库位类型映射
      locationTypeMap: {
        'STORAGE': '存储区',
        'RECEIVING': '收货区',
        'SHIPPING': '发货区',
        'STAGING': '暂存区',
        'QC': '质检区'
      }
    }
  },
  computed: {
    // 重写列设置存储键
    currentStorageKey() {
      return this.columnSettingsKeyPrefix
    },

    // 默认显示的列
    defaultVisibleColumns() {
      return ['code', 'name', 'warehouseName', 'locationType', 'capacity', 'status']
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
    this.initLocationColumns()
    this.updateExportParams()
  },
  methods: {
    // 获取操作按钮配置
    getActionButtons(row) {
      // 检查 row 是否存在，避免访问 undefined 对象的属性
      if (!row) {
        return generateTableButtons(['edit'])
      }

      // 使用预设按钮生成操作按钮，去掉tooltip提示
      const buttons = generateTableButtons(['edit']).map(button => ({
        ...button,
        tooltip: undefined
      }))

      // 添加状态切换按钮
      const statusButton = {
        text: row.status === 1 ? '禁用' : '启用',
        action: 'statusToggle',
        icon: row.status === 1 ? 'el-icon-close' : 'el-icon-check',
        type: 'text',
        class: row.status === 1 ? 'status-disable' : 'status-enable'
      }

      return buttons.concat([statusButton])
    },

    // 处理按钮点击事件
    handleActionClick({ action, row }) {
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'statusToggle':
          this.handleStatusChange(row)
          break
      }
    },

    // 初始化库位列配置
    initLocationColumns() {
      // 库位列
      const columns = [
        { prop: 'code', label: '库位编码', width: '120', align: 'center' },
        { prop: 'name', label: '库位名称', width: '180' },
        { prop: 'warehouseName', label: '所属仓库', width: '120', align: 'center' },
        { prop: 'locationType', label: '库位类型', width: '100', align: 'center' },
        { prop: 'locationDesc', label: '位置描述', width: '180' },
        { prop: 'dimension', label: '尺寸(cm)', width: '120', align: 'center',
          formatter: (val) => val || '-' },
        { prop: 'capacity', label: '容量', width: '280' },
        { prop: 'maxWeight', label: '最大承重(kg)', width: '120', align: 'center' },
        { prop: 'allowMixed', label: '允许混放', width: '100', align: 'center' },
        { prop: 'remarks', label: '备注', width: '180' },
        { prop: 'status', label: '状态', width: '80', align: 'center' }
      ]

      // 初始化列
      this.initColumns(columns)
    },

    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        columns: this.internalVisibleColumns
      }
    },

    // 获取库位类型名称
    getLocationTypeName(type) {
      return this.locationTypeMap[type] || type
    },

    // 计算容量使用百分比
    getCapacityPercentage(row) {
      if (!row.capacity || row.capacity <= 0) return 0
      return Math.round((row.occupiedCapacity / row.capacity) * 100)
    },

    // 根据容量使用百分比获取状态
    getCapacityStatus(row) {
      const percentage = this.getCapacityPercentage(row)
      if (percentage >= 90) return 'exception'
      if (percentage >= 70) return 'warning'
      return 'success'
    },

    // 行样式
    tableRowClassName({ row }) {
      if (row.status === 0) {
        return 'disabled-row'
      }
      return ''
    },

    // 选择行变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    // 新增按钮点击事件
    handleAdd() {
      this.$emit('add')
    },

    // 编辑按钮点击事件
    handleUpdate(row) {
      this.$emit('update', row)
    },

    // 状态切换按钮点击事件
    handleStatusChange(row) {
      this.$emit('status-change', row)
    },

    // 分页变化
    handlePagination({ page, limit }) {
      // 滚动到顶部
      scrollTo(0, 800)

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
    },

    // 返回顶部方法，供外部调用
    backToTop() {
      scrollTo(0, 800)
    }
  }
}
</script>

<style lang="scss">
.location-table {
  margin-bottom: 20px;

  .disabled-row {
    background-color: #f9f9f9;
    color: #909399;
  }

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
}

.capacity-info {
  display: flex;
  align-items: center;

  .capacity-progress {
    width: 120px;
    margin-right: 10px;
  }

  .capacity-details {
    flex: 1;
    font-size: 12px;

    .capacity-row {
      display: flex;
      align-items: center;
      margin-bottom: 2px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #909399;
        width: 60px;
      }

      .value {
        font-weight: bold;
      }

      .percentage {
        margin-left: 5px;
        color: #909399;
      }
    }
  }
}
</style>
