<!--
  文件名称：create.vue
  文件描述：创建维护任务页面
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建，路由配置占位组件
    - 2024-01-20: 实现维护任务创建功能，集成TaskFormDrawer组件
-->
<template>
  <div class="create-task-container">
    <div class="page-header">
      <el-page-header content="创建维护任务" @back="handleBack" />
    </div>

    <div class="page-content">
      <el-card shadow="never" class="form-card">
        <div class="card-title">
          <i class="el-icon-document" />
          <span>任务信息</span>
        </div>

        <el-form
          ref="taskForm"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          class="task-form"
        >
          <!-- 任务编码（可选） -->
          <el-form-item label="任务编码" prop="taskCode">
            <el-input
              v-model="formData.taskCode"
              placeholder="留空则自动生成，格式：MT-设备编码-时间戳"
              clearable
              maxlength="100"
              show-word-limit
            >
              <template slot="append">
                <el-tooltip content="任务编码可留空，系统将自动生成" placement="top">
                  <i class="el-icon-info" />
                </el-tooltip>
              </template>
            </el-input>
          </el-form-item>

          <!-- 设备选择（必填） -->
          <el-form-item label="设备" prop="equipmentId">
            <el-select
              v-model="formData.equipmentId"
              placeholder="请选择设备"
              filterable
              remote
              :remote-method="searchEquipment"
              :loading="equipmentLoading"
              clearable
              style="width: 100%"
              @change="handleEquipmentChange"
            >
              <el-option
                v-for="item in equipmentOptions"
                :key="item.id"
                :label="`${item.equipmentCode} - ${item.name}`"
                :value="item.id"
              >
                <span style="float: left">{{ item.equipmentCode }} - {{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.equipmentType }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 任务类型（必填） -->
          <el-form-item label="任务类型" prop="taskType">
            <el-select
              v-model="formData.taskType"
              placeholder="请选择任务类型"
              style="width: 100%"
            >
              <el-option label="计划维护" value="计划维护" />
              <el-option label="应急抢修" value="应急抢修" />
              <el-option label="状态检修" value="状态检修" />
            </el-select>
          </el-form-item>

          <!-- 任务标题（必填） -->
          <el-form-item label="任务标题" prop="taskTitle">
            <el-input
              v-model="formData.taskTitle"
              placeholder="请输入任务标题"
              clearable
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <!-- 维护计划（可选） -->
          <el-form-item label="维护计划" prop="planId">
            <el-select
              v-model="formData.planId"
              placeholder="请选择维护计划（可选）"
              filterable
              remote
              :remote-method="searchMaintenancePlan"
              :loading="planLoading"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in planOptions"
                :key="item.id"
                :label="`${item.planCode} - ${item.planName}`"
                :value="item.id"
              >
                <span style="float: left">{{ item.planCode }} - {{ item.planName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.maintenanceType }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 计划时间（必填） -->
          <el-form-item label="计划开始时间" prop="plannedStartTime">
            <el-date-picker
              v-model="formData.plannedStartTime"
              type="datetime"
              placeholder="请选择计划开始时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
              :picker-options="startTimePickerOptions"
            />
          </el-form-item>

          <el-form-item label="计划结束时间" prop="plannedEndTime">
            <el-date-picker
              v-model="formData.plannedEndTime"
              type="datetime"
              placeholder="请选择计划结束时间（可选）"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
              :picker-options="endTimePickerOptions"
            />
          </el-form-item>

          <!-- 执行人员（可选） -->
          <el-form-item label="执行人员" prop="assignedTo">
            <el-select
              v-model="formData.assignedTo"
              placeholder="请选择执行人员（可选）"
              filterable
              remote
              :remote-method="searchPersonnel"
              :loading="personnelLoading"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in personnelOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span style="float: left">{{ item.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">
                  {{ item.profile && item.profile.department ? item.profile.department.name : '未分配部门' }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 任务描述（可选） -->
          <el-form-item label="任务描述" prop="taskDescription">
            <el-input
              v-model="formData.taskDescription"
              type="textarea"
              :rows="4"
              placeholder="请输入任务描述"
              maxlength="2000"
              show-word-limit
            />
          </el-form-item>

          <!-- 备注（可选） -->
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item>
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
              {{ submitLoading ? '提交中...' : '确认创建' }}
            </el-button>
            <el-button @click="handleCancel">取消</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import { createMaintenanceTask, getPersonnel } from '@/api/mdm/tpm/maintenanceTask'

export default {
  name: 'MaintenanceTaskCreate',
  data() {
    // 自定义验证规则：结束时间不能早于开始时间
    const validateEndTime = (rule, value, callback) => {
      if (value && this.formData.plannedStartTime) {
        const startTime = new Date(this.formData.plannedStartTime).getTime()
        const endTime = new Date(value).getTime()
        if (endTime < startTime) {
          callback(new Error('结束时间不能早于开始时间'))
        } else {
          callback()
        }
      } else {
        callback()
      }
    }

    return {
      submitLoading: false,
      equipmentLoading: false,
      planLoading: false,
      personnelLoading: false,

      // 表单数据
      formData: {
        taskCode: '',
        equipmentId: '',
        taskType: '',
        taskTitle: '',
        planId: '',
        plannedStartTime: '',
        plannedEndTime: '',
        assignedTo: '',
        taskDescription: '',
        remark: ''
      },

      // 选项列表
      equipmentOptions: [],
      planOptions: [],
      personnelOptions: [],

      // 表单验证规则
      formRules: {
        equipmentId: [
          { required: true, message: '请选择设备', trigger: 'change' }
        ],
        taskType: [
          { required: true, message: '请选择任务类型', trigger: 'change' }
        ],
        taskTitle: [
          { required: true, message: '请输入任务标题', trigger: 'blur' },
          { min: 1, max: 200, message: '任务标题长度在 1 到 200 个字符', trigger: 'blur' }
        ],
        plannedStartTime: [
          { required: true, message: '请选择计划开始时间', trigger: 'change' }
        ],
        plannedEndTime: [
          { validator: validateEndTime, trigger: 'change' }
        ],
        taskCode: [
          { max: 100, message: '任务编码长度不能超过 100 个字符', trigger: 'blur' }
        ]
      },

      // 时间选择器配置
      startTimePickerOptions: {
        disabledDate(time) {
          // 不限制过去时间，允许创建历史任务
          return false
        }
      },
      endTimePickerOptions: {
        disabledDate: (time) => {
          if (this.formData.plannedStartTime) {
            return time.getTime() < new Date(this.formData.plannedStartTime).getTime()
          }
          return false
        }
      }
    }
  },
  mounted() {
    // 初始化加载人员列表
    this.loadPersonnel()
  },
  methods: {
    /**
     * 返回上一页
     */
    handleBack() {
      this.$router.push({ name: 'MaintenanceTask' })
    },

    /**
     * 搜索设备（远程搜索）
     */
    searchEquipment(query) {
      if (query !== '') {
        this.equipmentLoading = true
        // TODO: 调用设备查询API，这里先使用模拟数据
        setTimeout(() => {
          this.equipmentOptions = [
            {
              id: 'eq-001',
              equipmentCode: 'EQ001',
              name: '退火炉#1',
              equipmentType: '退火炉'
            },
            {
              id: 'eq-002',
              equipmentCode: 'EQ002',
              name: '退火炉#2',
              equipmentType: '退火炉'
            },
            {
              id: 'eq-003',
              equipmentCode: 'HC001',
              name: '行车#1',
              equipmentType: '行车'
            }
          ].filter(item =>
            item.equipmentCode.toLowerCase().includes(query.toLowerCase()) ||
            item.name.toLowerCase().includes(query.toLowerCase())
          )
          this.equipmentLoading = false
        }, 200)
      } else {
        this.equipmentOptions = []
      }
    },

    /**
     * 设备变化时，重新加载维护计划（按设备筛选）
     */
    handleEquipmentChange(value) {
      if (value) {
        this.searchMaintenancePlan('', value)
      } else {
        this.planOptions = []
        this.formData.planId = ''
      }
    },

    /**
     * 搜索维护计划（远程搜索，支持按设备筛选）
     */
    searchMaintenancePlan(query, equipmentId) {
      this.planLoading = true
      const searchEquipmentId = equipmentId || this.formData.equipmentId

      // TODO: 调用维护计划查询API，这里先使用模拟数据
      setTimeout(() => {
        const allPlans = [
          {
            id: 'plan-001',
            planCode: 'MP001',
            planName: '退火炉月度保养',
            maintenanceType: '定期保养',
            equipmentId: 'eq-001'
          },
          {
            id: 'plan-002',
            planCode: 'MP002',
            planName: '退火炉季度检查',
            maintenanceType: '定期检查',
            equipmentId: 'eq-001'
          },
          {
            id: 'plan-003',
            planCode: 'MP003',
            planName: '行车年度大修',
            maintenanceType: '大修',
            equipmentId: 'eq-003'
          }
        ]

        this.planOptions = allPlans.filter(item => {
          const matchEquipment = !searchEquipmentId || item.equipmentId === searchEquipmentId
          const matchQuery = !query ||
            item.planCode.toLowerCase().includes(query.toLowerCase()) ||
            item.planName.toLowerCase().includes(query.toLowerCase())
          return matchEquipment && matchQuery
        })
        this.planLoading = false
      }, 200)
    },

    /**
     * 搜索执行人员（远程搜索）
     */
    async searchPersonnel(query) {
      try {
        this.personnelLoading = true
        // 调用实际的人员查询接口
        const response = await getPersonnel({
          limit: 50,
          sortBy: 'name:asc'
        })

        if (response && response.data) {
          let personnel = response.data
          // 如果有查询关键词，进行前端过滤
          if (query) {
            personnel = personnel.filter(item =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.username.toLowerCase().includes(query.toLowerCase())
            )
          }
          this.personnelOptions = personnel
        }
      } catch (error) {
        console.error('查询执行人员失败:', error)
        this.$message.error(error.message || '查询执行人员失败')
      } finally {
        this.personnelLoading = false
      }
    },

    /**
     * 初始化加载人员列表
     */
    async loadPersonnel() {
      try {
        this.personnelLoading = true
        const response = await getPersonnel({
          limit: 50,
          sortBy: 'name:asc'
        })

        if (response && response.data) {
          this.personnelOptions = response.data
        }
      } catch (error) {
        console.error('加载执行人员失败:', error)
      } finally {
        this.personnelLoading = false
      }
    },

    /**
     * 重置表单
     */
    handleReset() {
      this.$refs.taskForm.resetFields()
      this.equipmentOptions = []
      this.planOptions = []
    },

    /**
     * 取消操作
     */
    handleCancel() {
      this.$confirm('确定要取消创建维护任务吗？未保存的数据将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleBack()
      }).catch(() => {
        // 用户取消操作
      })
    },

    /**
     * 提交表单
     */
    handleSubmit() {
      this.$refs.taskForm.validate(async(valid) => {
        if (valid) {
          try {
            this.submitLoading = true

            // 准备提交数据
            const submitData = {
              equipmentId: this.formData.equipmentId,
              taskType: this.formData.taskType,
              taskTitle: this.formData.taskTitle,
              plannedStartTime: new Date(this.formData.plannedStartTime).toISOString()
            }

            // 添加可选字段
            if (this.formData.taskCode) {
              submitData.taskCode = this.formData.taskCode
            }
            if (this.formData.planId) {
              submitData.planId = this.formData.planId
            }
            if (this.formData.plannedEndTime) {
              submitData.plannedEndTime = new Date(this.formData.plannedEndTime).toISOString()
            }
            if (this.formData.assignedTo) {
              submitData.assignedTo = this.formData.assignedTo
            }
            if (this.formData.taskDescription) {
              submitData.taskDescription = this.formData.taskDescription
            }
            if (this.formData.remark) {
              submitData.remark = this.formData.remark
            }

            // 调用创建接口
            const response = await createMaintenanceTask(submitData)

            // 使用后端返回的消息
            this.$message.success(response.message || '创建维护任务成功')

            // 返回列表页面
            this.$router.push({ name: 'MaintenanceTask' })
          } catch (error) {
            console.error('创建维护任务失败:', error)
            // 直接显示后端返回的错误消息
            this.$message.error(error.message || '创建维护任务失败')
          } finally {
            this.submitLoading = false
          }
        } else {
          this.$message.warning('请完善必填信息')
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.create-task-container {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    ::v-deep .el-page-header {
      .el-page-header__content {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .page-content {
    .form-card {
      ::v-deep .el-card__body {
        padding: 0;
      }

      .card-title {
        padding: 20px 20px 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;

        i {
          margin-right: 8px;
          font-size: 18px;
          color: #409EFF;
        }
      }

      .task-form {
        padding: 20px;
        max-width: 800px;

        ::v-deep .el-form-item__label {
          font-weight: 500;
        }

        ::v-deep .el-select,
        ::v-deep .el-date-picker {
          width: 100%;
        }

        ::v-deep .el-button {
          min-width: 100px;
        }
      }
    }
  }
}
</style>

