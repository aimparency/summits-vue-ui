<template>
  <GraphExplorer
    @createFlow="createFlow"/>
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
    window.addEventListener("mousemove", (event: MouseEvent) => {
      this.state.map.mouse.x = event.pageX / this.state.map.scale + this.state.map.offset.x; 
      this.state.map.mouse.y = event.pageY / this.state.map.scale + this.state.map.offset.y;
    }) 
  }, 
  methods: {
    handleNodeUpdate(nodeUpdate: NodeUpdate) {
      console.log('received node update' + nodeUpdate) 
      if(nodeUpdate.id in this.state.nodes) {
        Object.assign(this.state.nodes[nodeUpdate.id], nodeUpdate)
      } else {
        console.log(document.body.clientHeight) 
        this.state.nodes[nodeUpdate.id] = {
          preliminary: false, 
          x: Math.random() * document.body.clientWidth * 8 + 1, 
          y: Math.random() * document.body.clientHeight * 8 + 1, 
          r: Math.random() * 0.5 + 0.5, 
          ...nodeUpdate
        } as Node
      }
    }, 
    handleFlowUpdate(flowUpdate: FlowUpdate) {
      console.log("handling flow update", flowUpdate);
      if(!(flowUpdate.from_id in this.state.flows)) {
        this.state.flows[flowUpdate.from_id] = {
          [flowUpdate.into_id]: {
            ...flowUpdate, 
            preliminary: false
          } as Flow
        }
      } else if(!(flowUpdate.into_id in this.state.flows[flowUpdate.from_id])) {
        this.state.flows[flowUpdate.from_id][flowUpdate.into_id] = {
          ...flowUpdate, 
          preliminary: false
        } as Flow
      } else {
        Object.assign(this.state.flows[flowUpdate.from_id][flowUpdate.into_id], {
          notes: flowUpdate.notes, 
          share: flowUpdate.share, 
          preliminary: false
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
    }, 
    createFlow(from: Node, into: Node) {
      console.log("creating flow") 
      let flow = {
        from_id: from.id, 
        into_id: into.id, 
        preliminary: true, 
        share: 0.1, 
        notes: ""
      } as Flow; 
      // this has to be replaced 
      if(this.socket !== undefined) {
        let msg: FlowCreationMessage = {
          from_id: from.id, 
          into_id: into.id, 
          notes: flow.notes, 
          share: flow.share
        }
        this.socket.send(JSON.stringify({
          FlowCreation: msg 
        })); 
      }
      // create preliminary connection
      if(this.state.flows[from.id] === undefined) {
        this.state.flows[from.id] = {
          [into.id]: flow
        }
      } else if (this.state.flows[from.id][into.id] === undefined) {
        this.state.flows[from.id][into.id] = flow
      } else {
        this.$emit("uiError", "connection already exists") 
      }
      console.log(JSON.stringify(this.state.flows))
    }
  }
});
</script>

<style lang="less">
* {
  margin: 0; 
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw; 
  height: 100vh; 
}
</style>
