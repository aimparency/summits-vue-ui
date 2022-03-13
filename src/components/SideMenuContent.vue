<template>
  <div 
    ref="container"
    v-if="$store.state.menu.open"
    class="container">
    <div 
      ref="content"
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
  methods: {
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.container {
  max-height: calc(100vh - 4.5rem); 
  overflow-y: auto; 
  overflow-x: hidden; 
  .side-menu-content{
    padding: 0 0.5rem 0.5rem 0.5rem; 
    color: @foreground; 
    text-align: center;
    input{
      font-size: 1.3rem; 
    }
  }
}
</style>
