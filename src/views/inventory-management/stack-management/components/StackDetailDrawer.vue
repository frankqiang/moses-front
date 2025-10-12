/**
 * 文件名称：StackDetailDrawer.vue
 * 文件描述：料垛详情查看抽屉组件
 * 创建日期：2025-10-12
 * 修改记录：
 *   - 2025-10-12: 初始创建，实现料垛详情查看功能
 */

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :loading="loading"
    size="800px"
    @close="handleClose"
  >
    <!-- 料垛基本信息 -->
    <el-descriptions
      v-if="stackDetail"
      class="stack-detail-section"
      title="料垛基本信息"
      :column="2"
      border
    >
      <el-descriptions-item label="料垛编号">
        <el-tag type="primary" size="medium">{{ stackDetail.stackCode }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="料垛状态">
        <status-tag
          :status="stackDetail.status"
          :text-map="stackStatusConfig.textMap"
          :type-map="stackStatusConfig.typeMap"
        />
      </el-descriptions-item>
      <el-descriptions-item label="料框规格代码">
        {{ stackDetail.binSpecificationCode }}
      </el-descriptions-item>
      <el-descriptions-item label="产品代码">
        {{ stackDetail.productCode }}
      </el-descriptions-item>
      <el-descriptions-item label="批次号">
        {{ stackDetail.batchNumber || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="当前位置">
        {{ getCurrentLocationDisplay(stackDetail) }}
      </el-descriptions-item>
      <el-descriptions-item label="料框数量">
        <el-tag type="success" size="small">{{ stackDetail.binCount }} 个</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="堆叠层数">
        <el-tag type="info" size="small">{{ stackDetail.stackLayers }} 层</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="总重量">
        <el-tag type="warning" size="small">{{ stackDetail.totalWeight }} kg</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="备注" :span="2">
        {{ stackDetail.remarks || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 组垛信息 -->
    <el-descriptions
      v-if="stackDetail"
      class="stack-detail-section"
      title="组垛信息"
      :column="2"
      border
    >
      <el-descriptions-item label="组垛时间">
        {{ formatTime(stackDetail.stackedAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="组垛操作员">
        {{ getStackerDisplay(stackDetail) }}
      </el-descriptions-item>
      <el-descriptions-item label="拆垛时间">
        {{ stackDetail.destackedAt ? formatTime(stackDetail.destackedAt) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="拆垛操作员">
        {{ getDestackerDisplay(stackDetail) }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 系统信息 -->
    <el-descriptions
      v-if="stackDetail"
      class="stack-detail-section"
      title="系统信息"
      :column="2"
      border
    >
      <el-descriptions-item label="创建时间">
        {{ formatTime(stackDetail.createdAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="创建人">
        {{ stackDetail.createdBy || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ formatTime(stackDetail.updatedAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="更新人">
        {{ stackDetail.updatedBy || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 成员料框列表 -->
    <div v-if="stackDetail && stackDetail.status === STACK_STATUS.ACTIVE" class="stack-detail-section">
      <div class="section-title">
        <span>成员料框列表</span>
        <el-button
          type="text"
          size="small"
          icon="el-icon-view"
          @click="handleViewBins"
        >
          查看详细料框列表
        </el-button>
      </div>
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template slot="default">
          该料垛包含 <strong>{{ stackDetail.binCount }}</strong> 个料框，堆叠 <strong>{{ stackDetail.stackLayers }}</strong> 层。
          点击上方"查看详细料框列表"按钮可查看所有成员料框的详细信息。
        </template>
      </el-alert>
    </div>

    <!-- 底部操作按钮 -->
    <div slot="footer" class="drawer-footer">
      <el-button @click="handleClose">
        关闭
      </el-button>
      <el-button
        v-if="stackDetail && stackDetail.status === STACK_STATUS.ACTIVE"
        type="danger"
        icon="el-icon-delete"
        @click="handleDestack"
      >
        拆垛
      </el-button>
    </div>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import StatusTag from '@/components/StatusTag'
import { getStackDetail } from '../api'
import { STACK_STATUS_CONFIG, STACK_STATUS } from '../constants'
import { parseTime } from '@/utils'

export default {
  name: 'StackDetailDrawer',

  components: {
    BaseDrawer,
    StatusTag
  },

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    stackId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      drawerVisible: false,
      loading: false,
      stackDetail: null,
      stackStatusConfig: STACK_STATUS_CONFIG,
      STACK_STATUS // 料垛状态常量，用于模板中的状态判断
    }
  },

  computed: {
    drawerTitle() {
      return this.stackDetail ? `料垛详情 - ${this.stackDetail.stackCode}` : '料垛详情'
    }
  },

  watch: {
    visible: {
      handler(val) {
        this.drawerVisible = val
        if (val && this.stackId) {
          this.fetchStackDetail()
        }
      },
      immediate: true
    },

    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },

  methods: {
    /**
     * 获取料垛详情
     */
    async fetchStackDetail() {
      if (!this.stackId) {
        this.$message.warning('料垛ID不能为空')
        return
      }

      this.loading = true

      try {
        const response = await getStackDetail(this.stackId)

        if (response.success && response.data) {
          this.stackDetail = response.data
        } else {
          this.$message.error(response.message || '获取料垛详情失败')
          this.handleClose()
        }
      } catch (error) {
        console.error('获取料垛详情失败:', error)
        // 错误处理由request拦截器统一处理
        this.handleClose()
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取当前位置显示文本
     */
    getCurrentLocationDisplay(stack) {
      if (!stack) return '-'

      // 优先使用 currentLocation 对象
      if (stack.currentLocation) {
        const loc = stack.currentLocation
        if (loc.locationCode && loc.locationName) {
          return `${loc.locationCode} - ${loc.locationName}`
        }
        if (loc.locationCode) {
          return loc.locationCode
        }
        if (loc.locationName) {
          return loc.locationName
        }
      }

      // 降级处理：显示 ID
      return stack.currentLocationId || '-'
    },

    /**
     * 获取组垛操作员显示文本
     */
    getStackerDisplay(stack) {
      if (!stack) return '-'

      // 优先使用 stacker 对象
      if (stack.stacker) {
        const user = stack.stacker
        if (user.realName && user.username) {
          return `${user.realName} (${user.username})`
        }
        if (user.realName) {
          return user.realName
        }
        if (user.username) {
          return user.username
        }
      }

      // 降级处理：显示 ID
      return stack.stackedBy || '-'
    },

    /**
     * 获取拆垛操作员显示文本
     */
    getDestackerDisplay(stack) {
      if (!stack || !stack.destackedBy) return '-'

      // 优先使用 destacker 对象
      if (stack.destacker) {
        const user = stack.destacker
        if (user.realName && user.username) {
          return `${user.realName} (${user.username})`
        }
        if (user.realName) {
          return user.realName
        }
        if (user.username) {
          return user.username
        }
      }

      // 降级处理：显示 ID
      return stack.destackedBy || '-'
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
     * 查看成员料框
     */
    handleViewBins() {
      this.$emit('view-bins', this.stackDetail)
    },

    /**
     * 拆垛
     */
    handleDestack() {
      this.$emit('destack', this.stackDetail)
      this.handleClose()
    },

    /**
     * 关闭抽屉
     */
    handleClose() {
      this.stackDetail = null
      this.loading = false
      this.drawerVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.stack-detail-section {
  margin-bottom: 24px;

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

::v-deep .el-descriptions {
  .el-descriptions__title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 16px;
  }

  .el-descriptions-item__label {
    font-weight: 500;
  }
}
</style>

