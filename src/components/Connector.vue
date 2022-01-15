<template>
  <path
    class="connector"
    fill="white"
    :d="`M ${state.connectFrom.x},${state.connectFrom.y} L ${state.map.mouse.x},${state.map.mouse.y}`"
    :stroke-width="state.connectFrom.r * 100"
  />
  <circle
    cx='100'
    cy='100'
    r='100'
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NodeTools',
  emits: [
    'startMove', 
    'stopMove'
  ]
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.connector{
  stroke: #bbb; 
  stroke-dasharray: 100; 
}
</style>
