import { create } from 'zustand';
import { Storage, KEYS } from '../services/storage';

export const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #1db954, #191414)',
  'linear-gradient(135deg, #450af5, #8e8ee5)',
  'linear-gradient(135deg, #e8115b, #b02897)',
  'linear-gradient(135deg, #e91429, #8b1538)',
  'linear-gradient(135deg, #006450, #1db954)',
  'linear-gradient(135deg, #ff2d78, #6366f1)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #f59e0b, #ef4444)'
];

export const usePlaylistStore = create((set, get) => ({
  playlists: Storage.get(KEYS.PLAYLISTS, []),
  
  // Modals state
  isEditModalOpen: false,
  editingPlaylistId: null,
  isPickerModalOpen: false,
  pickerTrack: null,

  openCreateModal: () => {
    set({ isEditModalOpen: true, editingPlaylistId: null });
  },

  openEditModal: (playlistId) => {
    set({ isEditModalOpen: true, editingPlaylistId: playlistId });
  },

  closeEditModal: () => {
    set({ isEditModalOpen: false, editingPlaylistId: null });
  },

  openPickerModal: (track) => {
    set({ isPickerModalOpen: true, pickerTrack: track });
  },

  closePickerModal: () => {
    set({ isPickerModalOpen: false, pickerTrack: null });
  },

  getPlaylist: (id) => {
    return get().playlists.find((p) => p.id === id);
  },

  createPlaylist: (name, description = '', color = GRADIENT_PRESETS[0], image = null) => {
    const newPlaylist = {
      id: `pl_${Date.now()}`,
      name: name || `My Playlist #${get().playlists.length + 1}`,
      description: description || '',
      color: color || GRADIENT_PRESETS[0],
      image: image || null,
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...get().playlists, newPlaylist];
    Storage.set(KEYS.PLAYLISTS, updated);
    set({ playlists: updated });
    return newPlaylist;
  },

  updatePlaylistDetails: (id, name, description, color, image) => {
    const playlists = get().playlists.map((pl) => {
      if (pl.id === id) {
        return {
          ...pl,
          name: name.trim() || pl.name,
          description: description?.trim() ?? pl.description,
          color: color || pl.color,
          image: image !== undefined ? image : pl.image,
          updatedAt: new Date().toISOString()
        };
      }
      return pl;
    });
    Storage.set(KEYS.PLAYLISTS, playlists);
    set({ playlists });
  },

  deletePlaylist: (id) => {
    const updated = get().playlists.filter((p) => p.id !== id);
    Storage.set(KEYS.PLAYLISTS, updated);
    set({ playlists: updated });
  },

  addTrackToPlaylist: (playlistId, track) => {
    if (!track?.id) return false;
    let added = false;
    const playlists = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        if (pl.tracks.some((t) => t.id === track.id)) {
          return pl;
        }
        added = true;
        return {
          ...pl,
          tracks: [...pl.tracks, { ...track, addedAt: new Date().toISOString() }],
          updatedAt: new Date().toISOString()
        };
      }
      return pl;
    });
    if (added) {
      Storage.set(KEYS.PLAYLISTS, playlists);
      set({ playlists });
    }
    return added;
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    const playlists = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        return {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
          updatedAt: new Date().toISOString()
        };
      }
      return pl;
    });
    Storage.set(KEYS.PLAYLISTS, playlists);
    set({ playlists });
  },

  reorderPlaylistTracks: (playlistId, fromIndex, toIndex) => {
    const playlists = get().playlists.map((pl) => {
      if (pl.id === playlistId) {
        const tracks = [...pl.tracks];
        const [moved] = tracks.splice(fromIndex, 1);
        tracks.splice(toIndex, 0, moved);
        return {
          ...pl,
          tracks,
          updatedAt: new Date().toISOString()
        };
      }
      return pl;
    });
    Storage.set(KEYS.PLAYLISTS, playlists);
    set({ playlists });
  }
}));
