/**
 * 注册模块头部组件
 * 文件描述：显示注册模块的标题和描述信息
 * 创建日期：2024-12-19
 */
<template>
  <div class="register-header">
    <div class="header-content">
      <div class="logo-section">
        <svg-icon icon-class="user-plus" class="header-icon" />
        <h1 class="header-title">用户注册管理</h1>
      </div>
      <p class="header-description">
        欢迎使用用户注册管理系统，请选择相应功能进行操作
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterHeader'
}
</script>

<style lang="scss" scoped>
.register-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 40px;
  text-align: center;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.header-icon {
  font-size: 32px;
  margin-right: 12px;
  color: white;
}

.header-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
}

.header-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .register-header {
    padding: 20px 20px;
  }

  .logo-section {
    flex-direction: column;
    margin-bottom: 10px;
  }

  .header-icon {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .header-title {
    font-size: 24px;
  }

  .header-description {
    font-size: 14px;
  }
}
</style>
