/**
 * BaseTable 组件演示页面
 * 功能描述：展示BaseTable组件的各种功能和使用方法
 * 创建日期：2024-12-18
 */
<template>
  <div class="app-container">
    <div class="page-header">
      <h1>BaseTable 表格组件演示</h1>
      <p>BaseTable 是一个配置驱动的表格组件，通过配置对象定义表格结构，集成了分页、状态标签、加载状态等功能。</p>
    </div>

    <div class="demo-section">
      <h2>1. 基础表格</h2>
      <div class="demo-description">
        <p>最基本的表格用法，通过 columns 配置定义表格列。</p>
      </div>
      <base-table
        :data="basicTableData"
        :columns="basicColumns"
        :loading="basicLoading"
        border
        stripe
      />
    </div>

    <div class="demo-section">
      <h2>2. 带分页的表格</h2>
      <div class="demo-description">
        <p>集成分页功能的表格，支持页码和每页条数的双向绑定。</p>
      </div>
      <base-table
        :data="paginationTableData"
        :columns="paginationColumns"
        :loading="paginationLoading"
        :pagination="pagination"
        @pagination-change="handlePaginationChange"
        border
      />
    </div>

    <div class="demo-section">
      <h2>3. 状态和时间列</h2>
      <div class="demo-description">
        <p>内置状态列和时间列的渲染，通过 type 配置自动处理状态标签和时间格式化。</p>
      </div>
      <base-table
        :data="statusTableData"
        :columns="statusColumns"
        :loading="statusLoading"
        border
      />
    </div>

    <div class="demo-section">
      <h2>4. 多选和操作列</h2>
      <div class="demo-description">
        <p>支持多选功能和操作列，通过插槽自定义操作按钮。</p>
      </div>
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
        <p><strong>已选中 {{ selectedRows.length }} 行：</strong></p>
        <el-tag v-for="row in selectedRows" :key="row.id" style="margin-right: 8px; margin-bottom: 4px;">
          {{ row.name }}
        </el-tag>
      </div>
    </div>

    <div class="demo-section">
      <h2>5. 自定义插槽</h2>
      <div class="demo-description">
        <p>使用插槽自定义列的渲染内容，支持任意复杂的自定义内容。</p>
      </div>
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
        
        <!-- 自定义进度列 -->
        <template v-slot:progress="{ row }">
          <el-progress :percentage="row.progress" :status="getProgressStatus(row.progress)" />
        </template>
        
        <!-- 自定义标签列 -->
        <template v-slot:tags="{ row }">
          <el-tag
            v-for="tag in row.tags"
            :key="tag"
            size="small"
            :type="getTagType(tag)"
            style="margin-right: 4px;"
          >
            {{ tag }}
          </el-tag>
        </template>
        
        <!-- 自定义操作列 -->
        <template v-slot:operation="{ row }">
          <el-dropdown>
            <span class="el-dropdown-link">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleView(row)">
                <i class="el-icon-view"></i> 查看详情
              </el-dropdown-item>
              <el-dropdown-item @click.native="handleEdit(row)">
                <i class="el-icon-edit"></i> 编辑
              </el-dropdown-item>
              <el-dropdown-item divided @click.native="handleDelete(row)">
                <i class="el-icon-delete"></i> 删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </base-table>
    </div>

    <div class="demo-section">
      <h2>6. 空状态</h2>
      <div class="demo-description">
        <p>自定义空状态内容，当表格数据为空时显示。</p>
      </div>
      <base-table
        :data="[]"
        :columns="basicColumns"
        :loading="false"
        border
      >
        <template v-slot:empty>
          <div class="custom-empty">
            <i class="el-icon-box" style="font-size: 64px; color: #c0c4cc;"></i>
            <h3>暂无数据</h3>
            <p>请尝试<el-button type="text" @click="loadData">点击加载数据</el-button>或检查筛选条件</p>
          </div>
        </template>
      </base-table>
    </div>

    <div class="demo-section">
      <h2>7. 排序功能演示</h2>
      <div class="demo-description">
        <p>支持前端排序和后端排序两种方式。前端排序适用于数据量较小的场景，后端排序适用于大数据量分页场景。</p>
      </div>
      
      <!-- 前端排序示例 -->
      <h3>前端排序 (sortable: true)</h3>
      <base-table
        :data="sortTableData"
        :columns="frontSortColumns"
        :loading="false"
        border
      />
      
      <!-- 后端排序示例 -->
      <h3>后端排序 (sortable: 'custom')</h3>
      <div class="sort-info" v-if="currentSort.prop">
        <p>当前排序：<strong>{{ currentSort.prop }}</strong> - {{ currentSort.order === 'ascending' ? '升序' : '降序' }}</p>
      </div>
      <base-table
        :data="backendSortTableData"
        :columns="backendSortColumns"
        :loading="backendSortLoading"
        :pagination="sortPagination"
        @sort-change="handleSortChange"
        @pagination-change="handleSortPaginationChange"
        border
      />
    </div>

    <div class="demo-section">
      <h2>8. 结合工具栏使用</h2>
      <div class="demo-description">
        <p>与 TableToolbar 组件结合使用，提供完整的表格功能。</p>
      </div>
      
      <!-- 表格工具栏 -->
      <table-toolbar
        :selected-rows="selectedRows"
        :enable-batch-actions="true"
        :enable-export="true"
        :enable-import="false"
        @refresh="handleRefresh"
        @batch-delete="handleBatchDelete"
      >
        <template slot="toolbar-left">
          <el-button type="primary" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </template>
      </table-toolbar>
      
      <!-- 表格 -->
      <base-table
        :data="toolbarTableData"
        :columns="toolbarColumns"
        :loading="toolbarLoading"
        :show-selection="true"
        :pagination="toolbarPagination"
        @selection-change="selectedRows = $event"
        @pagination-change="handleToolbarPaginationChange"
        border
      >
        <!-- 操作列 -->
        <template v-slot:actions>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template v-slot="{ row }">
              <action-buttons
                :buttons="actionButtons"
                :row="row"
                mode="text"
                @click="handleActionClick"
              />
            </template>
          </el-table-column>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseTableDemo',
  data() {
    return {
      // 基础表格数据
      basicLoading: false,
      basicTableData: [
        { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com', department: '技术部' },
        { id: 2, name: '李四', age: 30, email: 'lisi@example.com', department: '产品部' },
        { id: 3, name: '王五', age: 28, email: 'wangwu@example.com', department: '设计部' },
        { id: 4, name: '赵六', age: 32, email: 'zhaoliu@example.com', department: '运营部' }
      ],
      basicColumns: [
        { prop: 'name', label: '姓名', width: '120' },
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
        { prop: 'category', label: '类别', width: '120' },
        { prop: 'stock', label: '库存', width: '80', align: 'center', formatter: this.formatStock }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 0
      },

      // 状态表格数据
      statusLoading: false,
      statusTableData: [
        { 
          id: 1, 
          name: '系统管理', 
          status: 1, 
          priority: 'high',
          createTime: '2024-12-18 10:30:00',
          lastAccess: '2024-12-18 15:45:20'
        },
        { 
          id: 2, 
          name: '用户管理', 
          status: 0, 
          priority: 'medium',
          createTime: '2024-12-17 09:15:00',
          lastAccess: '2024-12-17 16:20:10'
        },
        { 
          id: 3, 
          name: '权限控制', 
          status: 1, 
          priority: 'high',
          createTime: '2024-12-16 14:20:00',
          lastAccess: '2024-12-18 08:30:45'
        },
        { 
          id: 4, 
          name: '数据统计', 
          status: 2, 
          priority: 'low',
          createTime: '2024-12-15 11:10:00',
          lastAccess: '2024-12-18 09:15:30'
        }
      ],
      statusColumns: [
        { prop: 'name', label: '模块名称', width: '150' },
        { 
          prop: 'status', 
          label: '状态',
          type: 'status',
          width: '100',
          textMap: { 0: '禁用', 1: '启用', 2: '维护中' },
          typeMap: { 0: 'danger', 1: 'success', 2: 'warning' }
        },
        { 
          prop: 'priority', 
          label: '优先级',
          type: 'status',
          width: '100',
          textMap: { 'low': '低', 'medium': '中', 'high': '高' },
          typeMap: { 'low': 'info', 'medium': 'warning', 'high': 'danger' }
        },
        { 
          prop: 'createTime', 
          label: '创建时间',
          type: 'datetime',
          width: '160',
          format: '{y}-{m}-{d} {h}:{i}'
        },
        { 
          prop: 'lastAccess', 
          label: '最后访问',
          type: 'datetime',
          width: '160'
        }
      ],

      // 多选表格数据
      selectionLoading: false,
      selectionTableData: [
        { id: 1, name: '项目文档.pdf', type: 'PDF', size: '2.5MB', author: '张三' },
        { id: 2, name: '需求分析.docx', type: 'WORD', size: '1.8MB', author: '李四' },
        { id: 3, name: '数据统计.xlsx', type: 'EXCEL', size: '3.2MB', author: '王五' },
        { id: 4, name: '产品介绍.pptx', type: 'PPT', size: '5.1MB', author: '赵六' },
        { id: 5, name: '系统架构图.png', type: 'IMAGE', size: '800KB', author: '钱七' }
      ],
      selectionColumns: [
        { prop: 'name', label: '文件名称', minWidth: '180' },
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
          progress: 85,
          tags: ['产品', '策略'],
          score: 95
        },
        { 
          id: 2, 
          name: '前端工程师', 
          avatar: '', 
          level: 'P5',
          progress: 92,
          tags: ['Vue', 'React'],
          score: 88
        },
        { 
          id: 3, 
          name: '后端工程师', 
          avatar: '', 
          level: 'P7',
          progress: 78,
          tags: ['Java', '微服务'],
          score: 92
        },
        { 
          id: 4, 
          name: 'UI设计师', 
          avatar: '', 
          level: 'P4',
          progress: 95,
          tags: ['设计', 'UI'],
          score: 90
        }
      ],
      customColumns: [
        { prop: 'avatar', label: '头像', slotName: 'avatar', width: '80', align: 'center' },
        { prop: 'name', label: '职位', width: '140' },
        { prop: 'level', label: '级别', width: '80', align: 'center' },
        { prop: 'progress', label: '完成度', slotName: 'progress', width: '120', align: 'center' },
        { prop: 'tags', label: '技能标签', slotName: 'tags', minWidth: '150' },
        { prop: 'score', label: '评分', width: '80', align: 'center', formatter: this.formatScore },
        { label: '操作', slotName: 'operation', width: '120', align: 'center' }
      ],

      // 工具栏表格数据
      toolbarLoading: false,
      toolbarTableData: [],
      toolbarColumns: [
        { prop: 'name', label: '名称', width: '150' },
        { prop: 'code', label: '编号', width: '120' },
        { 
          prop: 'status', 
          label: '状态',
          type: 'status',
          width: '100',
          textMap: { 0: '禁用', 1: '启用' },
          typeMap: { 0: 'danger', 1: 'success' }
        },
        { 
          prop: 'createTime', 
          label: '创建时间',
          type: 'datetime',
          width: '160'
        }
      ],
      toolbarPagination: {
        page: 1,
        limit: 10,
        total: 0
      },

      // 操作按钮配置
      actionButtons: [
        { key: 'edit', label: '编辑', type: 'primary' },
        { key: 'delete', label: '删除', type: 'danger' }
      ],

      // 排序相关数据
      sortTableData: [
        { id: 1, name: '张三', age: 25, salary: 8000, score: 95.5, joinDate: '2022-01-15' },
        { id: 2, name: '李四', age: 30, salary: 12000, score: 88.2, joinDate: '2021-03-22' },
        { id: 3, name: '王五', age: 28, salary: 10000, score: 92.8, joinDate: '2021-11-08' },
        { id: 4, name: '赵六', age: 35, salary: 15000, score: 87.6, joinDate: '2020-06-30' },
        { id: 5, name: '钱七', age: 26, salary: 9000, score: 91.3, joinDate: '2022-08-12' },
        { id: 6, name: '孙八', age: 32, salary: 13000, score: 89.7, joinDate: '2020-12-03' }
      ],
      
      // 前端排序列配置
      frontSortColumns: [
        { prop: 'name', label: '姓名', width: '120' },
        { prop: 'age', label: '年龄', width: '100', sortable: true, align: 'center' },
        { prop: 'salary', label: '薪资', width: '120', sortable: true, align: 'right', formatter: this.formatSalary },
        { prop: 'score', label: '评分', width: '100', sortable: true, align: 'center', formatter: this.formatScore },
        { prop: 'joinDate', label: '入职日期', width: '120', sortable: true }
      ],

      // 后端排序相关
      backendSortTableData: [],
      backendSortLoading: false,
      backendSortColumns: [
        { prop: 'name', label: '产品名称', width: '150' },
        { prop: 'price', label: '价格', width: '120', sortable: 'custom', align: 'right', formatter: this.formatPrice },
        { prop: 'sales', label: '销量', width: '100', sortable: 'custom', align: 'center' },
        { prop: 'rating', label: '评分', width: '100', sortable: 'custom', align: 'center', formatter: this.formatRating },
        { prop: 'updateTime', label: '更新时间', width: '160', sortable: 'custom', type: 'datetime' }
      ],
      sortPagination: {
        page: 1,
        limit: 8,
        total: 0
      },
      currentSort: {
        prop: '',
        order: ''
      }
    }
  },
  created() {
    this.loadPaginationData()
    this.loadToolbarData()
    this.loadBackendSortData()
  },
  methods: {
    // 加载分页数据
    async loadPaginationData() {
      this.paginationLoading = true
      
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
      const categories = ['电子产品', '服装', '食品', '图书', '家居', '运动', '美妆', '数码']
      const data = []
      
      for (let i = 1; i <= 85; i++) {
        data.push({
          id: i,
          name: `产品 ${i}`,
          code: `PRD${String(i).padStart(3, '0')}`,
          price: Math.floor(Math.random() * 2000) + 50,
          category: categories[Math.floor(Math.random() * categories.length)],
          stock: Math.floor(Math.random() * 500)
        })
      }
      
      return data
    },

    // 加载工具栏表格数据
    async loadToolbarData() {
      this.toolbarLoading = true
      
      setTimeout(() => {
        const allData = this.generateToolbarData()
        const start = (this.toolbarPagination.page - 1) * this.toolbarPagination.limit
        const end = start + this.toolbarPagination.limit
        
        this.toolbarTableData = allData.slice(start, end)
        this.toolbarPagination.total = allData.length
        this.toolbarLoading = false
      }, 300)
    },

    // 生成工具栏测试数据
    generateToolbarData() {
      const data = []
      for (let i = 1; i <= 42; i++) {
        data.push({
          id: i,
          name: `记录 ${i}`,
          code: `REC${String(i).padStart(3, '0')}`,
          status: Math.random() > 0.5 ? 1 : 0,
          createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
      return data
    },

    // 处理分页变化
    handlePaginationChange() {
      this.loadPaginationData()
    },

    // 处理工具栏表格分页变化
    handleToolbarPaginationChange() {
      this.loadToolbarData()
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 格式化价格
    formatPrice(row, column, cellValue) {
      return `¥${cellValue.toFixed(2)}`
    },

    // 格式化库存
    formatStock(row, column, cellValue) {
      if (cellValue === 0) return '缺货'
      if (cellValue < 10) return `仅剩${cellValue}件`
      return `${cellValue}件`
    },

    // 格式化评分
    formatScore(row, column, cellValue) {
      return `${cellValue}分`
    },

    // 获取进度状态
    getProgressStatus(progress) {
      if (progress >= 90) return 'success'
      if (progress >= 70) return null
      if (progress >= 50) return 'warning'
      return 'exception'
    },

    // 获取标签类型
    getTagType(tag) {
      const typeMap = {
        '产品': 'success',
        '策略': 'warning',
        'Vue': 'primary',
        'React': 'info',
        'Java': 'danger',
        '微服务': 'success',
        '设计': 'warning',
        'UI': 'primary'
      }
      return typeMap[tag] || ''
    },

    // 处理编辑
    handleEdit(row) {
      this.$message.success(`编辑：${row.name}`)
    },

    // 处理查看
    handleView(row) {
      this.$message.info(`查看：${row.name}`)
    },

    // 处理删除
    handleDelete(row) {
      this.$confirm(`确定要删除"${row.name}"吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        this.$message.success('删除成功')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 处理批量删除
    handleBatchDelete() {
      this.$message.success(`批量删除了 ${this.selectedRows.length} 条记录`)
    },

    // 处理新增
    handleAdd() {
      this.$message.success('新增功能')
    },

    // 处理刷新
    handleRefresh() {
      this.loadToolbarData()
      this.$message.success('数据已刷新')
    },

    // 处理操作按钮点击
    handleActionClick({ action, row }) {
      this.$message.success(`执行操作：${action}，目标：${row.name}`)
    },

    // 加载数据
    loadData() {
      this.$message.success('数据加载完成')
    },

    // 加载后端排序数据
    async loadBackendSortData() {
      this.backendSortLoading = true
      
      setTimeout(() => {
        const allData = this.generateBackendSortData()
        
        // 应用排序
        if (this.currentSort.prop && this.currentSort.order) {
          allData.sort((a, b) => {
            const aVal = a[this.currentSort.prop]
            const bVal = b[this.currentSort.prop]
            
            let result = 0
            if (typeof aVal === 'string') {
              result = aVal.localeCompare(bVal)
            } else {
              result = aVal - bVal
            }
            
            return this.currentSort.order === 'ascending' ? result : -result
          })
        }
        
        const start = (this.sortPagination.page - 1) * this.sortPagination.limit
        const end = start + this.sortPagination.limit
        
        this.backendSortTableData = allData.slice(start, end)
        this.sortPagination.total = allData.length
        this.backendSortLoading = false
      }, 300)
    },

    // 生成后端排序测试数据
    generateBackendSortData() {
      const products = ['智能手机', '笔记本电脑', '平板电脑', '智能手表', '无线耳机', '数码相机', '游戏机', '路由器']
      const data = []
      
      for (let i = 1; i <= 50; i++) {
        data.push({
          id: i,
          name: `${products[Math.floor(Math.random() * products.length)]} ${i}`,
          price: Math.floor(Math.random() * 5000) + 500,
          sales: Math.floor(Math.random() * 1000) + 10,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
          updateTime: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        })
      }
      
      return data
    },

    // 处理排序变化
    handleSortChange({ column, prop, order }) {
      console.log('排序变化:', { column, prop, order })
      
      this.currentSort = {
        prop: prop || '',
        order: order || ''
      }
      
      // 重置到第一页
      this.sortPagination.page = 1
      
      // 重新加载数据
      this.loadBackendSortData()
      
      this.$message.info(`排序：${prop || '无'} - ${order === 'ascending' ? '升序' : order === 'descending' ? '降序' : '默认'}`)
    },

    // 处理排序分页变化
    handleSortPaginationChange() {
      this.loadBackendSortData()
    },

    // 格式化薪资
    formatSalary(row, column, cellValue) {
      return `¥${cellValue.toLocaleString()}`
    },

    // 格式化评级
    formatRating(row, column, cellValue) {
      return `${cellValue}★`
    },

    // 格式化价格
    formatPrice(row, column, cellValue) {
      return `¥${cellValue.toLocaleString()}`
    },

    // 格式化评分
    formatScore(row, column, cellValue) {
      return `${cellValue}★`
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
  
  h1 {
    color: #303133;
    margin-bottom: 10px;
  }
  
  p {
    color: #606266;
    font-size: 14px;
    line-height: 1.6;
    margin: 0;
  }
}

.demo-section {
  margin-bottom: 40px;
  
  h2 {
    color: #303133;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
    font-size: 20px;
  }
  
  .demo-description {
    margin-bottom: 16px;
    
    p {
      color: #606266;
      font-size: 14px;
      margin: 0;
      background-color: #f8f9fa;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #409eff;
    }
  }
}

.selection-info {
  margin-top: 16px;
  padding: 16px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  
  p {
    margin: 0 0 12px 0;
    color: #409eff;
    font-size: 14px;
  }
}

  .custom-empty {
    padding: 60px;
    text-align: center;
    color: #909399;
    
    h3 {
      margin: 16px 0 8px 0;
      color: #606266;
    }
    
    p {
      margin: 0;
      font-size: 14px;
    }
  }
  
  .sort-info {
    margin-bottom: 16px;
    padding: 12px;
    background-color: #e8f4fd;
    border: 1px solid #b3d8ff;
    border-radius: 4px;
    
    p {
      margin: 0;
      color: #409eff;
      font-size: 14px;
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
</style> 