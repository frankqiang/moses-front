const Mock = require('mockjs')
const { param2Obj } = require('./utils/index')

const user = require('./user')
const table = require('./table')
const materialCode = require('./master-data/material-code')
const equipment = require('./master-data/equipment')
const binSpecification = require('./master-data/bin-specification')
const productManagement = require('./master-data/product-management')
const storageLocation = require('./master-data/storage-location')
const warehouse = require('./master-data/warehouse')
const processParameter = require('./master-data/process-parameter')
const furnaceType = require('./master-data/furnace-type')
const operations = require('./master-data/process-management/operations')
const routing = require('./master-data/process-management/routing')
const qualityManagement = require('./master-data/quality-management')

/**
 * Mock 模块加载顺序和路由优先级约定：
 * 
 * 在此 `mocks` 数组中，模块的排列顺序将直接影响全局 Mock 路由的匹配优先级。
 * Mock.js 会按照数组中的顺序注册路由。因此，为了避免路由匹配冲突，
 * 必须遵循以下原则：
 * 
 * 1. **更具体的路由模块应放在更通用的路由模块之前加载。**
 *    例如：如果 'routing' 模块包含 'check-code-unique' (更具体) 和 '' (更通用) 路由，
 *    那么 'routing' 模块应该放在其他可能与 'routing' 模块通用路径冲突的模块之前。
 * 
 * 2. **在各个 Mock 模块内部 (如 `mock/master-data/process-management/operations/index.js`)，**
 *    **也应遵循类似的“从具体到通用”的路由定义顺序，并尽可能利用正则表达式的负向前瞻断言**
 *    **(`(?!...)`) 来明确路由的特异性。**
 * 
 * 遵循此约定可以确保 Mock 路由的正确匹配，并提高 Mock 架构的健壮性和可维护性。
 */
const mocks = [
  ...user,
  ...table,
  ...materialCode,
  ...equipment,
  ...binSpecification,
  ...productManagement,
  ...storageLocation,
  ...warehouse,
  ...processParameter,
  ...furnaceType,
  ...operations,
  ...routing,
  ...qualityManagement
]

// for front mock
// please use it cautiously, it will redefine XMLHttpRequest,
// which will cause many of your third-party libraries to be invalidated(like progress event).
function mockXHR() {
  // mock patch
  // https://github.com/nuysoft/Mock/issues/300
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send
  Mock.XHR.prototype.send = function() {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false

      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType
      }
    }
    this.proxy_send(...arguments)
  }

  function XHR2ExpressReqWrap(respond) {
    return function(options) {
      let result = null
      if (respond instanceof Function) {
        const { body, type, url } = options
        // https://expressjs.com/en/4x/api.html#req
        result = respond({
          method: type,
          body: JSON.parse(body),
          query: param2Obj(url)
        })
      } else {
        result = respond
      }
      return Mock.mock(result)
    }
  }

  for (const i of mocks) {
    Mock.mock(new RegExp(i.url), i.type || 'get', XHR2ExpressReqWrap(i.response))
  }
}

module.exports = {
  mocks,
  mockXHR
}

