export interface Node {
  id: string, 
  title: string, 
  notes: string, 
  preliminary: boolean, 
  relevancy: number,
  flows: {
    to: string[], 
    from: string[]
  }
}

export interface Flow {
  percentage: number, 
  notes: string, 
  from_id: string, 
  into_id: string 
}
