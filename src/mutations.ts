import State from './state' 
import { MutationTree } from 'vuex'

import { Node, Flow } from './types'
import { Vector2 } from 'three'

export enum MutationTypes {
  UPDATE_MOUSE_MAP_POSITION = 'UPDATE_MOUSE_MAP_POSITION', 
  ADD_SUBSCRIPTION = 'ADD_SUBSCRIPTION', 
  DESELECT_NODE = 'DESELECT_NODE', 
  SELECT_NODE = 'SELECT_NODE', 
  SELECT_FLOW = 'SELECT_FLOW', 
  START_CONNECTING = 'START_CONNECTING', 
  STOP_CONNECTING = 'STOP_CONNECTING', 
  REMOVE_FLOW = 'REMOVE_FLOW', 
  REMOVE_NODE = 'REMOVE_NODE',

  UPDATE_NODE_TITLE = 'UPDATE_NODE_TITLE', 
  UPDATE_NODE_NOTES = 'UPDATE_NODE_NOTES', 

  UPDATE_FLOW_NOTES = 'UPDATE_FLOW_NOTES', 

  OPEN_MENU = 'OPEN_MENU', 

  DESELECT_FLOW = 'DESELECT_FLOW', 

  ACTIVATE_PANNING = 'ACTIVATE_PANNING', 
  
  STOP_PANNING = 'STOP_PANNING', 

  TOGGLE_MENU = 'TOGGLE_MENU'
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
  [MutationTypes.REMOVE_FLOW](state, ids: {from: string, into: string}) {
    delete state.flows_from_into[ids.from][ids.into]
    delete state.flows_into_from[ids.into][ids.from]
  }, 
  [MutationTypes.REMOVE_NODE](state, nodeId: string) {
    if(state.selectedNode !== undefined) {
      if(state.selectedNode.id === nodeId) {
        delete state.selectedNode 
      }
    }
    delete state.nodes[nodeId]
  },
  [MutationTypes.UPDATE_NODE_TITLE](_state, payload: {node: Node, title: string}) {
    payload.node.title = payload.title
  }, 
  [MutationTypes.UPDATE_NODE_NOTES](_state, payload: {node: Node, notes: string}) {
    payload.node.notes = payload.notes
  }, 
  [MutationTypes.UPDATE_FLOW_NOTES](_state, payload: {flow: Flow, notes: string}) {
    payload.flow.notes = payload.notes
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
  [MutationTypes.TOGGLE_MENU](state) {
    state.menu.open = !state.menu.open
  }
}
