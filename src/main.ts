import { createApp } from 'vue';
import { createStore, Store } from 'vuex'; 

import App from './App.vue';
import State, { getDefault } from './state';
import { mutations } from './mutations'; 
import { actions } from './actions';
import { getters } from './getters'; 

import createMousePositionUpdater from './mouse-position-updater';
import createNearLink from './near-link'; 

const store = createStore({
  state: getDefault, 
  mutations,
  actions, 
  getters, 
  plugins: [
    createMousePositionUpdater(),
    createNearLink()
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
