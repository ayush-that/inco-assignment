import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import WealthSubmission from "./wealth-submission";
import WealthComparison from "./wealth-comparison";
import { Ship, AlertCircle, Info } from "lucide-react";

const MillionaireDilemma = () => {
  const [userRole, setUserRole] = useState(null);
  const [participants, setParticipants] = useState({
    alice: null,
    bob: null,
    eve: null,
  });
  const [wealthSubmitted, setWealthSubmitted] = useState(false);

  const { address } = useAccount();

  const { data: aliceAddress } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "alice",
  });

  const { data: bobAddress } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "bob",
  });

  const { data: eveAddress } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "eve",
  });

  const { data: userWealth } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "wealth",
    args: [address],
  });

  useEffect(() => {
    if (aliceAddress && bobAddress && eveAddress) {
      setParticipants({
        alice: aliceAddress,
        bob: bobAddress,
        eve: eveAddress,
      });

      // Determine the user's role
      if (address === aliceAddress) {
        setUserRole("Alice");
      } else if (address === bobAddress) {
        setUserRole("Bob");
      } else if (address === eveAddress) {
        setUserRole("Eve");
      } else {
        setUserRole("Observer");
      }
    }
  }, [address, aliceAddress, bobAddress, eveAddress]);

  useEffect(() => {
    // Check if user has submitted wealth (if userWealth exists)
    if (userWealth) {
      setWealthSubmitted(true);
    }
  }, [userWealth]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full max-w-4xl mb-8">
        <div className="bg-blue-900/20 border border-blue-500 text-blue-400 p-4 rounded-lg text-center flex flex-col items-center justify-center">
          <div className="flex items-center mb-2">
            <Ship className="mr-2 w-6 h-6" />
            <h1 className="text-2xl font-bold">Millionaire's Dilemma: Yacht Edition</h1>
          </div>
          <p className="text-sm">
            Alice, Bob, and Eve want to figure out who's the richest without revealing their wealth to each other.
          </p>
          {userRole && (
            <div className="mt-3 bg-blue-800/30 px-4 py-2 rounded-full text-sm">
              <span>
                You are playing as: <strong>{userRole}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {userRole === "Observer" && (
        <div className="w-full max-w-4xl mb-8">
          <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-400 p-4 rounded-lg text-center flex items-center justify-center">
            <Info className="mr-2 w-5 h-5" />
            <p>You're observing the game. Only Alice, Bob, and Eve can participate.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 place-items-start gap-6 w-full max-w-4xl">
        {(userRole === "Alice" || userRole === "Bob" || userRole === "Eve") && <WealthSubmission />}
        <WealthComparison />
      </div>

      <div className="w-full max-w-4xl mt-8">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">How it works:</h3>
          <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside pl-2">
            <li>Each millionaire privately submits their wealth (encrypted).</li>
            <li>The smart contract privately compares all three values.</li>
            <li>Only the identity of the richest millionaire is revealed.</li>
            <li>The actual wealth amounts remain private and are never disclosed.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MillionaireDilemma;
