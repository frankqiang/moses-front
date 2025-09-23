<!--
  文件名称：PasswordStrengthIndicator.vue
  文件描述：密码强度指示器组件，实时显示密码强度和安全建议
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现密码强度可视化指示
-->
<template>
    <div class="password-strength-indicator" :class="{ 'compact-layout': compactLayout }">
        <!-- 密码强度进度条 -->
        <div class="strength-progress">
            <div class="progress-label">
                密码强度：
                <span :style="{ color: strengthInfo.color }" class="strength-text">
                    {{ strengthInfo.text }}
                </span>
            </div>
            <el-progress :percentage="(strengthInfo.score / 8) * 100" :color="strengthInfo.color" :show-text="false"
                :stroke-width="6" class="strength-bar" />
        </div>

        <!-- 密码要求和建议 -->
        <div class="strength-feedback" :class="{ 'compact-feedback': compactLayout }">
            <div class="feedback-list">
                <div v-for="(feedback, index) in strengthInfo.feedback" :key="index" class="feedback-item"
                    :class="{ 'feedback-error': !strengthInfo.isValid }">
                    <i :class="strengthInfo.isValid ? 'el-icon-circle-check' : 'el-icon-warning'"
                        class="feedback-icon" />
                    {{ feedback }}
                </div>
            </div>
        </div>

    <!-- 密码要求说明 -->
    <div v-if="showRequirements" class="password-requirements" :class="{ 'compact': compactLayout }">
      <div class="requirements-title">密码要求：</div>
      <ul class="requirements-list" :class="{ 'compact-list': compactLayout }">
        <li :class="{ 'requirement-met': hasMinLength }">
          <i :class="hasMinLength ? 'el-icon-circle-check' : 'el-icon-circle-close'" />
          至少8个字符
        </li>
        <li :class="{ 'requirement-met': hasLetter }">
          <i :class="hasLetter ? 'el-icon-circle-check' : 'el-icon-circle-close'" />
          包含字母
        </li>
        <li :class="{ 'requirement-met': hasNumber }">
          <i :class="hasNumber ? 'el-icon-circle-check' : 'el-icon-circle-close'" />
          包含数字
        </li>
        <li :class="{ 'requirement-met': hasUpperCase }">
          <i :class="hasUpperCase ? 'el-icon-circle-check' : 'el-icon-circle-close'" />
          包含大写字母（推荐）
        </li>
        <li :class="{ 'requirement-met': hasSymbol }">
          <i :class="hasSymbol ? 'el-icon-circle-check' : 'el-icon-circle-close'" />
          包含特殊字符（推荐）
        </li>
      </ul>
    </div>
    </div>
</template>

<script>
import { calculatePasswordStrength } from '../utils/password-utils'

export default {
    name: 'PasswordStrengthIndicator',
    props: {
        // 要检查的密码
        password: {
            type: String,
            default: ''
        },
    // 是否显示详细要求
    showRequirements: {
      type: Boolean,
      default: true
    },
    // 是否使用紧凑布局
    compactLayout: {
      type: Boolean,
      default: false
    }
    },
    computed: {
        /**
         * 密码强度信息
         */
        strengthInfo() {
            return calculatePasswordStrength(this.password)
        },

        /**
         * 检查是否满足最小长度要求
         */
        hasMinLength() {
            return this.password && this.password.length >= 8
        },

        /**
         * 检查是否包含字母
         */
        hasLetter() {
            return /[a-zA-Z]/.test(this.password)
        },

        /**
         * 检查是否包含数字
         */
        hasNumber() {
            return /\d/.test(this.password)
        },

        /**
         * 检查是否包含大写字母
         */
        hasUpperCase() {
            return /[A-Z]/.test(this.password)
        },

        /**
         * 检查是否包含特殊字符
         */
        hasSymbol() {
            return /[!@#$%^&*(),.?":{}|<>]/.test(this.password)
        }
    }
}
</script>

<style lang="scss" scoped>
.password-strength-indicator {
  .strength-progress {
    margin-bottom: 12px;

    .progress-label {
      font-size: 13px;
      color: #606266;
      margin-bottom: 8px;
      display: flex;
      align-items: center;

      .strength-text {
        font-weight: 500;
        margin-left: 4px;
      }
    }

    .strength-bar {
      ::v-deep .el-progress-bar__outer {
        height: 6px;
        background-color: #f0f0f0;
        border-radius: 3px;
      }
    }
  }

  .strength-feedback {
    margin-bottom: 12px;

    .feedback-list {
      .feedback-item {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
        display: flex;
        align-items: center;

        .feedback-icon {
          margin-right: 6px;
          font-size: 14px;
          color: #67C23A;
        }

        &.feedback-error .feedback-icon {
          color: #F56C6C;
        }
      }
    }
  }

  .password-requirements {
    .requirements-title {
      font-size: 13px;
      color: #606266;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .requirements-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        font-size: 12px;
        color: #909399;
        margin-bottom: 6px;
        display: flex;
        align-items: center;

        i {
          margin-right: 6px;
          font-size: 14px;
          color: #DCDFE6;
        }

        &.requirement-met {
          color: #67C23A;

          i {
            color: #67C23A;
          }
        }
      }

      // 紧凑布局样式
      &.compact-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;

        li {
          flex: 0 0 auto;
          margin-bottom: 4px;
          font-size: 11px;

          i {
            font-size: 12px;
          }
        }
      }
    }
  }

  // 紧凑布局样式
  &.compact-layout {
    display: flex;
    gap: 20px;

    .strength-progress {
      flex: 1;
      margin-bottom: 0;
    }

    .strength-feedback {
      &.compact-feedback {
        display: none; // 在紧凑模式下隐藏反馈，因为要求列表已经提供了足够信息
      }
    }

    .password-requirements {
      flex: 1;

      &.compact {
        .requirements-title {
          font-size: 12px;
          margin-bottom: 6px;
        }

        .requirements-list {
          li {
            margin-bottom: 4px;
            font-size: 11px;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    &.compact-layout {
      flex-direction: column;
      gap: 12px;

      .strength-feedback.compact-feedback {
        display: block; // 在小屏幕上显示反馈
      }
    }
  }
}
</style>

