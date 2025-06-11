/**
 * BaseTable 使用示例 (包含新优化功能)
 * 功能描述：演示BaseTable组件的各种功能和配置方式，包括虚拟滚动、错误处理等
 * 创建日期：2024-12-18
 * 更新日期：2024-12-19
 */
<template>
  <div class="base-table-example">
    <div class="example-section">
      <h3>基础表格示例</h3>
      <base-table
        :data="basicTableData"
        :columns="basicColumns"
        :loading="basicLoading"
        border
        stripe
      />
    </div>

    <div class="example-section">
      <h3>带分页的表格示例 (防抖优化)</h3>
      <base-table
        :data="paginationTableData"
        :columns="paginationColumns"
        :loading="paginationLoading"
        :pagination="pagination"
        @pagination-change="handlePaginationChange"
        border
      />
      <p class="demo-tip">💡 快速点击分页按钮测试防抖效果，只有最后一次点击会生效</p>
    </div>

    <div class="example-section">
      <h3>虚拟滚动表格示例 (大数据量)</h3>
      <div class="demo-controls">
        <el-button @click="generateLargeData(1000)" type="primary" size="small">生成1000条数据</el-button>
        <el-button @click="generateLargeData(5000)" type="success" size="small">生成5000条数据</el-button>
        <el-button @click="generateLargeData(10000)" type="warning" size="small">生成10000条数据</el-button>
        <el-button @click="clearLargeData" size="small">清空数据</el-button>
      </div>
      <base-table
        :data="largeTableData"
        :columns="largeDataColumns"
        :loading="largeDataLoading"
        :virtual-scroll="true"
        :virtual-threshold="100"
        :virtual-height="400"
        :item-height="48"
        :show-index="true"
        border
      />
      <p class="demo-tip">💡 虚拟滚动：当数据量超过100条时自动启用，只渲染可见行，提升性能</p>
    </div>

    <div class="example-section">
      <h3>错误处理和数据异常示例</h3>
      <div class="demo-controls">
        <el-button @click="setNormalData" type="success" size="small">正常数据</el-button>
        <el-button @click="setErrorData" type="danger" size="small">异常数据</el-button>
        <el-button @click="setLoadError" type="warning" size="small">加载失败</el-button>
        <el-button @click="clearLoadError" size="small">清除错误</el-button>
      </div>
      <base-table
        :data="errorTableData"
        :columns="errorTestColumns"
        :loading="errorTableLoading"
        :load-error="loadError"
        :allow-retry="true"
        @retry="handleRetry"
        @data-error="handleDataError"
        @format-error="handleFormatError"
        border
      />
      <p class="demo-tip">💡 包含错误捕获、数据异常处理、加载失败重试等功能</p>
    </div>

    <div class="example-section">
      <h3>带状态和时间列的表格示例 (错误保护)</h3>
      <base-table
        :data="statusTableData"
        :columns="statusColumns"
        :loading="statusLoading"
        border
      />
    </div>

    <div class="example-section">
      <h3>带多选和操作列的表格示例</h3>
      <base-table
        :data="selectionTableData"
        :columns="selectionColumns"
        :loading="selectionLoading"
        :show-selection="true"
        :show-index="true"
        @selection-change="handleSelectionChange"
        border
      >
        <!-- 操作列 -->
        <template v-slot:actions>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template v-slot="{ row }">
              <el-button type="primary" size="mini" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="mini" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </template>
      </base-table>
      
      <div v-if="selectedRows.length > 0" class="selection-info">
        <p>已选中 {{ selectedRows.length }} 行：</p>
        <el-tag v-for="row in selectedRows" :key="row.id" style="margin-right: 8px;">
          {{ row.name }}
        </el-tag>
      </div>
    </div>

    <div class="example-section">
      <h3>带自定义插槽的表格示例</h3>
      <base-table
        :data="customTableData"
        :columns="customColumns"
        :loading="customLoading"
        border
      >
        <!-- 自定义头像列 -->
        <template v-slot:avatar="{ row }">
          <el-avatar :src="row.avatar" size="small">
            {{ row.name.charAt(0) }}
          </el-avatar>
        </template>
        
        <!-- 自定义标签列 -->
        <template v-slot:tags="{ row }">
          <el-tag
            v-for="tag in row.tags"
            :key="tag"
            size="small"
            style="margin-right: 4px;"
          >
            {{ tag }}
          </el-tag>
        </template>
        
        <!-- 自定义操作列 -->
        <template v-slot:operation="{ row }">
          <el-dropdown>
            <span class="el-dropdown-link">
              操作<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleEdit(row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handleView(row)">查看</el-dropdown-item>
              <el-dropdown-item divided @click.native="handleDelete(row)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </base-table>
    </div>

    <div class="example-section">
      <h3>空状态示例</h3>
      <base-table
        :data="[]"
        :columns="basicColumns"
        :loading="false"
        border
      >
        <template v-slot:empty>
          <div class="custom-empty">
            <i class="el-icon-box" style="font-size: 48px; color: #c0c4cc;"></i>
            <p>暂无数据，请<el-button type="text" @click="loadData">点击加载</el-button></p>
          </div>
        </template>
      </base-table>
    </div>

    <!-- 错误日志显示 -->
    <div v-if="errorLogs.length > 0" class="error-logs">
      <h4>错误日志：</h4>
      <el-card v-for="(log, index) in errorLogs" :key="index" class="error-log-item">
        <div class="log-time">{{ log.time }}</div>
        <div class="log-type">类型: {{ log.type }}</div>
        <div class="log-message">{{ log.message }}</div>
        <div v-if="log.data" class="log-data">数据: {{ JSON.stringify(log.data) }}</div>
      </el-card>
      <el-button @click="clearErrorLogs" size="small" type="danger">清空日志</el-button>
    </div>
  </div>
</template>

<script>
import BaseTable from './index.vue'

export default {
  name: 'BaseTableExample',
  components: {
    BaseTable
  },
  data() {
    return {
      // 基础表格数据
      basicLoading: false,
      basicTableData: [
        { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', department: '技术部' },
        { id: 2, name: '李四', age: 30, email: 'lisi@example.com', department: '产品部' },
        { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', department: '设计部' }
      ],
      basicColumns: [
        { prop: 'name', label: '姓名', width: '100' },
        { prop: 'age', label: '年龄', width: '80', align: 'center' },
        { prop: 'email', label: '邮箱', minWidth: '180' },
        { prop: 'department', label: '部门', width: '120' }
      ],

      // 分页表格数据
      paginationLoading: false,
      paginationTableData: [],
      paginationColumns: [
        { prop: 'name', label: '产品名称', width: '150' },
        { prop: 'code', label: '产品编码', width: '120' },
        { prop: 'price', label: '价格', width: '100', align: 'right', formatter: this.formatPrice },
        { prop: 'category', label: '类别', width: '120' }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },

      // 大数据量表格
      largeDataLoading: false,
      largeTableData: [],
      largeDataColumns: [
        { prop: 'name', label: '用户名', width: '120' },
        { prop: 'email', label: '邮箱', minWidth: '180' },
        { prop: 'phone', label: '电话', width: '120' },
        { prop: 'department', label: '部门', width: '120' },
        { prop: 'status', label: '状态', width: '80', type: 'status', textMap: { 1: '在职', 0: '离职' }, typeMap: { 1: 'success', 0: 'info' } }
      ],

      // 错误处理测试
      errorTableData: [],
      errorTableLoading: false,
      loadError: false,
      errorTestColumns: [
        { prop: 'name', label: '姓名', width: '120' },
        { prop: 'invalid_time', label: '时间', width: '160', type: 'datetime' },
        { prop: 'nested.value', label: '嵌套属性', width: '120' },
        { prop: 'status', label: '状态', width: '100', type: 'status', textMap: { 1: '正常', 0: '异常' }, typeMap: { 1: 'success', 0: 'danger' } }
      ],

      // 状态表格数据
      statusLoading: false,
      statusTableData: [
        { 
          id: 1, 
          name: '系统设置', 
          status: 1, 
          createTime: '2024-12-18 10:30:00',
          lastLogin: '2024-12-18 15:45:20'
        },
        { 
          id: 2, 
          name: '用户管理', 
          status: 0, 
          createTime: '2024-12-17 09:15:00',
          lastLogin: '2024-12-17 16:20:10'
        },
        { 
          id: 3, 
          name: '权限控制', 
          status: 1, 
          createTime: '2024-12-16 14:20:00',
          lastLogin: '2024-12-18 08:30:45'
        }
      ],
      statusColumns: [
        { prop: 'name', label: '模块名称', width: '150' },
        { 
          prop: 'status', 
          label: '状态',
          type: 'status',
          width: '100',
          textMap: { 1: '启用', 0: '禁用' },
          typeMap: { 1: 'success', 0: 'danger' }
        },
        { 
          prop: 'createTime', 
          label: '创建时间',
          type: 'datetime',
          width: '160',
          format: '{y}-{m}-{d} {h}:{i}'
        },
        { 
          prop: 'lastLogin', 
          label: '最后登录',
          type: 'datetime',
          width: '160'
        }
      ],

      // 多选表格数据
      selectionLoading: false,
      selectionTableData: [
        { id: 1, name: '文档1', type: 'PDF', size: '2.5MB', author: '张三' },
        { id: 2, name: '文档2', type: 'WORD', size: '1.8MB', author: '李四' },
        { id: 3, name: '文档3', type: 'EXCEL', size: '3.2MB', author: '王五' },
        { id: 4, name: '文档4', type: 'PPT', size: '5.1MB', author: '赵六' }
      ],
      selectionColumns: [
        { prop: 'name', label: '文档名称', minWidth: '150' },
        { prop: 'type', label: '类型', width: '100', align: 'center' },
        { prop: 'size', label: '大小', width: '100', align: 'center' },
        { prop: 'author', label: '作者', width: '100' }
      ],
      selectedRows: [],

      // 自定义插槽表格数据
      customLoading: false,
      customTableData: [
        { 
          id: 1, 
          name: '产品经理', 
          avatar: '', 
          level: 'P6',
          tags: ['产品', '策略', 'B端'],
          score: 95
        },
        { 
          id: 2, 
          name: '前端工程师', 
          avatar: '', 
          level: 'P5',
          tags: ['Vue', 'React', '前端'],
          score: 88
        },
        { 
          id: 3, 
          name: '后端工程师', 
          avatar: '', 
          level: 'P7',
          tags: ['Java', 'Spring', '微服务'],
          score: 92
        }
      ],
      customColumns: [
        { prop: 'avatar', label: '头像', slotName: 'avatar', width: '80', align: 'center' },
        { prop: 'name', label: '职位名称', width: '150' },
        { prop: 'level', label: '级别', width: '80', align: 'center' },
        { prop: 'tags', label: '技能标签', slotName: 'tags', minWidth: '200' },
        { prop: 'score', label: '评分', width: '80', align: 'center', formatter: this.formatScore },
        { label: '操作', slotName: 'operation', width: '120', align: 'center' }
      ],

      // 错误日志
      errorLogs: []
    }
  },
  created() {
    this.loadPaginationData()
  },
  methods: {
    // 加载分页数据
    async loadPaginationData() {
      this.paginationLoading = true
      
      // 模拟API请求
      setTimeout(() => {
        const allData = this.generatePaginationData()
        const start = (this.pagination.page - 1) * this.pagination.limit
        const end = start + this.pagination.limit
        
        this.paginationTableData = allData.slice(start, end)
        this.pagination.total = allData.length
        this.paginationLoading = false
      }, 500)
    },

    // 生成分页测试数据
    generatePaginationData() {
      const categories = ['电子产品', '服装', '食品', '图书', '家居']
      const data = []
      
      for (let i = 1; i <= 50; i++) {
        data.push({
          id: i,
          name: `产品 ${i}`,
          code: `PRD${String(i).padStart(3, '0')}`,
          price: Math.floor(Math.random() * 1000) + 10,
          category: categories[Math.floor(Math.random() * categories.length)]
        })
      }
      
      return data
    },

    // 生成大量数据
    generateLargeData(count) {
      this.largeDataLoading = true
      
      setTimeout(() => {
        const data = []
        const departments = ['技术部', '产品部', '设计部', '运营部', '市场部']
        
        for (let i = 1; i <= count; i++) {
          data.push({
            id: i,
            name: `用户${i}`,
            email: `user${i}@company.com`,
            phone: `1380013${String(i).padStart(4, '0')}`,
            department: departments[Math.floor(Math.random() * departments.length)],
            status: Math.random() > 0.3 ? 1 : 0
          })
        }
        
        this.largeTableData = data
        this.largeDataLoading = false
        this.$message.success(`已生成 ${count} 条数据`)
      }, 300)
    },

    // 清空大数据
    clearLargeData() {
      this.largeTableData = []
      this.$message.info('已清空数据')
    },

    // 设置正常数据
    setNormalData() {
      this.errorTableData = [
        { id: 1, name: '正常用户1', invalid_time: '2024-12-18 10:30:00', nested: { value: '嵌套值1' }, status: 1 },
        { id: 2, name: '正常用户2', invalid_time: '2024-12-17 09:15:00', nested: { value: '嵌套值2' }, status: 0 }
      ]
      this.loadError = false
      this.$message.success('已设置正常数据')
    },

    // 设置异常数据
    setErrorData() {
      this.errorTableData = [
        { id: 1, name: '用户1', invalid_time: 'invalid-date', nested: null, status: 1 },
        null, // 空数据
        { id: 3, name: '用户3', invalid_time: undefined, nested: { value: null }, status: 'invalid' },
        'invalid-row-data', // 非对象数据
        { id: 5, name: '用户5', invalid_time: 12345, nested: { value: '正常值' }, status: 0 }
      ]
      this.loadError = false
      this.$message.warning('已设置异常数据，查看错误处理效果')
    },

    // 设置加载错误
    setLoadError() {
      this.loadError = '网络连接失败，无法加载数据'
      this.errorTableData = []
      this.$message.error('模拟加载失败')
    },

    // 清除加载错误
    clearLoadError() {
      this.loadError = false
      this.setNormalData()
    },

    // 处理重试
    handleRetry() {
      this.$message.info('正在重试...')
      setTimeout(() => {
        this.setNormalData()
        this.$message.success('重试成功')
      }, 1000)
    },

    // 处理数据错误
    handleDataError(error) {
      this.errorLogs.push({
        time: new Date().toLocaleString(),
        type: '数据错误',
        message: error.message,
        data: error
      })
    },

    // 处理格式化错误
    handleFormatError(error) {
      this.errorLogs.push({
        time: new Date().toLocaleString(),
        type: '格式化错误',
        message: `${error.type}格式化失败: ${error.value}`,
        data: error
      })
    },

    // 清空错误日志
    clearErrorLogs() {
      this.errorLogs = []
    },

    // 处理分页变化
    handlePaginationChange() {
      console.log('分页变化 - 防抖后执行:', this.pagination)
      this.loadPaginationData()
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
      console.log('选中行：', selection)
    },

    // 格式化价格
    formatPrice(row, column, cellValue) {
      return `¥${cellValue.toFixed(2)}`
    },

    // 格式化评分
    formatScore(row, column, cellValue) {
      return `${cellValue}分`
    },

    // 处理编辑
    handleEdit(row) {
      this.$message.success(`编辑：${row.name}`)
      console.log('编辑行：', row)
    },

    // 处理查看
    handleView(row) {
      this.$message.info(`查看：${row.name}`)
      console.log('查看行：', row)
    },

    // 处理删除
    handleDelete(row) {
      this.$confirm(`确定要删除"${row.name}"吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
        console.log('删除行：', row)
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 加载数据
    loadData() {
      this.$message.success('数据加载完成')
    }
  }
}
</script>

<style lang="scss" scoped>
.base-table-example {
  padding: 20px;
  
  .example-section {
    margin-bottom: 40px;
    
    h3 {
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #409eff;
      color: #303133;
      font-size: 18px;
    }
  }
  
  .demo-controls {
    margin-bottom: 16px;
    
    .el-button {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }
  
  .demo-tip {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    color: #409eff;
    font-size: 12px;
    line-height: 1.4;
  }
  
  .selection-info {
    margin-top: 16px;
    padding: 12px;
    background-color: #f0f9ff;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    
    p {
      margin: 0 0 8px 0;
      color: #409eff;
      font-weight: 500;
    }
  }
  
  .custom-empty {
    padding: 40px;
    text-align: center;
    color: #909399;
    
    p {
      margin: 16px 0 0 0;
      font-size: 14px;
    }
  }
  
  .error-logs {
    margin-top: 40px;
    padding: 20px;
    background-color: #fef0f0;
    border: 1px solid #fbc4c4;
    border-radius: 4px;
    
    h4 {
      margin: 0 0 16px 0;
      color: #f56c6c;
    }
    
    .error-log-item {
      margin-bottom: 12px;
      
      .log-time {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .log-type {
        font-weight: bold;
        color: #f56c6c;
        margin-bottom: 4px;
      }
      
      .log-message {
        margin-bottom: 4px;
      }
      
      .log-data {
        font-size: 12px;
        color: #606266;
        background-color: #f5f5f5;
        padding: 4px 8px;
        border-radius: 2px;
        word-break: break-all;
      }
    }
  }
  
  .el-dropdown-link {
    color: #409eff;
    cursor: pointer;
    font-size: 12px;
    
    &:hover {
      color: #66b1ff;
    }
  }
}
</style> 