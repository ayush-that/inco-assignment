"use client";

import React, { useEffect, useState } from "react";
import { initSound, playClickSound, playBackgroundMusic, isAudioOn } from "@/utils/sound";

export default function SoundProvider({ children }) {
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  useEffect(() => {
    if (!audioInitialized) {
      console.log("Initializing sound in SoundProvider");
      initSound();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  useEffect(() => {
    if (!audioInitialized) return;

    const handleFirstInteraction = () => {
      if (isFirstInteraction && !isAudioOn()) {
        console.log("First user interaction detected, trying to play music");
        playBackgroundMusic();
        setIsFirstInteraction(false);
      }
    };

    if (isFirstInteraction) {
      document.addEventListener("click", handleFirstInteraction, { once: true });
      document.addEventListener("touchstart", handleFirstInteraction, { once: true });
      document.addEventListener("keydown", handleFirstInteraction, { once: true });

      const musicTimeout = setTimeout(() => {
        if (!isAudioOn()) {
          console.log("Attempting initial music playback");
          playBackgroundMusic();
        }
      }, 2000);

      return () => {
        document.removeEventListener("click", handleFirstInteraction);
        document.removeEventListener("touchstart", handleFirstInteraction);
        document.removeEventListener("keydown", handleFirstInteraction);
        clearTimeout(musicTimeout);
      };
    }
  }, [isFirstInteraction, audioInitialized]);

  useEffect(() => {
    if (!audioInitialized) return;

    const handleButtonClick = (event) => {
      if (
        event.target.tagName === "BUTTON" ||
        event.target.closest("button") ||
        event.target.role === "button" ||
        event.target.classList.contains("pixel-button") ||
        event.target.closest(".pixel-button")
      ) {
        playClickSound();
      }
    };

    document.addEventListener("click", handleButtonClick);

    return () => {
      document.removeEventListener("click", handleButtonClick);
    };
  }, [audioInitialized]);

  return <>{children}</>;
}
