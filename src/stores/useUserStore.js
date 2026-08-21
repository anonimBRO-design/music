import { create } from 'zustand';
import { Storage, KEYS } from '../services/storage';

export const useUserStore = create((set, get) => ({
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
    } else {
      updated = [track, ...liked];
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
