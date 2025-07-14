<template>
  <el-dialog
    title="选择工序"
    :visible.sync="dialogVisible"
    width="40%"
    append-to-body
    @close="handleClose"
  >
    <div class="operation-selector-content">
      <el-input
        v-model="searchKeyword"
        placeholder="按工序代码或名称搜索"
        clearable
        class="search-input"
        @input="debouncedSearch"
      >
        <i slot="prefix" class="el-input__icon el-icon-search"></i>
      </el-input>

      <base-table
        v-loading="loading"
        :data="operationList"
        :columns="columns"
        :show-pagination="true"
        height="500px"
        :row-key="'id'"
        :reserve-selection="true"
        :show-selection="true"
        :pagination="paginationConfig"
        @selection-change="handleSelectionChange"
        @pagination-change="handlePaginationChange"
      >
        <template #type="{ row }">
          <el-tag size="mini">{{ getOperationTypeLabel(row.type) }}</el-tag>
        </template>
      </base-table>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="primary"
        :disabled="selectedOperations.length === 0"
        @click="handleConfirm"
      >
        确 定 (已选 {{ selectedOperations.length }} 项)
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import { getOperationList } from '@/views/master-data/process-management/operations/api/operation'
import { debounce } from '@/utils'
import { OPERATION_TYPE_OPTIONS } from '@/views/master-data/process-management/operations/constants/operation'; // 导入工序类型常量

export default {
  name: 'OperationSelectorModal',
  components: { BaseTable },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      searchKeyword: '',
      operationList: [],
      selectedOperations: [],
      columns: [
        { type: 'selection', width: 55, align: 'center' },
        { prop: 'code', label: '工序代码', width: 150 },
        { prop: 'name', label: '工序名称', minWidth: 180 },
        { prop: 'type', label: '工序类型', width: 120, slotName: 'type' }
      ],
      // 分页相关数据
      listQuery: {
        page: 1,
        limit: 10
      },
      total: 0
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    paginationConfig() {
      return {
        total: this.total,
        page: this.listQuery.page,
        limit: this.listQuery.limit,
        pageSizes: [10, 20, 50],
        layout: 'total, sizes, prev, pager, next, jumper',
        background: true,
        autoScroll: false // 在弹窗中不需要自动滚动
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        // 打开模态框时重置分页和搜索关键词
        this.searchKeyword = ''
        this.listQuery.page = 1
        this.listQuery.limit = 10
        this.fetchOperations()
      }
    }
  },
  created() {
    this.debouncedSearch = debounce(this.fetchOperations, 300)
  },
  methods: {
    async fetchOperations() {
      this.loading = true
      try {
        const params = {
          status: 'Enabled', // 只获取启用的工序
          keyword: this.searchKeyword,
          page: this.listQuery.page,
          limit: this.listQuery.limit
        }
        const { data } = await getOperationList(params)
        this.operationList = data.items || []
        this.total = data.total || 0
      } catch (error) {
        console.error('获取工序列表失败:', error)
        this.$message.error('获取工序列表失败')
      } finally {
        this.loading = false
      }
    },
    handleSelectionChange(selection) {
      this.selectedOperations = selection
    },
    handleConfirm() {
      this.$emit('confirm', this.selectedOperations)
      this.handleClose()
    },
    handleClose() {
      this.dialogVisible = false
      this.searchKeyword = ''
      this.selectedOperations = []
      // 关闭时重置分页，避免下次打开显示上一页数据
      this.listQuery.page = 1
      this.listQuery.limit = 10
      this.total = 0
    },
    handlePaginationChange(pagination) {
      this.listQuery.page = pagination.page
      this.listQuery.limit = pagination.limit
      this.fetchOperations()
    },
    getOperationTypeLabel(type) {
      const option = OPERATION_TYPE_OPTIONS.find(opt => opt.value === type);
      return option ? option.label : type;
    }
  }
}
</script>

<style scoped>
.search-input {
  margin-bottom: 15px;
}
</style> 