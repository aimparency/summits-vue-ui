import { 
  Near, 
  keyStores, 
  connect, 
  WalletConnection, 
  Contract
} from "near-api-js"; import State from './state'; 

import { Store } from 'vuex'; 
import nearConfig from './near-config'; 

import { ActionTypes } from './actions'; 
import { MutationTypes } from './mutations'; 

import * as Messages from '@/messages'; 

export default function createNearLink () {

  return (store: Store<State>) => {

    const contractAccountId = process.env.VUE_APP_CONTRACT_ACCOUNT_ID
    if(contractAccountId == undefined) {
      let err = "no contract account specified in .env on build"
      store.dispatch(ActionTypes.NEAR_ERROR, err)
      store.commit(MutationTypes.SET_NEAR_STATE, 'error')
    } else {
      store.commit(MutationTypes.SET_NEAR_STATE, 'connecting') 

      connect({
        ...nearConfig, 
        headers: {}, 
        deps: {
          keyStore: new keyStores.BrowserLocalStorageKeyStore()
        }
      }).then(
        near => {
          store.commit(MutationTypes.SET_NEAR_STATE, 'connected')
          onConnection(near, store, contractAccountId)
        },
        err => {
          store.commit(MutationTypes.SET_NEAR_STATE, 'error')
          store.dispatch(ActionTypes.UI_ERROR, "could not establish near connection: " + err)
        }
      )
    }
  }
}

function onConnection(near: Near, store: Store<State>, contractAccountId: string) {

  const wallet = new WalletConnection(near, null);

  if(!wallet.getAccountId()) {
    wallet.requestSignIn(
      contractAccountId 
    )
  }

  const account = wallet.account()

  store.state.near.accountId = account.accountId; 
  
  const contract = new Contract(account, contractAccountId, {
    viewMethods: [
      'get_home_node_id',
      'get_node', 
      'get_node_flows', 
    ], 
    changeMethods: [
      'set_home_node_id',
      'create_node',
      'change_node',
      'remove_node', 
      'create_flow', 
      'change_flow',
      'remove_flow',
      'bulk_change_flow'
    ], 
  }) as any;

  contract.get_home_node_id().then(
    (result: any) => {
      if('Ok' in result) {
        const id = result.Ok
        store.commit(MutationTypes.SET_NODE_DATA, {
          id, 
          subLevel: 2
        })
        store.dispatch(ActionTypes.LOAD_NODE, result.Ok)
      } else {
        store.state.homeUnset = true
      }
    }, 
    (err: any) => {
      store.dispatch(ActionTypes.NEAR_ERROR, "seven summits error. " + err)
    }
  )

  store.subscribeAction(action => {
    if(action.type === ActionTypes.LOAD_NODE) {
      // get_node
      const nodeId = action.payload
      contract.get_node({
        id: nodeId
      }).then(
        (result:any) => {
          if('Ok' in result) {
            let nodeView = result.Ok as Messages.NodeView
            store.commit(MutationTypes.SET_NODE_DATA, nodeView) 
            store.dispatch(ActionTypes.RECALC_NODE_POSITION, {
              nodeId: nodeView.id,
              damping: 0, 
              dampingIncrease: 0.4
            })
            contract.get_node_flows({
              id: nodeId
            }).then( 
              (result: any) => {
                if('Ok' in result) {
                  result.Ok.forEach((flowView: Messages.FlowView) => {
                    store.dispatch(ActionTypes.CREATE_MISSING_NODES_AND_SET_FLOW_DATA, flowView) 
                  })
                }
              }
            )
          }
        }
      )
    } else if (action.type === ActionTypes.ONCHAIN_CREATE_NODE) {
      let nodeCreation = action.payload as Messages.NodeCreation

      store.commit(MutationTypes.INCREASE_NODE_PENDING_TRANSACTIONS, nodeCreation.id)
      contract.create_node(
        nodeCreation 
      ).then(
        (result: any) => {
          if('Ok' in result) {
            store.commit(MutationTypes.APPLY_NODE_CHANGES, nodeCreation.id)
            store.commit(MutationTypes.SET_PUBLISHED, nodeCreation.id) 
            store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeCreation.id)
            if(store.state.homeUnset) {
              contract.set_home_node_id({
                id: nodeCreation.id
              }).then(
                (result: any) => {
                  if(result.Err) {
                    store.dispatch(
                      ActionTypes.TRANSACTION_ERROR, 
                      `Could not set home node id. ${result.Err}`
                    )
                  } else {
                    store.state.homeUnset = false
                  }
                },
                (err : any) => {
                  store.dispatch(
                    ActionTypes.NEAR_ERROR, 
                    `Could not set home node id. ${err}`
                  )
                }
              )
            }
          } else {
            store.dispatch(
              ActionTypes.TRANSACTION_ERROR, 
              `failed to create node. ${result.Err}`
            )
            store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeCreation.id)
          }
        },
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, err)
          store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeCreation.id)
        }
      ) 
    } else if (action.type === ActionTypes.ONCHAIN_CHANGE_NODE) {
      let nodeChange = action.payload as Messages.NodeChange
      store.commit(MutationTypes.INCREASE_NODE_PENDING_TRANSACTIONS, nodeChange.id)
      contract.change_node(
        nodeChange
      ).then(
        (result: any) => {
          if('Ok' in result) {
            store.commit(MutationTypes.APPLY_NODE_CHANGES, nodeChange.id)
            if(nodeChange.changes.deposit) {
              store.dispatch(ActionTypes.RECALC_NODE_POSITION, {
                nodeId: nodeChange.id, 
                damping: 0.7
              })
            }
            store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeChange.id)
          } else {
            store.dispatch(ActionTypes.TRANSACTION_ERROR, result.Err)
            store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeChange.id)
          }
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, err)
          store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeChange.id)
        }
      )
    } else if (action.type === ActionTypes.ONCHAIN_CREATE_FLOW) {
      let flowCreation = action.payload as Messages.FlowCreation
      store.commit(MutationTypes.INCREASE_FLOW_PENDING_TRANSACTIONS, flowCreation.id)
      contract.create_flow(
        flowCreation 
      ).then(
        (result: any) => {
          if('Ok' in result) {
            store.commit(MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS, flowCreation.id)
          } else {
            store.dispatch(ActionTypes.TRANSACTION_ERROR, result.Err) 
            store.commit(MutationTypes.REMOVE_FLOW, { ...flowCreation.id })
          }
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, err)
          store.commit(MutationTypes.REMOVE_FLOW, { ...flowCreation.id })
        }
      )
    } else if (action.type === ActionTypes.ONCHAIN_CHANGE_FLOW) {
      let flowChange = action.payload as Messages.FlowChange
      store.commit(MutationTypes.INCREASE_FLOW_PENDING_TRANSACTIONS, flowChange.id)
      contract.change_flow(
        flowChange
      ).then(
        (result: any) => {
          if('Ok' in result) {
            store.commit(MutationTypes.APPLY_FLOW_CHANGES, flowChange.id)
          } else {
            store.dispatch(ActionTypes.TRANSACTION_ERROR, "failed to change flow. " + result.Err)
          }
          store.commit(MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS, flowChange.id)
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, "failed to change flow. " + err)
          store.commit(MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS, flowChange.id)
        }
      )
    } else if (action.type === ActionTypes.ONCHAIN_BULK_CHANGE_FLOW) {
      let bulkFlowChange = action.payload as Messages.BulkFlowChange
      console.log("bulk changing connection") 
      for(let flowChange of bulkFlowChange.bulk) {
        store.commit(MutationTypes.INCREASE_FLOW_PENDING_TRANSACTIONS, flowChange.id)
      }
      contract.bulk_change_flow(
        bulkFlowChange
      ).then(
        (result: any) => {
          if('Ok' in result) {
            for(let flowChange of bulkFlowChange.bulk) {
              store.commit(MutationTypes.APPLY_FLOW_CHANGES, flowChange.id)
            }
          } else {
            store.dispatch(
              ActionTypes.TRANSACTION_ERROR, 
              "failed to change at least one flow. " + result.Err
            )
          }
          console.log("bulk changing connection done") 

          for(let flowChange of bulkFlowChange.bulk) {
            store.commit(MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS, flowChange.id)
          }
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, "failed to change flow. " + err)
          for(let flowChange of bulkFlowChange.bulk) {
            store.commit(MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS, flowChange.id)
          }
        }
      )
    } else if(action.type === ActionTypes.COMMIT_REMOVE_NODE) {
      let nodeRemoval = action.payload as Messages.NodeRemoval
      store.commit(MutationTypes.INCREASE_NODE_PENDING_TRANSACTIONS, nodeRemoval.id)
      contract.remove_node(
        nodeRemoval
      ).then(
        (result: any) => {
          if('Ok' in result) {
            store.dispatch(ActionTypes.REMOVE_NODE_LOCALLY, nodeRemoval.id)
          } else {
            store.dispatch(ActionTypes.TRANSACTION_ERROR, "failed to remove node. " + result.Err)
          }
          store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeRemoval.id)
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, "failed to remove node. " + err)
          store.commit(MutationTypes.DECREASE_NODE_PENDING_TRANSACTIONS, nodeRemoval.id)
        }
      )
    } else if(action.type === ActionTypes.COMMIT_REMOVE_FLOW) {
      let flowRemoval = action.payload as Messages.FlowRemoval
      store.commit(MutationTypes.INCREASE_FLOW_PENDING_TRANSACTIONS, flowRemoval.id)
      contract.remove_flow(
        flowRemoval
      ).then(
        (result: any) => {
          if('Ok' in result) {
            store.dispatch(ActionTypes.REMOVE_FLOW_LOCALLY, flowRemoval.id)
          } else {
            store.dispatch(ActionTypes.TRANSACTION_ERROR, "failed to remove flow. " + result.Err)
          }
          store.commit(MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS, flowRemoval.id)
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, "failed to remove flow. " + err)
          store.commit(MutationTypes.DECREASE_FLOW_PENDING_TRANSACTIONS, flowRemoval.id)
        }
      )
    } else if (action.type === ActionTypes.REQUEST_NEAR_SIGN_IN) {
      wallet.requestSignIn(
        contractAccountId 
      )
    } else if (action.type === ActionTypes.NEAR_LOGOUT) {
      console.log("signing out") 
      wallet.signOut()
    }
  }); 
}
