/**
 * 工序管理模块Mock入口
 */
const operations = require('./operations')
const routing = require('./routing')

module.exports = [
  ...operations,
  ...routing
] 