<!--
  文件名称：PersonnelSelector.vue
  文件描述：执行人员选择器组件 - 支持按组织架构筛选和负载显示
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 重构，使用按组织架构筛选维护人员接口
-->
<template>
  <el-select
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :loading="loading"
    @input="handleInput"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in personnelList"
      :key="item.id"
      :label="getPersonnelLabel(item)"
      :value="item.id"
    >
      <div class="personnel-option">
        <div class="personnel-option__info">
          <span class="personnel-option__name">{{ item.name }}</span>
          <span v-if="item.profile" class="personnel-option__department">
            {{ item.profile.department ? item.profile.department.name : '未分配部门' }}
          </span>
        </div>
        <span v-if="showWorkload" class="personnel-option__workload">
          当前: {{ item.currentTaskCount || 0 }}
        </span>
      </div>
    </el-option>
  </el-select>
</template>

<script>
import { getMaintenancePersonnel, getWorkloadAnalysis } from '../api'

export default {
  name: 'PersonnelSelector',

  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择执行人员'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: true
    },
    // 是否显示负载信息
    showWorkload: {
      type: Boolean,
      default: false
    },
    // 部门ID筛选（可选）
    departmentId: {
      type: String,
      default: ''
    },
    // 岗位ID筛选（可选）
    positionId: {
      type: String,
      default: ''
    },
    // 角色ID列表筛选（可选，逗号分隔）
    roleIds: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      personnelList: [],
      loading: false,
      workloadMap: {}
    }
  },

  created() {
    this.loadPersonnelList()
  },

  watch: {
    departmentId() {
      this.loadPersonnelList()
    },
    positionId() {
      this.loadPersonnelList()
    },
    roleIds() {
      this.loadPersonnelList()
    }
  },

  methods: {
    /**
     * 加载维护人员列表
     * 使用按组织架构筛选维护人员接口
     */
    async loadPersonnelList() {
      try {
        this.loading = true
        const params = {
          limit: 100,
          sortBy: 'name:asc'
        }

        // 添加筛选条件
        if (this.departmentId) {
          params.departmentId = this.departmentId
        }
        if (this.positionId) {
          params.positionId = this.positionId
        }
        if (this.roleIds) {
          params.roleIds = this.roleIds
        }

        const response = await getMaintenancePersonnel(params)
        this.personnelList = response.data || []

        // 如果需要显示负载，加载负载信息
        if (this.showWorkload && this.personnelList.length > 0) {
          await this.loadWorkloadInfo()
        }
      } catch (error) {
        console.error('加载维护人员列表失败:', error)
        this.personnelList = []
      } finally {
        this.loading = false
      }
    },

    /**
     * 加载人员负载信息
     * 使用任务负载分析接口
     */
    async loadWorkloadInfo() {
      try {
        const response = await getWorkloadAnalysis({
          groupBy: 'assignee'
        })

        // 构建负载映射表
        const workloadData = response.data?.data || []
        this.workloadMap = workloadData.reduce((map, item) => {
          map[item.assigneeId] = item.inProgressTasks + item.pendingTasks
          return map
        }, {})

        // 更新人员列表的负载信息
        this.personnelList = this.personnelList.map(person => ({
          ...person,
          currentTaskCount: this.workloadMap[person.id] || 0
        }))
      } catch (error) {
        console.error('加载人员负载信息失败:', error)
        // 负载信息加载失败不影响人员列表显示
      }
    },

    /**
     * 获取人员显示标签
     */
    getPersonnelLabel(item) {
      const departmentName = item.profile?.department?.name || '未分配部门'
      return `${item.name} (${departmentName})`
    },

    /**
     * 输入处理
     */
    handleInput(val) {
      this.$emit('input', val)
    },

    /**
     * 值变化处理
     */
    handleChange(val) {
      const selectedPerson = this.personnelList.find(item => item.id === val)
      this.$emit('change', val, selectedPerson)
    },

    /**
     * 清除处理
     */
    handleClear() {
      this.$emit('clear')
      this.$emit('change', '', null)
    }
  }
}
</script>

<style lang="scss" scoped>
.personnel-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__name {
    font-size: 14px;
    color: #303133;
  }

  &__department {
    font-size: 12px;
    color: #909399;
  }

  &__workload {
    font-size: 12px;
    color: #8492a6;
    margin-left: 12px;
  }
}
</style>

