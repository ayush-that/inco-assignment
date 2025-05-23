"use client";

import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useDisconnect } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import MillionaireDilemma from "@/components/millionaire-dilemma";
import Image from "next/image";
import { toggleBackgroundMusic, isAudioOn } from "@/utils/sound";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const intervalId = setInterval(() => {
      setAudioPlaying(isAudioOn());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [mounted]);

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

  const handleToggleMusic = useCallback(() => {
    console.log("Toggle music button clicked");
    toggleBackgroundMusic();
  }, []);

  const getMusicIcon = () => {
    return audioPlaying ? "/speaker.png" : "/mute.png";
  };

  if (!mounted)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white animate-pulse flex flex-col items-center">
          <div className="mb-4 text-2xl font-pixel">LOADING...</div>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col flex-grow">
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col flex-grow">
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-pixel tracking-wider flex flex-col">
              <span className="text-yellow-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">MILLIONAIRE'S</span>
              <span className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">DILEMMA</span>
              <span className="text-sm text-white">YACHT EDITION</span>
            </h1>
          </div>

          <div>
            {isConnected ? (
              <div className="flex items-center gap-4">
                <span className="text-xl text-white bg-primary/50 px-3 py-3 rounded-lg border border-accent/50">
                  {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDisconnect}
                    className="bg-transparent border-0 p-0 cursor-pointer transform hover:scale-105 mb-6 transition-all"
                  >
                    <Image src="/logout.png" alt="Disconnect Wallet" width={210} height={60} className="pixel-button" />
                  </button>
                  <button className="bg-transparent border-0 p-0 cursor-pointer transform hover:scale-105 mt-2 transition-all">
                    <Image src="/faq.png" alt="FAQ" width={48} height={48} className="pixel-button" />
                  </button>
                  <button
                    onClick={handleToggleMusic}
                    className="bg-transparent border-0 p-0 cursor-pointer transform hover:scale-105 mt-2 transition-all ml-2"
                  >
                    <Image
                      src={getMusicIcon()}
                      alt={audioPlaying ? "Mute Music" : "Play Music"}
                      width={48}
                      height={48}
                      className="pixel-button"
                    />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleToggleMusic}
                className="bg-transparent border-0 p-0 cursor-pointer transform hover:scale-105 transition-all"
              >
                <Image
                  src={getMusicIcon()}
                  alt={audioPlaying ? "Mute Music" : "Play Music"}
                  width={48}
                  height={48}
                  className="pixel-button"
                />
              </button>
            )}
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center py-4">
          {isConnected ? (
            <div className="pixel-container rounded-lg overflow-hidden w-full">
              <MillionaireDilemma />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
              <div className="w-full md:w-3/5 comic-container rounded-lg overflow-hidden">
                <Image
                  src="/comic.png"
                  alt="Millionaire's Dilemma Comic"
                  width={700}
                  height={500}
                  className="w-full h-auto object-contain max-h-[70vh]"
                  priority
                />
              </div>

              <div className="w-full md:w-2/5">
                <div className="p-8 rounded-lg h-full flex flex-col justify-center">
                  <h2 className="text-xl md:text-2xl font-pixel text-highlight mb-6 text-center">
                    WHO'S THE RICHEST MILLIONAIRE?
                  </h2>
                  <p className="text-accent mb-8 font-pixel-secondary text-lg leading-relaxed">
                    Alice, Bob, and Eve want to figure out who's the richest without revealing their wealth. Connect
                    your wallet to participate in this encrypted comparison challenge!
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={handleConnect}
                      className="pixel-btn bg-secondary hover:bg-accent text-white px-8 py-4 font-pixel text-md animate-pulse-slow"
                    >
                      CONNECT WALLET TO START
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
