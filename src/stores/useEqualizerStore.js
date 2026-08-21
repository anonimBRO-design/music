import { create } from 'zustand';
import { Storage } from '../services/storage';

const EQ_STORAGE_KEY = 'nonim_equalizer_v2';

const BAND_FREQUENCIES = [60, 230, 910, 4000, 14000];
const BAND_LABELS = ['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'];

const PRESETS = {
  flat:       { label: 'Flat',         gains: [0, 0, 0, 0, 0] },
  bass:       { label: 'Bass Boost',   gains: [6, 4, 0, -1, -2] },
  treble:     { label: 'Treble Boost', gains: [-2, -1, 0, 4, 6] },
  vocal:      { label: 'Vocal',        gains: [-2, 1, 4, 3, -1] },
  electronic: { label: 'Electronic',   gains: [4, 2, -1, 3, 5] },
  rock:       { label: 'Rock',         gains: [3, 1, -1, 2, 4] },
  acoustic:   { label: 'Acoustic',     gains: [2, 3, 1, 1, -2] },
  deepnight:  { label: 'Deep Night',   gains: [5, 3, -2, -1, -3] }
};

function loadSaved() {
  try {
    const raw = localStorage.getItem(EQ_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        isEnabled: data.isEnabled ?? false,
        activePreset: data.activePreset || 'flat',
        gains: Array.isArray(data.gains) && data.gains.length === 5
          ? data.gains
          : [0, 0, 0, 0, 0]
      };
    }
  } catch (e) {}
  return { isEnabled: false, activePreset: 'flat', gains: [0, 0, 0, 0, 0] };
}

function persist(state) {
  try {
    localStorage.setItem(EQ_STORAGE_KEY, JSON.stringify({
      isEnabled: state.isEnabled,
      activePreset: state.activePreset,
      gains: state.gains
    }));
  } catch (e) {}
}

const saved = loadSaved();

export const useEqualizerStore = create((set, get) => ({
  isEnabled: saved.isEnabled,
  activePreset: saved.activePreset,
  gains: saved.gains,
  isOpen: false,

  frequencies: BAND_FREQUENCIES,
  labels: BAND_LABELS,
  presets: PRESETS,

  setOpen: (open) => set({ isOpen: open }),

  toggleEnabled: () => {
    const isEnabled = !get().isEnabled;
    set({ isEnabled });
    persist(get());
  },

  applyPreset: (presetKey) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    set({
      activePreset: presetKey,
      gains: [...preset.gains]
    });
    persist(get());
  },

  setBandGain: (bandIndex, value) => {
    const gains = [...get().gains];
    gains[bandIndex] = Math.max(-12, Math.min(12, value));
    set({ gains, activePreset: 'custom' });
    persist(get());
  },

  resetToFlat: () => {
    set({
      activePreset: 'flat',
      gains: [0, 0, 0, 0, 0]
    });
    persist(get());
  }
}));
