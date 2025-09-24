/**
 * 登录页面头部组件
 * 功能描述：显示公司Logo和系统标题
 * 创建日期：2024-07-24
 */
<template>
  <div class="login-header">
    <div class="logo-container">
      <img :src="logoSrc" class="logo" alt="公司Logo">
    </div>
    <h1 class="system-title">MOSES管理系统</h1>
  </div>
</template>

<script>
import logoSrc from '@/assets/logo.svg'

export default {
  name: 'LoginHeader',
  data() {
    return {
      logoSrc
    }
  }
}
</script>

<style lang="scss" scoped>
.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo-container {
    margin-bottom: 16px;

    .logo {
      width: 80px;
      height: 80px;
    }
  }

  .system-title {
    font-size: 28px;
    font-weight: 600;
    color: #333;
    margin: 0;
    padding: 0;
  }
}
</style>
