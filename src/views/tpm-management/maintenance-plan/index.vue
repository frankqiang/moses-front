<!--
文件名称：index.vue
文件描述：维护计划管理主页面
创建日期：2025-10-15
修改记录：
  - 2025-10-15: 初始创建
-->

<template>
  <div class="app-container maintenance-plan-container">
    <!-- 搜索表单 -->
    <maintenance-plan-search
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格 -->
    <maintenance-plan-table
      :table-data="list"
      :loading="isLoading"
      :total="currentPagination.totalResults"
      :query-params="queryParams"
      @refresh="fetchData"
      @create="handleCreate"
      @view="handleView"
      @edit="handleEdit"
      @enable="handleEnable"
      @disable="handleDisable"
      @sort-change="handleSortChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 表单抽屉 -->
    <maintenance-plan-form-drawer
      :visible.sync="formDrawerVisible"
      :mode="formDrawerMode"
      :plan-data="currentPlan"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import MaintenancePlanSearch from './components/MaintenancePlanSearch.vue'
import MaintenancePlanTable from './components/MaintenancePlanTable.vue'
import MaintenancePlanFormDrawer from './components/MaintenancePlanFormDrawer.vue'
import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'
import { handleApiError, showOperationSuccess, showConfirm } from './utils'

export default {
  name: 'MaintenancePlanIndex',

  components: {
    MaintenancePlanSearch,
    MaintenancePlanTable,
    MaintenancePlanFormDrawer
  },

  mixins: [tpmDictionaryMixin],

  data() {
    return {
      // 表单抽屉
      formDrawerVisible: false,
      formDrawerMode: 'create'
    }
  },

  computed: {
    ...mapState('maintenancePlan', ['list', 'currentPlan', 'filters']),
    ...mapGetters('maintenancePlan', ['isLoading', 'currentPagination']),

    // 查询参数
    queryParams() {
      return {
        page: this.currentPagination.page,
        limit: this.currentPagination.limit,
        sortBy: this.filters.sortBy,
        search: this.filters.search,
        maintenanceType: this.filters.maintenanceType,
        cycleType: this.filters.cycleType,
        status: this.filters.status
      }
    }
  },

  async created() {
    // 加载TPM模块字典
    await this.loadTPMDictionary()
    // 获取列表数据
    this.fetchData()
  },

  methods: {
    ...mapActions('maintenancePlan', [
      'getList',
      'getDetail',
      'enable',
      'disable',
      'updateFilters',
      'updatePagination'
    ]),

    // 获取列表数据
    async fetchData() {
      try {
        await this.getList()
      } catch (error) {
        handleApiError(error, {
          defaultMessage: '获取维护计划列表失败'
        })
      }
    },

    // 处理搜索
    handleSearch(searchParams) {
      this.updateFilters(searchParams)
      this.updatePagination({ page: 1 })
      this.fetchData()
    },

    // 处理重置
    handleReset(searchParams) {
      this.updateFilters(searchParams)
      this.updatePagination({ page: 1 })
      this.fetchData()
    },

    // 处理排序
    handleSortChange(sortBy) {
      this.updateFilters({ sortBy })
      this.fetchData()
    },

    // 处理分页
    handlePageChange(page) {
      this.updatePagination({ page })
      this.fetchData()
    },

    // 处理每页大小变化
    handleSizeChange(limit) {
      this.updatePagination({ limit, page: 1 })
      this.fetchData()
    },

    // 处理新建
    handleCreate() {
      this.formDrawerMode = 'create'
      this.formDrawerVisible = true
    },

    // 处理查看
    async handleView(row) {
      try {
        await this.getDetail(row.id)
        this.formDrawerMode = 'view'
        this.formDrawerVisible = true
      } catch (error) {
        handleApiError(error, {
          defaultMessage: '获取维护计划详情失败'
        })
      }
    },

    // 处理编辑
    async handleEdit(row) {
      try {
        await this.getDetail(row.id)
        this.formDrawerMode = 'update'
        this.formDrawerVisible = true
      } catch (error) {
        handleApiError(error, {
          defaultMessage: '获取维护计划详情失败'
        })
      }
    },

    // 处理表单成功
    handleFormSuccess() {
      this.fetchData() // 刷新列表
    },

    // 处理启用
    async handleEnable(row) {
      try {
        await showConfirm({
          message: '确认启用该维护计划？启用后系统将自动生成维护任务。',
          title: '启用确认',
          type: 'warning'
        })

        const result = await this.enable(row.id)
        showOperationSuccess('enable', result)
        this.fetchData() // 刷新列表
      } catch (error) {
        if (error !== 'cancel') {
          handleApiError(error, {
            defaultMessage: '启用维护计划失败'
          })
        }
      }
    },

    // 处理禁用
    async handleDisable(row) {
      try {
        await showConfirm({
          message: '确认禁用该维护计划？禁用后将停止生成新的维护任务。',
          title: '禁用确认',
          type: 'warning'
        })

        const result = await this.disable(row.id)
        showOperationSuccess('disable', result)
        this.fetchData() // 刷新列表
      } catch (error) {
        if (error !== 'cancel') {
          handleApiError(error, {
            defaultMessage: '禁用维护计划失败'
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.maintenance-plan-container {
  // 页面容器样式
}
</style>
