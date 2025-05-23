import React, { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract, useReadContract } from "wagmi";
import { millionaireDilemmaAddress, millionaireDilemmaAbi } from "@/generated";
import { encryptValue } from "@/utils/inco";
import { AlertCircle, CheckCircle } from "lucide-react";

const WealthSubmission = () => {
  const [wealth, setWealth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const { data: submittedStatus } = useReadContract({
    address: millionaireDilemmaAddress[31337],
    abi: millionaireDilemmaAbi,
    functionName: "submitted",
    args: [address],
  });

  useEffect(() => {
    if (submittedStatus !== undefined) {
      setHasSubmitted(submittedStatus);
      if (submittedStatus) {
        setSuccess("You have already submitted your wealth!");
      }
    }
  }, [submittedStatus]);

  const validateInput = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return "Please enter a valid number";
    }
    if (num <= 0) {
      return "Wealth must be greater than 0";
    }
    if (num > Number.MAX_SAFE_INTEGER) {
      return "Value too large";
    }
    if (!Number.isInteger(num)) {
      return "Please enter a whole number";
    }
    return null;
  };

  const submitWealthAmount = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const validationError = validateInput(wealth);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (hasSubmitted) {
        setError("You have already submitted your wealth");
        return;
      }

      if (!address) {
        setError("Please connect your wallet first");
        return;
      }

      const wealthAmount = parseInt(wealth);

      let ciphertext;
      try {
        ciphertext = await encryptValue(wealthAmount, address, millionaireDilemmaAddress[31337]);
      } catch (encryptError) {
        console.error("Encryption failed:", encryptError);
        setError("Failed to encrypt wealth value. Please try again.");
        return;
      }

      let txHash;
      try {
        txHash = await writeContractAsync({
          address: millionaireDilemmaAddress[31337],
          abi: millionaireDilemmaAbi,
          functionName: "submitWealth",
          args: [ciphertext],
        });
      } catch (contractError) {
        console.error("Contract call failed:", contractError);
        if (contractError.message.includes("unauthorized participant")) {
          setError("You are not authorized to participate in this comparison");
        } else if (contractError.message.includes("rejected")) {
          setError("Transaction was rejected by user");
        } else {
          setError("Failed to submit to contract: " + contractError.message);
        }
        return;
      }

      let tx;
      try {
        tx = await publicClient.waitForTransactionReceipt({
          hash: txHash,
          timeout: 60000,
        });
      } catch (receiptError) {
        console.error("Transaction receipt error:", receiptError);
        setError("Transaction failed or timed out. Please check your transaction status.");
        return;
      }

      if (tx.status !== "success") {
        setError("Transaction failed. Please try again.");
        return;
      }

      setSuccess("Your wealth has been submitted successfully!");
      setWealth("");
      setHasSubmitted(true);
    } catch (err) {
      console.error("Unexpected error submitting wealth:", err);
      setError("An unexpected error occurred: " + (err.message || "Please try again"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setWealth("");
    setError("");
    if (!hasSubmitted) {
      setSuccess("");
    }
  }, [hasSubmitted]);

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
                  placeholder="Enter Wealth (e.g., 1000000)"
                  value={wealth}
                  onChange={(e) => {
                    setWealth(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 bg-blue-900/80 text-white rounded-lg border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-blue-300/50 font-pixel text-lg"
                  disabled={isLoading || hasSubmitted}
                  min="1"
                  step="1"
                />
                {hasSubmitted && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="text-green-400 w-5 h-5" />
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-400 p-3 rounded-lg text-center flex items-center justify-center">
                  <AlertCircle className="mr-2 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-900/30 border border-green-500 text-green-400 p-3 rounded-lg text-center flex items-center justify-center">
                  <CheckCircle className="mr-2 w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              <div className="mt-auto">
                <button
                  onClick={submitWealthAmount}
                  className="w-full p-3 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-pixel btn-gradient"
                  disabled={!wealth || Number(wealth) <= 0 || isLoading || hasSubmitted || validateInput(wealth)}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : hasSubmitted ? (
                    <span className="flex items-center justify-center text-center">
                      <CheckCircle className="mr-2 w-4 h-4" />
                      WEALTH SUBMITTED
                    </span>
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
