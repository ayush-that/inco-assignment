"use client";
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useAccount, usePublicClient, useWalletClient, useChainId } from "wagmi";
import { getContract } from "viem";

import { ENCRYPTED_ERC20_CONTRACT_ADDRESS, ENCRYPTEDERC20ABI } from "@/utils/contract";

import { getConfig, reEncryptValue } from "@/utils/inco-lite";

const ChainBalanceContext = createContext();

export const ChainBalanceProvider = ({ children }) => {
  const { address } = useAccount();
  const [encryptedBalance, setEncryptedBalance] = useState(null);
  const [isEncryptedLoading, setIsEncryptedLoading] = useState(false);
  const [encryptedError, setEncryptedError] = useState(null);

  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const chainId = useChainId();

  const fetchEncryptedBalance = useCallback(
    async ({ wc: walletClient }) => {
      if (!address || !publicClient || !walletClient) return;

      setIsEncryptedLoading(true);
      setEncryptedError(null);

      try {
        const encryptedERC20Contract = getContract({
          abi: ENCRYPTEDERC20ABI,
          address: ENCRYPTED_ERC20_CONTRACT_ADDRESS,
          client: { public: publicClient, wallet: walletClient },
        });

        console.log("Fetching encrypted balance for address:", address);

        const balanceHandle = await encryptedERC20Contract.read.balanceOf([address]);

        if (balanceHandle.toString() === "0x0000000000000000000000000000000000000000000000000000000000000000") {
          setEncryptedBalance(0);
          return;
        }

        const cfg = getConfig(chainId);

        console.log(cfg);
        let decrypted;

        decrypted = await reEncryptValue({
          chainId: cfg.chainId,
          walletClient: walletClient,
          handle: balanceHandle,
        });

        setEncryptedBalance(decrypted);
      } catch (err) {
        console.error("Error fetching encrypted balance:", err);
        setEncryptedError(err.message || "Failed to fetch encrypted balance");
      } finally {
        setIsEncryptedLoading(false);
      }
    },
    [address, chainId, publicClient, walletClient],
  );

  const contextValue = useMemo(
    () => ({
      encryptedBalance,
      isEncryptedLoading,
      encryptedError,
      fetchEncryptedBalance,
    }),
    [encryptedBalance, isEncryptedLoading, encryptedError, fetchEncryptedBalance],
  );

  return <ChainBalanceContext.Provider value={contextValue}>{children}</ChainBalanceContext.Provider>;
};

export const useChainBalance = () => {
  const context = useContext(ChainBalanceContext);
  if (context === undefined) {
    throw new Error("useChainBalance must be used within a ChainBalanceProvider");
  }
  return context;
};
