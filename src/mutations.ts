import State from './state' 
import { MutationTree } from 'vuex'

import { 
  Node, 
  Flow, 
  FlowId, 
  NearStatus, 
  createDefaultNode 
} from './types'

import { Vector2 } from 'three'

import * as Messages from '@/messages'

export enum MutationTypes {
  UPDATE_MOUSE_MAP_POSITION = 'UPDATE_MOUSE_MAP_POSITION', 
  DESELECT_NODE = 'DESELECT_NODE', 
  SELECT_NODE = 'SELECT_NODE', 
  SELECT_FLOW = 'SELECT_FLOW', 
  START_CONNECTING = 'START_CONNECTING', 
  STOP_CONNECTING = 'STOP_CONNECTING', 
  REMOVE_FLOW = 'REMOVE_FLOW', 
  REMOVE_NODE = 'REMOVE_NODE',

  CHANGE_NODE_TITLE = 'CHANGE_NODE_TITLE', 
  CHANGE_NODE_NOTES = 'CHANGE_NODE_NOTES', 
  CHANGE_NODE_DEPOSIT = 'CHANGE_NODE_DEPOSIT', 
  RESET_NODE_CHANGES = 'RESET_NODE_CHANGES', 

  CHANGE_FLOW_NOTES = 'CHANGE_FLOW_NOTES', 
  CHANGE_FLOW_SHARE = 'CHANGE_FLOW_SHARE', 
  RESET_FLOW_CHANGES = 'RESET_FLOW_CHANGES', 

  OPEN_MENU = 'OPEN_MENU', 

  DESELECT_FLOW = 'DESELECT_FLOW', 

  ACTIVATE_PANNING = 'ACTIVATE_PANNING', 
  
  STOP_PANNING = 'STOP_PANNING', 

  TOGGLE_SHOW_PROFILE = 'TOGGLE_SHOW_PROFILE', 
  TOGGLE_MENU = 'TOGGLE_MENU', 

  SET_NEAR_STATE = 'SET_NEAR_STATE', 

  SET_NODE_DATA = 'SET_NODE_DATA', 
  SET_SUB_LEVEL = 'SET_SUB_LEVEL', 

  APPLY_NODE_CHANGES = 'APPLY_NODE_CHANGES', 
  APPLY_FLOW_CHANGES = 'APPLY_FLOW_CHANGES', 

  SET_PUBLISHED = 'SET_PUBLISHED', 

  INCREASE_NODE_PENDING_TRANSACTIONS = 'INCREASE_NODE_PENDING_TRANSACTIONS', 
  DECREASE_NODE_PENDING_TRANSACTIONS = 'DECREASE_NODE_PENDING_TRANSACTIONS', 

  INCREASE_FLOW_PENDING_TRANSACTIONS = 'INCREASE_FLOW_PENDING_TRANSACTIONS', 
  DECREASE_FLOW_PENDING_TRANSACTIONS = 'DECREASE_FLOW_PENDING_TRANSACTIONS', 
}

export const mutations: MutationTree<State> = {
  [MutationTypes.UPDATE_MOUSE_MAP_POSITION](state: State, position: Vector2) {
    state.map.mouse = position
  }, 
  [MutationTypes.DESELECT_NODE](state: State) {
    state.selectedNode = undefined; 
  },
  [MutationTypes.DESELECT_FLOW](state: State) {
    state.selectedFlow = undefined; 
  },
  [MutationTypes.SELECT_FLOW](state: State, flow: Flow) {
    state.selectedFlow = flow; 
  }, 
  [MutationTypes.SELECT_NODE](state: State, node: Node) {
    state.selectedNode = node; 
  }, 
  [MutationTypes.STOP_CONNECTING](state: State) {
    delete state.connectFrom
  }, 
  [MutationTypes.START_CONNECTING](state, node: Node) {
    state.connectFrom = node
  }, 
  [MutationTypes.REMOVE_FLOW](state, id: FlowId) {
    delete state.flows_from_into[id.from][id.into]
    delete state.flows_into_from[id.into][id.from]
    if(state.selectedFlow !== undefined) {
      if(state.selectedFlow.id.from == id.from && state.selectedFlow.id.into == id.into) {
        delete state.selectedFlow
      }
    }
  }, 
  [MutationTypes.REMOVE_NODE](state, nodeId: string) {
    if(state.selectedNode !== undefined) {
      if(state.selectedNode.id === nodeId) {
        delete state.selectedNode 
      }
    }
    delete state.nodes[nodeId]
  },
  [MutationTypes.CHANGE_NODE_TITLE](_state, payload: { node: Node, newTitle: string }) {
    if(payload.node.title === payload.newTitle) {
      delete payload.node.changes.title 
    } else {
      payload.node.changes.title = payload.newTitle
    }
  }, 
  [MutationTypes.CHANGE_NODE_NOTES](_state, payload: {node: Node, newNotes: string}) {
    if(payload.node.notes === payload.newNotes) {
      delete payload.node.changes.notes 
    } else {
      payload.node.changes.notes = payload.newNotes
    }
  }, 
  [MutationTypes.CHANGE_NODE_DEPOSIT](_state, payload: {node: Node, newDeposit: number}) {
    if(payload.node.deposit === payload.newDeposit) {
      delete payload.node.changes.deposit
    } else {
      payload.node.changes.deposit = payload.newDeposit
    }
  }, 
  [MutationTypes.CHANGE_FLOW_SHARE](_state, payload: {flow: Flow, newShare: number}) {
    if(payload.flow.share === payload.newShare) {
      delete payload.flow.changes.share 
    } else {
      payload.flow.changes.share = payload.newShare
    }
  }, 
  [MutationTypes.CHANGE_FLOW_NOTES](_state, payload: {flow: Flow, newNotes: string}) {
    if(payload.flow.notes === payload.newNotes) {
      delete payload.flow.changes.notes 
    } else {
      payload.flow.changes.notes = payload.newNotes
    }
  }, 
  [MutationTypes.RESET_NODE_CHANGES](_, node: Node) {
    node.changes = {}
  }, 
  [MutationTypes.OPEN_MENU](state) {
    state.menu.open = true
  }, 
  [MutationTypes.ACTIVATE_PANNING](state) {
    state.map.panning = true
  }, 
  [MutationTypes.STOP_PANNING](state) {
    state.map.panning = false 
  }, 
  [MutationTypes.TOGGLE_SHOW_PROFILE](state) {
    state.menu.showProfile = !state.menu.showProfile;
  }, 
  [MutationTypes.TOGGLE_MENU](state) {
    state.menu.open = !state.menu.open
  }, 
  [MutationTypes.SET_NEAR_STATE](state, newNearState: NearStatus) {
    state.near.status = newNearState
  }, 
  [MutationTypes.SET_NODE_DATA](state, nodeView: Messages.NodeView) {
    if(nodeView.id in state.nodes) {
      Object.assign(state.nodes[nodeView.id], {
        title: nodeView.title, 
        notes: nodeView.notes, 
        deposit: nodeView.deposit, 
        updatePending: false, 
        r: nodeView.deposit
      }) 
    } else {
      state.nodes[nodeView.id] = {
        ...createDefaultNode(), 
        ...nodeView, 
        r: nodeView.deposit
      }
    }
  }, 
  [MutationTypes.SET_SUB_LEVEL](state, payload: {nodeId: string, level: number}) {
    state.nodes[payload.nodeId].subLevel = payload.level
  }, 
  [MutationTypes.APPLY_FLOW_CHANGES](state, flowId: FlowId) {
    let flow = state.flows_from_into[flowId.from][flowId.into]
    
    if(flow) {
      Object.assign(flow, flow.changes)
      flow.changes = {}
    }
  }, 
  [MutationTypes.APPLY_NODE_CHANGES](state, nodeId: string) {
    let node = state.nodes[nodeId]
    
    if(node) {
      Object.assign(node, node.changes)
      if(node.changes.deposit) {
        node.r = node.changes.deposit
      }
      node.changes = {}
    }
  }, 
  [MutationTypes.SET_PUBLISHED](state, nodeId: string) {
    let node = state.nodes[nodeId]
    if(node) {
      node.unpublished = false
    }
  }, 
  [MutationTypes.INCREASE_FLOW_PENDING_TRANSACTIONS](state, flowId: FlowId) {
    let flow = state.flows_from_into[flowId.from][flowId.into]
    if(flow) {
      flow.pendingTransactions += 1
    }
  },
  [MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS](state, flowId: FlowId) {
    let flow = state.flows_from_into[flowId.from][flowId.into]
    if(flow) {
      flow.pendingTransactions -= 1
    }
  },
  [MutationTypes.INCREASE_NODE_PENDING_TRANSACTIONS](state, nodeId: string) {
    let node = state.nodes[nodeId]
    if(node) {
      node.pendingTransactions += 1
    }
  },
  [MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS](state, nodeId: string) {
    let node = state.nodes[nodeId]
    if(node) {
      node.pendingTransactions -= 1
    }
  },
}
