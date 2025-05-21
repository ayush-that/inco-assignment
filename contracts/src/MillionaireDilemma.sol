pragma solidity ^0.8;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract MillionaireDilemma {
    using e for euint256;
    using e for ebool;
    using e for bytes;

    address public immutable alice;
    address public immutable bob;
    address public immutable eve;

    mapping(address => euint256) public wealth;

    event Richest(address indexed richest);

    constructor(address _alice, address _bob, address _eve) {
        alice = _alice;
        bob = _bob;
        eve = _eve;
    }

    function submitWealth(bytes memory encryptedWealth) external {
        require(
            msg.sender == alice || msg.sender == bob || msg.sender == eve,
            "MillionaireDilemma: unauthorized participant"
        );
        euint256 w = encryptedWealth.newEuint256(msg.sender);
        wealth[msg.sender] = w;
        w.allowThis();
    }

    function compare() external {
        ebool aliceGeBob = wealth[alice].ge(wealth[bob]);
        ebool aliceGeEve = wealth[alice].ge(wealth[eve]);
        ebool bobGeAlice = wealth[bob].ge(wealth[alice]);
        ebool bobGeEve = wealth[bob].ge(wealth[eve]);

        ebool isAlice = aliceGeBob.and(aliceGeEve);
        ebool isBob = bobGeAlice.and(bobGeEve);
        ebool isEve = isAlice.not().and(isBob.not());

        isAlice.requestDecryption(this.handleResult.selector, abi.encodePacked(uint8(0)));
        isBob.requestDecryption(this.handleResult.selector, abi.encodePacked(uint8(1)));
        isEve.requestDecryption(this.handleResult.selector, abi.encodePacked(uint8(2)));
    }

    function handleResult(uint256, bool result, bytes memory data) external returns (bool) {
        if (result) {
            uint8 idx = abi.decode(data, (uint8));
            address richest = idx == 0
                ? alice
                : idx == 1
                    ? bob
                    : eve;
            emit Richest(richest);
        }
        return true;
    }
}
