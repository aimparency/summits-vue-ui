<template>
  <div 
    class='side-menu-header'>
    <div 
      class='x'
      @click="lbclick">
      <span v-if="$store.state.menu.open">
        &#128473; 
      </span>
      <span v-else>
        &#9776; 
      </span>
    </div>
    <div
      class='slot'>
      <slot></slot>
    </div>
    <div class='x'>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { MutationTypes } from '@/mutations';

export default defineComponent({
  name: 'SearchBar',
  props: {
  }, 
  methods: {
    lbclick() {
      this.$store.commit(MutationTypes.TOGGLE_MENU) 
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.side-menu-header{
  text-align: center; 
  padding: 0; 
  .slot, .x {
    display: inline-block; 
    vertical-align: middle; 
  }
  .slot {
    line-height: normal; 
    width: calc(100% - 7rem); 
    left: 0; 
  }
  .x {
    width: 2.5rem; 
    height: 2.5rem; 
    background-color: shade(@foreground, 20%); 
    color: @background; 
    margin: 0.5em; 
    line-height: 2.5rem; 
    border-radius: 0.5rem; 
    font-size: 1.5;
    font-weight: bold; 
    right: 0rem; 
    cursor: pointer; 
  }
}
</style>
