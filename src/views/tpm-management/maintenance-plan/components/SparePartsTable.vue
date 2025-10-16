/**
 * 文件名称：SparePartsTable.vue
 * 文件描述：备件清单表格组件，支持添加/删除行
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 */
<template>
  <div class="spare-parts-table">
    <!-- 表格标题和操作按钮 -->
    <div v-if="showHeader" class="table-header">
      <span class="header-title">{{ title }}</span>
      <el-button
        v-if="!readonly"
        type="primary"
        size="mini"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        添加备件
      </el-button>
    </div>

    <!-- 备件清单表格 -->
    <el-table
      :data="innerSpareParts"
      :border="border"
      :size="size"
      :stripe="stripe"
      :max-height="maxHeight"
      style="width: 100%"
    >
      <el-table-column
        label="序号"
        type="index"
        width="60"
        align="center"
      />

      <el-table-column
        label="备件ID"
        prop="sparePartId"
        min-width="250"
      >
        <template slot-scope="scope">
          <el-input
            v-if="!readonly"
            v-model="scope.row.sparePartId"
            placeholder="请输入备件ID（UUID格式）"
            :size="size"
            @change="handleSparePartChange(scope.$index)"
          />
          <span v-else>{{ scope.row.sparePartId }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="数量"
        prop="quantity"
        width="150"
      >
        <template slot-scope="scope">
          <el-input-number
            v-if="!readonly"
            v-model="scope.row.quantity"
            :min="1"
            :max="9999"
            :size="size"
            controls-position="right"
            style="width: 100%"
            @change="handleQuantityChange(scope.$index)"
          />
          <span v-else>{{ scope.row.quantity }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="!readonly"
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
            style="color: #F56C6C"
            @click="handleRemove(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态提示 -->
    <div v-if="innerSpareParts.length === 0" class="empty-state">
      <i class="el-icon-box" />
      <p>{{ emptyText }}</p>
      <el-button
        v-if="!readonly"
        type="text"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        点击添加备件
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SparePartsTable',

  props: {
    // v-model 绑定值
    value: {
      type: Array,
      default: () => []
    },
    // 是否只读
    readonly: {
      type: Boolean,
      default: false
    },
    // 是否显示表头
    showHeader: {
      type: Boolean,
      default: true
    },
    // 表头标题
    title: {
      type: String,
      default: '备件清单'
    },
    // 是否显示边框
    border: {
      type: Boolean,
      default: true
    },
    // 表格大小
    size: {
      type: String,
      default: 'small',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    },
    // 是否显示斑马纹
    stripe: {
      type: Boolean,
      default: false
    },
    // 最大高度
    maxHeight: {
      type: [String, Number],
      default: null
    },
    // 空状态提示文本
    emptyText: {
      type: String,
      default: '暂无备件清单'
    },
    // 最大备件数量限制
    maxItems: {
      type: Number,
      default: 50
    }
  },

  data() {
    return {
      innerSpareParts: this.value || []
    }
  },

  watch: {
    value: {
      handler(newVal) {
        this.innerSpareParts = newVal || []
      },
      deep: true
    }
  },

  methods: {
    /**
     * 添加备件
     */
    handleAdd() {
      if (this.innerSpareParts.length >= this.maxItems) {
        this.$message.warning(`最多只能添加${this.maxItems}个备件`)
        return
      }

      const newSparePart = {
        sparePartId: '',
        quantity: 1
      }

      this.innerSpareParts.push(newSparePart)
      this.emitChange()
      this.$emit('add', newSparePart)
    },

    /**
     * 删除备件
     * @param {number} index - 要删除的索引
     */
    handleRemove(index) {
      this.$confirm('确定要删除这个备件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const removedItem = this.innerSpareParts[index]
        this.innerSpareParts.splice(index, 1)
        this.emitChange()
        this.$emit('remove', { index, item: removedItem })
        this.$message.success('删除成功')
      }).catch(() => {
        // 取消删除
      })
    },

    /**
     * 备件ID变更处理
     * @param {number} index - 变更的索引
     */
    handleSparePartChange(index) {
      this.emitChange()
      this.$emit('spare-part-change', {
        index,
        sparePartId: this.innerSpareParts[index].sparePartId
      })
    },

    /**
     * 数量变更处理
     * @param {number} index - 变更的索引
     */
    handleQuantityChange(index) {
      this.emitChange()
      this.$emit('quantity-change', {
        index,
        quantity: this.innerSpareParts[index].quantity
      })
    },

    /**
     * 发送变更事件
     */
    emitChange() {
      this.$emit('input', this.innerSpareParts)
      this.$emit('change', this.innerSpareParts)
    },

    /**
     * 验证备件清单
     * @returns {Object} 验证结果
     */
    validate() {
      const errors = []

      this.innerSpareParts.forEach((item, index) => {
        if (!item.sparePartId || item.sparePartId.trim() === '') {
          errors.push({
            index,
            field: 'sparePartId',
            message: `第${index + 1}行的备件ID不能为空`
          })
        }

        if (!item.quantity || item.quantity < 1) {
          errors.push({
            index,
            field: 'quantity',
            message: `第${index + 1}行的数量必须大于0`
          })
        }
      })

      const isValid = errors.length === 0

      if (!isValid) {
        this.$message.error(errors[0].message)
      }

      return {
        valid: isValid,
        errors
      }
    },

    /**
     * 清空备件清单
     */
    clear() {
      this.$confirm('确定要清空所有备件吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.innerSpareParts = []
        this.emitChange()
        this.$emit('clear')
        this.$message.success('清空成功')
      }).catch(() => {
        // 取消清空
      })
    }
  }
}
</script>

<style scoped>
.spare-parts-table {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  margin-top: 12px;
}

.empty-state i {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 12px 0;
  color: #909399;
  font-size: 14px;
}
</style>

