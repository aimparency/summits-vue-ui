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
import { Action } from "near-api-js/lib/transaction";

export default function createNearLink () {

  return (store: Store<State>) => {

    const contractAccountId = process.env.VUE_APP_CONTRACT_ACCOUNT_ID
    if(contractAccountId == undefined) {
      console.error("no contract account specified in .env on build") 
      store.commit(MutationTypes.SET_NEAR_STATE, 'error')
    } else {
      store.commit(MutationTypes.SET_NEAR_STATE, 'connecting') 

      connect({
        ...nearConfig, 
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
    ], 
  }) as any;

  contract.get_home_node_id().then(
    (result: any) => {
      console.log("home node id result", result)
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
    (err: any) => console.log("seven summits error", err)
  )

  store.subscribeAction(action => {
    if(action.type === ActionTypes.LOAD_NODE) {
      // get_node
      const nodeId = action.payload
      contract.get_node({
        node_id: nodeId
      }).then(
        (result:any) => {
          if('Ok' in result) {
            console.log("should be stored in state:", result.Ok) 
            let nodeView = result.Ok as Messages.NodeView
            store.commit(MutationTypes.SET_NODE_DATA, nodeView) 
            contract.get_node_flows({
              node_id: nodeId
            }).then( 
              (result: any) => {
                console.log("got get_node_flows result", result) 
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

      console.log("create node payload:", nodeCreation)

      store.commit(MutationTypes.INCREASE_PENDING_TRANSACTIONS, nodeCreation.id)
      contract.create_node(
        nodeCreation 
      ).then(
        (result: any) => {
          console.log("result of create_node call asd", result)
          if('Ok' in result) {
            store.commit(MutationTypes.APPLY_CHANGES, nodeCreation.id)
            store.commit(MutationTypes.SET_PUBLISHED, nodeCreation.id) 
            store.commit(MutationTypes.DECREASE_PENDING_TRANSACTIONS, nodeCreation.id)
            if(store.state.homeUnset) {
              contract.set_home_node_id({
                home_node_id: nodeCreation.id
              }).then(
                (result: any) => {
                  if(result.Err) {
                    store.dispatch(
                      ActionTypes.TRANSACTION_ERROR, 
                      `Could not set home node id. ${result.Err}`
                    )
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
            store.commit(MutationTypes.DECREASE_PENDING_TRANSACTIONS, nodeCreation.id)
          }
        },
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, err)
          store.commit(MutationTypes.DECREASE_PENDING_TRANSACTIONS, nodeCreation.id)
        }
      ) 
    } else if (action.type === ActionTypes.ONCHAIN_CHANGE_NODE) {
      let nodeChange = action.payload as Messages.NodeChange
      store.commit(MutationTypes.INCREASE_PENDING_TRANSACTIONS, nodeChange.id)
      contract.change_node(
        nodeChange
      ).then(
        (result: any) => {
          if('Ok' in result) {
            store.commit(MutationTypes.APPLY_CHANGES, nodeChange.id)
            store.commit(MutationTypes.DECREASE_PENDING_TRANSACTIONS, nodeChange.id)
          } else {
            store.dispatch(ActionTypes.TRANSACTION_ERROR, result.Err)
            store.commit(MutationTypes.DECREASE_PENDING_TRANSACTIONS, nodeChange.id)
          }
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, err)
          store.commit(MutationTypes.DECREASE_PENDING_TRANSACTIONS, nodeChange.id)
        }
      )
    } else if (action.type === ActionTypes.ONCHAIN_CREATE_FLOW) {
      contract.create_flow(
        action.payload
      ).then(
        (result: any) => {
          if('Ok' in result) {
            //set stuff
          } else {
            store.dispatch(ActionTypes.TRANSACTION_ERROR, result.Err) 
          }
        }, 
        (err: any) => {
          store.dispatch(ActionTypes.NEAR_ERROR, err)
        }
      )
      // create_flow
    } else if(action.type === ActionTypes.COMMIT_REMOVE_NODE) {
      contract.remove_node({
        node_id: action.payload
      }).then((result: any) => {
        console.log("result of remove node", result) 
      })
      // remove_node
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
