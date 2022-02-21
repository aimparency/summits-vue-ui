# summits-vue-ui
This is a UI for summits. 
It connects to a NEAR blockchain and interacts through a smart contract. 
It allows users to create and edit projects (nodes) and flows (edges). 

You probably want to check out the __blockchain-only__ branch. 

Also have a look at the smart contract code here: [github.com/aimparency/summits-contracts/tree/blockchain-only](https://github.com/aimparency/summits-contracts/tree/blockchain-only)

## development setup

### install dependecies 
```
yarn install
```

### blockchain connection

Edit `./src/near-config.ts` according to the NEAR network you want to connect with. 
In case you are using kurtosis for spinning up a localnet, copy the variables from the kurtosis script ouput into `./src/near-kurtosis-output.ts`. 

Specify the contract account id in `./.env`.

## Vue scripts
### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Customize vue configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

