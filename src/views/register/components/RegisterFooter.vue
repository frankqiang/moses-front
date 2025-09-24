/**
 * 注册模块页脚组件
 * 文件描述：显示注册模块的页脚信息和帮助链接
 * 创建日期：2024-12-19
 */
<template>
  <div class="register-footer">
    <div class="footer-content">
      <div class="footer-links">
        <a href="#" class="footer-link" @click.prevent="handleHelpClick">
          <svg-icon icon-class="question" class="link-icon" />
          帮助文档
        </a>
        <a href="#" class="footer-link" @click.prevent="handleContactClick">
          <svg-icon icon-class="phone" class="link-icon" />
          联系客服
        </a>
        <router-link to="/login" class="footer-link">
          <svg-icon icon-class="user" class="link-icon" />
          返回登录
        </router-link>
      </div>
      <div class="footer-info">
        <p class="copyright">
          © 2024 用户注册管理系统. 保留所有权利.
        </p>
        <p class="tips">
          如有疑问，请联系系统管理员或查看帮助文档
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterFooter',
  methods: {
    /**
     * 处理帮助文档点击
     */
    handleHelpClick() {
      // 可以打开帮助文档或显示帮助对话框
      this.$message.info('帮助文档功能开发中...')
    },

    /**
     * 处理联系客服点击
     */
    handleContactClick() {
      // 可以打开客服对话框或显示联系方式
      this.$message.info('客服联系方式：400-123-4567')
    }
  }
}
</script>

<style lang="scss" scoped>
.register-footer {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 30px 40px;
  text-align: center;
}

.footer-content {
  max-width: 600px;
  margin: 0 auto;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.footer-link {
  display: flex;
  align-items: center;
  color: #6c757d;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;

  &:hover {
    color: #667eea;
  }
}

.link-icon {
  font-size: 16px;
  margin-right: 6px;
}

.footer-info {
  color: #6c757d;
}

.copyright {
  font-size: 13px;
  margin: 0 0 8px 0;
}

.tips {
  font-size: 12px;
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .register-footer {
    padding: 20px 20px;
  }

  .footer-links {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .footer-link {
    font-size: 13px;
  }

  .link-icon {
    font-size: 14px;
  }
}
</style>
