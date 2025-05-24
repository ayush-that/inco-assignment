# 🚤 Yao's Millionaire's Problem (Yacht Edition)
Alice, Bob, and Eve are millionaires who want to figure out who's the richest without revealing their wealth to each other or anyone else.

## 🎯 **Local Setup**




```bash
https://github.com/ayush-that/inco-assignment.git
cd inco-assignment/
```

Make sure you have [Foundry](https://book.getfoundry.sh/getting-started/installation), [Docker](https://docs.docker.com/engine/install/) and [Bun](https://bun.sh/docs/cli/install) installed.

```bash
cd contracts
bun install
forge build # builds the smart contract
forge test # to run tests
```

In `MillionaireDilemma.s.sol`, you have to update `address alice`, `address bob`, `address eve` with their actual addresses before deploying the smart contract.

```
cd ..
cp .env.example .env
```

Set these environment variables
```
DOCKER_IMAGE_TAG=v3-33-gc708d2f
ALICE_PRIV_KEY=
BOB_PRIV_KEY=
EVE_PRIV_KEY=
```

Now make sure Docker is running, we can start the entire app with a single command.

```
sudo chmod +x start.sh
./start.sh
```

