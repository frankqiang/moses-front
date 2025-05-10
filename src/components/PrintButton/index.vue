/**
 * 打印按钮组件
 * 功能描述：提供打印表格或特定DOM元素的功能，支持自定义打印样式和预处理
 * 创建日期：2023-11-21
 */
<template>
  <div class="print-button-wrapper" :class="{ inline }">
    <slot>
      <el-button 
        :type="type" 
        :size="size" 
        :icon="icon || 'el-icon-printer'" 
        :disabled="disabled"
        :loading="loading"
        @click="handlePrint"
      >
        {{ text || '打印' }}
      </el-button>
    </slot>
  </div>
</template>

<script>
import printJS from 'print-js'

export default {
  name: 'PrintButton',
  props: {
    // 打印标题
    printTitle: {
      type: String,
      default: '打印文档'
    },
    // 要打印的DOM元素选择器
    printSelector: {
      type: String,
      default: ''
    },
    // 打印ID (当printSelector未提供时)
    printId: {
      type: String,
      default: ''
    },
    // 打印类型: html, json, pdf, image
    printType: {
      type: String,
      default: 'html',
      validator: value => ['html', 'json', 'pdf', 'image'].includes(value)
    },
    // 是否在新窗口打开打印预览
    useNewWindow: {
      type: Boolean,
      default: false
    },
    // 打印前回调函数
    beforePrint: {
      type: Function,
      default: null
    },
    // 打印完成回调函数
    afterPrint: {
      type: Function,
      default: null
    },
    // JSON数据 (当printType为json时)
    jsonData: {
      type: Array,
      default: () => []
    },
    // JSON数据属性 (当printType为json时)
    properties: {
      type: Array,
      default: () => []
    },
    // 按钮类型
    type: {
      type: String,
      default: 'primary'
    },
    // 按钮尺寸
    size: {
      type: String,
      default: 'small'
    },
    // 按钮图标
    icon: {
      type: String,
      default: ''
    },
    // 按钮文本
    text: {
      type: String,
      default: ''
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否内联显示
    inline: {
      type: Boolean,
      default: true
    },
    // 自定义打印CSS
    customCSS: {
      type: String,
      default: ''
    },
    // 自定义打印样式
    printStyles: {
      type: Array,
      default: () => []
    },
    // 是否隐藏页眉页脚
    hideHeaderFooter: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      defaultCSS: `
        @media print {
          body { margin: 0; padding: 10mm; font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 8px; text-align: left; }
          thead { background-color: #f2f2f2; }
          h1, h2, h3 { margin-top: 0; }
          .no-print { display: none !important; }
          @page { size: auto; margin: 5mm; }
        }
      `,
      // 需要在打印时隐藏的元素选择器
      hideSelectors: [
        '.el-table__fixed-right',  // 固定列
        '.el-table__fixed',        // 固定列
        '.no-print',               // 自定义不打印类
        '.el-table-column--selection', // 选择列
        '.el-pagination'           // 分页器
      ]
    }
  },
  computed: {
    // 组合自定义CSS和默认CSS
    combinedCSS() {
      return this.defaultCSS + (this.customCSS || '')
    },
    
    // 获取打印目标元素
    printTarget() {
      return this.printSelector || (this.printId ? `#${this.printId}` : '')
    },
    
    // 处理打印样式
    printStylesArray() {
      const styles = [...this.printStyles]
      
      if (this.hideHeaderFooter) {
        styles.push({ 
          '@page': { 
            margin: '0mm',
          }
        })
      }
      
      return styles
    }
  },
  methods: {
    // 执行打印
    handlePrint() {
      if (this.disabled || this.loading) return
      
      this.loading = true
      this.$emit('before-print')
      
      if (typeof this.beforePrint === 'function') {
        try {
          const shouldContinue = this.beforePrint()
          if (shouldContinue === false) {
            this.loading = false
            return
          }
        } catch (error) {
          console.error('打印前处理错误:', error)
          this.$message.error('打印前处理失败')
          this.loading = false
          return
        }
      }

      this.$nextTick(() => {
        try {
          // 根据打印类型执行不同的打印方法
          switch (this.printType) {
            case 'html':
              this.printHTML()
              break
            case 'json':
              this.printJSON()
              break
            case 'pdf':
              this.printPDF()
              break
            case 'image':
              this.printImage()
              break
            default:
              this.printHTML()
          }
        } catch (error) {
          console.error('打印错误:', error)
          this.$message.error('打印失败')
          this.loading = false
        }
      })
    },
    
    // 打印HTML元素
    printHTML() {
      const target = this.printTarget
      
      if (!target) {
        this.$message.error('未指定打印目标元素')
        this.loading = false
        return
      }
      
      const element = document.querySelector(target)
      if (!element) {
        this.$message.error(`未找到打印目标元素: ${target}`)
        this.loading = false
        return
      }
      
      // 处理隐藏元素
      const hideElements = []
      if (this.hideSelectors.length > 0) {
        this.hideSelectors.forEach(selector => {
          const elements = element.querySelectorAll(selector)
          elements.forEach(el => {
            if (el) {
              hideElements.push({
                element: el,
                originalDisplay: el.style.display
              })
              el.style.display = 'none'
            }
          })
        })
      }
      
      // 执行打印
      printJS({
        printable: this.printId || element.id,
        type: 'html',
        documentTitle: this.printTitle,
        targetStyles: ['*'],
        style: this.combinedCSS,
        header: `<h1 style="text-align: center">${this.printTitle}</h1>`,
        onLoadingStart: () => {
          this.loading = true
        },
        onLoadingEnd: () => {
          // 恢复隐藏元素
          hideElements.forEach(item => {
            item.element.style.display = item.originalDisplay
          })
          
          this.loading = false
          this.$emit('after-print')
          if (typeof this.afterPrint === 'function') {
            this.afterPrint()
          }
        }
      })
    },
    
    // 打印JSON数据
    printJSON() {
      if (!this.jsonData || this.jsonData.length === 0) {
        this.$message.error('未提供JSON数据')
        this.loading = false
        return
      }
      
      if (!this.properties || this.properties.length === 0) {
        this.$message.error('未提供JSON属性配置')
        this.loading = false
        return
      }
      
      printJS({
        printable: this.jsonData,
        properties: this.properties,
        type: 'json',
        documentTitle: this.printTitle,
        gridStyle: 'border: 1px solid #ddd; padding: 8px;',
        gridHeaderStyle: 'border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;',
        style: this.combinedCSS,
        header: `<h1 style="text-align: center">${this.printTitle}</h1>`,
        onLoadingStart: () => {
          this.loading = true
        },
        onLoadingEnd: () => {
          this.loading = false
          this.$emit('after-print')
          if (typeof this.afterPrint === 'function') {
            this.afterPrint()
          }
        }
      })
    },
    
    // 打印PDF
    printPDF() {
      if (!this.printId && !this.printSelector) {
        this.$message.error('未指定打印PDF路径')
        this.loading = false
        return
      }
      
      const pdfURL = this.printId || this.printSelector
      
      printJS({
        printable: pdfURL,
        type: 'pdf',
        showModal: true,
        onLoadingStart: () => {
          this.loading = true
        },
        onLoadingEnd: () => {
          this.loading = false
          this.$emit('after-print')
          if (typeof this.afterPrint === 'function') {
            this.afterPrint()
          }
        }
      })
    },
    
    // 打印图片
    printImage() {
      if (!this.printId && !this.printSelector) {
        this.$message.error('未指定打印图片路径')
        this.loading = false
        return
      }
      
      const imageURL = this.printId || this.printSelector
      
      printJS({
        printable: imageURL,
        type: 'image',
        documentTitle: this.printTitle,
        header: this.printTitle ? `<h1 style="text-align: center">${this.printTitle}</h1>` : '',
        imageStyle: 'width:100%;',
        onLoadingStart: () => {
          this.loading = true
        },
        onLoadingEnd: () => {
          this.loading = false
          this.$emit('after-print')
          if (typeof this.afterPrint === 'function') {
            this.afterPrint()
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.print-button-wrapper {
  display: inline-block;
}

.print-button-wrapper.inline {
  margin-right: 8px;
}
</style> 