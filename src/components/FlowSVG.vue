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
      return this.flow == this.$store.state.selectedFlow;

    }, 
    fillColor() : string {
      const selectedNode = this.$store.state.selectedNode;
      if ( selectedNode && selectedNode.id == this.flow.id.from) {
        return '#ccc'; 
      } else {
        return this.$store.getters.nodeColor(this.flow.id.from); 
      }
    }, 
    path() : string {
      const from = this.$store.state.nodes[this.flow.id.from]
      const into = this.$store.state.nodes[this.flow.id.into]
      return makeCircularPath(
        {x: from.x, y: from.y, r: from.r}, 
        this.flow.share, 
        {x: into.x, y: into.y, r: into.r}
      ) 
    }, 
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
