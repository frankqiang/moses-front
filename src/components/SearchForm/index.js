import SearchForm from './index.vue'

// 导出组件
SearchForm.install = function(Vue) {
  Vue.component(SearchForm.name, SearchForm)
}

export default SearchForm
