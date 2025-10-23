/**
 * 文件名称：MaterialBindDialog.vue
 * 文件描述：物料绑定对话框组件
 * 创建日期：2025-10-20
 * 修改记录：
 *   - 2025-10-20: 初始创建，实现物料绑定功能（P0 + P1第12、13项）
 *   - 2025-10-22: 完善绑定物料接口参数，新增库位ID/编码、状态快照、预期重量、备注等字段传递
 *                移除currentLocation字段（该字段后端不存储）
 *                在待绑定列表中添加备注输入功能，支持用户为每个物料输入备注（最多200字符）
 *                简化错误处理逻辑：直接显示后端返回的错误消息，不判断错误码
 *                优化对话框布局：调整高度和滚动设置，确保底部按钮始终可见，无需滚动
 *                优化重量校验提示：简化UI，仅显示Alert+复选框，勾选时弹窗显示详细说明
 */

<template>
  <el-dialog
    title="绑定物料到退火任务"
    :visible.sync="dialogVisible"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="material-bind-dialog"
  >
    <!-- 任务信息摘要 -->
    <div class="task-summary">
      <div class="summary-item">
        <span class="label">任务编号：</span>
        <span class="value">{{ taskInfo.taskCode }}</span>
      </div>
      <div class="summary-item">
        <span class="label">产品编码：</span>
        <span class="value">{{ taskInfo.productCode }}</span>
      </div>
      <div class="summary-item">
        <span class="label">计划重量：</span>
        <span class="value">{{ taskInfo.plannedWeight }} 吨</span>
      </div>
      <div class="summary-item">
        <span class="label">已绑定重量：</span>
        <span class="value">{{ taskInfo.actualWeight }} 吨</span>
      </div>
      <div class="summary-item">
        <span class="label">待添加重量：</span>
        <span class="value weight-preview" :class="getWeightPreviewClass()">
          {{ pendingTotalWeight.toFixed(3) }} 吨
        </span>
      </div>
      <div class="summary-item">
        <span class="label">绑定后总重量：</span>
        <span class="value weight-total" :class="getTotalWeightClass()">
          {{ totalWeightAfterBinding.toFixed(3) }} 吨
        </span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="dialog-content">
      <!-- 左侧：物料选择区 -->
      <div class="left-panel">
        <div class="panel-header">
          <div class="header-left">
            <h3>可用物料列表</h3>
            <el-radio-group v-model="materialType" size="small" @change="handleMaterialTypeChange">
              <el-radio-button label="basket">料框</el-radio-button>
              <el-radio-button label="stack">料垛</el-radio-button>
            </el-radio-group>
          </div>
          <div class="header-right">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              :disabled="selectedMaterials.length === 0"
              @click="handleAddMaterials"
            >
              添加到绑定列表
              <span v-if="selectedMaterials.length > 0">({{ selectedMaterials.length }})</span>
            </el-button>
          </div>
        </div>

        <!-- 筛选工具栏（合并为一行） -->
        <div class="filter-toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索物料编码或批次号"
            prefix-icon="el-icon-search"
            size="small"
            clearable
            style="width: 200px"
            @clear="handleSearch"
            @keyup.enter.native="handleSearch"
          />
          <el-input
            v-model="filters.batchNumber"
            placeholder="批次号"
            size="small"
            clearable
            style="width: 140px"
          />
          <el-select
            v-model="filters.sortBy"
            placeholder="排序方式"
            size="small"
            clearable
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option label="重量升序" value="weight:asc" />
            <el-option label="重量降序" value="weight:desc" />
            <el-option label="批次号升序" value="batchNumber:asc" />
            <el-option label="批次号降序" value="batchNumber:desc" />
            <el-option label="库位升序" value="currentLocationId:asc" />
            <el-option label="库位降序" value="currentLocationId:desc" />
          </el-select>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-search"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button
            size="small"
            icon="el-icon-refresh"
            @click="handleRefreshList"
          >
            刷新
          </el-button>
        </div>

        <!-- 物料列表 -->
        <div v-loading="materialLoading" class="material-list">
          <el-table
            ref="materialTable"
            :data="materialList"
            max-height="400"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              prop="code"
              label="物料编码"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column
              prop="productCode"
              label="产品代码"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="batchNumber"
              label="批次号"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="weight"
              label="重量(kg)"
              width="100"
              align="right"
            >
              <template slot-scope="scope">
                {{ scope.row.weight.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="weightInTons"
              label="重量(吨)"
              width="100"
              align="right"
            >
              <template slot-scope="scope">
                {{ scope.row.weightInTons.toFixed(3) }}
              </template>
            </el-table-column>
            <el-table-column
              v-if="materialType === 'stack'"
              prop="binCount"
              label="料框数"
              width="80"
              align="center"
            />
            <el-table-column
              prop="locationCode"
              label="库位"
              min-width="110"
              show-overflow-tooltip
            />
          </el-table>

          <!-- 分页 -->
          <el-pagination
            :current-page="pagination.page"
            :page-sizes="[10, 20, 50]"
            :page-size="pagination.limit"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next"
            style="margin-top: 16px; text-align: right"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 右侧：待绑定列表区 -->
      <div class="right-panel">
        <div class="panel-header">
          <h3>待绑定物料列表 ({{ pendingMaterials.length }})</h3>
          <el-button
            size="small"
            type="danger"
            plain
            :disabled="pendingMaterials.length === 0"
            @click="handleClearAll"
          >
            清空列表
          </el-button>
        </div>

        <!-- 待绑定物料表格 -->
        <div class="pending-list">
          <el-table
            :data="pendingMaterials"
            max-height="400"
            style="width: 100%"
          >
            <el-table-column
              prop="materialCode"
              label="物料编码"
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column
              prop="materialType"
              label="类型"
              width="70"
              align="center"
            >
              <template slot-scope="scope">
                {{ scope.row.materialType === 'basket' ? '料框' : '料垛' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="batchNumber"
              label="批次号"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column
              prop="actualWeight"
              label="重量(吨)"
              width="100"
              align="right"
            >
              <template slot-scope="scope">
                {{ scope.row.actualWeight.toFixed(3) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="loadSequence"
              label="装炉顺序"
              width="90"
              align="center"
            >
              <template slot-scope="scope">
                <span class="sequence-number">{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="isPrimary"
              label="主料框"
              width="80"
              align="center"
            >
              <template slot-scope="scope">
                <el-checkbox v-model="scope.row.isPrimary" />
              </template>
            </el-table-column>
            <el-table-column
              prop="remarks"
              label="备注"
              min-width="180"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.remarks"
                  placeholder="请输入备注信息"
                  size="small"
                  clearable
                  maxlength="200"
                  show-word-limit
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="140"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-top"
                  :disabled="scope.$index === 0"
                  @click="handleMoveUp(scope.$index)"
                >
                  上移
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-bottom"
                  :disabled="scope.$index === pendingMaterials.length - 1"
                  @click="handleMoveDown(scope.$index)"
                >
                  下移
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  style="color: #f56c6c"
                  @click="handleRemoveMaterial(scope.$index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 重量校验提示 - 简化版 -->
        <div v-if="showWeightWarning" class="weight-warning-section">
          <el-alert
            :title="weightWarningMessage"
            :type="weightWarningType"
            :closable="false"
            show-icon
          >
            <el-checkbox
              v-model="skipWeightValidation"
              style="margin-top: 8px"
              @change="handleSkipValidationChange"
            >
              跳过重量校验
            </el-checkbox>
          </el-alert>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        确认绑定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getBinList } from '@/views/inventory-management/bin-management/api'
import { getStackList } from '@/views/inventory-management/stack-management/api'
import { bindMaterialsToTask } from '../api'
import { FURNACE_CAPACITY, MATERIAL_TYPE } from '../constants'

export default {
  name: 'MaterialBindDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    taskInfo: {
      type: Object,
      required: true,
      default: () => ({
        taskId: '',
        taskCode: '',
        productCode: '',
        plannedWeight: 0,
        actualWeight: 0
      })
    }
  },
  data() {
    return {
      dialogVisible: false,
      materialType: MATERIAL_TYPE.BASKET,
      searchKeyword: '',
      filters: {
        batchNumber: '',
        sortBy: ''
      },
      materialList: [],
      materialLoading: false,
      selectedMaterials: [],
      pendingMaterials: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      skipWeightValidation: false,
      submitting: false
    }
  },
  computed: {
    // 待添加物料总重量（吨）
    pendingTotalWeight() {
      return this.pendingMaterials.reduce((sum, item) => sum + item.actualWeight, 0)
    },
    // 绑定后的总重量（吨）
    totalWeightAfterBinding() {
      return parseFloat(this.taskInfo.actualWeight || 0) + this.pendingTotalWeight
    },
    // 是否显示重量警告
    showWeightWarning() {
      return this.pendingMaterials.length > 0 &&
        (this.totalWeightAfterBinding < FURNACE_CAPACITY.MIN ||
         this.totalWeightAfterBinding > FURNACE_CAPACITY.MAX)
    },
    // 重量警告类型
    weightWarningType() {
      // 如果已勾选跳过校验，统一显示 warning 类型
      if (this.skipWeightValidation) {
        return 'warning'
      }
      // 未勾选跳过校验时，超出最大容量显示 error，低于最小容量显示 warning
      if (this.totalWeightAfterBinding > FURNACE_CAPACITY.MAX) {
        return 'error'
      } else if (this.totalWeightAfterBinding < FURNACE_CAPACITY.MIN) {
        return 'warning'
      }
      return 'info'
    },
    // 重量警告消息
    weightWarningMessage() {
      const weight = this.totalWeightAfterBinding.toFixed(3)
      const min = FURNACE_CAPACITY.MIN
      const max = FURNACE_CAPACITY.MAX

      if (this.totalWeightAfterBinding > max) {
        if (this.skipWeightValidation) {
          return `绑定后总重量 ${weight}吨 超过最大容量 ${max}吨（已跳过校验）`
        }
        return `绑定后总重量 ${weight}吨 超过最大容量 ${max}吨，请调整物料数量或勾选"跳过重量校验"`
      } else if (this.totalWeightAfterBinding < min) {
        if (this.skipWeightValidation) {
          return `绑定后总重量 ${weight}吨 低于最小容量 ${min}吨（已跳过校验）`
        }
        return `绑定后总重量 ${weight}吨 低于最小容量 ${min}吨，建议继续添加物料或勾选"跳过重量校验"`
      }
      return ''
    },
    // 是否可以提交
    canSubmit() {
      // 没有待绑定物料时不可提交
      if (this.pendingMaterials.length === 0) return false
      // 正在提交时不可提交
      if (this.submitting) return false
      // 如果重量不在范围内且未勾选跳过校验，不可提交
      if (!this.skipWeightValidation) {
        if (this.totalWeightAfterBinding < FURNACE_CAPACITY.MIN ||
            this.totalWeightAfterBinding > FURNACE_CAPACITY.MAX) {
          return false
        }
      }
      // 其他情况允许提交
      return true
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        this.initDialog()
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    initDialog() {
      // 重置所有状态
      this.materialType = MATERIAL_TYPE.BASKET
      this.searchKeyword = ''
      this.filters = {
        batchNumber: '',
        sortBy: ''
      }
      this.selectedMaterials = []
      this.pendingMaterials = []
      this.pagination = {
        page: 1,
        limit: 20,
        total: 0
      }
      this.skipWeightValidation = false
      this.submitting = false

      // 加载物料列表
      this.loadMaterialList()
    },
    async loadMaterialList() {
      this.materialLoading = true
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          productCode: this.taskInfo.productCode
        }

        // 添加搜索关键词
        if (this.searchKeyword) {
          params.searchKeyword = this.searchKeyword
        }

        // 添加批次号筛选
        if (this.filters.batchNumber) {
          params.batchNumber = this.filters.batchNumber
        }

        // 添加排序
        if (this.filters.sortBy) {
          params.sortBy = this.filters.sortBy
        }

        let response
        if (this.materialType === MATERIAL_TYPE.BASKET) {
          // 料框：状态为"待退火"，且未组垛
          params.status = '待退火'
          response = await getBinList(params)

          // 处理料框数据
          if (response && response.data) {
            const bins = response.data.results || []
            // 过滤掉已组垛的料框
            this.materialList = bins
              .filter(bin => !bin.stackId)
              .map(bin => ({
                id: bin.id,
                code: bin.binCode,
                productCode: bin.productCode,
                batchNumber: bin.batchNumber || '-',
                weight: bin.weight,
                weightInTons: bin.weight / 1000,
                locationCode: bin.currentLocation?.locationId || '-',
                specName: bin.specification?.specName || '-',
                status: bin.status,
                // 绑定接口需要的字段
                warehouseLocationId: bin.currentLocationId || null,
                warehouseLocationCode: bin.currentLocation?.locationId || null,
                // 原始数据
                _raw: bin
              }))

            this.pagination.total = this.materialList.length
          }
        } else {
          // 料垛：状态为"活动中"
          params.status = '活动中'
          response = await getStackList(params)

          // 处理料垛数据
          if (response && response.data) {
            const stacks = response.data.results || []
            this.materialList = stacks.map(stack => ({
              id: stack.id,
              code: stack.stackCode,
              productCode: stack.productCode,
              batchNumber: stack.batchNumber || '-',
              weight: stack.totalWeight,
              weightInTons: stack.totalWeight / 1000,
              binCount: stack.binCount,
              locationCode: stack.currentLocation?.locationId || '-',
              status: stack.status,
              // 绑定接口需要的字段
              warehouseLocationId: stack.currentLocationId || null,
              warehouseLocationCode: stack.currentLocation?.locationId || null,
              // 原始数据
              _raw: stack
            }))

            this.pagination.total = response.data.totalResults || stacks.length
          }
        }
      } catch (error) {
        console.error('加载物料列表失败:', error)
        const errorMessage = error.response?.data?.error?.message || '加载物料列表失败'
        this.$message.error(errorMessage)
      } finally {
        this.materialLoading = false
      }
    },
    handleMaterialTypeChange() {
      // 切换物料类型时重置列表
      this.selectedMaterials = []
      this.pagination.page = 1
      this.loadMaterialList()
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadMaterialList()
    },
    handleRefreshList() {
      this.loadMaterialList()
    },
    handleSizeChange(size) {
      this.pagination.limit = size
      this.pagination.page = 1
      this.loadMaterialList()
    },
    handlePageChange(page) {
      this.pagination.page = page
      this.loadMaterialList()
    },
    handleSelectionChange(selection) {
      this.selectedMaterials = selection
    },
    handleAddMaterials() {
      if (this.selectedMaterials.length === 0) {
        this.$message.warning('请先选择物料')
        return
      }

      // 检查是否重复
      const existingIds = new Set(this.pendingMaterials.map(m => m.materialId))
      const newMaterials = this.selectedMaterials.filter(m => !existingIds.has(m.id))

      if (newMaterials.length === 0) {
        this.$message.warning('选中的物料已在待绑定列表中')
        return
      }

      // 计算下一个装炉顺序
      let nextSequence = 1
      if (this.pendingMaterials.length > 0) {
        const maxSequence = Math.max(...this.pendingMaterials.map(m => m.loadSequence))
        nextSequence = maxSequence + 1
      }

      // 添加到待绑定列表
      const addedMaterials = newMaterials.map((material, index) => ({
        materialId: material.id,
        materialCode: material.code,
        materialType: this.materialType,
        actualWeight: material.weightInTons,
        expectedWeight: material.weightInTons, // 预期重量等于实际重量
        batchNumber: material.batchNumber !== '-' ? material.batchNumber : undefined,
        loadSequence: nextSequence + index,
        isPrimary: false,
        // 库位信息
        warehouseLocationId: material.warehouseLocationId,
        warehouseLocationCode: material.warehouseLocationCode,
        // 状态快照
        statusSnapshot: material.status,
        // 重量来源（默认手工录入）
        weightSource: 'manual',
        // 备注信息（默认空字符串，支持用户输入）
        remarks: ''
      }))

      this.pendingMaterials.push(...addedMaterials)

      this.$message.success(`已添加 ${addedMaterials.length} 个物料到待绑定列表`)

      // 清空选中状态
      this.selectedMaterials = []
      // 清除左侧物料列表的所有勾选
      if (this.$refs.materialTable) {
        this.$refs.materialTable.clearSelection()
      }
    },
    handleRemoveMaterial(index) {
      const removedMaterial = this.pendingMaterials[index]
      this.pendingMaterials.splice(index, 1)

      // 从选中列表中移除该物料
      const selectedIndex = this.selectedMaterials.findIndex(m => m.id === removedMaterial.materialId)
      if (selectedIndex !== -1) {
        this.selectedMaterials.splice(selectedIndex, 1)
      }

      // 清除左侧物料列表中该物料的勾选状态
      if (this.$refs.materialTable) {
        const materialInList = this.materialList.find(m => m.id === removedMaterial.materialId)
        if (materialInList) {
          this.$refs.materialTable.toggleRowSelection(materialInList, false)
        }
      }

      // 重新调整装炉顺序
      this.updateLoadSequence()
    },
    handleMoveUp(index) {
      if (index === 0) return
      // 创建新数组以确保响应式更新
      const newList = [...this.pendingMaterials]
      // 交换当前项与上一项
      const temp = newList[index]
      newList[index] = newList[index - 1]
      newList[index - 1] = temp
      // 更新数组
      this.pendingMaterials = newList
      // 重新调整装炉顺序
      this.updateLoadSequence()
    },
    handleMoveDown(index) {
      if (index === this.pendingMaterials.length - 1) return
      // 创建新数组以确保响应式更新
      const newList = [...this.pendingMaterials]
      // 交换当前项与下一项
      const temp = newList[index]
      newList[index] = newList[index + 1]
      newList[index + 1] = temp
      // 更新数组
      this.pendingMaterials = newList
      // 重新调整装炉顺序
      this.updateLoadSequence()
    },
    updateLoadSequence() {
      // 根据当前顺序重新分配装炉顺序
      this.pendingMaterials = this.pendingMaterials.map((material, idx) => ({
        ...material,
        loadSequence: idx + 1
      }))
    },
    handleClearAll() {
      this.$confirm('确认清空所有待绑定物料？', '提示', {
        type: 'warning'
      }).then(() => {
        this.pendingMaterials = []
        // 清空选中状态
        this.selectedMaterials = []
        // 清除左侧物料列表的所有勾选
        if (this.$refs.materialTable) {
          this.$refs.materialTable.clearSelection()
        }
        this.$message.success('已清空待绑定列表')
      }).catch(() => {})
    },
    getWeightPreviewClass() {
      if (this.pendingTotalWeight === 0) return ''
      return 'highlight'
    },
    getTotalWeightClass() {
      if (this.totalWeightAfterBinding > FURNACE_CAPACITY.MAX) {
        return 'error'
      } else if (this.totalWeightAfterBinding < FURNACE_CAPACITY.MIN) {
        return 'warning'
      } else if (this.totalWeightAfterBinding >= FURNACE_CAPACITY.MIN &&
                 this.totalWeightAfterBinding <= FURNACE_CAPACITY.MAX) {
        return 'success'
      }
      return ''
    },
    async handleSubmit() {
      if (!this.canSubmit) return

      // 确保装炉顺序是最新的
      this.updateLoadSequence()

      this.submitting = true
      try {
        const requestData = {
          materials: this.pendingMaterials.map(m => ({
            // 必填字段
            materialId: m.materialId,
            materialCode: m.materialCode,
            materialType: m.materialType,
            actualWeight: m.actualWeight,
            // 装炉相关
            loadSequence: m.loadSequence,
            isPrimary: m.isPrimary,
            // 可选字段（有值时才传递）
            ...(m.expectedWeight !== undefined && { expectedWeight: m.expectedWeight }),
            ...(m.batchNumber && { batchNumber: m.batchNumber }),
            ...(m.warehouseLocationId && { warehouseLocationId: m.warehouseLocationId }),
            ...(m.warehouseLocationCode && { warehouseLocationCode: m.warehouseLocationCode }),
            ...(m.statusSnapshot && { statusSnapshot: m.statusSnapshot }),
            ...(m.weightSource && { weightSource: m.weightSource }),
            ...(m.remarks && { remarks: m.remarks })
          })),
          skipWeightValidation: this.skipWeightValidation
        }

        const response = await bindMaterialsToTask(this.taskInfo.taskId, requestData)

        if (response && response.success) {
          const message = response.message || '绑定物料成功'
          this.$message.success(message)
          this.$emit('success', response.data)
          this.handleClose()
        }
      } catch (error) {
        console.error('绑定物料失败:', error)

        // 直接从错误对象提取信息（全局拦截器已转换为ApiError）
        const errorMessage = error.message || error.response?.data?.error?.message || '绑定物料失败'
        const errorDetails = error.details || error.response?.data?.error?.details

        // 显示后端返回的错误消息
        this.$message.error(errorMessage)

        // 如果有冲突物料详情，额外显示详细列表
        if (errorDetails?.conflictMaterials) {
          const conflicts = errorDetails.conflictMaterials
            .map(c => `${c.materialCode} (已绑定到 ${c.taskCode})`)
            .join('\n')
          this.$alert(
            `${errorMessage}\n\n${conflicts}`,
            '详细信息',
            {
              type: 'warning',
              confirmButtonText: '知道了'
            }
          )
        }
      } finally {
        this.submitting = false
      }
    },
    handleSkipValidationChange(checked) {
      if (checked) {
        // 勾选时弹窗提示详细信息
        this.$alert(
          `<div style="line-height: 1.8;">
            <p><strong>适用场景：</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>分批装炉（先绑定部分物料，后续继续添加）</li>
              <li>特殊工艺要求（需要特定重量配比）</li>
              <li>测试/调试场景</li>
            </ul>
            <p style="color: #E6A23C; margin-top: 12px;">
              <i class="el-icon-warning"></i>
              <strong>注意：</strong>跳过校验后将允许绑定任意重量的物料，即使不在 35-42吨 炉容范围内。<br>
              请确认这是您期望的操作，绑定后请及时补充或调整物料。
            </p>
          </div>`,
          '跳过重量校验说明',
          {
            dangerouslyUseHTMLString: true,
            type: 'warning',
            confirmButtonText: '我知道了'
          }
        )
      }
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.material-bind-dialog {
  ::v-deep .el-dialog {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  ::v-deep .el-dialog__body {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
    max-height: calc(90vh - 200px);
  }

  ::v-deep .el-dialog__footer {
    padding: 15px 20px;
    border-top: 1px solid #e4e7ed;
    background: #fff;
  }
}

.task-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 20px;

  .summary-item {
    display: flex;
    align-items: center;
    min-width: 200px;

    .label {
      font-weight: 500;
      color: #606266;
      margin-right: 8px;
    }

    .value {
      color: #303133;
      font-weight: 600;

      &.weight-preview.highlight {
        color: #409eff;
      }

      &.weight-total {
        font-size: 16px;

        &.success {
          color: #67c23a;
        }

        &.warning {
          color: #e6a23c;
        }

        &.error {
          color: #f56c6c;
        }
      }
    }
  }
}

.dialog-content {
  display: flex;
  gap: 20px;
  height: 600px;
  max-height: calc(90vh - 350px);
}

.left-panel,
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background: white;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.filter-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.material-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pending-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.weight-warning-section {
  margin-top: 12px;
}

.dialog-footer {
  text-align: right;
}

.sequence-number {
  display: inline-block;
  min-width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 600;
}
</style>

