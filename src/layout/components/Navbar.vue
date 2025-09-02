<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="userAvatar" class="user-avatar" :alt="`${name}的头像`">
          <span class="user-name">{{ displayName }}</span>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <!-- 用户信息展示 -->
          <div class="user-info-section">
            <div class="user-detail">
              <img :src="userAvatar" class="user-detail-avatar" :alt="`${name}的头像`">
              <div class="user-detail-info">
                <div class="user-detail-name">{{ displayName }}</div>
                <div class="user-detail-email">{{ (userInfo && userInfo.email) || '暂无邮箱' }}</div>
                <div class="user-detail-roles">
                  <el-tag v-for="role in displayRoles" :key="role" size="mini" type="info">{{ role }}</el-tag>
                </div>
              </div>
            </div>
          </div>
          <el-dropdown-item divided>
            <router-link to="/" class="dropdown-link">
              <i class="el-icon-s-home"></i>
              首页
            </router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <router-link to="/profile" class="dropdown-link">
              <i class="el-icon-user"></i>
              个人中心
            </router-link>
          </el-dropdown-item>
          <el-dropdown-item>
            <router-link to="/settings" class="dropdown-link">
              <i class="el-icon-setting"></i>
              系统设置
            </router-link>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span class="dropdown-link logout-link">
              <i class="el-icon-switch-button"></i>
              退出登录
            </span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'roles',
      'userInfo'
    ]),
    // 处理用户头像，提供默认头像
    userAvatar() {
      if (this.avatar && this.avatar.trim()) {
        // 如果有头像URL，添加图片处理参数
        return this.avatar.includes('?') ? this.avatar : `${this.avatar}?imageView2/1/w/80/h/80`
      }
      // 默认头像 - 使用用户名首字母生成
      return this.generateDefaultAvatar(this.displayName)
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
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    // 生成默认头像
    generateDefaultAvatar(name) {
      const firstChar = (name || '用户').charAt(0).toUpperCase()
      const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#108ee9']
      const colorIndex = firstChar.charCodeAt(0) % colors.length
      const bgColor = colors[colorIndex]

      // 创建SVG头像
      const svg = `
        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" fill="${bgColor}"/>
          <text x="40" y="50" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" dominant-baseline="middle">${firstChar}</text>
        </svg>
      `
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
    },
    async logout() {
      try {
        const result = await this.$store.dispatch('user/logout')
        // 登出成功，显示成功消息
        this.$message({
          message: result.message || '登出成功',
          type: 'success',
          duration: 2000
        })

        // 延迟跳转，让用户看到提示消息
        setTimeout(() => {
          this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        }, 1000)
      } catch (error) {
        // 登出失败，显示错误信息但仍然跳转（因为本地状态已清除）
        this.$message({
          message: error.message || '登出过程中发生错误，但本地状态已清除',
          type: 'warning',
          duration: 3000
        })

        // 即使登出失败也要跳转到登录页，因为本地状态已被清除
        setTimeout(() => {
          this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        }, 1000)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  //height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    //line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px 10px;
        border-radius: 20px;
        transition: background-color 0.3s;

        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          margin-right: 8px;
          object-fit: cover;
        }

        .user-name {
          font-size: 14px;
          color: #606266;
          margin-right: 5px;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .el-icon-caret-bottom {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}

// 用户下拉菜单样式
.user-dropdown {
  .user-info-section {
    padding: 15px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 5px;

    .user-detail {
      display: flex;
      align-items: center;

      .user-detail-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-right: 12px;
        object-fit: cover;
      }

      .user-detail-info {
        flex: 1;

        .user-detail-name {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .user-detail-email {
          font-size: 12px;
          color: #909399;
          margin-bottom: 6px;
        }

        .user-detail-roles {
          .el-tag {
            margin-right: 4px;
            margin-bottom: 2px;
          }
        }
      }
    }
  }

  .dropdown-link {
    display: flex;
    align-items: center;
    color: #606266;
    text-decoration: none;
    width: 100%;
    padding: 0;

    i {
      margin-right: 8px;
      width: 16px;
      text-align: center;
    }

    &:hover {
      color: #409eff;
    }

    &.logout-link {
      color: #f56c6c;
      cursor: pointer;

      &:hover {
        color: #f78989;
      }
    }
  }
}
</style>
