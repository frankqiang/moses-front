<template>
  <div class="table-container">
    <el-table
      v-loading="loading"
      :data="data"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="编号"
        width="80"
        align="center"
      />
      <el-table-column
        prop="name"
        label="规则名称"
        min-width="120"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        prop="type"
        label="规则类型"
        width="120"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag
            :type="getTagTypeByRuleType(row.type)"
            size="small"
          >
            {{ formatRuleType(row.type) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="prefix"
        label="前缀"
        min-width="100"
        align="center"
      >
        <template slot-scope="{row}">
          {{ row.prefix || '-' }}
        </template>
      </el-table-column>

      <el-table-column
        label="流水号配置"
        min-width="200"
      >
        <template slot-scope="{row}">
          <div v-if="row.type === 'pure_numeric' || row.type === 'prefix_numeric'">
            <div>位数: {{ row.sequenceLength }}</div>
            <div>当前值: {{ row.currentValue }}</div>
            <div>步长: {{ row.stepValue }}</div>
          </div>
          <div v-else>
            {{ row.customRule || '-' }}
          </div>
        </template>
      </el-table-column>

      <el-table-column
        label="二维码内容"
        min-width="150"
        :show-overflow-tooltip="true"
      >
        <template slot-scope="{row}">
          {{ row.qrCodeContent || '料框ID' }}
        </template>
      </el-table-column>

      <el-table-column
        prop="isDefault"
        label="是否默认"
        width="100"
        align="center"
      >
        <template slot-scope="{row}">
          <el-tag
            :type="row.isDefault ? 'success' : 'info'"
            size="small"
          >
            {{ row.isDefault ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        prop="createTime"
        label="创建时间"
        width="160"
        align="center"
      >
        <template slot-scope="{row}">
          {{ row.createTime | formatTime }}
        </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        label="操作"
        width="120"
        align="center"
      >
        <template slot-scope="{row}">
          <el-button
            type="text"
            size="small"
            @click="handleUpdate(row)"
          >
            编辑
          </el-button>
          <el-button
            v-if="!row.isDefault"
            type="text"
            size="small"
            @click="handleSetDefault(row)"
          >
            设为默认
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { setDefaultCodeRule } from '@/api/master-data/material-code'

export default {
  name: 'CodeRuleTable',
  filters: {
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatRuleType(type) {
      const map = {
        pure_numeric: '纯数字流水号',
        prefix_numeric: '前缀+流水号',
        custom: '自定义规则'
      }
      return map[type] || type
    },
    getTagTypeByRuleType(type) {
      const map = {
        pure_numeric: 'warning',
        prefix_numeric: 'success',
        custom: 'info'
      }
      return map[type] || ''
    },
    handleUpdate(row) {
      this.$emit('update', row)
    },
    handleSetDefault(row) {
      this.$confirm('确认将该规则设置为默认规则?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 调用设置默认规则API
        setDefaultCodeRule(row.id)
          .then(response => {
            this.$message.success('设置成功')
            // 触发父组件刷新列表
            this.$parent.getList()
          })
          .catch(error => {
            console.error('设置默认规则失败:', error)
            this.$message.error('设置默认规则失败，请重试')
          })
      }).catch(() => {
        // 用户取消操作，不做任何处理
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.table-container {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style> 