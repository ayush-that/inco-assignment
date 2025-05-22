pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/MillionaireDilemma.sol";

contract DeployMillionaireDilemma is Script {
    function run() external returns (MillionaireDilemma) {
        vm.startBroadcast();
        address alice = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;
        address bob = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f;
        address eve = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
        MillionaireDilemma millionaireDilemma = new MillionaireDilemma(alice, bob, eve);
        vm.stopBroadcast();
        return millionaireDilemma;
    }
}
