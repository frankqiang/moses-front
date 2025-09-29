/**
 * 文件名称：index.vue
 * 文件描述：设备主数据管理主页面，整合搜索、表格、表单抽屉，实现设备档案的查询与维护
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，完成 TASK006 P0 阶段集成与状态管理
 */

<template>
  <div class="equipment-management">
    <!-- 搜索表单 -->
    <equipment-search
      v-model="queryState"
      :loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 列表区域 -->
    <equipment-table
      ref="equipmentTableRef"
      :data="tableData"
      :loading="loading"
      :total="pagination.totalResults"
      :page="pagination.page"
      :limit="pagination.limit"
      :selected-rows.sync="selectedRows"
      @refresh="handleRefresh"
      @pagination-change="handlePaginationChange"
      @view="handleView"
      @edit="handleEdit"
      @create="handleCreate"
      @export="handleExport"
    />

    <!-- 表单抽屉 -->
    <equipment-form-drawer
      :visible.sync="drawer.visible"
      :mode="drawer.mode"
      :equipment-id="drawer.equipmentId"
      :initial-data="drawer.initialData"
      @success="handleFormSuccess"
      @close="handleDrawerClose"
    />

    <equipment-detail-drawer
      :visible.sync="detailDrawer.visible"
      :equipment-id="detailDrawer.equipmentId"
      @edit="handleDetailEdit"
      @close="handleDetailClose"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import EquipmentSearch from './components/EquipmentSearch.vue'
import EquipmentTable from './components/EquipmentTable.vue'
import EquipmentFormDrawer from './components/EquipmentFormDrawer.vue'
import EquipmentDetailDrawer from './components/EquipmentDetailDrawer.vue'
import {
  fetchEquipmentList
} from './api'
import {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  MESSAGE_FALLBACKS
} from './constants'
import { normalizeEquipmentListParams } from './utils/params'

const DEFAULT_QUERY_STATE = Object.freeze({
  ...DEFAULT_PAGINATION,
  sortBy: DEFAULT_SORT,
  includeDetails: true
})

export default {
  name: 'EquipmentManagement',
  components: {
    EquipmentSearch,
    EquipmentTable,
    EquipmentFormDrawer,
    EquipmentDetailDrawer
  },
  data() {
    return {
      loading: false,
      queryState: { ...DEFAULT_QUERY_STATE },
      pagination: {
        page: DEFAULT_PAGINATION.page,
        limit: DEFAULT_PAGINATION.limit,
        totalResults: 0
      },
      tableData: [],
      selectedRows: [],
      drawer: {
        visible: false,
        mode: 'create',
        equipmentId: null,
        initialData: null
      },
      detailDrawer: {
        visible: false,
        equipmentId: null
      }
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  created() {
    this.fetchList()
  },
  methods: {
    async fetchList({ keepPage = false } = {}) {
      try {
        this.loading = true
        const params = this.buildQueryParams({ keepPage })
        const response = await fetchEquipmentList(params)

        if (response.success) {
          const { results, page, limit, totalResults } = response.data
          this.tableData = Array.isArray(results) ? results : []
          this.pagination = {
            page: page || params.page,
            limit: limit || params.limit,
            totalResults: totalResults || 0
          }
          this.$refs.equipmentTableRef?.handleRefreshSuccess(response.message || MESSAGE_FALLBACKS.fetchList)
        }
      } catch (error) {
        console.error('[EquipmentManagement] fetchList error:', error)
        const message = error?.message || MESSAGE_FALLBACKS.fetchListError
        this.$message.error(message)
        this.$refs.equipmentTableRef?.handleRefreshError(message)
      } finally {
        this.loading = false
      }
    },
    buildQueryParams({ keepPage = false } = {}) {
      const base = keepPage
        ? { page: this.pagination.page, limit: this.pagination.limit }
        : { page: DEFAULT_PAGINATION.page, limit: this.pagination.limit }

      const merged = {
        ...DEFAULT_QUERY_STATE,
        ...this.queryState,
        ...base
      }

      return normalizeEquipmentListParams(merged)
    },
    handleSearch(payload) {
      this.queryState = {
        ...DEFAULT_QUERY_STATE,
        ...payload
      }
      this.pagination.page = DEFAULT_PAGINATION.page
      this.fetchList({ keepPage: false })
    },
    handleReset(payload) {
      this.queryState = {
        ...DEFAULT_QUERY_STATE,
        ...payload
      }
      this.pagination.page = DEFAULT_PAGINATION.page
      this.fetchList({ keepPage: false })
    },
    handleRefresh() {
      this.fetchList({ keepPage: true })
    },
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList({ keepPage: true })
    },
    handleCreate() {
      this.openDrawer({ mode: 'create' })
    },
    handleEdit(row) {
      if (!row?.id) return
      this.openDrawer({
        mode: 'update',
        equipmentId: row.id,
        initialData: row
      })
    },
    handleView(row) {
      if (!row?.id) return
      this.openDetailDrawer(row.id)
    },
    handleExport(params) {
      this.$emit('export', params)
    },
    openDrawer({ mode, equipmentId = null, initialData = null }) {
      this.drawer = {
        visible: true,
        mode,
        equipmentId,
        initialData
      }
    },
    openDetailDrawer(equipmentId) {
      this.detailDrawer = {
        visible: true,
        equipmentId
      }
    },
    handleFormSuccess(result) {
      if (result?.message) {
        this.$message.success(result.message)
      }
      this.fetchList({ keepPage: true })
    },
    handleDrawerClose() {
      this.drawer = {
        visible: false,
        mode: 'create',
        equipmentId: null,
        initialData: null
      }
    },
    handleDetailEdit(detailData) {
      const fallbackId = this.detailDrawer.equipmentId
      this.handleDetailClose()
      if (!detailData) return
      this.openDrawer({
        mode: 'update',
        equipmentId: detailData.id || detailData.equipmentId || fallbackId,
        initialData: detailData
      })
    },
    handleDetailClose() {
      this.detailDrawer = {
        visible: false,
        equipmentId: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.equipment-management {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>

