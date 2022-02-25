
export interface Node {
  id: string, 
  title: string, 
  notes: string, 
  updatePending: boolean, 
  pendingTransactions: number, 
  deposit: number, 
  x: number, 
  y: number, 
  r: number, 
  color: string, 
  /**
   * @subLevel
   * seven summits: 2
   * explicit subscriptions (user selection): 2
   * lowest level for subscription: 0 
   * placeholder: -1
   */
  subLevel: number, 
  unpublished: boolean, 
  changes: NodeChanges, 
  state: NodeState, 
}

export type NodeState = "open" | "in progress" | "submitted"  // approvals are a separate entity 

export interface NodeChanges {
  title?: string, 
  notes?: string, 
  deposit?: number, 
  state?: NodeState
}

export function createDefaultNode() : Node {
  return {
    id: '', 
    x: 0,
    y: 0, 
    r: 1, 
    color: "#888", 
    title: "", 
    notes: "", 
    unpublished: false, 
    updatePending: false, 
    pendingTransactions: 0, 
    changes: {
    }, 
    deposit: 1, 
    subLevel: -1, 
    state: "open"
  }
}

export interface FlowId {
  from: string,
  into: string, 
}


export interface Flow {
  id: FlowId, 
  share: number, 
  notes: string, 
  dx: number, 
  dy: number
  changes: FlowChanges,
  pendingTransactions: number
}

export interface FlowChanges {
  notes?: string, 
  share?: number,
  dx?: number, 
  dy?: number
}

export function createDefaultFlow() : Flow {
  return {
    id: {
      from: '', 
      into: ''
    }, 
    dx: 0, 
    dy: 0, 
    notes: "", 
    share: 0.2, 
    changes: {}, 
    pendingTransactions: 0,
  }
}

export type NearStatus = 'disconnected' | 'connecting' | 'connected' | 'logging-in' | 'logged-in'

export interface LogEntry {
  id: number, 
  msg: string, 
  type: string
}

export function createDefaultEntry() : LogEntry {
  return {
    id: 0, 
    msg: "", 
    type: "info", 
  }
}
