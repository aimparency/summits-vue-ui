import { createApp, reactive } from 'vue'
import App from './App.vue'
import State from './state'

let state: State = reactive({
  nodes: {}, 
  flows: {}, 
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
