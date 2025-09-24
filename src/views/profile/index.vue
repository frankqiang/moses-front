<!--
  文件名称：index.vue
  文件描述：个人中心页面，提供用户个人信息查看和密码修改功能
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现个人中心基础功能
-->
<template>
  <div class="profile-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="el-icon-user" />
        个人中心
      </h1>
      <p class="page-subtitle">管理您的个人信息和账户设置</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：个人信息展示 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="profile-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-info" />
              个人信息
            </span>
          </div>

          <!-- 用户头像 -->
          <div class="profile-avatar">
            <el-avatar :size="100" :src="userAvatar" class="avatar">
              <i class="el-icon-user-solid" />
            </el-avatar>
          </div>

          <!-- 用户基本信息 -->
          <div class="profile-info">
            <div class="info-item">
              <label>姓名：</label>
              <span>{{ displayName }}</span>
            </div>
            <div class="info-item">
              <label>用户名：</label>
              <span>{{ (userInfo && userInfo.username) || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ (userInfo && userInfo.email) || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>手机：</label>
              <span>{{ (userInfo && userInfo.profile && userInfo.profile.phone) || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>部门：</label>
              <span>{{ (userInfo && userInfo.profile && userInfo.profile.department &&
                userInfo.profile.department.name) || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>岗位：</label>
              <span>{{ (userInfo && userInfo.profile && userInfo.profile.position &&
                userInfo.profile.position.name) || '暂无' }}</span>
            </div>
            <div class="info-item">
              <label>角色：</label>
              <div class="user-roles">
                <el-tag v-for="role in displayRoles" :key="role" size="small" type="primary">
                  {{ role }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：账户设置 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="16">
        <el-card class="settings-card" shadow="hover">
          <div slot="header" class="card-header">
            <span class="card-title">
              <i class="el-icon-setting" />
              账户设置
            </span>
          </div>

          <!-- 安全设置 -->
          <div class="settings-section">
            <h3 class="section-title">
              <i class="el-icon-lock" />
              安全设置
            </h3>
            <div class="setting-item">
              <div class="setting-content">
                <div class="setting-info">
                  <h4>修改密码</h4>
                  <p class="setting-desc">定期修改密码可以提高账户安全性</p>
                </div>
                <div class="setting-action">
                  <el-button type="primary" @click="openChangePasswordDialog">
                    修改密码
                  </el-button>
                </div>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <div class="setting-info">
                  <h4>最后登录</h4>
                  <p class="setting-desc">{{ lastLoginText }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 个人信息设置 -->
          <div class="settings-section">
            <h3 class="section-title">
              <i class="el-icon-edit" />
              个人信息
            </h3>
            <div class="setting-item">
              <div class="setting-content">
                <div class="setting-info">
                  <h4>基本资料</h4>
                  <p class="setting-desc">修改您的基本个人信息</p>
                </div>
                <div class="setting-action">
                  <el-button @click="editProfile">
                    编辑资料
                  </el-button>
                </div>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-content">
                <div class="setting-info">
                  <h4>头像设置</h4>
                  <p class="setting-desc">更换您的个人头像</p>
                </div>
                <div class="setting-action">
                  <el-button @click="changeAvatar">
                    更换头像
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 其他设置 -->
          <div class="settings-section">
            <h3 class="section-title">
              <i class="el-icon-tools" />
              其他设置
            </h3>
            <div class="setting-item">
              <div class="setting-content">
                <div class="setting-info">
                  <h4>系统主题</h4>
                  <p class="setting-desc">选择您喜欢的界面主题</p>
                </div>
                <div class="setting-action">
                  <el-select
                    v-model="selectedTheme"
                    placeholder="选择主题"
                    size="small"
                    style="width: 120px"
                  >
                    <el-option label="默认" value="default" />
                    <el-option label="暗色" value="dark" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户修改密码对话框 -->
    <change-password-dialog
      :visible.sync="changePasswordDialogVisible"
      @success="handleChangePasswordSuccess"
      @close="handleChangePasswordClose"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ChangePasswordDialog from '@/views/user-management/components/ChangePasswordDialog.vue'

export default {
  name: 'Profile',
  components: {
    ChangePasswordDialog
  },
  data() {
    return {
      changePasswordDialogVisible: false,
      selectedTheme: 'default'
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'roles',
      'permissions',
      'userInfo'
    ]),

    /**
         * 用户头像处理
         */
    userAvatar() {
      if (this.avatar) {
        if (this.avatar.startsWith('http')) {
          return this.avatar
        } else {
          return `${this.avatar}?imageView2/1/w/100/h/100`
        }
      } else {
        return this.generateDefaultAvatar(this.displayName)
      }
    },

    /**
         * 显示用户名
         */
    displayName() {
      return this.name || (this.userInfo && this.userInfo.name) || (this.userInfo && this.userInfo.username) || '用户'
    },

    /**
         * 显示用户角色
         */
    displayRoles() {
      if (this.roles && this.roles.length > 0) {
        return this.roles
      } else if (this.userInfo && this.userInfo.roles && this.userInfo.roles.length > 0) {
        return this.userInfo.roles.map(role => role.name || role)
      } else {
        return ['普通用户']
      }
    },

    /**
         * 最后登录时间文本
         */
    lastLoginText() {
      if (this.userInfo && this.userInfo.profile && this.userInfo.profile.lastLoginAt) {
        const lastLogin = new Date(this.userInfo.profile.lastLoginAt)
        return `${lastLogin.toLocaleString()}`
      }
      return '暂无登录记录'
    }
  },
  methods: {
    /**
         * 生成默认头像
         */
    generateDefaultAvatar(name) {
      const firstChar = (name || '用户').charAt(0).toUpperCase()
      const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#87d068', '#108ee9']
      const colorIndex = firstChar.charCodeAt(0) % colors.length
      const bgColor = colors[colorIndex]

      const svg = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="${bgColor}"/>
          <text x="100" y="125" font-family="Arial, sans-serif" font-size="80" fill="white" text-anchor="middle" dominant-baseline="middle">${firstChar}</text>
        </svg>
      `
      return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
    },

    /**
         * 打开修改密码对话框
         */
    openChangePasswordDialog() {
      this.changePasswordDialogVisible = true
    },

    /**
         * 修改密码成功处理
         */
    handleChangePasswordSuccess() {
      this.$message.success('密码修改成功')
      this.changePasswordDialogVisible = false
    },

    /**
         * 修改密码对话框关闭处理
         */
    handleChangePasswordClose() {
      this.changePasswordDialogVisible = false
    },

    /**
         * 编辑个人资料
         */
    editProfile() {
      this.$message.info('个人资料编辑功能开发中...')
      // TODO: 实现个人资料编辑功能
    },

    /**
         * 更换头像
         */
    changeAvatar() {
      this.$message.info('头像更换功能开发中...')
      // TODO: 实现头像更换功能
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.page-header {
    margin-bottom: 24px;

    .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;

        i {
            margin-right: 8px;
            color: #409EFF;
        }
    }

    .page-subtitle {
        font-size: 14px;
        color: #909399;
        margin: 0;
    }
}

.profile-card,
.settings-card {
    margin-bottom: 20px;

    .card-header {
        .card-title {
            font-size: 16px;
            font-weight: 500;
            color: #303133;
            display: flex;
            align-items: center;

            i {
                margin-right: 8px;
                color: #409EFF;
            }
        }
    }
}

.profile-avatar {
    text-align: center;
    margin-bottom: 24px;

    .avatar {
        border: 4px solid #f0f0f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

.profile-info {
    .info-item {
        display: flex;
        align-items: center;
        margin-bottom: 16px;

        label {
            font-weight: 500;
            color: #606266;
            min-width: 60px;
        }

        span {
            color: #303133;
            flex: 1;
        }

        .user-roles {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
    }
}

.settings-section {
    margin-bottom: 32px;

    &:last-child {
        margin-bottom: 0;
    }

    .section-title {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        margin: 0 0 16px 0;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #EBEEF5;
        padding-bottom: 8px;

        i {
            margin-right: 8px;
            color: #409EFF;
        }
    }

    .setting-item {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }

        .setting-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #EBEEF5;

            .setting-info {
                flex: 1;

                h4 {
                    font-size: 14px;
                    font-weight: 500;
                    color: #303133;
                    margin: 0 0 4px 0;
                }

                .setting-desc {
                    font-size: 13px;
                    color: #909399;
                    margin: 0;
                }
            }

            .setting-action {
                margin-left: 16px;
            }
        }
    }
}

@media (max-width: 768px) {
    .profile-container {
        padding: 10px;
    }

    .settings-section .setting-item .setting-content {
        flex-direction: column;
        align-items: flex-start;

        .setting-action {
            margin-left: 0;
            margin-top: 12px;
            width: 100%;
        }
    }
}
</style>

