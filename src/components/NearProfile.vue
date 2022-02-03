<template>
  <SideMenuHeader>
    <h4> near profile </h4>
  </SideMenuHeader>
  <SideMenuContent class="near-profile">
    <p>connection state: {{ $store.state.nearState }} </p>
    <button>logout</button>
    <button @click="requestSignIn">request sign in</button>
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
  name: 'NearProfile',
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
    dirty() : boolean {
      return ( 
        this.node.changes.title !== undefined || 
        this.node.changes.notes !== undefined
      ) 
    }, 
    title() : string {
      return this.node.changes.title || this.node.title
    }, 
    notes() : string {
      return this.node.changes.notes || this.node.notes
    }, 
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
      this.$store.commit(MutationTypes.CHANGE_NODE_TITLE, {
        node: this.node, 
        newTitle: (<HTMLInputElement>e.target).value
      })
    }, 
    updateNotes(e: Event) {
      const target = <HTMLTextAreaElement>e.target
      target.style.height = target.scrollHeight + 'px'

      this.$store.commit(MutationTypes.CHANGE_NODE_NOTES, {
        node: this.node, 
        newNotes: (<HTMLInputElement>e.target).value
      })
    }, 
    commit() {
      this.$store.dispatch(ActionTypes.COMMIT_NODE_CHANGES, this.node)
    }, 
    requestSignIn() {
      this.$store.dispatch(ActionTypes.REQUEST_NEAR_SIGN_IN) 
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
