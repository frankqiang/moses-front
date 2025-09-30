/**
 * 文件名称：KeyValueEditor.vue
 * 文件描述：键值对编辑器组件，用于编辑通讯参数等键值对数据，支持敏感字段脱敏
 * 创建日期：2025-09-29
 * 修改记录：
 *   - 2025-09-29: 初始创建，支持敏感字段脱敏提示
 */
<template>
  <div class="key-value-editor">
    <!-- 键值对列表 -->
    <div v-if="pairs.length > 0" class="pairs-list">
      <div
        v-for="(pair, index) in pairs"
        :key="index"
        class="pair-item"
      >
        <div class="pair-row">
          <!-- 键名输入 -->
          <div class="pair-key">
            <el-input
              v-model="pair.key"
              :placeholder="keyPlaceholder"
              :disabled="disabled"
              size="small"
              @input="handleKeyChange(index, $event)"
              @blur="validatePair(index)"
            />
          </div>

          <!-- 值输入 -->
          <div class="pair-value">
            <el-input
              v-model="pair.value"
              :placeholder="valuePlaceholder"
              :disabled="disabled"
              :type="isSensitiveKey(pair.key) ? 'password' : 'text'"
              size="small"
              @input="handleValueChange(index, $event)"
              @blur="validatePair(index)"
            />
            <!-- 敏感字段提示 -->
            <div v-if="isSensitiveKey(pair.key)" class="sensitive-hint">
              <i class="el-icon-warning-outline" />
              敏感字段
            </div>
          </div>

          <!-- 删除按钮 -->
          <div class="pair-actions">
            <el-button
              v-if="!disabled"
              type="text"
              size="small"
              icon="el-icon-delete"
              :disabled="pairs.length <= 1"
              @click="removePair(index)"
            >
              删除
            </el-button>
          </div>
        </div>

        <!-- 验证错误提示 -->
        <div v-if="pair.error" class="pair-error">
          <i class="el-icon-warning" />
          {{ pair.error }}
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <i class="el-icon-info" />
      <span>暂无参数</span>
    </div>

    <!-- 添加按钮 -->
    <div v-if="!disabled" class="add-pair">
      <el-button
        type="text"
        icon="el-icon-plus"
        size="small"
        @click="addPair"
      >
        添加参数
      </el-button>
    </div>

    <!-- 敏感字段说明 -->
    <div v-if="sensitiveKeys.length > 0" class="sensitive-info">
      <i class="el-icon-info" />
      敏感字段（如 {{ sensitiveKeys.join(', ') }}）会自动脱敏显示
    </div>
  </div>
</template>

<script>
import { debounce } from '@/utils'

export default {
  name: 'KeyValueEditor',
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    // 键值对数据
    value: {
      type: Object,
      default: () => ({})
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 键名占位符
    keyPlaceholder: {
      type: String,
      default: '请输入参数名'
    },
    // 值占位符
    valuePlaceholder: {
      type: String,
      default: '请输入参数值'
    },
    // 占位符（向下兼容）
    placeholder: {
      type: String,
      default: ''
    },
    // 敏感字段列表
    sensitiveKeys: {
      type: Array,
      default: () => ['password', 'secret', 'token', 'apiKey']
    },
    // 最小对数
    minPairs: {
      type: Number,
      default: 0
    },
    // 最大对数
    maxPairs: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      pairs: [],
      // 防止自触发监听循环
      _isEmitting: false,
      // 防抖后的变更派发函数
      _emitChangeDebounced: null
    }
  },
  computed: {
    // 获取当前值对象
    currentValue() {
      const result = {}
      this.pairs.forEach(pair => {
        if (pair.key && pair.key.trim()) {
          result[pair.key.trim()] = pair.value || ''
        }
      })
      return result
    }
  },
  watch: {
    value: {
      handler(newVal) {
        // 避免由本组件 emit 引起的循环触发
        if (this._isEmitting) {
          this._isEmitting = false
          return
        }
        // 改为浅监听，减少重建频率
        this.initPairs(newVal)
      },
      immediate: true,
      deep: false
    }
  },
  created() {
    // 150ms 防抖，避免高频击键导致父级频繁更新
    this._emitChangeDebounced = debounce(this.emitChangeCore, 150)
  },
  methods: {
    // 初始化键值对
    initPairs(data) {
      if (!data || typeof data !== 'object') {
        this.pairs = this.minPairs > 0 ? this.createEmptyPairs(this.minPairs) : []
        return
      }

      this.pairs = Object.keys(data).map(key => ({
        key,
        value: data[key] || '',
        error: null
      }))

      // 确保最小对数
      if (this.pairs.length < this.minPairs) {
        const additionalPairs = this.createEmptyPairs(this.minPairs - this.pairs.length)
        this.pairs.push(...additionalPairs)
      }

      // 如果没有任何对，至少添加一个空对
      if (this.pairs.length === 0) {
        this.pairs.push(this.createEmptyPair())
      }
    },

    // 创建空键值对
    createEmptyPair() {
      return {
        key: '',
        value: '',
        error: null
      }
    },

    // 创建多个空键值对
    createEmptyPairs(count) {
      return Array.from({ length: count }, () => this.createEmptyPair())
    },

    // 检查是否为敏感字段
    isSensitiveKey(key) {
      if (!key || typeof key !== 'string') return false
      const lowerKey = key.toLowerCase()
      return this.sensitiveKeys.some(sensitiveKey =>
        lowerKey.includes(sensitiveKey.toLowerCase())
      )
    },

    // 添加键值对
    addPair() {
      if (this.pairs.length >= this.maxPairs) {
        this.$message.warning(`最多只能添加${this.maxPairs}个参数`)
        return
      }

      this.pairs.push(this.createEmptyPair())
      this.emitChange()

      // 自动聚焦到新添加的键名输入框
      this.$nextTick(() => {
        const inputs = this.$el.querySelectorAll('.pair-key .el-input__inner')
        const lastInput = inputs[inputs.length - 1]
        if (lastInput) lastInput.focus()
      })
    },

    // 删除键值对
    removePair(index) {
      if (this.pairs.length <= 1) {
        this.$message.warning('至少需要保留一个参数')
        return
      }

      this.pairs.splice(index, 1)
      this.emitChange()
    },

    // 处理键名变更
    handleKeyChange(index, value) {
      this.pairs[index].key = value
      this.pairs[index].error = null
      this.emitChange()
    },

    // 处理值变更
    handleValueChange(index, value) {
      this.pairs[index].value = value
      this.pairs[index].error = null
      this.emitChange()
    },

    // 验证键值对
    validatePair(index) {
      const pair = this.pairs[index]
      if (!pair) return

      // 重置错误
      pair.error = null

      // 如果键名为空但值不为空，提示错误
      if (!pair.key && pair.value) {
        pair.error = '参数名不能为空'
        return false
      }

      // 检查键名重复
      if (pair.key) {
        const duplicateIndex = this.pairs.findIndex((p, i) =>
          i !== index && p.key === pair.key
        )
        if (duplicateIndex >= 0) {
          pair.error = '参数名不能重复'
          return false
        }
      }

      return true
    },

    // 发送变更事件（轻量：仅当前值与整体验证结果，避免高频全量重建）
    emitChangeCore() {
      // 只进行一次整体校验，行级输入时已做过基本检查
      let isValid = true
      for (let i = 0; i < this.pairs.length; i++) {
        if (!this.validatePair(i)) {
          isValid = false
        }
      }

      // 标识由本组件发起的同步，避免外部 value 监听再次触发重建
      this._isEmitting = true
      this.$emit('input', this.currentValue)
      this.$emit('change', this.currentValue)
      this.$emit('validate', isValid)
    },

    // 防抖封装，供输入事件调用
    emitChange() {
      if (this._emitChangeDebounced) {
        this._emitChangeDebounced()
      } else {
        this.emitChangeCore()
      }
    },

    // 验证所有键值对
    validate() {
      let isValid = true
      this.pairs.forEach((pair, index) => {
        if (!this.validatePair(index)) {
          isValid = false
        }
      })
      return isValid
    }
  }
}
</script>

<style lang="scss" scoped>
.key-value-editor {
  .pairs-list {
    .pair-item {
      margin-bottom: 16px;

      .pair-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .pair-key {
          flex: 1;
          min-width: 120px;
        }

        .pair-value {
          flex: 2;
          position: relative;

          .sensitive-hint {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            color: #f56c6c;
            pointer-events: none;
            display: flex;
            align-items: center;
            gap: 2px;
          }
        }

        .pair-actions {
          flex-shrink: 0;
          width: 60px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 4px;
        }
      }

      .pair-error {
        margin-top: 4px;
        font-size: 12px;
        color: #f56c6c;
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 24px;
    color: #909399;
    background: #fafafa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .add-pair {
    margin-top: 12px;
    text-align: center;
  }

  .sensitive-info {
    margin-top: 12px;
    padding: 8px 12px;
    background: #f0f9ff;
    border-radius: 4px;
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 6px;

    i {
      color: #409eff;
    }
  }
}

// Element UI样式覆盖
::v-deep .el-input.is-disabled .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

</style>
