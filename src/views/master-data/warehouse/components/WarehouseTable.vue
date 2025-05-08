<template>
  <div class="warehouse-table">
    <el-table
      v-loading="loading"
      :data="data"
      border
      stripe
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="仓库编码" prop="code" width="150" show-overflow-tooltip />
      <el-table-column label="仓库名称" prop="name" width="180" show-overflow-tooltip />
      <el-table-column label="仓库类型" prop="warehouseTypeText" width="120" />
      <el-table-column label="仓库地址" prop="address" min-width="180" show-overflow-tooltip />
      <el-table-column label="面积(㎡)" prop="area" width="100" align="right" />
      <el-table-column label="负责人" prop="manager" width="100" />
      <el-table-column label="联系方式" prop="contact" width="130" />
      <el-table-column label="最大容量" prop="maxCapacity" width="100" align="right" />
      <el-table-column label="当前使用量" prop="currentUsage" width="100" align="right" />
      <el-table-column label="状态" prop="status" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="text"
            :type="scope.row.status === 1 ? 'danger' : 'success'"
            @click="handleStatusChange(scope.row)"
          >{{ scope.row.status === 1 ? '禁用' : '启用' }}</el-button>
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
 * 仓库表格组件
 * 功能描述：展示仓库列表数据，提供分页、选择、编辑、状态切换等功能
 * 创建日期：2023-11-01
 */
import Pagination from '@/components/Pagination'

export default {
  name: 'WarehouseTable',
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
    }
  },
  data() {
    return {
      // 当前页
      currentPage: 1,
      // 每页大小
      pageSize: 10,
      // 选中行数据
      selection: []
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
  methods: {
    // 选择行变化
    handleSelectionChange(selection) {
      this.selection = selection
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
    
    // 分页变化
    handlePagination({ page, limit }) {
      this.$emit('size-change', limit)
      this.$emit('current-change', page)
    }
  }
}
</script>

<style scoped>
.warehouse-table {
  margin-bottom: 20px;
}
</style> 