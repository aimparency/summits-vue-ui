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
export interface NodeCreationWithValue {
  id: string, 
  title: string, 
  notes: string, 
  deposit: number
}

export interface FlowCreation {
  key: {
    from_id: string,
    into_id: string, 
  }, 
  dx: number, 
  dy: number, 
  notes: string, 
  share: number
}

export interface NodeRemoval {
  node_id: string 
}

