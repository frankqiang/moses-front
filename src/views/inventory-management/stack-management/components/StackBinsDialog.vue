/**
 * 文件名称：StackBinsDialog.vue
 * 文件描述：料垛成员料框对话框组件
 * 创建日期：2025-01-10
 * 修改记录：
 *   - 2025-01-10: 初始创建，实现P1阶段功能
 */

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="料垛成员料框"
    width="90%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 料垛信息展示 -->
    <div class="stack-info-section">
      <el-alert
        :title="'料垛编号：' + (stackInfo.stackCode || '-')"
        type="info"
        :closable="false"
        show-icon
      >
        <template slot="default">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">料框数量：</span>
              <span class="value highlight">{{ stackInfo.binCount || 0 }} 个</span>
            </div>
            <div class="info-item">
              <span class="label">堆叠层数：</span>
              <span class="value">{{ stackInfo.stackLayers || 0 }} 层</span>
            </div>
            <div class="info-item">
              <span class="label">总重量：</span>
              <span class="value">{{ stackInfo.totalWeight || 0 }} kg</span>
            </div>
            <div class="info-item">
              <span class="label">产品代码：</span>
              <span class="value">{{ stackInfo.productCode || '-' }}</span>
            </div>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 堆叠顺序排序控制 -->
    <div class="toolbar-section">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
            :type="sortOrder === 'asc' ? 'primary' : ''"
            size="small"
            @click="handleSortChange('asc')"
          >
            <i class="el-icon-bottom" />
            从下往上
          </el-button>
          <el-button
            :type="sortOrder === 'desc' ? 'primary' : ''"
            size="small"
            @click="handleSortChange('desc')"
          >
            <i class="el-icon-top" />
            从上往下
          </el-button>
        </el-button-group>
        <span class="toolbar-tip">
          <i class="el-icon-info" />
          按堆叠顺序显示料框
        </span>
      </div>
    </div>

    <!-- 料框列表表格 -->
    <el-table
      v-loading="loading"
      :data="sortedBinList"
      border
      stripe
      max-height="500"
      style="width: 100%"
    >
      <el-table-column
        type="index"
        label="序号"
        width="60"
        align="center"
      />

      <el-table-column
        prop="binCode"
        label="料框编号"
        min-width="180"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            @click="handleCopyBinCode(row.binCode)"
          >
            {{ row.binCode }}
            <i class="el-icon-document-copy" />
          </el-button>
        </template>
      </el-table-column>

      <el-table-column
        label="料框规格"
        min-width="150"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          {{ (row.specification && row.specification.specCode) || (row.specification && row.specification.specName) || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        prop="productCode"
        label="产品代码"
        min-width="200"
        align="left"
        show-overflow-tooltip
      />

      <el-table-column
        prop="batchNumber"
        label="批次号"
        min-width="150"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          {{ row.batchNumber || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        label="重量(kg)"
        min-width="120"
        align="right"
      >
        <template slot-scope="{ row }">
          {{ row.weight ? row.weight.toFixed(3) : '-' }}
        </template>
      </el-table-column>

      <el-table-column
        label="料框状态"
        min-width="120"
        align="center"
      >
        <template slot-scope="{ row }">
          <status-tag
            :status="row.status"
            :text-map="binStatusConfig.textMap"
            :type-map="binStatusConfig.typeMap"
          />
        </template>
      </el-table-column>

      <el-table-column
        prop="registeredAt"
        label="注册时间"
        min-width="180"
        align="center"
        show-overflow-tooltip
      >
        <template slot-scope="{ row }">
          {{ formatTime(row.registeredAt) }}
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="{ row }">
          <el-button
            type="text"
            size="small"
            @click="handleViewDetail(row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 料框详情抽屉 -->
    <bin-form-drawer
      :visible.sync="binDetailDrawerVisible"
      :mode="'view'"
      :bin-id="selectedBinId"
      @updated="handleBinUpdated"
    />

    <!-- 底部操作按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">
        关闭
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getStackBins } from '../api'
import { BIN_STATUS_CONFIG } from '@/views/inventory-management/bin-management/constants'
import { parseTime } from '@/utils'
import StatusTag from '@/components/StatusTag'

export default {
  name: 'StackBinsDialog',

  components: {
    StatusTag,
    // 懒加载料框详情表单抽屉，避免循环依赖
    BinFormDrawer: () => import('@/views/inventory-management/bin-management/components/BinFormDrawer.vue')
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stack: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      dialogVisible: false,
      loading: false,
      binList: [],
      sortOrder: 'asc', // 默认从下往上（升序）
      binStatusConfig: BIN_STATUS_CONFIG,
      binDetailDrawerVisible: false,
      selectedBinId: null
    }
  },

  computed: {
    // 料垛信息
    stackInfo() {
      return {
        stackCode: this.stack && this.stack.stackCode,
        binCount: this.stack && this.stack.binCount,
        stackLayers: this.stack && this.stack.stackLayers,
        totalWeight: this.stack && this.stack.totalWeight,
        productCode: this.stack && this.stack.productCode
      }
    },

    // 排序后的料框列表
    sortedBinList() {
      if (!this.binList || this.binList.length === 0) {
        return []
      }

      const list = [...this.binList]

      // 按创建时间排序（createdAt或registeredAt）
      list.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.registeredAt).getTime()
        const timeB = new Date(b.createdAt || b.registeredAt).getTime()

        return this.sortOrder === 'asc' ? timeA - timeB : timeB - timeA
      })

      return list
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.dialogVisible = val
        if (val && this.stack && this.stack.id) {
          this.fetchBinList()
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
     * 获取料垛成员料框列表
     */
    async fetchBinList() {
      if (!this.stack || !this.stack.id) {
        this.$message.warning('料垛ID不能为空')
        return
      }

      this.loading = true

      try {
        const response = await getStackBins(this.stack.id)

        if (response.success && Array.isArray(response.data)) {
          this.binList = response.data
        } else {
          this.binList = []
          this.$message.error(response.message || '获取料框列表失败')
        }
      } catch (error) {
        console.error('获取料框列表失败:', error)
        this.binList = []
        // 错误处理由request拦截器统一处理
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理排序变更
     */
    handleSortChange(order) {
      this.sortOrder = order
    },

    /**
     * 复制料框编号
     */
    handleCopyBinCode(binCode) {
      const input = document.createElement('input')
      input.value = binCode
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      this.$message.success(`已复制料框编号：${binCode}`)
    },

    /**
     * 查看料框详情
     */
    handleViewDetail(bin) {
      this.selectedBinId = bin.id
      this.binDetailDrawerVisible = true
    },

    /**
     * 料框更新后回调
     */
    handleBinUpdated() {
      // 刷新料框列表
      this.fetchBinList()
      // 通知父组件刷新
      this.$emit('bin-updated')
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 关闭对话框
     */
    handleClose() {
      this.binList = []
      this.sortOrder = 'asc'
      this.selectedBinId = null
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.stack-info-section {
  margin-bottom: 16px;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 12px;

    .info-item {
      display: flex;
      align-items: center;

      .label {
        font-weight: 500;
        color: #606266;
        margin-right: 8px;
      }

      .value {
        color: #303133;

        &.highlight {
          color: #409eff;
          font-weight: 600;
          font-size: 16px;
        }
      }
    }
  }
}

.toolbar-section {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .toolbar-tip {
      font-size: 12px;
      color: #909399;

      i {
        margin-right: 4px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

::v-deep .el-table {
  .el-button--text {
    padding: 0;

    i {
      margin-left: 4px;
      font-size: 12px;
    }
  }
}
</style>

