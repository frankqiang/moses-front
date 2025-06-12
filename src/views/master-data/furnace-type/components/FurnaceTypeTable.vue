/**
 * 炉型表格组件
 * 功能描述：展示炉型列表数据，提供分页、选择、操作功能，支持动态列显示及持久化设置
 * 功能增强：支持批量操作、导入导出等高级功能
 * 创建日期：2024-11-16
 */
<template>
  <div class="furnace-type-table">
    <!-- 使用全局表格工具栏组件 -->
    <table-toolbar
      :enable-column-settings="true"
      :column-options="columnOptions"
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
      :delete-confirm="true"
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增炉型</el-button>
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
      <el-table-column type="selection" width="45" align="center" fixed="left" />
      <el-table-column label="#" type="index" width="50" align="center" fixed="left" />

      <el-table-column
        v-for="col in tableColumns"
        :key="col.prop"
        v-bind="col"
        show-overflow-tooltip
        align="center"
      >
        <template slot-scope="scope">
          <!-- 使用StatusTag组件展示状态列 -->
          <template v-if="col.prop === 'status'">
            <StatusTag
              :status="scope.row.status"
              :text-map="statusTextMap"
              :type-map="statusTypeMap"
            />
          </template>

          <!-- 炉型能力参数显示 -->
          <template v-else-if="col.prop === 'hasRearCirculationFan'">
            <el-tag v-if="scope.row.hasRearCirculationFan" type="success">
              支持
            </el-tag>
            <el-tag v-else type="info">
              不支持
            </el-tag>
          </template>

          <template v-else-if="col.prop === 'hasVacuumFan'">
            <el-tag v-if="scope.row.hasVacuumFan" type="success">
              支持
            </el-tag>
            <el-tag v-else type="info">
              不支持
            </el-tag>
          </template>

          <template v-else-if="col.prop === 'hasPurgeValve'">
            <el-tag v-if="scope.row.hasPurgeValve" type="success">
              支持
            </el-tag>
            <el-tag v-else type="info">
              不支持
            </el-tag>
          </template>

          <template v-else-if="col.prop === 'hasCoolingFan'">
            <el-tag v-if="scope.row.hasCoolingFan" type="success">
              支持
            </el-tag>
            <el-tag v-else type="info">
              不支持
            </el-tag>
          </template>

          <template v-else-if="col.prop === 'hasPressureControl'">
            <el-tag v-if="scope.row.hasPressureControl" type="success">
              支持
            </el-tag>
            <el-tag v-else type="info">
              不支持
            </el-tag>
          </template>

          <template v-else-if="col.prop === 'maxSegments'">
            <span>{{ scope.row.maxSegments || '-' }}</span>
          </template>

          <template v-else-if="col.prop === 'maxTemperatureLimit'">
            <span>{{ scope.row.maxTemperatureLimit || '-' }}°C</span>
          </template>

          <template v-else-if="col.prop === 'supportedAtmosphereTypes'">
            <overflow-tags-popover
              :data="scope.row.supportedAtmosphereTypes"
              :max-show="1"
              title="支持的气氛类型"
            />
          </template>

          <!-- 关联设备列表 -->
          <template v-else-if="col.prop === 'relatedEquipment'">
            <overflow-tags-popover
              :data="scope.row.relatedEquipment || []"
              :max-show="1"
              label-key="name"
              title="关联设备列表"
            />
          </template>

          <!-- 关联工艺模板列表 -->
          <template v-else-if="col.prop === 'relatedTemplates'">
            <overflow-tags-popover
              :data="scope.row.relatedTemplates || []"
              :max-show="1"
              label-key="templateName"
              title="关联工艺模板列表"
            />
          </template>

          <!-- 其他列的默认渲染 -->
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

      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template slot-scope="scope">
          <!-- 使用ActionButtons组件替代原来的按钮组 -->
          <ActionButtons
            :buttons="getActionButtons(scope.row)"
            mode="text"
            :row="scope.row"
            @click="handleActionClick"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-show="total > 0"
      :total="total"
      :page.sync="currentPage"
      :limit.sync="pageSize"
      @pagination="handlePagination"
    />

  </div>
</template>

<script>
import { getFurnaceTypeList, deleteFurnaceType, updateFurnaceTypeStatus, getRelatedEquipment, getRelatedTemplates } from '@/api/master-data/furnace-type'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import TableToolbar from '@/components/TableToolbar'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import Pagination from '@/components/Pagination'
import request from '@/utils/request'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'

export default {
  name: 'FurnaceTypeTable',
  components: {
    StatusTag,
    ActionButtons,
    TableToolbar,
    Pagination,
    OverflowTagsPopover
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
      default: '/vue-admin-template/mes/furnace-type/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/vue-admin-template/mes/furnace-type/download-template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/vue-admin-template/mes/furnace-type/export'
    }
  },
  data() {
    return {
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'furnace_type_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 当前页码
      currentPage: 1,
      // 每页条数
      pageSize: 10,

      // 状态文本映射
      statusTextMap: {
        'enabled': '启用',
        'disabled': '禁用'
      },
      // 状态类型映射
      statusTypeMap: {
        'enabled': 'success',
        'disabled': 'info'
      },
      // 设备状态文本映射
      equipmentStatusTextMap: {
        'enabled': '启用',
        'disabled': '禁用',
        'maintenance': '维修中'
      },
      // 设备状态类型映射
      equipmentStatusTypeMap: {
        'enabled': 'success',
        'disabled': 'info',
        'maintenance': 'warning'
      },
      // 工艺模板状态文本映射
      templateStatusTextMap: {
        'draft': '草稿',
        'pending': '待审批',
        'effective': '生效',
        'history': '历史'
      },
      // 工艺模板状态类型映射
      templateStatusTypeMap: {
        'draft': 'info',
        'pending': 'warning',
        'effective': 'success',
        'history': 'danger'
      }
    }
  },
  computed: {
    // 所有可用列
    columnOptions() {
      return [
        { prop: 'furnaceTypeCode', label: '炉型代码', width: '150' },
        { prop: 'furnaceTypeName', label: '炉型名称', width: '150' },
        { prop: 'status', label: '状态', width: '80' },
        { prop: 'hasRearCirculationFan', label: '后区循环风机', width: '110' },
        { prop: 'hasVacuumFan', label: '负压风机', width: '100' },
        { prop: 'hasPurgeValve', label: '吹洗阀', width: '100' },
        { prop: 'hasCoolingFan', label: '冷却风机', width: '100' },
        { prop: 'hasPressureControl', label: '压力控制', width: '100' },
        { prop: 'maxSegments', label: '最大工艺段数', width: '120' },
        { prop: 'maxTemperatureLimit', label: '温度上限(°C)', width: '120' },
        { prop: 'supportedAtmosphereTypes', label: '支持的气氛类型', width: '150' },
        { prop: 'relatedEquipment', label: '关联设备', width: '200' },
        { prop: 'relatedTemplates', label: '关联工艺模板' },
        { prop: 'description', label: '描述', width: '200' },
        { prop: 'createdBy', label: '创建人', width: '100' },
        { prop: 'createdAt', label: '创建时间', width: '150' },
        { prop: 'updatedBy', label: '更新人', width: '100' },
        { prop: 'updatedAt', label: '更新时间', width: '150' }
      ]
    },
    // 覆盖mixin中的默认可见列
    defaultVisibleColumns() {
      return ['furnaceTypeCode', 'furnaceTypeName', 'status', 'hasRearCirculationFan', 'hasVacuumFan', 'hasPurgeValve', 'hasCoolingFan', 'maxSegments', 'maxTemperatureLimit', 'relatedEquipment', 'relatedTemplates']
    },
    // 重写列设置存储键
    currentStorageKey() {
      return `${this.columnSettingsKeyPrefix}_${this.$options.name || 'common'}`
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
    },
    // 表格列配置 - 确保有这个计算属性，修复表格无数据的问题
    tableColumns() {
      // 使用mixin中提供的方法筛选可见列
      if (!this.allColumns || this.allColumns.length === 0) {
        // 如果allColumns还没初始化，先使用columnOptions初始化
        return this.columnOptions.filter(col => this.internalVisibleColumns.includes(col.prop))
      }
      return this.allColumns.filter(col => this.internalVisibleColumns.includes(col.prop))
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
    },
    data: {
      handler(newVal) {
        console.log('FurnaceTypeTable接收到数据:', newVal)
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    // 初始化导出参数
    this.updateExportParams()

    // 初始化列配置 - 使用columnOptions初始化allColumns
    this.allColumns = this.columnOptions

    // 设置初始可见列
    this.internalVisibleColumns = [...this.defaultVisibleColumns]

    // 尝试从localStorage读取用户设置的可见列
    const savedColumns = localStorage.getItem(this.currentStorageKey)
    if (savedColumns) {
      try {
        this.internalVisibleColumns = JSON.parse(savedColumns)
      } catch (e) {
        console.error('解析保存的列设置失败:', e)
      }
    }

    // 打印调试信息
    console.log('FurnaceTypeTable初始化完成:', {
      allColumns: this.allColumns,
      internalVisibleColumns: this.internalVisibleColumns,
      tableColumns: this.tableColumns
    })
  },
  methods: {
    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        // 可添加固定的导出参数
      }
    },

    // 处理分页事件
    handlePagination({ page, limit }) {
      this.$emit('size-change', limit)
      this.$emit('current-change', page)
    },

    // 处理刷新事件
    handleRefresh() {
      this.$emit('refresh')
    },

    // 处理列变更事件
    handleColumnChange(columns) {
      this.internalVisibleColumns = columns
      // 保存列设置到localStorage
      localStorage.setItem(this.currentStorageKey, JSON.stringify(columns))
    },

    // 处理选择变更事件
    handleSelectionChange(selection) {
      this.selectedRows = selection
      this.$emit('selection-change', selection)
    },

    // 处理新增事件
    handleAdd() {
      this.$emit('add')
    },

    // 处理批量删除事件
    handleBatchDelete(rows) {
      if (!rows || rows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }

      this.$confirm('确认批量删除选中的记录吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('batch-delete', rows)
      }).catch(() => {
        this.$message.info('已取消删除操作')
      })
    },

    // 处理批量启用事件
    handleBatchEnable(rows) {
      this.$emit('batch-enable', rows)
    },

    // 处理批量禁用事件
    handleBatchDisable(rows) {
      this.$emit('batch-disable', rows)
    },

    // 处理导入成功事件
    handleImportSuccess(response) {
      this.$emit('import-success', response)
    },

    // 处理导出成功事件
    handleExportSuccess() {
      this.$emit('export-success')
    },

    // 获取操作按钮配置
    getActionButtons(row) {
      if (!row) {
        console.warn('行数据为空，无法生成操作按钮')
        return []
      }

      const buttons = []

      // 添加常规操作按钮
      buttons.push({
        text: '编辑',
        action: 'edit',
        icon: 'el-icon-edit',
        type: 'text',
        tooltip: '编辑炉型信息'
      })

      buttons.push({
        text: '查看',
        action: 'view',
        icon: 'el-icon-view',
        type: 'text',
        tooltip: '查看炉型详情'
      })

      // 根据状态添加启用/禁用按钮
      if (row.status === 'enabled') {
        buttons.push({
          text: '禁用',
          action: 'disable',
          icon: 'el-icon-close',
          type: 'text',
          class: 'warning',
          tooltip: '禁用该炉型'
        })
      } else {
        buttons.push({
          text: '启用',
          action: 'enable',
          icon: 'el-icon-check',
          type: 'text',
          class: 'success',
          tooltip: '启用该炉型'
        })
      }

      // 删除按钮总是显示
      buttons.push({
        text: '删除',
        action: 'delete',
        icon: 'el-icon-delete',
        type: 'text',
        class: 'danger',
        tooltip: '删除炉型'
      })

      return buttons
    },

    // 处理按钮点击事件
    handleActionClick({ action, row }) {
      switch (action) {
        case 'edit':
          this.handleUpdate(row)
          break
        case 'view':
          this.handleView(row)
          break
        case 'delete':
          this.handleDelete(row)
          break
        case 'enable':
          this.handleEnable(row)
          break
        case 'disable':
          this.handleDisable(row)
          break
      }
    },

    // 处理编辑
    handleUpdate(row) {
      this.$emit('update', row)
    },

    // 处理查看
    handleView(row) {
      this.$emit('view', row)
    },

    // 处理删除
    handleDelete(row) {
      this.$confirm('此操作将永久删除该炉型, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('delete', row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // 处理启用
    handleEnable(row) {
      this.$emit('enable', row)
    },

    // 处理禁用
    handleDisable(row) {
      this.$emit('disable', row)
    },

    // 表格行样式
    tableRowClassName({ row }) {
      if (row.status === 'disabled') {
        return 'row-disabled'
      }
      return ''
    },

    // 设置搜索参数
    setSearchParams(params) {
      this.searchParams = { ...params }
      this.currentPage = 1 // 重置为第一页
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.furnace-type-table {
  .row-disabled {
    color: #c0c4cc;
  }

  .atmosphere-list {
    .atmosphere-list-header {
      font-weight: bold;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
    }

    .atmosphere-list-item {
      padding: 4px 0;
      border-bottom: 1px dashed #ebeef5;

      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
