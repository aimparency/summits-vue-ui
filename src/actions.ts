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
  FLOW_CLICK = 'FLOW_CLICK', 
  NOWHERE_CLICK = 'NOWHERE_CLICK', 
  REMOVE_NODE = 'REMOVE_NODE', 
  REMOVE_NODE_LOCALLY_TRIGGERED = 'REMOVE_NODE_LOCALLY_TRIGGERED', 
  COMPARE_AND_RAISE = 'COMPARE_AND_RAISE', 
  SPILL_SUB_LEVEL = 'SPILL_SUB_LEVEL',
}

function createDefaultNode() {
  return {
    x: (Math.random() * 18 - 9),
    y: (Math.random() * 18 - 9), 
    r: Math.random() * 0.5 + 0.5, 
    title: "", 
    notes: "", 
  }
}

function createDefaultFlow() {
  return {
    notes: "", 
    share: Math.random() * 0.25 + 0.01
  }
}

function get_flow(state: State, fromId: string, intoId: string) : Flow | undefined { 
  let from_into_flow = flow_exists_in_dict(
    state.flows_from_into, 
    fromId, 
    intoId
  )
  let into_from_flow = flow_exists_in_dict(
    state.flows_into_from, 
    intoId, 
    fromId
  )
  if(from_into_flow !== undefined && from_into_flow !== into_from_flow) {
    return from_into_flow
  }
}

function set_flow(state: State, flow: Flow) {
  let proxy = set_flow_in_dict(
    state.flows_from_into, 
    flow.from_id, 
    flow.into_id, 
    flow
  ) 
  set_flow_in_dict(
    state.flows_into_from, 
    flow.into_id, 
    flow.from_id, 
    proxy // we use the same proxy otherwise we can't compare flow identity. 
  )
}

type Dict = {[x: string]: {[y: string]: Flow}}

function flow_exists_in_dict(
  dict: Dict, 
  i1: string, 
  i2: string
) : Flow | undefined {
  if(i1 in dict) {
    return dict[i1][i2] 
  }
}

function set_flow_in_dict(
  dict: Dict, 
  i1: string, 
  i2: string,
  flow: Flow
) : Flow {
  if(!(i1 in dict)) {
    dict[i1] = {}
  }
  return dict[i1][i2] = flow
}

function set_flow_in_double_dict(state: State, flow: Flow) {
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
        dispatch(ActionTypes.COMPARE_AND_RAISE, {
          a: state.nodes[flowUpdate.from_id], 
          b: state.nodes[flowUpdate.into_id]
        })
      }
    }
    if(!ignoreUpdate) {
      dispatch(ActionTypes.UPDATE_OR_CREATE_FLOW, flowUpdate)
    }
  }, 
  [ActionTypes.UPDATE_OR_CREATE_FLOW]({state}, flowUpdate: Messages.FlowUpdate) {
    let flow = get_flow(state, flowUpdate.from_id, flowUpdate.into_id); 
    if(flow === undefined) {
      flow = {
        ...createDefaultFlow(), 
        ...flowUpdate, 
        updatePending: false
      }
    } else {
      Object.assign(flow, {
        ...flowUpdate, 
        updatePending: false
      })
    }
    set_flow(state, flow) 
  }, 
  [ActionTypes.COMPARE_AND_RAISE]({dispatch}, payload: {a: Node, b: Node}) {
    let raiseNode : Node | undefined 
    let newLevel =  0
    if(payload.a.subLevel > payload.b.subLevel + 1) {
      raiseNode = payload.b
      newLevel = payload.a.subLevel - 1
    } else if (payload.b.subLevel > payload.a.subLevel + 1) {
      raiseNode = payload.a
      newLevel = payload.b.subLevel - 1
    }
    if(raiseNode) {
      if(raiseNode.subLevel == -1) {
        dispatch(ActionTypes.SUBSCRIBE_TO_NODE, raiseNode.id) 
      }
      raiseNode.subLevel = newLevel
      dispatch(ActionTypes.SPILL_SUB_LEVEL, raiseNode.id)
    }
  }, 
  [ActionTypes.SPILL_SUB_LEVEL]({state, dispatch}, nodeId: string) {
    const from_flows = Object.values(state.flows_into_from[nodeId] || {})
    const into_flows = Object.values(state.flows_from_into[nodeId] || {})
    const flows = from_flows.concat(into_flows) 
    for(let flow of flows) {
      dispatch(ActionTypes.COMPARE_AND_RAISE, {
        a: state.nodes[flow.from_id], 
        b: state.nodes[flow.into_id]
      })
    }
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

    state.selectedNode = node;

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
    let flow: Flow = {
      from_id: payload.from.id, 
      into_id: payload.into.id, 
      updatePending: true, 
      share: Math.random() * 0.25 + 0.01, 
      notes: ""
    };

    let msg: Messages.FlowCreation = {
      from_id: flow.from_id, 
      into_id: flow.into_id, 
      notes: flow.notes, 
      share: flow.share
    }

    if(undefined !== get_flow(state, flow.from_id, flow.into_id)) {
      dispatch(ActionTypes.UI_ERROR_RAISED, 'could not create a new flow, because a flow already exists') 
    } else {
      set_flow(state, flow) 
      dispatch(ActionTypes.PUBLISH_FLOW_CREATION, msg)
    }
  }, 
  [ActionTypes.PUBLISH_FLOW_CREATION]({}, _payload: Messages.FlowCreation) {
    // only dispatched for aggregator plugin
  }, 
  [ActionTypes.UI_ERROR_RAISED]({}, _errorMessage: string) {
    // TODO
  }, 
  [ActionTypes.NODE_CLICK]({state, commit, dispatch}, node: Node) {
    if(state.map.panning) {
      commit(MutationTypes.STOP_PANNING)
    } else {
      if(state.connectFrom !== undefined) {
        if(node !== state.connectFrom) {
          dispatch(ActionTypes.CREATE_NEW_FLOW, {
            from: state.connectFrom, 
            into: node
          });
          dispatch(ActionTypes.UI_ERROR_RAISED, `Can't connect project to itself`) 
        } 
        commit(MutationTypes.STOP_CONNECTING)
      } else {
        if(state.selectedNode === node) {
          commit(MutationTypes.OPEN_MENU)
        } else {
          if(state.selectedFlow) {
            commit(MutationTypes.DESELECT_FLOW) 
          }
          commit(MutationTypes.SELECT_NODE, node)
        }
      }
    }
  }, 
  [ActionTypes.FLOW_CLICK]({state, commit}, flow: Flow) {
    if(state.selectedFlow == flow) {
      commit(MutationTypes.OPEN_MENU)
    } else {
      commit(MutationTypes.SELECT_FLOW, flow)
      if(state.selectedNode !== undefined) {
        commit(MutationTypes.DESELECT_NODE) 
      }
    }
  }, 
  [ActionTypes.NOWHERE_CLICK]({state, commit, dispatch}) {
    if(state.map.panning) {
      commit(MutationTypes.STOP_PANNING)
    } else {
      if(state.connectFrom !== undefined) {
        commit(MutationTypes.STOP_CONNECTING); 
      } else if(state.selectedNode !== undefined) {
        commit(MutationTypes.DESELECT_NODE); 
      } else if(state.selectedFlow !== undefined) {
        commit(MutationTypes.DESELECT_FLOW); 
      } else {
        dispatch(ActionTypes.CREATE_NEW_NODE, {
          x: state.map.mouse.x, 
          y: state.map.mouse.y
        }) 
      }
    }
  }, 
  [ActionTypes.REMOVE_NODE_LOCALLY_TRIGGERED]({dispatch}, nodeId: string) {
    dispatch(ActionTypes.REMOVE_NODE, nodeId)
  }, 
  [ActionTypes.REMOVE_NODE]({state, commit}, nodeId: string) {
    for(let intoId in state.flows_from_into[nodeId]) {
      commit(MutationTypes.REMOVE_FLOW, {from: nodeId, into: intoId})
    }
    for(let fromId in state.flows_into_from[nodeId]) {
      commit(MutationTypes.REMOVE_FLOW, {from: fromId, into: nodeId})
    }
    commit(MutationTypes.REMOVE_NODE, nodeId)
  }
}
