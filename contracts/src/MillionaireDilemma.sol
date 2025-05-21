// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract MillionaireDilemma {
    using e for *;

    address public immutable alice;
    address public immutable bob;
    address public immutable eve;

    mapping(address => euint256) public wealth;

    bool private _emitted;

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
        _emitted = false;

        euint256 idxAlice = e.asEuint256(0);
        euint256 idxBob = e.asEuint256(1);
        euint256 idxEve = e.asEuint256(2);

        euint256 bestWealth = wealth[eve];
        euint256 bestIdx = idxEve;

        ebool bobGeBest = wealth[bob].ge(bestWealth);
        bestWealth = bobGeBest.select(wealth[bob], bestWealth);
        bestIdx = bobGeBest.select(idxBob, bestIdx);

        ebool aliceGeBest = wealth[alice].ge(bestWealth);
        bestWealth = aliceGeBest.select(wealth[alice], bestWealth);
        bestIdx = aliceGeBest.select(idxAlice, bestIdx);

        bestIdx.allowThis();
        bestIdx.requestDecryption(this.handleResult.selector, "");
    }

    function handleResult(uint256, uint256 decryptedIdx, bytes memory) external returns (bool) {
        if (_emitted) return true;

        address richest = decryptedIdx == 0
            ? alice
            : decryptedIdx == 1
                ? bob
                : eve;

        emit Richest(richest);
        _emitted = true;
        return true;
    }
}
