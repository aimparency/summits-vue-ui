<template>
  <path class="flow"
    :class="{selected}" 
    :fill="fillColor"
    :d="path"
    @click.stop="select"
  />
</template>

<script lang="ts">
// import Color from 'color'
import { defineComponent, PropType } from 'vue';

import { Flow } from '@/types';

import { ActionTypes } from '@/actions';

import makeCircularPath from '@/tools/make-circular-path';

export default defineComponent({
  name: 'NodeSVG',
  props: {
    flow: {
      type: Object as PropType<Flow>,
      required: true
    }
  }, 
  computed: {
    selected() : boolean {
      console.log(
        JSON.stringify(this.flow), 
      );
      console.log(
        JSON.stringify(this.$store.state.selectedFlow)
      );
      console.log(this.flow) 
      console.log(this.$store.state.selectedFlow) 
      let identical = this.flow == this.$store.state.selectedFlow;
      console.log("identical?", identical)
      return identical 
    }, 
    fillColor() : string {
      const selectedNode = this.$store.state.selectedNode;
      console.log("recalculating flow color") 
      if ( selectedNode && selectedNode.id == this.flow.from_id ) {
        return '#ccc'; 
      } else {
        return this.$store.getters.nodeColor(this.flow.from_id); 
      }
    }, 
    path() : string {
      const from = this.$store.state.nodes[this.flow.from_id]
      const into = this.$store.state.nodes[this.flow.into_id]
      return makeCircularPath(
        {x: from.x, y: from.y, r: from.r}, 
        this.flow.share, 
        {x: into.x, y: into.y, r: into.r}
      ) 
    }, 
  },
  beforeMount() {
    console.log("before mounting flow svg") 
  }, 
  methods: {
    select() {
      this.$store.dispatch(ActionTypes.FLOW_CLICK, this.flow)
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.flow {
  stroke: none;
  &.selected {
    fill: #ccc; 
  }
  cursor: pointer; 
}
</style>
