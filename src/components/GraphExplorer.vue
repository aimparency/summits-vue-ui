<template>
  <div class="svgtest">
    <svg 
      class='graph-explorer'
      @click='clearOperations'>
      <g :transform="`scale(${$store.state.map.scale})`">
        <FlowSVG v-for="flow in flows" 
          :key="`${flow.from_id}x${flow.into_id}`"
          :flow="flow"/>
        <Connector v-if="$store.state.connectFrom !== undefined"/>
        <NodeSVG v-for="node in nodes" 
          :key="node.id"
          :node="node"/>
      </g>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NodeSVG from './NodeSVG.vue';
import FlowSVG from './FlowSVG.vue';
import Connector from './Connector.vue';

import { ActionTypes } from '@/actions';

import { Flow, Node } from '@/types';

export default defineComponent({
  name: 'GraphExplorer',
  components: {
    NodeSVG, 
    FlowSVG, 
    Connector
  },
  computed: {
    flows() : Flow[] {
      let flows: Flow[] = []
      let selectedNode = this.$store.state.selectedNode 
      let selectedNodeId = selectedNode !== undefined ? selectedNode.id : undefined; 
      for(let from_id in this.$store.state.flows_from_into) {
        if(from_id !== selectedNodeId){
          let intoFlows = this.$store.state.flows_from_into[from_id]
          for(let into_id in intoFlows) {
            if(into_id !== selectedNodeId) {
              flows.push(intoFlows[into_id]) 
            }
          }
        }
      }
      if(selectedNode !== undefined) {
        let subDict = this.$store.state.flows_from_into[selectedNode.id]
        for(let into_id in subDict) {
          flows.push(subDict[into_id])
        }
        subDict = this.$store.state.flows_into_from[selectedNode.id]
        for(let from_id in subDict) {
          flows.push(subDict[from_id])
        }
      }
      return flows; 
    }, 
    nodes() : Node[] {
      let selectedNode = this.$store.state.selectedNode 
      const nodes = Object.values(this.$store.state.nodes)
        .filter((node: Node) => node !== selectedNode)  
      if(selectedNode !== undefined) {
        nodes.push(selectedNode) 
      }
      return nodes
    }, 
  }, 
  methods: {
    clearOperations() {
      this.$store.dispatch(ActionTypes.NOWHERE_CLICK)
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
