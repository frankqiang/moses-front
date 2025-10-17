<template>
  <div class="error-handler-example">
    <el-card header="错误处理和消息提示功能测试">
      <!-- 成功消息测试 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <h3>1. 成功消息测试（绿色提示）</h3>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="testCreateSuccess">创建成功</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="testAssignSuccess">派工成功</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="success" @click="testCompleteSuccess">完成成功</el-button>
        </el-col>
      </el-row>

      <el-divider />

      <!-- 错误消息测试 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <h3>2. 错误消息测试（红色提示）</h3>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="testErrorMessage">通用错误</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="testBusinessError">业务错误</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="testNetworkError">网络错误</el-button>
        </el-col>
      </el-row>

      <el-divider />

      <!-- 警告消息测试 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <h3>3. 警告消息测试（橙色提示）</h3>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="testWarningMessage">警告提示</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="warning" @click="testTaskOverdue">逾期警告</el-button>
        </el-col>
      </el-row>

      <el-divider />

      <!-- 确认对话框测试 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <h3>4. 确认对话框测试</h3>
        </el-col>
        <el-col :span="6">
          <el-button @click="testConfirmAssign">派工确认</el-button>
        </el-col>
        <el-col :span="6">
          <el-button @click="testConfirmPostpone">延期确认</el-button>
        </el-col>
        <el-col :span="6">
          <el-button @click="testConfirmCancel">取消确认</el-button>
        </el-col>
      </el-row>

      <el-divider />

      <!-- 错误处理测试 -->
      <el-row :gutter="20" style="margin-bottom: 20px;">
        <el-col :span="24">
          <h3>5. 统一错误处理测试</h3>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="test401Error">401错误（跳转登录）</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="test403Error">403错误（权限不足）</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="testValidationError">验证错误</el-button>
        </el-col>
        <el-col :span="6">
          <el-button type="danger" @click="testTPMTaskError">TPM业务错误</el-button>
        </el-col>
      </el-row>

      <el-divider />

      <!-- 日志输出区域 -->
      <el-row style="margin-top: 20px;">
        <el-col :span="24">
          <h3>测试日志（请打开浏览器控制台查看）</h3>
          <p style="color: #909399;">所有错误处理都会在开发环境的控制台输出详细日志</p>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import {
  handleError,
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage
} from './error-handler'

import {
  showCreateSuccess,
  showAssignSuccess,
  showCompleteSuccess,
  confirmAssignTask,
  confirmPostponeTask,
  confirmCancelTask,
  warnTaskOverdue
} from './message-handler'

export default {
  name: 'ErrorHandlerExample',

  methods: {
    // ========== 成功消息测试 ==========

    testCreateSuccess() {
      showCreateSuccess('维护任务创建成功')
    },

    testAssignSuccess() {
      showAssignSuccess('任务派工成功')
    },

    testCompleteSuccess() {
      showCompleteSuccess('任务完成成功')
    },

    // ========== 错误消息测试 ==========

    testErrorMessage() {
      showErrorMessage('这是一条错误消息')
    },

    testBusinessError() {
      // 模拟后端返回的业务错误
      const error = {
        code: 'TPM_TASK_010',
        message: '只有待执行状态的任务才能派工' // 直接使用后端返回的消息
      }
      handleError(error)
    },

    testNetworkError() {
      // 模拟后端返回的网络错误
      const error = {
        code: 'NETWORK_TIMEOUT',
        message: '请求超时，请检查网络连接后重试' // 直接使用后端返回的消息
      }
      handleError(error)
    },

    // ========== 警告消息测试 ==========

    testWarningMessage() {
      showWarningMessage('这是一条警告消息')
    },

    testTaskOverdue() {
      warnTaskOverdue('退火炉日常维护', '2024-01-20 08:00')
    },

    // ========== 确认对话框测试 ==========

    async testConfirmAssign() {
      try {
        await confirmAssignTask('张三')
        showSuccessMessage('用户点击了确定')
      } catch {
        showInfoMessage('用户点击了取消')
      }
    },

    async testConfirmPostpone() {
      try {
        await confirmPostponeTask('设备配件未到货')
        showSuccessMessage('用户点击了确定')
      } catch {
        showInfoMessage('用户点击了取消')
      }
    },

    async testConfirmCancel() {
      try {
        await confirmCancelTask('设备已提前完成维护')
        showSuccessMessage('用户点击了确定')
      } catch {
        showInfoMessage('用户点击了取消')
      }
    },

    // ========== 统一错误处理测试 ==========

    test401Error() {
      // 模拟后端返回的401错误
      const error = {
        code: 'UNAUTHORIZED',
        message: '未授权，请重新登录' // 直接使用后端返回的消息
      }
      // 注意：这会触发跳转到登录页，实际使用时请谨慎
      handleError(error, {
        onAuthError: () => {
          console.log('⚠️ 认证失败，即将跳转到登录页（实际环境会跳转）')
        }
      })
    },

    test403Error() {
      // 模拟后端返回的403错误
      const error = {
        code: 'FORBIDDEN',
        message: '权限不足，无法访问该资源' // 直接使用后端返回的消息
      }
      handleError(error, {
        onPermissionError: () => {
          console.log('⚠️ 权限不足')
        }
      })
    },

    testValidationError() {
      // 模拟后端返回的验证错误
      const error = {
        code: 'VALIDATION_ERROR',
        message: '请求参数验证失败', // 直接使用后端返回的消息
        details: {
          field: 'taskTitle',
          value: ''
        }
      }
      handleError(error, {
        onValidationError: () => {
          console.log('⚠️ 验证失败')
        }
      })
    },

    testTPMTaskError() {
      // 模拟后端返回的TPM业务错误
      const error = {
        code: 'TPM_TASK_016',
        message: '只有任务执行人才能执行此操作' // 直接使用后端返回的消息
      }
      handleError(error)
    }
  }
}
</script>

<style scoped>
.error-handler-example {
  padding: 20px;
}

h3 {
  margin-bottom: 15px;
  color: #303133;
}

.el-divider {
  margin: 30px 0;
}
</style>

