/**
 * 登录页面页脚组件
 * 功能描述：显示版权信息和公司信息
 * 创建日期：2024-07-24
 */
<template>
  <div class="login-footer">
    <p>Copyright © {{ currentYear }} 宁波萨科森工业科技有限公司</p>
    <p>版本号: v{{ version }}</p>
  </div>
</template>

<script>
export default {
  name: 'LoginFooter',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    version() {
      return process.env.VUE_APP_VERSION || '1.0.0'
    }
  }
}
</script>

<style lang="scss" scoped>
.login-footer {
  position: relative;
  margin-top: 20px;
  width: 100%;
  text-align: center;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  
  p {
    margin: 0;
    padding: 0;
    
    &:first-child {
      margin-bottom: 5px;
    }
  }
}
</style>