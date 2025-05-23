#!/bin/bash

docker compose down
docker compose up -d

cd contracts
forge build
forge script script/MillionaireDilemma.s.sol:DeployMillionaireDilemma --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --legacy --gas-price 10000000000

CONTRACT_ADDRESS=$(jq -r '.transactions[0].contractAddress' broadcast/MillionaireDilemma.s.sol/31337/run-latest.json)

cd ../frontend
sed -i '' "s/31337: '0x[a-fA-F0-9]*'/31337: '$CONTRACT_ADDRESS'/" src/generated.ts

rm -rf node_modules .next
bun i
bun dev
