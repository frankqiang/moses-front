<template>
  <el-dialog
    title="选择工序"
    :visible.sync="dialogVisible"
    width="60%"
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
        :show-pagination="false"
        height="400px"
        :row-key="'id'"
        :reserve-selection="true"
        :show-selection="true"
        @selection-change="handleSelectionChange"
      >
        <template #type="{ row }">
          <el-tag size="mini">{{ operationTypeMap[row.type] || row.type }}</el-tag>
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
      operationTypeMap: {
        Production: '生产',
        Inspection: '检验',
        Storage: '仓储',
        Move: '移动',
        Packing: '包装'
      }
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
    }
  },
  watch: {
    visible(val) {
      if (val) {
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
          keyword: this.searchKeyword
        }
        const { data } = await getOperationList(params)
        this.operationList = data.items || []
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
    }
  }
}
</script>

<style scoped>
.search-input {
  margin-bottom: 15px;
}
</style> 