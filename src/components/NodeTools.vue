<template>
  <g 
    class="connect" 
    transform="translate(0.8 0.8)"
    @click.stop="$emit('connect')">
    <circle
      cx="0" 
      cy="0" 
      r="0.4"
    />
    <path
      fill="white"
      transform='scale(0.004)'
      d="M -1.3389046,-54.248781 C 12.154134,-40.575552 14.15251,4.1494317 32.126607,17.292976 44.188788,14.729421 46.769058,4.8720457 46.769058,4.8720457 c 0,0 6.7805,10.4346363 6.42941,48.7253553 -36.838481,2.75479 -50.8671687,-1.28223 -50.8671687,-1.28223 0,0 11.1321207,-7.05538 15.1434877,-18.18663 C -0.76507162,16.47156 -39.217834,11.896503 -53.428967,-8.0212083 -25.402552,-13.708701 -8.7596077,-29.677534 -1.3389046,-54.248781 Z"
    />
  </g>
  <g
    class="remove"
    transform="translate(-0.8 -0.8)"
    @click.stop="$emit('remove')">
    <circle
      :class="{confirm: confirmRemove}"
      cx="0" 
      cy="0" 
      r="0.4"
    />
  </g>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NodeTools',
  emits: [
    'connect', 
    'remove'
  ], 
  data() {
    return {
      confirmRemove: false
    }
  }, 
  methods: {
    remove() {
      if(this.confirmRemove) {
        this.$emit('remove')
      } else {
        this.confirmRemove = true
      }
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less';

.tool{
  fill: #888; 
  cursor: pointer; 
  circle {
    stroke: #bbb; 
    stroke-width: 0.025; 
    &.confirm {
      fill: @danger; 
    }
  }
}
.connect{
  .tool(); 
}

.remove{
  .tool(); 
}
</style>
