import { MutationTypes } from './mutations'; 
import { ActionTypes } from './actions'; 
import { Store } from 'vuex';
import State from './state';

export default function createMousePositionUpdater() {
  let justPanned = false; 

  return (store: Store<State>) => {

    const pageToSVGCoords = (x: number, y: number) => {
      const map = store.state.map; 
      let halfSide, xOffset, yOffset
      if(window.innerWidth < window.innerHeight) {
        halfSide = window.innerWidth / 2
        xOffset = 0
        yOffset = (window.innerHeight - window.innerWidth) / 2
      } else {
        halfSide = window.innerHeight / 2
        xOffset = (window.innerWidth - window.innerHeight) / 2
        yOffset = 0
      }
      return {
        x: ((x - xOffset) / halfSide - 1) / map.scale + map.offset.x, 
        y: ((y - yOffset) / halfSide - 1) / map.scale + map.offset.y
      }
    }
    window.addEventListener("mousemove", (e: MouseEvent) => {
      if(store.state.connectFrom !== undefined) {
        store.commit(
          MutationTypes.UPDATE_MOUSE_MAP_POSITION, 
          pageToSVGCoords(e.pageX, e.pageY)
        )
      }
      if(store.state.map.panBeginning !== undefined) {
        updatePan(e.pageX, e.pageY); 
      }
    });

    window.addEventListener("wheel", (e: WheelEvent) => {
      e.preventDefault();
      const previous = store.state.map.scale
      store.state.map.scale *= Math.pow(1.1, e.deltaY / 150)

    })

    const updatePan = (x: number, y: number) => {
      const pb = store.state.map.panBeginning; 
      if(pb !== undefined) {
        const dx = pb.page.x - x
        const dy = pb.page.y - y
        if(dx * dx + dy * dy > 5 * 5) {
          justPanned = true;
          const halfSide = Math.min(
            window.innerWidth, 
            window.innerHeight
          ) / 2;
          const offset = store.state.map.offset; 
          const scale = store.state.map.scale; 
          offset.x = pb.offset.x + dx / halfSide / scale; 
          offset.y = pb.offset.y + dy / halfSide / scale;
        }
      }
    }
    const beginPan = (x:number, y:number) => {
      store.state.map.panBeginning = {
        page: {x, y}, 
        offset: {
          x: store.state.map.offset.x, 
          y: store.state.map.offset.y
        }
      }
    }
    const endPan = (x: number, y: number) => {
      updatePan(x,y);
      delete store.state.map.panBeginning; 
    }
    window.addEventListener("mousedown", (e: MouseEvent) => {
      beginPan(e.pageX, e.pageY) 
    })
    window.addEventListener("mouseup", (e: MouseEvent) => {
      endPan(e.pageX, e.pageY); 
    })
    window.addEventListener("click", (e: MouseEvent) => {
      if(justPanned) {
        justPanned = false; 
      } else {
        store.commit(
          MutationTypes.UPDATE_MOUSE_MAP_POSITION, 
          pageToSVGCoords(e.pageX, e.pageY)
        )
        store.dispatch(ActionTypes.NOWHERE_CLICK)
      }
    })
  }
}

