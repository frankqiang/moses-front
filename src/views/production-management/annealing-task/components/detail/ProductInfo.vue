/**
 * 文件名称：ProductInfo.vue
 * 文件描述：退火任务产品信息和工艺模板信息卡片组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建
 *   - 2025-10-22: 根据接口改进v1.1.0，优先从productInfo顶层获取thickness、width、temper字段
 *                保留从specifications对象获取的兼容逻辑
 */

<template>
  <el-card class="info-card" shadow="never">
    <div slot="header" class="card-header">
      <span class="card-title">产品信息与工艺模板</span>
    </div>
    <el-descriptions :column="3" border>
      <el-descriptions-item label="产品编码">
        <span class="info-value">{{ taskData.productCode || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品名称">
        <span class="info-value">{{ taskData.productName || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="合金牌号">
        <span class="info-value">{{ taskData.alloyGrade || '-' }}</span>
      </el-descriptions-item>

      <!-- 产品详细信息（如果有productInfo） -->
      <template v-if="productInfo">
        <el-descriptions-item label="厚度(mm)">
          <span class="info-value">{{ getProductField('thickness') }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="宽度(mm)">
          <span class="info-value">{{ getProductField('width') }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="态别">
          <span class="info-value">{{ getProductField('temper') }}</span>
        </el-descriptions-item>
      </template>

      <!-- 工艺模板信息 -->
      <el-descriptions-item label="工艺模板编码">
        <span class="info-value">{{ getProcessInfo('templateCode') }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="工艺模板名称" :span="2">
        <span class="info-value">{{ getProcessInfo('templateName') }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script>
export default {
  name: 'ProductInfo',
  props: {
    taskData: {
      type: Object,
      required: true
    },
    productInfo: {
      type: Object,
      default: null
    },
    processInfo: {
      type: Object,
      default: null
    }
  },
  methods: {
    /**
     * 获取产品字段值
     * 优先从productInfo顶层获取，其次从specifications对象中获取（兼容旧版本）
     */
    getProductField(field) {
      if (!this.productInfo) {
        return '-'
      }
      // 优先使用顶层字段（v1.1.0+）
      if (this.productInfo[field] !== undefined && this.productInfo[field] !== null) {
        return this.productInfo[field]
      }
      // 兼容旧版本：从specifications对象中获取
      if (this.productInfo.specifications && this.productInfo.specifications[field]) {
        return this.productInfo.specifications[field]
      }
      return '-'
    },

    /**
     * 获取工艺模板信息
     */
    getProcessInfo(field) {
      if (!this.processInfo) {
        return '-'
      }
      return this.processInfo[field] || '-'
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

.info-value {
  color: #606266;
  font-size: 14px;
}
</style>

