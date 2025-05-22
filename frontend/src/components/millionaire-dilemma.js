import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import WealthSubmission from "./wealth-submission";
import WealthComparison from "./wealth-comparison";
import { Ship, AlertCircle, Info, RefreshCw } from "lucide-react";

const MillionaireDilemma = () => {
  const [userRole, setUserRole] = useState(null);
  const [participants, setParticipants] = useState({
    alice: null,
    bob: null,
    eve: null,
  });
  const [gameKey, setGameKey] = useState(0);

  const { address } = useAccount();

  // Read Alice, Bob, and Eve addresses from the contract
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

  const isParticipant = userRole === "Alice" || userRole === "Bob" || userRole === "Eve";

  const handlePlayAgain = () => {
    setGameKey(prev => prev + 1);
  };

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

      {isParticipant ? (
        <div className="grid md:grid-cols-2 place-items-start gap-6 w-full max-w-4xl">
          <WealthSubmission key={`submission-${gameKey}`} />
          <WealthComparison key={`comparison-${gameKey}`} onPlayAgain={handlePlayAgain} />
        </div>
      ) : (
        <div className="flex justify-center w-full max-w-4xl">
          <div className="w-full max-w-lg">
            <WealthComparison key={`comparison-${gameKey}`} onPlayAgain={handlePlayAgain} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MillionaireDilemma;
