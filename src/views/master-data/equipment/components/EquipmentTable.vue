/**
 * 设备表格组件（新版）
 * 功能描述：展示设备列表数据，提供分页、选择、操作功能，支持不同设备类型的动态列显示及持久化设置
 * 功能增强：支持批量操作、导入导出等高级功能
 * 创建日期：2023-11-15
 * 更新日期：2024-10-27
 */
<template>
  <div class="equipment-table">
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
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增设备</el-button>
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

      <template v-for="col in tableColumns">
        <el-table-column
          :key="col.prop"
          v-bind="col"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            <!-- 使用StatusTag组件展示状态列 -->
            <template v-if="col.prop === 'status'">
              <status-tag
                :status="scope.row.status"
                :text-map="statusTextMap"
                :type-map="statusTypeMap"
              />
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

      <el-table-column label="操作" width="230" align="center" fixed="right">
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
import { CommonButtons, generateTableButtons } from '@/components/ActionButtons/presets'
import { enabledStatusMap } from '@/components/StatusTag/types'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import request from '@/utils/request'

export default {
  name: 'EquipmentTable',
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
    // 设备类型
    equipmentType: {
      type: String,
      required: true
    },
    // 导入API
    importApi: {
      type: String,
      default: '/api/equipment/import'
    },
    // 导入模板API
    templateApi: {
      type: String,
      default: '/api/equipment/template'
    },
    // 导出API
    exportApi: {
      type: String,
      default: '/api/equipment/export'
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 重写列设置存储键前缀
      columnSettingsKeyPrefix: 'equipment_columns',
      // 导出参数
      exportParams: {},
      // 选中的行
      selectedRows: [],
      // 状态文本映射
      statusTextMap: enabledStatusMap.textMap,
      // 状态类型映射
      statusTypeMap: enabledStatusMap.typeMap
    }
  },
  computed: {
    // 重写列设置存储键
    currentStorageKey() {
      return `${this.columnSettingsKeyPrefix}_${this.equipmentType}`
    },

    // 导入API函数
    importApiFunction() {
      return (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('equipmentType', this.equipmentType)
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
          params: { equipmentType: this.equipmentType },
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
          data: { ...params, equipmentType: this.equipmentType },
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
    },
    // 监听设备类型变化，重新初始化列配置
    equipmentType: {
      handler() {
        this.initEquipmentColumns()
        this.updateExportParams()
      },
      immediate: true
    }
  },
  methods: {
    // 获取操作按钮配置
    getActionButtons(row) {
      // 创建自定义状态切换按钮
      const statusToggleButton = {
        text: row.status === 1 ? '禁用' : '启用',
        action: 'statusToggle',
        icon: row.status === 1 ? 'el-icon-close' : 'el-icon-check',
        type: 'text',
        class: row.status === 1 ? 'status-disable' : 'status-enable',
        tooltip: row.status === 1 ? '禁用' : '启用'
      }

      // 使用预设按钮生成操作按钮，并添加状态切换按钮
      return [statusToggleButton].concat(generateTableButtons(['edit', 'view']))
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
        case 'statusToggle':
          this.handleStatusChange(row)
          break
      }
    },

    // 初始化设备列配置
    initEquipmentColumns() {
      // 通用列
      const commonColumns = [
        { prop: 'equipmentId', label: '设备ID', width: '120' },
        { prop: 'name', label: '设备名称', width: '150' },
        { prop: 'model', label: '型号', width: '120' },
        { prop: 'installDate', label: '安装日期', width: '120', formatter: this.formatDate },
        { prop: 'supplier', label: '供应商', width: '120' }
      ]

      // 特定设备类型的列
      let specificColumns = []

      if (this.equipmentType === 'FURNACE') {
        specificColumns = [
          {
            prop: 'furnaceTypeCode',
            label: '所属炉型',
            width: '120',
            formatter: (value, row) => {
              if (row.furnaceTypeName) {
                return row.furnaceTypeCode
                  ? `${row.furnaceTypeName} (${row.furnaceTypeCode})`
                  : row.furnaceTypeName
              }
              return value || '-'
            }
          },
          {
            prop: 'capacity',
            label: '规格(容量)',
            width: '120',
            formatter: (value) => value ? `${value} T` : '-'
          },
          {
            prop: 'maxTemperature',
            label: '最大温度',
            width: '120',
            formatter: (value) => value ? `${value}°C` : '-'
          },
          {
            prop: 'ratedPower',
            label: '额定功率',
            width: '120',
            formatter: (value) => value ? `${value} kW` : '-'
          },
          {
            prop: 'plcAddress',
            label: 'PLC地址',
            width: '150'
          },
          {
            prop: 'maintenanceCycle',
            label: '维护周期',
            width: '100',
            formatter: (value) => value ? `${value}天` : '-'
          }
        ]
      } else if (this.equipmentType === 'CRANE') {
        specificColumns = [
          {
            prop: 'liftCapacity',
            label: '额定起重量',
            width: '120',
            formatter: (value) => value ? `${value} T` : '-'
          },
          {
            prop: 'movingSpeed',
            label: '运行速度',
            width: '150'
          },
          {
            prop: 'serviceArea',
            label: '服务范围',
            width: '150'
          },
          { prop: 'controlInterface', label: '控制接口', width: '150' }
        ]
      } else if (this.equipmentType === 'AUTO_CART') {
        specificColumns = [
          {
            prop: 'loadCapacity',
            label: '载重能力',
            width: '120',
            formatter: (value) => value ? `${value} T` : '-'
          },
          {
            prop: 'movingSpeed',
            label: '移动速度',
            width: '120',
            formatter: (value) => value ? `${value} m/min` : '-'
          },
          {
            prop: 'navigationMode',
            label: '导航方式',
            width: '120',
            formatter: (value) => {
              const modes = {
                'LASER': '激光导航',
                'MAGNETIC': '磁导航',
                'VISION': '视觉导航',
                'INERTIAL': '惯性导航'
              }
              return modes[value] || value || '-'
            }
          },
          {
            prop: 'chargingType',
            label: '充电类型',
            width: '120',
            formatter: (value) => {
              const types = {
                'AUTO': '自动充电',
                'MANUAL': '手动充电',
                'BATTERY_SWAP': '电池更换'
              }
              return types[value] || value || '-'
            }
          }
        ]
      } else if (this.equipmentType === 'STAGING_TABLE') {
        specificColumns = [
          {
            prop: 'bearingCapacity',
            label: '承载能力',
            width: '120',
            formatter: (value) => value ? `${value} T` : '-'
          },
          { prop: 'dimensions', label: '尺寸(m)', width: '120' },
          {
            prop: 'surfaceMaterial',
            label: '台面材质',
            width: '120',
            formatter: (value) => {
              const materials = {
                'CARBON_STEEL': '碳钢',
                'STAINLESS_STEEL': '不锈钢',
                'ALLOY_STEEL': '合金钢',
                'OTHER': '其他'
              }
              return materials[value] || value || '-'
            }
          },
          {
            prop: 'functionType',
            label: '功能类型',
            width: '120',
            formatter: (value) => {
              const types = {
                'FIXED': '固定式',
                'MOVABLE': '可移动式',
                'ADJUSTABLE_HEIGHT': '可调高度',
                'MULTI_FUNCTION': '多功能'
              }
              return types[value] || value || '-'
            }
          }
        ]
      }

      // 状态和时间列
      const endColumns = [
        {
          prop: 'status',
          label: '状态',
          width: '80',
          formatter: (value) => {
            const status = parseInt(value)
            return status === 1 ? '启用' : '禁用'
          }
        },
        {
          prop: 'updateTime',
          label: '更新时间',
          width: '120',
          formatter: this.formatDate
        },
        {
          prop: 'remarks',
          label: '备注',
          width: '150'
        }
      ]

      // 合并所有列并初始化
      this.initColumns([...commonColumns, ...specificColumns, ...endColumns])
    },

    // 更新导出参数
    updateExportParams() {
      this.exportParams = {
        equipmentType: this.equipmentType,
        columns: this.internalVisibleColumns
      }
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-'

      try {
        const d = new Date(date)
        return d.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\//g, '-')
      } catch (e) {
        return date || '-'
      }
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

    // 查看按钮点击事件
    handleView(row) {
      this.$emit('view', row)
    },

    // 分页变化
    handlePagination({ page, limit }) {
      this.$emit('size-change', limit)
      this.$emit('current-change', page)
    },

    // 刷新表格
    handleRefresh() {
      this.$emit('current-change', this.currentPage)
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
.equipment-table {
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

  .status-enable {
    color: #67c23a;
  }

  .status-disable {
    color: #f56c6c;
  }
}
</style>
