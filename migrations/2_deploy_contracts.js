const Crowdsale = artifacts.require('Crowdsale');
const TokenERC223 = artifacts.require('./ERC223/TokenERC223');
const Guess = artifacts.require('Guess')

module.exports = function (deployer) {
  deployer.deploy(TokenERC223, '10000', 'Demo coin', 'TBSx3')
    //   // Option 2) Console log the address:
    // .then(() => console.log(TokenERC20.address))

    // Option 3) Retrieve the contract instance and get the address from that:
    .then(() => TokenERC223.deployed())
    .then((_instance) => {
      console.log(_instance.address)
      deployer.deploy(Crowdsale, _instance.address, '10', '100', _instance.address)
        // // Option 2) Console log the address:
        // .then(() => console.log(Crowdsale.address))

        // Option 3) Retrieve the contract instance and get the address from that:
        .then(() => Crowdsale.deployed())
        .then(_instance => console.log(_instance.address));
      
      deployer.deploy(Guess, _instance.address)
        //   // Option 2) Console log the address:
        // .then(() => console.log(TokenERC20.address))

        // Option 3) Retrieve the contract instance and get the address from that:
        .then(() => Guess.deployed())
        .then((_instance) => {
          console.log(_instance.address)
        });
    });
  
};
