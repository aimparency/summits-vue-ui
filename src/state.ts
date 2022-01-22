import { Node, Flow } from '@/types';
import { Vector2 } from 'three';

export default interface State {
  nodes: {[id: string]: Node}, 
  flows_from_into: {[from_id: string]: {[into_id: string]: Flow}}, 
  flows_into_from: {[into_id: string]: {[from_id: string]: Flow}}, 

  /** 
   * initial set of nodes and every node a user clicks. 
   * a certain radius in path length of nodes around anchor nodes will be subscribed to. 
   */
  selectedNode?: Node, 
  selectedFlow?: Flow, 
  connectFrom?: Node, 
  map: {
    mouse: Vector2,    /** Offset is in map coordinates. 
     * assume the mouse pointer is in the upper left corner, 
     * zooming in would not change the offset. 
     * that means offset always means the top left corner in map-coordinates */
    /** Maybe better: first offset is added, then scale is applied 
     * from model coordinates to screen coordinates
     */
    scale: number, 
    offset: Vector2, 
    panBeginning: undefined | {
      offset: Vector2, 
      page: Vector2
    }, 
    panning: boolean
  }, 
  menu: {
    open: boolean
  }
}
