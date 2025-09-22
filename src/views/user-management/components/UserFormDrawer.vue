/**
* 用户表单抽屉组件
* 功能描述：提供用户新增、编辑和查看功能的表单，使用BaseDrawer+EnhancedForm组合
* 创建日期：2024-01-15
* 修改记录：
* - 2024-01-15: 重构为现代化组件架构，参考OperationFormDrawer实现
*/
<template>
    <base-drawer :visible.sync="drawerVisible" :title="drawerTitle" width="800px" :wrapper-closable="false"
        @open="handleDrawerOpen" @close="handleDrawerClose">

        <!-- 错误提示区域 -->
        <template #error>
            <div v-if="formErrorMessage" class="error-message">
                <i class="el-icon-warning" />
                <span>{{ formErrorMessage }}</span>
                <el-button type="text" size="mini" @click="clearFormError">
                    <i class="el-icon-close" />
                </el-button>
            </div>
        </template>
        <!-- 表单内容 -->
        <enhanced-form ref="enhancedForm" :data="formData" :mode="innerMode" :rules="formRules" label-width="120px"
            :show-footer="false" :show-error="false" :clear-validate-on-data-update="true" :disable-initial-validation="true"
            :validate-on-data-change="false" @submit="handleFormSubmit" @validate="handleCustomValidate"
            @validate-error="handleValidateError" @reset="handleFormReset">
            <!-- 表单内容 -->
            <template v-slot="{ form, mode: formMode }">
                <!-- 一、基础信息 -->
                <div class="form-section">
                    <div class="section-title">一、基础信息</div>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="用户名" prop="username">
                                <el-input v-model="form.username" placeholder="请输入用户名" maxlength="50" show-word-limit
                                    :disabled="formMode === 'view' || formMode === 'update'" />
                                <div class="field-hint">用户名只能包含字母、数字和下划线，创建后不可修改</div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="姓名" prop="name">
                                <el-input v-model="form.name" placeholder="请输入真实姓名" maxlength="50" show-word-limit
                                    :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="邮箱" prop="email">
                                <el-input v-model="form.email" placeholder="请输入邮箱地址" maxlength="100"
                                    :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="手机号码" prop="phone">
                                <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="20"
                                    :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row v-if="formMode === 'create'" :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="密码" prop="password">
                                <el-input v-model="form.password" type="password" placeholder="请输入密码" maxlength="50"
                                    show-password :disabled="formMode === 'view'" />
                                <div class="field-hint">密码长度8-50位，包含大小写字母、数字</div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="确认密码" prop="confirmPassword">
                                <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码"
                                    maxlength="50" show-password :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="性别" prop="gender">
                                <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%"
                                    :disabled="formMode === 'view'">
                                    <el-option v-for="option in genderOptions" :key="option.value" :label="option.label"
                                        :value="option.value" />
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="用户角色" prop="role">
                                <el-select v-model="form.role" placeholder="请选择用户角色" style="width: 100%"
                                    :disabled="formMode === 'view'">
                                    <el-option v-for="option in basicRoleOptions" :key="option.value"
                                        :label="option.label" :value="option.value" />
                                </el-select>
                                <div class="field-hint">基础角色，用于系统权限控制</div>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-form-item label="状态" prop="status">
                                <el-radio-group v-model="form.status" :disabled="formMode === 'view'">
                                    <el-radio v-for="option in userStatusOptions" :key="option.value"
                                        :label="option.value">
                                        {{ option.label }}
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>

                <!-- 二、组织架构信息 -->
                <div class="form-section">
                    <div class="section-title">二、组织架构信息</div>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="所属部门" prop="departmentId">
                                <el-select v-model="form.departmentId" placeholder="请选择所属部门" style="width: 100%"
                                    :disabled="formMode === 'view'" filterable clearable>
                                    <el-option v-for="dept in departmentOptions" :key="dept.value" :label="dept.label"
                                        :value="dept.value" />
                                </el-select>
                                <div class="field-hint">临时数据，后续对接部门管理接口</div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="岗位" prop="positionId">
                                <el-select v-model="form.positionId" placeholder="请选择岗位" style="width: 100%"
                                    :disabled="formMode === 'view'" filterable clearable>
                                    <el-option v-for="pos in positionOptions" :key="pos.value" :label="pos.label"
                                        :value="pos.value" />
                                </el-select>
                                <div class="field-hint">临时数据，后续对接岗位管理接口</div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>

                <!-- 三、档案信息 -->
                <div class="form-section">
                    <div class="section-title">三、档案信息</div>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="员工工号" prop="employeeId">
                                <el-input v-model="form.employeeId" placeholder="请输入员工工号" maxlength="50"
                                    :disabled="formMode === 'view'" />
                                <div class="field-hint">工号必须全局唯一</div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="职位名称" prop="jobTitle">
                                <el-input v-model="form.jobTitle" placeholder="请输入职位名称" maxlength="100"
                                    :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="直属上级" prop="managerId">
                                <el-select v-model="form.managerId" placeholder="请选择直属上级" style="width: 100%"
                                    :disabled="formMode === 'view'" filterable clearable>
                                    <el-option v-for="manager in managerOptions" :key="manager.value"
                                        :label="manager.label" :value="manager.value" />
                                </el-select>
                                <div class="field-hint">临时数据，后续对接用户管理接口</div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="出生日期" prop="birthDate">
                                <el-date-picker v-model="form.birthDate" type="date" placeholder="请选择出生日期"
                                    style="width: 100%" :disabled="formMode === 'view'" format="yyyy-MM-dd"
                                    value-format="yyyy-MM-dd" />
                                <div class="field-hint">年龄需在16-100岁之间</div>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="入职日期" prop="hireDate">
                                <el-date-picker v-model="form.hireDate" type="date" placeholder="请选择入职日期"
                                    style="width: 100%" :disabled="formMode === 'view'" format="yyyy-MM-dd"
                                    value-format="yyyy-MM-dd" />
                                <div class="field-hint">不能是未来日期</div>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="家庭住址" prop="address">
                                <el-input v-model="form.address" placeholder="请输入家庭住址" maxlength="500"
                                    :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="紧急联系人" prop="emergencyContact">
                                <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人姓名" maxlength="100"
                                    :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="紧急联系电话" prop="emergencyPhone">
                                <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" maxlength="20"
                                    :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                    </el-row>

                </div>

                <!-- 四、角色权限 -->
                <div class="form-section">
                    <div class="section-title">四、角色权限</div>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="分配角色" prop="roleIds">
                                <el-select v-model="form.roleIds" multiple placeholder="请选择分配角色" style="width: 100%"
                                    :disabled="formMode === 'view'" filterable collapse-tags>
                                    <el-option v-for="role in roleOptions" :key="role.value" :label="role.label"
                                        :value="role.value">
                                        <span style="float: left">{{ role.label }}</span>
                                        <span style="float: right; color: #8492a6; font-size: 13px">{{ role.description
                                        }}</span>
                                    </el-option>
                                </el-select>
                                <div class="field-hint">可选择多个角色，用户权限为所有角色权限的并集。临时数据，后续对接角色管理接口</div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>

                <!-- 五、备注信息 -->
                <div class="form-section">
                    <div class="section-title">五、备注信息</div>
                    <el-row>
                        <el-col :span="24">
                            <el-form-item label="备注信息" prop="notes">
                                <el-input v-model="form.notes" type="textarea" placeholder="请输入备注信息" :rows="3"
                                    maxlength="1000" show-word-limit :disabled="formMode === 'view'" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </template>
        </enhanced-form>

        <!-- 抽屉底部按钮 -->
        <template #footer>
            <el-button @click="handleCancel">{{ innerMode === 'view' ? '关闭' : '取消' }}</el-button>
            <el-button v-if="innerMode !== 'view'" @click="handleReset">重置</el-button>
            <el-button v-if="innerMode === 'create'" type="primary" :loading="loading" @click="handleSubmitAndContinue">
                保存并继续
            </el-button>
            <el-button v-if="innerMode !== 'view'" type="primary" :loading="loading" @click="handleSubmit">
                {{ innerMode === 'create' ? '确认保存' : '保存修改' }}
            </el-button>
        </template>
    </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import EnhancedForm from '@/components/EnhancedForm'
import {
    createUser, // eslint-disable-line no-unused-vars
    updateUser // eslint-disable-line no-unused-vars
} from '../api'
import {
    USER_STATUS_OPTIONS,
    GENDER_OPTIONS
} from '../constants'

export default {
    name: 'UserFormDrawer',
    components: {
        BaseDrawer,
        EnhancedForm
    },
    props: {
        // 抽屉可见性
        visible: {
            type: Boolean,
            default: false
        },
        // 操作模式：create-新增, update-编辑, view-查看
        mode: {
            type: String,
            default: 'create',
            validator: (value) => ['create', 'update', 'view'].includes(value)
        },
        // 用户数据（编辑和查看时使用）
        userData: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            // 抽屉内部可见性
            drawerVisible: false,
            // 表单数据
            formData: this.initFormData(),
            // 加载状态
            loading: false,
            // 表单错误消息
            formErrorMessage: '',
            // 部门选项（临时数据）
            departmentOptions: [
                { value: 'dept-001', label: '技术部' },
                { value: 'dept-002', label: '产品部' },
                { value: 'dept-003', label: '运营部' },
                { value: 'dept-004', label: '市场部' },
                { value: 'dept-005', label: '人事部' },
                { value: 'dept-006', label: '财务部' },
                { value: 'dept-007', label: '行政部' }
            ],
            // 角色选项（临时数据）
            roleOptions: [
                { value: 'role-001', label: '超级管理员', description: '拥有系统所有权限' },
                { value: 'role-002', label: '系统管理员', description: '拥有系统管理权限' },
                { value: 'role-003', label: '项目经理', description: '负责项目管理' },
                { value: 'role-004', label: '高级开发', description: '高级开发工程师' },
                { value: 'role-005', label: '开发工程师', description: '开发工程师' },
                { value: 'role-006', label: '测试工程师', description: '负责软件测试' },
                { value: 'role-007', label: '运维工程师', description: '负责系统运维' },
                { value: 'role-008', label: '产品经理', description: '负责产品规划' },
                { value: 'role-009', label: '用户', description: '普通用户权限' }
            ],
            // 岗位选项（临时数据）
            positionOptions: [
                { value: 'pos-001', label: '高级软件工程师' },
                { value: 'pos-002', label: '软件工程师' },
                { value: 'pos-003', label: '初级软件工程师' },
                { value: 'pos-004', label: '测试工程师' },
                { value: 'pos-005', label: '高级测试工程师' },
                { value: 'pos-006', label: '产品经理' },
                { value: 'pos-007', label: '项目经理' },
                { value: 'pos-008', label: '运维工程师' },
                { value: 'pos-009', label: 'UI设计师' },
                { value: 'pos-010', label: '技术总监' }
            ],
            // 上级选项（临时数据）
            managerOptions: [
                { value: 'user-001', label: '王经理 (wang@example.com)' },
                { value: 'user-002', label: '李总监 (li@example.com)' },
                { value: 'user-003', label: '张主管 (zhang@example.com)' },
                { value: 'user-004', label: '陈部长 (chen@example.com)' },
                { value: 'user-005', label: '刘经理 (liu@example.com)' }
            ]
        }
    },
    computed: {
        // 内部模式
        innerMode() {
            return this.mode
        },
        // 抽屉标题
        drawerTitle() {
            const titleMap = {
                create: '新增用户',
                update: '编辑用户',
                view: '查看用户'
            }
            return titleMap[this.mode] || '用户管理'
        },
        // 性别选项
        genderOptions() {
            return GENDER_OPTIONS
        },
        // 用户状态选项
        userStatusOptions() {
            return USER_STATUS_OPTIONS
        },
        // 基础角色选项（对应接口的role字段）
        basicRoleOptions() {
            return [
                { value: 'user', label: '普通用户' },
                { value: 'admin', label: '管理员' }
            ]
        },
        // 表单验证规则
        formRules() {
            const rules = {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    {
                        pattern: /^[a-zA-Z0-9_]+$/,
                        message: '用户名只能包含字母、数字和下划线',
                        trigger: 'blur'
                    },
                    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
                    {
                        trigger: 'blur'
                    }
                ],
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
                    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
                    {
                        trigger: 'blur'
                    }
                ],
                phone: [
                    {
                        pattern: /^1[3-9]\d{9}$/,
                        message: '请输入正确的手机号码',
                        trigger: 'blur'
                    }
                ],
                status: [
                    { required: true, message: '请选择用户状态', trigger: 'change' }
                ],
                role: [
                    { required: true, message: '请选择用户角色', trigger: 'change' }
                ],
                // 档案信息验证规则
                employeeId: [
                    { max: 50, message: '员工工号最多50个字符', trigger: 'blur' }
                ],
                jobTitle: [
                    { max: 100, message: '职位名称最多100个字符', trigger: 'blur' }
                ],
                address: [
                    { max: 500, message: '家庭住址最多500个字符', trigger: 'blur' }
                ],
                emergencyContact: [
                    { max: 100, message: '紧急联系人姓名最多100个字符', trigger: 'blur' }
                ],
                emergencyPhone: [
                    {
                        pattern: /^1[3-9]\d{9}$/,
                        message: '请输入正确的手机号码',
                        trigger: 'blur'
                    }
                ],
                notes: [
                    { max: 1000, message: '备注信息最多1000个字符', trigger: 'blur' }
                ],
                hireDate: [
                    {
                        validator: this.validateHireDate,
                        trigger: 'change'
                    }
                ],
                birthDate: [
                    {
                        validator: this.validateBirthDate,
                        trigger: 'change'
                    }
                ]
            }

            // 新增用户时添加密码验证
            if (this.mode === 'create') {
                rules.password = [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,50}$/,
                        message: '密码必须包含大小写字母和数字，长度8-50位',
                        trigger: 'blur'
                    }
                ]
                rules.confirmPassword = [
                    { required: true, message: '请确认密码', trigger: 'blur' },
                    {
                        validator: this.validatePasswordConfirm,
                        trigger: 'blur'
                    }
                ]
            }

            return rules
        }
    },
    watch: {
        // 监听可见性变化
        visible: {
            immediate: true,
            handler(newVal) {
                this.drawerVisible = newVal
            }
        },
        // 监听抽屉内部可见性变化
        drawerVisible(newVal) {
            this.$emit('update:visible', newVal)
        },
        // 监听用户数据变化
        userData: {
            immediate: true,
            deep: true,
            handler(newVal) {
                if (newVal && (this.mode === 'update' || this.mode === 'view')) {
                    this.formData = { ...this.initFormData(), ...newVal }
                }
            }
        }
    },
    created() {
        // 组件初始化
    },
    methods: {
        // 初始化表单数据
        initFormData() {
            return {
                id: undefined,
                // 必填字段
                username: '',
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'user', // 接口必填字段
                // 组织架构字段
                departmentId: '', // 部门ID
                positionId: '', // 岗位ID
                roleIds: [], // 角色ID列表
                // 档案信息字段
                employeeId: '', // 员工工号
                jobTitle: '', // 职位名称
                managerId: '', // 直属上级ID
                hireDate: '', // 入职日期
                birthDate: '', // 出生日期
                gender: '', // 性别
                address: '', // 家庭住址
                emergencyContact: '', // 紧急联系人姓名
                emergencyPhone: '', // 紧急联系人电话
                notes: '', // 备注信息
                // 其他字段
                phone: '',
                status: 'active'
            }
        },

        // 抽屉打开处理
        handleDrawerOpen() {
            // 初始化表单数据
            if (this.mode === 'create') {
                this.formData = this.initFormData()
            } else if (this.userData) {
                this.formData = { ...this.initFormData(), ...this.userData }
            }
        },

        // 抽屉关闭处理
        handleDrawerClose() {
            // 清除错误消息
            this.clearFormError()
            // 重置表单数据
            this.formData = this.initFormData()
            this.$emit('close')
        },

        // 取消按钮处理
        handleCancel() {
            this.drawerVisible = false
        },

        // 重置按钮处理
        handleReset() {
            this.$confirm('确定要重置表单吗？', '重置确认', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.handleFormReset()
                this.$message.success('表单已重置')
            }).catch(() => {
                // 用户取消重置
            })
        },

        // 提交按钮处理
        handleSubmit() {
            // 触发 EnhancedForm 的内置提交机制
            if (this.$refs.enhancedForm) {
                this.$refs.enhancedForm.handleSubmitClick()
            }
        },

        // 保存并继续按钮处理
        handleSubmitAndContinue() {
            // 触发 EnhancedForm 的内置保存并继续机制
            if (this.$refs.enhancedForm) {
                this.$refs.enhancedForm.handleContinueClick()
            }
        },

        // 业务逻辑：实际的数据提交处理
        async handleFormSubmit(formData, continueEdit = false) {
            try {
                // 清除之前的错误消息
                this.clearFormError()
                this.loading = true
                let response

                if (this.mode === 'create') {
                    // 移除确认密码字段
                    const { confirmPassword, ...submitData } = formData // eslint-disable-line no-unused-vars
                    response = await createUser(submitData)
                } else if (this.mode === 'update') {
                    // 移除密码相关字段
                    const { password, confirmPassword, ...submitData } = formData // eslint-disable-line no-unused-vars
                    response = await updateUser(formData.id, submitData)
                }

                // 从API响应中获取消息，提供备选默认消息
                const successMessage = response?.message ||
                    (this.mode === 'create' ? '用户创建成功' : '用户更新成功')
                this.$message.success(successMessage)

                this.$emit('success', { mode: this.mode, data: formData, continueEdit })

                if (continueEdit) {
                    // 保存并继续 - 重置表单
                    this.formData = this.initFormData()
                } else {
                    // 普通保存 - 关闭抽屉
                    this.drawerVisible = false
                }
            } catch (error) {
                console.error('用户保存失败:', error)
                let errorMessage = '操作失败，请稍后重试'

                if (error && error.response && error.response.data) {
                    errorMessage = error.response.data.message || error.response.data.error?.message || errorMessage
                } else if (error && error.message) {
                    errorMessage = error.message
                }

                this.$message.error(errorMessage)
            } finally {
                this.loading = false
            }
        },

        // 自定义验证处理
        handleCustomValidate(formData, callback) {
            // 可以在这里添加额外的自定义验证逻辑
            callback(true)
        },

        // 验证错误处理
        handleValidateError(invalidFields) {
            console.log('表单验证失败:', invalidFields)

            // 提取第一个错误消息并显示在顶部
            const firstErrorField = Object.keys(invalidFields)[0]
            if (firstErrorField && invalidFields[firstErrorField] && invalidFields[firstErrorField][0]) {
                this.formErrorMessage = invalidFields[firstErrorField][0].message
            }

            // 聚焦到第一个错误字段
            this.$nextTick(() => {
                if (firstErrorField && this.$refs.enhancedForm && this.$refs.enhancedForm.$el) {
                    const fieldElement = this.$refs.enhancedForm.$el.querySelector(`[prop="${firstErrorField}"] input, [prop="${firstErrorField}"] textarea`)
                    if (fieldElement) {
                        fieldElement.focus()
                    }
                }
            })
        },

        // 清除表单错误消息
        clearFormError() {
            this.formErrorMessage = ''
        },

        // 表单重置处理
        handleFormReset() {
            this.formData = this.initFormData()
        },



        // 确认密码验证
        validatePasswordConfirm(rule, value, callback) {
            if (value !== this.formData.password) {
                callback(new Error('两次输入的密码不一致'))
            } else {
                callback()
            }
        },


        // 验证入职日期
        validateHireDate(rule, value, callback) {
            if (!value) {
                callback()
                return
            }

            const hireDate = new Date(value)
            const today = new Date()
            today.setHours(23, 59, 59, 999) // 设置为今天的最后一毫秒

            if (hireDate > today) {
                callback(new Error('入职日期不能是未来日期'))
            } else {
                callback()
            }
        },

        // 验证出生日期
        validateBirthDate(rule, value, callback) {
            if (!value) {
                callback()
                return
            }

            const birthDate = new Date(value)
            const today = new Date()
            const age = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()

            let realAge = age
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                realAge--
            }

            if (realAge < 16) {
                callback(new Error('年龄不能小于16岁'))
            } else if (realAge > 100) {
                callback(new Error('年龄不能大于100岁'))
            } else {
                callback()
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.form-section {
    margin-bottom: 30px;

    .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e4e7ed;
    }
}

.field-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.4;
}

::v-deep .el-form-item__label {
    font-weight: 500;
}

::v-deep .el-textarea__inner {
    font-family: inherit;
}

::v-deep .el-radio {
    margin-right: 20px;
}

::v-deep .el-select .el-select__tags {
    max-width: calc(100% - 30px);
}

// 错误消息样式
.error-message {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon-warning {
        color: #f56c6c;
        font-size: 16px;
        flex-shrink: 0;
    }

    span {
        flex: 1;
        font-weight: 500;
    }

    .el-button {
        color: #f56c6c;
        padding: 0;
        min-height: auto;

        &:hover {
            color: #f78989;
        }

        .el-icon-close {
            font-size: 14px;
        }
    }
}
</style>
