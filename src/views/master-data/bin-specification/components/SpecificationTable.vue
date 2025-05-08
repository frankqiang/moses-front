<template>
  <div class="specification-table">
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
      <el-table-column prop="code" label="规格代码" width="120" align="center" />
      <el-table-column prop="name" label="规格名称" width="150" />
      <el-table-column label="尺寸(cm)" width="180">
        <template slot-scope="{row}">
          {{ row.length }} × {{ row.width }} × {{ row.height }}
        </template>
      </el-table-column>
      <el-table-column prop="maxWeight" label="最大载重(kg)" width="120" align="center" />
      <el-table-column prop="material" label="材质" width="120" />
      <el-table-column prop="maxStackLayers" label="最大堆叠层数" width="120" align="center" />
      <el-table-column label="适用产品类型" min-width="200">
        <template slot-scope="{row}">
          <el-tag
            v-for="product in row.applicableProducts"
            :key="product.id"
            size="small"
            effect="plain"
            style="margin-right: 8px; margin-bottom: 5px; border-radius: 4px;"
          >
            {{ product.name }}
          </el-tag>
          <span v-if="!row.applicableProducts || row.applicableProducts.length === 0" class="text-muted">无</span>
        </template>
      </el-table-column>
      <el-table-column prop="supplier" label="供应商" width="150" />
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

    <!-- 使用全局分页组件 -->
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
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'SpecificationTable',
  components: {
    Pagination
  },
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
      pageSize: this.limit
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
    // 处理多选变化
    handleSelectionChange(selection) {
      this.$emit('selection-change', selection)
    },
    
    // 处理分页变化
    handlePagination({ page, limit }) {
      // 滚动到页面顶部
      scrollTo(0, 800)
      
      // 直接发送pagination事件给父组件，让父组件处理分页变化
      this.$emit('pagination', { page, limit })
    },
    
    // 返回顶部方法，供外部调用
    backToTop() {
      scrollTo(0, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.specification-table {
  margin-bottom: 24px;
  
  .text-muted {
    color: #909399;
    font-style: italic;
  }
  
  ::v-deep .el-table {
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;
  }
}
</style> 