/**
* 文件名称：RoleFormDrawer.vue
* 文件描述：角色表单抽屉组件，提供角色新增、编辑、查看、复制功能
* 创建日期：2024-01-20
* 修改记录：
* - 2024-01-20: 初始创建，实现基础表单功能
*/
<template>
    <drawer :visible="visible" :title="drawerTitle" width="600px" @close="handleClose">
        <template #default>
            <div class="role-form-drawer">
                <!-- 角色基本信息表单 -->
                <el-form ref="roleForm" :model="formData" :rules="formRules" label-width="120px" label-position="left">
                    <el-form-item label="角色名称" prop="name">
                        <el-input v-model="formData.name" placeholder="请输入角色名称" :disabled="isViewMode" maxlength="50"
                            show-word-limit clearable />
                    </el-form-item>

                    <el-form-item label="角色编码" prop="code">
                        <el-input v-model="formData.code" placeholder="请输入角色编码（字母、数字、下划线、中划线）"
                            :disabled="isViewMode || isEditMode" maxlength="50" show-word-limit clearable />
                    </el-form-item>

                    <el-form-item label="角色类型" prop="type">
                        <el-select v-model="formData.type" placeholder="请选择角色类型" :disabled="isViewMode"
                            style="width: 100%">
                            <el-option label="自定义角色" value="custom" />
                            <el-option label="系统角色" value="system" disabled />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="角色级别" prop="level">
                        <el-select v-model="formData.level" placeholder="请选择角色级别" :disabled="isViewMode"
                            style="width: 100%">
                            <el-option v-for="level in levelOptions" :key="level.value" :label="level.label"
                                :value="level.value" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="角色状态" prop="status">
                        <el-radio-group v-model="formData.status" :disabled="isViewMode">
                            <el-radio label="active">启用</el-radio>
                            <el-radio label="inactive">禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="默认角色" prop="isDefault">
                        <el-switch v-model="formData.isDefault" :disabled="isViewMode" active-text="是"
                            inactive-text="否" />
                    </el-form-item>

                    <el-form-item label="角色描述" prop="description">
                        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入角色描述"
                            :disabled="isViewMode" maxlength="200" show-word-limit />
                    </el-form-item>

                    <!-- 复制模式特殊配置 -->
                    <el-divider v-if="isCopyMode" content-position="left">复制配置</el-divider>

                    <el-form-item v-if="isCopyMode" label="复制权限配置">
                        <el-switch v-model="copyConfig.copyPermissions" active-text="是" inactive-text="否" />
                        <div class="form-item-tip">
                            是否同时复制原角色的权限配置
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </template>

        <template #footer>
            <div class="drawer-footer">
                <el-button @click="handleClose">
                    {{ isViewMode ? '关闭' : '取消' }}
                </el-button>
                <el-button v-if="!isViewMode" type="primary" :loading="submitLoading" @click="handleSubmit">
                    {{ submitButtonText }}
                </el-button>
            </div>
        </template>
    </drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import { createRole, updateRole, copyRole } from '../api'
import { ROLE_LEVEL_OPTIONS, FORM_RULES } from '../constants'

export default {
    name: 'RoleFormDrawer',
    components: {
        Drawer
    },
    props: {
        // 抽屉可见状态
        visible: {
            type: Boolean,
            default: false
        },
        // 模式：create-新增, edit-编辑, view-查看, copy-复制
        mode: {
            type: String,
            default: 'create',
            validator: value => ['create', 'edit', 'view', 'copy'].includes(value)
        },
        // 角色数据
        roleData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            // 表单数据
            formData: {
                name: '',
                code: '',
                type: 'custom',
                level: 1,
                status: 'active',
                isDefault: false,
                description: ''
            },
            // 复制配置
            copyConfig: {
                copyPermissions: true
            },
            // 提交加载状态
            submitLoading: false,
            // 级别选项
            levelOptions: ROLE_LEVEL_OPTIONS
        }
    },
    computed: {
        /**
                 * 抽屉标题
                 */
        drawerTitle() {
            const titleMap = {
                create: '新增角色',
                edit: '编辑角色',
                view: '查看角色',
                copy: '复制角色'
            }
            return titleMap[this.mode] || '角色信息'
        },

        /**
                 * 是否为查看模式
                 */
        isViewMode() {
            return this.mode === 'view'
        },

        /**
                 * 是否为编辑模式
                 */
        isEditMode() {
            return this.mode === 'edit'
        },

        /**
                 * 是否为复制模式
                 */
        isCopyMode() {
            return this.mode === 'copy'
        },

        /**
                 * 提交按钮文本
                 */
        submitButtonText() {
            const textMap = {
                create: '创建',
                edit: '更新',
                copy: '复制创建'
            }
            return textMap[this.mode] || '确定'
        },

        /**
             * 表单验证规则
             */
        formRules() {
            return FORM_RULES
        }
    },
    watch: {
        /**
                 * 监听可见状态变化
                 */
        visible(newVal) {
            if (newVal) {
                this.initFormData()
            } else {
                this.resetForm()
            }
        },

        /**
                 * 监听角色数据变化
                 */
        roleData: {
            handler() {
                if (this.visible) {
                    this.initFormData()
                }
            },
            deep: true
        }
    },
    methods: {
        /**
                 * 初始化表单数据
                 */
        initFormData() {
            if (this.mode === 'create') {
                // 新增模式：使用默认数据
                this.formData = {
                    name: '',
                    code: '',
                    type: 'custom',
                    level: 1,
                    status: 'active',
                    isDefault: false,
                    description: ''
                }
            } else if (this.roleData) {
                // 其他模式：基于现有数据
                this.formData = {
                    ...this.roleData
                }

                // 复制模式：修改名称和编码
                if (this.mode === 'copy') {
                    this.formData.name = `${this.roleData.name}_副本`
                    this.formData.code = `${this.roleData.code}_copy`
                }
            }

            // 清除表单验证
            this.$nextTick(() => {
                this.$refs.roleForm?.clearValidate()
            })
        },

        /**
                 * 重置表单
                 */
        resetForm() {
            this.formData = {
                name: '',
                code: '',
                type: 'custom',
                level: 1,
                status: 'active',
                isDefault: false,
                description: ''
            }
            this.copyConfig = {
                copyPermissions: true
            }
            this.$refs.roleForm?.resetFields()
            this.$refs.roleForm?.clearValidate()
        },

        /**
                 * 处理提交
                 */
        async handleSubmit() {
            try {
                // 表单验证
                await this.$refs.roleForm.validate()

                this.submitLoading = true

                // 准备提交数据
                const submitData = { ...this.formData }

                // 复制模式添加复制配置
                if (this.mode === 'copy') {
                    submitData.sourceRoleId = this.roleData.id
                    submitData.copyPermissions = this.copyConfig.copyPermissions
                }

                // 调用相应的API接口
                if (this.mode === 'create') {
                    await createRole(submitData)
                } else if (this.mode === 'copy') {
                    await copyRole(this.roleData.id, submitData)
                } else if (this.mode === 'edit') {
                    await updateRole(this.roleData.id, submitData)
                }

                this.$message.success(`角色${this.submitButtonText}成功`)
                this.$emit('success')
            } catch (error) {
                if (error !== 'validation-failed') {
                    console.error('角色操作失败:', error)
                    this.$message.error(`角色${this.submitButtonText}失败，请稍后重试`)
                }
            } finally {
                this.submitLoading = false
            }
        },

        /**
                 * 处理关闭
                 */
        handleClose() {
            this.$emit('close')
        }
    }
}
</script>

<style lang="scss" scoped>
.role-form-drawer {
    padding: 20px;

    .form-item-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 4px;
    }
}

.drawer-footer {
    text-align: right;
    padding: 20px;
    border-top: 1px solid #e4e7ed;

    .el-button {
        margin-left: 10px;
    }
}
</style>
