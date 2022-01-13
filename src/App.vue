<template>
  <GraphExplorer/>
  <button @click='createRandomNode'> create random node </button>
</template>

<script lang="ts">
import { v4 as uuid } from 'uuid'; 
import { defineComponent } from 'vue';
import GraphExplorer from './components/GraphExplorer.vue';

import { Node, Flow } from '@/types'; 

interface FlowUpdate {
  from_id: string, 
  into_id: string, 
  notes?: string,
  share?: number
}

interface NodeUpdate {
  id: string, 
  title?: string, 
  notes?: string, 
  flows_from?: string[], 
  flows_into?: string[]
}

interface NodeCreationMessage {
  id: string, 
  title: string, 
  notes: string
}

interface FlowCreationMessage {
  from_id: string,
  into_id: string, 
  notes: string, 
  share: number
}

interface NodeSubscriptionMessage {
  node_id: string
}

interface NodeDesubscriptionMessage {
  node_id: string
}

export default defineComponent({
  name: 'App',
  components: {
    GraphExplorer 
  }, 
  data() {
    return {
    } as {
      socket?: WebSocket
    }
  }, 
  beforeMount() {
    console.log('connecting to aggregator') 
    this.socket = new WebSocket('ws://localhost:3030/v1')
    this.socket.onmessage = (event) => {
      const msg = JSON.parse(event.data) as any;
      if("NodeUpdate" in msg) {
        this.handleNodeUpdate(msg.NodeUpdate as NodeUpdate); 
      } else if("FlowUpdate" in msg) {
        this.handleFlowUpdate(msg.FlowUpdate as FlowUpdate); 
      } else if("SevenSummits" in msg) {
        this.handleSevenSummits(msg.SevenSummits.node_ids); 
      }
    };
  }, 
  methods: {
    handleNodeUpdate(nodeUpdate: NodeUpdate) {
      console.log('received node update' + nodeUpdate) 
      if(nodeUpdate.id in this.state.nodes) {
        Object.assign(this.state.nodes[nodeUpdate.id], nodeUpdate)
      } else {
        this.state.nodes[nodeUpdate.id] = {
          preliminary: false, 
          ...nodeUpdate
        } as Node
      }
    }, 
    handleFlowUpdate(flowUpdate: FlowUpdate) {
      if(!(flowUpdate.from_id in this.state.flows)) {
        this.state.flows[flowUpdate.from_id] = {
          [flowUpdate.into_id]: {
            ...flowUpdate
          } as Flow
        }
      } else if(!(flowUpdate.into_id in this.state.flows[flowUpdate.from_id])) {
        this.state.flows[flowUpdate.from_id][flowUpdate.into_id] = {
          ...flowUpdate
        } as Flow
      } else {
        Object.assign(this.state.flows[flowUpdate.from_id][flowUpdate.into_id], {
          notes: flowUpdate.notes, 
          share: flowUpdate.share
        })
      }
    }, 
    handleSevenSummits(node_ids: string[]) {
      if(this.socket !== undefined) {
        console.log("received seven summits: " + node_ids)
        for(let node_id of node_ids) {
          let msg: NodeSubscriptionMessage = {
            node_id
          }; 
          this.socket.send(JSON.stringify({
            NodeSubscription: msg 
          }));
        }
      }
    },
    createRandomNode() {
      if(this.socket !== undefined) {
        let nodeId = uuid(); 
        let msg: NodeCreationMessage = {
          id: nodeId, 
          title: "node " + nodeId.slice(0,5), 
          notes: ""
        };
        this.socket.send(JSON.stringify({
          NodeCreation: msg
        })); 
      }
    }
  }
});
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
