<template>
  <div class="svgtest">
    <p> here is a svg element, let's bring this to work in vue </p>
    <svg 
      class='graph-explorer'
      @click='clearOperations'>
      <g :transform="`scale(${state.map.scale})`">
        <FlowSVG v-for="flow in flows" 
          :key="`${flow.from_id}x${flow.into_id}`"
          :flow="flow"
        />
        <Connector v-if="state.connectFrom !== undefined"/>
        <NodeSVG v-for="node, node_id in state.nodes" 
          :key="node_id"
          :node="node"
          v-bind="$attrs"
        />
      </g>
    </svg>
    <div v-for="node, node_id in state.nodes" :key="node_id"> {{ node }} </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NodeSVG from './NodeSVG.vue';
import FlowSVG from './FlowSVG.vue';
import Connector from './Connector.vue';

import { Flow } from '@/types';

export default defineComponent({
  name: 'HelloWorld',
  components: {
    NodeSVG, 
    FlowSVG, 
    Connector
  },
  emits: ['createNode'], 
  props: {
  },
  computed: {
    flows() : Flow[] {
      let flows: Flow[] = []
      for(let from_id in this.state.flows) {
        let intoFlows = this.state.flows[from_id]
        for(let into_id in intoFlows) {
          flows.push(intoFlows[into_id]) 
        }
      }
      return flows; 
    }
  }, 
  methods: {
    clearOperations() {
      if(this.state.selectedNode !== undefined ||
        this.state.connectFrom !== undefined) {
        delete this.state.selectedNode;
        delete this.state.connectFrom;
      } else {
        this.$emit('createNode') 
      }
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.graph-explorer {
  position: absolute; 
  left: 0; 
  top: 0; 
  background-color: #202101; 
  width: 100vw; 
  height: 100vh; 
}
</style>
