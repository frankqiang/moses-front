<!--
 * 文件名称：PositionFormDrawer.vue
 * 文件描述：岗位表单抽屉组件，支持新增、编辑、查看模式
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 创建，符合process-management/operations模块的开发范式
-->

<template>
  <el-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :size="700"
    :before-close="handleClose"
    :close-on-click-modal="false"
    class="position-form-drawer"
  >
    <div class="drawer-content">
      <el-form
        ref="positionForm"
        :model="formData"
        :rules="formRules"
        :disabled="isViewMode"
        label-width="100px"
        size="medium"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-info" />
            基本信息
          </div>

          <el-form-item label="岗位名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入岗位名称" maxlength="100" show-word-limit />
          </el-form-item>

          <el-form-item label="岗位编码" prop="code">
            <el-input
              v-model="formData.code"
              placeholder="请输入岗位编码，将自动转为大写"
              maxlength="50"
              show-word-limit
              @input="handleCodeInput"
            />
            <div class="form-tip">
              岗位编码用于系统内部识别，建议使用英文缩写，如：DEV、QA等
            </div>
          </el-form-item>

          <el-form-item label="岗位类型" prop="type">
            <el-select v-model="formData.type" placeholder="请选择岗位类型" style="width: 100%">
              <el-option
                v-for="option in positionTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="岗位职责" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入岗位职责描述（可选）"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 组织关系 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-connection" />
            组织关系
          </div>

          <el-form-item label="所属部门" prop="departmentId">
            <el-select v-model="formData.departmentId" placeholder="请选择所属部门" filterable style="width: 100%">
              <el-option
                v-for="option in departmentOptions"
                :key="option.id"
                :label="option.name"
                :value="option.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="岗位级别" prop="level">
            <el-input-number
              v-model="formData.level"
              :min="1"
              :max="20"
              placeholder="岗位级别"
              style="width: 100%"
            />
            <div class="form-tip">
              数值越小级别越高，用于岗位层级管理
            </div>
          </el-form-item>

          <el-form-item label="排序顺序" prop="sortOrder">
            <el-input-number
              v-model="formData.sortOrder"
              :min="0"
              :max="9999"
              placeholder="排序顺序"
              style="width: 100%"
            />
            <div class="form-tip">
              数值越小排序越靠前，用于同部门岗位的显示顺序
            </div>
          </el-form-item>
        </div>

        <!-- 状态设置 -->
        <div class="form-section">
          <div class="section-title">
            <i class="el-icon-setting" />
            状态设置
          </div>

          <el-form-item label="岗位状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio label="active">启用</el-radio>
              <el-radio label="inactive">禁用</el-radio>
            </el-radio-group>
            <div class="form-tip">
              禁用的岗位将不能分配员工，也不会在选择器中显示
            </div>
          </el-form-item>
        </div>

        <!-- 查看模式下的额外信息 -->
        <div v-if="isViewMode && positionData" class="form-section">
          <div class="section-title">
            <i class="el-icon-time" />
            系统信息
          </div>

          <el-form-item label="创建时间">
            <span>{{ formatDateTime(positionData.createdAt) }}</span>
          </el-form-item>

          <el-form-item label="更新时间">
            <span>{{ formatDateTime(positionData.updatedAt) }}</span>
          </el-form-item>

          <el-form-item v-if="positionData.employees && positionData.employees.length > 0" label="在职员工">
            <el-tag
              v-for="employee in positionData.employees"
              :key="employee.id"
              type="info"
              size="small"
              style="margin-right: 8px; margin-bottom: 4px;"
            >
              {{ employee.name }}
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
      <el-button
        v-if="isCreateMode && !isViewMode"
        type="success"
        :loading="submitting"
        @click="handleSubmitAndContinue"
      >
        保存并继续
      </el-button>
    </div>
  </el-drawer>
</template>

<script>
import { createPosition, updatePosition } from '../api'
import { formatDateTime } from '@/utils'
import { FORM_RULES, POSITION_TYPE_OPTIONS } from '../constants/position'

export default {
  name: 'PositionFormDrawer',
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
    // 岗位数据（编辑和查看模式）
    positionData: {
      type: Object,
      default: null
    },
    // 部门选项
    departmentOptions: {
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
        type: '',
        description: '',
        departmentId: '',
        level: 1,
        sortOrder: 0,
        status: 'active'
      },

      // 状态
      submitting: false
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
        create: '新增岗位',
        edit: '编辑岗位',
        view: '查看岗位'
      }
      return titles[this.mode] || '岗位管理'
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
         * 岗位类型选项
         */
    positionTypeOptions() {
      return POSITION_TYPE_OPTIONS
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
         * 监听岗位数据变化
         */
    positionData: {
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
          type: '',
          description: '',
          departmentId: '',
          level: 1,
          sortOrder: 0,
          status: 'active'
        }
      } else if (this.positionData) {
        // 编辑或查看模式
        this.formData = {
          name: this.positionData.name || '',
          code: this.positionData.code || '',
          type: this.positionData.type || '',
          description: this.positionData.description || '',
          departmentId: this.positionData.departmentId || '',
          level: this.positionData.level || 1,
          sortOrder: this.positionData.sortOrder || 0,
          status: this.positionData.status || 'active'
        }
      }
    },

    /**
         * 重置表单
         */
    resetForm() {
      this.$nextTick(() => {
        if (this.$refs.positionForm) {
          this.$refs.positionForm.resetFields()
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
        await this.$refs.positionForm.validate()

        this.submitting = true

        let response
        if (this.isCreateMode) {
          // 创建岗位
          response = await createPosition(this.formData)
        } else if (this.isEditMode) {
          // 更新岗位
          response = await updatePosition(this.positionData.id, this.formData)
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
          this.$message.success('已保存，可以继续创建下一个岗位')
        }
      } catch (error) {
        // 错误已在handleSubmit中处理
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.position-form-drawer {
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
    .position-form-drawer {
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
