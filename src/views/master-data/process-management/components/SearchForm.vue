<template>
  <search-form-v2
    :items="searchFormConfig"
    :loading="loading"
    @search="handleSearch"
    @reset="handleReset"
  />
</template>

<script>
import { SEARCH_FORM_CONFIG } from '../constants'

export default {
  name: 'OperationSearchForm',
  
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