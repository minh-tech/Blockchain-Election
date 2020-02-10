Deploy Decentralized Website by IPFS

- Install IPFS at https://docs.ipfs.io/guides/guides/install/
- Copy all files in build/contracts/ folder and src/ folder into dist/ folder
- Run these commands:
  $ ipfs init
  $ ipfs daemon

- Open another terminal
  $ ipfs swarm peers
  $ ipfs add -r dist/
  $ ipfs name publish <dist/ hash>

- Go to https://gateway.ipfs.io/ipfs/<dist/ hash>/ to check result.
