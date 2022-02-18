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
body {
  color: @foreground; 
  overflow: hidden
}
#app {
  font-family: sans-serif;
}
</style>
