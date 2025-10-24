/**
 * 文件名称：detail.vue
 * 文件描述：排程方案详情页面入口
 * 创建日期：2025-10-23
 * 修改记录：
 *   - 2025-10-23: 初始创建，实现P0阶段核心功能和P1部分功能
 */

<template>
  <div class="annealing-schedule-detail-page">
    <plan-detail :plan-id="planId" />
  </div>
</template>

<script>
import PlanDetail from './components/PlanDetail.vue'

export default {
  name: 'AnnealingScheduleDetail',
  components: {
    PlanDetail
  },
  computed: {
    planId() {
      return this.$route.params.id
    }
  }
}
</script>

<style lang="scss" scoped>
.annealing-schedule-detail-page {
  min-height: 100%;
  background: #f0f2f5;
}
</style>

