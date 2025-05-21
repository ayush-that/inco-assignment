// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {IncoTest} from "@inco/lightning/src/test/IncoTest.sol";
import {MillionaireDilemma} from "../MillionaireDilemma.sol";

contract TestMillionaireDilemma is IncoTest {
    event Richest(address indexed richest);
    MillionaireDilemma private dilemma;

    function setUp() public override {
        super.setUp();
        dilemma = new MillionaireDilemma(alice, bob, eve);
    }

    function testSubmitWealthUnauthorized() public {
        vm.prank(dave);
        bytes memory ciphertext = fakePrepareEuint256Ciphertext(100);
        vm.expectRevert("MillionaireDilemma: unauthorized participant");
        dilemma.submitWealth(ciphertext);
    }

    function testAliceIsRichest() public {
        vm.prank(alice);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(100));
        vm.prank(bob);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(50));
        vm.prank(eve);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(10));

        dilemma.compare();
        vm.expectEmit(true, false, false, true, address(dilemma));
        emit Richest(alice);
        processAllOperations();
    }

    function testBobIsRichest() public {
        vm.prank(alice);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(50));
        vm.prank(bob);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(100));
        vm.prank(eve);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(10));

        dilemma.compare();
        vm.expectEmit(true, false, false, true, address(dilemma));
        emit Richest(bob);
        processAllOperations();
    }

    function testEveIsRichest() public {
        vm.prank(alice);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(50));
        vm.prank(bob);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(10));
        vm.prank(eve);
        dilemma.submitWealth(fakePrepareEuint256Ciphertext(100));

        dilemma.compare();
        vm.expectEmit(true, false, false, true, address(dilemma));
        emit Richest(eve);
        processAllOperations();
    }
}
