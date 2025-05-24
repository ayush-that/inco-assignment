import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract, useChainId } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import { encryptValue } from "@/utils/inco";

const WealthSubmission = () => {
  const [wealth, setWealth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const chainId = useChainId();

  // submit wealth amount
  const submitWealthAmount = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Get the contract address for the current chain
      const contractAddress = millionaireDilemmaAddress[chainId];
      if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error(`Contract not deployed on chain ${chainId}. Please switch to a supported network.`);
      }

      const wealthAmount = parseInt(wealth);
      const ciphertext = await encryptValue(wealthAmount, address, contractAddress, chainId);

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: millionaireDilemmaAbi,
        functionName: "submitWealth",
        args: [ciphertext],
      });

      const tx = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      if (tx.status !== "success") {
        throw new Error("Transaction failed");
      }

      setSuccess("Your wealth has been submitted successfully!");
      setWealth("");
    } catch (err) {
      console.error("Error submitting wealth:", err);
      setError("Failed to submit wealth: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setWealth("");
    setError("");
    setSuccess("");
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full h-full">
        <div className="w-full h-full bg-blue-950/70 rounded-lg border-2 border-blue-800 shadow-lg overflow-hidden">
          <div className="p-5 space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-start mb-4 bg-blue-900/50 p-2 rounded-lg">
              <span className="text-yellow-300 text-xl font-pixel mr-2">$</span>
              <h2 className="text-xl font-bold text-white font-pixel">YOUR YACHT VALUE</h2>
            </div>

            <div className="space-y-5 flex-1 flex flex-col">
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter Wealth"
                  value={wealth}
                  onChange={(e) => setWealth(e.target.value)}
                  className="w-full p-3 bg-blue-900/80 text-white rounded-lg border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-blue-300/50 font-pixel text-lg"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded-lg text-center flex items-center justify-center">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900/30 border border-green-500 text-green-400 p-3 rounded-lg text-center">
                  {success}
                </div>
              )}

              <div className="mt-auto">
                <button
                  onClick={submitWealthAmount}
                  className="w-full p-3 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-pixel btn-gradient"
                  disabled={!wealth || Number(wealth) <= 0 || isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <span className="flex items-center justify-center text-center">SUBMIT ENCRYPTED WEALTH</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WealthSubmission;
