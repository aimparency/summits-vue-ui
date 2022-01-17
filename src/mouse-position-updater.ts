import { MutationTypes } from './mutations'; 
import { Store } from 'vuex';
import State from './state';

export default function mousePositionUpdater() {
  return (store: Store<State>) => {
    window.addEventListener("mousemove", (event: MouseEvent) => {
      store.commit(MutationTypes.UPDATE_MOUSE_MAP_POSITION, {
        x: event.pageX / store.state.map.scale + store.state.map.offset.x, 
        y: event.pageY / store.state.map.scale + store.state.map.offset.y
      })
    }) 
  }
}

