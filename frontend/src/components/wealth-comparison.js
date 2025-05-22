import React, { useState, useEffect } from "react";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import { Trophy, Crown, Users, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { parseEventLogs } from "viem";

const WealthComparison = ({ onPlayAgain }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [richestAddress, setRichestAddress] = useState(null);
  const [participants, setParticipants] = useState({
    alice: null,
    bob: null,
    eve: null,
  });

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

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

  const ZERO_HANDLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const { data: aliceWealthHandle } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "wealth",
    args: [aliceAddress],
  });
  const { data: bobWealthHandle } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "wealth",
    args: [bobAddress],
  });
  const { data: eveWealthHandle } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "wealth",
    args: [eveAddress],
  });

  useEffect(() => {
    if (!publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: millionaireDilemmaAddress[31337],
      abi: millionaireDilemmaAbi,
      eventName: "Richest",
      onLogs: (logs) => {
        if (logs && logs.length > 0 && logs[0].args) {
          const richest = logs[0].args.richest;
          setRichestAddress(richest);
        }
      },
    });

    return () => {
      if (unwatch) unwatch();
    };
  }, [publicClient]);

  useEffect(() => {
    if (aliceAddress && bobAddress && eveAddress) {
      setParticipants({
        alice: aliceAddress,
        bob: bobAddress,
        eve: eveAddress,
      });
    }
  }, [aliceAddress, bobAddress, eveAddress]);

  const compareWealth = async () => {
    try {
      setIsLoading(true);
      setError("");

      const txHash = await writeContractAsync({
        address: millionaireDilemmaAddress[31337],
        abi: millionaireDilemmaAbi,
        functionName: "compare",
      });

      const tx = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (tx.status !== "success") {
        throw new Error("Transaction failed");
      }

      const logs = tx.logs;
      if (logs && logs.length > 0) {
        try {
          const parsedLogs = parseEventLogs({
            abi: millionaireDilemmaAbi,
            logs: logs,
          });

          const richestEvent = parsedLogs.find((log) => log.eventName === "Richest");
          if (richestEvent && richestEvent.args) {
            setRichestAddress(richestEvent.args.richest);
          }
        } catch (err) {
          console.error("Error parsing logs:", err);
        }
      }
    } catch (err) {
      console.error("Error comparing wealth:", err);
      setError("Failed to compare wealth: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getParticipantName = (addr) => {
    if (!addr) return "";
    if (addr === participants.alice) return "Alice";
    if (addr === participants.bob) return "Bob";
    if (addr === participants.eve) return "Eve";
    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        <div className="w-full bg-gray-700/40 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center">
                <Trophy className="mr-3 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Wealth Comparison</h2>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Users className="mr-2 text-blue-400" />
                <span className="text-gray-300">Participants</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { name: "Alice", addr: participants.alice, handle: aliceWealthHandle },
                  { name: "Bob", addr: participants.bob, handle: bobWealthHandle },
                  { name: "Eve", addr: participants.eve, handle: eveWealthHandle },
                ].map((p) => {
                  const submitted = p.handle && p.handle !== ZERO_HANDLE;
                  return (
                    <div key={p.name} className="bg-gray-800 p-2 rounded flex flex-col items-center">
                      <div className="flex items-center">
                        <div className="font-semibold text-white mr-1">{p.name}</div>
                        {submitted ? (
                          <CheckCircle className="text-green-400 w-4 h-4" />
                        ) : (
                          <AlertCircle className="text-red-400 w-4 h-4" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {p.addr ? `${p.addr.substring(0, 6)}...${p.addr.substring(p.addr.length - 4)}` : "Loading..."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {richestAddress && (
              <div className="bg-gradient-to-r from-amber-700/30 to-yellow-600/30 border border-yellow-600/50 rounded-lg p-4 mb-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <Crown className="text-yellow-400 w-8 h-8 mb-2" />
                  <div className="text-yellow-400 font-bold text-lg">
                    {getParticipantName(richestAddress)} is the richest!
                  </div>
                  <div className="text-xs text-yellow-300/70 truncate mt-1">Address: {richestAddress}</div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg text-center flex items-center justify-center">
                <AlertCircle className="mr-2 w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={compareWealth}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isLoading ||
                  !aliceWealthHandle ||
                  aliceWealthHandle === ZERO_HANDLE ||
                  !bobWealthHandle ||
                  bobWealthHandle === ZERO_HANDLE ||
                  !eveWealthHandle ||
                  eveWealthHandle === ZERO_HANDLE
                }
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Compare Wealth"
                )}
              </button>

              {richestAddress && (
                <button
                  onClick={onPlayAgain}
                  className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  Play Again
                </button>
              )}

              {!isLoading &&
                (!aliceWealthHandle ||
                  aliceWealthHandle === ZERO_HANDLE ||
                  !bobWealthHandle ||
                  bobWealthHandle === ZERO_HANDLE ||
                  !eveWealthHandle ||
                  eveWealthHandle === ZERO_HANDLE) && (
                  <div className="text-center text-sm text-gray-400 mt-2">
                    Waiting for all participants to submit their wealth...
                  </div>
                )}
            </div>
          </div>
        </div>
        <p className="font-mono text-center text-xs text-gray-400 mt-2">
          Compares wealth without revealing actual amounts
        </p>
      </div>
    </div>
  );
};

export default WealthComparison;
