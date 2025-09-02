<template>
  <div class="dashboard-container">
    <el-card class="user-info-card" shadow="hover">
      <div slot="header" class="card-header">
        <span class="card-title">
          <i class="el-icon-user"></i>
          用户信息
        </span>
      </div>
      <div class="user-info-content">
        <div class="user-avatar-section">
          <img :src="userAvatar" class="user-avatar" :alt="`${name}的头像`">
        </div>
        <div class="user-details">
          <div class="user-item">
            <label>用户姓名：</label>
            <span class="user-value">{{ displayName }}</span>
          </div>
          <div class="user-item">
            <label>用户名：</label>
            <span class="user-value">{{ (userInfo && userInfo.username) || '暂无' }}</span>
          </div>
          <div class="user-item">
            <label>邮箱地址：</label>
            <span class="user-value">{{ (userInfo && userInfo.email) || '暂无' }}</span>
          </div>
          <div class="user-item">
            <label>用户角色：</label>
            <div class="user-roles">
              <el-tag v-for="role in displayRoles" :key="role" size="small" type="primary">{{ role }}</el-tag>
            </div>
          </div>
          <div class="user-item">
            <label>用户权限：</label>
            <div class="user-permissions">
              <el-tag v-for="permission in displayPermissions.slice(0, 5)" :key="permission" size="mini" type="info">{{ permission }}</el-tag>
              <el-tag v-if="displayPermissions.length > 5" size="mini" type="warning">+{{ displayPermissions.length - 5 }}个权限</el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card class="welcome-card" shadow="hover">
      <div class="welcome-content">
        <h2 class="welcome-title">欢迎回来，{{ userInfo.name || name || '用户' }}！</h2>
        <p class="welcome-text">今天是美好的一天，让我们开始工作吧。</p>
        <div class="quick-actions">
          <el-button type="primary" icon="el-icon-s-home" @click="goToHome">返回首页</el-button>
          <el-button type="success" icon="el-icon-user" @click="goToProfile">个人中心</el-button>
          <el-button type="info" icon="el-icon-setting" @click="goToSettings">系统设置</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'permissions',
      'userInfo'
    ]),
    // 用户头像处理
    userAvatar() {
      if (this.avatar) {
        // 如果头像URL不包含协议，添加图片处理参数
        if (this.avatar.startsWith('http')) {
          return this.avatar
        } else {
          return `${this.avatar}?imageView2/1/w/80/h/80`
        }
      } else {
        // 生成默认头像
        return this.generateDefaultAvatar(this.displayName)
      }
    },
    
    // 显示用户名（优先级：name > username > 默认值）
    displayName() {
      return this.name || (this.userInfo && this.userInfo.name) || (this.userInfo && this.userInfo.username) || '用户'
    },
    
    // 显示用户角色
    displayRoles() {
      if (this.roles && this.roles.length > 0) {
        return this.roles
      } else if (this.userInfo && this.userInfo.roles && this.userInfo.roles.length > 0) {
        return this.userInfo.roles
      } else {
        return ['普通用户']
      }
    },
    
    // 显示用户权限
    displayPermissions() {
      if (this.permissions && this.permissions.length > 0) {
        return this.permissions
      } else if (this.userInfo && this.userInfo.permissions && this.userInfo.permissions.length > 0) {
        return this.userInfo.permissions
      } else {
        return ['基础权限']
      }
    }
  },
  methods: {
    // 生成默认头像
    generateDefaultAvatar(name) {
      const firstChar = (name || '用户').charAt(0).toUpperCase()
      const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#108ee9']
      const colorIndex = firstChar.charCodeAt(0) % colors.length
      const bgColor = colors[colorIndex]
      
      const svg = `
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="${bgColor}"/>
          <text x="60" y="75" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">${firstChar}</text>
        </svg>
      `
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
    },
    // 导航方法
    goToHome() {
      this.$router.push('/')
    },
    goToProfile() {
      this.$router.push('/profile')
    },
    goToSettings() {
      this.$router.push('/settings')
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  
  .user-info-card {
    margin-bottom: 20px;
    
    .card-header {
      .card-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        
        i {
          margin-right: 8px;
          color: #409eff;
        }
      }
    }
    
    .user-info-content {
      display: flex;
      align-items: flex-start;
      
      .user-avatar-section {
        margin-right: 30px;
        
        .user-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #f0f0f0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
      
      .user-details {
        flex: 1;
        
        .user-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          
          label {
            width: 100px;
            font-weight: 500;
            color: #606266;
            margin-right: 10px;
          }
          
          .user-value {
            color: #303133;
            font-size: 14px;
          }
          
          .user-roles,
          .user-permissions {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            
            .el-tag {
              margin-right: 5px;
              margin-bottom: 5px;
            }
          }
        }
      }
    }
  }
  
  .welcome-card {
    .welcome-content {
      text-align: center;
      padding: 20px;
      
      .welcome-title {
        font-size: 24px;
        color: #303133;
        margin-bottom: 10px;
        font-weight: 500;
      }
      
      .welcome-text {
        font-size: 16px;
        color: #606266;
        margin-bottom: 30px;
        line-height: 1.6;
      }
      
      .quick-actions {
        .el-button {
          margin: 0 10px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
    
    .user-info-content {
      flex-direction: column;
      align-items: center;
      
      .user-avatar-section {
        margin-right: 0;
        margin-bottom: 20px;
      }
      
      .user-details {
        width: 100%;
        
        .user-item {
          flex-direction: column;
          align-items: flex-start;
          
          label {
            width: auto;
            margin-bottom: 5px;
          }
        }
      }
    }
    
    .welcome-content {
      .quick-actions {
        .el-button {
          margin: 5px;
          display: block;
          width: 100%;
        }
      }
    }
  }
}
</style>
