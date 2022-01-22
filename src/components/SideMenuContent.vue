<template>
  <div class="container">
    <div 
      :style="{transform: `translate(0px, ${scrollY}px)`}"
      @mousewheel.stop="scroll"
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
      this.scrollY += e.deltaY; 
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.container {
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
