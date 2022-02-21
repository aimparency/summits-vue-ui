<template> 
  <div 
    class='side-menu-header'>
    <div
      class='slot'>
      <slot></slot>
    </div>
    <div 
      class='left'
      v-if="!$store.state.menu.open"
      @click="toggle">
      <span >
        &lt; 
      </span>
    </div>
    <div 
      v-if="$store.state.menu.open" 
      @click='toggle' 
      class='right'>
      <span>
        &gt; 
      </span>
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
    toggle() {
      this.$store.commit(MutationTypes.TOGGLE_MENU) 
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.side-menu-header{
  position: relative; 
  .left, .right {
    text-align: center; 
    position: absolute; 
    user-select:none; 
    box-shadow: @clickableBoxShadow; 
    width: 2.5rem; 
    height: 2.5rem; 
    top: 0.5rem;
    background-color: shade(@foreground, 20%); 
    color: @background; 
    line-height: 2.5rem; 
    border-radius: 0.5rem; 
    font-size: 1.5rem;
    font-weight: bold; 
    cursor: pointer; 
  }
  .left {
    left: 0.5rem; 
  }
  .right {
    right: 0.5rem; 
  }
  .slot {
    display: inline-block; 
    width: calc(100% - 6rem) ; 
    box-sizing: border-box; 
    margin: 1.5rem 0 1rem 3rem;
    text-align: center; 
  }
}
</style>
