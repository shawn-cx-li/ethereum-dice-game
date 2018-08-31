## Objective

This project is an Ethereum private network playground with a dice guessing mini-game smart contract, it also demonstrate setting up private Ethereum network, deploying smart contract on the network, finally interact with Ethereum smart contract with a simple web-based DAPP.

The smart contract include an ERC223 standard token, a crowdsale which accept ETH and distribute the ERC223 token and a mini dice game in which players can bet with the ERC223 token they holding.

### Setup Ethereum private network (optional)

1. Clone git repo

    git clone https://github.com/shawn-cx-li/ethereum-dice-game.git 

2. Start the first node. The first node can be boosted from either a cloud server or the local machine, map the docker port 30303 with local port 30303, and expose TCP 30303 in security setting

3. Run other nodes, boostrap it to the first node
  ```
    cd ethereum-demo/scripts
    RPC_PORT=8545 ./runnode.sh node1
  ```
4. Run node console

    docker exec -ti ethereum-node1 geth attach

5. Import key in node (in the console)

    web3.personal.importRawKey("<Private Key>","<New Password>")

6. Set your key as miner beneficiary account

    miner.setEtherbase("Address")

7. Start mining

    miner.start(1)

## Install and config Metamask
1. Search and install Metamask in `chrome app store`
2. Create a wallet in metamask
3. Export private key

## Start DAPP
1. install dependencies
  ```
    cd ethereum-demo
    npm install
  ```

2. Install truffle
    
    npm install -g truffle

3. Generate smart contract artifacts
    
    tuffle compile

4. Run DAPP

    npm run dev