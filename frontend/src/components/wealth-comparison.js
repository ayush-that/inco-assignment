import React, { useState, useEffect } from "react";
import { usePublicClient, useReadContract, useWriteContract, useAccount } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import { Crown, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { parseEventLogs } from "viem";
import Image from "next/image";

const WealthComparison = ({ onPlayAgain }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [richestAddress, setRichestAddress] = useState(null);
  const [participants, setParticipants] = useState({
    alice: null,
    bob: null,
    eve: null,
  });
  const [comparisonStatus, setComparisonStatus] = useState("idle");
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

  const { data: isCompleted } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "isCompleted",
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
        console.log("Richest event received:", logs);
        if (logs && logs.length > 0 && logs[0].args) {
          const richest = logs[0].args.richest;
          setRichestAddress(richest);
          setComparisonStatus("completed");
          setIsLoading(false);
        }
      },
      onError: (error) => {
        console.error("Event listening error:", error);
        setError("Failed to listen for comparison results");
        setIsLoading(false);
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

  useEffect(() => {
    if (isCompleted !== undefined) {
      if (isCompleted) {
        setComparisonStatus("completed");
      }
    }
  }, [isCompleted]);

  const compareWealth = async () => {
    try {
      setIsLoading(true);
      setError("");
      setComparisonStatus("comparing");

      if (!allSubmitted) {
        setError("All participants must submit their wealth before comparison");
        return;
      }

      if (isCompleted) {
        setError("Comparison has already been completed");
        return;
      }

      console.log("Starting wealth comparison...");

      let txHash;
      try {
        txHash = await writeContractAsync({
          address: millionaireDilemmaAddress[31337],
          abi: millionaireDilemmaAbi,
          functionName: "compare",
        });
        console.log("Comparison transaction submitted:", txHash);
      } catch (contractError) {
        console.error("Contract call failed:", contractError);
        if (contractError.message.includes("ComparisonAlreadyCompleted")) {
          setError("Comparison has already been completed");
        } else if (contractError.message.includes("SubmissionsIncomplete")) {
          setError("All participants must submit their wealth first");
        } else if (contractError.message.includes("rejected")) {
          setError("Transaction was rejected by user");
        } else {
          setError("Failed to start comparison: " + contractError.message);
        }
        return;
      }

      let tx;
      try {
        tx = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: 120000,
        });
      } catch (receiptError) {
        console.error("Transaction receipt error:", receiptError);
        setError("Comparison transaction failed or timed out. Please check the transaction status.");
        return;
      }

      if (tx.status !== "success") {
        setError("Comparison transaction failed. Please try again.");
        return;
      }

      console.log("Comparison transaction confirmed. Waiting for decryption...");

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
            setComparisonStatus("completed");
          }
        } catch (parseError) {
          console.warn("Error parsing logs:", parseError);
        }
      }

      if (!richestAddress && comparisonStatus !== "completed") {
        console.log("Waiting for decryption callback...");
      }
    } catch (err) {
      console.error("Unexpected error comparing wealth:", err);
      setError("An unexpected error occurred: " + (err.message || "Please try again"));
    } finally {
      if (comparisonStatus === "completed" || error) {
        setIsLoading(false);
      }
    }
  };

  const getParticipantName = (addr) => {
    if (!addr) return "";
    if (addr === participants.alice) return "Alice";
    if (addr === participants.bob) return "Bob";
    if (addr === participants.eve) return "Eve";
    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
  };

  const allSubmitted =
    aliceWealthHandle &&
    aliceWealthHandle !== ZERO_HANDLE &&
    bobWealthHandle &&
    bobWealthHandle !== ZERO_HANDLE &&
    eveWealthHandle &&
    eveWealthHandle !== ZERO_HANDLE;

  const handlePlayAgain = () => {
    setRichestAddress(null);
    setError("");
    setComparisonStatus("idle");
    setIsLoading(false);
    onPlayAgain();
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full">
        <div className="w-full h-full bg-blue-950/70 rounded-lg border-2 border-blue-800 shadow-lg overflow-hidden">
          <div className="p-5 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-start mb-4 bg-blue-900/50 p-2 rounded-lg">
              <Image src="/money.png" alt="Money" width={24} height={24} className="mr-2 pixel-button" />
              <h2 className="text-xl font-bold text-white font-pixel">WEALTH COMPARISON</h2>
              {comparisonStatus === "comparing" && <Clock className="ml-auto text-yellow-400 w-5 h-5 animate-pulse" />}
            </div>

            <div className="bg-blue-900/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Image src="/man.png" alt="Contestants" width={20} height={20} className="mr-2 pixel-button" />
                <span className="text-white font-pixel">CONTESTANTS</span>
                {comparisonStatus === "comparing" && (
                  <span className="ml-2 text-yellow-300 text-xs font-pixel animate-pulse">COMPARING...</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { name: "Alice", addr: participants.alice, handle: aliceWealthHandle },
                  { name: "Bob", addr: participants.bob, handle: bobWealthHandle },
                  { name: "Eve", addr: participants.eve, handle: eveWealthHandle },
                ].map((p) => {
                  const submitted = p.handle && p.handle !== ZERO_HANDLE;
                  const isWinner = richestAddress && p.addr === richestAddress;
                  return (
                    <div
                      key={p.name}
                      className={`p-2 rounded-lg flex flex-col items-center transition-all ${
                        isWinner
                          ? "bg-yellow-900/50 border border-yellow-600 ring-2 ring-yellow-400/50"
                          : submitted
                            ? "bg-blue-800/70 border border-blue-600"
                            : "bg-blue-900/70 border border-blue-800"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`font-semibold mr-1 font-pixel ${
                            isWinner ? "text-yellow-300" : submitted ? "text-blue-300" : "text-blue-500"
                          }`}
                        >
                          {p.name}
                        </div>
                        {isWinner ? (
                          <Crown className="text-yellow-400 w-4 h-4" />
                        ) : submitted ? (
                          <Image src="/check.png" alt="Submitted" width={18} height={18} className="pixel-button" />
                        ) : (
                          <AlertCircle className="text-red-400 w-4 h-4" />
                        )}
                      </div>
                      <div className="text-xs text-blue-400 truncate mt-1 font-mono">
                        {p.addr ? `${p.addr.substring(0, 6)}...${p.addr.substring(p.addr.length - 4)}` : "Loading..."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {richestAddress && comparisonStatus === "completed" && (
              <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 border border-yellow-600 rounded-lg p-4 mb-4 animate-pulse-slow">
                <div className="flex flex-col items-center justify-center text-center">
                  <Crown className="text-yellow-400 w-8 h-8 mb-2" />
                  <div className="text-yellow-300 font-pixel text-md mb-1">🎉 THE WEALTHIEST IS 🎉</div>
                  <div className="text-yellow-300 font-bold text-xl font-pixel">
                    {getParticipantName(richestAddress)}
                  </div>
                  <div className="text-xs text-yellow-300/70 truncate mt-1">{`${richestAddress.substring(0, 6)}...${richestAddress.substring(richestAddress.length - 4)}`}</div>
                </div>
              </div>
            )}

            {comparisonStatus === "comparing" && !richestAddress && (
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mb-2"></div>
                  <div className="text-blue-300 font-pixel text-sm">Comparing encrypted wealth values...</div>
                  <div className="text-blue-400 font-pixel text-xs mt-1">This may take a moment</div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded-lg text-center flex items-center justify-center">
                <AlertCircle className="mr-2 w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="mt-auto">
              <button
                onClick={compareWealth}
                disabled={isLoading || !allSubmitted || comparisonStatus === "completed"}
                className={`w-full p-3 text-white rounded-lg font-pixel mb-2 transition-all
                  ${
                    !allSubmitted || comparisonStatus === "completed"
                      ? "bg-blue-800/50 opacity-50 cursor-not-allowed"
                      : isLoading
                        ? "bg-blue-700 opacity-75 cursor-wait"
                        : "btn-comparison hover:bg-blue-500"
                  }
                `}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {comparisonStatus === "comparing" ? "PROCESSING..." : "STARTING..."}
                  </div>
                ) : !allSubmitted ? (
                  <span className="flex items-center justify-center">
                    <Clock className="mr-2 w-4 h-4" />
                    WAITING FOR ALL PARTICIPANTS
                  </span>
                ) : comparisonStatus === "completed" ? (
                  <span className="flex items-center justify-center">
                    <Crown className="mr-2 w-4 h-4" />
                    COMPARISON COMPLETED
                  </span>
                ) : (
                  <span className="flex items-center justify-center">COMPARE WEALTH PRIVATELY</span>
                )}
              </button>

              {(richestAddress || comparisonStatus === "completed") && (
                <button
                  onClick={handlePlayAgain}
                  className="w-full p-3 text-white rounded-lg flex items-center justify-center font-pixel btn-gradient hover:bg-blue-500 transition-all"
                >
                  <RefreshCw className="mr-2 w-4 h-4" />
                  START NEW COMPARISON
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WealthComparison;
