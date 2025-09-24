/**
 * 文件名称：api-test.js
 * 文件描述：组织结构管理模块API接口功能测试文件
 * 创建日期：2024-01-20
 * 说明：此文件用于开发阶段测试API接口功能，生产环境中应移除
 */

import {
  // 部门管理API
  createDepartment,
  getDepartmentList,
  getDepartmentTree,
  getDepartmentDetail,
  updateDepartment,
  deleteDepartment,
  updateDepartmentStatus,
  getDepartmentOptions,

  // 岗位管理API
  createPosition,
  getPositionList,
  getPositionDetail,
  updatePosition,
  deletePosition,
  updatePositionStatus,
  getPositionOptions
} from './index'

/**
 * API接口测试类
 * 用于验证所有API接口的基本功能
 */
class OrganizationStructureApiTest {
  constructor() {
    this.testResults = []
    this.testDepartmentId = null
    this.testPositionId = null
  }

  /**
   * 记录测试结果
   * @param {string} testName - 测试名称
   * @param {boolean} success - 是否成功
   * @param {any} data - 测试数据
   * @param {Error} error - 错误信息
   */
  logResult(testName, success, data = null, error = null) {
    const result = {
      testName,
      success,
      timestamp: new Date().toISOString(),
      data: success ? data : null,
      error: error ? {
        code: error.code,
        message: error.message,
        status: error.status
      } : null
    }

    this.testResults.push(result)

    if (success) {
      console.log(`✅ ${testName} - 测试通过`)
    } else {
      console.error(`❌ ${testName} - 测试失败:`, error?.message || '未知错误')
    }
  }

  /**
   * 测试部门管理API
   */
  async testDepartmentApis() {
    console.log('\n=== 开始测试部门管理API ===')

    // 1. 测试获取部门列表
    try {
      const response = await getDepartmentList({ limit: 5, page: 1 })
      this.logResult('获取部门列表', true, response.data)
    } catch (error) {
      this.logResult('获取部门列表', false, null, error)
    }

    // 2. 测试获取部门树形结构
    try {
      const response = await getDepartmentTree()
      this.logResult('获取部门树形结构', true, response.data)
    } catch (error) {
      this.logResult('获取部门树形结构', false, null, error)
    }

    // 3. 测试创建部门
    try {
      const testDepartmentData = {
        name: '测试部门_API_TEST',
        code: 'TEST_DEPT_001',
        description: 'API测试创建的部门，可以删除',
        status: 'active'
      }

      const response = await createDepartment(testDepartmentData)
      this.testDepartmentId = response.data.id
      this.logResult('创建部门', true, response.data)
    } catch (error) {
      this.logResult('创建部门', false, null, error)
    }

    // 4. 测试获取部门详情
    if (this.testDepartmentId) {
      try {
        const response = await getDepartmentDetail(this.testDepartmentId)
        this.logResult('获取部门详情', true, response.data)
      } catch (error) {
        this.logResult('获取部门详情', false, null, error)
      }

      // 5. 测试更新部门信息
      try {
        const updateData = {
          description: 'API测试更新的部门描述'
        }
        const response = await updateDepartment(this.testDepartmentId, updateData)
        this.logResult('更新部门信息', true, response.data)
      } catch (error) {
        this.logResult('更新部门信息', false, null, error)
      }

      // 6. 测试变更部门状态
      try {
        const response = await updateDepartmentStatus(this.testDepartmentId, { status: 'inactive' })
        this.logResult('变更部门状态', true, response.data)

        // 恢复状态
        await updateDepartmentStatus(this.testDepartmentId, { status: 'active' })
      } catch (error) {
        this.logResult('变更部门状态', false, null, error)
      }
    }

    // 7. 测试获取部门选项
    try {
      const response = await getDepartmentOptions({ status: 'active' })
      this.logResult('获取部门选项', true, response.data.options)
    } catch (error) {
      this.logResult('获取部门选项', false, null, error)
    }

    // 8. 测试删除部门（清理测试数据）
    if (this.testDepartmentId) {
      try {
        const response = await deleteDepartment(this.testDepartmentId)
        this.logResult('删除部门', true, response.data)
        this.testDepartmentId = null
      } catch (error) {
        this.logResult('删除部门', false, null, error)
      }
    }
  }

  /**
   * 测试岗位管理API
   */
  async testPositionApis() {
    console.log('\n=== 开始测试岗位管理API ===')

    // 1. 测试获取岗位列表
    try {
      const response = await getPositionList({ limit: 5, page: 1 })
      this.logResult('获取岗位列表', true, response.data)
    } catch (error) {
      this.logResult('获取岗位列表', false, null, error)
    }

    // 2. 测试创建岗位
    try {
      const testPositionData = {
        name: '测试岗位_API_TEST',
        code: 'TEST_POS_001',
        description: 'API测试创建的岗位，可以删除',
        level: 1,
        status: 'active'
      }

      const response = await createPosition(testPositionData)
      this.testPositionId = response.data.id
      this.logResult('创建岗位', true, response.data)
    } catch (error) {
      this.logResult('创建岗位', false, null, error)
    }

    // 3. 测试获取岗位详情
    if (this.testPositionId) {
      try {
        const response = await getPositionDetail(this.testPositionId)
        this.logResult('获取岗位详情', true, response.data)
      } catch (error) {
        this.logResult('获取岗位详情', false, null, error)
      }

      // 4. 测试更新岗位信息
      try {
        const updateData = {
          description: 'API测试更新的岗位描述'
        }
        const response = await updatePosition(this.testPositionId, updateData)
        this.logResult('更新岗位信息', true, response.data)
      } catch (error) {
        this.logResult('更新岗位信息', false, null, error)
      }

      // 5. 测试变更岗位状态
      try {
        const response = await updatePositionStatus(this.testPositionId, { status: 'inactive' })
        this.logResult('变更岗位状态', true, response.data)

        // 恢复状态
        await updatePositionStatus(this.testPositionId, { status: 'active' })
      } catch (error) {
        this.logResult('变更岗位状态', false, null, error)
      }
    }

    // 6. 测试获取岗位选项
    try {
      const response = await getPositionOptions({ status: 'active' })
      this.logResult('获取岗位选项', true, response.data.options)
    } catch (error) {
      this.logResult('获取岗位选项', false, null, error)
    }

    // 7. 测试删除岗位（清理测试数据）
    if (this.testPositionId) {
      try {
        const response = await deletePosition(this.testPositionId)
        this.logResult('删除岗位', true, response.data)
        this.testPositionId = null
      } catch (error) {
        this.logResult('删除岗位', false, null, error)
      }
    }
  }

  /**
   * 测试错误处理机制
   */
  async testErrorHandling() {
    console.log('\n=== 开始测试错误处理机制 ===')

    // 1. 测试创建重复编码的部门
    try {
      await createDepartment({
        name: '重复编码测试',
        code: 'DUPLICATE_CODE_TEST'
      })

      // 再次创建相同编码的部门，应该返回重复错误
      await createDepartment({
        name: '重复编码测试2',
        code: 'DUPLICATE_CODE_TEST'
      })

      this.logResult('重复编码错误处理', false, null, new Error('应该返回重复错误'))
    } catch (error) {
      if (error.code === 'DUPLICATE_RESOURCE') {
        this.logResult('重复编码错误处理', true, error)
      } else {
        this.logResult('重复编码错误处理', false, null, error)
      }
    }

    // 2. 测试访问不存在的资源
    try {
      await getDepartmentDetail('00000000-0000-0000-0000-000000000000')
      this.logResult('资源不存在错误处理', false, null, new Error('应该返回资源不存在错误'))
    } catch (error) {
      if (error.code === 'RESOURCE_NOT_FOUND') {
        this.logResult('资源不存在错误处理', true, error)
      } else {
        this.logResult('资源不存在错误处理', false, null, error)
      }
    }

    // 3. 测试参数验证错误
    try {
      await createDepartment({
        // 缺少必填字段
      })
      this.logResult('参数验证错误处理', false, null, new Error('应该返回验证错误'))
    } catch (error) {
      if (error.code === 'VAL_001') {
        this.logResult('参数验证错误处理', true, error)
      } else {
        this.logResult('参数验证错误处理', false, null, error)
      }
    }
  }

  /**
   * 测试防重复提交机制
   */
  async testDuplicateRequestPrevention() {
    console.log('\n=== 开始测试防重复提交机制 ===')

    try {
      // 同时发送多个相同的请求
      const requests = [
        getDepartmentList({ page: 1, limit: 10 }),
        getDepartmentList({ page: 1, limit: 10 }),
        getDepartmentList({ page: 1, limit: 10 })
      ]

      const responses = await Promise.all(requests)

      // 检查是否返回了相同的响应
      const allSame = responses.every(response =>
        JSON.stringify(response) === JSON.stringify(responses[0])
      )

      this.logResult('防重复提交机制', allSame, responses[0])
    } catch (error) {
      this.logResult('防重复提交机制', false, null, error)
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始运行组织结构管理API测试...')

    this.testResults = []

    try {
      await this.testDepartmentApis()
      await this.testPositionApis()
      await this.testErrorHandling()
      await this.testDuplicateRequestPrevention()
    } catch (error) {
      console.error('测试运行过程中发生错误:', error)
    }

    this.printTestSummary()
  }

  /**
   * 打印测试总结
   */
  printTestSummary() {
    console.log('\n=== 测试总结 ===')

    const totalTests = this.testResults.length
    const passedTests = this.testResults.filter(r => r.success).length
    const failedTests = totalTests - passedTests

    console.log(`总测试数: ${totalTests}`)
    console.log(`通过: ${passedTests}`)
    console.log(`失败: ${failedTests}`)
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`)

    if (failedTests > 0) {
      console.log('\n失败的测试:')
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`- ${r.testName}: ${r.error?.message || '未知错误'}`)
        })
    }

    // 返回详细测试结果
    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: (passedTests / totalTests) * 100
      },
      details: this.testResults
    }
  }

  /**
   * 清理测试数据
   */
  async cleanup() {
    console.log('\n=== 清理测试数据 ===')

    if (this.testDepartmentId) {
      try {
        await deleteDepartment(this.testDepartmentId)
        console.log('✅ 清理测试部门成功')
      } catch (error) {
        console.error('❌ 清理测试部门失败:', error.message)
      }
    }

    if (this.testPositionId) {
      try {
        await deletePosition(this.testPositionId)
        console.log('✅ 清理测试岗位成功')
      } catch (error) {
        console.error('❌ 清理测试岗位失败:', error.message)
      }
    }
  }
}

// 导出测试类
export default OrganizationStructureApiTest

/**
 * 使用示例
 *
 * 在开发环境中运行测试：
 * ```javascript
 * import OrganizationStructureApiTest from '@/views/organization-structure/api/api-test'
 *
 * // 创建测试实例
 * const apiTest = new OrganizationStructureApiTest()
 *
 * // 运行所有测试
 * const results = await apiTest.runAllTests()
 *
 * // 清理测试数据
 * await apiTest.cleanup()
 *
 * console.log('测试结果:', results)
 * ```
 *
 * 在Vue组件中使用：
 * ```javascript
 * async testApi() {
 *   const apiTest = new OrganizationStructureApiTest()
 *
 *   try {
 *     const results = await apiTest.runAllTests()
 *
 *     if (results.summary.successRate === 100) {
 *       this.$message.success('所有API测试通过！')
 *     } else {
 *       this.$message.warning(`API测试完成，成功率: ${results.summary.successRate.toFixed(2)}%`)
 *     }
 *   } catch (error) {
 *     this.$message.error('API测试运行失败')
 *   } finally {
 *     await apiTest.cleanup()
 *   }
 * }
 * ```
 */
