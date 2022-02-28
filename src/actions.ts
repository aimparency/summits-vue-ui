import State from './state';
import * as Messages from './messages';

import { v4 as uuid } from 'uuid'; 
import { Flow, Node, createDefaultFlow, createDefaultNode, FlowId } from '@/types'; 

import { ActionTree } from 'vuex';
import { MutationTypes } from './mutations';
import { nodeColor } from './tools/node-color';

const MAX_SUB_LEVEL = 2;  

export enum ActionTypes {
  LOAD_NODE = 'LOAD_NODE',
  LOAD_NEIGHBOR_NODE = 'LOAD_NEIGHBOR_NODE',

  COMPARE_AND_RAISE = 'COMPARE_AND_RAISE', 
  SPILL_SUB_LEVEL = 'SPILL_SUB_LEVEL',


  SET_FLOW_DATA = 'SET_FLOW_DATA', 

  // Node actions
  CREATE_NODE = 'CREATE_NODE', 


  COMMIT_NODE = 'COMMIT_NODE',
  ONCHAIN_CREATE_NODE = 'ONCHAIN_CREATE_NODE', 
  ONCHAIN_CHANGE_NODE = 'ONCHAIN_CHANGE_NODE', 

  COMMIT_REMOVE_NODE = 'COMMIT_REMOVE_NODE', 
  REMOVE_NODE = 'REMOVE_NODE', 
  REMOVE_NODE_LOCALLY = 'REMOVE_NODE_LOCALLY', 

  // Flow actions
  CREATE_FLOW = 'CREATE_FLOW', 

  COMMIT_FLOW = 'COMMIT_FLOW', 
  ONCHAIN_CREATE_FLOW = 'ONCHAIN_CREATE_FLOW', 
  ONCHAIN_CHANGE_FLOW = 'ONCHAIN_CHANGE_FLOW', 
  ONCHAIN_BULK_CHANGE_FLOW = 'ONCHAIN_BULK_CHANGE_FLOW', 

  COMMIT_REMOVE_FLOW = 'COMMIT_REMOVE_FLOW', 
  REMOVE_FLOW = 'REMOVE_FLOW',
  REMOVE_FLOW_LOCALLY = 'REMOVE_FLOW_LOCALLY', 

  CREATE_MISSING_NODES_AND_SET_FLOW_DATA = 'CREATE_MISSING_NODES_AND_SET_FLOW_DATA',

  // LogEntries
  LOG = 'LOG',
  UI_ERROR = 'UI_ERROR', 
  NEAR_ERROR = 'NEAR_ERROR', 
  TRANSACTION_ERROR = 'TRANSACTION_ERROR', 

  // clicks
  NODE_SVG_CLICK = 'NODE_SVG_CLICK', 
  FLOW_SVG_CLICK = 'FLOW_SVG_CLICK', 
  NOWHERE_CLICK = 'NOWHERE_CLICK', 

  SELECT_NODE = 'SELECT_NODE', 
  SELECT_FLOW = 'SELECT_FLOW', 

  REQUEST_NEAR_SIGN_IN = 'REQUEST_NEAR_SIGN_IN', 
  NEAR_LOGOUT = 'NEAR_LOGOUT', 

  RECALC_NODE_POSITION = 'RECALC_NODE_POSITION', 

  PERSIST_NODE_POSITION = 'PERSIST_NODE_POSITION', 
}


function get_flow(state: State, fromId: string, intoId: string) : Flow | undefined { 
  let from_into_flow = flow_exists_in_dict(
    state.flows_from_into, 
    fromId, 
    intoId
  )
  let into_from_flow = flow_exists_in_dict(
    state.flows_into_from, 
    intoId, 
    fromId
  )
  if(from_into_flow !== undefined && from_into_flow == into_from_flow) {
    return from_into_flow
  }
}

function set_flow_and_return_proxy(state: State, flow: Flow) {
  let proxy = set_flow_in_dict(
    state.flows_from_into, 
    flow.id.from, 
    flow.id.into, 
    flow
  ) 
  set_flow_in_dict(
    state.flows_into_from, 
    flow.id.into, 
    flow.id.from, 
    proxy // we use the same proxy otherwise we can't compare flow identity. 
  )
  return proxy
}

type Dict = {[x: string]: {[y: string]: Flow}}

function flow_exists_in_dict(
  dict: Dict, 
  i1: string, 
  i2: string
) : Flow | undefined {
  if(i1 in dict) {
    return dict[i1][i2] 
  }
}

function set_flow_in_dict(
  dict: Dict, 
  i1: string, 
  i2: string,
  flow: Flow
) : Flow {
  if(!(i1 in dict)) {
    dict[i1] = {}
  }
  return dict[i1][i2] = flow
}

/***
 * this function calculates the factor to which a flow dx and dy is relative to
 */
function dFactor(from: Node, into: Node) : number {
  return from.r + into.r
}

// maybe make a interface Actions with all the types only... To make typing be precise
// check here: https://dev.to/3vilarthas/vuex-typescript-m4j
// but maybe typing already works perfectly. 

export const actions: ActionTree<State, State> = {
  [ActionTypes.LOAD_NODE]({}, _nodeId: string) {
    // the aggregatorLink subscribes to this action
  }, 
  [ActionTypes.LOAD_NEIGHBOR_NODE](
    {state, dispatch}, 
    payload: {knownNodeId: string, newNodeId: string, x: number, y: number}
  ) {
    const knownNode = state.nodes[payload.knownNodeId];
    let commonValues = {
      subLevel: knownNode.subLevel - 1,
      deposit: knownNode.deposit, 
      r: knownNode.deposit, // best estimate
      id: payload.newNodeId, 
      color: nodeColor(payload.newNodeId), 
      x: payload.x, 
      y: payload.y,
    }
    if(knownNode.subLevel > 0) {
      state.nodes[payload.newNodeId] = {
        ...createDefaultNode(),
        ...commonValues, 
        updatePending: true, 
      }
      dispatch(ActionTypes.LOAD_NODE, payload.newNodeId)
    } else if (knownNode.subLevel === 0) {
      state.nodes[payload.newNodeId] = {
        ...createDefaultNode(),
        ...commonValues, 
        updatePending: false, 
      }
    } 
    dispatch(ActionTypes.RECALC_NODE_POSITION, {
      nodeId: payload.newNodeId, 
      damping: 0, 
      dampingIncrease: 1
    })
  }, 
  [ActionTypes.COMPARE_AND_RAISE]({dispatch}, payload: {a: Node, b: Node}) {
    let raiseNode : Node | undefined 
    let newLevel =  0
    if(payload.a.subLevel > payload.b.subLevel + 1) {
      raiseNode = payload.b
      newLevel = payload.a.subLevel - 1
    } else if (payload.b.subLevel > payload.a.subLevel + 1) {
      raiseNode = payload.a
      newLevel = payload.b.subLevel - 1
    }
    if(raiseNode) {
      if(raiseNode.subLevel == -1) {
        dispatch(ActionTypes.LOAD_NODE, raiseNode.id) 
      }
      raiseNode.subLevel = newLevel
      dispatch(ActionTypes.SPILL_SUB_LEVEL, raiseNode.id)
    }
  }, 
  [ActionTypes.SPILL_SUB_LEVEL]({state, dispatch}, nodeId: string) {
    const from_flows = Object.values(state.flows_into_from[nodeId] || {})
    const into_flows = Object.values(state.flows_from_into[nodeId] || {})
    const flows = from_flows.concat(into_flows) 
    for(let flow of flows) {
      dispatch(ActionTypes.COMPARE_AND_RAISE, {
        a: state.nodes[flow.id.from], 
        b: state.nodes[flow.id.into]
      })
    }
  }, 
  [ActionTypes.ONCHAIN_CHANGE_NODE]({}, _nodeChange: Messages.NodeChange) {
    //subscribed to by near-link
  }, 
  [ActionTypes.ONCHAIN_CREATE_NODE]({}, _nodeCreation: Messages.NodeCreation) {
    //subscribed to by near-link
  }, 
  [ActionTypes.CREATE_NODE]({state, commit}, payload: {x: number, y: number, deposit: number}) {
    let nodeId = uuid(); 

    const node = state.nodes[nodeId] = {
      ...createDefaultNode(), 
      id: nodeId, 
      x: payload.x, 
      y: payload.y, 
      deposit: payload.deposit, 
      r: payload.deposit, 
      updatePending: false, 
      subLevel: 2, 
      unpublished: true
    }; 

    commit(MutationTypes.SELECT_NODE, node)
  }, 
  [ActionTypes.COMMIT_NODE]({dispatch}, node: Node) {
    if(node.unpublished && node.pendingTransactions == 0) {
      dispatch(ActionTypes.ONCHAIN_CREATE_NODE, {
        id: node.id, 
        title: node.changes.title ?? node.title, 
        notes: node.changes.notes ?? node.notes, 
        deposit: node.changes.deposit ?? node.deposit, 
        state: node.changes.state ?? node.state, 
        effort: node.changes.effort ?? node.effort, 
      }) 
    } else {
      dispatch(ActionTypes.ONCHAIN_CHANGE_NODE, {
        id: node.id,
        changes: {
          ...node.changes
        }
      }) 
    }
  }, 
  [ActionTypes.CREATE_MISSING_NODES_AND_SET_FLOW_DATA](
    {state, dispatch}, 
    flowView: Messages.FlowView
  ) {
    let setFlowData = () => { dispatch(ActionTypes.SET_FLOW_DATA, flowView) }
    let from = state.nodes[flowView.id.from]
    let into = state.nodes[flowView.id.into]
    if(!from) {
      if(into) {
        setFlowData()
        dispatch(ActionTypes.LOAD_NEIGHBOR_NODE, {
          knownNodeId: flowView.id.into, 
          newNodeId: flowView.id.from, 
          x: into.x - flowView.dx, 
          y: into.y - flowView.dy, 
        })
      }
    } else {
      setFlowData()
      if(!(flowView.id.into in state.nodes)) {
        dispatch(ActionTypes.LOAD_NEIGHBOR_NODE, {
          knownNodeId: flowView.id.from, 
          newNodeId: flowView.id.into,
          x: from.x + flowView.dx, 
          y: from.y + flowView.dy, 

        }) 
      } else {
        setFlowData()
        dispatch(ActionTypes.COMPARE_AND_RAISE, {
          a: state.nodes[flowView.id.from], 
          b: state.nodes[flowView.id.into]
        })
        dispatch(ActionTypes.RECALC_NODE_POSITION, {
          nodeId: flowView.id.into, 
          damping: 0.4, 
          dampingIncrease: 0.4
        })
        dispatch(ActionTypes.RECALC_NODE_POSITION, {
          nodeId: flowView.id.from, 
          damping: 0.4, 
          dampingIncrease: 0.4
        })
      }
    }
  }, 
  [ActionTypes.SET_FLOW_DATA]({state}, flowView: Messages.FlowView) {
    let flow = get_flow(state, flowView.id.from, flowView.id.into); 
    if(flow === undefined) {
      flow = {
        ...createDefaultFlow(), 
        ...flowView, 
      }
      set_flow_and_return_proxy(state, flow) 
    } else {
      Object.assign(flow, {
        ...flowView
      })
    }
  }, 
  [ActionTypes.RECALC_NODE_POSITION](
    {state, dispatch}, 
    payload: { 
      nodeId: string, 
      damping: number, 
      dampingIncrease: number
    }
  ) {
    let dampingIncrease = payload.dampingIncrease == undefined ? 0.1 : payload.dampingIncrease

    const node = state.nodes[payload.nodeId]
    // ok, everything happens in sizes relative to this node as long as possible
    const references = []
    const neighborIds = []
    const runs = [{
      dict: state.flows_from_into, 
      sign: -1
    }, {
      dict: state.flows_into_from, 
      sign: 1
    }]
    let totalWeight = 0
    for(let run of runs) {
      if(run.dict[payload.nodeId] !== undefined) {
        for(let neighborId in run.dict[payload.nodeId]) {
          const neighbor = state.nodes[neighborId]
          if(!(neighbor.subLevel < 0)) {
            const flow = run.dict[payload.nodeId][neighborId]
            const f = dFactor(node, neighbor) * run.sign
            const weight = flow.share / (Math.pow(flow.dx, 2) + Math.pow(flow.dy, 2)) // 1/x^2
            references.push({
              x: neighbor.x + flow.dx * f, 
              y: neighbor.y + flow.dy * f, 
              weight
            })
            neighborIds.push(neighborId)
            totalWeight += weight
          }
        }
      }
    }
     
    if(neighborIds.length > 0) {
      let newX = 0
      let newY = 0
      const wf = 1 / totalWeight 
      for(let reference of references) {
        const f = reference.weight * wf
        newX += f * reference.x
        newY += f * reference.y
      }

      let squareDistance = Math.pow(node.x - newX, 2) + Math.pow(node.y - newY, 2)

      node.x = node.x * payload.damping + newX * (1 - payload.damping) 
      node.y = node.y * payload.damping + newY * (1 - payload.damping) 

      const increasedDamping = payload.damping + dampingIncrease
      if(increasedDamping < 1 && squareDistance > Math.pow(node.r * 0.1, 2) ) {
        for(let nId of neighborIds) {
          dispatch(ActionTypes.RECALC_NODE_POSITION, {
            nodeId: nId, 
            damping: increasedDamping, 
            dampingIncrease
          }) 
        }
      }
    }
  }, 
  [ActionTypes.CREATE_FLOW]({state, dispatch}, payload: {from: Node, into: Node}) {
    const fInv = 1 / dFactor(payload.from, payload.into)

    let flow: Flow = {
      ...createDefaultFlow(),
      id: {
        from: payload.from.id, 
        into: payload.into.id, 
      }, 
      dx: (payload.into.x - payload.from.x) * fInv, 
      dy: (payload.into.y - payload.from.y) * fInv, 
    };

    if(undefined !== get_flow(state, flow.id.from, flow.id.into)) {
      dispatch(
        ActionTypes.UI_ERROR,
        'Could not create a new flow, because a flow between these nodes exists already'
      )
    } else {
      let msg: Messages.FlowCreation = {
        id: {
          ...flow.id
        }, 
        notes: flow.notes, 
        share: flow.share, 
        dx: (payload.into.x - payload.from.x) * fInv, 
        dy: (payload.into.y - payload.from.y) * fInv
      }
      flow = set_flow_and_return_proxy(state, flow) 
      dispatch(ActionTypes.SELECT_FLOW, flow) 
      dispatch(ActionTypes.COMPARE_AND_RAISE, {
        a: payload.from, 
        b: payload.into
      })
      dispatch(ActionTypes.ONCHAIN_CREATE_FLOW, msg)
    }
  }, 
  [ActionTypes.ONCHAIN_CREATE_FLOW]({}, _payload: Messages.FlowCreation) {
    // only dispatched for aggregator plugin
  }, 
  [ActionTypes.ONCHAIN_BULK_CHANGE_FLOW]({}, _payload: Messages.BulkFlowChange) {
  }, 
  [ActionTypes.ONCHAIN_CHANGE_FLOW]({}, _payload: Messages.FlowChange) {
  }, 
  [ActionTypes.COMMIT_FLOW]({dispatch}, flow: Flow) {
    dispatch(ActionTypes.ONCHAIN_CHANGE_FLOW, {
      id: {
        ...flow.id
      },
      changes: {
        ...flow.changes
      }
    }) 
  }, 
  [ActionTypes.UI_ERROR]({dispatch}, msg: string) {
    dispatch(ActionTypes.LOG, {
      msg: "UI_ERROR: " + msg, 
      type: 'ui-error', 
    })
  }, 
  [ActionTypes.NEAR_ERROR]({dispatch}, msg: string) {
    dispatch(ActionTypes.LOG, {
      msg: "NEAR_ERROR: " + msg, 
      type: 'near-error', 
    })
  }, 
  [ActionTypes.TRANSACTION_ERROR]({dispatch}, msg: string) {
    dispatch(ActionTypes.LOG, {
      msg: "TRANSACTION_ERROR: " + msg, 
      type: 'transaction-error'
    })
  }, 
  [ActionTypes.LOG]({state}, p: {msg: string, type: string}) {
    state.logEntries.push({
      id: state.nextLogEntryId++, 
      msg: p.msg, 
      type: p.type
    })
  }, 
  [ActionTypes.NODE_SVG_CLICK]({state, commit, dispatch}, node: Node) {
    if(state.map.preventReleaseClick) { 
      state.map.preventReleaseClick = false
      console.log("unsetting prevent release click") 
    } else {
      if(state.connectFrom !== undefined) {
        if(node !== state.connectFrom) {
          dispatch(ActionTypes.CREATE_FLOW, {
            from: state.connectFrom, 
            into: node
          });
        } else {
          dispatch(
            ActionTypes.UI_ERROR, 
            `No flow was created: Cannot connect node to itself`
          ) 
        }
        commit(MutationTypes.STOP_CONNECTING)
      } else {
        dispatch(MutationTypes.SELECT_NODE, node)
      }
    }
  }, 
  [ActionTypes.SELECT_NODE]({state, dispatch, commit}, node: Node) {
    if(node.subLevel < MAX_SUB_LEVEL) {
      node.subLevel = MAX_SUB_LEVEL 
    }
    dispatch(ActionTypes.LOAD_NODE, node.id) // reload node on selection
    commit(MutationTypes.OPEN_MENU)
    if(state.selectedFlow) {
      commit(MutationTypes.DESELECT_FLOW) 
    }
    commit(MutationTypes.SELECT_NODE, node)
  },
  [ActionTypes.SELECT_FLOW]({state, dispatch, commit}, flow: Flow) {
    for(let nodeId of [flow.id.from, flow.id.into]) {
      let node = this.state.nodes[nodeId]
      if(node) {
        if(node.subLevel < 0) {
          node.subLevel = 0
          dispatch(ActionTypes.LOAD_NODE, nodeId)
        }
      }
    }
    commit(MutationTypes.OPEN_MENU)
    commit(MutationTypes.SELECT_FLOW, flow)
    if(state.selectedNode) {
      commit(MutationTypes.DESELECT_NODE) 
    }
  }, 
  [ActionTypes.NOWHERE_CLICK]({state, commit, dispatch}) {
    if(state.map.preventReleaseClick) { 
      state.map.preventReleaseClick = false
      console.log("unsetting prevent release click") 
    } else if(state.menu.open) {
      state.menu.open = false
    } else {
      if(state.connectFrom !== undefined) {
        commit(MutationTypes.STOP_CONNECTING); 
      } else if(state.selectedNode !== undefined) {
        commit(MutationTypes.DESELECT_NODE); 
      } else if(state.selectedFlow !== undefined) {
        commit(MutationTypes.DESELECT_FLOW); 
      } else {
        state.menu.open = true
        dispatch(ActionTypes.CREATE_NODE, {
          x: state.map.mouse.x, 
          y: state.map.mouse.y, 
          deposit: 0.1 / state.map.scale
        }) 
      }
    }
  }, 
  [ActionTypes.COMMIT_REMOVE_NODE]({}, _nodeRemoval: Messages.NodeRemoval) {
  }, 
  [ActionTypes.REMOVE_NODE_LOCALLY]({commit, state}, nodeId: string) {
    for(let intoId in state.flows_from_into[nodeId]) {
      commit(MutationTypes.REMOVE_FLOW, {from: nodeId, into: intoId})
    }
    for(let fromId in state.flows_into_from[nodeId]) {
      commit(MutationTypes.REMOVE_FLOW, {from: fromId, into: nodeId})
    }
    commit(MutationTypes.REMOVE_NODE, nodeId)
  }, 
  [ActionTypes.REMOVE_NODE]({dispatch}, node: Node) {
    if(node.unpublished) {
      dispatch(ActionTypes.REMOVE_NODE_LOCALLY, node.id)
    } else {
      dispatch(ActionTypes.COMMIT_REMOVE_NODE, {
        id: node.id
      }) 
    }
  }, 
  [ActionTypes.COMMIT_REMOVE_FLOW]({}, _flowRemoval: Messages.FlowRemoval) {
  },
  [ActionTypes.REMOVE_FLOW_LOCALLY]({commit}, flowId: FlowId){
    commit(MutationTypes.REMOVE_FLOW, flowId)
  }, 
  [ActionTypes.REMOVE_FLOW]({dispatch}, flow: Flow) {
    dispatch(ActionTypes.COMMIT_REMOVE_FLOW, {
      id: {
        ...flow.id
      }
    })
  }, 
  [ActionTypes.REQUEST_NEAR_SIGN_IN]({}) {}, 
  [ActionTypes.NEAR_LOGOUT]({}) {}, 
  [ActionTypes.PERSIST_NODE_POSITION]({state, dispatch}, node: Node) {
    const runs = [{
      dict: state.flows_from_into, 
      sign: 1
    }, {
      dict: state.flows_into_from, 
      sign: -1
    }]
    let flowChanges = []
    for(let run of runs) {
      if(run.dict[node.id] !== undefined) {
        for(let neighborId in run.dict[node.id]) {
          const neighbor = state.nodes[neighborId]
          if(!(neighbor.subLevel < 0)) {
            const flow = run.dict[node.id][neighborId]
            const f = dFactor(node, neighbor) * run.sign
            flow.changes.dx = (neighbor.x - node.x) / f
            flow.changes.dy = (neighbor.y - node.y) / f
            flowChanges.push({
              id: {
                ...flow.id
              },
              changes: {
                ...flow.changes
              }
            }) 
          }
        }
      }
    }
    dispatch(ActionTypes.ONCHAIN_BULK_CHANGE_FLOW, {
      bulk: flowChanges
    }) 
  }
}
