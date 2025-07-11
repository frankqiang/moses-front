<template>
  <search-form-v2
    :items="searchFormConfig"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import SearchFormV2 from '@/components/SearchFormV2'
import { SEARCH_FORM_CONFIG } from '../constants'

export default {
  name: 'RoutingSearchForm',
  components: {
    SearchFormV2
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