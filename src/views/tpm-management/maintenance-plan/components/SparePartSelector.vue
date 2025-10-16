/**
 * 文件名称：SparePartSelector.vue
 * 文件描述：备件选择器组件，支持搜索显示备件编码、名称、库存
 * 创建日期：2025-10-15
 * 修改记录：
 *   - 2025-10-15: 初始创建
 */
<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :clearable="clearable"
    :filterable="filterable"
    :remote="remote"
    :remote-method="handleRemoteMethod"
    :loading="loading"
    :size="size"
    style="width: 100%"
    @change="handleChange"
    @clear="handleClear"
  >
    <el-option
      v-for="item in sparePartList"
      :key="item.id"
      :label="`${item.sparePartCode} - ${item.name}`"
      :value="item.id"
    >
      <div class="spare-part-option">
        <span class="spare-part-code">{{ item.sparePartCode }}</span>
        <span class="spare-part-name">{{ item.name }}</span>
        <el-tag
          v-if="item.stockQuantity !== undefined"
          :type="getStockTagType(item.stockQuantity, item.safetyStock)"
          size="mini"
          style="margin-left: 8px"
        >
          库存: {{ item.stockQuantity }}
        </el-tag>
      </div>
    </el-option>
  </el-select>
</template>

<script>
// 注意：此处需要实际的备件管理API接口
// import { getSparePartList } from '@/api/master-data/spare-part'

export default {
  name: 'SparePartSelector',

  props: {
    // v-model 绑定值
    value: {
      type: String,
      default: ''
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择备件'
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否可清空
    clearable: {
      type: Boolean,
      default: true
    },
    // 是否可搜索
    filterable: {
      type: Boolean,
      default: true
    },
    // 是否远程搜索
    remote: {
      type: Boolean,
      default: true
    },
    // 组件大小
    size: {
      type: String,
      default: 'small',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    }
  },

  data() {
    return {
      selectedValue: this.value,
      sparePartList: [],
      loading: false,
      searchKeyword: ''
    }
  },

  watch: {
    value(newVal) {
      this.selectedValue = newVal
    }
  },

  mounted() {
    // 初始加载备件列表
    this.loadSparePartList()
  },

  methods: {
    /**
     * 加载备件列表
     * @param {string} keyword - 搜索关键词
     */
    async loadSparePartList(keyword = '') {
      try {
        this.loading = true

        // TODO: 替换为实际的备件管理API
        // const params = {
        //   page: 1,
        //   limit: 50
        // }
        //
        // if (keyword) {
        //   params.search = keyword
        // }
        //
        // const response = await getSparePartList(params)
        // if (response && response.data && response.data.results) {
        //   this.sparePartList = response.data.results
        // }

        // 模拟数据（开发阶段使用）
        this.sparePartList = [
          {
            id: '660e8400-e29b-41d4-a716-446655440000',
            sparePartCode: 'SP-001',
            name: '加热元件',
            stockQuantity: 50,
            safetyStock: 20
          },
          {
            id: '660e8400-e29b-41d4-a716-446655440001',
            sparePartCode: 'SP-002',
            name: '温度传感器',
            stockQuantity: 15,
            safetyStock: 20
          }
        ]

        if (keyword) {
          this.sparePartList = this.sparePartList.filter(item =>
            item.sparePartCode.toLowerCase().includes(keyword.toLowerCase()) ||
            item.name.toLowerCase().includes(keyword.toLowerCase())
          )
        }
      } catch (error) {
        console.error('加载备件列表失败:', error)
        this.$message.error('加载备件列表失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 远程搜索方法
     * @param {string} query - 搜索关键词
     */
    handleRemoteMethod(query) {
      this.searchKeyword = query
      if (query !== '') {
        this.loadSparePartList(query)
      } else {
        this.loadSparePartList()
      }
    },

    /**
     * 选择变更处理
     * @param {string} value - 选中的备件ID
     */
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)

      // 发送完整的备件信息
      const selectedSparePart = this.sparePartList.find(item => item.id === value)
      if (selectedSparePart) {
        this.$emit('select', selectedSparePart)
      }
    },

    /**
     * 清空处理
     */
    handleClear() {
      this.$emit('input', '')
      this.$emit('clear')
    },

    /**
     * 获取库存标签类型
     * @param {number} stockQuantity - 库存数量
     * @param {number} safetyStock - 安全库存
     * @returns {string} 标签类型
     */
    getStockTagType(stockQuantity, safetyStock) {
      if (stockQuantity === 0) {
        return 'danger'
      } else if (stockQuantity < safetyStock) {
        return 'warning'
      } else {
        return 'success'
      }
    }
  }
}
</script>

<style scoped>
.spare-part-option {
  display: flex;
  align-items: center;
}

.spare-part-code {
  font-weight: 500;
  color: #303133;
  margin-right: 8px;
}

.spare-part-name {
  color: #606266;
  flex: 1;
}
</style>

