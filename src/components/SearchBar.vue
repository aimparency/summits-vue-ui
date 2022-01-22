<template>
  <SideMenuHeader
    class='search-bar'>
    <input placeholder="search...">
  </SideMenuHeader>
  <SideMenuContent v-if="results !== undefined">
    results...
  </SideMenuContent>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import SideMenuHeader from './SideMenuHeader.vue'; 
import SideMenuContent from './SideMenuContent.vue'; 

export default defineComponent({
  name: 'SearchBar',
  components: {
    SideMenuHeader,
    SideMenuContent
  },
  props: {
  }, 
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.search-bar{
  color: @foreground; 
  text-align: center;
  input{
    font-size: 1.3rem; 
  }
}
</style>
