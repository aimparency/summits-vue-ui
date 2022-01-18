import { ActionTypes } from './actions';
import { MutationTypes } from './mutations';
import { Store } from 'vuex';
import State from './state';
import * as Messages from './messages';

export default function createAggregatorLink () {
  let socket = new WebSocket('ws://localhost:3030/v1')
  return (store: Store<State>) => {
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data) as any;
      if("NodeUpdate" in msg) {
        store.dispatch(ActionTypes.UPDATE_NODE, msg.NodeUpdate as Messages.NodeUpdate); 
      } else if("FlowUpdate" in msg) {
        store.dispatch(ActionTypes.UPDATE_FLOW, msg.FlowUpdate as Messages.FlowUpdate); 
      } else if("SevenSummits" in msg) {
        store.dispatch(ActionTypes.INIT, msg.SevenSummits as Messages.Init); 
      }
    };

    store.subscribeAction(action => {
      if(action.type === ActionTypes.SUBSCRIBE_TO_NODE) {
        socket.send(JSON.stringify({
          NodeSubscription: {
            node_id: action.payload
          }
        }));
      } else if (action.type === ActionTypes.PUBLISH_NODE_CREATION) {
        socket.send(JSON.stringify({
          NodeCreation: action.payload
        }));
      } else if (action.type === ActionTypes.PUBLISH_FLOW_CREATION) {
        socket.send(JSON.stringify({
          FlowCreation: action.payload
        })); 
      } else if (action.type === ActionTypes.REMOVE_NODE) {
        socket.send(JSON.stringify({
          NodeDesubscription: {
            node_id: action.payload.id
          }
        })); 
      }
    }); 

    store.subscribe(mutation => {
      if(mutation.type === MutationTypes.REMOVE_NODE) {
        socket.send(JSON.stringify({
          NodeRemoval: {
            node_id: mutation.payload
          }
        })); 
      }
    }); 
  }
}

