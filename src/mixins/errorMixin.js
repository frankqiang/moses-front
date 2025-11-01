/**
 * 文件名称：errorMixin.js
 * 文件描述：业务层错误处理Mixin（健壮版）
 * 创建日期：2025-10-27
 * 修改记录：
 *   - 2025-10-31: 增强边界检查和错误保护，简化自定义处理器逻辑
 *
 * 设计原则：
 * 1. 始终显示错误消息（除非被拦截器处理）
 * 2. 业务层只需一行代码
 * 3. 额外逻辑放在catch块外面
 */

export default {
  methods: {
    /**
     * 处理API错误
     * @param {Error} error - API错误对象
     * @param {Object} options - 选项（可选）
     * @param {boolean} options.silent - 静默处理，不显示错误消息
     *
     * @example
     * // 场景1：最简单的用法（95%的场景）
     * catch (error) {
     *   this.handleError(error)
     * }
     *
     * // 场景2：需要额外逻辑
     * catch (error) {
     *   this.handleError(error)
     *   // 额外逻辑放在外面更清晰
     *   if (error.code === 'USER_EMAIL_ALREADY_EXISTS') {
     *     this.focusField('email')
     *   }
     * }
     *
     * // 场景3：静默处理（不显示错误消息）
     * catch (error) {
     *   this.handleError(error, { silent: true })
     *   this.$router.push('/login')
     * }
     */
    handleError(error, options = {}) {
      // 边界检查
      if (!error) {
        console.error('[errorMixin] error对象为空')
        return
      }

      // 拦截器已处理，不需要再显示
      if (error.handledByInterceptor) {
        return
      }

      // 静默模式，不显示错误消息
      if (options.silent) {
        return
      }

      // 显示错误消息
      const message = error.message || '操作失败'

      // 保护：确保 $message 存在
      if (!this.$message) {
        console.error('[errorMixin] $message未定义，无法显示错误消息:', message)
        return
      }

      // 开发环境打印详细错误信息
      if (process.env.NODE_ENV === 'development') {
        console.error('[errorMixin] 错误详情:', {
          code: error.code,
          message: error.message,
          status: error.status,
          details: error.details
        })
      }

      // 显示错误消息
      this.$message.error(message)
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
 *         this.handleError(error)  // ✅ 就这一行！
 *       }
 *     }
 *   }
 * }
 *
 * // 场景2：需要额外逻辑（5%的场景）
 * export default {
 *   mixins: [errorMixin],
 *
 *   methods: {
 *     async handleSubmit() {
 *       try {
 *         const res = await request.post('/v1/users', this.formData)
 *         this.$message.success(res.message)
 *       } catch (error) {
 *         this.handleError(error)  // ✅ 显示错误消息
 *
 *         // ✅ 额外逻辑放在外面，更清晰
 *         if (error.code === 'USER_EMAIL_ALREADY_EXISTS') {
 *           this.focusField('email')
 *         }
 *       }
 *     }
 *   }
 * }
 *
 * // 场景3：静默处理（不显示错误消息）
 * export default {
 *   mixins: [errorMixin],
 *
 *   methods: {
 *     async handleCheck() {
 *       try {
 *         const res = await request.get('/v1/users/check')
 *         return res.data
 *       } catch (error) {
 *         this.handleError(error, { silent: true })  // ✅ 不显示错误
 *         return null
 *       }
 *     }
 *   }
 * }
 *
 * // 场景4：需要跳转到其他页面
 * catch (error) {
 *   this.handleError(error)
 *   if (error.code === 'RESOURCE_NOT_FOUND') {
 *     this.$router.push('/list')
 *   }
 * }
 */
