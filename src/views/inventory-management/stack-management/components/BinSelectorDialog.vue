<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="选择料框"
    width="1400px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-form inline size="small">
        <el-form-item label="料框编号">
          <el-input
            v-model="searchParams.binCode"
            placeholder="请输入料框编号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="产品代码">
          <el-input
            v-model="searchParams.productCode"
            placeholder="请输入产品代码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="批次号">
          <el-input
            v-model="searchParams.batchNumber"
            placeholder="请输入批次号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="料框状态">
          <el-select
            v-model="searchParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="option in binStatusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 料框列表表格 -->
    <el-table
      ref="binTable"
      v-loading="loading"
      :data="binList"
      border
      size="small"
      max-height="450"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
        align="center"
        :selectable="checkBinSelectable"
      />
      <el-table-column prop="binCode" label="料框编号" min-width="160" align="center" show-overflow-tooltip />
      <el-table-column label="料框规格" min-width="140" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.specification ? row.specification.specificationCode : row.binSpecificationId }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="productCode" label="产品代码" min-width="160" align="left" show-overflow-tooltip />
      <el-table-column prop="batchNumber" label="批次号" min-width="140" align="center" show-overflow-tooltip />
      <el-table-column label="重量(kg)" min-width="100" align="right">
        <template slot-scope="{ row }">
          {{ row.weight ? row.weight.toFixed(3) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="120" align="center">
        <template slot-scope="{ row }">
          <status-tag :status="row.status" :config="binStatusConfig" />
        </template>
      </el-table-column>
      <el-table-column label="所属料垛" min-width="160" align="center" show-overflow-tooltip>
        <template slot-scope="{ row }">
          <span v-if="row.stackId">{{ row.stack ? row.stack.stackCode : row.stackId }}</span>
          <span v-else style="color: #909399">-</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.limit"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 底部操作 -->
    <div slot="footer" class="dialog-footer">
      <div class="selected-info">
        已选择 <span class="count">{{ selectedBinsInDialog.length }}</span> 个料框
      </div>
      <div class="actions">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button
          type="primary"
          :disabled="selectedBinsInDialog.length === 0"
          @click="handleConfirm"
        >
          确定
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { getBinList } from '@/views/inventory-management/bin-management/api'
import { BIN_STATUS_OPTIONS, BIN_STATUS_CONFIG } from '@/views/inventory-management/bin-management/constants'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'BinSelectorDialog',

  components: {
    StatusTag
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 已选择的料框ID列表（用于回显）
    selectedBinIds: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      dialogVisible: false,
      loading: false,
      searchParams: {
        binCode: '',
        productCode: '',
        batchNumber: '',
        status: ''
      },
      binList: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      selectedBinsInDialog: [], // 对话框内选择的料框
      binStatusOptions: BIN_STATUS_OPTIONS,
      binStatusConfig: BIN_STATUS_CONFIG
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
        if (val) {
          this.loadBinList()
        }
      },
      immediate: true
    },

    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },

  methods: {
    /**
     * 加载料框列表
     */
    async loadBinList() {
      this.loading = true

      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: 'createdAt:desc'
        }

        // 添加搜索条件
        if (this.searchParams.binCode) {
          params.searchKeyword = this.searchParams.binCode
        }
        if (this.searchParams.productCode) {
          params.productCode = this.searchParams.productCode
        }
        if (this.searchParams.batchNumber) {
          params.batchNumber = this.searchParams.batchNumber
        }
        if (this.searchParams.status) {
          params.status = this.searchParams.status
        }

        const response = await getBinList(params)

        if (response.success) {
          this.binList = response.data.results || []
          this.pagination.total = response.data.totalResults || 0

          // 回显已选择的料框
          this.$nextTick(() => {
            this.binList.forEach(bin => {
              if (this.selectedBinIds.includes(bin.id)) {
                this.$refs.binTable.toggleRowSelection(bin, true)
              }
            })
          })
        }
      } catch (error) {
        console.error('加载料框列表失败:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * 检查料框是否可选择
     * 不可选择的条件：已在料垛中（stackId不为空）
     */
    checkBinSelectable(row) {
      return !row.stackId
    },

    /**
     * 处理选择变化
     */
    handleSelectionChange(selection) {
      this.selectedBinsInDialog = selection
    },

    /**
     * 搜索
     */
    handleSearch() {
      this.pagination.page = 1
      this.loadBinList()
    },

    /**
     * 重置搜索
     */
    handleReset() {
      this.searchParams = {
        binCode: '',
        productCode: '',
        batchNumber: '',
        status: ''
      }
      this.pagination.page = 1
      this.loadBinList()
    },

    /**
     * 分页大小变化
     */
    handleSizeChange(size) {
      this.pagination.limit = size
      this.pagination.page = 1
      this.loadBinList()
    },

    /**
     * 页码变化
     */
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadBinList()
    },

    /**
     * 确认选择
     */
    handleConfirm() {
      this.$emit('confirm', this.selectedBinsInDialog)
      this.handleClose()
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.searchParams = {
        binCode: '',
        productCode: '',
        batchNumber: '',
        status: ''
      }
      this.pagination = {
        page: 1,
        limit: 20,
        total: 0
      }
      this.selectedBinsInDialog = []
      this.binList = []
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.search-section {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-section {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .selected-info {
    color: #606266;
    font-size: 14px;

    .count {
      color: #409eff;
      font-weight: bold;
      font-size: 16px;
      margin: 0 4px;
    }
  }

  .actions {
    display: flex;
    gap: 12px;
  }
}
</style>

