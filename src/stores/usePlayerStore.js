import { create } from 'zustand';
import { Storage, KEYS } from '../services/storage';
import { useQueueStore } from './useQueueStore';
import { useUserStore } from './useUserStore';
import { usePlaylistStore } from './usePlaylistStore';
import { useToastStore } from './useToastStore';

export const usePlayerStore = create((set, get) => ({
  currentTrack: Storage.get(KEYS.LAST, null),
  isPlaying: false,
  currentTime: 0,
  duration: 180,
  volume: Storage.get(KEYS.VOLUME, 80),
  isMuted: false,
  repeatMode: 0, // 0 = off, 1 = repeat all, 2 = repeat one
  isShuffle: false,
  isFullscreenOpen: false,
  activeCollection: [],
  collectionIndex: -1,

  // Audio Engine Bridge Callback
  _audioCommand: null, // { type: 'LOAD'|'PLAY'|'PAUSE'|'SEEK'|'VOLUME', payload: any, trackId?: string, timestamp: number }
  setAudioCommand: (cmd) => set({ _audioCommand: cmd }),

  setFullscreenOpen: (open) => set({ isFullscreenOpen: open }),

  playTrack: (track, collection = null, context = null, preventQueueReset = false) => {
    if (!track?.id) return;
    
    set({
      currentTrack: track,
      isPlaying: true,
      _audioCommand: {
        type: 'LOAD',
        payload: track.id,
        trackId: track.id,
        timestamp: Date.now()
      }
    });

    Storage.set(KEYS.LAST, track);
    useUserStore.getState().addToHistory(track);

    if (!preventQueueReset) {
      if (context?.type) {
        useQueueStore.getState().setContext(context.type, context.id, context.title || 'Collection');
      }
      if (collection?.length) {
        useQueueStore.getState().rebuildFromCollection(collection, track.id, context?.title);
        set({
          activeCollection: collection,
          collectionIndex: collection.findIndex((t) => t.id === track.id)
        });
      }
    }
  },

  togglePlay: () => {
    const current = get().currentTrack;
    if (!current?.id) return;
    const isPlaying = !get().isPlaying;
    set({
      isPlaying,
      _audioCommand: {
        type: isPlaying ? 'PLAY' : 'PAUSE',
        trackId: current.id,
        timestamp: Date.now()
      }
    });
  },

  pause: () => {
    set({
      isPlaying: false,
      _audioCommand: { type: 'PAUSE', timestamp: Date.now() }
    });
  },

  next: async () => {
    // 1. Shift next track from userQueue (Manual Queue) or contextQueue (Collection Queue)
    const nextTrack = useQueueStore.getState().shiftNextTrack();
    if (nextTrack) {
      get().playTrack(nextTrack, null, null, true);
      return;
    }

    // 2. Repeat all mode (repeatMode === 1)
    const { activeCollection, repeatMode } = get();
    if (repeatMode === 1 && activeCollection.length > 0) {
      get().playTrack(activeCollection[0], activeCollection, null, false);
      return;
    }

    // 3. Fallback to Smart Radio
    const current = get().currentTrack;
    if (current) {
      useToastStore.getState().showToast('Starting Smart Radio recommendations 📻', 'info');
      await useQueueStore.getState().triggerSmartRadio(current);
      const radioTrack = useQueueStore.getState().shiftNextTrack();
      if (radioTrack) {
        get().playTrack(radioTrack, null, { type: 'radio', id: 'radio', title: 'Smart Radio' }, true);
      }
    }
  },

  prev: () => {
    const { currentTime, activeCollection, collectionIndex } = get();
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }
    if (activeCollection.length && collectionIndex > 0) {
      const newIdx = collectionIndex - 1;
      set({ collectionIndex: newIdx });
      get().playTrack(activeCollection[newIdx], null, null, true);
    }
  },

  seekTo: (seconds) => {
    set({
      currentTime: seconds,
      _audioCommand: { type: 'SEEK', payload: seconds, timestamp: Date.now() }
    });
  },

  setVolume: (vol) => {
    const volume = Math.max(0, Math.min(100, vol));
    Storage.set(KEYS.VOLUME, volume);
    set({
      volume,
      isMuted: volume === 0,
      _audioCommand: { type: 'VOLUME', payload: volume, timestamp: Date.now() }
    });
  },

  toggleMute: () => {
    const isMuted = !get().isMuted;
    set({
      isMuted,
      _audioCommand: { type: 'VOLUME', payload: isMuted ? 0 : get().volume, timestamp: Date.now() }
    });
  },

  toggleShuffle: () => {
    const isShuffle = !get().isShuffle;
    set({ isShuffle });
    useToastStore.getState().showToast(isShuffle ? 'Smart Shuffle on' : 'Shuffle off', 'info');
  },

  cycleRepeat: () => {
    const repeatMode = (get().repeatMode + 1) % 3;
    const labels = ['Repeat off', 'Repeat queue', 'Repeat one'];
    set({ repeatMode });
    useToastStore.getState().showToast(labels[repeatMode], 'info');
  },

  playCollection: (type, id) => {
    let tracks = [];
    let title = 'Collection';

    if (type === 'playlist') {
      const pl = usePlaylistStore.getState().getPlaylist(id);
      if (pl?.tracks?.length) {
        tracks = pl.tracks;
        title = pl.name;
      }
    } else if (type === 'liked') {
      tracks = useUserStore.getState().likedSongs;
      title = 'Liked Songs';
    } else if (type === 'history') {
      tracks = useUserStore.getState().history;
      title = 'Listening History';
    }

    if (!tracks.length) {
      useToastStore.getState().showToast('No tracks in this collection', 'info');
      return;
    }

    get().playTrack(tracks[0], tracks, { type, id, title });
    useToastStore.getState().showToast(`Playing from ${title}`, 'success');
  },

  shuffleCollection: (type, id) => {
    let tracks = [];
    let title = 'Collection';

    if (type === 'playlist') {
      const pl = usePlaylistStore.getState().getPlaylist(id);
      if (pl?.tracks?.length) {
        tracks = [...pl.tracks];
        title = pl.name;
      }
    } else if (type === 'liked') {
      tracks = [...useUserStore.getState().likedSongs];
      title = 'Liked Songs';
    }

    if (!tracks.length) {
      useToastStore.getState().showToast('No tracks to shuffle', 'info');
      return;
    }

    // Fisher-Yates
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }

    set({ isShuffle: true });
    get().playTrack(tracks[0], tracks, { type, id, title: `${title} (Shuffled)` });
    useToastStore.getState().showToast(`Shuffling ${title} 🔀`, 'success');
  },

  // State sync from AudioEngine
  syncAudioState: ({ isPlaying, currentTime, duration }) => {
    set((state) => ({
      isPlaying: isPlaying !== undefined ? isPlaying : state.isPlaying,
      currentTime: currentTime !== undefined ? currentTime : state.currentTime,
      duration: duration !== undefined ? duration : state.duration
    }));
  }
}));
