<template>
  <SideMenuHeader>
    <h4> project details </h4>
  </SideMenuHeader>
  <SideMenuContent class="node-details">
    <h3> edit </h3>
    <input 
      class='title' 
      :value="title" 
      placeholder="<node title>"
      @input="updateTitle"/>
    <textarea 
      ref="notes"
      class='notes' 
      :value="notes" 
      placeholder="<notes>"
      @input="updateNotes"/>
    <input 
      class='deposit' 
      :value="deposit" 
      @input="updateDeposit"/>
    <button v-if='dirty' @click="reset">reset</button>
    <button v-if='dirty' @click="commit">commit</button>
    <h3 v-if="flows_from.length > 0"> incoming flows </h3>
    <div 
      class="flow" 
      v-for="pair, i in flows_from" 
      @click="flowClick(pair.flow)" 
      :key="i">
      {{ pair.node.title || `node ${pair.node.id.substring(0,5)}...`}} <br/>
      share: {{ pair.flow.share }}
    </div>
    <h3 v-if="flows_into.length > 0"> outgoing flows </h3>
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
    dirty() : boolean {
      return ( 
        this.node.unpublished || 
        this.node.changes.title !== undefined || 
        this.node.changes.notes !== undefined
      ) 
    }, 
    title() : string {
      return this.node.changes.title || this.node.title
    }, 
    deposit() : number {
      return this.node.changes.deposit || this.node.deposit
    }, 
    notes() : string {
      return this.node.changes.notes || this.node.notes
    }, 
    flows_from() : {flow: Flow, node: Node}[] {
      let flows = this.$store.state.flows_into_from[this.node.id] 
      if(flows) {
        return Object.values(flows).map((flow:Flow) => ({
          flow, 
          node: this.$store.state.nodes[flow.id.from]
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
          node: this.$store.state.nodes[flow.id.into]
        }))
      } else {
        return []
      }
    }, 
  }, 
  methods: {
    updateDeposit(e: Event) {
      this.$store.commit(MutationTypes.CHANGE_NODE_DEPOSIT, {
        node: this.node, 
        newTitle: (<HTMLInputElement>e.target).value
      })
    }, 
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
    reset() {
      this.$store.commit(MutationTypes.RESET_NODE_CHANGES, this.node)
    }, 
    commit() {
      this.$store.dispatch(ActionTypes.CHANGE_NODE, this.node)
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
