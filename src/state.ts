import { Node, Flow } from './types'

export default interface State {
  nodes: {[id: string]: Node}, 
  flows: {[from_id: string]: {[into_id: string]: Flow}}
}
