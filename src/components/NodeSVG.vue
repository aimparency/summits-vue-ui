<template>
  <g class="node"
    :transform="`translate(${node.x} ${node.y})`">
    <g :transform="`scale(${node.r})`">
      <circle 
        :class="{ selected }"
        :fill="fillColor" 
        cx="0" 
        cy="0" 
        r="1000"
        @click.stop='select'
      />
      <text
        class="label"
        x="0"
        y="0">
        blabla
      </text>
      <NodeTools
        v-if="showTools"
        @startConnect='startConnect'
      />
    </g>
  </g>
</template>

<script lang="ts">
import ColorHash from 'color-hash' 
import { defineComponent, PropType } from 'vue';
import { Node } from '@/types';

import NodeTools from './NodeTools.vue'

const colorHash = new ColorHash({ lightness: 0.4 }); 

export default defineComponent({
  name: 'NodeSVG',
  components: {
    NodeTools
  }, 
  emits: ['createFlow'],
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  }, 
  computed: {
    selected() : boolean {
      return this.$store.state.selectedNode == this.node; 
    }, 
    showTools() : boolean {
      return this.selected && this.$store.state.connectFrom == undefined; 
    }, 
    fillColor() : string {
      return colorHash.hex(this.node.id) 
    }
  },
  methods: {
    select() {
      console.log("clicked on node") 
      if(this.$store.state.connectFrom !== undefined) {
        console.log("almost emitting createFlow") 
        if(this.node !== this.$store.state.connectFrom) {
          console.log("emitting createFlow") 
          this.$emit('createFlow', this.$store.state.connectFrom, this.node);
        } 
        delete this.$store.state.connectFrom; 
      } else {
        if(this.selected) {
          this.$store.state.selectedNode = undefined; 
        } else {
          this.$store.state.selectedNode = this.node; 
        }
      }
    }, 
    startConnect() {
      this.$store.state.connectFrom = this.node;
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.node {
  circle {
    cursor: pointer; 
    &.selected {
      z-index: 11; 
      stroke: #bbb; 
      stroke-width: 100; 
    }
  }
  text {
    fill: #fff; 
    font-size: 250px;
    text-anchor: middle; 
    dominant-baseline: central; 
    user-select: none; 
    pointer-events: none; 
  }
}
</style>
