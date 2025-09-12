<template>
  <SearchForm
    :items="searchFormConfig"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchForm from '@/components/SearchForm'
import { SEARCH_FORM_CONFIG } from '../constants'

export default {
  name: 'RoutingSearchForm',
  components: {
    SearchForm
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      searchFormConfig: SEARCH_FORM_CONFIG
    }
  },

  methods: {
    handleSearch(formData) {
      this.$emit('search', formData)
    },

    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>
