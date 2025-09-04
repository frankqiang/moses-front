/**
 * 用户注册管理模块入口页面
 * 文件描述：提供用户注册申请和状态查询的统一入口界面
 * 创建日期：2024-12-19
 */
<template>
  <div class="register-container">
    <div class="register-content">
      <!-- 注册模块头部 -->>
      <register-header />
      
      <!-- 注册功能导航 -->
      <register-navigation 
        :current-view="currentView"
        @view-change="handleViewChange"
      />
      
      <!-- 注册申请页面 -->
      <register-apply
        v-if="currentView === 'apply'"
        ref="registerApply"
        @success="handleApplySuccess"
        @error="handleApplyError"
      />
      
      <!-- 状态查询页面 -->
      <register-status
        v-if="currentView === 'status'"
        ref="registerStatus"
        :application-id="applicationId"
        @query-success="handleQuerySuccess"
        @error="handleQueryError"
      />
      
      <!-- 注册模块页脚 -->
      <register-footer />
    </div>
  </div>
</template>

<script>
// 导入组件
import RegisterHeader from './components/RegisterHeader'
import RegisterNavigation from './components/RegisterNavigation'
import RegisterApply from './apply'
import RegisterStatus from './status'
import RegisterFooter from './components/RegisterFooter'
import './styles/index.scss'

export default {
  name: 'Register',
  components: {
    RegisterHeader,
    RegisterNavigation,
    RegisterApply,
    RegisterStatus,
    RegisterFooter
  },
  data() {
    return {
      currentView: 'apply', // 当前视图：apply 或 status
      applicationId: null // 申请ID，用于状态查询
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.handleRouteChange(route)
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 处理路由变化
     * @param {Object} route - 路由对象
     */
    handleRouteChange(route) {
      const { name, params, query } = route
      
      // 根据路由名称设置当前视图
      if (name === 'RegisterApply') {
        this.currentView = 'apply'
      } else if (name === 'RegisterStatus') {
        this.currentView = 'status'
        // 从路由参数或查询参数获取申请ID
        this.applicationId = params.id || query.id || null
      } else {
        // 默认显示申请页面
        this.currentView = 'apply'
      }
    },
    
    /**
     * 处理视图切换
     * @param {string} view - 目标视图
     */
    handleViewChange(view) {
      if (view === 'apply') {
        this.$router.push({ name: 'RegisterApply' })
      } else if (view === 'status') {
        this.$router.push({ name: 'RegisterStatus' })
      }
    },
    
    /**
     * 处理申请成功
     * @param {Object} result - 申请结果
     */
    handleApplySuccess(result) {
      const { applicationId } = result
      
      // 保存申请ID
      this.applicationId = applicationId
      
      // 跳转到状态查询页面
      this.$router.push({
        name: 'RegisterStatus',
        params: { id: applicationId },
        query: { from: 'apply' }
      })
    },
    
    /**
     * 处理申请错误
     * @param {Object} error - 错误信息
     */
    handleApplyError(error) {
      console.error('注册申请失败:', error)
      // 错误处理已在子组件中完成，这里可以添加额外的处理逻辑
    },
    
    /**
     * 处理查询成功
     * @param {Object} result - 查询结果
     */
    handleQuerySuccess(result) {
      console.log('状态查询成功:', result)
      // 可以添加成功后的处理逻辑
    },
    
    /**
     * 处理查询错误
     * @param {Object} error - 错误信息
     */
    handleQueryError(error) {
      console.error('状态查询失败:', error)
      // 错误处理已在子组件中完成，这里可以添加额外的处理逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
$bg: #f0f2f5;
$box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

.register-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg;
  background-image: url('~@/assets/login-bg.svg');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .register-content {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: $box-shadow;
    width: 800px; // 统一宽度
    padding: 30px;
    position: relative;
  }
}

@media (max-width: 768px) {
  .register-container {
    padding: 10px;
  }
  
  .register-content {
    width: 100%;
    max-width: 100%;
    border-radius: 8px;
  }
}
</style>