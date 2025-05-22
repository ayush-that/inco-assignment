import React, { useState } from "react";
import { useAccount, usePublicClient, useWalletClient, useWriteContract } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import { encryptValue } from "@/utils/inco";
import { Coins, Lock, AlertCircle } from "lucide-react";

const WealthSubmission = () => {
  const [wealth, setWealth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { data: walletClientData } = useWalletClient();

  const submitWealthAmount = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const wealthAmount = parseInt(wealth);
      const ciphertext = await encryptValue(wealthAmount, address, millionaireDilemmaAddress[31337]);

      const txHash = await writeContractAsync({
        address: millionaireDilemmaAddress[31337],
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

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        <div className="w-full bg-gray-700/40 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Coins className="mr-3 text-blue-400" />
                Submit Your Wealth
              </h2>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Your wealth will be encrypted</span>
                <Lock className="ml-2 text-blue-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                placeholder="Enter Your Wealth Amount"
                value={wealth}
                onChange={(e) => setWealth(e.target.value)}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={isLoading}
              />

              {error && (
                <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg text-center flex items-center justify-center">
                  <AlertCircle className="mr-2 w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-900/20 border border-green-500 text-green-400 p-3 rounded-lg text-center">
                  {success}
                </div>
              )}

              <button
                onClick={submitWealthAmount}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!wealth || Number(wealth) <= 0 || isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Submit Wealth"
                )}
              </button>
            </div>
          </div>
        </div>
        <p className="font-mono text-xs text-gray-400 mt-2">Your wealth amount will be encrypted and private.</p>
      </div>
    </div>
  );
};

export default WealthSubmission;
