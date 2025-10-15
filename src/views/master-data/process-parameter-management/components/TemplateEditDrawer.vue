<!--
文件名称：TemplateEditDrawer.vue
文件描述：工艺模板编辑抽屉组件（v2.0架构 - 固定12段参数）
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建，实现TASK04 P0阶段功能
-->

<template>
  <Drawer
    :visible.sync="visibleProxy"
    :title="drawerTitle"
    :width="drawerWidth"
    :loading="loading"
    :wrapper-closable="false"
    class="template-edit-drawer"
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

    <div v-if="visibleProxy" class="template-edit-drawer__content">
      <!-- 版本状态提示 -->
      <div v-if="currentTemplate" class="version-info-banner">
        <div class="version-info">
          <span class="template-code">{{ currentTemplate.templateCode }}</span>
          <span class="version-number">{{ currentVersion.versionNumber }}</span>
          <el-tag
            :type="getStatusTagType(currentVersion.status)"
            size="small"
            class="status-tag"
          >
            {{ currentVersion.status }}
          </el-tag>
        </div>
        <div class="edit-hint">
          <i class="el-icon-edit" />
          <span>仅草稿和驳回状态允许编辑</span>
        </div>
      </div>

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
                      disabled
                      class="disabled-field"
                    />
                    <small class="field-hint">模板编码不允许修改</small>
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
                <span class="form-section__badge form-section__badge--readonly">只读</span>
              </header>
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="当前版本号" prop="versionNumber">
                    <el-input
                      v-model="formData.versionNumber"
                      disabled
                      class="disabled-field"
                    />
                    <small class="field-hint">版本号不允许修改</small>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="版本状态" prop="versionStatus">
                    <el-input
                      v-model="currentVersion.status"
                      disabled
                      class="disabled-field"
                    />
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
          保存修改
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
  updateProcessTemplateVersion,
  getProcessTemplateDetail
} from '../api'
import { getProductionProductOptions } from '@/api/master-data'

export default {
  name: 'TemplateEditDrawer',
  components: {
    Drawer,
    ProcessSegmentsEditor
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    templateId: {
      type: String,
      required: true
    },
    versionId: {
      type: String,
      required: true
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
      currentTemplate: null,
      currentVersion: null,
      formData: {
        templateCode: '',
        templateName: '',
        description: '',
        applicableProductIds: [],
        applicableAlloyGrades: '',
        applicableThicknessRange: '',
        applicableWidthRange: '',
        versionNumber: '',
        versionDescription: '',
        segments: []
      },
      originalData: null,
      formRules: {
        templateName: [
          { required: true, message: '模板名称不能为空', trigger: 'blur' },
          {
            min: 2,
            max: 200,
            message: '长度需在2-200字符内',
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
      const templateName = this.currentTemplate?.templateName || '工艺模板'
      const versionNumber = this.currentVersion?.versionNumber || ''
      return `编辑工艺模板 - ${templateName} (${versionNumber})`
    },
    canEdit() {
      return this.currentVersion && ['草稿', '驳回'].includes(this.currentVersion.status)
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
      if (!this.templateId || !this.versionId) {
        this.errorMessage = '缺少模板ID或版本ID'
        return
      }

      this.errorMessage = ''
      this.loading = true
      this.activeTab = 'basic'

      try {
        await Promise.all([
          this.fetchTemplateDetail(),
          this.fetchInitialProductOptions()
        ])

        // 验证编辑权限
        if (!this.canEdit) {
          this.errorMessage = `当前版本状态为"${this.currentVersion.status}"，仅草稿和驳回状态允许编辑`
        }
      } catch (error) {
        console.error('[TemplateEditDrawer] initialize failed', error)
        this.errorMessage = error?.message || '加载数据失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    async fetchTemplateDetail() {
      try {
        const response = await getProcessTemplateDetail(this.templateId)
        const template = response.data

        this.currentTemplate = template
        this.currentVersion = template.latestVersion

        // 验证版本ID是否匹配
        if (this.currentVersion.id !== this.versionId) {
          // 如果传入的versionId不是最新版本，需要从versions中找到对应版本
          const targetVersion = template.versions?.find(v => v.id === this.versionId)
          if (!targetVersion) {
            throw new Error('指定的版本不存在')
          }
          this.currentVersion = targetVersion
        }

        // 填充表单数据
        this.formData = {
          templateCode: template.templateCode || '',
          templateName: template.templateName || '',
          description: template.description || '',
          applicableProductIds: template.applicableProductIds || [],
          applicableAlloyGrades: template.applicableAlloyGrades || '',
          applicableThicknessRange: template.applicableThicknessRange || '',
          applicableWidthRange: template.applicableWidthRange || '',
          versionNumber: this.currentVersion.versionNumber || '',
          versionDescription: this.currentVersion.versionDescription || '',
          segments: cloneDeep(this.currentVersion.segments || [])
        }

        // 保存原始数据用于对比
        this.originalData = cloneDeep(this.formData)

        // 加载已选择的产品选项
        if (this.formData.applicableProductIds.length > 0) {
          await this.loadSelectedProducts()
        }
      } catch (error) {
        console.error('[TemplateEditDrawer] fetch template detail failed', error)
        throw error
      }
    },

    async loadSelectedProducts() {
      try {
        // 这里需要根据已选择的产品ID加载产品信息
        // 由于接口限制，我们先用现有的产品选项
        const selectedIds = this.formData.applicableProductIds
        const existingOptions = this.productOptions.filter(p => selectedIds.includes(p.id))

        // 如果现有选项不足，可以考虑调用详细接口或保持当前选项
        if (existingOptions.length < selectedIds.length) {
          console.warn('[TemplateEditDrawer] 部分已选产品选项未找到，可能需要调用产品详情接口')
        }
      } catch (error) {
        console.warn('[TemplateEditDrawer] load selected products failed', error)
      }
    },

    async fetchInitialProductOptions() {
      try {
        const response = await getProductionProductOptions({ limit: 30 })
        this.productOptions = response.data.options || []
      } catch (error) {
        console.warn('[TemplateEditDrawer] fetch products failed', error)
        this.$message.warning('适用产品选项加载失败，可稍后再试')
      }
    },

    async handleProductSearch(keyword = '') {
      try {
        const response = await getProductionProductOptions({ keyword, limit: 30 })
        this.productOptions = response.data.options
      } catch (error) {
        console.error('[TemplateEditDrawer] product search failed', error)
        this.$message.error(error?.message || '搜索产品失败，请稍后重试')
      }
    },

    handleAlloyGradesInput(value) {
      this.formData.applicableAlloyGrades = value.toUpperCase()
    },

    getStatusTagType(status) {
      const typeMap = {
        '草稿': 'info',
        '待审批': 'warning',
        '生效': 'success',
        '历史': '',
        '驳回': 'danger',
        '作废': 'danger'
      }
      return typeMap[status] || 'info'
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
      if (!this.canEdit) {
        this.$message.error('当前版本状态不允许编辑')
        return
      }

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

      // 检查是否有修改
      if (this.isDataUnchanged()) {
        this.$message.info('未检测到任何修改')
        return
      }

      // 所有验证通过，开始提交
      if (this.submitting) return
      this.submitting = true
      this.errorMessage = ''

      try {
        const payload = this.transformPayload(this.formData)

        console.log('[TemplateEditDrawer] 提交的 payload:', JSON.stringify(payload, null, 2))

        const response = await updateProcessTemplateVersion(
          this.templateId,
          this.versionId,
          payload
        )

        const message = response.message || MESSAGE_FALLBACKS.updateTemplate
        this.$message.success(message)

        // 发送成功事件
        this.$emit('success', response.data)
        this.visibleProxy = false
      } catch (error) {
        console.error('[TemplateEditDrawer] submit failed', error)
        const msg = error?.response?.data?.error?.message || error?.message || '保存失败，请检查输入'
        this.errorMessage = msg
        this.$message.error(msg)
      } finally {
        this.submitting = false
      }
    },

    transformPayload(formData) {
      const payload = {}

      // 模板基本信息（模板编码不允许修改）
      if (formData.templateName !== this.originalData.templateName) {
        payload.templateName = formData.templateName
      }

      if (formData.description !== this.originalData.description) {
        payload.description = formData.description
      }

      // 版本描述
      if (formData.versionDescription !== this.originalData.versionDescription) {
        payload.versionDescription = formData.versionDescription
      }

      // 适用产品
      const currentProductIds = formData.applicableProductIds || []
      const originalProductIds = this.originalData.applicableProductIds || []
      if (JSON.stringify(currentProductIds.sort()) !== JSON.stringify(originalProductIds.sort())) {
        payload.applicableProductIds = currentProductIds
      }

      // 适用合金牌号
      if (formData.applicableAlloyGrades !== this.originalData.applicableAlloyGrades) {
        payload.applicableAlloyGrades = formData.applicableAlloyGrades
      }

      // 适用范围
      if (formData.applicableThicknessRange !== this.originalData.applicableThicknessRange) {
        payload.applicableThicknessRange = formData.applicableThicknessRange
      }

      if (formData.applicableWidthRange !== this.originalData.applicableWidthRange) {
        payload.applicableWidthRange = formData.applicableWidthRange
      }

      // 12段参数
      const currentSegments = formData.segments || []
      const originalSegments = this.originalData.segments || []
      if (JSON.stringify(currentSegments) !== JSON.stringify(originalSegments)) {
        payload.segments = cloneDeep(currentSegments)
      }

      return payload
    },

    isDataUnchanged() {
      return JSON.stringify(this.formData) === JSON.stringify(this.originalData)
    },

    handleCancel() {
      if (this.isDataUnchanged()) {
        this.visibleProxy = false
        this.$emit('cancel')
        return
      }

      // 有修改时确认取消
      this.$confirm('有未保存的修改，确认取消编辑吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '继续编辑',
        type: 'warning'
      }).then(() => {
        this.visibleProxy = false
        this.$emit('cancel')
      }).catch(() => {
        // 用户选择继续编辑，不做任何操作
      })
    },

    handleDrawerClose() {
      this.handleCancel()
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
        versionNumber: '',
        versionDescription: '',
        segments: []
      }
      this.originalData = null
      this.currentTemplate = null
      this.currentVersion = null
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
.template-edit-drawer {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.template-edit-drawer__content {
  padding: 0 20px 24px;
  background: #f7f8fa;
}

.version-info-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.version-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.template-code {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.version-number {
  font-size: 14px;
  color: #606266;
  background: #f4f4f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-tag {
  font-weight: 500;
}

.edit-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
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

.form-section__badge--readonly {
  color: #409eff;
  background: #ecf5ff;
}

.field-hint {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.disabled-field {
  background-color: #f5f7fa !important;
  color: #c0c4cc !important;
}

.disabled-field >>> .el-input__inner {
  background-color: #f5f7fa !important;
  color: #c0c4cc !important;
  cursor: not-allowed;
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
  .template-edit-drawer__content {
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
