<!--
 * 文件名称：RoutingHistoryDialog.vue
 * 文件描述：工艺路线历史记录对话框组件，用于展示工艺路线的变更历史和审批历史
 * 创建日期：2024-01-01
 * 修改记录：
 *   - 2024-01-01: 重构组件，修复模板语法错误
-->
<template>
  <base-drawer
    :visible="visible"
    :title="drawerTitle"
    width="1000px"
    direction="rtl"
    :before-close="handleClose"
    :show-footer="false"
    class="routing-history-drawer"
    @close="handleClose"
  >
    <!-- 抽屉头部自定义内容 -->
    <template #title>
      <div class="drawer-title">
        <div class="title-content">
          <i class="el-icon-time title-icon" />
          <span class="title-text">{{ drawerTitle }}</span>
        </div>
        <div class="title-actions">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-refresh"
            :loading="isRefreshing"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </div>
      </div>
    </template>

    <div class="history-container">
      <!-- 工艺路线信息卡片 -->
      <div class="routing-info-card">
        <div class="info-header">
          <div class="routing-basic">
            <h3 class="routing-name">{{ routingData && routingData.name ? routingData.name : '未命名工艺路线' }}</h3>
            <span class="routing-code">编码: {{ routingData && routingData.code ? routingData.code : 'N/A' }}</span>
          </div>
          <div class="routing-meta">
            <el-tag
              :type="getStatusTagType(routingData && routingData.status ? routingData.status : '')"
              size="medium"
            >
              {{ getStatusLabel(routingData && routingData.status ? routingData.status : '') }}
            </el-tag>
            <div class="version-info">
              当前版本: {{ routingData && routingData.version ? routingData.version : '1.0' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 标签页容器 -->
      <div class="tabs-container">
        <el-tabs v-model="activeTab" type="card" class="history-tabs" @tab-click="handleTabClick">
          <!-- 变更历史标签页 -->
          <el-tab-pane name="changelog">
            <span slot="label">
              <i class="el-icon-document" />
              变更历史
              <el-badge v-if="changelogList.length" :value="changelogList.length" class="tab-badge" />
            </span>

            <div class="tab-content">
              <!-- 变更历史列表 -->
              <div v-if="changelogLoading" class="loading-container">
                <div class="loading-content">
                  <el-skeleton :rows="3" animated />
                  <el-skeleton :rows="2" animated />
                </div>
              </div>

              <div v-else-if="!changelogList.length" class="empty-container">
                <div class="empty-icon">
                  <i class="el-icon-document-remove" />
                </div>
                <el-empty description="暂无变更记录">
                  <template slot="description">
                    <p>该工艺路线还没有任何变更记录</p>
                  </template>
                </el-empty>
              </div>

              <div v-else class="timeline-container">
                <div class="timeline-wrapper">
                  <div
                    v-for="(item, index) in changelogList"
                    :key="index"
                    class="timeline-item"
                  >
                    <div class="timeline-dot" :class="'dot-' + getChangelogType(item.type)">
                      <i :class="getChangelogIcon(item.type)" />
                    </div>
                    <div class="timeline-content">
                      <div class="content-card">
                        <div class="card-header">
                          <div class="header-left">
                            <span class="change-type">{{ getChangelogTypeLabel(item.type) }}</span>
                            <span class="timestamp">{{ formatDateTime(item.timestamp) }}</span>
                          </div>
                          <div class="header-right">
                            <el-tag size="mini" :type="getChangelogTagType(item.type)">
                              {{ item.version || 'V1.0' }}
                            </el-tag>
                          </div>
                        </div>
                        <div class="card-body">
                          <p class="description">{{ item.description }}</p>
                          <div v-if="item.details && item.details.length > 0" class="details-section">
                            <el-collapse>
                              <el-collapse-item title="查看详细变更" name="details">
                                <div class="details-content">
                                  <div v-for="(detail, idx) in item.details" :key="idx" class="detail-item">
                                    <i class="el-icon-right detail-icon" />
                                    <span>{{ detail }}</span>
                                  </div>
                                </div>
                              </el-collapse-item>
                            </el-collapse>
                          </div>
                        </div>
                        <div class="card-footer">
                          <div class="operator-info">
                            <i class="el-icon-user" />
                            <span>{{ item.operator || '系统' }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 审批历史标签页 -->
          <el-tab-pane name="approval">
            <span slot="label">
              <i class="el-icon-circle-check" />
              审批历史
              <el-badge v-if="approvalList.length" :value="approvalList.length" class="tab-badge" />
            </span>

            <div class="tab-content">
              <!-- 审批历史列表 -->
              <div v-if="approvalLoading" class="loading-container">
                <div class="loading-content">
                  <el-skeleton :rows="3" animated />
                  <el-skeleton :rows="2" animated />
                </div>
              </div>

              <div v-else-if="!approvalList.length" class="empty-container">
                <div class="empty-icon">
                  <i class="el-icon-circle-close" />
                </div>
                <el-empty description="暂无审批记录">
                  <template slot="description">
                    <p>该工艺路线还没有任何审批记录</p>
                  </template>
                </el-empty>
              </div>

              <div v-else class="timeline-container">
                <div class="timeline-wrapper">
                  <div
                    v-for="(item, index) in approvalList"
                    :key="index"
                    class="timeline-item"
                  >
                    <div class="timeline-dot" :class="'dot-' + getApprovalType(item.action)">
                      <i :class="getApprovalIcon(item.action)" />
                    </div>
                    <div class="timeline-content">
                      <div class="content-card">
                        <div class="card-header">
                          <div class="header-left">
                            <span class="approval-action">{{ getApprovalActionLabel(item.action) }}</span>
                            <span class="timestamp">{{ formatDateTime(item.timestamp) }}</span>
                          </div>
                          <div class="header-right">
                            <el-tag :type="getApprovalTagType(item.action)" size="mini">
                              {{ getApprovalStatusLabel(item.action) }}
                            </el-tag>
                          </div>
                        </div>
                        <div class="card-body">
                          <div v-if="item.comments" class="comments-section">
                            <div class="section-title">
                              <i class="el-icon-chat-line-square" />
                              <span>审批意见</span>
                            </div>
                            <p class="comments-content">{{ item.comments }}</p>
                          </div>
                          <div v-if="item.rejectReason" class="reject-section">
                            <div class="section-title">
                              <i class="el-icon-warning" />
                              <span>驳回原因</span>
                            </div>
                            <p class="reject-content">{{ item.rejectReason }}</p>
                          </div>
                        </div>
                        <div class="card-footer">
                          <div class="approver-info">
                            <i class="el-icon-user" />
                            <span>{{ item.approver || '系统' }}</span>
                            <span v-if="item.role" class="role-info">（{{ item.role }}）</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </base-drawer>
</template>

<script>
import { getRoutingHistory, getRoutingApprovalHistory } from '../api'
import BaseDrawer from '@/components/Drawer'

export default {
  name: 'RoutingHistoryDialog',
  components: {
    BaseDrawer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    routingData: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      activeTab: 'changelog',
      changelogList: [],
      approvalList: [],
      changelogLoading: false,
      approvalLoading: false,
      isRefreshing: false
    }
  },
  computed: {
    drawerTitle() {
      if (this.routingData) {
        return '历史记录 - ' + this.routingData.name
      }
      return '历史记录'
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.routingData) {
        this.loadHistoryData()
      }
    },
    routingData(newVal) {
      if (newVal && this.visible) {
        this.loadHistoryData()
      }
    }
  },
  methods: {
    /**
     * 加载历史数据
     */
    loadHistoryData() {
      if (this.activeTab === 'changelog') {
        this.loadChangelogHistory()
      } else if (this.activeTab === 'approval') {
        this.loadApprovalHistory()
      }
    },

    /**
     * 加载变更历史
     */
    async loadChangelogHistory() {
      this.changelogLoading = true
      try {
        const response = await getRoutingHistory(this.routingData.id)
        this.changelogList = response.data || []
      } catch (error) {
        console.error('加载变更历史失败:', error)
        this.$message.error('加载变更历史失败')
        this.changelogList = []
      } finally {
        this.changelogLoading = false
      }
    },

    /**
     * 加载审批历史
     */
    async loadApprovalHistory() {
      this.approvalLoading = true
      try {
        const response = await getRoutingApprovalHistory(this.routingData.id)
        this.approvalList = response.data || []
      } catch (error) {
        console.error('加载审批历史失败:', error)
        this.$message.error('加载审批历史失败')
        this.approvalList = []
      } finally {
        this.approvalLoading = false
      }
    },

    /**
     * 处理标签页点击
     * @param {Object} tab - 标签页对象
     */
    handleTabClick(tab) {
      this.activeTab = tab.name
      this.loadHistoryData()
    },

    /**
     * 处理刷新
     */
    async handleRefresh() {
      this.isRefreshing = true
      try {
        await this.loadHistoryData()
        this.$message.success('数据刷新成功')
      } catch (error) {
        this.$message.error('数据刷新失败')
      } finally {
        this.isRefreshing = false
      }
    },

    /**
     * 处理关闭
     */
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },

    /**
     * 格式化日期时间
     * @param {string} timestamp - 时间戳
     * @returns {string} 格式化后的日期时间
     */
    formatDateTime(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    /**
     * 获取变更类型对应的时间线类型
     * @param {string} type - 变更类型
     * @returns {string} 时间线类型
     */
    getChangelogType(type) {
      const typeMap = {
        'create': 'success',
        'update': 'primary',
        'version': 'warning',
        'delete': 'danger'
      }
      return typeMap[type] || 'info'
    },

    /**
     * 获取变更类型标签
     * @param {string} type - 变更类型
     * @returns {string} 类型标签
     */
    getChangelogTypeLabel(type) {
      const labelMap = {
        'create': '创建',
        'update': '修改',
        'version': '版本变更',
        'delete': '删除'
      }
      return labelMap[type] || type
    },

    /**
     * 获取审批操作对应的时间线类型
     * @param {string} action - 审批操作
     * @returns {string} 时间线类型
     */
    getApprovalType(action) {
      const typeMap = {
        'submit': 'primary',
        'approve': 'success',
        'reject': 'danger',
        'withdraw': 'warning'
      }
      return typeMap[action] || 'info'
    },

    /**
     * 获取审批操作标签
     * @param {string} action - 审批操作
     * @returns {string} 操作标签
     */
    getApprovalActionLabel(action) {
      const labelMap = {
        'submit': '提交审批',
        'approve': '批准',
        'reject': '驳回',
        'withdraw': '撤回',
        'archive': '归档'
      }
      return labelMap[action] || action
    },

    /**
     * 获取审批状态标签
     * @param {string} action - 审批操作
     * @returns {string} 状态标签
     */
    getApprovalStatusLabel(action) {
      const labelMap = {
        'submit': '已提交',
        'approve': '已批准',
        'reject': '已驳回',
        'withdraw': '已撤回',
        'archive': '已归档'
      }
      return labelMap[action] || action
    },

    /**
     * 获取审批标签类型
     * @param {string} action - 审批操作
     * @returns {string} 标签类型
     */
    getApprovalTagType(action) {
      const typeMap = {
        'submit': 'primary',
        'approve': 'success',
        'reject': 'danger',
        'withdraw': 'warning',
        'archive': 'info'
      }
      return typeMap[action] || 'info'
    },

    /**
     * 获取状态标签类型
     * @param {string} status - 状态
     * @returns {string} 标签类型
     */
    getStatusTagType(status) {
      const typeMap = {
        'Draft': 'info',
        'PendingApproval': 'warning',
        'Enabled': 'success',
        'Rejected': 'danger',
        'Archived': '',
        // 兼容小写
        'draft': 'info',
        'pending': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'archived': ''
      }
      return typeMap[status] || 'info'
    },

    /**
     * 获取状态标签
     * @param {string} status - 状态
     * @returns {string} 状态标签
     */
    getStatusLabel(status) {
      const labelMap = {
        'Draft': '草稿',
        'PendingApproval': '待审批',
        'Enabled': '已生效',
        'Rejected': '已驳回',
        'Archived': '已归档',
        // 兼容小写
        'draft': '草稿',
        'pending': '待审批',
        'approved': '已批准',
        'rejected': '已驳回',
        'archived': '已归档'
      }
      return labelMap[status] || '未知'
    },

    /**
     * 获取变更类型图标
     * @param {string} type - 变更类型
     * @returns {string} 图标类名
     */
    getChangelogIcon(type) {
      const iconMap = {
        'create': 'el-icon-plus',
        'update': 'el-icon-edit',
        'version': 'el-icon-s-promotion',
        'delete': 'el-icon-delete'
      }
      return iconMap[type] || 'el-icon-info'
    },

    /**
     * 获取变更类型标签类型
     * @param {string} type - 变更类型
     * @returns {string} 标签类型
     */
    getChangelogTagType(type) {
      const typeMap = {
        'create': 'success',
        'update': 'primary',
        'version': 'warning',
        'delete': 'danger'
      }
      return typeMap[type] || 'info'
    },

    /**
     * 获取审批操作图标
     * @param {string} action - 审批操作
     * @returns {string} 图标类名
     */
    getApprovalIcon(action) {
      const iconMap = {
        'submit': 'el-icon-upload',
        'approve': 'el-icon-check',
        'reject': 'el-icon-close',
        'withdraw': 'el-icon-back',
        'archive': 'el-icon-box'
      }
      return iconMap[action] || 'el-icon-info'
    }
  }
}
</script>

<style lang="scss" scoped>
.routing-history-drawer {
  // 抽屉头部样式
  .drawer-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .title-content {
      display: flex;
      align-items: center;

      .title-icon {
        font-size: 18px;
        color: #409eff;
        margin-right: 8px;
      }

      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .title-actions {
      margin-right: 30px;

      .el-button {
        padding: 6px 12px;
        font-size: 13px;
      }
    }
  }
}

.history-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  // 工艺路线信息卡片
  .routing-info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    color: white;

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .routing-basic {
        flex: 1;

        .routing-name {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .routing-code {
          font-size: 14px;
          opacity: 0.9;
        }
      }

      .routing-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;

        .version-info {
          font-size: 13px;
          opacity: 0.9;
        }
      }
    }
  }

  // 标签页容器
  .tabs-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .tab-content {
      flex: 1;
      min-height: 0;

      // 加载状态
      .loading-container {
        padding: 20px;

        .loading-content {
          .el-skeleton {
            margin-bottom: 16px;
          }
        }
      }

      // 空状态
      .empty-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;

        .empty-icon {
          margin-bottom: 16px;

          i {
            font-size: 64px;
            color: #c0c4cc;
          }
        }
      }

      // 时间线容器
      .timeline-container {
        padding: 20px;

        .timeline-wrapper {
          position: relative;

          .timeline-item {
            display: flex;
            margin-bottom: 24px;
            position: relative;

            &:not(:last-child)::before {
              content: '';
              position: absolute;
              left: 15px;
              top: 40px;
              bottom: -24px;
              width: 2px;
              background: #e4e7ed;
            }

            .timeline-dot {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid;
              background: white;
              position: relative;
              z-index: 1;

              &.dot-success {
                border-color: #67c23a;
                background: #f0f9ff;

                i {
                  color: #67c23a;
                }
              }

              &.dot-primary {
                border-color: #409eff;
                background: #ecf5ff;

                i {
                  color: #409eff;
                }
              }

              &.dot-warning {
                border-color: #e6a23c;
                background: #fdf6ec;

                i {
                  color: #e6a23c;
                }
              }

              &.dot-danger {
                border-color: #f56c6c;
                background: #fef0f0;

                i {
                  color: #f56c6c;
                }
              }

              &.dot-info {
                border-color: #909399;
                background: #f4f4f5;

                i {
                  color: #909399;
                }
              }
            }

            .timeline-content {
              flex: 1;
              margin-left: 16px;

              .content-card {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                transition: all 0.3s ease;

                &:hover {
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                  transform: translateY(-2px);
                }

                .card-header {
                  background: #f8f9fa;
                  padding: 12px 16px;
                  border-bottom: 1px solid #e9ecef;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;

                  .header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;

                    .change-type,
                    .approval-action {
                      font-weight: 600;
                      color: #303133;
                      font-size: 14px;
                    }

                    .timestamp {
                      font-size: 12px;
                      color: #909399;
                    }
                  }
                }

                .card-body {
                  padding: 16px;

                  .description {
                    margin: 0 0 12px 0;
                    color: #606266;
                    line-height: 1.6;
                  }

                  .details-section {
                    margin-top: 12px;

                    .details-content {
                      .detail-item {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;

                        .detail-icon {
                          color: #409eff;
                          margin-right: 8px;
                          font-size: 12px;
                        }

                        span {
                          color: #606266;
                          font-size: 13px;
                        }
                      }
                    }
                  }

                  .comments-section,
                  .reject-section {
                    margin-bottom: 16px;

                    .section-title {
                      display: flex;
                      align-items: center;
                      margin-bottom: 8px;

                      i {
                        margin-right: 6px;
                        color: #409eff;
                      }

                      span {
                        font-weight: 600;
                        color: #303133;
                        font-size: 13px;
                      }
                    }

                    .comments-content,
                    .reject-content {
                      margin: 0;
                      padding: 8px 12px;
                      background: #f8f9fa;
                      border-radius: 4px;
                      color: #606266;
                      font-size: 13px;
                      line-height: 1.5;
                    }
                  }

                  .reject-section {
                    .section-title i {
                      color: #f56c6c;
                    }

                    .reject-content {
                      background: #fef0f0;
                      border-left: 3px solid #f56c6c;
                    }
                  }
                }

                .card-footer {
                  background: #f8f9fa;
                  padding: 8px 16px;
                  border-top: 1px solid #e9ecef;

                  .operator-info,
                  .approver-info {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #909399;

                    i {
                      margin-right: 4px;
                    }

                    .role-info {
                      margin-left: 4px;
                      color: #606266;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

// 标签页样式优化
.history-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;

  ::v-deep .el-tabs__header {
    margin: 0 0 20px 0;
    flex-shrink: 0;

    .el-tabs__nav {
      border: none;

      .el-tabs__item {
        border: 1px solid #e4e7ed;
        border-radius: 6px 6px 0 0;
        margin-right: 8px;
        padding: 0 20px;
        height: 40px;
        line-height: 38px;

        &.is-active {
          background: #409eff;
          color: white;
          border-color: #409eff;
        }

        .tab-badge {
          margin-left: 8px;
        }
      }
    }
  }

  ::v-deep .el-tabs__content {
    flex: 1;
    min-height: 0;
    overflow: hidden;

    .el-tab-pane {
      height: 100%;
      overflow-y: auto;
    }
  }
}
</style>
