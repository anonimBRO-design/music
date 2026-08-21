export const KEYS = {
  LIKED: 'nonim_liked_v2',
  HISTORY: 'nonim_history_v2',
  PLAYLISTS: 'nonim_playlists_v2',
  SETTINGS: 'nonim_settings_v2',
  VOLUME: 'nonim_volume_v2',
  LAST: 'nonim_last_v2',
  STATS: 'nonim_stats_v2',
  PROFILE: 'nonim_profile_v2',
  QUEUE: 'nonim_queue_v2'
};

export const Storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage remove error:', e);
    }
  }
};
