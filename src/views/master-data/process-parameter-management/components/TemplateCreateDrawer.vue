<!--
文件名称：TemplateCreateDrawer.vue
文件描述：工艺模板创建抽屉组件（v2.0架构 - 固定12段参数）
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建，实现TASK02 P0阶段功能
-->

<template>
  <Drawer
    :visible.sync="visibleProxy"
    :title="drawerTitle"
    :width="drawerWidth"
    :loading="loading"
    :wrapper-closable="false"
    class="template-create-drawer"
    @close="handleDrawerClose"
    @cancel="handleCancel"
  >
    <template #error>
      <el-alert
        v-if="errorMessage"
        type="error"
        show-icon
        :closable="false"
        :title="errorMessage"
      />
    </template>

    <div v-if="visibleProxy" class="template-create-drawer__content">
      <el-tabs v-model="activeTab" type="border-card" class="template-tabs">
        <!-- 步骤1：基础信息 -->
        <el-tab-pane label="步骤1：基础信息" name="basic">
          <el-form
            ref="basicForm"
            :model="formData"
            :rules="formRules"
            label-width="160px"
            size="small"
            class="basic-form"
          >
            <!-- 模板基础信息 -->
            <section class="form-section">
              <header class="form-section__header">
                <h3 class="form-section__title">模板基础信息</h3>
                <span class="form-section__badge">必填</span>
              </header>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="模板编码" prop="templateCode">
                    <el-input
                      v-model="formData.templateCode"
                      placeholder="如 TPL-AF-1100-STD"
                      clearable
                      maxlength="100"
                      @input="handleTemplateCodeInput"
                    />
                    <small class="field-hint">仅包含大写字母、数字、横线</small>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="模板名称" prop="templateName">
                    <el-input
                      v-model="formData.templateName"
                      placeholder="如 1100合金标准退火工艺"
                      clearable
                      maxlength="200"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="模板描述" prop="description">
                    <el-input
                      v-model="formData.description"
                      type="textarea"
                      :rows="3"
                      placeholder="可描述适用场景、退火炉、关键参数说明，最多2000字"
                      maxlength="2000"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </section>

            <!-- 适用范围 -->
            <section class="form-section">
              <header class="form-section__header">
                <h3 class="form-section__title">适用范围</h3>
                <span class="form-section__badge form-section__badge--optional">选填</span>
              </header>
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="适用产品" prop="applicableProductIds">
                    <el-select
                      v-model="formData.applicableProductIds"
                      multiple
                      filterable
                      remote
                      :remote-method="handleProductSearch"
                      reserve-keyword
                      collapse-tags
                      collapse-tags-tooltip
                      placeholder="搜索并选择适用产品，支持多选"
                      class="full-width-select"
                    >
                      <el-option
                        v-for="product in productOptions"
                        :key="product.id"
                        :label="`${product.productCode} - ${product.productName}`"
                        :value="product.id"
                      >
                        <div class="product-option">
                          <div class="product-code">{{ product.productCode }}</div>
                          <div class="product-name">{{ product.productName }}</div>
                        </div>
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="适用合金牌号" prop="applicableAlloyGrades">
                    <el-input
                      v-model="formData.applicableAlloyGrades"
                      placeholder="如 1100,8011，多个以逗号分隔"
                      clearable
                      maxlength="500"
                      @input="handleAlloyGradesInput"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="适用厚度范围 (mm)" prop="applicableThicknessRange">
                    <el-input
                      v-model="formData.applicableThicknessRange"
                      placeholder="如 0.005-0.1"
                      clearable
                      maxlength="50"
                    />
                    <small class="field-hint">格式：最小值-最大值</small>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="适用宽度范围 (mm)" prop="applicableWidthRange">
                    <el-input
                      v-model="formData.applicableWidthRange"
                      placeholder="如 500-1500"
                      clearable
                      maxlength="50"
                    />
                    <small class="field-hint">格式：最小值-最大值</small>
                  </el-form-item>
                </el-col>
              </el-row>
            </section>

            <!-- 版本信息 -->
            <section class="form-section">
              <header class="form-section__header">
                <h3 class="form-section__title">版本信息</h3>
                <span class="form-section__badge">必填</span>
              </header>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="首个版本号" prop="versionNumber">
                    <el-input
                      v-model="formData.versionNumber"
                      placeholder="如 v1.0"
                      clearable
                      maxlength="20"
                    />
                    <small class="field-hint">格式：v1.0 或 v1</small>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="版本描述" prop="versionDescription">
                    <el-input
                      v-model="formData.versionDescription"
                      type="textarea"
                      :rows="3"
                      placeholder="描述版本变更背景、核心参数调整等信息"
                      maxlength="2000"
                      show-word-limit
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </section>
          </el-form>
        </el-tab-pane>

        <!-- 步骤2：12段工艺参数 -->
        <el-tab-pane label="步骤2：工艺参数" name="segments">
          <div class="tab-pane-content">
            <ProcessSegmentsEditor
              v-if="activeTab === 'segments'"
              ref="segmentsEditor"
              v-model="formData.segments"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div>
        <el-button :disabled="submitting" @click="handleCancel">
          取消
        </el-button>
        <el-button
          v-if="activeTab !== 'basic'"
          :disabled="submitting"
          @click="handlePrevStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="activeTab !== 'segments'"
          type="primary"
          :disabled="submitting"
          @click="handleNextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="activeTab === 'segments'"
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
        >
          创建模板
        </el-button>
      </div>
    </template>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer'
import ProcessSegmentsEditor from './ProcessSegmentsEditor.vue'
import { cloneDeep } from 'lodash'
import { MESSAGE_FALLBACKS } from '../constants/messages-config'
import {
  createProcessTemplate
} from '../api'
import { getProductionProductOptions } from '@/api/master-data'

export default {
  name: 'TemplateCreateDrawer',
  components: {
    Drawer,
    ProcessSegmentsEditor
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visibleProxy: false,
      activeTab: 'basic',
      loading: false,
      submitting: false,
      errorMessage: '',
      drawerWidth: '1400px',
      formData: {
        templateCode: '',
        templateName: '',
        description: '',
        applicableProductIds: [],
        applicableAlloyGrades: '',
        applicableThicknessRange: '',
        applicableWidthRange: '',
        versionNumber: 'v1.0',
        versionDescription: '',
        segments: [],
        presetTemplate: 'blank' // 可选：standard/quick/blank
      },
      formRules: {
        templateCode: [
          { required: true, message: '模板编码不能为空', trigger: 'blur' },
          {
            pattern: /^[A-Z0-9-]+$/,
            message: '编码仅包含大写字母、数字、横线',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 100,
            message: '长度需在3-100字符内',
            trigger: 'blur'
          }
        ],
        templateName: [
          { required: true, message: '模板名称不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 200,
            message: '长度需在2-200字符内',
            trigger: 'blur'
          }
        ],
        versionNumber: [
          { required: true, message: '版本号不能为空', trigger: 'blur' },
          {
            pattern: /^v\d+(\.\d+)?$/,
            message: '版本号格式如 v1 或 v1.0',
            trigger: 'blur'
          }
        ],
        applicableAlloyGrades: [
          {
            validator: (_, value, callback) => {
              if (!value) {
                callback()
                return
              }
              const grades = value.split(',').map(item => item.trim()).filter(Boolean)
              const invalid = grades.some(item => !/^[0-9A-Z.-]{2,50}$/.test(item))
              if (invalid) {
                callback(new Error('合金牌号仅允许大写字母、数字、横线、点号'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        applicableThicknessRange: [
          {
            validator: (_, value, callback) => {
              if (!value) {
                callback()
                return
              }
              if (!/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(value)) {
                callback(new Error('格式应为：最小值-最大值，如 0.005-0.1'))
                return
              }
              const [min, max] = value.split('-').map(Number)
              if (min >= max) {
                callback(new Error('最小值必须小于最大值'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ],
        applicableWidthRange: [
          {
            validator: (_, value, callback) => {
              if (!value) {
                callback()
                return
              }
              if (!/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(value)) {
                callback(new Error('格式应为：最小值-最大值，如 500-1500'))
                return
              }
              const [min, max] = value.split('-').map(Number)
              if (min >= max) {
                callback(new Error('最小值必须小于最大值'))
                return
              }
              callback()
            },
            trigger: 'blur'
          }
        ]
      },
      productOptions: []
    }
  },
  computed: {
    drawerTitle() {
      return '新建工艺模板'
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        this.visibleProxy = val
        if (val) {
          this.initialize()
        }
      }
    },
    visibleProxy(val) {
      this.$emit('update:visible', val)
      if (!val) {
        this.resetState()
      }
    }
  },
  methods: {
    async initialize() {
      this.errorMessage = ''
      this.loading = true
      this.activeTab = 'basic'
      try {
        await this.fetchInitialProductOptions()
      } catch (error) {
        console.error('[TemplateCreateDrawer] initialize failed', error)
        this.errorMessage = error?.message || '加载数据失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    async fetchInitialProductOptions() {
      try {
        const response = await getProductionProductOptions({ limit: 30 })
        this.productOptions = response.data.options || []
      } catch (error) {
        console.warn('[TemplateCreateDrawer] fetch products failed', error)
        this.$message.warning('适用产品选项加载失败，可稍后再试')
      }
    },

    async handleProductSearch(keyword = '') {
      try {
        const response = await getProductionProductOptions({ keyword, limit: 30 })
        this.productOptions = response.data.options
      } catch (error) {
        console.error('[TemplateCreateDrawer] product search failed', error)
        this.$message.error(error?.message || '搜索产品失败，请稍后重试')
      }
    },

    handleTemplateCodeInput(value) {
      this.formData.templateCode = value.toUpperCase().trim()
    },

    handleAlloyGradesInput(value) {
      this.formData.applicableAlloyGrades = value.toUpperCase()
    },

    handlePrevStep() {
      const tabs = ['basic', 'segments']
      const currentIndex = tabs.indexOf(this.activeTab)
      if (currentIndex > 0) {
        this.activeTab = tabs[currentIndex - 1]
      }
    },

    async handleNextStep() {
      // 验证当前步骤
      const valid = await this.validateCurrentStep()
      if (!valid) {
        return
      }

      const tabs = ['basic', 'segments']
      const currentIndex = tabs.indexOf(this.activeTab)
      if (currentIndex < tabs.length - 1) {
        this.activeTab = tabs[currentIndex + 1]
      }
    },

    validateCurrentStep() {
      return new Promise((resolve) => {
        if (this.activeTab === 'basic') {
          // 验证基础信息表单
          if (this.$refs.basicForm) {
            this.$refs.basicForm.validate((valid) => {
              if (!valid) {
                this.$message.warning('请完善基础信息必填项')
                resolve(false)
              } else {
                resolve(true)
              }
            })
          } else {
            resolve(true)
          }
        } else if (this.activeTab === 'segments') {
          // 验证12段参数
          this.$nextTick(() => {
            if (this.$refs.segmentsEditor && !this.$refs.segmentsEditor.validate()) {
              this.$message.warning('12段参数配置有误，请检查')
              resolve(false)
            } else {
              resolve(true)
            }
          })
        } else {
          resolve(true)
        }
      })
    },

    async handleSubmit() {
      // 验证基础信息
      this.activeTab = 'basic'
      await this.$nextTick()

      const basicValid = await new Promise((resolve) => {
        if (!this.$refs.basicForm) {
          resolve(true)
          return
        }
        this.$refs.basicForm.validate((valid) => {
          if (!valid) {
            this.$message.error('基础信息填写有误，请检查')
          }
          resolve(valid)
        })
      })

      if (!basicValid) return

      // 验证12段参数
      this.activeTab = 'segments'
      await this.$nextTick()
      if (!this.$refs.segmentsEditor || !this.$refs.segmentsEditor.validate()) {
        this.$message.error('12段参数配置有误，请检查')
        return
      }

      // 所有验证通过，开始提交
      if (this.submitting) return
      this.submitting = true
      this.errorMessage = ''

      try {
        const payload = this.transformPayload(this.formData)

        console.log('[TemplateCreateDrawer] 提交的 payload:', JSON.stringify(payload, null, 2))

        const response = await createProcessTemplate(payload)

        const message = response.message || MESSAGE_FALLBACKS.createTemplate
        this.$message.success(message)

        // 发送成功事件，父组件负责跳转到详情页面
        this.$emit('success', response.data)
        this.visibleProxy = false
      } catch (error) {
        console.error('[TemplateCreateDrawer] submit failed', error)
        const msg = error?.response?.data?.error?.message || error?.message || '创建失败，请检查输入'
        this.errorMessage = msg
        this.$message.error(msg)
      } finally {
        this.submitting = false
      }
    },

    transformPayload(formData) {
      const payload = {
        templateCode: formData.templateCode,
        templateName: formData.templateName,
        versionNumber: formData.versionNumber
      }

      // 可选字段
      if (formData.description) {
        payload.description = formData.description
      }

      if (formData.versionDescription) {
        payload.versionDescription = formData.versionDescription
      }

      // 适用产品
      if (formData.applicableProductIds && formData.applicableProductIds.length > 0) {
        payload.applicableProductIds = formData.applicableProductIds
      }

      // 适用合金牌号
      if (formData.applicableAlloyGrades) {
        payload.applicableAlloyGrades = formData.applicableAlloyGrades
      }

      // 适用范围
      if (formData.applicableThicknessRange) {
        payload.applicableThicknessRange = formData.applicableThicknessRange
      }

      if (formData.applicableWidthRange) {
        payload.applicableWidthRange = formData.applicableWidthRange
      }

      // 12段参数
      if (formData.segments && formData.segments.length === 12) {
        payload.segments = cloneDeep(formData.segments)
      }

      // 如果没有segments，使用预设模板
      if (!payload.segments || payload.segments.length === 0) {
        payload.presetTemplate = formData.presetTemplate || 'blank'
      }

      return payload
    },

    handleCancel() {
      this.visibleProxy = false
      this.$emit('cancel')
    },

    handleDrawerClose() {
      this.visibleProxy = false
      this.$emit('close')
    },

    resetState() {
      this.formData = {
        templateCode: '',
        templateName: '',
        description: '',
        applicableProductIds: [],
        applicableAlloyGrades: '',
        applicableThicknessRange: '',
        applicableWidthRange: '',
        versionNumber: 'v1.0',
        versionDescription: '',
        segments: [],
        presetTemplate: 'blank'
      }
      this.activeTab = 'basic'
      this.loading = false
      this.submitting = false
      this.errorMessage = ''
      this.productOptions = []

      if (this.$refs.basicForm) {
        this.$refs.basicForm.clearValidate()
      }
    }
  }
}
</script>

<style scoped>
.template-create-drawer {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.template-create-drawer__content {
  padding: 0 20px 24px;
  background: #f7f8fa;
}

.template-tabs {
  background: #fff;
  border: none;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.06);
}

.template-tabs >>> .el-tabs__header {
  background: #fafbfc;
  border-bottom: 2px solid #e4e7ed;
  margin: 0;
}

.template-tabs >>> .el-tabs__item {
  font-size: 15px;
  font-weight: 500;
  padding: 0 30px;
  height: 50px;
  line-height: 50px;
}

.template-tabs >>> .el-tabs__item.is-active {
  color: #409eff;
  font-weight: 600;
}

.template-tabs >>> .el-tabs__content {
  padding: 20px;
  min-height: 400px;
}

.basic-form {
  background: transparent;
}

.tab-pane-content {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  min-height: 400px;
}

.form-section {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 6px 20px rgba(31, 45, 61, 0.06);
  border: 1px solid #edf2fc;
}

.form-section__header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-section__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
}

.form-section__badge {
  margin-left: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #f56c6c;
  background: #fdecea;
}

.form-section__badge--optional {
  color: #909399;
  background: #f4f4f5;
}

.field-hint {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.full-width-select {
  width: 100%;
}

.product-option {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.product-option .product-code {
  font-weight: 600;
  color: #1f2d3d;
  font-size: 14px;
}

.product-option .product-name {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

@media (max-width: 1440px) {
  .template-create-drawer__content {
    padding: 0 16px 20px;
  }

  .form-section {
    padding: 18px 20px;
  }

  .tab-pane-content {
    padding: 16px;
  }
}
</style>

