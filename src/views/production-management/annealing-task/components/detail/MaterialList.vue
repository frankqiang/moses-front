/**
 * 文件名称：MaterialList.vue
 * 文件描述：退火任务物料明细表格组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建
 *   - 2025-10-22: 根据接口改进v1.1.0，状态快照列优先显示statusSnapshotLabel（中文标签）
 *                添加状态Tag样式，改善用户体验
 */

<template>
  <el-card class="info-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">物料明细</span>
      <span class="material-count">共 {{ materials.length }} 项</span>
    </div>
    <el-table
      v-if="materials.length > 0"
      :data="materials"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column
        prop="loadSequence"
        label="装炉顺序"
        width="100"
        align="center"
      />
      <el-table-column
        prop="materialCode"
        label="物料编码"
        min-width="150"
      />
      <el-table-column
        prop="materialType"
        label="物料类型"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="getMaterialTypeColor(scope.row.materialType)" size="small">
            {{ getMaterialTypeLabel(scope.row.materialType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="batchNumber"
        label="批次号"
        min-width="140"
      />
      <el-table-column
        prop="expectedWeight"
        label="预期重量(吨)"
        width="120"
        align="right"
      >
        <template slot-scope="scope">
          {{ formatWeight(scope.row.expectedWeight) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="actualWeight"
        label="实际重量(吨)"
        width="120"
        align="right"
      >
        <template slot-scope="scope">
          <span class="weight-value">
            {{ formatWeight(scope.row.actualWeight) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        prop="loadPosition"
        label="装炉位置"
        width="100"
        align="center"
      />
      <el-table-column
        prop="isPrimary"
        label="主料框"
        width="80"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isPrimary" type="success" size="mini">
            是
          </el-tag>
          <span v-else class="text-secondary">否</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="warehouseLocationCode"
        label="库位编码"
        min-width="120"
      />
      <el-table-column
        prop="statusSnapshot"
        label="状态快照"
        width="120"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag :type="getStatusType(scope.row.statusSnapshot)" size="small">
            {{ scope.row.statusSnapshotLabel || scope.row.statusSnapshot || '-' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-else
      description="暂无物料绑定"
      :image-size="80"
    />
  </el-card>
</template>

<script>
import { MATERIAL_TYPE_MAP } from '../../constants'

export default {
  name: 'MaterialList',
  props: {
    materials: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getMaterialTypeLabel(type) {
      return MATERIAL_TYPE_MAP[type] || type || '-'
    },
    getMaterialTypeColor(type) {
      return type === 'basket' ? 'primary' : 'success'
    },
    formatWeight(weight) {
      if (weight === null || weight === undefined) {
        return '-'
      }
      return Number(weight).toFixed(3)
    },
    /**
     * 获取物料状态的Tag颜色类型
     */
    getStatusType(status) {
      // 根据状态返回不同的颜色类型
      const statusColorMap = {
        'WAITING_ANNEALING': 'warning',
        'IN_ANNEALING': 'primary',
        'ANNEALED': 'success',
        'QUALITY_CHECKED': 'success',
        'REJECTED': 'danger',
        'IN_STORAGE': 'info'
      }
      return statusColorMap[status] || 'info'
    }
  }
}
</script>

<style lang="scss" scoped>
.info-card {
  margin-bottom: 16px;

  ::v-deep .el-card__header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  ::v-deep .el-card__body {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.material-count {
  font-size: 14px;
  color: #909399;
}

.weight-value {
  font-weight: 500;
  color: #409EFF;
}

.text-secondary {
  color: #909399;
  font-size: 12px;
}
</style>

