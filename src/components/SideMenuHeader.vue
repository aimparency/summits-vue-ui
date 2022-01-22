<template>
  <div 
    class='side-menu-header'>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SearchBar',
  props: {
  }, 
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.side-menu-header{
  text-align: center; 
  padding: 0.3em; 
  box-sizing: border-box; 
}
</style>
