import { NodeChanges, FlowChanges, FlowId } from './types'

export interface NodeCreation {
  id: string, 
  title: string, 
  notes: string, 
  deposit: number
}

export interface NodeChange {
  id: string, 
  changes: NodeChanges 
}

export interface FlowCreation {
  id: FlowId, 
  dx: number, 
  dy: number, 
  notes: string, 
  share: number
}

export interface FlowChange {
  id: FlowId, 
  changes: FlowChanges
}

export interface NodeRemoval {
  id: string 
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
