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
  
  const contract = new Contract(account, contractAccountId, {
    viewMethods: [
      'get_seven_summits',
      'get_node'
    ], 
    changeMethods: [
      'create_node',
      'change_node',
      'create_flow', 
      'remove_node', 
    ], 
  }) as any;

  contract.get_seven_summits().then(
    (result: any) => {
      console.log("seven summits result", result)
      if(result.Ok) {
        store.dispatch(ActionTypes.INIT, result.Ok)
      }
    }, 
    (err: any) => console.log("seven summits error", err)
  )

  store.subscribeAction(action => {
    if(action.type === ActionTypes.LOAD_NODE) {
      // get_node
      contract.get_node({
        node_id: action.payload
      }).then(
        (response:any) => {
          if(response.Ok) {
            console.log("should be stored in state:", response.Ok) 
            store.dispatch(ActionTypes.SET_NODE_DATA, response.Ok) 
          }
        }
      )
    } else if (action.type === ActionTypes.ONCHAIN_CREATE_NEW_NODE) {
      contract.create_node(
        action.payload
      ).then((result: any) => {
        console.log("result of create_node call", result)
      }) 
    } else if (action.type === ActionTypes.ONCHAIN_CHANGE_NODE) {
      contract.change_node(
        action.payload
      ).then((result: any) => {
        console.log("result of subscribe call", result)
      }) 
    } else if (action.type === ActionTypes.PUBLISH_FLOW_CREATION) {
      contract.create_flow(
        action.payload
      ).then((result: any) => {
        console.log("result of create flow call", result)
      })
      // create_flow
    } else if(action.type === ActionTypes.COMMIT_NODE_REMOVAL) {
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
    }
    // update flow
    // update_node
  }); 
}
