import { createApp } from 'vue'
import { createStore, Store } from 'vuex'; 

import App from './App.vue'
import State from './state'
import { mutations } from './mutations'
import { actions } from './actions'
import { getters } from './getters'

import createAggregatorLink from './aggregator-link'
import createMousePositionUpdater from './mouse-position-updater';

const store = createStore({
  state () : State {
    return {
      nodes: {}, 
      flows_from_into: {}, 
      flows_into_from: {},
      map: {
        mouse: {
          x: 0, 
          y: 0
        }, 
        offset: {
          x: 0, 
          y: 0 
        }, 
        scale: 0.1
      }
    }
  }, 
  mutations,
  actions, 
  getters, 
  plugins: [
    createMousePositionUpdater(),
    createAggregatorLink()
  ]
}) 

createApp(App)
  .use(store)
  .mount('#app')

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}
