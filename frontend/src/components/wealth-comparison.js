import React, { useState, useEffect } from "react";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import { parseEventLogs } from "viem";
import Image from "next/image";
import { RefreshCw } from "lucide-react";

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
    query: {
      refetchInterval: 2000,
      enabled: !!aliceAddress,
    },
  });
  const { data: bobWealthHandle } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "wealth",
    args: [bobAddress],
    query: {
      refetchInterval: 2000,
      enabled: !!bobAddress,
    },
  });
  const { data: eveWealthHandle } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "wealth",
    args: [eveAddress],
    query: {
      refetchInterval: 2000,
      enabled: !!eveAddress,
    },
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

  const allSubmitted =
    aliceAddress &&
    bobAddress &&
    eveAddress &&
    aliceWealthHandle &&
    aliceWealthHandle !== ZERO_HANDLE &&
    bobWealthHandle &&
    bobWealthHandle !== ZERO_HANDLE &&
    eveWealthHandle &&
    eveWealthHandle !== ZERO_HANDLE;

  // Debug logging to help understand button state
  useEffect(() => {
    console.log("Button state debug:", {
      aliceAddress: !!aliceAddress,
      bobAddress: !!bobAddress,
      eveAddress: !!eveAddress,
      aliceWealthHandle,
      bobWealthHandle,
      eveWealthHandle,
      allSubmitted,
    });
  }, [aliceAddress, bobAddress, eveAddress, aliceWealthHandle, bobWealthHandle, eveWealthHandle, allSubmitted]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full">
        <div className="w-full h-full bg-blue-950/70 rounded-lg border-2 border-blue-800 shadow-lg overflow-hidden">
          <div className="p-5 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-start mb-4 bg-blue-900/50 p-2 rounded-lg">
              <Image src="/money.png" alt="Money" width={24} height={24} className="mr-2 pixel-button" />
              <h2 className="text-xl font-bold text-white font-pixel">WEALTH COMPARISON</h2>
            </div>

            <div className="bg-blue-900/50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Image src="/man.png" alt="Contestants" width={20} height={20} className="mr-2 pixel-button" />
                <span className="text-white font-pixel">CONTESTANTS </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { name: "Alice", addr: participants.alice, handle: aliceWealthHandle },
                  { name: "Bob", addr: participants.bob, handle: bobWealthHandle },
                  { name: "Eve", addr: participants.eve, handle: eveWealthHandle },
                ].map((p) => {
                  const submitted = p.handle && p.handle !== ZERO_HANDLE;
                  return (
                    <div
                      key={p.name}
                      className={`p-2 rounded-lg flex flex-col items-center ${
                        submitted ? "bg-blue-800/70 border border-blue-600" : "bg-blue-900/70 border border-blue-800"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`font-semibold mr-1 font-pixel ${submitted ? "text-blue-300" : "text-blue-500"}`}
                        >
                          {p.name}
                        </div>
                        {submitted ? (
                          <Image src="/check.png" alt="Submitted" width={18} height={18} className="pixel-button" />
                        ) : null}
                      </div>
                      <div className="text-xs text-blue-400 truncate mt-1 font-mono">
                        {p.addr ? `${p.addr.substring(0, 6)}...${p.addr.substring(p.addr.length - 4)}` : "Loading..."}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {richestAddress && (
              <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 border border-yellow-600 rounded-lg p-4 mb-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="text-yellow-300 font-pixel text-md mb-1">THE WEALTHIEST IS</div>
                  <div className="text-yellow-300 font-bold text-xl font-pixel">
                    {getParticipantName(richestAddress)}
                  </div>
                  <div className="text-xs text-yellow-300/70 truncate mt-1">{`${richestAddress.substring(0, 6)}...${richestAddress.substring(richestAddress.length - 4)}`}</div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded-lg text-center flex items-center justify-center">
                {error}
              </div>
            )}

            <div className="mt-auto">
              <button
                onClick={compareWealth}
                disabled={isLoading || !allSubmitted}
                className={`w-full p-3 text-white rounded-lg font-pixel mb-2
                  ${!allSubmitted ? "bg-blue-800/50 opacity-50 cursor-not-allowed" : "btn-comparison"}
                `}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  <span className="flex items-center justify-center">
                    {!allSubmitted ? <>WAITING FOR ALL PARTICIPANTS</> : <>COMPARE WEALTH PRIVATELY</>}
                  </span>
                )}
              </button>

              {richestAddress && (
                <button
                  onClick={onPlayAgain}
                  className="w-full p-3 text-white rounded-lg flex items-center justify-center font-pixel btn-gradient"
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
