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

interface Result {
}

export default defineComponent({
  name: 'SearchBar',
  components: {
    SideMenuHeader,
    SideMenuContent
  },
  computed: {
    results() : (Result[] | void ) {
    }
  }, 
  props: {
  }, 
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.search-bar{
  input{
    font-size: 1.3rem; 
  }
}
</style>
