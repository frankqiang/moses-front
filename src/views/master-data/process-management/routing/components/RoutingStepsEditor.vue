<template>
  <div class="routing-steps-editor">
    <div class="steps-toolbar">
      <span class="toolbar-title">二、工序步骤</span>
      <el-button
        type="primary"
        icon="el-icon-plus"
        size="mini"
        :disabled="isViewMode"
        @click="handleAddStep"
      >
        添加工序步骤
      </el-button>
    </div>
    <base-table
      ref="stepsTable"
      :data="steps"
      :columns="columns"
      :show-pagination="false"
      :show-selection="false"
      :show-index="false"
      highlight-current-row
      class="steps-table"
      @current-change="handleCurrentRowChange"
    >
      <template #stepNumber="{ row, $index }">
        <span>{{ ($index + 1) * 10 }}</span>
      </template>
      <template #actions="{ row, $index }">
        <action-buttons
          :buttons="generateStepActions($index)"
          :row="row"
          mode="text"
          @click="handleStepAction($event, $index)"
        />
      </template>

      <template #empty>
        <div class="custom-empty">
          <p>暂无工序步骤</p>
          <el-button
            v-if="!isViewMode"
            type="text"
            icon="el-icon-plus"
            @click="handleAddStep"
          >
            点击添加第一个工序
          </el-button>
        </div>
      </template>
    </base-table>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import ActionButtons from '@/components/ActionButtons'

export default {
  name: 'RoutingStepsEditor',
  components: {
    BaseTable,
    ActionButtons
  },
  props: {
    steps: {
      type: Array,
      required: true
    },
    isViewMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      columns: [
        { prop: 'stepNumber', label: '步骤号', width: 80, align: 'center', slotName: 'stepNumber' },
        { prop: 'operationCode', label: '工序代码', minWidth: 120 },
        { prop: 'operationName', label: '工序名称', minWidth: 150 },
        { prop: 'actions', label: '操作', width: 150, align: 'center', slotName: 'actions', fixed: 'right' }
      ]
    }
  },
  methods: {
    generateStepActions(index) {
      if (this.isViewMode) return []

      const isFirst = index === 0
      const isLast = index === this.steps.length - 1

      return [
        { action: 'up', text: '上移', icon: 'el-icon-top', disabled: isFirst },
        { action: 'down', text: '下移', icon: 'el-icon-bottom', disabled: isLast },
        { action: 'delete', text: '删除', icon: 'el-icon-delete', class: 'danger' }
      ]
    },
    handleAddStep() {
      this.$emit('add-step')
    },
    handleStepAction(payload, index) {
      this.$emit(payload.action, index)
    },
    handleCurrentRowChange(newRow) {
      this.$emit('select-step', newRow)
    },
    setCurrentRow(row) {
      this.$refs.stepsTable.setCurrentRow(row)
    }
  }
}
</script>

<style lang="scss" scoped>
.routing-steps-editor {
  .steps-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .toolbar-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .steps-table {
    margin-bottom: 20px;
  }

  .custom-empty {
    text-align: center;
    padding: 20px;
    color: #909399;
    p {
      margin-bottom: 10px;
    }
  }
}
</style> 