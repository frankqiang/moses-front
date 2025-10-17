<!--
  文件名称：SparePartsTable.vue
  文件描述：备件使用清单组件 - 展示和编辑
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->
<template>
  <div class="spare-parts-table">
    <div class="table-header">
      <span class="title">备件使用清单</span>
      <el-button
        v-if="editable"
        type="primary"
        size="mini"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        添加备件
      </el-button>
    </div>

    <el-table
      :data="tableData"
      border
      :max-height="maxHeight"
      style="width: 100%"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />

      <el-table-column label="备件编码" prop="sparePartCode" min-width="120">
        <template slot-scope="scope">
          <el-input
            v-if="editable"
            v-model="scope.row.sparePartCode"
            placeholder="请输入备件编码"
            size="small"
          />
          <span v-else>{{ scope.row.sparePartCode }}</span>
        </template>
      </el-table-column>

      <el-table-column label="备件名称" prop="sparePartName" min-width="150">
        <template slot-scope="scope">
          <el-input
            v-if="editable"
            v-model="scope.row.sparePartName"
            placeholder="请输入备件名称"
            size="small"
          />
          <span v-else>{{ scope.row.sparePartName }}</span>
        </template>
      </el-table-column>

      <el-table-column label="使用数量" prop="quantity" width="120">
        <template slot-scope="scope">
          <el-input-number
            v-if="editable"
            v-model="scope.row.quantity"
            :min="1"
            :max="9999"
            :precision="0"
            size="small"
            style="width: 100%"
          />
          <span v-else>{{ scope.row.quantity }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="editable"
        label="操作"
        width="80"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="small"
            icon="el-icon-delete"
            style="color: #f56c6c"
            @click="handleDelete(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="tableData.length === 0" class="empty-state">
      <i class="el-icon-box" />
      <p>暂无备件使用记录</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SparePartsTable',

  props: {
    // 备件列表数据
    value: {
      type: Array,
      default: () => []
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true
    },
    // 表格最大高度
    maxHeight: {
      type: [Number, String],
      default: 400
    }
  },

  data() {
    return {
      tableData: []
    }
  },

  watch: {
    value: {
      handler(newVal) {
        this.tableData = JSON.parse(JSON.stringify(newVal || []))
      },
      immediate: true,
      deep: true
    },
    tableData: {
      handler(newVal) {
        this.$emit('input', newVal)
        this.$emit('change', newVal)
      },
      deep: true
    }
  },

  methods: {
    /**
     * 添加备件行
     */
    handleAdd() {
      this.tableData.push({
        sparePartId: '',
        sparePartCode: '',
        sparePartName: '',
        quantity: 1
      })
    },

    /**
     * 删除备件行
     */
    handleDelete(index) {
      this.$confirm('确认删除该备件记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData.splice(index, 1)
        this.$message.success('删除成功')
      }).catch(() => {
        // 用户取消操作
      })
    },

    /**
     * 验证数据
     */
    validate() {
      for (let i = 0; i < this.tableData.length; i++) {
        const row = this.tableData[i]
        if (!row.sparePartCode) {
          this.$message.error(`第 ${i + 1} 行：备件编码不能为空`)
          return false
        }
        if (!row.sparePartName) {
          this.$message.error(`第 ${i + 1} 行：备件名称不能为空`)
          return false
        }
        if (!row.quantity || row.quantity < 1) {
          this.$message.error(`第 ${i + 1} 行：使用数量必须大于0`)
          return false
        }
      }
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.spare-parts-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .title {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 0;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }
}
</style>

