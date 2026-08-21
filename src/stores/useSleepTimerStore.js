import { create } from 'zustand';
import { usePlayerStore } from './usePlayerStore';
import { useToastStore } from './useToastStore';

let _tickInterval = null;

export const useSleepTimerStore = create((set, get) => ({
  isActive: false,
  selectedMinutes: 0,
  remainingSeconds: 0,
  mode: null, // 'timer' | 'end_of_track'

  startTimer: (minutes) => {
    get().stopTimer();

    if (minutes === 'end') {
      set({ isActive: true, selectedMinutes: 0, remainingSeconds: 0, mode: 'end_of_track' });
      useToastStore.getState().showToast('Sleep Timer: Music will stop after this track 🌙', 'info');
      return;
    }

    const totalSeconds = minutes * 60;
    set({
      isActive: true,
      selectedMinutes: minutes,
      remainingSeconds: totalSeconds,
      mode: 'timer'
    });

    _tickInterval = setInterval(() => {
      const { remainingSeconds, isActive } = get();
      if (!isActive) {
        clearInterval(_tickInterval);
        _tickInterval = null;
        return;
      }

      if (remainingSeconds <= 1) {
        get().expire();
      } else {
        set({ remainingSeconds: remainingSeconds - 1 });
      }
    }, 1000);

    useToastStore.getState().showToast(`Sleep Timer: ${minutes} minutes 🌙`, 'info');
  },

  stopTimer: () => {
    if (_tickInterval) {
      clearInterval(_tickInterval);
      _tickInterval = null;
    }
    set({ isActive: false, selectedMinutes: 0, remainingSeconds: 0, mode: null });
  },

  cancelTimer: () => {
    get().stopTimer();
    useToastStore.getState().showToast('Sleep Timer cancelled', 'info');
  },

  expire: () => {
    if (_tickInterval) {
      clearInterval(_tickInterval);
      _tickInterval = null;
    }

    set({ isActive: false, selectedMinutes: 0, remainingSeconds: 0, mode: null });

    // Fade out and pause
    usePlayerStore.getState().pause();
    useToastStore.getState().showToast('Sleep Timer — Music paused 🌙💤', 'info');
  },

  // Called by AudioEngine when track ends
  onTrackEnded: () => {
    const { isActive, mode } = get();
    if (isActive && mode === 'end_of_track') {
      get().expire();
    }
  },

  formatRemaining: () => {
    const { remainingSeconds, isActive, mode } = get();
    if (!isActive) return '';
    if (mode === 'end_of_track') return 'End of track';
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}));
