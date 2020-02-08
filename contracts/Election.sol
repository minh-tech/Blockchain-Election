pragma solidity >=0.5.16;

contract Election {
  // Model candidate
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }
  // Store voters
  mapping(address => bool) public voters;

  // Store candidates
  mapping(uint => Candidate) public candidates;

  // Store candidates count
  uint public candidatesCount;

  // Constructor
  constructor() public {
    addCandidate("Candidate 1");
    addCandidate("Candidate 2");
  }

  function addCandidate(string memory _name) private {
    candidatesCount++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }

  function vote(uint _candidateId) public {
    // require that they haven't voted before
    require(!voters[msg.sender]);

    // require a valid candidate
    require(_candidateId > 0 && _candidateId <= candidatesCount);

    // record the voter has voted
    voters[msg.sender] = true;

    // Update candidate vote voteCount
    candidates[_candidateId].voteCount++;
  }

}
