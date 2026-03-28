import { create } from 'zustand';
import { BreakSettings } from '../../data/models/BreakSettings';

interface BreakTimerState {
  isTimerRunning: boolean;
  timeRemaining: number; // in seconds
  breakSettings: BreakSettings | null;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  updateBreakSettings: (settings: BreakSettings) => void;
  setBreakSettings: (settings: BreakSettings) => void;
  setTimeRemaining: (time: number) => void;
  setIsTimerRunning: (isRunning: boolean) => void;
}

export const useBreakTimerStore = create<BreakTimerState>((set) => ({
  isTimerRunning: false,
  timeRemaining: 0,
  breakSettings: null,

  startTimer: () => set({ isTimerRunning: true }),
  pauseTimer: () => set({ isTimerRunning: false }),
  stopTimer: () => set({ isTimerRunning: false, timeRemaining: 0 }),
  updateBreakSettings: (settings: BreakSettings) => set({ breakSettings: settings }),
  setBreakSettings: (settings: BreakSettings) => set({ breakSettings: settings }),
  setTimeRemaining: (time: number) => set({ timeRemaining: time }),
  setIsTimerRunning: (isRunning: boolean) => set({ isTimerRunning: isRunning }),
}));
