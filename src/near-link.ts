import { 
  keyStores, 
  connect, 
  WalletConnection, 
  Contract
} from "near-api-js"; import State from './state'; 

import { Store } from 'vuex'; 
import nearConfig from './near-config'; 

import { ActionTypes } from './actions'; 
import { MutationTypes } from './mutations'; 

const CONTRACT_NAME = "summits"

export default function createNearLink () {

  return (store: Store<State>) => {

    let contract: undefined | any;

    store.commit(MutationTypes.SET_NEAR_STATE, 'connecting') 

    connect({
      ...nearConfig, 
      deps: {
        keyStore: new keyStores.BrowserLocalStorageKeyStore()
      }
    }).then(
      near => {
        store.commit(MutationTypes.SET_NEAR_STATE, 'connected') 

        const wallet = new WalletConnection(near, null);

        if(!wallet.getAccountId()) {
          wallet.requestSignIn(
            "dev-1643436574128-49572366335961"
          )
        }

        const account = wallet.account()

        const contract = new Contract(account, CONTRACT_NAME, {
          viewMethods: ['get_status'], 
          changeMethods: ['add_node'], 
        });

        console.log("contract is", contract)
      }, 
      err => {
        store.dispatch(ActionTypes.UI_ERROR, "could not establish near connection: " + err)
      }
    )

    // basically replace what is currently sent to the aggregator: 
    //
    // when a node is created => send node creation
    // when a node is changes => send node change 
    // when a node is removed => send node removal 
    //
    // when a flow is created => send flow creation
    // when a flow is changes => send a flow change
    // when a flow is removed => send flow removal
    
    const hasConnection = () : boolean => {
      if ( contract !== undefined ) {
        // more checks? 
        return true
      }
      return false
    }

    store.subscribeAction(async action => {
      if (action.type === ActionTypes.PUBLISH_NODE_CREATION) {
        if(hasConnection()) {
          contract.add_node(
            action.payload
          ).then((result: any) => {
            console.log("result of subscribe action", result)
          }) 
        }
      } 
     // else if (action.type === ActionTypes.PUBLISH_FLOW_CREATION) {
     //   socket.send(JSON.stringify({
     //     FlowCreation: action.payload
     //   })); 
     // } else if(action.type === ActionTypes.REMOVE_NODE_LOCALLY_TRIGGERED) {
     //   const nodeRemoval = {
     //     node_id: action.payload
     //   }
     //   socket.send(JSON.stringify({
     //     NodeRemoval: nodeRemoval
     //   })); 
     // }
    }); 

  // example change method call
  //await contract.method_name(
  //  {
  //    arg_name: "value", // argument name and value - pass empty object if no args required
  //  },
  //  300000000000000, // attached GAS (optional)
  //  1000000000000000000000000 // attached deposit in yoctoNEAR (optional)
  //);    
  
  // examplel view method call
  // const response = await contract.view_method_name({ arg_name: "arg_value" });
    
  }
}
