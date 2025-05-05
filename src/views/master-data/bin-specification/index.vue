<template>
  <div class="app-container">
    <!-- 搜索条件 -->
    <el-form ref="searchForm" :model="listQuery" :inline="true" class="search-form">
      <el-form-item label="规格代码" prop="code">
        <el-input v-model="listQuery.code" placeholder="请输入规格代码" clearable @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item label="规格名称" prop="name">
        <el-input v-model="listQuery.name" placeholder="请输入规格名称" clearable @keyup.enter.native="handleSearch" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="listQuery.status" placeholder="请选择状态" clearable>
          <el-option label="启用" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">新增料框规格</el-button>
    </div>

    <!-- 表格数据 -->
    <el-card shadow="hover" class="table-card">
      <el-table
        v-loading="listLoading"
        :data="list"
        element-loading-text="加载中..."
        border
        fit
        highlight-current-row
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="code" label="规格代码" width="120" align="center" />
        <el-table-column prop="name" label="规格名称" width="150" />
        <el-table-column label="尺寸(cm)" width="180">
          <template slot-scope="{row}">
            {{ row.length }} × {{ row.width }} × {{ row.height }}
          </template>
        </el-table-column>
        <el-table-column prop="maxWeight" label="最大载重(kg)" width="120" align="center" />
        <el-table-column prop="material" label="材质" width="120" />
        <el-table-column prop="maxStackLayers" label="最大堆叠层数" width="120" align="center" />
        <el-table-column label="适用产品类型" min-width="200">
          <template slot-scope="{row}">
            <el-tag
              v-for="product in row.applicableProducts"
              :key="product.id"
              size="small"
              effect="plain"
              style="margin-right: 8px; margin-bottom: 5px; border-radius: 4px;"
            >
              {{ product.name }}
            </el-tag>
            <span v-if="!row.applicableProducts || row.applicableProducts.length === 0" class="text-muted">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="supplier" label="供应商" width="150" />
        <el-table-column label="状态" width="80" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="dark" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="{row}">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              size="mini"
              :icon="row.status === 1 ? 'el-icon-close' : 'el-icon-check'"
              @click="handleStatusChange(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          :current-page="listQuery.page"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑/新增对话框 -->
    <el-dialog
      :title="dialogType === 'create' ? '新增料框规格' : '编辑料框规格'"
      :visible.sync="dialogVisible"
      :width="dialogWidth"
      :close-on-click-modal="false"
      @closed="$refs.dataForm && $refs.dataForm.clearValidate()"
    >
      <el-form
        ref="dataForm"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="right"
        class="form-container"
      >
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="规格代码" prop="code">
              <el-input v-model="formData.code" placeholder="请输入规格代码" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="规格名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入规格名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">尺寸信息</el-divider>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="8">
            <el-form-item label="长度(cm)" prop="length">
              <el-input-number v-model="formData.length" :min="1" :max="1000" :precision="2" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="宽度(cm)" prop="width">
              <el-input-number v-model="formData.width" :min="1" :max="1000" :precision="2" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-form-item label="高度(cm)" prop="height">
              <el-input-number v-model="formData.height" :min="1" :max="1000" :precision="2" :step="10" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">物理特性</el-divider>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="最大载重(kg)" prop="maxWeight">
              <el-input-number v-model="formData.maxWeight" :min="1" :max="10000" :step="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="材质" prop="material">
              <el-select v-model="formData.material" placeholder="请选择材质" style="width: 100%">
                <el-option label="铝合金" value="铝合金" />
                <el-option label="不锈钢" value="不锈钢" />
                <el-option label="碳钢" value="碳钢" />
                <el-option label="镀锌钢" value="镀锌钢" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item label="最大堆叠层数" prop="maxStackLayers">
              <el-input-number v-model="formData.maxStackLayers" :min="1" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="供应商" prop="supplier">
              <el-input v-model="formData.supplier" placeholder="请输入供应商信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">适用范围</el-divider>

        <el-form-item label="适用产品类型" prop="applicableProducts">
          <el-select
            v-model="formData.applicableProducts"
            multiple
            filterable
            value-key="id"
            placeholder="请选择适用产品类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getBinSpecList,
  createBinSpec,
  updateBinSpec,
  changeBinSpecStatus,
  getProductTypeList
} from '@/api/bin-specification'

export default {
  name: 'BinSpecification',
  data() {
    return {
      list: [], // 列表数据
      total: 0, // 总记录数
      listLoading: false, // 列表加载状态
      listQuery: { // 列表查询参数
        page: 1,
        limit: 10,
        code: undefined,
        name: undefined,
        status: undefined
      },
      dialogVisible: false, // 对话框可见性
      dialogType: 'create', // 对话框类型：create-新增，update-编辑
      formData: { // 表单数据
        id: undefined,
        code: '',
        name: '',
        length: 100,
        width: 80,
        height: 80,
        maxWeight: 1000,
        material: '铝合金',
        maxStackLayers: 3,
        applicableProducts: [],
        supplier: '',
        status: 1
      },
      rules: { // 表单验证规则
        code: [
          { required: true, message: '请输入规格代码', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入规格名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        length: [
          { required: true, message: '请输入长度', trigger: 'blur' },
          { type: 'number', message: '长度必须为数字', trigger: 'blur' }
        ],
        width: [
          { required: true, message: '请输入宽度', trigger: 'blur' },
          { type: 'number', message: '宽度必须为数字', trigger: 'blur' }
        ],
        height: [
          { required: true, message: '请输入高度', trigger: 'blur' },
          { type: 'number', message: '高度必须为数字', trigger: 'blur' }
        ],
        maxWeight: [
          { required: true, message: '请输入最大载重', trigger: 'blur' },
          { type: 'number', message: '最大载重必须为数字', trigger: 'blur' }
        ],
        material: [
          { required: true, message: '请选择材质', trigger: 'change' }
        ],
        maxStackLayers: [
          { required: true, message: '请输入最大堆叠层数', trigger: 'blur' },
          { type: 'number', message: '最大堆叠层数必须为数字', trigger: 'blur' }
        ],
        supplier: [
          { required: true, message: '请输入供应商信息', trigger: 'blur' }
        ]
      },
      productOptions: [] // 产品类型选项
    }
  },
  computed: {
    // 根据窗口宽度计算对话框宽度
    dialogWidth() {
      return window.innerWidth < 768 ? '90%' : (window.innerWidth < 992 ? '70%' : '50%')
    }
  },
  created() {
    this.getList()
    this.getProductOptions()
    // 添加窗口大小改变的监听
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    // 移除窗口大小改变的监听
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // 获取列表数据
    getList() {
      this.listLoading = true
      getBinSpecList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
      })
    },

    // 获取产品类型选项
    getProductOptions() {
      getProductTypeList().then(response => {
        this.productOptions = response.data.items
      })
    },

    // 搜索
    handleSearch() {
      this.listQuery.page = 1
      this.getList()
    },

    // 重置搜索
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.listQuery = {
        page: 1,
        limit: 10,
        code: undefined,
        name: undefined,
        status: undefined
      }
      this.getList()
    },

    // 每页显示条数变化
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
    handleCreate() {
      this.dialogType = 'create'
      this.resetFormData()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },

    // 编辑
    handleUpdate(row) {
      this.dialogType = 'update'
      this.resetFormData()

      // 深拷贝行数据，避免直接修改原始数据
      const rowData = JSON.parse(JSON.stringify(row))

      // 确保适用产品类型是对象数组形式
      if (rowData.applicableProducts && Array.isArray(rowData.applicableProducts)) {
        // 确保每个产品对象都有id属性作为唯一标识
        rowData.applicableProducts = rowData.applicableProducts.map(product => {
          return {
            id: product.id,
            name: product.name
          }
        })
      }

      this.formData = Object.assign({}, this.formData, rowData)
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.dataForm.clearValidate()
      })
    },

    // 提交表单
    submitForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          if (this.dialogType === 'create') {
            // 新增
            createBinSpec(this.formData).then(() => {
              this.$message.success('新增成功')
              this.dialogVisible = false
              this.getList()
            })
          } else {
            // 更新
            updateBinSpec(this.formData).then(() => {
              this.$message.success('更新成功')
              this.dialogVisible = false
              this.getList()
            })
          }
        }
      })
    },

    // 状态变更
    handleStatusChange(row) {
      const status = row.status === 1 ? 0 : 1
      const statusText = status === 1 ? '启用' : '禁用'

      this.$confirm(`确认要${statusText}该料框规格吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        changeBinSpecStatus(row.id, status).then(() => {
          this.$message.success(`${statusText}成功`)
          this.getList()
        })
      }).catch(() => {})
    },

    // 重置表单数据
    resetFormData() {
      this.formData = {
        id: undefined,
        code: '',
        name: '',
        length: 100,
        width: 80,
        height: 80,
        maxWeight: 1000,
        material: '铝合金',
        maxStackLayers: 3,
        applicableProducts: [],
        supplier: '',
        status: 1
      }
    },

    // 处理窗口大小改变
    handleResize() {
      // 在这里可以添加窗口大小改变时的逻辑
      this.$nextTick(() => {
        // 强制更新组件以应用新的计算属性值
        this.$forceUpdate()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;

  .search-form {
    margin-bottom: 24px;
    background-color: #f5f7fa;
    padding: 16px 16px 0;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .action-bar {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-start;
  }

  .table-card {
    margin-bottom: 24px;
    border-radius: 8px;
  }

  .pagination-container {
    margin-top: 24px;
    text-align: right;
  }

  .text-muted {
    color: #909399;
    font-style: italic;
  }

  .form-container {
    padding: 8px 16px;
  }

  .el-divider__text {
    font-size: 14px;
    font-weight: bold;
    color: #606266;
  }

  ::v-deep .el-table {
    border-radius: 4px;
    overflow: hidden;
  }

  ::v-deep .el-input-number {
    width: 100%;

    .el-input__inner {
      text-align: center;
      padding-left: 38px;
      padding-right: 38px;
    }

    .el-input-number__decrease,
    .el-input-number__increase {
      width: 32px;
      height: 100%;
      top: 0;
      background-color: #f5f7fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .el-input-number__decrease {
      left: 1px;
      border-right: 1px solid #dcdfe6;
    }

    .el-input-number__increase {
      right: 1px;
      border-left: 1px solid #dcdfe6;
    }
  }
}
</style>
