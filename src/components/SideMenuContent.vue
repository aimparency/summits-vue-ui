<template>
  <div 
    ref="container"
    @mousewheel.stop="scroll"
    class="container">
    <div 
      ref="content"
      :style="{transform: `translate(0px, ${-scrollY}px)`}"
      class='side-menu-content'>
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SearchBar',
  props: {
  }, 
  data() {
    return {
      scrollY: 0 
    }
  }, 
  methods: {
    scroll(e: WheelEvent) {
      console.log('scroll', e) 
      this.scrollY = Math.min(
        Math.max(0, this.scrollY + e.deltaY), 
      )
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.container {
  overflow: hidden; 
  .side-menu-content{
    padding: 0.5rem; 
    color: @foreground; 
    text-align: center;
    input{
      font-size: 1.3rem; 
    }
  }
}
</style>
