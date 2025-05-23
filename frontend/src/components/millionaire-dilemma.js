import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  useReadMillionaireDilemmaAlice,
  useReadMillionaireDilemmaBob,
  useReadMillionaireDilemmaEve,
} from "@/generated";
import WealthSubmission from "./wealth-submission";
import WealthComparison from "./wealth-comparison";
import Image from "next/image";

const MillionaireDilemma = () => {
  const [userRole, setUserRole] = useState(null);
  const [gameKey, setGameKey] = useState(0);
  const { address } = useAccount();
  const { data: aliceAddress } = useReadMillionaireDilemmaAlice();
  const { data: bobAddress } = useReadMillionaireDilemmaBob();
  const { data: eveAddress } = useReadMillionaireDilemmaEve();

  useEffect(() => {
    if (aliceAddress && bobAddress && eveAddress) {
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
    setGameKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      <div className="w-full max-w-4xl mb-6 relative">
        <div className="bg-blue-950/70 border-2 border-blue-600/50 rounded-lg p-4 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 bg-shimmer-gradient animate-shimmer"
            style={{ backgroundSize: "200% 100%" }}
          ></div>
          <div className="relative z-10">
            <p className="text-sm text-blue-200 mb-3 font-pixel-secondary">
              Alice, Bob, and Eve want to figure out who's the richest without revealing their wealth to each other.
            </p>
            {userRole && (
              <div className="mt-1 inline-block">
                <span className="bg-blue-900/70 px-6 py-1 rounded-lg text-sm text-accent font-pixel border border-accent/50">
                  YOU ARE: <strong className="text-white">{userRole}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isParticipant ? (
        <div className="grid md:grid-cols-2 place-items-start gap-6 w-full max-w-4xl">
          <div className="w-full h-full">
            <WealthSubmission key={`submission-${gameKey}`} />
          </div>
          <div className="w-full h-full">
            <WealthComparison key={`comparison-${gameKey}`} onPlayAgain={handlePlayAgain} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center w-full max-w-4xl">
          <div className="w-full max-w-lg">
            <WealthComparison key={`comparison-${gameKey}`} onPlayAgain={handlePlayAgain} />
          </div>
        </div>
      )}

      {userRole && (
        <div className="fixed right-10 bottom-5 z-10 flex flex-col items-center">
          <div>
            <Image src="/dialog.png" alt="Dialog" width={300} height={200} priority />
          </div>
          {userRole === "Observer" ? (
            <Image src="/man.png" alt="Observer" width={200} height={300} priority />
          ) : (
            <Image src={`/${userRole.toLowerCase()}.png`} alt={userRole} width={200} height={300} priority />
          )}
        </div>
      )}
    </div>
  );
};

export default MillionaireDilemma;
