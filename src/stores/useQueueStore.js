import { create } from 'zustand';
import { Storage, KEYS } from '../services/storage';
import { YouTubeAPI } from '../services/youtubeApi';

export const useQueueStore = create((set, get) => ({
  userQueue: Storage.get(KEYS.QUEUE, []),
  contextQueue: [],
  context: { type: null, id: null, title: 'Collection' },
  isQueueOpen: false,

  toggleQueue: () => {
    set({ isQueueOpen: !get().isQueueOpen });
  },

  setQueueOpen: (open) => {
    set({ isQueueOpen: open });
  },

  setContext: (type, id, title = 'Collection') => {
    set({ context: { type, id, title } });
  },

  rebuildFromCollection: (collection, currentTrackId, title = null) => {
    const currentIndex = collection.findIndex((t) => t.id === currentTrackId);
    let nextUpcoming = [];
    if (currentIndex === -1) {
      nextUpcoming = collection.slice(0, 30);
    } else {
      nextUpcoming = collection.slice(currentIndex + 1, currentIndex + 31);
    }
    set((state) => ({
      contextQueue: nextUpcoming,
      context: title ? { ...state.context, title } : state.context
    }));
  },

  addToQueue: (track) => {
    if (!track?.id) return;
    const updated = [...get().userQueue, { ...track, addedAt: Date.now() }];
    Storage.set(KEYS.QUEUE, updated);
    set({ userQueue: updated });
  },

  playNext: (track) => {
    if (!track?.id) return;
    const updated = [{ ...track, addedAt: Date.now() }, ...get().userQueue];
    Storage.set(KEYS.QUEUE, updated);
    set({ userQueue: updated });
  },

  removeFromUserQueue: (index) => {
    const updated = [...get().userQueue];
    updated.splice(index, 1);
    Storage.set(KEYS.QUEUE, updated);
    set({ userQueue: updated });
  },

  reorderUserQueue: (fromIndex, toIndex) => {
    const updated = [...get().userQueue];
    const [item] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, item);
    Storage.set(KEYS.QUEUE, updated);
    set({ userQueue: updated });
  },

  clearUserQueue: () => {
    Storage.set(KEYS.QUEUE, []);
    set({ userQueue: [] });
  },

  shiftNextTrack: () => {
    const { userQueue, contextQueue } = get();
    if (userQueue.length > 0) {
      const [nextTrack, ...rest] = userQueue;
      Storage.set(KEYS.QUEUE, rest);
      set({ userQueue: rest });
      return nextTrack;
    }
    if (contextQueue.length > 0) {
      const [nextTrack, ...rest] = contextQueue;
      set({ contextQueue: rest });
      return nextTrack;
    }
    return null;
  },

  triggerSmartRadio: async (seedTrack) => {
    if (!seedTrack) return;
    const res = await YouTubeAPI.search(`${seedTrack.artist || ''} ${seedTrack.title || ''} music`, 10);
    if (res.items?.length) {
      const currentList = get().contextQueue;
      const newItems = res.items.filter(
        (t) => t.id !== seedTrack.id && !currentList.some((q) => q.id === t.id)
      );
      set({ contextQueue: [...currentList, ...newItems] });
    }
  }
}));
