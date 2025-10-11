<!--
  文件名称: LocationFormDrawer.vue
  文件描述: 库位表单抽屉组件
  创建日期: 2025-01-20
  修改记录:
    - 2025-01-20: 初始创建
-->

<template>
  <BaseDrawer
    :visible.sync="drawerVisible"
    :title="drawerTitle"
    :loading="loading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <el-form
      ref="locationForm"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      size="small"
    >
      <!-- 基本信息区域 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <el-form-item label="库位ID" prop="locationId">
          <el-input
            v-model="formData.locationId"
            :disabled="isEditMode || isDetailMode"
            placeholder="请输入库位ID(自动转大写)"
            maxlength="100"
            @input="handleLocationIdInput"
          />
        </el-form-item>

        <el-form-item label="所属库区" prop="storageAreaId">
          <el-select
            v-model="formData.storageAreaId"
            :disabled="isEditMode || isDetailMode"
            :loading="loadingAreas"
            placeholder="请选择所属库区"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="area in areaOptions"
              :key="area.value"
              :label="area.label"
              :value="area.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="库位类型" prop="locationType">
          <el-select
            v-model="formData.locationType"
            :disabled="isEditMode || isDetailMode"
            placeholder="请选择库位类型"
            style="width: 100%"
          >
            <el-option
              v-for="type in locationTypeOptions"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="承重限制" prop="loadCapacity">
          <el-input-number
            v-model="formData.loadCapacity"
            :disabled="isDetailMode"
            :min="0.01"
            :max="100000"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: kg，范围: 0.01-100000</span>
        </el-form-item>
      </div>

      <!-- 空间坐标区域 -->
      <div class="form-section">
        <div class="section-title">空间坐标</div>
        <div class="section-tip">选填，用于可视化和路径计算</div>

        <el-form-item label="X坐标" prop="coordinateX">
          <el-input-number
            v-model="formData.coordinateX"
            :disabled="isDetailMode"
            :min="-100000"
            :max="100000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: cm，范围: -100000~100000</span>
        </el-form-item>

        <el-form-item label="Y坐标" prop="coordinateY">
          <el-input-number
            v-model="formData.coordinateY"
            :disabled="isDetailMode"
            :min="-100000"
            :max="100000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: cm，范围: -100000~100000</span>
        </el-form-item>

        <el-form-item label="Z坐标" prop="coordinateZ">
          <el-input-number
            v-model="formData.coordinateZ"
            :disabled="isDetailMode"
            :min="0"
            :max="10000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: cm，范围: 0~10000</span>
        </el-form-item>
      </div>

      <!-- 尺寸限制区域 -->
      <div class="form-section">
        <div class="section-title">尺寸限制</div>
        <div class="section-tip">选填，用于料框适配性检查</div>

        <el-form-item label="长度限制" prop="lengthLimit">
          <el-input-number
            v-model="formData.lengthLimit"
            :disabled="isDetailMode"
            :min="0.01"
            :max="10000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: cm，范围: 0.01-10000</span>
        </el-form-item>

        <el-form-item label="宽度限制" prop="widthLimit">
          <el-input-number
            v-model="formData.widthLimit"
            :disabled="isDetailMode"
            :min="0.01"
            :max="10000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: cm，范围: 0.01-10000</span>
        </el-form-item>

        <el-form-item label="高度限制" prop="heightLimit">
          <el-input-number
            v-model="formData.heightLimit"
            :disabled="isDetailMode"
            :min="0.01"
            :max="10000"
            :precision="2"
            :step="10"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: cm，范围: 0.01-10000</span>
        </el-form-item>
      </div>

      <!-- 其他参数区域 -->
      <div class="form-section">
        <div class="section-title">其他参数</div>

        <el-form-item label="适用料框规格" prop="applicableBinSpecCodes">
          <el-select
            v-model="formData.applicableBinSpecCodes"
            :disabled="isDetailMode"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入料框规格代码，按回车添加"
            style="width: 100%"
          >
            <el-option
              v-for="code in binSpecCodeOptions"
              :key="code"
              :label="code"
              :value="code"
            />
          </el-select>
          <span class="form-item-tip">可输入自定义规格代码或选择已有规格，留空表示不限</span>
        </el-form-item>

        <el-form-item
          v-if="isGroundStacking"
          label="最大堆叠高度"
          prop="maxStackHeight"
        >
          <el-input-number
            v-model="formData.maxStackHeight"
            :disabled="isDetailMode"
            :min="1"
            :max="20"
            :step="1"
            style="width: 100%"
          />
          <span class="form-item-tip">单位: 层，范围: 1-20，仅地面堆垛区有效</span>
        </el-form-item>
      </div>
    </el-form>
  </BaseDrawer>
</template>

<script>
import BaseDrawer from '@/components/Drawer'
import {
  LOCATION_TYPE_OPTIONS,
  LOCATION_TYPE,
  LOCATION_FORM_FIELDS,
  CREATE_FORM_DEFAULT
} from '../constants'
import { getStorageAreas } from '../api'

export default {
  name: 'LocationFormDrawer',
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
      default: 'create', // create, edit, detail
      validator: value => ['create', 'edit', 'detail'].includes(value)
    },
    initialData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      loadingAreas: false,
      formData: { ...CREATE_FORM_DEFAULT },
      areaOptions: [],
      binSpecCodeOptions: [],
      locationTypeOptions: LOCATION_TYPE_OPTIONS
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
      const titleMap = {
        create: '创建库位',
        edit: '编辑库位',
        detail: '库位详情'
      }
      return titleMap[this.mode] || '库位信息'
    },
    isEditMode() {
      return this.mode === 'edit'
    },
    isDetailMode() {
      return this.mode === 'detail'
    },
    isGroundStacking() {
      return this.formData.locationType === LOCATION_TYPE.GROUND_STACKING
    },
    formRules() {
      const rules = {}
      Object.keys(LOCATION_FORM_FIELDS).forEach(key => {
        const field = LOCATION_FORM_FIELDS[key]
        if (field.rules) {
          rules[key] = field.rules
        }
      })
      return rules
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.initForm()
      } else {
        this.resetForm()
      }
    }
  },
  methods: {
    /**
     * 初始化表单
     */
    async initForm() {
      await this.fetchAreaOptions()

      if (this.initialData) {
        this.formData = {
          ...CREATE_FORM_DEFAULT,
          ...this.initialData,
          applicableBinSpecCodes: this.initialData.applicableBinSpecCodes || []
        }

        // 收集已有的料框规格代码
        if (this.formData.applicableBinSpecCodes && this.formData.applicableBinSpecCodes.length > 0) {
          this.binSpecCodeOptions = [...this.formData.applicableBinSpecCodes]
        }
      } else {
        this.formData = { ...CREATE_FORM_DEFAULT }
      }

      this.$nextTick(() => {
        this.$refs.locationForm && this.$refs.locationForm.clearValidate()
      })
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.formData = { ...CREATE_FORM_DEFAULT }
      this.binSpecCodeOptions = []
      this.$refs.locationForm && this.$refs.locationForm.clearValidate()
    },

    /**
     * 获取库区选项（只获取启用状态的库区用于创建）
     */
    async fetchAreaOptions() {
      try {
        this.loadingAreas = true
        const response = await getStorageAreas({
          status: 'enabled', // 只获取启用状态的库区
          page: 1,
          limit: 1000
        })
        this.areaOptions = (response.data.results || []).map(area => ({
          label: `${area.areaCode} - ${area.areaName}`,
          value: area.id
        }))
      } catch (error) {
        console.error('获取库区选项失败:', error)
        this.$message.error('获取库区选项失败')
      } finally {
        this.loadingAreas = false
      }
    },

    /**
     * 处理库位ID输入（自动转大写）
     */
    handleLocationIdInput(val) {
      this.formData.locationId = val.toUpperCase()
    },

    /**
     * 处理确认
     */
    async handleConfirm() {
      if (this.isDetailMode) {
        this.handleCancel()
        return
      }

      try {
        await this.$refs.locationForm.validate()

        // 准备提交数据
        const submitData = { ...this.formData }

        // 清理空值
        Object.keys(submitData).forEach(key => {
          if (submitData[key] === null || submitData[key] === '') {
            delete submitData[key]
          }
        })

        // 确保料框规格代码是数组
        if (!submitData.applicableBinSpecCodes) {
          submitData.applicableBinSpecCodes = []
        }

        this.$emit('confirm', submitData)
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    },

    /**
     * 处理取消
     */
    handleCancel() {
      this.drawerVisible = false
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;

  &:last-child {
    border-bottom: none;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .section-tip {
    font-size: 12px;
    color: #909399;
    margin-bottom: 16px;
  }
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

::v-deep .el-form-item {
  margin-bottom: 18px;
}

::v-deep .el-input-number {
  width: 100%;
}
</style>

