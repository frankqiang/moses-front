<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="role-assignment-dialog">
      <!-- 用户信息 -->
      <div class="user-info-section">
        <div class="section-title">用户信息</div>
        <div class="user-info-card">
          <div class="user-avatar">
            <el-avatar :size="50" :src="userInfo.avatar">
              {{ userInfo.name ? userInfo.name.charAt(0) : 'U' }}
            </el-avatar>
          </div>
          <div class="user-details">
            <div class="user-name">{{ userInfo.name }}</div>
            <div class="user-meta">
              <span class="user-username">@{{ userInfo.username }}</span>
              <span class="user-department">{{ userInfo.departmentName || '未分配部门' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 当前角色 -->
      <div class="current-roles-section">
        <div class="section-title">
          当前角色
          <span class="role-count">({{ currentRoles.length }})</span>
        </div>
        <div v-if="currentRoles.length === 0" class="empty-roles">
          <el-empty description="暂未分配任何角色" :image-size="80" />
        </div>
        <div v-else class="roles-list">
          <div v-for="role in currentRoles" :key="role.id" class="role-item current-role">
            <div class="role-content">
              <div class="role-header">
                <span class="role-name">{{ role.name }}</span>
                <el-tag :type="getRoleTypeTag(role.type)" size="mini">
                  {{ getRoleTypeText(role.type) }}
                </el-tag>
              </div>
              <div class="role-description">{{ role.description || '无描述' }}</div>
              <div class="role-meta">
                <span class="role-code">{{ role.code }}</span>
                <span class="role-level">级别: {{ role.level || 1 }}</span>
              </div>
            </div>
            <div class="role-actions">
              <el-button
                type="danger"
                size="mini"
                icon="el-icon-delete"
                :loading="removing === role.id"
                :disabled="isRemoving || isAssigning"
                @click="handleRemoveRole(role)"
              >
                移除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 可分配角色 -->
      <div class="available-roles-section">
        <div class="section-title">
          可分配角色
          <span class="role-count">({{ availableRoles.length }})</span>
        </div>
        <div class="roles-filter">
          <el-input
            v-model="roleFilter"
            placeholder="搜索角色名称或描述"
            size="small"
            prefix-icon="el-icon-search"
            clearable
            @input="handleFilterRoles"
          />
        </div>
        <div v-if="filteredAvailableRoles.length === 0" class="empty-roles">
          <el-empty description="没有可分配的角色" :image-size="80" />
        </div>
        <div v-else class="roles-list">
          <div v-for="role in filteredAvailableRoles" :key="role.id" class="role-item available-role">
            <div class="role-content">
              <div class="role-header">
                <span class="role-name">{{ role.name }}</span>
                <el-tag :type="getRoleTypeTag(role.type)" size="mini">
                  {{ getRoleTypeText(role.type) }}
                </el-tag>
              </div>
              <div class="role-description">{{ role.description || '无描述' }}</div>
              <div class="role-meta">
                <span class="role-code">{{ role.code }}</span>
                <span class="role-level">级别: {{ role.level || 1 }}</span>
                <span v-if="role.userCount !== undefined" class="user-count">
                  已分配: {{ role.userCount }}人
                </span>
              </div>
            </div>
            <div class="role-actions">
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                :loading="assigning === role.id"
                :disabled="isRemoving || isAssigning"
                @click="handleAssignRole(role)"
              >
                分配
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button :disabled="isRemoving || isAssigning" @click="handleClose">
        关闭
      </el-button>
      <el-button type="primary" :loading="loading" @click="handleRefresh">
        刷新
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { debounce } from '@/utils'
import { getAvailableRoles, getUserRoles, assignRolesToUser, removeUserRole } from '../api'

export default {
  name: 'RoleAssignmentDialog',
  props: {
    // 对话框可见性
    visible: {
      type: Boolean,
      default: false
    },
    // 用户信息
    userInfo: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      // 对话框可见性
      dialogVisible: false,
      // 加载状态
      loading: false,
      // 当前用户角色
      currentRoles: [],
      // 可分配角色
      availableRoles: [],
      // 角色筛选关键词
      roleFilter: '',
      // 移除角色操作状态
      removing: null,
      isRemoving: false,
      // 分配角色操作状态
      assigning: null,
      isAssigning: false
    }
  },
  computed: {
    // 对话框标题
    dialogTitle() {
      return `角色分配 - ${this.userInfo.name || '未知用户'}`
    },
    // 筛选后的可分配角色
    filteredAvailableRoles() {
      if (!this.roleFilter.trim()) {
        return this.availableRoles
      }
      const filter = this.roleFilter.toLowerCase()
      return this.availableRoles.filter(role =>
        role.name.toLowerCase().includes(filter) ||
                role.code.toLowerCase().includes(filter) ||
                (role.description && role.description.toLowerCase().includes(filter))
      )
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
        if (newVal) {
          this.loadData()
        }
      },
      immediate: true
    },
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('update:visible', false)
      }
    }
  },
  created() {
    // 创建防抖搜索函数
    this.handleFilterRoles = debounce(this.filterRoles, 300)
  },
  methods: {
    /**
         * 加载数据
         */
    async loadData() {
      if (!this.userInfo.id) {
        this.$message.error('用户信息不完整')
        return
      }

      this.loading = true
      try {
        await Promise.all([
          this.loadCurrentRoles(),
          this.loadAvailableRoles()
        ])
      } catch (error) {
        console.error('加载角色数据失败:', error)
        this.$message.error('加载角色数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    /**
         * 加载用户当前角色
         */
    async loadCurrentRoles() {
      try {
        const response = await getUserRoles(this.userInfo.id)
        if (response.success) {
          this.currentRoles = response.data || []
        } else {
          throw new Error(response.message || '获取用户角色失败')
        }
      } catch (error) {
        console.error('获取用户角色失败:', error)
        throw error
      }
    },

    /**
         * 加载可分配角色
         */
    async loadAvailableRoles() {
      try {
        const response = await getAvailableRoles({
          includeUserCount: true,
          sortBy: 'name:asc'
        })
        if (response.success) {
          const allRoles = response.data.results || []
          // 过滤掉已分配的角色
          const currentRoleIds = this.currentRoles.map(role => role.id)
          this.availableRoles = allRoles.filter(role =>
            !currentRoleIds.includes(role.id)
          )
        } else {
          throw new Error(response.message || '获取角色列表失败')
        }
      } catch (error) {
        console.error('获取角色列表失败:', error)
        throw error
      }
    },

    /**
         * 分配角色
         */
    async handleAssignRole(role) {
      if (!role || !role.id) {
        this.$message.error('角色信息不完整')
        return
      }

      try {
        await this.$confirm(
          `确定要为用户 "${this.userInfo.name}" 分配角色 "${role.name}" 吗？`,
          '确认分配角色',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        this.assigning = role.id
        this.isAssigning = true

        const response = await assignRolesToUser(this.userInfo.id, {
          roleIds: [role.id]
        })

        if (response.success) {
          this.$message.success('角色分配成功')
          // 将角色从可分配列表移到当前角色列表
          this.currentRoles.push(role)
          this.availableRoles = this.availableRoles.filter(r => r.id !== role.id)
          // 触发角色更新事件
          this.$emit('role-updated', {
            userId: this.userInfo.id,
            action: 'assign',
            role: role
          })
        } else {
          throw new Error(response.message || '角色分配失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('分配角色失败:', error)
          this.$message.error(error.message || '角色分配失败，请稍后重试')
        }
      } finally {
        this.assigning = null
        this.isAssigning = false
      }
    },

    /**
         * 移除角色
         */
    async handleRemoveRole(role) {
      if (!role || !role.id) {
        this.$message.error('角色信息不完整')
        return
      }

      try {
        await this.$confirm(
          `确定要移除用户 "${this.userInfo.name}" 的角色 "${role.name}" 吗？`,
          '确认移除角色',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        this.removing = role.id
        this.isRemoving = true

        const response = await removeUserRole(this.userInfo.id, role.id)

        if (response.success) {
          this.$message.success('角色移除成功')
          // 将角色从当前角色列表移到可分配列表
          this.currentRoles = this.currentRoles.filter(r => r.id !== role.id)
          this.availableRoles.push(role)
          // 按名称排序
          this.availableRoles.sort((a, b) => a.name.localeCompare(b.name))
          // 触发角色更新事件
          this.$emit('role-updated', {
            userId: this.userInfo.id,
            action: 'remove',
            role: role
          })
        } else {
          throw new Error(response.message || '角色移除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('移除角色失败:', error)
          this.$message.error(error.message || '角色移除失败，请稍后重试')
        }
      } finally {
        this.removing = null
        this.isRemoving = false
      }
    },

    /**
         * 筛选角色
         */
    filterRoles() {
      // 防抖处理，实际筛选逻辑在computed中
    },

    /**
         * 刷新数据
         */
    async handleRefresh() {
      await this.loadData()
      this.$message.success('数据已刷新')
    },

    /**
         * 关闭对话框
         */
    handleClose() {
      this.dialogVisible = false
      // 清空筛选条件
      this.roleFilter = ''
    },

    /**
         * 获取角色类型标签样式
         */
    getRoleTypeTag(type) {
      const typeMap = {
        system: 'danger',
        custom: 'primary'
      }
      return typeMap[type] || 'info'
    },

    /**
         * 获取角色类型文本
         */
    getRoleTypeText(type) {
      const typeMap = {
        system: '系统角色',
        custom: '自定义角色'
      }
      return typeMap[type] || '未知类型'
    }
  }
}
</script>

<style lang="scss" scoped>
.role-assignment-dialog {
    max-height: 600px;
    overflow-y: auto;

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e4e7ed;

        .role-count {
            font-size: 14px;
            color: #909399;
            font-weight: normal;
        }
    }

    .user-info-section {
        margin-bottom: 24px;

        .user-info-card {
            display: flex;
            align-items: center;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e4e7ed;

            .user-avatar {
                margin-right: 16px;
            }

            .user-details {
                flex: 1;

                .user-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 4px;
                }

                .user-meta {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    color: #606266;

                    .user-username {
                        margin-right: 16px;
                    }

                    .user-department {
                        color: #909399;
                    }
                }
            }
        }
    }

    .current-roles-section,
    .available-roles-section {
        margin-bottom: 24px;
    }

    .roles-filter {
        margin-bottom: 12px;
    }

    .empty-roles {
        text-align: center;
        padding: 24px;
        color: #909399;
    }

    .roles-list {
        max-height: 300px;
        overflow-y: auto;

        .role-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 6px;
            transition: all 0.2s;

            &.current-role {
                background: #f0f9ff;
                border: 1px solid #bfdbfe;

                &:hover {
                    background: #e0f2fe;
                }
            }

            &.available-role {
                background: #f9fafb;
                border: 1px solid #e5e7eb;

                &:hover {
                    background: #f3f4f6;
                }
            }

            .role-content {
                flex: 1;

                .role-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 4px;

                    .role-name {
                        font-size: 14px;
                        font-weight: 600;
                        color: #303133;
                        margin-right: 8px;
                    }
                }

                .role-description {
                    font-size: 13px;
                    color: #606266;
                    margin-bottom: 4px;
                    line-height: 1.4;
                }

                .role-meta {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #909399;

                    span {
                        margin-right: 12px;

                        &:last-child {
                            margin-right: 0;
                        }
                    }
                }
            }

            .role-actions {
                margin-left: 12px;
            }
        }
    }
}

.dialog-footer {
    text-align: right;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
}
</style>
