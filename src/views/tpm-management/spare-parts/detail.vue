/**
 * 文件名称：detail.vue
 * 文件描述：备件详情页面
 * 创建日期：2025-01-21
 * 修改记录：
 *   - 2025-01-21: 初始创建，实现P0阶段备件详情展示
 */

<template>
  <div class="spare-part-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <el-page-header :content="pageTitle" @back="handleBack">
        <template slot="content">
          <span class="header-title">{{ pageTitle }}</span>
          <el-tag v-if="isLowStock" type="danger" size="small" class="ml-10">
            低库存
          </el-tag>
        </template>
      </el-page-header>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 详情内容 -->
    <div v-else-if="sparePartDetail" class="detail-content">
      <!-- 基础信息卡片 -->
      <el-card class="detail-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">基础信息</span>
          <action-buttons
            :buttons="actionButtons"
            mode="text"
            @click="handleAction"
          />
        </div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="备件编码">
            {{ sparePartDetail.sparePartCode }}
          </el-descriptions-item>
          <el-descriptions-item label="备件名称">
            {{ sparePartDetail.sparePartName }}
          </el-descriptions-item>
          <el-descriptions-item label="计量单位">
            {{ sparePartDetail.unit }}
          </el-descriptions-item>
          <el-descriptions-item label="规格型号">
            {{ sparePartDetail.specification || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="适用设备类型" :span="2">
            {{ sparePartDetail.applicableEquipmentTypes || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="单价">
            {{ formatPrice(sparePartDetail.unitPrice) }}
          </el-descriptions-item>
          <el-descriptions-item label="存储位置">
            {{ sparePartDetail.storageLocation || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="1">
            {{ sparePartDetail.remark || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 供应商信息卡片 -->
      <el-card class="detail-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">供应商信息</span>
        </div>
        <el-descriptions v-if="hasSupplierInfo" :column="2" border>
          <el-descriptions-item label="供应商名称">
            {{ sparePartDetail.supplierInfo.name || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人">
            {{ sparePartDetail.supplierInfo.contact || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            <span v-if="sparePartDetail.supplierInfo.phone">
              <a :href="`tel:${sparePartDetail.supplierInfo.phone}`">
                {{ sparePartDetail.supplierInfo.phone }}
              </a>
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="联系邮箱">
            <span v-if="sparePartDetail.supplierInfo.email">
              <a :href="`mailto:${sparePartDetail.supplierInfo.email}`">
                {{ sparePartDetail.supplierInfo.email }}
              </a>
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="暂无供应商信息" :image-size="80" />
      </el-card>

      <!-- 库存配置卡片 -->
      <el-card class="detail-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">库存配置</span>
        </div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="库存上限">
            {{ formatNumber(sparePartDetail.maxStock) }}
          </el-descriptions-item>
          <el-descriptions-item label="库存下限">
            {{ formatNumber(sparePartDetail.minStock) }}
          </el-descriptions-item>
          <el-descriptions-item label="安全库存">
            {{ formatNumber(sparePartDetail.safetyStock) }}
          </el-descriptions-item>
          <el-descriptions-item label="采购提前期">
            {{ formatLeadTime(sparePartDetail.leadTimeDays) }}
          </el-descriptions-item>
          <el-descriptions-item label="保质期">
            {{ formatShelfLife(sparePartDetail.shelfLifeMonths) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 库存状态卡片 -->
      <el-card class="detail-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">库存状态</span>
          <el-tag v-if="isLowStock" type="danger" size="small">
            低库存预警
          </el-tag>
        </div>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="inventory-item">
              <div class="inventory-label">当前库存</div>
              <div class="inventory-value" :class="{ 'low-stock': isLowStock }">
                {{ formatInventory(inventoryInfo.currentQuantity) }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="inventory-item">
              <div class="inventory-label">在途数量</div>
              <div class="inventory-value">
                {{ formatInventory(inventoryInfo.inTransitQuantity) }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="inventory-item">
              <div class="inventory-label">预留数量</div>
              <div class="inventory-value">
                {{ formatInventory(inventoryInfo.reservedQuantity) }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="inventory-item">
              <div class="inventory-label">可用库存</div>
              <div class="inventory-value primary">
                {{ formatInventory(availableQuantity) }}
              </div>
            </div>
          </el-col>
        </el-row>
        <el-divider />
        <div class="inventory-footer">
          <span class="inventory-label">最后更新时间：</span>
          <span>{{ formatDateTime(inventoryInfo.lastUpdatedAt) }}</span>
        </div>
      </el-card>

      <!-- 审计信息卡片 -->
      <el-card class="detail-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">审计信息</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建人">
            {{ creatorName }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(sparePartDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="更新人">
            {{ updaterName }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ formatDateTime(sparePartDetail.updatedAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="备件不存在或已被删除">
        <el-button type="primary" @click="handleBack">返回列表</el-button>
      </el-empty>
    </div>

    <!-- 编辑表单抽屉 -->
    <spare-part-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formDrawerMode"
      :spare-part-id="sparePartId"
      @success="handleFormSuccess"
    />

    <!-- 备件入库对话框 -->
    <in-stock-dialog
      :visible.sync="inStockDialogVisible"
      :spare-part-info="currentSparePartData"
      @success="handleInStockSuccess"
    />

    <!-- 备件出库对话框 -->
    <out-stock-dialog
      :visible.sync="outStockDialogVisible"
      :spare-part-info="currentSparePartData"
      @success="handleOutStockSuccess"
    />
  </div>
</template>

<script>
import { getSparePartById, getSparePartInventory } from './api'
import ActionButtons from '@/components/ActionButtons'
import SparePartFormDrawer from './components/SparePartFormDrawer'
import InStockDialog from './components/InStockDialog'
import OutStockDialog from './components/OutStockDialog'

export default {
  name: 'SparePartDetail',
  components: {
    ActionButtons,
    SparePartFormDrawer,
    InStockDialog,
    OutStockDialog
  },
  data() {
    return {
      loading: false,
      sparePartDetail: null,
      inventoryInfo: {
        currentQuantity: 0,
        inTransitQuantity: 0,
        reservedQuantity: 0,
        lastUpdatedAt: null
      },
      formDrawerVisible: false,
      formDrawerMode: 'edit',
      inStockDialogVisible: false,
      outStockDialogVisible: false,
      currentSparePartData: {}
    }
  },
  computed: {
    /**
     * 当前备件ID
     */
    sparePartId() {
      return this.$route.params.id
    },

    /**
     * 页面标题
     */
    pageTitle() {
      return this.sparePartDetail
        ? `备件详情 - ${this.sparePartDetail.sparePartCode}`
        : '备件详情'
    },

    /**
     * 是否有供应商信息
     */
    hasSupplierInfo() {
      const info = this.sparePartDetail?.supplierInfo
      return info && (info.name || info.contact || info.phone || info.email)
    },

    /**
     * 创建人姓名
     */
    creatorName() {
      return this.sparePartDetail?.creator?.name || '-'
    },

    /**
     * 更新人姓名
     */
    updaterName() {
      return this.sparePartDetail?.updater?.name || '-'
    },

    /**
     * 可用库存
     */
    availableQuantity() {
      return this.inventoryInfo.currentQuantity - this.inventoryInfo.reservedQuantity
    },

    /**
     * 是否低库存
     */
    isLowStock() {
      return this.inventoryInfo.currentQuantity <= (this.sparePartDetail?.safetyStock || 0)
    },

    /**
     * 操作按钮配置
     */
    actionButtons() {
      return [
        {
          key: 'edit',
          label: '编辑',
          icon: 'el-icon-edit',
          type: 'primary'
        },
        {
          key: 'in-stock',
          label: '入库',
          icon: 'el-icon-upload2',
          type: 'success'
        },
        {
          key: 'out-stock',
          label: '出库',
          icon: 'el-icon-download',
          type: 'warning'
        }
      ]
    }
  },
  created() {
    this.loadSparePartDetail()
  },
  /**
   * 路由离开前钩子 - 清理组件状态
   */
  beforeRouteLeave(to, from, next) {
    // 关闭所有打开的对话框和抽屉
    this.formDrawerVisible = false
    this.inStockDialogVisible = false
    this.outStockDialogVisible = false

    // 清理当前操作的数据
    this.currentSparePartData = {}

    next()
  },
  methods: {
    /**
     * 加载备件详情
     */
    async loadSparePartDetail() {
      const sparePartId = this.$route.params.id
      if (!sparePartId) {
        this.$message.error('备件ID不能为空')
        this.handleBack()
        return
      }

      this.loading = true
      try {
        // 并发请求备件详情和库存信息
        const [detailResponse, inventoryResponse] = await Promise.all([
          getSparePartById(sparePartId),
          getSparePartInventory(sparePartId)
        ])

        // 处理备件详情响应
        if (detailResponse && detailResponse.data) {
          this.sparePartDetail = detailResponse.data
        } else {
          throw new Error(detailResponse.message || '获取备件详情失败')
        }

        // 处理库存信息响应
        if (inventoryResponse && inventoryResponse.data) {
          this.inventoryInfo = {
            currentQuantity: inventoryResponse.data.currentQuantity || 0,
            inTransitQuantity: inventoryResponse.data.inTransitQuantity || 0,
            reservedQuantity: inventoryResponse.data.reservedQuantity || 0,
            lastUpdatedAt: inventoryResponse.data.lastUpdatedAt
          }
        }
      } catch (error) {
        console.error('加载备件详情失败:', error)
        this.sparePartDetail = null

        // 处理不同类型的错误
        let errorMessage = '加载备件详情失败'
        if (error.response) {
          const { status, data } = error.response
          if (status === 404) {
            errorMessage = '备件不存在或已被删除'
          } else if (status === 401) {
            errorMessage = '未授权，请重新登录'
          } else if (status === 403) {
            errorMessage = '无权限查看备件详情'
          } else if (data && data.error && data.error.message) {
            errorMessage = data.error.message
          }
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理返回
     */
    handleBack() {
      this.$router.push('/mdm/tpm/spare-parts')
    },

    /**
     * 处理操作按钮点击
     */
    handleAction(action) {
      switch (action.key) {
        case 'edit':
          this.handleEdit()
          break
        case 'in-stock':
          this.handleInStock()
          break
        case 'out-stock':
          this.handleOutStock()
          break
      }
    },

    /**
     * 处理编辑
     */
    handleEdit() {
      this.formDrawerVisible = true
    },

    /**
     * 处理表单提交成功
     */
    handleFormSuccess() {
      // 刷新详情页面数据
      this.loadSparePartDetail()
    },

    /**
     * 处理入库
     */
    handleInStock() {
      // 设置当前备件数据
      this.currentSparePartData = {
        id: this.sparePartDetail.id,
        sparePartCode: this.sparePartDetail.sparePartCode,
        sparePartName: this.sparePartDetail.sparePartName,
        unit: this.sparePartDetail.unit,
        currentQuantity: this.inventoryInfo.currentQuantity,
        safetyStock: this.sparePartDetail.safetyStock || 0
      }

      // 打开入库对话框
      this.inStockDialogVisible = true
    },

    /**
     * 处理入库成功
     */
    handleInStockSuccess() {
      // 刷新详情页面数据
      this.loadSparePartDetail()
      // 关闭对话框
      this.inStockDialogVisible = false
    },

    /**
     * 处理出库
     */
    handleOutStock() {
      // 设置当前备件数据
      this.currentSparePartData = {
        id: this.sparePartDetail.id,
        sparePartCode: this.sparePartDetail.sparePartCode,
        sparePartName: this.sparePartDetail.sparePartName,
        unit: this.sparePartDetail.unit,
        currentQuantity: this.inventoryInfo.currentQuantity,
        safetyStock: this.sparePartDetail.safetyStock || 0
      }

      // 打开出库对话框
      this.outStockDialogVisible = true
    },

    /**
     * 处理出库成功
     */
    handleOutStockSuccess() {
      // 刷新详情页面数据
      this.loadSparePartDetail()
      // 关闭对话框
      this.outStockDialogVisible = false
    },

    /**
     * 格式化数字
     */
    formatNumber(num) {
      return num !== null && num !== undefined ? num : '-'
    },

    /**
     * 格式化库存数量
     */
    formatInventory(quantity) {
      const num = quantity || 0
      return `${num} ${this.sparePartDetail?.unit || '件'}`
    },

    /**
     * 格式化采购提前期
     */
    formatLeadTime(days) {
      return days !== null && days !== undefined ? `${days}天` : '-'
    },

    /**
     * 格式化保质期
     */
    formatShelfLife(months) {
      return months !== null && months !== undefined ? `${months}个月` : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.spare-part-detail {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 84px);

  .detail-header {
    background: #fff;
    padding: 16px 24px;
    margin-bottom: 16px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

    .header-title {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }

    .ml-10 {
      margin-left: 10px;
    }
  }

  .loading-container,
  .error-container {
    background: #fff;
    padding: 40px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }

  .detail-content {
    .detail-card {
      margin-bottom: 16px;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }
      }

      ::v-deep .el-descriptions {
        .el-descriptions-item__label {
          background: #fafafa;
          font-weight: 500;
          color: #606266;
          width: 150px;
        }

        .el-descriptions-item__content {
          color: #303133;
        }
      }
    }

    .inventory-item {
      text-align: center;
      padding: 20px;
      background: #fafafa;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background: #f0f2f5;
        transform: scale(1.02);
      }

      .inventory-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 12px;
      }

      .inventory-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;

        &.low-stock {
          color: #f56c6c;
        }

        &.primary {
          color: #409eff;
        }
      }
    }

    .inventory-footer {
      text-align: right;
      color: #909399;
      font-size: 13px;

      .inventory-label {
        margin-right: 8px;
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .detail-header {
      padding: 12px 16px;
      margin-bottom: 12px;
    }

    .detail-content {
      .detail-card {
        margin-bottom: 12px;

        .card-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
        }
      }

      .inventory-item {
        margin-bottom: 12px;
      }
    }
  }
}
</style>

