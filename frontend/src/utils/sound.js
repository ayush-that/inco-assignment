let clickSound = null;
let backgroundMusic = null;
let isSoundEnabled = true;
let isMusicEnabled = true;
let musicInitialized = false;
let isAudioPlaying = false;

export const initSound = () => {
  if (typeof window !== "undefined" && !musicInitialized) {
    try {
      console.log("Initializing sound effects...");
      clickSound = new Audio("/click.mp3");
      clickSound.preload = "auto";
      clickSound.volume = 0.3;

      backgroundMusic = new Audio("/music.mp3");
      backgroundMusic.preload = "auto";
      backgroundMusic.volume = 0.2;
      backgroundMusic.loop = true;

      backgroundMusic.addEventListener("play", () => {
        console.log("Background music started playing");
        isAudioPlaying = true;
      });

      backgroundMusic.addEventListener("pause", () => {
        console.log("Background music paused");
        isAudioPlaying = false;
      });

      backgroundMusic.addEventListener("error", (e) => {
        console.error("Background music error:", e);
        isAudioPlaying = false;
      });

      musicInitialized = true;
      console.log("Sound initialization complete");
    } catch (error) {
      console.error("Error initializing sound:", error);
    }
  }
};

export const playClickSound = () => {
  if (typeof window === "undefined" || !isSoundEnabled || !clickSound) return;

  const soundClone = clickSound.cloneNode();
  soundClone.volume = clickSound.volume;
  soundClone.play().catch((err) => {
    console.debug("Sound play error (likely requires user interaction):", err);
  });
};

export const playBackgroundMusic = () => {
  if (typeof window === "undefined" || !backgroundMusic || isAudioPlaying) return;

  console.log("Attempting to play background music, music enabled:", isMusicEnabled);

  if (isMusicEnabled && backgroundMusic.paused) {
    console.log("Playing background music...");

    backgroundMusic
      .play()
      .then(() => {
        isAudioPlaying = true;
      })
      .catch((err) => {
        console.error("Music play error:", err);
        isAudioPlaying = false;
      });
  }
};

export const pauseBackgroundMusic = () => {
  if (typeof window === "undefined" || !backgroundMusic || !isAudioPlaying) return;

  console.log("Pausing background music...");

  if (!backgroundMusic.paused) {
    backgroundMusic.pause();
    isAudioPlaying = false;
  }
};

export const toggleBackgroundMusic = () => {
  console.log("Toggling background music. Current state:", isMusicEnabled, "Is playing:", isAudioPlaying);

  if (!musicInitialized || !backgroundMusic) {
    console.log("Background music not initialized yet");
    isMusicEnabled = !isMusicEnabled;
    return isMusicEnabled;
  }

  isMusicEnabled = !isMusicEnabled;

  if (isMusicEnabled) {
    if (!isAudioPlaying) {
      playBackgroundMusic();
    }
  } else {
    pauseBackgroundMusic();
  }

  console.log("New music state:", isMusicEnabled, "Is playing:", isAudioPlaying);
  return isMusicEnabled;
};

export const toggleSound = () => {
  isSoundEnabled = !isSoundEnabled;
  return isSoundEnabled;
};

export const isSoundOn = () => isSoundEnabled;
export const isMusicOn = () => isMusicEnabled;
export const isAudioOn = () => isAudioPlaying;
