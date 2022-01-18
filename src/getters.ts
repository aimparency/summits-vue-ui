import { GetterTree } from 'vuex'; 
import State from '@/state'; 

import ColorHash from 'color-hash'; 

const colorHash = new ColorHash({ lightness: 0.4 }); 

export const getters: GetterTree<State, State> = {
  nodeColor: (state: State) => (node_id: string) => {
    let node = state.nodes[node_id]
    if(node === undefined) {
      return '#f00'
    } else {
      if(node.subLevel === -1) {
        return '#666'
      } else {
        return colorHash.hex(node.id); 
      }
    }
  }
}
