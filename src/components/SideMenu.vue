<template>
  <div 
    class="side-menu" 
    :class="classes"
    @click.stop=""
    @mousedown.stop=""
  >
    <NodeDetails 
      v-if="$store.state.selectedNode !== undefined" 
      :node="$store.state.selectedNode"/>
    <FlowDetails 
      v-else-if="$store.state.selectedFlow !== undefined"
      :flow="$store.state.selectedFlow"/>
    <NearProfile
      v-else-if="$store.state.menu.showProfile"
      />
    <SearchBar v-else/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import SearchBar from './SearchBar.vue';
import NodeDetails from './NodeDetails.vue';
import FlowDetails from './FlowDetails.vue';
import NearProfile from './NearProfile.vue';

type Orientation = 'full' | 'half';

export default defineComponent({
  name: 'SideMenu',
  components: {
    NodeDetails, 
    FlowDetails, 
    SearchBar, 
    NearProfile
  },
  data() {
    return {
      style: 'full' as Orientation, 
    }
  }, 
  computed: {
    classes() : {} {
      return {
        [this.style]: true,
        open: this.$store.state.menu.open 
      }
    }
  }, 
  created() {
    const updateOrientation = () => {
      if(window.innerHeight / 1.7 > window.innerWidth) {
        this.style = 'full'
      } else {
        this.style = 'half'
      }
    }
    updateOrientation()
    window.addEventListener('resize', (_: Event) => {
      updateOrientation()
    })
  }, 
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less';

.side-menu{ 
  position: fixed; 
  background-color: @background; 
  border: 0.2rem solid tint(@background, 20%);
  border-right: none; 
  box-sizing: border-box;
  text-align: left; 
  left: calc(100vw - 3.25rem); 
  transition: left 0.3s; 
  border-bottom-left-radius: 1rem;
  border-top-left-radius: 1rem;
  max-height: calc(100vh 1em); 
  top: 1em;
  margin: 0; 
  box-shadow: 0 0 4em black; 
  &.full{
    width: 100vw; 
    &.open {
      left: 0vw;  
    }
  }
  &.half{
    width: 50vh; 
    &.open{
      left: calc(100vw - 50vh); 
    }
  }
}
</style>
