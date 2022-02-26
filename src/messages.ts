import { 
  Effort, 
  NodeChanges, FlowChanges, FlowId, NodeState 
} from './types'

// Nodes 
  // Out
export interface NodeCreation {
  id: string, 
  title: string, 
  notes: string, 
  deposit: number, 
  state: string,
  effort: Effort, 
}

export interface NodeChange {
  id: string, 
  changes: NodeChanges 
}

export interface NodeRemoval {
  id: string 
}
  // In
export interface NodeView {
  id: string, 
  title: string, 
  notes: string, 
  deposit: number, 
  state: NodeState, 
  effort: Effort, 
  owner: string, 
}

// Flows 
  // Out
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

export interface FlowRemoval {
  id: string
}

  // In
export interface FlowView {
  id: FlowId, 
  dx: number, 
  dy: number, 
  notes: string, 
  share: number
}

export interface BulkFlowChange {
  bulk: FlowChange[]
}
