<template>
  <div id="app">
    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" />
    </transition>
    <!-- 全局错误处理组件 -->
    <error-handler />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    key() {
      // 使用路由路径作为key，确保路由切换时组件重新渲染
      return this.$route.path
    }
  }
}
</script>

<style scoped>
/* 路由切换过渡动画 - fade-transform */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
