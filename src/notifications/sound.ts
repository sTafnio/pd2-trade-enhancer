import { Settings } from "../trade/settings";

const SOUND_FILE = "https://web.poecdn.com/audio/trade/pulse.mp3"; // Path of Exile trade "Pulse"

let audioInstance: HTMLAudioElement | null = null;

const getAudio = () => {
  audioInstance ??= new Audio(SOUND_FILE);
  return audioInstance;
};

// Call from the Start click: starts loading the file so the first alert plays without a delay
export const unlockSound = () => {
  try {
    getAudio();
  } catch (error) {
    console.error("Error loading new item sound:", error);
  }
};

export const playNewItemSound = () => {
  try {
    const audio = getAudio();
    audio.volume = Settings.getSettings().volume / 100; // settings clamp volume to 0-100
    audio.currentTime = 0; // restart instead of overlapping (the volume slider previews it too)
    audio.play().catch((error: unknown) => console.error("Error playing new item sound:", error));
  } catch (error) {
    console.error("Error playing new item sound:", error); // a sound failure must never end livesearch
  }
};
