pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/MillionaireDilemma.sol";

contract DeployMillionaireDilemma is Script {
    function run() external returns (MillionaireDilemma) {
        vm.startBroadcast();
        address alice = 0x1111111111111111111111111111111111111111;
        address bob = 0x2222222222222222222222222222222222222222;
        address eve = 0x3333333333333333333333333333333333333333;
        MillionaireDilemma millionaireDilemma = new MillionaireDilemma(alice, bob, eve);
        vm.stopBroadcast();
        return millionaireDilemma;
    }
}
