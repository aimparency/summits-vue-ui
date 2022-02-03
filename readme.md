# summits-vue-ui

## Project setup

### install dependecies 
```
yarn install
```

### blockchain connection

Edit `./src/near-config.ts` according to the NEAR network you want to connect with. 
In case you are using kurtosis for spinning up a localnet, copy the variables from the kurtosis script ouput into `./src/near-kurtosis-output.ts`. 

Specify the contract account id in `./.env`.

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

