/**
 * 注册模块导航组件
 * 文件描述：提供申请和状态查询功能的导航切换
 * 创建日期：2024-12-19
 */
<template>
  <div class="register-navigation">
    <div class="nav-tabs">
      <div 
        class="nav-tab"
        :class="{ active: currentView === 'apply' }"
        @click="handleTabClick('apply')"
      >
        <svg-icon icon-class="edit" class="tab-icon" />
        <span class="tab-text">注册申请</span>
      </div>
      <div 
        class="nav-tab"
        :class="{ active: currentView === 'status' }"
        @click="handleTabClick('status')"
      >
        <svg-icon icon-class="search" class="tab-icon" />
        <span class="tab-text">状态查询</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterNavigation',
  props: {
    currentView: {
      type: String,
      default: 'apply',
      validator: value => ['apply', 'status'].includes(value)
    }
  },
  methods: {
    /**
     * 处理标签页点击
     * @param {string} view - 目标视图
     */
    handleTabClick(view) {
      if (view !== this.currentView) {
        this.$emit('view-change', view)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.register-navigation {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0 40px;
}

.nav-tabs {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
}

.nav-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  
  &:hover {
    background: #e9ecef;
    color: #495057;
  }
  
  &.active {
    color: #667eea;
    border-bottom-color: #667eea;
    background: white;
    
    .tab-icon {
      color: #667eea;
    }
  }
}

.tab-icon {
  font-size: 18px;
  margin-right: 8px;
  transition: color 0.3s ease;
}

.tab-text {
  font-size: 16px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .register-navigation {
    padding: 0 20px;
  }
  
  .nav-tab {
    padding: 15px 20px;
    flex-direction: column;
  }
  
  .tab-icon {
    margin-right: 0;
    margin-bottom: 4px;
    font-size: 16px;
  }
  
  .tab-text {
    font-size: 14px;
  }
}
</style>