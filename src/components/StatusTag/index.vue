/**
 * 状态标签组件
 * 功能描述：根据状态值显示不同类型的标签，支持自定义文本、类型和颜色映射
 * 创建日期：2023-11-20
 */
<template>
  <el-tag
    :type="tagType"
    :effect="effect"
    :size="size"
    :color="customColor"
    :hit="hit"
  >
    {{ displayText }}
  </el-tag>
</template>

<script>
export default {
  name: 'StatusTag',
  props: {
    // 状态值
    status: {
      type: [String, Number, Boolean],
      required: true,
      default: ''
    },
    // 状态文本映射 {状态值: 显示文本}
    textMap: {
      type: Object,
      default: () => ({})
    },
    // 状态类型映射 {状态值: 类型} - 支持element-ui的tag类型
    typeMap: {
      type: Object,
      default: () => ({})
    },
    // 状态颜色映射 {状态值: 颜色} - 优先级高于typeMap
    colorMap: {
      type: Object,
      default: () => ({})
    },
    // 标签效果 (dark/plain/light)
    effect: {
      type: String,
      default: 'light'
    },
    // 标签大小 (medium/small/mini)
    size: {
      type: String,
      default: 'small'
    },
    // 是否显示边框描边
    hit: {
      type: Boolean,
      default: false
    },
    // 默认文本，当textMap中没有对应映射时显示
    defaultText: {
      type: String,
      default: ''
    },
    // 默认类型，当typeMap中没有对应映射时使用
    defaultType: {
      type: String,
      default: 'info'
    }
  },
  computed: {
    // 显示的文本
    displayText() {
      if (this.status === null || this.status === undefined) {
        return this.defaultText || '未知'
      }
      if (this.textMap && this.textMap[this.status] !== undefined) {
        return this.textMap[this.status]
      }
      return this.defaultText || this.status.toString()
    },
    // 标签类型
    tagType() {
      if (this.status === null || this.status === undefined) {
        return this.defaultType
      }
      if (this.customColor) {
        return undefined // 使用自定义颜色时不指定type
      }
      if (this.typeMap && this.typeMap[this.status] !== undefined) {
        return this.typeMap[this.status]
      }
      return this.defaultType
    },
    // 自定义颜色
    customColor() {
      if (this.status === null || this.status === undefined) {
        return undefined
      }
      if (this.colorMap && this.colorMap[this.status] !== undefined) {
        return this.colorMap[this.status]
      }
      return undefined
    }
  }
}
</script>

<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
