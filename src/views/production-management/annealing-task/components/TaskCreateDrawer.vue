/**
 * 文件名称：TaskCreateDrawer.vue
 * 文件描述：手工创建退火任务表单抽屉组件
 * 创建日期：2025-10-18
 * 修改记录：
 *   - 2025-10-18: 初始创建，实现手工创建任务功能（TASK003 P0阶段）
 */

<template>
  <base-drawer
    :visible.sync="drawerVisible"
    :title="title"
    :loading="saving"
    :show-footer="true"
    width="680px"
    @close="handleClose"
    @confirm="handleConfirm"
  >
    <el-form
      ref="taskForm"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      class="task-create-form"
    >
      <!-- 产品选择（必填） -->
      <el-form-item label="产品选择" prop="productId">
        <el-select
          v-model="formData.productId"
          filterable
          remote
          reserve-keyword
          placeholder="请选择或搜索产品"
          :remote-method="handleProductSearch"
          :loading="loadingProducts"
          class="full-width"
          @change="handleProductChange"
        >
          <el-option
            v-for="product in productOptions"
            :key="product.id"
            :label="`${product.productCode} - ${product.productName}`"
            :value="product.id"
          >
            <span style="float: left">{{ product.productCode }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ product.productName }}
            </span>
          </el-option>
        </el-select>
        <div v-if="selectedProduct" class="product-info">
          <el-tag size="small" type="info">{{ selectedProduct.productCode }}</el-tag>
          <el-tag size="small" type="success">{{ selectedProduct.alloyGrade }}</el-tag>
        </div>
      </el-form-item>

      <!-- 计划重量（必填） -->
      <el-form-item label="计划重量" prop="plannedWeight">
        <el-input-number
          v-model="formData.plannedWeight"
          :min="WEIGHT_LIMITS.MIN"
          :max="WEIGHT_LIMITS.MAX"
          :precision="3"
          :step="0.1"
          placeholder="请输入计划重量"
          controls-position="right"
          class="full-width"
        >
          <template slot="append">吨</template>
        </el-input-number>
        <div class="field-hint">
          <span v-if="!isWithinFurnaceCapacity" class="warning-hint">
            <i class="el-icon-warning" />
            建议炉容范围：{{ FURNACE_CAPACITY.MIN }}-{{ FURNACE_CAPACITY.MAX }} 吨
          </span>
          <span v-else class="success-hint">
            <i class="el-icon-success" />
            在炉容范围内
          </span>
          <span class="info-hint">范围：{{ WEIGHT_LIMITS.MIN }}-{{ WEIGHT_LIMITS.MAX }} 吨</span>
        </div>
      </el-form-item>

      <!-- 工艺模板 -->
      <el-form-item label="工艺模板" prop="processTemplateId">
        <el-select
          v-model="formData.processTemplateId"
          filterable
          clearable
          placeholder="请选择工艺模板（默认自动选择）"
          :loading="loadingTemplates"
          class="full-width"
        >
          <el-option
            v-for="template in processTemplateOptions"
            :key="template.id"
            :label="`${template.templateCode} - ${template.templateName}`"
            :value="template.id"
          >
            <div class="template-option">
              <span class="template-code">{{ template.templateCode }}</span>
              <span class="template-name">{{ template.templateName }}</span>
              <el-tag v-if="template.status === '生效'" size="mini" type="success">生效</el-tag>
            </div>
          </el-option>
        </el-select>
        <div v-if="!loadingTemplates && processTemplateOptions.length === 0 && selectedProduct" class="field-hint warning-hint">
          <i class="el-icon-warning" />
          该产品暂无生效的工艺模板，请联系管理员配置
        </div>
      </el-form-item>

      <!-- 任务编号（可选） -->
      <el-form-item label="任务编号" prop="taskCode">
        <el-input
          v-model="formData.taskCode"
          placeholder="留空则系统自动生成（AT-YYYYMMDD-HHmmssSSS-XXX）"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>

      <!-- 任务名称（可选） -->
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="formData.taskName"
          placeholder="请输入任务名称"
          maxlength="120"
          show-word-limit
        />
      </el-form-item>

      <!-- 计划数量（可选） -->
      <el-form-item label="计划数量" prop="plannedQuantity">
        <el-input-number
          v-model="formData.plannedQuantity"
          :min="0"
          :precision="0"
          :step="1"
          placeholder="请输入计划数量"
          controls-position="right"
          class="full-width"
        >
          <template slot="append">卷/件</template>
        </el-input-number>
        <div class="field-hint info-hint">卷数/件数（整数）</div>
      </el-form-item>

      <!-- 任务优先级 -->
      <el-form-item label="任务优先级" prop="priority">
        <el-radio-group v-model="formData.priority">
          <el-radio
            v-for="option in TASK_PRIORITY_OPTIONS"
            :key="option.value"
            :label="option.value"
          >
            {{ option.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 备注（可选） -->
      <el-form-item label="备注" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入任务备注信息"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </base-drawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import { debounce } from '@/utils'
// 从铝箔产品管理模块获取产品数据（与生产计划模块保持一致）
import { fetchFoilProductList } from '@/views/master-data/aluminum-foil-product-management/api/aluminum-foil-product-management'
// 从工艺参数管理模块获取工艺模板数据
import { fetchProcessTemplateList } from '@/views/master-data/process-parameter-management/api/process-parameter-management'
import { createAnnealingTask } from '../api'
import {
  TASK_PRIORITY,
  TASK_PRIORITY_OPTIONS,
  FURNACE_CAPACITY,
  WEIGHT_LIMITS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from '../constants'

export default {
  name: 'TaskCreateDrawer',
  components: {
    BaseDrawer
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // 产品验证器
    const validateProduct = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择产品'))
      } else {
        callback()
      }
    }

    // 计划重量验证器
    const validatePlannedWeight = (rule, value, callback) => {
      if (!value || value <= 0) {
        callback(new Error('请输入计划重量'))
      } else if (value < WEIGHT_LIMITS.MIN || value > WEIGHT_LIMITS.MAX) {
        callback(new Error(`计划重量必须在 ${WEIGHT_LIMITS.MIN}-${WEIGHT_LIMITS.MAX} 吨之间`))
      } else {
        callback()
      }
    }

    return {
      // 常量
      TASK_PRIORITY,
      TASK_PRIORITY_OPTIONS,
      FURNACE_CAPACITY,
      WEIGHT_LIMITS,

      // 抽屉状态
      drawerVisible: this.visible,
      saving: false,

      // 表单数据
      formData: {
        productId: '',
        productCode: '',
        plannedWeight: null,
        processTemplateId: '',
        taskCode: '',
        taskName: '',
        plannedQuantity: null,
        priority: TASK_PRIORITY.NORMAL,
        remarks: ''
      },

      // 表单校验规则
      formRules: {
        productId: [
          { required: true, validator: validateProduct, trigger: 'change' }
        ],
        plannedWeight: [
          { required: true, validator: validatePlannedWeight, trigger: 'blur' }
        ],
        taskCode: [
          { max: 60, message: '任务编号不能超过60个字符', trigger: 'blur' }
        ],
        taskName: [
          { max: 120, message: '任务名称不能超过120个字符', trigger: 'blur' }
        ],
        remarks: [
          { max: 1000, message: '备注不能超过1000个字符', trigger: 'blur' }
        ]
      },

      // 产品选项
      productOptions: [],
      selectedProduct: null,
      loadingProducts: false,

      // 工艺模板选项
      processTemplateOptions: [],
      loadingTemplates: false
    }
  },
  computed: {
    title() {
      return '手工创建退火任务'
    },
    // 判断重量是否在炉容范围内
    isWithinFurnaceCapacity() {
      if (!this.formData.plannedWeight) return true
      return this.formData.plannedWeight >= FURNACE_CAPACITY.MIN &&
             this.formData.plannedWeight <= FURNACE_CAPACITY.MAX
    }
  },
  watch: {
    visible(val) {
      this.drawerVisible = val
      if (val) {
        this.resetForm()
        this.loadProductList()
        this.loadProcessTemplateList()
      }
    },
    drawerVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    /**
     * 加载产品列表（参考生产计划模块实现）
     */
    async loadProductList(query = '') {
      try {
        this.loadingProducts = true
        // 构建查询参数
        const params = {
          limit: 50,
          page: 1
        }
        if (query && query.trim()) {
          params.search = query.trim()
        }
        const response = await fetchFoilProductList(params)
        if (response.data && response.data.results) {
          this.productOptions = response.data.results
        }
      } catch (error) {
        console.error('加载产品列表失败:', error)
        this.$message.error(error.response?.data?.error?.message || '加载产品列表失败')
      } finally {
        this.loadingProducts = false
      }
    },

    /**
     * 产品搜索（带防抖）
     */
    handleProductSearch: debounce(async function(keyword) {
      if (keyword !== '') {
        await this.loadProductList(keyword)
      } else {
        this.productOptions = []
      }
    }, 300),

    /**
     * 产品选择变更（参考生产计划模块实现）
     */
    handleProductChange(productId) {
      // 查找选中的产品
      const selectedProduct = this.productOptions.find(item => item.id === productId)
      if (selectedProduct) {
        // 自动填充产品编码
        this.formData.productCode = selectedProduct.productCode || ''
        this.selectedProduct = selectedProduct
      } else {
        this.formData.productCode = ''
        this.selectedProduct = null
      }
    },

    /**
     * 加载工艺模板列表（参考生产计划模块实现）
     * 在抽屉打开时加载所有生效的工艺模板
     */
    async loadProcessTemplateList() {
      try {
        this.loadingTemplates = true
        const response = await fetchProcessTemplateList({
          status: '生效', // 只获取生效状态的工艺模板（中文状态值）
          limit: 100,
          page: 1
        })

        // 检查响应数据结构 - API 返回的字段是 templates，不是 results
        let templates = []
        if (response && response.data && response.data.templates) {
          templates = response.data.templates
        } else if (response && response.templates) {
          templates = response.templates
        }

        if (templates && templates.length > 0) {
          this.processTemplateOptions = templates.map(template => ({
            id: template.id,
            templateCode: template.templateCode,
            templateName: template.templateName,
            status: template.status
          }))
        } else {
          this.processTemplateOptions = []
        }
      } catch (error) {
        console.error('加载工艺模板列表失败:', error)
        this.$message.warning('获取工艺模板失败，请稍后重试')
      } finally {
        this.loadingTemplates = false
      }
    },

    // 关闭抽屉
    handleClose() {
      this.drawerVisible = false
      this.resetForm()
    },

    // 确认提交
    handleConfirm() {
      this.$refs.taskForm.validate(async(valid) => {
        if (!valid) {
          this.$message.warning('请检查表单填写是否正确')
          return
        }

        await this.submitForm()
      })
    },

    // 提交表单
    async submitForm() {
      this.saving = true
      try {
        // 构建提交数据（必填参数）
        const payload = {
          productCode: this.formData.productCode,
          plannedWeight: this.formData.plannedWeight
        }

        // 添加可选字段
        if (this.formData.productId) {
          payload.productId = this.formData.productId
        }
        if (this.formData.taskCode) {
          payload.taskCode = this.formData.taskCode
        }
        if (this.formData.taskName) {
          payload.taskName = this.formData.taskName
        }
        if (this.formData.processTemplateId) {
          payload.processTemplateId = this.formData.processTemplateId
        }
        if (this.formData.plannedQuantity > 0) {
          payload.plannedQuantity = this.formData.plannedQuantity
        }
        if (this.formData.priority) {
          payload.priority = this.formData.priority
        }
        if (this.formData.remarks) {
          payload.remarks = this.formData.remarks
        }

        // 调用创建接口
        const response = await createAnnealingTask(payload)

        // 使用后端返回的消息
        const successMessage = response.message || SUCCESS_MESSAGES.CREATE
        this.$message.success(successMessage)

        // 关闭抽屉
        this.drawerVisible = false
        this.resetForm()

        // 通知父组件刷新列表
        this.$emit('success', response.data)
      } catch (error) {
        console.error('创建退火任务失败:', error)

        // 处理特定错误码
        const errorCode = error.response?.data?.error?.code
        const errorMessage = error.response?.data?.error?.message

        if (errorCode === 'INVALID_STATUS') {
          // 工艺模板状态错误
          this.$message.error(errorMessage || '所选工艺模板未生效，请选择已生效的工艺模板')
        } else if (errorCode === 'RESOURCE_NOT_FOUND') {
          // 资源不存在错误
          this.$message.error(errorMessage || '产品或工艺模板不存在，请重新选择')
        } else if (errorCode === 'PARAM_ERROR') {
          // 参数错误
          this.$message.error(errorMessage || '参数错误，请检查表单填写')
        } else {
          // 使用后端返回的错误消息，如果没有则使用默认消息
          this.$message.error(errorMessage || ERROR_MESSAGES.CREATE)
        }
      } finally {
        this.saving = false
      }
    },

    // 重置表单
    resetForm() {
      if (this.$refs.taskForm) {
        this.$refs.taskForm.resetFields()
      }
      this.formData = {
        productId: '',
        productCode: '',
        plannedWeight: null,
        processTemplateId: '',
        taskCode: '',
        taskName: '',
        plannedQuantity: null,
        priority: TASK_PRIORITY.NORMAL,
        remarks: ''
      }
      this.productOptions = []
      this.selectedProduct = null
      this.processTemplateOptions = []
    }
  }
}
</script>

<style lang="scss" scoped>
.task-create-form {
  padding: 0 8px;

  .full-width {
    width: 100%;
  }

  // 产品选项样式
  .product-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .product-code {
      font-weight: 600;
      color: #303133;
    }

    .product-name {
      flex: 1;
      color: #606266;
      font-size: 13px;
    }

    .product-alloy {
      color: #909399;
      font-size: 12px;
    }
  }

  .product-info {
    margin-top: 8px;
    display: flex;
    gap: 8px;
  }

  // 工艺模板选项样式
  .template-option {
    display: flex;
    align-items: center;
    gap: 8px;

    .template-code {
      font-weight: 600;
      color: #303133;
    }

    .template-name {
      flex: 1;
      color: #606266;
      font-size: 13px;
    }
  }

  // 字段提示样式
  .field-hint {
    margin-top: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;

    .info-hint {
      color: #909399;
    }

    .warning-hint {
      color: #E6A23C;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .success-hint {
      color: #67C23A;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

// 深度选择器样式
::v-deep .el-select-dropdown__item {
  height: auto;
  padding: 8px 20px;
  line-height: 1.5;
}

::v-deep .el-input-number {
  width: 100%;
}
</style>

