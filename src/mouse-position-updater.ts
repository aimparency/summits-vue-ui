import { MutationTypes } from './mutations'; 
import { ActionTypes } from './actions'; 
import { Store } from 'vuex';
import State from './state';
import { Vector2 } from 'three';

import { Node } from '@/types';

export default function createMousePositionUpdater() {
  return (store: Store<State>) => {

    const pageToSVGCoords = (x: number, y: number) : Vector2 => {
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
      return new Vector2 (
        ((x - xOffset) / halfSide - 1) / map.scale + map.offset.x, 
        ((y - yOffset) / halfSide - 1) / map.scale + map.offset.y
      )
    }
    window.addEventListener("mousemove", (e: MouseEvent) => {
      store.commit(
        MutationTypes.UPDATE_MOUSE_MAP_POSITION, 
        pageToSVGCoords(e.pageX, e.pageY)
      )
      if(store.state.map.panBeginning !== undefined) {
        updatePan(e.pageX, e.pageY); 
      } else if (store.state.map.dragBeginning) {
        updateDrag(e.pageX, e.pageY); 
      }
    });

    window.addEventListener("wheel", (e: WheelEvent) => {
      const map = store.state.map
      const f = Math.pow(1.1, e.deltaY / 150)
      let mouseBefore = pageToSVGCoords(e.pageX, e.pageY)
      map.scale *= f
      let mouseAfter = pageToSVGCoords(e.pageX, e.pageY) 
      let delta = mouseAfter.clone().sub(mouseBefore)
      map.offset.sub(delta) 
    })

    const updatePan = (x: number, y: number) => {
      const pb = store.state.map.panBeginning; 
      if(pb !== undefined) {
        const dx = pb.page.x - x
        const dy = pb.page.y - y
        if(dx * dx + dy * dy > 5 * 5) {
          store.state.map.preventReleaseClick = true
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
    const updateDrag = (x: number, y: number) => {
      const db = store.state.map.dragBeginning;
      const node = store.state.dragCandidate; 
      if(db && node) {
        const dx = db.page.x - x
        const dy = db.page.y - y
        if(dx * dx + dy * dy > 5 * 5) {
          store.state.map.preventReleaseClick = true
          const halfSide = Math.min(
            window.innerWidth, 
            window.innerHeight
          ) / 2;
          const scale = store.state.map.scale; 
          node.x = db.initialPosition.x - dx / halfSide / scale; 
          node.y = db.initialPosition.y - dy / halfSide / scale;
        }
      }
    }
    const beginPan = (x:number, y:number) => {
      store.state.map.panBeginning = {
        page: new Vector2(x, y), 
        offset: store.state.map.offset.clone()
      }
    }
    const beginDrag = (node: Node, x:number, y:number) => {
      store.state.map.dragBeginning = {
        page: new Vector2(x,y), 
        initialPosition: new Vector2(node.x, node.y) 
      }
    }
    const endPan = (x: number, y: number) => {
      updatePan(x,y);
      delete store.state.map.panBeginning; 
    }
    const endDrag = (x: number, y: number) => {
      updateDrag(x,y);  
      if(store.state.map.preventReleaseClick && store.state.dragCandidate) {
        store.dispatch(ActionTypes.PERSIST_NODE_POSITION, store.state.dragCandidate)
      }
      delete store.state.map.dragBeginning; 
      delete store.state.dragCandidate; 
    }
    window.addEventListener("mousedown", (e: MouseEvent) => {
      if(store.state.dragCandidate) {
        beginDrag(store.state.dragCandidate, e.pageX, e.pageY)
      } else {
        beginPan(e.pageX, e.pageY) 
      }
    })
    window.addEventListener("mouseup", (e: MouseEvent) => {
      if(store.state.map.panBeginning) {
        endPan(e.pageX, e.pageY); 
      } else if (store.state.map.dragBeginning) {
        endDrag(e.pageX, e.pageY);
      }
    })
    window.addEventListener("click", (e: MouseEvent) => {
      store.commit(
        MutationTypes.UPDATE_MOUSE_MAP_POSITION, 
        pageToSVGCoords(e.pageX, e.pageY)
      )
      store.dispatch(ActionTypes.NOWHERE_CLICK)
    })
  }
}

