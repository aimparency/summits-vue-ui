import State from './state' 
import { MutationTree } from 'vuex'

export enum MutationTypes {
  UPDATE_MOUSE_MAP_POSITION = 'UPDATE_MOUSE_MAP_POSITION', 
  ADD_SUBSCRIPTION = 'ADD_SUBSCRIPTION'
}

export const mutations: MutationTree<State> = {
  [MutationTypes.ADD_SUBSCRIPTION](state: State, node_id: string) {
    state.subscriptions.add(node_id)
  }, 
  [MutationTypes.UPDATE_MOUSE_MAP_POSITION](state: State, payload: {x: number, y: number}) {
    state.map.mouse.x = payload.x
    state.map.mouse.y = payload.y
  }
}
