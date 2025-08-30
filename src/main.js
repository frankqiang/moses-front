import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// 导入全局组件
import StatusTag from '@/components/StatusTag'
import ActionButtons from '@/components/ActionButtons'
import SearchForm from '@/components/SearchForm'
import SearchFormV2 from '@/components/SearchFormV2'
import DialogForm from '@/components/DialogForm'
import DrawerForm from '@/components/DrawerForm'
import TableToolbar from '@/components/TableToolbar'
import Pagination from '@/components/Pagination'
import BatchAction from '@/components/BatchAction'
import RefreshButton from '@/components/RefreshButton'
import ImportButton from '@/components/ImportButton'
import ExportButton from '@/components/ExportButton'
import OverflowTagsPopover from '@/components/OverflowTagsPopover'
import ColumnSettings from '@/components/ColumnSettings'
import BaseTable from '@/components/BaseTable'

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// 导入存储清理初始化
import initStorageCleanupAsync from '@/utils/init-storage-cleanup'

// 导入数据迁移管理器
import dataMigrationManager from '@/utils/data-migration'

// 开发环境下导入存储清理工具
if (process.env.NODE_ENV === 'development') {
  import('@/utils/cleanup-duplicate-storage')
}

// set ElementUI lang to ZH-CN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

// 注册全局组件
Vue.component('StatusTag', StatusTag)
Vue.component('ActionButtons', ActionButtons)
Vue.component('SearchForm', SearchForm)
Vue.component('SearchFormV2', SearchFormV2)
Vue.component('DialogForm', DialogForm)
Vue.component('DrawerForm', DrawerForm)
Vue.component('TableToolbar', TableToolbar)
Vue.component('Pagination', Pagination)
Vue.component('BatchAction', BatchAction)
Vue.component('RefreshButton', RefreshButton)
Vue.component('ImportButton', ImportButton)
Vue.component('ExportButton', ExportButton)
Vue.component('OverflowTagsPopover', OverflowTagsPopover)
Vue.component('ColumnSettings', ColumnSettings)
Vue.component('BaseTable', BaseTable)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App),
  async mounted() {
    try {
      // 执行数据迁移（如果需要）
      if (dataMigrationManager.needsMigration()) {
        console.log('检测到需要数据迁移，开始执行...')
        await dataMigrationManager.performMigration()
        console.log('数据迁移完成')
      } else {
        console.log('无需数据迁移')
      }
      
      // 在应用挂载后初始化存储清理
      initStorageCleanupAsync()
    } catch (error) {
      console.error('应用初始化过程中发生错误:', error)
      // 即使迁移失败，也要继续初始化应用
      initStorageCleanupAsync()
    }
  }
})
