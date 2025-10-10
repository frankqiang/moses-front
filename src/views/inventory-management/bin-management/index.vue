/**
 * 文件名称：index.vue
 * 文件描述：料框/料垛管理模块主页面
 * 创建日期：2025-01-10
 * 修改记录：
 *   - 2025-01-10: 初始创建，完成P0阶段基础架构搭建
 */

<template>
  <div class="bin-stack-management">
    <!-- 主内容区域 -->
    <el-tabs v-model="activeTab" type="border-card" @tab-click="handleTabClick">
      <!-- 料框管理Tab -->
      <el-tab-pane label="料框管理" name="bin">
        <div class="tab-content">
          <p>料框管理功能开发中...</p>
        </div>
      </el-tab-pane>

      <!-- 料垛管理Tab -->
      <el-tab-pane label="料垛管理" name="stack">
        <div class="tab-content">
          <p>料垛管理功能开发中...</p>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
/**
 * 料框/料垛管理模块主页面
 *
 * 功能说明：
 * - 料框管理：料框注册、列表查询、状态追踪、详情查看
 * - 料垛管理：料框组垛、拆垛、料垛列表查询、成员料框查看
 *
 * 业务流程：
 * - 料框从入车间登记、组垛/拆垛到状态变更的全生命周期管理
 * - 料框状态流转：待入库(退火) → 待退火 → 装炉中 → 退火中 → 已退火 → 待检验 → 已出库
 */
export default {
  name: 'BinStackManagement',
  data() {
    return {
      // 当前激活的Tab页
      activeTab: 'bin'
    }
  },
  methods: {
    /**
     * Tab切换处理
     * @param {Object} tab - 点击的标签对象
     */
    handleTabClick(tab) {
      console.log('切换Tab:', tab.name)
    }
  }
}
</script>

<style lang="scss" scoped>
.bin-stack-management {
  padding: 20px;

  .tab-content {
    padding: 20px;
    text-align: center;
    color: #606266;
  }
}
</style>

