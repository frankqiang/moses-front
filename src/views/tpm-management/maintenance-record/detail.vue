<!--
  文件名称: detail.vue
  文件描述: 维护记录详情页面（占位）
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 创建占位页面，待实现
-->

<template>
  <div class="app-container">
    <el-result
      icon="info"
      title="功能开发中"
      sub-title="维护记录详情页面正在开发中，敬请期待"
    >
      <template slot="extra">
        <el-button type="primary" size="medium" @click="goBack">
          返回
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<script>
export default {
  name: 'MaintenanceRecordDetail',
  methods: {
    goBack() {
      this.$router.back()
    }
  }
}
</script>

