# EnhancedForm 增强表单组件

## 组件概述

EnhancedForm 是一个增强的表单组件，专注于表单的数据处理和验证，支持多种模式和自定义验证。此组件基于 Element UI 的 Form 组件进行封装，提供了更丰富的功能和更简洁的 API。

## 主要特点

1. **专注表单功能**：组件专注于提供表单的数据处理和验证功能，不耦合其他逻辑
2. **多种表单模式**：支持创建、更新和查看三种模式，方便复用同一个表单
3. **增强的验证机制**：支持标准验证和自定义验证逻辑，满足复杂的业务需求
4. **灵活的插槽系统**：通过作用域插槽提供表单内容和底部按钮的自定义能力
5. **便捷的表单操作**：提供多种方法操作表单数据和验证状态

## 基本用法

```vue
<template>
  <enhanced-form
    ref="form"
    :data="formData"
    :mode="mode"
    :rules="rules"
    label-width="100px"
    :loading="loading"
    @submit="handleSubmit"
  >
    <template v-slot="{ form, mode }">
      <!-- 表单项 -->
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username"></el-input>
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email"></el-input>
      </el-form-item>
      
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色">
          <el-option label="管理员" value="admin"></el-option>
          <el-option label="用户" value="user"></el-option>
        </el-select>
      </el-form-item>
    </template>
    
    <!-- 自定义底部按钮 -->
    <template #footer="{ loading, mode, submit, reset }">
      <el-button @click="reset">重置</el-button>
      <el-button type="primary" @click="submit" :loading="loading">提交</el-button>
    </template>
  </enhanced-form>
</template>

<script>
import EnhancedForm from '@/components/EnhancedForm/index.vue'

export default {
  components: {
    EnhancedForm
  },
  data() {
    return {
      mode: 'create',
      formData: {
        username: '',
        email: '',
        role: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      },
      loading: false
    }
  },
  methods: {
    handleSubmit(formData, continueEdit) {
      console.log('表单提交:', formData, continueEdit)
      // 处理表单提交
      this.loading = true
      
      // 模拟API请求
      setTimeout(() => {
        this.loading = false
        this.$message.success('提交成功')
      }, 1000)
    }
  }
}
</script>
```

## 属性

| 属性名              | 类型    | 默认值   | 说明                                   |
|--------------------|---------|---------|---------------------------------------|
| data               | Object  | {}      | 表单数据                               |
| mode               | String  | 'create'| 表单模式，可选值：create/update/view    |
| rules              | Object  | {}      | 表单验证规则                           |
| labelWidth         | String  | '120px' | 表单标签宽度                           |
| size               | String  | 'small' | 表单尺寸                               |
| showFooter         | Boolean | false   | 是否显示底部按钮区域                    |
| submitButtonText   | String  | '提交'  | 提交按钮文本                           |
| resetButtonText    | String  | '重置'  | 重置按钮文本                           |
| continueButtonText | String  | '保存并继续' | 继续按钮文本                        |
| showContinueButton | Boolean | false   | 是否显示"保存并继续"按钮                 |
| loading            | Boolean | false   | 加载状态                               |
| validateBeforeSubmit| Boolean| true    | 是否在提交前自动验证表单                 |

## 事件

| 事件名        | 参数                         | 说明                            |
|--------------|------------------------------|--------------------------------|
| submit       | (formData, continueEdit)     | 表单提交时触发                   |
| reset        | (formData)                   | 表单重置时触发                   |
| validate     | (formData, callback)         | 自定义验证时触发                 |
| validate-error| 无                          | 表单验证失败时触发               |
| form-update  | (formData)                   | 表单数据更新时触发               |
| field-change | ({ field, value, formData }) | 表单字段值变更时触发             |

## 插槽

| 插槽名   | 说明           | 作用域变量                                        |
|---------|---------------|--------------------------------------------------|
| default | 表单内容区域    | form: 表单数据对象, mode: 当前模式, submit: 提交方法, reset: 重置方法 |
| footer  | 底部按钮区域    | loading: 加载状态, mode: 当前模式, submit: 提交方法, reset: 重置方法 |

## 方法

| 方法名         | 参数              | 说明                     |
|---------------|------------------|--------------------------|
| handleSubmit   | 无               | 手动触发表单提交          |
| resetForm      | 无               | 重置表单                 |
| validate       | (callback)       | 手动触发表单验证          |
| clearValidate  | (props)          | 清除表单验证信息          |
| getFormData    | 无               | 获取表单数据              |
| setFieldValue  | (field, value)   | 设置表单字段值            |

## 示例

### 表单模式切换

```vue
<template>
  <div>
    <el-radio-group v-model="mode">
      <el-radio-button label="create">创建</el-radio-button>
      <el-radio-button label="update">编辑</el-radio-button>
      <el-radio-button label="view">查看</el-radio-button>
    </el-radio-group>
    
    <enhanced-form
      ref="form"
      :data="formData"
      :mode="mode"
      :rules="rules"
      label-width="100px"
      @submit="handleSubmit"
    >
      <!-- 表单内容 -->
      <template v-slot="{ form, mode }">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <!-- 更多表单项... -->
      </template>
    </enhanced-form>
  </div>
</template>
```

### 自定义验证

```vue
<template>
  <enhanced-form
    ref="form"
    :data="formData"
    :rules="rules"
    @validate="handleCustomValidate"
    @validate-error="handleValidateError"
    @submit="handleSubmit"
  >
    <!-- 表单内容 -->
  </enhanced-form>
</template>

<script>
export default {
  methods: {
    handleCustomValidate(formData, callback) {
      // 自定义验证逻辑
      if (formData.password !== formData.confirmPassword) {
        this.$message.error('两次密码输入不一致')
        callback(false)
      } else {
        callback(true)
      }
    },
    handleValidateError() {
      this.$message.error('表单验证失败，请检查表单填写是否正确')
    }
  }
}
</script>
```

### 表单字段联动

```vue
<template>
  <enhanced-form
    ref="form"
    :data="formData"
    :rules="rules"
    @field-change="handleFieldChange"
    @submit="handleSubmit"
  >
    <!-- 表单内容 -->
  </enhanced-form>
</template>

<script>
export default {
  methods: {
    handleFieldChange({ field, value, formData }) {
      // 处理表单字段联动
      if (field === 'country') {
        // 根据国家更新城市选项
        this.updateCityOptions(value)
      }
    },
    updateCityOptions(country) {
      // 更新城市选项逻辑
    }
  }
}
</script>
```

## 与其他组件组合使用

EnhancedForm 组件可以与其他组件自由组合使用，特别是与 BaseDrawer 组件组合可以实现抽屉表单功能。具体示例请参考 `src/components/DrawerForm/example.vue`。 