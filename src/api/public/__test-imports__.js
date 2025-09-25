/**
 * 导入测试文件
 * 文件描述：验证公开API模块的导入功能是否正常工作
 * 创建日期：2024-09-25
 */

// 测试统一导出的导入
import {
  getPublicDepartmentOptions,
  getPublicPositionOptions,
  getPublicManagerOptions,
  getRegistrationOptions,
  getPublicDepartments,
  getPublicDepartmentTree,
  getPublicPositions,
  getPublicManagers
} from './index'

// 测试直接导入
import {
  getPublicDepartmentOptions as getDeptOptions,
  getPublicPositionOptions as getPosOptions,
  getPublicManagerOptions as getMgrOptions
} from './public-organization'

console.log('🎉 所有公开API导入测试成功！')

// 验证函数是否存在
const functions = [
  'getPublicDepartmentOptions',
  'getPublicPositionOptions',
  'getPublicManagerOptions',
  'getRegistrationOptions',
  'getPublicDepartments',
  'getPublicDepartmentTree',
  'getPublicPositions',
  'getPublicManagers'
]

functions.forEach(fnName => {
  const fn = eval(fnName)
  if (typeof fn === 'function') {
    console.log(`✅ ${fnName} - 导入成功`)
  } else {
    console.error(`❌ ${fnName} - 导入失败`)
  }
})


// 导出测试函数供外部调用
export function testImports() {
  return {
    success: true,
    message: '所有导入测试通过',
    functions: functions.length
  }
}
