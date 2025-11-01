<!--
文件名称：SparePartFormDrawer.vue
文件描述：备件创建/编辑表单抽屉组件
创建日期：2025-01-21
修改记录：
  - 2025-01-21: 初始创建，实现备件创建表单功能
  - 2025-01-25: 添加编辑模式支持，实现数据回填和部分更新
-->

<template>
  <el-drawer
    :title="drawerTitle"
    :visible.sync="visible"
    direction="rtl"
    size="800px"
    :before-close="handleClose"
    :close-on-press-escape="false"
    :wrapper-closable="false"
  >
    <div class="spare-part-form-container">
      <el-form
        ref="sparePartForm"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        size="small"
        @submit.native.prevent
      >
        <!-- 基础信息 -->
        <div class="form-section">
          <div class="section-title">基础信息</div>
          <el-form-item label="备件编码" prop="sparePartCode">
            <el-input
              v-model="formData.sparePartCode"
              placeholder="请输入备件编码（自动转大写）"
              clearable
              maxlength="100"
              show-word-limit
              :disabled="isEditMode"
              @input="handleCodeInput"
            />
            <div v-if="isEditMode" class="form-item-tip">备件编码创建后不可修改</div>
          </el-form-item>

          <el-form-item label="备件名称" prop="sparePartName">
            <el-input
              v-model="formData.sparePartName"
              placeholder="请输入备件名称"
              clearable
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="规格型号" prop="specification">
            <el-input
              v-model="formData.specification"
              placeholder="请输入规格型号"
              clearable
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="计量单位" prop="unit">
            <el-select
              v-model="formData.unit"
              placeholder="请选择计量单位"
              clearable
              filterable
              allow-create
              style="width: 100%"
            >
              <el-option
                v-for="item in unitOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="适用设备类型" prop="applicableEquipmentTypes">
            <el-select
              v-model="equipmentTypesArray"
              placeholder="请选择适用设备类型（可多选）"
              multiple
              filterable
              clearable
              style="width: 100%"
              :loading="loadingEquipmentTypes"
            >
              <el-option
                v-for="item in equipmentTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="form-item-tip">支持多选设备类型，用于快速匹配设备维护所需备件</div>
          </el-form-item>

          <el-form-item label="单价" prop="unitPrice">
            <el-input-number
              v-model="formData.unitPrice"
              placeholder="请输入单价"
              :min="0"
              :precision="2"
              :step="1"
              :controls="false"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <!-- 供应商信息 -->
        <div class="form-section">
          <div class="section-title">供应商信息</div>
          <el-form-item label="供应商名称" prop="supplierInfo.name">
            <el-input
              v-model="formData.supplierInfo.name"
              placeholder="请输入供应商名称"
              clearable
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="联系人" prop="supplierInfo.contact">
            <el-input
              v-model="formData.supplierInfo.contact"
              placeholder="请输入联系人"
              clearable
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="联系电话" prop="supplierInfo.phone">
            <el-input
              v-model="formData.supplierInfo.phone"
              placeholder="请输入联系电话"
              clearable
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="supplierInfo.email">
            <el-input
              v-model="formData.supplierInfo.email"
              placeholder="请输入邮箱"
              clearable
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 库存配置 -->
        <div class="form-section">
          <div class="section-title">库存配置</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="库存上限" prop="maxStock">
                <el-input-number
                  v-model="formData.maxStock"
                  placeholder="库存上限"
                  :min="0"
                  :step="1"
                  :controls="false"
                  style="width: 100%"
                  @change="validateStockLimits"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="库存下限" prop="minStock">
                <el-input-number
                  v-model="formData.minStock"
                  placeholder="库存下限"
                  :min="0"
                  :step="1"
                  :controls="false"
                  style="width: 100%"
                  @change="validateStockLimits"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="安全库存" prop="safetyStock">
            <el-input-number
              v-model="formData.safetyStock"
              placeholder="请输入安全库存"
              :min="0"
              :step="1"
              :controls="false"
              style="width: 100%"
            />
            <div class="form-item-tip">当前库存低于安全库存时将触发预警</div>
          </el-form-item>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购提前期" prop="leadTimeDays">
                <el-input-number
                  v-model="formData.leadTimeDays"
                  placeholder="采购提前期"
                  :min="0"
                  :step="1"
                  :controls="false"
                  style="width: 100%"
                />
                <div class="form-item-tip">单位：天</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="保质期" prop="shelfLifeMonths">
                <el-input-number
                  v-model="formData.shelfLifeMonths"
                  placeholder="保质期"
                  :min="0"
                  :step="1"
                  :controls="false"
                  style="width: 100%"
                />
                <div class="form-item-tip">单位：月</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="存储位置" prop="storageLocation">
            <el-input
              v-model="formData.storageLocation"
              placeholder="请输入存储位置"
              clearable
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 备注信息 -->
        <div class="form-section">
          <div class="section-title">备注信息</div>
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              placeholder="请输入备注信息"
              :rows="4"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>
      </el-form>

      <!-- 操作按钮 -->
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          {{ submitting ? '提交中...' : '确定' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { createSparePart, updateSparePart, getSparePartById } from '../api/sparePart'
import { getEquipmentTypes } from '@/api/master-data/equipment'
import { UNIT_OPTIONS } from '../constants/spare-part-management'

export default {
  name: 'SparePartFormDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create',
      validator: (value) => ['create', 'edit'].includes(value)
    },
    sparePartId: {
      type: String,
      default: ''
    }
  },
  data() {
    // 邮箱验证规则
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailReg.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
      } else {
        callback()
      }
    }

    // 库存上下限验证
    const validateStockLimit = (rule, value, callback) => {
      if (this.formData.maxStock != null && this.formData.minStock != null) {
        if (this.formData.maxStock < this.formData.minStock) {
          callback(new Error('库存上限不能小于库存下限'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      formData: {
        sparePartCode: '',
        sparePartName: '',
        specification: '',
        applicableEquipmentTypes: '',
        supplierInfo: {
          name: '',
          contact: '',
          phone: '',
          email: ''
        },
        unitPrice: null,
        unit: '',
        maxStock: null,
        minStock: null,
        safetyStock: 0,
        leadTimeDays: null,
        storageLocation: '',
        shelfLifeMonths: null,
        remark: ''
      },
      formRules: {
        sparePartCode: [
          { required: true, message: '请输入备件编码', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        sparePartName: [
          { required: true, message: '请输入备件名称', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ],
        unit: [
          { required: true, message: '请选择计量单位', trigger: 'change' }
        ],
        unitPrice: [
          { type: 'number', min: 0, message: '单价不能小于0', trigger: 'blur' }
        ],
        maxStock: [
          { type: 'number', min: 0, message: '库存上限不能小于0', trigger: 'blur' },
          { validator: validateStockLimit, trigger: 'blur' }
        ],
        minStock: [
          { type: 'number', min: 0, message: '库存下限不能小于0', trigger: 'blur' },
          { validator: validateStockLimit, trigger: 'blur' }
        ],
        safetyStock: [
          { type: 'number', min: 0, message: '安全库存不能小于0', trigger: 'blur' }
        ],
        leadTimeDays: [
          { type: 'number', min: 0, message: '采购提前期不能小于0', trigger: 'blur' }
        ],
        shelfLifeMonths: [
          { type: 'number', min: 0, message: '保质期不能小于0', trigger: 'blur' }
        ],
        'supplierInfo.email': [
          { validator: validateEmail, trigger: 'blur' }
        ]
      },
      unitOptions: UNIT_OPTIONS,
      equipmentTypeOptions: [],
      equipmentTypesArray: [], // 用于多选绑定
      loadingEquipmentTypes: false,
      submitting: false,
      loading: false,
      originalData: null // 用于编辑模式下存储原始数据
    }
  },
  computed: {
    drawerTitle() {
      return this.isEditMode ? '编辑备件' : '创建备件'
    },
    isEditMode() {
      return this.mode === 'edit'
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
        this.loadEquipmentTypes()
        if (this.isEditMode && this.sparePartId) {
          this.loadSparePartDetail()
        }
      }
    },
    // 监听设备类型数组变化，更新 formData
    equipmentTypesArray(val) {
      this.formData.applicableEquipmentTypes = val.join(',')
    }
  },
  methods: {
    // 初始化表单
    initForm() {
      this.formData = {
        sparePartCode: '',
        sparePartName: '',
        specification: '',
        applicableEquipmentTypes: '',
        supplierInfo: {
          name: '',
          contact: '',
          phone: '',
          email: ''
        },
        unitPrice: null,
        unit: '',
        maxStock: null,
        minStock: null,
        safetyStock: 0,
        leadTimeDays: null,
        storageLocation: '',
        shelfLifeMonths: null,
        remark: ''
      }
      this.equipmentTypesArray = []
      this.$nextTick(() => {
        if (this.$refs.sparePartForm) {
          this.$refs.sparePartForm.clearValidate()
        }
      })
    },

    // 处理编码输入 - 自动转大写
    handleCodeInput(value) {
      this.formData.sparePartCode = value.toUpperCase()
    },

    // 验证库存上下限
    validateStockLimits() {
      this.$nextTick(() => {
        if (this.$refs.sparePartForm) {
          this.$refs.sparePartForm.validateField(['maxStock', 'minStock'])
        }
      })
    },

    // 加载设备类型选项
    async loadEquipmentTypes() {
      this.loadingEquipmentTypes = true
      try {
        const response = await getEquipmentTypes()
        this.equipmentTypeOptions = response.data.options || []
      } catch (error) {
        console.error('加载设备类型失败:', error)
        this.$message.warning('加载设备类型失败，请手动输入')
      } finally {
        this.loadingEquipmentTypes = false
      }
    },

    // 加载备件详情（编辑模式）
    async loadSparePartDetail() {
      this.loading = true
      try {
        const response = await getSparePartById(this.sparePartId)
        const detail = response.data

        // 处理供应商信息
        const supplierInfo = detail.supplierInfo || {
          name: '',
          contact: '',
          phone: '',
          email: ''
        }

        // 回填表单数据
        this.formData = {
          sparePartCode: detail.sparePartCode || '',
          sparePartName: detail.sparePartName || '',
          specification: detail.specification || '',
          applicableEquipmentTypes: detail.applicableEquipmentTypes || '',
          supplierInfo: {
            name: supplierInfo.name || '',
            contact: supplierInfo.contact || '',
            phone: supplierInfo.phone || '',
            email: supplierInfo.email || ''
          },
          unitPrice: detail.unitPrice ? parseFloat(detail.unitPrice) : null,
          unit: detail.unit || '',
          maxStock: detail.maxStock,
          minStock: detail.minStock,
          safetyStock: detail.safetyStock || 0,
          leadTimeDays: detail.leadTimeDays,
          storageLocation: detail.storageLocation || '',
          shelfLifeMonths: detail.shelfLifeMonths,
          remark: detail.remark || ''
        }

        // 处理设备类型数组
        if (detail.applicableEquipmentTypes) {
          this.equipmentTypesArray = detail.applicableEquipmentTypes.split(',').filter(type => type.trim())
        } else {
          this.equipmentTypesArray = []
        }

        // 保存原始数据的深拷贝，用于对比变更
        this.originalData = JSON.parse(JSON.stringify(this.formData))

        // 清除验证错误
        this.$nextTick(() => {
          if (this.$refs.sparePartForm) {
            this.$refs.sparePartForm.clearValidate()
          }
        })
      } catch (error) {
        console.error('加载备件详情失败:', error)
        this.$message.error('加载备件详情失败')
        this.$emit('update:visible', false)
      } finally {
        this.loading = false
      }
    },

    // 获取变更的字段（编辑模式）
    getChangedFields() {
      if (!this.originalData) {
        return this.formData
      }

      const changedFields = {}

      // 比较基础字段
      const basicFields = [
        'sparePartName', 'specification', 'applicableEquipmentTypes',
        'unitPrice', 'unit', 'maxStock', 'minStock', 'safetyStock',
        'leadTimeDays', 'storageLocation', 'shelfLifeMonths', 'remark'
      ]

      basicFields.forEach(field => {
        if (this.formData[field] !== this.originalData[field]) {
          changedFields[field] = this.formData[field]
        }
      })

      // 比较供应商信息
      const supplierChanged = ['name', 'contact', 'phone', 'email'].some(
        key => this.formData.supplierInfo[key] !== this.originalData.supplierInfo[key]
      )

      if (supplierChanged) {
        changedFields.supplierInfo = this.formData.supplierInfo
      }

      return changedFields
    },

    // 关闭抽屉
    handleClose() {
      this.$confirm('确定关闭吗？未保存的数据将丢失', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$emit('update:visible', false)
        this.$emit('close')
      }).catch(() => {})
    },

    // 提交表单
    handleSubmit() {
      this.$refs.sparePartForm.validate(async(valid) => {
        if (!valid) {
          this.$message.error('请检查表单填写是否正确')
          return
        }

        // 编辑模式下检查是否有变更
        if (this.isEditMode) {
          const changedFields = this.getChangedFields()
          if (Object.keys(changedFields).length === 0) {
            this.$message.warning('没有检测到任何变更')
            return
          }
        }

        this.submitting = true
        try {
          let submitData
          let response

          if (this.isEditMode) {
            // 编辑模式：只提交变更的字段
            submitData = this.getChangedFields()

            // 处理供应商信息：如果所有字段都为空，则不发送
            if (submitData.supplierInfo) {
              const { name, contact, phone, email } = submitData.supplierInfo
              if (!name && !contact && !phone && !email) {
                delete submitData.supplierInfo
              }
            }

            // 处理可选的数值字段：null 值不发送
            const optionalFields = ['unitPrice', 'maxStock', 'minStock', 'leadTimeDays', 'shelfLifeMonths']
            optionalFields.forEach(field => {
              if (submitData[field] === null || submitData[field] === '') {
                delete submitData[field]
              }
            })

            // 处理可选的字符串字段：空字符串不发送
            const optionalStringFields = ['specification', 'applicableEquipmentTypes', 'storageLocation', 'remark']
            optionalStringFields.forEach(field => {
              if (submitData[field] !== undefined && !submitData[field]) {
                delete submitData[field]
              }
            })

            response = await updateSparePart(this.sparePartId, submitData)
            this.$message.success(response.message || '备件更新成功')
          } else {
            // 创建模式：提交所有数据
            submitData = {
              ...this.formData
            }

            // 处理供应商信息：如果所有字段都为空，则不发送
            const { name, contact, phone, email } = submitData.supplierInfo
            if (!name && !contact && !phone && !email) {
              delete submitData.supplierInfo
            }

            // 处理可选的数值字段：null 值不发送
            const optionalFields = ['unitPrice', 'maxStock', 'minStock', 'leadTimeDays', 'shelfLifeMonths']
            optionalFields.forEach(field => {
              if (submitData[field] === null || submitData[field] === '') {
                delete submitData[field]
              }
            })

            // 处理可选的字符串字段：空字符串不发送
            const optionalStringFields = ['specification', 'applicableEquipmentTypes', 'storageLocation', 'remark']
            optionalStringFields.forEach(field => {
              if (!submitData[field]) {
                delete submitData[field]
              }
            })

            response = await createSparePart(submitData)
            this.$message.success(response.message || '备件创建成功')
          }

          this.$emit('update:visible', false)
          this.$emit('success', response.data)
        } catch (error) {
          console.error(this.isEditMode ? '更新备件失败:' : '创建备件失败:', error)
          // 错误消息由 request.js 统一处理
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.spare-part-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  .form-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #DCDFE6;
    }
  }

  .form-item-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }

  .drawer-footer {
    position: sticky;
    bottom: 0;
    padding: 16px 0;
    background: #fff;
    border-top: 1px solid #DCDFE6;
    text-align: right;
    z-index: 10;

    .el-button {
      min-width: 80px;
    }
  }
}

::v-deep .el-drawer__body {
  overflow-y: auto;
  padding: 20px 0;
}

::v-deep .el-form-item {
  margin-bottom: 18px;
}

::v-deep .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

::v-deep .el-input-number {
  width: 100%;
}
</style>

