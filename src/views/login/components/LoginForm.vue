/**
 * 登录表单组件
 * 功能描述：提供用户登录表单，包含用户名、密码输入框、记住我选项和登录按钮
 * 创建日期：2024-07-24
 */
<template>
  <el-form
    ref="loginForm"
    :model="loginForm"
    :rules="loginRules"
    class="login-form"
    auto-complete="on"
    label-position="left"
  >
    <div class="title-container">
      <h3 class="title">用户登录</h3>
    </div>

    <el-form-item prop="username">
      <span class="svg-container">
        <svg-icon icon-class="user" />
      </span>
      <el-input
        ref="username"
        v-model="loginForm.username"
        placeholder="请输入用户名"
        name="username"
        type="text"
        tabindex="1"
        auto-complete="on"
      />
    </el-form-item>

    <el-form-item prop="password">
      <span class="svg-container">
        <svg-icon icon-class="password" />
      </span>
      <el-input
        :key="passwordType"
        ref="password"
        v-model="loginForm.password"
        :type="passwordType"
        placeholder="请输入密码"
        name="password"
        tabindex="2"
        auto-complete="on"
        @keyup.enter.native="handleLogin"
      />
      <span class="show-pwd" @click="showPwd">
        <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
      </span>
    </el-form-item>
    
    <div class="remember-container">
      <div class="remember-me-section">
        <el-checkbox 
          v-model="loginForm.rememberMe" 
          class="remember-checkbox"
        >
          <span class="remember-text">记住登录状态</span>
          <el-tooltip 
            content="勾选后将在本设备保持登录状态，建议仅在个人设备上使用" 
            placement="top"
          >
            <i class="el-icon-question remember-tip"></i>
          </el-tooltip>
        </el-checkbox>
        <div v-if="loginForm.rememberMe" class="security-warning">
          <i class="el-icon-warning-outline"></i>
          <span>请确保在安全的个人设备上使用此功能</span>
          <a href="javascript:;" class="clear-remembered" @click="clearRememberedState">清除记住的状态</a>
        </div>
      </div>
      <a href="javascript:;" class="forgot-password" @click="handleForgotPassword">忘记密码?</a>
    </div>

    <el-button type="primary" class="login-button" :loading="loading" @click.native.prevent="handleLogin">登录</el-button>

    <div class="tips" v-if="isDev">
      <span>测试账号: admin</span>
      <span>密码: 任意6位以上</span>
    </div>
  </el-form>
</template>

<script>
import { DEFAULT_LOGIN_FORM, LOGIN_RULES, ENV_CONFIG } from '../constants'
import { getRememberedUser, saveRememberedUser, removeRememberedUser, isRememberMe, clearRememberedState } from '@/utils/auth'

export default {
  name: 'LoginForm',
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loginForm: {
        ...DEFAULT_LOGIN_FORM,
        rememberMe: isRememberMe() // 初始化记住登录状态
      },
      loginRules: LOGIN_RULES,
      passwordType: 'password',
      isDev: ENV_CONFIG.isDev
    }
  },
  created() {
    this.redirect = this.$route.query && this.$route.query.redirect
    this.loadRememberedUser()
  },
  methods: {
    /**
     * 加载记住的用户信息
     */
    loadRememberedUser() {
      const rememberedUser = getRememberedUser()
      if (rememberedUser && rememberedUser.username) {
        this.loginForm.username = rememberedUser.username
        this.loginForm.rememberMe = true
      }
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    /**
     * 处理登录提交
     */
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          // 处理记住用户信息
          this.handleRememberUser()
          this.$emit('login', this.loginForm)
        } else {
          console.log('登录表单验证失败')
          return false
        }
      })
    },
    /**
     * 处理记住用户信息
     */
    handleRememberUser() {
      if (this.loginForm.rememberMe) {
        // 保存用户信息到本地存储
        saveRememberedUser({
          username: this.loginForm.username
        })
      } else {
        // 清除记住的用户信息
        removeRememberedUser()
      }
    },
    handleForgotPassword() {
      this.$emit('forgot-password')
    },
    // 重置表单
    resetForm() {
      this.$refs.loginForm.resetFields()
    },
    /**
     * 清除记住的登录状态
     */
    clearRememberedState() {
      clearRememberedState()
      this.loginForm.rememberMe = false
      this.$message({
        message: '已清除记住的登录状态',
        type: 'success',
        duration: 2000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-form {
  width: 100%;
  
  .el-form-item {
    margin-bottom: 22px;
  }
  
  .el-input {
    // height: 47px;
    padding: 0 15px 0 20px; /* 增加左侧内边距，避免文字被图标遮挡 */
    input {
      height: 47px;
      line-height: 47px;
      
      border-radius: 6px;
      border: 1px solid #dcdfe6;
      background-color: #fff;
      color: #606266;
      
      &:focus {
        border-color: #409eff;
        outline: none;
      }
      
      &::placeholder {
        color: #c0c4cc;
        padding-left: 5px; /* 为placeholder添加额外的左侧内边距 */
      }
    }
  }
}

.title-container {
  margin-bottom: 30px;
  
  .title {
    font-size: 24px;
    color: #303133;
    margin: 0;
    text-align: center;
    font-weight: 600;
  }
}

.svg-container {
    padding: 6px 5px 0px 15px;
    color: #889aa4;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1; /* 降低图标的z-index，避免遮挡输入框文本 */
    pointer-events: none; /* 确保图标不会拦截鼠标事件 */
  }

.show-pwd {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #889aa4;
  cursor: pointer;
  user-select: none;
  z-index: 1;
  
  &:hover {
    color: #409eff;
  }
}

.remember-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .remember-me-section {
    flex: 1;
    
    .remember-checkbox {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      
      .remember-text {
        color: #606266;
        font-size: 14px;
        margin-right: 5px;
      }
      
      .remember-tip {
        color: #909399;
        font-size: 14px;
        cursor: help;
        
        &:hover {
          color: #409EFF;
        }
      }
    }
    
    .security-warning {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 8px 12px;
      background-color: #fdf6ec;
      border: 1px solid #faecd8;
      border-radius: 4px;
      color: #e6a23c;
      font-size: 12px;
      margin-top: 5px;
      
      i {
        margin-right: 5px;
        font-size: 14px;
      }
      
      span {
        line-height: 1.4;
        flex: 1;
      }
      
      .clear-remembered {
        color: #409EFF;
        text-decoration: none;
        margin-left: 10px;
        white-space: nowrap;
        font-size: 12px;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .forgot-password {
    color: #1890ff;
    font-size: 14px;
    text-decoration: none;
    margin-left: 16px;
    white-space: nowrap;

    &:hover {
      text-decoration: underline;
    }
  }
}

.login-button {
  width: 100%;
  margin-bottom: 24px;
}

.tips {
  font-size: 14px;
  color: #909399;
  margin-bottom: 20px;
  text-align: center;

  span {
    display: block;
    line-height: 1.5;
    
    &:first-of-type {
      margin-bottom: 4px;
    }
  }
}

// 修复输入框图标和密码显示按钮的定位
.el-form-item {
  position: relative;
  
  .el-input {
    input {
      padding-left: 45px;
      padding-right: 45px;
    }
  }
}
</style>