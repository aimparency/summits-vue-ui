<template>
  <SideMenuHeader>
    <h4> flow details </h4>
  </SideMenuHeader>
  <SideMenuContent class='flow-details'>
    <span class="headline">
      <button 
        @click='selectFromNode'
        class='standard'> {{ fromTitle }} </button> 
      &#129042; 
      <button 
        @click='selectIntoNode'
        class='standard'> {{ intoTitle }} </button>
    </span>
    <Slider 
      name='share'
      left='0'
      right='1'
      :from='0'
      :to='1'
      :value='share'
      @update='updateShare'/>
    <textarea 
      class='standard notes' 
      :value="notes" 
      placeholder="<notes>"
      @input="updateNotes"/>
    <div v-if="flow.pendingTransactions > 0" class='spinner'></div>
    <div v-else>
      <button class='standard' v-if='dirty' @click="reset">reset</button>
      <button class='standard' v-if='dirty' @click="commit">commit</button>
      <button class='standard' 
        :class='{confirm: confirmRemove}'
        @blur='confirmRemove = false'
        @click="remove">{{ confirmRemove ? "confirm removal" : "remove" }}</button>
    </div>
  </SideMenuContent>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { MutationTypes } from '@/mutations';
import { ActionTypes } from '@/actions';

import SideMenuHeader from './SideMenuHeader.vue'; 
import SideMenuContent from './SideMenuContent.vue'; 
import Slider from './Slider.vue'; 

import { Flow, Node } from '@/types';

export default defineComponent({
  name: 'FlowDetails',
  components: {
    SideMenuHeader,
    SideMenuContent, 
    Slider
  },
  props: {
    flow: {
      type: Object as PropType<Flow>,
      required: true
    }
  }, 
  data() {
    return {
      confirmRemove: false
    }
  }, 
  computed: {
    dirty() : boolean {
      return Object.keys(this.flow.changes).length > 0 
    }, 
    from() : Node | undefined {
      return this.$store.state.nodes[this.flow.id.from];
    }, 
    into() : Node | undefined {
      return this.$store.state.nodes[this.flow.id.into]; 
    }, 
    fromTitle() : string | undefined {
      if(this.from) {
        return this.from.title || "<unnamed>" 
      } else {
        return "<unloaded>"
      }
    }, 
    intoTitle() : string | undefined {
      if(this.into) {
        return this.into.title || "<unnamed>"
      } else {
        return "<unloaded>"
      }
    }, 
    notes() : string {
      return this.flow.changes.notes ?? this.flow.notes
    },
    share() : number {
      return this.flow.changes.share ?? this.flow.share
    }
  }, 
  methods: {
    updateNotes(e: Event) {
      const target = <HTMLTextAreaElement>e.target
      target.style.height = target.scrollHeight + 'px'

      this.$store.commit(MutationTypes.CHANGE_FLOW_NOTES, {
        flow: this.flow, 
        newNotes: (<HTMLInputElement>e.target).value
      })
    }, 
    updateShare(v: number) {
      this.$store.commit(MutationTypes.CHANGE_FLOW_SHARE, {
        flow: this.flow, 
        newShare: v
      })
    },
    reset() {
      this.$store.commit(MutationTypes.RESET_FLOW_CHANGES, this.flow)
    }, 
    commit() {
      this.$store.dispatch(ActionTypes.COMMIT_FLOW, this.flow)
    }, 
    selectFromNode() {
      if(this.from) {
        this.$store.dispatch(ActionTypes.NODE_SVG_CLICK, this.from)
      }
    }, 
    selectIntoNode() {
      if(this.into) {
        this.$store.dispatch(ActionTypes.NODE_SVG_CLICK, this.into)
      }
    },
    remove() {
      if(!this.confirmRemove) {
        this.confirmRemove = true
      } else {
        this.$store.dispatch(
          ActionTypes.REMOVE_FLOW, 
          this.flow
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

.flow-details{
  color: @foreground; 
  text-align: center;
  .headline{
    font-weight: bold; 
  }
  h3 {
    margin: 1rem 0rem; 
  }
  .title{
    font-size: 1.5rem;
  }
  .notes {
    height: 10em; 
    margin: 0.5rem 0rem; 
  }
}
</style>
