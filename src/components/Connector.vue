<template>
  <path
    class="connector"
    fill="white"
    :d="path"
    :stroke-width="$store.state.connectFrom.r * 100"
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
      if(this.$store.state.connectFrom) {
        return makeCircularPath(
          {
            x: this.$store.state.connectFrom.x, 
            y: this.$store.state.connectFrom.y, 
            r: this.$store.state.connectFrom.r
          }, 
          0.1 * 1000, 
          {
            x: this.$store.state.map.mouse.x,		
            y: this.$store.state.map.mouse.y,		
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
