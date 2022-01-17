<template>
  <path
    class="connector"
    fill="white"
    :d="path"
    :stroke-width="state.connectFrom.r * 100"
    
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import makeCircularPath from '@/tools/make-circular-path';

export default defineComponent({
  name: 'NodeTools',
  emits: [
    'startMove', 
    'stopMove'
  ], 
  computed: {
    path() : string {
      // :d="`M ${state.connectFrom.x},${state.connectFrom.y} L ${state.map.mouse.x},${state.map.mouse.y}`"
      if(this.state.connectFrom) {
        return makeCircularPath(
          {
            x: this.state.connectFrom.x, 
            y: this.state.connectFrom.y, 
            r: this.state.connectFrom.r
          }, 
          0.1 * 1000, 
          {
            x: this.state.map.mouse.x,		
            y: this.state.map.mouse.y,		
            r: 0
          }
        )
      } else {
        return ""
      }
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.connector{
  fill: #bbb; 
  stroke: none; 
}
</style>
