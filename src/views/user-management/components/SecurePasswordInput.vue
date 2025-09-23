<!--
  文件名称：SecurePasswordInput.vue
  文件描述：安全密码输入框组件，支持密码强度检查、安全限制等功能
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，实现安全密码输入功能
-->
<template>
    <div class="secure-password-input">
        <!-- 密码输入框 -->
        <el-input ref="passwordInput" v-model="inputValue" :type="showPassword ? 'text' : 'password'"
            :placeholder="placeholder" :disabled="disabled" :clearable="clearable && !securityMode" :size="size"
            :autocomplete="autocomplete" class="password-field" @input="handleInput" @blur="handleBlur"
            @focus="handleFocus">
            <!-- 密码可见性切换按钮 -->
            <template #suffix>
                <div class="password-suffix">
                    <el-button v-if="!securityMode" type="text" :icon="showPassword ? 'el-icon-view' : 'el-icon-hide'"
                        class="password-toggle" @click="togglePasswordVisibility" />
                    <!-- 密码生成按钮 -->
                    <el-button v-if="showGenerateButton" type="text" icon="el-icon-key" class="generate-button"
                        title="生成安全密码" @click="generatePassword" />
                </div>
            </template>
        </el-input>

        <!-- 密码强度指示器 - 紧凑布局 -->
        <password-strength-indicator v-if="showStrengthIndicator && inputValue" :password="inputValue"
            :show-requirements="showRequirements" :compact-layout="true" class="strength-indicator" />

        <!-- 安全模式提示 -->
        <div v-if="securityMode" class="security-notice">
            <i class="el-icon-lock" />
            安全模式：已禁用复制、粘贴功能
        </div>
    </div>
</template>

<script>
import { generateSecurePassword, disablePasswordCopyPaste } from '../utils/password-utils'
import PasswordStrengthIndicator from './PasswordStrengthIndicator.vue'

export default {
    name: 'SecurePasswordInput',
    components: {
        PasswordStrengthIndicator
    },
    props: {
        // v-model绑定的值
        value: {
            type: String,
            default: ''
        },
        // 输入框占位符
        placeholder: {
            type: String,
            default: '请输入密码'
        },
        // 是否禁用
        disabled: {
            type: Boolean,
            default: false
        },
        // 是否可清空
        clearable: {
            type: Boolean,
            default: false
        },
        // 输入框尺寸
        size: {
            type: String,
            default: 'medium'
        },
        // 是否显示密码强度指示器
        showStrengthIndicator: {
            type: Boolean,
            default: true
        },
        // 是否显示详细要求
        showRequirements: {
            type: Boolean,
            default: true
        },
        // 是否显示密码生成按钮
        showGenerateButton: {
            type: Boolean,
            default: false
        },
        // 安全模式：禁用复制粘贴
        securityMode: {
            type: Boolean,
            default: true
        },
        // 自动完成属性
        autocomplete: {
            type: String,
            default: 'new-password'
        }
    },
    data() {
        return {
            inputValue: this.value,
            showPassword: false
        }
    },
    watch: {
        value(newVal) {
            this.inputValue = newVal
        },
        inputValue(newVal) {
            this.$emit('input', newVal)
            this.$emit('change', newVal)
        }
    },
    mounted() {
        // 如果启用安全模式，禁用复制粘贴
        if (this.securityMode) {
            this.$nextTick(() => {
                const inputElement = this.$refs.passwordInput?.$refs?.input
                if (inputElement) {
                    disablePasswordCopyPaste(inputElement)
                }
            })
        }
    },
    methods: {
        /**
         * 处理输入事件
         */
        handleInput(value) {
            this.inputValue = value
        },

        /**
         * 处理失焦事件
         */
        handleBlur(event) {
            this.$emit('blur', event)
        },

        /**
         * 处理聚焦事件
         */
        handleFocus(event) {
            this.$emit('focus', event)
        },

        /**
         * 切换密码可见性
         */
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword
        },

        /**
         * 生成安全密码
         */
        generatePassword() {
            const newPassword = generateSecurePassword(12)
            this.inputValue = newPassword

            // 显示生成成功提示
            this.$message({
                message: '已生成安全密码，请保存好密码信息',
                type: 'success',
                duration: 3000
            })

            this.$emit('password-generated', newPassword)
        },

        /**
         * 获取输入框焦点
         */
        focus() {
            this.$refs.passwordInput?.focus()
        },

        /**
         * 失去输入框焦点
         */
        blur() {
            this.$refs.passwordInput?.blur()
        },

        /**
         * 清空密码
         */
        clear() {
            this.inputValue = ''
        }
    }
}
</script>

<style lang="scss" scoped>
.secure-password-input {
    .password-field {
        ::v-deep .el-input__inner {
            padding-right: 80px; // 为后缀按钮留出空间
        }

        .password-suffix {
            display: flex;
            align-items: center;
            gap: 4px;

            .password-toggle,
            .generate-button {
                padding: 0;
                margin: 0;
                height: 20px;
                width: 20px;
                border: none;
                color: #909399;

                &:hover {
                    color: #409EFF;
                }
            }
        }
    }

    .strength-indicator {
        margin-top: 12px;
    }

    .security-notice {
        margin-top: 8px;
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;

        i {
            margin-right: 4px;
            color: #67C23A;
        }
    }
}
</style>

