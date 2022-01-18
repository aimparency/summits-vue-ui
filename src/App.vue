<template>
  <GraphExplorer/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import GraphExplorer from './components/GraphExplorer.vue';

export default defineComponent({
  name: 'App',
  components: {
    GraphExplorer 
  }, 
  data() {
    return {
    } as {
      socket?: WebSocket
    }
  }, 
  beforeMount() {
    console.log('connecting to aggregator') 
  }, 
  methods: {
  }
});
</script>

<style lang="less">
* {
  margin: 0; 
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw; 
  height: 100vh; 
}
</style>
