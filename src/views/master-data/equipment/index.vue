/**
 * 设备主数据管理页面
 * 功能描述：管理系统中的设备信息，包括不同类型设备（退火炉、行车、自动料车、备料台等）的基础信息和特性参数
 * 创建日期：2023-11-05
 */
<template>
  <div class="app-container">
    

    <!-- 设备类型导航 - Segmented Control -->
    <div class="equipment-type-navigation">
      <div 
        v-for="type in equipmentTypes" 
        :key="type.value"
        :class="['equipment-type-item', currentEquipmentType === type.value ? 'active' : '']"
        @click="handleEquipmentTypeChange(type.value)"
      >
        {{ type.label }} ({{ type.count || 0 }})
      </div>
    </div>

    <!-- 当前设备类型标题 -->
    <div class="current-type-title">
      {{ getCurrentTypeLabel() }}设备列表
    </div>

    <!-- 搜索表单 -->
    <search-form 
      :init-query="listQuery" 
      :equipment-type="currentEquipmentType"
      @search="handleSearch" 
      @reset="handleReset"
    />

    <!-- 表格组件 -->
    <equipment-table 
      ref="equipmentTable"
      :data="list" 
      :total="total" 
      :loading="listLoading" 
      :page="listQuery.page" 
      :limit="listQuery.limit" 
      :equipment-type="currentEquipmentType"
      @selection-change="handleSelectionChange" 
      @size-change="handleSizeChange" 
      @current-change="handleCurrentChange" 
      @update="handleUpdate" 
      @view="handleView"
      @status-change="handleStatusChange"
    >
      <!-- 工具栏左侧按钮 -->
      <template #toolbar-left>
        <div>
          <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleCreate"
        >
          新增{{ getCurrentTypeLabel() }}
        </el-button>
        
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
        
        <el-dropdown
          @command="handleBatchStatus"
          :disabled="selectedRows.length === 0"
        >
          <el-button
            type="info"
            size="mini"
            :disabled="selectedRows.length === 0"
          >
            批量操作<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item 
              command="enable"
              :disabled="!hasDisabledItems"
            >
              批量启用
            </el-dropdown-item>
            <el-dropdown-item 
              command="disable"
              :disabled="!hasEnabledItems"
            >
              批量禁用
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        </div>
        
      </template>
    </equipment-table>

    <!-- 表单抽屉 -->
    <equipment-form-drawer
      ref="formDrawer"
      :visible.sync="drawerVisible"
      :type="drawerType"
      :equipment-type="currentEquipmentType"
      :equipment-data="currentEquipment"
      @submit="handleFormSubmit"
      @close="handleDrawerClose"
    />
  </div>
</template>

<script>
// 导入API函数
import {
  getEquipmentList,
  getEquipmentDetail,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  batchDeleteEquipment,
  batchUpdateEquipmentStatus
} from '@/api/master-data/equipment'

// 引入子组件
import SearchForm from './components/SearchForm'
import EquipmentTable from './components/EquipmentTable'
import EquipmentFormDrawer from './components/EquipmentFormDrawer'

// 引入工具函数
import { scrollTo } from '@/utils/scroll-to'

export default {
  name: 'EquipmentMasterData',
  components: {
    SearchForm,
    EquipmentTable,
    EquipmentFormDrawer
  },
  data() {
    return {
      // 设备类型列表
      equipmentTypes: [
        { value: 'FURNACE', label: '退火炉', count: 12 },
        { value: 'CRANE', label: '行车', count: 5 },
        { value: 'AUTO_CART', label: '自动料车', count: 8 },
        { value: 'STAGING_TABLE', label: '备料台', count: 3 }
      ],
      // 当前设备类型
      currentEquipmentType: 'FURNACE',
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
        equipmentType: 'FURNACE',
        keyword: undefined,
        status: undefined
      },
      // 选中行
      selectedRows: [],
      // 抽屉可见性
      drawerVisible: false,
      // 抽屉类型: create, update, view
      drawerType: 'create',
      // 当前操作的设备数据
      currentEquipment: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取当前设备类型显示名称
    getCurrentTypeLabel() {
      const type = this.equipmentTypes.find(t => t.value === this.currentEquipmentType)
      return type ? type.label : ''
    },
    
    // 切换设备类型
    handleEquipmentTypeChange(type) {
      this.currentEquipmentType = type
      this.listQuery = {
        ...this.listQuery,
        equipmentType: type,
        page: 1
      }
      this.getList()
    },
    
    // 获取设备列表
    getList() {
      this.listLoading = true
      getEquipmentList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        
        // 更新设备数量
        const countMap = response.data.countByType || {}
        this.equipmentTypes.forEach(type => {
          type.count = countMap[type.value] || 0
        })
        
        this.listLoading = false
        // 滚动到顶部
        scrollTo(0, 500)
      }).catch(() => {
        this.listLoading = false
      })
    },
    
    // 搜索
    handleSearch(params) {
      this.listQuery = {
        ...this.listQuery,
        page: 1,
        ...params
      }
      this.getList()
    },
    
    // 重置搜索
    handleReset(params) {
      this.listQuery = {
        ...this.listQuery,
        page: 1,
        ...params
      }
      this.getList()
    },
    
    // 选择行变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },
    
    // 每页条数变化
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    
    // 页码变化
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    
    // 新增设备
    handleCreate() {
      this.drawerType = 'create'
      this.currentEquipment = null
      this.drawerVisible = true
    },
    
    // 编辑设备
    handleUpdate(row) {
      this.drawerType = 'update'
      this.getEquipmentDetail(row.id)
    },
    
    // 查看设备
    handleView(row) {
      this.drawerType = 'view'
      this.getEquipmentDetail(row.id)
    },
    
    // 获取设备详情
    getEquipmentDetail(id) {
      this.listLoading = true
      getEquipmentDetail(id).then(response => {
        this.currentEquipment = response.data
        this.drawerVisible = true
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },
    
    // 表单提交
    handleFormSubmit(formData, continueCreate) {
      // 设置设备类型
      formData.equipmentType = this.currentEquipmentType
      
      console.log('提交表单数据:', formData)
      
      if (this.drawerType === 'create') {
        // 新增
        createEquipment(formData).then(response => {
          this.$message.success('新增设备成功')
          
          if (continueCreate) {
            // 保存并继续
            this.currentEquipment = null
            this.$refs.formDrawer.resetForm()
          } else {
            // 关闭抽屉
            this.drawerVisible = false
          }
          
          // 强制重新获取列表
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error('新增设备错误:', error)
          this.$message.error(`新增失败: ${error.message || '未知错误'}`)
        })
      } else if (this.drawerType === 'update') {
        // 更新
        updateEquipment(formData).then(response => {
          this.$message.success('更新设备成功')
          this.drawerVisible = false
          
          // 强制重新获取列表
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error('更新设备错误:', error)
          this.$message.error(`更新失败: ${error.message || '未知错误'}`)
        })
      }
    },
    
    // 抽屉关闭
    handleDrawerClose() {
      this.currentEquipment = null
    },
    
    // 切换设备状态
    handleStatusChange(row) {
      const newStatus = row.status === 1 ? 0 : 1
      const statusText = newStatus === 1 ? '启用' : '禁用'
      
      this.$confirm(`确认${statusText}该设备吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        updateEquipmentStatus(row.id, newStatus).then(() => {
          this.$message.success(`${statusText}成功`)
          row.status = newStatus
        }).catch(error => {
          this.$message.error(`操作失败: ${error.message || '未知错误'}`)
        })
      }).catch(() => {
        // 取消操作
      })
    },
    
    // 批量删除
    handleBatchDelete() {
      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请至少选择一条记录')
        return
      }
      
      this.$confirm('确认批量删除选中的设备记录吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        
        // 获取选中行的ID列表
        const ids = this.selectedRows.map(row => row.id)
        console.log('批量删除设备IDs:', ids)
        
        batchDeleteEquipment(ids).then(response => {
          this.$message.success(response.data.message || '批量删除成功')
          this.selectedRows = []
          
          // 延迟执行，确保后端处理完成
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error('批量删除错误:', error)
          this.$message.error(`批量删除失败: ${error.message || '未知错误'}`)
          this.listLoading = false
        })
      }).catch(() => {
        // 取消操作
        this.$message.info('已取消删除操作')
      })
    },
    
    // 批量更改状态
    handleBatchStatus(command) {
      if (!this.selectedRows || this.selectedRows.length === 0) return
      
      // 只选择需要操作的行
      const targetStatus = command === 'enable' ? 1 : 0;
      const targetRows = this.selectedRows.filter(row => row.status !== targetStatus);
      
      if (targetRows.length === 0) {
        this.$message.info(`所选记录已全部${command === 'enable' ? '启用' : '禁用'}，无需操作`);
        return;
      }
      
      const statusText = command === 'enable' ? '启用' : '禁用'
      
      this.$confirm(`确认批量${statusText}选中的设备记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        batchUpdateEquipmentStatus({
          ids: targetRows.map(row => row.id),
          status: targetStatus
        }).then(response => {
          this.$message.success(
            `批量${statusText}成功：${targetRows.length}条记录已${statusText}`
          )
          // 延迟执行，确保后端处理完成
          setTimeout(() => {
            this.getList()
          }, 300)
        }).catch(error => {
          console.error(`批量${statusText}错误:`, error)
          this.$message.error(`批量${statusText}失败: ${error.message || '未知错误'}`)
          this.listLoading = false
        })
      }).catch(() => {
        // 取消操作
        this.$message.info('操作已取消')
      })
    }
  },
  computed: {
    // 是否有禁用的设备（用于批量启用按钮）
    hasDisabledItems() {
      return this.selectedRows && this.selectedRows.length > 0 && 
             this.selectedRows.some(row => row.status === 0);
    },
    
    // 是否有启用的设备（用于批量禁用按钮）
    hasEnabledItems() {
      return this.selectedRows && this.selectedRows.length > 0 && 
             this.selectedRows.some(row => row.status === 1);
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 20px;
  
  .page-title {
    font-size: 20px;
    margin: 0 0 5px 0;
    color: #303133;
  }
  
  .page-description {
    font-size: 14px;
    color: #606266;
    margin: 0;
  }
}

.equipment-type-navigation {
  display: flex;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 8px;
  
  .equipment-type-item {
    padding: 8px 16px;
    border-radius: 20px;
    margin-right: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: #e6e8eb;
    }
    
    &.active {
      background-color: #409EFF;
      color: white;
      font-weight: 500;
    }
  }
}

.current-type-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  padding-left: 5px;
  border-left: 3px solid #409EFF;
}
</style> 