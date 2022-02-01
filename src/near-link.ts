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

    const contractAccountId = process.env.CONTRACT_ACCOUNT_ID
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
      near => onConnection(near, store, contractAccountId),
      err => {
        store.commit(MutationTypes.SET_NEAR_STATE, 'error')
        store.dispatch(ActionTypes.UI_ERROR, "could not establish near connection: " + err)
      }
    )

    // initially: load seven summits

  // NEAR contract call example
  // example change method call
  // await contract.method_name(
  //  {
  //    arg_name: "value", // argument name and value - pass empty object if no args required
  //  },
  //  300000000000000, // attached GAS (optional)
  //  1000000000000000000000000 // attached deposit in yoctoNEAR (optional)
  // );    
  
  // examplel view method call
  // const response = await contract.view_method_name({ arg_name: "arg_value" });
    
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
    viewMethods: ['get_seven_summits'], 
    changeMethods: ['add_node'], 
  }) as any;

  store.commit(MutationTypes.SET_NEAR_STATE, 'connected') 

  contract.get_seven_summits().then(
    (result: any) => console.log("seven summits result", result), 
    (err: any) => console.log("seven summits error", err)
  )

  store.subscribeAction(action => {
    if(action.type === ActionTypes.LOAD_NODE) {
      // get_node
      contract.get_node(
        action.payload
      )
    } else if (action.type === ActionTypes.PUBLISH_NODE_CREATION) {
      // create_node_with_value
      contract.create_node_with_value(
        action.payload
      ).then((result: any) => {
        console.log("result of subscribe call", result)
      }) 
    } else if (action.type === ActionTypes.PUBLISH_FLOW_CREATION) {
      contract.create_flow(
        action.payload
      ).then((result: any) => {
        console.log("result of create flow call"
      // create_flow
    } else if(action.type === ActionTypes.REMOVE_NODE_LOCALLY_TRIGGERED) {
      // remove_node
    }
    // update flow
    // update_node
  }); 
}, 
