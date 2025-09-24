<!--
 * 文件名称：DepartmentFormDrawer.vue
 * 文件描述：部门表单抽屉组件，支持新增、编辑、查看模式
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 重构，符合process-management/operations模块的开发范式
-->

<template>
    <el-drawer :visible.sync="drawerVisible" :title="drawerTitle" :size="700" :before-close="handleClose"
        :close-on-click-modal="false" class="department-form-drawer">
        <div class="drawer-content">
            <el-form ref="departmentForm" :model="formData" :rules="formRules" :disabled="isViewMode"
                label-width="100px" size="medium">
                <!-- 基本信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="el-icon-info" />
                        基本信息
                    </div>

                    <el-form-item label="部门名称" prop="name">
                        <el-input v-model="formData.name" placeholder="请输入部门名称" maxlength="100" show-word-limit />
                    </el-form-item>

                    <el-form-item label="部门编码" prop="code">
                        <el-input v-model="formData.code" placeholder="请输入部门编码，将自动转为大写" maxlength="50" show-word-limit
                            @input="handleCodeInput" />
                        <div class="form-tip">
                            部门编码用于系统内部识别，建议使用英文缩写，如：TECH、HR等
                        </div>
                    </el-form-item>

                    <el-form-item label="部门描述" prop="description">
                        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入部门描述（可选）"
                            maxlength="1000" show-word-limit />
                    </el-form-item>
                </div>

                <!-- 层级关系 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="el-icon-connection" />
                        层级关系
                    </div>

                    <el-form-item label="上级部门" prop="parentId">
                        <el-select v-model="formData.parentId" placeholder="请选择上级部门（可选）" clearable filterable
                            style="width: 100%" @change="handleParentChange">
                            <el-option v-for="option in availableParentOptions" :key="option.id" :label="option.name"
                                :value="option.id" :disabled="option.disabled" />
                        </el-select>
                        <div v-if="formData.parentId" class="form-tip">
                            当前部门层级：{{ currentLevel }}
                        </div>
                    </el-form-item>

                    <el-form-item label="排序顺序" prop="sortOrder">
                        <el-input-number v-model="formData.sortOrder" :min="0" :max="9999" placeholder="排序顺序"
                            style="width: 100%" />
                        <div class="form-tip">
                            数值越小排序越靠前，用于同级部门的显示顺序
                        </div>
                    </el-form-item>
                </div>

                <!-- 管理信息 -->
                <div class="form-section">
                    <div class="section-title">
                        <i class="el-icon-user" />
                        管理信息
                    </div>

                    <el-form-item label="部门经理" prop="managerId">
                        <el-select v-model="formData.managerId" placeholder="请选择部门经理（可选）" clearable filterable
                            style="width: 100%" remote :remote-method="searchManagers" :loading="managerLoading">
                            <el-option v-for="manager in managerOptions" :key="manager.id"
                                :label="`${manager.name} (${manager.email})`" :value="manager.id" />
                        </el-select>
                        <div class="form-tip">
                            每个用户只能管理一个部门，选择后该用户将成为此部门的负责人
                        </div>
                    </el-form-item>

                    <el-form-item label="部门状态" prop="status">
                        <el-radio-group v-model="formData.status">
                            <el-radio label="active">启用</el-radio>
                            <el-radio label="inactive">禁用</el-radio>
                        </el-radio-group>
                        <div class="form-tip">
                            禁用的部门将不能分配员工，也不会在选择器中显示
                        </div>
                    </el-form-item>
                </div>

                <!-- 查看模式下的额外信息 -->
                <div v-if="isViewMode && departmentData" class="form-section">
                    <div class="section-title">
                        <i class="el-icon-time" />
                        系统信息
                    </div>

                    <el-form-item label="创建时间">
                        <span>{{ formatDateTime(departmentData.createdAt) }}</span>
                    </el-form-item>

                    <el-form-item label="更新时间">
                        <span>{{ formatDateTime(departmentData.updatedAt) }}</span>
                    </el-form-item>

                    <el-form-item v-if="departmentData.children && departmentData.children.length > 0" label="子部门">
                        <el-tag v-for="child in departmentData.children" :key="child.id" type="info" size="small"
                            style="margin-right: 8px; margin-bottom: 4px;">
                            {{ child.name }}
                        </el-tag>
                    </el-form-item>
                </div>
            </el-form>
        </div>

        <!-- 操作按钮 -->
        <div class="drawer-footer">
            <el-button @click="handleClose">
                {{ isViewMode ? '关闭' : '取消' }}
            </el-button>
            <el-button v-if="!isViewMode" type="primary" :loading="submitting" @click="handleSubmit">
                {{ isCreateMode ? '创建' : '更新' }}
            </el-button>
            <el-button v-if="isCreateMode && !isViewMode" type="success" :loading="submitting"
                @click="handleSubmitAndContinue">
                保存并继续
            </el-button>
        </div>
    </el-drawer>
</template>

<script>
import { createDepartment, updateDepartment } from '../api'
import { formatDateTime } from '@/utils'
import { FORM_RULES } from '../constants/department'

export default {
    name: 'DepartmentFormDrawer',
    props: {
        // 抽屉显示状态
        visible: {
            type: Boolean,
            default: false
        },
        // 表单模式：create, edit, view
        mode: {
            type: String,
            default: 'create',
            validator: value => ['create', 'edit', 'view'].includes(value)
        },
        // 部门数据（编辑和查看模式）
        departmentData: {
            type: Object,
            default: null
        },
        // 父部门选项
        parentOptions: {
            type: Array,
            default: () => []
        },
        // 部门经理选项
        managerOptions: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            // 表单数据
            formData: {
                name: '',
                code: '',
                description: '',
                parentId: '',
                managerId: '',
                sortOrder: 0,
                status: 'active'
            },

            // 状态
            submitting: false,
            managerLoading: false,

            // 当前层级
            currentLevel: 1
        }
    },
    computed: {
        /**
         * 抽屉显示状态（双向绑定）
         */
        drawerVisible: {
            get() {
                return this.visible
            },
            set(value) {
                this.$emit('update:visible', value)
            }
        },

        /**
         * 抽屉标题
         */
        drawerTitle() {
            const titles = {
                create: '新增部门',
                edit: '编辑部门',
                view: '查看部门'
            }
            return titles[this.mode] || '部门管理'
        },

        /**
         * 是否为创建模式
         */
        isCreateMode() {
            return this.mode === 'create'
        },

        /**
         * 是否为编辑模式
         */
        isEditMode() {
            return this.mode === 'edit'
        },

        /**
         * 是否为查看模式
         */
        isViewMode() {
            return this.mode === 'view'
        },

        /**
         * 表单验证规则
         */
        formRules() {
            return FORM_RULES
        },

        /**
         * 可用的父部门选项
         */
        availableParentOptions() {
            if (this.isEditMode && this.departmentData) {
                // 编辑模式下，排除自己和自己的子部门
                return this.parentOptions.filter(option => {
                    return option.id !== this.departmentData.id &&
                        !this.isDescendant(option.id, this.departmentData.id)
                })
            }
            return this.parentOptions
        }
    },
    watch: {
        /**
         * 监听抽屉显示状态
         */
        visible(newValue) {
            if (newValue) {
                this.initForm()
            } else {
                this.resetForm()
            }
        },

        /**
         * 监听部门数据变化
         */
        departmentData: {
            handler() {
                if (this.visible) {
                    this.initForm()
                }
            },
            deep: true
        }
    },
    methods: {
        /**
         * 初始化表单
         */
        initForm() {
            if (this.isCreateMode) {
                // 创建模式
                this.formData = {
                    name: '',
                    code: '',
                    description: '',
                    parentId: this.departmentData?.parentId || '',
                    managerId: '',
                    sortOrder: 0,
                    status: 'active'
                }
            } else if (this.departmentData) {
                // 编辑或查看模式
                this.formData = {
                    name: this.departmentData.name || '',
                    code: this.departmentData.code || '',
                    description: this.departmentData.description || '',
                    parentId: this.departmentData.parentId || '',
                    managerId: this.departmentData.managerId || '',
                    sortOrder: this.departmentData.sortOrder || 0,
                    status: this.departmentData.status || 'active'
                }
            }

            // 计算当前层级
            this.calculateCurrentLevel()
        },

        /**
         * 重置表单
         */
        resetForm() {
            this.$nextTick(() => {
                if (this.$refs.departmentForm) {
                    this.$refs.departmentForm.resetFields()
                }
            })
        },

        /**
         * 处理编码输入
         */
        handleCodeInput(value) {
            // 自动转换为大写
            this.formData.code = value.toUpperCase()
        },

        /**
         * 处理父部门变化
         */
        handleParentChange() {
            this.calculateCurrentLevel()
        },

        /**
         * 计算当前层级
         */
        calculateCurrentLevel() {
            if (!this.formData.parentId) {
                this.currentLevel = 1
                return
            }

            // 根据父部门计算层级
            const parent = this.parentOptions.find(option => option.id === this.formData.parentId)
            if (parent) {
                this.currentLevel = (parent.level || 0) + 1
            } else {
                this.currentLevel = 1
            }
        },

        /**
         * 搜索部门经理
         */
        async searchManagers(query) {
            if (!query) return

            this.managerLoading = true
            try {
                // 这里应该调用搜索用户的API
                // const response = await userApi.searchUsers({ query })
                // 暂时使用传入的选项
                console.log('搜索经理:', query)
            } catch (error) {
                console.error('搜索部门经理失败:', error)
            } finally {
                this.managerLoading = false
            }
        },

        /**
         * 检查是否为子孙部门
         */
        isDescendant(checkId, ancestorId) {
            // TODO: 实现递归检查整个树结构
            return false
        },

        /**
         * 格式化日期时间
         */
        formatDateTime(dateTime) {
            return formatDateTime(dateTime)
        },

        /**
         * 处理关闭
         */
        handleClose() {
            if (this.submitting) {
                this.$message.warning('正在保存中，请稍候...')
                return
            }
            this.$emit('update:visible', false)
        },

        /**
         * 处理提交
         */
        async handleSubmit() {
            try {
                // 表单验证
                await this.$refs.departmentForm.validate()

                this.submitting = true

                let response
                if (this.isCreateMode) {
                    // 创建部门
                    response = await createDepartment(this.formData)
                } else if (this.isEditMode) {
                    // 更新部门
                    response = await updateDepartment(this.departmentData.id, this.formData)
                }

                if (response.success) {
                    const action = this.isCreateMode ? '创建' : '更新'
                    this.$message.success(`${action}成功`)
                    this.$emit('success', response.data)
                } else {
                    this.$message.error(response.error?.message || '操作失败')
                }
            } catch (error) {
                if (error !== 'validation failed') {
                    console.error('提交表单失败:', error)
                    this.$message.error('操作失败，请稍后重试')
                }
            } finally {
                this.submitting = false
            }
        },

        /**
         * 处理保存并继续
         */
        async handleSubmitAndContinue() {
            try {
                await this.handleSubmit()
                // 如果保存成功，重置表单继续创建
                if (!this.submitting) {
                    this.initForm()
                    this.$message.success('已保存，可以继续创建下一个部门')
                }
            } catch (error) {
                // 错误已在handleSubmit中处理
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.department-form-drawer {
    :deep(.el-drawer__body) {
        padding: 0;
        display: flex;
        flex-direction: column;
    }

    .drawer-content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;

        .form-section {
            margin-bottom: 32px;

            &:last-child {
                margin-bottom: 0;
            }

            .section-title {
                display: flex;
                align-items: center;
                font-size: 16px;
                font-weight: 500;
                color: #303133;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e4e7ed;

                i {
                    margin-right: 8px;
                    color: #409eff;
                }
            }
        }

        .form-tip {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
            line-height: 1.4;
        }

        :deep(.el-form-item) {
            margin-bottom: 20px;
        }

        :deep(.el-textarea) {
            .el-textarea__inner {
                resize: vertical;
            }
        }
    }

    .drawer-footer {
        padding: 16px 24px;
        border-top: 1px solid #e4e7ed;
        background: #fafafa;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
}

// 响应式设计
@media (max-width: 768px) {
    .department-form-drawer {
        :deep(.el-drawer) {
            width: 100% !important;
        }

        .drawer-content {
            padding: 16px;
        }

        .drawer-footer {
            padding: 12px 16px;
            flex-direction: column-reverse;

            .el-button {
                width: 100%;
            }
        }
    }
}
</style>
