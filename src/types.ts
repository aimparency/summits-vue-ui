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
  /**
   * @subLevel
   * seven summits: 2
   * explicit subscriptions (user selection): 2
   * lowest level for subscription: 0 
   * placeholder: -1
   */
  subLevel: number, 
  unpublished: boolean, 
  changes: NodeChanges
}

export interface NodeChanges {
  title?: string, 
  notes?: string, 
  deposit?: number
}

export function createDefaultNode() : Node {
  return {
    id: '', 
    x: 0,
    y: 0, 
    r: 1, 
    title: "", 
    notes: "", 
    unpublished: false, 
    updatePending: false, 
    pendingTransactions: 0, 
    changes: {
    }, 
    deposit: 1, 
    subLevel: -1
  }
}

export interface FlowId {
  from: string,
  into: string, 
}

export interface Flow {
  id: FlowId, 
  // general 
  share: number, 
  notes: string, 
  // local
  updatePending: boolean, 
  unpublished: boolean, 
  changes: {
    notes?: string
  }, 
  dx: number, 
  dy: number
}

export function createDefaultFlow() : Flow {
  return {
    id: {
      from: '', 
      into: ''
    }, 
    dx: 0, 
    dy: 0, 
    updatePending: false, 
    notes: "", 
    share: Math.random() * 0.25 + 0.01, 
    changes: {}, 
    unpublished: false
  }
}

export type NearStatus = 'disconnected' | 'connecting' | 'connected' | 'logging-in' | 'logged-in'

export interface LogEntry {
  id: number, 
  msg: string, 
  type: string
}
