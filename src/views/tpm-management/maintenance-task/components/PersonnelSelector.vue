<!--
  文件名称：PersonnelSelector.vue
  文件描述：执行人员选择器组件 - 支持按组织架构筛选和负载显示
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 重构，使用按组织架构筛选维护人员接口
    - 2024-01-20: 修复数据解析问题 - 接口返回的 data 字段直接是数组
    - 2024-01-20: 修复接口重复调用问题 - 改用mounted钩子
    - 2024-01-20: 修复显示异常 - 改用float布局替代flex

  注意事项：
    - 该接口返回格式特殊：response.data 直接是数组，而非常见的 response.data.results
    - 接口文档：docs/接口文档/单独接口文档/按组织架构筛选维护人员接口详细说明_已重构.md
    - showWorkload功能依赖任务负载分析接口，如接口未实现建议设为false
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
      <span style="float: left">{{ item.name }}</span>
      <span style="float: right; color: #8492a6; font-size: 13px">
        {{ (item.profile && item.profile.department) ? item.profile.department.name : '未分配部门' }}
        <span v-if="showWorkload"> | 任务: {{ item.currentTaskCount || 0 }}</span>
      </span>
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

  mounted() {
    // 只在mounted时加载一次
    this.loadPersonnelList()
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

        // 接口返回的 data 字段直接是数组（不是 data.results 或 data.data）
        this.personnelList = response.data || []

        // 如果需要显示负载，加载负载信息
        if (this.showWorkload && this.personnelList.length > 0) {
          await this.loadWorkloadInfo()
        }
      } catch (error) {
        console.error('加载维护人员列表失败:', error)
        this.$message.error(error.message || '加载维护人员列表失败')
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


