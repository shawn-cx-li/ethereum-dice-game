#!/bin/bash
IMGNAME="ethereum/client-go:latest"
NODE_NAME=$1
NODE_NAME=${NODE_NAME:-"node1"}
DETACH_FLAG=${DETACH_FLAG:-"-d"}
CONTAINER_NAME="ethereum-$NODE_NAME"
DATA_ROOT=${DATA_ROOT:-"$(pwd)/.ether-$NODE_NAME"}
DATA_HASH=${DATA_HASH:-"$(pwd)/.ethash"}
echo "Destroying old container $CONTAINER_NAME..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME
RPC_PORTMAP=
RPC_ARG=
if [[ ! -z $RPC_PORT ]]; then
    RPC_ARG='--rpc --rpcaddr=0.0.0.0 --rpcapi=db,eth,net,web3,personal --rpccorsdomain "*"'
    RPC_PORTMAP="-p $RPC_PORT:8545"
fi
# BOOTNODE_URL=${BOOTNODE_URL:-$(./getbootnodeurl.sh)}
BOOTNODE_URL=enode://44526fbbea092e73125a0478166cc535cefef9542fc8a4927a83bea133658e56b6147a8ebf4cd0f9ee01a5c6d0bba7c9319a47cace10eefa0334b91b5694d4eb@13.238.128.56:30303
if [ ! -f $(pwd)/genesis.json ]; then
    echo "No genesis.json file found, please run 'genesis.sh'. Aborting."
    exit
fi
if [ ! -d $DATA_ROOT/keystore ]; then
    echo "$DATA_ROOT/keystore not found, running 'geth init'..."
    docker run --rm \
        -v $DATA_ROOT:/root/.ethereum \
        -v $(pwd)/genesis.json:/opt/genesis.json \
        $IMGNAME init /opt/genesis.json
    echo "...done!"
fi
cp $(pwd)/UTC--2018-02-27T23-45-47.908035118Z--43e7d443deee4e8fc6a67ff5e4a1abfde6ecbfd1 $DATA_ROOT/keystore
echo "Running new container $CONTAINER_NAME..."
docker run $DETACH_FLAG --name $CONTAINER_NAME \
    --network ethereum \
    -v $DATA_ROOT:/root/.ethereum \
    -v $DATA_HASH:/root/.ethash \
    -v $(pwd)/genesis.json:/opt/genesis.json \
    $RPC_PORTMAP \
    $IMGNAME --networkid 1 --bootnodes=$BOOTNODE_URL $RPC_ARG --gasprice 0 --syncmode=fast --cache=512 --verbosity=4 --maxpeers=3 ${@:2}
