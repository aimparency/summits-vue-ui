<template>
  <SideMenuHeader>
    <h4> flow details </h4>
  </SideMenuHeader>
  <SideMenuContent class='flow-details'>
    <h3> {{ fromTitle || "<from project>"}} -> {{ intoTitle || "<into project>" }} </h3>
    <p> share: {{ flow.share }} </p>
    <textarea 
      class='notes' 
      :value="flow.notes" 
      placeholder="<notes>"
      @input="updateNotes"/>
  </SideMenuContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { MutationTypes } from '@/mutations';

import SideMenuHeader from './SideMenuHeader.vue'; 
import SideMenuContent from './SideMenuContent.vue'; 

import { Flow } from '@/types';

export default defineComponent({
  name: 'FlowDetails',
  components: {
    SideMenuHeader,
    SideMenuContent
  },
  props: {
    flow: {
      type: Object as PropType<Flow>,
      required: true
    }
  }, 
  computed: {
    fromTitle() : string | undefined {
      const node = this.$store.state.nodes[this.flow.from_id];
      if(node !== undefined) {
        return node.title
      }
    }, 
    intoTitle() : string | undefined {
      const node = this.$store.state.nodes[this.flow.into_id]; 
      if(node !== undefined) {
        return node.title
      } 
    }
  }, 
  methods: {
    updateNotes(e: Event) {
      const target = <HTMLTextAreaElement>e.target
      target.style.height = target.scrollHeight + 'px'
      console.log(target.scrollHeight) 

      this.$store.commit(MutationTypes.UPDATE_NODE_TITLE, {
        flow: this.flow, 
        notes: (<HTMLInputElement>e.target).value
      })
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

.node-details{
  color: @foreground; 
  text-align: center;
  h4 {
    font-size: 1rem;
    text-align: center;
  }
  .title{
    font-size: 1.5rem;
  }
  .notes {
    height: 10em; 
  }
}
</style>
