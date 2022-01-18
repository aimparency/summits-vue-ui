import State from './state';
import * as Messages from './messages';

import { v4 as uuid } from 'uuid'; 
import { Flow, Node } from '@/types'; 

import { ActionTree } from 'vuex';
import { MutationTypes } from './mutations';

export enum ActionTypes {
  SUBSCRIBE_TO_NODE = 'SUBSCRIBE_TO_NODE',
  SUBSCRIBE_TO_NEIGHBOR_NODE = 'SUBSCRIBE_TO_NEIGHBOR_NODE',
  UPDATE_NODE = 'UPDATE_NODE',
  UPDATE_FLOW = 'UPDATE_FLOW',
  INIT = 'INIT', 
  UPDATE_OR_CREATE_FLOW = 'UPDATE_OR_CREATE_FLOW', 
  CREATE_NEW_NODE = 'CREATE_NEW_NODE', 
  PUBLISH_NODE_CREATION = 'PUBLISH_NODE_CREATION',
  CREATE_NEW_FLOW = 'CREATE_NEW_FLOW', 
  PUBLISH_FLOW_CREATION = 'PUBLISH_FLOW_CREATION', 
  UI_ERROR_RAISED = 'UI_ERROR_RAISED', 
  NODE_CLICK = 'NODE_CLICK', 
  NOWHERE_CLICK = 'NOWHERE_CLICK', 
  REMOVE_NODE = 'REMOVE_NODE', 
}

function createDefaultNode() {
  return {
    x: (Math.random() * 9 + 0.5) * document.body.clientWidth, 
    y: (Math.random() * 9 + 0.5) * document.body.clientHeight, 
    r: Math.random() * 0.5 + 0.5, 
    title: "", 
    notes: "", 
  }
}

function createDefaultFlow() {
  return {
    notes: "", 
    share: Math.random() * 0.5 + 0.1
  }
}

function update_or_create_flow(
  doubleDict: {[x: string]: {[y: string]: Flow }}, 
  x: string, 
  y: string, 
  flowUpdate: Messages.FlowUpdate
) {
  if(!(x in doubleDict)) {
    doubleDict[x] = {} 
  } 
  const subDict = doubleDict[x]
  if(!(y in subDict)) {
    subDict[y] = {
      ...createDefaultFlow(), 
      ...flowUpdate, 
      updatePending: false
    }
  } else {
    Object.assign([y], {
      ...flowUpdate, 
      updatePending: false
    })
  }
}

function create_flow(
  doubleDict: {[x: string]: {[y: string]: Flow}}, 
  x: string, 
  y: string, 
  flow: Flow
) {
  if(!(x in doubleDict)) {
    doubleDict[x] = {}
  }
  const subDict = doubleDict[x]
  if(!(y in subDict)) {
    subDict[y] = flow
    return true
  } else {
    return false
  }
}

// maybe make a interface Actions with all the types only... To make typing be precise
// check here: https://dev.to/3vilarthas/vuex-typescript-m4j
// but maybe typing already works perfectly. 

export const actions: ActionTree<State, State> = {
  [ActionTypes.SUBSCRIBE_TO_NODE]({}, _nodeId: string) {
    // the aggregatorLink subscribes to this action
  }, 
  [ActionTypes.UPDATE_NODE]({state}, nodeUpdate: Messages.NodeUpdate) {
    if(nodeUpdate.id in state.nodes) {
      Object.assign(state.nodes[nodeUpdate.id], {
        ...nodeUpdate, 
        updatePending: false, 
      })
    } 
  }, 
  [ActionTypes.SUBSCRIBE_TO_NEIGHBOR_NODE](
    {state, dispatch}, 
    payload: {knownNodeId: string, newNodeId: string}
  ) {
    const knownNode = state.nodes[payload.knownNodeId];
    if(knownNode.subLevel > 0) {
      state.nodes[payload.newNodeId] = {
        ...createDefaultNode(),
        id: payload.newNodeId, 
        updatePending: true, 
        subLevel: knownNode.subLevel - 1
      }
      dispatch(ActionTypes.SUBSCRIBE_TO_NODE, payload.newNodeId)
    } else if (knownNode.subLevel === 0) {
      state.nodes[payload.newNodeId] = {
        ...createDefaultNode(),
        id: payload.newNodeId, 
        updatePending: false, 
        subLevel: -1
      }
    } 
  }, 
  [ActionTypes.UPDATE_FLOW]({state, dispatch}, flowUpdate: Messages.FlowUpdate) {
    let ignoreUpdate = true
    if(!(flowUpdate.from_id in state.nodes)) {
      if(flowUpdate.into_id in state.nodes) {
        ignoreUpdate = false
        dispatch(ActionTypes.SUBSCRIBE_TO_NEIGHBOR_NODE, {
          knownNodeId: flowUpdate.into_id, 
          newNodeId: flowUpdate.from_id
        })
      }
    } else {
      ignoreUpdate = false
      if(!(flowUpdate.into_id in state.nodes)) {
        dispatch(ActionTypes.SUBSCRIBE_TO_NEIGHBOR_NODE, {
          knownNodeId: flowUpdate.from_id, 
          newNodeId: flowUpdate.into_id
        }) 
      } else {
        // check if one of the nodes raises the subLevel of the other => raise, recurse. dispatch RAISE_SUB_LEVEL
      }
    }
    if(!ignoreUpdate) {
      dispatch(ActionTypes.UPDATE_OR_CREATE_FLOW, flowUpdate)
    }
  }, 
  [ActionTypes.UPDATE_OR_CREATE_FLOW]({state}, flowUpdate: Messages.FlowUpdate) {
    update_or_create_flow(
      state.flows_from_into, 
      flowUpdate.from_id, 
      flowUpdate.into_id, 
      flowUpdate, 
    ) 
    update_or_create_flow(
      state.flows_into_from, 
      flowUpdate.into_id, 
      flowUpdate.from_id, 
      flowUpdate
    ) 
  }, 
  [ActionTypes.INIT]({state, dispatch}, payload: Messages.Init) {
    for(let nodeId of payload.node_ids) {
      state.nodes[nodeId] = {
        ...createDefaultNode(), 
        id: nodeId, 
        updatePending: true, 
        subLevel: 2
      }
      dispatch(ActionTypes.SUBSCRIBE_TO_NODE, nodeId)
    }
  }, 
  [ActionTypes.CREATE_NEW_NODE]({state, dispatch}, payload: {x: number, y: number}) {
    let nodeId = uuid(); 

    dispatch(ActionTypes.SUBSCRIBE_TO_NODE, nodeId);

    const node = state.nodes[nodeId] = {
      ...createDefaultNode(), 
      id: nodeId, 
      x: payload.x, 
      y: payload.y, 
      updatePending: true, 
      subLevel: 2, 
    }; 

    let msg: Messages.NodeCreation = {
      id: node.id, 
      title: node.title, 
      notes: node.notes
    };

    dispatch(ActionTypes.PUBLISH_NODE_CREATION, msg) 
  }, 
  [ActionTypes.PUBLISH_NODE_CREATION]({}, _payload: Messages.NodeCreation) {
    // this action 
  }, 
  [ActionTypes.CREATE_NEW_FLOW]({state, dispatch}, payload: {from: Node, into: Node}) {
    console.log("creating flow") 
    let flow: Flow = {
      from_id: payload.from.id, 
      into_id: payload.into.id, 
      updatePending: true, 
      share: Math.random() * 0.6 + 0.1, 
      notes: ""
    };

    let msg: Messages.FlowCreation = {
      from_id: flow.from_id, 
      into_id: flow.into_id, 
      notes: flow.notes, 
      share: flow.share
    }

    if(
      create_flow(
        state.flows_from_into, 
        flow.from_id, 
        flow.into_id, 
        flow
      ) && 
      create_flow(
        state.flows_into_from, 
        flow.into_id, 
        flow.from_id, 
        flow
      )
    ) {
      dispatch(ActionTypes.PUBLISH_FLOW_CREATION, msg)
    } else {
      dispatch(ActionTypes.UI_ERROR_RAISED, 'could not create a new flow, because a flow already exists') 
    }
  }, 
  [ActionTypes.PUBLISH_FLOW_CREATION]({}, _payload: Messages.FlowCreation) {
    // only dispatched for aggregator plugin
  }, 
  [ActionTypes.UI_ERROR_RAISED]({}, _errorMessage: string) {
    // TODO
  }, 
  [ActionTypes.NODE_CLICK]({state, commit, dispatch}, node: Node) {
    if(state.connectFrom !== undefined) {
      if(node !== state.connectFrom) {
        dispatch(ActionTypes.CREATE_NEW_FLOW, {
          from: state.connectFrom, 
          into: node
        });
        commit(MutationTypes.DESELECT_NODE)
      } 
      commit(MutationTypes.STOP_CONNECTING)
    } else {
      if(state.selectedNode === node) {
        commit(MutationTypes.DESELECT_NODE)
      } else {
        commit(MutationTypes.SELECT_NODE, node)
      }
    }
  }, 
  [ActionTypes.NOWHERE_CLICK]({state, commit, dispatch}) {
    if(state.connectFrom !== undefined) {
      commit(MutationTypes.STOP_CONNECTING); 
    } else if(state.selectedNode !== undefined) {
      commit(MutationTypes.DESELECT_NODE); 
    } else {
      dispatch(ActionTypes.CREATE_NEW_NODE, {
        x: state.map.mouse.x, 
        y: state.map.mouse.y
      }) 
    }
  }, 
  [ActionTypes.REMOVE_NODE]({state, commit}, node: Node) {
    for(let intoId in state.flows_from_into[node.id]) {
      commit(MutationTypes.REMOVE_FLOW, {from: node.id, into: intoId})
    }
    for(let fromId in state.flows_into_from[node.id]) {
      commit(MutationTypes.REMOVE_FLOW, {from: fromId, into: node.id})
    }
    commit(MutationTypes.REMOVE_NODE, node.id)
  }
}
