export interface Node {
  id: string, 
  title: string, 
  notes: string, 
  updatePending: boolean, 
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
  changes: {
    title?: string, 
    notes?: string, 
    deposit?: number
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

export type NearState = 'disconnected' | 'connecting' | 'connected' | 'logging-in' | 'logged-in'
