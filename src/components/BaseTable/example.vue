/**
 * BaseTable 使用示例
 * 功能描述：演示BaseTable组件的各种功能和配置方式
 * 创建日期：2024-12-18
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
      <h3>带分页的表格示例</h3>
      <base-table
        :data="paginationTableData"
        :columns="paginationColumns"
        :loading="paginationLoading"
        :pagination="pagination"
        @pagination-change="handlePaginationChange"
        border
      />
    </div>

    <div class="example-section">
      <h3>带状态和时间列的表格示例</h3>
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
      ]
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

    // 处理分页变化
    handlePaginationChange() {
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