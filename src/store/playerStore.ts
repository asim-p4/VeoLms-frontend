/**
 * @fileoverview Video Player Store
 * Manages the state for the custom video player component.
 * 
 * DESIGN DECISION: Centralizing player state allows other components (like the sidebar)
 * to interact with the player (e.g., auto-play next lesson) without prop drilling.
 * 
 * TODO: Integrate with actual HLS player events when moving to production.
 */
import { create } from 'zustand';

interface PlayerState {
  /** Is the video currently playing? */
  isPlaying: boolean;
  /** Current playback volume (0 to 1) */
  volume: number;
  /** Is the video muted? */
  isMuted: boolean;
  /** Playback speed multiplier (e.g., 0.5, 1, 1.5, 2) */
  playbackRate: number;
  /** Is the player in fullscreen mode? */
  isFullscreen: boolean;
  /** Is theater mode toggled? (Wider view, not full screen) */
  isTheaterMode: boolean;
  /** Current progress percentage (0 to 100) */
  progress: number;
  /** Current time in seconds */
  currentTime: number;
  
  // Actions
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setFullscreen: (fullscreen: boolean) => void;
  toggleTheaterMode: () => void;
  setProgress: (progress: number, currentTime: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  isFullscreen: false,
  isTheaterMode: false,
  progress: 0,
  currentTime: 0,

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  setVolume: (volume) => set(() => {
    // If setting volume > 0, ensure we are unmuted
    return { volume, isMuted: volume === 0 ? true : false };
  }),
  
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  toggleTheaterMode: () => set((state) => ({ isTheaterMode: !state.isTheaterMode })),
  setProgress: (progress, currentTime) => set({ progress, currentTime }),
}));
