/**
* 待审批申请列表页面
* 功能描述：为管理员提供查看和管理待审批注册申请的界面
* 创建日期：2024-12-23
*/
<template>
  <div class="pending-applications">
    <!-- 搜索表单 -->
    <search-form :loading="loading" @search="handleSearch" @reset="handleReset" />

    <!-- 申请列表表格 -->
    <ApplicationTable :data="tableData" :loading="loading" :total="total" :page="pagination.page"
      :limit="pagination.limit" @pagination-change="handlePaginationChange" @sort-change="handleSortChange"
      @selection-change="handleSelectionChange" @refresh="fetchList" @view="handleView" @approve="handleApprove"
      @reject="handleReject" />
  </div>
</template>

<script>
import SearchForm from './components/SearchForm.vue'
import ApplicationTable from './components/ApplicationTable.vue'
import { getPendingApplications, approveApplication, rejectApplication, handleRegistrationError } from '../api/register'

export default {
  name: 'PendingApplications',
  components: {
    SearchForm,
    ApplicationTable
  },
  data() {
    return {
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,

      // 分页参数
      pagination: {
        page: 1,
        limit: 10
      },

      // 搜索参数
      searchParams: {
        search: '',
        departmentId: '',
        startDate: '',
        endDate: ''
      },

      // 排序参数
      sortParams: {
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      },

      // 选中的行数据
      selectedRows: []
    }
  },
  created() {
    this.fetchList()
  },
  methods: {
    /**
     * 获取待审批申请列表
     */
    async fetchList() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.searchParams,
          ...this.sortParams
        }

        const response = await getPendingApplications(params)



        // 直接使用response.data中的数据
        const responseData = response.data

        this.tableData = responseData.applications || []

        // 分页信息处理
        const pagination = responseData.pagination || {}
        this.total = pagination.total || 0


      } catch (error) {
        console.error('获取待审批申请列表失败:', error)
        handleRegistrationError(error, {
          showMessage: true,
          defaultMessage: '获取待审批申请列表失败，请稍后重试'
        })
        this.tableData = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    /**
       * 处理搜索
     * @param {Object} formData - 搜索表单数据
     */
    handleSearch(formData) {
      console.log('搜索参数:', formData)

      // 处理日期范围
      if (formData.dateRange && formData.dateRange.length === 2) {
        formData.startDate = formData.dateRange[0]
        formData.endDate = formData.dateRange[1]
      }
      delete formData.dateRange

      // 清理空值参数
      const cleanParams = {}
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          cleanParams[key] = formData[key]
        }
      })

      this.searchParams = cleanParams
      this.pagination.page = 1
      this.fetchList()
    },

    /**
     * 处理重置
     */
    handleReset() {
      this.searchParams = {
        search: '',
        departmentId: '',
        startDate: '',
        endDate: ''
      }
      this.pagination.page = 1
      this.fetchList()
    },

    /**
     * 处理分页变化
     */
    handlePaginationChange({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },

    /**
     * 处理排序变化
     * @param {Object} sortInfo - 排序信息 { prop, order }
     */
    handleSortChange(sortInfo) {
      console.log('排序变化:', sortInfo)

      if (sortInfo.prop && sortInfo.order) {
        this.sortParams.sortBy = sortInfo.prop
        this.sortParams.sortOrder = sortInfo.order === 'ascending' ? 'ASC' : 'DESC'
      } else {
        // 清除排序
        this.sortParams.sortBy = 'createdAt'
        this.sortParams.sortOrder = 'DESC'
      }

      this.pagination.page = 1
      this.fetchList()
    },

    /**
       * 处理批量选择变化
     * @param {Array} selection - 选中的行数据
     */
    handleSelectionChange(selection) {
      console.log('批量选择变化:', selection)
      this.selectedRows = selection
    },

    /**
       * 处理查看详情
     * @param {Object} row - 申请记录
     */
    handleView(row) {
      // 跳转到申请状态查询页面查看详情
      this.$router.push({
        name: 'RegisterStatus',
        query: { id: row.id }
      })
    },

    /**
     * 处理批准申请
     * @param {Object} row - 申请记录
     */
    async handleApprove(row) {
      try {
        // 弹出确认对话框，支持添加审批备注
        const { value: notes } = await this.$prompt(
          '请输入审批备注（可选）：',
          `批准申请 - ${row.applicantName}`,
          {
            confirmButtonText: '确定批准',
            cancelButtonText: '取消',
            inputType: 'textarea',
            inputPlaceholder: '请输入审批备注（可选）',
            type: 'info',
            showCancelButton: true,
            closeOnClickModal: false,
            inputValidator: (value) => {
              if (value && value.length > 500) {
                return '审批备注不能超过500个字符'
              }
              return true
            }
          }
        )

        // 设置加载状态
        this.$set(row, 'approving', true)

        // 调用批准接口
        const response = await approveApplication(row.id, { notes })

        this.$message.success(response.message || '申请批准成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('批准申请失败:', error)
          handleRegistrationError(error, {
            showMessage: true,
            defaultMessage: '批准申请失败'
          })
        }
      } finally {
        this.$set(row, 'approving', false)
      }
    },

    /**
     * 处理拒绝申请
     * @param {Object} row - 申请记录
     */
    async handleReject(row) {
      try {
        // 创建表单数据对象
        const formData = {
          reason: '',
          notes: ''
        }
        // 使用Element UI的Dialog组件创建一个包含两个输入框的表单
        const h = this.$createElement
        await this.$msgbox({
          title: `拒绝申请 - ${row.companyName || ''}`,
          message: h('div', null, [
            h('p', { class: 'reject-form-label' }, '拒绝理由：'),
            h('el-input', {
              attrs: {
                type: 'textarea',
                rows: 3,
                placeholder: '请输入拒绝理由',
                maxlength: 500,
                'show-word-limit': true
              },
              model: {
                value: formData.reason,
                callback: (val) => { formData.reason = val }
              }
            }),
            h('p', { class: 'reject-form-label', style: 'margin-top: 15px' }, '审批备注（可选）：'),
            h('el-input', {
              attrs: {
                type: 'textarea',
                rows: 2,
                placeholder: '请输入审批备注（可选）',
                maxlength: 500,
                'show-word-limit': true
              },
              model: {
                value: formData.notes,
                callback: (val) => { formData.notes = val }
              }
            })
          ]),
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          beforeClose: (action, instance, done) => {
            if (action === 'confirm') {
              // 验证拒绝理由不能为空
              if (!formData.reason || formData.reason.trim().length === 0) {
                this.$message.error('拒绝理由不能为空')
                return
              }
              done()
            } else {
              done()
            }
          }
        }).catch(() => {
          // 用户取消，中断后续操作
          return Promise.reject(new Error('cancel'))
        })
        // 提取表单数据
        const reason = formData.reason
        const notes = formData.notes

        // 设置加载状态
        this.$set(row, 'rejecting', true)

        // 调用拒绝接口
        const response = await rejectApplication(row.id, { reason, notes })

        this.$message.success(response.message || '申请已拒绝')
        this.fetchList()
      } catch (error) {
        // 检查是否为用户取消操作
        if (error && error.message === 'cancel') {
          // 用户取消操作，不显示错误信息
          return
        }
        if (error !== 'close') {
          console.error('拒绝申请失败:', error)
          handleRegistrationError(error, {
            showMessage: true,
            defaultMessage: '拒绝申请失败'
          })
        }
      } finally {
        this.$set(row, 'rejecting', false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.pending-applications {
  padding: 20px;

  .search-form {
    margin-bottom: 20px;
  }
}

// 拒绝申请表单样式
.reject-form-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
}

// 覆盖Element UI对话框样式
:deep(.el-message-box__message) {
  padding: 10px 0;
}

:deep(.el-message-box) {
  width: 500px;
  max-width: 90%;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}
</style>
