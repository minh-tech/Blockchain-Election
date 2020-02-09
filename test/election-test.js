var Election = artifacts.require("./Election.sol");

contract("Election", (accounts) => {
  let election;

  before(async () => {
    election = await Election.deployed();
    candidatesCount = await election.candidatesCount();
  });

  describe('Initiation', async () => {

    it("initializes with two candidates", async () => {
      assert.equal(candidatesCount, 2);
    });

    it("initializes the candidates with the correct values", async () => {
      // Get candidates data from contract
      candidatesArray = Array();
      for(let i=1; i <= candidatesCount; i++) {
        candidatesArray.push(await election.candidates(i));
      }
      assert.equal(candidatesArray[0].id, 1, "contains the correct id");
      assert.equal(candidatesArray[0].name, "Candidate 1", "contains the correct name");
      assert.equal(candidatesArray[0].voteCount, 0, "contains the correct vote count");
      assert.equal(candidatesArray[1].id, 2, "contains the correct id");
      assert.equal(candidatesArray[1].name, "Candidate 2", "contains the correct name");
      assert.equal(candidatesArray[1].voteCount, 0, "contains the correct vote count");
    })
  })

  describe('Voting', async () => {
    it("allows a voter to cast a vote", async () => {
      let candidateId = 1;
      let result = await election.vote(candidateId, { from: accounts[0]});

      const event = result.logs
      assert.equal(event.length, 1, 'an event was triggered');
      assert.equal(event[0].event, 'votedEvent', 'the event type is correct');
      assert.equal(event[0].args._candidateId.toNumber(), candidateId, 'the candidate id is correct');

      let voted = await election.voters(accounts[0]);
      assert(voted, "the voter was marked as voted");
      candidate = await election.candidates(candidateId);
      let voteCount = candidate.voteCount;
      assert.equal(voteCount, 1, "increments the candidate's vote count");
    })

    it("throws an exception for invalid candidates", async () => {
      try {
        await election.vote(99, { from: accounts[1] });
      } catch(error) {
          assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      }

      // Check candidate 1 did not receive any more votes
      let candidate = await election.candidates(1);
      assert.equal(candidate.voteCount, 1, "candidate 1 did not receive any more votes");

      // Check candidate 2 did not receive any more votes
      candidate = await election.candidates(2);
      assert.equal(candidate.voteCount, 0, "candidate 2 did not receive any more votes");

    })

    it("throws an exception for double voting", async () => {
      let candidateId = 2;
      await election.vote(candidateId, { from: accounts[1] });
      let candidate = await election.candidates(candidateId);
      assert.equal(candidate.voteCount, 1, "accepts first vote");

      // Try to vote again
      try {
        await election.vote(candidateId, { from: accounts[1] });
      } catch(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      }

      // Check candidate 1 did not receive any more votes
      candidate = await election.candidates(1);
      assert.equal(candidate.voteCount, 1, "candidate 1 did not receive any more votes");

      // Check candidate 2 did not receive any more votes
      candidate = await election.candidates(2);
      assert.equal(candidate.voteCount, 1, "candidate 2 did not receive any more votes");
    })
  })
})
