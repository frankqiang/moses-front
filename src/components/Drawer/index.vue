/**
 * 抽屉组件
 * 功能描述：纯粹的抽屉容器组件，专注于抽屉的显示和交互，不耦合表单逻辑
 * 创建日期：2024-11-21
 */
<template>
  <el-drawer
    :title="title"
    :visible.sync="drawerVisible"
    :size="width"
    :direction="direction"
    :before-close="handleClose"
    :custom-class="customClass"
    :wrapper-closable="wrapperClosable"
    append-to-body
    @open="handleOpen"
    @closed="handleClosed"
  >
    <!-- 自定义头部插槽 -->
    <template #title>
      <slot name="title">
        <span>{{ title }}</span>
      </slot>
    </template>
    
    <!-- 内容区域 -->
    <div class="drawer-content" ref="drawerContent">
      <slot :visible="drawerVisible"></slot>
    </div>
    
    <!-- 底部区域 -->
    <div v-if="$slots.footer || showFooter" class="drawer-footer">
      <slot name="footer">
        <el-button @click="handleCancel">{{ cancelButtonText }}</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">{{ confirmButtonText }}</el-button>
      </slot>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'BaseDrawer',
  model: {
    prop: 'visible',
    event: 'update:visible'
  },
  props: {
    // 抽屉是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 抽屉标题
    title: {
      type: String,
      default: '抽屉'
    },
    // 抽屉宽度
    width: {
      type: String,
      default: '550px'
    },
    // 抽屉方向
    direction: {
      type: String,
      default: 'rtl',
      validator: value => ['ltr', 'rtl', 'ttb', 'btt'].includes(value)
    },
    // 自定义类名
    customClass: {
      type: String,
      default: 'base-drawer'
    },
    // 是否点击遮罩关闭
    wrapperClosable: {
      type: Boolean,
      default: false
    },
    // 是否显示底部区域
    showFooter: {
      type: Boolean,
      default: true
    },
    // 确认按钮文本
    confirmButtonText: {
      type: String,
      default: '确 定'
    },
    // 取消按钮文本
    cancelButtonText: {
      type: String,
      default: '取 消'
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 内部抽屉可见状态
      drawerVisible: this.visible
    }
  },
  watch: {
    // 监听外部visible变化
    visible(val) {
      this.drawerVisible = val
    },
    // 监听内部drawerVisible变化
    drawerVisible(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.$emit('close')
      }
    }
  },
  methods: {
    // 确认按钮点击
    handleConfirm() {
      this.$emit('confirm')
    },
    
    // 取消按钮点击
    handleCancel() {
      this.drawerVisible = false
      this.$emit('cancel')
    },
    
    // 关闭抽屉
    handleClose(done) {
      this.$emit('before-close')
      done()
    },
    
    // 抽屉打开时
    handleOpen() {
      this.$emit('open')
    },
    
    // 抽屉关闭后
    handleClosed() {
      this.$emit('closed')
    },
    
    // 手动关闭抽屉
    close() {
      this.drawerVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.base-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #e6e6e6;
  }
  
  :deep(.el-drawer__body) {
    height: calc(100% - 60px);
    overflow-y: auto;
    padding: 0;
    width: 100%;
  }
}

.drawer-content {
  padding: 20px;
  padding-bottom: 60px; /* 如果有底部栏，留出空间 */
  position: relative;
  width: calc(100% - 40px);
  box-sizing: border-box;
  min-height: calc(100% - 40px);
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: #fff;
  border-top: 1px solid #e6e6e6;
  text-align: right;
  z-index: 1;
  
  .el-button {
    margin-left: 10px;
  }
}
</style> 