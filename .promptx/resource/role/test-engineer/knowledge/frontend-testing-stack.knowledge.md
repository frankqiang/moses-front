<knowledge>
  <domain>前端测试技术栈专业知识</domain>
  
  <concept>
    ## 现代前端测试技术体系
    
    ### 测试分层架构
    ```
    ┌─────────────────────────────────────┐
    │           E2E Tests                 │  ← 用户完整流程测试
    ├─────────────────────────────────────┤
    │        Integration Tests            │  ← 模块间集成测试
    ├─────────────────────────────────────┤
    │          Unit Tests                 │  ← 单元功能测试
    ├─────────────────────────────────────┤
    │        Static Analysis             │  ← 静态代码分析
    └─────────────────────────────────────┘
    ```
    
    ### 测试类型分类
    - **功能测试**：验证功能是否按预期工作
    - **性能测试**：验证应用的响应时间和资源使用
    - **可访问性测试**：确保应用对所有用户可用
    - **视觉回归测试**：检测UI变化和样式问题
    - **安全测试**：验证应用的安全性和数据保护
    
    ### 测试环境分类
    - **开发环境**：本地开发时的快速反馈测试
    - **集成环境**：模拟生产环境的集成测试
    - **预发布环境**：生产前的最终验证测试
    - **生产环境**：线上监控和健康检查
  </concept>
  
  <methodology>
    ## 前端测试方法论
    
    ### 测试驱动开发 (TDD)
    ```mermaid
    graph LR
        A[编写测试] --> B[运行测试]
        B --> C[编写代码]
        C --> D[重构代码]
        D --> A
    ```
    
    ### 行为驱动开发 (BDD)
    ```gherkin
    Feature: 用户登录
      Scenario: 成功登录
        Given 用户在登录页面
        When 输入正确的用户名和密码
        And 点击登录按钮
        Then 应该跳转到首页
        And 显示用户欢迎信息
    ```
    
    ### 测试左移策略
    - **需求阶段**：编写验收标准和测试场景
    - **设计阶段**：设计可测试的架构和接口
    - **开发阶段**：同步编写单元测试和集成测试
    - **部署阶段**：自动化测试和持续监控
  </methodology>
  
  <practice>
    ## 前端测试最佳实践
    
    ### 单元测试最佳实践
    ```javascript
    // AAA模式：Arrange, Act, Assert
    describe('calculateTotal', () => {
      it('should calculate total with tax correctly', () => {
        // Arrange
        const items = [{ price: 100 }, { price: 200 }]
        const taxRate = 0.1
        
        // Act
        const result = calculateTotal(items, taxRate)
        
        // Assert
        expect(result).toBe(330)
      })
    })
    ```
    
    ### 集成测试最佳实践
    ```javascript
    // 测试组件间的数据流
    describe('UserProfile Integration', () => {
      it('should update user info across components', async () => {
        const { getByRole, getByText } = render(<App />)
        
        // 模拟用户操作
        await userEvent.click(getByRole('button', { name: '编辑' }))
        await userEvent.type(getByRole('textbox'), '新名称')
        await userEvent.click(getByRole('button', { name: '保存' }))
        
        // 验证结果
        expect(getByText('新名称')).toBeInTheDocument()
      })
    })
    ```
    
    ### E2E测试最佳实践
    ```javascript
    // Cypress E2E测试
    describe('用户管理流程', () => {
      it('应该能够创建新用户', () => {
        cy.visit('/users')
        cy.get('[data-cy=add-user]').click()
        cy.get('[data-cy=username]').type('testuser')
        cy.get('[data-cy=email]').type('test@example.com')
        cy.get('[data-cy=submit]').click()
        
        cy.contains('用户创建成功').should('be.visible')
        cy.get('[data-cy=user-list]').should('contain', 'testuser')
      })
    })
    ```
  </practice>
  
  <tool>
    ## 前端测试工具生态
    
    ### 测试框架对比
    | 框架 | 特点 | 适用场景 | 性能 |
    |------|------|----------|------|
    | **Jest** | 功能全面，配置简单 | React项目，通用JS测试 | 中等 |
    | **Vitest** | 基于Vite，速度快 | Vue 3项目，现代构建工具 | 很快 |
    | **Mocha** | 灵活性高，插件丰富 | 需要自定义配置的项目 | 中等 |
    | **Jasmine** | 语法简洁，无依赖 | 简单项目，学习测试 | 快 |
    
    ### E2E测试工具对比
    | 工具 | 优势 | 劣势 | 推荐场景 |
    |------|------|------|----------|
    | **Cypress** | 开发体验好，调试方便 | 只支持Chrome系 | 开发阶段测试 |
    | **Playwright** | 跨浏览器，性能好 | 学习成本高 | CI/CD环境 |
    | **Puppeteer** | Chrome深度集成 | 只支持Chrome | 爬虫和自动化 |
    | **Selenium** | 生态成熟，语言支持多 | 配置复杂，速度慢 | 传统项目 |
    
    ### 测试辅助工具
    ```yaml
    代码覆盖率:
      - c8: 现代覆盖率工具
      - nyc: Istanbul的CLI工具
      - codecov: 覆盖率可视化
    
    API模拟:
      - MSW: 服务工作者模拟
      - json-server: 快速API模拟
      - nock: HTTP请求拦截
    
    视觉测试:
      - Percy: 视觉回归测试
      - Chromatic: Storybook集成
      - BackstopJS: 开源视觉测试
    
    性能测试:
      - Lighthouse: 性能审计
      - WebPageTest: 性能分析
      - k6: 负载测试
    ```
  </tool>
  
  <pattern>
    ## 前端测试设计模式
    
    ### Page Object模式
    ```javascript
    // 页面对象封装
    class LoginPage {
      constructor(page) {
        this.page = page
        this.usernameInput = page.locator('[data-testid=username]')
        this.passwordInput = page.locator('[data-testid=password]')
        this.loginButton = page.locator('[data-testid=login]')
      }
      
      async login(username, password) {
        await this.usernameInput.fill(username)
        await this.passwordInput.fill(password)
        await this.loginButton.click()
      }
    }
    ```
    
    ### Test Factory模式
    ```javascript
    // 测试数据工厂
    const createUser = (overrides = {}) => ({
      id: Math.random().toString(36),
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      ...overrides
    })
    
    // 使用
    const adminUser = createUser({ role: 'admin' })
    const guestUser = createUser({ role: 'guest' })
    ```
    
    ### Custom Hooks测试模式
    ```javascript
    // React Hook测试
    import { renderHook, act } from '@testing-library/react'
    
    describe('useCounter', () => {
      it('should increment counter', () => {
        const { result } = renderHook(() => useCounter())
        
        act(() => {
          result.current.increment()
        })
        
        expect(result.current.count).toBe(1)
      })
    })
    ```
    
    ### 异步测试模式
    ```javascript
    // Promise测试
    it('should handle async operations', async () => {
      const promise = fetchUserData()
      
      // 测试loading状态
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      
      // 等待异步完成
      const user = await promise
      
      // 测试结果
      expect(user.name).toBe('John Doe')
    })
    ```
  </pattern>
  
  <antipattern>
    ## 前端测试反模式
    
    ### 常见测试反模式
    
    #### ❌ 测试实现细节
    ```javascript
    // 错误：测试组件内部状态
    expect(wrapper.vm.internalCounter).toBe(5)
    
    // 正确：测试用户可见的行为
    expect(screen.getByText('Count: 5')).toBeInTheDocument()
    ```
    
    #### ❌ 过度模拟
    ```javascript
    // 错误：模拟所有依赖
    jest.mock('./utils')
    jest.mock('./api')
    jest.mock('./components')
    
    // 正确：只模拟外部依赖
    jest.mock('./api')
    ```
    
    #### ❌ 脆弱的选择器
    ```javascript
    // 错误：依赖CSS类名
    wrapper.find('.btn-primary')
    
    // 正确：使用语义化选择器
    screen.getByRole('button', { name: '提交' })
    ```
    
    #### ❌ 测试耦合
    ```javascript
    // 错误：测试间有依赖
    describe('User Tests', () => {
      let userId
      
      it('should create user', () => {
        userId = createUser().id // 其他测试依赖这个ID
      })
      
      it('should update user', () => {
        updateUser(userId) // 依赖上一个测试
      })
    })
    ```
    
    ### 推荐的解决方案
    
    #### ✅ 测试用户行为
    ```javascript
    // 关注用户能看到和操作的内容
    it('should show success message after form submission', async () => {
      await userEvent.type(screen.getByLabelText('用户名'), 'testuser')
      await userEvent.click(screen.getByRole('button', { name: '提交' }))
      
      expect(await screen.findByText('提交成功')).toBeInTheDocument()
    })
    ```
    
    #### ✅ 适度模拟
    ```javascript
    // 只模拟真正的外部依赖
    jest.mock('../api/userService', () => ({
      fetchUsers: jest.fn().mockResolvedValue(mockUsers)
    }))
    ```
    
    #### ✅ 稳定的选择器
    ```javascript
    // 使用data-testid或语义化属性
    <button data-testid="submit-btn" aria-label="提交表单">
      提交
    </button>
    
    // 测试中使用
    screen.getByTestId('submit-btn')
    screen.getByRole('button', { name: '提交表单' })
    ```
    
    #### ✅ 独立测试
    ```javascript
    // 每个测试都独立设置数据
    describe('User Tests', () => {
      beforeEach(() => {
        // 每个测试前重置状态
        resetDatabase()
      })
      
      it('should create user', () => {
        const user = createUser()
        expect(user).toBeDefined()
      })
      
      it('should update user', () => {
        const user = createUser() // 独立创建测试数据
        const updated = updateUser(user.id)
        expect(updated).toBeDefined()
      })
    })
    ```
  </antipattern>
</knowledge>