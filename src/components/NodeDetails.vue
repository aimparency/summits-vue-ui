<template>
  <SideMenuHeader>
    <h4> project details </h4>
  </SideMenuHeader>
  <SideMenuContent class="node-details">
    <h3> edit </h3>
    <input 
      class='title' 
      :value="node.title" 
      placeholder="<node title>"
      @input="updateTitle"/>
    <textarea 
      ref="notes"
      class='notes' 
      :value="node.notes" 
      placeholder="<notes>"
      @input="updateNotes"/>
    <button>save</button>
    <h3> incoming flows </h3>
    <div 
      class="flow" 
      v-for="pair, i in flows_from" 
      @click="flowClick(pair.flow)" 
      :key="i">
      {{ pair.node.title || `node ${pair.node.id.substring(0,5)}...`}} <br/>
      share: {{ pair.flow.share }}
    </div>
    <h3> outgoing flows </h3>
    <div 
      class="flow" 
      v-for="pair, i in flows_into" 
      @click="flowClick(pair.flow)" 
      :key="i">
      {{ pair.node.title || `node ${pair.node.id.substring(0,5)}...`}} <br/>
      share: {{ pair.flow.share }}
    </div>
  </SideMenuContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { MutationTypes } from '@/mutations';
import { ActionTypes } from '@/actions';

import { Node, Flow } from '@/types';

import SideMenuHeader from './SideMenuHeader.vue'; 
import SideMenuContent from './SideMenuContent.vue'; 

export default defineComponent({
  name: 'NodeDetails',
  components: {
    SideMenuHeader,
    SideMenuContent
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }, 
  }, 
  computed: {
    flows_from() : {flow: Flow, node: Node}[] {
      let flows = this.$store.state.flows_into_from[this.node.id] 
      if(flows) {
        return Object.values(flows).map((flow:Flow) => ({
          flow, 
          node: this.$store.state.nodes[flow.from_id]
        }))
      } else {
        return []
      }
    }, 
    flows_into() : {flow: Flow, node: Node}[] {
      let flows = this.$store.state.flows_from_into[this.node.id] 
      if(flows) {
        return Object.values(flows).map((flow:Flow) => ({
          flow,
          node: this.$store.state.nodes[flow.into_id]
        }))
      } else {
        return []
      }
    }, 
  }, 
  methods: {
    updateTitle(e: Event) {
      this.$store.commit(MutationTypes.UPDATE_NODE_TITLE, {
        node: this.node, 
        title: (<HTMLInputElement>e.target).value
      })
    }, 
    updateNotes(e: Event) {
      const target = <HTMLTextAreaElement>e.target
      target.style.height = target.scrollHeight + 'px'
      console.log(target.scrollHeight) 

      this.$store.commit(MutationTypes.UPDATE_NODE_TITLE, {
        node: this.node, 
        notes: (<HTMLInputElement>e.target).value
      })
    }, 
    flowClick(flow: Flow) {
      this.$store.dispatch(ActionTypes.FLOW_CLICK, flow)
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@import '~@/global.less'; 

h4 {
  font-size: 1rem;
  margin: 0; 
  padding: 0; 
  text-align: center;
}

.node-details{
  color: @foreground; 
  .title{
    font-size: 1.5rem;
    margin-bottom:0.5rem; 
  }
  .notes {
    height: 10em; 
    margin-bottom:0.5rem; 
  }
  .flow {
    background-color: tint(@background, 20%); 
    text-align: left; 
    border-radius: 0.5em; 
    padding: 0.5em; 
    margin-bottom: 0.5em; 
    user-select: none; 
    cursor: pointer; 
  }
}
</style>
