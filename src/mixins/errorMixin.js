/**
 * 文件名称：errorMixin.js
 * 文件描述：业务层错误处理Mixin（极简版）
 * 创建日期：2025-10-27
 *
 * 设计原则：业务层只需要简单显示错误消息
 */

export default {
  methods: {
    /**
     * 处理API错误（极简版）
     * @param {Error} error - API错误对象
     * @param {Object} options - 选项
     *
     * @example
     * // 最简单的用法
     * catch (error) {
     *   this.handleError(error)
     * }
     *
     * // 自定义特定错误码的处理
     * catch (error) {
     *   this.handleError(error, {
     *     'USER_EMAIL_ALREADY_EXISTS': () => {
     *       this.$message.error('邮箱已存在')
     *       this.focusField('email')
     *     }
     *   })
     * }
     */
    handleError(error, customHandlers = {}) {
      // 拦截器已处理，不需要再显示
      if (error.handledByInterceptor) {
        return
      }

      // 自定义错误码处理
      if (customHandlers[error.code]) {
        customHandlers[error.code](error)
        return
      }

      // 默认：直接显示后端返回的错误消息
      this.$message.error(error.message || '操作失败')
    },

    /**
     * 聚焦到表单字段（可选）
     */
    focusField(field) {
      this.$nextTick(() => {
        const fieldEl = this.$refs[field]
        if (fieldEl?.focus) {
          fieldEl.focus()
        } else if (fieldEl?.$el) {
          const input = fieldEl.$el.querySelector('input') || fieldEl.$el.querySelector('textarea')
          input?.focus()
        }
      })
    }
  }
}

/**
 * ==================== 使用示例 ====================
 *
 * // 场景1：最简单的用法（95%的场景）
 * import errorMixin from '@/mixins/errorMixin'
 *
 * export default {
 *   mixins: [errorMixin],
 *
 *   methods: {
 *     async handleSubmit() {
 *       try {
 *         const res = await request.post('/v1/users', this.formData)
 *         this.$message.success(res.message)
 *       } catch (error) {
 *         this.handleError(error)  // 就这一行！
 *       }
 *     }
 *   }
 * }
 *
 * // 场景2：需要自定义处理某些错误码（5%的场景）
 * export default {
 *   mixins: [errorMixin],
 *
 *   methods: {
 *     async handleSubmit() {
 *       try {
 *         const res = await request.post('/v1/users', this.formData)
 *         this.$message.success(res.message)
 *       } catch (error) {
 *         this.handleError(error, {
 *           // 只对特殊的错误码自定义处理
 *           'USER_EMAIL_ALREADY_EXISTS': () => {
 *             this.$message.error('邮箱已存在，请更换')
 *             this.focusField('email')
 *           }
 *         })
 *       }
 *     }
 *   }
 * }
 *
 * // 场景3：不需要显示错误（静默处理）
 * catch (error) {
 *   if (error.handledByInterceptor) return  // 拦截器已处理
 *   // 不调用 handleError，自己处理
 *   console.error(error)
 * }
 */
