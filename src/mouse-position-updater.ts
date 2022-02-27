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
      updateWhatever(e.pageX, e.pageY); 
    });

    let touchStuff = {
      count: 0, 
      dragFingerId: 0, 
      pinchAndZoomFingerIds: {
        a: 0, 
        b: 0
      }
    }

    window.addEventListener("wheel", (e: WheelEvent) => {
      const map = store.state.map
      const f = Math.pow(1.1, e.deltaY / 150)
      let mouseBefore = pageToSVGCoords(e.pageX, e.pageY)
      map.scale *= f
      let mouseAfter = pageToSVGCoords(e.pageX, e.pageY) 
      let delta = mouseAfter.clone().sub(mouseBefore)
      map.offset.sub(delta) 
    })
    
    const updateWhatever = (x: number, y: number) : void => {
      store.commit(
        MutationTypes.UPDATE_MOUSE_MAP_POSITION, 
        pageToSVGCoords(x, y)
      )
      if(store.state.map.panBeginning !== undefined) {
        updatePan(x, y); 
      } else if (store.state.map.dragBeginning) {
        updateDrag(x, y); 
      }
    }

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

    const endWhatever = () : void => {
      if(store.state.map.panBeginning) {
        endPan(); 
      } else if (store.state.map.dragBeginning) {
        endDrag();
      }
    }

    const endPan = () => {
      delete store.state.map.panBeginning; 
    }

    const endDrag = () => {
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
      updateWhatever(e.pageX, e.pageY)
      endWhatever() 
    })

    window.addEventListener("touchstart", (e: TouchEvent) => { 
      if(e.touches.length > 0) {
        if(e.touches.length > 1) {
          // 2 or more touches         
          if(touchStuff.count < 2) {
            console.log("more than 1 touch!") 
          }
        } else {
          // 1 touch
          if(touchStuff.count == 0) {
            // new touch 
            touchStuff.count = 1
            touchStuff.dragFingerId = e.touches[0].identifier
            if(store.state.dragCandidate) {
              beginDrag(store.state.dragCandidate, e.touches[0].pageX, e.touches[0].pageY)
            } else {
              beginPan(e.touches[0].pageX, e.touches[0].pageY)
            }
          } else if (touchStuff.count > 1) {
            // from 2 or more to 1
            // endPinch()
          }
        }
      }
    });

    window.addEventListener("touchmove", (e: TouchEvent) => { 
      if(touchStuff.count == 1) {
        let touch = e.touches[0]
        updateWhatever(touch.pageX, touch.pageY)
      } else if (touchStuff.count > 1) {
        // update pinch
      }
    })

    window.addEventListener("touchend", (e: TouchEvent) => { 
      if(touchStuff.count == 1) {
        touchStuff.count = 0
        endWhatever()
      }
    })

    window.addEventListener("touchcancel", (e: TouchEvent) => { 
    })

    window.addEventListener("click", (e: MouseEvent) => {
      store.commit(
        MutationTypes.UPDATE_MOUSE_MAP_POSITION, 
        pageToSVGCoords(e.pageX, e.pageY)
      )
      store.dispatch(ActionTypes.NOWHERE_CLICK)
    });

  }
}

