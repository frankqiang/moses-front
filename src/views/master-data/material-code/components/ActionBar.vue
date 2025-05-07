<template>
  <div class="action-bar-container">
    <el-button
      type="primary"
      icon="el-icon-plus"
      size="small"
      @click="handleCreate"
    >
      新增编码规则
    </el-button>

    <div class="description">
      <el-alert
        title="说明：物料编码规则用于定义料框ID的生成规则及二维码内容。系统将根据配置的规则自动生成料框ID。"
        type="info"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActionBar',
  methods: {
    handleCreate() {
      this.$emit('create')
    }
  }
}
</script>

<style lang="scss" scoped>
.action-bar-container {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .description {
    flex: 1;
    margin-left: 16px;
  }
}
</style> 