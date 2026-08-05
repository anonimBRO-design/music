// LocalStorage wrapper with JSON handling, defaults, and events

import { eventBus } from './events.js';
import { STORAGE_KEYS } from './constants.js';

class Store {
  constructor() {
    this.cache = new Map();
    this.listeners = new Map();
    this.init();
  }

  init() {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('nonimid_')) {
        this.cache.delete(e.key);
        this.notifyListeners(e.key, e.newValue ? JSON.parse(e.newValue) : null);
      }
    });
  }

  /**
   * Get value from localStorage with caching
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   * @returns {*}
   */
  get(key, defaultValue = null) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const value = localStorage.getItem(key);
      const parsed = value ? JSON.parse(value) : defaultValue;
      this.cache.set(key, parsed);
      return parsed;
    } catch (error) {
      console.warn(`Store.get("${key}") failed:`, error);
      return defaultValue;
    }
  }

  /**
   * Set value in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      this.cache.set(key, value);
      this.notifyListeners(key, value);
      return true;
    } catch (error) {
      console.error(`Store.set("${key}") failed:`, error);
      return false;
    }
  }

  /**
   * Remove key from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      this.cache.delete(key);
      this.notifyListeners(key, null);
    } catch (error) {
      console.error(`Store.remove("${key}") failed:`, error);
    }
  }

  /**
   * Clear all nonimid_ keys
   */
  clearAll() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nonimid_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => this.remove(key));
  }

  /**
   * Subscribe to changes on a key
   * @param {string} key - Storage key
   * @param {Function} callback - Callback(value)
   * @returns {Function} Unsubscribe function
   */
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    return () => {
      if (this.listeners.has(key)) {
        this.listeners.get(key).delete(callback);
      }
    };
  }

  /**
   * Notify listeners of a change
   * @param {string} key - Storage key
   * @param {*} value - New value
   */
  notifyListeners(key, value) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Store listener error for "${key}":`, error);
        }
      });
    }
    // Also publish to event bus for cross-module communication
    eventBus.publish(`store:${key}`, value);
  }

  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of keys
   * @returns {Object} Key-value pairs
   */
  getMultiple(keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.get(key);
    });
    return result;
  }

  /**
   * Set multiple keys at once
   * @param {Object} data - Key-value pairs
   */
  setMultiple(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
}

// Singleton instance
export const store = new Store();

// Convenience methods for common keys
export const StoreHelpers = {
  // Queue
  getQueue: () => store.get(STORAGE_KEYS.QUEUE, []),
  setQueue: (queue) => store.set(STORAGE_KEYS.QUEUE, queue),

  // Volume
  getVolume: () => store.get(STORAGE_KEYS.VOLUME, 80),
  setVolume: (volume) => store.set(STORAGE_KEYS.VOLUME, volume),

  // Playback state
  getLastTrack: () => store.get(STORAGE_KEYS.LAST),
  setLastTrack: (track) => store.set(STORAGE_KEYS.LAST, track),

  getPlaybackState: () => ({
    currentTime: store.get('nonimid_current_time', 0),
    isPlaying: store.get('nonimid_is_playing', false),
    shuffle: store.get('nonimid_shuffle', false),
    repeat: store.get('nonimid_repeat', 0),
    speed: store.get(STORAGE_KEYS.PLAYBACK_SPEED, 1)
  }),
  setPlaybackState: (state) => store.setMultiple({
    'nonimid_current_time': state.currentTime,
    'nonimid_is_playing': state.isPlaying,
    'nonimid_shuffle': state.shuffle,
    'nonimid_repeat': state.repeat,
    [STORAGE_KEYS.PLAYBACK_SPEED]: state.speed
  }),

  // Crossfade
  getCrossfade: () => store.get(STORAGE_KEYS.CROSSFADE, 0),
  setCrossfade: (seconds) => store.set(STORAGE_KEYS.CROSSFADE, Math.max(0, Math.min(12, seconds))),

  // Settings
  getSettings: () => store.get(STORAGE_KEYS.SETTINGS, {
    autoplay: true,
    hqthumb: true,
    notifications: true
  }),
  setSettings: (settings) => store.set(STORAGE_KEYS.SETTINGS, settings),

  // Profile
  getProfile: () => store.get(STORAGE_KEYS.PROFILE, {
    username: 'Listener',
    avatarUrl: null,
    bannerUrl: null,
    bio: '',
    memberSince: new Date().toISOString()
  }),
  setProfile: (profile) => store.set(STORAGE_KEYS.PROFILE, profile),

  // Stats
  getStats: () => store.get(STORAGE_KEYS.STATS, { plays: 0, seconds: 0 }),
  incrementPlays: () => {
    const stats = StoreHelpers.getStats();
    stats.plays = (stats.plays || 0) + 1;
    store.set(STORAGE_KEYS.STATS, stats);
  },
  addListeningTime: (seconds) => {
    const stats = StoreHelpers.getStats();
    stats.seconds = (stats.seconds || 0) + seconds;
    store.set(STORAGE_KEYS.STATS, stats);
  }
};