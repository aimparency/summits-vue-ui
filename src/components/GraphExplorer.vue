<template>
  <svg 
    class='graph-explorer'
    :class='{grabbing}'
    viewBox="-1 -1 2 2">
    <circle
      cx='0'
      cy='0'
      r='50'/>
    <g :transform="transform">
      <FlowSVG v-for="flow in flows" 
        :key="`${flow.from_id}x${flow.into_id}`"
        :flow="flow"/>
      <Connector v-if="$store.state.connectFrom !== undefined"/>
      <NodeSVG v-for="node in nodes" 
        :key="node.id"
        :node="node"/>
    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NodeSVG from './NodeSVG.vue';
import FlowSVG from './FlowSVG.vue';
import Connector from './Connector.vue';

import { Flow, Node } from '@/types';

export default defineComponent({
  name: 'GraphExplorer',
  components: {
    NodeSVG, 
    FlowSVG, 
    Connector
  },
  computed: {
    grabbing() : boolean {
      return this.$store.state.map.panning;
    }, 
    transform() : string {
      const map = this.$store.state.map;
      return [
        `scale(${map.scale})`, 
        `translate(${-map.offset.x}, ${-map.offset.y})`, 
      ].join(' ')
    }, 
    flows() : Flow[] {
      let flows: Flow[] = []
      for(let from_id in this.$store.state.flows_from_into) {
        let intoFlows = this.$store.state.flows_from_into[from_id]
        for(let into_id in intoFlows) {
          flows.push(intoFlows[into_id]) 
        }
      }
      return flows; 
    }, 
    nodes() : Node[] {
      return Object.values(this.$store.state.nodes)
    }, 
  }, 
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less';

.graph-explorer {
  position: absolute; 
  left: 0; 
  top: 0; 
  background-color: shade(@background, 0%); 
  width: 100vw; 
  height: 100vh; 
  cursor: default;
  &.grabbing {
    cursor: grabbing; 
  }
}
</style>
