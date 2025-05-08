<template>
  <div class="product-table">
    <el-table
      v-loading="loading"
      :data="data"
      border
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="code" label="产品编码" min-width="160" show-overflow-tooltip />
      <el-table-column prop="name" label="产品名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="alloy" label="合金牌号" width="100" />
      <el-table-column prop="state" label="状态/硬度" width="100" />
      <el-table-column label="规格" width="160">
        <template slot-scope="{row}">
          {{ row.thickness.toFixed(4) }}mm x {{ row.width }}mm
        </template>
      </el-table-column>
      <el-table-column prop="unitWeight" label="单位重量(kg/卷)" width="140" />
      <el-table-column label="产品生命周期" width="100">
        <template slot-scope="{row}">
          <el-tag :type="getStatusType(row.lifecycleStatus)">
            {{ row.lifecycleStatusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="关联工艺模板" min-width="180">
        <template slot-scope="{row}">
          <el-popover
            v-if="row.processTemplates && row.processTemplates.length"
            placement="top"
            width="300"
            trigger="click"
            popper-class="popover-template-list"
          >
            <div class="template-list">
              <div class="template-list-header">关联工艺模板列表</div>
              <div v-for="(item, index) in row.processTemplates" :key="index" class="template-list-item">
                <span>{{ index + 1 }}. {{ item.name }}</span>
              </div>
            </div>
            <el-tag slot="reference" type="success" style="cursor: pointer">
              {{ row.processTemplates[0].name }} <span v-if="row.processTemplates.length > 1">(+{{ row.processTemplates.length - 1 }})</span>
            </el-tag>
          </el-popover>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="关联质量标准" min-width="180">
        <template slot-scope="{row}">
          <el-popover
            v-if="row.qualityStandards && row.qualityStandards.length"
            placement="top"
            width="300"
            trigger="click"
            popper-class="popover-template-list"
          >
            <div class="template-list">
              <div class="template-list-header">关联质量标准列表</div>
              <div v-for="(item, index) in row.qualityStandards" :key="index" class="template-list-item">
                <span>{{ index + 1 }}. {{ item.name }}</span>
              </div>
            </div>
            <el-tag slot="reference" type="primary" style="cursor: pointer">
              {{ row.qualityStandards[0].name }} <span v-if="row.qualityStandards.length > 1">(+{{ row.qualityStandards.length - 1 }})</span>
            </el-tag>
          </el-popover>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" icon="el-icon-edit" @click="$emit('update', row)">编辑</el-button>
          <el-dropdown size="mini" split-button type="warning" @command="command => handleCommand(command, row)">
            状态变更
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :disabled="row.lifecycleStatus === 'trial'" command="trial">设为试产</el-dropdown-item>
              <el-dropdown-item :disabled="row.lifecycleStatus === 'production'" command="production">设为量产</el-dropdown-item>
              <el-dropdown-item :disabled="row.lifecycleStatus === 'discontinued'" command="discontinued">设为停产</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
/**
 * 产品表格组件
 * 功能描述：展示铝箔产品列表并提供操作功能
 */
import Pagination from '@/components/Pagination'
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'ProductTable',
  components: {
    Pagination
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      currentPage: this.page,
      pageSize: this.limit
    }
  },
  watch: {
    page(val) {
      this.currentPage = val
    },
    limit(val) {
      this.pageSize = val
    }
  },
  methods: {
    // 处理选择行变化
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
    
    // 处理下拉菜单命令
    handleCommand(command, row) {
      this.$emit('status-change', row, command)
    },
    
    // 获取状态标签类型
    getStatusType(status) {
      const types = {
        'trial': 'warning',
        'production': 'success',
        'discontinued': 'info'
      }
      return types[status] || 'info'
    },
    
    // 返回顶部方法，供外部调用
    backToTop() {
      scrollTo(0, 800)
    }
  }
}
</script>

<style lang="scss" scoped>
.product-table {
  margin-bottom: 24px;

  ::v-deep .el-table {
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 16px;
  }
}

.template-list {
  max-height: 300px;
  overflow-y: auto;
  
  &-header {
    font-weight: bold;
    padding-bottom: 8px;
    margin-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }
  
  &-item {
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
}
</style>

<style>
.popover-template-list {
  max-width: 80%;
  min-width: 200px;
}
</style> 