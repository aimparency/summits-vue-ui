import { createApp, reactive } from 'vue'
import App from './App.vue'
import State from './state'

let state: State = reactive({
  nodes: {}, 
  flows: {}
})

createApp(App)
  .use(({ config }) => {
    Object.assign(config.globalProperties, {
      state
    })
  })
  .mount('#app')


declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    state: State
  }
}
