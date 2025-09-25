<!--
 * 文件名称：positions/index.vue
 * 文件描述：岗位管理主页面，采用process-management/operations模块的开发范式
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 重构为独立的岗位管理模块，符合项目范式
-->

<template>
  <div class="position-management">
    <!-- 搜索表单 -->
    <search-form :loading="loading" :department-options="departmentOptions" @search="handleSearch"
      @reset="handleReset" />

    <!-- 岗位表格 -->
    <position-table ref="positionTable" :data="tableData" :loading="loading" :total="total" :page="pagination.page"
      :limit="pagination.limit" @pagination-change="handlePaginationChange" @create="handleCreate" @edit="handleEdit"
      @view="handleView" @delete="handleDelete" @toggleStatus="handleToggleStatus" @export-success="handleExportSuccess"
      @refresh="fetchList" @retry="fetchList" />

    <!-- 岗位表单抽屉 -->
    <position-form-drawer :visible.sync="formDrawerVisible" :mode="formMode" :position-data="currentPosition"
      :department-options="departmentOptions" @success="handleFormSuccess" />
  </div>
</template>

<script>
import { debounce } from '@/utils'
import SearchForm from './components/SearchForm.vue'
import PositionTable from './components/PositionTable.vue'
import PositionFormDrawer from './components/PositionFormDrawer.vue'
import {
  DEFAULT_SEARCH_PARAMS,
  POSITION_DEFAULT_QUERY,
  SEARCH_FORM_FIELDS
} from './constants'
import {
  getPositionList,
  updatePositionStatus,
  deletePosition,
  getDepartmentOptions
} from './api'

export default {
  name: 'PositionManagement',
  components: {
    SearchForm,
    PositionTable,
    PositionFormDrawer
  },
  data() {
    return {
      // 搜索参数
      searchParams: { ...DEFAULT_SEARCH_PARAMS },
      // 表格数据
      tableData: [],
      // 总记录数
      total: 0,
      // 分页参数
      pagination: {
        page: 1,
        limit: 10
      },
      // 加载状态
      loading: false,
      // 表单抽屉可见性
      formDrawerVisible: false,
      // 表单模式：create-新增, edit-编辑, view-查看
      formMode: 'create',
      // 当前操作的岗位数据
      currentPosition: null,
      // 部门选项
      departmentOptions: []
    }
  },
  created() {
    // 设置页面标题
    document.title = '岗位管理 - 组织结构管理'

    // 创建防抖搜索函数
    this.debouncedSearch = debounce(this.fetchList, 300)

    // 初始化加载数据
    this.fetchList()
    this.loadDepartmentOptions()
  },
  methods: {
    // 获取列表数据
    async fetchList() {
      try {
        this.loading = true
        const params = {
          ...POSITION_DEFAULT_QUERY,
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.searchParams
        }

        const requestParams = this.buildRequestParams(params)

        const response = await getPositionList(requestParams)

        if (response.success) {
          this.tableData = response.data.results || []
          this.total = response.data.totalResults || 0

          if (this.$refs.positionTable) {
            this.$refs.positionTable.refreshSucceed()
          }
        } else {
          if (this.$refs.positionTable) {
            this.$refs.positionTable.refreshFail(response.error?.message || '获取数据失败，请稍后重试')
          }
          this.$message.error(response.error?.message || '获取数据失败，请稍后重试')
        }
      } catch (error) {
        console.error('获取岗位列表失败:', error)
        if (this.$refs.positionTable) {
          this.$refs.positionTable.refreshFail('获取数据失败，请稍后重试')
        }
        this.$message.error('获取数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },

    /**
     * 构建请求参数：移除空字符串、null、undefined
     * @param {Object} params - 原始参数
     * @returns {Object} 过滤后的参数
     */
    buildRequestParams(params) {
      const sanitizedParams = {}

      Object.keys(params).forEach(key => {
        const value = params[key]

        if (value === undefined || value === null) {
          return
        }

        if (typeof value === 'string') {
          const trimmedValue = value.trim()
          if (trimmedValue !== '') {
            sanitizedParams[key] = trimmedValue
          }
          return
        }

        sanitizedParams[key] = value
      })

      return sanitizedParams
    },

    // 加载部门选项
    async loadDepartmentOptions() {
      try {
        const response = await getDepartmentOptions({ status: 'active' })
        if (response.success) {
          this.departmentOptions = response.data.options || []
        }
      } catch (error) {
        console.error('获取部门选项失败:', error)
      }
    },

    // 搜索处理
    handleSearch(formData) {
      this.pagination.page = 1
      const sanitizedForm = {
        ...DEFAULT_SEARCH_PARAMS,
        ...formData
      }

      if (sanitizedForm[SEARCH_FORM_FIELDS.NAME]) {
        sanitizedForm[SEARCH_FORM_FIELDS.NAME] = sanitizedForm[SEARCH_FORM_FIELDS.NAME].trim()
      }

      if (sanitizedForm[SEARCH_FORM_FIELDS.CODE]) {
        sanitizedForm[SEARCH_FORM_FIELDS.CODE] = sanitizedForm[SEARCH_FORM_FIELDS.CODE].trim().toUpperCase()
      }

      this.searchParams = sanitizedForm
      this.debouncedSearch()
    },

    // 重置搜索
    handleReset() {
      this.pagination.page = 1
      this.searchParams = { ...DEFAULT_SEARCH_PARAMS }
      this.fetchList()
    },

    // 分页处理
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },

    // 新增岗位
    handleCreate() {
      this.formMode = 'create'
      this.currentPosition = null
      this.formDrawerVisible = true
    },

    // 查看岗位
    handleView(position) {
      this.formMode = 'view'
      this.currentPosition = position
      this.formDrawerVisible = true
    },

    // 编辑岗位
    handleEdit(position) {
      this.formMode = 'edit'
      this.currentPosition = position
      this.formDrawerVisible = true
    },

    // 切换状态
    async handleToggleStatus(position) {
      const newStatus = position.status === 'active' ? 'inactive' : 'active'
      const actionText = newStatus === 'active' ? '启用' : '禁用'

      try {
        await this.$confirm(
          `确定要${actionText}岗位「${position.name}」吗？`,
          '确认操作',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await updatePositionStatus(position.id, {
          status: newStatus
        })

        if (response.success) {
          this.$message.success(response.message || `${actionText}成功`)
          this.fetchList()
        } else {
          this.$message.error(response.error?.message || `${actionText}失败`)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('切换岗位状态失败:', error)
          this.$message.error(`${actionText}失败，请稍后重试`)
        }
      }
    },

    // 删除岗位
    async handleDelete(position) {
      try {
        await this.$confirm(
          `确定要删除岗位「${position.name}」吗？\n删除后将无法恢复，请谨慎操作！`,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'error',
            dangerouslyUseHTMLString: true
          }
        )

        const response = await deletePosition(position.id)

        if (response.success) {
          this.$message.success(response.message || '删除成功')
          this.fetchList()
        } else {
          this.$message.error(response.error?.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除岗位失败:', error)
          this.$message.error('删除失败，请稍后重试')
        }
      }
    },

    // 导出成功
    handleExportSuccess(result) {
      this.$message.success('导出成功')
    },

    // 表单操作成功处理
    handleFormSuccess() {
      this.formDrawerVisible = false
      this.fetchList()
    }
  }
}
</script>

<style lang="scss" scoped>
.position-management {
  padding: 24px;
  min-height: 500px;
}

// 响应式设计
@media (max-width: 768px) {
  .position-management {
    padding: 16px;
  }
}
</style>
