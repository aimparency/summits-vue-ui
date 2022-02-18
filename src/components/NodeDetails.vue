<template>
  <SideMenuHeader>
    <h4> project details </h4>
  </SideMenuHeader>
  <SideMenuContent 
    @keypress="keypress"
    class="node-details">
    <p class='small'>{{node.id}}</p>
    <input 
      ref='title'
      class='standard title' 
      :value="title" 
      placeholder="<node title>"
      @input="updateTitle"/>
    <textarea 
      ref="notes"
      class='standard notes' 
      :value="notes" 
      placeholder="<notes>"
      @input="updateNotes"/>
    <Slider 
      name='deposit'
      left='half'
      right='double'
      :from='sliderOrigin.deposit/2'
      :to='sliderOrigin.deposit*2'
      :value='deposit'
      @drag-end='updateDepositSliderOrigin'
      @update='updateDeposit'/>
    <div v-if="node.pendingTransactions"> 
      <div class="spinner"></div>
    </div>
    <div v-else-if='dirty'>
      <button class='standard' v-if='dirty' @click="reset">reset</button>
      <button class='standard' v-if='dirty' @click="commit">commit</button>
    </div>
    <button 
      class='standard' 
      :class='{confirm: confirmRemove}'
      @blur='confirmRemove = false'
      @click="remove">{{ confirmRemove ? "confirm removal" : "remove" }}</button>
    <h3 v-if="flows_from.length > 0"> incoming flows </h3>
    <div 
      class="flow" 
      v-for="pair, i in flows_from" 
      @click="flowClick(pair.flow)" 
      :key="i">
      {{ pair.node.title || "<unnamed>"}} <br/>
      share: {{ pair.flow.share }}
    </div>
    <h3 v-if="flows_into.length > 0"> outgoing flows </h3>
    <div 
      class="flow" 
      v-for="pair, i in flows_into" 
      @click="flowClick(pair.flow)" 
      :key="i">
      {{ pair.node.title || "<unnamed>"}} <br/>
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
import Slider from './Slider.vue'; 

export default defineComponent({
  name: 'NodeDetails',
  components: {
    SideMenuHeader,
    SideMenuContent, 
    Slider
  },
  data() {
    return {
      sliderOrigin: {
        deposit: 0
      }, 
      confirmRemove: false 
    }
  }, 
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }, 
  }, 
  updated() {
    this.refresh()
  }, 
  mounted() {
    this.refresh()
  }, 
  computed: {
    dirty() : boolean {
      return ( 
        this.node.unpublished || 
        Object.keys(this.node.changes).length > 0 
      ) 
    }, 
    title() : string {
      return this.node.changes.title ?? this.node.title
    }, 
    notes() : string {
      return this.node.changes.notes ?? this.node.notes
    }, 
    deposit() : number {
      return this.node.changes.deposit ?? this.node.deposit
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
    keypress(e: KeyboardEvent) {
      if(e.key == 'Enter' && this.dirty) {
        this.commit()
      } 
    }, 
    updateDepositSliderOrigin(){
      this.sliderOrigin.deposit = this.deposit
    }, 
    updateDeposit(v: number) {
      this.$store.commit(MutationTypes.CHANGE_NODE_DEPOSIT, {
        node: this.node, 
        newDeposit: v
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
      this.$store.dispatch(ActionTypes.COMMIT_NODE, this.node)
    }, 
    flowClick(flow: Flow) {
      this.$store.dispatch(ActionTypes.SELECT_FLOW, flow)
    }, 
    refresh() {
      this.focusTitle()
      this.resetSliderOrigin()
    }, 
    focusTitle() {
      (this.$refs.title as HTMLInputElement).focus()
    }, 
    resetSliderOrigin() {
      this.sliderOrigin.deposit = this.deposit
    }, 
    remove() {
      if(!this.confirmRemove) {
        this.confirmRemove = true
      } else {
        this.$store.dispatch(
          ActionTypes.REMOVE_NODE, 
          this.node
        )
      }
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
    margin:0.5rem 0rem; 
  }
  .notes {
    height: 10em; 
    margin: 0.5rem 0rem; 
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
