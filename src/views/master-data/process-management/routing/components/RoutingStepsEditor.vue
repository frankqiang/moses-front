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
      :data="pagedSteps"
      :columns="columns"
      :show-pagination="true"
      :pagination="{ total: steps.length, page: currentPage, limit: pageSize, pageSizes: [5, 10, 20, 50] }"
      :show-selection="false"
      :show-index="false"
      highlight-current-row
      :row-key="'stepId'"
      class="steps-table"
      @current-change="handleCurrentRowChange"
      @pagination-change="handlePaginationChange"
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
      <template #type="{ row }">
        <el-tag size="mini">{{ getOperationTypeLabel(row.operationType) }}</el-tag>
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
import { OPERATION_TYPE_OPTIONS } from '@/views/master-data/process-management/operations/constants/operation'; // 导入工序类型常量

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
      currentPage: 1,
      pageSize: 10,
      columns: [
        { prop: 'stepNumber', label: '步骤号', width: 80, align: 'center', slotName: 'stepNumber' },
        { prop: 'operationCode', label: '工序代码', minWidth: 120 },
        { prop: 'operationName', label: '工序名称', minWidth: 150 },
        { prop: 'operationType', label: '工序类型', width: 120, slotName: 'type' }, // 新增工序类型列
        { prop: 'actions', label: '操作', width: 200, align: 'center', slotName: 'actions', fixed: 'right' }
      ],
      // 移除 operationTypeMap
    }
  },
  computed: {
    pagedSteps() {
      console.log('pagedSteps computed triggered. CurrentPage:', this.currentPage, 'PageSize:', this.pageSize, 'Total steps:', this.steps.length);
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      console.log('Slice range: start =', start, 'end =', end);
      const result = this.steps.slice(start, end);
      console.log('pagedSteps result length:', result.length, 'Result:', result);
      return result;
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
    handlePaginationChange({ page, limit }) {
      console.log('handlePaginationChange triggered:', { page, limit });
      this.currentPage = page;
      this.pageSize = limit;
      console.log('After update: currentPage =', this.currentPage, 'pageSize =', this.pageSize);
      console.log('Steps length:', this.steps.length, 'Paged steps length (before computed):', this.pagedSteps.length);
    },
    setCurrentRow(row) {
      this.$refs.stepsTable.setCurrentRow(row)
    },
    getOperationTypeLabel(type) {
      const option = OPERATION_TYPE_OPTIONS.find(opt => opt.value === type);
      return option ? option.label : type;
    }
  },
  watch: {
    steps(newVal, oldVal) {
      console.log('Steps changed. Old length:', oldVal.length, 'New length:', newVal.length);
      this.currentPage = 1;
      console.log('CurrentPage reset to:', this.currentPage);
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