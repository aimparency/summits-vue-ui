import State from './state' 
import { MutationTree } from 'vuex'

import { Flow, Node } from './types'

export enum MutationTypes {
  UPDATE_MOUSE_MAP_POSITION = 'UPDATE_MOUSE_MAP_POSITION', 
  ADD_SUBSCRIPTION = 'ADD_SUBSCRIPTION', 
  DESELECT_NODE = 'DESELECT_NODE', 
  SELECT_NODE = 'SELECT_NODE', 
  START_CONNECTING = 'START_CONNECTING', 
  STOP_CONNECTING = 'STOP_CONNECTING', 
  REMOVE_FLOW = 'REMOVE_FLOW', 
  REMOVE_NODE = 'REMOVE_NODE',
}

export const mutations: MutationTree<State> = {
  [MutationTypes.UPDATE_MOUSE_MAP_POSITION](state: State, position: {x: number, y: number}) {
    state.map.mouse.x = position.x
    state.map.mouse.y = position.y
  }, 
  [MutationTypes.DESELECT_NODE](state: State) {
    state.selectedNode = undefined; 
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
    delete state.nodes[nodeId]
    if(state.selectedNode !== undefined) {
      if(state.selectedNode.id === nodeId) {
        delete state.selectedNode 
      }
    }
  }
}
