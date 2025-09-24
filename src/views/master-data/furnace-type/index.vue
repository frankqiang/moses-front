/**
* 炉型管理页面
* 功能描述：管理系统中的炉型定义，包括炉型基础信息和能力参数配置
* 创建日期：2024-11-16
*/
<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-title">
      炉型管理
    </div>

    <!-- 搜索表单 -->
    <search-form
      ref="searchForm"
      :init-query="listQuery"
      :loading="listLoading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格组件 -->
    <furnace-type-table
      ref="furnaceTypeTable"
      :data="list"
      :total="total"
      :loading="listLoading"
      :page="listQuery.page"
      :limit="listQuery.limit"
      :import-api="'/mes/master-data/furnace-type/import'"
      :template-api="'/mes/master-data/furnace-type/download-template'"
      :export-api="'/mes/master-data/furnace-type/export'"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @update="handleUpdate"
      @view="handleView"
      @delete="handleDelete"
      @add="handleAdd"
      @enable="handleEnable"
      @disable="handleDisable"
      @refresh="getList"
      @batch-delete="handleBatchDelete"
      @batch-enable="handleBatchEnable"
      @batch-disable="handleBatchDisable"
      @import-success="handleImportSuccess"
      @export-success="handleExportSuccess"
    />

    <!-- 表单抽屉 -->
    <furnace-type-form-drawer
      ref="formDrawer"
      :visible.sync="drawerVisible"
      :type="drawerType"
      :furnace-type-data="currentFurnaceType"
      @submit="handleFormSubmit"
      @close="handleDrawerClose"
    />
  </div>
</template>

<script>
// 导入API函数
import {
  getFurnaceTypeList,
  createFurnaceType,
  updateFurnaceType,
  deleteFurnaceType,
  batchDeleteFurnaceType,
  batchChangeFurnaceTypeStatus,
  changeFurnaceTypeStatus
} from '@/api/master-data/furnace-type'

// 引入子组件
import SearchForm from './components/SearchForm'
import FurnaceTypeTable from './components/FurnaceTypeTable'
import FurnaceTypeFormDrawer from './components/FurnaceTypeFormDrawer'

export default {
  name: 'FurnaceTypeManagement',
  components: {
    SearchForm,
    FurnaceTypeTable,
    FurnaceTypeFormDrawer
  },
  data() {
    return {
      // 列表数据
      list: [],
      // 总记录数
      total: 0,
      // 列表加载状态
      listLoading: false,
      // 查询参数
      listQuery: {
        page: 1,
        limit: 10,
        keyword: undefined,
        status: undefined
      },
      // 选中行
      selectedRows: [],
      // 抽屉可见性
      drawerVisible: false,
      // 抽屉类型: create, update, view
      drawerType: 'create',
      // 当前操作的炉型数据
      currentFurnaceType: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      getFurnaceTypeList(this.listQuery).then(response => {
        if (response.code === 20000) {
          this.list = response.data.items.map(item => {
            // 确保关联数据是数组
            return {
              ...item,
              supportedAtmosphereTypes: Array.isArray(item.supportedAtmosphereTypes) ? item.supportedAtmosphereTypes : [],
              relatedEquipment: Array.isArray(item.relatedEquipment) ? item.relatedEquipment : [],
              relatedTemplates: Array.isArray(item.relatedTemplates) ? item.relatedTemplates : []
            }
          })
          this.total = response.data.total
        } else {
          this.$message.error(response.message || '获取列表失败')
        }
      }).catch(error => {
        console.error('获取列表失败:', error)
        this.$message.error('获取列表失败')
      }).finally(() => {
        this.listLoading = false
      })
    },

    // 搜索
    handleSearch(formData) {
      this.listQuery = {
        ...this.listQuery,
        page: 1,
        keyword: formData.keyword || undefined,
        status: formData.status || undefined
      }
      console.log('搜索参数:', this.listQuery)
      this.getList()
    },

    // 重置
    handleReset() {
      this.listQuery = {
        page: 1,
        limit: 10
      }
      this.getList()
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 每页条数变化
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },

    // 新增
    handleAdd() {
      this.drawerType = 'create'
      this.currentFurnaceType = null
      this.$refs.formDrawer.open('create')
    },

    // 编辑
    handleUpdate(row) {
      this.drawerType = 'update'
      this.currentFurnaceType = { ...row }
      this.$refs.formDrawer.open('update', row)
    },

    // 查看
    handleView(row) {
      this.drawerType = 'view'
      this.currentFurnaceType = { ...row }
      this.$refs.formDrawer.open('view', row)
    },

    // 删除
    handleDelete(row) {
      deleteFurnaceType(row.furnaceTypeCode).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getList()
      }).catch((error) => {
        // 处理业务错误
        if (error && error.code) {
          this.$message({
            type: 'error',
            message: error.message || '删除失败'
          })
        }
      })
    },

    // 启用
    handleEnable(row) {
      changeFurnaceTypeStatus(row.furnaceTypeCode, 'enabled').then(() => {
        this.$message({
          type: 'success',
          message: '启用成功!'
        })
        this.getList()
      }).catch((error) => {
        // 处理业务错误
        if (error && error.code) {
          this.$message({
            type: 'error',
            message: error.message || '启用失败'
          })
        }
      })
    },

    // 禁用
    handleDisable(row) {
      changeFurnaceTypeStatus(row.furnaceTypeCode, 'disabled').then(() => {
        this.$message({
          type: 'success',
          message: '禁用成功!'
        })
        this.getList()
      }).catch((error) => {
        // 处理业务错误
        if (error && error.code) {
          this.$message({
            type: 'error',
            message: error.message || '禁用失败'
          })
        }
      })
    },

    // 表单提交
    handleFormSubmit(formData, continueAdd = false) {
      if (this.drawerType === 'create') {
        // 创建
        createFurnaceType({
          furnaceTypeCode: formData.furnaceTypeCode,
          furnaceTypeName: formData.furnaceTypeName,
          status: formData.status,
          description: formData.description,
          maxSegments: formData.maxSegments,
          hasRearCirculationFan: formData.hasRearCirculationFan,
          hasVacuumFan: formData.hasVacuumFan,
          hasPurgeValve: formData.hasPurgeValve,
          hasCoolingFan: formData.hasCoolingFan,
          supportedAtmosphereTypes: formData.supportedAtmosphereTypes,
          maxTemperatureLimit: formData.maxTemperatureLimit,
          hasPressureControl: formData.hasPressureControl
        }).then(response => {
          this.$message({
            type: 'success',
            message: '创建成功!'
          })

          // 调用子组件的成功处理方法
          this.$refs.formDrawer.handleSubmitSuccess(continueAdd)

          // 刷新列表
          this.getList()
        }).catch(error => {
          // 处理业务错误
          if (error && error.code) {
            this.$message({
              type: 'error',
              message: error.message || '创建失败'
            })
          }
        })
      } else if (this.drawerType === 'update') {
        // 更新
        updateFurnaceType({
          id: formData.furnaceTypeCode, // 使用furnaceTypeCode作为id
          furnaceTypeCode: formData.furnaceTypeCode,
          furnaceTypeName: formData.furnaceTypeName,
          status: formData.status,
          description: formData.description,
          maxSegments: formData.maxSegments,
          hasRearCirculationFan: formData.hasRearCirculationFan,
          hasVacuumFan: formData.hasVacuumFan,
          hasPurgeValve: formData.hasPurgeValve,
          hasCoolingFan: formData.hasCoolingFan,
          supportedAtmosphereTypes: formData.supportedAtmosphereTypes,
          maxTemperatureLimit: formData.maxTemperatureLimit,
          hasPressureControl: formData.hasPressureControl
        }).then(response => {
          this.$message({
            type: 'success',
            message: '更新成功!'
          })
          // 调用子组件的成功处理方法（更新不支持继续编辑）
          this.$refs.formDrawer.handleSubmitSuccess(false)
          this.getList()
        }).catch(error => {
          // 处理业务错误
          if (error && error.code) {
            this.$message({
              type: 'error',
              message: error.message || '更新失败'
            })
          }
        })
      }
    },

    // 抽屉关闭
    handleDrawerClose() {
      this.drawerVisible = false
      this.currentFurnaceType = null
    },

    // 批量删除
    handleBatchDelete(rows) {
      const ids = rows.map(row => row.furnaceTypeCode)
      batchDeleteFurnaceType(ids).then(response => {
        this.$message({
          type: 'success',
          message: `成功删除 ${response.data.count || ids.length} 条记录!`
        })
        this.getList()
      }).catch((error) => {
        // 处理业务错误，直接使用后端返回的错误信息
        if (error && error.code) {
          this.$message({
            type: 'error',
            message: error.message || '批量删除失败'
          })
        }
      })
    },

    // 批量启用
    handleBatchEnable(rows) {
      const ids = rows.map(row => row.furnaceTypeCode)
      batchChangeFurnaceTypeStatus(ids, 'enabled').then(response => {
        this.$message({
          type: 'success',
          message: `成功启用 ${response.data.count || ids.length} 条记录!`
        })
        this.getList()
      }).catch((error) => {
        // 处理业务错误
        if (error && error.code) {
          this.$message({
            type: 'error',
            message: error.message || '批量启用失败'
          })
        }
      })
    },

    // 批量禁用
    handleBatchDisable(rows) {
      const ids = rows.map(row => row.furnaceTypeCode)
      batchChangeFurnaceTypeStatus(ids, 'disabled').then(response => {
        this.$message({
          type: 'success',
          message: `成功禁用 ${response.data.count || ids.length} 条记录!`
        })
        this.getList()
      }).catch((error) => {
        // 处理业务错误
        if (error && error.code) {
          this.$message({
            type: 'error',
            message: error.message || '批量禁用失败'
          })
        }
      })
    },

    // 导入成功
    handleImportSuccess(response) {
      this.$message({
        type: 'success',
        message: `导入成功! 成功: ${response.data.success}, 失败: ${response.data.failed}`
      })
      this.getList()
    },

    // 导出成功
    handleExportSuccess() {
      this.$message({
        type: 'success',
        message: '导出成功!'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}
</style>
