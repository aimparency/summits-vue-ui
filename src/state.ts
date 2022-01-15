import { Node, Flow } from '@/types'

export default interface State {
  nodes: {[id: string]: Node}, 
  flows: {[from_id: string]: {[into_id: string]: Flow}}, 
  selectedNode?: Node, 
  connectFrom?: Node, 
  map: {
    mouse: {
      x: number, 
      y: number
    }, 
    /** Offset is in map coordinates. 
     * assume the mouse pointer is in the upper left corner, 
     * zooming in would not change the offset. 
     * that means offset always means the top left corner in map-coordinates */
    scale: number, 
    offset: { 
      x: number, 
      y: number
    }
  }
}
