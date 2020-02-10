App = {
  contracts: {},
  account: '0x0',

  init: async () => {
    return App.initWeb3();
  },

  initWeb3: async () => {

    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      // Request account access if needed
      await window.ethereum.enable();
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    return App.initContract();
  },

  initContract: async () => {

    // const web3 = window.web3;
    const jsonElection = await $.getJSON("Election.json");
    const networkId = await web3.eth.net.getId();
    const networkData = jsonElection.networks[networkId];

    var election = new web3.eth.Contract(jsonElection.abi, networkData.address);
    App.contracts.Election = election;

    // Listen for events emitted from the contract
    election.events.votedEvent((error, event) => {
      App.render();
    });

    return App.render();
  },

  render: async() => {

    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Get and show the account
    const account = (await web3.eth.getAccounts())[0];
    App.account = account;
    $("#accountAddress").html("Your Account: " + account);

    var electionInstance = App.contracts.Election;
    var candidatesCount = await electionInstance.methods.candidatesCount().call();

    var candidatesResults = $("#candidatesResults");
    candidatesResults.empty();

    var candidatesSelect = $("#candidatesSelect");
    candidatesSelect.empty();

    for (let i=1; i<=candidatesCount; i++) {
      let candidate = await electionInstance.methods.candidates(i).call();

      let id = candidate.id;
      let name = candidate.name;
      let voteCount = candidate.voteCount;

      // Render candidate result
      let candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>";
      candidatesResults.append(candidateTemplate);

      // Render candidate ballot options
      let candidateOption = "<option value='" + id + "' >" + name + "</ option>";
      candidatesSelect.append(candidateOption);

    }

    var hasVoted = await electionInstance.methods.voters(App.account).call();
    if (hasVoted) {
      $('form').hide();
    }
    loader.hide();
    content.show();
  },

  castVote: async() => {
    var candidateId = $('#candidatesSelect').val();

    App.contracts.Election.methods.vote(candidateId).send({ from: App.account}, (error, transactionHash) => {
      if (error) {
        console.error(error);
      } else {
        console.info(transactionHash);
      }
      $('#content').hide();
      $('#loader').show();
    });
  }
};

$(() => {
  $(window).load(() => {
    App.init();
  });
});
