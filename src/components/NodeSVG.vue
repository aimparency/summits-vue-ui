<template>
  <g class="node"
    :transform="`translate(${node.x} ${node.y})`">
    <g :transform="`scale(${node.r})`">
      <circle 
        :class="{ selected, loading, placeholder }"
        :fill="fillColor" 
        cx="0" 
        cy="0" 
        r="1"
        @click.stop='select'
      />
      <text
        v-if="!placeholder" 
        class="label"
        x="0"
        y="0">
        <!--{{ node.subLevel }}-->
        <tspan 
          x="0"
          :dy="i == 0 ? (-0.3 * (titleLines.length - 1) / 2) : 0.3 "
          :textLength="line.length * 0.61 + 'em'"
          v-for="line, i in titleLines" 
          :key="i"> {{ line }} </tspan>
      </text>
      <NodeTools
        v-if="showTools"
        @remove='remove'
        @connect='connect'
      />
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Node } from '@/types';

import { ActionTypes } from '@/actions'
import { MutationTypes } from '@/mutations';

import NodeTools from './NodeTools.vue'

const lineLengths = [
  [12], 
  [12, 12], 
  [11, 12, 11], 
  [9, 12, 12, 9], 
  [8, 11, 12, 11, 8], 
]

const totalCharacters = lineLengths.map(lines => lines.reduce((prev, curr) => prev + curr)); 


export default defineComponent({
  name: 'NodeSVG',
  components: {
    NodeTools, 
  }, 
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  }, 
  computed: {
    titleLines() : string[] {
      let length = this.node.title.length; 
      let lines: string[] = []; 
      let offset = 0; 
      for(let i = 0; i < totalCharacters.length; i++) {
        if(length <= totalCharacters[i] || i == totalCharacters.length - 1) {
          for(let lineLength of lineLengths[i]){
            lines.push(this.node.title.substring(offset, offset + lineLength))
            offset += lineLength
          }
          break
        }
      }
      return lines
    }, 
    selected() : boolean {
      return this.$store.state.selectedNode == this.node; 
    }, 
    loading() : boolean {
      return this.node.updatePending
    }, 
    placeholder() : boolean {
      return this.node.subLevel === -1
    }, 
    showTools() : boolean {
      return this.selected && this.$store.state.connectFrom == undefined; 
    }, 
    fillColor() : string {
      return this.$store.getters.nodeColor(this.node.id)
    }
  },
  methods: {
    select() {
      this.$store.dispatch(ActionTypes.NODE_CLICK, this.node)
    }, 
    connect() {
      this.$store.commit(MutationTypes.START_CONNECTING, this.node)
    }, 
    remove() {
      this.$store.dispatch(ActionTypes.REMOVE_NODE, this.node) 
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.node {
  circle {
    cursor: pointer; 
    transition: stroke-dasharray;  
    stroke-width: 0.075;
    &.loading{
      stroke: #ccc; 
      animation: dash 1.5s ease-in-out infinite;
      stroke-linecap: round;
    }
    &.selected {
      stroke: #ccc; 
      animation: none; 
    }
    &.placeholder {
      stroke: #999; 
      fill: #444; 
    }
  }
  text {
    fill: #fff; 
    font-size: 0.25px;
    font-family: monospace;
    text-anchor: middle; 
    dominant-baseline: central; 
    user-select: none; 
    pointer-events: none; 
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 0, 3.141;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 3.141 / 2, 3.141 / 2;
    stroke-dashoffset: -3.141 / 2;
  }
  100% {
    stroke-dasharray: 0, 3.141;
    stroke-dashoffset: -3.141 * 2;
  }
}
</style>
