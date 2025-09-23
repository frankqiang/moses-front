<!--
 * 文件名称：organization-structure/index.vue
 * 文件描述：组织结构管理主页面，作为部门管理和岗位管理的路由容器
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现二级路由容器和标签页切换功能
-->

<template>
  <div class="organization-structure-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-content">
        <div class="page-title">
          <h2>组织结构管理</h2>
          <p class="page-description">
            维护企业的部门层级结构和岗位信息，为数据权限配置和工作流分配提供组织架构支撑
          </p>
        </div>
      </div>
    </div>

    <!-- 标签页导航 -->
    <div class="organization-tabs">
      <el-tabs v-model="activeTab" type="card" class="organization-tabs-container" @tab-click="handleTabClick">
        <el-tab-pane label="部门管理" name="departments">
          <template slot="label">
            <span class="tab-label">
              <i class="el-icon-office-building" />
              部门管理
            </span>
          </template>
        </el-tab-pane>
        <el-tab-pane label="岗位管理" name="positions">
          <template slot="label">
            <span class="tab-label">
              <i class="el-icon-suitcase" />
              岗位管理
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 子路由内容区域 -->
    <div class="organization-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import { permissionMixin } from '@/utils/permission'

export default {
  name: 'OrganizationStructure',
  mixins: [permissionMixin],
  data() {
    return {
      activeTab: 'departments'
    }
  },
  watch: {
    // 监听路由变化，同步标签页状态
    '$route.name': {
      handler(newName) {
        if (newName === 'DepartmentManagement') {
          this.activeTab = 'departments'
        } else if (newName === 'PositionManagement') {
          this.activeTab = 'positions'
        }
      },
      immediate: true
    }
  },
  created() {
    // 页面初始化时根据当前路由设置活跃标签
    this.initActiveTab()
  },
  methods: {
    /**
             * 初始化活跃标签页
             */
    initActiveTab() {
      const routeName = this.$route.name
      if (routeName === 'PositionManagement') {
        this.activeTab = 'positions'
      } else {
        this.activeTab = 'departments'
      }
    },

    /**
             * 处理标签页切换
             * @param {Object} tab - 标签页对象
             */
    handleTabClick(tab) {
      const tabName = tab.name

      // 根据标签页名称跳转到对应路由
      if (tabName === 'departments') {
        this.$router.push({ name: 'DepartmentManagement' })
      } else if (tabName === 'positions') {
        this.$router.push({ name: 'PositionManagement' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.organization-structure-container {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 50px);

    .page-header {
        margin-bottom: 24px;

        .page-header-content {
            background: #fff;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .page-title {
                h2 {
                    margin: 0 0 8px 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: #303133;
                }

                .page-description {
                    margin: 0;
                    font-size: 14px;
                    color: #909399;
                    line-height: 1.5;
                }
            }
        }
    }

    .organization-tabs {
        margin-bottom: 20px;

        .organization-tabs-container {
            background: #fff;
            border-radius: 8px;
            padding: 16px 16px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

            .tab-label {
                display: flex;
                align-items: center;
                gap: 6px;

                i {
                    font-size: 16px;
                }
            }
        }
    }

    .organization-content {
        background: #fff;
        border-radius: 8px;
        min-height: 500px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
}

// 覆盖Element UI标签页样式
::v-deep .el-tabs--card {
    .el-tabs__header {
        margin: 0;
        border-bottom: none;

        .el-tabs__nav {
            border: none;
            border-radius: 0;
        }

        .el-tabs__item {
            border: none;
            border-radius: 6px 6px 0 0;
            margin-right: 4px;
            background: #f5f7fa;
            color: #606266;
            transition: all 0.3s ease;

            &:hover {
                background: #ecf5ff;
                color: #409eff;
            }

            &.is-active {
                background: #409eff;
                color: #fff;
                border-color: #409eff;

                &::before {
                    display: none;
                }
            }
        }
    }

    .el-tabs__content {
        padding: 0;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .organization-structure-container {
        padding: 16px;

        .page-header .page-header-content {
            padding: 20px;

            .page-title h2 {
                font-size: 20px;
            }
        }

        .organization-tabs .organization-tabs-container {
            padding: 12px 12px 0;
        }
    }
}
</style>
