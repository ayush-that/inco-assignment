// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract MillionaireDilemma {
    using e for *;

    error UnauthorizedParticipant();
    error ComparisonAlreadyCompleted();
    error SubmissionsIncomplete();
    error AlreadySubmitted();
    error InvalidWealthValue();
    error ComparisonNotAllowed();

    address public immutable alice;
    address public immutable bob;
    address public immutable eve;

    mapping(address => euint256) public wealth;
    mapping(address => bool) public submitted;

    bool private _emitted;
    bool private _locked;

    event WealthSubmitted(address indexed participant);
    event ComparisonStarted();
    event Richest(address indexed richest);

    modifier onlyParticipants() {
        if (msg.sender != alice && msg.sender != bob && msg.sender != eve) {
            revert UnauthorizedParticipant();
        }
        _;
    }

    modifier nonReentrant() {
        if (_locked) revert();
        _locked = true;
        _;
        _locked = false;
    }

    modifier comparisonNotDone() {
        if (_emitted) revert ComparisonAlreadyCompleted();
        _;
    }

    constructor(address _alice, address _bob, address _eve) {
        require(_alice != address(0) && _bob != address(0) && _eve != address(0), "Invalid participant addresses");
        require(_alice != _bob && _alice != _eve && _bob != _eve, "Participants must be unique");
        alice = _alice;
        bob = _bob;
        eve = _eve;
    }

    function submitWealth(bytes memory encryptedWealth) external onlyParticipants comparisonNotDone nonReentrant {
        if (submitted[msg.sender]) revert AlreadySubmitted();
        if (encryptedWealth.length == 0) revert InvalidWealthValue();

        euint256 w = encryptedWealth.newEuint256(msg.sender);
        wealth[msg.sender] = w;
        submitted[msg.sender] = true;

        w.allow(msg.sender);
        w.allowThis();

        emit WealthSubmitted(msg.sender);
    }

    function compare() external comparisonNotDone nonReentrant {
        if (!submitted[alice] || !submitted[bob] || !submitted[eve]) {
            revert SubmissionsIncomplete();
        }

        emit ComparisonStarted();

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

    function handleResult(uint256, uint256 decryptedIdx, bytes memory) external returns (bool success) {
        if (_emitted) return true;
        if (decryptedIdx > 2) return false;

        address richest;
        if (decryptedIdx == 0) {
            richest = alice;
        } else if (decryptedIdx == 1) {
            richest = bob;
        } else {
            richest = eve;
        }

        emit Richest(richest);
        _emitted = true;
        return true;
    }

    function allSubmitted() external view returns (bool) {
        return submitted[alice] && submitted[bob] && submitted[eve];
    }

    function isCompleted() external view returns (bool) {
        return _emitted;
    }

    function getParticipants() external view returns (address _alice, address _bob, address _eve) {
        return (alice, bob, eve);
    }
}
