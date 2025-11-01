<!--
  文件名称：TaskSearch.vue
  文件描述：维护任务搜索表单组件
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
    - 2024-01-20: 改用字典系统获取选项数据
    - 2024-01-21: 根据查询类型显示不同的筛选条件
    - 2024-01-20: 重构，参考铝箔产品管理模块架构
-->
<template>
  <div class="task-search">
    <search-form
      ref="searchForm"
      :items="formItems"
      :value="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'
import { getMaintenancePersonnel } from '../api'
import { fetchEquipmentList } from '@/views/master-data/equipment-management/api/equipment-management'

export default {
  name: 'TaskSearch',

  components: {
    SearchForm
  },

  mixins: [tpmDictionaryMixin],

  props: {
    // 查询类型：'all' - 全部任务，'overdue' - 逾期任务
    queryType: {
      type: String,
      default: 'all'
    }
  },

  data() {
    return {
      searchForm: {
        equipmentId: '',
        taskType: '',
        status: '',
        assignedTo: '',
        search: '',
        startDate: '',
        endDate: ''
      },
      // 设备选项
      equipmentOptions: [],
      // 执行人选项
      personnelOptions: [],
      // 加载状态
      loadingPersonnel: false
    }
  },

  computed: {
    /**
     * 动态生成表单项配置
     * 根据查询类型显示不同的筛选条件
     *
     * 逾期任务查询（queryType='overdue'）只支持：
     * - equipmentId（设备ID）
     * - assignedTo（执行人ID）
     * - page、limit、sortBy（分页和排序参数，由表格组件处理）
     *
     * 全部任务查询（queryType='all'）支持所有筛选条件
     */
    formItems() {
      // 基础筛选项（所有查询类型都支持）
      const baseItems = [
        {
          label: '设备',
          prop: 'equipmentId',
          type: 'select',
          placeholder: '请选择设备',
          options: this.equipmentOptions,
          filterable: true,
          clearable: true
        },
        {
          label: '执行人',
          prop: 'assignedTo',
          type: 'select',
          placeholder: '请选择执行人',
          options: this.personnelOptions,
          filterable: true,
          clearable: true,
          loading: this.loadingPersonnel
        }
      ]

      // 如果是逾期任务查询，只返回基础筛选项
      if (this.queryType === 'overdue') {
        return baseItems
      }

      // 全部任务查询返回完整的筛选项
      return [
        ...baseItems,
        {
          label: '任务类型',
          prop: 'taskType',
          type: 'select',
          placeholder: '请选择任务类型',
          options: this.taskTypeOptions, // 从字典 mixin 获取
          clearable: true
        },
        {
          label: '状态',
          prop: 'status',
          type: 'select',
          placeholder: '请选择状态',
          options: this.taskStatusOptions, // 从字典 mixin 获取
          clearable: true,
          multiple: true,
          collapseTags: true
        },
        {
          label: '计划时间',
          prop: 'dateRange',
          type: 'daterange',
          placeholder: '请选择时间范围',
          format: 'yyyy-MM-dd',
          valueFormat: 'yyyy-MM-dd'
        },
        {
          label: '关键词',
          prop: 'search',
          type: 'input',
          placeholder: '请输入任务编码或标题'
        }
      ]
    }
  },

  async created() {
    // 加载TPM字典
    await this.loadTPMDictionary()
    // 加载设备选项
    await this.loadEquipmentOptions()
    // 加载维护人员选项
    await this.loadPersonnelOptions()
  },

  methods: {
    /**
     * 处理搜索
     * 将表单数据转换为API参数格式
     */
    handleSearch(formData) {
      const searchParams = { ...formData }

      // 处理日期范围，转换为 ISO 8601 格式
      if (formData.dateRange && formData.dateRange.length === 2) {
        // 开始时间：当天 00:00:00
        const startDate = new Date(formData.dateRange[0])
        startDate.setHours(0, 0, 0, 0)
        searchParams.startDate = startDate.toISOString()

        // 结束时间：当天 23:59:59
        const endDate = new Date(formData.dateRange[1])
        endDate.setHours(23, 59, 59, 999)
        searchParams.endDate = endDate.toISOString()
      }
      delete searchParams.dateRange

      // 处理多选状态，转换为逗号分隔的字符串
      if (searchParams.status && Array.isArray(searchParams.status)) {
        searchParams.status = searchParams.status.join(',')
      }

      // 移除空值参数，避免传递无效参数
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === null || searchParams[key] === undefined) {
          delete searchParams[key]
        }
      })

      this.$emit('search', searchParams)
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.$emit('reset')
    },

    /**
     * 加载设备选项
     * 使用设备主数据API获取设备列表
     */
    async loadEquipmentOptions() {
      try {
        const response = await fetchEquipmentList({
          page: 1,
          limit: 100,
          sortBy: 'equipmentCode:asc'
        })

        // 从 response.data 中获取结果并转换为下拉选项格式
        const { results } = response.data || {}
        this.equipmentOptions = (results || []).map(equipment => ({
          label: `${equipment.equipmentCode} - ${equipment.name}`,
          value: equipment.id
        }))
      } catch (error) {
        console.error('加载设备选项失败:', error)
        this.equipmentOptions = []
      }
    },

    /**
     * 加载维护人员选项
     * 使用按组织架构筛选维护人员接口
     */
    async loadPersonnelOptions() {
      this.loadingPersonnel = true
      try {
        const response = await getMaintenancePersonnel({
          limit: 100,
          sortBy: 'name:asc'
        })

        // 转换为下拉选项格式
        this.personnelOptions = (response.data || []).map(user => ({
          label: `${user.name} (${user.profile?.department?.name || '未分配部门'})`,
          value: user.id
        }))
      } catch (error) {
        console.error('加载维护人员选项失败:', error)
        this.personnelOptions = []
      } finally {
        this.loadingPersonnel = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.task-search {
  margin-bottom: 16px;
}
</style>

