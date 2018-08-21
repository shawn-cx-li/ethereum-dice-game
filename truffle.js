module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      chainId: '1',
      network_id: '1', // Match any network id
      from: '0x43e7d443deee4e8fc6a67ff5e4a1abfde6ecbfd1',
      gas: 4712388,
    }
  }
};
