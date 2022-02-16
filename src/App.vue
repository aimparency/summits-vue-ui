<template>
  <GraphExplorer/>
  <SideMenu/>
  <Log/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GraphExplorer from './components/GraphExplorer.vue';
import SideMenu from './components/SideMenu.vue';
import Log from './components/Log.vue';

export default defineComponent({
  name: 'App',
  components: {
    GraphExplorer, 
    SideMenu, 
    Log
  }, 
  data() {
    return {
    } as {
      socket?: WebSocket
    }
  }, 
  methods: {
  }
});
</script>

<style lang="less">
@import '~@/global.less';
* {
  overflow: hidden
}
body {
  color: @foreground; 
}
#app {
  margin: 0; 
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw; 
  height: 100vh; 
}
</style>
