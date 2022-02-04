import { FlowId } from './types'

export interface NodeCreationWithValue {
  id: string, 
  title: string, 
  notes: string, 
  deposit: number
}

export interface FlowCreation {
  id: FlowId, 
  dx: number, 
  dy: number, 
  notes: string, 
  share: number
}

export interface NodeRemoval {
  node_id: string 
}

export interface NodeView {
  id: string, 
  title: string, 
  notes: string, 
  deposit: number, 
  owner: string
}

export interface FlowView {
  id: FlowId, 
  dx: number, 
  dy: number, 
  notes: string, 
  share: number
}
