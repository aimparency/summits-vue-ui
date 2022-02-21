import kurtosisVars from './near-kurtosis-output'

const NETWORK = 'testnet' 

const configs = {
  kurtosis: {
    networkId: kurtosisVars.networkName, 
    nodeUrl: kurtosisVars.nearNodeRpcUrl,
    walletUrl: kurtosisVars.walletUrl,
    helperUrl: kurtosisVars.contractHelperServiceUrl
  }, 
  testnet: {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org'
  }
}

export default configs[NETWORK] 
