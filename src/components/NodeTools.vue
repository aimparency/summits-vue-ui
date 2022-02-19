<template>
  <g 
    class="tool connect" 
    transform="translate(0.8 0.8)"
    @click.stop="$emit('connect')">
    <circle
      cx="0" 
      cy="0" 
      r="0.4"
    />
    <text 
      x="0"
      y="0"
      transform="scale(-1)"
      dominant-baseline="central" text-anchor="middle"
      font-size="0.8">
      ⤽
    </text>
  </g>
  <g
    class="tool remove"
    transform="translate(0.8 -0.8)"
    @click.stop="$emit('remove')">
    <circle
      :class="{confirm: confirmRemove}"
      cx="0" 
      cy="0" 
      r="0.4"
    />
    <text
      dominant-baseline="central" text-anchor="middle"
      font-size="0.6">
      &#128473;
    </text>
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
  cursor: pointer; 
  box-shadow: 0 0 0.1px #000; 
  circle {
    fill: #ccc; 
    stroke: none; 
    &.confirm {
      fill: @danger; 
    }
  }
  text {
    fill: @background; 
  }
}
.connect{
  .tool(); 
}

.remove{
  .tool(); 
}
</style>
