const contract = require('truffle-contract');
const fs = require('fs');
const Web3 = require('web3');
require('dotenv').config();
// var User = require('./User');
// var Promise = require('promise');

// import * as contract from 'truffle-contract';
// import { default as contract } from 'truffle-contract';
// import { fs } from 'fs';
// import * as Web3 from 'web3';

// let Crowdsale;

const provider = new Web3.providers.HttpProvider(process.env.ETHEREUM_PROVIDER);
const web3 = new Web3(provider);

const contractJson = JSON.parse(fs.readFileSync('build/contracts/Crowdsale.json', 'utf8')).abi;
let Crowdsale = new web3.eth.Contract(contractJson, process.env.ETHEREUM_CROWDSALE_ADDRESS);

const tokenERC20Json = JSON.parse(fs.readFileSync('build/contracts/TokenERC20.json', 'utf8')).abi;
console.log('TokenERC20.json')
// console.log(tokenERC20Json)
const tokenERC20 = new web3.eth.Contract(tokenERC20Json, process.env.ETHEREUM_TOKENERC20_ADDRESS);
// var operations = {
//   createUser: 'create_user',
//   createTransaction: 'create_transaction',
//   transferTransaction: 'transfer_transaction'
// }

// const retryTimes = process.env.RETRY_TIMES


export const listen = () => {
  console.log('---------------------Error Handler----------------')
  if (typeof Crowdsale === 'undefined') {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    Crowdsale = contract(JSON.parse(fs.readFileSync('build/contracts/Crowdsale.json', 'utf8')));

    // Set the provider for our contract
    Crowdsale.setProvider(provider);

    // // Fix compatibale issue due to truffle contract type error
    // if (typeof Crowdsale.currentProvider.sendAsync !== 'function') {
    //   // Crowdsale.currentProvider.sendAsync = () => Crowdsale.currentProvider.send.apply(Crowdsale.currentProvider, arguments);
    //   Crowdsale.currentProvider.sendAsync = () => Crowdsale.currentProvider.send(...arguments);
    // }

    // Fix compatibale issue due to truffle contract type error
    if (typeof Crowdsale.currentProvider.sendAsync !== 'function') {
      Crowdsale.currentProvider.sendAsync = async () => {
        await Crowdsale.currentProvider.send(...arguments);
      }
    }
    // Event handling
    const transactionContranct = Crowdsale.at(process.env.ETHEREUM_CROWDSALE_ADDRESS)
    transactionContranct.allEvents().watch((error, result) => {
      console.log('=========================')
      console.log(result)
      console.error('Event error: ', error)
      console.log('=========================')
    })
    // next()
  }

  // if (typeof okenERC20 === 'undefined') {
  //   // Get the necessary contract artifact file and instantiate it with truffle-contract
  //   tokenERC20 = contract(JSON.parse(fs.readFileSync('build/contracts/tokenERC20.json', 'utf8')));

  //   // Set the provider for our contract
  //   tokenERC20.setProvider(provider);

  //   // // Fix compatibale issue due to truffle contract type error
  //   // if (typeof Crowdsale.currentProvider.sendAsync !== 'function') {
  //   //   // Crowdsale.currentProvider.sendAsync = () => Crowdsale.currentProvider.send.apply(Crowdsale.currentProvider, arguments);
  //   //   Crowdsale.currentProvider.sendAsync = () => Crowdsale.currentProvider.send(...arguments);
  //   // }

  //   // Fix compatibale issue due to truffle contract type error
  //   if (typeof tokenERC20.currentProvider.sendAsync !== 'function') {
  //     tokenERC20.currentProvider.sendAsync = async () => {
  //       await tokenERC20.currentProvider.send(...arguments);
  //     }
  //   }
  //   // Event handling
  //   const tokenContract = tokenERC20.at(process.env.ETHEREUM_TOKENERC20_ADDRESS)
  //   tokenContract.allEvents().watch((error, result) => {
  //     console.log('=========================')
  //     console.log(result)
  //     console.error('Event error: ', error)
  //     console.log('=========================')
  //   })
  //   // next()
  // }
}

export const buy = (req, res) => {
  const ether = 10 ** 18;
  const tx = {
    chainId: process.env.ETHEREUM_CHAINID,
    from: process.env.USER_ADDRESS,
    to: process.env.ETHEREUM_CROWDSALE_ADDRESS,
    value: 5 * ether,
    gas: 2100000,
    gasPrice: 10 ** 9,
  }
  return web3.eth.accounts.signTransaction(tx, process.env.USER_KEY)
    .then(signed => web3.eth.sendSignedTransaction(signed.rawTransaction))
    .then((receipt) => {
      console.log('reciept');
      console.log(receipt);
      return res.status(400).send(receipt)
    })
    .catch(err => console.log(err))
}

export const transfer = (req, res) => {
  const ether = 10 ** 18;
  const tx = {
    chainId: process.env.ETHEREUM_CHAINID,
    from: process.env.ETHEREUM_COINBASE,
    to: process.env.USER_ADDRESS,
    value: 200 * ether,
    gas: 2100000,
    gasPrice: 10 ** 9,
  }
  return web3.eth.accounts.signTransaction(tx, process.env.ETHEREUM_COINBASE_PRIVATE)
    .then(signed => web3.eth.sendSignedTransaction(signed.rawTransaction))
    .then((receipt) => {
      console.log('reciept');
      console.log(receipt);
      return res.status(400).send(receipt)
    })
    .catch(err => console.log(err))
}

export const transferToken = (req, res) => {
  // const ether = 10 ** 18;
  const trans = tokenERC20.methods.transfer(process.env.ETHEREUM_CROWDSALE_ADDRESS, web3.utils.toWei('5000', 'ether'))
  const encodedABI = trans.encodeABI()

  const tx = {
    chainId: process.env.ETHEREUM_CHAINID,
    from: process.env.ETHEREUM_COINBASE,
    to: process.env.ETHEREUM_TOKENERC20_ADDRESS,
    gas: 2100000,
    gasPrice: 10 ** 9,
    data: encodedABI,
  }

  return web3.eth.accounts.signTransaction(tx, process.env.ETHEREUM_COINBASE_PRIVATE)
    .then(signed => web3.eth.sendSignedTransaction(signed.rawTransaction))
    .then((receipt) => {
      console.log('reciept');
      console.log(receipt);
      return res.status(400).send(receipt)
    })
    .catch(err => console.log(err))
}
// buy(5);

export default {
  listen,
  buy,
}
