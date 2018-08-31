const tokenAddress = "0x1ccec284be6296be5d1f3307906736bcf141e977";
const crowdsaleAddress = "0x6a8363d90ebe74b1781ac870e410c4c3588678be";
const guessAddress = "0x7c0fcbe42057d42d9cc7a2600b040beda322e122";

const coinbase = "0x43e7d443deee4e8fc6a67ff5e4a1abfde6ecbfd1";

const ether = 10 ** 18;

App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    return App.initWeb3();
  },

  initWeb3: function () {
    // // Is there an injected web3 instance?
    // if (typeof web3 !== 'undefined') {
    //   App.web3Provider = web3.currentProvider;
    // } else {
    //   // If no injected web3 instance is detected, fall back to Ganache
    //   App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    // }
    // web3 = new Web3(App.web3Provider);

    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider);
      App.web3Provider = web3.currentProvider;
      if (web3.currentProvider.isMetaMask === true) {
        console.log('metamask')
        console.log('Default account' + web3.eth.defaultAccount)
        if (typeof web3.eth.defaultAccount === 'undefined') {
          document.body.innerHTML = '<body><h1>Oops! Your browser does not support Ethereum Ðapps.</h1></body>';
        }
        else {
          return App.initContract();
        }
      }
      else {
        alert('No web3? Please use google chrome and metamask plugin to enter this Dapp!', null, null);
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

        return App.initContract();
      }
    }
  },

  initContract: function () {
    $.getJSON('Crowdsale.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var CrowdsaleArtifact = data;
      App.contracts.Crowdsale = TruffleContract(CrowdsaleArtifact);

      // Set the provider for our contract
      App.contracts.Crowdsale.setProvider(App.web3Provider);
      App.contracts.Crowdsale.at(crowdsaleAddress).then((instance) => {
        instance.allEvents().watch((error, result) => {
          console.log("===========Crowdsale==============")
          console.log(result)
          // console.error('Event error: ', error)
          // console.log("=========================")
        })
      })
      $.getJSON('TokenERC223.json', (data) => {
        var TokenArtifact = data;
        App.contracts.Token = TruffleContract(TokenArtifact);
        // App.contracts.Token.address = "0x98d0a307ca9d614b661042b476fcf85e5376f3de"
        App.contracts.Token.setProvider(App.web3Provider);
        App.contracts.Token.at(tokenAddress).then((instance) => {
          instance.allEvents().watch((error, result) => {
            console.log("===========Token==============")
            console.log(result)
            // console.error('Event error: ', error)
            // console.log("=========================")
          })
        })
        $.getJSON('Guess.json', (data) => {
          var GuessArtifact = data;
          App.contracts.Guess = TruffleContract(GuessArtifact);
          // App.contracts.Token.address = "0x98d0a307ca9d614b661042b476fcf85e5376f3de"
          App.contracts.Guess.setProvider(App.web3Provider);
          App.contracts.Guess.at(guessAddress).then((instance) => {
            instance.allEvents().watch((error, result) => {
              console.log("===========Guess==============")
              console.log(result)
              // console.error('Event error: ', error)
              // console.log("=========================")
            })
          })
          // Use our contract to retrieve and mark the adopted pets
          return App.retrieveToken();
        })
      })
    });

    return App.bindEvents();
  },

  retrieveToken: function (adopters, account) {
    /*
     * Replace me...
     */
    // web3.eth.getAccounts(accounts => console.log(accounts[0]))
    var tokenInstance;

    App.contracts.Token.at(tokenAddress).then(function (instance) {
      console.log(instance)
      tokenInstance = instance;

      return tokenInstance.balanceOf.call(web3.eth.defaultAccount, { from: web3.eth.defaultAccount })
      // return tokenInstance.getAdopters.call();
    }).then(function (balance) {
      $('#tokenLeft').text(balance / ether)
      return App.retrieveBettors();
    }).catch(function (err) {
      console.log(err.message);
    });

  },

  retrieveBettors: function () {
    var guessInstance;

    App.contracts.Guess.at(guessAddress).then((instance) => {
      guessInstance = instance;

      console.log(guessInstance)
      // guessInstance.winnersOf(0, { from: web3.eth.defaultAccount })
      //   .then((winners) => console.log('winners of ' + 0 + ' round are ' + winners))
      // guessInstance.winAmountOf(0, { from: web3.eth.defaultAccount })
      //   .then((winAmount) => console.log('winAmount of ' + 0 + ' round are ' + parseInt(winAmount)))
      guessInstance.prizePool({ from: web3.eth.defaultAccount })
        .then(pool => $('#pool').text('Prize pool: ' + parseInt(pool) / ether + ' DMC'))

      guessInstance.lastBetOf(web3.eth.defaultAccount, { from: web3.eth.defaultAccount })
        .then((bet) => {
          if (bet == 0) $('#lastBet').text(`Not betted`)
          else $('#lastBet').text(`Last bet: ${bet}`)
        })

      guessInstance.getRounds({ from: web3.eth.defaultAccount })
        .then((rounds) => {
          console.log('retrieveRounds')
          console.log(parseInt(rounds))

          rounds = parseInt(rounds)
          for (let i = 0; i <= rounds; i++) {
            $("#detailsRow").append("<div id=game" + i + "></div>")
            $("#game" + i).append(`<h3>Round ${i}</h3>`)
            $("#game" + i).append(`<p id=status${i}></p>`)
            $("#game" + i).append(`<p id=bettors${i}></p>`)
            $("#game" + i).append(`<p style="color:green" id=winners${i}></p>`)
            $("#game" + i).append(`<p id=answer${i}></p>`)
            $("#game" + i).append(`<p id=winAmount${i}></p>`)

            guessInstance.statusOf(i, { from: web3.eth.defaultAccount })
              // .then((status) => console.log('status of ' + i + ' round are ' + status))
              .then((status) => $(`#status${i}`).text('Game live: ' + status))
            guessInstance.bettorsOf(i, { from: web3.eth.defaultAccount })
              // .then((bettors) => console.log('bettors of ' + i + ' round are ' + bettors))
              .then((bettors) => $(`#bettors${i}`).text('Bettors: ' + bettors))
            guessInstance.winnersOf(i, { from: web3.eth.defaultAccount })
              // .then((winners) => console.log('winners of ' + i + ' round are ' + winners))
              .then((winners) => $(`#winners${i}`).text('Winners: ' + winners))
            guessInstance.answerOf(i, { from: web3.eth.defaultAccount })
              // .then((answer) => console.log('answer of ' + i + ' round are ' + parseInt(answer)))
              .then((answer) => $(`#answer${i}`).text('Answer: ' + parseInt(answer)))
            guessInstance.winAmountOf(i, { from: web3.eth.defaultAccount })
              // .then((winAmount) => console.log('winAmount of ' + i + ' round are ' + parseInt(winAmount)))
              .then((winAmount) => $(`#winAmount${i}`).text('Win amount: ' + parseInt(winAmount) / ether))

          }
        })
        .catch(err => console.log(err))
    }
    )
  },

  bindEvents: function () {
    $(document).on('click', '#purchase', App.handlePurchase);
    $(document).on('click', '#guess', App.handleGuess);
    if (web3.eth.defaultAccount === coinbase) {
      $(document).on('click', '#settle', App.handleSettle)
    } else {
      $('#settle').hide();
    }
  },


  handlePurchase: function (event) {
    // event.preventDefault();

    // var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
    var amount = $("#tokenNumber").val()
    if (amount <= 0) alert("Negative input received")
    else {
      amount *= ether
      App.contracts.Crowdsale.at(crowdsaleAddress).then((instance) => {
        crowdsaleInstance = instance;
        // crowdsaleInstance.allEvents().watch((error, result) => {
        //   console.log("=========================")
        //   console.log(result)
        //   console.error('Event error: ', error)
        //   console.log("=========================")
        // })

        console.log(crowdsaleInstance)
        return crowdsaleInstance.send(amount)
      }).then((receipt) => {
        console.log(receipt)
      })
    }
  },

  handleGuess: function () {
    // event.preventDefault();

    // var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */

    amount = 100 * ether
    App.contracts.Token.at(tokenAddress).then((instance) => {
      tokenInstance = instance;
      // tokenInstance.allEvents().watch((error, result) => {
      //   console.log("=========================")
      //   console.log(result)
      //   console.error('Event error: ', error)
      //   console.log("=========================")
      // })
      console.log(tokenInstance)
      // return tokenInstance.transfer.sendTransaction(
      //   guessAddress,
      //   amount,
      //   // '0x0',
      //   // { from: web3.eth.defaultAccount }
      // )
      // 0x30783030
      // 0x30783031

      // var vote = $("#voteOptions").val() === 'small' ?
      //   "0x30783030" : "0x30783031"
      var voteSelected = $("#voteOptions").val()
      console.log("voteSelected: ", voteSelected)
      var vote;
      switch (voteSelected) {
        case "1":
          vote = "0x30783031"
          break;
        case "2":
          vote = "0x30783032"
          break;
        case "3":
          vote = "0x30783033"
          break;
        case "4":
          vote = "0x30783034"
          break;
        case "5":
          vote = "0x30783035"
          break;
        case "6":
          vote = "0x30783036"
          break;
      }

      console.log(vote)
      return tokenInstance.transfer223.sendTransaction(
        guessAddress,
        amount,
        vote,
        { from: web3.eth.defaultAccount, gas: 4712388 }
      )
    }).then((receipt) => {
      console.log(receipt)
    }).catch(err => console.log(err))
  },
  handleSettle: function () {
    App.contracts.Guess.at(guessAddress).then((instance) => {
      guessInstance = instance;
      console.log(guessInstance)

      return guessInstance.settle.sendTransaction(
        { from: web3.eth.defaultAccount, gas: 4712388 }
      )
    }).then((receipt) => {
      console.log(receipt)
    }).catch(err => console.log(err))
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
