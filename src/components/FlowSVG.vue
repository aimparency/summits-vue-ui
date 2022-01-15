<template>
  <path class="flow"
    :fill="fillColor"
    :d="path"
  />
</template>

<script lang="ts">
import ColorHash from 'color-hash' 
import { defineComponent, PropType } from 'vue';

import { Flow } from '@/types';

import { Vector2 } from 'three'

const colorHash = new ColorHash({ lightness: 0.4 }); 

const SQR_3_4 = Math.sqrt(3/4); 

function makePath(
  from: {x: number, y: number, r: number}, 
  fromShare: number, 
  to: {x: number, y: number, r: number}
) : string {

  let mFrom = new Vector2(from.x, from.y)
  let mTo = new Vector2(to.x, to.y) 

  // normalized vector from 'from' to 'to' 
  const delta = mTo.clone().sub(mFrom)
  const norm = delta.clone().normalize() 
  const half = norm.clone().multiplyScalar(0.5)

  const rotatedNorm = new Vector2(norm.y, -norm.x); 
  
  // length of the vector from n/2 to the intersection of circle around 0 and around n
  let side = rotatedNorm.clone().multiplyScalar(SQR_3_4); 
  let rotatedHalf = rotatedNorm.clone().multiplyScalar(0.5); 

  let s0 = half.clone().add(side);
  let s1 = half.clone().sub(side);

  let taille0 = s0.clone().add(new Vector2(-s0.y, s0.x).multiplyScalar(1 - fromShare));
  let taille1 = s1.clone().add(new Vector2(s1.y, -s1.x).multiplyScalar(1 - fromShare));

  [s0, s1, taille0, taille1].forEach(
    v => { v.multiplyScalar(from.r * 1000).add(mFrom) }
  )

  let width = fromShare * from.r * 1000; 
  console.log(width)

  rotatedHalf.multiplyScalar(width); 

  let arrowPoint = mTo.clone().sub(norm.clone().multiplyScalar(to.r * 1000)); 
  let arrowBegin = arrowPoint.clone().sub(norm.clone().multiplyScalar(width)); 
  let arrowS0in = arrowBegin.clone().add(rotatedHalf); 
  let arrowS0out = arrowBegin.clone().add(rotatedHalf.clone().multiplyScalar(1.6)); 
  let arrowS1in = arrowBegin.clone().sub(rotatedHalf);
  let arrowS1out = arrowBegin.clone().sub(rotatedHalf.clone().multiplyScalar(1.6)); 

  return [
    'M', mFrom, 
    'L', s1, 
    'Q', taille1, arrowS1in, 
    'L', arrowS1out, 
    'L', arrowPoint, 
    'L', arrowS0out, 
    'L', arrowS0in, 
    'Q', taille0, s0, 
    'Z'
  ].map(c => {
    if(c instanceof Vector2) {
      return `${c.x} ${c.y}`;
    } else {
      return c
    }
  }).join(' ') 
}

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
      if(this.flow.preliminary) {
        return "#888"; 
      } else {
        return colorHash.hex(this.flow.from_id); 
      }
    }, 
    path() : string {
      const from = this.state.nodes[this.flow.from_id]
      const into = this.state.nodes[this.flow.into_id]
      return makePath(
        {x: from.x, y: from.y, r: from.r}, 
        this.flow.share, 
        {x: into.x, y: into.y, r: into.r}
      ) 
    }, 
    simplePath() : string {
      const from = this.state.nodes[this.flow.from_id]
      const into = this.state.nodes[this.flow.into_id]
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
}
</style>
