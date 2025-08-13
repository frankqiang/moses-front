/**
 * 文件名称：tableRefreshMixin.js
 * 文件描述：表格刷新功能混入，统一处理表格数据刷新和提示逻辑
 * 创建日期：2024-01-25
 * 修改记录：
 *   - 2024-01-25: 初始创建，提供统一的表格刷新功能
 */

/**
 * 表格刷新功能混入
 * 提供统一的表格数据刷新和提示处理逻辑
 * 
 * 使用方法：
 * 1. 在组件中引入并混入：import tableRefreshMixin from '@/mixins/tableRefreshMixin'
 * 2. 在data中定义tableRef属性，指定表格组件的ref名称
 * 3. 确保组件有fetchList方法用于获取数据
 * 4. 表格组件需要有refreshSucceed和refreshFail方法
 */
export default {
  methods: {
    /**
     * 带刷新提示的数据获取方法
     * 统一处理数据获取成功和失败的提示逻辑
     * @returns {Promise} 返回fetchList的Promise
     */
    async fetchListWithRefresh() {
      try {
        // 调用组件的fetchList方法获取数据
        await this.fetchList()
        
        // 获取成功后显示成功提示
        if (this.$refs[this.tableRef]) {
          this.$refs[this.tableRef].refreshSucceed()
        }
      } catch (error) {
        // 处理错误信息
        const errorMessage = error.response?.data?.message || error.message || '操作失败'
        
        // 显示失败提示
        if (this.$refs[this.tableRef]) {
          this.$refs[this.tableRef].refreshFail(errorMessage)
        }
        
        // 重新抛出错误，允许调用方进一步处理
        throw error
      }
    },

    /**
     * 刷新按钮点击处理方法
     * 直接调用带提示的数据获取方法
     */
    handleRefresh() {
      this.fetchListWithRefresh()
    },

    /**
     * 搜索处理方法
     * 重置到第一页并刷新数据
     */
    handleSearch() {
      // 重置分页到第一页
      if (this.pagination) {
        this.pagination.page = 1
      }
      this.fetchListWithRefresh()
    },

    /**
     * 重置搜索处理方法
     * 清空搜索条件，重置分页并刷新数据
     */
    handleReset() {
      // 重置搜索表单
      if (this.$refs.searchForm) {
        this.$refs.searchForm.resetFields()
      }
      
      // 重置搜索参数
      if (this.searchParams) {
        this.searchParams = {}
      }
      
      // 重置分页到第一页
      if (this.pagination) {
        this.pagination.page = 1
      }
      
      this.fetchListWithRefresh()
    },

    /**
     * 分页变化处理方法
     * @param {Object} paginationData 分页数据
     */
    handlePaginationChange(paginationData) {
      // 更新分页信息
      Object.assign(this.pagination, paginationData)
      this.fetchListWithRefresh()
    },

    /**
     * 表单操作成功后的处理方法
     * 关闭表单对话框并刷新数据
     */
    handleFormSuccess() {
      // 关闭表单对话框
      if (this.$refs.formDialog) {
        this.$refs.formDialog.close()
      }
      
      this.fetchListWithRefresh()
    },

    /**
     * 删除操作成功后的处理方法
     * 刷新数据列表
     */
    handleDeleteSuccess() {
      this.fetchListWithRefresh()
    },

    /**
     * 批量操作成功后的处理方法
     * 清空选中项并刷新数据
     */
    handleBatchSuccess() {
      // 清空选中项
      if (this.$refs[this.tableRef]) {
        this.$refs[this.tableRef].clearSelection()
      }
      
      this.fetchListWithRefresh()
    },

    /**
     * 导入成功后的处理方法
     * 关闭导入对话框并刷新数据
     */
    handleImportSuccess() {
      // 关闭导入对话框
      if (this.$refs.importDialog) {
        this.$refs.importDialog.close()
      }
      
      this.fetchListWithRefresh()
    }
  },

  /**
   * 组件创建时自动加载数据
   */
  created() {
    // 如果组件有fetchList方法，则自动加载数据
    if (typeof this.fetchList === 'function') {
      this.fetchListWithRefresh()
    }
  }
}