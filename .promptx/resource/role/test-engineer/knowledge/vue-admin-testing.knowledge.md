<knowledge>
  <domain>Vue Admin Template 测试专业知识</domain>
  
  <concept>
    ## Vue.js 管理后台测试核心概念
    
    ### 组件测试策略
    - **单元测试**：针对独立组件的逻辑测试
    - **集成测试**：组件间交互和数据流测试
    - **快照测试**：UI组件渲染结果的回归测试
    - **可视化测试**：界面样式和布局的自动化验证
    
    ### 状态管理测试
    - **Vuex Store测试**：状态变更和副作用的验证
    - **Action测试**：异步操作和API调用的模拟
    - **Mutation测试**：状态变更逻辑的单元测试
    - **Getter测试**：计算属性和派生状态的验证
    
    ### 路由测试策略
    - **导航测试**：页面跳转和路由守卫的验证
    - **权限测试**：基于角色的访问控制测试
    - **参数传递**：路由参数和查询参数的正确性
    - **懒加载测试**：动态导入组件的加载验证
  </concept>
  
  <methodology>
    ## Vue Admin 测试方法论
    
    ### 测试金字塔在Vue项目中的应用
    ```
    E2E Tests (10%)
    ├── 关键业务流程
    ├── 用户完整操作路径
    └── 跨页面交互验证
    
    Integration Tests (20%)
    ├── 组件间通信
    ├── API集成测试
    └── 状态管理集成
    
    Unit Tests (70%)
    ├── 组件逻辑测试
    ├── 工具函数测试
    └── 业务逻辑测试
    ```
    
    ### 测试驱动开发在Vue中的实践
    1. **Red**: 编写失败的测试用例
    2. **Green**: 编写最小可行代码使测试通过
    3. **Refactor**: 重构代码保持测试通过
    4. **Repeat**: 循环进行直到功能完成
    
    ### 前端测试的特殊考虑
    - **异步操作处理**：Promise、async/await的测试策略
    - **DOM操作验证**：用户交互和事件处理的测试
    - **响应式数据**：Vue响应式系统的测试方法
    - **生命周期钩子**：组件生命周期的测试覆盖
  </methodology>
  
  <practice>
    ## Vue Admin 测试最佳实践
    
    ### 组件测试最佳实践
    ```javascript
    // 推荐的组件测试结构
    describe('UserTable Component', () => {
      let wrapper
      
      beforeEach(() => {
        wrapper = mount(UserTable, {
          props: { users: mockUsers },
          global: {
            plugins: [store, router]
          }
        })
      })
      
      it('should render user list correctly', () => {
        expect(wrapper.findAll('.user-row')).toHaveLength(3)
      })
      
      it('should emit edit event when edit button clicked', async () => {
        await wrapper.find('.edit-btn').trigger('click')
        expect(wrapper.emitted('edit')).toBeTruthy()
      })
    })
    ```
    
    ### API测试模拟策略
    ```javascript
    // 使用MSW进行API模拟
    import { rest } from 'msw'
    import { setupServer } from 'msw/node'
    
    const server = setupServer(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.json(mockUsers))
      })
    )
    
    beforeAll(() => server.listen())
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())
    ```
    
    ### 状态管理测试模式
    ```javascript
    // Vuex Store测试示例
    describe('User Store', () => {
      let store
      
      beforeEach(() => {
        store = createStore({
          modules: { user: userModule }
        })
      })
      
      it('should fetch users successfully', async () => {
        await store.dispatch('user/fetchUsers')
        expect(store.state.user.users).toHaveLength(3)
      })
    })
    ```
  </practice>
  
  <tool>
    ## Vue Admin 测试工具栈
    
    ### 核心测试框架
    - **Vitest**: 快速的单元测试框架，Vue 3官方推荐
    - **Vue Test Utils**: Vue组件测试的官方工具库
    - **Cypress**: 端到端测试框架，提供真实浏览器环境
    - **Playwright**: 跨浏览器的E2E测试解决方案
    
    ### 辅助测试工具
    - **MSW**: API模拟和拦截工具
    - **Testing Library**: 用户行为驱动的测试工具
    - **Storybook**: 组件开发和测试的可视化工具
    - **Chromatic**: 视觉回归测试平台
    
    ### 代码质量工具
    - **ESLint**: 代码规范检查
    - **Prettier**: 代码格式化
    - **Husky**: Git钩子管理
    - **lint-staged**: 暂存文件检查
    
    ### 测试覆盖率工具
    - **c8**: 代码覆盖率统计
    - **Istanbul**: 覆盖率报告生成
    - **Codecov**: 覆盖率可视化平台
  </tool>
  
  <pattern>
    ## Vue Admin 常见测试模式
    
    ### 表单测试模式
    ```javascript
    // 表单验证测试
    it('should validate required fields', async () => {
      const form = wrapper.find('form')
      await form.trigger('submit')
      
      expect(wrapper.find('.error-message').text())
        .toBe('用户名不能为空')
    })
    ```
    
    ### 表格测试模式
    ```javascript
    // 数据表格测试
    it('should sort table by column', async () => {
      await wrapper.find('.sort-btn').trigger('click')
      
      const rows = wrapper.findAll('.table-row')
      expect(rows[0].text()).toContain('Alice')
    })
    ```
    
    ### 权限测试模式
    ```javascript
    // 权限控制测试
    it('should hide admin actions for normal user', () => {
      const wrapper = mount(Component, {
        global: {
          provide: {
            userRole: 'user'
          }
        }
      })
      
      expect(wrapper.find('.admin-action').exists()).toBe(false)
    })
    ```
    
    ### 异步数据测试模式
    ```javascript
    // 异步数据加载测试
    it('should show loading state while fetching data', async () => {
      const promise = wrapper.vm.fetchData()
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading').exists()).toBe(true)
      
      await promise
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('.loading').exists()).toBe(false)
    })
    ```
  </pattern>
  
  <antipattern>
    ## Vue Admin 测试反模式
    
    ### 避免的测试反模式
    - ❌ **测试实现细节**：不要测试组件内部的私有方法
    - ❌ **过度模拟**：避免模拟所有依赖，保持测试的真实性
    - ❌ **脆弱的选择器**：不要依赖CSS类名或DOM结构
    - ❌ **测试耦合**：测试之间不应该有依赖关系
    - ❌ **忽略异步**：没有正确处理异步操作的测试
    
    ### 推荐的替代方案
    - ✅ **测试行为**：关注用户可见的行为和输出
    - ✅ **适度模拟**：只模拟外部依赖，保持核心逻辑真实
    - ✅ **语义选择器**：使用data-testid或角色选择器
    - ✅ **独立测试**：每个测试都应该能独立运行
    - ✅ **异步处理**：正确使用await和Vue的nextTick
  </antipattern>
</knowledge>