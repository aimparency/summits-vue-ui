export interface Node {
  id: string, 
  // general 
  title: string, 
  notes: string, 
  // flows_from: string[], 
  // flows_into: string[], 
  // local
  preliminary: boolean, 
  x: number, 
  y: number, 
  r: number, 
  subscriptionDistance?: number
}

export interface Flow {
  from_id: string, 
  into_id: string 
  // general 
  share: number, 
  notes: string, 
  // local
  preliminary: boolean 
}
