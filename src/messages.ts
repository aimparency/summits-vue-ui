// incoming messages
export interface FlowUpdate {
  from_id: string, 
  into_id: string, 
  notes?: string,
  share?: number
}

export interface NodeUpdate {
  id: string, 
  title?: string, 
  notes?: string
}

export interface NodeUpdate {
  id: string, 
  title?: string, 
  notes?: string
}

export interface Init {
  node_ids: string[]
}

// outgoing messages
export interface NodeCreation {
  id: string, 
  title: string, 
  notes: string
}

export interface FlowCreation {
  from_id: string,
  into_id: string, 
  notes: string, 
  share: number
}

export interface NodeSubscription {
  node_id: string
}
