<template>
  <path class="flow"
    :fill="fillColor"
    :d="path"
  />
</template>

<script lang="ts">
// import Color from 'color'
import { defineComponent, PropType } from 'vue';

import { Flow } from '@/types';

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
    fillColor() : string {
      return this.$store.getters.nodeColor(this.flow.from_id)
    }, 
    path() : string {
      const from = this.$store.state.nodes[this.flow.from_id]
      const into = this.$store.state.nodes[this.flow.into_id]
      return makeCircularPath(
        {x: from.x, y: from.y, r: from.r * 1000}, 
        this.flow.share, 
        {x: into.x, y: into.y, r: into.r * 1000}
      ) 
    }, 
    simplePath() : string {
      const from = this.$store.state.nodes[this.flow.from_id]
      const into = this.$store.state.nodes[this.flow.into_id]
      return `M ${from.x} ${from.y} L ${into.x} ${into.y}`
    }
  },
  beforeMount() {
    console.log("before mounting flow svg") 
  }, 
  methods: {
    select() {
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.flow {
  stroke: none;
  &.update-pending {
    stroke: #999; 
    stroke-width: 100;
  }
}
</style>
