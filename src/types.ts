 //  export type Unit = 'c' | 'y' | 'o' | 'w' | 'd' | 'h' | 'i' | 's'

interface Factors {
  [unit: string]: {
    smallest: string, 
    factors: {
      [unit: string]: number
    }, 
    beginning: string, 
    singular: string, 
    plural: string, 

  }
}

export class Effort {
  unit: string = 'c'
  amount: number = 0

  static fulls = ['century', 'year', 'month', 'week', 'day', 'hour', 'minute', 'second']
  static plural = ['centuries', 'years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds']
  static units: Factors = {
    c: {
      factors: {
        y: 100, 
      },
      smallest: 'y', 
      beginning: 'c', 
      singular: 'centuryu', 
      plural: 'centuries'
    }, 
    y: {
      factors: {
        o: 12, 
        w: 52, 
        d: 365, 
      },
      smallest: 'd', 
      beginning: 'y', 
      singular: 'year', 
      plural: 'years'
    }, 
    o: {
      factors: {
        w: 4, 
        d: 30, 
      }, 
      smallest: 'd', 
      beginning: 'mo', 
      singular: 'month', 
      plural: 'months'
    }, 
    w: {
      factors: {
        d: 7, 
      }, 
      smallest: 'd', 
      beginning: 'w', 
      singular: 'week', 
      plural: 'weeks'
    }, 
    d: {
      factors: {
        h: 24
      }, 
      smallest: 'h', 
      beginning: 'd', 
      singular: 'day', 
      plural: 'days'
    }, 
    h: {
      factors: {
        i: 60, 
      }, 
      smallest: 'i', 
      beginning: 'h', 
      singular: 'hour', 
      plural: 'hours'
    }, 
    i: {
      factors: {
        s: 60, 
      }, 
      smallest: 's', 
      beginning: 'mi', 
      singular: 'minute', 
      plural: 'miuntes'
    }
  }  

  static fromString(s: string) : Effort {
    let smallestUnit = 'c'
    let efforts: Effort[] = []
    Object.keys(Effort.units).forEach(unitChar => {
      let unit = Effort.units[unitChar]
      let match = s.match(new RegExp('(\\d+\\.?\\d*)\\s*' + unit.beginning))
      if(match !== null) {
        let amount = parseFloat(match[1])
        efforts.push(new Effort(
          unitChar, 
          amount
        ))
        smallestUnit = unitChar
      }
    })
    let totalAmount = 0
    for(let effort of efforts) {
      effort.convert(smallestUnit) 
      totalAmount += effort.amount
    }
    return new Effort(
      smallestUnit, 
      totalAmount
    )
  }

  constructor(unit: string, amount: number) {
    this.unit = unit
    this.amount = amount
  }

  convert(targetUnit: string) {
    while(!(targetUnit in Effort.units[this.unit])) {
      if(this.unit == "s") {
        console.error("failed to convert Effort") 
        return 
      } else {
        let convInfo = Effort.units[this.unit]
        this.convert(convInfo.smallest)
      }
    }
    this.amount *= Effort.units[this.unit].factors[targetUnit]
  }

  humanize() : string {
    return this.amount.toString() + (
      this.amount == 1 ? Effort.units[this.unit].singular : Effort.units[this.unit].plural
    )
    
  }
}

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
  effort: Effort, 
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
    state: "open", 
    effort: new Effort('w', 1)
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
