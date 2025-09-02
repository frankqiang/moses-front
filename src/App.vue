<template>
  <div id="app">
    <router-view />
    <!-- 全局错误处理组件 -->
    <error-handler />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
