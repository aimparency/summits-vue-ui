import kurtosisVars from './near-kurtosis-output'

const NETWORK = 'kurtosis' 

const configs = {
  kurtosis: {
    headers: {
    }, 
    networkId: kurtosisVars.networkName, 
    nodeUrl: kurtosisVars.nearNodeRpcUrl,
    walletUrl: kurtosisVars.walletUrl,
    helperUrl: kurtosisVars.contractHelperServiceUrl
  }
}

export default configs[NETWORK] 
