<template>
  <el-card shadow="hover" class="table-card">
    <el-table
      v-loading="loading"
      :data="data"
      element-loading-text="加载中..."
      border
      fit
      highlight-current-row
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="code" label="库位编码" width="120" align="center" />
      <el-table-column prop="name" label="库位名称" width="180" show-overflow-tooltip />
      <el-table-column prop="warehouseName" label="所属仓库" width="120" align="center" />
      <el-table-column label="库位类型" width="100" align="center">
        <template slot-scope="{row}">
          {{ getLocationTypeName(row.locationType) }}
        </template>
      </el-table-column>
      <el-table-column label="位置描述" width="180" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ row.locationDesc || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column label="尺寸(cm)" width="120" align="center">
        <template slot-scope="{row}">
          {{ row.dimension || '未设置' }}
        </template>
      </el-table-column>
      <el-table-column label="容量" width="220">
        <template slot-scope="{row}">
          <el-progress :percentage="getCapacityPercentage(row)" :status="getCapacityStatus(row)">
            <span>{{ row.occupiedCapacity }} / {{ row.capacity }}</span>
          </el-progress>
        </template>
      </el-table-column>
      <el-table-column prop="maxWeight" label="最大承重(kg)" width="120" align="center" />
      <el-table-column label="允许混放" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.allowMixed ? 'success' : 'info'" effect="plain" size="small">
            {{ row.allowMixed ? '允许' : '不允许' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" width="180" show-overflow-tooltip>
        <template slot-scope="{row}">
          {{ row.remarks || '无' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="dark" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="$emit('update', row)">编辑</el-button>
          <el-button
            :type="row.status === 1 ? 'warning' : 'success'"
            size="mini"
            :icon="row.status === 1 ? 'el-icon-close' : 'el-icon-check'"
            @click="$emit('status-change', row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        background
        :current-page.sync="currentPage"
        :page-sizes="[10, 20, 30, 50]"
        :page-size.sync="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script>
/**
 * 库位数据表格组件
 * 功能描述：展示库位数据，提供分页、编辑和状态管理功能
 * 创建日期：2023-09-01
 */
export default {
  name: 'LocationTable',
  props: {
    // 表格数据
    data: {
      type: Array,
      required: true
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
    // 每页条数
    limit: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      // 当前页码和每页条数的本地副本，用于.sync绑定
      currentPage: this.page,
      pageSize: this.limit,
      
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
  watch: {
    // 监听父组件传入的页码和每页条数变化
    page(val) {
      this.currentPage = val
    },
    limit(val) {
      this.pageSize = val
    }
  },
  methods: {
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
    
    // 处理多选变化
    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
    },
    
    // 处理每页条数变化
    handleSizeChange(val) {
      this.$emit('size-change', val)
    },
    
    // 处理页码变化
    handleCurrentChange(val) {
      this.$emit('current-change', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.table-card {
  margin-bottom: 24px;
  border-radius: 8px;
  
  .text-muted {
    color: #909399;
    font-style: italic;
  }
  
  .pagination-container {
    margin-top: 24px;
    text-align: right;
  }
  
  ::v-deep .el-table {
    border-radius: 4px;
    overflow: hidden;
  }
}
</style> 