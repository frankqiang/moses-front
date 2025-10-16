import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import permission from './modules/permission'
import dictionary from './modules/dictionary'
import maintenancePlan from './modules/mdm/tpm/maintenancePlan'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    permission,
    dictionary,
    maintenancePlan
  },
  getters
})

export default store
