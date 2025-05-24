// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract MillionaireDilemma {
    using e for *;

    // immutable addresses
    address public immutable alice;
    address public immutable bob;
    address public immutable eve;

    mapping(address => euint256) public wealth; // storing wealth values
    mapping(address => bool) public submitted; // tracking submissions
    bool private _emitted; // prevent multiple emissions

    // event emitted when the richest participant is determined
    event Richest(address indexed richest);

    // constructor sets the three participant addresses
    constructor(address _alice, address _bob, address _eve) {
        alice = _alice;
        bob = _bob;
        eve = _eve;
    }

    // submit wealth function
    function submitWealth(bytes memory encryptedWealth) external {
        require(
            msg.sender == alice || msg.sender == bob || msg.sender == eve,
            "MillionaireDilemma: unauthorized participant" // unauthorized participant
        );

        euint256 w = encryptedWealth.newEuint256(msg.sender);
        wealth[msg.sender] = w; // store the encrypted wealth value
        submitted[msg.sender] = true; // mark as submitted

        // grant access permissions for the encrypted value
        w.allow(msg.sender);
        w.allowThis();
    }

    // function to compare all submitted wealth values and find the richest
    function compare() external {
        // prevent multiple comparisons
        require(!_emitted, "MillionaireDilemma: comparison already done");

        // ensure all three participants have submitted their wealth
        require(submitted[alice] && submitted[bob] && submitted[eve], "MillionaireDilemma: submissions missing");

        // create encrypted indices for each participant
        euint256 idxAlice = e.asEuint256(0);
        euint256 idxBob = e.asEuint256(1);
        euint256 idxEve = e.asEuint256(2);

        // initialize with eve's wealth as the starting point
        euint256 bestWealth = wealth[eve];
        euint256 bestIdx = idxEve;

        // compare bob's wealth with current best
        ebool bobGeBest = wealth[bob].ge(bestWealth);
        // update best wealth and index if bob has more
        bestWealth = bobGeBest.select(wealth[bob], bestWealth);
        bestIdx = bobGeBest.select(idxBob, bestIdx);

        // compare alice's wealth with current best
        ebool aliceGeBest = wealth[alice].ge(bestWealth);
        // update best wealth and index if alice has more
        bestWealth = aliceGeBest.select(wealth[alice], bestWealth);
        bestIdx = aliceGeBest.select(idxAlice, bestIdx);

        bestIdx.allowThis(); // grant permission to use the result
        bestIdx.requestDecryption(this.handleResult.selector, ""); // request decryption
    }

    // callback function
    function handleResult(uint256, uint256 decryptedIdx, bytes memory) external returns (bool) {
        if (_emitted) return true; // prevent duplicate emissions

        address richest = decryptedIdx == 0
            ? alice
            : decryptedIdx == 1
                ? bob
                : eve;

        emit Richest(richest); // show result
        _emitted = true; // prevent future emissions
        return true;
    }
}
