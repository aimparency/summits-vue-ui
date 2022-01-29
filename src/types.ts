export interface Node {
  id: string, 
  // general 
  title: string, 
  notes: string, 
  // flows_from: string[], 
  // flows_into: string[], 
  // local
  updatePending: boolean, 
  x: number, 
  y: number, 
  r: number, 
  /**
   * seven summits: 2
   * explicit subscriptions (user selection): 2
   * lowest level for subscription: 0 
   * placeholder: -1
   */
  subLevel: number 
}

export interface Flow {
  from_id: string, 
  into_id: string 
  // general 
  share: number, 
  notes: string, 
  // local
  updatePending: boolean 
}

export type NearState = 'disconnected' | 'connecting' | 'connected' 
