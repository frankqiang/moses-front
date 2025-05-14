/**
 * 操作按钮组组件
 * 功能描述：提供统一的表格操作按钮布局，支持自定义按钮和权限控制
 * 创建日期：2023-11-20
 * 更新日期：2024-11-15
 * 更新内容：添加对下拉菜单按钮（带有children属性的按钮）的支持
 */
<template>
  <div class="action-buttons">
    <!-- 文本按钮模式 -->
    <template v-if="mode === 'text'">
      <template v-for="(button, index) in visibleButtons">
        <!-- 下拉菜单按钮 -->
        <el-dropdown 
          v-if="button.children && button.children.length" 
          :key="index"
          @command="handleChildCommand"
          trigger="click"
        >
          <el-tooltip
            v-if="button.tooltip"
            :content="button.tooltip"
            :disabled="!button.tooltip"
            placement="top"
          >
            <el-button
              :type="button.type || 'text'"
              :size="button.size || size"
              :icon="button.icon"
              :class="button.class"
              :disabled="button.disabled"
            >
              {{ button.showText !== false ? button.text : '' }}<i v-if="button.showText !== false" class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
          </el-tooltip>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(child, childIndex) in button.children"
              :key="childIndex"
              :command="{action: child.action, row: row, parentAction: button.action}"
              :disabled="child.disabled"
              :divided="child.divided"
            >
              <i v-if="child.icon" :class="child.icon"></i>
              {{ child.text }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <!-- 普通按钮带tooltip -->
        <el-tooltip
          v-else-if="button.tooltip"
          :key="index"
          :content="button.tooltip"
          :disabled="!button.tooltip"
          placement="top"
        >
          <el-button
            :type="button.type || 'text'"
            :size="button.size || size"
            :icon="button.icon"
            :class="button.class"
            :disabled="button.disabled"
            @click="handleClick(button)"
          >
            {{ button.showText !== false ? button.text : '' }}
          </el-button>
        </el-tooltip>
        
        <!-- 普通按钮不带tooltip -->
        <el-button
          v-else
          :key="index"
          :type="button.type || 'text'"
          :size="button.size || size"
          :icon="button.icon"
          :class="button.class"
          :disabled="button.disabled"
          @click="handleClick(button)"
        >
          {{ button.showText !== false ? button.text : '' }}
        </el-button>
      </template>

      <!-- 更多按钮下拉菜单 -->
      <el-dropdown v-if="moreButtons.length" @command="handleCommand">
        <el-button type="text" size="mini">
          更多<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(button, index) in moreButtons"
            :key="index"
            :command="button"
            :disabled="button.disabled"
            :divided="button.divided"
          >
            <i v-if="button.icon" :class="button.icon"></i>
            {{ button.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>

    <!-- 普通按钮模式 -->
    <template v-else>
      <!-- 普通按钮模式下的下拉菜单 -->
      <el-dropdown 
        v-for="(button, index) in visibleButtons.filter(btn => btn.children && btn.children.length)" 
        :key="'dropdown-' + index"
        @command="handleChildCommand"
      >
        <el-button
          :type="button.type || 'primary'"
          :size="button.size || size"
          :icon="button.icon"
          :class="button.class"
          :disabled="button.disabled"
        >
          {{ button.text }}<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(child, childIndex) in button.children"
            :key="childIndex"
            :command="{action: child.action, row: row, parentAction: button.action}"
            :disabled="child.disabled"
            :divided="child.divided"
          >
            <i v-if="child.icon" :class="child.icon"></i>
            {{ child.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <!-- 普通按钮 -->
      <el-button
        v-for="(button, index) in visibleButtons.filter(btn => !btn.children || !btn.children.length)"
        :key="index"
        :type="button.type || 'primary'"
        :size="button.size || size"
        :icon="button.icon"
        :class="button.class"
        :disabled="button.disabled"
        @click="handleClick(button)"
      >
        {{ button.text }}
      </el-button>

      <!-- 下拉菜单按钮 -->
      <el-dropdown v-if="moreButtons.length" @command="handleCommand">
        <el-button type="primary" size="mini">
          更多操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(button, index) in moreButtons"
            :key="index"
            :command="button"
            :disabled="button.disabled"
            :divided="button.divided"
          >
            <i v-if="button.icon" :class="button.icon"></i>
            {{ button.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ActionButtons',
  props: {
    // 按钮配置数组
    buttons: {
      type: Array,
      default: () => []
    },
    // 尺寸：medium / small / mini
    size: {
      type: String,
      default: 'mini'
    },
    // 模式：normal / text
    mode: {
      type: String,
      default: 'normal',
      validator: value => ['normal', 'text'].includes(value)
    },
    // 当前行数据（表格中使用时）
    row: {
      type: Object,
      default: null
    },
    // 最大显示按钮数（超出将显示在更多菜单中）
    maxVisible: {
      type: Number,
      default: 3
    }
  },
  computed: {
    // 可见按钮
    visibleButtons() {
      return this.filterButtons(this.buttons).slice(0, this.maxVisible)
    },
    // 更多按钮（放入下拉菜单）
    moreButtons() {
      return this.filterButtons(this.buttons).slice(this.maxVisible)
    }
  },
  methods: {
    // 处理按钮点击
    handleClick(button) {
      if (typeof button.onClick === 'function') {
        button.onClick(this.row)
      } else {
        this.$emit('click', { 
          action: button.action, 
          row: this.row 
        })
      }
    },
    // 处理下拉菜单命令
    handleCommand(button) {
      if (typeof button.onClick === 'function') {
        button.onClick(this.row)
      } else {
        this.$emit('click', { 
          action: button.action, 
          row: this.row 
        })
      }
    },
    // 处理子按钮命令
    handleChildCommand(command) {
      this.$emit('click', {
        action: command.action,
        row: command.row || this.row,
        parentAction: command.parentAction
      })
    },
    // 过滤按钮（基于权限和条件）
    filterButtons(buttons) {
      return buttons.filter(button => {
        // 权限检查
        if (button.permission && !this.hasPermission(button.permission)) {
          return false
        }
        
        // 条件检查（如果有）
        if (typeof button.condition === 'function' && this.row) {
          return button.condition(this.row)
        }
        
        return true
      })
    },
    // 检查权限
    hasPermission(permission) {
      // 这里可以接入项目的权限控制系统
      // 暂时返回true表示都有权限
      return true
    }
  }
}
</script>

<style lang="scss" scoped>
.action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  
  .el-button {
    margin-left: 0;
    margin-right: 8px;
    
    &:last-child {
      margin-right: 0;
    }
  }
  
  .el-button [class*="el-icon-"] + span {
    margin-left: 5px;
  }

  .el-dropdown {
    margin-right: 8px;
    
    &:last-child {
      margin-right: 0;
    }
  }
}
</style> 