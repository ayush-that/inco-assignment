"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDisconnect } from "wagmi";
import { useEffect, useState } from "react";
import { Wallet, LogOut, User, Ship } from "lucide-react";
import MillionaireDilemma from "@/components/millionaire-dilemma";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = () => {
    try {
      disconnect();
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const handleConnect = () => {
    try {
      console.log("Connecting wallet...");
      open();
    } catch (error) {
      console.error("Connect error:", error);
    }
  };

  if (!mounted)
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ship className="text-blue-400" />
            Millionaire's Dilemma
          </h1>
          <div>
            {isConnected ? (
              <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2">
                  <User className="text-blue-400 w-5 h-5" />
                  <span className="text-sm text-white truncate max-w-[150px]">
                    {address?.substring(0, 6)}...
                    {address?.substring(address.length - 4)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {isConnected ? (
          <MillionaireDilemma />
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-10 text-center shadow-2xl">
            <Ship className="mx-auto mb-4 w-12 h-12 text-blue-400" />
            <p className="text-white text-lg mb-4">Connect your wallet to access the Millionaire's Dilemma</p>
            <button
              onClick={handleConnect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
