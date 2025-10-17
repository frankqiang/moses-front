<!--
  文件名称：TaskStatusTag.vue
  文件描述：任务状态标签组件 - 状态可视化
  创建日期：2024-01-20
  修改记录：
    - 2024-01-20: 初始创建
-->
<template>
  <el-tag :type="tagType" :size="size" :effect="effect">
    {{ statusText }}
  </el-tag>
</template>

<script>
import { STATUS_TAG_TYPE_MAP } from '../constants/maintenance-task'
import tpmDictionaryMixin from '@/views/tpm-management/mixins/dictionary'

export default {
  name: 'TaskStatusTag',

  mixins: [tpmDictionaryMixin],

  props: {
    // 状态值
    status: {
      type: String,
      required: true
    },
    // 标签大小
    size: {
      type: String,
      default: 'small',
      validator: value => ['medium', 'small', 'mini'].includes(value)
    },
    // 标签效果
    effect: {
      type: String,
      default: 'light',
      validator: value => ['dark', 'light', 'plain'].includes(value)
    }
  },

  computed: {
    /**
     * 标签类型
     * 根据状态值返回对应的标签类型
     */
    tagType() {
      return STATUS_TAG_TYPE_MAP[this.status] || 'info'
    },

    /**
     * 状态文本
     * 使用字典系统获取状态标签文本
     */
    statusText() {
      return this.getTaskStatusLabel(this.status) || this.status
    }
  },

  async created() {
    // 加载TPM字典
    await this.loadTPMDictionary()
  }
}
</script>

