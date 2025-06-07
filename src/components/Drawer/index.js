import BaseDrawer from './index.vue'

BaseDrawer.install = function(Vue) {
  Vue.component(BaseDrawer.name, BaseDrawer)
}

export default BaseDrawer 