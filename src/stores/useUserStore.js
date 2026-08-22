import { create } from 'zustand';
import { Storage, KEYS } from '../services/storage';
import { useTasteStore } from './useTasteStore';

function applyThemeToDOM(theme) {
  if (typeof document !== 'undefined') {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }
}

const initialTheme = Storage.get(KEYS.THEME, 'dark');
applyThemeToDOM(initialTheme);

export const useUserStore = create((set, get) => ({
  theme: initialTheme,
  likedSongs: Storage.get(KEYS.LIKED, []),
  history: Storage.get(KEYS.HISTORY, []),
  profile: Storage.get(KEYS.PROFILE, {
    username: 'Listener',
    avatarUrl: null,
    memberSince: new Date().toISOString()
  }),
  settings: Storage.get(KEYS.SETTINGS, {
    autoplay: true,
    highQuality: true,
    volume: 80
  }),
  stats: Storage.get(KEYS.STATS, { plays: 0, seconds: 0 }),

  setTheme: (theme) => {
    Storage.set(KEYS.THEME, theme);
    applyThemeToDOM(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  isLiked: (trackId) => {
    return get().likedSongs.some((t) => t.id === trackId);
  },

  toggleLike: (track) => {
    if (!track?.id) return;
    const liked = get().likedSongs;
    const exists = liked.some((t) => t.id === track.id);
    let updated;
    if (exists) {
      updated = liked.filter((t) => t.id !== track.id);
      useTasteStore.getState().logTrackEvent(track, 'UNLIKE');
    } else {
      updated = [track, ...liked];
      useTasteStore.getState().logTrackEvent(track, 'LIKE');
    }
    Storage.set(KEYS.LIKED, updated);
    set({ likedSongs: updated });
    return !exists;
  },

  addToHistory: (track) => {
    if (!track?.id) return;
    const history = get().history.filter((t) => t.id !== track.id);
    const updated = [
      {
        ...track,
        playedAt: new Date().toISOString()
      },
      ...history
    ].slice(0, 100);
    Storage.set(KEYS.HISTORY, updated);

    // Update play stats
    const stats = get().stats;
    const updatedStats = { ...stats, plays: (stats.plays || 0) + 1 };
    Storage.set(KEYS.STATS, updatedStats);

    set({ history: updated, stats: updatedStats });
  },

  addPlayedSeconds: (seconds) => {
    const stats = get().stats;
    const updatedStats = { ...stats, seconds: (stats.seconds || 0) + seconds };
    Storage.set(KEYS.STATS, updatedStats);
    set({ stats: updatedStats });
  },

  updateProfile: (profileData) => {
    const updated = { ...get().profile, ...profileData };
    Storage.set(KEYS.PROFILE, updated);
    set({ profile: updated });
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    Storage.set(KEYS.SETTINGS, updated);
    set({ settings: updated });
  },

  clearAllData: () => {
    Object.values(KEYS).forEach((k) => Storage.remove(k));
    set({
      likedSongs: [],
      history: [],
      stats: { plays: 0, seconds: 0 }
    });
  }
}));
