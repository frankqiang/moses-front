/**
 * 文件名称：EquipmentSelector.vue
 * 文件描述：设备选择器组件，支持搜索和分页显示设备信息
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
      v-for="item in equipmentList"
      :key="item.id"
      :label="`${item.equipmentCode} - ${item.name}`"
      :value="item.id"
    >
      <div class="equipment-option">
        <span class="equipment-code">{{ item.equipmentCode }}</span>
        <span class="equipment-name">{{ item.name }}</span>
        <el-tag v-if="item.equipmentType" type="info" size="mini" style="margin-left: 8px">
          {{ item.equipmentType }}
        </el-tag>
      </div>
    </el-option>
  </el-select>
</template>

<script>
import { fetchEquipmentList } from '@/views/master-data/equipment-management/api'

export default {
  name: 'EquipmentSelector',

  props: {
    // v-model 绑定值
    value: {
      type: String,
      default: ''
    },
    // 占位符
    placeholder: {
      type: String,
      default: '请选择设备'
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
      equipmentList: [],
      loading: false,
      searchKeyword: ''
    }
  },

  watch: {
    value(newVal) {
      this.selectedValue = newVal
      // 如果有值但列表中没有对应的设备，需要加载该设备信息
      if (newVal && !this.equipmentList.find(item => item.id === newVal)) {
        this.loadEquipmentById(newVal)
      }
    }
  },

  mounted() {
    // 初始加载设备列表
    this.loadEquipmentList()
  },

  methods: {
    /**
     * 加载设备列表
     * @param {string} keyword - 搜索关键词
     */
    async loadEquipmentList(keyword = '') {
      try {
        this.loading = true
        const params = {
          page: 1,
          limit: 50,
          status: '运行中' // 只显示运行中的设备
        }

        if (keyword) {
          params.search = keyword
        }

        const response = await fetchEquipmentList(params)
        if (response && response.data && response.data.results) {
          this.equipmentList = response.data.results
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
        this.$message.error('加载设备列表失败')
      } finally {
        this.loading = false
      }
    },

    /**
     * 根据ID加载单个设备信息
     * @param {string} equipmentId - 设备ID
     */
    async loadEquipmentById(equipmentId) {
      try {
        // 这里可以调用获取单个设备详情的接口
        // 暂时使用列表接口查询
        const response = await fetchEquipmentList({
          page: 1,
          limit: 1,
          equipmentId
        })

        if (response && response.data && response.data.results && response.data.results.length > 0) {
          const equipment = response.data.results[0]
          // 将设备添加到列表中（如果不存在）
          if (!this.equipmentList.find(item => item.id === equipment.id)) {
            this.equipmentList.unshift(equipment)
          }
        }
      } catch (error) {
        console.error('加载设备信息失败:', error)
      }
    },

    /**
     * 远程搜索方法
     * @param {string} query - 搜索关键词
     */
    handleRemoteMethod(query) {
      this.searchKeyword = query
      if (query !== '') {
        this.loadEquipmentList(query)
      } else {
        this.loadEquipmentList()
      }
    },

    /**
     * 选择变更处理
     * @param {string} value - 选中的设备ID
     */
    handleChange(value) {
      this.$emit('input', value)
      this.$emit('change', value)

      // 发送完整的设备信息
      const selectedEquipment = this.equipmentList.find(item => item.id === value)
      if (selectedEquipment) {
        this.$emit('select', selectedEquipment)
      }
    },

    /**
     * 清空处理
     */
    handleClear() {
      this.$emit('input', '')
      this.$emit('clear')
    }
  }
}
</script>

<style scoped>
.equipment-option {
  display: flex;
  align-items: center;
}

.equipment-code {
  font-weight: 500;
  color: #303133;
  margin-right: 8px;
}

.equipment-name {
  color: #606266;
  flex: 1;
}
</style>

