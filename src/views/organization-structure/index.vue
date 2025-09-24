<!--
 * 文件名称：organization-structure/index.vue
 * 文件描述：组织结构管理主页面，提供部门管理和岗位管理的导航入口
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 重构为导航页面，分离部门和岗位管理模块
-->

<template>
  <div class="organization-structure">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <i class="el-icon-office-building" />
        组织结构管理
      </h1>
      <p class="page-description">
        管理企业的组织架构，包括部门层级关系和岗位配置
      </p>
    </div>

    <!-- 模块导航卡片 -->
    <div class="module-cards">
      <!-- 部门管理卡片 -->
      <div v-if="hasPermission('getDepartments')" class="module-card department-card" @click="goToDepartments">
        <div class="card-icon">
          <i class="el-icon-office-building" />
        </div>
        <div class="card-content">
          <h3 class="card-title">部门管理</h3>
          <p class="card-description">
            管理企业部门结构，支持树形层级关系维护、部门负责人设置和状态管理
          </p>
          <div class="card-features">
            <span class="feature-tag">树形结构</span>
            <span class="feature-tag">层级管理</span>
            <span class="feature-tag">负责人设置</span>
            <span class="feature-tag">批量操作</span>
          </div>
        </div>
        <div class="card-arrow">
          <i class="el-icon-arrow-right" />
        </div>
      </div>

      <!-- 岗位管理卡片 -->
      <div v-if="hasPermission('getPositions')" class="module-card position-card" @click="goToPositions">
        <div class="card-icon">
          <i class="el-icon-suitcase" />
        </div>
        <div class="card-content">
          <h3 class="card-title">岗位管理</h3>
          <p class="card-description">
            管理企业岗位信息，支持岗位分类、级别设置、部门关联和员工分配
          </p>
          <div class="card-features">
            <span class="feature-tag">岗位分类</span>
            <span class="feature-tag">级别管理</span>
            <span class="feature-tag">部门关联</span>
            <span class="feature-tag">状态控制</span>
          </div>
        </div>
        <div class="card-arrow">
          <i class="el-icon-arrow-right" />
        </div>
      </div>
    </div>

    <!-- 统计信息 -->
    <div v-if="showStats" class="stats-section">
      <h2 class="stats-title">组织概览</h2>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon department-stat">
            <i class="el-icon-office-building" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.departmentCount }}</div>
            <div class="stat-label">部门总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon position-stat">
            <i class="el-icon-suitcase" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.positionCount }}</div>
            <div class="stat-label">岗位总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active-stat">
            <i class="el-icon-check" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.activeCount }}</div>
            <div class="stat-label">启用状态</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无权限提示 -->
    <div v-if="!hasAnyPermission" class="no-permission">
      <el-empty description="您没有组织结构管理权限" image-size="120">
        <el-button type="primary" @click="$router.push('/')">
          返回首页
        </el-button>
      </el-empty>
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
      // 统计数据
      stats: {
        departmentCount: 0,
        positionCount: 0,
        activeCount: 0
      },
      // 是否显示统计信息
      showStats: false
    }
  },
  computed: {
    /**
     * 是否有任何权限
     */
    hasAnyPermission() {
      return this.hasPermission('getDepartments') || this.hasPermission('getPositions')
    }
  },
  created() {
    // 设置页面标题
    document.title = '组织结构管理'

    // 加载统计数据
    this.loadStats()
  },
  methods: {
    /**
     * 跳转到部门管理
     */
    goToDepartments() {
      this.$router.push('/organization-structure/departments')
    },

    /**
     * 跳转到岗位管理
     */
    goToPositions() {
      this.$router.push('/organization-structure/positions')
    },

    /**
     * 加载统计数据
     */
    async loadStats() {
      try {
        // 这里可以调用统计API获取数据
        // 暂时使用模拟数据
        this.stats = {
          departmentCount: 25,
          positionCount: 68,
          activeCount: 89
        }
        this.showStats = true
      } catch (error) {
        console.error('加载统计数据失败:', error)
        // 统计数据加载失败不影响主要功能
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.organization-structure {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

  .page-header {
    text-align: center;
    margin-bottom: 48px;

    .page-title {
      font-size: 32px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 12px;

      i {
        margin-right: 12px;
        color: #409eff;
      }
    }

    .page-description {
      font-size: 16px;
      color: #7f8c8d;
      margin: 0;
    }
  }

  .module-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 48px;

    .module-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      min-height: 140px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }

      .card-icon {
        font-size: 48px;
        margin-right: 24px;
        flex-shrink: 0;

        i {
          display: block;
          width: 80px;
          height: 80px;
          line-height: 80px;
          text-align: center;
          border-radius: 50%;
          color: white;
        }
      }

      .card-content {
        flex: 1;

        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .card-description {
          font-size: 14px;
          color: #7f8c8d;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .card-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .feature-tag {
            background: #ecf5ff;
            color: #409eff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
        }
      }

      .card-arrow {
        font-size: 24px;
        color: #bdc3c7;
        margin-left: 16px;
        transition: color 0.3s ease;
      }

      &.department-card {
        .card-icon i {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &:hover .card-arrow {
          color: #667eea;
        }
      }

      &.position-card {
        .card-icon i {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &:hover .card-arrow {
          color: #f5576c;
        }
      }
    }
  }

  .stats-section {
    .stats-title {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 24px;
      text-align: center;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

        .stat-icon {
          font-size: 32px;
          margin-bottom: 16px;

          i {
            display: inline-block;
            width: 60px;
            height: 60px;
            line-height: 60px;
            border-radius: 50%;
            color: white;
          }

          &.department-stat i {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.position-stat i {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.active-stat i {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #2c3e50;
          }
        }

        .stat-content {
          .stat-number {
            font-size: 28px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: #7f8c8d;
          }
        }
      }
    }
  }

  .no-permission {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .organization-structure {
    padding: 16px;

    .page-header {
      margin-bottom: 32px;

      .page-title {
        font-size: 24px;
      }

      .page-description {
        font-size: 14px;
      }
    }

    .module-cards {
      grid-template-columns: 1fr;
      gap: 16px;

      .module-card {
        flex-direction: column;
        text-align: center;
        min-height: auto;

        .card-icon {
          margin-right: 0;
          margin-bottom: 16px;
        }

        .card-arrow {
          display: none;
        }
      }
    }

    .stats-section {
      .stats-cards {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }
}
</style>
