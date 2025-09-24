<!--
 * 文件名称：DepartmentTable.vue
 * 文件描述：部门表格组件，使用BaseTable展示树形结构数据
 * 创建日期：2024-01-20
 * 修改记录：
 *   - 2024-01-20: 创建，使用BaseTable组件和全局组件规范
-->

<template>
    <div class="department-table">
        <!-- 使用全局表格工具栏组件 -->
        <table-toolbar ref="toolbar" :enable-column-settings="true" :column-options="columnOptions"
            :storage-key="columnSettingsKey" :default-visible-columns="defaultVisibleColumns"
            :enable-batch-actions="true" :selected-rows="selectedRows" :enable-export="true"
            :export-api="exportApiFunction" :export-params="exportParams" :hide-status-buttons="false"
            :status-buttons-mode="'dropdown'" :status-confirm="false" :delete-confirm="false" :table-data="data"
            :smart-status-buttons="true" :status-field="'status'" :enabled-value="'active'" :disabled-value="'inactive'"
            :refresh-feedback-mode="'all'" @refresh="handleRefresh" @column-change="handleColumnChange"
            @batch-delete="handleBatchDelete" @batch-enable="handleBatchEnable" @batch-disable="handleBatchDisable"
            @export-success="handleExportSuccess">
            <template #toolbar-left>
                <ActionButtons :buttons="toolbarButtons" mode="normal" @click="handleToolbarAction" />
                <slot name="toolbar-left" />
            </template>

            <template #toolbar-right>
                <slot name="toolbar-right" />
            </template>
        </table-toolbar>

        <!-- 使用BaseTable组件展示树形结构 -->
        <BaseTable :data="flattenedData" :columns="baseTableColumns" :loading="loading" :pagination="paginationConfig"
            :show-selection="true" :show-index="false" :virtual-scroll="enableVirtualScroll" :virtual-threshold="1000"
            :virtual-height="600" :item-height="48" :allow-retry="true" :load-error="loadError" border stripe
            highlight-current-row @selection-change="handleSelectionChange" @retry="handleRetry"
            @row-click="handleRowClick" @data-error="handleDataError" @format-error="handleFormatError"
            @pagination-change="handlePaginationChange">
            <!-- 部门名称列（树形结构显示） -->
            <template #name="{ row }">
                <div class="tree-node-content" :style="{ paddingLeft: (row._level || 0) * 20 + 'px' }">
                    <span v-if="row.children && row.children.length > 0" class="tree-expand-icon"
                        :class="{ 'is-expanded': row._expanded }" @click="toggleExpand(row)">
                        <i class="el-icon-caret-right" />
                    </span>
                    <span v-else class="tree-expand-placeholder" />
                    <i class="el-icon-office-building tree-node-icon" />
                    <span class="tree-node-label">{{ row.name }}</span>
                </div>
            </template>

            <!-- 部门经理列 -->
            <template #manager="{ row }">
                <span v-if="row.manager">{{ row.manager.name }}</span>
                <span v-else class="text-muted">-</span>
            </template>

            <!-- 状态列 -->
            <template #status="{ row }">
                <StatusTag :status="row.status" :text-map="statusTextMap" :type-map="statusTypeMap" />
            </template>

            <!-- 操作列 -->
            <template #actions="{ row }">
                <ActionButtons :buttons="getActionButtons(row)" mode="text" :row="row" @click="handleActionClick" />
            </template>

            <!-- 空状态 -->
            <template #empty>
                <div class="custom-empty">
                    <i class="el-icon-office-building" style="font-size: 48px; color: #c0c4cc;" />
                    <p>暂无部门数据</p>
                    <el-button type="primary" size="small" @click="handleAdd">新增部门</el-button>
                </div>
            </template>
        </BaseTable>
    </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import TableToolbar from '@/components/TableToolbar'
import columnSettingsMixin from '@/components/TableToolbar/columnSettingsMixin'
import { debounce } from '@/utils'
import {
    TABLE_COLUMNS,
    DEFAULT_VISIBLE_COLUMNS,
    STATUS_CONFIG,
    TOOLBAR_BUTTONS,
    ACTION_BUTTONS
} from '../constants/department'

export default {
    name: 'DepartmentTable',
    components: {
        BaseTable,
        StatusTag,
        ActionButtons,
        TableToolbar
    },
    mixins: [columnSettingsMixin],
    props: {
        // 表格数据（树形结构）
        data: {
            type: Array,
            default: () => []
        },
        // 总记录数
        total: {
            type: Number,
            default: 0
        },
        // 加载状态
        loading: {
            type: Boolean,
            default: false
        },
        // 加载错误状态
        loadError: {
            type: [Boolean, String, Error],
            default: false
        },
        // 当前页码
        page: {
            type: Number,
            default: 1
        },
        // 每页显示条数
        limit: {
            type: Number,
            default: 10
        },
        // 导出API
        exportApi: {
            type: String,
            default: '/v1/departments/export'
        }
    },
    data() {
        return {
            // 选中的行
            selectedRows: [],
            // 展开状态映射
            expandedMap: new Map(),
            // 扁平化后的数据
            flattenedData: []
        }
    },
    computed: {
        /**
         * 列配置存储键名
         */
        columnSettingsKey() {
            return 'department-table-columns'
        },

        /**
         * 列选项
         */
        columnOptions() {
            return TABLE_COLUMNS
        },

        /**
         * 默认可见列
         */
        defaultVisibleColumns() {
            return DEFAULT_VISIBLE_COLUMNS
        },

        /**
         * BaseTable列配置
         */
        baseTableColumns() {
            return this.visibleColumns
        },

        /**
         * 状态文本映射
         */
        statusTextMap() {
            return STATUS_CONFIG.textMap
        },

        /**
         * 状态类型映射
         */
        statusTypeMap() {
            return STATUS_CONFIG.typeMap
        },

        /**
         * 工具栏按钮
         */
        toolbarButtons() {
            return TOOLBAR_BUTTONS.filter(button => {
                return !button.permission || this.$hasPermission(button.permission)
            })
        },

        /**
         * 分页配置
         */
        paginationConfig() {
            return {
                page: this.page,
                limit: this.limit,
                total: this.total
            }
        },

        /**
         * 是否启用虚拟滚动
         */
        enableVirtualScroll() {
            return this.flattenedData.length > 1000
        },

        /**
         * 导出API函数
         */
        exportApiFunction() {
            return this.exportApi
        },

        /**
         * 导出参数
         */
        exportParams() {
            return {
                // 导出参数可以根据搜索条件动态生成
            }
        }
    },
    watch: {
        /**
         * 监听数据变化，重新扁平化
         */
        data: {
            handler() {
                this.flattenData()
            },
            immediate: true,
            deep: true
        }
    },
    created() {
        // 创建防抖函数
        this.debouncedRefresh = debounce(this.handleRefresh, 300)
    },
    methods: {
        /**
         * 扁平化树形数据
         */
        flattenData() {
            const result = []

            const traverse = (nodes, level = 0, parent = null) => {
                nodes.forEach(node => {
                    // 添加树形结构相关属性
                    const flatNode = {
                        ...node,
                        _level: level,
                        _parent: parent,
                        _expanded: this.expandedMap.get(node.id) || false
                    }

                    result.push(flatNode)

                    // 如果节点展开且有子节点，递归处理子节点
                    if (flatNode._expanded && node.children && node.children.length > 0) {
                        traverse(node.children, level + 1, node)
                    }
                })
            }

            traverse(this.data)
            this.flattenedData = result
        },

        /**
         * 切换展开状态
         */
        toggleExpand(row) {
            const isExpanded = this.expandedMap.get(row.id) || false
            this.expandedMap.set(row.id, !isExpanded)
            this.flattenData()
        },

        /**
         * 获取操作按钮
         */
        getActionButtons(row) {
            const buttons = []

            // 根据权限和业务逻辑动态生成按钮
            Object.entries(ACTION_BUTTONS).forEach(([key, config]) => {
                if (!config.permission || this.$hasPermission(config.permission)) {
                    let buttonConfig = { ...config, action: key, data: row }

                    // 特殊处理切换状态按钮
                    if (key === 'toggleStatus') {
                        buttonConfig.text = row.status === 'active' ? '禁用' : '启用'
                        buttonConfig.icon = row.status === 'active' ? 'el-icon-close' : 'el-icon-check'
                    }

                    buttons.push(buttonConfig)
                }
            })

            return buttons
        },

        /**
         * 处理选择变化
         */
        handleSelectionChange(selection) {
            this.selectedRows = selection
        },

        /**
         * 处理刷新
         */
        handleRefresh() {
            this.$emit('refresh')
        },

        /**
         * 处理重试
         */
        handleRetry() {
            this.$emit('retry')
        },

        /**
         * 处理行点击
         */
        handleRowClick(row) {
            // 点击行时切换展开状态
            if (row.children && row.children.length > 0) {
                this.toggleExpand(row)
            }
        },

        /**
         * 处理数据错误
         */
        handleDataError(error) {
            console.error('表格数据错误:', error)
            this.$message.error('数据格式错误，请检查数据源')
        },

        /**
         * 处理格式错误
         */
        handleFormatError(error) {
            console.error('表格格式错误:', error)
            this.$message.error('表格格式错误，请联系技术支持')
        },

        /**
         * 处理分页变化
         */
        handlePaginationChange({ page, limit }) {
            this.$emit('pagination-change', { page, limit })
        },

        /**
         * 处理工具栏操作
         */
        handleToolbarAction(button) {
            this.$emit(button.action, button.data)
        },

        /**
         * 处理操作按钮点击
         */
        handleActionClick(button) {
            this.$emit(button.action, button.data)
        },

        /**
         * 处理新增
         */
        handleAdd() {
            this.$emit('create')
        },

        /**
         * 处理批量删除
         */
        handleBatchDelete(rows) {
            this.$emit('batch-delete', rows)
        },

        /**
         * 处理批量启用
         */
        handleBatchEnable(rows) {
            this.$emit('batch-enable', rows)
        },

        /**
         * 处理批量禁用
         */
        handleBatchDisable(rows) {
            this.$emit('batch-disable', rows)
        },

        /**
         * 处理导出成功
         */
        handleExportSuccess(result) {
            this.$emit('export-success', result)
        },

        /**
         * 刷新成功反馈
         */
        refreshSucceed() {
            if (this.$refs.toolbar) {
                this.$refs.toolbar.refreshSucceed()
            }
        },

        /**
         * 刷新失败反馈
         */
        refreshFail(message) {
            if (this.$refs.toolbar) {
                this.$refs.toolbar.refreshFail(message)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.department-table {
    .tree-node-content {
        display: flex;
        align-items: center;

        .tree-expand-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            cursor: pointer;
            transition: transform 0.3s;

            &.is-expanded {
                transform: rotate(90deg);
            }

            &:hover {
                background-color: #f5f7fa;
                border-radius: 2px;
            }
        }

        .tree-expand-placeholder {
            display: inline-block;
            width: 16px;
            height: 16px;
        }

        .tree-node-icon {
            margin: 0 6px;
            color: #606266;
        }

        .tree-node-label {
            flex: 1;
            color: #303133;
        }
    }

    .text-muted {
        color: #909399;
    }

    .custom-empty {
        padding: 40px;
        text-align: center;
        color: #909399;

        p {
            margin: 16px 0;
            font-size: 14px;
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .department-table {
        .tree-node-content {
            font-size: 13px;

            .tree-node-icon {
                margin: 0 4px;
            }
        }
    }
}
</style>
