/**
 * 设备表格组件（新版）
 * 功能描述：展示设备列表数据，提供分页、选择、操作功能，支持不同设备类型的动态列显示及持久化设置
 * 创建日期：2023-11-15
 */
<template>
  <div class="equipment-table">
    <!-- 表格工具栏 -->
    <div class="table-toolbar">
      <slot name="toolbar-left"></slot>
      <div class="toolbar-right">
        <el-button
          size="mini"
          icon="el-icon-refresh"
          @click="handleRefresh"
        >
          刷新
        </el-button>
        <el-dropdown
          trigger="click"
          @command="handleColumnCommand"
          ref="columnDropdown"
        >
          <el-button size="mini">
            <i class="el-icon-s-operation"></i>
            列设置
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" class="column-dropdown">
            <div class="column-dropdown-header">
              <el-checkbox
                v-model="tempCheckAll"
                :indeterminate="tempIndeterminate"
                @change="handleTempCheckAllChange"
              >
                全选
              </el-checkbox>
              <div class="column-dropdown-actions">
                <el-button type="text" size="mini" @click="applyColumnSettings">应用</el-button>
                <el-button type="text" size="mini" @click="resetColumnSettings">重置</el-button>
              </div>
            </div>
            <el-dropdown-item divided></el-dropdown-item>
            <div class="column-item"
              v-for="col in allColumns" 
              :key="col.prop"
            >
              <el-checkbox 
                v-model="tempColumnVisibility[col.prop]"
                @change="handleTempColumnChange"
              >
                {{ col.label }}
              </el-checkbox>
            </div>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="data"
      border
      highlight-current-row
      :fit="true"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :row-class-name="tableRowClassName"
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
            <template v-if="col.formatter">
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

      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template slot-scope="scope">
          <el-tooltip content="编辑" placement="top">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
            />
          </el-tooltip>
          
          <el-tooltip :content="scope.row.status === 1 ? '禁用' : '启用'" placement="top">
            <el-button
              size="mini"
              type="text"
              :icon="scope.row.status === 1 ? 'el-icon-close' : 'el-icon-check'"
              :class="scope.row.status === 1 ? 'status-disable' : 'status-enable'"
              @click="handleStatusChange(scope.row)"
            />
          </el-tooltip>
          
          <el-tooltip content="查看" placement="top">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-view"
              @click="handleView(scope.row)"
            />
          </el-tooltip>
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

export default {
  name: 'EquipmentTable',
  components: {
    Pagination
  },
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
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 可见列
      visibleColumns: [],
      // 所有可用列
      allColumns: [],
      // 全选状态
      checkAll: true,
      // 临时列可见性状态 - 用于列设置下拉框
      tempColumnVisibility: {},
      // 临时全选状态 - 用于列设置下拉框
      tempCheckAll: true,
      // 临时半选状态 - 用于列设置下拉框
      tempIndeterminate: false,
      // 存储列设置的键名前缀
      localStorageKeyPrefix: 'equipment_visible_columns'
    }
  },
  computed: {
    // 表格列配置
    tableColumns() {
      return this.allColumns.filter(col => this.visibleColumns.includes(col.prop))
    },
    // 当前设备类型对应的存储键
    currentStorageKey() {
      return `${this.localStorageKeyPrefix}_${this.equipmentType}`
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
        this.initColumns()
      },
      immediate: true
    }
  },
  methods: {
    // 初始化列配置
    initColumns() {
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
          formatter: (value) => value === 1 ? '启用' : '禁用'
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

      // 合并所有列
      this.allColumns = [...commonColumns, ...specificColumns, ...endColumns]
      
      // 尝试从localStorage读取用户设置的可见列
      const savedColumns = localStorage.getItem(this.currentStorageKey);
      
      if (savedColumns) {
        try {
          this.visibleColumns = JSON.parse(savedColumns);
          this.checkAll = this.visibleColumns.length === this.allColumns.length;
        } catch (e) {
          console.error('解析保存的列设置失败:', e);
          this.resetToDefaultColumns();
        }
      } else {
        this.resetToDefaultColumns();
      }

      // 初始化临时列可见性状态
      this.initTempColumnVisibility();
    },

    // 重置为默认列配置
    resetToDefaultColumns() {
      this.visibleColumns = this.allColumns.map(col => col.prop);
      this.checkAll = true;
    },

    // 初始化临时列可见性状态
    initTempColumnVisibility() {
      const tempVisibility = {};
      this.allColumns.forEach(col => {
        tempVisibility[col.prop] = this.visibleColumns.includes(col.prop);
      });
      this.tempColumnVisibility = tempVisibility;
      this.updateTempCheckAllState();
    },

    // 更新临时全选状态
    updateTempCheckAllState() {
      const selectedCount = Object.values(this.tempColumnVisibility).filter(v => v).length;
      this.tempCheckAll = selectedCount === this.allColumns.length;
      this.tempIndeterminate = selectedCount > 0 && selectedCount < this.allColumns.length;
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
      this.$emit('selection-change', selection)
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

    // 列设置命令处理（预留，暂未使用）
    handleColumnCommand(command) {
      // 可以用于处理特殊列设置命令
    },

    // 临时列变化处理
    handleTempColumnChange() {
      this.updateTempCheckAllState();
    },

    // 临时全选变化处理
    handleTempCheckAllChange(val) {
      Object.keys(this.tempColumnVisibility).forEach(key => {
        this.tempColumnVisibility[key] = val;
      });
      this.tempIndeterminate = false;
    },

    // 应用列设置
    applyColumnSettings() {
      // 根据临时可见性设置更新可见列
      this.visibleColumns = this.allColumns
        .filter(col => this.tempColumnVisibility[col.prop])
        .map(col => col.prop);
      
      this.checkAll = this.visibleColumns.length === this.allColumns.length;
      
      // 保存设置到localStorage
      localStorage.setItem(this.currentStorageKey, JSON.stringify(this.visibleColumns));
      
      // 提示用户
      this.$message.success('列设置已应用');

      // 关闭下拉菜单
      this.$refs.columnDropdown.hide();
    },

    // 重置列设置
    resetColumnSettings() {
      this.resetToDefaultColumns();
      this.initTempColumnVisibility();
      
      // 清除localStorage中保存的设置
      localStorage.removeItem(this.currentStorageKey);
      
      // 提示用户
      this.$message.success('列设置已重置为默认');

      // 关闭下拉菜单
      this.$refs.columnDropdown.hide();
    }
  }
}
</script>

<style lang="scss">
.equipment-table {
  margin-bottom: 20px;
  
  .table-toolbar {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
  
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
  
  .el-button--text {
    padding: 2px 4px;
  }

  // 覆盖Element UI默认按钮间距
  .el-button + .el-button {
    margin-left: 0;
    margin: 0 10px;
  }
}

// 列设置下拉菜单样式
.el-dropdown-menu.column-dropdown {
  min-width: 180px;
  max-height: 800px;
  // overflow-y: auto;

  .column-dropdown-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 5px;
    background-color: #f5f7fa;
    
    .column-dropdown-actions {
      .el-button {
        padding: 2px 5px;
        margin-left: 8px;
      }
    }
  }
  
  .column-item {
    padding: 8px 16px;
    line-height: 1.5;
    cursor: pointer;
    
    .el-checkbox {
      width: 100%;
      display: flex;
      align-items: center;
      margin-right: 0;
    }

    &:hover {
      background-color: transparent;
    }
  }

  .el-dropdown-menu__item.divided {
    margin: 0;
    padding: 0;
    height: 1px;
  }
}
</style> 