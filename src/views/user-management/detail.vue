/**
* 文件名称：detail.vue
* 文件描述：用户详情页面，展示用户完整信息包括基本资料、部门岗位、角色信息等
* 创建日期：2024-01-15
* 修改记录：
* - 2024-01-15: 初始创建，实现用户详情展示功能
*/
<template>
  <div class="app-container user-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row type="flex" justify="space-between" align="middle">
        <el-col>
          <div class="header-left">
            <el-button icon="el-icon-arrow-left" class="back-btn" @click="handleBack">
              返回列表
            </el-button>
            <h2 class="page-title">用户详情</h2>
          </div>
        </el-col>
        <el-col>
          <div class="header-actions">
            <el-button v-if="canEdit" type="primary" icon="el-icon-edit" @click="handleEdit">
              编辑用户
            </el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 用户详情内容 -->
    <div v-else-if="userDetail" class="detail-content">
      <!-- 用户基本信息卡片 -->
      <el-card class="info-card basic-info" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-user" />
            基本信息
          </span>
        </div>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <div class="user-avatar-section">
              <el-avatar :size="120" :src="userDetail.avatar" class="user-avatar">
                <i class="el-icon-user-solid" />
              </el-avatar>
              <div v-if="canEdit" class="avatar-actions">
                <el-button size="mini" @click="handleAvatarUpload">
                  <i class="el-icon-camera" />
                  更换头像
                </el-button>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="16" :lg="18">
            <div class="user-basic-info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="姓名">
                  <span class="info-value">{{ userDetail.name }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="用户名">
                  <span class="info-value">{{ userDetail.username }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="邮箱">
                  <span class="info-value">{{ userDetail.email }}</span>
                  <el-tag v-if="userDetail.isEmailVerified" type="success" size="mini" class="status-tag">
                    已验证
                  </el-tag>
                  <el-tag v-else type="warning" size="mini" class="status-tag">
                    未验证
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="手机号码">
                  <span class="info-value">{{ userDetail.phone || '未填写' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="用户角色">
                  <el-tag type="primary" size="small">
                    {{ getRoleText(userDetail.role) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="用户状态">
                  <el-tag :type="getStatusTagType(userDetail.status)" size="small">
                    {{ getStatusText(userDetail.status) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="最后登录">
                  <span class="info-value">
                    {{ userDetail.lastLoginAt ? formatTime(userDetail.lastLoginAt) : '从未登录' }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="最后登录IP">
                  <span class="info-value">{{ userDetail.lastLoginIp || '无记录' }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="登录次数">
                  <span class="info-value">{{ userDetail.loginCount || 0 }} 次</span>
                </el-descriptions-item>
                <el-descriptions-item label="备注信息">
                  <span class="info-value">{{ userDetail.notes || '无备注' }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 部门岗位信息 -->
      <el-card v-if="userDetail.profile" class="info-card department-info" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-office-building" />
            部门岗位信息
          </span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工号">
            <span class="info-value">{{ userDetail.profile.employeeId || '未分配' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="职位">
            <span class="info-value">
              {{ (userDetail.profile.position && userDetail.profile.position.name) || userDetail.profile.jobTitle ||
                '未设置' }}
            </span>
            <el-tag v-if="userDetail.profile.position" type="info" size="mini" class="status-tag">
              {{ userDetail.profile.position.code }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="所属部门">
            <span class="info-value">
              {{ userDetail.profile.department ? userDetail.profile.department.name : '未分配' }}
            </span>
            <el-tag v-if="userDetail.profile.department" type="info" size="mini" class="status-tag">
              {{ userDetail.profile.department.code }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="入职日期">
            <span class="info-value">
              {{ userDetail.profile.hireDate ? formatDate(userDetail.profile.hireDate) : '未设置' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="工作年限">
            <span class="info-value">{{ userDetail.profile.workYears || 0 }} 年</span>
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            <span class="info-value">{{ userDetail.profile.age || '未知' }} 岁</span>
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            <span class="info-value">
              <el-tag :type="getGenderTagType(userDetail.profile.gender)" size="mini">
                {{ getGenderText(userDetail.profile.gender) }}
              </el-tag>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="生日">
            <span class="info-value">
              {{ userDetail.profile.birthDate ? formatDate(userDetail.profile.birthDate) : '未设置' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="联系地址" :span="2">
            <span class="info-value">{{ userDetail.profile.address || '未填写' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="直属上级" :span="2">
            <span v-if="userDetail.profile.manager" class="info-value">
              {{ userDetail.profile.manager.name }}
              <el-tag type="info" size="mini" class="status-tag">
                {{ userDetail.profile.manager.email }}
              </el-tag>
            </span>
            <span v-else class="info-value">无</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 紧急联系人信息 -->
      <el-card v-if="userDetail.profile" class="info-card emergency-info" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-phone" />
            紧急联系人信息
          </span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="紧急联系人">
            <span class="info-value">{{ userDetail.profile.emergencyContact || '未填写' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="紧急联系电话">
            <span class="info-value">{{ userDetail.profile.emergencyPhone || '未填写' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="个人备注" :span="2">
            <span class="info-value">{{ userDetail.profile.notes || '无备注' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 自定义字段信息 -->
      <el-card
        v-if="userDetail.profile && userDetail.profile.customFields && Object.keys(userDetail.profile.customFields).length > 0"
        class="info-card custom-fields-info" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-setting" />
            自定义字段
          </span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="(value, key) in userDetail.profile.customFields" :key="key"
            :label="getCustomFieldLabel(key)">
            <span class="info-value">{{ value || '未填写' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 安全信息 -->
      <el-card class="info-card security-info" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-lock" />
            安全信息
          </span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="失败登录尝试">
            <span class="info-value">
              <el-tag :type="userDetail.failedLoginAttempts > 0 ? 'warning' : 'success'" size="mini">
                {{ userDetail.failedLoginAttempts || 0 }} 次
              </el-tag>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="账户锁定状态">
            <span class="info-value">
              <el-tag :type="userDetail.lockedUntil ? 'danger' : 'success'" size="mini">
                {{ userDetail.lockedUntil ? '已锁定' : '正常' }}
              </el-tag>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="锁定到期时间">
            <span class="info-value">
              {{ userDetail.lockedUntil ? formatTime(userDetail.lockedUntil) : '无' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="密码修改时间">
            <span class="info-value">
              {{ userDetail.passwordChangedAt ? formatTime(userDetail.passwordChangedAt) : '从未修改' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="强制修改密码">
            <span class="info-value">
              <el-tag :type="userDetail.mustChangePassword ? 'warning' : 'success'" size="mini">
                {{ userDetail.mustChangePassword ? '是' : '否' }}
              </el-tag>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="邮箱验证状态">
            <span class="info-value">
              <el-tag :type="userDetail.isEmailVerified ? 'success' : 'warning'" size="mini">
                {{ userDetail.isEmailVerified ? '已验证' : '未验证' }}
              </el-tag>
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 角色权限信息 -->
      <el-card v-if="userDetail.userRoles && userDetail.userRoles.length > 0" class="info-card role-info"
        shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-key" />
            角色权限信息
          </span>
        </div>
        <div class="roles-container">
          <el-row :gutter="16">
            <el-col v-for="userRole in userDetail.userRoles" :key="userRole.id" :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="role-card" shadow="hover">
                <div class="role-header">
                  <h4 class="role-name">{{ userRole.role.name }}</h4>
                  <el-tag :type="userRole.status === 'active' ? 'success' : 'info'" size="mini">
                    {{ userRole.status === 'active' ? '激活' : '停用' }}
                  </el-tag>
                </div>
                <div class="role-details">
                  <p class="role-code">编码：{{ userRole.role.code }}</p>
                  <p class="role-description">{{ userRole.role.description || '暂无描述' }}</p>
                  <p class="role-assigned-time">
                    分配时间：{{ formatTime(userRole.assignedAt) }}
                  </p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- 用户统计信息 -->
      <el-card class="info-card statistics-info" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-data-line" />
            用户统计
          </span>
        </div>
        <el-row :gutter="24">
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.userRoles ? userDetail.userRoles.length : 0 }}</div>
              <div class="stat-label">拥有角色</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.loginCount || 0 }}</div>
              <div class="stat-label">总登录次数</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <div class="stat-item">
              <div class="stat-value">{{ getAccountAge(userDetail.createdAt) }}</div>
              <div class="stat-label">账号使用天数</div>
            </div>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.profile ? userDetail.profile.workYears || 0 : 0 }}</div>
              <div class="stat-label">工作年限</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 系统信息 -->
      <el-card class="info-card system-info" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title">
            <i class="el-icon-time" />
            系统信息
          </span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建时间">
            <span class="info-value">{{ formatTime(userDetail.createdAt) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="最后更新">
            <span class="info-value">{{ formatTime(userDetail.updatedAt) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="用户ID" :span="2">
            <span class="info-value user-id">{{ userDetail.id }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>

    <!-- 数据不存在提示 -->
    <div v-else class="no-data">
      <el-empty description="用户信息不存在或已被删除">
        <el-button type="primary" @click="handleBack">返回列表</el-button>
      </el-empty>
    </div>

    <!-- 头像上传对话框 -->
    <el-dialog title="上传头像" :visible.sync="avatarDialogVisible" width="400px" @close="handleAvatarDialogClose">
      <el-upload class="avatar-uploader" action="" :http-request="handleAvatarUploadRequest" :show-file-list="false"
        :before-upload="beforeAvatarUpload" accept="image/*">
        <img v-if="tempAvatarUrl" :src="tempAvatarUrl" class="avatar-preview">
        <i v-else class="el-icon-plus avatar-uploader-icon" />
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="avatarUploading" @click="handleAvatarSave">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUserDetail, uploadUserAvatar } from './api/user-management'
import { parseTime } from '@/utils'
import { USER_STATUS_MAP } from './constants/user-management'

export default {
  name: 'UserDetail',
  data() {
    return {
      // 页面状态
      loading: true,
      userDetail: null,

      // 头像上传相关
      avatarDialogVisible: false,
      avatarUploading: false,
      tempAvatarUrl: '',
      tempAvatarFile: null
    }
  },
  computed: {
    /**
         * 用户ID - 从路由参数获取
         */
    userId() {
      return this.$route.params.id
    },

    /**
         * 是否可以编辑 - 根据权限判断
         */
    canEdit() {
      // TODO: 根据实际权限系统判断
      return true
    }
  },
  created() {
    this.fetchUserDetail()
  },
  methods: {
    /**
         * 获取用户详情数据
         */
    async fetchUserDetail() {
      try {
        this.loading = true
        const response = await getUserDetail(this.userId)

        if (response.success) {
          this.userDetail = response.data
        } else {
          this.$message.error(response.message || '获取用户详情失败')
          this.userDetail = null
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
        this.$message.error('获取用户详情失败，请稍后重试')
        this.userDetail = null
      } finally {
        this.loading = false
      }
    },

    /**
         * 返回用户列表页面
         */
    handleBack() {
      this.$router.push('/user-management/index')
    },

    /**
         * 编辑用户
         */
    handleEdit() {
      // 跳转回列表页面并触发编辑操作
      this.$router.push({
        path: '/user-management/index',
        query: {
          action: 'edit',
          userId: this.userId
        }
      })
    },

    /**
         * 获取状态标签类型
         */
    getStatusTagType(status) {
      const statusMap = {
        'active': 'success',
        'locked': 'warning',
        'disabled': 'danger',
        'pending': 'info',
        'deleted': 'info'
      }
      return statusMap[status] || 'info'
    },

    /**
         * 获取状态文本
         */
    getStatusText(status) {
      return USER_STATUS_MAP[status] || status
    },

    /**
         * 获取角色文本
         */
    getRoleText(role) {
      const roleMap = {
        'admin': '管理员',
        'user': '普通用户',
        'manager': '经理',
        'supervisor': '主管'
      }
      return roleMap[role] || role
    },

    /**
         * 获取性别标签类型
         */
    getGenderTagType(gender) {
      return gender === 'male' ? 'primary' : gender === 'female' ? 'success' : 'info'
    },

    /**
         * 获取性别文本
         */
    getGenderText(gender) {
      const genderMap = {
        'male': '男',
        'female': '女',
        'other': '其他'
      }
      return genderMap[gender] || '未知'
    },

    /**
         * 获取自定义字段标签
         */
    getCustomFieldLabel(key) {
      const fieldLabelMap = {
        'hobby': '兴趣爱好',
        'skill': '技能专长',
        'education': '教育背景',
        'certification': '认证证书',
        'language': '语言能力',
        'project': '项目经验'
      }
      return fieldLabelMap[key] || key
    },

    /**
         * 格式化时间
         */
    formatTime(time) {
      return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}')
    },

    /**
         * 格式化日期
         */
    formatDate(date) {
      return parseTime(date, '{y}-{m}-{d}')
    },

    /**
         * 计算账号使用天数
         */
    getAccountAge(createdAt) {
      if (!createdAt) return 0
      const created = new Date(createdAt)
      const now = new Date()
      const diffTime = Math.abs(now - created)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    },

    /**
         * 处理头像上传
         */
    handleAvatarUpload() {
      this.avatarDialogVisible = true
      this.tempAvatarUrl = this.userDetail.avatar || ''
    },

    /**
         * 头像上传前验证
         */
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
        return false
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
        return false
      }

      // 预览图片
      const reader = new FileReader()
      reader.onload = (e) => {
        this.tempAvatarUrl = e.target.result
      }
      reader.readAsDataURL(file)
      this.tempAvatarFile = file

      return false // 阻止自动上传
    },

    /**
         * 自定义头像上传请求
         */
    handleAvatarUploadRequest(option) {
      // 这里不执行实际上传，只是为了兼容el-upload组件
      return false
    },

    /**
         * 保存头像
         */
    async handleAvatarSave() {
      if (!this.tempAvatarFile) {
        this.$message.warning('请先选择要上传的图片')
        return
      }

      try {
        this.avatarUploading = true

        // 创建FormData对象
        const formData = new FormData()
        formData.append('avatar', this.tempAvatarFile)

        // 调用头像上传API
        const response = await uploadUserAvatar(this.userId, formData)

        if (response.success) {
          // 更新用户头像URL
          this.userDetail.avatar = response.data.avatarUrl || this.tempAvatarUrl
          this.avatarDialogVisible = false
          this.$message.success('头像上传成功')
        } else {
          this.$message.error(response.message || '头像上传失败')
        }
      } catch (error) {
        console.error('头像上传失败:', error)
        this.$message.error('头像上传失败，请稍后重试')
      } finally {
        this.avatarUploading = false
      }
    },

    /**
         * 关闭头像对话框
         */
    handleAvatarDialogClose() {
      this.tempAvatarUrl = ''
      this.tempAvatarFile = null
    }
  }
}
</script>

<style lang="scss" scoped>
.user-detail {
  .page-header {
    margin-bottom: 24px;

    .header-left {
      display: flex;
      align-items: center;

      .back-btn {
        margin-right: 16px;
      }

      .page-title {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: #303133;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .loading-container {
    padding: 24px;
  }

  .detail-content {
    .info-card {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        .card-title {
          font-size: 16px;
          font-weight: 500;
          color: #303133;

          i {
            margin-right: 8px;
            color: #409EFF;
          }
        }
      }
    }

    .basic-info {
      .user-avatar-section {
        text-align: center;

        .user-avatar {
          margin-bottom: 16px;
          border: 3px solid #f0f0f0;
        }

        .avatar-actions {
          .el-button {
            font-size: 12px;
          }
        }
      }

      .user-basic-info {
        .info-value {
          font-weight: 500;
        }

        .status-tag {
          margin-left: 8px;
        }
      }
    }

    .role-info {
      .roles-container {
        .role-card {
          height: 100%;

          .role-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .role-name {
              margin: 0;
              font-size: 16px;
              color: #303133;
            }
          }

          .role-details {
            .role-code {
              font-size: 13px;
              color: #909399;
              margin: 4px 0;
            }

            .role-description {
              font-size: 14px;
              color: #606266;
              margin: 8px 0;
              line-height: 1.4;
            }

            .role-assigned-time {
              font-size: 12px;
              color: #C0C4CC;
              margin: 4px 0 0 0;
            }
          }
        }
      }
    }

    .statistics-info {
      .stat-item {
        text-align: center;
        padding: 16px 0;

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #409EFF;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .emergency-info {
      .info-value {
        font-weight: 500;
      }
    }

    .security-info {
      .info-value {
        font-weight: 500;
      }
    }

    .custom-fields-info {
      .info-value {
        font-weight: 500;
        color: #606266;
      }
    }

    .system-info {
      .info-value {
        &.user-id {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          background-color: #f5f7fa;
          padding: 4px 8px;
          border-radius: 4px;
        }
      }
    }
  }

  .no-data {
    text-align: center;
    padding: 60px 0;
  }

  // 头像上传样式
  .avatar-uploader {
    text-align: center;

    .avatar-preview {
      width: 178px;
      height: 178px;
      border-radius: 6px;
      display: block;
      margin: 0 auto;
    }

    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      line-height: 178px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &:hover {
        border-color: #409EFF;
        color: #409EFF;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-detail {
    .page-header {
      .header-left {
        flex-direction: column;
        align-items: flex-start;

        .back-btn {
          margin-bottom: 12px;
          margin-right: 0;
        }

        .page-title {
          font-size: 20px;
        }
      }

      .header-actions {
        margin-top: 16px;
      }
    }

    .detail-content {
      .basic-info {
        .user-avatar-section {
          margin-bottom: 24px;
        }
      }

      .statistics-info {
        .stat-item {
          padding: 12px 0;

          .stat-value {
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>
