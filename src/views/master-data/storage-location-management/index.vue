<!--
文件名称: index.vue
文件描述: 库位管理主页面
创建日期: 2025-01-20
修改记录:
  - 2025-01-20: 初始创建
  - 2025-01-20: 添加库位管理Tab
-->

<template>
  <div class="storage-location-management app-container">
    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" type="card" class="tabs-container">
      <el-tab-pane label="库区管理" name="area">
        <area-management />
      </el-tab-pane>
      <el-tab-pane label="库位管理" name="location">
        <location-management />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import AreaManagement from './views/AreaManagement.vue'
import LocationManagement from './views/LocationManagement.vue'

export default {
  name: 'StorageLocationManagement',
  components: {
    AreaManagement,
    LocationManagement
  },
  data() {
    return {
      activeTab: 'area'
    }
  }
}
</script>

<style lang="scss" scoped>
.storage-location-management {
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;

  .tabs-container {
    flex: 1;
    display: flex;
    flex-direction: column;

    ::v-deep {
      .el-tabs__content {
        flex: 1;
        overflow: hidden;

        .el-tab-pane {
          height: 100%;
        }
      }
    }
  }

  .coming-soon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400px;
    font-size: 16px;
    color: #909399;
  }
}
</style>

