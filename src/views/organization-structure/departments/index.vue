<!--
 * 文件名称：departments/index.vue
 * 文件描述：部门管理页面，提供部门的增删改查功能
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现部门管理基础页面结构
-->

<template>
  <div class="department-management">
    <!-- 页面内容区域 -->
    <div class="department-content">
      <div class="page-placeholder">
        <el-result icon="info" title="部门管理页面" sub-title="此页面将在TASK001中实现部门管理的完整功能">
          <template slot="extra">
            <el-button type="primary" @click="handleDevelopmentInfo">
              查看开发计划
            </el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script>
import { permissionMixin } from '@/utils/permission'

export default {
  name: 'DepartmentManagement',
  mixins: [permissionMixin],
  data() {
    return {
      // 临时数据，TASK001中将实现完整的数据管理
    }
  },
  created() {
    // 设置页面标题
    document.title = '部门管理 - 组织结构管理'

    // 权限检查
    this.checkPagePermission()
  },
  methods: {
    /**
         * 检查页面访问权限
         */
    checkPagePermission() {
      if (!this.hasDepartmentPermission()) {
        this.$message.error('您没有部门管理权限，即将跳转到首页')
        setTimeout(() => {
          this.$router.push('/')
        }, 2000)
        return false
      }
      return true
    },

    /**
         * 显示开发计划信息
         */
    handleDevelopmentInfo() {
      this.$alert(
        '部门管理功能将在TASK001中实现，包括：\n' +
                '• 部门树形结构展示\n' +
                '• 部门新增/编辑/删除功能\n' +
                '• 部门层级关系维护\n' +
                '• 部门负责人设置\n' +
                '• 部门状态管理',
        '开发计划',
        {
          confirmButtonText: '了解',
          type: 'info'
        }
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.department-management {
    padding: 24px;
    min-height: 500px;

    .department-content {
        .page-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
        }
    }
}
</style>
