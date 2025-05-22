"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { useState, useEffect } from "react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { baseSepolia } from "wagmi/chains";
import { Loader2, AlertTriangle } from "lucide-react";

// Define our local Anvil chain
const anvil = {
  id: 31337,
  name: "Anvil",
  nativeCurrency: { name: "Anvil Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
    public: { http: ["http://localhost:8545"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "http://localhost:8545" }, // No real explorer for local
  },
  testnet: true,
};

const projectId = "be36d80bd82aef7bdb958bb467c3e570";

const initializeWeb3Modal = () => {
  try {
    const metadata = {
      name: "Millionaire\'s Dilemma", // Updated name
      description: "Who is the richest? A confidential comparison.", // Updated description
      url: "http://localhost:3000", // Assuming local dev server
      icons: ["https://avatars.githubusercontent.com/u/37784886"], // Placeholder icon
    };

    // Use our Anvil chain
    const chains = [anvil];

    const wagmiConfig = defaultWagmiConfig({
      chains,
      projectId,
      metadata,
    });

    createWeb3Modal({
      wagmiConfig,
      projectId,
      chains,
      enableAnalytics: true, // Can be false for local dev
      themeMode: "dark",
      // No specific chain image for Anvil needed, or use a generic one
      // chainImages: {
      //   [anvil.id]: \'some_generic_local_icon_url\',
      // },
    });

    console.log("Web3Modal initialized successfully for Anvil");
    return wagmiConfig;
  } catch (error) {
    console.error("Failed to initialize Web3Modal:", error);
    throw error;
  }
};

export function Web3Provider({ children, initialState }) {
  const [queryClient] = useState(() => new QueryClient());
  const [wagmiConfig, setWagmiConfig] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialized) {
      try {
        const config = initializeWeb3Modal();
        setWagmiConfig(config);
        setInitialized(true);
      } catch (err) {
        console.error("Web3Provider initialization error:", err);
        setError(err);
      }
    }
  }, [initialized]);

  const renderLoadingState = () => (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 animate-spin text-blue-400" size={48} />
        <p className="text-xl mb-2">{error ? "Wallet Connection Error" : "Initializing Wallet Connection..."}</p>
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg mt-4 flex items-center justify-center">
            <AlertTriangle className="mr-2" />
            {error.message}
          </div>
        )}
      </div>
    </div>
  );

  if (error) {
    return renderLoadingState();
  }

  if (!initialized || !wagmiConfig) {
    return renderLoadingState();
  }

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
