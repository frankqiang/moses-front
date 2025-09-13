/**
 * 文件名称：UserForm.vue
 * 文件描述：用户表单组件，负责用户信息的新增、编辑和查看
 * 创建日期：2024-01-15
 * 修改记录：
 *   - 2024-01-15: 从index.vue中拆分出来，提高组件复用性
 */
<template>
  <drawer-form
    ref="userFormDrawer"
    :visible.sync="visible"
    :title="title"
    :form-items="formItems"
    :form-data="formData"
    :form-rules="formRules"
    :loading="loading"
    :readonly="readonly"
    @submit="handleSubmit"
    @close="handleClose"
  />
</template>

<script>
import DrawerForm from '@/components/DrawerForm'
import { 
  USER_FORM_FIELDS, 
  USER_FORM_RULES, 
  FORM_SECTIONS 
} from '../constants/form-config'
import { USER_STATUS, GENDER, DEPARTMENT, ROLE } from '../constants'

export default {
  name: 'UserForm',
  components: {
    DrawerForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '用户信息'
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    /**
     * 表单项配置 - 使用统一配置文件
     */
    formItems() {
      return USER_FORM_FIELDS.filter(field => {
        // 根据创建/编辑模式过滤字段
        if (this.isCreate) {
          return field.showInCreate !== false
        } else {
          return field.showInUpdate !== false
        }
      }).map(field => {
        // 动态设置必填状态
        if (['password', 'confirmPassword'].includes(field.prop)) {
          return {
            ...field,
            required: this.isCreate,
            hidden: !this.isCreate
          }
        }
        return field
      })
    },

    /**
     * 表单验证规则 - 使用统一配置文件
     */
    formRules() {
      const rules = { ...USER_FORM_RULES }

      // 新增用户时添加确认密码验证
      if (this.isCreate && rules.confirmPassword) {
        rules.confirmPassword = [
          ...rules.confirmPassword,
          {
            validator: (rule, value, callback) => {
              if (value !== this.formData.password) {
                callback(new Error('两次输入密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }

      return rules
    }
  },
  methods: {
    /**
     * 表单提交处理
     */
    handleSubmit(formData) {
      this.$emit('submit', formData)
    },

    /**
     * 表单关闭处理
     */
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/* 组件特定样式 */
</style>