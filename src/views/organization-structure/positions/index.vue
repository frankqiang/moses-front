<!--
 * 文件名称：positions/index.vue
 * 文件描述：岗位管理页面，提供岗位的增删改查功能
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 初始创建，实现岗位管理基础页面结构
-->

<template>
  <div class="position-management">
    <!-- 页面内容区域 -->
    <div class="position-content">
      <div class="page-placeholder">
        <el-result icon="info" title="岗位管理页面" sub-title="此页面将在TASK002中实现岗位管理的完整功能">
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
  name: 'PositionManagement',
  mixins: [permissionMixin],
  data() {
    return {
      // 临时数据，TASK002中将实现完整的数据管理
    }
  },
  created() {
    // 设置页面标题
    document.title = '岗位管理 - 组织结构管理'

    // 权限检查
    this.checkPagePermission()
  },
  methods: {
    /**
         * 检查页面访问权限
         */
    checkPagePermission() {
      if (!this.hasPositionPermission()) {
        this.$message.error('您没有岗位管理权限，即将跳转到首页')
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
        '岗位管理功能将在TASK002中实现，包括：\n' +
                '• 岗位列表展示和分页查询\n' +
                '• 岗位新增/编辑/删除功能\n' +
                '• 岗位与部门关联功能\n' +
                '• 岗位状态管理\n' +
                '• 岗位级别管理',
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
.position-management {
    padding: 24px;
    min-height: 500px;

    .position-content {
        .page-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
        }
    }
}
</style>
