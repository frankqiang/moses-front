/**
 * 文件名称：index.js
 * 文件描述：料框/料垛管理API统一导出入口
 * 创建日期：2025-01-10
 * 修改记录:
 *   - 2025-01-10: 初始创建，统一导出料框和料垛管理接口
 */

// 料框管理接口
export {
  registerBin,
  batchRegisterBins,
  getBinList,
  getBinDetail,
  updateBinStatus,
  getBinStatusHistory
} from './bin-management'

// 料垛管理接口
export {
  createStack,
  getStackList,
  getStackDetail,
  destackStack,
  getStackBins
} from './stack-management'
