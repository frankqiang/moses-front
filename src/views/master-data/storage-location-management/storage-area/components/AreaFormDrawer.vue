<!--
文件名称: AreaFormDrawer.vue
文件描述: 库区表单抽屉组件
创建日期: 2025-01-20
修改记录:
  - 2025-01-20: 初始创建
-->

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :loading="loading"
    :confirm-button-text="confirmButtonText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <el-form
      ref="form"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      @submit.native.prevent
    >
      <!-- 创建模式: 库区代码 -->
      <el-form-item
        v-if="mode === 'create'"
        label="库区代码"
        prop="areaCode"
      >
        <el-input
          v-model="formData.areaCode"
          placeholder="请输入库区代码(如: DA、YA)"
          maxlength="50"
          show-word-limit
          clearable
          @input="handleAreaCodeInput"
        />
        <div class="form-item-tip">
          库区代码只能包含大写字母、数字和中划线,创建后不可修改
        </div>
      </el-form-item>

      <!-- 库区名称 -->
      <el-form-item label="库区名称" prop="areaName">
        <el-input
          v-model="formData.areaName"
          placeholder="请输入库区名称"
          maxlength="200"
          show-word-limit
          clearable
        />
      </el-form-item>

      <!-- 创建模式: 库区类型 -->
      <el-form-item
        v-if="mode === 'create'"
        label="库区类型"
        prop="areaType"
      >
        <el-select
          v-model="formData.areaType"
          placeholder="请选择库区类型"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in areaTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 编辑模式: 库区状态 -->
      <el-form-item
        v-if="mode === 'edit'"
        label="库区状态"
        prop="status"
      >
        <el-select
          v-model="formData.status"
          placeholder="请选择库区状态"
          style="width: 100%"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="form-item-tip">
          禁用库区后将无法添加新库位
        </div>
      </el-form-item>

      <!-- 库区描述 -->
      <el-form-item label="库区描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入库区描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import {
  AREA_TYPE_OPTIONS,
  AREA_STATUS_OPTIONS,
  AREA_FORM_RULES,
  CREATE_STORAGE_AREA_FORM
} from '../constants'
import { cloneDeep } from '@/utils'

export default {
  name: 'AreaFormDrawer',
  components: {
    BaseDrawer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create', // create | edit
      validator: (value) => ['create', 'edit'].includes(value)
    },
    initialData: {
      type: Object,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: cloneDeep(CREATE_STORAGE_AREA_FORM),
      areaTypeOptions: AREA_TYPE_OPTIONS,
      statusOptions: AREA_STATUS_OPTIONS,
      formRules: AREA_FORM_RULES
    }
  },
  computed: {
    drawerVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    drawerTitle() {
      return this.mode === 'create' ? '创建库区' : '编辑库区'
    },
    confirmButtonText() {
      return this.mode === 'create' ? '创建' : '保存'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initFormData()
      } else {
        this.resetForm()
      }
    }
  },
  methods: {
    initFormData() {
      if (this.mode === 'create') {
        this.formData = cloneDeep(CREATE_STORAGE_AREA_FORM)
      } else if (this.mode === 'edit' && this.initialData) {
        this.formData = {
          areaName: this.initialData.areaName || '',
          description: this.initialData.description || '',
          status: this.initialData.status || 'enabled'
        }
      }
    },
    handleAreaCodeInput(value) {
      // 自动转换为大写
      this.formData.areaCode = value.toUpperCase()
    },
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('confirm', cloneDeep(this.formData))
        }
      })
    },
    handleCancel() {
      this.drawerVisible = false
    },
    resetForm() {
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>

